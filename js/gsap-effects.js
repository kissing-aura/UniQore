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

    // ── 2. Cases horizontal pinned scroll (desktop only) ─────────────────────
    if (!isMobile) {
      const casesTrack = document.querySelector('.cases__track');
      const casesGrid  = document.querySelector('.cases__grid');

      if (casesTrack && casesGrid) {
        ScrollTrigger.refresh();
        const scrollDist = casesGrid.scrollWidth - window.innerWidth;

        if (scrollDist > 0) {
          // Force-reveal case cards when track pins — IO doesn't update fast
          // enough for position:fixed elements, causing opacity:0 black screen
          const revealOnPin = () => {
            casesTrack.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => {
              el.classList.add('revealed');
            });
          };

          // Start buffer: cards visible before horizontal begins
          // End buffer: last card visible before page scrolls down
          const startBuffer = 200;
          const endBuffer = 250;
          const totalScroll = startBuffer + scrollDist + endBuffer;

          gsap.timeline({
            scrollTrigger: {
              trigger: casesTrack,
              start: 'top top',
              pin: true,
              pinType: 'transform',
              anticipatePin: 1,
              scrub: 1,
              end: () => `+=${totalScroll}`,
              invalidateOnRefresh: true,
              onEnter: revealOnPin,
              onEnterBack: revealOnPin,
            },
          })
          // Linear 1:1 mapping to scroll — tight & smooth, no floaty easing lag.
          .fromTo(casesGrid, { x: 0 }, { x: 0, duration: startBuffer, ease: 'none' })
          .fromTo(casesGrid, { x: 0 }, { x: -scrollDist, duration: scrollDist, ease: 'none' })
          .fromTo(casesGrid, { x: -scrollDist }, { x: -scrollDist, duration: endBuffer, ease: 'none' });
        }
      }
    }

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
