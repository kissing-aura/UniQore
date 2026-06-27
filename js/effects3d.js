'use strict';

// ── 3D Effects — Uniqore site ─────────────────────────────────────────
// Loaded lazily after first scroll or 2.5s timeout

(function () {
  if (window.innerWidth <= 768) return; // skip on mobile

  // ── Effect 1: Hero Frame — deep 3D tilt tracking mouse ──────────────
  function initHeroDepth() {
    const hero  = document.querySelector('.hero');
    const frame = document.querySelector('.hero__frame');
    const toast = document.querySelector('.hero__mockup-toast');
    if (!hero || !frame) return;

    // Initial resting angle — feels like it's floating towards viewer
    const BASE_X = 4, BASE_Y = -10;
    frame.style.transform = `perspective(1100px) rotateX(${BASE_X}deg) rotateY(${BASE_Y}deg) translateZ(0px)`;
    frame.style.transition = 'transform 0.15s ease';
    frame.style.willChange = 'transform';

    let raf = null;
    hero.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left)  / rect.width  - 0.5;
        const y = (e.clientY - rect.top)   / rect.height - 0.5;
        const rX = BASE_X + (-y * 10);
        const rY = BASE_Y + (x  * 14);
        frame.style.transform = `perspective(1100px) rotateX(${rX}deg) rotateY(${rY}deg) translateZ(24px)`;
        if (toast) toast.style.transform = `perspective(1100px) rotateX(${rX * 0.5}deg) rotateY(${rY * 0.5}deg) translateZ(40px)`;
      });
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      frame.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1)';
      frame.style.transform  = `perspective(1100px) rotateX(${BASE_X}deg) rotateY(${BASE_Y}deg) translateZ(0px)`;
      if (toast) { toast.style.transition = 'transform 0.7s cubic-bezier(0.23,1,0.32,1)'; toast.style.transform = ''; }
      setTimeout(() => {
        frame.style.transition = 'transform 0.15s ease';
        if (toast) toast.style.transition = '';
      }, 700);
    });
  }

  // ── Effect 2: Card Tilt with specular glare ─────────────────────────
  function initCardTilt(selector, opts = {}) {
    const {
      maxTilt    = 10,
      perspective = 900,
      scale       = 1.025,
      glareOpacity = 0.12,
      glowColor   = 'rgba(245,197,24,0.12)',
    } = opts;

    // Transform-only tilt — GPU-composited, no per-frame box-shadow or
    // gradient repaints (those caused the jank). rAF-throttled.
    document.querySelectorAll(selector).forEach(card => {
      card.style.transformOrigin = 'center center';
      card.style.willChange = 'transform';
      let raf = null;

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.12s ease';
      });

      card.addEventListener('mousemove', e => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width  - 0.5;
          const ny = (e.clientY - r.top)  / r.height - 0.5;
          const rX = (-ny * maxTilt).toFixed(2);
          const rY = ( nx * maxTilt).toFixed(2);
          card.style.transform = `perspective(${perspective}px) rotateX(${rX}deg) rotateY(${rY}deg) scale3d(${scale},${scale},${scale})`;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
        card.style.transform  = '';
      });
    });
  }

  // ── Effect 3: Magnetic CTA buttons ──────────────────────────────────
  function initMagneticButtons() {
    document.querySelectorAll('.btn--accent, .btn--lg, .contact__tg-btn').forEach(btn => {
      btn.style.transition = 'transform 0.18s cubic-bezier(0.23,1,0.32,1)';

      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) * 0.3;
        const y = (e.clientY - r.top  - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ── Effect 4: 3D Floating Orbs in hero background ───────────────────
  function initFloatingOrbs() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const orbs = [
      { size: 320, x: 72, y: 20, color: 'rgba(245,197,24,0.045)', dur: 8,  delay: 0   },
      { size: 180, x: 12, y: 55, color: 'rgba(245,197,24,0.03)',  dur: 11, delay: 2   },
      { size: 240, x: 85, y: 70, color: 'rgba(255,255,255,0.02)', dur: 9,  delay: 1.5 },
      { size: 100, x: 50, y: 10, color: 'rgba(245,197,24,0.055)', dur: 6,  delay: 0.5 },
    ];

    orbs.forEach(o => {
      const el = document.createElement('div');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = [
        'position:absolute',
        `width:${o.size}px`, `height:${o.size}px`,
        `left:${o.x}%`, `top:${o.y}%`,
        `background:radial-gradient(circle at 35% 35%, ${o.color}, transparent 70%)`,
        'border-radius:50%',
        'pointer-events:none',
        'will-change:transform',
        `animation:orbFloat${o.dur} ${o.dur}s ease-in-out ${o.delay}s infinite alternate`,
        'transform:translate3d(-50%,-50%,0)',
        'filter:blur(2px)',
      ].join(';');
      hero.appendChild(el);
    });

    // Inject keyframes
    if (!document.getElementById('orb-kf')) {
      const style = document.createElement('style');
      style.id = 'orb-kf';
      style.textContent = [6, 8, 9, 11].map(d => `
        @keyframes orbFloat${d} {
          from { transform: translate3d(-50%,-50%,0) scale(1); }
          to   { transform: translate3d(calc(-50% + ${10 + d * 2}px), calc(-50% + ${8 + d}px), 0) scale(1.08); }
        }
      `).join('');
      document.head.appendChild(style);
    }
  }

  // ── Effect 5: Hero text depth parallax (mouse) ──────────────────────
  function initHeroTextDepth() {
    const title    = document.querySelector('.hero__title');
    const subtitle = document.querySelector('.hero__subtitle');
    const eyebrow  = document.querySelector('.hero__eyebrow');
    const hero     = document.querySelector('.hero');
    if (!hero || !title) return;

    [eyebrow, title, subtitle].forEach((el, i) => {
      if (el) el.style.transition = 'transform 0.12s ease';
    });

    const depths = [0.006, 0.01, 0.007];

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width  / 2;
      const dy = e.clientY - rect.top  - rect.height / 2;

      [eyebrow, title, subtitle].forEach((el, i) => {
        if (!el) return;
        const d = depths[i];
        el.style.transform = `translate3d(${dx * d}px, ${dy * d}px, 0)`;
      });
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      [eyebrow, title, subtitle].forEach(el => { if (el) el.style.transform = ''; });
    });
  }

  // ── Effect 6: Reveal counter animation on KPI numbers ───────────────
  function initCounterReveal() {
    const nums = document.querySelectorAll('.ui-mockup__kpi-num');
    if (!nums.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const raw = el.textContent.trim();
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (!num || el.dataset.counted) return;
        el.dataset.counted = '1';
        observer.unobserve(el);

        const prefix = raw.includes('$') ? '$' : '';
        const suffix = raw.replace(/[$0-9.,\s]/g, '');
        let start = 0;
        const step = num / 40;
        const tick = () => {
          start = Math.min(start + step, num);
          el.textContent = prefix + (Number.isInteger(num)
            ? Math.round(start).toLocaleString('ru-RU')
            : start.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')) + suffix;
          if (start < num) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    nums.forEach(el => observer.observe(el));
  }

  // ── Init all ─────────────────────────────────────────────────────────
  // Only the floating orbs live here now. Hero-frame tilt, magnetic buttons
  // and ALL card tilts are owned solely by premium.js (single rAF + lerp).
  // Running them here too made two systems fight over the same transforms —
  // that was the "shake". One owner = smooth.
  initFloatingOrbs();

})();
