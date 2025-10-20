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
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) {
    return;
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => {
      element.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  revealElements.forEach((element) => {
    observer.observe(element);
  });
})();

(function () {
  const counterElements = document.querySelectorAll('.stat-number[data-count-to]');
  if (!counterElements.length) {
    return;
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const formatValue = (value, decimals) =>
    value.toLocaleString('ru-RU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const animateCounter = (element) => {
    const target = Number(element.dataset.countTo || '0');
    const duration = Number(element.dataset.countDuration || '1800');
    const decimals = Number(element.dataset.countDecimals || '0');
    const suffix = element.dataset.countSuffix ?? '';
    const prefix = element.dataset.countPrefix ?? '';

    const startValue = 0;
    let startTime = null;

    const step = (timestamp) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (target - startValue) * eased;

      element.textContent = `${prefix}${formatValue(currentValue, decimals)}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    counterElements.forEach((element) => {
      const target = Number(element.dataset.countTo || '0');
      const decimals = Number(element.dataset.countDecimals || '0');
      const suffix = element.dataset.countSuffix ?? '';
      const prefix = element.dataset.countPrefix ?? '';
      element.textContent = `${prefix}${formatValue(target, decimals)}${suffix}`;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.45,
    }
  );

  counterElements.forEach((element) => {
    observer.observe(element);
  });
})();

(function () {
  const tabButtons = Array.from(document.querySelectorAll('[data-experience-target]'));
  const panels = Array.from(document.querySelectorAll('[data-experience-panel]'));
  if (!tabButtons.length || !panels.length) {
    return;
  }

  let activeIndex = tabButtons.findIndex((button) => button.classList.contains('is-active'));
  if (activeIndex === -1) {
    activeIndex = 0;
  }

  const setActive = (nextIndex) => {
    const button = tabButtons[nextIndex];
    if (!button) return;

    const target = button.dataset.experienceTarget;
    tabButtons.forEach((tab, index) => {
      const isActive = index === nextIndex;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach((panel) => {
      const shouldShow = panel.dataset.experiencePanel === target;
      panel.classList.toggle('is-active', shouldShow);
      panel.toggleAttribute('hidden', !shouldShow);
    });

    button.focus();
    activeIndex = nextIndex;
  };

  tabButtons.forEach((button, index) => {
    button.setAttribute('tabindex', index === activeIndex ? '0' : '-1');

    button.addEventListener('click', () => {
      setActive(index);
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (activeIndex + 1) % tabButtons.length;
        setActive(nextIndex);
        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const nextIndex = (activeIndex - 1 + tabButtons.length) % tabButtons.length;
        setActive(nextIndex);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        setActive(0);
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        setActive(tabButtons.length - 1);
      }
    });
  });
})();

(function () {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length < 2) {
    return;
  }

  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other === item) return;
        other.open = false;
      });
    });
  });
})();
