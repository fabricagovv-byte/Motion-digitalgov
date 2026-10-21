// Kit de animação da série V4.7. Tudo é determinístico: a página expõe window.seek(t).
// Uso no film.html:  <link rel="stylesheet" href="../kit/kit.css"> <script src="../kit/kit.js"></script>
//   K.boot({ system:'SISTEMA DE SAÚDE', accent:'#2BD99F', scene:(k,t,lt)=>{...}, build:()=>{...} })
//   - cada cena é <div class="sc" id="sN"><div class="cam">…</div></div>, N = número da fala (1..n)
//   - a cena N começa 0,4 s antes da fala N (a cena 1 começa em 0)
//   - K.Wd(k,'palavra',off) dá o instante em que a palavra é dita na fala k (estimado pela posição na legenda)
const K = (() => {
  const $ = id => document.getElementById(id);
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const eo = x => 1 - Math.pow(1 - cl(x), 3);
  const eio = x => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const spr = x => x <= 0 ? 0 : 1 - Math.exp(-6 * x) * Math.cos(10 * x);
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const lerp = (a, b, p) => a + (b - a) * p;
  const S = { TL: null, LN: [], SC: [], opt: null, tiles: [] };

  function Wd(k, word, off = 0) {
    const l = S.LN[k - 1]; const c = l.caption.toLowerCase(); const i = c.indexOf(word.toLowerCase());
    return l.start + l.dur * (i < 0 ? 0 : i / c.length) + off;
  }
  const fade = (el, t, t0, d = .4) => { el.style.opacity = cl((t - t0) / d); };
  function rise(el, t, t0, dy = 50, d = .6) { const p = cl((t - t0) / d); el.style.opacity = p; el.style.transform = `translateY(${(1 - eo(p)) * dy}px)`; }
  function slideX(el, t, t0, dx = 80, d = .6) { const p = cl((t - t0) / d); el.style.opacity = p; el.style.transform = `translateX(${(1 - eo(p)) * dx}px)`; }
  function pop(el, t, t0, from = .6) { const p = spr(t - t0); el.style.opacity = cl((t - t0) / .15); el.style.transform = `scale(${t < t0 ? from : from + (1 - from) * p})`; }
  function slam(el, t, t0) {
    const u = t - t0, p = cl(u / .35);
    const wob = p >= 1 ? .03 * Math.exp(-(u - .35) * 8) * Math.sin((u - .35) * 30) : 0;
    el.style.opacity = cl(u / .12); el.style.transform = `scale(${1.5 - .5 * eo(p) + wob})`;
  }
  const out = (el, t, t1, d = .3) => { const p = cl((t - t1) / d); if (p > 0) { el.style.opacity = Math.min(+el.style.opacity || 1, 1 - p); } };
  const fmt = (n, dec = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  function count(el, t, t0, d, val, o = {}) { const p = eo((t - t0) / d); el.textContent = (o.pre || '') + fmt(val * p, o.dec || 0) + (o.suf || ''); }
  function typed(el, txt, t, t0, cps = 28, caret = true) { const n = cl(Math.floor((t - t0) * cps), 0, txt.length); el.textContent = txt.slice(0, n) + (caret && n < txt.length && t > t0 ? '▍' : ''); }
  const _len = new Map();
  function draw(path, t, t0, d = 1) {   // desenha um <path>/<line> com stroke-dasharray
    let L = _len.get(path); if (!L) { L = path.getTotalLength ? path.getTotalLength() : 1000; _len.set(path, L); path.style.strokeDasharray = L; }
    path.style.strokeDashoffset = L * (1 - eio((t - t0) / d));
  }
  const bar = (el, t, t0, d, prop, max) => { el.style[prop] = (max * eo((t - t0) / d)) + 'px'; };

  // ---------- mockups ----------
  const phone = (id, inner, x, y, s = 1) => `<div class="phone" id="${id}" style="left:${x}px;top:${y}px;transform:scale(${s});transform-origin:0 0"><div class="scr"><div class="notch"></div>${inner}</div></div>`;
  const laptop = (id, url, inner, x, y, w, h) => `<div class="laptop" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="bar"><b></b><b></b><b></b><span>${url}</span></div><div class="body">${inner}</div></div>`;

  // ---------- logo V4.7 animada ----------
  const LOGO = [
    ['V', '0,40 118,40 236,300 354,40 472,40 290,440 182,440', 'fg', -260, 0],
    ['d', '560,40 672,40 498,262 386,262', 'fg', 0, -300],
    ['b', '386,262 730,262 706,330 362,330', 'fg', -300, 0],
    ['h', '604,150 682,96 682,440 604,440', 'fg', 0, 300],
    ['p', '742,370 812,370 812,440 742,440', 'gold', 0, 200],
    ['s', '840,40 1080,40 1080,104 948,440 856,440 984,112 840,112', 'gold', 300, 0],
  ];
  // logo enviada pelo cliente (recolorida: letras brancas + ponto dourado), revelada com brilho
  const LOGO_IMG = '../kit/assets/nova/v47_logo_branca_transp.png';
  function logoSVG(id) {
    const m = `-webkit-mask:url(${LOGO_IMG}) left 30px top 10px/1240px auto no-repeat;mask:url(${LOGO_IMG}) left 30px top 10px/1240px auto no-repeat`;
    return `<div id="${id}" style="position:relative;width:1300px;height:540px">
      <img data-n="img" src="${LOGO_IMG}" alt="V4.7" style="position:absolute;left:30px;top:10px;width:1240px;filter:drop-shadow(0 20px 40px #000a)">
      <div data-n="sw" style="position:absolute;inset:0;${m};background:linear-gradient(100deg,transparent 0%,transparent 42%,#ffffffee 50%,transparent 58%,transparent 100%);background-size:300% 100%;mix-blend-mode:screen"></div></div>`;
  }
  function logoAnim(id, t, t0) {   // revela da esquerda p/ direita, assenta com mola e passa um brilho
    const el = $(id); if (!el) return;
    const img = el.querySelector('[data-n=img]'), sw = el.querySelector('[data-n=sw]');
    const u = t - t0, r = eio(u / .9);
    img.style.clipPath = `inset(0 ${100 - 100 * r}% 0 0)`;
    img.style.opacity = cl(u / .2);
    el.style.transform = `scale(${1.08 - .08 * spr(u / 1.1)})`; el.style.transformOrigin = '50% 50%';
    const p = cl((u - .9) / 1.1); sw.style.backgroundPosition = `${100 - 100 * p}% 0`; sw.style.opacity = p > 0 && p < 1 ? 1 : 0;
  }

  // ---------- transições em mosaico ----------
  const COLS = 16, ROWS = 9;
  function buildTiles() {
    const box = $('tiles'); const w = 1920 / COLS, h = 1080 / ROWS; const r = mul(11);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const d = document.createElement('div'); d.style.cssText = `left:${x * w - 1}px;top:${y * h - 1}px;width:${w + 2}px;height:${h + 2}px`;
      box.appendChild(d); S.tiles.push({ d, x, y, c: Math.floor(r() * 4), j: r() * .07 });
    }
  }
  function drawTiles(t) {
    const pal = [S.opt.accent, '#D9A441', '#1A1C22', '#24272F'];
    let cut = null; for (let k = 1; k < S.SC.length; k++) if (Math.abs(t - S.SC[k]) < .7 && !(S.opt.noCut || []).includes(k + 1)) { cut = k; break; }
    for (const T of S.tiles) {
      if (cut === null) { T.d.style.transform = 'scale(0)'; continue; }
      const c = S.SC[cut]; const di = (T.x / COLS) * .3 + T.j;
      const a = eo((t - (c - .45 + di)) / .18), b = 1 - eo((t - (c + .02 + di)) / .18);
      T.d.style.transform = `scale(${Math.max(0, Math.min(a, b))})`; T.d.style.background = pal[(T.c + cut) % 4];
    }
  }

  function seek(t) {
    const SC = S.SC; let k = 1; for (let i = 0; i < SC.length; i++) if (t >= SC[i]) k = i + 1;
    for (let i = 1; i <= SC.length; i++) { const e = $('s' + i); if (e) e.style.display = i === k ? 'block' : 'none'; }
    const lt = t - SC[k - 1]; const end = k < SC.length ? SC[k] : S.TL.end;
    const cam = document.querySelector(`#s${k} .cam`); if (cam && !S.opt.noCam) cam.style.transform = `scale(${1 + .03 * cl(lt / (end - SC[k - 1]))})`;
    S.opt.scene(k, t, lt);
    drawTiles(t);
    const hud = $('hud'); if (hud) hud.style.opacity = (S.opt.hideHud || []).includes(k) ? 0 : cl((t - .8) / .5);
    $('fade').style.opacity = cl((t - (S.TL.end - 1.0)) / 1.0);
  }
  function note(txt) { $('note').textContent = txt || ''; }
  function src(txt) { $('src').textContent = txt || ''; }

  function boot(opt) {
    S.opt = opt; document.documentElement.style.setProperty('--acc', opt.accent);
    const st = $('stage');
    st.insertAdjacentHTML('beforeend', `<div id="hud"><img src="../kit/assets/v47_mark_white.png" alt=""><div class="sep"></div><div class="sys">${opt.system}</div></div><div id="note"></div><div id="src"></div><div id="tiles"></div><div id="fade"></div>`);
    fetch('timeline.json').then(r => r.json()).then(j => {
      S.TL = j; S.LN = j.lines; S.SC = j.lines.map((l, i) => i === 0 ? 0 : l.start - .4);
      buildTiles(); if (opt.build) opt.build();
      const fonts = ['400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '40px Anton'].map(f => document.fonts.load(f));
      const imgs = [...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = r; i.onerror = r; }));
      Promise.all([...fonts, ...imgs]).then(() => document.fonts.ready).then(() => {
        seek(0); window.ready = true;
        if (!location.search.includes('render')) { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % S.TL.end); requestAnimationFrame(loop); }; loop(); }
      });
    });
    window.seek = seek;
  }
  return { $, cl, eo, eio, spr, mul, lerp, Wd, fade, rise, slideX, pop, slam, out, fmt, count, typed, draw, bar, phone, laptop, logoSVG, logoAnim, boot, note, src, S };
})();
