/* scene.js (черновик 3) — карусель трёх продуктов + начинка каждого.

   Уровня движения два, и они не спорят между собой:
   1) карусель листает ПРОДУКТЫ (сайт → CRM → реклама), стрелками, точками
      и сама раз в 14 секунд;
   2) внутри активной панели переключаются РАЗДЕЛЫ продукта — но только у
      активной: у соседних всё замирает, иначе в кадре одновременно ползают
      три интерфейса и глазу не за что зацепиться.

   14 секунд, а не 20: за двадцать человек успевает дочитать первый экран и
   уйти, так и не узнав, что продуктов три. */
(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var дека   = document.querySelector('.deck');
  var рельс  = document.querySelector('[data-rail]');
  if (!дека || !рельс) return;

  var панели  = [].slice.call(дека.querySelectorAll('.deck__p'));
  var точки   = [].slice.call(дека.querySelectorAll('.deck__dot'));
  var ПОРЯДОК = панели.map(function (p) { return p.dataset.p; });
  var активная = ПОРЯДОК.indexOf('crm') >= 0 ? ПОРЯДОК.indexOf('crm') : 0;

  var ДЕРЖАТЬ = 14000;
  var таймерД = null, паузаД = false, виденД = true, ручнаяД = 0;

  function сдвинуть() {
    /* Центрируем активную панель в деке: сдвигаем рельс на её позицию и
       возвращаем половину разницы ширин. Считать «на глаз» нельзя — из-за
       подглядывания и зазора панель уезжала влево на десятки пикселей. */
    var p = панели[активная];
    var шаг = p.offsetWidth + parseFloat(getComputedStyle(рельс).gap || 0);
    var центр = (дека.clientWidth - p.offsetWidth) / 2;
    рельс.style.translate = (центр - активная * шаг) + 'px';
  }

  function показать(i, вручную) {
    активная = (i + панели.length) % панели.length;
    панели.forEach(function (p, n) { p.classList.toggle('is-on', n === активная); });
    точки.forEach(function (t) { t.classList.toggle('is-on', t.dataset.dot === ПОРЯДОК[активная]); });
    сдвинуть();
    if (вручную) ручнаяД = Date.now() + 20000;
    расписатьД();
  }

  function расписатьД() {
    clearTimeout(таймерД);
    if (reduce) return;
    таймерД = setTimeout(тикД, ДЕРЖАТЬ);
  }
  function тикД() {
    if (document.hidden || паузаД || !виденД || Date.now() < ручнаяД) {
      таймерД = setTimeout(тикД, 1500);
      return;
    }
    показать(активная + 1, false);
  }

  дека.querySelectorAll('[data-arw]').forEach(function (b) {
    b.addEventListener('click', function () { показать(активная + (+b.dataset.arw), true); });
  });
  точки.forEach(function (t) {
    t.addEventListener('click', function () { показать(ПОРЯДОК.indexOf(t.dataset.dot), true); });
  });

  /* пауза только под мышью: на тач-устройстве pointerleave не приходит и
     показ вставал бы навсегда после первого касания */
  дека.addEventListener('pointerenter', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    паузаД = true;
  });
  дека.addEventListener('pointerleave', function () { паузаД = false; });

  /* свайп по панели — на телефоне это единственный привычный жест */
  var x0 = null;
  рельс.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, {passive:true});
  рельс.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 46) показать(активная + (dx < 0 ? 1 : -1), true);
    x0 = null;
  }, {passive:true});

  addEventListener('resize', сдвинуть);
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (e) { виденД = e[0].isIntersecting; }, {threshold:.12}).observe(дека);
  }

  сдвинуть();
  расписатьД();

  /* ── Начинка каждой панели ─────────────────────────────────────────── */

  панели.forEach(function (панель) {
    var окно  = панель.querySelector('[data-app]');
    var адрес = панель.querySelector('[data-url]');
    if (!окно) return;

    var виды = {}, кнопки = {};
    окно.querySelectorAll('.view').forEach(function (v) { виды[v.dataset.view] = v; });
    окно.querySelectorAll('.side__i[data-go]').forEach(function (b) {
      кнопки[b.dataset.go] = b;
      b.style.cursor = 'pointer';
      b.addEventListener('click', function () { перейти(b.dataset.go, true); });
    });

    var ЦИКЛ = (окно.dataset.panel === 'crm')
      ? [{k:'dash', u:'crm.uniqore.pro/dashboard', t:7000},
         {k:'deals', u:'crm.uniqore.pro/deals', t:6000},
         {k:'stats', u:'crm.uniqore.pro/analytics', t:6000}]
      : [];
    var АДРЕСА = {
      dash:'crm.uniqore.pro/dashboard', deals:'crm.uniqore.pro/deals',
      stats:'crm.uniqore.pro/analytics', clients:'crm.uniqore.pro/clients',
      tasks:'crm.uniqore.pro/tasks', setup:'crm.uniqore.pro/settings',
      site:'uniqore.pro/site/overview', ads:'uniqore.pro/ads/overview'
    };

    var текущий = 0, таймер = null, подсветка = null, пауза = false, ручная = 0, паузаДо = 0;

    function перейти(key, вручную) {
      if (!виды[key]) return;
      clearTimeout(подсветка);
      var i = ЦИКЛ.findIndex(function (р) { return р.k === key; });
      if (i >= 0) текущий = i;
      for (var k in виды) виды[k].classList.toggle('is-on', k === key);
      for (var b in кнопки) кнопки[b].classList.remove('is-on', 'is-pre');
      if (кнопки[key]) кнопки[key].classList.add('is-on');
      if (адрес && АДРЕСА[key]) адрес.textContent = АДРЕСА[key];
      if (вручную) ручная = Date.now() + 18000;
      расписать();
    }

    function следующий() {
      var i = (текущий + 1) % ЦИКЛ.length;
      var кн = кнопки[ЦИКЛ[i].k];
      if (кн) кн.classList.add('is-pre');
      подсветка = setTimeout(function () { перейти(ЦИКЛ[i].k, false); }, 300);
    }
    function расписать() {
      clearTimeout(таймер);
      if (reduce || !ЦИКЛ.length) return;
      таймер = setTimeout(тик, ЦИКЛ[текущий].t);
    }
    function тик() {
      if (пауза && Date.now() > паузаДо) пауза = false;
      /* внутренний цикл идёт только у панели в фокусе */
      var вФокусе = панель.classList.contains('is-on');
      if (document.hidden || пауза || !виденД || !вФокусе || Date.now() < ручная) {
        таймер = setTimeout(тик, 1200);
        return;
      }
      следующий();
    }

    окно.addEventListener('pointerenter', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      пауза = true; паузаДо = Date.now() + 20000;
    });
    окно.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      паузаДо = Date.now() + 20000;
    });
    окно.addEventListener('pointerleave', function () { пауза = false; });

    окно.querySelectorAll('.tbl tbody tr').forEach(function (tr) {
      tr.addEventListener('pointerenter', function () { tr.classList.add('is-hover'); });
      tr.addEventListener('pointerleave', function () { tr.classList.remove('is-hover'); });
    });

    setTimeout(function () { окно.classList.add('is-live'); }, 2000);
    расписать();

    /* живая цифра — только у CRM: там есть, чему обновляться */
    if (reduce || окно.dataset.panel !== 'crm') return;
    function карточка(подпись) {
      var найдено = null;
      окно.querySelectorAll('[data-view="dash"] .kpi').forEach(function (k) {
        var l = k.querySelector('.kpi__l');
        if (l && l.textContent.indexOf(подпись) === 0) найдено = k;
      });
      return найдено;
    }
    var заявкиК = карточка('Заявки'), конвК = карточка('Конверсия');
    var время = окно.querySelector('[data-view="dash"] .top__b');
    if (!время) return;
    var мин = 2, заявок = 53, оплат = 18;
    setInterval(function () {
      if (document.hidden || !виденД || !панель.classList.contains('is-on')) return;
      мин = мин >= 9 ? 1 : мин + 1;
      время.textContent = 'Обновлено ' + мин + ' мин назад';
      if (мин % 3) return;
      заявок += 1;
      if (заявкиК) {
        заявкиК.querySelector('.kpi__v').textContent = заявок;
        заявкиК.querySelector('.kpi__d').textContent = '+' + (заявок - 47) + ' за неделю';
        var v = заявкиК.querySelector('.kpi__v');
        v.classList.remove('is-fresh'); void v.offsetWidth; v.classList.add('is-fresh');
      }
      if (конвК) {
        конвК.querySelector('.kpi__v').textContent = (оплат / заявок * 100).toFixed(1).replace('.', ',') + '%';
        конвК.querySelector('.kpi__d').textContent = '+' + ((оплат / заявок * 100) - 31.9).toFixed(1).replace('.', ',') + ' п.п.';
      }
    }, 60000);
  });
})();
