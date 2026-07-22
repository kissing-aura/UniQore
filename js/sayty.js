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
  function msCard(c, hi){ return '<div class="ms-card" style="background:'+(hi?'color-mix(in srgb,var(--ms-accent) 10%,#141a26)':'#141a26')+'"><div class="ms-card__t">'+c[0]+'</div><div class="ms-card__d">'+c[1]+'</div></div>'; }
  function buildSite(v){
    return ''
    + '<div class="ms-nav"><span class="ms-logo">'+v.logo+'</span><span class="ms-navlinks"><span>Меню</span><span>О нас</span><span>Контакты</span></span><span class="ms-cta" style="background:var(--ms-accent);color:var(--ms-ink)">Заказать</span></div>'
    + '<div class="ms-hero"><span class="ms-badge" style="background:color-mix(in srgb,var(--ms-accent) 16%,transparent);color:var(--ms-accent)">'+v.chip+'</span><div class="ms-title">'+v.title+'</div><div class="ms-lead">'+v.lead+'</div><div class="ms-btns"><span class="ms-btn" style="background:var(--ms-accent);color:var(--ms-ink)">'+v.btns[0]+'</span><span class="ms-btn ms-btn--2">'+v.btns[1]+'</span></div></div>'
    + '<div class="ms-cards">'+msCard(v.cards[0],1)+msCard(v.cards[1],0)+msCard(v.cards[2],0)+'</div>'
    + '<div class="ms-strip" style="background:color-mix(in srgb,var(--ms-accent) 12%,#101622)"><div style="font-family:\'Unbounded\',sans-serif;font-weight:800;color:var(--ms-accent)">'+v.strip[0]+'</div><div style="font-size:11px;color:#9aa6bd">'+v.strip[1]+'</div></div>'
    + '<div class="ms-hero" style="padding-top:8px"><div class="ms-title" style="font-size:19px">'+v.s2+'</div></div>'
    + '<div class="ms-cards">'+msCard(v.s2cards[0],0)+msCard(v.s2cards[1],0)+msCard(v.s2cards[2],1)+'</div>'
    + '<div class="ms-strip" style="background:#101622"><div style="font-size:11px;color:#9aa6bd">© 2026 · сделано в Uniqore</div></div>';
  }
  var vi = 0;
  if (site && scrollWrap) {
    site.style.setProperty('--ms-accent', VARIANTS[0].accent);
    site.style.setProperty('--ms-ink', VARIANTS[0].ink);
    scrollWrap.innerHTML = buildSite(VARIANTS[0]);
    if (urlEl) urlEl.textContent = VARIANTS[0].url;
    if (!reduce) setInterval(function () {
      vi = (vi + 1) % VARIANTS.length;
      var v = VARIANTS[vi];
      site.style.opacity = '0';
      setTimeout(function () {
        site.style.setProperty('--ms-accent', v.accent);
        site.style.setProperty('--ms-ink', v.ink);
        scrollWrap.innerHTML = buildSite(v);
        if (urlEl) urlEl.textContent = v.url;
        site.style.opacity = '1';
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

  /* ── form: валидация + отправка в CRM/Telegram + красивый успех ── */
  var form = document.getElementById('sy-form');
  if (form) {
    var last = 0;
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
      var btn = form.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Отправляем…';
      var data = {
        name: name.value.trim(),
        contact: contact.value.trim(),
        business: (form.querySelector('#sy-niche') || {}).value || '',
        task: (form.querySelector('#sy-comment') || {}).value || '',
        website: ''
      };
      fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .catch(function () {})
        .then(function () {
          var okPanel = document.getElementById('syFormOk');
          form.style.display = 'none';
          if (okPanel) okPanel.classList.add('show');
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
  if (!m || !b) return;
  var ticking = false, lx = 0, ly = 0;
  m.addEventListener('mousemove', function (e) {
    var r = m.getBoundingClientRect();
    lx = (e.clientX - r.left) / r.width - 0.5;
    ly = (e.clientY - r.top) / r.height - 0.5;
    b.style.transform = 'rotateY(' + (-7 + lx * 9).toFixed(2) + 'deg) rotateX(' + (3.5 - ly * 6).toFixed(2) + 'deg)';
  }, { passive: true });
  m.addEventListener('mouseleave', function () { b.style.transform = ''; });
})();
