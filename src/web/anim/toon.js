// Personagens 3D estilizados (estética de longa de animação): rosto expressivo com olhos, pálpebras, sobrancelhas e boca
// sincronizada com a fala, mãos com 5 dedos articulados, cabelos e figurinos variados. Tudo determinístico em função do tempo.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp, smooth, rng } from '../core.js';
import { canvasTex } from '../textures.js';

// ------------------------------------------------------------------ Materiais
const _matCache = new Map();
export function skinMat(hex) {
  const k = 'skin' + hex; if (_matCache.has(k)) return _matCache.get(k);
  const m = new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.5, sheen: 0.7, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xff8a6a), clearcoat: 0.04, clearcoatRoughness: 0.6 });
  _matCache.set(k, m); return m;
}
export function cloth(hex, rough = 0.82, sheen = 0.45) {
  const k = `cl${hex}_${rough}_${sheen}`; if (_matCache.has(k)) return _matCache.get(k);
  const m = new THREE.MeshPhysicalMaterial({ color: hex, roughness: rough, sheen, sheenRoughness: 0.75, sheenColor: new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.45) });
  _matCache.set(k, m); return m;
}
export const hairMat = (hex) => { const k = 'hair' + hex; if (_matCache.has(k)) return _matCache.get(k);
  const m = new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.48, sheen: 0.9, sheenRoughness: 0.35, sheenColor: new THREE.Color(hex).lerp(new THREE.Color(0xffffff), 0.35), clearcoat: 0.25, clearcoatRoughness: 0.4, side: THREE.DoubleSide });
  _matCache.set(k, m); return m; };
const shoeMat = (hex) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3 });
const plastic = (hex, r = 0.3) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: r, clearcoat: 0.4 });

function M(geo, mat, parent, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], shadow = true) {
  const m = new THREE.Mesh(geo, mat); m.position.set(...p); m.rotation.set(...r); m.scale.set(...s);
  m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
}
const G = (parent, p = [0, 0, 0], r = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...p); g.rotation.set(...r); if (parent) parent.add(g); return g; };
const sph = (r, ws = 32, hs = 24, ...a) => new THREE.SphereGeometry(r, ws, hs, ...a);
const cap = (r, len, cs = 8, rs = 18) => new THREE.CapsuleGeometry(r, len, cs, rs);

// ------------------------------------------------------------------ Texturas do rosto
function eyeTexture(iris) {
  return canvasTex(512, 256, (g, w, h) => {
    const bg = g.createRadialGradient(128, 128, 20, 128, 128, 200); bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.6, '#f6f4f1'); bg.addColorStop(1, '#e2dcd6');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const R = 46; const c = new THREE.Color(iris);
    const dark = '#' + c.clone().multiplyScalar(0.45).getHexString(), mid = '#' + c.getHexString(), light = '#' + c.clone().lerp(new THREE.Color(0xffffff), 0.35).getHexString();
    const ig = g.createRadialGradient(128, 136, 6, 128, 128, R); ig.addColorStop(0, light); ig.addColorStop(0.55, mid); ig.addColorStop(0.92, dark); ig.addColorStop(1, '#1b1410');
    g.fillStyle = ig; g.beginPath(); g.arc(128, 128, R, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 2;
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; g.beginPath(); g.moveTo(128 + Math.cos(a) * 20, 128 + Math.sin(a) * 20); g.lineTo(128 + Math.cos(a) * (R - 6), 128 + Math.sin(a) * (R - 6)); g.stroke(); }
    g.fillStyle = '#0d0907'; g.beginPath(); g.arc(128, 128, 19, 0, 7); g.fill();
  });
}

// Boca desenhada (lábios, dentes, língua) — atualizada a cada quadro conforme fala e expressão.
const MW = 256, MH = 160;
function drawMouth(g, s, lip, inside = '#4a1a1e') {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, MW, MH); g.setTransform(1.42, 0, 0, 1.42, -128 * 0.42, -62 * 0.42);
  const open = clamp(s.open), wide = clamp(s.wide), rnd = clamp(s.round), smile = clamp(s.smile, -1, 1);
  const cx = MW / 2, cy = 62;
  const hw = 46 * (1 + 0.22 * wide - 0.38 * rnd + 0.12 * Math.max(0, smile)) * (s.width || 1);
  const lift = smile * 15;                       // cantos sobem com o sorriso
  const lx = cx - hw, rx = cx + hw, ly = cy - lift + (s.asym || 0) * 6, ry = cy - lift - (s.asym || 0) * 6;
  const oh = open * 52 * (1 - 0.25 * wide) + rnd * open * 10;   // abertura
  const up = cy - oh * 0.22 - Math.max(0, smile) * 2;           // lábio superior
  const lo = cy + oh * 0.9 + Math.max(0, smile) * 7 * (0.4 + open);  // lábio inferior
  const mid = smile * 10;                        // curvatura central (sorriso)
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (oh < 3.5) {
    // boca fechada: linha suave + volume do lábio inferior
    g.strokeStyle = lip; g.lineWidth = 6.5;
    g.beginPath(); g.moveTo(lx, ly); g.bezierCurveTo(cx - hw * 0.45, cy + mid * 0.9 + 2, cx + hw * 0.45, cy + mid * 0.9 + 2, rx, ry); g.stroke();
    g.strokeStyle = 'rgba(120,40,40,.18)'; g.lineWidth = 9; g.beginPath(); g.moveTo(cx - hw * 0.5, cy + 12 + mid * 0.5); g.quadraticCurveTo(cx, cy + 18 + mid * 0.6, cx + hw * 0.5, cy + 12 + mid * 0.5); g.stroke();
    if (smile > 0.25) { g.strokeStyle = 'rgba(90,40,30,.28)'; g.lineWidth = 4; for (const sx of [-1, 1]) { const x = cx + sx * (hw + 6); g.beginPath(); g.moveTo(x - sx * 2, (sx < 0 ? ly : ry) - 8); g.quadraticCurveTo(x + sx * 5, (sx < 0 ? ly : ry), x, (sx < 0 ? ly : ry) + 8); g.stroke(); } }
    return;
  }
  const path = () => { g.beginPath(); g.moveTo(lx, ly);
    g.bezierCurveTo(cx - hw * 0.55, up + mid * 0.5, cx + hw * 0.55, up + mid * 0.5, rx, ry);
    g.bezierCurveTo(cx + hw * 0.6, lo + mid, cx - hw * 0.6, lo + mid, lx, ly); g.closePath(); };
  path(); g.fillStyle = inside; g.fill();
  g.save(); path(); g.clip();
  // dentes superiores
  g.fillStyle = '#f7f3ec'; g.beginPath(); g.ellipse(cx, up - 4 + mid * 0.4, hw * 0.78, 13 + Math.max(0, smile) * 3, 0, 0, Math.PI * 2); g.fill();
  if (open > 0.55 || smile > 0.5) { g.fillStyle = '#efe9e0'; g.beginPath(); g.ellipse(cx, lo + 6 + mid * 0.8, hw * 0.6, 8, 0, 0, Math.PI * 2); g.fill(); }
  // língua
  g.fillStyle = '#c55a5e'; g.beginPath(); g.ellipse(cx, lo + 2 + mid * 0.8, hw * 0.55, 13 + oh * 0.18, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  path(); g.strokeStyle = lip; g.lineWidth = 5.5; g.stroke();
  g.strokeStyle = 'rgba(120,40,40,.16)'; g.lineWidth = 8; g.beginPath(); g.moveTo(cx - hw * 0.45, lo + mid + 9); g.quadraticCurveTo(cx, lo + mid + 14, cx + hw * 0.45, lo + mid + 9); g.stroke();
}

