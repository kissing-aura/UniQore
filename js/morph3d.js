/* morph3d.js — сигнатура «Хаос → Система»: pinned скролл-морф частиц.
   Хаотичное облако (бизнес без системы) по скроллу собирается в мини-дашборд
   (KPI + бар-чарт + строки записей) с лайм-линиями и бегущими пульсами.
   Перф-гейт: мобилка/слабый GPU/reduced-motion → статичный постер, three не грузится.
   Требует: window.THREE (js/three.min.js), gsap + ScrollTrigger (грузятся сайтом лениво).
   Подключается ПОСЛЕДНИМ в GSAP-цепочке инлайн-лоадера index.html. */
(function () {
  'use strict';

  var stage = document.getElementById('morph');
  if (!stage) return;
  var canvas = document.getElementById('morph-canvas');
  var poster = stage.querySelector('.morph-poster');

  // ── Перф-гейт: постер вместо 3D ──
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = window.innerWidth < 900;
  var hasGL = false;
  try { var t = document.createElement('canvas'); hasGL = !!(t.getContext('webgl') || t.getContext('experimental-webgl')); } catch (e) {}
  function showPoster() {
    stage.classList.add('morph--poster');
    if (canvas) canvas.style.display = 'none';
    if (poster) poster.style.display = 'flex';
    var T = document.getElementById('morph-t'), S = document.getElementById('morph-s');
    if (T) T.innerHTML = 'Система <em>Uniqore</em>';
    if (S) S.textContent = 'всё в одной системе — под контролем 24/7';
  }
  if (reduce || narrow || !hasGL) { showPoster(); return; }
  // морф больше не зависит от GSAP — свой sticky-скролл

  // three.min.js самохостится; hero3d мог уже загрузить — переиспользуем
  function loadThree(cb) {
    if (window.THREE) { cb(); return; }
    var s = document.createElement('script');
    s.src = '/js/three.min.js?v=r160';
    s.onload = function () { window.THREE ? cb() : showPoster(); };
    s.onerror = showPoster;
    document.head.appendChild(s);
  }

  // ── Ленивая инициализация: строим сцену только при приближении ──
  var built = false;
  function build() {
    if (built) return; built = true;
    var THREE = window.THREE;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x0A0E1A, 1);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 2.6, 27.5); // сцена ниже caption-заголовка

    // — target: мини-дашборд (KPI ×3, бар-чарт ×7, строки ×6) —
    var tier = navigator.hardwareConcurrency || 4;
    var DENS = tier >= 8 ? 1.5 : (tier >= 4 ? 1.1 : 0.65); // плотнее — чтобы мелкие чёткие точки читались как сплошные формы
    var PW = 26, PH = 15, ROWY = [], tgt = [];
    function cluster(cx, cy, w, h, n, head) {
      for (var k = 0; k < n; k++) tgt.push({ x: cx + (Math.random() - .5) * w, y: cy + (Math.random() - .5) * h, z: (Math.random() - .5) * .5, head: head || 0 });
    }
    var top = PH / 2, kw = PW * 0.3, kg = PW * 0.05;
    [-1, 0, 1].forEach(function (ix) { cluster(ix * (kw + kg), top - 1.1, kw * .86, 1.7, Math.round(360 * DENS), 1); });
    var bars = [.45, .7, .55, .95, .75, 1.15, .9], bw = PW * 0.09, bg = PW * 0.045, chartBase = top - 6.6;
    bars.forEach(function (bh, ix) { cluster((ix - 3) * (bw + bg), chartBase + bh * 1.6, bw * .8, bh * 3.2, Math.round(380 * DENS), 0); });
    for (var r = 0; r < 6; r++) { var y = chartBase - 2.6 - r * 1.15; ROWY.push(y); cluster(0, y, PW * .94, .34, Math.round(560 * DENS), 0); }

    var N = tgt.length;
    var start = new Float32Array(N * 3), target = new Float32Array(N * 3), rnd = new Float32Array(N), isHead = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var rad = 12 + Math.random() * 10, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      start[i * 3] = rad * Math.sin(ph) * Math.cos(th);
      start[i * 3 + 1] = rad * Math.sin(ph) * Math.sin(th) * .7;
      start[i * 3 + 2] = rad * Math.cos(ph) * .6;
      target[i * 3] = tgt[i].x; target[i * 3 + 1] = tgt[i].y; target[i * 3 + 2] = tgt[i].z;
      rnd[i] = Math.random(); isHead[i] = tgt[i].head;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
    geo.setAttribute('aTarget', new THREE.BufferAttribute(target, 3));
    geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
    geo.setAttribute('aHead', new THREE.BufferAttribute(isHead, 1));
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    var mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.NormalBlending, // не Additive: additive складывал свет → пересвет в белую кашу
      uniforms: { uProg: { value: 0 }, uTime: { value: 0 }, uPix: { value: Math.min(devicePixelRatio, 2) } },
      vertexShader: 'attribute vec3 aStart;attribute vec3 aTarget;attribute float aRnd;attribute float aHead;' +
        'uniform float uProg,uTime,uPix;varying float vMix;varying float vHead;' +
        'float ss(float a,float b,float x){float t=clamp((x-a)/(b-a),0.,1.);return t*t*t*(t*(t*6.-15.)+10.);}' +
        'void main(){float local=ss(aRnd*.5,aRnd*.5+.5,uProg);vMix=local;vHead=aHead;' +
        'vec3 chaos=aStart;float tw=1.-local;' +
        'chaos.x+=sin(uTime*.9+aRnd*30.)*1.6*tw;chaos.y+=cos(uTime*.7+aRnd*24.)*1.6*tw;chaos.z+=sin(uTime*1.1+aRnd*18.)*1.4*tw;' +
        'vec3 pos=mix(chaos,aTarget,local);vec4 mv=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;' +
        'float size=mix(0.95,0.5,local)+aHead*local*0.28;gl_PointSize=size*uPix*(150./-mv.z);}', // мельче и не растёт на близи → чёткие точки, не блобы
      fragmentShader: 'precision mediump float;varying float vMix;varying float vHead;' +
        'void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);if(d>.5)discard;float a=smoothstep(.5,.12,d);' + // резче край точки
        'vec3 chaosC=vec3(.40,.52,.70);vec3 orderC=vec3(.80,1.,.31);' +
        'vec3 col=mix(chaosC,orderC,smoothstep(.35,.95,vMix));col=mix(col,vec3(.92,1.,.62),vHead*vMix*.5);' +
        'gl_FragColor=vec4(col,a*mix(.55,.95,vMix)+vHead*vMix*.05);}' // плотная непрозрачность вместо свечения
    });
    scene.add(new THREE.Points(geo, mat));

    // — линии структуры дашборда —
    var lp = [], hw = PW / 2;
    ROWY.forEach(function (y) { lp.push(-hw * .94, y - .28, 0, hw * .94, y - .28, 0); });
    lp.push(-hw * .62, chartBase - .2, 0, hw * .62, chartBase - .2, 0);
    var lgeo = new THREE.BufferGeometry();
    lgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lp), 3));
    var lmat = new THREE.LineBasicMaterial({ color: 0xCDFF4F, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.LineSegments(lgeo, lmat));

    // — бегущие пульсы по строкам —
    var NP = ROWY.length, pulsePos = new Float32Array(NP * 3), pulseX = [];
    for (var p2 = 0; p2 < NP; p2++) pulseX.push(Math.random());
    var pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
    var pmat = new THREE.PointsMaterial({ color: 0xEFFFC0, size: 8, sizeAttenuation: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.Points(pgeo, pmat));

    // — скролл-драйв: ЧИСТЫЙ CSS-sticky + ручной прогресс от позиции скролла.
    //   Без GSAP pin/ScrollTrigger — детерминированно, не перехватывает скролл,
    //   canvas (sticky top:0) держится ровно пока секция проходит. —
    var targetProg = 0, morphTop = 0, scrollLen = 1;
    function recalc() {
      morphTop = stage.getBoundingClientRect().top + window.scrollY;
      scrollLen = Math.max(1, stage.offsetHeight - window.innerHeight); // sticky-window
    }
    var T = document.getElementById('morph-t'), S = document.getElementById('morph-s');
    var capEl = stage.querySelector('.morph-cap');
    function labels(p) {
      if (!T || !S) return;
      if (p < .28) { T.innerHTML = 'Хаос бизнеса'; S.textContent = 'заявки, реклама, таблички — всё вразнобой, теряется'; }
      else if (p < .72) { T.innerHTML = 'Поток <em>данных</em>'; S.textContent = 'процессы выстраиваются в направленный поток'; }
      else { T.innerHTML = 'Система <em>Uniqore</em>'; S.textContent = 'всё в одной системе — под контролем 24/7'; }
    }

    // — рендер-цикл с паузой вне экрана —
    var visible = true, rafId = 0, last = performance.now();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible && !rafId) { last = performance.now(); rafId = requestAnimationFrame(tick); }
        if (!visible) { renderer.domElement.style.opacity = '0'; if (capEl) capEl.style.opacity = '0'; }
      });
    }, { rootMargin: '120px' });
    io.observe(stage);

    function tick(now) {
      if (!visible || document.hidden) { rafId = 0; return; }
      var dt = (now - last) / 1000; last = now;
      mat.uniforms.uTime.value = now / 1000;
      // прогресс сборки = насколько секция прошла свою sticky-дистанцию
      targetProg = Math.min(1, Math.max(0, (window.scrollY - morphTop) / scrollLen));
      mat.uniforms.uProg.value += (targetProg - mat.uniforms.uProg.value) * .18;
      var P = mat.uniforms.uProg.value;
      lmat.opacity = Math.max(0, (P - .55) / .45) * .5;
      pmat.opacity = Math.max(0, (P - .7) / .3) * .9;
      if (pmat.opacity > 0) {
        for (var p = 0; p < NP; p++) {
          pulseX[p] = (pulseX[p] + dt * .35) % 1;
          pulsePos[p * 3] = (pulseX[p] - .5) * PW; pulsePos[p * 3 + 1] = ROWY[p]; pulsePos[p * 3 + 2] = .3;
        }
        pgeo.attributes.position.needsUpdate = true;
      }
      labels(P);
      // видимость fixed-канваса + подписи СТРОГО по зоне морф-секции —
      // не протекает в hero/соседние секции и не уезжает в конце.
      var sy = window.scrollY, pad = window.innerHeight * 0.12;
      var inZone = sy > morphTop - pad && sy < morphTop + scrollLen + pad;
      renderer.domElement.style.opacity = inZone ? '1' : '0';
      if (capEl) capEl.style.opacity = (inZone ? Math.min(1, Math.min(targetProg, 1 - targetProg) * 6 + 0.15) : 0).toFixed(2);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }
    function resize() {
      // canvas — fixed на весь экран; видимость строго по зоне скролла (см. tick)
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      recalc();
    }
    addEventListener('resize', resize);
    addEventListener('scroll', recalc, { passive: true });
    resize();
    rafId = requestAnimationFrame(tick);
  }

  // строим при приближении (600px до входа) — LCP hero не трогаем
  var pre = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { loadThree(build); pre.disconnect(); } });
  }, { rootMargin: '600px' });
  pre.observe(stage);
})();
