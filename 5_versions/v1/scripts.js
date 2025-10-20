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
  const layerTabs = document.querySelectorAll('.layer-tab');
  const layerPanels = document.querySelectorAll('[data-layer-panel]');
  if (!layerTabs.length || !layerPanels.length) return;

  const activateLayer = (target) => {
    layerTabs.forEach((tab) => {
      const isActive = tab.dataset.layerTarget === target;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    layerPanels.forEach((panel) => {
      const isActive = panel.dataset.layerPanel === target;
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });
  };

  layerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.layerTarget;
      if (!target) return;
      activateLayer(target);
    });

    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const target = tab.dataset.layerTarget;
      if (!target) return;
      activateLayer(target);
    });
  });

  const initiallyActive = Array.from(layerTabs).find((tab) => tab.classList.contains('is-active'));
  if (initiallyActive?.dataset.layerTarget) {
    activateLayer(initiallyActive.dataset.layerTarget);
  } else if (layerTabs[0]?.dataset.layerTarget) {
    activateLayer(layerTabs[0].dataset.layerTarget);
  }
})();

(function () {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

  const animateValue = (element, target, options) => {
    const startTime = performance.now();
    const startValue = 0;
    const duration = options.duration || 1600;
    const decimals = options.decimals ?? 0;
    const suffix = options.suffix ?? '';

    const step = (currentTime) => {
      const elapsed = Math.min((currentTime - startTime) / duration, 1);
      const eased = easeOutQuad(elapsed);
      const value = startValue + (target - startValue) * eased;
      element.textContent = `${value.toFixed(decimals)}${suffix}`;
      if (elapsed < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const handleEntry = (element) => {
    if (element.dataset.countStarted === 'true') return;
    const rawValue = Number(element.dataset.countTo || '0');
    const decimals = Number(element.dataset.countDecimals || '0');
    const suffix = element.dataset.countSuffix || '';
    element.dataset.countStarted = 'true';
    animateValue(element, rawValue, {
      duration: rawValue > 10 ? 1800 : 1200,
      decimals,
      suffix,
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          handleEntry(entry.target);
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.4,
      }
    );

    counters.forEach((counter) => {
      counter.textContent = '0';
      observer.observe(counter);
    });
  } else {
    counters.forEach((counter) => {
      counter.textContent = '0';
      handleEntry(counter);
    });
  }
})();

(function () {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;

  const cards = Array.from(slider.querySelectorAll('.testimonial-card'));
  const dots = Array.from(slider.querySelectorAll('.testimonial-dot'));
  const navButtons = Array.from(slider.querySelectorAll('.testimonial-nav'));
  if (!cards.length) return;

  let currentIndex = cards.findIndex((card) => card.classList.contains('is-active'));
  if (currentIndex < 0) currentIndex = 0;

  const setActiveSlide = (index) => {
    const boundedIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === boundedIndex;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === boundedIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    currentIndex = boundedIndex;
  };

  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'next') {
        setActiveSlide(currentIndex + 1);
      } else if (action === 'prev') {
        setActiveSlide(currentIndex - 1);
      }
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = Number(dot.dataset.target || '0');
      if (Number.isNaN(targetIndex)) return;
      setActiveSlide(targetIndex);
    });
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActiveSlide(currentIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActiveSlide(currentIndex - 1);
    }
  });
})();

(function () {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      question.setAttribute('aria-expanded', String(!isExpanded));
      if (isExpanded) {
        answer.hidden = true;
      } else {
        answer.hidden = false;
      }
    });
  });
})();
