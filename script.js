// =============================================
// AOS INIT
// =============================================
AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });

// =============================================
// 1. CUSTOM CURSOR
// =============================================
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

// Hover effect on interactive elements
const hoverables = document.querySelectorAll('a, button, .project-card, .skill-category, .beyond-card, .timeline-card, .chip');
hoverables.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// =============================================
// 7. SCROLL PROGRESS BAR
// =============================================
const progressBar = document.getElementById('scrollProgressBar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  progressBar.style.width = progress + '%';
});

// =============================================
// NAVBAR scroll + mobile
// =============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));

// =============================================
// 3. PARTICLES.JS
// =============================================
particlesJS('particles-js', {
  particles: {
    number: { value: 60, density: { enable: true, value_area: 900 } },
    color: { value: ['#4f7cff', '#00d4ff', '#9b6fd4', '#ec4899'] },
    shape: { type: 'circle' },
    opacity: { value: 0.5, random: true, anim: { enable: true, speed: 0.8, opacity_min: 0.1, sync: false } },
    size: { value: 2.5, random: true, anim: { enable: true, speed: 2, size_min: 0.5, sync: false } },
    line_linked: { enable: true, distance: 130, color: '#4f7cff', opacity: 0.12, width: 1 },
    move: { enable: true, speed: 0.7, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
    modes: { grab: { distance: 160, line_linked: { opacity: 0.5 } }, push: { particles_nb: 3 } }
  },
  retina_detect: true
});

// =============================================
// TYPED TEXT (custom)
// =============================================
const typedPhrases = ['resilient backends.', 'AI agents.', 'Shopify integrations.', 'things that scale.', 'autonomous workflows.', 'side projects (mostly).'];
let phraseIndex = 0, charIndex = 0, isDeleting = false, typeSpeed = 80;
const typedEl = document.getElementById('typed-text');

function typeLoop() {
  const current = typedPhrases[phraseIndex];
  if (isDeleting) { charIndex--; typedEl.textContent = current.substring(0, charIndex); typeSpeed = 45; }
  else { charIndex++; typedEl.textContent = current.substring(0, charIndex); typeSpeed = 85; }
  if (!isDeleting && charIndex === current.length) { typeSpeed = 1800; isDeleting = true; }
  else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % typedPhrases.length; typeSpeed = 300; }
  setTimeout(typeLoop, typeSpeed);
}
setTimeout(typeLoop, 1200);

// =============================================
// VANILLA TILT (3D cards)
// =============================================
VanillaTilt.init(document.querySelectorAll('[data-tilt]'), { max: 8, speed: 400, glare: true, 'max-glare': 0.12, scale: 1.02, perspective: 1000 });

// =============================================
// 5. HOVER SOUNDS (Web Audio API)
// =============================================
let soundEnabled = false;
let audioCtx = null;
const soundToggleBtn = document.getElementById('soundToggle');

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq = 440, duration = 0.08, type = 'sine', vol = 0.06) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled) playTone(600, 0.15, 'sine', 0.08);
});

document.querySelectorAll('.sound-hover, a, button').forEach(el => {
  el.addEventListener('mouseenter', () => playTone(520, 0.07, 'sine', 0.04));
  el.addEventListener('click', () => playTone(660, 0.1, 'triangle', 0.06));
});

// =============================================
// 4. SKILL PROFICIENCY BARS
// =============================================
const sbarFills = document.querySelectorAll('.sbar-fill');
sbarFills.forEach(fill => { fill.style.width = '0'; });

const skillSection = document.getElementById('skills');
const skillObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    sbarFills.forEach((fill, i) => {
      setTimeout(() => {
        const w = fill.style.getPropertyValue('--w') ||
          getComputedStyle(fill).getPropertyValue('--w').trim();
        fill.style.width = w;
      }, i * 120);
    });
    skillObserver.disconnect();
  }
}, { threshold: 0.2 });
if (skillSection) skillObserver.observe(skillSection);


// =============================================
// 8. TERMINAL WIDGET
// =============================================
const terminalBody = document.getElementById('terminalBody');
const terminalLines = [
  { type: 'prompt', cmd: 'status --career' },
  { type: 'output success', text: '✓ STATUS: Actively looking for new opportunities' },
  { type: 'output', text: '  ROLE: Backend / AI / Full-stack Engineer' },
  { type: 'output', text: '  LOCATION: Indore, India (Remote OK)' },
  { type: 'prompt', cmd: 'skills --top 3' },
  { type: 'output', text: '  [1] Java Enterprise (OFBiz, Spring Boot)' },
  { type: 'output', text: '  [2] Agentic AI (Mastra, MCP Protocol)' },
  { type: 'output', text: '  [3] Shopify Integrations + AWS Pipelines' },
  { type: 'prompt', cmd: 'vibe --check' },
  { type: 'output warn', text: '  ⚠ Currently watching Succession S4. Please delay crises.' },
];

