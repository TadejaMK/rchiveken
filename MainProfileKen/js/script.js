(function () {
  'use strict';

  (function applySavedThemeNow() {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch (e) {}
  })();

  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    const dismiss = () => loader.classList.add('hidden');
    if (document.readyState === 'complete') {
      setTimeout(dismiss, 1900);
    } else {
      window.addEventListener('load', () => setTimeout(dismiss, 1900));
    }
  }

  function initPageTransition() {
    const overlay = document.createElement('div');
    overlay.classList.add('page-transition');
    document.body.appendChild(overlay);
    overlay.addEventListener('animationend', () => overlay.remove());
  }

  function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    const html = document.documentElement;
    if (!btn) return;

    const saved = localStorage.getItem('theme');
    if (saved) html.setAttribute('data-theme', saved);

    const label = () =>
      html.getAttribute('data-theme') === 'light'
        ? 'Switch to dark mode'
        : 'Switch to light mode';
    btn.setAttribute('aria-label', label());

    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      btn.setAttribute('aria-label', label());
      document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
    });
  }

  function initNavBurger() {
    const burger = document.getElementById('navBurger');
    const links  = document.getElementById('navLinks');
    if (!burger || !links) return;

    function closeMenu() {
      burger.classList.remove('open');
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (!links.classList.contains('open')) return;
      if (!links.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  function initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  function initReveal() {
    const els = document.querySelectorAll('.reveal, .profile-card, .art-card, .module-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
          setTimeout(() => {
            el.classList.add('visible');
            el.style.opacity   = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => observer.observe(el));
  }

  function initHeroAnimation() {
    const tag       = document.querySelector('.hero-tag');
    const lines     = document.querySelectorAll('.hero-title .line');
    const underline = document.querySelector('.hero-underline');
    const sub       = document.querySelector('.hero-sub');

    const elements = [
      { el: tag,       delay: 2000 },
      { el: lines[0],  delay: 2150 },
      { el: lines[1],  delay: 2280 },
      { el: underline, delay: 2420, scaleIn: true },
      { el: sub,       delay: 2550 }
    ];

    elements.forEach(({ el, delay, scaleIn }) => {
      if (!el) return;
      setTimeout(() => {
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        el.style.opacity    = scaleIn ? '0.92' : '1';
        el.style.transform  = scaleIn ? 'scaleX(1)' : 'translateY(0)';
      }, delay);
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH = document.getElementById('navbar')?.offsetHeight || 64;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  function initParallax() {
    if (window.matchMedia('(max-width: 900px), (pointer: coarse)').matches) return;
    const hero = document.querySelector('.hero-inner');
    if (!hero) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          hero.style.transform = `translateY(${window.scrollY * 0.15}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function initCardTilt() {
    if (window.matchMedia('(max-width: 900px), (pointer: coarse)').matches) return;
    const cards = document.querySelectorAll('.art-card, .profile-card, .module-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect    = card.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const deltaX  = (e.clientX - centerX) / (rect.width  / 2);
        const deltaY  = (e.clientY - centerY) / (rect.height / 2);
        card.style.transform = `perspective(800px) rotateX(${-deltaY * 2.5}deg) rotateY(${deltaX * 2.5}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      });
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s linear';
      });
    });
  }

  function initFooterClock() {
    const timeEl = document.getElementById('footerTime');
    if (!timeEl) return;
    function tick() {
      timeEl.textContent = new Date().toLocaleTimeString('en-PH', {
        timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const backdrop = document.getElementById('lightboxBackdrop');
    const closeBtn = document.getElementById('lightboxClose');
    const img      = document.getElementById('lightboxImg');
    const tag      = document.getElementById('lightboxTag');
    const title    = document.getElementById('lightboxTitle');
    const sub      = document.getElementById('lightboxSub');
    const link     = document.getElementById('lightboxLink');
    const prevBtn  = document.getElementById('lightboxPrev');
    const nextBtn  = document.getElementById('lightboxNext');
    const triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));

    if (!lightbox || triggers.length === 0) return;

    let currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      const el = triggers[index];
      img.src           = el.dataset.src || '';
      img.alt           = el.dataset.title || '';
      tag.textContent   = el.dataset.tag || '';
      title.textContent = el.dataset.title || '';
      sub.textContent   = el.dataset.sub || '';
      link.href         = el.dataset.link || '#';
      link.textContent  = el.dataset.linkLabel || 'Visit →';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      prevBtn.style.opacity = triggers.length > 1 ? '1' : '0';
      nextBtn.style.opacity = triggers.length > 1 ? '1' : '0';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { img.src = ''; }, 350);
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + triggers.length) % triggers.length;
      img.style.opacity = '0';
      img.style.transform = 'translateX(20px)';
      setTimeout(() => {
        openLightbox(currentIndex);
        img.style.transition = 'opacity 0.25s, transform 0.25s';
        img.style.opacity = '1';
        img.style.transform = 'translateX(0)';
      }, 180);
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % triggers.length;
      img.style.opacity = '0';
      img.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        openLightbox(currentIndex);
        img.style.transition = 'opacity 0.25s, transform 0.25s';
        img.style.opacity = '1';
        img.style.transform = 'translateX(0)';
      }, 180);
    }

    triggers.forEach((el, i) => el.addEventListener('click', () => openLightbox(i)));
    backdrop.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
    }, { passive: true });
  }
  function initSkillStars() {
    const rootStyles = getComputedStyle(document.documentElement);
    const GOLD  = (rootStyles.getPropertyValue('--accent-2') || '#c96f52').trim() || '#c96f52';
    const EMPTY = (rootStyles.getPropertyValue('--star-empty') || 'rgba(230,226,214,0.16)').trim()
                  || 'rgba(230,226,214,0.16)';

    function starSVG(type, size = 14) {
      const id = 'h' + Math.random().toString(36).slice(2, 8);
      const pts = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';
      if (type === 'full')
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><polygon points="${pts}" fill="${GOLD}"/></svg>`;
      if (type === 'half')
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24">
          <defs>
            <clipPath id="L${id}"><rect x="0" y="0" width="12" height="24"/></clipPath>
            <clipPath id="R${id}"><rect x="12" y="0" width="12" height="24"/></clipPath>
          </defs>
          <polygon points="${pts}" fill="${GOLD}" clip-path="url(#L${id})"/>
          <polygon points="${pts}" fill="${EMPTY}" clip-path="url(#R${id})"/>
        </svg>`;
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><polygon points="${pts}" fill="${EMPTY}"/></svg>`;
    }

    document.querySelectorAll('.skill-stars').forEach(el => {
      const r = parseFloat(el.dataset.rating);
      const size = el.closest('.skill-overall') ? 18 : 14;
      const full = Math.floor(r), half = (r % 1) >= 0.5 ? 1 : 0, empty = 5 - full - half;
      el.innerHTML =
        Array(full).fill(starSVG('full', size)).join('') +
        (half ? starSVG('half', size) : '') +
        Array(empty).fill(starSVG('empty', size)).join('');

      if (!el.closest('.skill-rating-row')) {
        const row = document.createElement('div');
        row.className = 'skill-rating-row';
        el.parentNode.insertBefore(row, el);
        row.appendChild(el);

        const number = document.createElement('span');
        number.className = 'skill-rating-number';
        number.textContent = '0.0';
        number.setAttribute('aria-label', `Rating ${r} out of 5`);
        row.appendChild(number);

        const progress = document.createElement('div');
        progress.className = 'skill-progress';
        progress.setAttribute('aria-hidden', 'true');
        const fill = document.createElement('span');
        fill.className = 'skill-progress-fill';
        progress.appendChild(fill);
        el.closest('.skill-card')?.appendChild(progress);

        const card = el.closest('.skill-card');
        if (card) {
          card.style.setProperty('--skill-progress', `${Math.min(100, Math.max(0, r / 5 * 100))}%`);
          card.dataset.skillRating = String(r);
        }
      }
    });
  }

  function initSkillAnimations() {
    const cards = document.querySelectorAll('.skill-card');
    if (!cards.length) return;

    const activate = card => {
      if (card.dataset.skillAnimated === 'true') return;
      card.dataset.skillAnimated = 'true';
      card.classList.add('skill-active');

      const stars = card.querySelector('.skill-stars');
      const number = card.querySelector('.skill-rating-number');
      const rating = parseFloat(card.dataset.skillRating || '0');

      if (stars) {
        requestAnimationFrame(() => stars.classList.add('skill-stars-ready'));
      }

      if (number) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
          number.textContent = rating.toFixed(1);
        } else {
          const start = performance.now();
          const duration = 700;
          const tick = now => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            number.textContent = (rating * eased).toFixed(1);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const delay = parseInt(card.dataset.delay || '0', 10);
          setTimeout(() => activate(card), delay);
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(card => observer.observe(card));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initLoader();
    initPageTransition();
    initNavbar();
    initNavBurger();
    initReveal();
    initHeroAnimation();
    initSmoothScroll();
    initParallax();
    initCardTilt();
    initFooterClock();
    initLightbox();
    initSkillStars();
    initSkillAnimations();

    document.addEventListener('themechange', initSkillStars);
  });

})();

document.addEventListener('DOMContentLoaded', () => {
  const pairs = [
    {
      trigger: 'ticketOfOmoideProject',
      modal: 'ticketOfOmoideModal',
      close: 'ticketOfOmoideModalClose',
      backdrop: 'ticketOfOmoideModalBackdrop'
    },
    {
      trigger: 'stampQuestProject',
      modal: 'stampQuestModal',
      close: 'stampQuestModalClose',
      backdrop: 'stampQuestModalBackdrop'
    }
  ];

  pairs.forEach(({ trigger, modal, close, backdrop }) => {
    const project  = document.getElementById(trigger);
    const modalEl  = document.getElementById(modal);
    const closeEl  = document.getElementById(close);
    const backdropEl = document.getElementById(backdrop);

    if (!project || !modalEl || !closeEl || !backdropEl) return;

    const open = () => {
      modalEl.hidden = false;
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => closeEl.focus());
    };

    const hide = () => {
      modalEl.hidden = true;
      document.body.classList.remove('modal-open');
      project.focus();
    };

    project.addEventListener('click', open);
    closeEl.addEventListener('click', hide);
    backdropEl.addEventListener('click', hide);

    document.addEventListener('keydown', (e) => {
      if (!modalEl.hidden && e.key === 'Escape') hide();
    });
  });
});

// Approved animation enhancements
(function initApprovedAnimations() {
  function addScrollProgress() {
    if (window.matchMedia('(max-width: 700px), (pointer: coarse)').matches) return;
    if (document.getElementById('scrollProgress')) return;
    const bar = document.createElement('div');
    bar.id = 'scrollProgress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }

  function addCursorGlow() {
    if (window.matchMedia('(max-width: 900px), (pointer: coarse)').matches) return;
    document.querySelectorAll('.art-card, .profile-card, .module-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--cursor-x', `${x}%`);
        card.style.setProperty('--cursor-y', `${y}%`);
      }, { passive: true });
    });
  }

  function addThemeAnimation() {
    const btn = document.getElementById('themeToggle');
    if (!btn || btn.dataset.motionReady) return;
    btn.dataset.motionReady = 'true';
    btn.addEventListener('click', () => {
      btn.classList.remove('theme-bounce');
      void btn.offsetWidth;
      btn.classList.add('theme-bounce');
      setTimeout(() => btn.classList.remove('theme-bounce'), 550);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    addScrollProgress();
    addCursorGlow();
    addThemeAnimation();
  });
})();
