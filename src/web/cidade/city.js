// Cidade-diorama do filme "30 dias": a mesma cidade pode estar em terra seca ou em terra molhada.
// Estado (0–1): base (molhado em toda a cidade), spots (manchas que se espalham a partir de um ponto), life (carros andando),
// lights (iluminação pública), grow (árvores brotando), dust (poeira), rain (chuva). Tudo é função pura do tempo.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng, clamp, lerp, smooth, range } from '../core.js';
import { canvasTex, dotTexture } from '../textures.js';

export const N = 5, B = 2.0, RW = 0.7, P = B + RW, S = N * B + (N + 1) * RW; // 14.2
export const bc = (i) => (i - 2) * P;                       // centro do quarteirão i
const KPX = 2048 / S;                                        // pixels por unidade nas texturas do chão
const SPECIAL = { '2,2': 'hall', '1,3': 'school', '3,1': 'ubs', '0,0': 'tower', '4,3': 'works', '3,3': 'park', '1,1': 'midrise', '4,0': 'midrise2' };
// pontos de interesse (usados pela lista de apuração e pela câmera)
export const POI = {
  hall: [bc(2), 0.9, bc(2)], school: [bc(1), 0.75, bc(3)], ubs: [bc(3), 0.6, bc(1)], tower: [bc(0) - 0.35, 1.9, bc(0) - 0.35],
  works: [bc(4), 1.4, bc(3)], park: [bc(3), 0.5, bc(3)], road: [bc(2) + P / 2, 0.05, bc(1) + P / 2], trash: [bc(0) + P / 2, 0.1, bc(4)],
  lights: [bc(1) + P / 2, 0.6, bc(2) - P / 2],
};

const std = (color, roughness = 0.8, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const DUST = new THREE.Color(0xc2a77f);

// ------------------------------------------------------------------ texturas (desenhadas uma vez e reaproveitadas)
const C = {};
function px(x) { return (x + S / 2) * KPX; }
function blockRect(i, j, pad = 0) { const x = px(bc(i) - B / 2 - pad), y = px(bc(j) - B / 2 - pad); return [x, y, (B + 2 * pad) * KPX, (B + 2 * pad) * KPX]; }
function speckle(g, w, h, R, n, cols, a0 = 0.05, a1 = 0.18, s0 = 1, s1 = 3) {
  for (let k = 0; k < n; k++) { g.globalAlpha = lerp(a0, a1, R()); g.fillStyle = cols[Math.floor(R() * cols.length)]; const s = lerp(s0, s1, R()); g.fillRect(R() * w, R() * h, s, s); }
  g.globalAlpha = 1;
}
function crackLines(g, x, y, w, h, R, n, col, width = [1.2, 3]) {
  g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let k = 0; k < n; k++) {
    let cx = x + R() * w, cy = y + R() * h, a = R() * Math.PI * 2; g.lineWidth = lerp(width[0], width[1], R());
    g.beginPath(); g.moveTo(cx, cy); const seg = 4 + Math.floor(R() * 7);
    for (let s = 0; s < seg; s++) { a += (R() - 0.5) * 1.3; const l = 12 + R() * 26; cx += Math.cos(a) * l; cy += Math.sin(a) * l; g.lineTo(cx, cy); }
    g.stroke();
  }
}
const ROADS = []; for (let k = 0; k <= N; k++) ROADS.push(-S / 2 + RW / 2 + k * P);   // eixos das ruas (x e z)

