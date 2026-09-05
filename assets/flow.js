/* =========================================================
   Order-flow network — the hero background.
   A stylised version of what Param actually builds: orders
   arriving from a storefront, brokered by an OMS, routed to
   fulfilment locations, with the occasional reject looping
   back to be re-brokered.
   Degrades to a static gradient on small screens, on
   prefers-reduced-motion, and anywhere WebGL is missing.
   ========================================================= */
(function () {
  const mount = document.getElementById('flow-canvas');
  if (!mount) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 760px)').matches;
  function staticMode(reason) {
    mount.classList.add('flow-static');
    const note = document.querySelector('.flow-note');
    if (note) note.textContent = '\u2014 a network of orders being routed, held still here to save your battery.';
    const keys = document.querySelectorAll('.flow-key');
    keys.forEach(k => { k.style.display = 'none'; });
    return reason;
  }
  if (reduced || small || typeof THREE === 'undefined') { staticMode(); return; }

  const CYAN = new THREE.Color('#3fd8e0');
  const BLUE = new THREE.Color('#4f7cff');
  const AMBER = new THREE.Color('#f2b544');

  /* ---- topology: storefront -> OMS -> brokering -> fulfilment ---- */
  const NODES = [
    { p: new THREE.Vector3(-7.2, 0.2, 0), label: 'storefront', r: 0.20 },
    { p: new THREE.Vector3(-2.4, 0.0, 0), label: 'OMS', r: 0.30 },
    { p: new THREE.Vector3(1.8, 0.1, 0), label: 'brokering', r: 0.26 },
    { p: new THREE.Vector3(6.6, 2.0, -0.6), label: 'store', r: 0.17 },
    { p: new THREE.Vector3(7.0, 0.1, 0.4), label: 'warehouse', r: 0.17 },
    { p: new THREE.Vector3(6.5, -1.9, -0.3), label: 'store', r: 0.17 }
  ];

  function curve(a, b, lift, bow) {
    const A = NODES[a].p, B = NODES[b].p;
    const m = A.clone().lerp(B, 0.5);
    m.y += lift || 0; m.z += bow || 0;
    return new THREE.CatmullRomCurve3([A.clone(), m, B.clone()]);
  }

  const EDGES = [
    curve(0, 1, 0.35, 0.2),
    curve(1, 2, -0.25, -0.3),
    curve(2, 3, 0.5, 0.3),
    curve(2, 4, 0.0, -0.2),
    curve(2, 5, -0.5, 0.35)
  ];
  // the reject path: brokering loops back to the OMS to be re-brokered
  const REJECT = new THREE.CatmullRomCurve3([
    NODES[2].p.clone(),
    new THREE.Vector3(-0.3, -2.1, 1.2),
    NODES[1].p.clone()
  ]);
  const PATHS = EDGES.concat([REJECT]);

  /* ---- scene ---- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0.2, 0.4, 13.2);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) { staticMode(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  const world = new THREE.Group();
  scene.add(world);

  /* ---- edges as faint tubes of line segments ---- */
  PATHS.forEach((c, i) => {
    const pts = c.getPoints(60);
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color: i === PATHS.length - 1 ? AMBER : BLUE,
      transparent: true,
      opacity: i === PATHS.length - 1 ? 0.16 : 0.26
    });
    world.add(new THREE.Line(g, m));
  });

  /* ---- nodes ---- */
  const nodeMeshes = [];
  NODES.forEach((n, i) => {
    const geo = new THREE.SphereGeometry(n.r, 20, 20);
    const mat = new THREE.MeshBasicMaterial({
      color: i === 1 ? CYAN : BLUE, transparent: true, opacity: 0.9
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(n.p);
    world.add(mesh);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(n.r * 2.6, 18, 18),
      new THREE.MeshBasicMaterial({
        color: i === 1 ? CYAN : BLUE, transparent: true, opacity: 0.07
      })
    );
    halo.position.copy(n.p);
    world.add(halo);
    nodeMeshes.push({ mesh, halo, base: n.r, pulse: Math.random() * Math.PI * 2 });
  });

  /* ---- packets: one point per in-flight order ---- */
  const COUNT = 170;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const packets = [];

  function spawn(i, atStart) {
    const rejected = Math.random() < 0.13;
    packets[i] = {
      path: rejected ? PATHS.length - 1 : Math.floor(Math.random() * EDGES.length),
      t: atStart ? Math.random() : 0,
      speed: 0.0016 + Math.random() * 0.0026,
      rejected: rejected
    };
  }
  for (let i = 0; i < COUNT; i++) spawn(i, true);

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.115, vertexColors: true, transparent: true, opacity: 0.95,
    sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  world.add(new THREE.Points(pGeo, pMat));

  /* ---- counter: orders that completed a path ---- */
  const readout = document.getElementById('flow-count');
  let routed = 11840 + Math.floor(Math.random() * 400);
  if (readout) readout.textContent = routed.toLocaleString('en-IN');

  /* ---- interaction: gentle parallax ---- */
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.22;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.14;
  }, { passive: true });

  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });

  const tmp = new THREE.Vector3();
  let frame = 0;

  function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    frame++;

    for (let i = 0; i < COUNT; i++) {
      const pk = packets[i];
      pk.t += pk.speed;
      if (pk.t >= 1) { routed++; spawn(i, false); continue; }
      PATHS[pk.path].getPoint(pk.t, tmp);
      pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z;
      const c = pk.rejected ? AMBER : (pk.t > 0.55 ? CYAN : BLUE);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;

    nodeMeshes.forEach(n => {
      n.pulse += 0.02;
      const s = 1 + Math.sin(n.pulse) * 0.08;
      n.mesh.scale.setScalar(s);
      n.halo.scale.setScalar(1 + Math.sin(n.pulse) * 0.12);
    });

    cx += (tx - cx) * 0.04; cy += (ty - cy) * 0.04;
    world.rotation.y = cx; world.rotation.x = cy;

    if (readout && frame % 18 === 0) readout.textContent = routed.toLocaleString('en-IN');
    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', () => {
    if (!mount.clientWidth) return;
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  });
})();
