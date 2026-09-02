/* ===========================================================
   TOVILA WATER SOLUTIONS — shared behaviour (vanilla JS)
   No framework, no build step.
   NOTE: every form on this site is front-end only. Where a form
   "submits", a real submission endpoint (POST to a backend or an
   email/CRM service) must be wired in later — search for
   "TODO: wire submission endpoint".
   =========================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SEGMENT_LABELS = {
    residential: 'Home water solutions',
    commercial: 'Business water solutions',
    industrial: 'Industrial / institutional systems',
    services: 'Existing system support',
    training: 'Water engineering training'
  };

  /* ---------------- entry segment (goal gradient) ---------------- */
  function setEntry(segment) {
    try { localStorage.setItem('tovila_entry', segment); } catch (e) {}
  }
  function getEntry() {
    try { return localStorage.getItem('tovila_entry'); } catch (e) { return null; }
  }
  window.tovilaSetEntry = setEntry;
  window.tovilaGetEntry = getEntry;

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-entry]');
    if (el) setEntry(el.getAttribute('data-entry'));
  });

  /* ---------------------- scroll progress ----------------------- */
  var bar = document.getElementById('scroll-progress');
  if (bar && !reduced) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ------------------------ nav dropdowns ----------------------- */
  document.querySelectorAll('.drop').forEach(function (drop) {
    var btn = drop.querySelector('.drop-toggle');
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = drop.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      document.querySelectorAll('.drop.open').forEach(function (o) {
        if (o !== drop) { o.classList.remove('open'); o.querySelector('.drop-toggle').setAttribute('aria-expanded', 'false'); }
      });
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.drop.open').forEach(function (o) {
      o.classList.remove('open');
      o.querySelector('.drop-toggle').setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.drop.open').forEach(function (o) { o.classList.remove('open'); });
    var m = document.getElementById('mobile-menu');
    if (m && m.classList.contains('open')) closeMobile();
  });

  /* ------------------------ mobile overlay ---------------------- */
  var menu = document.getElementById('mobile-menu');
  var burger = document.querySelector('.hamburger');
  function closeMobile() {
    if (!menu) return;
    menu.classList.remove('open');
    document.body.style.overflow = '';
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      menu.classList.add('open');
      document.body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
      var c = menu.querySelector('.m-close');
      if (c) c.focus();
    });
    menu.querySelectorAll('.m-close').forEach(function (b) { b.addEventListener('click', closeMobile); });
  }

  /* --------------------- staggered reveals ---------------------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = Array.prototype.slice.call(el.parentNode.children).filter(function (n) { return n.classList.contains('reveal'); });
        var i = Math.max(0, sibs.indexOf(el));
        setTimeout(function () { el.classList.add('in'); }, Math.min(i, 6) * 90);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------- filters -------------------------- */
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var target = document.querySelector(group.getAttribute('data-filter-target'));
    group.querySelectorAll('.pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        group.querySelectorAll('.pill').forEach(function (p) { p.classList.remove('on'); p.setAttribute('aria-pressed', 'false'); });
        pill.classList.add('on');
        pill.setAttribute('aria-pressed', 'true');
        var f = pill.getAttribute('data-filter');
        if (!target) return;
        target.querySelectorAll('[data-cat]').forEach(function (item) {
          var show = f === 'all' || item.getAttribute('data-cat').split(' ').indexOf(f) > -1;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  });

  /* ------------------------ multi-step forms -------------------- */
  document.querySelectorAll('[data-multistep]').forEach(function (form) {
    var panels = Array.prototype.slice.call(form.querySelectorAll('.step-panel'));
    var fill = form.querySelector('.progress-fill');
    var counter = form.querySelector('[data-step-counter]');
    var doneWrap = form.querySelector('[data-done-step]');
    var segment = form.getAttribute('data-segment');
    var total = panels.length;
    var idx = 0;

    // GOAL GRADIENT: an entry choice made earlier counts as step 1 complete.
    var entry = getEntry();
    if (segment && entry === segment && total > 1) {
      idx = 1;
      if (doneWrap) {
        doneWrap.textContent = '\u2713 ' + (SEGMENT_LABELS[entry] || 'Your selection') + ' \u2014 step 1 complete';
        doneWrap.style.display = 'inline-block';
      }
    } else if (doneWrap) {
      doneWrap.style.display = 'none';
    }

    function render() {
      panels.forEach(function (p, i) { p.classList.toggle('active', i === idx); });
      var pct = Math.round(((idx + (idx > 0 ? 1 : 0.35)) / (total + 1)) * 100);
      if (fill) fill.style.width = Math.max(pct, idx > 0 ? 30 : 12) + '%';
      if (counter) counter.textContent = 'Step ' + (idx + 1) + ' of ' + total;
    }
    form.querySelectorAll('[data-next]').forEach(function (b) {
      b.addEventListener('click', function () { if (idx < total - 1) { idx++; render(); form.scrollIntoView({ block: 'nearest' }); } });
    });
    form.querySelectorAll('[data-back]').forEach(function (b) {
      b.addEventListener('click', function () { if (idx > 0) { idx--; render(); } });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // TODO: wire submission endpoint (no backend in Phase 1)
      var ok = form.querySelector('.form-success');
      panels.forEach(function (p) { p.classList.remove('active'); });
      if (fill) fill.style.width = '100%';
      if (counter) counter.textContent = 'Complete';
      if (ok) ok.classList.add('show');
    });
    render();
  });

  /* --------------- residential diagnostic quiz (reciprocity) ---- */
  var quiz = document.getElementById('water-quiz');
  if (quiz) {
    var TIPS = {
      sediment: {
        title: 'Visible sediment or cloudy water',
        tips: ['Your supply is most likely carrying suspended solids from a borehole screen or an ageing tank — a sediment (multimedia) filter upstream of everything else usually clears it.',
               'Cloudiness that clears from the bottom of a glass upward is usually trapped air, not dirt. Let a glass stand for two minutes before judging.',
               'Clean and disinfect your storage tank quarterly; sediment settling there re-suspends every time the tank refills.']
      },
      taste: {
        title: 'Bad taste or odour',
        tips: ['A chlorine or "swimming pool" taste points to municipal residual — activated carbon removes it cheaply and immediately.',
               'A rotten-egg smell usually means hydrogen sulphide or bacterial activity in the tank or borehole, which needs oxidation or UV, not carbon alone.',
               'Run a tap for 30 seconds and re-taste. If the taste disappears, the problem is your plumbing or tank, not the source.']
      },
      hard: {
        title: 'Hard water spots and scale',
        tips: ['White spots on taps and glassware mean dissolved calcium and magnesium. Every 1mm of scale inside a heater raises its energy use noticeably and shortens its life.',
               'Soap that will not lather and stiff laundry are the same cause — softening treats all of it at one point of entry.',
               'Descaling appliances without treating the water only resets the clock; the scale returns at the same rate.']
      },
      none: {
        title: 'No obvious symptoms',
        tips: ['Clear, odourless water can still be microbiologically unsafe or high in dissolved solids — neither is visible.',
               'Ask for a basic lab test covering TDS, hardness, iron, pH and total coliforms; this is the cheapest possible starting point.',
               'If you are on borehole water, retest after every rainy season — source quality shifts over the year.']
      }
    };
    quiz.addEventListener('submit', function (e) {
      e.preventDefault();
      var choice = quiz.querySelector('input[name="symptom"]:checked');
      var key = choice ? choice.value : 'none';
      var data = TIPS[key];
      var out = document.getElementById('quiz-result');
      out.innerHTML = '<span class="eyebrow">Free instant diagnostic</span><h3>' + data.title + '</h3><ul>' +
        data.tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
      out.classList.add('show');
      var after = document.getElementById('quiz-after');
      if (after) setTimeout(function () { after.classList.add('show'); }, reduced ? 0 : 500);
    });
  }

  /* --------------- package builder (IKEA effect) ---------------- */
  var builder = document.getElementById('package-builder');
  if (builder) {
    var COMPONENTS = {
      sediment: { ico: '\u2699', name: 'Multimedia sediment filter' },
      taste: { ico: '\u25CF', name: 'Activated carbon stage' },
      hard: { ico: '\u2744', name: 'Water softener' },
      drinking: { ico: '\u25C6', name: 'Reverse osmosis unit' },
      micro: { ico: '\u2600', name: 'UV disinfection' }
    };
    var slots = document.getElementById('package-slots');
    var count = document.getElementById('package-count');
    function renderPackage() {
      var on = Array.prototype.slice.call(builder.querySelectorAll('.toggle.on'));
      if (!on.length) {
        slots.innerHTML = '<p class="slot-empty">Select your concerns to assemble a package</p>';
      } else {
        slots.innerHTML = on.map(function (b) {
          var c = COMPONENTS[b.getAttribute('data-concern')];
          return '<div class="slot"><span class="s-ico">' + c.ico + '</span><span>' + c.name + '</span></div>';
        }).join('');
      }
      if (count) count.textContent = on.length + ' component' + (on.length === 1 ? '' : 's') + ' selected';
    }
    builder.querySelectorAll('.toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var on = b.classList.toggle('on');
        b.setAttribute('aria-pressed', String(on));
        var st = b.querySelector('.t-state');
        if (st) st.textContent = on ? 'In your package' : 'Tap to add';
        renderPackage();
      });
    });
    renderPackage();
  }

  /* --------------- learning path builder (IKEA effect) ---------- */
  var pathBuilder = document.getElementById('path-builder');
  if (pathBuilder) {
    var stages = Array.prototype.slice.call(pathBuilder.querySelectorAll('.stage'));
    var out = document.getElementById('path-summary');
    stages.forEach(function (s, i) {
      s.addEventListener('click', function () {
        stages.forEach(function (o, j) {
          o.classList.toggle('on', j >= i);
          o.classList.toggle('dim', j < i);
          o.setAttribute('aria-pressed', String(j >= i));
        });
        if (out) {
          out.innerHTML = '<span class="eyebrow">Your path</span><h3>' + (stages.length - i) +
            ' stages, starting at ' + s.getAttribute('data-stage') + '</h3><p>' +
            stages.slice(i).map(function (x) { return x.getAttribute('data-stage'); }).join(' \u2192 ') +
            '</p><a class="btn" href="#apply"><span>Start this path</span></a>';
          out.style.display = 'block';
        }
      });
    });
  }

  /* ---------------------- contact tabs / subject ---------------- */
  var tabs = document.querySelectorAll('.tab[data-subject]');
  var subject = document.getElementById('subject');
  if (tabs.length && subject) {
    var entryMap = {
      residential: 'Request Assessment',
      commercial: 'Request Assessment',
      industrial: 'Technical Support',
      services: 'Technical Support',
      training: 'Training Enquiry'
    };
    // SMART DEFAULT: never blank — from URL, then entry segment, then General Enquiry.
    var params = new URLSearchParams(location.search);
    var want = params.get('subject') || entryMap[getEntry()] || 'General Enquiry';
    function selectTab(value) {
      subject.value = value;
      tabs.forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-subject') === value); });
      var hint = document.getElementById('subject-hint');
      if (hint) hint.textContent = 'Pre-filled for you \u2014 change it if needed';
      document.querySelectorAll('[data-subject-panel]').forEach(function (p) {
        p.style.display = p.getAttribute('data-subject-panel') === value ? '' : 'none';
      });
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { selectTab(t.getAttribute('data-subject')); }); });
    subject.addEventListener('change', function () { selectTab(subject.value); });
    selectTab(Array.prototype.some.call(tabs, function (t) { return t.getAttribute('data-subject') === want; }) ? want : 'General Enquiry');
  }

  /* ------------- simple single-step form handling --------------- */
  document.querySelectorAll('form[data-simple]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); // TODO: wire submission endpoint (no backend in Phase 1)
      var ok = f.querySelector('.form-success') || f.parentNode.querySelector('.form-success');
      if (ok) ok.classList.add('show');
    });
  });

  /* ----------------------- video placeholder -------------------- */
  document.querySelectorAll('.play').forEach(function (b) {
    b.addEventListener('click', function () {
      var note = document.getElementById('video-note');
      // Placeholder: real lesson embed (YouTube/Vimeo iframe) to be dropped in later.
      if (note) note.textContent = 'Placeholder — Lesson 1 video embed pending final upload. No signup required when live.';
    });
  });
})();