let lineIdx = 0;
function typeTerminalLine() {
  if (lineIdx >= terminalLines.length || !terminalBody) return;
  const l = terminalLines[lineIdx++];
  const span = document.createElement('span');
  span.className = 'terminal-line';
  if (l.type === 'prompt') {
    span.innerHTML = `<span class="terminal-prompt">~/param $</span> <span class="terminal-cmd">${l.cmd}</span>`;
  } else {
    span.innerHTML = `<span class="terminal-output ${l.type === 'output' ? '' : l.type.replace('output ', '')}">${l.text}</span>`;
  }
  terminalBody.appendChild(span);
  setTimeout(typeTerminalLine, l.type === 'prompt' ? 700 : 300);
}

const termObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) { setTimeout(typeTerminalLine, 500); termObs.disconnect(); }
}, { threshold: 0.3 });
const termWidget = document.querySelector('.terminal-widget');
if (termWidget) termObs.observe(termWidget);

// =============================================
// 6. PROJECT EXPAND OVERLAY
// =============================================
const projectData = {
  vitran: {
    title: 'Vitran Ecosystem',
    sub: 'Logistics Management Platform',
    desc: 'A comprehensive backend-driven logistics platform built to manage and track daily deliveries for 500+ customers across multiple locations. Built with a mobile-first mindset using React Native for field workers with offline support.',
    highlights: [
      'Managed daily deliveries for 500+ customers with real-time stock sync',
      'Designed REST APIs supporting offline-first mobile operations in low-connectivity areas',
      'Implemented full SDLC from architecture design to Docker-based production deployment',
      'Led the team following Agile principles — sprint planning, reviews, and retrospectives',
    ],
    stack: ['Spring Boot', 'React Native', 'MySQL', 'Docker', 'REST APIs'],
    link: 'https://github.com/dongreparam/vitran-2.0',
  },
  mcp: {
    title: 'MCP Server for SOC OFBiz',
    sub: 'AI ↔ Enterprise Commerce Bridge',
    desc: 'A Model Context Protocol (MCP) server that acts as a structured bridge between AI agents and the OFBiz enterprise system. Enables AI to query, reason about, and interact with complex commerce data in a safe, typed, schema-driven way.',
    highlights: [
      'Implemented MCP protocol to let AI agents natively interface with OFBiz\'s entity engine',
      'Exposed commerce data (orders, inventory, products) as structured AI-consumable tools',
      'Designed with safety and schema validation first — AI can read, not blindly write',
      'Enables natural language queries over complex enterprise commerce datasets',
    ],
    stack: ['TypeScript', 'MCP Protocol', 'Apache OFBiz', 'Node.js', 'AI Agents'],
    link: 'https://github.com/dongreparam/mcp-server-for-soc-ofbiz',
  },
  hotwax: {
    title: 'HotWax Commerce Work',
    sub: 'Enterprise Shopify & AI Systems',
    desc: 'A collection of production-grade systems built at HotWax Commerce — spanning high-volume Shopify integrations, event-driven AWS pipelines, and an autonomous AI agent that monitors and self-heals data sync operations.',
    highlights: [
      'Engineered Shopify product sync pipelines handling creation, updates, and deletions at scale',
      'Designed event-driven AWS SQS/EventBridge architecture for decoupled, resilient message processing',
      'Built DataManager Expert AI agent using Mastra to auto-detect and fix data sync errors',
      'Implemented order lifecycle management with conditional indexing and metadata handling',
    ],
    stack: ['Java', 'Shopify API', 'AWS SQS', 'EventBridge', 'Mastra', 'OFBiz', 'TypeScript'],
    link: 'https://linkedin.com/in/paramdongre',
  },
};

const overlay = document.getElementById('projectOverlay');
const overlayContent = document.getElementById('overlayContent');
const overlayClose = document.getElementById('overlayClose');

document.querySelectorAll('.project-expand-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.project;
    const data = projectData[key];
    if (!data) return;
    playTone(440, 0.1, 'triangle', 0.05);
    overlayContent.innerHTML = `
      <h2 class="overlay-title">${data.title}</h2>
      <p class="overlay-sub">${data.sub}</p>
      <div class="overlay-desc"><p>${data.desc}</p></div>
      <div class="overlay-highlights">
        <h4>KEY HIGHLIGHTS</h4>
        <ul>${data.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
      </div>
      <div class="overlay-stack">${data.stack.map(s => `<span>${s}</span>`).join('')}</div>
      <a href="${data.link}" target="_blank" class="btn btn-primary" style="margin-top:1.5rem;display:inline-flex;">
        <i class="fa-brands fa-github"></i> View On GitHub / LinkedIn
      </a>`;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

overlayClose.addEventListener('click', closeOverlay);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
function closeOverlay() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });

// =============================================
// SCROLLSPY (active nav highlight)
// =============================================
const sections = document.querySelectorAll('section[id], footer[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navItems.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${id}`) link.style.color = 'var(--color-white)';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObserver.observe(s));

// =============================================
// SECTION LABEL REVEAL
// =============================================
const labelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateX(0)'; }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.section-label').forEach(label => {
  label.style.opacity = '0'; label.style.transform = 'translateX(-20px)'; label.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  labelObserver.observe(label);
});

