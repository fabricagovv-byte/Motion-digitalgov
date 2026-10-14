// Kit de cenografia do filme institucional: materiais, mobiliário, equipamentos e pessoas.
// Estética: "clay render" realista (materiais foscos, luz natural, sombras suaves) — sem rostos sintéticos.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { rng, lerp, clamp, smooth, range } from '../core.js';
import { canvasTex } from '../textures.js';
import { boxLabelTexture, docTexture } from './docs.js';

const std = (color, roughness = 0.7, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
export const MAT = {
  floor: std(0xb9b4ab, 0.62), wall: std(0xe9e6e0, 0.92), wallAccent: std(0x2d3e5c, 0.85), ceiling: std(0xf1f0ec, 0.95),
  oak: std(0xb48a5f, 0.55), oakDark: std(0x8a6744, 0.6), white: std(0xeceef1, 0.55), steel: std(0x8d949f, 0.38, 0.75), graphite: std(0x2a2f37, 0.45, 0.3),
  black: std(0x15181d, 0.4, 0.2), plastic: std(0xd9dce1, 0.45), fabric: std(0x3b4a63, 0.9), rubber: std(0x1b1d21, 0.85),
  cardboard: std(0xb79a72, 0.86), paper: std(0xf5f3ee, 0.82), cream: std(0xefe9dc, 0.8), blueFolder: std(0x2f5ea8, 0.65), greenFolder: std(0x4c8a6a, 0.65),
  skin: std(0xe9e5df, 0.62), shirt: std(0xf4f5f7, 0.75), shirtBlue: std(0xa9c3e3, 0.78), pants: std(0x343c4b, 0.82), vest: std(0x1f3d6b, 0.8), hair: std(0x3a3430, 0.7),
};

export function box(w, h, d, mat, x = 0, y = 0, z = 0, r = 0.01) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.01, h / 2.01, d / 2.01)) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
}
export function cyl(r1, r2, h, mat, x = 0, y = 0, z = 0, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m;
}
export function group(...ch) { const g = new THREE.Group(); ch.forEach((c) => g.add(c)); return g; }

// ------------------------------------------------------------------ Mobiliário
export function desk(w = 1.6, d = 0.8, mat = MAT.oak) {
  const g = new THREE.Group(); const h = 0.75;
  g.add(box(w, 0.035, d, mat, 0, h - 0.0175, 0, 0.008));
  for (const sx of [-1, 1]) { g.add(box(0.05, h - 0.035, d - 0.1, MAT.graphite, sx * (w / 2 - 0.08), (h - 0.035) / 2, 0, 0.004)); }
  g.add(box(w - 0.2, 0.3, 0.02, MAT.graphite, 0, h - 0.2, -d / 2 + 0.08, 0.004));
  g.userData.top = h; return g;
}
export function chair(color = MAT.fabric) {
  const g = new THREE.Group();
  g.add(box(0.5, 0.07, 0.48, color, 0, 0.47, 0, 0.03), box(0.46, 0.52, 0.06, color, 0, 0.82, -0.24, 0.03));
  g.add(cyl(0.025, 0.025, 0.4, MAT.steel, 0, 0.25, 0), cyl(0.02, 0.02, 0.3, MAT.steel, 0, 0.62, -0.24));
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const leg = box(0.3, 0.025, 0.04, MAT.graphite, Math.cos(a) * 0.14, 0.05, Math.sin(a) * 0.14, 0.01); leg.rotation.y = -a; g.add(leg);
    g.add(cyl(0.025, 0.025, 0.03, MAT.rubber, Math.cos(a) * 0.28, 0.02, Math.sin(a) * 0.28, 10)); }
  return g;
}
// Monitor com tela (textura dinâmica). Retorna { group, screen }.
export function monitor(tex, w = 0.62, aspect = 1.6) {
  const h = w / aspect; const g = new THREE.Group();
  g.add(box(0.22, 0.012, 0.16, MAT.graphite, 0, 0.006, 0, 0.004), box(0.04, 0.24, 0.025, MAT.graphite, 0, 0.13, -0.03, 0.004));
  const bz = box(w + 0.02, h + 0.02, 0.03, MAT.black, 0, 0.18 + h / 2, -0.005, 0.006); g.add(bz);
  const sm = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(0.92, 0.92, 0.92) });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), sm); screen.position.set(0, 0.18 + h / 2, 0.0105); g.add(screen);
  g.userData = { screen, w, h, cy: 0.18 + h / 2 }; return g;
}
export function keyboard() { const g = new THREE.Group(); g.add(box(0.44, 0.018, 0.14, MAT.plastic, 0, 0.009, 0, 0.006), box(0.07, 0.02, 0.11, MAT.plastic, 0.3, 0.01, 0, 0.02)); return g; }
export function laptop(tex) {
  const g = new THREE.Group(); g.add(box(0.34, 0.016, 0.24, MAT.steel, 0, 0.008, 0, 0.006));
  const lid = new THREE.Group(); lid.position.set(0, 0.016, -0.12); lid.rotation.x = -0.32;
  lid.add(box(0.34, 0.22, 0.008, MAT.steel, 0, 0.11, 0, 0.004));
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.315, 0.197), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(0.92, 0.92, 0.92) })); sc.position.set(0, 0.112, 0.0045); lid.add(sc);
  g.add(lid); g.userData = { screen: sc }; return g;
}
export function phone(tex) {
  const g = new THREE.Group(); g.add(box(0.075, 0.155, 0.009, MAT.black, 0, 0, 0, 0.008));
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.069, 0.146), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(0.95, 0.95, 0.95) })); sc.position.z = 0.0048; g.add(sc);
  g.userData = { screen: sc }; return g;
}
export function plant(x, z, s = 1) {
  const g = new THREE.Group(); g.add(cyl(0.16 * s, 0.12 * s, 0.36 * s, MAT.white, 0, 0.18 * s, 0));
  const leaf = std(0x5d8a63, 0.7); const R = rng(Math.round(x * 100 + z * 7));
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 14, 10), leaf); l.scale.set(1, 1.5, 0.5);
    l.position.set((R() - 0.5) * 0.25 * s, (0.5 + R() * 0.45) * s, (R() - 0.5) * 0.25 * s); l.rotation.set(R(), R() * 3, R()); l.castShadow = true; g.add(l); }
  g.position.set(x, 0, z); return g;
}

