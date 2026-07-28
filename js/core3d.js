/* core3d.js — сигнатура /sistema/: «Ядро системы».
   Светящееся ядро-кристалл в центре, вокруг — орбита из 6 модулей
   (Сайт, CRM, Боты, Реклама, Склад, Аналитика). Линии модуль→ядро,
   пульсы данных стекаются в центр. Подписи модулей — DOM-оверлей
   (текст должен читаться), позиционируются по 3D-проекции каждый кадр.
   Bounded canvas в секции (НЕ fixed-fullscreen) → без протеканий.
   Перф-гейт: мобилка/reduced-motion/no-WebGL → SVG-постер, three не грузится. */
(function () {
  'use strict';

  var stage = document.getElementById('core');
  if (!stage) return;
  var canvas = stage.querySelector('.core-canvas');
  var labelsEl = stage.querySelector('.core-labels');
  var viewport = stage.querySelector('.core-viewport');
  if (!canvas || !labelsEl || !viewport) return;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGL = false;
  try { var tc = document.createElement('canvas'); hasGL = !!(tc.getContext('webgl') || tc.getContext('experimental-webgl')); } catch (e) {}
  function poster() { stage.classList.add('core-stage--poster'); }
  // Перф-гейт: на мобилке (<900) показываем статичный постер, three не грузим.
  // Десктоп ≥900 не затронут — 3D-ядро крутится как раньше.
  if (reduce || !hasGL || window.innerWidth < 900) { poster(); return; }

  var MODS = ['Сайт', 'CRM', 'Чат-боты', 'Реклама', 'Склад', 'Аналитика'];

  function loadThree(cb) {
    if (window.THREE) { cb(); return; }
    var s = document.createElement('script');
    s.src = '/js/three.min.js?v=r160';
    s.onload = function () { window.THREE ? cb() : poster(); };
    s.onerror = poster;
    document.head.appendChild(s);
  }

  var built = false;
  function build() {
    if (built) return; built = true;
    var THREE = window.THREE;
    var W = viewport.clientWidth, H = viewport.clientHeight;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    var scene = new THREE.Scene();
    var portrait = W < 720;
    var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, portrait ? 13.2 : 9.4); // на узком экране отодвигаем, чтобы орбита влезла

    var group = new THREE.Group(); scene.add(group);

    // ── ядро: wireframe-кристалл + мягкое свечение + яркая точка ──
    var ico = new THREE.IcosahedronGeometry(2.15, 1);
    var wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(ico),
      new THREE.LineBasicMaterial({ color: 0xCDFF4F, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    group.add(wire);
    var glow = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 2),
      new THREE.MeshBasicMaterial({ color: 0xCDFF4F, transparent: true, opacity: 0.10, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    group.add(glow);
    var coreDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xEAFFB0, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    group.add(coreDot);

    // ── орбита модулей ──
    var orbit = new THREE.Group(); group.add(orbit);
    var R = portrait ? 3.9 : 5.3;
    var nodes = [], lines = [], lineMat = [], pulses = [], labelDivs = [];
    var nodeGeo = new THREE.SphereGeometry(0.17, 16, 16);
    var pulseGeo = new THREE.SphereGeometry(0.09, 10, 10);
    for (var i = 0; i < MODS.length; i++) {
      var ang = i / MODS.length * Math.PI * 2;
      var pos = new THREE.Vector3(Math.cos(ang) * R, Math.sin(ang) * R * 0.42, Math.sin(ang) * R * 0.55);
      var node = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: 0xCDFF4F, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
      node.position.copy(pos); orbit.add(node); nodes.push(node);

      var lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      var lm = new THREE.LineBasicMaterial({ color: 0xCDFF4F, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false });
      orbit.add(new THREE.Line(lg, lm)); lines.push(lg); lineMat.push(lm);

      var pm = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: 0xEAFFB0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      orbit.add(pm); pulses.push({ mesh: pm, t: Math.random() });

      var d = document.createElement('div');
      d.className = 'core-label'; d.textContent = MODS[i]; d.dataset.i = i;
      labelsEl.appendChild(d); labelDivs.push(d);
    }

    // hover: подсветка модуля ↔ линии ↔ пульса
    var active = -1;
    labelDivs.forEach(function (d) {
      d.addEventListener('pointerenter', function () { active = +d.dataset.i; });
      d.addEventListener('pointerleave', function () { active = -1; });
    });

    // мышь → мягкий parallax всей сцены
    var mx = 0, my = 0;
    viewport.addEventListener('pointermove', function (e) {
      var r = viewport.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    });
    viewport.addEventListener('pointerleave', function () { mx = 0; my = 0; });

    var tmp = new THREE.Vector3(), wp = new THREE.Vector3();
    var visible = true, raf = 0, last = performance.now();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible = e.isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } });
    }, { rootMargin: '100px' });
    io.observe(stage);

    function tick(now) {
      if (!visible || document.hidden) { raf = 0; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      var t = now / 1000;

      orbit.rotation.y += dt * 0.095;
      group.rotation.y += (mx * 0.5 - group.rotation.y) * 0.05;
      group.rotation.x += (my * 0.32 - group.rotation.x) * 0.05;

      var br = 1 + Math.sin(t * 0.95) * 0.04;
      wire.scale.setScalar(br); wire.rotation.y += dt * 0.15; wire.rotation.x += dt * 0.07;
      glow.scale.setScalar(br * 1.02);
      coreDot.scale.setScalar(1 + Math.sin(t * 1.5) * 0.1);

      for (var i = 0; i < nodes.length; i++) {
        var on = active === i;
        // линия модуль→центр (в локальных координатах орбиты)
        var lp = lines[i].attributes.position.array;
        lp[0] = nodes[i].position.x; lp[1] = nodes[i].position.y; lp[2] = nodes[i].position.z;
        lp[3] = 0; lp[4] = 0; lp[5] = 0;
        lines[i].attributes.position.needsUpdate = true;
        lineMat[i].opacity = on ? 0.62 : 0.16;
        nodes[i].scale.setScalar(on ? 1.8 : 1);

        // пульс стекает node→ядро
        var pu = pulses[i];
        pu.t = (pu.t + dt * (on ? 0.6 : 0.28)) % 1;
        pu.mesh.position.copy(nodes[i].position).multiplyScalar(1 - pu.t);
        pu.mesh.material.opacity = (0.25 + 0.7 * Math.sin(pu.t * Math.PI)) * (on ? 1 : 0.65);

        // подпись — проекция мировой позиции узла на экран
        nodes[i].getWorldPosition(wp); tmp.copy(wp).project(camera);
        var sx = (tmp.x * 0.5 + 0.5) * W, sy = (-tmp.y * 0.5 + 0.5) * H;
        var d = labelDivs[i];
        d.style.left = sx.toFixed(1) + 'px'; d.style.top = sy.toFixed(1) + 'px';
        d.style.opacity = (tmp.z < 1 ? (wp.z < -1.5 ? 0.5 : 1) : 0).toString(); // дальние (за ядром) чуть тусклее
        d.classList.toggle('is-active', on);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }

    function resize() {
      W = viewport.clientWidth; H = viewport.clientHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
    }
    addEventListener('resize', resize); resize();
    raf = requestAnimationFrame(tick);
  }

  // строим при приближении (500px), LCP не трогаем
  var pre = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { loadThree(build); pre.disconnect(); } });
  }, { rootMargin: '500px' });
  pre.observe(stage);
})();