// =============================================
// 10. KONAMI CODE EASTER EGG
// =============================================
const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiStep = 0;
const easterOverlay = document.getElementById('easterEggOverlay');
const eeClose = document.getElementById('eeClose');
const confettiCanvas = document.getElementById('confettiCanvas');

document.addEventListener('keydown', (e) => {
  if (e.key === konamiSequence[konamiStep]) {
    konamiStep++;
    if (konamiStep === konamiSequence.length) {
      konamiStep = 0;
      easterOverlay.classList.add('active');
      launchConfetti();
      playTone(880, 0.3, 'square', 0.08);
    }
  } else { konamiStep = 0; }
});

eeClose.addEventListener('click', () => easterOverlay.classList.remove('active'));
easterOverlay.addEventListener('click', (e) => { if (e.target === easterOverlay || e.target === confettiCanvas) easterOverlay.classList.remove('active'); });

function launchConfetti() {
  const canvas = confettiCanvas;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#4f7cff','#00d4ff','#9b6fd4','#ec4899','#f97316','#22c55e','#fbbf24'];

  for (let i = 0; i < 200; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: Math.random() * 3 + 2,
      vx: (Math.random() - 0.5) * 4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    });
  }

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.y += p.vy; p.x += p.vx; p.rot += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (particles.some(p => p.y < canvas.height + 50)) {
      frame = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  if (frame) cancelAnimationFrame(frame);
  draw();
}

// =============================================
// 9. GITHUB STATS (native — no external service)
// =============================================
(async function loadGitHubStats() {
  const username = 'dongreparam';
  const statsCard = document.getElementById('ghStatsCard');
  const langsCard = document.getElementById('ghLangsCard');

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`)
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API error');

    const user = await userRes.json();
    const repos = await reposRes.json();

    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

    // Count languages
    const langMap = {};
    repos.forEach(r => { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
    const sortedLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const totalLangCount = sortedLangs.reduce((s, [, c]) => s + c, 0);

    const langColors = {
      Java: '#b07219', TypeScript: '#3178c6', JavaScript: '#f7df1e',
      Python: '#3572A5', Groovy: '#e69f56', Kotlin: '#A97BFF',
      HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
      Ruby: '#701516', Go: '#00ADD8', Rust: '#dea584',
    };

    if (statsCard) {
      statsCard.innerHTML = `
        <div class="gh-card-header">
          <img src="${user.avatar_url}" class="gh-avatar" alt="${user.login}" />
          <div>
            <div class="gh-name">${user.name || user.login}</div>
            <div class="gh-login">@${user.login}</div>
          </div>
          <a href="https://github.com/${username}" target="_blank" class="gh-link-btn">
            <i class="fa-brands fa-github"></i>
          </a>
        </div>
        <div class="gh-stats-grid">
          <div class="gh-stat">
            <i class="fa-solid fa-book-bookmark" style="color:#4f7cff"></i>
            <span class="gh-stat-val">${user.public_repos}</span>
            <span class="gh-stat-lbl">Repos</span>
          </div>
          <div class="gh-stat">
            <i class="fa-solid fa-star" style="color:#fbbf24"></i>
            <span class="gh-stat-val">${totalStars}</span>
            <span class="gh-stat-lbl">Stars</span>
          </div>
          <div class="gh-stat">
            <i class="fa-solid fa-code-fork" style="color:#00d4ff"></i>
            <span class="gh-stat-val">${totalForks}</span>
            <span class="gh-stat-lbl">Forks</span>
          </div>
          <div class="gh-stat">
            <i class="fa-solid fa-users" style="color:#9b6fd4"></i>
            <span class="gh-stat-val">${user.followers}</span>
            <span class="gh-stat-lbl">Followers</span>
          </div>
        </div>`;
    }

    if (langsCard) {
      langsCard.innerHTML = `
        <div class="gh-langs-title"><i class="fa-solid fa-chart-bar" style="color:#4f7cff"></i> Top Languages</div>
        <div class="gh-langs-list">
          ${sortedLangs.map(([lang, count]) => {
            const pct = ((count / totalLangCount) * 100).toFixed(1);
            const color = langColors[lang] || '#8892a4';
            return `
              <div class="gh-lang-row">
                <span class="gh-lang-dot" style="background:${color}"></span>
                <span class="gh-lang-name">${lang}</span>
                <span class="gh-lang-bar-wrap">
                  <span class="gh-lang-bar" style="width:${pct}%;background:${color}"></span>
                </span>
                <span class="gh-lang-pct">${pct}%</span>
              </div>`;
          }).join('')}
        </div>`;
    }

  } catch (err) {
    const errMsg = `<div class="gh-card-error"><i class="fa-solid fa-circle-exclamation"></i> Could not load GitHub stats</div>`;
    if (statsCard) statsCard.innerHTML = errMsg;
    if (langsCard) langsCard.innerHTML = errMsg;
  }
})();

