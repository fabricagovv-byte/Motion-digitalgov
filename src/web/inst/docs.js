// Documentos (texto real e legível, dados fictícios e genéricos) e telas ilustrativas do sistema.
// Nenhuma tela reproduz produto existente; funções exibidas = apenas as citadas no roteiro
// (digitalização, indexação, pesquisa, visualização, histórico, encaminhamento entre setores, acesso por permissão).
import * as THREE from 'three';
import { roundRect, clamp, range, smooth, easeOutCubic, rng } from '../core.js';
import { canvasTex } from '../textures.js';

const SERIF = '"Liberation Serif", "DejaVu Serif", serif';
const SANS = '"Inter", sans-serif';
const SANS_D = '"Inter Display", "Inter", sans-serif';

// ------------------------------------------------------------------ Conteúdo dos documentos
export const DOCS = [
  { kind: 'contrato', title: 'CONTRATO Nº 0152/2023', sub: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS',
    body: [['', 'Pelo presente instrumento, o MUNICÍPIO, por intermédio da Secretaria Municipal de Administração, doravante denominado CONTRATANTE, e a empresa qualificada no processo administrativo nº 2023/004518, doravante denominada CONTRATADA, resolvem celebrar o presente contrato, mediante as cláusulas e condições a seguir.'],
      ['CLÁUSULA PRIMEIRA – DO OBJETO', 'O presente contrato tem por objeto a prestação de serviços de limpeza e conservação predial, conforme especificações constantes do termo de referência, que integra este instrumento independentemente de transcrição.'],
      ['CLÁUSULA SEGUNDA – DA VIGÊNCIA', 'O prazo de vigência deste contrato será de doze meses, contados a partir da data de sua assinatura, podendo ser prorrogado nos termos da legislação vigente.'],
      ['CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES', 'Compete à CONTRATADA executar os serviços com zelo e diligência, observando as normas técnicas aplicáveis e as orientações da fiscalização do contrato.']], sign: true },
  { kind: 'oficio', title: 'OFÍCIO Nº 087/2023 – SEMAD', sub: 'Assunto: Encaminhamento de documentação',
    body: [['', 'Senhor Secretário,'], ['', 'Encaminhamos a Vossa Senhoria a documentação referente ao processo de regularização dos arquivos do setor de protocolo, para conhecimento e providências que julgar cabíveis.'],
      ['', 'Informamos que os documentos foram conferidos e organizados por tipo documental e por ano, de modo a facilitar a sua consulta pelos setores interessados.'], ['', 'Sem mais para o momento, renovamos votos de estima e consideração.']], sign: true },
  { kind: 'memorando', title: 'MEMORANDO Nº 214/2022', sub: 'De: Departamento de Recursos Humanos   Para: Setor de Protocolo',
    body: [['', 'Solicitamos o envio das pastas funcionais relacionadas no anexo, para fins de atualização cadastral e conferência de documentos.'],
      ['', 'Após a análise, as pastas serão devolvidas ao arquivo setorial devidamente organizadas, com a respectiva relação de documentos.'], ['', 'Atenciosamente,']], sign: true },
  { kind: 'processo', title: 'PROCESSO ADMINISTRATIVO', sub: 'Nº 2023/004518',
    fields: [['Interessado', 'Secretaria Municipal de Administração'], ['Assunto', 'Contratação de serviços de limpeza e conservação predial'], ['Data de abertura', '14/03/2023'], ['Volume', '01'], ['Folhas', '001 a 146']] },
  { kind: 'requerimento', title: 'REQUERIMENTO', sub: 'Protocolo nº 2022/019733',
    body: [['', 'Ilustríssimo Senhor Secretário Municipal de Administração,'], ['', 'O requerente abaixo assinado, servidor público municipal, vem respeitosamente requerer a emissão de certidão de tempo de serviço, para fins de comprovação junto ao órgão competente.'],
      ['', 'Nestes termos, pede deferimento.']], sign: true },
];

function wrapLines(g, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = [];
  for (const w of words) { const t = [...cur, w].join(' '); if (g.measureText(t).width > maxW && cur.length) { lines.push(cur); cur = [w]; } else cur.push(w); }
  if (cur.length) lines.push(cur); return lines;
}
function justify(g, words, x, y, w, last) {
  if (last || words.length < 2) { g.fillText(words.join(' '), x, y); return; }
  const ww = words.reduce((a, s) => a + g.measureText(s).width, 0); const gap = (w - ww) / (words.length - 1); let cx = x;
  for (const s of words) { g.fillText(s, cx, y); cx += g.measureText(s).width + gap; }
}