// Caixa-arquivo de papelão com etiqueta legível.
const _boxGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.02);
export function archiveBox(label, { w = 0.14, h = 0.25, d = 0.36, color = 0xb59a74, seed = 1 } = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(_boxGeo, std(color, 0.85)); m.scale.set(w, h, d); m.position.y = h / 2; m.castShadow = m.receiveShadow = true; g.add(m);
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.82, h * 0.62), new THREE.MeshStandardMaterial({ map: boxLabelTexture(label, seed), roughness: 0.8 }));
  lab.position.set(0, h * 0.52, d / 2 + 0.0015); g.add(lab);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.014, 16), std(0x2a2118, 1)); hole.scale.x = 2.2; hole.position.set(0, h * 0.86, d / 2 + 0.002); g.add(hole);
  return g;
}

// Estante de aço com caixas etiquetadas e organizadas.
export function shelfUnit(w = 1.0, levels = 5, { seed = 1, prefix = 'ADM', year0 = 2015, fill = 1 } = {}) {
  const g = new THREE.Group(); const H = 2.2, D = 0.42; const R = rng(seed);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(0.035, H, 0.035, MAT.steel, sx * (w / 2 - 0.018), H / 2, sz * (D / 2 - 0.018), 0.003));
  const ys = []; for (let i = 0; i < levels; i++) ys.push(0.08 + i * (H - 0.15) / (levels - 1 + 0.25));
  ys.forEach((y) => g.add(box(w, 0.02, D, MAT.steel, 0, y, 0, 0.003)));
  let k = 0;
  ys.slice(0, levels).forEach((y, li) => {
    if (li === levels - 1 && R() < 0.3) return;
    const bw = 0.14, n = Math.floor((w - 0.06) / (bw + 0.012));
    for (let i = 0; i < n; i++) {
      if (R() > fill) continue;
      const lbl = { code: `${prefix}-${String(seed * 37 + k * 3 + 101).slice(-3)}`, year: String(year0 + ((li + i) % 9)), title: ['Contratos', 'Ofícios', 'Processos', 'Protocolos', 'Folha de Pagamento', 'Licitações', 'Convênios', 'Requerimentos'][(seed + li + i) % 8] };
      const b = archiveBox(lbl, { seed: seed * 100 + k, color: [0xb59a74, 0xbca07a, 0xb09470][k % 3] });
      b.position.set(-w / 2 + 0.04 + bw / 2 + i * (bw + 0.012), y + 0.01, 0.02); g.add(b); k++;
    }
  });
  return g;
}

