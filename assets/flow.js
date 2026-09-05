/* =========================================================
   Order-flow network — the hero graphic.
   A stylised version of what Param builds: orders leaving a
   storefront, brokered by an OMS, routed to fulfilment, with
   the occasional reject looping back to be re-brokered.

   Click the hero to inject an order.

   Falls back to a still diagram on small screens, on
   prefers-reduced-motion, and anywhere WebGL is missing.
   ========================================================= */
(function () {
  const mount = document.getElementById('flow-canvas');
  if (!mount) return;

  const note = document.querySelector('.flow-note');
  const keys = document.querySelector('.flow-keys');
  const readout = document.getElementById('flow-count');

  function staticMode() {
    mount.classList.add('flow-static');
    if (keys) keys.style.display = 'none';
    if (note) note.textContent = 'A network of orders being routed. Held still here to save your battery.';
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 820px)').matches;
  if (reduced || small || typeof THREE === 'undefined') { staticMode(); return; }

  /* ink-on-paper palette, tuned for a light ground */
  const INDIGO = new THREE.Color('#3b2bff');
  const TEAL = new THREE.Color('#0f9d8f');
  const AMBER = new THREE.Color('#e08a00');

  const NODES = [
    { p: new THREE.Vector3(-7.4, 0.4, 0), r: 0.17 },
    { p: new THREE.Vector3(-2.6, 0.0, 0), r: 0.28 },
    { p: new THREE.Vector3(1.7, 0.2, 0), r: 0.24 },
    { p: new THREE.Vector3(6.6, 2.1, -0.5), r: 0.15 },
    { p: new THREE.Vector3(7.1, 0.0, 0.4), r: 0.15 },
    { p: new THREE.Vector3(6.4, -2.0, -0.3), r: 0.15 }
  ];

  function curve(a, b, lift, bow) {
    const A = NODES[a].p, B = NODES[b].p;
    const m = A.clone().lerp(B, 0.5);
    m.y += lift || 0; m.z += bow || 0;
    return new THREE.CatmullRomCurve3([A.clone(), m, B.clone()]);
  }

  const EDGES = [
    curve(0, 1, 0.35, 0.2), curve(1, 2, -0.25, -0.3),
    curve(2, 3, 0.5, 0.3), curve(2, 4, 0.0, -0.2), curve(2, 5, -0.5, 0.35)
  ];
  const REJECT = new THREE.CatmullRomCurve3([
    NODES[2].p.clone(), new THREE.Vector3(-0.4, -2.2, 1.2), NODES[1].p.clone()
  ]);
  const PATHS = EDGES.concat([REJECT]);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0.2, 0.3, 13.6);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) { staticMode(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  const world = new THREE.Group();
  // keep the network clear of the left-hand text column on wide screens
  world.position.x = window.innerWidth > 1100 ? 2.6 : 1.2;
  scene.add(world);

  PATHS.forEach((c, i) => {
    const last = i === PATHS.length - 1;
    const g = new THREE.BufferGeometry().setFromPoints(c.getPoints(60));
    world.add(new THREE.Line(g, new THREE.LineBasicMaterial({
      color: last ? AMBER : INDIGO, transparent: true, opacity: last ? 0.22 : 0.30
    })));
  });

  const nodeMeshes = [];
  NODES.forEach((n, i) => {
    const color = i === 1 ? TEAL : INDIGO;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(n.r, 20, 20),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.85 })
    );
    mesh.position.copy(n.p); world.add(mesh);
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(n.r * 2.8, 18, 18),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.10 })
    );
    halo.position.copy(n.p); world.add(halo);
    nodeMeshes.push({ mesh: mesh, halo: halo, pulse: Math.random() * Math.PI * 2 });
  });

  const MAX = 260;
  const pos = new Float32Array(MAX * 3);
  const col = new Float32Array(MAX * 3);
  const packets = [];
  const BASE = 150;

  function make(atStart, forceReject) {
    const rejected = forceReject !== undefined ? forceReject : Math.random() < 0.12;
    return {
      path: rejected ? PATHS.length - 1 : Math.floor(Math.random() * EDGES.length),
      t: atStart ? Math.random() : 0,
      speed: 0.0016 + Math.random() * 0.0026,
      rejected: rejected,
      injected: false
    };
  }
  for (let i = 0; i < BASE; i++) packets.push(make(true));

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  pGeo.setDrawRange(0, packets.length);
  world.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.13, vertexColors: true, transparent: true, opacity: 0.95,
    sizeAttenuation: true, depthWrite: false
  })));

  let routed = 11840 + Math.floor(Math.random() * 400);
  let injected = 0;
  if (readout) readout.textContent = routed.toLocaleString('en-IN');

  /* ---- click to inject an order ---- */
  const hero = document.getElementById('home') || mount.parentElement;
  const injectLabel = document.getElementById('inject-count');
  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    for (let n = 0; n < 6 && packets.length < MAX; n++) {
      const pk = make(false, false);
      pk.injected = true; pk.speed = 0.004 + Math.random() * 0.002;
      packets.push(pk);
    }
    pGeo.setDrawRange(0, packets.length);
    injected += 6;
    if (injectLabel) {
      injectLabel.textContent = injected;
      injectLabel.parentElement.classList.add('is-live');
    }
  });

  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.20;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.12;
  }, { passive: true });

  let running = true;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; });

  const tmp = new THREE.Vector3();
  let frame = 0;

  function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    frame++;

    for (let i = 0; i < packets.length; i++) {
      const pk = packets[i];
      pk.t += pk.speed;
      if (pk.t >= 1) {
        routed++;
        if (pk.injected && packets.length > BASE) { packets.splice(i, 1); i--; pGeo.setDrawRange(0, packets.length); continue; }
        packets[i] = make(false);
        continue;
      }
      PATHS[pk.path].getPoint(pk.t, tmp);
      pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z;
      const c = pk.rejected ? AMBER : (pk.injected ? TEAL : INDIGO);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;

    for (let k = 0; k < nodeMeshes.length; k++) {
      const n = nodeMeshes[k];
      n.pulse += 0.02;
      n.mesh.scale.setScalar(1 + Math.sin(n.pulse) * 0.07);
      n.halo.scale.setScalar(1 + Math.sin(n.pulse) * 0.13);
    }

    cx += (tx - cx) * 0.04; cy += (ty - cy) * 0.04;
    world.rotation.y = cx; world.rotation.x = cy;
    world.position.x = (window.innerWidth > 1100 ? 2.6 : 1.2) + cx * 1.4;

    if (readout && frame % 18 === 0) readout.textContent = routed.toLocaleString('en-IN');
    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', function () {
    if (!mount.clientWidth) return;
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  });
})();
