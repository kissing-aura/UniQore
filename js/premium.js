/* premium.js — Lenis + 3D tilt + magnetic + parallax */
(function () {
  'use strict';

  function lerp(a, b, n) { return a + (b - a) * n; }

  // ── State ─────────────────────────────────────────────
  let lenis = null;
  const frameState = { el: null, wrap: null, cRX: 0, cRY: -3, tRX: 0, tRY: -3 };
  const glows = [
    { el: null, x: 0, y: 0, fx: -42, fy: -30, spd: 0.05 },
    { el: null, x: 0, y: 0, fx:  28, fy:  22, spd: 0.04 },
  ];
  const magnets = [];
  const tilts   = [];
  const mouse   = { nx: 0, ny: 0 };

  // ── Lenis init ────────────────────────────────────────
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    window._lenis = lenis;
  }

  // ── Single RAF loop ───────────────────────────────────
  function tick(time) {
    if (lenis) lenis.raf(time);

    // Hero frame 3D tilt
    const f = frameState;
    if (f.el) {
      f.cRX = lerp(f.cRX, f.tRX, 0.07);
      f.cRY = lerp(f.cRY, f.tRY, 0.07);
      const lx = (50 + f.cRY * 2.5).toFixed(1);
      const ly = (35 - f.cRX * 2.5).toFixed(1);
      f.el.style.transform = `perspective(1000px) rotateY(${f.cRY.toFixed(3)}deg) rotateX(${f.cRX.toFixed(3)}deg)`;
      f.el.style.setProperty('--light-x', lx + '%');
      f.el.style.setProperty('--light-y', ly + '%');
    }

    // Glow orbs parallax (mouse)
    glows.forEach(g => {
      if (!g.el) return;
      g.x = lerp(g.x, mouse.nx * g.fx, g.spd);
      g.y = lerp(g.y, mouse.ny * g.fy, g.spd);
      g.el.style.transform = `translate(${g.x.toFixed(1)}px, ${g.y.toFixed(1)}px)`;
    });

    // Magnetic buttons
    magnets.forEach(m => {
      m.bx = lerp(m.bx, m.on ? m.tx : 0, 0.13);
      m.by = lerp(m.by, m.on ? m.ty : 0, 0.13);
      m.el.style.transform = `translate(${m.bx.toFixed(2)}px, ${m.by.toFixed(2)}px)`;
    });

    // Card 3D tilts
    tilts.forEach(c => {
      c.cRX = lerp(c.cRX, c.on ? c.tRX : 0, 0.09);
      c.cRY = lerp(c.cRY, c.on ? c.tRY : 0, 0.09);
      if (Math.abs(c.cRX) > 0.01 || Math.abs(c.cRY) > 0.01 || c.on) {
        c.el.style.transform = `perspective(700px) rotateY(${c.cRY.toFixed(3)}deg) rotateX(${c.cRX.toFixed(3)}deg)`;
      }
    });

    requestAnimationFrame(tick);
  }

  // ── DOM setup ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initLenis();

    frameState.el   = document.querySelector('.hero__frame');
    frameState.wrap = document.querySelector('.hero__right');
    glows[0].el = document.querySelector('.hero__glow--1');
    glows[1].el = document.querySelector('.hero__glow--2');

    // Disable CSS transition on frame (JS handles smoothing)
    if (frameState.el) {
      frameState.el.style.transition = 'box-shadow 0.5s ease';
    }

    const heroEl = document.querySelector('.hero');

    // Mouse tracking in hero
    if (heroEl) {
      heroEl.addEventListener('mousemove', e => {
        const r = heroEl.getBoundingClientRect();
        mouse.nx = (e.clientX - r.left) / r.width  - 0.5;
        mouse.ny = (e.clientY - r.top)  / r.height - 0.5;
      });
      heroEl.addEventListener('mouseleave', () => { mouse.nx = 0; mouse.ny = 0; });
    }

    // Frame tilt on hover
    if (frameState.wrap) {
      frameState.wrap.addEventListener('mousemove', e => {
        const r = frameState.wrap.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        frameState.tRY = x * 18 - 2;
        frameState.tRX = -y * 11;
      });
      frameState.wrap.addEventListener('mouseleave', () => {
        frameState.tRY = -3;
        frameState.tRX = 0;
      });
    }

    // Magnetic CTAs
    document.querySelectorAll('.btn--accent, .btn--ghost').forEach(el => {
      if (el.closest('.mobile-menu')) return;
      const m = { el, bx: 0, by: 0, tx: 0, ty: 0, on: false };
      magnets.push(m);
      el.addEventListener('mouseenter', () => (m.on = true));
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        m.tx = (e.clientX - r.left - r.width  / 2) * 0.3;
        m.ty = (e.clientY - r.top  - r.height / 2) * 0.35;
      });
      el.addEventListener('mouseleave', () => (m.on = false));
    });

    // Card 3D tilts
    document.querySelectorAll('.service-card, .case-card, .guarantee-card').forEach(el => {
      const c = { el, cRX: 0, cRY: 0, tRX: 0, tRY: 0, on: false };
      tilts.push(c);
      el.style.willChange = 'transform';
      el.addEventListener('mouseenter', () => (c.on = true));
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        c.tRY =  x * 7;
        c.tRX = -y * 5;
      });
      el.addEventListener('mouseleave', () => (c.on = false));
    });

    // Hero scroll parallax
    const heroLeft  = document.querySelector('.hero__left');
    const heroVideo = document.querySelector('.hero__video');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return;
      if (heroLeft && heroLeft.classList.contains('revealed')) {
        heroLeft.style.transform = `translateY(${(y * -0.09).toFixed(1)}px)`;
      }
      if (heroVideo) {
        heroVideo.style.transform = `translateY(${(y * 0.18).toFixed(1)}px)`;
      }
    }, { passive: true });

    requestAnimationFrame(tick);
  });
})();
