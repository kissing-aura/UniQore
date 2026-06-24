document.addEventListener('DOMContentLoaded', () => {

  // ── Shared counter util ──
  function countUp(el, to, duration, prefix, suffix) {
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = prefix + Math.round(to * ease(p)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  function parseMetric(text) {
    if (!text || text.includes('–') || text.includes('-')) return null;
    const m = text.trim().match(/^([^\d]*)(\d+)(.*)$/);
    if (!m) return null;
    const num = parseInt(m[2], 10);
    if (num === 0) return null;
    return { prefix: m[1], num, suffix: m[3] };
  }

  // ── 1. Case card metric counters ──
  const caseObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.case-card__metric-val, .case-card__result-val').forEach((el, i) => {
        const p = parseMetric(el.textContent);
        if (!p) return;
        setTimeout(() => countUp(el, p.num, 1200, p.prefix, p.suffix), i * 180);
      });
      caseObs.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.case-card').forEach(el => caseObs.observe(el));

  // ── 2. Hero metrics counters ──
  const heroMetricsObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.hero__metric-num').forEach((el, i) => {
        const p = parseMetric(el.textContent);
        if (!p) return;
        setTimeout(() => countUp(el, p.num, 1400, p.prefix, p.suffix), 200 + i * 160);
      });
      heroMetricsObs.unobserve(entry.target);
    });
  }, { threshold: 0.7 });
  const heroMetrics = document.querySelector('.hero__metrics');
  if (heroMetrics) heroMetricsObs.observe(heroMetrics);

  // ── 3. CRM mockup bars animate on load ──
  const mockupBars = document.querySelectorAll('.ui-mockup__bar');
  if (mockupBars.length) {
    mockupBars.forEach(bar => {
      bar.dataset.h = bar.style.getPropertyValue('--h') || '50%';
    });
    // Disable transition, snap to 2%, force reflow, re-enable
    mockupBars.forEach(bar => {
      bar.style.transition = 'none';
      bar.style.setProperty('--h', '2%');
    });
    if (mockupBars[0]) mockupBars[0].getBoundingClientRect();
    mockupBars.forEach(bar => { bar.style.transition = ''; });

    const barObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        mockupBars.forEach((bar, i) => {
          setTimeout(() => bar.style.setProperty('--h', bar.dataset.h), 350 + i * 65);
        });
        barObs.disconnect();
      });
    }, { threshold: 0.6 });
    const frame = document.querySelector('.hero__frame');
    if (frame) barObs.observe(frame);
  }

  // ── 4. KPI numbers in CRM mockup ──
  const kpiNums = document.querySelectorAll('.ui-mockup__kpi-num');
  if (kpiNums.length) {
    const kpiData = [];
    kpiNums.forEach(el => {
      const p = parseMetric(el.textContent);
      kpiData.push(p);
    });

    const kpiObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        kpiNums.forEach((el, i) => {
          const p = kpiData[i];
          if (!p) return;
          setTimeout(() => countUp(el, p.num, 1500, p.prefix, p.suffix), 500 + i * 140);
        });
        kpiObs.disconnect();
      });
    }, { threshold: 0.8 });
    const kpiGrid = kpiNums[0].closest('.ui-mockup__kpis');
    if (kpiGrid) kpiObs.observe(kpiGrid);
  }

  // ── 5. Section title word reveal ──
  function wrapWords(el) {
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(part => {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else if (part) {
            const span = document.createElement('span');
            span.className = 'word-reveal';
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SPAN') {
        wrapWords(node);
      }
    });
  }

  document.querySelectorAll('.section-title').forEach(el => {
    wrapWords(el);
    el.classList.add('words-wrapped');
  });

  const wordObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.word-reveal').forEach((w, i) => {
        setTimeout(() => w.classList.add('word-reveal--in'), i * 55);
      });
      wordObs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.section-title').forEach(el => wordObs.observe(el));

  // ── 6. Process connector line draw on scroll ──
  const processSteps = document.querySelector('.process__steps');
  if (processSteps) {
    const lineObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => processSteps.classList.add('line-animate'), 250);
        lineObs.disconnect();
      });
    }, { threshold: 0.35 });
    lineObs.observe(processSteps);
  }

  // ── 7. Cursor glow on dark sections ──
  const glowSections = document.querySelectorAll(
    '.services, .cases, .niches, .testimonials, .guarantees, .process, .faq, .stack, .pricing, .trust, .before-after, .mockups'
  );
  let glowRects = [];
  let rectsDirty = true;
  function refreshGlowRects() { rectsDirty = true; }
  window.addEventListener('scroll', refreshGlowRects, { passive: true });
  window.addEventListener('resize', refreshGlowRects, { passive: true });

  let ticking = false;
  document.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (rectsDirty) {
        glowRects = Array.from(glowSections).map(sec => ({ el: sec, rect: sec.getBoundingClientRect() }));
        rectsDirty = false;
      }
      glowRects.forEach(({ el, rect }) => {
        if (e.clientY < rect.top - 80 || e.clientY > rect.bottom + 80) return;
        el.style.setProperty('--glow-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
        el.style.setProperty('--glow-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
      ticking = false;
    });
  }, { passive: true });

  // ── 8. Card spotlight (antimetal pattern) ──
  document.querySelectorAll('.service-card, .case-card, .guarantee-card, .trust-card, .mockup-showcase').forEach(card => {
    const spot = document.createElement('div');
    spot.className = 'card-spotlight';
    card.appendChild(spot);

    let spotTicking = false;
    card.addEventListener('mousemove', (e) => {
      if (spotTicking) return;
      spotTicking = true;
      requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        spot.style.left = (e.clientX - r.left) + 'px';
        spot.style.top  = (e.clientY - r.top) + 'px';
        spot.style.opacity = '1';
        spotTicking = false;
      });
    }, { passive: true });

    card.addEventListener('mouseleave', () => { spot.style.opacity = '0'; });
  });

  // ── 9. Niche rows stagger on scroll ──
  const nicheObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.niche-row').forEach((row, i) => {
        setTimeout(() => row.classList.add('niche-row--in'), i * 80);
      });
      nicheObs.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  const nicheList = document.querySelector('.niches__list');
  if (nicheList) nicheObs.observe(nicheList);

});
