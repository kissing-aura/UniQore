/* gsap-effects.js — Scroll parallax + horizontal cases (no data-reveal conflicts) */
(function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth <= 1024;

    // ── 1. Hero scrub parallax ────────────────────────────────────────────────
    const heroLeft  = document.querySelector('.hero__left');
    const heroVideo = document.querySelector('.hero__video');

    if (heroLeft) {
      gsap.to(heroLeft, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (heroVideo) {
      gsap.to(heroVideo, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // ── 2. Cases — now a vertical grid with CSS scroll-reveal (no pinned
    //       horizontal scroll). Removed because users scrolled right by
    //       instinct, it never moved, and the pin/scrub caused jank. Vertical
    //       grid = intuitive (scroll down) + buttery (no GSAP pin). ───────────

    // ── 3. Atmosphere image — motion handled by CSS Ken Burns (no GSAP
    //       transform here, it would fight the CSS animation). ────────────────

    // ── 4. Niches bg image parallax ──────────────────────────────────────────
    const nichesBg = document.querySelector('.niches__bg-img');
    if (nichesBg) {
      gsap.to(nichesBg, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: '.niches', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }

    // ── 6. SIGNATURE-момент: мокапы «Это ваша система» собираются из глубины ──
    //    3 окна поднимаются из-под сцены (rotateX + z-depth) со стаггером по
    //    мере входа секции в экран. Дефолт (без GSAP/reduced-motion) = финал:
    //    окна просто видны. Только десктоп — на мобилке 3D-глубина не читается.
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isMobile && !reduced) {
      const shows = gsap.utils.toArray('.mockup-showcase');
      if (shows.length) {
        gsap.timeline({
          scrollTrigger: { trigger: '.mockups', start: 'top 78%', end: 'top 26%', scrub: 0.6 },
        }).fromTo(shows,
          { yPercent: 22, z: -240, rotateX: 15, autoAlpha: 0.35, transformOrigin: '50% 100%' },
          { yPercent: 0, z: 0, rotateX: 0, autoAlpha: 1, ease: 'power2.out', stagger: 0.14 }
        );
      }
    }

    // ── 5. Niches headline travels DOWN with the list (to "Telegram-бизнес") ──
    if (!isMobile) {
      const nHead = document.querySelector('.niches__headline');
      const nList = document.querySelector('.niches__list');
      if (nHead && nList) {
        const drift = () => Math.max(0, nList.offsetHeight - nHead.offsetHeight - 24);
        gsap.fromTo(nHead, { y: 0 }, {
          y: drift,
          ease: 'none',
          scrollTrigger: {
            trigger: '.niches__inner',
            start: 'top 65%',
            end: 'bottom 85%',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    }
  }

  // If loaded lazily — window.load already fired, run immediately
  if (document.readyState === 'complete') {
    setTimeout(init, 100);
  } else {
    window.addEventListener('load', () => setTimeout(init, 100));
  }
})();