// Carrinho plataforma de arquivo.
export function cart() {
  const g = new THREE.Group();
  g.add(box(0.9, 0.04, 0.55, MAT.graphite, 0, 0.2, 0, 0.01));
  g.add(cyl(0.015, 0.015, 0.8, MAT.steel, -0.43, 0.6, -0.25), cyl(0.015, 0.015, 0.8, MAT.steel, -0.43, 0.6, 0.25), box(0.03, 0.03, 0.53, MAT.steel, -0.43, 1.0, 0, 0.01));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = cyl(0.06, 0.06, 0.035, MAT.rubber, sx * 0.36, 0.06, sz * 0.21, 16); w.rotation.x = Math.PI / 2; g.add(w); g.add(box(0.03, 0.08, 0.03, MAT.steel, sx * 0.36, 0.14, sz * 0.21, 0)); }
  return g;
}

// Folha de papel (plano com textura de documento real).
const _sheetGeo = new THREE.PlaneGeometry(0.21, 0.297);
export function sheet(tex, { back = false } = {}) {
  const m = new THREE.Mesh(_sheetGeo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, side: back ? THREE.DoubleSide : THREE.FrontSide }));
  m.castShadow = true; m.receiveShadow = true; return m;
}
// Pilha de folhas (bloco com borda de papel + folha do topo legível).
export function paperStack(n, tex, { tilt = 0.012, seed = 3 } = {}) {
  const g = new THREE.Group(); const R = rng(seed); const th = 0.0011;
  const block = box(0.21, Math.max(0.002, n * th), 0.297, MAT.paper, 0, n * th / 2, 0, 0.001); g.add(block);
  for (let i = 0; i < Math.min(n, 6); i++) { const e = box(0.21, 0.0012, 0.297, MAT.paper, (R() - 0.5) * tilt, (n * th) * (i + 0.5) / 6, (R() - 0.5) * tilt, 0); e.rotation.y = (R() - 0.5) * 0.04; g.add(e); }
  const top = sheet(tex); top.rotation.x = -Math.PI / 2; top.position.y = n * th + 0.0008; g.add(top);
  g.userData = { block, top, th }; return g;
}
export function folder(color = MAT.blueFolder) {
  const g = new THREE.Group(); g.add(box(0.235, 0.012, 0.32, color, 0, 0.006, 0, 0.003)); return g;
}

// ------------------------------------------------------------------ Scanner de produção (alimentador automático)
export function productionScanner() {
  const g = new THREE.Group();
  const body = box(0.52, 0.26, 0.44, MAT.graphite, 0, 0.13, 0, 0.04); g.add(body);
  const top = box(0.5, 0.05, 0.3, MAT.plastic, 0, 0.27, -0.05, 0.02); g.add(top);
  // bandeja de entrada (inclinada para trás)
  const inT = new THREE.Group(); inT.position.set(0, 0.29, -0.16); inT.rotation.x = 0.62;
  inT.add(box(0.36, 0.008, 0.34, MAT.plastic, 0, 0, -0.17, 0.003));
  for (const sx of [-1, 1]) inT.add(box(0.008, 0.03, 0.2, MAT.plastic, sx * 0.112, 0.016, -0.12, 0.002));
  g.add(inT);
  // bandeja de saída (frontal, quase horizontal)
  const outT = new THREE.Group(); outT.position.set(0, 0.07, 0.22); outT.rotation.x = -0.12;
  outT.add(box(0.34, 0.008, 0.36, MAT.plastic, 0, 0, 0.18, 0.003), box(0.3, 0.05, 0.008, MAT.plastic, 0, 0.025, 0.36, 0.002));
  g.add(outT);
  // painel + LED
  const panel = box(0.12, 0.05, 0.01, MAT.black, 0.17, 0.2, 0.222, 0.004); g.add(panel);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.006, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 2.0, 0.6), toneMapped: false })); led.position.set(0.21, 0.2, 0.228); g.add(led);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.028), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.6, 0.9), toneMapped: false })); disp.position.set(0.155, 0.2, 0.228); g.add(disp);
  const slot = box(0.32, 0.012, 0.01, MAT.black, 0, 0.12, 0.221, 0.002); g.add(slot);
  // marca genérica (sem fabricante real)
  g.userData = { inT, outT, led };
  return g;
}

