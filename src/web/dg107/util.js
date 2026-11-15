// Utilidades de DOM e animação do filme DIGITALGOV 10.7 (tudo é função pura do tempo).
export * from '../core.js';
import { clamp, range, easeOutCubic, easeInOutCubic, lerp } from '../core.js';

export function el(tag, cls, parent, html) {
  const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e;
}
export function box(parent, cls, x, y, w, h, html) {
  const e = el('div', cls, parent, html); e.style.cssText += `left:${x}px;top:${y}px;width:${w}px;height:${h}px;`; return e;
}
export const fmt = (n) => Math.round(n).toLocaleString('pt-BR');
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const NS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
export const bez = (p0, p1, p2, p3, s) => { const u = 1 - s; return [u * u * u * p0[0] + 3 * u * u * s * p1[0] + 3 * u * s * s * p2[0] + s * s * s * p3[0], u * u * u * p0[1] + 3 * u * u * s * p1[1] + 3 * u * s * s * p2[1] + s * s * s * p3[1]]; };
// entrada padrão: opacidade + deslocamento vertical
export function appear(e, lt, at, dur = 0.6, dy = 14) { const p = easeOutCubic(range(lt, at, at + dur)); e.style.opacity = p; e.style.transform = `translateY(${(1 - p) * dy}px)`; return p; }

const P = {
  inbox: 'M3 13l3-8h12l3 8M3 13v6h18v-6M3 13h5l1 3h6l1-3h5',
  cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  wand: 'M4 20L15 9M13 5l1.2 2.8L17 9l-2.8 1.2L13 13l-1.2-2.8L9 9l2.8-1.2zM19 14l.7 1.6 1.6.7-1.6.7L19 18.6l-.7-1.6-1.6-.7 1.6-.7z',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6zM9 12l2 2 4-4',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  send: 'M21 3L10 14M21 3l-7 18-4-7-7-4z',
  chart: 'M4 20V10M10 20V4M16 20v-7M21 20H3',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
  doc: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-7 8-7s8 3 8 7',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
  box: 'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8',
  history: 'M3 12a9 9 0 109-9 9 9 0 00-7 3.3M3 4v4h4M12 7v5l3 2',
  db: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  hand: 'M8 13V5.5a1.5 1.5 0 013 0V11m0-4.5a1.5 1.5 0 013 0V11m0-3a1.5 1.5 0 013 0v7a6 6 0 01-6 6h-1a6 6 0 01-5-3l-2.5-4.5a1.5 1.5 0 012.5-1.5L8 15',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4',
  alert: 'M12 4l9 16H3zM12 10v4M12 17h.01',
};
export const ic = (n, extra = '') => `<svg class="ic" viewBox="0 0 24 24" ${extra}><path d="${P[n]}"/></svg>`;

const NAV = [['painel', 'Painel', 'chart'], ['producao', 'Produção', 'cpu'], ['restore', 'Restore AI', 'wand'], ['organizacao', 'Organização', 'folder'],
  ['qualidade', 'Qualidade', 'eye'], ['seguranca', 'Segurança', 'shield'], ['delivery', 'Delivery Center', 'send']];
// Janela padrão da plataforma: barra lateral com módulos + barra superior. Retorna { win, content, W, H } (área útil 1530×774).
export function shell(root, { active, crumb, title }) {
  const win = el('div', 'win', root);
  const side = el('div', 'side', win, `<div class="brand"><div class="mark">D</div><b>DIGITALGOV <i>10.7</i></b></div><div class="navh">MÓDULOS</div>`);
  for (const [id, name, icon] of NAV) el('div', 'nav' + (id === active ? ' on' : ''), side, ic(icon) + name);
  el('div', 'sidefoot', side, `<b>AGENTES DE IA</b>Processamento paralelo ativo`);
  el('div', 'top', win, `<div class="crumb">${crumb}<span>/</span><b>${title}</b></div><div class="live" style="margin-left:18px">Em tempo real</div><div class="demo">Ambiente demonstrativo · dados ilustrativos</div>`);
  const content = el('div', 'content', win);
  return { win, content, W: 1530, H: 790 };
}
// Câmera discreta: leve inclinação 3D e aproximação lenta.
export function cam(win, lt, dur, { ry = 2.2, rx = 1.4, z0 = 1.0, z1 = 1.025, dir = 1 } = {}) {
  const p = clamp(lt / dur), s = easeInOutCubic(p);
  win.style.transform = `rotateX(${lerp(rx, rx * 0.35, s)}deg) rotateY(${dir * lerp(-ry, ry, s)}deg) scale(${lerp(z0, z1, p)})`;
}
export function kpi(parent, x, y, w, h, icon, label, sub) {
  const e = box(parent, 'panel kpi', x, y, w, h, `<div class="lab">${ic(icon)}${label}</div><div class="val">0</div><div class="sub">${sub || ''}</div><div class="bar"></div>`);
  return { e, val: e.querySelector('.val'), bar: e.querySelector('.bar') };
}