function dryGround() {
  return canvasTex(2048, 2048, (g, w, h) => {
    const R = rng(11);
    g.fillStyle = '#d4b688'; g.fillRect(0, 0, w, h);                  // estrada de terra
    speckle(g, w, h, R, 26000, ['#b8996a', '#e6cfa4', '#a98a5e', '#f0dcb4'], 0.15, 0.4, 1, 4);
    // trilhas de pneu
    g.strokeStyle = 'rgba(150,118,78,.35)'; g.lineWidth = 3;
    for (const r of ROADS) for (const o of [-0.13, 0.13]) {
      g.beginPath(); for (let s = 0; s <= 60; s++) { const q = px(-S / 2 + (S * s) / 60); g.lineTo(q, px(r + o) + Math.sin(s * 1.3 + r) * 4); } g.stroke();
      g.beginPath(); for (let s = 0; s <= 60; s++) { const q = px(-S / 2 + (S * s) / 60); g.lineTo(px(r + o) + Math.sin(s * 1.1 + r) * 4, q); } g.stroke();
    }
    // quarteirões: chão rachado
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const [x, y, s] = blockRect(i, j); const type = SPECIAL[`${i},${j}`];
      g.fillStyle = type === 'hall' ? '#d6c7a8' : '#c29a62'; g.fillRect(x, y, s, s);
      speckle(g, s, s, R, 0, []);
      for (let k = 0; k < 900; k++) { g.globalAlpha = 0.12 + R() * 0.2; g.fillStyle = ['#a77f4b', '#d2ae76', '#b48b55'][k % 3]; g.fillRect(x + R() * s, y + R() * s, 2 + R() * 5, 2 + R() * 5); }
      g.globalAlpha = 1;
      crackLines(g, x, y, s, s, R, type === 'hall' ? 14 : 34, type === 'hall' ? 'rgba(120,96,64,.55)' : 'rgba(104,72,38,.75)');
      // capim seco
      g.strokeStyle = 'rgba(176,152,84,.8)'; g.lineWidth = 1.4;
      for (let k = 0; k < 40; k++) { const cx = x + R() * s, cy = y + R() * s; for (let b = 0; b < 4; b++) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (R() - 0.5) * 9, cy - 4 - R() * 7); g.stroke(); } }
      // meio-fio quebrado
      g.strokeStyle = 'rgba(222,208,180,.9)'; g.lineWidth = 5; g.setLineDash([30 + R() * 30, 12 + R() * 30]); g.strokeRect(x + 3, y + 3, s - 6, s - 6); g.setLineDash([]);
      if (type === 'park') { g.fillStyle = 'rgba(140,104,62,.9)'; g.beginPath(); g.ellipse(x + s * 0.62, y + s * 0.6, s * 0.2, s * 0.13, 0.3, 0, 7); g.fill(); crackLines(g, x + s * 0.45, y + s * 0.5, s * 0.33, s * 0.2, R, 10, 'rgba(80,56,30,.8)'); }
      if (type === 'school') { g.strokeStyle = 'rgba(235,225,200,.5)'; g.lineWidth = 3; g.strokeRect(x + s * 0.12, y + s * 0.56, s * 0.76, s * 0.36); }
    }
    // buracos na rua
    for (let k = 0; k < 46; k++) {
      const r = ROADS[Math.floor(R() * ROADS.length)], along = -S / 2 + R() * S, horiz = R() < 0.5;
      const X = px(horiz ? along : r + (R() - 0.5) * 0.4), Y = px(horiz ? r + (R() - 0.5) * 0.4 : along), rx = 9 + R() * 16, ry = 6 + R() * 10, rot = R() * 3;
      g.fillStyle = 'rgba(176,146,104,.9)'; g.beginPath(); g.ellipse(X, Y, rx + 5, ry + 5, rot, 0, 7); g.fill();
      g.fillStyle = '#5e432a'; g.beginPath(); g.ellipse(X, Y, rx, ry, rot, 0, 7); g.fill();
      g.fillStyle = 'rgba(40,26,14,.6)'; g.beginPath(); g.ellipse(X + 2, Y + 2, rx * 0.6, ry * 0.6, rot, 0, 7); g.fill();
    }
  });
}
function wetGround() {
  return canvasTex(2048, 2048, (g, w, h) => {
    const R = rng(12);
    g.fillStyle = '#3c4046'; g.fillRect(0, 0, w, h);                   // asfalto molhado
    speckle(g, w, h, R, 30000, ['#2f3237', '#4a4f56', '#34383d'], 0.2, 0.5, 1, 3);
    // faixas centrais
    g.fillStyle = 'rgba(240,238,228,.85)';
    for (const r of ROADS) for (let s = -S / 2 + 0.2; s < S / 2; s += 0.5) {
      if (ROADS.some((q) => Math.abs(q - s - 0.1) < RW / 2 + 0.05)) continue;
      g.fillRect(px(s), px(r) - 2, 0.26 * KPX, 4); g.fillRect(px(r) - 2, px(s), 4, 0.26 * KPX);
    }
    // faixas de pedestre perto da prefeitura
    g.fillStyle = 'rgba(245,244,236,.9)';
    for (const [cx, cz, rot] of [[bc(2), bc(2) - P / 2, 0], [bc(2), bc(2) + P / 2, 0], [bc(2) - P / 2, bc(2), 1], [bc(2) + P / 2, bc(2), 1]])
      for (let k = -3; k <= 3; k++) { if (rot) g.fillRect(px(cx) - 0.28 * KPX, px(cz + k * 0.1) - 3, 0.56 * KPX, 7); else g.fillRect(px(cx + k * 0.1) - 3, px(cz) - 0.28 * KPX, 7, 0.56 * KPX); }
    // poças com reflexo
    for (let k = 0; k < 30; k++) {
      const r = ROADS[Math.floor(R() * ROADS.length)], along = -S / 2 + R() * S, horiz = R() < 0.5;
      const X = px(horiz ? along : r + (R() - 0.5) * 0.4), Y = px(horiz ? r + (R() - 0.5) * 0.4 : along);
      const gr = g.createRadialGradient(X, Y, 0, X, Y, 30); gr.addColorStop(0, 'rgba(120,150,175,.55)'); gr.addColorStop(1, 'rgba(60,70,80,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(X, Y, 24 + R() * 20, 12 + R() * 10, R() * 3, 0, 7); g.fill();
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const type = SPECIAL[`${i},${j}`];
      const [x0, y0, s0] = blockRect(i, j); g.fillStyle = '#c9c5bb'; g.fillRect(x0, y0, s0, s0);   // calçada
      g.strokeStyle = 'rgba(150,146,138,.6)'; g.lineWidth = 1; for (let q = 0; q < s0; q += 14) { g.beginPath(); g.moveTo(x0 + q, y0); g.lineTo(x0 + q, y0 + s0); g.stroke(); g.beginPath(); g.moveTo(x0, y0 + q); g.lineTo(x0 + s0, y0 + q); g.stroke(); }
      const [x, y, s] = blockRect(i, j, -0.14);
      if (type === 'hall') {
        g.fillStyle = '#e4ddcf'; g.fillRect(x, y, s, s);
        g.strokeStyle = 'rgba(180,170,152,.6)'; g.lineWidth = 1.2; for (let q = 0; q < s; q += 22) { g.beginPath(); g.moveTo(x + q, y); g.lineTo(x + q, y + s); g.stroke(); g.beginPath(); g.moveTo(x, y + q); g.lineTo(x + s, y + q); g.stroke(); }
        g.fillStyle = '#5c9a48'; for (const [a, b] of [[0.06, 0.06], [0.72, 0.06], [0.06, 0.74], [0.72, 0.74]]) g.fillRect(x + s * a, y + s * b, s * 0.22, s * 0.2);
        continue;
      }
      g.fillStyle = '#5b9446'; g.fillRect(x, y, s, s);
      for (let k = 0; k < 1800; k++) { g.globalAlpha = 0.25 + R() * 0.35; g.fillStyle = ['#6aa752', '#4c823b', '#77b25c', '#558d42'][k % 4]; g.fillRect(x + R() * s, y + R() * s, 2 + R() * 6, 2 + R() * 6); }
      g.globalAlpha = 1;
      for (let k = 0; k < 60; k++) { g.fillStyle = ['#f3d34a', '#f6f1e6', '#e88aa2'][k % 3]; g.fillRect(x + R() * s, y + R() * s, 3, 3); }
      if (type === 'park') {
        g.fillStyle = '#d9cfb8'; g.lineWidth = 0; g.fillRect(x, y + s * 0.46, s, s * 0.08); g.fillRect(x + s * 0.46, y, s * 0.08, s);
        const gr = g.createRadialGradient(x + s * 0.68, y + s * 0.7, 4, x + s * 0.68, y + s * 0.7, s * 0.22); gr.addColorStop(0, '#5fa9d6'); gr.addColorStop(1, '#2f6f9c');
        g.fillStyle = '#cfc6b0'; g.beginPath(); g.ellipse(x + s * 0.68, y + s * 0.7, s * 0.21, s * 0.15, 0.3, 0, 7); g.fill();
        g.fillStyle = gr; g.beginPath(); g.ellipse(x + s * 0.68, y + s * 0.7, s * 0.19, s * 0.13, 0.3, 0, 7); g.fill();
      }
      if (type === 'school') {
        g.fillStyle = '#3d7fae'; g.fillRect(x + s * 0.1, y + s * 0.55, s * 0.8, s * 0.38); g.strokeStyle = '#f3f3ee'; g.lineWidth = 3;
        g.strokeRect(x + s * 0.13, y + s * 0.58, s * 0.74, s * 0.32); g.beginPath(); g.moveTo(x + s * 0.5, y + s * 0.58); g.lineTo(x + s * 0.5, y + s * 0.9); g.stroke();
        g.beginPath(); g.arc(x + s * 0.5, y + s * 0.74, s * 0.06, 0, 7); g.stroke();
      }
      if (type === 'works') { g.fillStyle = '#9c8466'; g.fillRect(x + s * 0.05, y + s * 0.05, s * 0.9, s * 0.9); }
    }
  });
}
function soilSide() {
  return canvasTex(1024, 128, (g, w, h) => {
    const R = rng(5); const bands = [['#8b6a45', 0], ['#7a5a3a', 0.18], ['#94734c', 0.36], ['#6d4f33', 0.58], ['#5e432c', 0.8]];
    bands.forEach(([c, y], k) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, y * h);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y * h + Math.sin(x * 0.02 + k) * 4 + (R() - 0.5) * 3); g.lineTo(w, h); g.lineTo(0, h); g.fill(); });
    speckle(g, w, h, R, 2500, ['#3e2c1c', '#b09070', '#cdb592'], 0.3, 0.7, 2, 6);
    g.fillStyle = '#4e7a3a'; g.fillRect(0, 0, w, 6);
  });
}
function facade(kind) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    if (kind === 'house') {
      g.fillStyle = '#5b4a3c'; g.fillRect(104, 140, 48, 116);                  // porta
      g.fillStyle = '#2f3e52'; g.fillRect(28, 120, 56, 60); g.fillRect(172, 120, 56, 60);
      g.fillStyle = '#e9e4da'; g.fillRect(24, 180, 64, 8); g.fillRect(168, 180, 64, 8);
    } else {
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { g.fillStyle = '#2f3e52'; g.fillRect(18 + c * 60, 26 + r * 128, 40, 78); g.fillStyle = '#d9d4ca'; g.fillRect(14 + c * 60, 104 + r * 128, 48, 7); }
    }
  });
}
function signTex(text, bg, fg, w = 512, h = 96) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `700 ${Math.round(h * 0.52)}px "Inter Display", "Inter"`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 2);
  });
}
function bgTex(top, mid, bottom) {
  return canvasTex(16, 512, (g, w, h) => { const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, top); v.addColorStop(0.55, mid); v.addColorStop(1, bottom); g.fillStyle = v; g.fillRect(0, 0, w, h); });
}
export function background(top, mid, bottom) { return bgTex(top, mid, bottom); }
function cache() {
  if (C.ready) return C;
  C.dry = dryGround(); C.wet = wetGround(); C.soil = soilSide(); C.house = facade('house'); C.bldg = facade('bldg');
  C.hallSign = signTex('PREFEITURA MUNICIPAL', '#f4efe4', '#1d3a66', 768, 96); C.schoolSign = signTex('ESCOLA MUNICIPAL', '#1f5fbf', '#ffffff', 640, 96);
  C.ubsSign = signTex('UBS · POSTO DE SAÚDE', '#ffffff', '#1f8a5b', 640, 96); C.dot = dotTexture();
  C.ready = true; return C;
}

