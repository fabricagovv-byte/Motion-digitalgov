// Cenários: fachada da prefeitura, sala administrativa (bagunçada / organizada), arquivo e central DigitalGov.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng, roundRect, clamp, lerp } from '../core.js';
import { canvasTex, shaftTexture } from '../textures.js';
import { archiveBox, shelfUnit, paperStack, productionScanner, monitor, keyboard, plant, chair, cart } from '../inst/kit.js';
import { docTexture } from '../inst/docs.js';
import { logoTexture } from './toon.js';

const std = (color, roughness = 0.7, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
export function B(w, h, d, mat, x = 0, y = 0, z = 0, r = 0.01, parent = null) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.01, h / 2.01, d / 2.01)) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m;
}
const CY = (r1, r2, h, mat, x = 0, y = 0, z = 0, seg = 24, parent = null) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; };
const PL = (w, h, mat, x, y, z, ry = 0, parent = null) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; if (parent) parent.add(m); return m; };

// ------------------------------------------------------------------ Texturas
function tex(w, h, draw, rep = null) { const t = canvasTex(w, h, draw, rep ? { repeat: true } : {}); if (rep) t.repeat.set(...rep); t.anisotropy = 8; return t; }
export const TEX = {
  wood: (rep = [3, 3], tone = 0) => tex(1024, 1024, (g, w, h) => { const R = rng(11 + tone);
    const base = tone ? [150, 100, 62] : [184, 132, 86];
    for (let y = 0; y < h; y += 64) { let x = -((y / 64) % 3) * 140;
      while (x < w) { const L = 240 + R() * 260; const k = 0.82 + R() * 0.28; g.fillStyle = `rgb(${base[0] * k | 0},${base[1] * k | 0},${base[2] * k | 0})`; g.fillRect(x, y, L, 64);
        g.globalAlpha = 0.12; for (let i = 0; i < 9; i++) { g.fillStyle = R() > 0.5 ? '#000' : '#fff'; g.fillRect(x, y + R() * 64, L, 1 + R() * 2); } g.globalAlpha = 1;
        g.fillStyle = 'rgba(40,24,10,.45)'; g.fillRect(x, y, 2, 64); x += L; }
      g.fillStyle = 'rgba(40,24,10,.5)'; g.fillRect(0, y, w, 2); } }, rep),
  tiles: (a = '#d9d4ca', b = '#c9c2b6', rep = [6, 6], n = 4) => tex(512, 512, (g, w, h) => { const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); }
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } }, rep),
  noise: (col, rep = [4, 2], amt = 0.05) => tex(512, 512, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); const R = rng(3); const id = g.getImageData(0, 0, w, h);
    for (let i = 0; i < id.data.length; i += 4) { const n = (R() - 0.5) * 255 * amt; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; } g.putImageData(id, 0, 0); }, rep),
  pavement: (rep = [8, 8]) => tex(1024, 1024, (g, w, h) => { g.fillStyle = '#ebe5d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#8f8a84';
    for (let y = -200; y < h + 200; y += 256) { g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x / w * Math.PI * 4) * 60); for (let x = w; x >= 0; x -= 8) g.lineTo(x, y + 90 + Math.sin(x / w * Math.PI * 4) * 60); g.fill(); }
    const R = rng(5); g.globalAlpha = 0.25; for (let i = 0; i < 9000; i++) { g.fillStyle = R() > 0.5 ? '#000' : '#fff'; g.fillRect(R() * w, R() * h, 3, 3); } g.globalAlpha = 1; }, rep),
};
export function flagTexture() {
  return tex(700, 490, (g, w, h) => {
    g.fillStyle = '#009c3b'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffdf00'; g.beginPath(); g.moveTo(w * 0.085, h / 2); g.lineTo(w / 2, h * 0.12); g.lineTo(w * 0.915, h / 2); g.lineTo(w / 2, h * 0.88); g.closePath(); g.fill();
    g.fillStyle = '#002776'; g.beginPath(); g.arc(w / 2, h / 2, h * 0.25, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(w / 2, h / 2, h * 0.25, 0, 7); g.clip(); g.strokeStyle = '#fff'; g.lineWidth = h * 0.035; g.beginPath(); g.arc(w / 2 - h * 0.06, h * 1.0, h * 0.55, -Math.PI * 0.82, -Math.PI * 0.27); g.stroke();
    g.fillStyle = '#fff'; const R = rng(2); for (let i = 0; i < 22; i++) { g.beginPath(); g.arc(w / 2 + (R() - 0.5) * h * 0.4, h / 2 + 10 + R() * h * 0.17, 1.5 + R() * 2.5, 0, 7); g.fill(); } g.restore();
  });
}
function signTexture(lines, { bg = '#f6f1e4', fg = '#22324f', w = 1400, h = 220, sizes = [96] } = {}) {
  return tex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((l, i) => { let sz = sizes[i] || sizes[0]; g.font = `700 ${sz}px "Liberation Serif", serif`; const mw = g.measureText(l).width; if (mw > w * 0.92) { sz *= w * 0.92 / mw; g.font = `700 ${sz}px "Liberation Serif", serif`; } g.fillText(l, w / 2, h / (lines.length + 1) * (i + 1)); }); });
}
function clockTexture() { return tex(256, 256, (g, w) => { g.fillStyle = '#fbfaf6'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.strokeStyle = '#2a2a2e'; g.lineWidth = 8; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.lineWidth = i % 3 ? 3 : 6; g.beginPath(); g.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); g.lineTo(128 + Math.sin(a) * 114, 128 - Math.cos(a) * 114); g.stroke(); }
  const hand = (a, L, wd) => { g.lineWidth = wd; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.sin(a) * L, 128 - Math.cos(a) * L); g.stroke(); };
  hand((10 + 10 / 60) / 12 * Math.PI * 2, 60, 8); hand(10 / 60 * Math.PI * 2, 92, 5); g.fillStyle = '#c0392b'; g.beginPath(); g.arc(128, 128, 7, 0, 7); g.fill(); }); }
function corkTexture() { return tex(768, 512, (g, w, h) => { g.fillStyle = '#b88b5a'; g.fillRect(0, 0, w, h); const R = rng(8); g.globalAlpha = 0.35; for (let i = 0; i < 6000; i++) { g.fillStyle = R() > 0.5 ? '#7a5530' : '#d9b07a'; g.fillRect(R() * w, R() * h, 2, 2); } g.globalAlpha = 1;
  const notes = [['#fff8b0', 'REUNIÃO', '9h · Sala 2'], ['#ffffff', 'COMUNICADO', 'Horário de'], ['#cfe8ff', 'PROTOCOLO', 'Senhas 1–80'], ['#ffd6d6', 'URGENTE', 'Processo'], ['#fff', 'ESCALA', 'Plantão'], ['#d8f5d0', 'AVISO', 'Arquivo']];
  notes.forEach(([c, t1, t2], i) => { const x = 40 + (i % 3) * 240 + R() * 20, y = 40 + Math.floor(i / 3) * 230 + R() * 20; g.save(); g.translate(x + 90, y + 90); g.rotate((R() - 0.5) * 0.16); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-86, -82, 180, 180); g.fillStyle = c; g.fillRect(-90, -90, 180, 180);
    g.fillStyle = '#22324f'; g.font = '700 26px Inter'; g.textAlign = 'center'; g.fillText(t1, 0, -40); g.font = '500 20px Inter'; g.fillText(t2, 0, -6); g.fillStyle = 'rgba(40,50,70,.35)'; for (let k = 0; k < 4; k++) g.fillRect(-60, 20 + k * 16, 120 - k * 18, 5);
    g.fillStyle = ['#d33', '#36c', '#2a2'][i % 3]; g.beginPath(); g.arc(0, -78, 9, 0, 7); g.fill(); g.restore(); }); }); }
