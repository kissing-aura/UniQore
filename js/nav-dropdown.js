/* nav-dropdown.js — открытие дропдауна «Решения» по клику/тачу
   (на десктопе основной способ — hover через CSS; клик нужен для тач/клавиатуры). */
(function () {
  'use strict';
  var items = document.querySelectorAll('.nav__item--drop');
  items.forEach(function (item) {
    var toggle = item.querySelector('.nav__drop-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = item.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav__item--drop.is-open').forEach(function (item) {
      if (!item.contains(e.target)) {
        item.classList.remove('is-open');
        var t = item.querySelector('.nav__drop-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav__item--drop.is-open').forEach(function (item) {
        item.classList.remove('is-open');
        var t = item.querySelector('.nav__drop-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });
})();
