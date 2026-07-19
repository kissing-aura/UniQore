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

    // 4) scroll-lock тела + синк aria бургера + прятать плавашку, пока меню открыто
    var mo = new MutationObserver(function () {
      var open = menu.classList.contains('open');
      document.body.style.overflow = open ? 'hidden' : '';
      var b = document.getElementById('burger');
      if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
      var fc = document.getElementById('uq-float-cta');
      if (fc) fc.style.display = open ? 'none' : '';
    });
    mo.observe(menu, { attributes: true, attributeFilter: ['class'] });
  }

  /* aria для бургера (скринридер должен слышать open/closed) + плавающая
     кнопка-заявка на мобиле — постоянного CTA на телефоне не было (2026-07-17). */
  function initA11yAndCTA() {
    var burger = document.getElementById('burger');
    if (burger && !burger.hasAttribute('aria-expanded')) {
      burger.setAttribute('aria-expanded', 'false');
      if (!burger.getAttribute('aria-label')) burger.setAttribute('aria-label', 'Открыть меню');
    }
    // Не вставляем плавашку, если у страницы уже есть свой липкий нижний CTA
    // (например прайс-бар .sy-sticky на /sayty/) — иначе две fixed-кнопки внизу
    // наезжают друг на друга (слой на слой). Один постоянный CTA на экран.
    var hasOwnSticky = document.querySelector('.sy-sticky');
    if (!hasOwnSticky && !document.getElementById('uq-float-cta')) {
      var target = (document.querySelector('#contact') && '#contact') ||
                   (document.querySelector('#zayavka') && '#zayavka') ||
                   'https://t.me/UniqoreManager';
      var a = document.createElement('a');
      a.id = 'uq-float-cta';
      a.href = target;
      if (target.charAt(0) !== '#') { a.target = '_blank'; a.rel = 'noopener'; }
      a.setAttribute('aria-label', 'Оставить заявку');
      a.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Обсудить</span>';
      document.body.appendChild(a);
    }
  }

  function boot() { enhanceMobileMenu(); initA11yAndCTA(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
