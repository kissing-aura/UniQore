/* scene.js (черновик 2) — намеренно почти пустой.

   Разведка эталонов показала: у Framer и Clay в первом экране движения нет
   вообще, у Raycast весь вход — translateY(20px) за 1s, у Linear внутри
   мокапа амплитуда 4px за 0.4s, а Stripe возит координаты мыши в шейдер и
   ничего с ними не делает (эффект закомментирован в исходнике).

   Поэтому здесь ровно две вещи: подсветка строки под курсором (как реакция
   живого интерфейса, 0.16s) и редкое обновление данных, чтобы таблица не
   выглядела мёртвым скриншотом. Ни параллакса, ни наклона, ни плавающих
   карточек — это язык шаблонов, а не продуктовых сайтов. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Строка таблицы подсвечивается под курсором — 0.16s, как все состояния
     у Linear. Делаем классом, а не :hover, чтобы подсветку можно было
     показать и программно. */
  var строки = document.querySelectorAll('.tbl tbody tr');
  Array.prototype.forEach.call(строки, function (tr) {
    tr.addEventListener('pointerenter', function () { tr.classList.add('is-hover'); });
    tr.addEventListener('pointerleave', function () { tr.classList.remove('is-hover'); });
  });

  if (reduce) return;

  /* Раз в ~9 секунд одна цифра в шапке меняется — этого достаточно, чтобы
     экран читался живым. Никаких прилетающих карточек: у эталонов ничего
     подобного нет, а «поток событий» в герое читается как демо-ролик. */
  var чек = document.querySelectorAll('.kpi__v')[2];
  var конв = document.querySelectorAll('.kpi__v')[3];
  var время = document.querySelector('.top__b');
  if (!чек || !время) return;

  var мин = 2;
  function тик() {
    if (document.hidden) return;
    мин += 1;
    время.textContent = 'Обновлено ' + мин + ' мин назад';
    if (мин % 3 === 0) {
      var к = (67.4 + (Math.random() * 1.2 - .6)).toFixed(1).replace('.', ',');
      конв.textContent = к + '%';
    }
  }
  setInterval(тик, 9000);
})();
