// Atuação: poses, trilhas de keyframes, caminhada, respiração/peso, fala (boca + cabeça + sobrancelhas) e olhar.
import * as THREE from 'three';
import { clamp, lerp, smooth, range, easeInOutCubic, easeInOutSine } from '../core.js';
import { applyPose, applyFace, lookAt, reachArm, DEFAULT_POSE } from './toon.js';

// ------------------------------------------------------------------ Fala
let SPEECH = { at: {}, lips: {}, lines: {} };
export function setSpeech(TL, lips, lines) { for (const n of TL.lines) SPEECH.at[n.id] = n.at; SPEECH.lips = lips; SPEECH.lines = lines; }
export function lineSpan(id) { return [SPEECH.at[id], SPEECH.at[id] + SPEECH.lines[id].dur]; }
// Curvas de boca do personagem `who` no tempo global T (0 quando não fala).
export function mouthAt(who, T) {
  for (const id in SPEECH.lines) {
    if (SPEECH.lines[id].who !== who) continue; const a = SPEECH.at[id]; if (a == null) continue;
    const L = SPEECH.lips[id]; const f = (T - a) * 30; if (f < -1 || f > L.open.length + 1) continue;
    const i = Math.floor(f), k = f - i; const g = (arr, j) => arr[clamp(j, 0, arr.length - 1)] || 0;
    const v = (arr) => lerp(g(arr, i), g(arr, i + 1), k);
    const env = clamp(Math.min(f + 1, L.open.length + 1 - f) / 3);
    // ênfase: picos de energia após respiros
    const emph = clamp(v(L.open) - 0.5 * (g(L.open, i - 6) + g(L.open, i - 8)), 0, 1);
    return { id, open: v(L.open) * env, wide: v(L.wide) * env, round: v(L.round) * env, emph, active: true, p: f / L.open.length };
  }
  return { open: 0, wide: 0, round: 0, emph: 0, active: false };
}

// ------------------------------------------------------------------ Keyframes genéricos
// keys: [[t, valor(número ou objeto de pose)], ...]; interpolação suave entre chaves.
export function track(t, keys, ease = easeInOutCubic) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t <= t1) { const k = ease((t - t0) / Math.max(1e-6, t1 - t0)); return mix(a, b, k); }
  }
  return keys[keys.length - 1][1];
}
export function mix(a, b, k) {
  if (typeof a === 'number') return lerp(a, b, k);
  if (Array.isArray(a)) return a.map((x, i) => lerp(x, b[i], k));
  // poses são deslocamentos: a chave ausente vale 0 (o repouso é somado em applyPose)
  const o = { ...a }; for (const key in b) o[key] = lerp(a[key] ?? 0, b[key], k);
  for (const key in a) if (!(key in b)) o[key] = lerp(a[key], 0, k);
  return o;
}
export const add = (...ps) => { const o = {}; for (const p of ps) for (const k in p) o[k] = (o[k] ?? 0) + p[k]; return o; };

