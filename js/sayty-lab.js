/* sayty-lab.js — превью мобильного первого экрана /sayty/lab/.
   Работает ТОЛЬКО когда window.UQ_MOCK_OVERRIDE (ставится на ≤768px в lab/index.html).
   На проде файл не подключён, на десктопе lab флаг false — там штатный движок LUMEN.

   Идея: формат мокапа остаётся (браузер, курсор, «живой» экран — этого нет
   ни у одного из 14 конкурентов), но внутри него вместо выдуманной кофейни
   показываются реальные сайты клиентов.

   Курсор ведёт себя как рука, а не как таймер: пауза на осмотр → плавный подвод
   к настоящей кнопке настоящего сайта → нажатие с откликом → и ИМЕННО от нажатия
   браузер «переходит» на следующую работу (бежит полоса загрузки, меняется адрес).
   Каждое движение имеет причину, ничего не дёргается само по себе. */
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
  var cursorSvg = document.getElementById('syCursor');
  var site = document.getElementById('sySite');
  if (!view || !urlEl) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* cta — координаты главной кнопки НА САМОМ скриншоте, в % от кадра.
     Сняты с изображений: Немеция — «Запись на сервис» в шапке, Гранат —
     «Забронировать», SINKOV — «Обсудить проект» в hero,
     MILLA — «Рассчитать проект и получить презентацию» по центру. */
  var CASES = [
    { n: 'Немеция',  d: 'Автокомплекс, Омск',        url: 'немеция.рф',
      href: 'https://xn--e1aajod1d6c.xn--p1ai/',
      img: '/keysy/cases/case-nemecia-1024.webp?v=20260731a',  w: 1024, h: 581, cta: [81.6, 10.7] },
    { n: 'Гранат',   d: 'Ресторан, Воронеж',         url: 'granat.me',
      href: 'https://granat.me',
      img: '/keysy/cases/case-granat-1024.webp?v=20260802a',   w: 1024, h: 554, cta: [93, 5.5] },
    { n: 'SINKOV',   d: 'Ландшафтная архитектура, Москва', url: 'sinkoveco.ru',
      href: 'https://sinkoveco.ru',
      img: '/keysy/cases/case-sinkov-1024.webp?v=20260804a',   w: 1024, h: 576, cta: [13, 79.5] },
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

  /* Курсор в обёртке: обёртка ОТВЕЧАЕТ ЗА ПЕРЕМЕЩЕНИЕ (долгий плавный transform),
     сама стрелка — за нажатие (короткий scale). Одним элементом это не сделать:
     transform там один, а движение и клик нужны с разной длительностью. */
  var cur = document.createElement('span');
  cur.className = 'lab-cur';
  if (cursorSvg) { cursorSvg.parentNode.removeChild(cursorSvg); cur.appendChild(cursorSvg); }
  view.appendChild(cur);

  var ripple = document.createElement('span');
  ripple.className = 'lab-ripple';
  view.appendChild(ripple);

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
  /* откуда рука заходит: снизу-сбоку от кнопки, чтобы подвод читался как жест,
     а не как телепорт. Заходим с той стороны, где больше места. */
  function approachPoint(p) {
    var vw = view.clientWidth, vh = view.clientHeight;
    return { x: p.x > vw / 2 ? p.x - vw * 0.3 : p.x + vw * 0.3, y: Math.min(p.y + vh * 0.45, vh - 14) };
  }
  function place(x, y) { cur.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)'; }

  var idx = -1, timers = [], stopped = false;
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function paint(i) {
    var c = CASES[i];
    if (!imgs[i].src) imgs[i].src = c.img;
    imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
    urlEl.textContent = c.url;
    shot.href = c.href;
    shot.setAttribute('aria-label', 'Открыть сайт ' + c.url);
    if (capName) capName.textContent = c.n;
    if (capDesc) capDesc.textContent = c.d;
    if (capLink) capLink.href = c.href;
    // следующий кадр подгружаем заранее — переход не должен мигать пустотой
    var nx = (i + 1) % CASES.length;
    if (!imgs[nx].src) imgs[nx].src = CASES[nx].img;
  }

  /* Один осмысленный проход: смотрим сайт → рука подводит курсор к кнопке →
     нажатие → от нажатия уходим на следующую работу. */
  function cycle(i) {
    if (stopped) return;
    clearTimers();
    idx = i;
    paint(i);

    if (reduce || !cursorSvg) return;      // без анимации просто показываем кадры

    // окно мокапа ещё не сверстано (бывает при первой отрисовке и в свёрнутой
    // вкладке): без размеров точка кнопки считается в минус и курсор уезжает
    if (view.clientWidth < 40 || view.clientHeight < 40) { later(function () { cycle(i); }, 300); return; }

    var p = btnPoint(CASES[i]), a = approachPoint(p);

    cur.classList.remove('is-on', 'press');
    cur.style.transition = 'none';          // появление без «прилёта» через весь экран
    place(a.x, a.y);
    void cur.offsetWidth;
    cur.style.transition = '';

    later(function () { cur.classList.add('is-on'); }, 850);          // рука появилась
    later(function () { place(p.x, p.y); }, 1150);                    // плавный подвод к кнопке
    later(function () {                                               // нажатие + отклик
      cur.classList.add('press');
      ripple.style.transform = 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px)';
      ripple.classList.remove('go'); void ripple.offsetWidth; ripple.classList.add('go');
    }, 2250);
    later(function () { cur.classList.remove('press'); }, 2470);
    later(function () {                                               // страница откликнулась на клик
      prog.classList.remove('is-run'); void prog.offsetWidth; prog.classList.add('is-run');
      cur.classList.remove('is-on');
    }, 2600);
    later(function () { cycle((i + 1) % CASES.length); }, 3350);      // и перешли на следующую работу
  }

  function start() {
    stopped = false;
    cycle(idx < 0 ? 0 : idx);
  }

  if (imgs[0].complete) start();
  else { imgs[0].addEventListener('load', start, { once: true }); imgs[0].addEventListener('error', start, { once: true }); }

  /* В скрытой вкладке браузер замораживает CSS-переходы, но таймеры тикают:
     кадры успевают смениться, а их opacity застывает на полпути — при возврате
     видно два сайта, наложенных друг на друга. Поэтому в фоне цикл стоит, а на
     возврате состояние кадров сбрасывается жёстко, без переходов. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stopped = true; clearTimers(); return; }
    imgs.forEach(function (im, k) { im.style.transition = 'none'; im.style.opacity = (k === idx ? '1' : '0'); });
    void view.offsetWidth;
    imgs.forEach(function (im) { im.style.transition = ''; im.style.opacity = ''; });
    start();
  });

  window.addEventListener('resize', function () {
    if (reduce || idx < 0) return;
    place(btnPoint(CASES[idx]).x, btnPoint(CASES[idx]).y);
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
