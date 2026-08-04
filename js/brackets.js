/* brackets.js — визир-скобки на акцентном слове заголовка.

   Скобки задавались в em от строчного бокса, и это не работает: чернила
   каждого слова лежат по-своему. У «без вас» нет заглавных и хвостов, у
   «можно открыть» есть descender у «р» — при одних и тех же .35em/-.21em
   разброс доходил до 20px, скобка то висела в воздухе, то резала букву.

   Здесь позиции считаются по фактическим чернилам: actualBoundingBox из
   canvas TextMetrics + базовая линия, снятая нулевым inline-block пробником.
   Пересчёт после загрузки шрифта и на resize — иначе значения снимутся с
   подменного шрифта и уедут, когда подгрузится Unbounded. */
(function () {
  'use strict';

  var SEL = '.section-title em, .hero__title em, .sy-h2 em, .sy-hero__h1 em';
  var GAP = 0.07;                 // зазор до чернил, в долях кегля
  var ctx = null;

  function measure(el) {
    var cs = getComputedStyle(el);
    var fs = parseFloat(cs.fontSize);
    if (!fs) return null;

    if (!ctx) ctx = document.createElement('canvas').getContext('2d');
    ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
    var m = ctx.measureText((el.textContent || '').trim());
    if (!m || typeof m.actualBoundingBoxAscent !== 'number') return null;

    // базовая линия: низ инлайн-блока нулевой высоты, выровненного по baseline
    var probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;overflow:hidden;vertical-align:baseline';
    el.appendChild(probe);
    var base = probe.getBoundingClientRect().bottom;
    probe.remove();

    var r = el.getBoundingClientRect();
    if (!r.height) return null;

    var gap = fs * GAP;
    return {
      top: (base - m.actualBoundingBoxAscent) - r.top - gap,
      bottom: r.bottom - (base + m.actualBoundingBoxDescent) - gap
    };
  }

  function fit() {
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (!el.offsetWidth) continue;          // скрыт на этой ширине
      var v = measure(el);
      if (!v) continue;
      el.style.setProperty('--brk-top', Math.round(v.top) + 'px');
      el.style.setProperty('--brk-bottom', Math.round(v.bottom) + 'px');
    }
  }

  function schedule() {
    clearTimeout(schedule._t);
    schedule._t = setTimeout(fit, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fit);
  else fit();

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
})();