// ------------------------------------------------------------------ Biblioteca de poses (deslocamentos em relação ao repouso)
export const P = {
  stand: {},
  relaxed: { lShZ: 0.08, rShZ: 0.08, lEl: -0.18, rEl: -0.18 },
  handsFront: { lShX: -0.35, rShX: -0.35, lShZ: 0.05, rShZ: 0.05, lEl: -1.25, rEl: -1.25, lShY: -0.35, rShY: -0.35, lCurl: 0.55, rCurl: 0.55 },
  hipL: { lShZ: 0.55, lShX: 0.25, lEl: -1.6, lShY: 0.5, lWrX: 0.3, lCurl: 0.75 },
  hipR: { rShZ: 0.55, rShX: 0.25, rEl: -1.6, rShY: 0.5, rWrX: 0.3, rCurl: 0.75 },
  openR: { rShX: -0.6, rShZ: 0.3, rEl: -1.0, rWrY: -1.3, rCurl: 0.1, rThumb: 0.0, rSpread: 0.6 },
  openL: { lShX: -0.6, lShZ: 0.3, lEl: -1.0, lWrY: -1.3, lCurl: 0.1, lThumb: 0.0, lSpread: 0.6 },
  openBoth: { lShX: -0.55, lShZ: 0.35, lEl: -0.95, lWrY: -1.3, lCurl: 0.1, lSpread: 0.6, rShX: -0.55, rShZ: 0.35, rEl: -0.95, rWrY: -1.3, rCurl: 0.1, rSpread: 0.6 },
  shrug: { lShX: -0.2, rShX: -0.2, lShZ: 0.45, rShZ: 0.45, lEl: -1.35, rEl: -1.35, lWrY: -1.4, rWrY: -1.4, lCurl: 0.1, rCurl: 0.1, lSpread: 0.6, rSpread: 0.6, headZ: 0.12 },
  chinR: { rShX: -0.65, rShZ: -0.1, rShY: -0.4, rEl: -2.25, rWrX: -0.3, rCurl: 0.7, rThumb: 0.6, lShX: -0.35, lShZ: -0.05, lShY: -0.6, lEl: -1.6, lCurl: 0.6 },
  armsCross: { lShX: -0.45, rShX: -0.45, lShY: -0.75, rShY: -0.75, lShZ: 0.1, rShZ: 0.1, lEl: -1.95, rEl: -1.95, lCurl: 0.6, rCurl: 0.6 },
  pointR: { rShX: -1.15, rShZ: 0.15, rEl: -0.25, rCurl: 0.95, rPoint: 1, rThumb: 0.7 },
  presentR: { rShX: -0.55, rShZ: 0.75, rEl: -0.55, rWrY: -1.2, rWrZ: 0.25, rCurl: 0.08, rSpread: 0.5, rThumb: 0.1 },
  presentL: { lShX: -0.55, lShZ: 0.75, lEl: -0.55, lWrY: -1.2, lWrZ: 0.25, lCurl: 0.08, lSpread: 0.5, lThumb: 0.1 },
  waveR: { rShX: -0.2, rShZ: 2.3, rEl: -1.1, rWrY: -1.5, rCurl: 0.05, rSpread: 0.6, rThumb: 0.0 },
  chestR: { rShX: -0.5, rShZ: -0.05, rShY: -0.5, rEl: -1.9, rWrY: -0.6, rCurl: 0.15, rSpread: 0.3 },
  holdBox: { lShX: -0.55, rShX: -0.55, lShZ: 0.22, rShZ: 0.22, lEl: -1.15, rEl: -1.15, lWrY: -0.2, rWrY: -0.2, lCurl: 0.35, rCurl: 0.35, spineX: -0.05 },
  holdFolder: { rShX: -0.5, rShZ: 0.05, rShY: -0.35, rEl: -1.45, rWrY: -0.5, rCurl: 0.45, lShX: -0.45, lShY: -0.4, lEl: -1.4, lWrY: -0.7, lCurl: 0.4 },
  sit: { hipsY: -0.25, lHipX: -1.25, rHipX: -1.25, lKnee: 1.25, rKnee: 1.25, lAnkle: 0.0, rAnkle: 0.0, lHipZ: 0.06, rHipZ: 0.06, spineX: -0.04 },
  sitBench: { hipsY: -0.17, lHipX: -1.12, rHipX: -1.12, lKnee: 1.12, rKnee: 1.12, lHipZ: 0.08, rHipZ: 0.08, spineX: -0.06 },
  typing: { lShX: -0.55, rShX: -0.55, lShZ: 0.12, rShZ: 0.12, lShY: -0.25, rShY: -0.25, lEl: -0.95, rEl: -0.95, lWrX: 0.15, rWrX: 0.15, lWrY: -1.45, rWrY: -1.45, lCurl: 0.45, rCurl: 0.45, spineX: 0.1 },
  mouse: { rShX: -0.45, rShZ: 0.18, rShY: -0.1, rEl: -1.05, rWrY: -1.5, rCurl: 0.55, rThumb: 0.3 },
  lean: { spineX: 0.35, chestX: 0.12, headX: 0.1 },
  happyUp: { lShX: -0.3, rShX: -0.3, lShZ: 0.5, rShZ: 0.5, lEl: -1.7, rEl: -1.7, lCurl: 0.9, rCurl: 0.9, lThumb: 0.8, rThumb: 0.8 },
};
export const F = {
  neutral: { smile: 0.15 }, smile: { smile: 0.75, squint: 0.1 }, bigSmile: { smile: 1, squint: 0.18, jaw: 0.08 }, worried: { smile: -0.25, browIn: -0.6, browUp: 0.5 },
  confused: { smile: -0.1, browAsym: 1, browUp: 0.4, asym: 0.4 }, surprised: { smile: 0.2, browUp: 1, lid: 1.15, jaw: 0.15 }, focus: { smile: 0, browIn: 0.35, squint: 0.2 },
  relief: { smile: 0.8, browUp: 0.5, squint: 0.15 }, proud: { smile: 0.6, browUp: 0.15 }, think: { smile: 0, browAsym: 0.6, browIn: 0.2, asym: 0.3 },
};