// ------------------------------------------------------------------ Tronco (perfil de revolução) e utilitário para "vestir" peças sobre ele
function torsoProfile(S) {
  const W = S.width, b = S.belly, f = S.female ? 1 : 0;
  const hem = { suit: -0.17, blazer: -0.17, cardigan: -0.15, polo: -0.12, plaid: -0.08 }[S.top.type] ?? -0.07;
  const low = hem < -0.1 ? [[0.001, hem - 0.005], [0.165 + 0.01 * f + b * 0.02, hem], [0.162 + 0.01 * f + b * 0.03, hem + 0.06]] : [[0.001, hem - 0.005], [0.15 + 0.01 * f, hem], [0.155 + 0.012 * f, -0.02]];
  const lowS = low.map(([r, y]) => [r * Math.max(W, 1) / W, y]);
  return [...lowS, [0.152 + b * 0.045 - 0.012 * f, 0.08], [0.158 + b * 0.05 - 0.008 * f, 0.17],
    [0.17 + b * 0.015, 0.27], [0.18 - 0.01 * f, 0.36], [0.172 - 0.01 * f, 0.43], [0.12, 0.475], [0.055, 0.49], [0.001, 0.495]].map(([r, y]) => [r * W, y]);
}
// Membro afunilado com pontas arredondadas (sem degraus nas articulações). Origem no topo, eixo -y.
function limbGeo(len, r0, r1, seg = 22) {
  const pts = [];
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; pts.push(new THREE.Vector2(Math.max(1e-4, r1 * Math.sin(a)), -len - r1 * Math.cos(a))); }
  for (let i = 1; i <= 4; i++) { const k = i / 5; pts.push(new THREE.Vector2(lerp(r1, r0, k) * (1 + 0.04 * Math.sin(k * Math.PI)), -len * (1 - k))); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; pts.push(new THREE.Vector2(Math.max(1e-4, r0 * Math.cos(a)), r0 * Math.sin(a))); }
  return new THREE.LatheGeometry(pts, seg);
}
const DEPTH = 0.66;   // achatamento frente/costas do tronco
function profileR(P, y) { for (let i = 0; i < P.length - 1; i++) if (y >= P[i][1] && y <= P[i + 1][1]) return lerp(P[i][0], P[i + 1][0], (y - P[i][1]) / (P[i + 1][1] - P[i][1])); return y < P[0][1] ? P[0][0] : P[P.length - 1][0]; }
// Projeta os vértices (x,y) de uma geometria plana sobre a frente do tronco, com afastamento `off`.
function conform(geo, P, off = 0.002, bellyFn = null) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i); const r = profileR(P, y);
    const u = clamp(x / r, -0.98, 0.98); let z = Math.sqrt(1 - u * u) * r * DEPTH;
    if (bellyFn) z += bellyFn(x, y);
    pos.setZ(i, z + off + pos.getZ(i));
  }
  geo.computeVertexNormals(); return geo;
}

// ------------------------------------------------------------------ Mão (palma + 4 dedos + polegar)
function makeHand(parent, s, skin) {
  const hand = G(parent, [0, -0.012, 0]); const curlG = [];
  M(new RoundedBoxGeometry(0.074, 0.082, 0.032, 3, 0.014), skin, hand, [0, -0.045, 0]);
  const fx = [-0.027, -0.009, 0.009, 0.027], fl = [0.036, 0.042, 0.04, 0.032];
  fx.forEach((x, i) => {
    const f = G(hand, [x * s, -0.084, 0.002]); M(cap(0.0105, fl[i] * 0.55), skin, f, [0, -fl[i] * 0.4, 0]);
    const j = G(f, [0, -fl[i] * 0.85, 0]); M(cap(0.0098, fl[i] * 0.45), skin, j, [0, -fl[i] * 0.32, 0]);
    f.rotation.z = -s * (i - 1.5) * 0.06; curlG.push([f, j]);
  });
  const th = G(hand, [s * 0.034, -0.03, 0.012], [0, 0, 0]); M(cap(0.0125, 0.026), skin, th, [0, -0.022, 0]);
  const tj = G(th, [0, -0.045, 0]); M(cap(0.011, 0.02), skin, tj, [0, -0.017, 0]);
  return { hand, fingers: curlG, thumb: th, thumbTip: tj };
}

// ------------------------------------------------------------------ Personagem
export const THIGH = 0.36, SHIN = 0.33, LEGH = 0.03 + 0.36 + 0.33 + 0.061;   // altura do quadril em pé
export const DEFAULT_POSE = {
  rootY: 0, hipsY: 0, hipsX: 0, hipsZ: 0, hipsYaw: 0, spineX: 0, spineY: 0, spineZ: 0, chestX: 0, chestY: 0, chestZ: 0, headX: 0, headY: 0, headZ: 0,
  lShX: 0.03, lShY: 0, lShZ: 0.1, lEl: -0.12, lWrX: 0, lWrY: 0, lWrZ: 0, lCurl: 0.35, lThumb: 0.2, lPoint: 0, lSpread: 0,
  rShX: 0.03, rShY: 0, rShZ: 0.1, rEl: -0.12, rWrX: 0, rWrY: 0, rWrZ: 0, rCurl: 0.35, rThumb: 0.2, rPoint: 0, rSpread: 0,
  lHipX: 0, lHipY: 0, lHipZ: 0, lKnee: 0, lAnkle: 0, rHipX: 0, rHipY: 0, rHipZ: 0, rKnee: 0, rAnkle: 0,
};
export const DEFAULT_FACE = { smile: 0.15, open: 0, wide: 0, round: 0, browUp: 0, browIn: 0, browAsym: 0, lid: 1, squint: 0, blink: 0, mouthW: 1, asym: 0, jaw: 0 };

