/* Кастомный курсор: точка едет мгновенно, кольцо догоняет с инерцией.
   Только десктоп с реальной мышью. rAF останавливается, как только кольцо догнало,
   — никакого вечного цикла в фоне (перф-правило проекта). */
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var dot = document.getElementById('cursor');
  var ring = document.getElementById('cursor-follower');
  if (!dot || !ring) return;

  var mx = 0, my = 0, rx = 0, ry = 0, raf = 0, live = false;

  document.documentElement.classList.add('uq-cur-on');

  function tick() {
    raf = 0;
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) {
      raf = requestAnimationFrame(tick);
    } else {
      rx = mx; ry = my;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    }
  }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!live) {
      live = true;
      rx = mx; ry = my;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      dot.classList.add('is-live');
      ring.classList.add('is-live');
    }
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  /* делегирование вместо навешивания слушателей на каждый элемент —
     работает и для блоков, добавленных в DOM позже */
  var HOT = 'a,button,[role="button"],.btn,.service-card,.case-card,.blog-card,' +
            '.faq-item__q,summary,label[for],input[type="submit"],input[type="button"]';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(HOT)) {
      dot.classList.add('cursor--hover');
      ring.classList.add('cursor-follower--hover');
    }
  }, true);

  document.addEventListener('mouseout', function (e) {
    if (!e.target.closest) return;
    var from = e.target.closest(HOT);
    if (!from) return;
    var to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest(HOT) : null;
    if (to === from) return; // движение внутри той же кнопки — не гасим
    dot.classList.remove('cursor--hover');
    ring.classList.remove('cursor-follower--hover');
  }, true);

  function hide() { dot.classList.remove('is-live'); ring.classList.remove('is-live'); }
  function show() { if (live) { dot.classList.add('is-live'); ring.classList.add('is-live'); } }

  /* ушли за пределы окна (или в iframe) — прячем, чтобы кружок не «застревал» */
  document.addEventListener('mouseleave', hide);
  document.addEventListener('mouseenter', show);
  window.addEventListener('blur', hide);
})();
