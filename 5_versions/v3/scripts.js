(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const navToggle = nav.querySelector('.nav-toggle');
  const dropdown = nav.querySelector('.dropdown');
  const dropdownToggle = nav.querySelector('.dropdown-toggle');
  const navBackdrop = document.querySelector('[data-nav-backdrop]');
  const navLinksContainer = nav.querySelector('.nav-links');
  const mediaQuery = window.matchMedia('(max-width: 767px)');

  if (!navToggle) return;

  const closeDropdown = () => {
    dropdown?.classList.remove('is-open');
    dropdownToggle?.setAttribute('aria-expanded', 'false');
  };

  const setBackdropVisibility = (visible) => {
    if (!navBackdrop) return;
    navBackdrop.setAttribute('aria-hidden', String(!visible));
  };

  const AUTO_CLOSE_DELAY = 6000;
  let autoCloseTimeoutId = null;
  const navInner = nav.querySelector('.nav-inner');

  const clearAutoClose = () => {
    if (autoCloseTimeoutId === null) return;
    window.clearTimeout(autoCloseTimeoutId);
    autoCloseTimeoutId = null;
  };

  let navHeight = navInner?.getBoundingClientRect().height || nav.offsetHeight;
  let hiddenOffset = 0;

  const applyHeaderOffset = () => {
    nav.style.transform = `translateY(-${hiddenOffset}px)`;
  };

  const updateNavHeight = () => {
    navHeight = navInner?.getBoundingClientRect().height || nav.offsetHeight;
  };

  const closeMenu = () => {
    if (!nav.classList.contains('nav-open')) return;
    nav.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    closeDropdown();
    clearAutoClose();
    setBackdropVisibility(false);
    hiddenOffset = 0;
    applyHeaderOffset();
    updateNavHeight();
  };

  const scheduleAutoClose = () => {
    clearAutoClose();
    if (!mediaQuery.matches || !nav.classList.contains('nav-open')) return;
    autoCloseTimeoutId = window.setTimeout(() => {
      if (nav.classList.contains('nav-open')) {
        closeMenu();
      }
    }, AUTO_CLOSE_DELAY);
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      hiddenOffset = 0;
      applyHeaderOffset();
      setBackdropVisibility(mediaQuery.matches);
      scheduleAutoClose();
    } else {
      closeDropdown();
      setBackdropVisibility(false);
      clearAutoClose();
    }
  });

  dropdownToggle?.addEventListener('click', (event) => {
    if (!mediaQuery.matches) return;

    event.preventDefault();
    const nowOpen = dropdown.classList.toggle('is-open');
    dropdownToggle.setAttribute('aria-expanded', String(nowOpen));
    scheduleAutoClose();
  });

  nav.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!mediaQuery.matches) return;
      closeMenu();
    });
  });

  const handleActiveNavUse = () => {
    if (!nav.classList.contains('nav-open')) return;
    scheduleAutoClose();
  };

  ['pointerdown', 'pointerup', 'touchstart'].forEach((eventName) => {
    navLinksContainer?.addEventListener(eventName, handleActiveNavUse, {
      passive: true,
    });
  });

  navLinksContainer?.addEventListener('focusin', handleActiveNavUse);
  navLinksContainer?.addEventListener('keydown', handleActiveNavUse);

  let lastScrollY = window.scrollY;
  let ticking = false;
  const SCROLL_EPSILON = 6;

  const handleViewportChange = () => {
    if (!mediaQuery.matches) {
      closeMenu();
    }
    if (nav.classList.contains('nav-open')) {
      scheduleAutoClose();
    } else {
      clearAutoClose();
    }
    updateNavHeight();
    setBackdropVisibility(mediaQuery.matches && nav.classList.contains('nav-open'));
    applyHeaderOffset();
  };

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleViewportChange);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handleViewportChange);
  }

  navBackdrop?.addEventListener('click', closeMenu);

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('nav-open')) return;
    if (nav.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (nav.classList.contains('nav-open')) {
      event.preventDefault();
      closeMenu();
      navToggle.focus();
      return;
    }

    if (dropdown?.classList.contains('is-open')) {
      dropdown.classList.remove('is-open');
      dropdownToggle?.setAttribute('aria-expanded', 'false');
      dropdownToggle?.focus();
    }
  });

  const updateNavVisibility = (currentScroll) => {
    const diff = currentScroll - lastScrollY;

    if (nav.classList.contains('nav-open')) {
      if (Math.abs(diff) > SCROLL_EPSILON) {
        closeMenu();
      }
      hiddenOffset = 0;
      applyHeaderOffset();
      return;
    }

    if (currentScroll <= navHeight) {
      hiddenOffset = 0;
      applyHeaderOffset();
      return;
    }

    if (Math.abs(diff) < SCROLL_EPSILON) {
      return;
    }

    hiddenOffset = Math.min(Math.max(hiddenOffset + diff, 0), navHeight);
    applyHeaderOffset();
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const currentScroll = Math.max(window.scrollY, 0);
        updateNavVisibility(currentScroll);
        lastScrollY = currentScroll;
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    handleViewportChange();
  });

  handleViewportChange();
  applyHeaderOffset();
})();

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progressItems = document.querySelectorAll('[data-progress] .hero-progress-bar span');
  if (!progressItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        const host = bar.closest('[data-progress]');
        const value = Number(host?.dataset.progress ?? 0);
        const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;

        if (prefersReducedMotion) {
          bar.style.width = `${clamped}%`;
        } else {
          window.requestAnimationFrame(() => {
            bar.style.width = `${clamped}%`;
          });
        }

        observer.unobserve(bar);
      });
    },
    { threshold: 0.4 }
  );

  progressItems.forEach((bar) => {
    bar.style.width = '0%';
    observer.observe(bar);
  });
})();

