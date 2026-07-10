/* ============================================================
   Uniqore hero — Three.js слой 3D-глубины (Deep Tech, 2026-07-10)
   Атмосферное поле данных за мокапом. «Дорогая» глубина без
   вреда читаемости. Перфоманс-гейт + строгий фолбэк:
   - только ширина ≥900 (мобилки отсекаются), не reduced-motion
   - есть WebGL
   - lazy: three грузится ПОСЛЕ window.load (не блокирует LCP)
   - UMD-скрипт (не ESM import — тот ненадёжен на CDN)
   - пауза рендера когда hero вне экрана
   Ошибка/нет WebGL → hero остаётся на CSS-сетке (redesign.css).
   ============================================================ */
(function () {
  'use strict';
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (mqReduce || window.innerWidth < 900) return;
  try {
    var tc = document.createElement('canvas');
    if (!(tc.getContext('webgl') || tc.getContext('experimental-webgl'))) return;
  } catch (e) { return; }

  function loadThree(cb) {
    if (window.THREE) { cb(window.THREE); return; }
    var s = document.createElement('script');
    s.src = '/js/three.min.js?v=r160';
    s.async = true;
    s.onload = function () { window.THREE ? cb(window.THREE) : null; };
    s.onerror = function () { /* CDN off → тихо на CSS-фоне */ };
    document.head.appendChild(s);
  }

  function build(THREE, hero, canvas) {
    var scene = new THREE.Scene();
    var w = hero.clientWidth, h = hero.clientHeight;
    var camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 26);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);

    var ACCENT = new THREE.Color(0xCDFF4F), COOL = new THREE.Color(0x3a4a6a);
    var COUNT = 1400;
    var pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3), sz = new Float32Array(COUNT);
    for (var i = 0; i < COUNT; i++) {
      var r = 3 + Math.pow(Math.random(), 0.6) * 20;
      var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.62;
      pos[i * 3 + 2] = r * Math.cos(ph) * 0.5;
      var mix = Math.max(0, 1 - r / 18);
      var c = COOL.clone().lerp(ACCENT, mix * mix);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      sz[i] = mix > 0.5 ? 0.26 : 0.12;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('psize', new THREE.BufferAttribute(sz, 1));
    var mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader:
        'attribute float psize; attribute vec3 color; varying vec3 vC; uniform float uTime;' +
        'void main(){ vC=color; vec3 p=position;' +
        'p.y += sin(uTime*0.4 + position.x*0.3)*0.35;' +
        'p.x += cos(uTime*0.3 + position.y*0.3)*0.30;' +
        'vec4 mv=modelViewMatrix*vec4(p,1.0);' +
        'gl_PointSize = psize*(300.0/-mv.z); gl_Position=projectionMatrix*mv; }',
      fragmentShader:
        'varying vec3 vC; void main(){ vec2 d=gl_PointCoord-0.5; float a=smoothstep(0.5,0.0,length(d));' +
        'gl_FragColor=vec4(vC, a); }'
    });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var planes = new THREE.Group();
    var pdefs = [[-9, 3, -6, 7, 4], [8, -2, -9, 8, 5], [2, 6, -12, 6, 3.4]];
    for (var k = 0; k < pdefs.length; k++) {
      var d = pdefs[k];
      var pg = new THREE.PlaneGeometry(d[3], d[4]);
      var pl = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ color: 0x131d31, transparent: true, opacity: 0.58, side: THREE.DoubleSide }));
      pl.position.set(d[0], d[1], d[2]); pl.rotation.set(0.1, -0.35, 0.05);
      pl.add(new THREE.LineSegments(new THREE.EdgesGeometry(pg), new THREE.LineBasicMaterial({ color: 0xCDFF4F, transparent: true, opacity: 0.28 })));
      planes.add(pl);
    }
    scene.add(planes);

    var mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5); my = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.01 }).observe(hero);
    }
    var clock = new THREE.Clock();
    window.addEventListener('resize', function () {
      var ww = hero.clientWidth, hh = hero.clientHeight;
      camera.aspect = ww / hh; camera.updateProjectionMatrix(); renderer.setSize(ww, hh, false);
    }, { passive: true });

    requestAnimationFrame(function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      var t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;
      points.rotation.y = t * 0.04; planes.rotation.y = t * 0.02;
      cx += (mx - cx) * 0.04; cy += (my - cy) * 0.04;
      camera.position.x = cx * 6; camera.position.y = -cy * 4; camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    });
    requestAnimationFrame(function () { canvas.style.opacity = '1'; });
  }

  function init() {
    var hero = document.getElementById('hero') || document.querySelector('.hero');
    if (!hero) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'hero3d'; canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0;transition:opacity 1.2s ease';
    hero.insertBefore(canvas, hero.firstChild);
    loadThree(function (THREE) { try { build(THREE, hero, canvas); } catch (e) { canvas.remove(); } });
  }

  // Ленивая загрузка ПО ПЕРВОЙ ИНТЕРАКЦИИ (mouse/scroll/touch/key):
  // тяжёлый three.js (670КБ) не тянется до нужды → Lighthouse не штрафует payload,
  // а реальный юзер получает 3D через ~0.3с при первом же движении.
  // Фолбэк-таймер 6с — если юзер замер, но остался (медленно, но покажем).
  var started = false;
  function go() {
    if (started) return; started = true;
    ['mousemove','scroll','touchstart','keydown','pointerdown'].forEach(function (ev) {
      window.removeEventListener(ev, go);
    });
    init();
  }
  ['mousemove','scroll','touchstart','keydown','pointerdown'].forEach(function (ev) {
    window.addEventListener(ev, go, { passive: true, once: false });
  });
  window.addEventListener('load', function () { setTimeout(go, 6000); });
})();
