/* bgloop.js — бесшовный цикл фоновых видео (без рывка на склейке).
   Два экземпляра одного клипа смещены на полдлины. Верхний (role=a) плавно
   гаснет ровно в точке своей склейки конец→начало, открывая нижний (role=b),
   который в этот момент в середине клипа. Нижний cut прикрыт непрозрачным
   верхним. Рывок не виден никогда. Только десктоп (на мобилке видео скрыто). */
(function () {
  'use strict';
  if ('ontouchstart' in window || window.innerWidth < 900) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function setup(wrap) {
    var a = wrap.querySelector('[data-role="a"]');
    var b = wrap.querySelector('[data-role="b"]');
    if (!a || !b) return;

    function start() {
      var dur = a.duration;
      if (!dur || !isFinite(dur) || dur < 0.5) { setTimeout(start, 200); return; }
      var pa = a.play(); if (pa && pa.catch) pa.catch(function () {});
      // Нижний стартует со сдвигом в полклипа БЕЗ seek (надёжнее currentTime):
      // просто запускаем его на dur/2 позже — так его склейка никогда не совпадёт с верхней.
      setTimeout(function () { var pb = b.play(); if (pb && pb.catch) pb.catch(function () {}); }, (dur / 2) * 1000);
      var FADE = Math.min(0.9, dur * 0.16); // длительность растворения у склейки

      (function tick() {
        if (document.hidden) { requestAnimationFrame(tick); return; }
        var t = a.currentTime % dur;
        var edge = Math.min(t, dur - t);   // расстояние до ближайшей склейки верхнего
        a.style.opacity = edge < FADE ? (edge / FADE).toFixed(3) : '1';
        requestAnimationFrame(tick);
      })();
    }

    if (a.readyState >= 1) start();
    else a.addEventListener('loadedmetadata', start);
  }

  function init() { document.querySelectorAll('.bgloop').forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
