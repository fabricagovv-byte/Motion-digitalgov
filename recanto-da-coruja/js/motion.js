/* Recanto da Coruja — movimento (GSAP + ScrollTrigger + Lenis).
   Sem as bibliotecas, ou com "reduzir movimento" ligado, o site fica completo e estático. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var g = window.gsap, ST = window.ScrollTrigger;

  /* ---------- Coruja: olhos seguem o ponteiro e piscam (funciona mesmo sem GSAP) ---------- */
  var owls = $$('[data-owl]');
  var px = innerWidth * 0.5, py = innerHeight * 0.3, rafOwl = null;
  function lookAll() {
    rafOwl = null;
    owls.forEach(function (o) {
      var r = o.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var cx = r.left + r.width / 2, cy = r.top + r.height * 0.46, dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260) * 4.2;
      o.querySelector('[data-pupils]').style.transform = 'translate(' + (dx / d * k).toFixed(2) + 'px,' + (dy / d * k).toFixed(2) + 'px)';
    });
  }
  function onPointer(e) { px = e.clientX; py = e.clientY; if (!rafOwl) rafOwl = requestAnimationFrame(lookAll); }
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('scroll', function () { if (!rafOwl) rafOwl = requestAnimationFrame(lookAll); }, { passive: true });
  lookAll();
  if (!reduz) {
    (function blink() {
      owls.forEach(function (o, i) { setTimeout(function () { o.classList.add('is-blink'); setTimeout(function () { o.classList.remove('is-blink'); }, 340); }, i * 90); });
      setTimeout(blink, 2600 + Math.random() * 3200);
    })();
  }

  /* ---------- Cabeçalho e menu (sem dependências) ---------- */
  var hdr = $('[data-hdr]'), lastY = 0;
  function onScrollHdr() {
    var y = window.scrollY;
    hdr.classList.toggle('is-solid', y > 30 || $('#nav').classList.contains('is-open'));
    hdr.classList.toggle('is-hidden', y > 500 && y > lastY + 4 && !$('#nav').classList.contains('is-open'));
    if (y < lastY - 4) hdr.classList.remove('is-hidden');
    lastY = y;
  }
  window.addEventListener('scroll', onScrollHdr, { passive: true }); onScrollHdr();
  var burger = $('[data-burger]');
  function menu(open) { $('#nav').classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open); onScrollHdr(); }
  burger.addEventListener('click', function () { menu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  if ('IntersectionObserver' in window) {
    var map = {}; $$('#nav a').forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && map[e.target.id]) { $$('#nav a').forEach(function (a) { a.classList.remove('is-active'); }); map[e.target.id].classList.add('is-active'); } }); }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Sem GSAP ou com movimento reduzido: para aqui ---------- */
  var vid = $('.reel__video');
  if (!g || !ST || reduz) {
    root.classList.add('no-motion');
    if (reduz && vid) { vid.removeAttribute('autoplay'); vid.pause(); }
    $$('.gal__track').forEach(function (t) { t.classList.add('is-native'); });
    return;
  }
  g.registerPlugin(ST);

  /* ---------- Rolagem suave ---------- */
  var lenis = null;
  if (window.Lenis && finePointer) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    window.RecantoLenis = lenis;
    root.classList.add('has-lenis');
    lenis.on('scroll', ST.update);
    g.ticker.add(function (t) { lenis.raf(t * 1000); });
    g.ticker.lagSmoothing(0);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.4 });
    });
  }

  /* ---------- Utilitário: separa palavras preservando <em> ---------- */
  function split(el) {
    if (el.dataset.splitDone) return $$('.wi', el);
    el.dataset.splitDone = '1';
    function wrap(node) {
      var frag = document.createDocumentFragment();
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var m = document.createElement('span'); m.className = 'wm'; m.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em';
            var i = document.createElement('span'); i.className = 'wi'; i.style.display = 'inline-block'; i.textContent = part;
            m.appendChild(i); frag.appendChild(m);
          });
        } else if (n.nodeType === 1 && (n.tagName === 'EM' || n.tagName === 'SPAN' && !n.classList.contains('line'))) {
          var c = n.cloneNode(false); c.appendChild(wrap(n)); frag.appendChild(c);
        } else if (n.nodeType === 1) {
          var c2 = n.cloneNode(false); c2.appendChild(wrap(n)); frag.appendChild(c2);
        }
      });
      return frag;
    }
    var f = wrap(el); el.innerHTML = ''; el.appendChild(f);
    return $$('.wi', el);
  }

  /* ---------- Abertura + entrada do hero ---------- */
  var heroWords = split($('.hero__title'));
  g.set(heroWords, { yPercent: 115, rotate: 5 });
  g.set('[data-anim="fade"]', { y: 26, autoAlpha: 0 });
  g.set('.hero__owl .owl--xl', { scale: .6, rotate: -14, autoAlpha: 0 });
  g.set('.chip', { scale: 0 });
  g.set('.hero__moon', { scale: .3, autoAlpha: 0 });

  function heroIn() {
    var tl = g.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(heroWords, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.07 })
      .to('.hero__moon', { scale: 1, autoAlpha: 1, duration: 1.6 }, 0.1)
      .to('.hero__owl .owl--xl', { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.4, ease: 'elastic.out(1, 0.6)' }, 0.2)
      .to('.chip', { scale: 1, duration: .9, stagger: 0.12, ease: 'back.out(2.4)' }, 0.6)
      .to('[data-anim="fade"]', { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1 }, 0.35);
    /* corujão flutua de leve */
    g.to('.hero__owl .owl--xl', { y: -14, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6 });
    g.to('.chip--a', { y: -10, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    g.to('.chip--b', { y: 12, duration: 3.1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    g.to('.chip--c', { y: -8, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  var loader = $('[data-loader]'), visto = false;
  try { visto = sessionStorage.getItem('rc_loader') === '1'; sessionStorage.setItem('rc_loader', '1'); } catch (e) { visto = true; }
  if (loader && !visto) {
    loader.classList.add('is-on');
    var n = { v: 0 }, lids = $$('.owl__lid', loader);
    g.timeline()
      .to(n, { v: 100, duration: 1.2, ease: 'power2.inOut', onUpdate: function () { $('[data-loader-n]').textContent = Math.round(n.v); } })
      .from('.loader__owl', { scale: .7, autoAlpha: 0, duration: .8, ease: 'back.out(2)' }, 0)
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, '+=0.1')
      .add(heroIn, '-=0.45')
      .add(function () { loader.remove(); });
    void lids;
  } else { if (loader) loader.remove(); heroIn(); }

  /* ---------- Reel: o vídeo se abre com a rolagem ---------- */
  var reel = $('[data-reel]');
  if (reel) {
    var tlR = g.timeline({ scrollTrigger: { trigger: '.reel', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
    tlR.fromTo(reel, { clipPath: getComputedStyle(reel).clipPath }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' })
       .fromTo('.reel__video', { scale: 1.15 }, { scale: 1, ease: 'none' }, 0)
       .from('[data-reel-cap] > *', { y: 60, autoAlpha: 0, stagger: 0.1, ease: 'power2.out', duration: .5 }, 0.45);
    ST.create({ trigger: '.reel', start: 'top bottom', end: 'bottom top', onToggle: function (s) { if (!vid) return; if (s.isActive) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); } });
  }

  /* ---------- Faixa: acelera e inclina com a velocidade da rolagem ---------- */
  var track = $('[data-marquee]');
  if (track) {
    track.classList.add('is-gsap');
    var mq = g.to(track, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
    var skewTo = g.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });
    ST.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onUpdate: function (s) {
      var v = s.getVelocity(); mq.timeScale(1 + Math.min(4, Math.abs(v) / 400)); skewTo(g.utils.clamp(-8, 8, v / -300));
    } });
    ST.addEventListener('scrollEnd', function () { g.to(mq, { timeScale: 1, duration: .8 }); skewTo(0); });
  }

  /* ---------- Manifesto: palavras acendem com a rolagem ---------- */
  var sayEl = $('[data-words]');
  if (sayEl) {
    var ws = split(sayEl);
    g.fromTo(ws, { opacity: 0.14 }, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: sayEl, start: 'top 80%', end: 'bottom 40%', scrub: true } });
  }

  /* ---------- Títulos: palavras sobem quando entram na tela ---------- */
  $$('.h2[data-split]').forEach(function (h) {
    var w = split(h);
    g.from(w, { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
  });
  $$('.eyebrow, .head__sub, .lead, .gal__hint').forEach(function (el) {
    g.from(el, { y: 20, autoAlpha: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* ---------- Cartões empilhados ---------- */
  var mm = g.matchMedia();
  mm.add('(min-width: 1021px)', function () {
    var slabs = $$('[data-slab]');
    slabs.forEach(function (s, i) {
      var next = slabs[i + 1];
      if (next) g.to(s, { scale: 0.9, filter: 'brightness(.55)', ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top ' + (90 + 24 * (i + 1)) + 'px', scrub: true } });
      g.fromTo(s.querySelector('.slab__pic img'), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });
  $$('[data-slab]').forEach(function (s) {
    g.from(s.querySelectorAll('.slab__txt > *'), { y: 40, autoAlpha: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 75%', once: true } });
  });

  /* ---------- Contadores ---------- */
  $$('[data-count]').forEach(function (el) {
    var alvo = +el.dataset.count, o = { v: 0 };
    ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { g.to(o, { v: alvo, duration: 1.6, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v); } }); } });
  });

  /* ---------- Cardápio ---------- */
  function cardsIn(list, delay) {
    g.fromTo(list, { y: 50, autoAlpha: 0, rotate: 1.5 }, { y: 0, autoAlpha: 1, rotate: 0, duration: .9, stagger: 0.06, ease: 'expo.out', delay: delay || 0, clearProps: 'transform' });
  }
  g.set('[data-card]', { autoAlpha: 0 });
  ST.create({ trigger: '[data-menu]', start: 'top 85%', once: true, onEnter: function () { cardsIn($$('[data-card]')); } });
  document.addEventListener('recanto:menu', function () { cardsIn($$('[data-card]')); });
  g.from('.tabs', { y: 30, autoAlpha: 0, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '.tabs', start: 'top 92%', once: true } });

  /* ---------- Galeria horizontal fixada ---------- */
  mm.add('(min-width: 681px)', function () {
    var tr = $('[data-gal-track]'); if (!tr) return;
    var dist = function () { return Math.max(0, tr.scrollWidth - innerWidth); };
    var tw = g.to(tr, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: '[data-gal-pin]', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
    $$('.gal__item img', tr).forEach(function (im) {
      g.fromTo(im, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: im.parentNode, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
    });
    return function () { g.set(tr, { clearProps: 'x' }); };
  });
  mm.add('(max-width: 680px)', function () { $('[data-gal-track]').classList.add('is-native'); return function () { $('[data-gal-track]').classList.remove('is-native'); }; });

  /* ---------- Pousada ---------- */
  ST.create({ trigger: '[data-amen]', start: 'top 85%', once: true, onEnter: function () {
    g.from('[data-amen-item]', { y: 30, scale: .9, autoAlpha: 0, duration: .8, stagger: 0.07, ease: 'back.out(1.8)' });
  } });
  g.from('.stats > div', { y: 40, autoAlpha: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true } });

  /* ---------- Avaliação, mapa de rota ---------- */
  g.from('.rev__in > *', { y: 30, autoAlpha: 0, stagger: .1, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '.rev', start: 'top 85%', once: true } });
  var rp = $('.route__path');
  if (rp) {
    var len = rp.getTotalLength();
    g.fromTo('.route svg', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: '.route', start: 'top 85%', once: true } });
    void len;
  }
  g.from('.facts > div', { x: -30, autoAlpha: 0, stagger: .08, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.facts', start: 'top 88%', once: true } });
  g.from('.hours', { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.hours', start: 'top 88%', once: true } });

  /* ---------- Rodapé: letreiro gigante ---------- */
  var word = $('[data-word]');
  if (word) {
    var txt = word.textContent; word.textContent = '';
    txt.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch === ' ' ? ' ' : ch; word.appendChild(s); });
    g.from('.ch', { yPercent: 100, color: '#ff6b2c', stagger: 0.035, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: word, start: 'top 95%', once: true } });
    $$('.ch', word).forEach(function (c) {
      c.addEventListener('pointerenter', function () { g.to(c, { yPercent: -18, color: '#f5b544', duration: .35, ease: 'power3.out' }); g.to(c, { yPercent: 0, color: '#263629', duration: .9, delay: .35, ease: 'elastic.out(1,.4)' }); });
    });
  }

  /* ---------- Cursor e botões magnéticos (somente mouse) ---------- */
  if (finePointer) {
    root.classList.add('has-cursor');
    var cur = $('[data-cursor]'), cx = g.quickTo(cur, 'x', { duration: .25, ease: 'power3' }), cy = g.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', function (e) { cur.classList.toggle('is-big', !!e.target.closest('.gal__item, .card__pic, .slab__pic')); });
    $$('.magnetic').forEach(function (b) {
      var bx = g.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), by = g.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); bx((e.clientX - r.left - r.width / 2) * .25); by((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('pointerleave', function () { bx(0); by(0); });
    });
  }

  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
