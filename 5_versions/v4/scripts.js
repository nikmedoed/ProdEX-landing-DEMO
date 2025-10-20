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
  const tabs = Array.from(document.querySelectorAll('[data-testimonial-tab]'));
  if (!tabs.length) return;

  const panels = Array.from(document.querySelectorAll('[data-testimonial]'));

  let activeKey = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.testimonialTab;
  if (!activeKey && tabs[0]) {
    activeKey = tabs[0].dataset.testimonialTab;
    tabs[0].setAttribute('aria-selected', 'true');
  }

  const render = () => {
    tabs.forEach((tab) => {
      const isCurrent = tab.dataset.testimonialTab === activeKey;
      tab.setAttribute('aria-selected', String(isCurrent));
      tab.setAttribute('tabindex', isCurrent ? '0' : '-1');
    });

    panels.forEach((panel) => {
      const show = panel.dataset.testimonial === activeKey;
      panel.toggleAttribute('hidden', !show);
    });
  };

  const setActiveTab = (key, { focusTab = true } = {}) => {
    if (!key || key === activeKey) return;

    activeKey = key;
    render();

    if (focusTab) {
      const currentTab = tabs.find((tab) => tab.dataset.testimonialTab === key);
      currentTab?.focus({ preventScroll: false });
    }
  };

  tabs.forEach((tab) => {
    const key = tab.dataset.testimonialTab;
    tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');

    tab.addEventListener('click', () => {
      setActiveTab(key, { focusTab: false });
    });

    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }

      event.preventDefault();
      const currentIndex = tabs.indexOf(tab);

      if (event.key === 'Home') {
        setActiveTab(tabs[0].dataset.testimonialTab);
        return;
      }

      if (event.key === 'End') {
        setActiveTab(tabs[tabs.length - 1].dataset.testimonialTab);
        return;
      }

      let nextIndex = currentIndex;

      if (event.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      }

      const nextTab = tabs[nextIndex];
      if (nextTab) {
        setActiveTab(nextTab.dataset.testimonialTab);
      }
    });
  });

  if (activeKey && panels.some((panel) => panel.dataset.testimonial === activeKey)) {
    render();
  }
})();

(function () {
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const expanded = question.getAttribute('aria-expanded') === 'true';
      question.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });
})();
