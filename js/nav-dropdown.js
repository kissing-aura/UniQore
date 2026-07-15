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

  /* ── Мобильное меню: аккордеон ниш + sticky-CTA + scroll-lock (2026-07-16) ──
     Работает на ВСЕХ страницах (nav-dropdown.js подключён везде), обогащает
     существующую разметку .mobile-menu без правки HTML на 50 файлах. */
  function enhanceMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    if (!menu || menu.dataset.enhanced) return;
    menu.dataset.enhanced = '1';
    var ul = menu.querySelector('ul');
    if (!ul) return;

    // 1) CTA «Обсудить проект» → закреплённый футер
    var ctaLink = ul.querySelector('a.btn--accent, a.btn');
    if (ctaLink) {
      var ctaLi = ctaLink.closest('li');
      var footer = document.createElement('div');
      footer.className = 'mobile-menu__cta';
      footer.appendChild(ctaLink);
      menu.appendChild(footer);
      if (ctaLi) ctaLi.remove();
    }

    // 2) «Решения» → аккордеон, 16 ниш прячутся под тап
    var label = ul.querySelector('.mobile-menu__label');
    if (label) {
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mm-acc-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = (label.textContent || 'Решения').trim();

      var panel = document.createElement('div');
      panel.className = 'mm-acc-panel';
      var list = document.createElement('div');
      list.className = 'mm-acc-list';
      panel.appendChild(list);

      // собрать идущие следом ниши (href содержит crm-)
      var node = label.nextElementSibling;
      while (node) {
        var a = node.querySelector ? node.querySelector('a') : null;
        var href = a ? (a.getAttribute('href') || '') : '';
        if (a && href.indexOf('crm-') !== -1) {
          var next = node.nextElementSibling;
          list.appendChild(a);
          node.remove();
          node = next;
        } else break;
      }

      label.classList.remove('mobile-menu__label');
      label.style.padding = '0';
      label.style.listStyle = 'none';
      label.textContent = '';
      label.appendChild(toggle);
      label.appendChild(panel);

      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        var open = panel.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // 3) любая настоящая ссылка закрывает меню (навигация или якорь)
    menu.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a');
      if (!link) return;
      menu.classList.remove('open');
      var b = document.getElementById('burger');
      if (b) b.classList.remove('open');
    });

    // 4) scroll-lock тела, пока меню открыто
    var mo = new MutationObserver(function () {
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });
    mo.observe(menu, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceMobileMenu);
  } else {
    enhanceMobileMenu();
  }
})();