export function skyTexture(h0 = '#6fb1ec', h1 = '#d6ecfb') { return tex(1024, 512, (g, w, h) => { const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, h0); v.addColorStop(1, h1); g.fillStyle = v; g.fillRect(0, 0, w, h);
  const R = rng(4); for (let c = 0; c < 9; c++) { const cx = R() * w, cy = 60 + R() * 220, s = 40 + R() * 60; for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(255,255,255,${0.55 + R() * 0.35})`; g.beginPath(); g.ellipse(cx + (R() - 0.5) * s * 3, cy + (R() - 0.5) * s * 0.6, s * (0.6 + R() * 0.6), s * (0.4 + R() * 0.3), 0, 0, 7); g.fill(); } } }); }
function windowViewTexture() { return tex(1024, 640, (g, w, h) => { const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, '#8ec5f2'); v.addColorStop(0.7, '#e9f5ff'); g.fillStyle = v; g.fillRect(0, 0, w, h);
  const R = rng(12); g.fillStyle = '#b7c9b0'; g.beginPath(); g.moveTo(0, h * 0.62); for (let x = 0; x <= w; x += 32) g.lineTo(x, h * 0.55 + Math.sin(x * 0.01) * 30 + R() * 10); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  for (let i = 0; i < 7; i++) { const x = R() * w, bw = 90 + R() * 120, bh = 80 + R() * 140; g.fillStyle = ['#f2e8d8', '#e8d6c0', '#f7f1e6'][i % 3]; g.fillRect(x, h * 0.72 - bh, bw, bh + 200); g.fillStyle = '#c8644a'; g.fillRect(x - 6, h * 0.72 - bh - 14, bw + 12, 18); }
  for (let i = 0; i < 10; i++) { const x = R() * w, s = 50 + R() * 70; g.fillStyle = ['#5f9a5a', '#78ad62', '#e8c23a'][i % 3]; g.beginPath(); g.arc(x, h * 0.8 - s * 0.5, s, 0, 7); g.fill(); } }); }
function senhaTexture() { return tex(512, 200, (g, w, h) => { g.fillStyle = '#121418'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff4a3a'; g.font = '700 58px "DejaVu Sans Mono", monospace'; g.textAlign = 'center'; g.fillText('SENHA', w / 2, 74);
  g.font = '700 92px "DejaVu Sans Mono", monospace'; g.fillText('042', w / 2, 166); }); }
// Logo DigitalGov em painel branco (proporção original preservada)
export function logoPanel(width, { pad = 0.12, sub = null, depth = 0.03, radius = 0.04 } = {}) {
  const g = new THREE.Group(); const lw = width - pad * 2, lh = lw * 189 / 588; const ph = lh + pad * 2 + (sub ? width * 0.08 : 0);
  B(width, ph, depth, std(0xffffff, 0.5), 0, 0, -depth / 2, radius, g);
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), new THREE.MeshStandardMaterial({ map: logoTexture(), roughness: 0.5, transparent: true })); logo.position.set(0, ph / 2 - pad - lh / 2, 0.002); g.add(logo);
  if (sub) { const st = tex(1600, 120, (c, w, h) => { c.fillStyle = '#1f5fa8'; c.font = '600 64px "Inter Display", Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sub, w / 2, h / 2); });
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(lw, lw * 120 / 1600), new THREE.MeshStandardMaterial({ map: st, transparent: true, roughness: 0.6 })); sp.position.set(0, -ph / 2 + pad * 0.9 + lw * 0.04, 0.002); g.add(sp); }
  g.userData.h = ph; return g;
}

// ------------------------------------------------------------------ Objetos de escritório
const M = {
  wall: std(0xf1e2c2, 0.92), wallG: std(0xe7eadf, 0.9), wainscot: null, white: std(0xf4f5f6, 0.6), steel: std(0x9aa1ab, 0.4, 0.6), graphite: std(0x2c3038, 0.45, 0.25),
  beige: std(0xd8d0bd, 0.55, 0.15), deskTop: std(0xb88a5c, 0.5), deskDark: std(0x6b4a30, 0.55), fabric: std(0x34405a, 0.9), green: std(0x5a8a5f, 0.8), glass: new THREE.MeshPhysicalMaterial({ color: 0xdfefff, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.18, depthWrite: false }),
};
M.wainscot = new THREE.MeshStandardMaterial({ map: TEX.wood([2, 1], 1), roughness: 0.55 });
const FOLDER_COLS = [0x2f5ea8, 0x3f8a5a, 0xc0392b, 0xe0a82e, 0x7a4fa0, 0x2a8a8a];
export function folderBox(color, { w = 0.08, h = 0.32, d = 0.28, label = true } = {}) {   // pasta AZ em pé
  const g = new THREE.Group(); B(w, h, d, std(color, 0.6), 0, h / 2, 0, 0.006, g);
  if (label) { B(w * 0.7, h * 0.35, 0.002, std(0xf7f5ef, 0.8), 0, h * 0.62, d / 2 + 0.001, 0, g); }
  return g;
}
export function looseStack(n, seed = 1, { w = 0.24, d = 0.32 } = {}) {   // pilha de pastas deitadas e papéis
  const g = new THREE.Group(); const R = rng(seed); let y = 0;
  for (let i = 0; i < n; i++) { const kind = R(); const th = kind < 0.5 ? 0.02 + R() * 0.03 : 0.035 + R() * 0.05;
    const col = kind < 0.35 ? 0xf3f0e8 : FOLDER_COLS[Math.floor(R() * FOLDER_COLS.length)];
    const m = B(w + (R() - 0.5) * 0.03, th, d + (R() - 0.5) * 0.03, std(col, kind < 0.35 ? 0.85 : 0.6), (R() - 0.5) * 0.04, y + th / 2, (R() - 0.5) * 0.04, 0.004, g); m.rotation.y = (R() - 0.5) * 0.25;
    if (kind >= 0.35 && R() > 0.4) { const p = B(w * 0.9, 0.006, d * 0.85, std(0xf6f3ea, 0.85), (R() - 0.5) * 0.05, y + th + 0.003, (R() - 0.5) * 0.06, 0.002, g); p.rotation.y = (R() - 0.5) * 0.5; }
    y += th; }
  g.userData.h = y; return g;
}
export function desk(w = 1.5, d = 0.75, top = M.deskTop) {
  const g = new THREE.Group(); const h = 0.74;
  B(w, 0.04, d, top, 0, h - 0.02, 0, 0.01, g);
  B(0.42, h - 0.04, d - 0.06, M.deskDark, w / 2 - 0.23, (h - 0.04) / 2, 0, 0.01, g);
  for (let i = 0; i < 3; i++) { B(0.38, 0.19, 0.01, top, w / 2 - 0.23, 0.12 + i * 0.22, d / 2 - 0.025, 0.004, g); B(0.1, 0.015, 0.02, M.steel, w / 2 - 0.23, 0.17 + i * 0.22, d / 2 - 0.01, 0.004, g); }
  B(0.04, h - 0.04, d - 0.06, M.deskDark, -w / 2 + 0.03, (h - 0.04) / 2, 0, 0.005, g);
  B(w - 0.5, 0.4, 0.02, M.deskDark, -0.2, h - 0.25, -d / 2 + 0.04, 0.004, g);
  g.userData.top = h; return g;
}
export function filingCabinet(open = 0) {
  const g = new THREE.Group(); B(0.5, 1.32, 0.62, M.beige, 0, 0.66, 0, 0.01, g); const drawers = [];
  for (let i = 0; i < 4; i++) { const dr = new THREE.Group(); dr.position.set(0, 0.17 + i * 0.32, 0.31); g.add(dr);
    B(0.46, 0.29, 0.02, M.beige, 0, 0, 0.0, 0.006, dr); B(0.14, 0.025, 0.03, M.steel, 0, 0.06, 0.02, 0.008, dr); B(0.08, 0.04, 0.003, std(0xf7f5ef, 0.8), 0, 0.1, 0.012, 0, dr);
    const inner = new THREE.Group(); dr.add(inner); B(0.44, 0.22, 0.55, std(0xcfc6b2, 0.7), 0, -0.02, -0.29, 0.004, inner);
    for (let k = 0; k < 9; k++) { const f = B(0.4, 0.2, 0.012, std([0xe8c86a, 0xdcb85a, 0xf0d890][k % 3], 0.8), 0, 0.03, -0.05 - k * 0.055, 0.002, inner); f.rotation.x = (k % 2 - 0.5) * 0.12; }
    drawers.push(dr); }
  g.userData.drawers = drawers; return g;
}
export function waterCooler() { const g = new THREE.Group(); B(0.32, 0.95, 0.32, std(0xf2f2f2, 0.4), 0, 0.475, 0, 0.03, g);
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.42, 24), new THREE.MeshPhysicalMaterial({ color: 0x9fd0ff, roughness: 0.05, transparent: true, opacity: 0.55 })); bottle.position.set(0, 1.18, 0); g.add(bottle);
  B(0.06, 0.04, 0.04, std(0x3a7bd5, 0.4), -0.06, 0.78, 0.17, 0.01, g); B(0.06, 0.04, 0.04, std(0xd5453a, 0.4), 0.06, 0.78, 0.17, 0.01, g); return g; }
export function mug(col = 0xffffff) { const g = new THREE.Group(); CY(0.04, 0.036, 0.095, std(col, 0.35), 0, 0.0475, 0, 20, g); const h = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 8, 16, Math.PI), std(col, 0.35)); h.rotation.z = -Math.PI / 2; h.position.set(0.045, 0.05, 0); g.add(h); return g; }
function lamp(x, z, y = 3.18, parent) { const g = new THREE.Group(); B(1.2, 0.05, 0.3, std(0xeeeeee, 0.5), 0, 0, 0, 0.01, g);
  const e = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.22), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.55, 1.45), toneMapped: false })); e.rotation.x = Math.PI / 2; e.position.y = -0.03; g.add(e);
  g.position.set(x, y, z); parent.add(g); return g; }
function windowUnit(w, h, view, frameMat) {   // janela com caixilho, vidro e vista
  const g = new THREE.Group(); const vm = new THREE.MeshBasicMaterial({ map: view, toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.15) });
  const v = new THREE.Mesh(new THREE.PlaneGeometry(w, h), vm); v.position.z = -0.12; g.add(v);
  const t = 0.06; B(w + t, t, 0.14, frameMat, 0, h / 2, -0.05, 0.005, g); B(w + t, t, 0.14, frameMat, 0, -h / 2, -0.05, 0.005, g); B(t, h, 0.14, frameMat, -w / 2, 0, -0.05, 0.005, g); B(t, h, 0.14, frameMat, w / 2, 0, -0.05, 0.005, g);
  B(0.035, h, 0.05, frameMat, 0, 0, -0.06, 0.003, g); B(w, 0.035, 0.05, frameMat, 0, h * 0.18, -0.06, 0.003, g);
  B(w + 0.2, 0.05, 0.22, frameMat, 0, -h / 2 - 0.03, 0.04, 0.01, g); return g;
}
function wallWithWindows(len, H, mat, wins, view, frameMat, wainscotH = 1.0) {   // parede no plano XY (normal +z), com vãos
  const g = new THREE.Group(); const shape = new THREE.Shape(); shape.moveTo(-len / 2, 0); shape.lineTo(len / 2, 0); shape.lineTo(len / 2, H); shape.lineTo(-len / 2, H); shape.closePath();
  for (const [cx, cy, w, h] of wins) { const p = new THREE.Path(); p.moveTo(cx - w / 2, cy - h / 2); p.lineTo(cx - w / 2, cy + h / 2); p.lineTo(cx + w / 2, cy + h / 2); p.lineTo(cx + w / 2, cy - h / 2); p.closePath(); shape.holes.push(p); }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false }); geo.translate(0, 0, -0.15);
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.castShadow = true; g.add(m);
  for (const [cx, cy, w, h, kind] of wins) { if (kind === 'door') continue; const wu = windowUnit(w, h, view, frameMat); wu.position.set(cx, cy, 0.0); g.add(wu); }
  if (wainscotH > 0) { // lambri de madeira (respeitando vãos de porta)
    let x0 = -len / 2; const doors = wins.filter((w) => w[4] === 'door').sort((a, b) => a[0] - b[0]);
    for (const d of [...doors, [len / 2 + 1, 0, 0, 0]]) { const x1 = d[0] - d[2] / 2; if (x1 > x0 + 0.01) { B(x1 - x0, wainscotH, 0.03, M.wainscot, (x0 + x1) / 2, wainscotH / 2, 0.015, 0.004, g); B(x1 - x0, 0.05, 0.05, M.wainscot, (x0 + x1) / 2, wainscotH, 0.025, 0.01, g); } x0 = d[0] + d[2] / 2; }
  }
  B(len, 0.12, 0.03, std(0xf7f3ea, 0.7), 0, 0.06, 0.03, 0.005, g);
  return g;
}

// Pilha alta de pastas e caixas que "balança" (pivô na base da mesa)
function wobblyPile(seed = 7) {
  const g = new THREE.Group(); const pivot = new THREE.Group(); g.add(pivot); const R = rng(seed); let y = 0; const items = [];
  for (let i = 0; i < 13; i++) { let m;
    if (i % 4 === 1) { m = archiveBox({ code: `ADM-${110 + i}`, year: String(2009 + i), title: ['Processos', 'Contratos', 'Ofícios', 'Licitações'][i % 4] }, { seed: seed * 10 + i }); m.rotation.y = Math.PI / 2 + (R() - 0.5) * 0.2; const hh = 0.25; m.position.set((R() - 0.5) * 0.03, y, (R() - 0.5) * 0.03); pivot.add(m); y += hh * 0.0 + 0.14; items.push([m, y]); continue; }
    const th = 0.035 + R() * 0.04; m = B(0.26, th, 0.33, std(i % 3 === 0 ? 0xf2efe6 : FOLDER_COLS[i % FOLDER_COLS.length], 0.65), (R() - 0.5) * 0.04, y + th / 2, (R() - 0.5) * 0.04, 0.004, pivot); m.rotation.y = (R() - 0.5) * 0.3; y += th; items.push([m, y]); }
  g.userData = { pivot, items, h: y }; return g;
}

// ------------------------------------------------------------------ Luzes padrão de interiores
function interiorLights(scene, { sunDir = [-4, 7, 6], sunCol = 0xffe6c4, sun = 2.4, hemi = 0.75, box = 7, target = [0, 0, 0] } = {}) {
  const s = new THREE.DirectionalLight(sunCol, sun); s.position.set(target[0] + sunDir[0], sunDir[1], target[2] + sunDir[2]); s.target.position.set(...target); scene.add(s.target);
  s.castShadow = true; s.shadow.mapSize.set(2048, 2048); Object.assign(s.shadow.camera, { left: -box, right: box, top: box, bottom: -box, near: 0.5, far: 30 }); s.shadow.bias = -0.0003; s.shadow.normalBias = 0.02; s.shadow.radius = 4; scene.add(s);
  scene.add(new THREE.HemisphereLight(0xfff3e2, 0x8a7458, hemi));
  return s;
}

// ------------------------------------------------------------------ Sala administrativa da prefeitura
export function buildAdmin(scene, env, { tidy = false } = {}) {
  scene.background = new THREE.Color(0xf3ead8); scene.environment = env.envMap; scene.environmentIntensity = 0.45;
  const R = rng(tidy ? 21 : 20); const A = {};
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 16), new THREE.MeshStandardMaterial({ map: TEX.wood([7, 5]), roughness: 0.42 })); floor.rotation.x = -Math.PI / 2; floor.position.x = -2; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(22, 16), std(0xf6f3ec, 0.95)); ceil.rotation.x = Math.PI / 2; ceil.position.set(-2, 3.3, 0); scene.add(ceil);
  const view = windowViewTexture(); const frame = std(0xf7f5f0, 0.5);
  // parede do fundo (z=-5) com 3 janelas
  const back = wallWithWindows(12.3, 3.3, M.wall, [[-3.2, 1.75, 1.7, 1.75], [0, 1.75, 1.7, 1.75], [3.2, 1.75, 1.7, 1.75]], view, frame); back.position.set(0, 0, -5); scene.add(back);
  // parede esquerda (x=-6) com porta para a recepção
  const left = wallWithWindows(10.3, 3.3, M.wall, [[1.4, 1.1, 1.3, 2.2, 'door']], view, frame); left.rotation.y = Math.PI / 2; left.position.set(-6, 0, 0); scene.add(left);
  B(0.2, 2.3, 0.12, frame, -5.95, 1.15, -0.72, 0.01, scene); B(0.2, 2.3, 0.12, frame, -5.95, 1.15, -2.08, 0.01, scene); B(0.2, 0.12, 1.5, frame, -5.95, 2.26, -1.4, 0.01, scene);
  // parede direita (x=6)
  const right = wallWithWindows(10.3, 3.3, M.wall, [], view, frame); right.rotation.y = -Math.PI / 2; right.position.set(6, 0, 0); scene.add(right);
  // parede frontal (z=5) — aparece em contraplanos
  const front = wallWithWindows(12.3, 3.3, M.wall, [], view, frame); front.rotation.y = Math.PI; front.position.set(0, 0, 5); scene.add(front);
  // recepção (atrás da porta esquerda)
  const recFloor = new THREE.Mesh(new THREE.PlaneGeometry(5, 6), new THREE.MeshStandardMaterial({ map: TEX.tiles('#e6dccb', '#cdbfa8', [3, 3]), roughness: 0.5 })); recFloor.rotation.x = -Math.PI / 2; recFloor.position.set(-8.6, 0.002, -1.4); recFloor.receiveShadow = true; scene.add(recFloor);
  const recBack = wallWithWindows(6, 3.3, std(0xdce8dc, 0.9), [], view, frame); recBack.rotation.y = Math.PI / 2; recBack.position.set(-10.5, 0, -1.4); scene.add(recBack);
  const bench = new THREE.Group(); B(1.8, 0.06, 0.45, M.deskTop, 0, 0.45, 0, 0.01, bench); B(1.8, 0.4, 0.05, M.deskTop, 0, 0.72, -0.2, 0.01, bench); for (const sx of [-0.8, 0.8]) B(0.05, 0.45, 0.4, M.graphite, sx, 0.225, 0, 0.005, bench);
  bench.position.set(-9.9, 0, -1.2); bench.rotation.y = Math.PI / 2; scene.add(bench); A.bench = bench;
  const senha = PL(0.9, 0.35, new THREE.MeshBasicMaterial({ map: senhaTexture(), toneMapped: false }), -10.42, 2.45, -2.4, Math.PI / 2, scene); senha.castShadow = false;
  B(0.06, 0.4, 0.95, M.graphite, -10.47, 2.45, -2.4, 0.01, scene);
  scene.add(plant(-10.0, 0.6, 1.2));
  // luminárias
  for (const x of [-3, 0, 3]) for (const z of [-2.2, 1.2]) lamp(x, z, 3.27, scene);
  // relógio, mural, bandeira
  const clk = new THREE.Mesh(new THREE.CircleGeometry(0.28, 40), new THREE.MeshStandardMaterial({ map: clockTexture(), roughness: 0.4 })); clk.position.set(1.6, 2.85, -4.83); scene.add(clk);
  const cork = PL(1.5, 1.0, new THREE.MeshStandardMaterial({ map: corkTexture(), roughness: 0.9 }), -1.55, 1.75, -4.84, 0, scene); B(1.58, 1.08, 0.03, M.deskDark, -1.55, 1.75, -4.87, 0.01, scene);
  const flagG = new THREE.Group(); CY(0.018, 0.018, 2.3, std(0xd4af37, 0.3, 0.8), 0, 1.15, 0, 12, flagG); CY(0.2, 0.25, 0.08, M.graphite, 0, 0.04, 0, 20, flagG);
  const fg = new THREE.PlaneGeometry(0.95, 0.66, 16, 8); const fp = fg.attributes.position; for (let i = 0; i < fp.count; i++) { const x = fp.getX(i) + 0.475; fp.setZ(i, Math.sin(x * 5) * 0.05 * x); fp.setY(i, fp.getY(i) - x * x * 0.25); }
  fg.computeVertexNormals(); const fm = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ map: flagTexture(), roughness: 0.8, side: THREE.DoubleSide })); fm.position.set(0.49, 1.85, 0); fm.castShadow = true; flagG.add(fm);
  flagG.position.set(-5.3, 0, -4.3); flagG.rotation.y = 0.6; scene.add(flagG);
  scene.add(plant(5.4, -4.4, 1.3), plant(-5.4, 4.3, 1.1));
  const wc = waterCooler(); wc.position.set(5.55, 0, -3.3); wc.rotation.y = -Math.PI / 2; scene.add(wc);
  // arquivos de aço na parede direita
  A.cabinets = []; for (let i = 0; i < 4; i++) { const fc = filingCabinet(); fc.position.set(5.65, 0, 0.2 + i * 0.56); fc.rotation.y = -Math.PI / 2; scene.add(fc); A.cabinets.push(fc); }
  // estantes: bagunçadas ou organizadas
  const sh1 = shelfUnit(1.6, 5, { seed: tidy ? 5 : 2, prefix: 'ADM', fill: tidy ? 1 : 0.7 }); sh1.position.set(5.75, 0, -1.8); sh1.rotation.y = -Math.PI / 2; scene.add(sh1);
  const sh2 = shelfUnit(1.6, 5, { seed: tidy ? 6 : 3, prefix: 'PRT', fill: tidy ? 1 : 0.6 }); sh2.position.set(-1.0, 0, -4.7); scene.add(sh2);
  // mesas
  const dC = desk(1.6, 0.8); dC.position.set(-2.4, 0, 0.0); scene.add(dC); A.deskClaudia = dC;
  const chC = chair(); chC.position.set(-2.4, 0, -0.75); scene.add(chC); A.chairClaudia = chC;
  const dF = desk(1.5, 0.75); dF.position.set(3.4, 0, -2.6); scene.add(dF); A.deskFatima = dF;
  const chF = chair(); chF.position.set(3.4, 0, -3.25); scene.add(chF);
  const table = new THREE.Group(); B(1.9, 0.05, 0.95, M.deskTop, 0, 0.735, 0, 0.012, table); for (const sx of [-0.85, 0.85]) for (const sz of [-0.38, 0.38]) CY(0.03, 0.03, 0.71, M.graphite, sx, 0.355, sz, 10, table);
  table.position.set(1.3, 0, 0.6); scene.add(table); A.table = table;
  // monitores
  A.screens = {};
  const mkMon = (parent, x, z, ry, key) => { const t = canvasTex(1600, 1000, (g, w, h) => { g.fillStyle = '#2a5a9a'; g.fillRect(0, 0, w, h); }); t.anisotropy = 16; const mo = monitor(t, 0.56); mo.position.set(x, 0.74, z); mo.rotation.y = ry; parent.add(mo); A.screens[key] = t; return mo; };
  A.monClaudia = mkMon(scene, -2.95, 0.12, Math.PI - 0.55, 'claudia'); const kb = keyboard(); kb.position.set(-2.8, 0.745, -0.15); kb.rotation.y = Math.PI - 0.5; scene.add(kb);
  mkMon(scene, 3.4, -2.35, Math.PI, 'fatima'); const kb2 = keyboard(); kb2.position.set(3.4, 0.745, -2.72); kb2.rotation.y = Math.PI; scene.add(kb2);
  const mg = mug(0xc0392b); mg.position.set(-1.85, 0.745, 0.2); scene.add(mg); const mg2 = mug(0xffffff); mg2.position.set(3.95, 0.745, -2.4); scene.add(mg2);
  if (!tidy) {
    // pilhas na mesa da secretária
    A.deskPiles = [[-3.05, -0.25, 9], [-1.95, -0.12, 6], [-1.8, 0.22, 10], [-2.35, 0.25, 4]].map(([x, z, n], i) => { const s = looseStack(n, 30 + i); s.position.set(x, 0.745, z); s.rotation.y = (R() - 0.5) * 0.4; scene.add(s); return s; });
    // pilha "balançante" na mesa central
    const wp = wobblyPile(); wp.position.set(1.55, 0.76, 0.6); scene.add(wp); A.pile = wp;
    [[0.6, 0.45, 7], [1.0, 0.85, 5]].forEach(([x, z, n], i) => { const s = looseStack(n, 50 + i); s.position.set(x, 0.76, z); scene.add(s); });
    // caixas empilhadas no chão
    A.boxStacks = [];
    [[0.2, -2.0, 4], [0.65, -2.1, 3], [-0.25, -2.2, 2], [4.6, 2.6, 3], [-4.6, -2.8, 4], [-4.2, -3.1, 2], [2.4, -3.9, 3]].forEach(([x, z, n], k) => { const st = new THREE.Group();
      for (let i = 0; i < n; i++) { const b = archiveBox({ code: `ADM-${200 + k * 7 + i}`, year: String(2006 + ((k + i) % 12)), title: ['Processos', 'Contratos', 'Protocolos', 'Ofícios', 'Requerimentos'][(k + i) % 5] }, { seed: 300 + k * 10 + i, w: 0.36, h: 0.27, d: 0.14 });
        b.rotation.y = Math.PI / 2 + (R() - 0.5) * 0.25; b.position.set((R() - 0.5) * 0.05, i * 0.27, (R() - 0.5) * 0.05); st.add(b); }
      st.position.set(x, 0, z); st.rotation.y = (R() - 0.5) * 0.5; scene.add(st); A.boxStacks.push(st); });
    [[2.9, -2.35, 6], [3.95, -2.75, 8]].forEach(([x, z, n], i) => { const s = looseStack(n, 70 + i); s.position.set(x, 0.745, z); scene.add(s); });
    for (let i = 0; i < 6; i++) { const f = folderBox(FOLDER_COLS[i % 6]); f.position.set(-1.6 + i * 0.09, 0, -4.55); f.rotation.z = i === 5 ? 0.35 : 0; scene.add(f); }
  } else {
    // organizado: pastas AZ alinhadas, mesas limpas
    for (let i = 0; i < 8; i++) { const f = folderBox(FOLDER_COLS[i % 3]); f.position.set(-3.1 + i * 0.09, 0.745, -0.25); scene.add(f); }
    const s = looseStack(3, 41); s.position.set(-1.85, 0.745, 0.15); scene.add(s);
    A.boxStacks = [];
    const sh3 = shelfUnit(1.6, 5, { seed: 7, prefix: 'CTR', fill: 1 }); sh3.position.set(0.5, 0, -4.7); scene.add(sh3);
    for (let i = 0; i < 10; i++) { const f = folderBox(FOLDER_COLS[(i * 2) % 6]); f.position.set(0.75 + i * 0.09, 0.745, 0.45); scene.add(f); }
  }
  // feixes de luz das janelas
  const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTexture(), transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff0d8, side: THREE.DoubleSide });
  for (const x of [-3.2, 0, 3.2]) { const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 5.5), shaftMat); sp.position.set(x + 0.8, 1.4, -3.0); sp.rotation.set(-0.95, 0.25, 0); scene.add(sp); }
  A.sun = interiorLights(scene, { sunDir: [-3, 6, 7], target: [0, 0, 0], box: 8 });
  const fill = new THREE.PointLight(0xffe8cc, 6, 9, 1.6); fill.position.set(0, 2.9, 2); scene.add(fill);
  return A;
}

// ------------------------------------------------------------------ Arquivo
export function buildArchive(scene, env) {
  scene.background = new THREE.Color(0xe9e4da); scene.environment = env.envMap; scene.environmentIntensity = 0.42;
  const A = {}; const R = rng(77);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), new THREE.MeshStandardMaterial({ map: TEX.tiles('#cfcac0', '#bdb6aa', [9, 7], 2), roughness: 0.55 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), std(0xf2efe8, 0.95)); ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.2; scene.add(ceil);
  const view = windowViewTexture(); const frame = std(0xf0eee8, 0.5);
  const back = wallWithWindows(14, 3.2, M.wallG, [[-4.5, 2.0, 1.4, 1.1], [4.5, 2.0, 1.4, 1.1]], view, frame, 0); back.position.set(0, 0, -6); scene.add(back);
  const lw = wallWithWindows(12, 3.2, M.wallG, [[0, 2.1, 1.6, 1.0]], view, frame, 0); lw.rotation.y = Math.PI / 2; lw.position.set(-7, 0, 0); scene.add(lw);
  const rw = wallWithWindows(12, 3.2, M.wallG, [[3.5, 1.1, 1.2, 2.2, 'door']], view, frame, 0); rw.rotation.y = -Math.PI / 2; rw.position.set(7, 0, 0); scene.add(rw);
  const fw = wallWithWindows(14, 3.2, M.wallG, [], view, frame, 0); fw.rotation.y = Math.PI; fw.position.set(0, 0, 6); scene.add(fw);
  // corredores de estantes (paralelas ao eixo z)
  A.shelves = [];
  for (const x of [-4.6, -2.2, 2.2, 4.6]) for (const z of [-3.9, -2.2, -0.5]) { const s = shelfUnit(1.6, 5, { seed: Math.abs(Math.round(x * 10 + z * 3)) + 60, prefix: ['ADM', 'PRT', 'RH', 'FIN'][(x + 5 | 0) % 4], fill: 0.88, year0: 2004 });
    s.position.set(x, 0, z); s.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(s); A.shelves.push(s); }
  // caixas no chão e sobre as estantes
  [[-0.9, -4.6, 3], [0.9, -4.8, 2], [-1.2, 2.8, 2], [5.6, 1.8, 3]].forEach(([x, z, n], k) => { for (let i = 0; i < n; i++) { const b = archiveBox({ code: `PRT-${400 + k * 5 + i}`, year: String(2003 + ((k + i) % 10)), title: ['Processos', 'Protocolos', 'Contratos'][(k + i) % 3] }, { seed: 600 + k * 9 + i, w: 0.36, h: 0.27, d: 0.14 });
    b.rotation.y = Math.PI / 2 + (R() - 0.5) * 0.3; b.position.set(x + (R() - 0.5) * 0.05, i * 0.27, z); scene.add(b); } });
  // mesa de conferência com caixa aberta
  const tbl = new THREE.Group(); B(1.8, 0.05, 0.9, M.deskTop, 0, 0.735, 0, 0.012, tbl); for (const sx of [-0.8, 0.8]) for (const sz of [-0.36, 0.36]) CY(0.03, 0.03, 0.71, M.graphite, sx, 0.355, sz, 10, tbl);
  tbl.position.set(-0.2, 0, 1.6); scene.add(tbl); A.table = tbl;
  const ob = new THREE.Group(); B(0.36, 0.25, 0.3, std(0xb59a74, 0.85), 0, 0.125, 0, 0.01, ob); const lid = new THREE.Group(); lid.position.set(0, 0.25, -0.15); ob.add(lid); B(0.37, 0.012, 0.31, std(0xb09470, 0.85), 0, 0.006, 0.155, 0.004, lid);
  for (let i = 0; i < 6; i++) B(0.32, 0.2, 0.012, std(0xe8c86a, 0.8), 0, 0.14, -0.1 + i * 0.04, 0.002, ob);
  ob.position.set(-0.65, 0.76, 1.55); scene.add(ob); A.openBox = ob; A.lid = lid;
  const s1 = looseStack(5, 91); s1.position.set(0.15, 0.76, 1.5); scene.add(s1);
  const s2 = looseStack(3, 92); s2.position.set(0.5, 0.76, 1.75); scene.add(s2);
  // escada
  const lad = new THREE.Group(); for (const sx of [-0.22, 0.22]) { const r = B(0.04, 1.3, 0.05, M.steel, sx, 0.62, 0, 0.005, lad); r.rotation.x = -0.12; }
  for (let i = 0; i < 3; i++) B(0.44, 0.03, 0.18, M.steel, 0, 0.3 + i * 0.33, 0.04 - i * 0.04, 0.005, lad);
  lad.position.set(3.4, 0, -3.15); lad.rotation.y = -Math.PI / 2; scene.add(lad);
  for (const x of [-3.4, 0, 3.4]) for (const z of [-3.2, 0, 3]) { const g = new THREE.Group(); B(1.3, 0.05, 0.18, std(0xeeeeee, 0.5), 0, 0, 0, 0.01, g);
    const e = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 0.12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.55, 1.6), toneMapped: false })); e.rotation.x = Math.PI / 2; e.position.y = -0.03; g.add(e); g.position.set(x, 3.15, z); scene.add(g); }
  scene.add(plant(-6.4, 5.3, 1.1));
  A.sun = interiorLights(scene, { sunDir: [-6, 7, 3], sun: 2.0, hemi: 0.85, box: 8, sunCol: 0xfff0dc });
  const f1 = new THREE.PointLight(0xfff4e0, 7, 10, 1.5); f1.position.set(0, 2.9, 1); scene.add(f1);
  return A;
}

// ------------------------------------------------------------------ Central de digitalização DigitalGov
export function buildOps(scene, env) {
  scene.background = new THREE.Color(0xe8edf3); scene.environment = env.envMap; scene.environmentIntensity = 0.35;
  const A = {}; const R = rng(5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 14), new THREE.MeshStandardMaterial({ map: TEX.noise('#b9bec5', [5, 4], 0.04), roughness: 0.35, metalness: 0.05 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 14), std(0xfafbfc, 0.9)); ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.3; scene.add(ceil);
  const wallW = std(0xe9edf2, 0.85), navy = std(0x1b3260, 0.75); const view = windowViewTexture(); const frame = std(0x2a2f38, 0.4, 0.3);
  const back = wallWithWindows(14, 3.3, navy, [], view, frame, 0); back.position.set(0, 0, -5.5); scene.add(back);
  const lw = wallWithWindows(11, 3.3, wallW, [[-1.6, 1.8, 2.4, 1.9], [1.6, 1.8, 2.4, 1.9]], view, frame, 0); lw.rotation.y = Math.PI / 2; lw.position.set(-7, 0, 0); scene.add(lw);
  const rw = wallWithWindows(11, 3.3, wallW, [], view, frame, 0); rw.rotation.y = -Math.PI / 2; rw.position.set(7, 0, 0); scene.add(rw);
  const fw = wallWithWindows(14, 3.3, wallW, [], view, frame, 0); fw.rotation.y = Math.PI; fw.position.set(0, 0, 5.5); scene.add(fw);
  // painel com a logo na parede azul
  const lp = logoPanel(3.2, { pad: 0.28, sub: 'Digitalização • Indexação • GED', radius: 0.08 }); lp.position.set(0, 2.05, -5.33); scene.add(lp);
  const spot = new THREE.SpotLight(0xffffff, 7, 8, 0.6, 0.6, 1.2); spot.position.set(0, 3.2, -3.2); spot.target.position.set(0, 2.0, -5.4); scene.add(spot, spot.target);
  // painéis de LED no teto
  for (const x of [-4, 0, 4]) for (const z of [-3, 0, 3]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.32, 1.36), toneMapped: false })); p.rotation.x = Math.PI / 2; p.position.set(x, 3.29, z); scene.add(p); }
  const white = std(0xeef1f5, 0.4), leg = std(0x6d747f, 0.35, 0.6);
  const bench = (w, d) => { const g = new THREE.Group(); B(w, 0.04, d, white, 0, 0.74, 0, 0.01, g); for (const sx of [-w / 2 + 0.06, w / 2 - 0.06]) B(0.05, 0.72, d - 0.1, leg, sx, 0.36, 0, 0.005, g); return g; };
  // 1) preparação (Ana)
  const prep = bench(2.0, 0.85); prep.position.set(-4.0, 0, -1.4); scene.add(prep); A.prep = prep;
  A.prepIn = paperStack(40, docTexture(3, { res: 512 }), { seed: 3 }); A.prepIn.position.set(-4.5, 0.76, -1.62); scene.add(A.prepIn);
  A.prepOut = paperStack(22, docTexture(0, { res: 512 }), { seed: 4 }); A.prepOut.position.set(-3.65, 0.76, -1.6); scene.add(A.prepOut);
  const tray = B(0.26, 0.04, 0.2, std(0x2a5a9a, 0.5), -3.15, 0.78, -1.3, 0.01, scene);
  for (let i = 0; i < 3; i++) { const b = archiveBox({ code: `PREF-${130 + i}`, year: '2015', title: 'Processos' }, { seed: 900 + i, w: 0.36, h: 0.27, d: 0.14 }); b.rotation.y = Math.PI / 2; b.position.set(-5.4, i * 0.27, -2.2 + (i % 2) * 0.05); scene.add(b); }
  const ct = cart(); ct.position.set(-5.3, 0, 0.2); ct.rotation.y = 0.4; scene.add(ct);
  for (let i = 0; i < 2; i++) { const b = archiveBox({ code: `PREF-${140 + i}`, year: '2016', title: 'Contratos' }, { seed: 950 + i, w: 0.36, h: 0.27, d: 0.14 }); b.position.set(-5.3 + (i - 0.5) * 0.4, 0.22, 0.2); b.rotation.y = 0.4 + Math.PI / 2; scene.add(b); }
  // 2) digitalização (Diego)
  const scanB = bench(1.6, 0.85); scanB.position.set(-1.0, 0, -2.4); scene.add(scanB); A.scanBench = scanB;
  A.scanner = productionScanner(); A.scanner.position.set(-1.15, 0.76, -2.35); A.scanner.rotation.y = Math.PI; A.scanner.scale.setScalar(1.15); scene.add(A.scanner);
  A.capTex = canvasTex(1600, 1000, () => {}); A.capTex.anisotropy = 16; const capMon = monitor(A.capTex, 0.6); capMon.position.set(-0.42, 0.76, -2.3); capMon.rotation.y = Math.PI + 0.35; scene.add(capMon); A.capMon = capMon;
  // 3) controle de qualidade (Bruna)
  const qcB = bench(1.5, 0.8); qcB.position.set(1.7, 0, -2.4); scene.add(qcB);
  A.qcTex = canvasTex(1600, 1000, () => {}); A.qcTex.anisotropy = 16; const qcMon = monitor(A.qcTex, 0.6); qcMon.position.set(1.7, 0.76, -2.2); qcMon.rotation.y = Math.PI; scene.add(qcMon); A.qcMon = qcMon;
  const kq = keyboard(); kq.position.set(1.7, 0.765, -2.6); kq.rotation.y = Math.PI; scene.add(kq);
  // 4) indexação (Lucas)
  const ixB = bench(1.6, 0.8); ixB.position.set(4.2, 0, -1.6); ixB.rotation.y = Math.PI - 0.6; scene.add(ixB); A.ixBench = ixB;
  A.ixTex = canvasTex(1600, 1000, () => {}); A.ixTex.anisotropy = 16; const ixMon = monitor(A.ixTex, 0.62); ixMon.position.set(0, 0.76, -0.2); ixB.add(ixMon); A.ixMon = ixMon;
  const ki = keyboard(); ki.position.set(0, 0.765, 0.15); ixB.add(ki); const chI = chair(); chI.position.set(0, 0, 0.7); chI.rotation.y = Math.PI; ixB.add(chI);
  // GED: estação de consulta (tela grande para o plano de interface)
  A.gedTex = canvasTex(1600, 1000, () => {}); A.gedTex.anisotropy = 16;
  const gb = bench(1.5, 0.8); gb.position.set(3.6, 0, 1.9); gb.rotation.y = -0.9; scene.add(gb); const gm = monitor(A.gedTex, 0.66); gm.position.set(0, 0.76, -0.15); gb.add(gm); A.gedMon = gm;
  scene.add(plant(-6.4, -4.8, 1.3), plant(6.3, -4.8, 1.2), plant(6.3, 4.6, 1.0));
  // estantes com caixas já organizadas e etiquetadas (lotes da prefeitura)
  for (const [x, z, sd] of [[-6.75, -3.2, 41], [-6.75, -1.4, 42], [6.75, -3.2, 43], [6.75, -1.4, 44]]) { const sh = shelfUnit(1.6, 5, { seed: sd, prefix: 'PREF', fill: 1, year0: 2010 }); sh.position.set(x, 0, z); sh.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(sh); }
  const ct2 = cart(); ct2.position.set(0.6, 0, 0.4); ct2.rotation.y = -0.3; scene.add(ct2);
  for (let i = 0; i < 3; i++) { const b = archiveBox({ code: `PREF-${150 + i}`, year: '2017', title: 'Processos' }, { seed: 970 + i, w: 0.36, h: 0.27, d: 0.14 }); b.position.set(0.6 + (i - 1) * 0.3, 0.22, 0.4); b.rotation.y = -0.3 + Math.PI / 2; scene.add(b); }
  // divisória de vidro
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.2), M.glass); gl.position.set(5.0, 1.1, 3.2); gl.rotation.y = -Math.PI / 2; scene.add(gl);
  A.sun = interiorLights(scene, { sunDir: [-8, 7, 5], sun: 1.7, hemi: 0.6, box: 8, sunCol: 0xfff2e2 });
  const f1 = new THREE.PointLight(0xffffff, 4, 12, 1.5); f1.position.set(0, 3.0, 0); scene.add(f1);
  return A;
}

// ------------------------------------------------------------------ Fachada da prefeitura
export function buildExterior(scene, env) {
  scene.environment = env.envMap; scene.environmentIntensity = 0.3;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(140, 32, 16), new THREE.MeshBasicMaterial({ map: skyTexture('#4f9be6', '#cfe6fa'), side: THREE.BackSide, toneMapped: false, fog: false })); sky.rotation.y = 1.2; scene.add(sky);
  scene.fog = new THREE.Fog(0xcfe4f5, 40, 115);
  const A = {}; const R = rng(9);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), std(0x7fa25e, 0.95)); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(34, 26), new THREE.MeshStandardMaterial({ map: TEX.pavement([16, 12]), roughness: 0.8 })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0, 3); plaza.receiveShadow = true; scene.add(plaza);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(200, 9), std(0x4a4c52, 0.9)); road.rotation.x = -Math.PI / 2; road.position.set(0, -0.01, 20.5); road.receiveShadow = true; scene.add(road);
  // morros ao fundo
  for (let i = 0; i < 9; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(18 + R() * 14, 24, 12), std([0x6f9a5c, 0x7aa566, 0x5f8a50][i % 3], 1)); h.scale.y = 0.35 + R() * 0.2; h.position.set(-90 + i * 23, -3, -70 - R() * 20); scene.add(h); }
  // prédio (estilo colonial mineiro): corpo branco, cunhais e molduras ocre, janelas azuis em arco
  const bld = new THREE.Group(); bld.position.set(0, 0, -10); scene.add(bld);
  const wallM = std(0xfbf6ec, 0.85), trim = std(0xe2b347, 0.7), blue = std(0x2f5f9e, 0.5), roof = std(0xb8553a, 0.8), stone = std(0xc9c1b2, 0.85);
  B(26, 8.4, 8, wallM, 0, 4.2, -4, 0.02, bld); B(26.6, 0.5, 8.6, trim, 0, 8.55, -4, 0.04, bld); B(26.4, 0.25, 8.4, trim, 0, 4.25, -4, 0.02, bld);
  const rs = new THREE.Shape(); rs.moveTo(-4.6, 0); rs.lineTo(4.6, 0); rs.lineTo(1.2, 2.6); rs.lineTo(-1.2, 2.6); rs.closePath();
  const roofG = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: 26.8, bevelEnabled: false }), roof); roofG.rotation.y = Math.PI / 2; roofG.position.set(-13.4, 8.8, -4); roofG.castShadow = true; bld.add(roofG);
  for (const x of [-13, 13]) B(0.6, 8.4, 0.3, trim, x, 4.2, 0.02, 0.02, bld);
  // pórtico central com frontão e relógio
  B(7.6, 10.4, 1.2, wallM, 0, 5.2, 0.4, 0.02, bld); B(8.0, 0.4, 1.5, trim, 0, 10.5, 0.4, 0.02, bld);
  const ped = new THREE.Shape(); ped.moveTo(-4, 0); ped.lineTo(4, 0); ped.lineTo(0, 2.1); ped.closePath(); const pg = new THREE.ExtrudeGeometry(ped, { depth: 1.3, bevelEnabled: false }); const pm = new THREE.Mesh(pg, wallM); pm.position.set(0, 10.7, -0.25); pm.castShadow = true; bld.add(pm);
  const pedT = new THREE.Shape(); pedT.moveTo(-4.3, 0); pedT.lineTo(4.3, 0); pedT.lineTo(0, 2.35); pedT.closePath(); const pt = new THREE.Mesh(new THREE.ExtrudeGeometry(pedT, { depth: 1.2, bevelEnabled: false }), trim); pt.position.set(0, 10.6, -0.3); bld.add(pt);
  const clk = new THREE.Mesh(new THREE.CircleGeometry(0.7, 40), new THREE.MeshStandardMaterial({ map: clockTexture(), roughness: 0.4 })); clk.position.set(0, 11.5, 1.07); bld.add(clk);
  const cr = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.07, 10, 40), trim); cr.position.set(0, 11.5, 1.07); bld.add(cr);
  for (const x of [-3.6, -1.3, 1.3, 3.6]) { CY(0.28, 0.32, 4.6, wallM, x, 2.3, 1.4, 20, bld); B(0.8, 0.25, 0.8, trim, x, 4.7, 1.4, 0.02, bld); B(0.8, 0.25, 0.8, stone, x, 0.12, 1.4, 0.02, bld); }
  B(8.4, 0.45, 2.0, trim, 0, 4.95, 1.2, 0.02, bld);
  const sign = PL(5.8, 0.72, new THREE.MeshStandardMaterial({ map: signTexture(['PREFEITURA MUNICIPAL'], { sizes: [104], w: 1600, h: 200 }), roughness: 0.6 }), 0, 5.6, 1.02, 0, bld);
  // porta principal
  const door = new THREE.Shape(); door.moveTo(-1.1, 0); door.lineTo(1.1, 0); door.lineTo(1.1, 2.6); door.absarc(0, 2.6, 1.1, 0, Math.PI, false); door.closePath();
  const dm = new THREE.Mesh(new THREE.ShapeGeometry(door, 24), std(0x5a3a22, 0.6)); dm.position.set(0, 0.3, 1.02); bld.add(dm);
  const dTrim = new THREE.Mesh(new THREE.ShapeGeometry(door, 24), trim); dTrim.scale.set(1.12, 1.06, 1); dTrim.position.set(0, 0.22, 1.015); bld.add(dTrim);
  // janelas em arco (2 pavimentos)
  const winShape = new THREE.Shape(); winShape.moveTo(-0.6, 0); winShape.lineTo(0.6, 0); winShape.lineTo(0.6, 1.4); winShape.absarc(0, 1.4, 0.6, 0, Math.PI, false); winShape.closePath();
  const wg = new THREE.ShapeGeometry(winShape, 16);
  for (const fl of [1.3, 5.3]) for (let i = 0; i < 8; i++) { const x = -11 + i * (22 / 7); if (Math.abs(x) < 4.2) continue;
    const t = new THREE.Mesh(wg, trim); t.scale.set(1.25, 1.12, 1); t.position.set(x, fl - 0.12, 0.005); bld.add(t);
    const w = new THREE.Mesh(wg, blue); w.position.set(x, fl, 0.012); bld.add(w);
    const gl = new THREE.Mesh(wg, std(0xbfd8ee, 0.15, 0.2)); gl.scale.set(0.72, 0.8, 1); gl.position.set(x, fl + 0.25, 0.02); bld.add(gl);
    B(1.6, 0.12, 0.3, trim, x, fl - 0.15, 0.12, 0.01, bld); }
  for (const x of [-2.6, 2.6]) { const w = new THREE.Mesh(wg, blue); w.scale.set(0.9, 0.9, 1); w.position.set(x, 6.4, 1.03); bld.add(w); }
  // escadaria
  for (let i = 0; i < 4; i++) B(9.5 - i * 0.4, 0.16, 1.0, stone, 0, 0.08 + i * 0.16, 2.6 - i * 0.35 - 0.0, 0.01, bld).position.z = 3.4 - i * 0.5 - 1.0;
  // mastros e bandeiras
  A.flags = [];
  const fgeo = () => new THREE.PlaneGeometry(1.8, 1.26, 24, 12);
  [[-7.5, flagTexture()], [-5.5, tex(700, 490, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(w * 0.5, h * 0.18); g.lineTo(w * 0.72, h * 0.62); g.lineTo(w * 0.28, h * 0.62); g.closePath(); g.fill(); })],
   [5.5, tex(700, 490, (g, w, h) => { g.fillStyle = '#1f5fa8'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(0, h * 0.4, w, h * 0.2); g.fillStyle = '#e2b347'; g.beginPath(); g.arc(w / 2, h / 2, h * 0.18, 0, 7); g.fill(); })]].forEach(([x, t]) => {
    CY(0.06, 0.08, 7.5, std(0xdedede, 0.3, 0.7), x, 3.75, -3.5, 12, scene); const f = new THREE.Mesh(fgeo(), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, side: THREE.DoubleSide })); f.position.set(x + 0.92, 6.8, -3.5); f.castShadow = true; scene.add(f);
    f.userData.base = f.geometry.attributes.position.array.slice(); A.flags.push(f); });
  // palmeiras imperiais, ipê-amarelo, canteiros e bancos
  const palm = (x, z, h = 9) => { const g = new THREE.Group(); const tr = std(0xbdb3a0, 0.9); for (let i = 0; i < 8; i++) CY(0.28 - i * 0.012, 0.3 - i * 0.012, h / 8, tr, 0, h / 16 + i * h / 8, 0, 14, g);
    CY(0.2, 0.26, 1.2, std(0x6b8a3a, 0.7), 0, h + 0.4, 0, 14, g); const lm = new THREE.MeshStandardMaterial({ color: 0x4f7f3a, roughness: 0.8, side: THREE.DoubleSide });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const lg = new THREE.PlaneGeometry(0.5, 3.6, 2, 10); const lp = lg.attributes.position; for (let k = 0; k < lp.count; k++) { const y = lp.getY(k) + 1.8; lp.setZ(k, -y * y * 0.09); lp.setX(k, lp.getX(k) * (1 - y / 4)); }
      lg.translate(0, 1.8, 0); lg.computeVertexNormals(); const l = new THREE.Mesh(lg, lm); l.position.y = h + 0.9; l.rotation.set(-0.9 - (i % 2) * 0.35, a, 0, 'YXZ'); l.castShadow = true; g.add(l); }
    g.position.set(x, 0, z); scene.add(g); return g; };
  palm(-10, 2.5); palm(10, 2.5); palm(-15, 6, 10); palm(15, 6, 10);
  const ipe = (x, z) => { const g = new THREE.Group(); CY(0.18, 0.25, 3.2, std(0x6a5440, 0.9), 0, 1.6, 0, 12, g); const ym = std(0xffc81a, 0.75, 0, { emissive: 0x6a4a00, emissiveIntensity: 0.25 });
    for (let i = 0; i < 26; i++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + R() * 0.5, 1), ym); s.position.set((R() - 0.5) * 3.4, 3.4 + R() * 1.8, (R() - 0.5) * 3.4); s.castShadow = true; g.add(s); }
    g.position.set(x, 0, z); scene.add(g); };
  ipe(-17, 3.5); ipe(13.5, 11.5);
  const bed = (x, z, w) => { B(w, 0.45, 1.2, std(0xe8e2d6, 0.8), x, 0.22, z, 0.03, scene); for (let i = 0; i < w * 4; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.22 + R() * 0.12, 10, 8), std([0x4f8a3f, 0xd94a6a, 0xf0a030, 0x5f9a4f][i % 4], 0.8)); s.position.set(x - w / 2 + 0.2 + R() * (w - 0.4), 0.55, z + (R() - 0.5) * 0.8); s.castShadow = true; scene.add(s); } };
  bed(-6.5, 1.0, 4); bed(6.5, 1.0, 4);
  const benchE = (x, z, ry) => { const g = new THREE.Group(); B(1.8, 0.06, 0.45, std(0x8a5a32, 0.6), 0, 0.45, 0, 0.01, g); B(1.8, 0.35, 0.05, std(0x8a5a32, 0.6), 0, 0.72, -0.2, 0.01, g); for (const sx of [-0.8, 0.8]) B(0.06, 0.45, 0.42, std(0x2a2a2e, 0.4, 0.5), sx, 0.22, 0, 0.005, g); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); };
  benchE(-9, 9, 0.2); benchE(9, 9, -0.2);
  const post = (x, z) => { CY(0.06, 0.08, 4, std(0x1f2228, 0.4, 0.6), x, 2, z, 12, scene); const l = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfff6dd, emissive: 0xfff0c0, emissiveIntensity: 0.3 })); l.position.set(x, 4.15, z); scene.add(l); };
  post(-4.5, 8); post(4.5, 8); post(-12, 15); post(12, 15);
  // casarios vizinhos
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const g = new THREE.Group(); const w = 6 + R() * 2, h = 5 + R() * 3; B(w, h, 6, std([0xf2d7a8, 0xd9e8f0, 0xf0c8b8, 0xe0ecd0][(i + (sx > 0 ? 2 : 0)) % 4], 0.85), 0, h / 2, 0, 0.02, g);
    const rf = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.6, 1.8, 4, 1), roof); rf.scale.set(w / 6.5, 1, 1); rf.rotation.y = Math.PI / 4; rf.position.y = h + 0.9; g.add(rf);
    for (let k = 0; k < 3; k++) { B(0.9, 1.4, 0.1, blue, -w / 2 + 1.2 + k * (w - 2.4) / 2, h * 0.6, 3.02, 0.02, g); }
    g.position.set(sx * (19 + i * 7.5), 0, -8 - i * 2); scene.add(g); }
  // carros estacionados (formas simples)
  const car = (x, z, col) => { const g = new THREE.Group(); B(4.2, 0.8, 1.8, std(col, 0.3, 0.3), 0, 0.65, 0, 0.25, g); B(2.4, 0.65, 1.6, std(0x9fb8cc, 0.1, 0.4), -0.2, 1.3, 0, 0.25, g);
    for (const sx of [-1.35, 1.35]) for (const sz of [-0.85, 0.85]) { const w = CY(0.36, 0.36, 0.24, std(0x1a1a1a, 0.8), sx, 0.36, sz, 18, g); w.rotation.x = Math.PI / 2; } g.position.set(x, 0, z); scene.add(g); };
  car(-14, 19, 0xc0392b); car(8, 22, 0xf2f2f2); car(16, 19, 0x2f5f9e);
  const sun = new THREE.DirectionalLight(0xffecd0, 3.6); sun.position.set(-30, 22, 14); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 24, bottom: -12, near: 1, far: 90 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x9a8a6a, 0.8));
  return A;
}
// Bandeiras tremulando (vento suave)
export function waveFlags(A, t) {
  for (const f of A.flags) { const p = f.geometry.attributes.position, b = f.userData.base;
    for (let i = 0; i < p.count; i++) { const x = b[i * 3] + 0.9, y = b[i * 3 + 1]; p.setZ(i, Math.sin(x * 3.2 - t * 6 + y * 0.8) * 0.12 * x + Math.sin(x * 1.3 - t * 3.1) * 0.06 * x); p.setY(i, y - x * x * 0.02); }
    p.needsUpdate = true; f.geometry.computeVertexNormals(); }
}

// Banner "roll-up" DigitalGov (logo original + serviços)
export function rollupBanner(h = 2.0) {
  const g = new THREE.Group(); const w = 0.85;
  B(w + 0.06, 0.08, 0.25, std(0x9aa1ab, 0.35, 0.6), 0, 0.04, 0, 0.02, g);
  CY(0.012, 0.012, h, std(0x9aa1ab, 0.35, 0.6), 0, h / 2, -0.06, 10, g);
  const t = tex(850, 2000, (c, W, H) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); const gr = c.createLinearGradient(0, H * 0.55, 0, H); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#dfe9f6'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1b3260'; c.fillRect(0, H - 260, W, 260); c.fillStyle = '#1f6fd1'; c.fillRect(0, H - 270, W, 10);
    c.fillStyle = '#1b2a44'; c.font = '700 64px "Inter Display", Inter'; c.textAlign = 'center'; ['Digitalização', 'Indexação', 'GED'].forEach((s, i) => { c.fillText(s, W / 2, 880 + i * 110); });
    c.fillStyle = '#1f6fd1'; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(W / 2, 935 + i * 110, 7, 0, 7); c.fill(); }
    c.fillStyle = '#ffffff'; c.font = '600 46px Inter'; c.fillText('Informação organizada.', W / 2, H - 160); c.fillText('Gestão modernizada.', W / 2, H - 92); });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })); face.position.set(0, h / 2 + 0.08, -0.04); face.castShadow = true; g.add(face);
  const lw = w * 0.84, lh = lw * 189 / 588; const logo = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), new THREE.MeshStandardMaterial({ map: logoTexture(), roughness: 0.5, transparent: true }));
  logo.position.set(0, 0.08 + h * 0.8, -0.035); g.add(logo);
  return g;
}
