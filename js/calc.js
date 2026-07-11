/* calc.js — калькулятор потерь (#mirror). Вынесен из niche-switcher.js
   (ниши с главной убраны). Работает автономно, кормит воронку через #calcCta. */
(function () {
  'use strict';
  var calc = document.querySelector('.mirror');
  if (!calc) return;

  // разделитель тысяч — узкий неразрывный пробел (U+202F), ровные группы «135 000»
  function fmtLoss(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, String.fromCharCode(0x202f)); }

  var state = { clients: 0, check: 0 };
  var lossNumEl = calc.querySelector('.mirror__num');
  var resultBox = calc.querySelector('.mirror__result');
  var ctaEl = calc.querySelector('.mirror__cta');

  function animateLoss(to) {
    if (!lossNumEl) return;
    var from = parseInt((lossNumEl.textContent || '0').replace(/\D/g, ''), 10) || 0;
    var t0 = performance.now(), dur = 950;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      lossNumEl.textContent = fmtLoss(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  function recalc() {
    if (state.clients && state.check) {
      var loss = state.clients * state.check * 0.18; // ~18% теряется без системы
      if (resultBox) resultBox.classList.add('is-open');
      animateLoss(loss);
      if (ctaEl) ctaEl.textContent = 'Вернуть эти ' + fmtLoss(loss) + ' ₽/мес →';
    }
  }

  Array.prototype.slice.call(calc.querySelectorAll('.mirror__opts')).forEach(function (grp) {
    Array.prototype.slice.call(grp.querySelectorAll('button')).forEach(function (b) {
      b.addEventListener('click', function () {
        Array.prototype.slice.call(grp.querySelectorAll('button')).forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        state[grp.dataset.grp] = parseInt(b.dataset.v, 10);
        recalc();
      });
    });
  });

  // дефолт-пример: 300 клиентов × ₽2 500 — чтобы зона результата не пустовала нулём
  var cBtn = calc.querySelector('.mirror__opts[data-grp="clients"] button[data-v="300"]');
  var kBtn = calc.querySelector('.mirror__opts[data-grp="check"] button[data-v="2500"]');
  if (cBtn && kBtn) {
    cBtn.classList.add('is-active'); kBtn.classList.add('is-active');
    state.clients = 300; state.check = 2500; recalc();
  }
})();
