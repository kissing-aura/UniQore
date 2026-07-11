/* cookie.js — ненавязчивое уведомление о cookie в стиле сайта.
   Самодостаточно: инжектит свои стили + разметку, помнит выбор в localStorage.
   Информирующее уведомление (Метрика/GA4) со ссылкой на политику. */
(function () {
  'use strict';
  var KEY = 'uq_cookie_v1';
  try { if (localStorage.getItem(KEY)) return; } catch (e) { /* приватный режим — просто покажем */ }

  var POLICY = '/politika-konfidencialnosti/';

  var css = ''
    + '.uq-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;'
    + 'max-width:520px;margin:0 auto;background:rgba(18,24,38,.92);'
    + 'backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);'
    + 'border:1px solid #2A3448;border-radius:16px;padding:18px 20px;'
    + 'box-shadow:0 18px 50px rgba(0,0,0,.45);'
    + 'font-family:Inter,system-ui,sans-serif;color:#fff;'
    + 'transform:translateY(140%);opacity:0;transition:transform .5s cubic-bezier(.25,1,.5,1),opacity .5s ease}'
    + '.uq-cookie.is-in{transform:translateY(0);opacity:1}'
    + '.uq-cookie__text{font-size:13.5px;line-height:1.55;color:#c7ccd6;margin:0 0 14px}'
    + '.uq-cookie__text a{color:#CDFF4F;text-decoration:none;border-bottom:1px solid rgba(205,255,79,.35)}'
    + '.uq-cookie__row{display:flex;gap:10px;flex-wrap:wrap}'
    + '.uq-cookie__btn{flex:1 1 auto;cursor:pointer;border:none;border-radius:10px;'
    + 'padding:11px 16px;font:600 13px/1 Inter,sans-serif;transition:.2s ease}'
    + '.uq-cookie__btn--main{background:#CDFF4F;color:#0A0E1A}'
    + '.uq-cookie__btn--main:hover{background:#d8ff6e}'
    + '.uq-cookie__btn--ghost{background:transparent;color:#c7ccd6;border:1px solid #2A3448}'
    + '.uq-cookie__btn--ghost:hover{border-color:#3a4560;color:#fff}'
    + '@media(max-width:480px){.uq-cookie{left:10px;right:10px;bottom:10px;padding:16px}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var box = document.createElement('div');
  box.className = 'uq-cookie';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Уведомление о cookie');
  box.innerHTML = ''
    + '<p class="uq-cookie__text">Мы используем cookie и системы аналитики, чтобы сайт работал '
    + 'корректно и становился удобнее. Подробнее — в '
    + '<a href="' + POLICY + '">политике конфиденциальности</a>.</p>'
    + '<div class="uq-cookie__row">'
    + '<button class="uq-cookie__btn uq-cookie__btn--main" data-uq="accept">Принять</button>'
    + '<button class="uq-cookie__btn uq-cookie__btn--ghost" data-uq="essential">Только необходимые</button>'
    + '</div>';

  function mount() {
    document.body.appendChild(box);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { box.classList.add('is-in'); });
    });
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  function close(choice) {
    try { localStorage.setItem(KEY, choice); } catch (e) {}
    box.classList.remove('is-in');
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 550);
  }
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-uq]');
    if (!b) return;
    close(b.getAttribute('data-uq'));
  });
})();
