// Cena 2 — Produção inteligente e automatizada: agentes de IA em paralelo recebem, analisam, renomeiam, separam, classificam e indexam.
import { el, box, shell, cam, ic, svg, fmt, hash, range, lerp, clamp, smooth, easeOutCubic, appear } from './util.js';

const STAGES = ['Recebido', 'Analisado', 'Renomeado', 'Separado', 'Classificado', 'Indexado'];
const DOCS = [['IMG_00231.tif', '2024-0231_Contrato_Prestacao_Servicos.pdf', 'Contrato', 'Nº 2024/0231', '12 págs.'], ['scan_0458.jpg', '2023-1187_Oficio_Circular.pdf', 'Ofício', 'Nº 1187/2023', '2 págs.'],
  ['DOC0007719.tif', '2022-0093_Processo_Administrativo.pdf', 'Processo', 'Nº 0093/2022', '48 págs.'], ['digitaliz_112.png', '2024-0410_Nota_Fiscal.pdf', 'Nota fiscal', 'Nº 000.410', '1 pág.'],
  ['lote7_pag_033.tif', '2021-0672_Requerimento.pdf', 'Requerimento', 'Nº 0672/2021', '3 págs.'], ['IMG_00877.tif', '2023-0056_Memorando.pdf', 'Memorando', 'Nº 056/2023', '1 pág.'],
  ['scan_0992.jpg', '2020-0318_Termo_Aditivo.pdf', 'Termo aditivo', 'Nº 0318/2020', '6 págs.'], ['DOC0008102.tif', '2024-0077_Parecer_Tecnico.pdf', 'Parecer', 'Nº 077/2024', '9 págs.']];
const IMPACT = [['Maior capacidade de processamento documental', 'layers'], ['Menor necessidade de intervenção manual', 'hand'], ['Redução de retrabalho', 'history'], ['Padronização dos procedimentos', 'check'], ['Acompanhamento da produção em tempo real', 'chart']];

