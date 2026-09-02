/* ===========================================================
   TOVILA — water interaction layer (vanilla JS, no build step)
   - hero ripple/caustic canvas that reacts to the mouse
   - water-drop cursor
   - scroll parallax on hero media
   - reveal-on-scroll
   - animated stat counters
   - liquid button pointer tracking
   =========================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------- reveal on scroll ---------------------- */
  var ups = document.querySelectorAll('.up');
  if (reduce || !('IntersectionObserver' in window)) {
    ups.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    ups.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------- counters -------------------------- */
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = (el.getAttribute('data-dec') | 0);
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    var start = performance.now(), dur = 1500;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) counters.forEach(runCount);
    else {
      var cio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ------------------- liquid button pointer ------------------- */
  document.querySelectorAll('.btn-liquid').forEach(function (b) {
    b.addEventListener('pointermove', function (ev) {
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100) + '%');
      b.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* --------------------- hero media parallax ------------------- */
  var heroMedia = document.querySelector('.hero-x .hero-media');
  if (heroMedia && !reduce) {
    var raf = false;
    window.addEventListener('scroll', function () {
      if (raf) return; raf = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        heroMedia.style.transform = 'translate3d(0,' + (y * 0.14) + 'px,0)';
        raf = false;
      });
    }, { passive: true });
  }

  /* --------------------- hero image slider -------------------- */
  (function heroSlider() {
    var wrap = document.getElementById('hero-slides');
    var dotsBox = document.getElementById('hero-dots');
    if (!wrap) return;
    var slides = Array.prototype.slice.call(wrap.querySelectorAll('img'));
    if (slides.length < 2) return;
    var i = 0, timer = null;
    var dots = slides.map(function (_, n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Show hero image ' + (n + 1));
      b.addEventListener('click', function () { go(n, true); });
      if (dotsBox) dotsBox.appendChild(b);
      return b;
    });
    function go(n, manual) {
      slides[i].classList.remove('on');
      dots[i].setAttribute('aria-current', 'false');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('on');
      /* restart the dot fill animation */
      var d = dots[i];
      d.setAttribute('aria-current', 'true');
      d.style.animation = 'none';
      if (manual) { clearInterval(timer); start(); }
    }
    function start() { if (!reduce) timer = setInterval(function () { go(i + 1); }, 6000); }
    dots[0].setAttribute('aria-current', 'true');
    start();
  })();

  /* ------------------- start-here carousel -------------------- */
  (function carousel() {
    var track = document.getElementById('challenge-track');
    var box = document.getElementById('challenge-carousel');
    if (!track || !box) return;
    var bar = box.querySelector('.cbar i');
    function step() {
      var card = track.querySelector('.ccard');
      return card ? card.offsetWidth + 18 : 320;
    }
    box.querySelectorAll('.cnav button').forEach(function (b) {
      b.addEventListener('click', function () {
        track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      var ratio = max > 0 ? track.scrollLeft / max : 0;
      var visible = track.clientWidth / track.scrollWidth;
      if (bar) {
        bar.style.width = Math.max(12, visible * 100) + '%';
        bar.style.transform = 'translateX(' + (ratio * (100 / Math.max(visible, 0.0001) - 100)) + '%)';
      }
    }
    track.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);
    sync();

    /* drag to scrub */
    var down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      moved = Math.abs(e.clientX - sx);
      if (moved > 4) track.scrollLeft = sl - (e.clientX - sx);
    });
    window.addEventListener('pointerup', function () { down = false; });
    track.addEventListener('click', function (e) { if (moved > 6) e.preventDefault(); });
  })();

  /* --------------- water process flow fill on view ------------- */
  (function flow() {
    var f = document.getElementById('flow');
    if (!f) return;
    if (reduce) { f.classList.add('in'); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { f.classList.add('in'); io.unobserve(f); } });
    }, { threshold: 0.35 });
    io.observe(f);
  })();

  /* ------------- sitewide pointer ripple rings ---------------- */
  if (fine && !reduce) {
    var last = 0;
    function ring(x, y, size, cool) {
      var el = document.createElement('span');
      el.className = 'wripple' + (cool ? ' cool' : '');
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 950);
    }
    window.addEventListener('pointermove', function (e) {
      var now = performance.now();
      if (now - last < 110) return;
      last = now;
      var over = e.target.closest && e.target.closest('a,button,.ccard,.media,.fstep');
      ring(e.clientX, e.clientY, over ? 70 : 44, !over);
    }, { passive: true });
    window.addEventListener('pointerdown', function (e) {
      ring(e.clientX, e.clientY, 150, false);
      ring(e.clientX, e.clientY, 90, true);
    }, { passive: true });
  }

  /* ------------------- ripple / caustic canvas ----------------- */
  function waterCanvas(canvas, opts) {
    if (!canvas || reduce) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, t = 0;
    var ripples = [];
    var bubbles = [];
    var tint = (opts && opts.tint) || '40,182,232';

    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);
    for (var bi = 0; bi < 30; bi++) {
      bubbles.push({ x: Math.random() * w, y: Math.random() * h, r: 1.5 + Math.random() * 3.5,
        v: 0.25 + Math.random() * 0.7, s: Math.random() * 6.28, ss: 0.005 + Math.random() * 0.01,
        a: 0.08 + Math.random() * 0.2 });
    }

    var host = (opts && opts.host) || canvas.parentElement;
    host.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      if (Math.random() > 0.55) {
        ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 2, a: 0.55 });
      }
      if (ripples.length > 42) ripples.shift();
    }, { passive: true });
    host.addEventListener('pointerdown', function (e) {
      var r = canvas.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 4, a: 0.9, strong: true });
    }, { passive: true });

    function frame() {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);

      /* drifting caustic bands */
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < 3; i++) {
        var amp = 16 + i * 9;
        var yBase = h * (0.42 + i * 0.14);
        ctx.beginPath();
        ctx.moveTo(0, yBase);
        for (var x = 0; x <= w; x += 14) {
          var y = yBase + Math.sin(x * 0.006 + t * (1.2 + i * 0.5)) * amp
                       + Math.sin(x * 0.017 - t * (0.8 + i)) * (amp * 0.35);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(' + tint + ',' + (0.05 + i * 0.02) + ')';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      /* rising bubbles */
      for (var b = 0; b < bubbles.length; b++) {
        var bb = bubbles[b];
        bb.y -= bb.v; bb.s += bb.ss;
        if (bb.y < -12) { bb.y = h + 12; bb.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(bb.x + Math.sin(bb.s) * 9, bb.y, bb.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,' + bb.a + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* pointer ripples */
      for (var k = ripples.length - 1; k >= 0; k--) {
        var p = ripples[k];
        p.r += p.strong ? 4.6 : 2.2;
        p.a *= p.strong ? 0.975 : 0.955;
        if (p.a < 0.01) { ripples.splice(k, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + tint + ',' + p.a + ')';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,' + (p.a * 0.4) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  waterCanvas(document.getElementById('ripple-canvas'), { host: document.querySelector('.hero-x') });
  waterCanvas(document.getElementById('err-canvas'), { host: document.querySelector('.err') });
})();