// Desenha a página de um documento em (W x H). opts: { aged, stamp, page }
export function drawDoc(g, W, H, doc, { aged = 0.3, seed = 1, scan = false } = {}) {
  const R = rng(seed); const s = W / 1000;
  g.fillStyle = scan ? '#fbfbf9' : `rgb(${248 - aged * 14},${245 - aged * 18},${236 - aged * 30})`; g.fillRect(0, 0, W, H);
  if (!scan && aged > 0) { const v = g.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.85); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(120,95,50,${0.16 * aged})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }
  const ink = scan ? '#1d1f23' : '#2a2c31'; g.fillStyle = ink; g.textBaseline = 'alphabetic';
  // Cabeçalho institucional genérico
  g.strokeStyle = ink; g.lineWidth = 2 * s; g.beginPath(); g.arc(W / 2, 92 * s, 34 * s, 0, 7); g.stroke();
  g.beginPath(); g.arc(W / 2, 92 * s, 24 * s, 0, 7); g.stroke();
  g.textAlign = 'center'; g.font = `700 ${26 * s}px ${SERIF}`; g.fillText('PREFEITURA MUNICIPAL', W / 2, 160 * s);
  g.font = `400 ${22 * s}px ${SERIF}`; g.fillText('Secretaria Municipal de Administração', W / 2, 190 * s);
  g.fillRect(90 * s, 210 * s, W - 180 * s, 1.5 * s);
  let y = 270 * s; const x0 = 100 * s, tw = W - 200 * s;
  g.font = `700 ${30 * s}px ${SERIF}`; g.fillText(doc.title, W / 2, y); y += 40 * s;
  if (doc.sub) { g.font = `${doc.kind === 'contrato' ? 700 : 400} ${22 * s}px ${SERIF}`; g.fillText(doc.sub, W / 2, y); y += 56 * s; }
  g.textAlign = 'left';
  if (doc.fields) {
    y += 30 * s;
    for (const [k, v] of doc.fields) { g.strokeStyle = 'rgba(40,40,45,.5)'; g.lineWidth = 1.5 * s; g.strokeRect(x0, y - 38 * s, tw, 70 * s);
      g.font = `700 ${21 * s}px ${SERIF}`; g.fillText(k + ':', x0 + 18 * s, y + 6 * s); g.font = `400 ${23 * s}px ${SERIF}`;
      const lines = wrapLines(g, v, tw - 250 * s); g.fillText(lines[0].join(' '), x0 + 230 * s, y + 6 * s); y += 84 * s; }
    g.font = `400 ${20 * s}px ${SERIF}`; g.fillText('Autuado em 14/03/2023 pelo Setor de Protocolo.', x0, y + 60 * s);
  } else {
    for (const [hd, para] of doc.body) {
      if (hd) { g.font = `700 ${21 * s}px ${SERIF}`; g.fillText(hd, x0, y); y += 34 * s; }
      g.font = `400 ${21 * s}px ${SERIF}`;
      const lines = wrapLines(g, para, tw - (hd ? 0 : 0));
      lines.forEach((l, i) => { justify(g, l, x0 + (i === 0 && !hd && para.length > 60 ? 40 * s : 0), y, tw - (i === 0 && !hd && para.length > 60 ? 40 * s : 0), i === lines.length - 1); y += 31 * s; });
      y += 18 * s;
    }
  }
  if (doc.sign) {
    y = Math.max(y + 40 * s, H - 280 * s); g.textAlign = 'center';
    g.font = `400 ${20 * s}px ${SERIF}`; g.fillText('Município, 14 de março de 2023.', W / 2, y);
    g.strokeStyle = 'rgba(25,45,120,.85)'; g.lineWidth = 2.4 * s; g.beginPath(); let sx = W / 2 - 110 * s, sy = y + 70 * s; g.moveTo(sx, sy);
    for (let i = 0; i < 14; i++) { sx += 16 * s; g.lineTo(sx, sy + Math.sin(i * 1.9 + seed) * 16 * s - (i % 4 === 0 ? 10 * s : 0)); } g.stroke();
    g.fillStyle = ink; g.fillRect(W / 2 - 170 * s, y + 92 * s, 340 * s, 1.5 * s);
    g.font = `400 ${19 * s}px ${SERIF}`; g.fillText('Secretário Municipal de Administração', W / 2, y + 120 * s); g.textAlign = 'left';
  }
  // rodapé + numeração de folha (carimbo de protocolo)
  g.fillStyle = 'rgba(40,40,45,.55)'; g.font = `400 ${16 * s}px ${SERIF}`; g.textAlign = 'center'; g.fillText('Centro Administrativo Municipal', W / 2, H - 50 * s); g.textAlign = 'left';
  if (!scan && R() > 0.3) { g.save(); g.translate(W - 170 * s, 110 * s); g.rotate(-0.12); g.strokeStyle = 'rgba(40,70,160,.55)'; g.lineWidth = 2 * s; g.strokeRect(-70 * s, -36 * s, 140 * s, 72 * s);
    g.fillStyle = 'rgba(40,70,160,.6)'; g.font = `700 ${15 * s}px ${SANS}`; g.textAlign = 'center'; g.fillText('PROTOCOLO', 0, -10 * s); g.font = `500 ${15 * s}px ${SANS}`; g.fillText('Fls. ' + String(12 + Math.floor(R() * 120)).padStart(3, '0'), 0, 16 * s); g.restore(); }
  if (!scan && aged > 0) { // grampo (antes da preparação) e leves marcas
    g.fillStyle = `rgba(120,95,60,${0.08 * aged})`; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(R() * W, R() * H, (10 + R() * 50) * s, 0, 7); g.fill(); } }
}

