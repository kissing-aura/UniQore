/* ИИ-диагностика снимка — вау-раздел стоматологии ДЕНТАЛИС.
   Два режима: демо-дуга ИЛИ загруженный пользователем снимок (upload → анализ на нём).
   Хореография на setTimeout (отрабатывает в фоне). Всё в .aiscan-scope. */
window.UQ_AISCAN = (function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var PATIENT = 'Николай Орлов', IMGID = 'OPG-2481-07', N = 32, DUR = 3400;
  var FIND = [
    { type: 'Кариес',        sev: 'high', col: '#ff4d5e', conf: 96, ic: '✕', pill: 'Срочно',   note: 'Дистальная поверхность · средняя глубина, ближе к пульпе', plan: 'Лечение кариеса + световая пломба' },
    { type: 'Износ пломбы',  sev: 'med',  col: '#ffb020', conf: 83, ic: '⚑', pill: 'Замена',   note: 'Нарушено краевое прилегание · риск вторичного кариеса',    plan: 'Замена реставрации' },
    { type: 'Трещина эмали', sev: 'med',  col: '#ffb020', conf: 88, ic: '⚠', pill: 'Контроль', note: 'Вертикальная микротрещина · динамическое наблюдение',       plan: 'Наблюдение + реминерализация' },
    { type: 'Норма',         sev: 'ok',   col: '#31e0b0', conf: 99, ic: '✓', pill: 'Здоров',   note: 'Патологий не выявлено · костная ткань в норме',            plan: '—' },
  ];
  // позиции находок: для демо-дуги — индекс зуба; для фото — доля вьюпорта
  var DEMO_I = [2, 29, 13, 18];
  var PHOTO_P = [{ x: 0.30, y: 0.42 }, { x: 0.71, y: 0.38 }, { x: 0.43, y: 0.66 }, { x: 0.72, y: 0.64 }];
  var TOOTH = ['2.6', '4.6', '3.5', '2.1'];
  var S = { timers: [], intervals: [], raf: null, parts: [], teeth: [], mode: 'demo' };

  function esc(s){ return ('' + s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }

  function html() {
    return '<div class="aiscan-scope">' +
      '<div class="as-head">' +
        '<div class="as-mk"><i>Д</i>ДЕНТАЛИС · ИИ</div>' +
        '<div class="as-chip"><span class="as-dot"></span>нейромодуль активен</div>' +
        '<div class="as-chip as-pt">Пациент · <b>' + esc(PATIENT) + '</b></div>' +
        '<div class="as-chip as-src">Снимок · <b>OPG-панорама</b></div>' +
        '<div class="as-sp"></div>' +
        '<div class="as-chip" style="color:var(--scy)">neural-dent v3.2</div>' +
      '</div>' +
      '<div class="as-work">' +
        '<div class="as-theatre">' +
          '<div class="as-tlabel">Ортопантомограмма · нейросетевой анализ</div>' +
          '<div class="as-tid">' + IMGID + '</div>' +
          '<span class="as-cn tl"></span><span class="as-cn tr"></span><span class="as-cn bl"></span><span class="as-cn br"></span>' +
          '<img class="as-photo" alt="Снимок пациента">' +
          '<div class="as-vp"><div class="as-arch">' +
            '<svg viewBox="0 0 900 460" aria-label="Панорамный снимок зубов"><defs>' +
              '<radialGradient id="asTooth" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#dfeaff"/><stop offset=".6" stop-color="#a9c2e6"/><stop offset="1" stop-color="#5f7ba6"/></radialGradient>' +
              '<radialGradient id="asRed" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#ffd0d5"/><stop offset=".55" stop-color="#ff6b78"/><stop offset="1" stop-color="#c31f30"/></radialGradient>' +
              '<radialGradient id="asAmb" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#ffe6bd"/><stop offset=".55" stop-color="#ffb84d"/><stop offset="1" stop-color="#c67d0a"/></radialGradient>' +
              '<radialGradient id="asMint" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#cafff0"/><stop offset=".55" stop-color="#4fe6bc"/><stop offset="1" stop-color="#1f9d7e"/></radialGradient>' +
            '</defs><g class="as-jaw"></g></svg>' +
            '<canvas class="as-fx" width="900" height="460"></canvas>' +
          '</div></div>' +
          '<div class="as-beam"></div>' +
          '<div class="as-ret"></div>' +
          '<div class="as-status">СКАНИРОВАНИЕ…</div>' +
          '<div class="as-foot">frontend-демо · Uniqore</div>' +
        '</div>' +
        '<div class="as-panel">' +
          '<div class="as-ph"><h3>🦷 ИИ-анализ снимка</h3><small class="as-sub">Готов к запуску · демо-снимок</small></div>' +
          '<div class="as-find"><div class="as-idle">Загрузи <b>свой снимок</b> внизу или запусти на демо — нейросеть просканирует, найдёт патологии и соберёт план лечения за секунды.</div></div>' +
          '<div class="as-verdict"><div class="as-vr"><svg viewBox="0 0 68 68" width="68" height="68">' +
            '<circle cx="34" cy="34" r="28" fill="none" stroke="rgba(120,180,255,.12)" stroke-width="6"/>' +
            '<circle class="as-vr-fill" cx="34" cy="34" r="28" fill="none" stroke="url(#asVR)" stroke-width="6" stroke-linecap="round" stroke-dasharray="176" stroke-dashoffset="176"/>' +
            '<defs><linearGradient id="asVR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fd8ff"/><stop offset="1" stop-color="#31e0b0"/></linearGradient></defs>' +
          '</svg><div class="as-vr__c"><b class="as-vr-pct">0</b><small>точность</small></div></div>' +
          '<div class="as-vt"><b>Анализ завершён</b><p class="as-vtext">Найдено 3 патологии · 1 зуб в норме. План лечения сформирован.</p></div></div>' +
          '<div class="as-run">' +
            '<button class="as-btn" data-as-run><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 3l14 9-14 9V3z"/></svg><span class="as-rlbl">Запустить ИИ-анализ</span></button>' +
            '<button class="as-btn as-btn--g" data-as-replay style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 15-3.4L23 10M1 14l4.5 4.4A9 9 0 0 0 20.5 15"/></svg>Сканировать заново</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // ── панель загрузки своего снимка ──
      '<div class="as-upload" data-as-drop>' +
        '<div class="as-up__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v13"/></svg></div>' +
        '<div class="as-up__t"><b>Загрузи свой снимок для анализа</b><span>Перетащи сюда или выбери файл · панорама или прицельный · PNG, JPG</span></div>' +
        '<div class="as-up__actions">' +
          '<label class="as-btn as-up__file"><input type="file" accept="image/*" data-as-file hidden>Выбрать снимок</label>' +
          '<button class="as-btn as-btn--g as-up__demo" data-as-demo>Демо-снимок</button>' +
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

  // px в театре для находки f (mode-aware)
  function targetPx(scope, idx) {
    var tr = scope.querySelector('.as-theatre').getBoundingClientRect();
    if (S.mode === 'photo') {
      var p = PHOTO_P[idx], img = scope.querySelector('.as-photo'), ir = img.getBoundingClientRect();
      var pad = 26, boxW = ir.width - pad * 2, boxH = ir.height - pad * 2;
      var nw = img.naturalWidth || 16, nh = img.naturalHeight || 9;
      var sc = Math.min(boxW / nw, boxH / nh), cw = nw * sc, ch = nh * sc;
      var cx0 = (ir.left - tr.left) + pad + (boxW - cw) / 2, cy0 = (ir.top - tr.top) + pad + (boxH - ch) / 2;
      return { x: cx0 + cw * p.x, y: cy0 + ch * p.y, frac: p.x };
    }
    var svg = scope.querySelector('.as-arch svg'), vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
    var tooth = S.teeth[DEMO_I[idx]];
    return { x: (r.left - tr.left) + tooth.x / vb.width * r.width, y: (r.top - tr.top) + tooth.y / vb.height * r.height, frac: tooth.x / 900 };
  }

  function clearAll() {
    S.timers.forEach(clearTimeout); S.timers = [];
    S.intervals.forEach(clearInterval); S.intervals = [];
    if (S.raf) cancelAnimationFrame(S.raf), S.raf = null; S.parts = [];
  }
  function later(fn, ms) { S.timers.push(setTimeout(fn, ms)); }

  function burst(scope, px, py, col) {
    var cv = scope.querySelector('.as-fx'), ctx = cv.getContext('2d');
    var tr = scope.querySelector('.as-theatre').getBoundingClientRect();
    var x = px / tr.width * cv.width, y = py / tr.height * cv.height;
    for (var i = 0; i < 24; i++) { var an = Math.random() * 6.28, sp = 1 + Math.random() * 3.2; S.parts.push({ x: x, y: y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 1, col: col }); }
    if (!S.raf) loop(scope, ctx, cv);
  }
  function loop(scope, ctx, cv) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    S.parts = S.parts.filter(function (p) { return p.life > 0; });
    S.parts.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .03; p.life -= .022; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, 2 * p.life + .4, 0, 6.28); ctx.fill(); });
    ctx.globalAlpha = 1;
    S.raf = S.parts.length ? requestAnimationFrame(function () { loop(scope, ctx, cv); }) : null;
  }

  function addReticle(scope, f, idx, px, py) {
    var el = document.createElement('div'); el.className = 'as-r' + (px < scope.querySelector('.as-theatre').getBoundingClientRect().width * 0.5 ? ' left' : '');
    el.style.color = f.col; el.style.left = px + 'px'; el.style.top = py + 'px';
    var label = S.mode === 'photo' ? ('Область ' + (idx + 1)) : ('Зуб ' + TOOTH[idx]);
    el.innerHTML = '<div class="as-ring"><div class="as-spin"></div></div><div class="as-tag"><b>' + esc(f.type) + '</b><span>' + label + ' · <span class="c" data-c>0</span>%</span></div>';
    scope.querySelector('.as-ret').appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 20);
    var cEl = el.querySelector('[data-c]'), c = 0;
    var iv = setInterval(function () { c += Math.ceil((f.conf - c) / 6); if (c >= f.conf) { c = f.conf; clearInterval(iv); } cEl.textContent = c; }, 40);
    S.intervals.push(iv);
  }
  function addFinding(scope, f, idx) {
    var box = scope.querySelector('.as-find');
    var where = S.mode === 'photo' ? ('Область ' + (idx + 1)) : ('Зуб ' + TOOTH[idx]);
    var row = document.createElement('div'); row.className = 'as-f'; row.style.color = f.col;
    row.innerHTML = '<div class="as-f__ic">' + f.ic + '</div><div class="as-f__b"><div class="as-f__t">' + esc(f.type) + '<span class="as-pill">' + esc(f.pill) + '</span></div><div class="as-f__n"><b style="color:var(--stx)">' + where + '</b> · ' + esc(f.note) + (f.plan !== '—' ? '<br><span style="color:var(--scy)">План: ' + esc(f.plan) + '</span>' : '') + '</div><div class="as-f__m"><div class="as-bar"><i></i></div><span class="as-f__c">' + f.conf + '%</span></div></div>';
    box.appendChild(row);
    setTimeout(function () { row.classList.add('in'); row.querySelector('.as-bar i').style.width = f.conf + '%'; }, 20);
    box.scrollTop = box.scrollHeight;
  }

  function reset(scope) {
    clearAll();
    scope.querySelector('.as-ret').innerHTML = '';
    var cv = scope.querySelector('.as-fx'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
    scope.querySelector('.as-find').innerHTML = '';
    S.teeth.forEach(function (t) { t.g.setAttribute('class', 'as-tooth'); });
    scope.querySelector('.as-verdict').classList.remove('in');
    scope.querySelector('.as-vr-fill').style.strokeDashoffset = 176;
    scope.querySelector('.as-vr-pct').textContent = '0';
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
    // sweep teeth (demo only)
    if (S.mode === 'demo') S.teeth.forEach(function (t) { var tm = Math.max(0, Math.min(1, t.x / 900)) * DUR; later(function () { t.g.classList.add('lit'); later(function () { t.g.classList.remove('lit'); }, 340); }, tm); });
    // findings
    FIND.forEach(function (f, idx) {
      var frac = S.mode === 'photo' ? PHOTO_P[idx].x : (S.teeth[DEMO_I[idx]].x / 900);
      var tm = Math.max(0.05, Math.min(1, frac)) * DUR;
      later(function () {
        var pt = targetPx(scope, idx);
        if (S.mode === 'demo') S.teeth[DEMO_I[idx]].g.setAttribute('class', 'as-tooth f-' + f.sev);
        burst(scope, pt.x, pt.y, f.col); addReticle(scope, f, idx, pt.x, pt.y); addFinding(scope, f, idx);
      }, tm);
    });
    later(function () { finish(scope); }, DUR + 120);
  }

  function finish(scope) {
    scope.querySelector('.as-status').classList.remove('on');
    S.teeth.forEach(function (t) { t.g.classList.remove('lit'); });
    scope.querySelector('.as-verdict').classList.add('in');
    var pct = 94, c = 0, fill = scope.querySelector('.as-vr-fill'), pctEl = scope.querySelector('.as-vr-pct');
    var iv = setInterval(function () { c += 2; if (c >= pct) { c = pct; clearInterval(iv); } pctEl.textContent = c; fill.style.strokeDashoffset = 176 - (176 * c / 100); }, 26);
    S.intervals.push(iv);
    var bad = FIND.filter(function (f) { return f.sev !== 'ok'; }).length, ok = FIND.length - bad;
    scope.querySelector('.as-sub').textContent = 'Анализ завершён · ' + FIND.length + ' находки';
    scope.querySelector('.as-vtext').textContent = 'Найдено ' + bad + ' патологии · ' + ok + ' в норме. План лечения сформирован.';
    scope.querySelector('.as-rlbl').textContent = 'Готово';
    scope.querySelector('[data-as-replay]').style.display = 'flex';
  }

  function loadPhoto(scope, file) {
    if (!file || !/^image\//.test(file.type)) { return; }
    var rd = new FileReader();
    rd.onload = function (e) {
      var img = scope.querySelector('.as-photo');
      img.onload = function () {
        S.mode = 'photo';
        scope.classList.add('has-photo');
        scope.querySelector('.as-src b').textContent = 'Ваш снимок';
        scope.querySelector('.as-pt b').textContent = 'Новый снимок';
        scope.querySelector('.as-sub').textContent = 'Снимок загружен · запусти ИИ-анализ';
        scope.querySelector('[data-as-run]').disabled = false;
        scope.querySelector('[data-as-replay]').style.display = 'none';
        reset(scope);
        scope.querySelector('.as-find').innerHTML = '<div class="as-idle">Снимок загружен. Жми <b>«Запустить ИИ-анализ»</b> — нейросеть разметит патологии прямо на нём.</div>';
      };
      img.src = e.target.result;
    };
    rd.readAsDataURL(file);
  }

  function useDemo(scope) {
    S.mode = 'demo';
    scope.classList.remove('has-photo');
    scope.querySelector('.as-src b').textContent = 'OPG-панорама';
    scope.querySelector('.as-pt b').textContent = PATIENT;
    scope.querySelector('.as-sub').textContent = 'Готов к запуску · демо-снимок';
    scope.querySelector('[data-as-run]').disabled = false;
    scope.querySelector('[data-as-replay]').style.display = 'none';
    reset(scope);
    scope.querySelector('.as-find').innerHTML = '<div class="as-idle">Демо-снимок. Жми <b>«Запустить ИИ-анализ»</b> — или загрузи свой внизу.</div>';
  }

  function init() {
    var scope = document.querySelector('.aiscan-scope'); if (!scope) return;
    scope.style.setProperty('--as-dur', DUR + 'ms');
    clearAll(); S.mode = 'demo';
    S.teeth = buildArch(scope);
    scope.querySelector('[data-as-run]').onclick = function () { run(scope); };
    scope.querySelector('[data-as-replay]').onclick = function () {
      scope.querySelector('.as-sub').textContent = S.mode === 'photo' ? 'Снимок загружен · запусти ИИ-анализ' : 'Готов к запуску · демо-снимок';
      scope.querySelector('.as-rlbl').textContent = 'Запустить ИИ-анализ';
      scope.querySelector('[data-as-run]').disabled = false;
      reset(scope);
    };
    // upload
    var fileInp = scope.querySelector('[data-as-file]');
    if (fileInp) fileInp.onchange = function (e) { if (e.target.files && e.target.files[0]) loadPhoto(scope, e.target.files[0]); };
    var demoBtn = scope.querySelector('[data-as-demo]');
    if (demoBtn) demoBtn.onclick = function () { useDemo(scope); };
    var drop = scope.querySelector('[data-as-drop]');
    if (drop) {
      ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
      drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadPhoto(scope, e.dataTransfer.files[0]); });
    }
    // parallax
    var theatre = scope.querySelector('.as-theatre'), arch = scope.querySelector('.as-arch');
    theatre.addEventListener('pointermove', function (e) { if (S.mode === 'photo') return; var r = theatre.getBoundingClientRect(); var dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5; arch.style.transform = 'rotateY(' + (dx * 9) + 'deg) rotateX(' + (-dy * 7) + 'deg)'; });
    theatre.addEventListener('pointerleave', function () { arch.style.transform = 'none'; });
  }

  return { html: html, init: init };
})();
