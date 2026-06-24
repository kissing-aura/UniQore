/* gsap-effects.js — ScrollTrigger animations (Spylt-style) */
(function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 900;

    // ── 1. Hero scrub parallax ────────────────────────────────────────────────
    const heroLeft  = document.querySelector('.hero__left');
    const heroRight = document.querySelector('.hero__right');
    const heroVideo = document.querySelector('.hero__video');

    if (heroLeft) {
      gsap.to(heroLeft, {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (heroRight && !isMobile) {
      gsap.to(heroRight, {
        yPercent: -7,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (heroVideo) {
      gsap.to(heroVideo, {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // ── 2. Cases horizontal pinned scroll (desktop only) ─────────────────────
    if (!isMobile) {
      const casesTrack = document.querySelector('.cases__track');
      const casesGrid  = document.querySelector('.cases__grid');

      if (casesTrack && casesGrid) {
        const scrollDist = casesGrid.scrollWidth - window.innerWidth;

        if (scrollDist > 0) {
          gsap.to(casesGrid, {
            x: -scrollDist,
            ease: 'none',
            scrollTrigger: {
              trigger: casesTrack,
              pin: true,
              scrub: 1,
              end: () => `+=${scrollDist}`,
              invalidateOnRefresh: true,
            },
          });
        }
      }
    }

    // ── 3. Atmosphere image parallax scrub ───────────────────────────────────
    const atmPhoto = document.querySelector('.atm-img__photo');
    if (atmPhoto) {
      gsap.to(atmPhoto, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.atm-img',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // ── 4. Section titles — clip-path word reveal on scrub ───────────────────
    document.querySelectorAll('.section-title').forEach(title => {
      const words = title.querySelectorAll('.word-reveal');
      if (!words.length) return;

      gsap.fromTo(words,
        { 'clip-path': 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', opacity: 1, y: 0 },
        {
          'clip-path': 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
          stagger: 0.045,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    // ── 5. Service cards stagger entrance ────────────────────────────────────
    const serviceCards = gsap.utils.toArray('.service-card');
    if (serviceCards.length) {
      gsap.from(serviceCards, {
        y: 60,
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.services__grid',
          start: 'top 80%',
          once: true,
        },
      });
      // Remove data-reveal so GSAP owns these
      serviceCards.forEach(c => {
        c.removeAttribute('data-reveal');
        c.classList.add('revealed');
      });
    }

    // ── 6. Mockup showcases stagger ──────────────────────────────────────────
    const showcases = gsap.utils.toArray('.mockup-showcase');
    if (showcases.length) {
      gsap.from(showcases, {
        y: 50,
        opacity: 0,
        duration: 0.85,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.mockups__grid',
          start: 'top 78%',
          once: true,
        },
      });
      showcases.forEach(c => { c.removeAttribute('data-reveal'); c.classList.add('revealed'); });
    }

    // ── 7. Guarantee cards stagger ───────────────────────────────────────────
    const guaranteeCards = gsap.utils.toArray('.guarantee-card');
    if (guaranteeCards.length) {
      gsap.from(guaranteeCards, {
        y: 40,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.guarantees__grid',
          start: 'top 80%',
          once: true,
        },
      });
      guaranteeCards.forEach(c => { c.removeAttribute('data-reveal'); c.classList.add('revealed'); });
    }

    // ── 8. Process steps stagger ─────────────────────────────────────────────
    const processSteps = gsap.utils.toArray('.process-step');
    if (processSteps.length) {
      gsap.from(processSteps, {
        x: -40,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.process__steps',
          start: 'top 78%',
          once: true,
        },
      });
      processSteps.forEach(c => { c.removeAttribute('data-reveal'); c.classList.add('revealed'); });
    }

    // ── 9. Niches bg image parallax ──────────────────────────────────────────
    const nichesBg = document.querySelector('.niches__bg-img');
    if (nichesBg) {
      gsap.to(nichesBg, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.niches',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }

  // Wait for both DOM and deferred GSAP scripts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 50));
  } else {
    setTimeout(init, 50);
  }
})();