const _docCache = new Map();
export function docTexture(i, { res = 1024, aged = 0.35, scan = false } = {}) {
  const key = `${i}|${res}|${aged}|${scan}`; if (_docCache.has(key)) return _docCache.get(key);
  const W = res, H = Math.round(res * 1.414);
  const t = canvasTex(W, H, (g) => drawDoc(g, W, H, DOCS[i % DOCS.length], { aged, seed: i + 1, scan }));
  t.anisotropy = 16; _docCache.set(key, t); return t;
}
// Imagem do documento (canvas) para usar dentro das telas.
const _docImg = new Map();
export function docImage(i, res = 700) {
  const key = `${i}|${res}`; if (_docImg.has(key)) return _docImg.get(key);
  const c = document.createElement('canvas'); c.width = res; c.height = Math.round(res * 1.414); drawDoc(c.getContext('2d'), c.width, c.height, DOCS[i % DOCS.length], { scan: true, seed: i + 1 });
  _docImg.set(key, c); return c;
}

// Etiqueta de caixa-arquivo
export function boxLabelTexture(l, seed) {
  return canvasTex(256, 200, (g, w, h) => {
    g.fillStyle = '#f7f5ef'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1f3c6e'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#1f3c6e'; g.fillRect(6, 6, w - 12, 44); g.fillStyle = '#fff'; g.font = `700 26px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(l.code, w / 2, 29);
    g.fillStyle = '#20242b'; g.font = `600 ${l.title.length > 12 ? 21 : 25}px ${SANS}`; g.fillText(l.title, w / 2, 84);
    g.font = `700 36px ${SANS}`; g.fillText(l.year, w / 2, 128);
    const R = rng(seed); let x = 48; g.fillStyle = '#20242b'; while (x < w - 48) { const bw = 1 + Math.floor(R() * 4); g.fillRect(x, 158, bw, 26); x += bw + 1 + Math.floor(R() * 3); }
  });
}

// ------------------------------------------------------------------ Telas (tema claro, sóbrio)
const C = { bg: '#f3f5f8', panel: '#ffffff', line: '#e1e6ee', text: '#1d2633', dim: '#6b7788', nav: '#16325c', accent: '#1f6fd1', ok: '#1f9d6b', warn: '#c98a1a', sel: '#e8f1fc' };
function text(g, s, x, y, { size = 22, w = 400, color = C.text, align = 'left', font = SANS } = {}) { g.font = `${w} ${size}px ${font}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); g.textAlign = 'left'; }
function rect(g, x, y, w, h, r, fill, stroke) { roundRect(g, x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = 2; g.stroke(); } }
function cursor(g, x, y) { g.save(); g.translate(x, y); g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 30); g.lineTo(8, 23); g.lineTo(14, 36); g.lineTo(19, 34); g.lineTo(13, 21); g.lineTo(23, 21); g.closePath(); g.fill(); g.stroke(); g.restore(); }
function docThumb(g, i, x, y, w, alpha = 1) { const img = docImage(i, 700); g.globalAlpha = alpha; g.drawImage(img, x, y, w, w * 1.414); g.strokeStyle = C.line; g.lineWidth = 1.5; g.strokeRect(x, y, w, w * 1.414); g.globalAlpha = 1; }