export function makeToon(spec) {
  const S = { name: 'x', scale: 1, width: 1, belly: 0, female: false, skin: 0xe0ac8a, eyes: 0x5a3a22, brows: null, lip: null,
    hair: { style: 'short', color: 0x2b211b }, top: { type: 'shirt', color: 0xf2f2f0 }, pants: 0x384152, shoes: 0x2a1e18, ...spec };
  const skin = skinMat(S.skin); const P = torsoProfile(S); const W = S.width;
  const root = new THREE.Group(); root.name = S.name;
  const body = G(root); body.scale.setScalar(S.scale);
  const hips = G(body, [0, LEGH, 0]);
  const topC = S.top.color, sleeveMat = cloth(S.top.sleeve ?? topC, S.top.rough ?? 0.82), torsoMat = cloth(topC, S.top.rough ?? 0.82);
  const pantsMat = cloth(S.pants, 0.85, 0.35);
  // quadril (calça)
  const pv = [[0.001, -0.125], [0.07, -0.12], [0.122, -0.095], [0.145, -0.05], [0.148, 0.0], [0.142, 0.05], [0.001, 0.07]].map(([r, y]) => new THREE.Vector2(r * W * (S.female ? 1.04 : 1), y));
  M(new THREE.LatheGeometry(pv, 36), pantsMat, hips, [0, 0, 0], [0, 0, 0], [1, 1, 0.68]);
  // coluna + tronco
  const spine = G(hips, [0, 0.04, 0]);
  const torso = M(new THREE.LatheGeometry(P.map(([r, y]) => new THREE.Vector2(r, y)), 40), torsoMat, spine, [0, 0, 0], [0, 0, 0], [1, 1, DEPTH]);
  const chest = G(spine, [0, 0.25, 0]);
  // cinto (camisa por dentro da calça)
  if (S.belt !== false && !S.female && P[0][1] > -0.1) M(new THREE.TorusGeometry(0.152 * W, 0.013, 8, 40), cloth(S.beltColor ?? 0x2a211c, 0.4), spine, [0, -0.055, 0], [Math.PI / 2, 0, 0], [1, DEPTH * 1.04, 1]);
  // pescoço e cabeça
  M(new THREE.CylinderGeometry(0.05, 0.058, 0.1, 20), skin, chest, [0, 0.265, -0.005]);
  const headPivot = G(chest, [0, 0.275, 0]);
  const head = G(headPivot, [0, 0.13, 0.005]);
  const hs = (S.headScale || 1) * 1.2; head.scale.setScalar(hs);
  const headMesh = M(headGeometry(S), skin, head);
  const cheeks = [];
  const surfZ = (x, y) => { root.updateMatrixWorld(true); const o = head.localToWorld(new THREE.Vector3(x, y, 1)), d = head.localToWorld(new THREE.Vector3(x, y, 0)).sub(o).normalize();
    const h = new THREE.Raycaster(o, d).intersectObject(headMesh)[0]; return h ? head.worldToLocal(h.point.clone()).z : 0.12; };
  const nz = surfZ(0, -0.004);
  M(sph(0.022, 20, 16), skin, head, [0, -0.004, nz - 0.004], [0.2, 0, 0], [S.noseW || 1, 0.95, 1.15]);   // nariz
  M(sph(0.0125, 12, 10), skin, head, [0, -0.022, nz - 0.002], [0, 0, 0], [1.9 * (S.noseW || 1), 0.8, 1]);
  for (const sx of [-1, 1]) M(sph(0.032, 16, 12), skin, head, [sx * 0.119, -0.005, -0.008], [0, sx * 0.4, 0], [0.42, 1, 0.75]);
  // olhos
  const eyeTex = eyeTexture(S.eyes);
  const eyeMat = new THREE.MeshPhysicalMaterial({ map: eyeTex, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
  const lidMat = skinMat(new THREE.Color(S.skin).multiplyScalar(0.94).getHex());
  const lashMat = new THREE.MeshStandardMaterial({ color: S.female ? 0x140d0a : 0x2a1d16, roughness: 0.6 });
  const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const eyes = [-1, 1].map((sx) => {
    const g = G(head, [sx * 0.047, 0.03, 0.102]); g.scale.setScalar(S.eyeS || 1);
    const ball = M(sph(0.031, 32, 24), eyeMat, g, [0, 0, 0], [0, 0, 0], [1, 1, 1], false);
    const up = G(g); M(sph(0.0327, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), lidMat, up, [0, 0, 0], [0, 0, 0], [1, 1, 1], false);
    M(new THREE.TorusGeometry(0.0328, S.female ? 0.0032 : 0.0018, 6, 32), lashMat, up, [0, 0, 0], [Math.PI / 2, 0, 0]);
    if (S.female) M(new THREE.BoxGeometry(0.012, 0.0015, 0.006), lashMat, up, [sx * 0.03, 0.002, 0.012], [0, 0, sx * 0.5]);
    const lo = G(g); M(sph(0.0316, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lidMat, lo, [0, 0, 0], [0, 0, 0], [1, 1, 1], false);
    const shine = M(sph(0.0042, 10, 8), shineMat, head, [sx * 0.047 - 0.009, 0.03 + 0.011, 0.102 + 0.031], [0, 0, 0], [1, 1, 0.5], false);
    return { g, ball, up, lo, shine, sx };
  });
  // sobrancelhas
  const browMat = hairMat(S.brows ?? S.hair.color);
  const brows = [-1, 1].map((sx) => {
    const g = G(head, [sx * 0.049, 0.08, 0.114], [-0.15, sx * 0.32, 0]);
    const inner = G(g);
    M(new THREE.TorusGeometry(0.04, S.browW ?? (S.female ? 0.0052 : 0.0075), 8, 20, 1.05), browMat, inner, [0, -0.04, 0], [0, 0, Math.PI / 2 - 0.525], [1, 0.55, 0.6]);
    return { g, inner, sx, base: g.position.clone() };
  });
  // boca (plano curvo com textura desenhada)
  const mouthTex = canvasTex(MW, MH, () => {}); mouthTex.anisotropy = 4;
  const mg = new THREE.PlaneGeometry(0.098, 0.061, 24, 12); const mp = mg.attributes.position;
  for (let i = 0; i < mp.count; i++) { const x = mp.getX(i), y = mp.getY(i); mp.setZ(i, -x * x * 5.2 - y * y * 3.5); }
  mg.computeVertexNormals();
  const mouth = M(mg, new THREE.MeshStandardMaterial({ map: mouthTex, transparent: true, roughness: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), head, [0, S.mouthY ?? -0.05, surfZ(0, S.mouthY ?? -0.05) + 0.0022], [-0.16, 0, 0], [1, 1, 1], false);
  mouth.renderOrder = 2;
  const lip = S.lip ?? '#' + new THREE.Color(S.skin).lerp(new THREE.Color(0x8a2f2f), 0.55).multiplyScalar(0.7).getHexString();
  // bigode / barba curta
  const hm = hairMat(S.hair.color);
  if (S.mustache) for (const sx of [-1, 1]) M(sph(0.022, 16, 12), hairMat(S.mustache), head, [sx * 0.019, -0.036, surfZ(sx * 0.019, -0.036) - 0.002], [0.1, sx * 0.35, sx * 0.35], [1.25, 0.5, 0.65]);
  if (S.goatee) M(sph(0.022, 16, 12), hairMat(S.goatee), head, [0, -0.1, surfZ(0, -0.1) - 0.008], [0.5, 0, 0], [1.1, 0.75, 0.6]);
  // cabelo
  buildHair(head, S, hm);
  // óculos
  if (S.glasses) {
    const gm = plastic(S.glasses, 0.25);
    for (const sx of [-1, 1]) { M(new THREE.TorusGeometry(0.03, 0.0038, 8, 32), gm, head, [sx * 0.047, 0.028, 0.142], [0, sx * 0.08, 0], [1.08, 0.86, 1]);
      M(cap(0.003, 0.11), gm, head, [sx * 0.09, 0.03, 0.08], [Math.PI / 2, 0, sx * 0.08]); }
    M(new THREE.TorusGeometry(0.012, 0.003, 6, 12, Math.PI), gm, head, [0, 0.036, 0.145], [0, 0, 0]);
    const lens = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 0, transparent: true, opacity: 0.12, depthWrite: false });
    for (const sx of [-1, 1]) M(new THREE.CircleGeometry(0.029, 24), lens, head, [sx * 0.047, 0.028, 0.143], [0, sx * 0.08, 0], [1.08, 0.86, 1], false);
  }
  if (S.hat) buildHat(head, S.hat);

  // figurino do tronco
  dressTop(spine, chest, S, P, torsoMat);

  // braços
  const arms = {};
  for (const [k, sx] of [['l', -1], ['r', 1]]) {
    const sh = G(chest, [sx * 0.158 * W, 0.15, -0.005]);
    M(sph(0.055, 24, 18), sleeveMat, sh, [0, -0.008, 0], [0, 0, 0], [1, 1, 0.9]);
    const short = S.top.shortSleeve;
    const upLen = 0.26;
    M(limbGeo(upLen, 0.052, 0.043), short ? skin : sleeveMat, sh);
    if (short) M(limbGeo(0.1, 0.06, 0.056), sleeveMat, sh, [0, -0.005, 0]);
    const el = G(sh, [0, -upLen, 0]);
    const foLen = 0.22;
    M(limbGeo(foLen, 0.043, 0.035), short ? skin : sleeveMat, el);
    if (!short && S.top.cuff !== false) M(new THREE.CylinderGeometry(0.041, 0.041, 0.028, 20), cloth(S.top.cuffColor ?? (S.top.sleeve ?? topC), 0.8), el, [0, -foLen + 0.012, 0]);
    const wr = G(el, [0, -foLen, 0]);
    const twist = G(wr, [0, 0, 0], [0, -sx * Math.PI / 2, 0]);
    const H = makeHand(twist, sx, skin);
    if (S.watch && sx < 0) M(new THREE.TorusGeometry(0.038, 0.008, 8, 24), plastic(S.watch, 0.3), el, [0, -foLen + 0.035, 0], [Math.PI / 2, 0, 0]);
    arms[k] = { sh, el, wr, twist, ...H, sx, L1: upLen, L2: foLen + 0.075 };
  }
  // pernas
  const legs = {};
  for (const [k, sx] of [['l', -1], ['r', 1]]) {
    const hp = G(hips, [sx * 0.082 * W, -0.03, 0]);
    M(limbGeo(THIGH, 0.083 * (S.female ? 0.98 : 1), 0.066), pantsMat, hp);
    const kn = G(hp, [0, -THIGH, 0]);
    M(limbGeo(SHIN - 0.03, 0.066, 0.061), pantsMat, kn);
    M(new THREE.CylinderGeometry(0.063, 0.068, 0.06, 22), pantsMat, kn, [0, -SHIN + 0.04, 0]);
    const an = G(kn, [0, -SHIN, 0]);
    M(new RoundedBoxGeometry(0.1, 0.072, 0.24, 4, 0.034), shoeMat(S.shoes), an, [0, -0.02, 0.045]);
    M(new RoundedBoxGeometry(0.104, 0.018, 0.245, 2, 0.008), plastic(S.sole ?? 0x1a1512, 0.6), an, [0, -0.052, 0.045]);
    legs[k] = { hp, kn, an, sx };
  }

  const C = { root, body, hips, spine, chest, headPivot, head, eyes, brows, mouth, mouthTex, cheeks, arms, legs, S, lip, torso,
    hairBits: head.userData.swing || [], props: {}, _mouthKey: '' };
  root.userData.toon = C;
  return C;
}

// Cabeça esculpida numa única malha suave (crânio, bochechas cheias, mandíbula e queixo), sem emendas.
const HEAD_R = [0.124, 0.142, 0.13];
function headGeometry(S) {
  const g = new THREE.SphereGeometry(1, 64, 48); const p = g.attributes.position; const jw = S.jawW || 1;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const low = smooth(clamp(-y * 1.4 + 0.05));                           // 0 no alto da cabeça, 1 no queixo
    x *= 1 - 0.13 * low * (2 - jw) + 0.06 * Math.exp(-((y + 0.25) ** 2) / 0.05) * (z > 0 ? 1 : 0.4);
    y *= 1 - 0.1 * low;   // mandíbula + bochechas
    z *= 1 + (z < 0 ? 0.06 * smooth(clamp(y + 0.6)) : 0.03 * Math.exp(-((y + 0.25) ** 2) / 0.06));    // nuca / volume frontal
    if (y < -0.55) z += 0.05 * (y + 0.55) * (z > 0 ? -0.4 : 0.6);          // queixo levemente projetado
    y += z > 0 ? -0.02 * Math.exp(-((y + 0.7) ** 2) / 0.03) : 0;
    p.setXYZ(i, x * HEAD_R[0], y * HEAD_R[1], z * HEAD_R[2]);
  }
  g.computeVertexNormals(); return g;
}
// Casca de cabelo: cobre de theta=tmin(a) até theta=tmax(a), onde a = ângulo em torno do eixo vertical (0 = testa, ±π = nuca).
function hairShell({ tmax, tmin = () => 0, puff = 1.07, top = 1.0, back = 1.0 }) {
  const g = new THREE.SphereGeometry(1, 72, 48); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const th = Math.acos(clamp(y, -1, 1)); const a = Math.atan2(x, z);
    const hi = tmax(a), lo = tmin(a); const t2 = clamp(th, lo, hi); const sn = Math.sin(t2), r = Math.hypot(x, z) || 1e-6;
    x = x / r * sn; z = z / r * sn; y = Math.cos(t2);
    const k = puff + 0.025 * Math.sin(t2) * (z < 0 ? back : 1) + (y > 0.6 ? (top - 1) * (y - 0.6) : 0);
    p.setXYZ(i, x * HEAD_R[0] * k, y * HEAD_R[1] * k, z * HEAD_R[2] * k * (z < 0 ? 1.06 : 1.0));
  }
  g.computeVertexNormals(); return g;
}
const PI = Math.PI;
const bandA = (a, front, side, back, ear = null) => { const u = Math.abs(a) / PI; let v = u < 0.5 ? lerp(front, side, smooth(u / 0.5)) : lerp(side, back, smooth((u - 0.5) / 0.5));
  if (ear != null) v = lerp(v, ear, Math.exp(-((u - 0.5) ** 2) / 0.004)); return v; };
