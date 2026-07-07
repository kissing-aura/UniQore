/* niche-switcher.js — интерактивный выбор ниши в hero-мокапе.
   Меняет смысловую часть (URL, подписи метрик, имена в ленте, уведомления)
   с плавным fade. Числа/график анимирует main.js — их НЕ трогаем. */
(function () {
  'use strict';

  // ── Данные ниш ───────────────────────────────────────────────
  // labels: подписи 3 метрик (выручка / середина / правая)
  // rows: 3 строки ленты [имя, сумма, бейдж, тип(wip|done), точка(y|g), hot]
  // toasts: уведомления (их крутит main.js, читая window.__nicheToasts)
  var NICHES = {
    restaurant: {
      chip: 'Ресторан', url: 'crm.vkusno.pro',
      labels: ['выручка / мес', 'заказов', 'средний чек'],
      rows: [
        ['Михаил С. · Стол на 6', '$120', 'Бронь', 'wip', 'y', false],
        ['Анна Р. · Банкет 20 чел', '$1 400', 'КП', 'wip', 'g', true],
        ['Доставка · Центр', '$54', 'Оплата ✓', 'done', 'g', false],
      ],
      toasts: ['Новая бронь · стол 4', 'Заказ доставки · +$54', 'Банкет на вечер · 20 гостей', 'Отзыв 5★ · Анна Р.'],
      result: ['Ни одной потерянной брони', '−2 часа на отчёты каждый день'],
    },
    barber: {
      chip: 'Барбершоп', url: 'crm.barber.pro',
      labels: ['выручка / мес', 'записей', 'заполнение'],
      rows: [
        ['Артём · Стрижка + борода', '$28', 'Запись', 'wip', 'y', false],
        ['Игорь · Камуфляж седины', '$35', 'Сегодня', 'wip', 'g', true],
        ['Олег · Тотал + уход', '$45', 'Оплата ✓', 'done', 'g', false],
      ],
      toasts: ['Новая запись · 18:30', 'Клиент вернулся · Артём', 'Окно освободилось · 16:00', 'Напоминание ушло · 3 клиента'],
      result: ['Запись больше не теряется', '+18 клиентов в месяц, −40 мин в день'],
    },
    rent: {
      chip: 'Аренда', url: 'crm.arenda.pro',
      labels: ['выручка / мес', 'броней', 'загрузка'],
      rows: [
        ['Гость · кв. 12 · 2 ночи', '$140', 'Заезд', 'wip', 'y', false],
        ['Семья · кв. 4 · 5 ночей', '$390', 'Подтв.', 'wip', 'g', true],
        ['Бизнес · кв. 9 · 1 ночь', '$95', 'Оплата ✓', 'done', 'g', false],
      ],
      toasts: ['Новая бронь · кв. 12', 'Заезд сегодня · 15:00', 'Залог получен · +$200', 'Продление · +3 ночи'],
      result: ['Ни одной пропущенной заявки', 'Залоги и брони под контролем 24/7'],
    },
    clinic: {
      chip: 'Клиника', url: 'crm.klinika.pro',
      labels: ['выручка / мес', 'пациентов', 'повторных'],
      rows: [
        ['Пациент · Терапия', '$80', 'Запись', 'wip', 'y', false],
        ['Пациент · Имплант', '$1 200', 'План', 'wip', 'g', true],
        ['Пациент · Гигиена', '$60', 'Оплата ✓', 'done', 'g', false],
      ],
      toasts: ['Новая запись · терапевт', 'Пациент подтвердил · 10:00', 'Напоминание о приёме · 5', 'План лечения готов'],
      result: ['Пациент не забыт', '−3 часа администратора каждый день'],
    },
  };
  var ORDER = ['restaurant', 'barber', 'rent', 'clinic'];

  function $(s, r) { return (r || document).querySelector(s); }

  var mockup = $('.ui-mockup');
  var frameWrap = $('.hero__frame');
  if (!mockup || !frameWrap) return;

  var urlEl = $('.hero__frame-url');
  var labelEls = Array.prototype.slice.call(mockup.querySelectorAll('.ui-mockup__kpi-label'));
  var rowEls = Array.prototype.slice.call(mockup.querySelectorAll('.ui-mockup__row'));

  // ── Чипсы под мокапом ─────────────────────────────────────────
  var bar = document.createElement('div');
  bar.className = 'niche-switch';
  bar.setAttribute('aria-label', 'Выберите нишу');
  var hint = document.createElement('span');
  hint.className = 'niche-switch__hint';
  hint.textContent = 'Ваша ниша:';
  bar.appendChild(hint);
  ORDER.forEach(function (key) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'niche-chip';
    b.dataset.niche = key;
    b.textContent = NICHES[key].chip;
    bar.appendChild(b);
  });
  // Строка-результат под мокапом — конкретная выгода под нишу
  var resultEl = document.createElement('div');
  resultEl.className = 'niche-result';
  resultEl.innerHTML =
    '<span class="niche-result__mark">✓</span>' +
    '<span class="niche-result__main"></span>' +
    '<span class="niche-result__sub"></span>';
  frameWrap.insertAdjacentElement('afterend', resultEl);
  resultEl.insertAdjacentElement('afterend', bar);
  var resMain = resultEl.querySelector('.niche-result__main');
  var resSub = resultEl.querySelector('.niche-result__sub');
  var chips = Array.prototype.slice.call(bar.querySelectorAll('.niche-chip'));

  // ── «Зеркало бизнеса»: 2 тапа → его потери в деньгах ──────────
  var calc = document.createElement('div');
  calc.className = 'mirror';
  calc.innerHTML =
    '<div class="mirror__q">Сколько у тебя клиентов в месяц?</div>' +
    '<div class="mirror__opts" data-grp="clients">' +
      '<button type="button" data-v="100">~100</button>' +
      '<button type="button" data-v="300">~300</button>' +
      '<button type="button" data-v="600">~600</button>' +
      '<button type="button" data-v="1200">1000+</button>' +
    '</div>' +
    '<div class="mirror__q">Средний чек?</div>' +
    '<div class="mirror__opts" data-grp="check">' +
      '<button type="button" data-v="1000">₽1 000</button>' +
      '<button type="button" data-v="2500">₽2 500</button>' +
      '<button type="button" data-v="5000">₽5 000</button>' +
      '<button type="button" data-v="12000">₽10 000+</button>' +
    '</div>' +
    '<div class="mirror__result">' +
      '<div class="mirror__loss">Ты теряешь ~<span class="mirror__num">0</span> ₽/мес</div>' +
      '<div class="mirror__sub">на потерянных заявках и неответах. Мы это ловим — клиент не уходит.</div>' +
      '<a href="#contact" class="btn btn--accent btn--lg mirror__cta">Забрать свою систему →</a>' +
    '</div>';
  bar.insertAdjacentElement('afterend', calc);

  var calcState = { clients: 0, check: 0 };
  var lossNumEl = calc.querySelector('.mirror__num');
  var resultBox = calc.querySelector('.mirror__result');

  function animateLoss(to) {
    var from = parseInt((lossNumEl.textContent || '0').replace(/\D/g, ''), 10) || 0;
    var t0 = performance.now(), dur = 950;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      lossNumEl.textContent = Math.round(from + (to - from) * e).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  function recalc() {
    if (calcState.clients && calcState.check) {
      var loss = calcState.clients * calcState.check * 0.18; // ~18% теряется без системы
      resultBox.classList.add('is-open'); // плавное раскрытие вместо resultBox.hidden = false
      animateLoss(loss);
    }
  }
  Array.prototype.slice.call(calc.querySelectorAll('.mirror__opts')).forEach(function (grp) {
    Array.prototype.slice.call(grp.querySelectorAll('button')).forEach(function (b) {
      b.addEventListener('click', function () {
        Array.prototype.slice.call(grp.querySelectorAll('button')).forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        calcState[grp.dataset.grp] = parseInt(b.dataset.v, 10);
        recalc();
      });
    });
  });

  // ── Применение ниши с плавным fade ────────────────────────────
  function fadeSwap(el, fn) {
    if (!el) return;
    el.style.transition = 'opacity .2s ease';
    el.style.opacity = '0';
    setTimeout(function () { fn(); el.style.opacity = ''; }, 200);
  }

  function apply(key) {
    var n = NICHES[key];
    if (!n) return;
    if (urlEl) fadeSwap(urlEl, function () { urlEl.textContent = n.url; });
    labelEls.forEach(function (el, i) {
      if (n.labels[i] != null) fadeSwap(el, function () { el.textContent = n.labels[i]; });
    });
    rowEls.forEach(function (row, i) {
      var d = n.rows[i]; if (!d) return;
      var nameEl = $('.ui-mockup__row-name', row);
      var valEl = $('.ui-mockup__row-val', row);
      var badgeEl = $('.ui-badge', row);
      var dotEl = $('.ui-dot', row);
      var prioEl = $('.ui-mockup__row-priority', row);
      fadeSwap(row, function () {
        if (nameEl) nameEl.textContent = d[0];
        if (valEl) valEl.textContent = d[1];
        if (badgeEl) {
          badgeEl.textContent = d[2];
          badgeEl.className = 'ui-badge ' + (d[3] === 'done' ? 'ui-badge--done' : 'ui-badge--wip');
        }
        if (dotEl) dotEl.className = 'ui-dot ' + (d[4] === 'g' ? 'ui-dot--green' : 'ui-dot--yellow');
        if (prioEl) prioEl.className = 'ui-mockup__row-priority' + (d[5] ? ' ui-mockup__row-priority--hot' : '');
      });
    });
    // строка-результат под мокапом
    if (n.result) {
      fadeSwap(resultEl, function () {
        if (resMain) resMain.textContent = n.result[0];
        if (resSub) resSub.textContent = n.result[1];
      });
    }
    // уведомления — отдаём main.js
    window.__nicheToasts = n.toasts.slice();
    // активный чип
    chips.forEach(function (c) { c.classList.toggle('is-active', c.dataset.niche === key); });
    currentKey = key;
  }

  // ── Состояние + авто-демо ─────────────────────────────────────
  var currentKey = 'restaurant';
  var userTouched = false;
  var demoTimer = null;

  function startDemo() {
    stopDemo();
    demoTimer = setInterval(function () {
      if (userTouched || document.hidden) return;
      var idx = (ORDER.indexOf(currentKey) + 1) % ORDER.length;
      apply(ORDER[idx]);
    }, 6000);
  }
  function stopDemo() { if (demoTimer) { clearInterval(demoTimer); demoTimer = null; } }

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      userTouched = true;
      stopDemo();
      apply(c.dataset.niche);
    });
  });

  // старт: применяем дефолтную нишу (чтобы данные совпадали с активным чипом).
  // АВТО-ДЕМО ОТКЛЮЧЕНО — панель больше не морфит контент каждые 6с сама по себе
  // (палило как «панель плавает / скачет»). Ниши переключаются только кликом по чипсам.
  apply('restaurant');
  // setTimeout(startDemo, 5000);
})();