function chrome(g, W, H, active, title) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  g.fillStyle = C.nav; g.fillRect(0, 0, W, 72);
  rect(g, 24, 18, 36, 36, 8, '#ffffff22'); text(g, 'GED', 42, 37, { size: 15, w: 700, color: '#fff', align: 'center' });
  text(g, 'Gestão Eletrônica de Documentos', 76, 37, { size: 22, w: 600, color: '#fff' });
  rect(g, W - 500, 20, 210, 32, 16, '#ffffff1f'); text(g, 'Ambiente demonstrativo', W - 395, 37, { size: 15, w: 500, color: '#cfe0f7', align: 'center' });
  g.fillStyle = '#ffffff33'; g.beginPath(); g.arc(W - 60, 36, 20, 0, 7); g.fill(); text(g, 'MS', W - 60, 37, { size: 15, w: 600, color: '#fff', align: 'center' });
  text(g, 'Setor de Protocolo', W - 96, 37, { size: 16, w: 500, color: '#cfe0f7', align: 'right' });
  // menu lateral
  g.fillStyle = C.panel; g.fillRect(0, 72, 230, H - 72); g.fillStyle = C.line; g.fillRect(229, 72, 1, H - 72);
  ['Pesquisar', 'Documentos', 'Captura', 'Indexação', 'Tramitação'].forEach((m, i) => { const y = 110 + i * 56; const on = m === active;
    if (on) { rect(g, 12, y - 22, 206, 44, 8, C.sel); g.fillStyle = C.accent; g.fillRect(12, y - 22, 4, 44); }
    g.fillStyle = on ? C.accent : '#9aa6b6'; roundRect(g, 32, y - 9, 18, 18, 4); g.fill();
    text(g, m, 64, y, { size: 19, w: on ? 600 : 500, color: on ? C.accent : C.text }); });
  text(g, title, 262, 112, { size: 28, w: 600, font: SANS_D });
}

// Tela de captura: páginas surgindo à medida que o scanner digitaliza.
export function drawCapture(g, W, H, s) {
  chrome(g, W, H, 'Captura', 'Captura de documentos · Lote 0147');
  const n = Math.floor(s.pages); text(g, `Processo administrativo nº 2023/004518`, 262, 150, { size: 18, color: C.dim });
  // miniaturas
  rect(g, 262, 180, 560, H - 210, 12, C.panel, C.line); text(g, 'PÁGINAS DIGITALIZADAS', 286, 212, { size: 15, w: 600, color: C.dim });
  const tw = 96, cols = 5;
  for (let i = 0; i < Math.min(n, 15); i++) { const c = i % cols, r = Math.floor(i / cols); const a = smooth(clamp(s.pages - i)); docThumb(g, i % 5, 286 + c * 104, 236 + r * 150, tw, a);
    text(g, String(i + 1).padStart(3, '0'), 286 + c * 104 + tw / 2, 236 + r * 150 + 146, { size: 12, color: C.dim, align: 'center' }); }
  // pré-visualização grande
  const px = 846, pw = W - px - 340; rect(g, px, 180, pw, H - 210, 12, '#e9edf2', C.line);
  const cur = Math.max(0, n - 1) % 5; const ph = H - 250, pwid = ph / 1.414;
  if (n > 0) { const a = smooth(clamp((s.pages - n) * 3)); docThumb(g, cur, px + (pw - pwid) / 2, 200, pwid, 1); if (s.scanLine != null) { g.fillStyle = 'rgba(31,111,209,.18)'; g.fillRect(px + (pw - pwid) / 2, 200 + ph * s.scanLine, pwid, ph * (1 - s.scanLine)); } }
  // painel de lote
  const rx = W - 316; rect(g, rx, 180, 290, H - 210, 12, C.panel, C.line); text(g, 'LOTE 0147', rx + 24, 214, { size: 15, w: 600, color: C.dim });
  [['Páginas', String(n)], ['Origem', 'Caixa ADM-139'], ['Tipo', 'Processo'], ['Status', s.done ? 'Concluído' : 'Digitalizando…']].forEach(([k, v], i) => {
    text(g, k, rx + 24, 262 + i * 70, { size: 15, color: C.dim }); text(g, v, rx + 24, 290 + i * 70, { size: 21, w: 600, color: k === 'Status' ? (s.done ? C.ok : C.accent) : C.text }); });
  const pr = clamp(s.pages / 15); rect(g, rx + 24, 560, 242, 10, 5, '#e3e8ef'); rect(g, rx + 24, 560, Math.max(10, 242 * pr), 10, 5, C.accent);
}

