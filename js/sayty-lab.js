/* sayty-lab.js — превью мобильного первого экрана /sayty/lab/.
   Работает ТОЛЬКО когда window.UQ_MOCK_OVERRIDE (ставится на ≤768px в lab/index.html).
   На проде файл не подключён, на десктопе lab флаг false — там штатный движок LUMEN.

   Идея: формат мокапа остаётся (браузер, курсор, «живой» экран — этого нет
   ни у одного из 14 конкурентов), но внутри него вместо выдуманной кофейни
   lumen-coffee.ru показываются реальные сайты клиентов: курсор наводится на
   настоящую кнопку настоящего сайта, «кликает» — и браузер «переходит» на
   следующую работу. Кадр кликабельный: тап открывает живой сайт. */
(function () {
  'use strict';

  /* Флаг считается один раз при загрузке. Если ширина потом переходит границу
     768px (поворот телефона, изменение окна), CSS переключается, а движок — нет:
     в мокапе остаётся выдуманный LUMEN, а подпись под ним уже от реального кейса.
     Проще всего перечитать страницу — это превью, лишний reload не жалко. */
  if (window.matchMedia) {
    var mq = window.matchMedia('(max-width:768px)');
    var onChange = function () { location.reload(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  if (!window.UQ_MOCK_OVERRIDE) return;

  var view = document.querySelector('.sy-browser__view');
  var urlEl = document.getElementById('syUrl');
  var bar = document.querySelector('.sy-browser__bar');
  var cursor = document.getElementById('syCursor');
  var site = document.getElementById('sySite');
  if (!view || !urlEl) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* cta — координаты главной кнопки НА САМОМ скриншоте, в % от кадра.
     Сняты с изображений: Немеция — «Запись на сервис» в шапке, Гранат —
     «Забронировать», IDTuning — телефон в шапке (иной CTA в кадре нет),
     MILLA — «Рассчитать проект и получить презентацию» по центру. */
  var CASES = [
    { n: 'Немеция',  d: 'Автокомплекс, Омск',        url: 'немеция.рф',
      href: 'https://xn--e1aajod1d6c.xn--p1ai/',
      img: '/keysy/cases/case-nemecia-1024.webp?v=20260731a',  w: 1024, h: 581, cta: [81.6, 10.7] },
    { n: 'Гранат',   d: 'Ресторан, Воронеж',         url: 'granat.me',
      href: 'https://granat.me',
      img: '/keysy/cases/case-granat-1024.webp?v=20260802a',   w: 1024, h: 554, cta: [93, 5.5] },
    { n: 'IDTuning', d: 'Тюнинг-ателье, Москва',     url: 'idtuning.ru',
      href: 'https://idtuning.ru',
      img: '/keysy/cases/case-idtuning-1024.webp?v=20260731a', w: 1024, h: 580, cta: [64, 4.5] },
    { n: 'MILLA',    d: 'Дизайн интерьеров, Самара', url: 'milladesign.ru',
      href: 'https://milladesign.ru',
      img: '/keysy/cases/case-milla-1024.webp?v=20260731a',    w: 1024, h: 583, cta: [50, 78] }
  ];

  /* ── слой с реальным сайтом поверх выключенного DOM-мокапа ── */
  if (site) site.style.display = 'none';

  var shot = document.createElement('a');
  shot.className = 'lab-shot';
  shot.target = '_blank';
  shot.rel = 'noopener noreferrer';
  shot.href = CASES[0].href;
  shot.setAttribute('aria-label', 'Открыть сайт ' + CASES[0].url);

  var imgs = CASES.map(function (c, i) {
    var im = document.createElement('img');
    im.width = c.w; im.height = c.h;
    im.alt = 'Сайт ' + c.n + ' — ' + c.d;
    im.decoding = 'async';
    if (i === 0) { im.src = c.img; im.setAttribute('fetchpriority', 'high'); }
    shot.appendChild(im);
    return im;
  });

  var live = document.createElement('span');
  live.className = 'lab-live';
  live.innerHTML = '<i></i>живой сайт';
  shot.appendChild(live);

  view.insertBefore(shot, view.firstChild);

  var prog = document.createElement('span');
  prog.className = 'lab-prog';
  if (bar) bar.appendChild(prog);

  var capName = document.getElementById('labCapName');
  var capDesc = document.getElementById('labCapDesc');
  var capLink = document.getElementById('labCapLink');

  /* точка кнопки в координатах окна браузера — с поправкой на object-fit:cover.
     Кадры разной высоты (554…583), без поправки курсор уезжает мимо. */
  function btnPoint(c) {
    var vw = view.clientWidth, vh = view.clientHeight;
    var s = Math.max(vw / c.w, vh / c.h);
    var dw = c.w * s, dh = c.h * s;
    return { x: (vw - dw) / 2 + dw * c.cta[0] / 100, y: dh * c.cta[1] / 100 };
  }

  function putCursor(x, y, animate) {
    if (!cursor) return;
    if (!animate) cursor.style.transition = 'none';
    cursor.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    if (!animate) {
      // форсим reflow, иначе следующий кадр съест мгновенную установку вместе с анимацией
      void cursor.offsetWidth;
      cursor.style.transition = 'transform 1.05s cubic-bezier(.4,0,.2,1)';
    }
  }

  var idx = -1, timers = [];
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function show(i) {
    clearTimers();
    var c = CASES[i];
    var prev = idx;
    idx = i;

    if (!imgs[i].src) imgs[i].src = c.img;
    imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });

    urlEl.textContent = c.url;
    shot.href = c.href;
    shot.setAttribute('aria-label', 'Открыть сайт ' + c.url);
    if (capName) capName.textContent = c.n;
    if (capDesc) capDesc.textContent = c.d;
    if (capLink) capLink.href = c.href;

    if (prev !== -1 && prog) {
      prog.classList.remove('is-run');
      void prog.offsetWidth;
      prog.classList.add('is-run');
    }

    if (reduce || !cursor) return;

    // курсор мгновенно уходит в стартовую точку, потом ведёт к кнопке и «жмёт»
    var vw = view.clientWidth, vh = view.clientHeight;
    putCursor(vw * 0.24, vh * 0.78, false);
    later(function () {
      var p = btnPoint(c);
      putCursor(p.x, p.y, true);
    }, 700);
    later(function () {
      cursor.classList.add('click');
      later(function () { cursor.classList.remove('click'); }, 400);
    }, 2150);
    // следующий кадр подгружаем заранее, чтобы переход не мигал белым
    later(function () {
      var nx = (i + 1) % CASES.length;
      if (!imgs[nx].src) imgs[nx].src = CASES[nx].img;
    }, 2600);
  }

  /* Цикл живёт только пока вкладку видно. В скрытой вкладке браузер замораживает
     CSS-переходы: кадр застревает на opacity 0, и при возврате человек видит
     чёрный прямоугольник вместо сайта. Заодно не жжём батарею в фоне. */
  var loop = null;
  function startLoop() {
    if (loop || reduce) return;
    loop = setInterval(function () { show((idx + 1) % CASES.length); }, 5200);
  }
  function stopLoop() { clearInterval(loop); loop = null; clearTimers(); }

  function start() {
    show(0);
    startLoop();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stopLoop(); return; }
      show(idx < 0 ? 0 : idx);   // перерисовываем текущий кадр: переход мог застыть
      startLoop();
    });
  }

  if (imgs[0].complete) start();
  else { imgs[0].addEventListener('load', start, { once: true }); imgs[0].addEventListener('error', start, { once: true }); }

  window.addEventListener('resize', function () {
    if (reduce || !cursor || idx < 0) return;
    var p = btnPoint(CASES[idx]);
    putCursor(p.x, p.y, true);
  });

  /* ── cookie: на проде плашка 273px и закрывает единственную кнопку.
       Габариты режет CSS, здесь укорачиваем сам текст. Кнопки и логика
       согласия (Метрика всегда, Вебвизор только по «Принять») не трогаются. ── */
  var tries = 0;
  (function shrinkCookie() {
    var t = document.querySelector('.uq-cookie__text');
    if (!t) { if (++tries < 20) setTimeout(shrinkCookie, 250); return; }
    t.innerHTML = 'Собираем обезличенную статистику посещений, чтобы улучшать сайт. '
      + 'Подробнее — в <a href="/politika-konfidencialnosti/">политике конфиденциальности</a>.';
  })();
})();
