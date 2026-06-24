/* gsap-effects.js — Scroll parallax + horizontal cases (no data-reveal conflicts) */
(function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 900;

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
          // start:'top top' = pin fires only after niches section fully scrolled away
          // Buffer: pause 300px before and after horizontal scroll so
          // first/last cards are always fully visible
          const buffer = 300;
          const totalScroll = buffer + scrollDist + buffer;

          gsap.timeline({
            scrollTrigger: {
              trigger: casesTrack,
              start: 'top top',
              pin: true,
              scrub: 1.5,
              end: () => `+=${totalScroll}`,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(casesGrid, { x: 0 }, { x: 0, duration: buffer, ease: 'none' })
          .fromTo(casesGrid, { x: 0 }, { x: -scrollDist, duration: scrollDist, ease: 'none' })
          .fromTo(casesGrid, { x: -scrollDist }, { x: -scrollDist, duration: buffer, ease: 'none' });
        }
      }
    }

    // ── 3. Atmosphere image parallax ─────────────────────────────────────────
    const atmPhoto = document.querySelector('.atm-img__photo');
    if (atmPhoto) {
      gsap.to(atmPhoto, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: '.atm-img', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }

    // ── 4. Niches bg image parallax ──────────────────────────────────────────
    const nichesBg = document.querySelector('.niches__bg-img');
    if (nichesBg) {
      gsap.to(nichesBg, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: '.niches', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  }

  // Wait for deferred GSAP to be ready
  window.addEventListener('load', () => setTimeout(init, 300));
})();