// Tela de indexação: campos preenchidos um a um ao lado da imagem do documento.
export const INDEX_FIELDS = [['Número do processo', '2023/004518'], ['Data', '14/03/2023'], ['Tipo documental', 'Contrato'], ['Setor responsável', 'Secretaria Municipal de Administração'], ['Palavras-chave', 'contrato · prestação de serviços · limpeza']];
export function drawIndex(g, W, H, s) {
  chrome(g, W, H, 'Indexação', 'Indexação de documentos');
  text(g, 'Contrato nº 0152/2023 · Lote 0147 · página 1', 262, 150, { size: 18, color: C.dim });
  const ph = H - 220, pw = ph / 1.414; rect(g, 262, 180, pw + 40, ph + 20, 12, '#e9edf2', C.line); docThumb(g, 0, 282, 190, pw);
  // destaque da área lida
  const fx = 262 + pw + 80, fw = W - fx - 40; rect(g, fx, 180, fw, H - 210, 12, C.panel, C.line);
  text(g, 'DADOS DE IDENTIFICAÇÃO', fx + 30, 222, { size: 15, w: 600, color: C.dim });
  INDEX_FIELDS.forEach(([k, v], i) => {
    const y = 270 + i * 112; const p = clamp(s.fields - i); const n = Math.round(p * v.length); const active = p > 0 && p < 1;
    text(g, k, fx + 30, y, { size: 17, w: 600, color: C.text });
    rect(g, fx + 30, y + 18, fw - 60, 54, 8, '#fff', active ? C.accent : '#cfd7e2'); if (active) { g.strokeStyle = 'rgba(31,111,209,.25)'; g.lineWidth = 6; roundRect(g, fx + 28, y + 16, fw - 56, 58, 9); g.stroke(); }
    if (i === 4 && n > 0) { // palavras-chave como etiquetas
      const tags = v.split(' · '); let x = fx + 42; let left = n;
      tags.forEach((tg) => { if (left <= 0) return; const part = tg.slice(0, left); left -= tg.length + 3; g.font = `500 17px ${SANS}`; const tw = g.measureText(part).width + 28; rect(g, x, y + 30, tw, 30, 15, C.sel); text(g, part, x + 14, y + 46, { size: 17, w: 500, color: C.accent }); x += tw + 10; });
    } else text(g, v.slice(0, n), fx + 46, y + 46, { size: 20, w: 500 });
    if (active && Math.floor(s.blink * 2.4) % 2 === 0 && i !== 4) { g.font = `500 20px ${SANS}`; g.fillStyle = C.accent; g.fillRect(fx + 48 + g.measureText(v.slice(0, n)).width, y + 32, 2, 28); }
    if (p >= 1) { g.fillStyle = C.ok; g.beginPath(); g.arc(fx + fw - 58, y + 45, 11, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(fx + fw - 64, y + 45); g.lineTo(fx + fw - 59, y + 50); g.lineTo(fx + fw - 52, y + 40); g.stroke(); }
  });
  const by = H - 110; rect(g, fx + fw - 280, by, 250, 56, 10, s.saved > 0 ? C.ok : C.accent); text(g, s.saved > 0 ? 'Indexado ✓' : 'Salvar indexação', fx + fw - 155, by + 29, { size: 19, w: 600, color: '#fff', align: 'center' });
  if (s.cursor) cursor(g, s.cursor[0], s.cursor[1]);
}

// Pesquisa + lista de resultados + documento aberto.
const RESULTS = [
  ['Contrato nº 0152/2023', 'Prestação de serviços de limpeza e conservação predial', 'Contrato', '14/03/2023', 'Sec. de Administração'],
  ['Aditivo ao Contrato nº 0152/2023', 'Prorrogação de vigência', 'Termo aditivo', '11/03/2024', 'Sec. de Administração'],
  ['Processo administrativo nº 2023/004518', 'Contratação de serviços de limpeza', 'Processo', '14/03/2023', 'Setor de Protocolo'],
  ['Ofício nº 087/2023 – SEMAD', 'Encaminhamento de documentação', 'Ofício', '22/05/2023', 'Sec. de Administração'],
];
export function drawSearch(g, W, H, s) {
  chrome(g, W, H, 'Pesquisar', 'Pesquisar documentos');
  const q = s.query || 'contrato 0152/2023'; const n = Math.round(clamp(s.type) * q.length);
  rect(g, 262, 140, W - 560, 60, 30, '#fff', s.type > 0 && s.type < 1.1 ? C.accent : '#cfd7e2');
  g.strokeStyle = C.dim; g.lineWidth = 3; g.beginPath(); g.arc(298, 168, 10, 0, 7); g.stroke(); g.beginPath(); g.moveTo(305, 176); g.lineTo(314, 185); g.stroke();
  if (n) text(g, q.slice(0, n), 330, 170, { size: 21 }); else text(g, 'Pesquisar por número, tipo, setor ou palavra-chave', 330, 170, { size: 20, color: '#98a3b3' });
  if (s.type > 0 && s.type < 1.1 && Math.floor(s.blink * 2.4) % 2 === 0) { g.font = `400 21px ${SANS}`; g.fillStyle = C.accent; g.fillRect(332 + g.measureText(q.slice(0, n)).width, 154, 2, 30); }
  rect(g, W - 280, 140, 200, 60, 30, C.accent); text(g, 'Pesquisar', W - 180, 171, { size: 19, w: 600, color: '#fff', align: 'center' });
  ['Tipo documental', 'Setor', 'Período'].forEach((f, i) => { rect(g, 262 + i * 200, 222, 186, 40, 20, '#fff', '#d6dde7'); text(g, f + '  ▾', 282 + i * 200, 243, { size: 16, color: C.dim }); });
  const open = s.open || 0; const listW = open > 0 ? lerpN(W - 290, 640, easeOutCubic(open)) : W - 290;
  rect(g, 262, 286, listW, H - 316, 12, C.panel, C.line);
  if (s.results > 0) text(g, `${RESULTS.length} documentos encontrados`, 290, 320, { size: 16, w: 500, color: C.dim });
  RESULTS.forEach((r, i) => {
    const a = easeOutCubic(range(s.results, i * 0.15, i * 0.15 + 0.5)); if (a <= 0) return; g.globalAlpha = a;
    const y = 350 + i * 112 + (1 - a) * 18; const sel = i === 0 && s.select > 0;
    if (sel) { rect(g, 274, y - 6, listW - 24, 100, 10, `rgba(232,241,252,${s.select})`); g.fillStyle = C.accent; g.globalAlpha = a * s.select; g.fillRect(274, y - 6, 4, 100); g.globalAlpha = a; }
    docThumb(g, [0, 0, 3, 1][i], 296, y + 4, 56);
    text(g, r[0], 372, y + 22, { size: 21, w: 600 }); text(g, r[1], 372, y + 52, { size: 17, color: C.dim });
    if (listW > 1000) { rect(g, 960, y + 8, 140, 30, 15, '#eef2f7'); text(g, r[2], 1030, y + 24, { size: 15, w: 500, color: C.text, align: 'center' }); text(g, r[3], 1140, y + 24, { size: 17, color: C.dim }); text(g, r[4], 1290, y + 24, { size: 17, color: C.dim }); }
    else text(g, `${r[2]} · ${r[3]}`, 372, y + 78, { size: 15, color: C.dim });
    g.fillStyle = C.line; g.fillRect(290, y + 100, listW - 56, 1); g.globalAlpha = 1;
  });
  if (open > 0) { // visualizador
    const vx = 262 + listW + 24, vw = W - vx - 30; g.globalAlpha = smooth(open * 1.5);
    rect(g, vx, 286, vw, H - 316, 12, '#e9edf2', C.line); const ph = H - 380, pw = ph / 1.414; docThumb(g, 0, vx + (vw - pw) / 2, 318, pw); g.globalAlpha = 1; }
  if (s.cursor) cursor(g, s.cursor[0], s.cursor[1]);
}
const lerpN = (a, b, t) => a + (b - a) * t;

// GED: visualizador + histórico + encaminhamento entre setores.
const HIST = [['Documento digitalizado', 'Lote 0147 · Setor de Protocolo', '14/03/2023 09:12'], ['Indexação concluída', 'Setor de Protocolo', '14/03/2023 10:40'], ['Consultado', 'Secretaria de Administração', '02/04/2024 15:03'], ['Consultado', 'Setor de Protocolo', 'hoje 09:41']];
export function drawGed(g, W, H, s) {
  chrome(g, W, H, 'Documentos', 'Contrato nº 0152/2023');
  text(g, 'Contrato · 14/03/2023 · Secretaria Municipal de Administração · 4 páginas', 262, 150, { size: 17, color: C.dim });
  // toolbar
  [['Baixar', 0], ['Imprimir', 1], ['Encaminhar', 2]].forEach(([b, i]) => { const x = W - 560 + i * 176; const prim = b === 'Encaminhar';
    rect(g, x, 128, 160, 46, 10, prim ? (s.press > 0 ? '#1858a8' : C.accent) : '#fff', prim ? null : '#cfd7e2'); text(g, b, x + 80, 152, { size: 17, w: 600, color: prim ? '#fff' : C.text, align: 'center' }); });
  const vw = W - 262 - 520; rect(g, 262, 196, vw, H - 226, 12, '#e4e8ee', C.line);
  const ph = H - 270, pw = ph / 1.414; docThumb(g, 0, 262 + (vw - pw) / 2, 218, pw);
  text(g, 'Página 1 de 4', 262 + vw / 2, H - 46, { size: 14, color: C.dim, align: 'center' });
  // painel lateral: informações / histórico
  const rx = W - 494, rw = 464; rect(g, rx, 196, rw, H - 226, 12, C.panel, C.line);
  const tab = s.history > 0.5 ? 1 : 0;
  ['Informações', 'Histórico'].forEach((t, i) => { text(g, t, rx + 40 + i * 170, 232, { size: 18, w: 600, color: i === tab ? C.accent : C.dim }); if (i === tab) { g.fillStyle = C.accent; g.font = `600 18px ${SANS}`; g.fillRect(rx + 40 + i * 170, 250, g.measureText(t).width, 3); } });
  g.fillStyle = C.line; g.fillRect(rx + 20, 256, rw - 40, 1);
  if (tab === 0) INDEX_FIELDS.forEach(([k, v], i) => { text(g, k, rx + 32, 296 + i * 74, { size: 15, color: C.dim }); text(g, v.length > 30 ? v.slice(0, 29) + '…' : v, rx + 32, 322 + i * 74, { size: 19, w: 500 }); });
  else {
    const n = HIST.length + (s.sent > 0 ? 1 : 0); const items = s.sent > 0 ? [['Encaminhado', 'Para: Secretaria de Finanças', 'agora'], ...HIST.slice().reverse()] : HIST.slice().reverse();
    items.forEach(([a, b, c], i) => { const ap = i === 0 && s.sent > 0 ? smooth(s.sent * 2) : smooth(range(s.history, 0.5 + i * 0.08, 0.7 + i * 0.08)); g.globalAlpha = ap;
      const y = 300 + i * 96; g.fillStyle = i === 0 && s.sent > 0 ? C.ok : C.accent; g.beginPath(); g.arc(rx + 40, y, 8, 0, 7); g.fill(); if (i < items.length - 1) { g.fillStyle = C.line; g.fillRect(rx + 39, y + 12, 2, 76); }
      text(g, a, rx + 64, y, { size: 18, w: 600 }); text(g, b, rx + 64, y + 26, { size: 15, color: C.dim }); text(g, c, rx + 64, y + 50, { size: 14, color: '#98a3b3' }); g.globalAlpha = 1; });
  }
  // diálogo de encaminhamento
  if (s.dialog > 0) {
    const a = easeOutCubic(s.dialog) * (1 - smooth(range(s.sent, 0, 0.4))); if (a > 0.01) {
      g.fillStyle = `rgba(15,25,40,${0.35 * a})`; g.fillRect(0, 0, W, H); g.globalAlpha = a;
      const dw = 640, dh = 420, dx = (W - dw) / 2, dy = (H - dh) / 2 + (1 - a) * 30; rect(g, dx, dy, dw, dh, 16, '#fff');
      text(g, 'Encaminhar processo', dx + 36, dy + 50, { size: 25, w: 600, font: SANS_D });
      text(g, 'Setor de destino', dx + 36, dy + 106, { size: 16, w: 600 }); rect(g, dx + 36, dy + 124, dw - 72, 52, 8, '#fff', C.accent);
      const dest = 'Secretaria de Finanças'; text(g, dest.slice(0, Math.round(clamp(s.pick) * dest.length)), dx + 54, dy + 151, { size: 19 }); text(g, '▾', dx + dw - 60, dy + 151, { size: 18, color: C.dim });
      text(g, 'Despacho', dx + 36, dy + 214, { size: 16, w: 600 }); rect(g, dx + 36, dy + 232, dw - 72, 80, 8, '#fff', '#cfd7e2');
      const msg = 'Para análise e providências.'; text(g, msg.slice(0, Math.round(clamp(s.note) * msg.length)), dx + 54, dy + 262, { size: 18 });
      rect(g, dx + dw - 220, dy + dh - 80, 184, 50, 10, s.press > 0 ? '#1858a8' : C.accent); text(g, 'Encaminhar', dx + dw - 128, dy + dh - 54, { size: 18, w: 600, color: '#fff', align: 'center' });
      rect(g, dx + dw - 360, dy + dh - 80, 124, 50, 10, '#fff', '#cfd7e2'); text(g, 'Cancelar', dx + dw - 298, dy + dh - 54, { size: 17, w: 500, align: 'center' }); g.globalAlpha = 1; }
  }
  if (s.sent > 0) { const a = smooth(range(s.sent, 0.2, 0.5)) * (1 - smooth(range(s.sent, 1.6, 2))); g.globalAlpha = a;
    rect(g, W / 2 - 300, H - 130, 600, 64, 12, '#16325c'); g.fillStyle = '#3ecf8e'; g.beginPath(); g.arc(W / 2 - 262, H - 98, 12, 0, 7); g.fill();
    text(g, 'Processo encaminhado à Secretaria de Finanças', W / 2 - 236, H - 97, { size: 18, w: 500, color: '#fff' }); g.globalAlpha = 1; }
  if (s.cursor) cursor(g, s.cursor[0], s.cursor[1]);
}

// Celular (retrato)
export function drawMobile(g, W, H, s) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.fillStyle = C.nav; g.fillRect(0, 0, W, 150);
  text(g, '9:41', 40, 34, { size: 22, w: 600, color: '#fff' }); text(g, 'GED', 40, 104, { size: 34, w: 700, color: '#fff', font: SANS_D }); text(g, 'Documentos', 128, 106, { size: 26, w: 500, color: '#cfe0f7' });
  if (s.view < 0.5) {
    rect(g, 30, 180, W - 60, 64, 32, '#fff', '#d6dde7'); text(g, 'contrato 0152', 80, 213, { size: 22, color: C.text });
    RESULTS.slice(0, 3).forEach((r, i) => { const y = 280 + i * 160; rect(g, 30, y, W - 60, 140, 14, i === 0 ? C.sel : '#fff', '#e1e6ee'); docThumb(g, [0, 0, 3][i], 52, y + 22, 68);
      text(g, r[0].length > 24 ? r[0].slice(0, 23) + '…' : r[0], 140, y + 46, { size: 22, w: 600 }); text(g, `${r[2]} · ${r[3]}`, 140, y + 84, { size: 18, color: C.dim }); });
  } else {
    text(g, 'Contrato nº 0152/2023', 36, 196, { size: 26, w: 600 }); text(g, 'Sec. Mun. de Administração', 36, 232, { size: 19, color: C.dim });
    rect(g, 24, 260, W - 48, H - 400, 12, '#e4e8ee'); const pw = W - 100; docThumb(g, 0, 50, 280, pw);
    rect(g, 24, H - 118, W - 48, 74, 37, '#eaf3ec'); text(g, 'Acesso conforme seu perfil', W / 2, H - 80, { size: 20, w: 600, color: C.ok, align: 'center' });
  }
}

export function screenTexture(W, H) { const t = canvasTex(W, H, () => {}); t.anisotropy = 16; t.minFilter = THREE.LinearMipmapLinearFilter; return t; }