function buildHair(head, S, hm) {
  const h = S.hair; const st = h.style; const swing = [];
  const shell = (o) => M(hairShell(o), hm, head, [0, 0.004, -0.004]);
  if (st === 'none') return;
  if (st === 'bald') { shell({ tmin: (a) => bandA(a, PI, 0.3 * PI, 0.27 * PI), tmax: (a) => bandA(a, 0.3 * PI, 0.5 * PI, 0.64 * PI, 0.44 * PI), puff: 1.035 }); return; }
  if (st === 'short' || st === 'quiff' || st === 'buzz') {
    const part = (a) => (a > 0 ? 0.0 : 0.015 * PI);
    shell({ tmax: (a) => bandA(a, 0.27 * PI, 0.47 * PI, 0.62 * PI, 0.43 * PI) + part(a), puff: st === 'buzz' ? 1.03 : 1.065, top: st === 'quiff' ? 1.16 : 1.03 });
    if (st === 'quiff') M(sph(0.034, 28, 20), hm, head, [0.014, 0.128, 0.078], [0.75, 0.15, 0.25], [1.75, 0.75, 1.25]);
    if (st === 'short') M(sph(0.06, 24, 18), hm, head, [0.03, 0.118, 0.07], [0.6, 0, 0.35], [1.4, 0.45, 0.9]);
    return;
  }
  if (st === 'curly') {
    shell({ tmax: (a) => bandA(a, 0.26 * PI, 0.46 * PI, 0.6 * PI, 0.42 * PI), puff: 1.05 }); const R = rng(S.name.length * 31 + 7);
    for (let i = 0; i < 80; i++) { const th = R() * 1.3, ph = R() * Math.PI * 2; if (Math.sin(ph) > 0.5 && th > 0.85) continue;
      const r = 1.1 + R() * 0.05; const p = [Math.cos(ph) * Math.sin(th) * HEAD_R[0] * r, Math.cos(th) * HEAD_R[1] * r + 0.006, Math.sin(ph) * Math.sin(th) * HEAD_R[2] * r - 0.004];
      M(sph(0.024 + R() * 0.011, 12, 10), hm, head, p); }
    return;
  }
  if (st === 'afro') {
    shell({ tmax: (a) => bandA(a, 0.26 * PI, 0.48 * PI, 0.6 * PI), puff: 1.05 }); const R = rng(91);
    M(sph(0.165, 36, 28), hm, head, [0, 0.1, -0.06], [0, 0, 0], [1.08, 0.86, 0.95]);
    for (let i = 0; i < 70; i++) { const th = R() * 1.7, ph = R() * Math.PI * 2; if (Math.sin(ph) > -0.1 && th > 0.75) continue;
      M(sph(0.035 + R() * 0.015, 12, 10), hm, head, [Math.cos(ph) * Math.sin(th) * 0.178, 0.1 + Math.cos(th) * 0.142, Math.sin(ph) * Math.sin(th) * 0.157 - 0.06]); }
    return;
  }
  if (st === 'bun' || st === 'ponytail' || st === 'long' || st === 'bob') {
    // risca lateral: a franja desce mais de um lado
    const fr = (a) => 0.25 * PI + (a < 0 ? 0.06 * PI * Math.exp(-((a + 0.5) ** 2) / 0.25) : -0.02 * PI);
    const side = st === 'bob' ? 0.66 * PI : 0.5 * PI, back = st === 'bob' ? 0.64 * PI : 0.6 * PI;
    shell({ tmax: (a) => bandA(a, fr(a), side, back, st === 'bob' ? null : 0.47 * PI), puff: st === 'bob' ? 1.09 : 1.06, top: 1.04, back: 1.4 });
    if (st === 'bun') { M(sph(0.064, 28, 20), hm, head, [0, 0.1, -0.13]); M(new THREE.TorusGeometry(0.037, 0.008, 8, 20), cloth(h.tie ?? 0x7a2a3a), head, [0, 0.075, -0.115], [0.9, 0, 0]); }
    if (st === 'ponytail') {
      M(new THREE.TorusGeometry(0.02, 0.008, 8, 16), cloth(h.tie ?? 0xd04060), head, [0, 0.07, -0.145], [0.3, 0, 0]);
      let par = G(head, [0, 0.07, -0.155]); swing.push(par);
      for (let i = 0; i < 3; i++) { M(cap(0.034 - i * 0.007, 0.07), hm, par, [0, -0.045, -0.005], [0.2, 0, 0]); par = G(par, [0, -0.085, -0.008]); swing.push(par); }
    }
    if (st === 'long') { const b = G(head, [0, -0.06, -0.06]); swing.push(b); M(cap(0.11, 0.16), hm, b, [0, -0.06, -0.01], [0.08, 0, 0], [1.15, 1, 0.45]); }
    head.userData.swing = swing;
  }
}
function buildHat(head, hat) {
  const m = cloth(hat.color, 0.9);
  M(sph(0.142, 36, 20, 0, Math.PI * 2, 0, 1.15), m, head, [0, 0.012, -0.004], [-0.22, 0, 0], [0.99, 0.95, 1.07]);
  M(new THREE.CylinderGeometry(0.1, 0.11, 0.012, 28, 1, false, -Math.PI / 2 - 0.9, 1.8), m, head, [0, 0.07, 0.07], [0.25, 0, 0], [1, 1, 1.0]);
}

