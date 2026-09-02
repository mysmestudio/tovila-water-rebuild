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
  var heroImg = document.querySelector('.hero-x .hero-media img');
  if (heroImg && !reduce) {
    var raf = false;
    window.addEventListener('scroll', function () {
      if (raf) return; raf = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 900);
        heroImg.style.transform = 'scale(1.08) translate3d(0,' + (y * 0.16) + 'px,0)';
        raf = false;
      });
    }, { passive: true });
  }

  /* ----------------------- water cursor ----------------------- */
  if (fine && !reduce) {
    var cur = document.createElement('div');
    cur.id = 'water-cursor';
    document.body.appendChild(cur);
    var cx = 0, cy = 0, tx = 0, ty = 0, shown = false;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; cur.style.opacity = '1'; cx = tx; cy = ty; }
      var big = e.target.closest && e.target.closest('a,button,.wcard,.media');
      cur.style.width = big ? '54px' : '26px';
      cur.style.height = big ? '54px' : '26px';
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cur.style.transform = 'translate3d(' + (cx - 13) + 'px,' + (cy - 13) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------- ripple / caustic canvas ----------------- */
  function waterCanvas(canvas, opts) {
    if (!canvas || reduce) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, t = 0;
    var ripples = [];
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
