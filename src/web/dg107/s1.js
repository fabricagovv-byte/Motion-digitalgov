// Cena 1 — Uma nova era de produtividade: arquivos entram no sistema e são distribuídos entre módulos inteligentes.
import { el, box, shell, kpi, ic, svg, bez, fmt, hash, range, lerp, clamp, smooth, easeOutCubic, easeOutExpo, easeInOutCubic } from './util.js';

const MODS = [['Produção', 'cpu', 'Renomeação · separação · indexação'], ['Restore AI', 'wand', 'Restauração digital de imagem'], ['Organização', 'folder', 'Classificação e estrutura de pastas'],
  ['Qualidade', 'eye', 'Verificação de legibilidade'], ['Segurança', 'shield', 'Backup · auditoria · versões'], ['Delivery Center', 'send', 'Pacotes e relatórios de entrega']];
const SHARE = [0.30, 0.18, 0.17, 0.15, 0.08, 0.12];

export function create(root) {
  // chuva de arquivos antes de o painel surgir
  const storm = el('div', 'abs', root); storm.style.cssText = 'inset:0;';
  const SF = []; for (let i = 0; i < 110; i++) { const d = 0.35 + hash(i) * 0.9; const e = el('div', 'abs', storm);
    e.style.cssText = `width:${26 * d}px;height:${34 * d}px;border-radius:${4 * d}px;border:1px solid rgba(120,170,255,${0.25 + d * 0.35});background:linear-gradient(160deg,rgba(47,107,255,${0.10 + d * 0.16}),rgba(34,211,238,.04));`;
    SF.push({ e, d, y: hash(i + 50) * 1080, ph: hash(i + 90), r: hash(i + 7) * 40 - 20 }); }

  const { win, content } = shell(root, { active: 'painel', crumb: 'Visão geral', title: 'Painel inteligente' });
  const K = [kpi(content, 0, 0, 365, 118, 'inbox', 'Arquivos recebidos', 'lote em ingestão'), kpi(content, 389, 0, 365, 118, 'cpu', 'Distribuídos automaticamente', 'entre módulos'),
    kpi(content, 778, 0, 365, 118, 'spark', 'Agentes de IA ativos', 'em paralelo'), kpi(content, 1167, 0, 365, 118, 'layers', 'Módulos inteligentes', 'integrados')];
  const P = box(content, 'panel', 0, 140, 1532, 650, `<div class="ph">${ic('spark')}Distribuição automática entre módulos inteligentes<span class="r">Um único ambiente · fluxo contínuo</span></div>`);
  const S = svg('svg', { width: 1532, height: 650, viewBox: '0 0 1532 650', style: 'position:absolute;inset:0' }, P);
  const defs = svg('defs', {}, S);
  defs.innerHTML = `<linearGradient id="s1g" x1="0" x2="1"><stop offset="0" stop-color="#2f6bff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
    <radialGradient id="s1h"><stop offset="0" stop-color="#22d3ee" stop-opacity=".55"/><stop offset="1" stop-color="#2f6bff" stop-opacity="0"/></radialGradient>`;
  const HUB = [560, 350], SRC = [150, 350];
  const TG = MODS.map((_, i) => [1090, 100 + i * 91]);
  const paths = TG.map((p) => [[HUB[0] + 70, HUB[1]], [HUB[0] + 300, HUB[1]], [p[0] - 260, p[1]], p]);
  svg('path', { d: `M${SRC[0] + 90} ${SRC[1]} L${HUB[0] - 78} ${HUB[1]}`, stroke: 'url(#s1g)', 'stroke-width': 2, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round', opacity: .7 }, S);
  const lines = paths.map((b) => svg('path', { d: `M${b[0]} C${b[1]} ${b[2]} ${b[3]}`, stroke: 'url(#s1g)', 'stroke-width': 1.6, fill: 'none', opacity: .45, pathLength: 1, 'stroke-dasharray': 1 }, S));
  svg('circle', { cx: HUB[0], cy: HUB[1], r: 150, fill: 'url(#s1h)' }, S);
  const ring1 = svg('circle', { cx: HUB[0], cy: HUB[1], r: 78, fill: 'none', stroke: '#22d3ee', 'stroke-width': 1.6, 'stroke-dasharray': '60 22 8 22', opacity: .9 }, S);
  const ring2 = svg('circle', { cx: HUB[0], cy: HUB[1], r: 98, fill: 'none', stroke: '#2f6bff', 'stroke-width': 1.2, 'stroke-dasharray': '4 12', opacity: .8 }, S);
  svg('circle', { cx: HUB[0], cy: HUB[1], r: 60, fill: '#0c1320', stroke: 'rgba(120,170,255,.5)', 'stroke-width': 1 }, S);
  const parts = []; for (let i = 0; i < 96; i++) parts.push({ e: svg('rect', { width: 11, height: 14, rx: 2.5, fill: i % 3 ? '#5b8cff' : '#22d3ee' }, S), ph: i / 96 + hash(i) * 0.01, m: weighted(hash(i + 3)), off: (hash(i + 11) - 0.5) });
  const hub = box(P, 'abs', HUB[0] - 60, HUB[1] - 60, 120, 120, `<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;font-size:12px;font-weight:600;line-height:1.3;color:#cfe3ff"><div><div style="color:var(--cyan);width:30px;height:30px;margin:0 auto 5px">${ic('spark')}</div>Núcleo de IA</div></div>`);
  box(P, 'abs', SRC[0] - 104, SRC[1] - 62, 208, 124, `<div style="position:absolute;inset:0;border-radius:16px;border:1px solid rgba(120,170,255,.35);background:rgba(47,107,255,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
    <div style="width:30px;height:30px;color:var(--cyan)">${ic('inbox')}</div><div style="font-size:14px;font-weight:600">Entrada de arquivos</div><div style="font-size:11.5px;color:var(--mut)">digitalização · upload · lotes</div></div>`);
  const cards = TG.map((p, i) => { const c = box(P, 'abs', p[0] + 8, p[1] - 38, 410, 76, `<div style="position:absolute;inset:0;border-radius:14px;border:1px solid var(--line2);background:linear-gradient(90deg,rgba(47,107,255,.10),rgba(255,255,255,.02));display:flex;align-items:center;gap:14px;padding:0 18px">
      <div style="width:38px;height:38px;border-radius:11px;background:rgba(34,211,238,.10);border:1px solid rgba(34,211,238,.3);display:grid;place-items:center;color:var(--cyan)"><div style="width:20px;height:20px">${ic(MODS[i][1])}</div></div>
      <div style="flex:1"><div style="font-size:15px;font-weight:600">${MODS[i][0]}</div><div style="font-size:11.5px;color:var(--mut);margin-top:3px">${MODS[i][2]}</div></div>
      <div class="n h" style="font-size:22px;font-weight:600">0</div></div><div class="b abs" style="left:14px;right:14px;bottom:0;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--blue),var(--cyan));transform-origin:left"></div>`);
    return { c, n: c.querySelector('.n'), b: c.querySelector('.b') }; });
  function weighted(u) { let a = 0; for (let i = 0; i < 6; i++) { a += SHARE[i]; if (u < a) return i; } return 5; }

  const ov = el('div', 'title-ov', root, `<div class="kick">CONHEÇA</div><div class="big">DIGITALGOV<i>10.7</i></div><div class="rule"></div><div class="tagline">Inteligência Documental — Da Produção à Entrega</div>`);
  const [ok, ob, or, ot] = ov.children;

  return { update(lt, dur) {
    // chuva de arquivos → entram no sistema
    const sOut = 1 - smooth(range(lt, 2.0, 3.4));
    storm.style.display = sOut > 0 ? 'block' : 'none';
    if (sOut > 0) for (const f of SF) { const u = (lt * (0.16 + f.d * 0.2) + f.ph) % 1; const conv = smooth(range(lt, 1.0, 3.2));
      const x = lerp(-80, 2000, u), y = lerp(f.y, 540 + (f.y - 540) * 0.25, conv * u);
      f.e.style.transform = `translate(${x}px,${y}px) rotate(${f.r + lt * 20 * (f.d - 0.7)}deg)`; f.e.style.opacity = sOut * Math.sin(Math.PI * u) * (0.35 + f.d * 0.5); }
    // painel entra em perspectiva
    const p = easeOutExpo(range(lt, 0.5, 3.0)), push = clamp(lt / dur);
    const tOv = easeInOutCubic(range(lt, 6.9, 7.9));
    win.style.opacity = easeOutCubic(range(lt, 0.5, 1.6)) * lerp(1, 0.22, tOv);
    win.style.transform = `translateY(${(1 - p) * 150}px) rotateX(${lerp(26, 2.5, p) - push * 1.5}deg) rotateY(${lerp(-7, 1.5, p) + push * 1.2}deg) scale(${lerp(0.84, 1, p) * lerp(1, 1.05, push) * lerp(1, 1.06, tOv)})`;
    win.style.filter = tOv > 0 ? `blur(${tOv * 9}px)` : 'none';
    // números (ilustrativos)
    const g = easeInOutCubic(range(lt, 1.8, 9.5)), total = 12480 * g, dist = total * smooth(range(lt, 2.6, 4.2)) * 0.97;
    K[0].val.textContent = fmt(total); K[1].val.textContent = fmt(dist); K[2].val.textContent = fmt(12 * easeOutCubic(range(lt, 2.2, 3.6))); K[3].val.textContent = fmt(6 * easeOutCubic(range(lt, 2.4, 3.4)));
    K.forEach((k, i) => { k.bar.style.width = `${[g, g * 0.97, 1, 1][i] * easeOutCubic(range(lt, 2 + i * 0.15, 4 + i * 0.15)) * 100}%`; });
    ring1.setAttribute('transform', `rotate(${lt * 40} 560 350)`); ring2.setAttribute('transform', `rotate(${-lt * 22} 560 350)`);
    hub.style.transform = `scale(${1 + Math.sin(lt * 5) * 0.025})`;
    lines.forEach((l, i) => l.setAttribute('stroke-dashoffset', 1 - easeOutCubic(range(lt, 2.2 + i * 0.12, 3.4 + i * 0.12))));
    const flow = smooth(range(lt, 2.0, 3.0));
    for (const q of parts) { const u = (lt * 0.33 + q.ph) % 1; let x, y, o;
      if (u < 0.38) { const s = u / 0.38; x = lerp(SRC[0] + 96, HUB[0] - 70, s); y = SRC[1] + q.off * 34 * (1 - s); o = Math.min(1, s * 6); }
      else { const s = (u - 0.38) / 0.62, b = paths[q.m]; [x, y] = bez(b[0], b[1], b[2], b[3], smooth(s)); o = Math.min(1, (1 - s) * 7); }
      q.e.setAttribute('x', x - 5.5); q.e.setAttribute('y', y - 7); q.e.setAttribute('opacity', o * flow * 0.95); }
    cards.forEach((c, i) => { const a = easeOutCubic(range(lt, 2.4 + i * 0.13, 3.2 + i * 0.13)); c.c.style.opacity = a; c.c.style.transform = `translateX(${(1 - a) * 30}px)`;
      c.n.textContent = fmt(dist * SHARE[i]); c.b.style.transform = `scaleX(${g * a})`; });
    // título
    ov.style.opacity = tOv; ov.style.display = tOv > 0 ? 'flex' : 'none';
    const a1 = easeOutCubic(range(lt, 7.1, 7.9)), a2 = easeOutExpo(range(lt, 7.3, 8.6)), a3 = easeOutCubic(range(lt, 8.2, 9.2));
    ok.style.opacity = a1; ok.style.transform = `translateY(${(1 - a1) * 12}px)`;
    ob.style.transform = `scale(${lerp(0.92, 1, a2) * lerp(1, 1.035, range(lt, 7.3, 11))})`; ob.style.opacity = a2; ob.style.filter = `blur(${(1 - a2) * 14}px)`; ob.style.letterSpacing = `${lerp(0.06, -0.025, a2)}em`;
    or.style.transform = `scaleX(${easeOutExpo(range(lt, 7.9, 9.0))})`; ot.style.opacity = a3; ot.style.transform = `translateY(${(1 - a3) * 14}px)`;
  } };
}
