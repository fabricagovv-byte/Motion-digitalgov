import * as THREE from 'three';
import { rng, roundRect, FONT, FONT_D, clamp, easeOutCubic, range, smooth } from './core.js';

export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.userData = { canvas: c, g };
  return t;
}

// Sprite circular suave para partículas.
export function dotTexture() {
  return canvasTex(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.85)');
    r.addColorStop(0.55, 'rgba(255,255,255,.18)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  });
}

// Feixe de luz volumétrica (gradiente vertical + bordas suaves).
export function shaftTexture() {
  return canvasTex(256, 512, (g, w, h) => {
    const v = g.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, 'rgba(255,255,255,.9)'); v.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = v; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-in';
    const hz = g.createLinearGradient(0, 0, w, 0);
    hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(0.5, 'rgba(0,0,0,1)'); hz.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = hz; g.fillRect(0, 0, w, h);
  });
}

// Documento em papel (layout genérico, ilustrativo).
export function paperTexture(seed, digital = false) {
  const R = rng(seed); const regions = [];
  const tex = canvasTex(512, 704, (g, w, h) => {
    if (digital) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(20,90,170,.30)'; roundRect(g, 4, 4, w - 8, h - 8, 10); g.fill();
      g.strokeStyle = 'rgba(110,200,255,.95)'; g.lineWidth = 3; roundRect(g, 4, 4, w - 8, h - 8, 10); g.stroke(); }
    else { g.fillStyle = '#f2efe8'; g.fillRect(0, 0, w, h);
      const v = g.createLinearGradient(0, 0, w, h); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(90,70,40,.10)');
      g.fillStyle = v; g.fillRect(0, 0, w, h); }
    const ink = digital ? 'rgba(150,215,255,.95)' : 'rgba(40,44,52,.82)';
    const ink2 = digital ? 'rgba(120,190,255,.55)' : 'rgba(60,64,72,.45)';
    g.fillStyle = ink; g.fillRect(48, 52, 150, 16); g.fillRect(48, 78, 96, 9);
    g.fillStyle = ink2; g.fillRect(w - 170, 54, 122, 9); g.fillRect(w - 140, 70, 92, 9);
    regions.push([42, 46, 162, 46]); regions.push([w - 176, 48, 134, 36]);
    const tw = 260 + R() * 100; g.fillStyle = ink; g.fillRect(48, 128, tw, 13); regions.push([42, 121, tw + 12, 27]);
    let y = 172;
    for (let p = 0; p < 4; p++) {
      const n = 3 + Math.floor(R() * 4), y0 = y;
      for (let i = 0; i < n; i++) { const lw = i === n - 1 ? 120 + R() * 200 : w - 96 - R() * 30;
        g.fillStyle = ink2; g.fillRect(48, y, lw, 7); y += 17; }
      regions.push([42, y0 - 6, w - 84, y - y0 + 2]);
      y += 16;
    }
    if (!digital && R() > 0.4) { g.strokeStyle = 'rgba(30,60,140,.55)'; g.lineWidth = 2.5; g.beginPath();
      let x = w - 220, yy = h - 92; g.moveTo(x, yy);
      for (let i = 0; i < 9; i++) { x += 14; yy = h - 92 + Math.sin(i * 1.7 + seed) * 12; g.lineTo(x, yy); } g.stroke(); }
    g.fillStyle = ink2; g.fillRect(w - 230, h - 70, 180, 3);
  });
  tex.userData.regions = regions; return tex;
}

// ------------------------------------------------------------------
// Interface demonstrativa do GED (ilustrativa — não representa um produto real).
// ------------------------------------------------------------------
const UI = { bg: '#0b1426', panel: '#111d34', line: 'rgba(130,170,230,.16)', text: '#e8f1ff', dim: '#8ea6c8', accent: '#2fa8ff', accent2: '#5be0c8' };
const FOLDERS = [['Contratos', '1.284'], ['Recursos Humanos', '862'], ['Financeiro', '2.031'], ['Protocolos', '3.517'], ['Licitações', '419'], ['Jurídico', '745']];
const ROWS = [
  ['Contrato_Prestacao_Servicos_0187.pdf', 'Contratos', '12/03/2024', 'Indexado'],
  ['Contrato_Manutencao_Predial_0192.pdf', 'Contratos', '28/03/2024', 'Indexado'],
  ['Aditivo_Contrato_0187_v2.pdf', 'Contratos', '04/04/2024', 'Em análise'],
  ['Contrato_Locacao_Equipamentos_0201.pdf', 'Contratos', '19/04/2024', 'Indexado'],
  ['Contrato_Consultoria_0214.pdf', 'Contratos', '02/05/2024', 'Aprovado'],
];
export const UI_W = 2400, UI_H = 1500;

