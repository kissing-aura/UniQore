/* text-fx.js — «рассыпающийся» заголовок: буквы влетают из разброса и собираются.
   Работает на любом элементе с классом .fx-scatter. Ванильно, без зависимостей.
   Уважает prefers-reduced-motion. Запускается при появлении элемента во вьюпорте. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rand(a, b) { return a + (b - a) * Math.random(); }

  // Разбиваем на буквы-спаны, но каждое слово оборачиваем в nowrap-обёртку,
  // чтобы строка НЕ рвалась посреди слова. Сохраняем вложенные теги (em, br).
  function splitChars(root) {
    var chars = [];
    Array.prototype.slice.call(root.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (tok) {
          if (tok === '') return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          var word = document.createElement('span');
          word.className = 'fx-word';
          word.style.display = 'inline-block';
          word.style.whiteSpace = 'nowrap';
          tok.split('').forEach(function (ch) {
            var s = document.createElement('span');
            s.className = 'fx-char';
            s.textContent = ch;
            word.appendChild(s);
            chars.push(s);
          });
          frag.appendChild(word);
        });
        root.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        chars = chars.concat(splitChars(n));
      }
    });
    return chars;
  }

  function animate(el) {
    var chars = splitChars(el);
    el.classList.add('fx-split');
    if (reduce || !chars.length) return;
    chars.forEach(function (c) {
      c.style.display = 'inline-block';
      c.style.willChange = 'transform, opacity';
      c.style.opacity = '0';
      c.style.transform = 'translate(' + rand(-140, 140).toFixed(0) + 'px,' + rand(-90, 90).toFixed(0) + 'px) rotate(' + rand(-30, 30).toFixed(0) + 'deg) scale(.7)';
      c.style.transition = 'transform .65s cubic-bezier(.16,1,.3,1), opacity .45s ease';
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      chars.forEach(function (c, i) {
        var d = i * 9 + rand(0, 70);
        setTimeout(function () { c.style.transform = 'none'; c.style.opacity = '1'; }, d);
      });
    }); });
    // FAILSAFE: через 2.2с ПРИНУДИТЕЛЬНО собрать все буквы в читаемое финальное
    // состояние — что бы ни прервало per-char таймеры (медленное устройство,
    // уход из вьюпорта, сбой). Заголовок НИКОГДА не застрянет нечитаемым.
    setTimeout(function () {
      chars.forEach(function (c) {
        c.style.transform = 'none'; c.style.opacity = '1';
        c.style.willChange = 'auto'; c.style.transition = '';
      });
    }, 1300);
  }

  function init() {
    var els = document.querySelectorAll('.fx-scatter');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