// ------------------------------------------------------------------ geometrias
const G = {
  box: new RoundedBoxGeometry(1, 1, 1, 2, 0.04), sharp: new THREE.BoxGeometry(1, 1, 1),
  roof: (() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 0.5); s.lineTo(-0.5, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -0.5); return g; })(),
  canopy: new THREE.IcosahedronGeometry(0.2, 0), trunk: new THREE.CylinderGeometry(0.025, 0.035, 0.28, 6), lump: new THREE.DodecahedronGeometry(0.06, 0),
};
function mesh(geo, mat, sx, sy, sz, x, y, z) { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }

// ------------------------------------------------------------------ construção
export function buildCity(opts = {}) {
  const T = cache(); const R = rng(opts.seed || 3);
  const root = new THREE.Group(); const tinted = [];       // materiais que desbotam na terra seca
  const tint = (mat, x, z, dustAmt = 0.5) => { tinted.push({ mat, base: mat.color.clone(), x, z, dustAmt }); return mat; };

  // ilha de terra (fatia do diorama)
  const soilMat = std(0xffffff, 0.95, { map: T.soil });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(S, 1.5, S), [soilMat, soilMat, std(0x6b4e33), std(0x4a3524), soilMat, soilMat]);
  slab.position.y = -0.75; slab.receiveShadow = true; root.add(slab);

  // chão com mistura seca/molhada controlada por máscara
  const MASK = 128; const maskData = new Uint8Array(MASK * MASK * 4); const maskTex = new THREE.DataTexture(maskData, MASK, MASK);
  maskTex.magFilter = maskTex.minFilter = THREE.LinearFilter; maskTex.needsUpdate = true;
  const groundMat = std(0xffffff, 0.97, { map: T.dry, envMapIntensity: 0.6 });
  groundMat.onBeforeCompile = (sh) => {
    sh.uniforms.tWet = { value: T.wet }; sh.uniforms.tMask = { value: maskTex };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <map_pars_fragment>', '#include <map_pars_fragment>\nuniform sampler2D tWet; uniform sampler2D tMask;')
      .replace('#include <map_fragment>', 'float wm = texture2D(tMask, vMapUv).r; diffuseColor *= mix(texture2D(map, vMapUv), texture2D(tWet, vMapUv), wm);')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = mix(roughness, 0.38, wm);');
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(S, S), groundMat); ground.rotation.x = -Math.PI / 2; ground.position.y = 0.002; ground.receiveShadow = true; root.add(ground);

  // ---- edifícios
  const PAL = [0xf3efe6, 0xf4e4b8, 0xcfe0ea, 0xf2d6c4, 0xe7ecd8, 0xf6f3ee, 0xe9d3a7];
  const roofMat = (x, z) => tint(std(0xb5583a, 0.75), x, z, 0.45);
  function house(x, z, w, d, h, rot = 0) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    const wall = tint(std(PAL[Math.floor(R() * PAL.length)], 0.85, { map: T.house }), x, z);
    g.add(mesh(G.sharp, wall, w, h, d, 0, h / 2, 0)); const r = mesh(G.roof, roofMat(x, z), w + 0.08, 0.5, d + 0.08, 0, h, 0); r.rotation.y = 0; g.add(r);
    root.add(g); return g;
  }
  function building(x, z, w, d, floors, color) {
    const tex = T.bldg.clone(); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(Math.max(1, Math.round(w / 0.5)), floors / 2); tex.needsUpdate = true;
    const h = floors * 0.32; const m = tint(std(color, 0.8, { map: tex }), x, z);
    root.add(mesh(G.sharp, m, w, h, d, x, h / 2, z)); root.add(mesh(G.box, tint(std(0xd8d2c6, 0.8), x, z), w + 0.06, 0.06, d + 0.06, x, h + 0.03, z));
  }
  const trees = [];   // [x, z, s]
  const addTree = (x, z, s = 1) => trees.push([x, z, s * lerp(0.85, 1.2, R())]);
  const hall = {}, works = {};

  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const cx = bc(i), cz = bc(j), type = SPECIAL[`${i},${j}`];
    if (type === 'hall') {
      const white = tint(std(0xf4f0e7, 0.7), cx, cz, 0.35), trim = tint(std(0x2c4f86, 0.6), cx, cz, 0.4);
      root.add(mesh(G.sharp, white, 1.5, 0.62, 0.8, cx, 0.31 + 0.06, cz - 0.15));
      root.add(mesh(G.sharp, tint(std(0xd7d0c2, 0.8), cx, cz, 0.3), 1.7, 0.06, 1.0, cx, 0.03, cz - 0.1));
      root.add(mesh(G.sharp, white, 1.0, 0.3, 0.62, cx, 0.83, cz - 0.15));
      for (let k = 0; k < 6; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.56, 12), white); c.position.set(cx - 0.5 + k * 0.2, 0.36, cz + 0.33); c.castShadow = true; root.add(c); }
      root.add(mesh(G.sharp, white, 1.16, 0.06, 0.24, cx, 0.66, cz + 0.29));
      const ped = mesh(G.roof, white, 1.16, 0.32, 0.24, cx, 0.69, cz + 0.29); root.add(ped);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.09), new THREE.MeshStandardMaterial({ map: T.hallSign, roughness: 0.7 })); sign.position.set(cx, 0.6, cz + 0.411); root.add(sign);
      root.add(mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.24, 20), white, 1, 1, 1, cx, 1.1, cz - 0.15));
      root.add(mesh(new THREE.SphereGeometry(0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), trim, 1, 1, 1, cx, 1.22, cz - 0.15));
      for (let k = 0; k < 3; k++) root.add(mesh(G.sharp, tint(std(0xe2dccf), cx, cz, 0.3), 0.7 - k * 0.04, 0.025, 0.08, cx, 0.075 + k * 0.025, cz + 0.42 + (2 - k) * 0.05));
      // mastro e bandeira (genérica do município)
      root.add(mesh(new THREE.CylinderGeometry(0.012, 0.015, 1.3, 8), std(0xcfd3d8, 0.3, { metalness: 0.8 }), 1, 1, 1, cx + 0.62, 0.65, cz + 0.72));
      const fc = document.createElement('canvas'); fc.width = 128; fc.height = 80; const fg = fc.getContext('2d');
      fg.fillStyle = '#1f5fbf'; fg.fillRect(0, 0, 128, 80); fg.fillStyle = '#ffffff'; fg.fillRect(0, 30, 128, 20); fg.fillStyle = '#f2c14e'; fg.beginPath(); fg.arc(40, 40, 13, 0, 7); fg.fill();
      const ft = new THREE.CanvasTexture(fc); ft.colorSpace = THREE.SRGBColorSpace;
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.21, 16, 4), tint(std(0xffffff, 0.8, { map: ft, side: THREE.DoubleSide }), cx, cz, 0.4));
      flag.geometry.translate(0.17, 0, 0); flag.position.set(cx + 0.625, 1.18, cz + 0.72); flag.castShadow = true; root.add(flag);
      hall.flag = flag; hall.flagBase = flag.geometry.attributes.position.array.slice();
      for (const [a, b] of [[-0.75, -0.8], [0.75, -0.8], [-0.75, 0.75]]) addTree(cx + a, cz + b, 0.9);
    } else if (type === 'school') {
      const tex = T.bldg.clone(); tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(3, 1); tex.needsUpdate = true;
      root.add(mesh(G.sharp, tint(std(0xf2c14e, 0.8, { map: tex }), cx, cz), 1.6, 0.62, 0.6, cx, 0.31, cz - 0.45));
      root.add(mesh(G.box, tint(std(0xe9e3d6), cx, cz), 1.66, 0.05, 0.66, cx, 0.645, cz - 0.45));
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.09), new THREE.MeshStandardMaterial({ map: T.schoolSign, roughness: 0.7 })); sign.position.set(cx, 0.55, cz - 0.148); root.add(sign);
      addTree(cx - 0.82, cz + 0.85, 0.8); addTree(cx + 0.82, cz + 0.85, 0.8);
    } else if (type === 'ubs') {
      root.add(mesh(G.sharp, tint(std(0xf6f6f2, 0.75, { map: T.house }), cx, cz), 1.3, 0.46, 0.8, cx, 0.23, cz));
      root.add(mesh(G.sharp, tint(std(0x1f8a5b, 0.7), cx, cz), 1.32, 0.07, 0.82, cx, 0.38, cz));
      root.add(mesh(G.box, tint(std(0xe8e6e0), cx, cz), 1.38, 0.05, 0.88, cx, 0.485, cz));
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.095), new THREE.MeshStandardMaterial({ map: T.ubsSign, roughness: 0.7 })); sign.position.set(cx, 0.55, cz + 0.42); root.add(sign);
      root.add(mesh(G.sharp, std(0xdedad2), 0.66, 0.012, 0.1, cx, 0.506, cz + 0.42));
      addTree(cx - 0.75, cz - 0.78); addTree(cx + 0.78, cz - 0.75); addTree(cx + 0.75, cz + 0.8, 0.8);
    } else if (type === 'tower') {
      const leg = std(0x9aa3ad, 0.5, { metalness: 0.4 }); const tx = cx - 0.35, tz = cz - 0.35;
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = mesh(G.sharp, leg, 0.04, 1.5, 0.04, tx + a * 0.22, 0.75, tz + b * 0.22); root.add(l); }
      for (const y of [0.45, 0.95]) for (const r of [0, Math.PI / 2]) { const br = mesh(G.sharp, leg, 0.5, 0.025, 0.025, tx, y, tz); br.rotation.y = r; root.add(br); }
      root.add(mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.5, 28), tint(std(0xdfe9f0, 0.55), tx, tz, 0.5), 1, 1, 1, tx, 1.75, tz));
      root.add(mesh(new THREE.ConeGeometry(0.38, 0.18, 28), tint(std(0x2f6fae, 0.6), tx, tz, 0.5), 1, 1, 1, tx, 2.09, tz));
      root.add(mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.05, 28), tint(std(0x2f6fae, 0.6), tx, tz, 0.5), 1, 1, 1, tx, 1.55, tz));
      house(cx + 0.45, cz + 0.45, 0.62, 0.6, 0.42); house(cx + 0.5, cz - 0.5, 0.55, 0.6, 0.4, Math.PI / 2); addTree(cx - 0.5, cz + 0.6);
    } else if (type === 'works') {
      const conc = std(0xa7a49d, 0.9); const g = new THREE.Group(); g.position.set(cx - 0.1, 0, cz + 0.1); root.add(g);
      for (let f = 0; f < 3; f++) {
        g.add(mesh(G.sharp, conc, 1.1, 0.05, 0.9, 0, 0.36 * (f + 1), 0));
        if (f < 2) for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]]) g.add(mesh(G.sharp, conc, 0.06, 0.36, 0.06, a * 0.5, 0.36 * f + 0.18, b * 0.4));
      }
      for (const [a, b] of [[-1, -1], [1, -1], [0, -1]]) g.add(mesh(G.sharp, conc, 0.06, 0.36, 0.06, a * 0.5, 0.36 * 2 + 0.18, b * 0.4));
      g.add(mesh(G.sharp, std(0xc9733a, 0.8), 0.5, 0.2, 0.4, -0.3, 0.46, 0.1));   // tijolos
      const yel = std(0xe9b40e, 0.55, { metalness: 0.2 }); const crane = new THREE.Group(); crane.position.set(cx + 0.72, 0, cz - 0.62); root.add(crane);
      crane.add(mesh(G.sharp, yel, 0.1, 2.5, 0.1, 0, 1.25, 0));
      const jib = new THREE.Group(); jib.position.y = 2.5; crane.add(jib);
      jib.add(mesh(G.sharp, yel, 2.1, 0.07, 0.08, -0.65, 0.02, 0), mesh(G.sharp, std(0x5b5f66, 0.7), 0.26, 0.16, 0.16, 0.42, -0.04, 0), mesh(G.sharp, yel, 0.07, 0.3, 0.07, 0, 0.17, 0));
      const cab = mesh(G.sharp, std(0x777b82, 0.6), 0.008, 0.9, 0.008, -1.35, -0.45, 0); jib.add(cab);
      const load = mesh(G.sharp, std(0x7b6a55, 0.8), 0.18, 0.1, 0.18, -1.35, -0.92, 0); jib.add(load);
      works.jib = jib; works.load = load; works.cable = cab;
      for (const [a, b, s] of [[-0.75, 0.8, 0.22], [-0.45, 0.85, 0.15]]) root.add(mesh(new THREE.ConeGeometry(s, s * 0.8, 10), std(0x9a7650, 0.95), 1, 1, 1, cx + a, s * 0.4, cz + b));
    } else if (type === 'park') {
      for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2 + 0.3; addTree(cx + Math.cos(a) * 0.72, cz + Math.sin(a) * 0.72 - 0.05, 0.9); }
      addTree(cx - 0.35, cz - 0.3, 1.2);
      for (const [a, b, r] of [[0.0, 0.3, 0], [-0.3, 0.0, Math.PI / 2]]) { const bn = mesh(G.sharp, std(0x8b5e3c, 0.8), 0.18, 0.04, 0.06, cx + a, 0.07, cz + b); bn.rotation.y = r; root.add(bn); }
    } else if (type === 'midrise' || type === 'midrise2') {
      building(cx - 0.35, cz - 0.3, 0.9, 0.8, type === 'midrise' ? 5 : 4, type === 'midrise' ? 0xdfe6ee : 0xf1e3c8);
      house(cx + 0.55, cz + 0.55, 0.55, 0.55, 0.4); addTree(cx - 0.6, cz + 0.65); addTree(cx + 0.7, cz - 0.6, 0.8);
    } else {
      // quarteirão residencial: 2x2 lotes
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const x = cx + a * 0.48, z = cz + b * 0.48;
        if (R() < 0.22) { addTree(x, z, 1.1); continue; }
        if (R() < 0.18) { building(x, z, 0.7, 0.7, 3, PAL[Math.floor(R() * PAL.length)]); continue; }
        house(x + (R() - 0.5) * 0.08, z + (R() - 0.5) * 0.08, lerp(0.5, 0.72, R()), lerp(0.5, 0.7, R()), lerp(0.36, 0.5, R()), R() < 0.5 ? 0 : Math.PI / 2);
        if (R() < 0.5) addTree(x + a * 0.36, z - b * 0.05 * 0, 0.7);
      }
    }
  }
  // árvores ao longo das calçadas
  for (let k = 0; k < 26; k++) { const r = ROADS[1 + Math.floor(R() * (ROADS.length - 2))], along = -S / 2 + 0.6 + R() * (S - 1.2), side = R() < 0.5 ? -1 : 1;
    const off = r + side * (RW / 2 + 0.12); if (ROADS.some((q) => Math.abs(q - along) < RW)) continue; if (R() < 0.5) addTree(along, off, 0.7); else addTree(off, along, 0.7); }

  // ---- árvores (instanciadas): copa facetada + tronco
  const trunkMesh = new THREE.InstancedMesh(G.trunk, std(0x6b4a32, 0.9), trees.length); trunkMesh.castShadow = true;
  const canMat = std(0xffffff, 0.85, { flatShading: true }); const canMesh = new THREE.InstancedMesh(G.canopy, canMat, trees.length * 2); canMesh.castShadow = canMesh.receiveShadow = true;
  const green = [new THREE.Color(0x4f8d3d), new THREE.Color(0x5fa046), new THREE.Color(0x3f7a35), new THREE.Color(0x6aa94d)], dryC = new THREE.Color(0x9a8050), deadC = new THREE.Color(0x7c6446);
  root.add(trunkMesh, canMesh);

  // ---- postes de luz
  const lamps = []; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (const [a, b] of [[-1, -1], [1, 1]]) lamps.push([bc(i) + a * (B / 2 + 0.07), bc(j) + b * (B / 2 + 0.07)]);
  const poleMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.016, 0.62, 6), std(0x5a6068, 0.5, { metalness: 0.5 }), lamps.length); poleMesh.castShadow = true;
  const headMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.03, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), lamps.length);
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), SC = new THREE.Vector3(), E = new THREE.Euler();
  lamps.forEach(([x, z], k) => { M4.compose(V.set(x, 0.31, z), Q.identity(), SC.set(1, 1, 1)); poleMesh.setMatrixAt(k, M4); M4.compose(V.set(x, 0.63, z), Q, SC); headMesh.setMatrixAt(k, M4); });
  root.add(poleMesh, headMesh);
  // halo dos postes (sprites aditivos)
  const haloGeo = new THREE.BufferGeometry(); haloGeo.setAttribute('position', new THREE.Float32BufferAttribute(lamps.flatMap(([x, z]) => [x, 0.6, z]), 3));
  const haloCol = new Float32Array(lamps.length * 3); haloGeo.setAttribute('color', new THREE.BufferAttribute(haloCol, 3));
  const halo = new THREE.Points(haloGeo, new THREE.PointsMaterial({ size: 0.55, map: T.dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true })); root.add(halo);

  // ---- lixo acumulado (só na terra seca)
  const trash = []; for (let k = 0; k < 22; k++) { const r = ROADS[Math.floor(R() * ROADS.length)], along = -S / 2 + 0.5 + R() * (S - 1), side = R() < 0.5 ? -1 : 1, off = r + side * (RW / 2 - 0.06);
    const [x, z] = R() < 0.5 ? [along, off] : [off, along]; for (let q = 0; q < 4; q++) trash.push([x + (R() - 0.5) * 0.16, z + (R() - 0.5) * 0.16, lerp(0.6, 1.3, R()), R() * 6]); }
  trash.push(...[[0.2, 0.1], [-0.1, -0.15], [0.05, 0.25], [-0.2, 0.15], [0.25, -0.1], [0, 0]].map(([a, b], q) => [POI.trash[0] + a, POI.trash[2] + b, 1.4 - q * 0.1, q]));
  const trashMesh = new THREE.InstancedMesh(G.lump, std(0xffffff, 0.9, { flatShading: true }), trash.length); trashMesh.castShadow = true;
  const TC = [new THREE.Color(0x6d6a64), new THREE.Color(0x3d3a36), new THREE.Color(0x8a7458), new THREE.Color(0xb8b2a6)];
  trash.forEach((_, k) => trashMesh.setColorAt(k, TC[k % 4])); root.add(trashMesh);

  // ---- carros (percorrem retângulos de ruas)
  const loops = [[ROADS[1], ROADS[4]], [ROADS[2], ROADS[3]], [ROADS[0], ROADS[5]], [ROADS[1], ROADS[3]], [ROADS[2], ROADS[5]], [ROADS[0], ROADS[2]], [ROADS[3], ROADS[5]], [ROADS[1], ROADS[4]]];
  const CC = [0xd94b3b, 0xf2f2f0, 0x2f6fae, 0x3b3f45, 0xf2c14e, 0x6aa1c8, 0xe7e3da, 0x2c8a63];
  const cars = loops.map(([a, b], k) => {
    const g = new THREE.Group(); const body = std(CC[k], 0.35, { metalness: 0.3 });
    g.add(mesh(G.box, body, 0.32, 0.09, 0.16, 0, 0.075, 0), mesh(G.box, std(0x22272e, 0.2, { metalness: 0.4 }), 0.18, 0.07, 0.14, -0.02, 0.15, 0), mesh(G.sharp, std(0x15171a, 0.9), 0.26, 0.05, 0.17, 0, 0.03, 0));
    root.add(g); return { g, a, b, off: k * 0.37, speed: 0.07 + (k % 3) * 0.012, dir: k % 2 ? 1 : -1 };
  });

  // ---- poeira e chuva
  const nd = 500; const dpos = new Float32Array(nd * 3); const dseed = []; for (let k = 0; k < nd; k++) dseed.push([R() * S - S / 2, R() * 2.4, R() * S - S / 2, R()]);
  const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ size: 0.09, map: T.dot, color: 0xe8cf9c, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true })); root.add(dust);
  const nr = 900; const rpos = new Float32Array(nr * 6); const rseed = []; for (let k = 0; k < nr; k++) rseed.push([R() * (S - 1) - S / 2 + 0.5, R(), R() * (S - 1) - S / 2 + 0.5]);
  const rgeo = new THREE.BufferGeometry(); rgeo.setAttribute('position', new THREE.BufferAttribute(rpos, 3));
  const rain = new THREE.LineSegments(rgeo, new THREE.LineBasicMaterial({ color: 0xcfe2f2, transparent: true, opacity: 0, depthWrite: false })); root.add(rain);

  const state = { base: 0, spots: [], life: 0, lights: 0, grow: 1, dust: 0, rain: 0, rainTop: 5, crane: null };
  const noise = (x, z) => 0.5 * Math.sin(x * 1.7 + z * 0.6) + 0.3 * Math.sin(z * 2.3 - x * 1.1 + 1.3) + 0.2 * Math.sin((x + z) * 3.7);
  function wetAt(x, z) {
    let v = state.base;
    for (const s of state.spots) { if (s.k <= 0) continue; const d = Math.hypot(x - s.x, z - s.z) + noise(x, z) * 0.55; const e = s.r * s.k; v = Math.max(v, (1 - smooth(range(d, e - 0.9, e + 0.15))) * Math.min(1, s.k * 4)); }
    return clamp(v);
  }

  function update(TT) {
    // máscara
    for (let r = 0; r < MASK; r++) { const z = S / 2 - ((r + 0.5) / MASK) * S; for (let c = 0; c < MASK; c++) { const x = -S / 2 + ((c + 0.5) / MASK) * S; const v = Math.round(wetAt(x, z) * 255); const o = (r * MASK + c) * 4; maskData[o] = maskData[o + 1] = maskData[o + 2] = v; maskData[o + 3] = 255; } }
    maskTex.needsUpdate = true;
    let avg = 0; for (let k = 0; k < maskData.length; k += 4) avg += maskData[k]; avg /= MASK * MASK * 255;
    soilMat.color.setRGB(lerp(1.08, 0.78, avg), lerp(1.02, 0.74, avg), lerp(0.9, 0.7, avg));
    for (const t of tinted) { const w = wetAt(t.x, t.z); t.mat.color.copy(t.base).lerp(DUST, (1 - w) * t.dustAmt); }
    // árvores
    trees.forEach(([x, z, s], k) => {
      const w = wetAt(x, z); const gg = s * lerp(0.42, 1, w * smooth(state.grow));
      M4.compose(V.set(x, 0.14 * s, z), Q.identity(), SC.set(s, s, s)); trunkMesh.setMatrixAt(k, M4);
      E.set(k * 0.7, k * 1.3, 0); Q.setFromEuler(E);
      M4.compose(V.set(x, 0.3 * s + 0.12 * gg, z), Q, SC.set(gg, gg * 1.05, gg)); canMesh.setMatrixAt(k * 2, M4);
      M4.compose(V.set(x + 0.06 * gg, 0.3 * s + 0.26 * gg, z - 0.04 * gg), Q, SC.set(gg * 0.75, gg * 0.75, gg * 0.75)); canMesh.setMatrixAt(k * 2 + 1, M4);
      const col = green[k % 4].clone().lerp(k % 5 === 0 ? deadC : dryC, 1 - w); canMesh.setColorAt(k * 2, col); canMesh.setColorAt(k * 2 + 1, col.clone().multiplyScalar(1.08));
    });
    trunkMesh.instanceMatrix.needsUpdate = canMesh.instanceMatrix.needsUpdate = true; canMesh.instanceColor.needsUpdate = true;
    // luzes
    lamps.forEach(([x, z], k) => { const on = clamp(state.lights) * wetAt(x, z); const c = new THREE.Color(0.18, 0.18, 0.19).lerp(new THREE.Color(3.2, 2.6, 1.6), on);
      headMesh.setColorAt(k, c); haloCol[k * 3] = 1.0 * on * 0.55; haloCol[k * 3 + 1] = 0.82 * on * 0.55; haloCol[k * 3 + 2] = 0.55 * on * 0.55; });
    headMesh.instanceColor.needsUpdate = true; haloGeo.attributes.color.needsUpdate = true;
    // lixo
    trash.forEach(([x, z, s, r], k) => { const v = (1 - smooth(wetAt(x, z) * 1.6)) * s; E.set(r, r * 2, r * 0.5); Q.setFromEuler(E); M4.compose(V.set(x, 0.03 * v, z), Q, SC.set(v, v * 0.7, v)); trashMesh.setMatrixAt(k, M4); });
    trashMesh.instanceMatrix.needsUpdate = true;
    // carros
    cars.forEach((c, k) => {
      const a = c.a, b = c.b, L = 4 * (b - a); let s = ((TT * c.speed * 8 + c.off * L) % L + L) % L; if (c.dir < 0) s = L - s;
      const lane = 0.13 * c.dir; let x, z, rot;
      if (s < b - a) { x = a + s; z = a; rot = 0; } else if (s < 2 * (b - a)) { x = b; z = a + s - (b - a); rot = -Math.PI / 2; } else if (s < 3 * (b - a)) { x = b - (s - 2 * (b - a)); z = b; rot = Math.PI; } else { x = a; z = b - (s - 3 * (b - a)); rot = Math.PI / 2; }
      if (c.dir < 0) rot += Math.PI;
      const nx = Math.round(Math.sin(rot) * 100) / 100, nz = Math.round(Math.cos(rot) * 100) / 100;
      c.g.position.set(x + nx * lane, 0, z + nz * lane); c.g.rotation.y = rot;
      const vis = smooth(range(state.life * wetAt(x, z), 0.3 + (k % 4) * 0.12, 0.45 + (k % 4) * 0.12)); c.g.visible = vis > 0.01; c.g.scale.setScalar(Math.max(0.001, vis));
    });
    // guindaste: parado na seca, girando na molhada
    const wW = wetAt(POI.works[0], POI.works[2]); const cr = state.crane != null ? state.crane : wW;
    works.jib.rotation.y = 0.6 + Math.sin(TT * 0.5) * 0.9 * cr; const h = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(TT * 0.8 + 1)) * cr;
    works.cable.scale.y = h / 0.9; works.cable.position.y = -h / 2; works.load.position.y = -h - 0.04;
    // bandeira
    const fp = hall.flag.geometry.attributes.position, fb = hall.flagBase; const wind = 0.15 + 0.85 * wetAt(POI.hall[0], POI.hall[2]);
    for (let k = 0; k < fp.count; k++) { const x0 = fb[k * 3], y0 = fb[k * 3 + 1]; fp.setXYZ(k, x0, y0 - (1 - wind) * x0 * 0.6 * (1 - y0), Math.sin(x0 * 18 - TT * 7) * 0.025 * x0 * 3 * wind); }
    fp.needsUpdate = true; hall.flag.geometry.computeVertexNormals();
    // poeira
    dust.material.opacity = 0.55 * state.dust * (1 - avg * 0.9);
    dseed.forEach(([x, y, z, r], k) => { const t = TT * (0.25 + r * 0.25); dpos[k * 3] = ((x + t + S / 2) % S + S) % S - S / 2; dpos[k * 3 + 1] = 0.1 + ((y + Math.sin(TT * 0.7 + r * 9) * 0.15) % 2.4 + 2.4) % 2.4; dpos[k * 3 + 2] = z + Math.sin(TT * 0.5 + r * 7) * 0.2; });
    dgeo.attributes.position.needsUpdate = true;
    // chuva
    rain.material.opacity = 0.55 * state.rain; rain.visible = state.rain > 0.01;
    if (rain.visible) rseed.forEach(([x, f, z], k) => { const y = state.rainTop - ((f * state.rainTop + TT * 7.5) % state.rainTop); const o = k * 6; rpos[o] = x; rpos[o + 1] = y; rpos[o + 2] = z; rpos[o + 3] = x - 0.02; rpos[o + 4] = y + 0.28; rpos[o + 5] = z; });
    rgeo.attributes.position.needsUpdate = true;
    return avg;
  }
  return { root, state, update, wetAt };
}

