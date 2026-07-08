/* ИИ-диагностика снимка — вау-раздел стоматологии ДЕНТАЛИС.
   Экспортит UQ_AISCAN.html() (разметка) и UQ_AISCAN.init() (запуск после mount).
   Хореография на setTimeout — отрабатывает даже в фоне. Всё в .aiscan-scope. */
window.UQ_AISCAN = (function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var PATIENT = 'Николай Орлов', IMGID = 'OPG-2481-07', N = 32, DUR = 3400;
  var FIND = [
    { i: 2,  type: 'Кариес',        sev: 'high', col: '#ff4d5e', conf: 96, ic: '✕', pill: 'Срочно',   note: 'Зуб 2.6 · дистальная поверхность, средняя глубина' },
    { i: 29, type: 'Износ пломбы',  sev: 'med',  col: '#ffb020', conf: 83, ic: '⚑', pill: 'Замена',   note: 'Зуб 4.6 · нарушено краевое прилегание' },
    { i: 13, type: 'Трещина эмали', sev: 'med',  col: '#ffb020', conf: 88, ic: '⚠', pill: 'Контроль', note: 'Зуб 3.5 · вертикальная микротрещина' },
    { i: 18, type: 'Норма',         sev: 'ok',   col: '#31e0b0', conf: 99, ic: '✓', pill: 'Здоров',   note: 'Патологий не выявлено' },
  ];
  var S = { timers: [], intervals: [], raf: null, parts: [] };

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
          '<div class="as-beam"></div>' +
          '<div class="as-ret"></div>' +
          '<div class="as-status">СКАНИРОВАНИЕ…</div>' +
          '<div class="as-foot">frontend-демо · Uniqore</div>' +
        '</div>' +
        '<div class="as-panel">' +
          '<div class="as-ph"><h3>🦷 ИИ-анализ снимка</h3><small class="as-sub">Готов к запуску · 32 зуба в кадре</small></div>' +
          '<div class="as-find"><div class="as-idle">Нажми «Запустить ИИ-анализ» — нейросеть просканирует снимок, найдёт патологии и соберёт план лечения за секунды.</div></div>' +
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
    var svg = scope.querySelector('.as-arch svg'), vb = svg.viewBox.baseVal;
    var r = svg.getBoundingClientRect(), tr = scope.querySelector('.as-theatre').getBoundingClientRect();
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

  function addReticle(scope, f, teeth) {
    var p = toPx(scope, teeth[f.i].x, teeth[f.i].y);
    var el = document.createElement('div'); el.className = 'as-r' + (teeth[f.i].x < 450 ? ' left' : '');
    el.style.color = f.col; el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
    el.innerHTML = '<div class="as-ring"><div class="as-spin"></div></div><div class="as-tag"><b>' + esc(f.type) + '</b><span>уверенность <span class="c" data-c>0</span>%</span></div>';
    scope.querySelector('.as-ret').appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 20);
    var cEl = el.querySelector('[data-c]'), c = 0;
    var iv = setInterval(function () { c += Math.ceil((f.conf - c) / 6); if (c >= f.conf) { c = f.conf; clearInterval(iv); } cEl.textContent = c; }, 40);
    S.intervals.push(iv);
  }
  function addFinding(scope, f) {
    var box = scope.querySelector('.as-find');
    var row = document.createElement('div'); row.className = 'as-f'; row.style.color = f.col;
    row.innerHTML = '<div class="as-f__ic">' + f.ic + '</div><div class="as-f__b"><div class="as-f__t">' + esc(f.type) + '<span class="as-pill">' + esc(f.pill) + '</span></div><div class="as-f__n">' + esc(f.note) + '</div><div class="as-f__m"><div class="as-bar"><i></i></div><span class="as-f__c">' + f.conf + '%</span></div></div>';
    box.appendChild(row);
    setTimeout(function () { row.classList.add('in'); row.querySelector('.as-bar i').style.width = f.conf + '%'; }, 20);
    box.scrollTop = box.scrollHeight;
  }

  function reset(scope, teeth) {
    clearAll();
    scope.querySelector('.as-ret').innerHTML = '';
    var cv = scope.querySelector('.as-fx'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
    scope.querySelector('.as-find').innerHTML = '';
    teeth.forEach(function (t) { t.g.setAttribute('class', 'as-tooth'); });
    scope.querySelector('.as-verdict').classList.remove('in');
    scope.querySelector('.as-vr-fill').style.strokeDashoffset = 176;
    scope.querySelector('.as-vr-pct').textContent = '0';
    var beam = scope.querySelector('.as-beam'); beam.classList.remove('run'); void beam.offsetWidth;
  }

  function run(scope, teeth) {
    reset(scope, teeth);
    var btn = scope.querySelector('[data-as-run]'), rep = scope.querySelector('[data-as-replay]');
    btn.disabled = true; rep.style.display = 'none';
    scope.querySelector('.as-sub').textContent = 'Нейросеть сканирует снимок…';
    scope.querySelector('.as-rlbl').textContent = 'Анализ…';
    scope.querySelector('.as-status').classList.add('on');
    var beam = scope.querySelector('.as-beam'); beam.classList.add('run');
    // sweep teeth light
    teeth.forEach(function (t) { var tm = Math.max(0, Math.min(1, t.x / 900)) * DUR; later(function () { t.g.classList.add('lit'); later(function () { t.g.classList.remove('lit'); }, 340); }, tm); });
    // findings
    FIND.forEach(function (f) {
      var tm = Math.max(0, Math.min(1, teeth[f.i].x / 900)) * DUR;
      later(function () { teeth[f.i].g.setAttribute('class', 'as-tooth f-' + f.sev); burst(scope, teeth[f.i].x, teeth[f.i].y, f.col); addReticle(scope, f, teeth); addFinding(scope, f); }, tm);
    });
    later(function () { finish(scope, teeth); }, DUR + 120);
  }

  function finish(scope, teeth) {
    scope.querySelector('.as-status').classList.remove('on');
    teeth.forEach(function (t) { t.g.classList.remove('lit'); });
    scope.querySelector('.as-verdict').classList.add('in');
    var pct = 94, c = 0, fill = scope.querySelector('.as-vr-fill'), pctEl = scope.querySelector('.as-vr-pct');
    var iv = setInterval(function () { c += 2; if (c >= pct) { c = pct; clearInterval(iv); } pctEl.textContent = c; fill.style.strokeDashoffset = 176 - (176 * c / 100); }, 26);
    S.intervals.push(iv);
    var bad = FIND.filter(function (f) { return f.sev !== 'ok'; }).length, ok = FIND.length - bad;
    scope.querySelector('.as-sub').textContent = 'Анализ завершён · ' + FIND.length + ' находки';
    scope.querySelector('.as-vtext').textContent = 'Найдено ' + bad + ' патологии · ' + ok + ' зуб в норме. План лечения сформирован.';
    scope.querySelector('.as-rlbl').textContent = 'Готово';
    scope.querySelector('[data-as-replay]').style.display = 'flex';
  }

  function init() {
    var scope = document.querySelector('.aiscan-scope'); if (!scope) return;
    scope.style.setProperty('--as-dur', DUR + 'ms');
    clearAll();
    var teeth = buildArch(scope);
    scope.querySelector('[data-as-run]').onclick = function () { run(scope, teeth); };
    scope.querySelector('[data-as-replay]').onclick = function () {
      scope.querySelector('.as-sub').textContent = 'Готов к запуску · 32 зуба в кадре';
      scope.querySelector('.as-rlbl').textContent = 'Запустить ИИ-анализ';
      scope.querySelector('[data-as-run]').disabled = false;
      reset(scope, teeth);
    };
    var theatre = scope.querySelector('.as-theatre'), arch = scope.querySelector('.as-arch');
    theatre.addEventListener('pointermove', function (e) { var r = theatre.getBoundingClientRect(); var dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5; arch.style.transform = 'rotateY(' + (dx * 9) + 'deg) rotateX(' + (-dy * 7) + 'deg)'; });
    theatre.addEventListener('pointerleave', function () { arch.style.transform = 'none'; });
  }

  return { html: html, init: init };
})();
