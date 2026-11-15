// Cena 7 — Resultado final: travelling pelo dashboard completo, lote concluído com comprovante de entrega e assinatura.
import { el, box, ic, svg, fmt, hash, range, lerp, clamp, smooth, easeOutCubic, easeOutExpo, easeInOutCubic } from './util.js';

const MODS = [['Produção', 'cpu', 'bars'], ['Restauração', 'wand', 'ba'], ['Organização', 'folder', 'tree'], ['Inteligência Artificial', 'spark', 'net'], ['Qualidade', 'eye', 'ring'], ['Segurança', 'shield', 'log'], ['Entrega', 'send', 'line']];
function mini(kind, i) {
  if (kind === 'bars') return `<div style="display:flex;align-items:flex-end;gap:9px;height:150px">${Array.from({ length: 12 }, (_, k) => `<div style="flex:1;height:${30 + hash(k + i) * 50 + k * 4}%;border-radius:5px 5px 0 0;background:linear-gradient(180deg,#5b8cff,rgba(47,107,255,.25))"></div>`).join('')}</div>`;
  if (kind === 'ba') return `<div style="display:flex;gap:12px;height:150px"><div style="flex:1;border-radius:8px;background:#b9ad8f;filter:blur(1px) brightness(.8)"></div><div style="flex:1;border-radius:8px;background:#f5f6f8;box-shadow:0 0 22px rgba(34,211,238,.4)"></div></div>`;
  if (kind === 'tree') return [0, 1, 1, 1, 2].map((l, k) => `<div style="margin:0 0 9px ${l * 22}px;height:22px;border-radius:6px;background:rgba(255,255,255,.05);border:1px solid var(--line);width:${[200, 240, 210, 250, 180][k]}px"></div>`).join('');
  if (kind === 'net') return `<svg width="380" height="150" viewBox="0 0 380 150">${[[40, 30], [40, 75], [40, 120]].map((a) => [[190, 20], [190, 60], [190, 100], [190, 138]].map((b) => `<path d="M${a} L${b}" stroke="rgba(91,140,255,.45)"/>`).join('')).join('')}${[[190, 20], [190, 60], [190, 100], [190, 138]].map((a) => [[340, 50], [340, 105]].map((b) => `<path d="M${a} L${b}" stroke="rgba(34,211,238,.4)"/>`).join('')).join('')}${[[40, 30], [40, 75], [40, 120], [190, 20], [190, 60], [190, 100], [190, 138], [340, 50], [340, 105]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#0c1320" stroke="#22d3ee" stroke-width="2"/>`).join('')}</svg>`;
  if (kind === 'ring') return `<svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="58" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="13"/><circle cx="75" cy="75" r="58" fill="none" stroke="#22d3ee" stroke-width="13" stroke-linecap="round" pathLength="100" stroke-dasharray="92 100" transform="rotate(-90 75 75)"/></svg>`;
  if (kind === 'log') return ['Backup automático concluído', 'Versão 3 registrada', 'Acesso auditado', 'Integridade verificada'].map((t) => `<div style="display:flex;align-items:center;gap:10px;font-size:13px;color:#cdd7e4;margin-bottom:13px"><div class="chk" style="width:17px;height:17px">${ic('check')}</div>${t}</div>`).join('');
  return `<svg width="380" height="150" viewBox="0 0 380 150"><path d="M0 120 ${Array.from({ length: 16 }, (_, k) => `L${k * 25} ${120 - k * 5.5 - hash(k + 3) * 22}`).join(' ')}" fill="none" stroke="#34d399" stroke-width="2.6"/></svg>`;
}

export function create(root) {
  root.style.perspective = '1900px';
  // dashboard completo (mais largo que o quadro) para o travelling de câmera
  const world = el('div', 'abs', root); world.style.cssText = 'left:0;top:0;width:3400px;height:1000px;transform-origin:0 0;';
  el('div', 'abs', world, `<div style="display:flex;align-items:center;gap:14px"><div class="mark" style="width:44px;height:44px;font-size:23px;border-radius:13px">D</div><b style="font-size:24px;letter-spacing:.06em">DIGITALGOV <span style="color:var(--cyan)">10.7</span></b><span class="demo" style="margin-left:26px">Ambiente demonstrativo · dados ilustrativos</span></div>`).style.cssText = 'left:60px;top:40px;';
  const tiles = MODS.map(([name, icn, kind], i) => { const e = box(world, 'panel', 60 + i * 470, 130, 440, 380, `<div class="ph" style="font-size:19px;top:20px">${ic(icn, 'style="width:22px;height:22px"')}${name}<span class="r"><span class="tag g">operacional</span></span></div><div class="abs" style="left:26px;right:26px;top:86px">${mini(kind, i)}</div>
    <div class="abs" style="left:26px;right:26px;bottom:22px;display:flex;justify-content:space-between;font-size:12.5px;color:var(--mut)"><span>módulo integrado</span><span>tempo real</span></div>`); return e; });
  MODS.forEach(([name], i) => box(world, 'panel', 60 + i * 470, 540, 440, 150, `<div class="kpi" style="position:absolute;inset:0"><div class="lab">${ic('chart')}${['Documentos processados', 'Páginas restauradas', 'Pastas organizadas', 'Agentes de IA ativos', 'Legibilidade verificada', 'Eventos de auditoria', 'Lotes entregues'][i]}</div><div class="val">${['46.910', '18.204', '312', '12', '45.730', '1.406', '18'][i]}</div><div class="sub">ilustrativo</div></div>`));
  // lote concluído
  const lot = el('div', 'abs', root); lot.style.cssText = 'left:560px;top:190px;width:800px;height:560px;';
  lot.innerHTML = `<div style="position:absolute;inset:0;border-radius:24px;border:1px solid rgba(52,211,153,.5);background:linear-gradient(180deg,#111a22,#0a0f14);box-shadow:0 60px 160px rgba(0,0,0,.8),0 0 90px rgba(52,211,153,.18)"></div>
    <div style="position:absolute;left:44px;top:40px;display:flex;align-items:center;gap:18px"><div class="chk big" style="width:62px;height:62px;border-width:2px">${ic('check', 'style="width:32px;height:32px"')}</div><div><div style="font-size:13px;letter-spacing:.18em;color:var(--green);font-weight:700">LOTE CONCLUÍDO</div><div class="h" style="font-size:38px;font-weight:600;letter-spacing:-.015em;margin-top:4px">Lote 2024-018</div></div></div>
    <div class="rows" style="position:absolute;left:44px;right:44px;top:150px"></div>
    <div style="position:absolute;left:44px;right:44px;bottom:36px;display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--mut)"><span class="demo" style="margin:0">dados ilustrativos</span><span style="margin-left:auto" class="mono">CE-2024-000187</span></div>`;
  const rows = [['Documentos no lote', '1.248'], ['Status de validação', '<span class="tag g" style="font-size:13px">Validado</span>'], ['Qualidade e legibilidade', '<span class="tag g" style="font-size:13px">Conferidas</span>'], ['Pacote de entrega', 'PDF pesquisável · índice · relatórios'], ['Comprovante de entrega', '<span class="tag c" style="font-size:13px">Emitido</span>']]
    .map(([a, b]) => el('div', '', lot.querySelector('.rows'), `<div style="display:flex;justify-content:space-between;align-items:center;height:60px;border-bottom:1px solid var(--line);font-size:17px"><span style="color:var(--mut)">${a}</span><span style="font-weight:600">${b}</span></div>`));
  // assinatura
  const end = el('div', 'title-ov', root, `<div class="big" style="font-size:156px">DIGITALGOV<i>10.7</i></div><div class="rule"></div>
    <div class="h slog" style="font-size:40px;font-weight:600;letter-spacing:.035em;display:flex;gap:.6em"><span>MAIS PRODUTIVIDADE.</span><span>MAIS QUALIDADE.</span><span style="color:var(--cyan)">ENTREGAS MAIS INTELIGENTES.</span></div>
    <div class="tagline" style="margin-top:30px">Tecnologia que transforma documentos em resultados.</div>
    <div class="lg" style="margin-top:58px;background:#fff;border-radius:16px;padding:14px 26px;box-shadow:0 10px 50px rgba(47,107,255,.35)"><img src="/assets/logo-digitalgov.png" style="display:block;width:235px;height:75.5px"></div>`);
  const [eb, er, es, et, eg] = end.children;

  return { update(lt, dur, t) {
    const EC = 6.0;   // início da assinatura
    const p = easeInOutCubic(range(lt, 0, 5.2)), out = smooth(range(lt, EC - 0.3, EC + 0.7));
    const lotIn = easeOutExpo(range(lt, 2.9, 4.2));
    world.style.transform = `translate3d(${lerp(160, -1500, p)}px,${lerp(210, 150, p)}px,${lerp(-120, 120, p) - lotIn * 160}px) rotateX(${lerp(9, 3, p)}deg) rotateY(${lerp(-9, 6, p)}deg)`;
    world.style.opacity = lerp(1, 0.3, lotIn) * (1 - out); world.style.filter = lotIn > 0 ? `blur(${lotIn * 7}px)` : 'none';
    tiles.forEach((e, i) => { e.style.boxShadow = `0 0 ${24 + Math.sin(lt * 3 + i) * 10}px rgba(47,107,255,.18)`; });
    lot.style.opacity = lotIn * (1 - out); lot.style.display = lotIn > 0 && out < 1 ? 'block' : 'none';
    lot.style.transform = `translateY(${(1 - lotIn) * 70}px) rotateX(${(1 - lotIn) * 14}deg) scale(${lerp(0.9, 1, lotIn) * lerp(1, 1.03, range(lt, 3, 6.5))})`;
    lot.querySelector('.big').style.transform = `scale(${easeOutExpo(range(lt, 3.3, 4.0))})`;
    rows.forEach((r, i) => { const a = easeOutCubic(range(lt, 3.5 + i * 0.22, 4.0 + i * 0.22)); r.style.opacity = a; r.style.transform = `translateX(${(1 - a) * 20}px)`; });
    // assinatura
    const a = smooth(range(lt, EC, EC + 0.6)); end.style.display = a > 0 ? 'flex' : 'none'; end.style.opacity = a;
    const b = easeOutExpo(range(lt, EC + 0.1, EC + 1.7)); eb.style.opacity = b; eb.style.filter = `blur(${(1 - b) * 16}px)`; eb.style.letterSpacing = `${lerp(0.08, -0.025, b)}em`; eb.style.transform = `scale(${lerp(0.93, 1, b) * lerp(1, 1.03, range(lt, EC, dur))})`;
    er.style.transform = `scaleX(${easeOutExpo(range(lt, EC + 0.8, EC + 1.9))})`;
    [...es.children].forEach((s, i) => { const q = easeOutCubic(range(lt, EC + 1.3 + i * 0.45, EC + 1.9 + i * 0.45)); s.style.opacity = q; s.style.transform = `translateY(${(1 - q) * 16}px)`; s.style.display = 'inline-block'; });
    const q = easeOutCubic(range(lt, EC + 2.5, EC + 3.3)); et.style.opacity = q; et.style.transform = `translateY(${(1 - q) * 12}px)`;
    const g = easeOutCubic(range(lt, EC + 2.9, EC + 3.7)); eg.style.opacity = g; eg.style.transform = `translateY(${(1 - g) * 12}px)`;
  } };
}
