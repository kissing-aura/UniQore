document.addEventListener('DOMContentLoaded', () => {
  // Page load fade-in
  document.body.classList.add('loaded');

  // Hero video: only load on desktop (saves bandwidth + GPU on mobile)
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    if (!('ontouchstart' in window) && window.innerWidth >= 900) {
      heroVideo.load();
    } else {
      heroVideo.style.display = 'none';
    }
  }

  // ── Custom cursor tracking ──
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (cursor && follower && !('ontouchstart' in window) && window.matchMedia('(pointer: fine)').matches) {
    let mx = -999, my = -999, fx = -999, fy = -999;
    let started = false;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
      if (!started) {
        // Snap follower to cursor on first move — no 0,0 slide
        fx = mx; fy = my;
        started = true;
        follower.style.opacity = '1';
        lerpFollower();
      }
    });

    follower.style.opacity = '0';

    function lerpFollower() {
      fx += (mx - fx) * 0.11;
      fy += (my - fy) * 0.11;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(lerpFollower);
    }

    document.querySelectorAll('a, button, [role="button"], .stack-tag, .niche-card__tags span').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--hover');
        follower.classList.add('cursor-follower--hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--hover');
        follower.classList.remove('cursor-follower--hover');
      });
    });
  }

  // ── tsParticles parallax on scroll ──
  const particlesEl = document.getElementById('tsparticles');
  if (particlesEl) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      particlesEl.style.transform = `translateY(${y * 0.18}px)`;
    }, { passive: true });
  }

  // ── Scroll progress bar ──
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${total > 0 ? scrolled / total : 0})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Scroll hint fade-out on scroll ──
  const scrollHint = document.getElementById('scroll-hint');
  if (scrollHint) {
    window.addEventListener('scroll', () => {
      scrollHint.style.opacity = window.scrollY > 80 ? '0' : '';
    }, { passive: true });
  }

  // ── Mockup: stagger appearance + counters ──
  const mockup = document.querySelector('.mockup-window');
  if (mockup) {
    setTimeout(() => mockup.classList.add('live'), 400);

    function animateMockupCounter(el) {
      const target = parseInt(el.dataset.mockupCounter, 10);
      const prefix = el.dataset.mockupPrefix || '';
      const suffix = el.dataset.mockupSuffix || '';
      const duration = 1400;
      const start = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 3);
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = prefix + Math.round(target * ease(p)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }

    setTimeout(() => {
      mockup.querySelectorAll('[data-mockup-counter]').forEach(animateMockupCounter);
    }, 600);
  }

  // Nav scroll effect
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile menu
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    burger.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
    });
  });

  // Scroll reveal
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // Counter animation for hero stats
  function animateCounter(el) {
    const target = parseInt(el.dataset.counterTarget, 10);
    const prefix = el.dataset.counterPrefix || '';
    const suffix = el.dataset.counterSuffix || '';
    const duration = 1800;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = prefix + Math.round(target * easeOut(p)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-counter-target]').forEach(animateCounter);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsBlock = document.querySelector('.hero__stats');
  if (statsBlock) counterObserver.observe(statsBlock);

  // FAQ accordion
  document.querySelectorAll('.faq-item__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-item__q').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.hidden = true;
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  // Seamless video crossfade loop
  (function initVideoLoop() {
    const FADE = 1.3;
    const TRIGGER = FADE + 0.35;
    const vA = document.getElementById('video-a');
    const vB = document.getElementById('video-b');
    if (!vA || !vB) return;

    let active = vA, standby = vB, busy = false;

    function crossfade() {
      if (busy) return;
      busy = true;
      standby.currentTime = 0;
      standby.play().catch(() => {});
      standby.style.opacity = '1';
      active.style.opacity = '0';
      setTimeout(() => {
        const prev = active;
        active = standby;
        standby = prev;
        prev.pause();
        prev.currentTime = 0;
        busy = false;
      }, (FADE + 0.35) * 1000);
    }

    function tick() {
      if (!active.duration) return;
      const rem = active.duration - active.currentTime;
      if (rem > 0 && rem <= TRIGGER) crossfade();
    }

    vA.addEventListener('timeupdate', tick);
    vB.addEventListener('timeupdate', tick);
  })();

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => sectionObserver.observe(s));
});
