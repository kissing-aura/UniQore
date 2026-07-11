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

  /* ── hero mini-site: смена варианта (ниши) ── */
  var site = document.getElementById('sySite');
  var titleEl = document.getElementById('sySiteTitle');
  var chipEl = document.getElementById('sySiteChip');
  var urlEl = document.getElementById('syUrl');
  var VARIANTS = [
    { chip: 'Кофейня', accent: '#CDFF4F', ink: '#08130a', title: 'Кофе, который<br>запоминают.', url: 'lumen-coffee.ru' },
    { chip: 'Недвижимость', accent: '#7dd3fc', ink: '#06202b', title: 'Квартиры<br>у моря.', url: 'nord-estate.ru' },
    { chip: 'Барбершоп', accent: '#f0abfc', ink: '#2a0b2e', title: 'Стрижка,<br>как ритуал.', url: 'sharp-barber.ru' },
    { chip: 'Автосервис', accent: '#fb923c', ink: '#2a1405', title: 'Ремонт<br>без сюрпризов.', url: 'drive-service.ru' }
  ];
  var vi = 0;
  if (site && !reduce) {
    setInterval(function () {
      vi = (vi + 1) % VARIANTS.length;
      var v = VARIANTS[vi];
      site.style.opacity = '0';
      setTimeout(function () {
        site.style.setProperty('--ms-accent', v.accent);
        site.style.setProperty('--ms-ink', v.ink);
        if (titleEl) titleEl.innerHTML = v.title;
        if (chipEl) chipEl.textContent = v.chip;
        if (urlEl) urlEl.textContent = v.url;
        site.style.opacity = '1';
      }, 500);
    }, 4200);
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

  /* ── sticky mobile CTA ── */
  var sticky = document.getElementById('sySticky');
  if (sticky) window.addEventListener('scroll', function () {
    if (window.scrollY > 640) sticky.classList.add('show'); else sticky.classList.remove('show');
  }, { passive: true });

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
})();
