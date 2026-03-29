/* ===========================
   STUDIORAMA — SCRIPT
   Award-Winning Animations
   =========================== */

/* ---------- THEME: Apply saved preference before DOM loads ---------- */
(function() {
  const saved = localStorage.getItem('studiorama-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  /* ==========================================================
     1. PRELOADER
     ========================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderLogo = document.querySelector('.preloader__logo');
  const preloaderLine = document.querySelector('.preloader__line');

  if (preloader && preloaderLogo && preloaderLine) {
    document.body.classList.add('loading');

    const preloaderTL = gsap.timeline({
      onComplete: () => {
        initPage();
      }
    });

    preloaderTL
      .to(preloaderLogo, { opacity: 1, duration: 0.6, ease: 'power2.out' })
      .to(preloaderLine, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.2')
      .to(preloaderLine, { scaleX: 0, transformOrigin: 'right', duration: 0.4, ease: 'power2.in' }, '+=0.3')
      .to(preloaderLogo, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' }, '-=0.2')
      .to(preloader, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: () => {
          preloader.classList.add('done');
          preloader.style.display = 'none';
          document.body.classList.remove('loading');
        }
      }, '-=0.1');
  } else {
    // No preloader (service pages etc.) — defer to end of handler
    // so all const declarations below are initialized first.
    setTimeout(initPage, 0);
  }

  /* ==========================================================
     2. LENIS SMOOTH SCROLL
     ========================================================== */
  let lenis;

  function initLenis() {
    // Only use Lenis smooth scroll on the main page (has .hero section).
    // Service pages use native browser scroll for reliability.
    if (!document.querySelector('.hero')) return;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } catch (e) {
      // Fallback to native scroll if Lenis fails
      lenis = null;
    }
  }

  /* ==========================================================
     3. CUSTOM CURSOR
     ========================================================== */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.querySelector('.cursor__dot');
  const cursorRing = document.querySelector('.cursor__ring');

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  // Use media query instead of touch detection — laptops with touchscreens
  // still have a mouse, so check for fine pointer capability.
  const prefersPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isTouchDevice = !prefersPointer;

  function initCursor() {
    if (isTouchDevice || !cursor) return;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(cursorDot, { x: mouseX, y: mouseY });
    });

    // Ring follows with lag
    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      gsap.set(cursorRing, { x: ringX, y: ringY });
    });

    // Expand on hoverable elements
    const hoverables = document.querySelectorAll('a, button, .btn, .service-card, .portfolio__slide, .team-card, .hero__dot, .testimonials__btn, .nav__toggle, .theme-toggle, [data-magnetic]');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
      gsap.to(cursor, { opacity: 0, duration: 0.3 });
    });
    document.addEventListener('mouseenter', () => {
      gsap.to(cursor, { opacity: 1, duration: 0.3 });
    });
  }

  /* ==========================================================
     4. SCROLL PROGRESS BAR
     ========================================================== */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      }
    });
  }

  /* ==========================================================
     5. TEXT SPLIT ANIMATION UTILITY
     ========================================================== */
  function splitTextIntoWords(element) {
    const text = element.innerHTML;
    // Handle <em> tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    let result = '';
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        words.forEach(word => {
          if (word.trim()) {
            result += `<span class="word"><span class="word-inner">${word}</span></span>`;
          } else if (word) {
            result += word;
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'br') {
          result += '<br>';
        } else {
          result += `<${tag}>`;
          node.childNodes.forEach(child => processNode(child));
          result += `</${tag}>`;
        }
      }
    }

    tempDiv.childNodes.forEach(child => processNode(child));
    element.innerHTML = result;
    return element.querySelectorAll('.word-inner');
  }

  /* ==========================================================
     6. HERO ANIMATIONS
     ========================================================== */
  function initHeroAnimations() {
    const activeSlide = document.querySelector('.hero__slide.active');
    if (!activeSlide) return;

    const title = activeSlide.querySelector('.hero__title');
    const subtitle = activeSlide.querySelector('.hero__subtitle');
    const cta = activeSlide.querySelector('.btn');

    if (title) {
      const words = splitTextIntoWords(title);
      gsap.to(words, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        delay: 0.2,
      });
    }

    if (subtitle) {
      gsap.fromTo(subtitle,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.8 }
      );
    }

    if (cta) {
      gsap.fromTo(cta,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 1.1 }
      );
    }

    // Hero parallax
    gsap.to('.hero__slide', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  /* ==========================================================
     7. SECTION TAG ANIMATIONS (slide in from left with gold line)
     ========================================================== */
  function initTagAnimations() {
    document.querySelectorAll('[data-animate="tag-slide"]').forEach(tag => {
      gsap.fromTo(tag,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: tag,
            start: 'top 85%',
            once: true,
          }
        }
      );
    });
  }

  /* ==========================================================
     8. SECTION TITLE WORD REVEALS
     ========================================================== */
  function initTitleAnimations() {
    document.querySelectorAll('[data-animate="split-words"]').forEach(title => {
      // Skip hero titles (handled separately)
      if (title.closest('.hero')) return;

      const words = splitTextIntoWords(title);
      gsap.to(words, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.04,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
          once: true,
        }
      });
    });
  }

  /* ==========================================================
     9. STAGGERED SERVICE CARD REVEALS
     ========================================================== */
  function initServiceCardAnimations() {
    const cards = document.querySelectorAll('[data-animate="stagger-card"]');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.services__grid',
          start: 'top 80%',
          once: true,
        }
      }
    );
  }

  /* ==========================================================
     10. INDUSTRY ITEMS — POP-IN WITH SCALE
     ========================================================== */
  function initIndustryAnimations() {
    const items = document.querySelectorAll('[data-animate="pop-in"]');
    if (!items.length) return;

    gsap.fromTo(items,
      { opacity: 0, scale: 0.7, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.industries__grid',
          start: 'top 80%',
          once: true,
        }
      }
    );
  }

  /* ==========================================================
     11. DIFF CARDS — SLIDE UP WITH BORDER DRAW
     ========================================================== */
  function initDiffCardAnimations() {
    const cards = document.querySelectorAll('[data-animate="border-draw"]');
    if (!cards.length) return;

    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            once: true,
            onEnter: () => {
              setTimeout(() => card.classList.add('border-visible'), 300 + i * 120);
            }
          }
        }
      );
    });
  }

  /* ==========================================================
     12. HORIZONTAL SCROLL PORTFOLIO
     ========================================================== */
  function initHorizontalPortfolio() {
    const slides = document.querySelectorAll('.portfolio__slide');
    const prevBtn = document.querySelector('.portfolio__arrow--prev');
    const nextBtn = document.querySelector('.portfolio__arrow--next');
    if (!slides.length) return;

    let current = 0;
    let autoPlay;

    function goTo(index) {
      slides[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
    }

    function startAuto() {
      autoPlay = setInterval(() => goTo(current + 1), 5000);
    }

    function resetAuto() {
      clearInterval(autoPlay);
      startAuto();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    startAuto();
  }

  /* ==========================================================
     13. TEAM CARDS — SLIDE FROM OPPOSITE SIDES
     ========================================================== */
  function initTeamAnimations() {
    const leftCard = document.querySelector('[data-animate="slide-left"]');
    const rightCard = document.querySelector('[data-animate="slide-right"]');

    if (leftCard) {
      gsap.fromTo(leftCard,
        { opacity: 0, x: -80 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.team__grid',
            start: 'top 80%',
            once: true,
          }
        }
      );
    }

    if (rightCard) {
      gsap.fromTo(rightCard,
        { opacity: 0, x: 80 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.team__grid',
            start: 'top 80%',
            once: true,
          }
        }
      );
    }
  }

  /* ==========================================================
     14. MAGNETIC BUTTONS
     ========================================================== */
  function initMagneticButtons() {
    if (isTouchDevice) return;

    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)',
        });
      });
    });
  }

  /* ==========================================================
     15. GENERIC REVEAL ANIMATIONS (fallback for .reveal without special data-animate)
     ========================================================== */
  function initGenericReveals() {
    document.querySelectorAll('.reveal').forEach(el => {
      // Skip elements with specific animations already handled
      if (el.getAttribute('data-animate') && el.getAttribute('data-animate') !== '') return;

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        }
      });
    });
  }

  /* ==========================================================
     16. FEATURED IN — CARD STAGGER
     ========================================================== */
  function initFeaturedIn() {
    const cards = document.querySelectorAll('.featured-in__card');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.featured-in__grid',
          start: 'top 82%',
          once: true,
        }
      }
    );

    const quote = document.querySelector('.featured-in__quote');
    if (quote) {
      gsap.fromTo(quote,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: quote,
            start: 'top 88%',
            once: true,
          }
        }
      );
    }
  }

  /* ==========================================================
     17. FOOTER REVEAL
     ========================================================== */
  function initFooterReveal() {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    gsap.fromTo(footer,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 90%',
          once: true,
        }
      }
    );
  }

  /* ==========================================================
     17. COUNTER / PULSE ANIMATION FOR INDUSTRY ICONS
     ========================================================== */
  function initIndustryIconPulse() {
    const icons = document.querySelectorAll('.industry-item svg');
    if (!icons.length) return;

    icons.forEach((icon, i) => {
      ScrollTrigger.create({
        trigger: icon,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo(icon,
            { scale: 0.5, opacity: 0, rotation: -10 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.6,
              delay: i * 0.08,
              ease: 'back.out(2)',
            }
          );
        }
      });
    });
  }

  /* ==========================================================
     EXISTING FUNCTIONALITY
     ========================================================== */

  /* ---------- THEME TOGGLE ---------- */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('studiorama-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('studiorama-theme', 'dark');
      }
    });
  }

  /* ---------- MOBILE NAV TOGGLE ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const navClose = document.getElementById('navClose');

  function closeMenu() {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
    });

    if (navClose) {
      navClose.addEventListener('click', closeMenu);
    }

    document.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---------- HEADER SCROLL ---------- */
  const header = document.getElementById('header');
  // Only toggle scrolled class on pages with a hero section (main page)
  // Service pages start with scrolled class and should keep it
  const hasHero = document.querySelector('.hero');
  if (header && hasHero) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 80);
    });
  }

  /* ---------- HERO SLIDER ---------- */
  const slides = document.querySelectorAll('.hero__slide');
  const dots = document.querySelectorAll('.hero__dot');
  if (slides.length) {
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      currentSlide = index;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % slides.length);
    }

    function startSlider() {
      slideInterval = setInterval(nextSlide, 5000);
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        goToSlide(parseInt(dot.dataset.slide));
        startSlider();
      });
    });

    startSlider();
  }

  /* ---------- TESTIMONIALS CAROUSEL ---------- */
  const testimonials = document.querySelectorAll('.testimonial-card');
  const prevBtn = document.getElementById('testPrev');
  const nextBtn = document.getElementById('testNext');
  if (testimonials.length && prevBtn && nextBtn) {
    let currentTest = 0;

    function showTestimonial(index) {
      testimonials[currentTest].classList.remove('active');
      currentTest = (index + testimonials.length) % testimonials.length;
      testimonials[currentTest].classList.add('active');
    }

    prevBtn.addEventListener('click', () => showTestimonial(currentTest - 1));
    nextBtn.addEventListener('click', () => showTestimonial(currentTest + 1));

    setInterval(() => showTestimonial(currentTest + 1), 7000);
  }

  /* ---------- SMOOTH SCROLL (anchor links via Lenis) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: 0 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ==========================================================
     INIT ALL — called after preloader completes
     ========================================================== */
  function initPage() {
    initLenis();
    initCursor();
    initScrollProgress();
    initHeroAnimations();
    initTagAnimations();
    initTitleAnimations();
    initServiceCardAnimations();
    initIndustryAnimations();
    initIndustryIconPulse();
    initDiffCardAnimations();
    initHorizontalPortfolio();
    initTeamAnimations();
    initMagneticButtons();
    initGenericReveals();
    initFeaturedIn();
    initFooterReveal();

    // Refresh ScrollTrigger after all init
    ScrollTrigger.refresh();
  }

});
