/* contact-net.js — живая сеть данных на фоне контакт-секции.
   Дрейфующие узлы + связи по близости + мягкая реакция на курсор.
   Не видео — лёгкий canvas 2D. Пауза вне экрана, тише на мобилке,
   при prefers-reduced-motion — статичный кадр без анимации. */
(function () {
  'use strict';

  var canvas = document.querySelector('.contact__net');
  if (!canvas) return;
  var section = canvas.closest('.contact');
  if (!section) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, nodes = [], LINK = 0;
  var mouse = { x: -9999, y: -9999 };

  function resize() {
    var r = section.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // плотность узлов от площади, но с потолком (мобилка легче)
    var mobile = W < 720;
    var count = Math.min(mobile ? 34 : 80, Math.round(W * H / (mobile ? 15000 : 12000)));
    LINK = mobile ? 118 : 150;
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * 0.22, vy: (Math.random() - .5) * 0.22,
        r: Math.random() * 1.4 + 0.8,
        pulse: Math.random() // фаза мягкого мерцания
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var i, j, a, b, dx, dy, dist;
    // связи
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        dx = a.x - b.x; dy = a.y - b.y; dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK) {
          var o = (1 - dist / LINK) * 0.16;
          ctx.strokeStyle = 'rgba(205,255,79,' + o.toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    // узлы
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      var tw = reduce ? 0.6 : (0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.0016 + a.pulse * 6.28)));
      // близость к курсору подсвечивает
      dx = a.x - mouse.x; dy = a.y - mouse.y; dist = Math.sqrt(dx * dx + dy * dy);
      var near = dist < 130 ? (1 - dist / 130) : 0;
      var alpha = Math.min(0.9, tw * 0.5 + near * 0.5);
      ctx.fillStyle = 'rgba(205,255,79,' + alpha.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r + near * 1.2, 0, 6.2832); ctx.fill();
    }
  }

  function step(t) {
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      // мягкий увод от курсора
      var dx = a.x - mouse.x, dy = a.y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0.1) { var f = (1 - dist / 120) * 0.35; a.vx += (dx / dist) * f * 0.1; a.vy += (dy / dist) * f * 0.1; }
      a.x += a.vx; a.y += a.vy;
      a.vx *= 0.99; a.vy *= 0.99;
      // подкрутка минимальной скорости, чтобы не застывали
      if (Math.abs(a.vx) < 0.05) a.vx += (Math.random() - .5) * 0.02;
      if (Math.abs(a.vy) < 0.05) a.vy += (Math.random() - .5) * 0.02;
      if (a.x < -20) a.x = W + 20; else if (a.x > W + 20) a.x = -20;
      if (a.y < -20) a.y = H + 20; else if (a.y > H + 20) a.y = -20;
    }
    draw(t);
  }

  var raf = 0, running = false;
  function loop(t) { if (!running) return; step(t); raf = requestAnimationFrame(loop); }
  function start() { if (running) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  resize();
  addEventListener('resize', resize);
  section.addEventListener('pointermove', function (e) {
    var r = section.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  section.addEventListener('pointerleave', function () { mouse.x = -9999; mouse.y = -9999; });

  if (reduce) { draw(0); return; } // статичный кадр, без анимации

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
  }, { rootMargin: '80px' });
  io.observe(section);
})();