function icon(g, x, y, s, c) { g.fillStyle = c; roundRect(g, x, y, s * 0.78, s, s * 0.12); g.fill();
  g.fillStyle = 'rgba(255,255,255,.65)'; g.fillRect(x + s * 0.16, y + s * 0.3, s * 0.46, s * 0.07); g.fillRect(x + s * 0.16, y + s * 0.48, s * 0.46, s * 0.07); g.fillRect(x + s * 0.16, y + s * 0.66, s * 0.3, s * 0.07); }

// s: estado animado { type (0..1), results (0..1), select (0..1), flow (0..1), glow }
export function drawGedUI(g, s) {
  const W = UI_W, H = UI_H;
  g.clearRect(0, 0, W, H);
  g.fillStyle = UI.bg; roundRect(g, 0, 0, W, H, 36); g.fill();
  g.strokeStyle = 'rgba(120,190,255,.35)'; g.lineWidth = 3; roundRect(g, 1.5, 1.5, W - 3, H - 3, 36); g.stroke();
  // Barra superior
  g.fillStyle = '#0e1a30'; roundRect(g, 0, 0, W, 120, 36); g.fill(); g.fillRect(0, 60, W, 60);
  g.fillStyle = UI.accent; roundRect(g, 48, 34, 52, 52, 12); g.fill();
  g.fillStyle = '#fff'; g.font = `700 26px ${FONT_D}`; g.textBaseline = 'middle'; g.fillText('GED', 52, 61);
  g.fillStyle = UI.text; g.font = `600 30px ${FONT_D}`; g.fillText('Gestão Eletrônica de Documentos', 124, 60);
  g.fillStyle = 'rgba(91,224,200,.14)'; roundRect(g, 640, 40, 290, 40, 20); g.fill();
  g.fillStyle = UI.accent2; g.font = `500 21px ${FONT}`; g.fillText('Interface demonstrativa', 662, 61);
  // Busca
  const sx = 1000, sw = 900;
  g.fillStyle = '#16264a'; roundRect(g, sx, 28, sw, 64, 32); g.fill();
  g.strokeStyle = s.type > 0 && s.type < 1.2 ? 'rgba(47,168,255,.9)' : 'rgba(120,170,230,.25)'; g.lineWidth = 3; roundRect(g, sx, 28, sw, 64, 32); g.stroke();
  g.strokeStyle = UI.dim; g.lineWidth = 4; g.beginPath(); g.arc(sx + 42, 58, 13, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(sx + 52, 68); g.lineTo(sx + 62, 78); g.stroke();
  const q = 'contrato prestação 2024'; const n = Math.round(clamp(s.type) * q.length);
  g.font = `400 28px ${FONT}`;
  if (n === 0) { g.fillStyle = 'rgba(142,166,200,.7)'; g.fillText('Pesquisar documentos, conteúdo, metadados…', sx + 84, 60); }
  else { g.fillStyle = UI.text; g.fillText(q.slice(0, n), sx + 84, 60); }
  if (s.type > 0 && s.type < 1.15 && (Math.floor(s.blink * 2.2) % 2 === 0)) { const tw = g.measureText(q.slice(0, n)).width; g.fillStyle = UI.accent; g.fillRect(sx + 88 + tw, 42, 3, 36); }
  g.fillStyle = '#2b4a7a'; g.beginPath(); g.arc(W - 80, 60, 30, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.font = `600 22px ${FONT}`; g.textAlign = 'center'; g.fillText('AS', W - 80, 61); g.textAlign = 'left';
  // Sidebar
  g.fillStyle = UI.panel; roundRect(g, 32, 152, 430, H - 184, 24); g.fill();
  g.fillStyle = UI.dim; g.font = `600 20px ${FONT}`; g.fillText('PASTAS', 68, 200);
  FOLDERS.forEach(([name, cnt], i) => {
    const y = 236 + i * 74; const act = i === 0;
    if (act) { g.fillStyle = 'rgba(47,168,255,.16)'; roundRect(g, 52, y - 4, 390, 60, 14); g.fill(); }
    g.fillStyle = act ? UI.accent : '#3d5c8c'; roundRect(g, 72, y + 12, 36, 28, 6); g.fill(); g.fillRect(72, y + 7, 16, 8);
    g.fillStyle = act ? UI.text : '#c3d3ea'; g.font = `${act ? 600 : 500} 25px ${FONT}`; g.fillText(name, 126, y + 27);
    g.fillStyle = UI.dim; g.font = `500 21px ${FONT}`; g.textAlign = 'right'; g.fillText(cnt, 420, y + 27); g.textAlign = 'left';
  });
  g.fillStyle = UI.dim; g.font = `600 20px ${FONT}`; g.fillText('CATEGORIAS', 68, 720);
  ['Vigentes', '2024', 'Serviços', 'Assinados'].forEach((c, i) => { const x = 68 + (i % 2) * 180, y = 750 + Math.floor(i / 2) * 64;
    g.fillStyle = 'rgba(120,170,230,.12)'; roundRect(g, x, y, 166, 46, 23); g.fill(); g.fillStyle = '#b9cce6'; g.font = `500 21px ${FONT}`; g.fillText(c, x + 22, y + 24); });
  // Acesso
  g.fillStyle = 'rgba(91,224,200,.10)'; roundRect(g, 52, H - 250, 390, 180, 18); g.fill();
  g.fillStyle = UI.accent2; g.font = `600 21px ${FONT}`; g.fillText('ACESSO CONTROLADO', 76, H - 210);
  g.fillStyle = '#c3d3ea'; g.font = `500 22px ${FONT}`; g.fillText('Perfil: Analista', 76, H - 168);
  g.fillStyle = UI.dim; g.font = `400 20px ${FONT}`; g.fillText('Consulta  ✓    Edição  ✓', 76, H - 128); g.fillText('Exclusão  —  requer aprovação', 76, H - 96);
  // Resultados
  const mx = 494, mw = 1080;
  g.fillStyle = UI.panel; roundRect(g, mx, 152, mw, 840, 24); g.fill();
  g.fillStyle = UI.text; g.font = `600 30px ${FONT_D}`; g.fillText('Contratos', mx + 36, 208);
  const rs = s.results;
  g.fillStyle = UI.dim; g.font = `400 22px ${FONT}`;
  g.fillText(rs > 0.05 ? `5 resultados para “${q}” · 0,21 s` : '1.284 documentos', mx + 36, 250);
  g.strokeStyle = UI.line; g.lineWidth = 2; g.beginPath(); g.moveTo(mx + 30, 290); g.lineTo(mx + mw - 30, 290); g.stroke();
  g.fillStyle = UI.dim; g.font = `600 18px ${FONT}`; g.fillText('NOME', mx + 100, 318); g.fillText('DATA', mx + 690, 318); g.fillText('STATUS', mx + 860, 318);
  for (let i = 0; i < 5; i++) {
    const a = rs <= 0 ? 1 : easeOutCubic(range(rs, i * 0.12, i * 0.12 + 0.5));
    const y = 346 + i * 120 + (1 - a) * 24;
    g.globalAlpha = rs <= 0 ? 0.35 : a;
    const sel = i === 0 && s.select > 0;
    if (sel) { g.fillStyle = `rgba(47,168,255,${0.18 * s.select})`; roundRect(g, mx + 20, y - 8, mw - 40, 104, 16); g.fill();
      g.strokeStyle = `rgba(47,168,255,${0.8 * s.select})`; g.lineWidth = 2.5; roundRect(g, mx + 20, y - 8, mw - 40, 104, 16); g.stroke(); }
    icon(g, mx + 40, y + 14, 58, i === 2 ? '#d9822b' : '#d4463d');
    const row = rs > 0.05 ? ROWS[i] : ['Documento_' + (1100 + i * 37) + '.pdf', 'Contratos', '—', '—'];
    g.fillStyle = UI.text; g.font = `500 25px ${FONT}`; g.fillText(row[0], mx + 100, y + 30);
    g.fillStyle = UI.dim; g.font = `400 20px ${FONT}`; g.fillText(row[1] + ' · PDF · ' + (2 + i) + ' págs.', mx + 100, y + 66);
    g.fillStyle = '#c3d3ea'; g.font = `400 22px ${FONT}`; g.fillText(row[2], mx + 690, y + 44);
    const st = row[3]; const col = st === 'Em análise' ? '#f0b44c' : st === 'Aprovado' ? UI.accent2 : UI.accent;
    if (st !== '—') { g.fillStyle = col + '26'; roundRect(g, mx + 860, y + 22, 150, 42, 21); g.fill(); g.fillStyle = col; g.font = `600 19px ${FONT}`; g.fillText(st, mx + 880, y + 44); }
    g.globalAlpha = 1;
  }
  // Pré-visualização + metadados
  const px = 1606, pw = W - px - 32;
  g.fillStyle = UI.panel; roundRect(g, px, 152, pw, 840, 24); g.fill();
  const sel = s.select;
  g.fillStyle = UI.dim; g.font = `600 20px ${FONT}`; g.fillText('VISUALIZAÇÃO', px + 32, 200);
  g.globalAlpha = 0.25 + 0.75 * sel;
  g.fillStyle = '#c4cedd'; roundRect(g, px + 32, 228, 300, 410, 10); g.fill();
  g.fillStyle = 'rgba(40,50,70,.8)'; g.fillRect(px + 56, 258, 130, 14); g.fillStyle = 'rgba(60,70,90,.4)';
  for (let i = 0; i < 16; i++) g.fillRect(px + 56, 296 + i * 20, i % 5 === 4 ? 140 : 250, 6);
  g.globalAlpha = sel;
  const meta = [['Nº', '2024-0187'], ['Data', '12/03/2024'], ['Setor', 'Administrativo'], ['Tipo', 'Contrato'], ['Versão', '2']];
  meta.forEach(([k, v], i) => { const y = 260 + i * 76; g.fillStyle = UI.dim; g.font = `500 19px ${FONT}`; g.fillText(k.toUpperCase(), px + 360, y);
    g.fillStyle = UI.text; g.font = `500 24px ${FONT}`; g.fillText(v, px + 360, y + 32); });
  g.fillStyle = UI.dim; g.font = `600 19px ${FONT}`; g.fillText('PALAVRAS-CHAVE', px + 32, 690);
  ['prestação', 'serviços', '2024', 'vigente'].forEach((k, i) => { const x = px + 32 + i * 166;
    g.fillStyle = 'rgba(47,168,255,.15)'; roundRect(g, x, 712, 152, 42, 21); g.fill(); g.fillStyle = '#9fd0ff'; g.font = `500 20px ${FONT}`; g.fillText(k, x + 20, 734); });
  g.fillStyle = UI.dim; g.font = `600 19px ${FONT}`; g.fillText('HISTÓRICO', px + 32, 800);
  [['Visualizado por A. Souza', 'hoje, 09:41'], ['Versão 2 adicionada', 'ontem, 16:12'], ['Aprovado — Jurídico', '14/03, 11:05']].forEach(([a, b], i) => {
    const y = 834 + i * 48; g.fillStyle = UI.accent; g.beginPath(); g.arc(px + 42, y, 6, 0, 7); g.fill();
    g.fillStyle = '#c3d3ea'; g.font = `500 21px ${FONT}`; g.fillText(a, px + 62, y + 1); g.fillStyle = UI.dim; g.font = `400 19px ${FONT}`; g.textAlign = 'right'; g.fillText(b, px + pw - 32, y + 1); g.textAlign = 'left'; });
  g.globalAlpha = 1;
  // Fluxo de trabalho
  const fy = 1024;
  g.fillStyle = UI.panel; roundRect(g, mx, fy, W - mx - 32, H - fy - 32, 24); g.fill();
  g.fillStyle = UI.dim; g.font = `600 20px ${FONT}`; g.fillText('FLUXO DE TRABALHO · Contrato 2024-0187', mx + 36, fy + 52);
  const steps = ['Recebido', 'Digitalizado', 'Em análise', 'Aprovado', 'Arquivado'];
  const x0 = mx + 120, x1 = W - 180, yy = fy + 200;
  const prog = clamp(s.flow) * (steps.length - 1);
  g.strokeStyle = 'rgba(120,170,230,.2)'; g.lineWidth = 6; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x1, yy); g.stroke();
  g.strokeStyle = UI.accent; g.beginPath(); g.moveTo(x0, yy); g.lineTo(x0 + (x1 - x0) * prog / (steps.length - 1), yy); g.stroke();
  steps.forEach((st, i) => { const x = x0 + (x1 - x0) * i / (steps.length - 1); const on = prog >= i - 0.02;
    g.fillStyle = on ? UI.accent : '#1b2c4c'; g.beginPath(); g.arc(x, yy, 22, 0, 7); g.fill();
    g.strokeStyle = on ? 'rgba(47,168,255,.35)' : 'rgba(120,170,230,.25)'; g.lineWidth = on ? 10 : 3; g.beginPath(); g.arc(x, yy, 27, 0, 7); g.stroke();
    if (on) { g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 9, yy); g.lineTo(x - 2, yy + 7); g.lineTo(x + 10, yy - 7); g.stroke(); }
    g.fillStyle = on ? UI.text : UI.dim; g.font = `${on ? 600 : 500} 23px ${FONT}`; g.textAlign = 'center'; g.fillText(st, x, yy + 70); g.textAlign = 'left'; });
}