// Peças sobre o tronco: gola, gravata, lapelas, botões, crachá, logo bordada.
function dressTop(spine, chest, S, P, torsoMat) {
  const T = S.top; const W = S.width;
  const shirtM = cloth(T.shirt ?? 0xf4f5f7, 0.8);
  const vshape = (topW, botY, topY = 0.488, mat = shirtM, off = 0.003) => {   // triângulo subdividido (acompanha a curvatura do peito)
    const g0 = new THREE.PlaneGeometry(2, 1, 10, 12); const pp = g0.attributes.position;
    for (let i = 0; i < pp.count; i++) { const u = pp.getX(i) / 2 * 2, v = pp.getY(i) + 0.5; pp.setXYZ(i, u * topW * v, botY + v * (topY - botY), 0); }
    const g = conform(g0, P, off, S.belly ? bellyFn(S) : null); return M(g, mat, spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false); };
  const strip = (x0, y0, x1, y1, w, mat, off) => { const g = new THREE.PlaneGeometry(1, 1, 1, 10); const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) { const u = pos.getX(i) + 0.5, v = pos.getY(i) + 0.5; const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
      pos.setXYZ(i, lerp(x0, x1, v) + (-dy / L) * (u - 0.5) * w, lerp(y0, y1, v) + (dx / L) * (u - 0.5) * w, 0); }
    return M(conform(g, P, off, S.belly ? bellyFn(S) : null), mat, spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false); };
  const collar = (mat, spread = 0.75) => { for (const sx of [-1, 1]) M(new RoundedBoxGeometry(0.06, 0.035, 0.012, 2, 0.005), mat, chest, [sx * 0.032, 0.215, 0.07], [-0.45, sx * 0.55, sx * spread], [1, 1, 1]); };
  const ring = (mat, r = 0.06) => M(new THREE.TorusGeometry(r, 0.013, 8, 28), mat, chest, [0, 0.215, -0.002], [Math.PI / 2 + 0.25, 0, 0], [1, 0.82, 1]);
  const tie = (col) => { const tm = cloth(col, 0.55, 0.3); M(new RoundedBoxGeometry(0.03, 0.026, 0.02, 2, 0.008), tm, chest, [0, 0.205, 0.088], [-0.3, 0, 0]);
    const g0 = new THREE.PlaneGeometry(1, 1, 2, 14); const pp = g0.attributes.position;
    for (let i = 0; i < pp.count; i++) { const u = pp.getX(i) * 2, v = pp.getY(i) + 0.5; const y = lerp(0.15, 0.465, v); const hw = y > 0.18 ? lerp(0.03, 0.014, (y - 0.18) / 0.285) : 0.03 * (y - 0.15) / 0.03; pp.setXYZ(i, u * hw, y, 0); }
    M(conform(g0, P, 0.007, S.belly ? bellyFn(S) : null), tm, spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false); };
  const buttons = (ys, col = 0xe8e2d6, off = 0.006, x = 0) => ys.forEach((y) => { const g = new THREE.CircleGeometry(0.008, 12); g.translate(x, y, 0); M(conform(g, P, off, S.belly ? bellyFn(S) : null), plastic(col, 0.4), spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false); });
  const t = T.type;
  if (t === 'suit') {
    vshape(0.12 * W, 0.17); tie(T.tie ?? 0x9b1c26);
    strip(-0.122 * W, 0.488, -0.012, 0.17, 0.036, cloth(T.color, 0.7), 0.008); strip(0.122 * W, 0.488, 0.012, 0.17, 0.036, cloth(T.color, 0.7), 0.008);
    buttons([0.14, 0.06], 0x1a1a1f, 0.009); collar(shirtM, 0.6);
    // lenço de bolso
    if (T.pocket) { const g = new THREE.PlaneGeometry(0.045, 0.016); g.translate(0.095 * W, 0.37, 0); M(conform(g, P, 0.01), cloth(T.pocket, 0.6), spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false); }
  } else if (t === 'blazer') {   // social moderno, camisa sem gravata
    vshape(0.12 * W, 0.2); strip(-0.122 * W, 0.488, -0.014, 0.2, 0.038, cloth(T.color, 0.65), 0.008); strip(0.122 * W, 0.488, 0.014, 0.2, 0.038, cloth(T.color, 0.65), 0.008);
    collar(shirtM, 0.85); buttons([0.17], 0x15171c, 0.009); buttons([0.4, 0.33, 0.28], 0xffffff, 0.005);
  } else if (t === 'shirt') {
    collar(cloth(T.color, 0.8), 0.7); buttons([0.42, 0.34, 0.26, 0.18, 0.1, 0.02], 0xf8f8f8, 0.004);
    strip(0, 0.47, 0, -0.06, 0.024, cloth(new THREE.Color(T.color).multiplyScalar(0.96).getHex(), 0.8), 0.002);
    if (T.tie) tie(T.tie); if (T.pocketPen) { const g = new THREE.PlaneGeometry(0.008, 0.05); g.translate(0.085 * W, 0.37, 0); M(conform(g, P, 0.008), plastic(0x2252a8), spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false); }
  } else if (t === 'vest') {
    vshape(0.07 * W, 0.26); collar(shirtM, 0.7); tie(T.tie ?? 0x2f3d63);
  } else if (t === 'blouse') {
    vshape(0.065 * W, 0.34, 0.488, skinMat(S.skin), 0.002); ring(cloth(T.color, 0.8), 0.058);
    if (T.necklace) { M(new THREE.TorusGeometry(0.075, 0.004, 6, 32, Math.PI), plastic(T.necklace, 0.2), chest, [0, 0.19, 0.035], [Math.PI / 2 + 0.85, 0, Math.PI], [1, 0.9, 1]); }
  } else if (t === 'cardigan') {
    vshape(0.07 * W, 0.3, 0.488, cloth(T.inner ?? 0xffffff, 0.85), 0.003); ring(cloth(T.color, 0.9), 0.06);
    strip(-0.012, 0.3, -0.012, -0.07, 0.022, cloth(T.inner ?? 0xffffff, 0.85), 0.003); strip(0.012, 0.3, 0.012, -0.07, 0.022, cloth(T.inner ?? 0xffffff, 0.85), 0.003);
    buttons([0.26, 0.18, 0.1, 0.02], 0x6b4a2a, 0.006, -0.03);
  } else if (t === 'polo') {
    collar(cloth(T.collar ?? T.color, 0.8), 0.5); ring(cloth(T.collar ?? T.color, 0.8), 0.058);
    strip(0, 0.47, 0, 0.36, 0.03, cloth(T.collar ?? T.color, 0.8), 0.003); buttons([0.44, 0.39], 0xffffff, 0.006);
  } else if (t === 'plaid') {
    collar(cloth(T.color, 0.85), 0.7); buttons([0.4, 0.3, 0.2, 0.1, 0.0], 0xf2e8da, 0.004);
  }
  if (S.lanyard) {
    const lm = cloth(S.lanyard, 0.6); const pts = [new THREE.Vector3(-0.06, 0.48, 0), new THREE.Vector3(-0.045, 0.36, 0), new THREE.Vector3(0, 0.26, 0)];
    for (const sx of [-1, 1]) { const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => p.clone().setX(p.x * sx))), 12, 0.006, 6); const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), r = profileR(P, y); pos.setZ(i, Math.sqrt(Math.max(0, 1 - (x / r) ** 2)) * r * DEPTH + 0.006 + pos.getZ(i)); }
      M(g, lm, spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false); }
    const cg = new THREE.PlaneGeometry(0.06, 0.08); cg.translate(0, 0.21, 0); M(conform(cg, P, 0.008, S.belly ? bellyFn(S) : null), new THREE.MeshStandardMaterial({ map: badgeTex(S.badge || S.name), roughness: 0.4 }), spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false);
  }
  if (T.logo) {   // logo DigitalGov aplicada (sem deformar: plano com a proporção original 588x189)
    const w = T.logoW ?? 0.085, h = w * 189 / 588; const g = new THREE.PlaneGeometry(w + 0.012, h + 0.012); g.translate(T.logoX ?? 0.08 * W, T.logoY ?? 0.36, 0);
    M(conform(g, P, 0.006), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false);
    const g2 = new THREE.PlaneGeometry(w, h); g2.translate(T.logoX ?? 0.08 * W, T.logoY ?? 0.36, 0);
    M(conform(g2, P, 0.0075), new THREE.MeshStandardMaterial({ map: logoTexture(), roughness: 0.5, transparent: true }), spine, [0, 0, 0], [0, 0, 0], [1, 1, 1], false);
  }
}
const bellyFn = (S) => (x, y) => S.belly * 0.04 * Math.exp(-((y - 0.12) ** 2) / 0.012) * Math.exp(-(x * x) / 0.01);

