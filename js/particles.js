(function () {
  'use strict';

  class ParticleNet {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.pts = [];
      this.raf = null;
      this.w = 0;
      this.h = 0;
      this._onResize = this._resize.bind(this);
      window.addEventListener('resize', this._onResize, { passive: true });
      this._resize();
      this._populate();
      this._animate();
    }

    _resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const el = this.canvas;
      this.w = el.offsetWidth;
      this.h = el.offsetHeight;
      el.width  = this.w * dpr;
      el.height = this.h * dpr;
      this.ctx.scale(dpr, dpr);
    }

    _populate() {
      this.pts = [];
      const count = Math.min(Math.floor((this.w * this.h) / 14000), 22);
      for (let i = 0; i < count; i++) {
        const hub = Math.random() < 0.14;
        this.pts.push({
          x:  Math.random() * this.w,
          y:  Math.random() * this.h,
          vx: (Math.random() - 0.5) * (hub ? 0.18 : 0.38),
          vy: (Math.random() - 0.5) * (hub ? 0.18 : 0.38),
          r:  hub ? Math.random() * 3 + 2.5 : Math.random() * 1.4 + 0.4,
          op: hub ? 0.75 + Math.random() * 0.25 : 0.15 + Math.random() * 0.45,
          hub,
        });
      }
    }

    _tick() {
      const { w, h, pts } = this;
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8)    p.x = w + 8;
        if (p.x > w + 8) p.x = -8;
        if (p.y < -8)    p.y = h + 8;
        if (p.y > h + 8) p.y = -8;
      });
    }

    _draw() {
      const { ctx, w, h, pts } = this;
      ctx.clearRect(0, 0, w, h);

      // Dots only — no O(n²) line loop
      pts.forEach(p => {
        if (p.hub) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
          g.addColorStop(0, `rgba(255,255,255,${(p.op * 0.35).toFixed(3)})`);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.op.toFixed(3)})`;
        ctx.fill();
      });
    }

    _animate(ts) {
      if (!this._lastTs || ts - this._lastTs >= 33) {
        this._lastTs = ts;
        this._tick();
        this._draw();
      }
      this.raf = requestAnimationFrame((t) => this._animate(t));
    }

    destroy() {
      cancelAnimationFrame(this.raf);
      window.removeEventListener('resize', this._onResize);
    }
  }

  // Boot
  function init() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    // Skip on mobile
    if (window.innerWidth < 768) {
      canvas.style.display = 'none';
      return;
    }

    let net = null;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !net) net = new ParticleNet(canvas);
      });
    }, { threshold: 0 });
    obs.observe(canvas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