// ------------------------------------------------------------------ Pessoa (manequim articulado, sem rosto)
function limb(len, r, mat) { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat); c.position.y = -len / 2; c.castShadow = true; g.add(c); g.userData.len = len; return g; }
export function person({ shirt = MAT.shirt, pants = MAT.pants, vest = null, hair = true, scale = 1 } = {}) {
  const p = new THREE.Group(); const body = new THREE.Group(); p.add(body);
  const hips = new THREE.Group(); hips.position.y = 0.92; body.add(hips);
  const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.06, 6, 14), pants); pelvis.rotation.z = Math.PI / 2; pelvis.scale.set(1, 1, 0.8); pelvis.castShadow = true; hips.add(pelvis);
  const spine = new THREE.Group(); hips.add(spine);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.34, 6, 16), vest || shirt); torso.position.y = 0.3; torso.scale.set(1, 1, 0.72); torso.castShadow = true; spine.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 12), MAT.skin); neck.position.y = 0.6; spine.add(neck);
  const head = new THREE.Group(); head.position.y = 0.72; spine.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.105, 28, 20), MAT.skin); skull.scale.set(0.92, 1.12, 1); skull.castShadow = true; head.add(skull);
  if (hair) { const hm = new THREE.Mesh(new THREE.SphereGeometry(0.11, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), MAT.hair); hm.scale.set(0.95, 1.1, 1.05); hm.position.set(0, 0.012, 0.008); hm.rotation.x = -0.6; head.add(hm); }
  const mkArm = (s) => { const sh = new THREE.Group(); sh.position.set(s * 0.2, 0.5, 0); spine.add(sh);
    const up = limb(0.26, 0.043, shirt); sh.add(up); const el = new THREE.Group(); el.position.y = -0.31; up.add(el);
    const fo = limb(0.24, 0.036, shirt); el.add(fo); const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 10), MAT.skin); hand.scale.set(0.75, 1.15, 0.5); hand.position.y = -0.29; hand.castShadow = true; fo.add(hand);
    return { sh, el, hand }; };
  const armL = mkArm(-1), armR = mkArm(1);
  const mkLeg = (s) => { const hp = new THREE.Group(); hp.position.set(s * 0.09, 0, 0); hips.add(hp);
    const th = limb(0.38, 0.068, pants); hp.add(th); const kn = new THREE.Group(); kn.position.y = -0.44; th.add(kn);
    const sh = limb(0.36, 0.056, pants); kn.add(sh); const foot = box(0.09, 0.06, 0.24, MAT.black, 0, -0.44, 0.05, 0.03); sh.add(foot);
    return { hp, kn }; };
  const legL = mkLeg(-1), legR = mkLeg(1);
  p.userData = { body, hips, spine, head, armL, armR, legL, legR };
  p.scale.setScalar(scale);
  return p;
}
// Poses
export function poseSit(p, { lean = 0.08, armsDesk = true } = {}) {
  const u = p.userData; u.hips.position.y = 0.5;
  for (const L of [u.legL, u.legR]) { L.hp.rotation.x = -Math.PI / 2 + 0.05; L.kn.rotation.x = Math.PI / 2 - 0.05; }
  u.spine.rotation.x = lean;
  if (armsDesk) for (const [A, s] of [[u.armL, -1], [u.armR, 1]]) { A.sh.rotation.set(-0.55, 0, s * 0.12); A.el.rotation.set(-0.95, 0, 0); }
}
export function poseStand(p) {
  const u = p.userData; u.hips.position.y = 0.92;
  for (const L of [u.legL, u.legR]) { L.hp.rotation.set(0, 0, 0); L.kn.rotation.set(0, 0, 0); }
  for (const [A, s] of [[u.armL, -1], [u.armR, 1]]) { A.sh.rotation.set(0.05, 0, s * 0.08); A.el.rotation.set(-0.15, 0, 0); }
}
// Ciclo de caminhada (fase em ciclos)
export function poseWalk(p, ph, amt = 1) {
  const u = p.userData; const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  u.legL.hp.rotation.x = s * 0.42 * amt; u.legR.hp.rotation.x = -s * 0.42 * amt;
  u.legL.kn.rotation.x = Math.max(0, -c) * 0.7 * amt + 0.05; u.legR.kn.rotation.x = Math.max(0, c) * 0.7 * amt + 0.05;
  u.hips.position.y = 0.92 - Math.abs(c) * 0.018 * amt;
}
// Mão alcança ponto (IK aproximado de 2 segmentos no plano do braço) — pos em coordenadas do mundo.
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();
export function reach(arm, target, { bend = 1 } = {}) {
  const sh = arm.sh; sh.rotation.set(0, 0, 0); sh.updateWorldMatrix(true, false);
  const local = sh.worldToLocal(_v.copy(target)); const d = local.length(); const L1 = 0.31, L2 = 0.3;
  const dd = clamp(d, 0.05, L1 + L2 - 0.001);
  const a1 = Math.acos(clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
  const a2 = Math.acos(clamp((L1 * L1 + L2 * L2 - dd * dd) / (2 * L1 * L2), -1, 1));
  // direção para o alvo a partir do ombro (eixo -y é o "comprimento" do braço)
  const dir = local.clone().normalize();
  _q.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir); sh.quaternion.copy(_q);
  sh.rotateX(a1 * bend); arm.el.rotation.set(-(Math.PI - a2) * bend, 0, 0);
}