let _logoTex = null;
export function logoTexture() {
  if (_logoTex) return _logoTex;
  const img = document.getElementById('logo-src'); const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.needsUpdate = true;
  t.minFilter = THREE.LinearMipmapLinearFilter; _logoTex = t; return t;
}
function badgeTex(label) {
  return canvasTex(192, 256, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f5fa8'; g.fillRect(0, 0, w, 52);
    g.fillStyle = '#fff'; g.font = '700 22px Inter'; g.textAlign = 'center'; g.fillText('PREFEITURA', w / 2, 34);
    g.fillStyle = '#d8dee8'; g.fillRect(56, 70, 80, 90); g.fillStyle = '#9aa6b8'; g.beginPath(); g.arc(96, 102, 22, 0, 7); g.fill(); g.fillRect(66, 130, 60, 30);
    g.fillStyle = '#1b2a44'; g.font = '700 24px Inter'; g.fillText(label, w / 2, 200); g.font = '500 16px Inter'; g.fillStyle = '#5a6a80'; g.fillText('Servidor(a)', w / 2, 226);
  });
}

// ------------------------------------------------------------------ Aplicação de pose e rosto
const _e = new THREE.Euler(), _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _m = new THREE.Matrix4();
export function applyPose(C, p) {
  // deslocamentos somados ao repouso; dedos (curl/polegar/apontar/abertura) são absolutos
  const P = {}; for (const k in DEFAULT_POSE) P[k] = /(Curl|Thumb|Point|Spread)$/.test(k) ? (p[k] ?? DEFAULT_POSE[k]) : DEFAULT_POSE[k] + (p[k] ?? 0);
  C.root.position.y = P.rootY;
  C.hips.position.y = LEGH + P.hipsY; C.hips.rotation.set(P.hipsX, P.hipsYaw, P.hipsZ);
  C.spine.rotation.set(P.spineX, P.spineY, P.spineZ); C.chest.rotation.set(P.chestX, P.chestY, P.chestZ);
  C.headPivot.rotation.set(P.headX, P.headY, P.headZ, 'YXZ');
  for (const k of ['l', 'r']) {
    const A = C.arms[k], s = A.sx;
    A.sh.rotation.set(P[k + 'ShX'], P[k + 'ShY'] * s, P[k + 'ShZ'] * s); A.el.rotation.set(P[k + 'El'], 0, 0);   // IK (se houver) é aplicado depois, a cada quadro
    A.wr.rotation.set(P[k + 'WrX'], -P[k + 'WrY'] * s, P[k + 'WrZ'] * s);
    const curl = P[k + 'Curl'], pt = P[k + 'Point'], spread = P[k + 'Spread'];
    A.fingers.forEach(([f, j], i) => { const c = i === 1 ? curl * (1 - pt) : curl; f.rotation.x = -c * 1.25; j.rotation.x = -c * 1.35; f.rotation.z = -s * (i - 1.5) * (0.06 + spread * 0.12); });
    A.thumb.rotation.set(-0.35 - P[k + 'Thumb'] * 0.6, 0, s * (0.55 - P[k + 'Thumb'] * 0.3)); A.thumbTip.rotation.x = -0.25 - P[k + 'Thumb'] * 0.5;
    A.ik = false;
  }
  for (const k of ['l', 'r']) { const L = C.legs[k], s = L.sx; L.hp.rotation.set(P[k + 'HipX'], P[k + 'HipY'] * s, P[k + 'HipZ'] * s); L.kn.rotation.x = P[k + 'Knee']; L.an.rotation.x = P[k + 'Ankle']; }
}