// Luzes padrão: céu + sol com sombras suaves (cobre a área informada).
export function lights(scene, { sun = 0xfff1dc, sunI = 2.6, hemiSky = 0xdfeaf5, hemiGround = 0x8b7355, hemiI = 1.1, pos = [8, 14, 6], extent = 10 } = {}) {
  const hemi = new THREE.HemisphereLight(hemiSky, hemiGround, hemiI); scene.add(hemi);
  const d = new THREE.DirectionalLight(sun, sunI); d.position.set(...pos); d.castShadow = true;
  d.shadow.mapSize.set(2048, 2048); const c = d.shadow.camera; c.left = c.bottom = -extent; c.right = c.top = extent; c.near = 1; c.far = 60;
  d.shadow.bias = -0.0004; d.shadow.normalBias = 0.02; d.shadow.radius = 3; scene.add(d, d.target); return { hemi, sun: d };
}

// Nuvem baixa estilizada (esferas achatadas)
export function cloud(seed = 1, color = 0xf4f7fb) {
  const R = rng(seed); const g = new THREE.Group(); const m = std(color, 0.95, { flatShading: false });
  for (let k = 0; k < 11; k++) { const s = lerp(0.6, 1.25, R()); const b = new THREE.Mesh(new THREE.SphereGeometry(s, 20, 14), m); b.scale.y = 0.62;
    b.position.set((R() - 0.5) * 4.2, (R() - 0.3) * 0.5, (R() - 0.5) * 2.2); b.castShadow = true; g.add(b); }
  g.userData.mat = m; return g;
}