// Cartão flutuante genérico (título + linhas) — usado em segurança e no GED.
export function drawCard(g, w, h, { title, rows = [], accent = '#2fa8ff', reveal = 1, badge }) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = 'rgba(12,24,46,.92)'; roundRect(g, 2, 2, w - 4, h - 4, 26); g.fill();
  g.strokeStyle = 'rgba(130,195,255,.45)'; g.lineWidth = 2.5; roundRect(g, 2, 2, w - 4, h - 4, 26); g.stroke();
  g.fillStyle = accent; roundRect(g, 32, 34, 8, 34, 4); g.fill();
  g.fillStyle = '#e8f1ff'; g.font = `600 32px ${FONT_D}`; g.textBaseline = 'middle'; g.fillText(title, 58, 52);
  if (badge) { g.font = `600 20px ${FONT}`; const bw = g.measureText(badge).width + 40; g.fillStyle = accent + '2a'; roundRect(g, w - bw - 30, 32, bw, 40, 20); g.fill();
    g.fillStyle = accent; g.fillText(badge, w - bw - 10, 53); }
  rows.forEach((r, i) => {
    const a = smooth(range(reveal * (rows.length + 1), i, i + 1));
    if (a <= 0) return; g.globalAlpha = a;
    const y = 120 + i * 62 + (1 - a) * 14;
    g.strokeStyle = 'rgba(130,170,230,.13)'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, y - 30); g.lineTo(w - 32, y - 30); g.stroke();
    if (r.dot) { g.fillStyle = r.dot; g.beginPath(); g.arc(46, y, 7, 0, 7); g.fill(); }
    g.fillStyle = '#d3e2f6'; g.font = `500 25px ${FONT}`; g.fillText(r.a, r.dot ? 68 : 36, y);
    if (r.b) { g.fillStyle = r.bc || '#8ea6c8'; g.font = `500 22px ${FONT}`; g.textAlign = 'right'; g.fillText(r.b, w - 36, y); g.textAlign = 'left'; }
    g.globalAlpha = 1;
  });
}

// Etiqueta de metadado (chip) com texto.
export function chipTexture(label, value, color = '#2fa8ff') {
  return canvasTex(640, 120, (g, w, h) => {
    g.fillStyle = 'rgba(10,26,52,.9)'; roundRect(g, 3, 3, w - 6, h - 6, 56); g.fill();
    g.strokeStyle = color; g.lineWidth = 3; roundRect(g, 3, 3, w - 6, h - 6, 56); g.stroke();
    g.textBaseline = 'middle'; g.fillStyle = color; g.font = `600 30px ${FONT}`; g.fillText(label.toUpperCase(), 40, h / 2);
    const lw = g.measureText(label.toUpperCase()).width;
    g.fillStyle = '#eaf4ff'; g.font = `500 36px ${FONT}`; g.fillText(value, 40 + lw + 22, h / 2);
  });
}

export function labelTexture(text, { size = 44, color = '#cfe6ff', weight = 600, w = 640, h = 110, align = 'center' } = {}) {
  return canvasTex(w, h, (g) => { g.textBaseline = 'middle'; g.textAlign = align; g.fillStyle = color; g.font = `${weight} ${size}px ${FONT_D}`;
    g.fillText(text, align === 'center' ? w / 2 : 10, h / 2); });
}
