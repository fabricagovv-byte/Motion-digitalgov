// Cena 6 — Impacto na operação: painel executivo com as duas jornadas lado a lado.
import { el, box, shell, cam, ic, range, lerp, clamp, smooth, easeOutCubic, easeInOutCubic, appear } from './util.js';

const TR = [['Recebimento', 'inbox', 0], ['Triagem manual', 'hand', 1], ['Renomeação', 'doc', 1], ['Restauração', 'wand', 1], ['Organização', 'folder', 1], ['Conferência', 'eye', 1], ['Entrega', 'send', 0]];

export function create(root) {
  const { win, content } = shell(root, { active: 'painel', crumb: 'Painel executivo', title: 'Impacto na operação' });
  const node = (parent, x, y, w, h, label, icn, col, big) => box(parent, 'abs', x, y, w, h, `<div class="nb" style="position:absolute;inset:0;border-radius:14px;border:1px solid ${col}66;background:${col}14;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;text-align:center">
    <div style="width:26px;height:26px;color:${col}">${ic(icn)}</div><div style="font-size:${big ? 16 : 14.5}px;font-weight:600;line-height:1.2;padding:0 8px">${label}</div></div>`);
  // tradicional
  const T = box(content, 'panel', 0, 0, 1532, 318, `<div class="ph" style="font-size:14px;letter-spacing:.14em;color:#f9d58c">PROCESSO TRADICIONAL<span class="r" style="letter-spacing:0">etapas em sequência · dependência de tarefas manuais</span></div>`);
  const tn = TR.map(([l, icn, man], i) => { const e = node(T, 30 + i * 214, 80, 172, 132, l, icn, '#f5b83d'); if (man) el('span', 'tag a abs', e, 'manual').style.cssText = 'left:50%;top:-12px;transform:translateX(-50%);font-size:10.5px;';
    if (i < 6) box(T, 'abs ar', 30 + i * 214 + 176, 144, 34, 4, `<div style="border-top:2px dashed rgba(245,184,61,.6);margin-top:1px"></div>`); return e; });
  const ars = [...T.querySelectorAll('.ar')]; const tdot = box(T, 'abs', 0, 232, 14, 14, ''); tdot.style.cssText += 'border-radius:50%;background:var(--amber);box-shadow:0 0 16px var(--amber);';
  const tc = box(T, 'abs', 30, 262, 1470, 36, `<div style="display:flex;gap:10px;align-items:center"><span class="tag a" style="font-size:13px;padding:6px 12px">7 etapas em sequência</span><span class="tag m" style="font-size:13px;padding:6px 12px">5 etapas manuais</span><span style="font-size:12.5px;color:var(--mut)">cada etapa aguarda a anterior</span></div>`);
  // com DIGITALGOV 10.7
  const D = box(content, 'panel', 0, 336, 1532, 430, `<div class="ph" style="font-size:14px;letter-spacing:.14em;color:#8fe9f7">COM DIGITALGOV 10.7<span class="r" style="letter-spacing:0">processos integrados em um único ambiente</span></div>`);
  D.style.borderColor = 'rgba(91,140,255,.4)'; D.style.boxShadow = '0 0 60px rgba(47,107,255,.14) inset';
  const d0 = node(D, 30, 150, 200, 150, 'Recebimento', 'inbox', '#22d3ee', 1);
  const d1 = box(D, 'abs', 300, 70, 620, 310, `<div style="position:absolute;inset:0;border-radius:18px;border:1px solid rgba(91,140,255,.8);background:linear-gradient(120deg,rgba(47,107,255,.2),rgba(34,211,238,.08));box-shadow:0 0 50px rgba(47,107,255,.3)"></div>
    <div style="position:absolute;left:22px;top:18px;display:flex;align-items:center;gap:10px;font-size:17px;font-weight:600"><div style="width:22px;height:22px;color:var(--cyan)">${ic('spark')}</div>Processamento inteligente paralelo</div>
    ${['Triagem e análise', 'Renomeação', 'Restauração', 'Organização', 'Conferência'].map((s, k) => `<div style="position:absolute;left:22px;right:22px;top:${62 + k * 47}px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(8,12,18,.55);display:flex;align-items:center;padding:0 14px;gap:12px;font-size:13.5px;font-weight:500"><span style="width:140px">${s}</span><div style="flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden"><div class="pl" style="height:100%;border-radius:3px;background:linear-gradient(90deg,var(--blue),var(--cyan))"></div></div><span class="tag c" style="font-size:10.5px">agente IA</span></div>`).join('')}`);
  const pls = [...d1.querySelectorAll('.pl')];
  const d2 = node(D, 990, 150, 200, 150, 'Validação', 'shield', '#22d3ee', 1), d3 = node(D, 1260, 150, 240, 150, 'Entrega automatizada', 'send', '#34d399', 1);
  const dar = [[234, 62], [924, 62], [1194, 62]].map(([x, w]) => box(D, 'abs', x, 223, w, 4, `<div style="height:2px;background:linear-gradient(90deg,var(--blue),var(--cyan));box-shadow:0 0 10px var(--cyan)"></div>`));
  const ddot = box(D, 'abs', 0, 396, 14, 14, ''); ddot.style.cssText += 'border-radius:50%;background:var(--cyan);box-shadow:0 0 16px var(--cyan);';
  const dc = box(D, 'abs', 990, 340, 520, 60, `<div style="display:flex;gap:10px;flex-wrap:wrap"><span class="tag c" style="font-size:13px;padding:6px 12px">4 etapas integradas</span><span class="tag g" style="font-size:13px;padding:6px 12px">menos etapas manuais</span></div>`);
  // fantasmas: etapas manuais convergem para o nó paralelo
  const gh = [1, 2, 3, 4, 5].map((i) => { const e = box(content, 'abs', 30 + i * 214, 80, 172, 132, `<div style="position:absolute;inset:0;border-radius:14px;border:1px solid rgba(34,211,238,.8);background:rgba(34,211,238,.12);display:grid;place-items:center;font-size:14.5px;font-weight:600">${TR[i][0]}</div>`); e.style.zIndex = 5; return e; });

  return { update(lt, dur) {
    cam(win, lt, dur, { dir: -1, ry: 1.8 });
    tn.forEach((e, i) => appear(e, lt, 0.6 + i * 0.3, 0.5, 14)); ars.forEach((e, i) => { e.style.opacity = range(lt, 0.9 + i * 0.3, 1.2 + i * 0.3); });
    const mp = clamp((lt - 1.2) / 10.5) * 6, mi = Math.min(5, Math.floor(mp)), mf = smooth(range(mp - mi, 0.6, 1));
    tdot.style.transform = `translateX(${30 + 79 + (mi + mf) * 214}px)`; tdot.style.opacity = range(lt, 1.0, 1.4);
    appear(tc, lt, 2.8, 0.6, 8);
    appear(D, lt, 3.2, 0.8, 30);
    [d0, d1, d2, d3].forEach((e, i) => appear(e, lt, 3.8 + i * 0.35, 0.6, 14)); dar.forEach((e, i) => { e.style.transform = `scaleX(${easeOutCubic(range(lt, 4.3 + i * 0.35, 4.9 + i * 0.35))})`; e.style.transformOrigin = 'left'; });
    // convergência (lt 5.4 → 7.2)
    const dim = smooth(range(lt, 5.4, 6.4));
    tn.forEach((e, i) => { if (i > 0 && i < 6) e.firstChild.style.opacity = lerp(1, 0.32, dim); });
    gh.forEach((e, k) => { const g = easeInOutCubic(range(lt, 5.4 + k * 0.16, 6.8 + k * 0.16)); const x0 = 30 + (k + 1) * 214, tx = 322 + 280 - 86, ty = 336 + 70 + 62 + k * 47 - 47;
      e.style.transform = `translate(${(tx - x0) * g}px,${(ty - 80) * g}px) scale(${lerp(1, 0.3, g)})`; e.style.opacity = Math.sin(Math.PI * clamp(g * 0.98 + 0.01)) * 0.95; });
    const cyc = ((lt - 5.2) / 2.6) % 1, on = lt > 5.2;
    pls.forEach((p, k) => { p.style.width = (on ? clamp((cyc - 0.08) / (0.42 + k * 0.05)) * 100 : 0) + '%'; });
    const ax = cyc < 0.1 ? lerp(124, 300, cyc / 0.1) : cyc < 0.68 ? lerp(300, 920, (cyc - 0.1) / 0.58) : cyc < 0.84 ? lerp(920, 1084, (cyc - 0.68) / 0.16) : lerp(1084, 1374, smooth((cyc - 0.84) / 0.16));
    ddot.style.transform = `translateX(${ax}px)`; ddot.style.opacity = on ? 1 : 0;
    appear(dc, lt, 7.0, 0.6, 10);
  } };
}