export function create(root) {
  const { win, content } = shell(root, { active: 'producao', crumb: 'Produção', title: 'Processamento inteligente em paralelo' });
  const L = box(content, 'panel', 0, 0, 1010, 578, `<div class="ph">${ic('cpu')}Agentes de IA trabalhando em paralelo<span class="r">processos simultâneos</span></div>`);
  const hd = box(L, 'abs', 206, 50, 784, 26, ''); hd.style.cssText += 'display:grid;grid-template-columns:repeat(6,1fr);gap:8px;font-size:10.5px;letter-spacing:.04em;color:var(--dim);font-weight:600;text-transform:uppercase;';
  STAGES.forEach((s, i) => el('div', '', hd, `0${i + 1} · ${s}`));
  const rows = []; for (let i = 0; i < 5; i++) { const r = box(L, 'abs', 16, 80 + i * 98, 978, 88, `
    <div style="position:absolute;inset:0;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,.018)"></div>
    <div style="position:absolute;left:14px;top:14px;display:flex;gap:11px;align-items:center"><div class="av" style="width:38px;height:38px;border-radius:11px;background:rgba(47,107,255,.16);border:1px solid rgba(91,140,255,.5);display:grid;place-items:center;color:#9dbbff"><div style="width:20px;height:20px">${ic('spark')}</div></div>
      <div><div style="font-size:13.5px;font-weight:600">Agente IA 0${i + 1}</div><div class="st" style="font-size:11.5px;color:var(--cyan);margin-top:3px"></div></div></div>
    <div class="sg" style="position:absolute;left:190px;top:14px;width:784px;display:grid;grid-template-columns:repeat(6,1fr);gap:8px"></div>
    <div style="position:absolute;left:190px;top:52px;right:8px;display:flex;align-items:center;gap:9px;height:26px"><div style="width:15px;height:15px;color:var(--mut);flex:none">${ic('file')}</div><div class="fn mono" style="font-size:12.5px;color:#cdd7e4;white-space:nowrap"></div><div class="t1 tag c"></div><div class="t2 tag"></div><div class="t3 tag m"></div><div class="ok tag g" style="margin-left:auto">${ic('check', 'style="width:11px;height:11px"')}concluído</div></div>`);
    const sg = r.querySelector('.sg'); const cells = STAGES.map(() => { const c = el('div', '', sg, `<div style="height:26px;border-radius:8px;border:1px solid var(--line2);background:rgba(255,255,255,.02);position:relative;overflow:hidden"><div class="f" style="position:absolute;inset:0;transform-origin:left;background:linear-gradient(90deg,rgba(47,107,255,.75),rgba(34,211,238,.75))"></div></div>`); return { c: c.firstChild, f: c.querySelector('.f') }; });
    rows.push({ r, cells, st: r.querySelector('.st'), fn: r.querySelector('.fn'), t1: r.querySelector('.t1'), t2: r.querySelector('.t2'), t3: r.querySelector('.t3'), ok: r.querySelector('.ok'), av: r.querySelector('.av'), P: 3.3 + i * 0.37, off: i * 0.83 + 0.4, cur: -1 }); }
  // produção em tempo real
  const B = box(content, 'panel', 0, 596, 1010, 194, `<div class="ph">${ic('chart')}Produção em tempo real<span class="r">documentos processados nesta sessão</span></div>`);
  const cnt = box(B, 'abs h', 22, 62, 300, 60, ''); cnt.style.cssText += 'font-size:54px;font-weight:600;letter-spacing:-.02em;line-height:1;';
  box(B, 'abs', 22, 132, 320, 40, `<div style="display:flex;gap:8px"><span class="tag c">5 agentes ativos</span><span class="tag m">fila contínua</span></div>`);
  const S = svg('svg', { width: 640, height: 130, viewBox: '0 0 640 130', style: 'position:absolute;left:350px;top:50px' }, B);
  S.innerHTML = `<defs><linearGradient id="s2a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6bff" stop-opacity=".45"/><stop offset="1" stop-color="#2f6bff" stop-opacity="0"/></linearGradient><clipPath id="s2c"><rect id="s2cr" x="0" y="0" width="0" height="130"/></clipPath></defs>`;
  const pts = []; for (let i = 0; i <= 40; i++) pts.push([i * 16, 104 - (i / 40) * 62 - hash(i + 5) * 24 - Math.sin(i * 0.6) * 8]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1].toFixed(1)).join(' ');
  for (let k = 1; k < 4; k++) svg('line', { x1: 0, x2: 640, y1: k * 32, y2: k * 32, stroke: 'rgba(255,255,255,.05)' }, S);
  const gl = svg('g', { 'clip-path': 'url(#s2c)' }, S); svg('path', { d: d + ' L640 130 L0 130 Z', fill: 'url(#s2a)' }, gl); svg('path', { d, fill: 'none', stroke: '#22d3ee', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, gl);
  const dot = svg('circle', { r: 5, fill: '#fff', stroke: '#22d3ee', 'stroke-width': 3 }, S); const clip = S.querySelector('#s2cr');
  // impactos
  const R = box(content, 'panel', 1030, 0, 502, 790, `<div class="ph">${ic('target')}Impactos na operação</div>`);
  const imp = IMPACT.map(([t, icn], i) => box(R, 'abs', 18, 58 + i * 122, 466, 108, `<div style="position:absolute;inset:0;border-radius:14px;border:1px solid var(--line2);background:linear-gradient(120deg,rgba(47,107,255,.13),rgba(255,255,255,.015));display:flex;align-items:center;gap:16px;padding:0 20px">
    <div style="width:46px;height:46px;border-radius:13px;flex:none;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.35);display:grid;place-items:center;color:var(--cyan)"><div style="width:23px;height:23px">${ic(icn)}</div></div>
    <div style="font-size:19px;font-weight:600;line-height:1.28;letter-spacing:-.005em">${t}</div><div class="chk" style="margin-left:auto">${ic('check')}</div></div><div class="gl abs" style="inset:0;border-radius:14px;box-shadow:0 0 0 1px rgba(34,211,238,.7),0 0 34px rgba(34,211,238,.35)"></div>`));
  box(R, 'abs', 18, 676, 466, 96, `<div style="font-size:13px;color:var(--mut);line-height:1.55;padding:6px 4px">A automação assume as tarefas repetitivas.<br>A equipe se concentra no que exige <b style="color:var(--text)">atenção humana</b>.</div>`);

  return { update(lt, dur) {
    cam(win, lt, dur, { dir: -1 });
    let done = 0;
    for (const r of rows) { const tt = lt + r.off + 2, n = Math.floor(tt / r.P), u = (tt / r.P) % 1, D = DOCS[(n * 3 + rows.indexOf(r) * 2) % DOCS.length]; done += n;
      const sp = u * 6.5, k = Math.min(5, Math.floor(sp)), fin = sp >= 6;
      r.cells.forEach((c, j) => { const f = clamp(sp - j); c.f.style.transform = `scaleX(${smooth(f)})`; c.f.style.opacity = j < k || fin ? 0.55 : 1; c.c.style.borderColor = j === k && !fin ? 'rgba(34,211,238,.8)' : 'rgba(255,255,255,.14)'; });
      r.st.textContent = fin ? 'concluído' : ['recebendo…', 'analisando…', 'renomeando…', 'separando…', 'classificando…', 'indexando…'][k]; r.st.style.color = fin ? 'var(--green)' : 'var(--cyan)';
      const ty = clamp(sp - 2); const name = ty <= 0 ? D[0] : ty >= 1 ? D[1] : D[1].slice(0, Math.ceil(D[1].length * ty)) + '▍';
      if (r.fn.textContent !== name) r.fn.textContent = name; r.fn.style.color = ty >= 1 ? '#fff' : ty > 0 ? '#8fe9f7' : '#9aa6b6';
      const set = (e, txt, a) => { if (e.textContent !== txt) e.textContent = txt; e.style.opacity = a; e.style.transform = `scale(${lerp(0.85, 1, a)})`; };
      set(r.t1, D[2], easeOutCubic(range(sp, 4.5, 5))); set(r.t2, D[3], easeOutCubic(range(sp, 5.5, 6))); set(r.t3, D[4], easeOutCubic(range(sp, 3.5, 4)));
      r.ok.style.opacity = range(sp, 6, 6.2); r.av.style.boxShadow = `0 0 ${10 + Math.sin(lt * 6 + r.off * 3) * 6}px rgba(47,107,255,.5)`;
      appear(r.r, lt, 0.5 + rows.indexOf(r) * 0.12, 0.6, 16); }
    cnt.textContent = fmt(1240 + (done - 5) * 37 + Math.floor(lt * 9)); cnt.innerHTML += '<span style="font-size:13px;color:var(--mut);font-weight:500;letter-spacing:0;margin-left:10px">ilustrativo</span>';
    const g = clamp(range(lt, 0.8, dur - 0.5)); clip.setAttribute('width', g * 640); const fi = g * 40, i0 = Math.min(39, Math.floor(fi)), fr = fi - i0;
    dot.setAttribute('cx', lerp(pts[i0][0], pts[i0 + 1][0], fr)); dot.setAttribute('cy', lerp(pts[i0][1], pts[i0 + 1][1], fr));
    imp.forEach((e, i) => { const at = 3.2 + i * 1.75; const a = appear(e, lt, at, 0.7, 22); e.querySelector('.gl').style.opacity = a * (1 - smooth(range(lt, at + 0.5, at + 1.6))); e.querySelector('.chk').style.transform = `scale(${easeOutCubic(range(lt, at + 0.35, at + 0.8))})`; });
  } };
}
