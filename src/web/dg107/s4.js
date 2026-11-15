// Cena 4 — Produtividade e prazos: painel de produção com indicadores animados e linha do tempo manual × automatizado (sem percentuais de economia).
import { el, box, shell, cam, kpi, ic, svg, fmt, hash, range, lerp, clamp, smooth, easeOutCubic, easeInOutCubic, appear } from './util.js';

export function create(root) {
  const { win, content } = shell(root, { active: 'painel', crumb: 'Produção', title: 'Painel de produtividade e prazos' });
  const KV = [48250, 46910, 45730, 1180];
  const K = [kpi(content, 0, 0, 365, 112, 'inbox', 'Documentos recebidos', 'ilustrativo'), kpi(content, 389, 0, 365, 112, 'cpu', 'Documentos processados', 'ilustrativo'),
    kpi(content, 778, 0, 365, 112, 'check', 'Documentos aprovados', 'ilustrativo'), kpi(content, 1167, 0, 365, 112, 'alert', 'Pendências de revisão', 'ilustrativo')];
  K[3].val.style.color = '#f9d58c'; K[3].bar.style.background = 'var(--amber)';
  // volume por período
  const V = box(content, 'panel', 0, 130, 700, 318, `<div class="ph">${ic('chart')}Volume produzido por período<span class="r">documentos / semana · ilustrativo</span></div>`);
  const BV = [0.34, 0.42, 0.4, 0.52, 0.58, 0.55, 0.68, 0.72, 0.7, 0.83, 0.9, 0.96];
  const bars = BV.map((v, i) => { const e = box(V, 'abs', 26 + i * 55, 62, 40, 210, `<div class="b abs" style="left:0;right:0;bottom:0;border-radius:7px 7px 2px 2px;background:linear-gradient(180deg,${i === 11 ? '#22d3ee,#2f6bff' : 'rgba(91,140,255,.95),rgba(47,107,255,.35)'});transform-origin:bottom;height:${v * 200}px"></div>`);
    box(V, 'abs', 26 + i * 55, 280, 40, 18, `<div style="text-align:center;font-size:11px;color:var(--dim)">S${i + 1}</div>`); return e.querySelector('.b'); });
  // tempo médio
  const T = box(content, 'panel', 718, 130, 396, 318, `<div class="ph">${ic('clock')}Tempo médio de processamento<span class="r">ilustrativo</span></div>
    <div class="abs h tv" style="left:22px;top:54px;font-size:46px;font-weight:600;letter-spacing:-.02em"></div><div class="abs" style="left:22px;top:112px;font-size:12.5px;color:var(--mut)">por lote · acompanhamento contínuo</div>`);
  const TS = svg('svg', { width: 356, height: 150, viewBox: '0 0 356 150', style: 'position:absolute;left:20px;top:150px' }, T);
  const tp = []; for (let i = 0; i <= 24; i++) tp.push([i * 14.8, 26 + (i / 24) * 78 + (hash(i + 31) - 0.5) * 22]);
  const tpath = svg('path', { d: tp.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '), fill: 'none', stroke: '#22d3ee', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, TS);
  for (let k = 0; k < 4; k++) svg('line', { x1: 0, x2: 356, y1: 10 + k * 44, y2: 10 + k * 44, stroke: 'rgba(255,255,255,.05)' }, TS);
  // metas
  const G = box(content, 'panel', 1132, 130, 400, 318, `<div class="ph">${ic('target')}Progresso das metas de entrega<span class="r">ilustrativo</span></div>`);
  const GS = svg('svg', { width: 150, height: 150, viewBox: '0 0 150 150', style: 'position:absolute;left:22px;top:60px' }, G);
  GS.innerHTML = `<defs><linearGradient id="s4g"><stop offset="0" stop-color="#2f6bff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><circle cx="75" cy="75" r="60" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="13"/>`;
  const ring = svg('circle', { cx: 75, cy: 75, r: 60, fill: 'none', stroke: 'url(#s4g)', 'stroke-width': 13, 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': '0 100', transform: 'rotate(-90 75 75)' }, GS);
  const rv = box(G, 'abs h', 22, 112, 150, 50, ''); rv.style.cssText += 'text-align:center;font-size:36px;font-weight:600;letter-spacing:-.02em;';
  box(G, 'abs', 22, 216, 150, 20, `<div style="text-align:center;font-size:12px;color:var(--mut)">meta do período</div>`);
  const GL = [['Entrega 1', 100, 'concluída'], ['Entrega 2', 78, 'no prazo'], ['Entrega 3', 34, 'em andamento']].map(([n, v, s], i) => { const e = box(G, 'abs', 196, 66 + i * 76, 184, 62, `<div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600"><span>${n}</span><span class="v h"></span></div><div style="height:7px;border-radius:4px;background:rgba(255,255,255,.07);margin:8px 0 7px;overflow:hidden"><div class="b" style="height:100%;border-radius:4px;background:linear-gradient(90deg,var(--blue),var(--cyan))"></div></div><div style="font-size:11.5px;color:${i ? 'var(--mut)' : 'var(--green)'}">${s}</div>`); return { e, v, b: e.querySelector('.b'), t: e.querySelector('.v') }; });
  // linha do tempo comparativa
  const C = box(content, 'panel', 0, 466, 1532, 300, `<div class="ph">${ic('history')}Linha do tempo do fluxo<span class="r">representação conceitual · sem escala de tempo medida</span></div>`);
  const lane = (y, name, col) => box(C, 'abs', 22, y, 200, 76, `<div style="font-size:11px;letter-spacing:.14em;font-weight:700;color:${col}">${name}</div>`);
  lane(66, 'FLUXO MANUAL', '#f9d58c'); lane(186, 'FLUXO AUTOMATIZADO', '#8fe9f7');
  box(C, 'abs', 22, 88, 190, 40, `<div style="font-size:12px;color:var(--mut);line-height:1.4">etapas em sequência,<br>com esperas entre elas</div>`);
  box(C, 'abs', 22, 208, 190, 40, `<div style="font-size:12px;color:var(--mut);line-height:1.4">etapas integradas,<br>processamento em paralelo</div>`);
  const MS = ['Recebimento', 'Triagem', 'Renomeação', 'Restauração', 'Organização', 'Conferência', 'Entrega'];
  const man = MS.map((s, i) => box(C, 'abs', 232 + i * 184, 62, 150, 56, `<div style="position:absolute;inset:0;border-radius:10px;border:1px solid rgba(245,184,61,.35);background:rgba(245,184,61,.07);display:grid;place-items:center;font-size:13.5px;font-weight:600;color:#f3e2bd">${s}</div>${i < 6 ? '<div class="abs" style="left:154px;top:27px;width:26px;border-top:2px dotted rgba(245,184,61,.6)"></div>' : ''}`));
  const mdot = box(C, 'abs', 0, 124, 12, 12, ''); mdot.style.cssText += 'border-radius:50%;background:var(--amber);box-shadow:0 0 14px var(--amber);';
  const A = [box(C, 'abs', 232, 182, 150, 56, `<div style="position:absolute;inset:0;border-radius:10px;border:1px solid rgba(34,211,238,.5);background:rgba(34,211,238,.08);display:grid;place-items:center;font-size:13.5px;font-weight:600">Recebimento</div>`),
    box(C, 'abs', 400, 164, 330, 92, `<div style="position:absolute;inset:0;border-radius:12px;border:1px solid rgba(91,140,255,.7);background:linear-gradient(90deg,rgba(47,107,255,.2),rgba(34,211,238,.1));box-shadow:0 0 30px rgba(47,107,255,.25)"></div>
      <div style="position:absolute;left:14px;top:9px;font-size:12.5px;font-weight:600">Processamento inteligente paralelo</div>${[0, 1, 2].map((k) => `<div style="position:absolute;left:14px;right:14px;top:${35 + k * 17}px;height:8px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden"><div class="pl" style="height:100%;border-radius:4px;background:linear-gradient(90deg,var(--blue),var(--cyan))"></div></div>`).join('')}`),
    box(C, 'abs', 748, 182, 150, 56, `<div style="position:absolute;inset:0;border-radius:10px;border:1px solid rgba(34,211,238,.5);background:rgba(34,211,238,.08);display:grid;place-items:center;font-size:13.5px;font-weight:600">Validação</div>`),
    box(C, 'abs', 916, 182, 150, 56, `<div style="position:absolute;inset:0;border-radius:10px;border:1px solid rgba(52,211,153,.6);background:rgba(52,211,153,.1);display:grid;place-items:center;font-size:13.5px;font-weight:600;color:#b8f5dc">Entrega</div>`)];
  const pls = [...A[1].querySelectorAll('.pl')];
  const adot = box(C, 'abs', 0, 264, 12, 12, ''); adot.style.cssText += 'border-radius:50%;background:var(--cyan);box-shadow:0 0 14px var(--cyan);';
  const note = box(C, 'abs', 1090, 176, 420, 70, `<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag c">gargalos identificados antes</span><span class="tag">prazos mais previsíveis</span><span class="tag g">recursos otimizados</span></div>`);

  return { update(lt, dur) {
    cam(win, lt, dur, { dir: -1, ry: 1.8 });
    K.forEach((k, i) => { const g = easeOutCubic(range(lt, 0.5 + i * 0.15, 3.2 + i * 0.15)); k.val.textContent = fmt(KV[i] * g); k.bar.style.width = g * [100, 97, 95, 9][i] + '%'; appear(k.e, lt, 0.3 + i * 0.1, 0.6, 14); });
    bars.forEach((b, i) => { b.style.transform = `scaleY(${easeOutCubic(range(lt, 1.0 + i * 0.11, 2.2 + i * 0.11))})`; });
    const tg = easeInOutCubic(range(lt, 1.6, 4.6)); tpath.setAttribute('stroke-dashoffset', 1 - tg);
    const secs = Math.round(lerp(372, 134, tg)); T.querySelector('.tv').textContent = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
    const rg = easeOutCubic(range(lt, 2.0, 4.8)) * 78; ring.setAttribute('stroke-dasharray', `${rg} 100`); rv.textContent = fmt(rg) + '%';
    GL.forEach((o, i) => { const g = easeOutCubic(range(lt, 2.4 + i * 0.3, 4.6 + i * 0.3)) * o.v; o.b.style.width = g + '%'; o.t.textContent = fmt(g) + '%'; });
    // linha do tempo
    appear(C, lt, 5.2, 0.8, 30);
    man.forEach((m, i) => appear(m, lt, 6.0 + i * 0.22, 0.4, 8));
    const mp = clamp((lt - 6.4) / 9.0) * 6, mi = Math.min(5, Math.floor(mp)), mf = smooth(range(mp - mi, 0.55, 1));   // pára em cada etapa (espera)
    mdot.style.transform = `translateX(${232 + 69 + (mi + mf) * 184}px)`; mdot.style.opacity = range(lt, 6.2, 6.6);
    A.forEach((a, i) => appear(a, lt, 7.4 + i * 0.28, 0.5, 8));
    const cyc = ((lt - 8.4) / 2.4) % 1, on = lt > 8.4;
    const ax = cyc < 0.15 ? lerp(301, 400, cyc / 0.15) : cyc < 0.6 ? lerp(400, 730, (cyc - 0.15) / 0.45) : cyc < 0.8 ? lerp(730, 817, (cyc - 0.6) / 0.2) : lerp(817, 985, smooth((cyc - 0.8) / 0.2));
    adot.style.transform = `translateX(${ax}px)`; adot.style.opacity = on ? 1 : 0;
    pls.forEach((p, k) => { p.style.width = (on ? clamp((cyc - 0.12) / (0.34 + k * 0.07)) * 100 : 0) + '%'; });
    appear(note, lt, 9.6, 0.7, 10);
  } };
}