// IK de 2 segmentos (ombro→cotovelo→punho) até um ponto do mundo. pole: direção do cotovelo (mundo).
export function reachArm(C, side, target, { pole = null, bend = 1, wristFollow = true } = {}) {
  const A = C.arms[side]; A.ik = true; const s = A.sx;
  A.sh.rotation.set(0, 0, 0); A.el.rotation.set(0, 0, 0); A.sh.updateWorldMatrix(true, false);
  const sc = C.body.scale.x * (C.head.parent ? 1 : 1);
  const local = A.sh.worldToLocal(_v.copy(target)); const L1 = A.L1, L2 = A.L2 * 0.78;
  const d = clamp(local.length(), 0.05, (L1 + L2) * 0.999);
  const a1 = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a2 = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  const dir = local.clone().normalize();
  // orienta o "comprimento" do braço (-y) para o alvo; gira em torno do eixo para que o cotovelo fique para fora/baixo
  _q.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir); A.sh.quaternion.copy(_q);
  // ângulo de rolagem: cotovelo aponta para o lado de fora e para trás
  const poleL = pole ? A.sh.parent.worldToLocal(_v2.copy(pole)).sub(A.sh.position).normalize() : new THREE.Vector3(s * 0.7, -0.3, -0.65).normalize();
  // projeta o polo no plano perpendicular a dir e alinha o eixo +z local (para onde o antebraço dobra é -z->+z) com ele
  const zAxis = new THREE.Vector3(0, 0, 1).applyQuaternion(_q); const pp = poleL.clone().sub(dir.clone().multiplyScalar(poleL.dot(dir))).normalize();
  let ang = Math.atan2(new THREE.Vector3().crossVectors(zAxis, pp).dot(dir), zAxis.dot(pp));
  A.sh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(dir, ang + Math.PI));
  A.sh.rotateX(-a1 * bend); A.el.rotation.set((Math.PI - a2) * bend, 0, 0);
  A.ik = true; return A;
}

