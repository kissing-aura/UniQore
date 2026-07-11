/* dash.js — анимация hero-дашборда: рисование графика + счётчики KPI при появлении. */
(function () {
  'use strict';
  var dash = document.getElementById('heroDash');
  if (!dash) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false;

  function fmt(n, space) { n = Math.round(n); return space ? n.toLocaleString('ru-RU').replace(/[, ]/g, ' ') : String(n); }

  function countUp(el) {
    var to = +el.dataset.to, pre = el.dataset.pre || '', suf = el.dataset.suf || '', sp = el.dataset.fmt === '1';
    if (reduce) { el.textContent = pre + fmt(to, sp) + suf; return; }
    var t0 = performance.now(), dur = 1500;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(to * e, sp) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  function go() {
    if (started) return; started = true;
    dash.classList.add('in');
    Array.prototype.slice.call(dash.querySelectorAll('.dash__kpi-n[data-to]')).forEach(countUp);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { go(); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(dash);
    setTimeout(go, 1600); // фолбэк, если уже видно
  } else { go(); }
})();
