// =============================================
// INIT: AOS (Animate on Scroll)
// =============================================
AOS.init({
  duration: 700,
  easing: 'ease-out-cubic',
  once: true,
  offset: 60,
});

// =============================================
// NAVBAR: Scroll shadow + mobile hamburger
// =============================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// =============================================
// PARTICLES.JS HERO BACKGROUND
// =============================================
particlesJS('particles-js', {
  particles: {
    number: { value: 55, density: { enable: true, value_area: 900 } },
    color: { value: ['#4f7cff', '#00d4ff', '#9b6fd4'] },
    shape: { type: 'circle' },
    opacity: {
      value: 0.45,
      random: true,
      anim: { enable: true, speed: 0.8, opacity_min: 0.1, sync: false }
    },
    size: {
      value: 2.5,
      random: true,
      anim: { enable: true, speed: 2, size_min: 0.5, sync: false }
    },
    line_linked: {
      enable: true,
      distance: 140,
      color: '#4f7cff',
      opacity: 0.15,
      width: 1
    },
    move: {
      enable: true,
      speed: 0.8,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false,
    }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: { enable: true, mode: 'grab' },
      onclick: { enable: true, mode: 'push' },
      resize: true
    },
    modes: {
      grab: { distance: 160, line_linked: { opacity: 0.5 } },
      push: { particles_nb: 3 }
    }
  },
  retina_detect: true
});

// =============================================
// TYPED.JS — Hero Typed Text
// =============================================
const typedPhrases = [
  'resilient backends.',
  'AI agents.',
  'Shopify integrations.',
  'things that scale.',
  'autonomous workflows.',
  'side projects (mostly).',
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 80;

const typedEl = document.getElementById('typed-text');

function typeLoop() {
  const currentPhrase = typedPhrases[phraseIndex];

  if (isDeleting) {
    charIndex--;
    typedEl.textContent = currentPhrase.substring(0, charIndex);
    typeSpeed = 45;
  } else {
    charIndex++;
    typedEl.textContent = currentPhrase.substring(0, charIndex);
    typeSpeed = 85;
  }

  if (!isDeleting && charIndex === currentPhrase.length) {
    typeSpeed = 1800; // pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % typedPhrases.length;
    typeSpeed = 300; // pause before next phrase
  }

  setTimeout(typeLoop, typeSpeed);
}

// Start typing after hero animation
setTimeout(typeLoop, 1200);

// =============================================
// VANILLA TILT — Project Cards
// =============================================
VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
  max: 8,
  speed: 400,
  glare: true,
  'max-glare': 0.12,
  scale: 1.02,
  perspective: 1000,
});

// =============================================
// SMOOTH ACTIVE NAV HIGHLIGHT
// =============================================
const sections = document.querySelectorAll('section[id], footer[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

const observerOptions = {
  rootMargin: '-40% 0px -55% 0px',
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navItems.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = 'var(--color-white)';
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));

// =============================================
// COPY EMAIL ON CLICK (footer email link)
// =============================================
document.querySelectorAll('.footer-link').forEach(link => {
  if (link.href && link.href.startsWith('mailto:')) {
    link.addEventListener('click', (e) => {
      // also copy to clipboard
      navigator.clipboard.writeText('param.dongre@gmail.com').catch(() => {});
    });
  }
});

// =============================================
// SCROLL-BASED REVEAL: Section labels subtle pop
// =============================================
const labelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section-label').forEach(label => {
  label.style.opacity = '0';
  label.style.transform = 'translateX(-20px)';
  label.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  labelObserver.observe(label);
});
