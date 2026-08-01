
(function(){
'use strict';

var toc   = document.getElementById('mh-toc'),
    shot  = document.getElementById('mh-shot'),
    mover = document.getElementById('mh-mover'),
    cap   = document.getElementById('mh-cap'),
    photo = document.getElementById('mh-photo'),
    tabs  = toc.querySelectorAll('.mh-tab'),
    calm  = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══ кропы ═══
   Проём 354×182 (на 360 и уже — 328×174, ход тот же). Кадры отдаются
   производными 1024 px, поэтому вся арифметика ниже — от ширины 1024.

   Замер по пикселям мастеров (PIL, порог 235):
     Немеция  2000×1134 — белая полоса снизу 167 px, содержимое кончается
              около y=985; боковых полей нет;
     Bien Sûr 2000×1133 — впечены белые поля 249 px слева и 251 справа,
              снизу 10 px, сверху нет;
     IDTuning 2000×1132 и MILLA 2000×1139 — полей нет.

   Кадр берётся ПОЛНОЙ ШИРИНОЙ страницы (а не зумом во фрагмент) — иначе
   IDTuning читается как фото машины, а Bien Sûr как стоковый интерьер.
   Во всех четырёх в проём попадает шапка сайта клиента.

   Ширина и сдвиг заданы В ПРОЦЕНТАХ от проёма, а не в пикселях: иначе
   на 430 px (iPhone Pro Max) кадр шириной 386 px не закрывал проём и
   справа зияла подложка на 24 px — замерено. Проценты считаны от базовой
   меры 354 px: 386/354 = 109,05%, -16/354 = -4,52%; у Bien Sur
   510/354 = 144,07%, -78/354 = -22,03%.

   Ход картинки: ±5 px по X (только мышь, на телефоне 0) и 0..-5,25 px
   по Y (прокрутка, ТОЛЬКО вверх). Знак выбран так, что вниз кадр не
   едет вовсе, поэтому запаса сверху хватает 2 px, а снизу везде >=36 px.
   Проверено перебором крайних положений: проём не оголяется. */
var D = [
  {s:'/keysy/cases/case-nemecia-1024.webp', iw:1024, ih:581, w:'109.05%', x:'-4.52%',
   n:'Немеция.',  m:' Автокомплекс в Омске',
   a:'Первый экран сайта автокомплекса «Немеция» в Омске'},
  {s:'/keysy/cases/case-biensur-1024.webp', iw:1024, ih:580, w:'144.07%', x:'-22.03%',
   n:'Bien Sûr.', m:' Ресторан в Санкт-Петербурге',
   a:'Первый экран сайта ресторана Bien Sûr в Санкт-Петербурге'},
  {s:'/keysy/cases/case-idtuning-1024.webp',iw:1024, ih:580, w:'109.05%', x:'-4.52%',
   n:'IDTuning.', m:' Тюнинг-ателье в Москве',
   a:'Первый экран сайта тюнинг-ателье IDTuning'},
  {s:'/keysy/cases/case-milla-1024.webp',   iw:1024, ih:583, w:'109.05%', x:'-4.52%',
   n:'MILLA.',    m:' Студия интерьеров в Самаре',
   a:'Первый экран сайта MILLA — интерьеры'}
];
var now = 0;

function paint(i){
  var d = D[i];
  shot.src = d.s; shot.alt = d.a;
  shot.setAttribute('width', d.iw); shot.setAttribute('height', d.ih);
  shot.style.width = d.w;
  shot.style.left  = d.x;
  shot.style.top   = '-2px';
  shot.style.animation = 'none';        /* посадка играет один раз, при загрузке */
  cap.innerHTML = '<b>' + d.n + '</b>' + d.m;
  for (var k=0;k<tabs.length;k++) tabs[k].setAttribute('aria-pressed', k===i ? 'true':'false');
  now = i;
  if (calm) return;
  mover.classList.remove('sw'); void mover.offsetWidth; mover.classList.add('sw');
  cap.classList.remove('sw');   void cap.offsetWidth;   cap.classList.add('sw');
}
function show(i){
  if (i===now || !D[i]) return;
  var pre = new Image(), done = false;
  pre.src = D[i].s;
  /* декодируем ДО подмены, иначе шторка проявит старый кадр.
     Страховка по таймеру обязательна: в притормаживающей вкладке
     decode() умеет не разрешаться вовсе — без неё тап молча
     ничего не делает. */
  var go = function(){ if(done) return; done = true; paint(i); };
  setTimeout(go, 400);
  if (pre.decode) pre.decode().then(go).catch(go);
  else if (pre.complete) go();
  else { pre.onload = go; pre.onerror = go; }
}
toc.addEventListener('click', function(e){
  var t = e.target.closest && e.target.closest('.mh-tab');
  if (t) show(+t.getAttribute('data-i'));
});

/* свайп по кадру. Вертикальный guard обязателен: без него обычная
   прокрутка большим пальцем перелистывает работы */
var sx=0, sy0=0;
photo.addEventListener('touchstart', function(e){
  sx=e.touches[0].clientX; sy0=e.touches[0].clientY;
}, {passive:true});
photo.addEventListener('touchend', function(e){
  var dx = e.changedTouches[0].clientX - sx,
      dy = e.changedTouches[0].clientY - sy0;
  if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)*1.6) return;
  show((now + (dx<0 ? 1 : 3)) % 4);
}, {passive:true});

/* ═══ параллакс ═══
   Одна rAF-петля пишет два числа В САМ #mover, а не в корень экрана:
   иначе браузер инвалидирует стиль всего поддерева на каждом кадре
   прокрутки ради сдвига одной картинки.
   Гироскопа здесь нет намеренно: на iOS запрос доступа к датчикам
   всплывает системной модалкой на первом же флике скролла. */
if (!calm) {
  var tgx=0,tsy=0, cgx=0,csy=0, alive=false, st=mover.style;
  function clamp(v){ return v<-1 ? -1 : v>1 ? 1 : v; }
  function put(){
    st.setProperty('--gx', cgx.toFixed(4));
    st.setProperty('--sy', csy.toFixed(2));
  }
  function loop(){
    cgx += (tgx-cgx)*.12; csy += (tsy-csy)*.20;
    put();
    if (Math.abs(tgx-cgx) > .002 || Math.abs(tsy-csy) > .3) requestAnimationFrame(loop);
    else { cgx=tgx; csy=tsy; put(); alive=false; }
  }
  function kick(){ if(!alive){ alive=true; requestAnimationFrame(loop); } }

  var maxSy = 150;
  function readScroll(){
    var v = window.pageYOffset || document.documentElement.scrollTop || 0;
    tsy = v > maxSy ? maxSy : v; kick();
  }
  addEventListener('scroll', readScroll, {passive:true});
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden) readScroll();     /* rAF в фоне заморожен — перечитать */
  }, {passive:true});

  /* горизонтальный ход — только там, где есть настоящий курсор.
     На телефоне мыши нет, и слушатель pointermove лишь будил бы петлю
     во время скролла пальцем */
  var fine = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  if (fine){
    addEventListener('pointermove', function(e){
      tgx = clamp((e.clientX/(innerWidth||390))*2 - 1); kick();
    }, {passive:true});
  }
}

/* Остальные кадры — после загрузки и только на нормальном канале.
   На мобильном трафике из Директа 111 КБ вслепую не тянем. */
addEventListener('load', function(){
  var c = navigator.connection;
  if (c && (c.saveData || /2g/.test(c.effectiveType||''))) return;
  setTimeout(function(){ for (var i=1;i<D.length;i++) (new Image()).src = D[i].s; }, 700);
});

})();