// ------------------------------------------------------------------ Movimentos de base
// Respiração + troca de peso sutil (sempre ativo para nunca parecer "parado")
export function idle(C, t, amt = 1) {
  const s = C.S.name.length * 0.73; const b = Math.sin(t * 1.55 + s);
  const w = Math.sin(t * 0.37 + s * 2) * amt;
  return { spineX: 0.012 * b * amt, chestX: -0.01 * b * amt, hipsZ: 0.018 * w, spineZ: -0.02 * w, headZ: 0.015 * Math.sin(t * 0.5 + s), headY: 0.03 * Math.sin(t * 0.29 + s * 3) * amt,
    headX: 0.012 * Math.sin(t * 0.8 + s), lShZ: 0.01 * b, rShZ: 0.01 * b, lHipZ: -0.018 * w, rHipZ: -0.018 * w, lKnee: Math.max(0, w) * 0.05, rKnee: Math.max(0, -w) * 0.05 };
}
// Ciclo de caminhada (fase em ciclos; amt 0..1 para entrar/sair)
export function walkPose(ph, amt = 1, style = {}) {
  const a = ph * Math.PI * 2, s = Math.sin(a), c = Math.cos(a); const sw = style.arms ?? 1;
  return { lHipX: s * 0.46 * amt, rHipX: -s * 0.46 * amt,
    lKnee: (Math.max(0, -c) * 0.85 + 0.08) * amt, rKnee: (Math.max(0, c) * 0.85 + 0.08) * amt,
    lAnkle: -s * 0.18 * amt, rAnkle: s * 0.18 * amt,
    hipsY: -Math.abs(Math.sin(a)) * 0.022 * amt + 0.008 * amt, hipsYaw: s * 0.09 * amt, spineY: -s * 0.12 * amt, hipsZ: c * 0.025 * amt,
    lShX: -s * 0.38 * amt * sw, rShX: s * 0.38 * amt * sw, lEl: -0.25 * amt - Math.max(0, s) * 0.3 * amt * sw, rEl: -0.25 * amt - Math.max(0, -s) * 0.3 * amt * sw,
    spineX: 0.04 * amt, headY: s * 0.05 * amt };
}
// Trajeto por pontos [[x,z],...] percorrido entre t0 e t1 (com aceleração/desaceleração). Retorna posição, direção e pose.
export function walkPath(t, t0, t1, pts, stride = 1.25, style = {}) {
  const segs = []; let L = 0;
  for (let i = 0; i < pts.length - 1; i++) { const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segs.push([L, d]); L += d; }
  const u = clamp((t - t0) / (t1 - t0)); const ease = (x) => { const r = 0.12; if (x < r) return x * x / (2 * r * (1 - r)); if (x > 1 - r) return 1 - (1 - x) * (1 - x) / (2 * r * (1 - r)); return (x - r / 2) / (1 - r); };
  const dist = ease(u) * L; let i = segs.findIndex(([a, d]) => dist <= a + d); if (i < 0) i = segs.length - 1;
  const k = segs[i][1] > 0 ? (dist - segs[i][0]) / segs[i][1] : 0;
  const x = lerp(pts[i][0], pts[i + 1][0], k), z = lerp(pts[i][1], pts[i + 1][1], k);
  // direção suavizada nas curvas
  const dirAt = (j) => Math.atan2(pts[j + 1][0] - pts[j][0], pts[j + 1][1] - pts[j][1]);
  let yaw = dirAt(i); if (i < segs.length - 1 && k > 0.7) { let d2 = dirAt(i + 1); while (d2 - yaw > Math.PI) d2 -= 2 * Math.PI; while (d2 - yaw < -Math.PI) d2 += 2 * Math.PI; yaw = lerp(yaw, d2, smooth((k - 0.7) / 0.3) * 0.5); }
  if (i > 0 && k < 0.3) { let d0 = dirAt(i - 1); while (d0 - yaw > Math.PI) d0 -= 2 * Math.PI; while (d0 - yaw < -Math.PI) d0 += 2 * Math.PI; yaw = lerp(yaw, d0, (1 - smooth(k / 0.3)) * 0.5); }
  const moving = u > 0 && u < 1; const amt = moving ? smooth(Math.min(u, 1 - u) * (L / 0.6)) : 0;
  return { x, z, yaw, pose: walkPose(dist / stride, Math.min(1, amt * 1.0), style), moving, u };
}

// Fala: boca + acenos de cabeça + sobrancelhas acompanhando a ênfase
export function talk(C, who, T, base = {}) {
  const m = mouthAt(who, T); const face = { ...F.neutral, ...base };
  if (!m.active) return { face, pose: {} , m };
  face.open = m.open * 0.95; face.wide = m.wide * 0.8; face.round = m.round * 0.9;
  face.browUp = (face.browUp || 0) + m.emph * 0.9; face.smile = (face.smile || 0) - m.open * 0.1;
  const nod = Math.sin(T * 5.3) * 0.03 * m.open + m.emph * 0.07;
  return { face, pose: { headX: nod, headZ: Math.sin(T * 2.1) * 0.025 * m.open, headY: Math.sin(T * 1.3 + 1) * 0.04, chestX: m.emph * 0.03 }, m };
}

