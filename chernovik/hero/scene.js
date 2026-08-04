/* scene.js — оживление 3D-сцены черновика.

   Три вещи, из-за которых сцена читается объёмной, а не «картинкой с наклоном»:
   1. Слои разнесены по Z (data-depth) — при повороте они расходятся честным
      параллаксом, ближние обгоняют дальние.
   2. Поворот идёт за курсором с инерцией (lerp), а не рывком: без сглаживания
      3D всегда выглядит дёшево.
   3. Всё живое (счётчики, линия графика) стартует один раз при появлении и
      уважает prefers-reduced-motion.

   Никаких библиотек: CSS-трансформы + rAF, чтобы страница не тянула лишнего
   на слабом мобильном канале. */
(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var coarse = window.matchMedia && matchMedia('(hover:none)').matches;

  /* ── 1. Разносим слои по глубине ──────────────────────────────── */
  document.querySelectorAll('[data-depth]').forEach(function (el) {
    var z = parseFloat(el.dataset.depth) || 0;
    el.style.transform = 'translateZ(' + z + 'px)';
    el.style.transformStyle = 'preserve-3d';
  });

  /* ── 2. Поворот сцены за курсором ─────────────────────────────── */
  var stage = document.getElementById('stage');
  var scene = document.getElementById('scene');

  if (stage && scene && !reduce && !coarse) {
    var БАЗА_X = 6, БАЗА_Y = -15;      // стартовый разворот, как в CSS
    var АМП_X = 7, АМП_Y = 9;          // насколько сильно ведёт за мышью
    var цельX = БАЗА_X, цельY = БАЗА_Y;
    var текX = БАЗА_X, текY = БАЗА_Y;
    var живой = false;

    window.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      // считаем от центра сцены, а не от окна: иначе на широком мониторе
      // сцена реагирует на движение мыши где-то далеко и это выглядит случайным
      var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      nx = Math.max(-1.6, Math.min(1.6, nx));
      ny = Math.max(-1.6, Math.min(1.6, ny));
      цельY = БАЗА_Y + nx * АМП_Y;
      цельX = БАЗА_X - ny * АМП_X;
      пуск();
    }, { passive: true });

    stage.addEventListener('pointerleave', function () { цельX = БАЗА_X; цельY = БАЗА_Y; пуск(); });

    function пуск() { if (!живой) { живой = true; requestAnimationFrame(шаг); } }

    function шаг() {
      // догоняем цель по экспоненте — движение с довесом, без рывка на старте
      текX += (цельX - текX) * 0.085;
      текY += (цельY - текY) * 0.085;
      scene.style.transform =
        'rotateX(' + текX.toFixed(2) + 'deg) rotateY(' + текY.toFixed(2) + 'deg) rotateZ(.6deg)';

      if (Math.abs(цельX - текX) > 0.02 || Math.abs(цельY - текY) > 0.02) requestAnimationFrame(шаг);
      else живой = false;
    }
  }

  /* ── 3. Линия графика: строим из данных, а не из захардкоженного пути ── */
  (function chart() {
    var line = document.getElementById('line');
    var area = document.getElementById('area');
    var dot = document.getElementById('dot');
    if (!line || !area) return;

    var знач = [26, 34, 30, 46, 42, 62, 74, 96];   // условная выручка по неделям
    var W = 320, H = 118, top = 14, bot = 104;
    var max = Math.max.apply(null, знач), min = Math.min.apply(null, знач);
    var точки = знач.map(function (v, i) {
      return {
        x: (i / (знач.length - 1)) * W,
        y: bot - ((v - min) / (max - min || 1)) * (bot - top)
      };
    });

    // сглаживание Катмулла–Рома → кубические Безье: линия живая, без углов
    var d = 'M' + точки[0].x.toFixed(1) + ',' + точки[0].y.toFixed(1);
    for (var i = 0; i < точки.length - 1; i++) {
      var p0 = точки[i - 1] || точки[i], p1 = точки[i], p2 = точки[i + 1], p3 = точки[i + 2] || p2;
      var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1)
         + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
    }
    line.setAttribute('d', d);
    area.setAttribute('d', d + 'L' + W + ',' + H + 'L0,' + H + 'Z');
    if (dot) { dot.setAttribute('cx', точки[точки.length - 1].x); dot.setAttribute('cy', точки[точки.length - 1].y); }

    if (reduce) return;
    // линия прочерчивается один раз при появлении
    var len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    if (dot) dot.style.opacity = '0';
    setTimeout(function () {
      line.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)';
      line.style.strokeDashoffset = '0';
      if (dot) { dot.style.transition = 'opacity .5s ease 1.25s'; dot.style.opacity = '1'; }
    }, 420);
  })();

  /* ── 4. Счётчики KPI ──────────────────────────────────────────── */
  (function counters() {
    var поля = document.querySelectorAll('[data-count]');
    if (!поля.length) return;

    поля.forEach(function (el) {
      var цель = parseFloat(el.dataset.count) || 0;
      var суф = el.dataset.suffix || '';
      if (reduce) { el.textContent = формат(цель) + суф; return; }

      var старт = null, длит = 1250;
      requestAnimationFrame(function тик(t) {
        if (!старт) старт = t;
        var k = Math.min(1, (t - старт) / длит);
        var e = 1 - Math.pow(1 - k, 3);            // ease-out: быстро стартует, мягко доводит
        el.textContent = формат(Math.round(цель * e)) + суф;
        if (k < 1) requestAnimationFrame(тик);
      });
    });

    function формат(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  })();

  /* ── 5. Фон: точки-данные, стягивающиеся к панели ─────────────── */
  (function bg() {
    var c = document.getElementById('bg');
    if (!c || reduce) return;
    var ctx = c.getContext('2d', { alpha: true });
    var W, H, dpr, точки = [], raf = 0;

    function размер() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // плотность по площади, но с потолком — на 4K не жжём батарею
      var n = Math.min(90, Math.round(W * H / 26000));
      точки = new Array(n).fill(0).map(function () {
        return {
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12,
          r: Math.random() * 1.5 + .5, a: Math.random() * .5 + .15
        };
      });
    }

    function кадр() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < точки.length; i++) {
        var p = точки[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(205,255,79,' + p.a * .5 + ')';
        ctx.fill();
      }
      // тонкие связи между близкими точками — «сеть данных», не звёздное небо
      for (var a = 0; a < точки.length; a++) {
        for (var b = a + 1; b < точки.length; b++) {
          var dx = точки[a].x - точки[b].x, dy = точки[a].y - точки[b].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            ctx.beginPath();
            ctx.moveTo(точки[a].x, точки[a].y);
            ctx.lineTo(точки[b].x, точки[b].y);
            ctx.strokeStyle = 'rgba(205,255,79,' + (1 - d2 / 15000) * .07 + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(кадр);
    }

    размер();
    кадр();
    window.addEventListener('resize', function () { cancelAnimationFrame(raf); размер(); кадр(); });
    // в фоновой вкладке rAF и так засыпает, но снимем нагрузку явно
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); кадр(); }
    });
  })();
})();