// Rosto: expressão + sincronia labial + piscadas + olhar.
export function applyFace(C, f, t, gazeWorld = null) {
  const F = { ...DEFAULT_FACE, ...f };
  // piscadas naturais (intervalos irregulares e determinísticos)
  const seed = C.S.name.length * 1.37 + (C.S.blinkSeed || 0);
  const per = 3.1 + (seed % 1.3); const ph = (t + seed * 2.1) % per;
  const blinkAuto = ph < 0.16 ? Math.sin(ph / 0.16 * Math.PI) : 0;
  const blink = Math.max(blinkAuto, F.blink);
  const open = clamp(F.lid * (C.S.lid ?? 1) - blink * 1.05 - F.squint * 0.2, 0, 1.2);
  C.eyes.forEach((E) => {
    E.up.rotation.x = lerp(1.62, -0.55 - 0.12 * F.browUp, open) + F.squint * 0.12;
    E.lo.rotation.x = lerp(-0.45, 0.32, 1 - F.squint * 0.8 - Math.max(0, F.smile) * 0.2) - blink * 0.12;
    E.shine.visible = open > 0.45;
  });
  // olhar
  if (gazeWorld) {
    C.eyes.forEach((E) => { E.g.updateWorldMatrix(true, false); const loc = E.g.worldToLocal(_v.copy(gazeWorld)).normalize();
      const yaw = clamp(Math.atan2(loc.x, loc.z), -0.6, 0.6), pitch = clamp(Math.asin(clamp(loc.y, -1, 1)), -0.4, 0.4);
      E.ball.rotation.set(-pitch, yaw, 0); });
  }
  // micro-sacadas
  const sx = Math.sin(t * 1.7 + seed) * 0.03 * (Math.sin(t * 0.6 + seed * 3) > 0.3 ? 1 : 0);
  C.eyes.forEach((E) => { E.ball.rotation.y += sx; });
  // sobrancelhas
  C.brows.forEach((B) => { B.g.position.y = B.base.y + F.browUp * 0.012 - F.browIn * 0.004 + B.sx * F.browAsym * 0.006;
    B.inner.rotation.z = B.sx * (F.browIn * 0.22 - F.browUp * 0.06) ; });
  // bochechas sobem com o sorriso
  // boca
  const ms = { open: F.open + F.jaw, wide: F.wide, round: F.round, smile: F.smile, width: F.mouthW, asym: F.asym };
  const key = [ms.open, ms.wide, ms.round, ms.smile, ms.asym].map((x) => x.toFixed(2)).join();
  if (key !== C._mouthKey) { drawMouth(C.mouthTex.userData.g, ms, C.lip); C.mouthTex.needsUpdate = true; C._mouthKey = key; }
}

// Cabeça e olhos voltados para um ponto (mistura com a pose atual). amount = quanto a cabeça acompanha.
export function lookAt(C, world, amount = 0.7, limit = 1.0) {
  C.headPivot.updateWorldMatrix(true, false);
  const par = C.headPivot.parent; par.updateWorldMatrix(true, false);
  const loc = par.worldToLocal(_v.copy(world)).sub(C.headPivot.position);
  const yaw = clamp(Math.atan2(loc.x, loc.z), -limit, limit), pitch = clamp(Math.atan2(loc.y - 0.13, Math.hypot(loc.x, loc.z)), -0.5, 0.45);
  C.headPivot.rotation.y += yaw * amount; C.headPivot.rotation.x += -pitch * amount;
}
