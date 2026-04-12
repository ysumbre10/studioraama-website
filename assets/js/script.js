/* ===========================
   STUDIORAAMA — SCRIPT
   =========================== */

(function() {
  const saved = localStorage.getItem('studioraama-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  const isHomepage = !!document.querySelector('.hp-hero');

  /* ========== PRELOADER ========== */
  const preloader = document.getElementById('preloader');
  const preloaderLogo = document.querySelector('.preloader__logo');
  const preloaderLine = document.querySelector('.preloader__line');

  if (preloader && preloaderLogo && preloaderLine) {
    document.body.classList.add('loading');
    const tl = gsap.timeline({ onComplete: initPage });
    tl.to(preloaderLogo, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to(preloaderLine, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.2')
      .to(preloaderLine, { scaleX: 0, transformOrigin: 'right', duration: 0.4, ease: 'power2.in' }, '+=0.3')
      .to(preloaderLogo, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' }, '-=0.2')
      .to(preloader, {
        yPercent: -100, duration: 0.8, ease: 'power3.inOut',
        onComplete: () => { preloader.classList.add('done'); preloader.style.display = 'none'; document.body.classList.remove('loading'); }
      }, '-=0.1');
  } else {
    setTimeout(initPage, 0);
  }

  /* ========== SWIPER HERO (homepage only) ========== */
  function initHeroSwiper() {
    const counterCurrent = document.querySelector('.hp-counter__current');
    const heroEl = document.querySelector('.hp-hero');

    // No built-in mousewheel — we handle scroll ourselves
    const heroSwiper = new Swiper('#heroSwiper', {
      direction: 'vertical',
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 900,
      loop: false,
      mousewheel: false,
      keyboard: true,
      allowTouchMove: true,
      on: {
        slideChange: function () {
          if (counterCurrent) counterCurrent.textContent = this.activeIndex + 1;
        }
      }
    });

    // Custom wheel handler — desktop only (touch devices use Swiper's native touch)
    const isTouchDev = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    let isAnimating = false;
    let lastScrollTime = 0;

    if (isTouchDev) {
      // On mobile/touch: let Swiper handle touch natively, enable releaseOnEdges
      heroSwiper.params.allowTouchMove = true;
      heroSwiper.params.touchReleaseOnEdges = true;
    }

    heroEl.addEventListener('wheel', (e) => {
      // Only intercept on desktop when hero is at top of viewport
      if (isTouchDev) return;
      if (window.scrollY > 10) return;

      const now = Date.now();
      const delta = e.deltaY;
      const isDown = delta > 0;
      const isUp = delta < 0;
      const isLast = heroSwiper.activeIndex === heroSwiper.slides.length - 1;
      const isFirst = heroSwiper.activeIndex === 0;

      // Throttle to prevent rapid-fire
      if (now - lastScrollTime < 800 || isAnimating) {
        // On last slide scrolling down — let page scroll through
        if (isLast && isDown) return;
        // On first slide scrolling up — let page scroll through
        if (isFirst && isUp) return;
        e.preventDefault();
        return;
      }

      if (isDown && !isLast) {
        // Advance to next slide
        e.preventDefault();
        isAnimating = true;
        lastScrollTime = now;
        heroSwiper.slideNext();
        setTimeout(() => { isAnimating = false; }, 900);

        // Hide scroll hint on last slide
        if (heroSwiper.activeIndex === heroSwiper.slides.length - 1) {
          const hint = document.querySelector('.hp-scroll-hint');
          if (hint) gsap.to(hint, { opacity: 0, duration: 0.4 });
        }
      } else if (isUp && !isFirst) {
        // Go back to previous slide
        e.preventDefault();
        isAnimating = true;
        lastScrollTime = now;
        heroSwiper.slidePrev();
        setTimeout(() => { isAnimating = false; }, 900);
      }
      // On last slide + scroll down: don't preventDefault — page scrolls naturally
      // On first slide + scroll up: don't preventDefault — page scrolls naturally
    }, { passive: false });

    return heroSwiper;
  }

  /* ========== OVERLAY NAV ========== */
  function initOverlayNav() {
    const btn = document.getElementById('menuToggle');
    const overlay = document.getElementById('navOverlay');
    if (!btn || !overlay) return;

    const links = overlay.querySelectorAll('.nav-overlay__link');
    const footer = overlay.querySelector('.nav-overlay__footer');

    btn.addEventListener('click', () => {
      const isOpen = overlay.classList.contains('active');
      if (isOpen) {
        overlay.classList.remove('active');
        btn.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        overlay.classList.add('active');
        btn.classList.add('active');
        document.body.style.overflow = 'hidden';
        gsap.fromTo(links, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', delay: 0.15 });
        if (footer) gsap.fromTo(footer, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.5 });
      }
    });

    // Close button inside overlay
    const closeBtn = document.getElementById('navOverlayClose');
    function closeOverlay() {
      overlay.classList.remove('active');
      btn.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
    links.forEach(link => link.addEventListener('click', closeOverlay));

    // Safety: reset overflow on page visibility change (prevents stuck state)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) closeOverlay();
    });
  }

  /* ========== HEADER SCROLL ========== */
  function initHeaderScroll() {
    const hpH = document.getElementById('hpHeader');
    const hpNavFull = document.getElementById('hpNavFull');
    const menuBtn = document.getElementById('menuToggle');

    if (hpH && hpNavFull) {
      // Homepage: swap between hamburger header and full nav
      window.addEventListener('scroll', () => {
        const pastHero = window.scrollY > window.innerHeight - 100;
        hpH.classList.toggle('scrolled', pastHero);
        hpH.classList.toggle('hide-on-scroll', pastHero);
        hpNavFull.classList.toggle('visible', pastHero);
        if (menuBtn) menuBtn.classList.toggle('hide-on-scroll', pastHero);
      });
    }

    // Legacy header for other pages
    const legH = document.getElementById('header');
    if (legH && document.querySelector('.hero')) {
      window.addEventListener('scroll', () => legH.classList.toggle('scrolled', window.scrollY > 80));
    }

    // Second theme toggle (in full nav)
    const themeToggle2 = document.getElementById('themeToggle2');
    if (themeToggle2) {
      themeToggle2.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('studioraama-theme', 'light'); }
        else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('studioraama-theme', 'dark'); }
      });
    }
  }

  /* ========== CUSTOM CURSOR ========== */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.querySelector('.cursor__dot');
  const cursorRing = document.querySelector('.cursor__ring');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  const isTouchDevice = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function initCursor() {
    if (isTouchDevice || !cursor) return;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; gsap.set(cursorDot, { x: mouseX, y: mouseY }); });
    gsap.ticker.add(() => { ringX += (mouseX - ringX) * 0.15; ringY += (mouseY - ringY) * 0.15; gsap.set(cursorRing, { x: ringX, y: ringY }); });
    document.querySelectorAll('a, button, .btn, .service-card, .testimonials__btn, .hp-menu-btn, .hp-slide__btn, .nav-overlay__link, [data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    document.addEventListener('mouseleave', () => gsap.to(cursor, { opacity: 0, duration: 0.3 }));
    document.addEventListener('mouseenter', () => gsap.to(cursor, { opacity: 1, duration: 0.3 }));
  }

  /* ========== SCROLL PROGRESS ========== */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    gsap.to(bar, { width: '100%', ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
  }

  /* ========== TEXT SPLIT UTILITY ========== */
  function splitTextIntoWords(el) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = el.innerHTML;
    let result = '';
    function walk(node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(w => {
          if (w.trim()) result += '<span class="word"><span class="word-inner">' + w + '</span></span>';
          else if (w) result += w;
        });
      } else if (node.nodeType === 1) {
        const t = node.tagName.toLowerCase();
        if (t === 'br') result += '<br>';
        else { result += '<' + t + '>'; node.childNodes.forEach(walk); result += '</' + t + '>'; }
      }
    }
    tempDiv.childNodes.forEach(walk);
    el.innerHTML = result;
    return el.querySelectorAll('.word-inner');
  }

  /* ========== SECTION ANIMATIONS (shared) ========== */
  function initSectionAnimations() {
    // Slow down the diff section background video
    const diffVideo = document.querySelector('.diff-section__video');
    if (diffVideo) diffVideo.playbackRate = 0.2;

    // Tag slide-in
    document.querySelectorAll('[data-animate="tag-slide"]').forEach(tag => {
      gsap.fromTo(tag, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: tag, start: 'top 85%', once: true } });
    });

    // Title word reveals
    document.querySelectorAll('[data-animate="split-words"]').forEach(title => {
      if (title.closest('.hero')) return;
      const words = splitTextIntoWords(title);
      gsap.to(words, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power3.out', scrollTrigger: { trigger: title, start: 'top 85%', once: true } });
    });

    // Diff section — 5-slide pinned fullscreen
    const diffSection = document.querySelector('.diff-section');
    const diffSlides = document.querySelectorAll('.diff-slide');
    const diffProgressBar = document.querySelector('.diff-progress__bar');
    const diffCounterCur = document.querySelector('.diff-counter__cur');

    if (diffSection && diffSlides.length) {
      const isMobile = window.innerWidth <= 768;

      // On mobile: show all slides stacked, no pinning
      if (isMobile) {
        diffSlides.forEach(s => { s.classList.add('is-active'); s.style.position = 'relative'; s.style.opacity = '1'; });
        if (diffProgressBar) diffProgressBar.parentElement.style.display = 'none';
        const counter = document.querySelector('.diff-counter');
        if (counter) counter.style.display = 'none';
        diffSection.style.height = 'auto';
      }

      if (isMobile) return; // skip pinning on mobile

      let currentDiff = 0;
      const totalSlides = diffSlides.length;

      ScrollTrigger.create({
        trigger: diffSection,
        start: 'top top',
        end: '+=' + (totalSlides * 100) + '%',
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          const newIndex = Math.min(
            Math.floor(self.progress * totalSlides),
            totalSlides - 1
          );
          // Update progress bar
          if (diffProgressBar) diffProgressBar.style.width = ((newIndex + 1) / totalSlides * 100) + '%';
          if (diffCounterCur) diffCounterCur.textContent = newIndex + 1;

          if (newIndex !== currentDiff) {
            transitionDiffSlide(newIndex, currentDiff);
            currentDiff = newIndex;
          }
        }
      });

      function transitionDiffSlide(newIdx, oldIdx) {
        const oldSlide = diffSlides[oldIdx];
        const newSlide = diffSlides[newIdx];
        const down = newIdx > oldIdx;

        // Kill any running tweens on all slides to prevent stale states
        diffSlides.forEach(s => {
          gsap.killTweensOf(s);
          gsap.killTweensOf(s.querySelector('.diff-slide__inner'));
          const n = s.querySelector('.diff-slide__num');
          if (n) gsap.killTweensOf(n);
        });

        // Hide all slides except the new one
        diffSlides.forEach((s, i) => {
          if (i !== newIdx) {
            gsap.set(s, { opacity: 0 });
            s.classList.remove('is-active');
          }
        });

        // Enter new
        newSlide.classList.add('is-active');
        const newInner = newSlide.querySelector('.diff-slide__inner');
        const newNum = newSlide.querySelector('.diff-slide__num');
        const heading = newSlide.querySelector('.diff-slide__heading') || newSlide.querySelector('.diff-slide__title');
        const text = newSlide.querySelector('.diff-slide__text');

        gsap.set(newSlide, { opacity: 1 });

        // Number zooms in from behind
        if (newNum) gsap.fromTo(newNum, { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.1, ease: 'power2.out' });

        // Heading slides up
        if (heading) gsap.fromTo(heading, { opacity: 0, y: down ? 50 : -50 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power3.out' });

        // Text fades in
        if (text) gsap.fromTo(text, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.35, ease: 'power2.out' });
      }
    }

    // Legacy diff cards (other pages)
    document.querySelectorAll('[data-animate="border-draw"]').forEach((card, i) => {
      gsap.fromTo(card, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.7, delay: i * 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true, onEnter: () => setTimeout(() => card.classList.add('border-visible'), 300 + i * 120) }
      });
    });

    // Generic reveals
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getAttribute('data-animate')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });

    // Footer
    const footer = document.querySelector('.footer');
    if (footer) gsap.fromTo(footer, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: footer, start: 'top 90%', once: true } });
  }

  /* ========== LEGACY: Hero slider (other pages) ========== */
  function initLegacyHero() {
    const slides = document.querySelectorAll('.hero__slide');
    const dots = document.querySelectorAll('.hero__dot');
    if (slides.length < 2) return;
    let cur = 0, interval;
    function go(i) { slides[cur].classList.remove('active'); dots[cur]?.classList.remove('active'); cur = i; slides[cur].classList.add('active'); dots[cur]?.classList.add('active'); }
    function next() { go((cur + 1) % slides.length); }
    function start() { interval = setInterval(next, 5000); }
    dots.forEach(d => d.addEventListener('click', () => { clearInterval(interval); go(+d.dataset.slide); start(); }));
    start();

    // Hero text animation
    const active = document.querySelector('.hero__slide.active');
    if (active) {
      const title = active.querySelector('.hero__title');
      const sub = active.querySelector('.hero__subtitle');
      if (title) { const w = splitTextIntoWords(title); gsap.to(w, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'power3.out', delay: 0.2 }); }
      if (sub) gsap.fromTo(sub, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.8 });
    }
    gsap.to('.hero__slide', { yPercent: 20, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ========== LEGACY: Other page features ========== */
  function initLegacyFeatures() {
    // Service cards
    const sCards = document.querySelectorAll('[data-animate="stagger-card"]');
    if (sCards.length) gsap.fromTo(sCards, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.services__grid', start: 'top 80%', once: true } });

    // Industry items
    const iItems = document.querySelectorAll('[data-animate="pop-in"]');
    if (iItems.length) gsap.fromTo(iItems, { opacity: 0, scale: 0.7, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.industries__grid', start: 'top 80%', once: true } });

    // Portfolio carousel
    const pSlides = document.querySelectorAll('.portfolio__slide');
    if (pSlides.length) {
      let c = 0, ap;
      function pGo(i) { pSlides[c].classList.remove('active'); c = (i + pSlides.length) % pSlides.length; pSlides[c].classList.add('active'); }
      function pStart() { ap = setInterval(() => pGo(c + 1), 5000); }
      const pp = document.querySelector('.portfolio__arrow--prev');
      const pn = document.querySelector('.portfolio__arrow--next');
      if (pp) pp.addEventListener('click', () => { pGo(c - 1); clearInterval(ap); pStart(); });
      if (pn) pn.addEventListener('click', () => { pGo(c + 1); clearInterval(ap); pStart(); });
      pStart();
    }

    // Team animations
    const lc = document.querySelector('[data-animate="slide-left"]');
    const rc = document.querySelector('[data-animate="slide-right"]');
    if (lc) gsap.fromTo(lc, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.team__grid', start: 'top 80%', once: true } });
    if (rc) gsap.fromTo(rc, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.team__grid', start: 'top 80%', once: true } });

    // Featured in
    const fCards = document.querySelectorAll('.featured-in__card');
    if (fCards.length) gsap.fromTo(fCards, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.2, ease: 'power2.out', scrollTrigger: { trigger: '.featured-in__grid', start: 'top 82%', once: true } });
  }

  /* ========== SHARED ========== */

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('studioraama-theme', 'light'); }
    else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('studioraama-theme', 'dark'); }
  });

  // Legacy mobile nav
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navClose = document.getElementById('navClose');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => { navToggle.classList.toggle('active'); navMenu.classList.toggle('open'); });
    if (navClose) navClose.addEventListener('click', () => { navToggle.classList.remove('active'); navMenu.classList.remove('open'); });
    document.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', () => { navToggle.classList.remove('active'); navMenu.classList.remove('open'); }));
  }

  // Testimonial carousel
  const tCards = document.querySelectorAll('.testimonial-card');
  const tPrev = document.getElementById('testPrev');
  const tNext = document.getElementById('testNext');
  if (tCards.length && tPrev && tNext) {
    let tc = 0;
    function tShow(i) { tCards[tc].classList.remove('active'); tc = (i + tCards.length) % tCards.length; tCards[tc].classList.add('active'); }
    tPrev.addEventListener('click', () => tShow(tc - 1));
    tNext.addEventListener('click', () => tShow(tc + 1));
    setInterval(() => tShow(tc + 1), 7000);
  }

  // Magnetic buttons
  function initMagnetic() {
    if (isTouchDevice) return;
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' }));
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const h = a.getAttribute('href');
      if (h === '#') return;
      const t = document.querySelector(h);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ========== INIT ========== */
  function initPage() {
    initCursor();
    initScrollProgress();
    initHeaderScroll();
    initMagnetic();

    if (isHomepage) {
      initHeroSwiper();
      initOverlayNav();
    } else {
      initLegacyHero();
    }

    initSectionAnimations();
    initLegacyFeatures();
    ScrollTrigger.refresh();
  }

});