// Aplica tudo de uma vez a um personagem.
export function act(C, T, { pose = {}, face = {}, look = null, lookAmt = 0.65, who = null, pos = null, yaw = null, ik = null } = {}) {
  const tk = who ? talk(C, who, T, face) : { face: { ...F.neutral, ...face }, pose: {} };
  const p = add(pose, tk.pose);
  if (pos) { C.root.position.x = pos[0]; C.root.position.z = pos[1]; if (pos.length > 2) C.root.position.y = pos[2]; }
  if (yaw != null) C.root.rotation.y = yaw;
  applyPose(C, p);
  if (look) lookAt(C, look, lookAmt);
  if (ik) for (const [side, target, opts] of ik) reachArm(C, side, target, opts || {});
  // cabelo (rabo de cavalo) balança com o movimento da cabeça
  C.hairBits.forEach((b, i) => { b.rotation.x = Math.sin(T * 3.1 + i) * 0.06 - (p.headX || 0) * 0.5; b.rotation.z = Math.sin(T * 2.3 + i * 0.7) * 0.05 + (p.headZ || 0) * 0.6 + (p.hipsZ || 0) * 2; });
  applyFace(C, tk.face, T, look);
  return tk;
}
export const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// Ponto do mundo na altura dos olhos de outro personagem
export function eyesOf(C) { const v = new THREE.Vector3(); C.head.updateWorldMatrix(true, false); return C.head.localToWorld(v.set(0, 0.02, 0.1)); }

// ------------------------------------------------------------------ Câmera por planos (corte seco entre planos, movimento suave dentro do plano)
const _cp = new THREE.Vector3(), _cl = new THREE.Vector3(), _cb = new THREE.Vector3(), _cbl = new THREE.Vector3();
export function shots(camera, t, list) {
  let s = list[0]; for (const x of list) if (t >= x.t0) s = x;
  const k = (s.ease || easeInOutSine)(clamp((t - s.t0) / (s.t1 - s.t0)));
  const b = s.b || s.a;
  _cp.set(...s.a.p).lerp(_cb.set(...b.p), k); _cl.set(...s.a.l).lerp(_cbl.set(...b.l), k);
  camera.position.copy(_cp); camera.lookAt(_cl);
  const fov = lerp(s.a.fov || 35, b.fov || s.a.fov || 35, k); if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  const hand = s.hand ?? 1;   // câmera "na mão" muito sutil
  camera.rotateZ(Math.sin(t * 0.9) * 0.0012 * hand); camera.rotateX(Math.sin(t * 0.63 + 1) * 0.001 * hand); camera.rotateY(Math.sin(t * 0.47) * 0.001 * hand);
  return s;
}
// Distância de foco até um personagem (olhos) ou ponto
export function focusOn(camera, target) { const p = target.isVector3 ? target : eyesOf(target); return camera.position.distanceTo(p); }

// ------------------------------------------------------------------ Objetos carregados
import { archiveBox as _archiveBox } from '../inst/kit.js';
const _cv = new THREE.Vector3();
export const carry = {
  // Caixa-arquivo presa ao peito; as mãos seguram as laterais por IK.
  box(C, label, { w = 0.36, h = 0.27, d = 0.14 } = {}) {
    const b = _archiveBox(label, { seed: label.code.length * 7 + 3, w, h, d }); const g = new THREE.Group(); g.add(b); b.position.set(0, -h / 2, 0);
    g.position.set(0, 0.0, 0.29); C.chest.add(g); g.userData.size = [w, h, d]; return g;
  },
  ik(C, g, spread = 1) { g.updateWorldMatrix(true, false); const [w, h] = g.userData.size;
    return [['l', g.localToWorld(new THREE.Vector3(-w / 2 * spread, -0.02, 0.02))], ['r', g.localToWorld(new THREE.Vector3(w / 2 * spread, -0.02, 0.02))]]; },
};
// Objeto preso à mão (pasta, prancheta, papel). pos/rot no referencial da mão.
carry.inHand = (C, side, obj, pos = [0, -0.08, 0.03], rot = [0, 0, 0]) => { const h = C.arms[side].hand; obj.position.set(...pos); obj.rotation.set(...rot); h.add(obj); return obj; };
carry.folder = (color = 0x2f5ea8, w = 0.24, h = 0.32) => { const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.012), new THREE.MeshStandardMaterial({ color, roughness: 0.6 })); m.castShadow = true; g.add(m);
  const p = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, h * 0.96, 0.008), new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.85 })); p.position.z = -0.009; p.castShadow = true; g.add(p); return g; };
