/* enhance.js — cursor spotlight on cards + subtle scroll parallax on mockups.
   Self-contained, null-safe, respects prefers-reduced-motion. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Cursor spotlight: feed --mx/--my to the card ::after gradient ── */
  var glowCards = document.querySelectorAll('.testimonial-card, .team-member, .include-card');
  glowCards.forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });

  if (reduce) return;

  /* ── Micro 3D tilt on cards (fine pointer only, subtle by design) ── */
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) {
    var TILT = 5; // deg — small on purpose, premium not gimmicky
    var tiltCards = document.querySelectorAll('.svc-card:not(.svc-card--flagship), .pkg, .demo-card, .price-teaser__card');
    tiltCards.forEach(function (card) {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateX(' + (-py * TILT).toFixed(2) + 'deg) rotateY(' + (px * TILT).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ── Subtle scroll parallax on big feature visuals ── */
  var items = Array.prototype.slice.call(document.querySelectorAll('.feature__visual'));
  if (!items.length) return;

  var MAX = 18; // px — kept small on purpose; the site should feel calm, not floaty
  var ticking = false;

  function update() {
    var vh = window.innerHeight;
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) continue;
      var center = r.top + r.height / 2;
      var delta = (center - vh / 2) / vh; // ~ -0.6 .. 0.6
      var y = Math.max(-MAX, Math.min(MAX, delta * -MAX * 2));
      el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
