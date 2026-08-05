/* scene.js (черновик 2) — движения ровно столько, сколько у эталонов.

   Разведка показала: у Framer и Clay в первом экране движения нет вообще,
   у Raycast весь вход — translateY(20px) за 1s, у Linear внутри мокапа
   амплитуда 4px за 0.4s. Никакого параллакса, наклона и прилетающих
   карточек — это язык шаблонов, а не продуктовых сайтов.

   Что здесь есть:
   1) разделы продукта переключаются сами — статичный скриншот показывает
      одну страницу, а покупают систему целиком;
   2) подсветка строки под курсором, 0.16s;
   3) редкое обновление цифры в шапке, чтобы дашборд не выглядел мёртвым. */
(function () {
  'use strict';

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  var окно   = document.querySelector('[data-app]');
  var адрес  = document.querySelector('[data-url]');
  if (!окно) return;

  /* ── 1. Переключение разделов ───────────────────────────────────────── */

  /* Автопоказ гоняет только три главных раздела: шесть подряд растянули бы
     цикл до сорока секунд, и человек не дождался бы повтора. Остальные три
     открываются кликом — поэтому адреса заданы для всех шести. */
  var РАЗДЕЛЫ = [
    { key: 'dash',  url: 'crm.uniqore.pro/dashboard', держать: 7000 },
    { key: 'deals', url: 'crm.uniqore.pro/deals',     держать: 6000 },
    { key: 'stats', url: 'crm.uniqore.pro/analytics', держать: 6000 }
  ];
  var АДРЕСА = {
    dash: 'crm.uniqore.pro/dashboard', deals: 'crm.uniqore.pro/deals',
    stats: 'crm.uniqore.pro/analytics', clients: 'crm.uniqore.pro/clients',
    tasks: 'crm.uniqore.pro/tasks', setup: 'crm.uniqore.pro/settings'
  };

  var виды    = {};
  var кнопки  = {};
  document.querySelectorAll('.view').forEach(function (v) { виды[v.dataset.view] = v; });
  document.querySelectorAll('.side__i[data-go]').forEach(function (b) {
    кнопки[b.dataset.go] = b;
    b.style.cursor = 'pointer';
    b.addEventListener('click', function () { перейти(b.dataset.go, true); });
  });

  var текущий = 0;
  var таймер  = null;
  var подсветка = null;  /* отложенный переход после hover-подсветки пункта */
  var пауза   = false;   /* курсор внутри окна — человек рассматривает */
  var виден   = true;    /* hero в кадре */
  var ручная  = 0;       /* до какого момента автоцикл молчит после клика */

  function перейти(key, вручную) {
    if (!виды[key]) return;
    /* клик в те 300мс, пока ждёт отложенный автопереход, иначе перебивался
       им же — человек нажал одно, через мгновение открылось другое */
    clearTimeout(подсветка);

    var i = РАЗДЕЛЫ.findIndex(function (р) { return р.key === key; });
    /* раздел вне автоцикла (Клиенты / Задачи / Настройки) не двигает
       счётчик: после паузы показ продолжится с того же места в цикле */
    if (i >= 0) текущий = i;

    for (var k in виды) виды[k].classList.toggle('is-on', k === key);
    for (var b in кнопки) кнопки[b].classList.remove('is-on', 'is-pre');
    if (кнопки[key]) кнопки[key].classList.add('is-on');
    if (адрес && АДРЕСА[key]) адрес.textContent = АДРЕСА[key];

    if (вручную) ручная = Date.now() + 18000;
    расписать();
  }

  /* Перед автопереключением пункт на полсекунды получает hover-состояние —
     кажется, что по нему кто-то наводит курсор и кликает. Без этого смена
     экрана выглядит как подмена картинки, а не как работа человека. */
  function следующий() {
    var i = (текущий + 1) % РАЗДЕЛЫ.length;
    var кн = кнопки[РАЗДЕЛЫ[i].key];
    if (кн) кн.classList.add('is-pre');
    подсветка = setTimeout(function () { перейти(РАЗДЕЛЫ[i].key, false); }, 300);
  }

  function расписать() {
    clearTimeout(таймер);
    if (reduce) return;
    таймер = setTimeout(тик, РАЗДЕЛЫ[текущий].держать);
  }

  function тик() {
    /* скрытая вкладка, курсор в окне, недавний клик или hero за кадром —
       переносим, а не пропускаем: иначе после возврата на вкладку
       прилетает пачка отложенных переключений */
    if (document.hidden || пауза || !виден || Date.now() < ручная) {
      таймер = setTimeout(тик, 1200);
      return;
    }
    следующий();
  }

  окно.addEventListener('pointerenter', function () { пауза = true; });
  окно.addEventListener('pointerleave', function () { пауза = false; });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      виден = entries[0].isIntersecting;
    }, { threshold: 0.15 }).observe(окно);
  }

  расписать();

  /* ── 2. Подсветка строки под курсором ───────────────────────────────── */

  document.querySelectorAll('.tbl tbody tr').forEach(function (tr) {
    tr.addEventListener('pointerenter', function () { tr.classList.add('is-hover'); });
    tr.addEventListener('pointerleave', function () { tr.classList.remove('is-hover'); });
  });

  if (reduce) return;

  /* ── 3. Живая цифра в шапке дашборда ────────────────────────────────── */

  var конв  = document.querySelectorAll('[data-view="dash"] .kpi__v')[2];  /* конверсия — третья карточка */
  var время = document.querySelector('[data-view="dash"] .top__b');
  if (!время) return;

  /* минута прибавляется раз в минуту, а не раз в 9 секунд: иначе за минуту
     просмотра шапка доходила до «8 мин назад», пока строка таблицы всё ещё
     писала «4 мин назад». Потолок 9 — дальше дашборд «обновляется» заново. */
  var мин = 2;
  var часы = setInterval(function () {
    if (document.hidden || !виден) return;
    мин = мин >= 9 ? 1 : мин + 1;
    время.textContent = 'Обновлено ' + мин + ' мин назад';
    if (конв && мин % 3 === 0) {
      конв.textContent = (34 + (Math.random() * 1.2 - .6)).toFixed(1).replace('.', ',') + '%';
      /* перезапуск анимации: без снятия класса второй раз она не проиграет */
      конв.classList.remove('is-fresh');
      void конв.offsetWidth;
      конв.classList.add('is-fresh');
    }
  }, 60000);

  addEventListener('pagehide', function () { clearInterval(часы); clearTimeout(таймер); clearTimeout(подсветка); });
})();
