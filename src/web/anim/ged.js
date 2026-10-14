// Telas ilustrativas (dados fictícios): captura, conferência de qualidade, indexação e GED (pesquisa por número/assunto e consulta).
// Somente as funções citadas no roteiro: digitalização, indexação, pesquisa, identificação por assunto e consulta de arquivos.
import { roundRect, clamp, range, smooth, easeOutCubic, lerp } from '../core.js';
import { docImage } from '../inst/docs.js';

const SANS = '"Inter", sans-serif', SANS_D = '"Inter Display", "Inter", sans-serif';
const C = { bg: '#f3f5f8', panel: '#ffffff', line: '#e1e6ee', text: '#1d2633', dim: '#6b7788', nav: '#16325c', accent: '#1f6fd1', ok: '#1f9d6b', sel: '#e8f1fc' };
function text(g, s, x, y, { size = 22, w = 400, color = C.text, align = 'left', font = SANS } = {}) { g.font = `${w} ${size}px ${font}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); g.textAlign = 'left'; }
function rect(g, x, y, w, h, r, fill, stroke) { roundRect(g, x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); } }
function cursor(g, x, y) { g.save(); g.translate(x, y); g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 30); g.lineTo(8, 23); g.lineTo(14, 36); g.lineTo(19, 34); g.lineTo(13, 21); g.lineTo(23, 21); g.closePath(); g.fill(); g.stroke(); g.restore(); }
function thumb(g, i, x, y, w, a = 1) { g.globalAlpha = a; g.drawImage(docImage(i, 700), x, y, w, w * 1.414); g.strokeStyle = C.line; g.lineWidth = 1.5; g.strokeRect(x, y, w, w * 1.414); g.globalAlpha = 1; }
function check(g, x, y, r = 11) { g.fillStyle = C.ok; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x - 1, y + 5); g.lineTo(x + 6, y - 5); g.stroke(); }

function chrome(g, W, H, active, title) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.fillStyle = C.nav; g.fillRect(0, 0, W, 72);
  rect(g, 24, 18, 36, 36, 8, '#ffffff22'); text(g, 'GED', 42, 37, { size: 15, w: 700, color: '#fff', align: 'center' });
  text(g, 'Gestão Eletrônica de Documentos', 76, 37, { size: 22, w: 600, color: '#fff' });
  rect(g, W - 470, 20, 210, 32, 16, '#ffffff1f'); text(g, 'Ambiente demonstrativo', W - 365, 37, { size: 15, w: 500, color: '#cfe0f7', align: 'center' });
  g.fillStyle = '#ffffff33'; g.beginPath(); g.arc(W - 60, 36, 20, 0, 7); g.fill(); text(g, 'SM', W - 60, 37, { size: 15, w: 600, color: '#fff', align: 'center' });
  text(g, 'Prefeitura', W - 96, 37, { size: 16, w: 500, color: '#cfe0f7', align: 'right' });
  g.fillStyle = C.panel; g.fillRect(0, 72, 230, H - 72); g.fillStyle = C.line; g.fillRect(229, 72, 1, H - 72);
  ['Pesquisa', 'Assuntos', 'Documentos', 'Captura', 'Indexação'].forEach((m, i) => { const y = 110 + i * 56; const on = m === active;
    if (on) { rect(g, 12, y - 22, 206, 44, 8, C.sel); g.fillStyle = C.accent; g.fillRect(12, y - 22, 4, 44); }
    g.fillStyle = on ? C.accent : '#9aa6b6'; roundRect(g, 32, y - 9, 18, 18, 4); g.fill(); text(g, m, 64, y, { size: 19, w: on ? 600 : 500, color: on ? C.accent : C.text }); });
  text(g, title, 262, 112, { size: 28, w: 600, font: SANS_D });
}

export function drawCapture(g, W, H, s) {
  chrome(g, W, H, 'Captura', 'Digitalização · Lote 0147');
  const n = Math.floor(s.pages); text(g, 'Processo administrativo nº 2023/004518 · Caixa PREF-131', 262, 150, { size: 18, color: C.dim });
  rect(g, 262, 180, 560, H - 210, 12, C.panel, C.line); text(g, 'PÁGINAS DIGITALIZADAS', 286, 212, { size: 15, w: 600, color: C.dim });
  for (let i = 0; i < Math.min(n, 15); i++) { const c = i % 5, r = Math.floor(i / 5); thumb(g, i % 5, 286 + c * 104, 236 + r * 150, 96, smooth(clamp(s.pages - i)));
    text(g, String(i + 1).padStart(3, '0'), 286 + c * 104 + 48, 236 + r * 150 + 146, { size: 12, color: C.dim, align: 'center' }); }
  const px = 846, pw = W - px - 340; rect(g, px, 180, pw, H - 210, 12, '#e9edf2', C.line);
  const ph = H - 250, pwid = ph / 1.414; if (n > 0) { thumb(g, Math.max(0, n - 1) % 5, px + (pw - pwid) / 2, 200, pwid); g.fillStyle = 'rgba(31,111,209,.16)'; g.fillRect(px + (pw - pwid) / 2, 200 + ph * s.scanLine, pwid, ph * (1 - s.scanLine)); g.fillStyle = 'rgba(31,111,209,.8)'; g.fillRect(px + (pw - pwid) / 2, 200 + ph * s.scanLine, pwid, 3); }
  const rx = W - 316; rect(g, rx, 180, 290, H - 210, 12, C.panel, C.line); text(g, 'LOTE 0147', rx + 24, 214, { size: 15, w: 600, color: C.dim });
  [['Páginas', String(n)], ['Origem', 'Prefeitura'], ['Tipo', 'Processo'], ['Status', 'Digitalizando…']].forEach(([k, v], i) => { text(g, k, rx + 24, 262 + i * 70, { size: 15, color: C.dim }); text(g, v, rx + 24, 290 + i * 70, { size: 21, w: 600, color: k === 'Status' ? C.accent : C.text }); });
  rect(g, rx + 24, 560, 242, 10, 5, '#e3e8ef'); rect(g, rx + 24, 560, Math.max(10, 242 * clamp(s.pages / 15)), 10, 5, C.accent);
}

export function drawQC(g, W, H, s) {
  chrome(g, W, H, 'Captura', 'Conferência de qualidade');
  text(g, 'Lote 0147 · página 3 de 15', 262, 150, { size: 18, color: C.dim });
  const ph = H - 230, pw = ph / 1.414; rect(g, 262, 180, pw + 40, ph + 20, 12, '#e9edf2', C.line); thumb(g, 2, 282, 190, pw);
  // lupa
  const z = s.zoom; if (z > 0) { const cx = 282 + pw * 0.55, cy = 190 + ph * 0.42, r = 150 * easeOutCubic(z); g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip();
    g.drawImage(docImage(2, 1400), -((cx - 282) * 2.4) + cx - 0, -((cy - 190) * 2.4) + cy, pw * 2.4, pw * 2.4 * 1.414); g.restore(); g.strokeStyle = C.accent; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
  const fx = 262 + pw + 80, fw = W - fx - 40; rect(g, fx, 180, fw, H - 210, 12, C.panel, C.line);
  text(g, 'VERIFICAÇÃO DA IMAGEM', fx + 30, 222, { size: 15, w: 600, color: C.dim });
  ['Legibilidade do texto', 'Página completa', 'Orientação correta', 'Sequência das páginas'].forEach((k, i) => { const y = 280 + i * 84; const p = clamp(s.check - i);
    rect(g, fx + 30, y - 30, fw - 60, 64, 10, p >= 1 ? '#eef8f2' : '#fff', p > 0 && p < 1 ? C.accent : C.line); text(g, k, fx + 56, y + 2, { size: 20, w: 500 }); if (p >= 1) check(g, fx + fw - 70, y + 2); });
  rect(g, fx + fw - 260, H - 110, 230, 56, 10, s.check >= 4 ? C.ok : '#c9d2de'); text(g, s.check >= 4 ? 'Aprovado ✓' : 'Conferindo…', fx + fw - 145, H - 81, { size: 19, w: 600, color: '#fff', align: 'center' });
}

export const INDEX_FIELDS = [['Número do processo', '2023/004518'], ['Assunto', 'Contratos'], ['Tipo documental', 'Contrato'], ['Setor responsável', 'Secretaria Municipal de Administração'], ['Data', '14/03/2023']];
export function drawIndex(g, W, H, s) {
  chrome(g, W, H, 'Indexação', 'Indexação de documentos');
  text(g, 'Contrato nº 0152/2023 · Lote 0147 · página 1', 262, 150, { size: 18, color: C.dim });
  const ph = H - 220, pw = ph / 1.414; rect(g, 262, 180, pw + 40, ph + 20, 12, '#e9edf2', C.line); thumb(g, 0, 282, 190, pw);
  const fx = 262 + pw + 80, fw = W - fx - 40; rect(g, fx, 180, fw, H - 210, 12, C.panel, C.line); text(g, 'DADOS DE IDENTIFICAÇÃO', fx + 30, 222, { size: 15, w: 600, color: C.dim });
  INDEX_FIELDS.forEach(([k, v], i) => { const y = 270 + i * 112; const p = clamp(s.fields - i); const n = Math.round(p * v.length); const active = p > 0 && p < 1;
    text(g, k, fx + 30, y, { size: 17, w: 600 }); rect(g, fx + 30, y + 18, fw - 60, 54, 8, '#fff', active ? C.accent : '#cfd7e2');
    text(g, v.slice(0, n), fx + 46, y + 46, { size: 20, w: 500 }); if (active && Math.floor(s.blink * 2.4) % 2 === 0) { g.font = `500 20px ${SANS}`; g.fillStyle = C.accent; g.fillRect(fx + 48 + g.measureText(v.slice(0, n)).width, y + 32, 2, 28); }
    if (p >= 1) check(g, fx + fw - 58, y + 45); });
}

const RESULTS = [
  ['Processo administrativo nº 2023/004518', 'Contratação de serviços de limpeza e conservação predial', 'Contratos', '14/03/2023', 3],
  ['Contrato nº 0152/2023', 'Prestação de serviços de limpeza e conservação predial', 'Contratos', '14/03/2023', 0],
  ['Ofício nº 087/2023 – SEMAD', 'Encaminhamento de documentação', 'Ofícios', '22/05/2023', 1],
];
// Pesquisa por número ou assunto + consulta do documento
export function drawSearch(g, W, H, s) {
  chrome(g, W, H, s.open > 0.5 ? 'Documentos' : 'Pesquisa', s.open > 0.5 ? 'Processo administrativo nº 2023/004518' : 'Pesquisar documentos');
  const q = s.query || 'processo 2023/004518'; const n = Math.round(clamp(s.type) * q.length);
  if (s.open < 0.5) {
    rect(g, 262, 140, W - 560, 60, 30, '#fff', s.type > 0 && s.type < 1.05 ? C.accent : '#cfd7e2');
    g.strokeStyle = C.dim; g.lineWidth = 3; g.beginPath(); g.arc(298, 168, 10, 0, 7); g.stroke(); g.beginPath(); g.moveTo(305, 176); g.lineTo(314, 185); g.stroke();
    if (n) text(g, q.slice(0, n), 330, 170, { size: 21 }); else text(g, 'Pesquisar por número, assunto ou palavra-chave', 330, 170, { size: 20, color: '#98a3b3' });
    if (s.type > 0 && s.type < 1.05 && Math.floor(s.blink * 2.4) % 2 === 0) { g.font = `400 21px ${SANS}`; g.fillStyle = C.accent; g.fillRect(332 + g.measureText(q.slice(0, n)).width, 154, 2, 30); }
    rect(g, W - 280, 140, 200, 60, 30, C.accent); text(g, 'Pesquisar', W - 180, 171, { size: 19, w: 600, color: '#fff', align: 'center' });
    text(g, 'ASSUNTOS', 262, 236, { size: 15, w: 600, color: C.dim });
    let x = 380; ['Contratos', 'Licitações', 'Ofícios', 'Protocolos', 'Recursos Humanos', 'Finanças'].forEach((a, i) => { g.font = `500 17px ${SANS}`; const tw = g.measureText(a).width + 34; const on = i === 0 && s.subject > 0;
      rect(g, x, 218, tw, 36, 18, on ? C.accent : '#fff', on ? null : '#d6dde7'); text(g, a, x + 17, 237, { size: 17, w: 500, color: on ? '#fff' : C.text }); x += tw + 10; });
    rect(g, 262, 278, W - 290, H - 308, 12, C.panel, C.line);
    if (s.results > 0) text(g, `${RESULTS.length} documentos encontrados · Assunto: Contratos`, 290, 312, { size: 16, w: 500, color: C.dim });
    RESULTS.forEach((r, i) => { const a = easeOutCubic(range(s.results, i * 0.15, i * 0.15 + 0.5)); if (a <= 0) return; g.globalAlpha = a;
      const y = 342 + i * 124 + (1 - a) * 18; const sel = i === 0 && s.select > 0;
      if (sel) { rect(g, 274, y - 8, W - 314, 112, 10, `rgba(232,241,252,${s.select})`); g.fillStyle = C.accent; g.fillRect(274, y - 8, 4, 112); }
      thumb(g, r[4], 296, y + 2, 64); text(g, r[0], 384, y + 24, { size: 22, w: 600 }); text(g, r[1], 384, y + 56, { size: 17, color: C.dim });
      rect(g, 384, y + 74, 120, 26, 13, C.sel); text(g, r[2], 444, y + 88, { size: 14, w: 600, color: C.accent, align: 'center' }); text(g, r[3], 520, y + 88, { size: 15, color: C.dim });
      g.fillStyle = C.line; g.fillRect(290, y + 112, W - 346, 1); g.globalAlpha = 1; });
  } else {
    const a = easeOutCubic(range(s.open, 0.5, 1)); g.globalAlpha = a;
    text(g, 'Assunto: Contratos · Secretaria Municipal de Administração · 14/03/2023', 262, 150, { size: 17, color: C.dim });
    const vw = W - 262 - 520; rect(g, 262, 180, vw, H - 210, 12, '#e4e8ee', C.line); const ph = H - 250, pw = ph / 1.414; thumb(g, 3, 262 + (vw - pw) / 2, 200, pw);
    const rx = W - 494, rw = 464; rect(g, rx, 180, rw, H - 210, 12, C.panel, C.line); text(g, 'INFORMAÇÕES', rx + 32, 216, { size: 15, w: 600, color: C.dim });
    [['Número', '2023/004518'], ['Assunto', 'Contratos'], ['Tipo documental', 'Processo administrativo'], ['Setor', 'Sec. de Administração'], ['Páginas', '146']].forEach(([k, v], i) => { text(g, k, rx + 32, 262 + i * 76, { size: 15, color: C.dim }); text(g, v, rx + 32, 290 + i * 76, { size: 20, w: 600 }); });
    rect(g, rx + 32, H - 120, rw - 64, 58, 29, '#eef8f2'); check(g, rx + 66, H - 91); text(g, 'Documento localizado', rx + 88, H - 90, { size: 19, w: 600, color: C.ok });
    g.globalAlpha = 1;
  }
  if (s.cursor) cursor(g, s.cursor[0], s.cursor[1]);
}
