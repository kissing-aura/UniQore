/* sayty.js — интерактив конверсионной страницы «Сайты под ключ» */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ── scroll reveals (blur+slide) ── */
  var revs = document.querySelectorAll('.sy-rev');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    revs.forEach(function (e) { io.observe(e); });
  } else revs.forEach(function (e) { e.classList.add('in'); });

  /* ── счётчики цифр (one-shot, rAF, стоп на финале; fallback = финальное значение) ── */
  var counters = document.querySelectorAll('.sy-cnt');
  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    var dec = parseInt(el.getAttribute('data-dec'), 10) || 0;
    var suf = el.getAttribute('data-suf') || '';
    var start = null, dur = 900;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = to.toFixed(dec) + suf;
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window && !reduce && counters.length) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (e) { cio.observe(e); });
  }

  /* ── floating cards (staggered) ── */
  var fcards = document.querySelectorAll('.sy-fcard');
  if ('IntersectionObserver' in window && fcards.length) {
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var i = +e.target.dataset.i || 0;
          setTimeout(function () { e.target.classList.add('in'); }, 500 + i * 260);
          fio.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    fcards.forEach(function (e) { fio.observe(e); });
  } else fcards.forEach(function (e) { e.classList.add('in'); });

  /* ── hero mini-site: автоскролл ── */
  /* автоскролл мини-сайта — на CSS (компоновщик), не грузит main-thread */

  /* ── hero mini-site: смена ниши (ПОЛНЫЙ когерентный контент, не только заголовок) ── */
  var site = document.getElementById('sySite');
  var scrollWrap = document.getElementById('syScroll');
  var urlEl = document.getElementById('syUrl');
  var phone = document.getElementById('syPhone');
  var VARIANTS = [
    { chip:'Кофейня', accent:'#CDFF4F', ink:'#08130a', url:'lumen-coffee.ru', logo:'Lumen',
      title:'Кофе, который<br>запоминают.', lead:'Свежая обжарка каждый день. Доставка за 40 минут по всему городу.',
      btns:['Смотреть меню','Забронировать'],
      cards:[['Эспрессо','от 180 ₽'],['Раф','от 260 ₽'],['Десерт','от 220 ₽']],
      strip:['4.9★','2 400+ отзывов · доставка 40 мин · оплата онлайн'],
      s2:'Почему нас выбирают', s2cards:[['Своя обжарка','Каждый день'],['Доставка','40 минут'],['Оплата','Онлайн']] },
    { chip:'Недвижимость', accent:'#7dd3fc', ink:'#06202b', url:'nord-estate.ru', logo:'NordEstate',
      title:'Квартиры<br>у моря.', lead:'Апартаменты с видом на море. Ипотека от 4%, заселение сразу после сделки.',
      btns:['Смотреть каталог','Записаться на показ'],
      cards:[['Студия','от 4.2 млн'],['2-комнатная','от 7.8 млн'],['Пентхаус','от 24 млн']],
      strip:['150+','сделок · рассрочка 0% · онлайн-показ квартир'],
      s2:'Почему выбирают нас', s2cards:[['Ипотека','от 4%'],['Сдача','2026 год'],['Показ','Онлайн']] },
    { chip:'Барбершоп', accent:'#f0abfc', ink:'#2a0b2e', url:'sharp-barber.ru', logo:'SHARP',
      title:'Стрижка,<br>как ритуал.', lead:'Мужские стрижки и уход за бородой. Запись онлайн за 30 секунд.',
      btns:['Записаться','Услуги и цены'],
      cards:[['Стрижка','от 1 500 ₽'],['Борода','от 900 ₽'],['Комплекс','от 2 200 ₽']],
      strip:['4.9★','3 000+ клиентов · запись 24/7 · барберы топ-уровня'],
      s2:'Почему к нам', s2cards:[['Барберы','Топ-уровень'],['Запись','24/7'],['Уход','Премиум']] },
    { chip:'Автосервис', accent:'#fb923c', ink:'#2a1405', url:'drive-service.ru', logo:'DriveService',
      title:'Ремонт<br>без сюрпризов.', lead:'Честная диагностика и ремонт. Фиксированная цена до начала работ.',
      btns:['Записаться на ремонт','Прайс на работы'],
      cards:[['Диагностика','от 990 ₽'],['ТО','от 3 500 ₽'],['Ремонт','по расчёту']],
      strip:['12 лет','на рынке · гарантия 2 года · статус в Telegram'],
      s2:'Почему мы', s2cards:[['Гарантия','2 года'],['Цена','Фиксирована'],['Статус','В Telegram']] }
  ];
  function splitAcc(t){
    var s=t.replace(/<br\s*\/?>/gi,' ').trim().split(/\s+/);
    var last=s.pop();
    return (s.length?s.join(' ')+' ':'')+'<em class="lmn-acc">'+last+'</em>';
  }
  function buildSite(v){
    var segs=v.strip[1].split('·').map(function(x){return x.trim();}).filter(Boolean);
    var bars='<span class="lmn-bars"><i></i><i></i><i></i><i></i><i></i></span>';
    var rows=v.cards.map(function(c){return '<div class="lmn-row"><span>'+c[0]+'</span><b class="lmn-price">'+c[1]+'</b></div>';}).join('');
    return '<div class="lmn" style="--acc:'+v.accent+'">'
    + '<nav class="lmn-nav"><span class="lmn-mono">'+v.logo.charAt(0)+'</span><span class="lmn-brand">'+v.logo+'</span><span class="lmn-links"><span>Меню</span><span>О нас</span><span>Контакты</span></span><a class="lmn-pill">'+v.btns[0]+'</a></nav>'
    + '<header class="lmn-hero">'
    +   '<span class="lmn-chip"><i class="lmn-dot"></i>'+v.chip+'</span>'
    +   '<h1 class="lmn-h1">'+splitAcc(v.title)+'</h1>'
    +   '<p class="lmn-lead">'+v.lead+'</p>'
    +   '<div class="lmn-cta"><a class="lmn-pill lmn-pill--lg">'+v.btns[0]+'</a><a class="lmn-ghost">'+v.btns[1]+' →</a></div>'
    +   '<div class="lmn-proof"><div class="lmn-proof__l"><div class="lmn-proof__n">'+v.cards[0][0]+'</div><div class="lmn-proof__m">★ '+v.strip[0].replace('★','').trim()+' · популярный выбор</div></div><div class="lmn-proof__r"><b class="lmn-price">'+v.cards[0][1]+'</b><span class="lmn-proof__b">'+v.btns[0]+'</span></div></div>'
    + '</header>'
    + '<div class="lmn-metrics"><div class="lmn-metric lmn-metric--lg"><b>'+v.strip[0]+'</b><span>'+(segs[0]||'')+'</span></div>'
    +   (segs[1]?'<div class="lmn-metric"><span>'+segs[1]+'</span></div>':'')
    +   (segs[2]?'<div class="lmn-metric"><span>'+segs[2]+'</span></div>':'')
    + '</div>'
    + '<section class="lmn-bento"><h2 class="lmn-h2">'+v.s2+'</h2><div class="lmn-grid">'
    +   '<div class="lmn-b lmn-b--lg"><div class="lmn-b__k">'+v.s2cards[0][1]+'</div><div class="lmn-b__t">'+v.s2cards[0][0]+'</div>'+bars+'</div>'
    +   '<div class="lmn-b"><span class="lmn-b__ic"></span><div class="lmn-b__t">'+v.s2cards[1][0]+'</div><div class="lmn-b__d">'+v.s2cards[1][1]+'</div></div>'
    +   '<div class="lmn-b"><span class="lmn-b__ic"></span><div class="lmn-b__t">'+v.s2cards[2][0]+'</div><div class="lmn-b__d">'+v.s2cards[2][1]+'</div></div>'
    + '</div></section>'
    + '<section class="lmn-show"><h2 class="lmn-h2">Услуги и цены</h2>'+rows+'</section>'
    + '<section class="lmn-quote"><div class="lmn-quote__mark">“</div><p class="lmn-quote__t">Сайт собрали за 4 дня — заявки пошли с первого запуска рекламы.</p><div class="lmn-quote__a"><span class="lmn-quote__av"></span><span>владелец '+v.logo+'</span></div></section>'
    + '<section class="lmn-final"><h2 class="lmn-h2 lmn-h2--c">Готовы начать?</h2><a class="lmn-pill lmn-pill--lg">'+v.btns[0]+'</a></section>'
    + '<footer class="lmn-foot"><span class="lmn-mono">'+v.logo.charAt(0)+'</span><span>© 2026 · '+v.logo+' · сделано в Uniqore</span></footer>'
    + '</div>';
  }
  function buildMobile(v){
    return ''
    + '<div class="msm-bar"><span>9:41</span><span class="msm-ss"><i></i><i></i><i></i></span></div>'
    + '<div class="msm-nav"><span class="msm-logo">'+v.logo+'</span><span class="msm-burger"><i></i><i></i><i></i></span></div>'
    + '<div class="msm-hero"><span class="msm-badge" style="background:color-mix(in srgb,var(--ms-accent) 18%,transparent);color:var(--ms-accent)">'+v.chip+'</span><div class="msm-title">'+v.title+'</div><div class="msm-btn" style="background:var(--ms-accent);color:var(--ms-ink)">'+v.btns[0]+'</div></div>'
    + '<div class="msm-cards"><div class="msm-card msm-card--hi"><b>'+v.cards[0][0]+'</b><span>'+v.cards[0][1]+'</span></div><div class="msm-card"><b>'+v.cards[1][0]+'</b><span>'+v.cards[1][1]+'</span></div></div>'
    + '<div class="msm-strip"><b>'+v.strip[0]+'</b><span>'+v.strip[1]+'</span></div>';
  }
  function paint(v){
    if (site){ site.style.setProperty('--ms-accent', v.accent); site.style.setProperty('--ms-ink', v.ink); }
    if (scrollWrap) scrollWrap.innerHTML = buildSite(v);
    if (urlEl) urlEl.textContent = v.url;
    if (phone){ phone.style.setProperty('--ms-accent', v.accent); phone.style.setProperty('--ms-ink', v.ink); phone.innerHTML = buildMobile(v); }
  }
  var vi = 0;
  if (site && scrollWrap) {
    paint(VARIANTS[0]);
    if (!reduce) setInterval(function () {
      vi = (vi + 1) % VARIANTS.length;
      var v = VARIANTS[vi];
      site.style.opacity = '0';
      if (phone) phone.style.opacity = '0';
      setTimeout(function () {
        paint(v);
        site.style.opacity = '1';
        if (phone) phone.style.opacity = '1';
      }, 500);
    }, 4600);
  }

  /* ── курсор ── */
  var cursor = document.getElementById('syCursor');
  if (cursor && !reduce) {
    var spots = [[70, 60], [190, 130], [250, 210], [130, 250], [60, 180]];
    var ci = 0;
    setInterval(function () {
      ci = (ci + 1) % spots.length;
      cursor.style.transform = 'translate(' + spots[ci][0] + 'px,' + spots[ci][1] + 'px)';
      setTimeout(function () { cursor.classList.add('click'); setTimeout(function () { cursor.classList.remove('click'); }, 420); }, 1200);
    }, 2400);
  }

  /* ── portfolio filter ── */
  var fbtns = document.querySelectorAll('.sy-filter__b');
  var pfs = document.querySelectorAll('.sy-pf');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      fbtns.forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      var f = b.dataset.f;
      pfs.forEach(function (p) {
        var show = f === 'all' || p.dataset.cat === f;
        p.style.display = show ? '' : 'none';
      });
    });
  });

  /* ── objections accordion ── */
  document.querySelectorAll('.sy-obj__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentElement, ans = item.querySelector('.sy-obj__a'), open = item.classList.contains('open');
      document.querySelectorAll('.sy-obj__i').forEach(function (i) {
        i.classList.remove('open'); var a = i.querySelector('.sy-obj__a'); if (a) a.style.maxHeight = '';
      });
      if (!open) { item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
    });
  });

  /* ── magnetic buttons ── */
  if (!reduce) document.querySelectorAll('[data-mag]').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      b.style.transform = 'translate(' + x * 0.16 + 'px,' + y * 0.28 + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });

  /* ── sticky mobile CTA (прячется у футера, чтобы НЕ закрывать реквизиты/ИНН) ── */
  var sticky = document.getElementById('sySticky');
  if (sticky) {
    var syFooter = document.querySelector('footer.footer') || document.querySelector('.footer');
    var syncSticky = function () {
      var nearFooter = false;
      if (syFooter) {
        var fr = syFooter.getBoundingClientRect();
        nearFooter = fr.top < (window.innerHeight - 24);
      }
      if (window.scrollY > 640 && !nearFooter) sticky.classList.add('show');
      else sticky.classList.remove('show');
    };
    window.addEventListener('scroll', syncSticky, { passive: true });
    window.addEventListener('resize', syncSticky, { passive: true });
    syncSticky();
  }

  /* ── form: валидация + отправка в CRM + честный успех/ошибка ──
     Два независимых канала (как в js/form.js): /api/leads (сервер 206, только
     на .pro) и Supabase-мост site-lead-bridge (работает на ЛЮБОМ домене, в т.ч.
     uniqore.ru, где /api/leads не существует). Успех = сработал хотя бы один —
     раньше здесь безусловно показывался успех даже при провале обоих. */
  var form = document.getElementById('sy-form');
  if (form) {
    var last = 0;
    var errorRevertTimer = null;
    var submitBtn = form.querySelector('[type=submit]');
    var submitBtnText = submitBtn ? submitBtn.textContent : '';
    var CMD_BRIDGE_URL = 'https://wbxuwxvdovchtsodznfp.supabase.co/functions/v1/site-lead-bridge';
    var CMD_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieHV3eHZkb3ZjaHRzb2R6bmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NjY1MTAsImV4cCI6MjA5ODI0MjUxMH0.w1_aryP6pMM3Baj_H76tV5LGV8JiBG2Gd67r6Gw3Jq8';
    var CMD_BRIDGE_SECRET = '2dd950726e4ea4428b3af52c5950ef9c43b7afa58370a277';
    function pushToCommandV2(data) {
      return fetch(CMD_BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: CMD_ANON_KEY, Authorization: 'Bearer ' + CMD_ANON_KEY, 'x-bridge-secret': CMD_BRIDGE_SECRET },
        body: JSON.stringify(data)
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var now = Date.now();
      if (now - last < 20000) return;
      var name = form.querySelector('#sy-name');
      var contact = form.querySelector('#sy-contact');
      var ok = true;
      [name, contact].forEach(function (f) {
        if (!f.value.trim()) { f.style.borderColor = '#ff6b6b'; ok = false; }
        else f.style.borderColor = '';
      });
      if (!ok) return;
      last = now;
      if (errorRevertTimer) { clearTimeout(errorRevertTimer); errorRevertTimer = null; }
      var btn = submitBtn || form.querySelector('[type=submit]');
      btn.disabled = true; btn.classList.remove('btn--error'); btn.textContent = 'Отправляем…';
      var data = {
        name: name.value.trim(),
        contact: contact.value.trim(),
        business: (form.querySelector('#sy-niche') || {}).value || '',
        task: (form.querySelector('#sy-comment') || {}).value || '',
        website: ''
      };
      var bridgePromise = pushToCommandV2(data);
      var apiPromise = fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.ok; }).catch(function () { return false; });
      Promise.all([apiPromise, bridgePromise]).then(function (results) {
        var saved = results[0] || results[1];
        if (saved) {
          var okPanel = document.getElementById('syFormOk');
          form.style.display = 'none';
          if (okPanel) okPanel.classList.add('show');
        } else {
          btn.disabled = false;
          btn.textContent = 'Не отправилось, попробуйте ещё раз';
          btn.classList.add('btn--error');
          last = 0;
          errorRevertTimer = setTimeout(function () {
            btn.textContent = submitBtnText;
            btn.classList.remove('btn--error');
            errorRevertTimer = null;
          }, 5000);
        }
      });
    });
    form.querySelectorAll('.sy-in').forEach(function (f) {
      f.addEventListener('input', function () { f.style.borderColor = ''; });
    });
  }

  // ── Before/After compare sliders ──
  function initCmp(el) {
    var pos = 50, dragging = false;
    function setPos(p) {
      pos = p < 0 ? 0 : p > 100 ? 100 : p;
      el.style.setProperty('--pos', pos + '%');
    }
    function scaleFrame() {
      if (el.querySelector('.sy-slc__after iframe')) {
        el.style.setProperty('--s', (el.clientWidth / 1366).toFixed(4));
      }
    }
    function xToPos(clientX) {
      var r = el.getBoundingClientRect();
      return (clientX - r.left) / r.width * 100;
    }
    el.addEventListener('pointerdown', function (e) {
      dragging = true; setPos(xToPos(e.clientX));
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });
    el.addEventListener('pointermove', function (e) {
      if (dragging) { setPos(xToPos(e.clientX)); e.preventDefault(); }
    });
    el.addEventListener('pointerup', function () { dragging = false; });
    el.addEventListener('pointercancel', function () { dragging = false; });
    if ('ResizeObserver' in window) { new ResizeObserver(scaleFrame).observe(el); }
    else { window.addEventListener('resize', scaleFrame); }
    scaleFrame(); setPos(50);
  }
  document.querySelectorAll('[data-slc]').forEach(initCmp);

  // ── авто-play видео-кейсов при появлении (autoplay-атрибут не везде срабатывает) ──
  var pvids = document.querySelectorAll('.sy-pf__video video');
  if (pvids.length && !reduce) {
    if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.play().catch(function () {}); }
          else { e.target.pause(); }
        });
      }, { threshold: 0.25 });
      pvids.forEach(function (v) { vio.observe(v); });
    } else {
      pvids.forEach(function (v) { v.play().catch(function () {}); });
    }
  }
})();

/* наклон hero-мокапа за курсором (параллакс) */
(function () {
  var m = document.querySelector('.sy-mock'), b = document.querySelector('.sy-browser');
  var ph = document.querySelector('.sy-phone');
  if (!m || !b) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  var EASE = 0.085; // ниже = мягче/инерционнее
  function loop() {
    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;
    b.style.transform = 'rotateY(' + (-6 + cx * 3).toFixed(3) + 'deg) rotateX(' + (3 - cy * 2).toFixed(3) + 'deg)';
    if (ph) {
      ph.style.setProperty('--phx', (cx * -22).toFixed(2) + 'px');
      ph.style.setProperty('--phy', (cy * -14).toFixed(2) + 'px');
      ph.style.setProperty('--phry', (cx * 6).toFixed(2) + 'deg');
    }
    if (Math.abs(tx - cx) > 0.0004 || Math.abs(ty - cy) > 0.0004) {
      raf = requestAnimationFrame(loop);
    } else { cx = tx; cy = ty; raf = 0; }
  }
  m.addEventListener('mousemove', function (e) {
    var r = m.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  m.addEventListener('mouseleave', function () {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(loop);
  });
})();
