/* ИИ-диагностика снимка — вау-раздел стоматологии ДЕНТАЛИС.
   Демо-снимок (не даём грузить своё — палит фейк + платно; клик по загрузке → тизер-сообщение).
   Приколюхи: клик по находке → пульс на зубе · тепловая карта · ИИ печатает заключение вживую.
   Хореография на setTimeout (работает в фоне). Всё в .aiscan-scope. */
window.UQ_AISCAN = (function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var PATIENT = 'Николай Орлов', IMGID = 'OPG-2481-07', N = 32, DUR = 3400;
  var FIND = [
    { type: 'Кариес',        sev: 'high', col: '#ff4d5e', conf: 96, ic: '✕', pill: 'Срочно',   tooth: '2.6', note: 'Дистальная поверхность · средняя глубина, ближе к пульпе', plan: 'Лечение кариеса + световая пломба' },
    { type: 'Износ пломбы',  sev: 'med',  col: '#ffb020', conf: 83, ic: '⚑', pill: 'Замена',   tooth: '4.6', note: 'Нарушено краевое прилегание · риск вторичного кариеса',    plan: 'Замена реставрации' },
    { type: 'Трещина эмали', sev: 'med',  col: '#ffb020', conf: 88, ic: '⚠', pill: 'Контроль', tooth: '3.5', note: 'Вертикальная микротрещина · динамическое наблюдение',       plan: 'Наблюдение + реминерализация' },
    { type: 'Норма',         sev: 'ok',   col: '#31e0b0', conf: 99, ic: '✓', pill: 'Здоров',   tooth: '2.1', note: 'Патологий не выявлено · костная ткань в норме',            plan: '—' },
  ];
  var DEMO_I = [2, 29, 13, 18];
  var STEPS = [
    ['Снимок пациента', 'панорама или прицельный'],
    ['Нейросеть анализирует', 'neural-dent · 1.2 сек'],
    ['Находки + план лечения', 'с уверенностью по каждой'],
  ];
  var STATS = [['340K', 'снимков обучения'], ['14', 'типов патологий'], ['94%', 'средняя точность'], ['−15 мин', 'на приём']];
  var VERDICT = 'Найдено 3 патологии, 1 зуб в норме. Приоритет — кариес 2.6 (срочно). План лечения сформирован: ориентировочно 3 визита.';
  var S = { timers: [], intervals: [], raf: null, parts: [], teeth: [], reticles: [] };

  function esc(s){ return ('' + s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }

  function html() {
    return '<div class="aiscan-scope">' +
      '<div class="as-head">' +
        '<div class="as-mk"><i>Д</i>ДЕНТАЛИС · ИИ</div>' +
        '<div class="as-chip"><span class="as-dot"></span>нейромодуль активен</div>' +
        '<div class="as-chip">Пациент · <b>' + esc(PATIENT) + '</b></div>' +
        '<div class="as-chip">Снимок · <b>OPG-панорама</b></div>' +
        '<div class="as-sp"></div>' +
        '<div class="as-chip" style="color:var(--scy)">neural-dent v3.2</div>' +
      '</div>' +
      '<div class="as-work">' +
        '<div class="as-theatre">' +
          '<div class="as-tlabel">Ортопантомограмма · нейросетевой анализ</div>' +
          '<button class="as-heatbtn" data-as-heat hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2s6 5 6 10a6 6 0 0 1-12 0c0-2 1-3 1-3s1 2 3 2c0-3-2-4-2-7 2 1 4 3 4 5z"/></svg>Тепловая карта</button>' +
          '<div class="as-tid">' + IMGID + '</div>' +
          '<span class="as-cn tl"></span><span class="as-cn tr"></span><span class="as-cn bl"></span><span class="as-cn br"></span>' +
          '<div class="as-vp"><div class="as-arch">' +
            '<svg viewBox="0 0 900 460" aria-label="Панорамный снимок зубов"><defs>' +
              '<radialGradient id="asTooth" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#dfeaff"/><stop offset=".6" stop-color="#a9c2e6"/><stop offset="1" stop-color="#5f7ba6"/></radialGradient>' +
              '<radialGradient id="asRed" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#ffd0d5"/><stop offset=".55" stop-color="#ff6b78"/><stop offset="1" stop-color="#c31f30"/></radialGradient>' +
              '<radialGradient id="asAmb" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#ffe6bd"/><stop offset=".55" stop-color="#ffb84d"/><stop offset="1" stop-color="#c67d0a"/></radialGradient>' +
              '<radialGradient id="asMint" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#cafff0"/><stop offset=".55" stop-color="#4fe6bc"/><stop offset="1" stop-color="#1f9d7e"/></radialGradient>' +
            '</defs><g class="as-jaw"></g></svg>' +
            '<canvas class="as-fx" width="900" height="460"></canvas>' +
          '</div></div>' +
          '<div class="as-heat"></div>' +
          '<div class="as-beam"></div>' +
          '<div class="as-ret"></div>' +
          '<div class="as-status">СКАНИРОВАНИЕ…</div>' +
          '<div class="as-foot">frontend-демо · Uniqore</div>' +
        '</div>' +
        '<div class="as-panel">' +
          '<div class="as-ph"><h3>🦷 ИИ-анализ снимка</h3><small class="as-sub">Готов к запуску · демо-снимок</small></div>' +
          '<div class="as-find"><div class="as-idle">Жми <b>«Запустить ИИ-анализ»</b> — нейросеть просканирует снимок, найдёт патологии и соберёт план лечения за секунды.</div></div>' +
          '<div class="as-verdict"><div class="as-vr"><svg viewBox="0 0 68 68" width="68" height="68">' +
            '<circle cx="34" cy="34" r="28" fill="none" stroke="rgba(120,180,255,.12)" stroke-width="6"/>' +
            '<circle class="as-vr-fill" cx="34" cy="34" r="28" fill="none" stroke="url(#asVR)" stroke-width="6" stroke-linecap="round" stroke-dasharray="176" stroke-dashoffset="176"/>' +
            '<defs><linearGradient id="asVR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fd8ff"/><stop offset="1" stop-color="#31e0b0"/></linearGradient></defs>' +
          '</svg><div class="as-vr__c"><b class="as-vr-pct">0</b><small>точность</small></div></div>' +
          '<div class="as-vt"><b>Заключение ИИ</b><p class="as-vtext"></p></div></div>' +
          '<div class="as-run">' +
            '<button class="as-btn" data-as-run><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 3l14 9-14 9V3z"/></svg><span class="as-rlbl">Запустить ИИ-анализ</span></button>' +
            '<button class="as-btn as-btn--g" data-as-replay style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 15-3.4L23 10M1 14l4.5 4.4A9 9 0 0 0 20.5 15"/></svg>Сканировать заново</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // ── инфо-зона: как работает + статы ──
      '<div class="as-info">' +
        '<div class="as-how">' +
          '<div class="as-how__h">Как работает</div>' +
          '<div class="as-steps">' + STEPS.map(function (s, i) {
            return '<div class="as-step"><span class="as-step__n">' + (i + 1) + '</span><div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>' + (i < 2 ? '<span class="as-step__arw">→</span>' : '') + '</div>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="as-stats">' + STATS.map(function (s) {
          return '<div class="as-stat"><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>';
        }).join('') + '</div>' +
      '</div>' +
      // ── тизер загрузки (клик → сообщение) ──
      '<div class="as-upload" data-as-lock>' +
        '<div class="as-up__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v13"/></svg></div>' +
        '<div class="as-up__t"><b>Загрузить снимок пациента</b><span>Панорама или прицельный · нейросеть разметит патологии за секунды</span></div>' +
        '<button class="as-btn as-up__btn" data-as-lock>Загрузить снимок</button>' +
      '</div>' +
      // ── полноэкранное сообщение ──
      '<div class="as-lock" hidden>' +
        '<div class="as-lock__box">' +
          '<div class="as-lock__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>' +
          '<h3>Разбор ваших снимков — в рабочей версии</h3>' +
          '<p>Это демо ДЕНТАЛИС. Загрузка и ИИ-анализ реальных рентген-снимков подключаются в полной версии системы — её мы соберём под вашу клинику под ключ.</p>' +
          '<div class="as-lock__act"><a href="https://uniqore.pro/#contact" class="as-btn" target="_blank" rel="noopener">Хочу такую систему</a><button class="as-btn as-btn--g" data-lock-close>Закрыть</button></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function toothPath() { return 'M-15,-16 C-15,-26 15,-26 15,-16 C17,-6 12,2 10,8 C9,16 6,22 4,22 C2,22 2,14 0,14 C-2,14 -2,22 -4,22 C-6,22 -9,16 -10,8 C-12,2 -17,-6 -15,-16 Z'; }

  function buildArch(scope) {
    var jaw = scope.querySelector('.as-jaw'); jaw.innerHTML = '';
    var teeth = [], cx = 450, N2 = N / 2;
    for (var row = 0; row < 2; row++) {
      var upper = row === 0, cy = upper ? 250 : 210, R = 170, spread = 118, dir = upper ? -1 : 1;
      for (var k = 0; k < N2; k++) {
        var t = N2 > 1 ? k / (N2 - 1) : .5;
        var a = (-spread / 2 + spread * t) * Math.PI / 180;
        var x = cx + R * Math.sin(a), y = cy - dir * R * Math.cos(a);
        var rot = (a * 180 / Math.PI) + (upper ? 0 : 180);
        var idx = upper ? k : (N - 1 - k);
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'as-tooth');
        g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')');
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', toothPath()); p.setAttribute('fill', 'url(#asTooth)');
        g.appendChild(p); jaw.appendChild(g);
        teeth[idx] = { g: g, x: x, y: y };
      }
    }
    return teeth;
  }

  function toPx(scope, sx, sy) {
    var svg = scope.querySelector('.as-arch svg'), vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), tr = scope.querySelector('.as-theatre').getBoundingClientRect();
    return { x: (r.left - tr.left) + sx / vb.width * r.width, y: (r.top - tr.top) + sy / vb.height * r.height };
  }

  function clearAll() {
    S.timers.forEach(clearTimeout); S.timers = [];
    S.intervals.forEach(clearInterval); S.intervals = [];
    if (S.raf) cancelAnimationFrame(S.raf), S.raf = null; S.parts = [];
  }
  function later(fn, ms) { S.timers.push(setTimeout(fn, ms)); }

  function burst(scope, sx, sy, col) {
    var cv = scope.querySelector('.as-fx'), ctx = cv.getContext('2d');
    var px = sx / 900 * cv.width, py = sy / 460 * cv.height;
    for (var i = 0; i < 24; i++) { var an = Math.random() * 6.28, sp = 1 + Math.random() * 3.2; S.parts.push({ x: px, y: py, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 1, col: col }); }
    if (!S.raf) loop(scope, ctx, cv);
  }
  function loop(scope, ctx, cv) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    S.parts = S.parts.filter(function (p) { return p.life > 0; });
    S.parts.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .03; p.life -= .022; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, 2 * p.life + .4, 0, 6.28); ctx.fill(); });
    ctx.globalAlpha = 1;
    S.raf = S.parts.length ? requestAnimationFrame(function () { loop(scope, ctx, cv); }) : null;
  }

  function addReticle(scope, f, idx) {
    var tooth = S.teeth[DEMO_I[idx]], pt = toPx(scope, tooth.x, tooth.y);
    var el = document.createElement('div'); el.className = 'as-r' + (tooth.x < 450 ? ' left' : '');
    el.style.color = f.col; el.style.left = pt.x + 'px'; el.style.top = pt.y + 'px';
    el.innerHTML = '<div class="as-ring"><div class="as-spin"></div></div><div class="as-tag"><b>' + esc(f.type) + '</b><span>Зуб ' + esc(f.tooth) + ' · <span class="c" data-c>0</span>%</span></div>';
    scope.querySelector('.as-ret').appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 20);
    var cEl = el.querySelector('[data-c]'), c = 0;
    var iv = setInterval(function () { c += Math.ceil((f.conf - c) / 6); if (c >= f.conf) { c = f.conf; clearInterval(iv); } cEl.textContent = c; }, 40);
    S.intervals.push(iv);
    S.reticles[idx] = el;
  }
  function addFinding(scope, f, idx) {
    var box = scope.querySelector('.as-find');
    var row = document.createElement('div'); row.className = 'as-f'; row.style.color = f.col; row.setAttribute('data-fi', idx); row.title = 'Показать на снимке';
    row.innerHTML = '<div class="as-f__ic">' + f.ic + '</div><div class="as-f__b"><div class="as-f__t">' + esc(f.type) + '<span class="as-pill">' + esc(f.pill) + '</span></div><div class="as-f__n"><b style="color:var(--stx)">Зуб ' + esc(f.tooth) + '</b> · ' + esc(f.note) + (f.plan !== '—' ? '<br><span style="color:var(--scy)">План: ' + esc(f.plan) + '</span>' : '') + '</div><div class="as-f__m"><div class="as-bar"><i></i></div><span class="as-f__c">' + f.conf + '%</span></div></div>';
    box.appendChild(row);
    setTimeout(function () { row.classList.add('in'); row.querySelector('.as-bar i').style.width = f.conf + '%'; }, 20);
    // не автоскроллим когда демо встроено в iframe (карточка на /keysy/) —
    // иначе превью «едет вниз» само по себе (фидбек Матвея 20.07)
    if (window.self === window.top) box.scrollTop = box.scrollHeight;
  }

  // приколюха: клик по находке → пульс на зубе
  function ping(scope, idx) {
    var el = S.reticles[idx]; if (!el) return;
    el.classList.remove('ping'); void el.offsetWidth; el.classList.add('ping');
    var g = S.teeth[DEMO_I[idx]].g; g.classList.add('zoom'); setTimeout(function () { g.classList.remove('zoom'); }, 900);
    scope.querySelectorAll('.as-f').forEach(function (r) { r.classList.toggle('sel', r.getAttribute('data-fi') == idx); });
  }

  // приколюха: тепловая карта
  function buildHeat(scope) {
    var heat = scope.querySelector('.as-heat'), tr = scope.querySelector('.as-theatre').getBoundingClientRect();
    var grads = FIND.map(function (f, idx) {
      var tooth = S.teeth[DEMO_I[idx]], pt = toPx(scope, tooth.x, tooth.y);
      var col = f.sev === 'high' ? 'rgba(255,77,94,.55)' : f.sev === 'med' ? 'rgba(255,176,32,.5)' : 'rgba(49,224,176,.4)';
      return 'radial-gradient(120px circle at ' + pt.x.toFixed(0) + 'px ' + pt.y.toFixed(0) + 'px, ' + col + ', transparent 70%)';
    });
    heat.style.background = grads.join(',');
  }

  function reset(scope) {
    clearAll();
    scope.querySelector('.as-ret').innerHTML = ''; S.reticles = [];
    var cv = scope.querySelector('.as-fx'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
    scope.querySelector('.as-find').innerHTML = '';
    S.teeth.forEach(function (t) { t.g.setAttribute('class', 'as-tooth'); });
    scope.querySelector('.as-verdict').classList.remove('in');
    scope.querySelector('.as-vr-fill').style.strokeDashoffset = 176;
    scope.querySelector('.as-vr-pct').textContent = '0';
    scope.querySelector('.as-vtext').textContent = '';
    scope.querySelector('.as-heat').classList.remove('on'); scope.querySelector('[data-as-heat]').classList.remove('on'); scope.querySelector('[data-as-heat]').hidden = true;
    var beam = scope.querySelector('.as-beam'); beam.classList.remove('run'); void beam.offsetWidth;
  }

  function run(scope) {
    reset(scope);
    var btn = scope.querySelector('[data-as-run]'), rep = scope.querySelector('[data-as-replay]');
    btn.disabled = true; rep.style.display = 'none';
    scope.querySelector('.as-sub').textContent = 'Нейросеть сканирует снимок…';
    scope.querySelector('.as-rlbl').textContent = 'Анализ…';
    scope.querySelector('.as-status').classList.add('on');
    var beam = scope.querySelector('.as-beam'); beam.classList.add('run');
    S.teeth.forEach(function (t) { var tm = Math.max(0, Math.min(1, t.x / 900)) * DUR; later(function () { t.g.classList.add('lit'); later(function () { t.g.classList.remove('lit'); }, 340); }, tm); });
    FIND.forEach(function (f, idx) {
      var tm = Math.max(0.05, Math.min(1, S.teeth[DEMO_I[idx]].x / 900)) * DUR;
      later(function () {
        var tooth = S.teeth[DEMO_I[idx]], pt = toPx(scope, tooth.x, tooth.y);
        tooth.g.setAttribute('class', 'as-tooth f-' + f.sev);
        burst(scope, tooth.x, tooth.y, f.col); addReticle(scope, f, idx); addFinding(scope, f, idx);
      }, tm);
    });
    later(function () { finish(scope); }, DUR + 120);
  }

  function typeOut(scope, text) {
    var el = scope.querySelector('.as-vtext'), i = 0; el.textContent = '';
    var iv = setInterval(function () { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) { el.textContent = text; clearInterval(iv); } }, 30);
    S.intervals.push(iv);
  }

  function finish(scope) {
    scope.querySelector('.as-status').classList.remove('on');
    S.teeth.forEach(function (t) { t.g.classList.remove('lit'); });
    scope.querySelector('.as-verdict').classList.add('in');
    var pct = 94, c = 0, fill = scope.querySelector('.as-vr-fill'), pctEl = scope.querySelector('.as-vr-pct');
    var iv = setInterval(function () { c += 2; if (c >= pct) { c = pct; clearInterval(iv); } pctEl.textContent = c; fill.style.strokeDashoffset = 176 - (176 * c / 100); }, 26);
    S.intervals.push(iv);
    scope.querySelector('.as-sub').textContent = 'Анализ завершён · ' + FIND.length + ' находки · клик по находке → на снимке';
    typeOut(scope, VERDICT);
    scope.querySelector('.as-rlbl').textContent = 'Готово';
    scope.querySelector('[data-as-replay]').style.display = 'flex';
    var hb = scope.querySelector('[data-as-heat]'); hb.hidden = false;
    buildHeat(scope);
  }

  function init() {
    var scope = document.querySelector('.aiscan-scope'); if (!scope) return;
    scope.style.setProperty('--as-dur', DUR + 'ms');
    clearAll();
    S.teeth = buildArch(scope);
    scope.querySelector('[data-as-run]').onclick = function () { run(scope); };
    scope.querySelector('[data-as-replay]').onclick = function () {
      scope.querySelector('.as-sub').textContent = 'Готов к запуску · демо-снимок';
      scope.querySelector('.as-rlbl').textContent = 'Запустить ИИ-анализ';
      scope.querySelector('[data-as-run]').disabled = false;
      reset(scope);
      scope.querySelector('.as-find').innerHTML = '<div class="as-idle">Жми <b>«Запустить ИИ-анализ»</b> — нейросеть просканирует снимок, найдёт патологии и соберёт план лечения за секунды.</div>';
    };
    // клик по находке → пульс на зубе
    scope.querySelector('.as-find').addEventListener('click', function (e) {
      var row = e.target.closest('[data-fi]'); if (row) ping(scope, +row.getAttribute('data-fi'));
    });
    // тепловая карта
    scope.querySelector('[data-as-heat]').addEventListener('click', function () {
      var heat = scope.querySelector('.as-heat'), b = scope.querySelector('[data-as-heat]');
      buildHeat(scope); heat.classList.toggle('on'); b.classList.toggle('on', heat.classList.contains('on'));
    });
    // тизер загрузки → полноэкранное сообщение
    scope.querySelectorAll('[data-as-lock]').forEach(function (el) { el.addEventListener('click', function () { scope.querySelector('.as-lock').hidden = false; }); });
    var lc = scope.querySelector('[data-lock-close]'); if (lc) lc.onclick = function () { scope.querySelector('.as-lock').hidden = true; };
    var lock = scope.querySelector('.as-lock'); if (lock) lock.addEventListener('click', function (e) { if (e.target === lock) lock.hidden = true; });
    // Мышиный 3D-наклон дуги убран: из-за лага transition снимок «плыл» за
    // курсором — для медицинской панорамы выглядело несерьёзно. Снимок статичен,
    // динамику даёт скан-луч и разметка находок.
  }

  return { html: html, init: init };
})();
