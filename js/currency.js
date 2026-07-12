/* Переключатель валют $ / ₽ / Br. Курс приблизительный (ЦБ РФ / НБ РБ, июль 2026) —
   фиксируем на дату оплаты в договоре, тут только ориентир для холодного трафика. */
(function () {
  var RATES = { USD: 1, RUB: 78, BYN: 2.87 };
  var ROUND = { USD: 1, RUB: 100, BYN: 10 };
  var SYMBOL = { USD: '$', RUB: '₽', BYN: 'Br' };
  var STORE_KEY = 'uq_currency';

  function formatNum(n) {
    return n.toLocaleString('ru-RU');
  }

  function render(usd, cur) {
    if (cur === 'USD') return '$' + formatNum(usd);
    var val = usd * RATES[cur];
    var r = ROUND[cur];
    val = Math.round(val / r) * r;
    return formatNum(val) + ' ' + SYMBOL[cur];
  }

  function apply(cur) {
    if (!RATES[cur]) cur = 'USD';
    document.querySelectorAll('[data-usd]').forEach(function (el) {
      var usd = parseFloat(el.getAttribute('data-usd'));
      if (isNaN(usd)) return;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      el.textContent = prefix + render(usd, cur) + suffix;
    });
    document.querySelectorAll('.cur-switch__btn').forEach(function (b) {
      var on = b.getAttribute('data-cur') === cur;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(STORE_KEY, cur); } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.cur-switch__btn');
    if (!btn) return;
    apply(btn.getAttribute('data-cur'));
  });

  // Валюта по умолчанию — рубли (многие в РФ/РБ не знают курс доллара).
  // Возвращающийся посетитель сохраняет свой выбор из localStorage.
  function boot() {
    var saved = 'RUB';
    try { saved = localStorage.getItem(STORE_KEY) || 'RUB'; } catch (e) {}
    apply(saved);
  }
  // Скрипт с defer — DOM уже разобран; применяем сразу, чтобы не мигало $→₽.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
