/* ============================================
   FRANCE ISOLATION CONSEIL - Main JS
   ============================================ */

(function() {
  'use strict';

  // --- Header scroll effect ---
  const header = document.getElementById('header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    }, { passive: true });
  }

  // --- Mobile navigation ---
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll reveal (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function(el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function(el) {
      el.classList.add('visible');
    });
  }

  // --- Animated counters ---
  const counters = document.querySelectorAll('.counter');

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      counterObserver.observe(counter);
    });
  }

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      if (decimals > 0) {
        el.textContent = current.toFixed(decimals);
      } else {
        el.textContent = Math.floor(current).toLocaleString('fr-FR').replace(/\s/g, '\u00A0');
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (decimals > 0) {
          el.textContent = target.toFixed(decimals);
        } else {
          el.textContent = target.toLocaleString('fr-FR').replace(/\s/g, '\u00A0');
        }
      }
    }

    requestAnimationFrame(update);
  }

  // --- Multi-step form ---
  const formNext = document.getElementById('formNext');
  const formBack = document.getElementById('formBack');
  const simulationForm = document.getElementById('simulationForm');

  if (formNext) {
    formNext.addEventListener('click', function() {
      const step1 = document.querySelector('.form-step[data-step="1"]');
      const codePostal = document.getElementById('codePostal');
      const projet = document.getElementById('projet');

      if (codePostal && !codePostal.value.match(/^[0-9]{5}$/)) {
        codePostal.focus();
        codePostal.style.borderColor = '#ef4444';
        return;
      }
      if (projet && !projet.value) {
        projet.focus();
        projet.style.borderColor = '#ef4444';
        return;
      }

      step1.classList.remove('active');
      document.querySelector('.form-step[data-step="2"]').classList.add('active');
      document.querySelector('.form-progress__step[data-step="2"]').classList.add('active');
    });
  }

  if (formBack) {
    formBack.addEventListener('click', function() {
      document.querySelector('.form-step[data-step="2"]').classList.remove('active');
      document.querySelector('.form-step[data-step="1"]').classList.add('active');
      document.querySelector('.form-progress__step[data-step="2"]').classList.remove('active');
    });
  }

  // Type selector toggle
  document.querySelectorAll('.type-selector__option').forEach(function(option) {
    option.addEventListener('click', function() {
      this.parentElement.querySelectorAll('.type-selector__option').forEach(function(o) {
        o.classList.remove('selected');
      });
      this.classList.add('selected');
    });
  });

  // Form validation visual reset
  document.querySelectorAll('.form-input').forEach(function(input) {
    input.addEventListener('focus', function() {
      this.style.borderColor = '';
    });
  });

  // --- Google Sheet URL ---
  var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxrByaF4tBVlm92txoGeRVa5Hv58ZzQfFEh_VEJBrfoz6eSBmGsTQOjFpXOfOROcDE/exec';

  function sendToGoogleSheet(formData, btn, originalText, form) {
    fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(function() {
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Demande envoyée !';
      btn.style.background = '#1A3160';
      setTimeout(function() {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
        var firstOption = form.querySelector('.type-selector__option');
        if (firstOption) {
          form.querySelectorAll('.type-selector__option').forEach(function(o) { o.classList.remove('selected'); });
          firstOption.classList.add('selected');
        }
        var step2 = document.querySelector('.form-step[data-step="2"]');
        var step1 = document.querySelector('.form-step[data-step="1"]');
        var progress2 = document.querySelector('.form-progress__step[data-step="2"]');
        if (step2) step2.classList.remove('active');
        if (step1) step1.classList.add('active');
        if (progress2) progress2.classList.remove('active');
      }, 3000);
    }).catch(function() {
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Demande envoyée !';
      btn.style.background = '#1A3160';
      setTimeout(function() {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  function getPageName() {
    var path = window.location.pathname;
    if (path.indexOf('ite') !== -1) return 'ITE';
    if (path.indexOf('solaire') !== -1) return 'Solaire';
    if (path.indexOf('pac') !== -1) return 'PAC';
    if (path.indexOf('contact') !== -1) return 'Contact';
    return 'Accueil';
  }

  // Form submission (homepage multi-step)
  if (simulationForm) {
    simulationForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var btn = this.querySelector('[type="submit"]');
      var originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner"></span> Envoi en cours...';
      btn.disabled = true;

      var selected = this.querySelector('.type-selector__option.selected');
      var formData = {
        page: getPageName(),
        statut: selected ? selected.getAttribute('data-value') : '',
        prenom: (this.querySelector('[name="prenom"]') || {}).value || '',
        nom: (this.querySelector('[name="nom"]') || {}).value || '',
        telephone: (this.querySelector('[name="telephone"]') || {}).value || '',
        email: (this.querySelector('[name="email"]') || {}).value || '',
        code_postal: (this.querySelector('[name="code_postal"]') || {}).value || '',
        utm_source: (this.querySelector('[name="utm_source"]') || {}).value || '',
        utm_medium: (this.querySelector('[name="utm_medium"]') || {}).value || '',
        utm_campaign: (this.querySelector('[name="utm_campaign"]') || {}).value || ''
      };

      sendToGoogleSheet(formData, btn, originalText, this);
    });
  }

  // Contact form (ITE, Solaire, PAC, Contact pages)
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var btn = this.querySelector('[type="submit"]');
      var originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner"></span> Envoi en cours...';
      btn.disabled = true;

      var selected = this.querySelector('.type-selector__option.selected');
      var formData = {
        page: getPageName(),
        statut: selected ? selected.getAttribute('data-value') : '',
        prenom: (this.querySelector('[name="prenom"]') || {}).value || '',
        nom: (this.querySelector('[name="nom"]') || {}).value || '',
        telephone: (this.querySelector('[name="telephone"]') || {}).value || '',
        email: (this.querySelector('[name="email"]') || {}).value || '',
        code_postal: (this.querySelector('[name="code_postal"]') || {}).value || '',
        utm_source: (this.querySelector('[name="utm_source"]') || {}).value || '',
        utm_medium: (this.querySelector('[name="utm_medium"]') || {}).value || '',
        utm_campaign: (this.querySelector('[name="utm_campaign"]') || {}).value || ''
      };

      sendToGoogleSheet(formData, btn, originalText, this);
    });
  }

  // --- UTM parameter capture ---
  function captureUTM() {
    const params = new URLSearchParams(window.location.search);
    const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];

    utmFields.forEach(function(field) {
      const value = params.get(field);
      if (value) {
        const inputs = document.querySelectorAll('input[name="' + field + '"]');
        inputs.forEach(function(input) {
          input.value = value;
        });
        try {
          sessionStorage.setItem(field, value);
        } catch(e) {}
      } else {
        try {
          const stored = sessionStorage.getItem(field);
          if (stored) {
            const inputs = document.querySelectorAll('input[name="' + field + '"]');
            inputs.forEach(function(input) {
              input.value = stored;
            });
          }
        } catch(e) {}
      }
    });
  }

  captureUTM();

  // --- Gallery filter ---
  const filterButtons = document.querySelectorAll('.gallery-filter');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterButtons.length > 0) {
    filterButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterButtons.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');

        galleryItems.forEach(function(item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.classList.remove('hidden');
            item.style.animation = 'none';
            item.offsetHeight; // reflow
            item.style.animation = 'fadeInUp 0.4s ease forwards';
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  // --- Lazy load images ---
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          imgObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
      img.classList.add('img-load');
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        imgObserver.observe(img);
        img.addEventListener('load', function() {
          img.classList.add('loaded');
        });
      }
    });
  }

})();