(function () {
  const counterElements = document.querySelectorAll('[data-counter-value]');
  if (!counterElements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const formatValue = (value, decimals) => {
    return value.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const animateCounter = (element) => {
    if (element.dataset.counterAnimated === 'true') return;
    element.dataset.counterAnimated = 'true';

    const targetValue = Number(element.dataset.counterValue);
    if (!Number.isFinite(targetValue)) {
      element.textContent = element.dataset.counterValue;
      return;
    }

    const decimals = Number(element.dataset.counterDecimals || 0);
    const prefix = element.dataset.counterPrefix || '';
    const suffix = element.dataset.counterSuffix || '';
    const duration = Number(element.dataset.counterDuration || 1600);
    const startValue = Number(element.dataset.counterStart || 0);

    const render = (value) => {
      element.textContent = `${prefix}${formatValue(value, decimals)}${suffix}`;
    };

    if (prefersReducedMotion.matches) {
      render(targetValue);
      return;
    }

    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * eased;
      render(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        render(targetValue);
      }
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );

  counterElements.forEach((element) => {
    observer.observe(element);
  });
})();

(function () {
  const slider = document.querySelector('[data-testimonials]');
  if (!slider) return;

  const track = slider.querySelector('[data-testimonials-track]');
  const slides = track ? Array.from(track.children) : [];
  if (!track || slides.length === 0) return;

  const prevButton = slider.querySelector('[data-testimonials-prev]');
  const nextButton = slider.querySelector('[data-testimonials-next]');
  const dotsContainer = slider.querySelector('.testimonials-dots');
  const autoplayDelay = Number(slider.dataset.autoplay || 0);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let activeIndex = Math.max(
    slides.findIndex((slide) => slide.hasAttribute('data-active')),
    0
  );
  let autoplayId = null;
  let pausedByInteraction = false;

  const setActiveSlide = (index) => {
    if (slides.length === 0) return;
    activeIndex = (index + slides.length) % slides.length;
    slider.style.setProperty('--testimonial-index', activeIndex);

    slides.forEach((slide, slideIndex) => {
      if (slideIndex === activeIndex) {
        slide.setAttribute('data-active', '');
      } else {
        slide.removeAttribute('data-active');
      }
    });

    if (dotsContainer) {
      const dots = Array.from(dotsContainer.children);
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute('aria-selected', String(dotIndex === activeIndex));
      });
    }
  };

  const goNext = () => {
    setActiveSlide(activeIndex + 1);
  };

  const goPrev = () => {
    setActiveSlide(activeIndex - 1);
  };

  const stopAutoplay = () => {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (!autoplayDelay || prefersReducedMotion.matches) return;
    autoplayId = window.setInterval(() => {
      if (pausedByInteraction) return;
      goNext();
    }, autoplayDelay);
  };

  const resetAutoplay = () => {
    if (!autoplayDelay || prefersReducedMotion.matches) return;
    stopAutoplay();
    startAutoplay();
  };

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Показать отзыв ${index + 1}`);
      dot.addEventListener('click', () => {
        setActiveSlide(index);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  prevButton?.addEventListener('click', () => {
    goPrev();
    resetAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    goNext();
    resetAutoplay();
  });

  slider.addEventListener('pointerenter', () => {
    pausedByInteraction = true;
  });

  slider.addEventListener('pointerleave', () => {
    pausedByInteraction = false;
  });

  slider.addEventListener('focusin', () => {
    pausedByInteraction = true;
  });

  slider.addEventListener('focusout', (event) => {
    if (!slider.contains(event.relatedTarget)) {
      pausedByInteraction = false;
    }
  });

  setActiveSlide(activeIndex);
  startAutoplay();
})();

(function () {
  const faqButtons = document.querySelectorAll('[data-faq]');
  if (!faqButtons.length) return;

  faqButtons.forEach((button) => {
    const panel = button.parentElement?.querySelector('.faq-panel');
    if (!panel) return;

    button.setAttribute('aria-expanded', 'false');

    const closePanel = () => {
      button.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    };

    const openPanel = () => {
      button.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    };

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closePanel();
      } else {
        openPanel();
      }
    });

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (button.getAttribute('aria-expanded') === 'true') {
        event.stopPropagation();
        closePanel();
        button.focus();
      }
    });
  });
})();

(function () {
  const parallaxItems = document.querySelectorAll('[data-parallax]');
  if (!parallaxItems.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  const updateTransforms = () => {
    parallaxItems.forEach((item) => {
      const depth = Number(item.dataset.parallaxDepth || 40);
      const rect = item.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const offset = (center - viewportCenter) / window.innerHeight;
      const translateY = -offset * depth;
      item.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
    });
  };

  let ticking = false;
  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateTransforms();
      ticking = false;
    });
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  requestTick();
})();
