// Ambientes da cena 4 em estilo "clay render" premium: escritório, setor público, home office, em viagem.
// Pessoas estilizadas (manequins) — evita rostos artificiais e mantém o visual institucional.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTex, drawGedUI, UI_W, UI_H } from '../textures.js';
import { roundRect, FONT_D } from '../core.js';

const clay = (c = 0xe6e9ef, r = 0.75) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0.0 });
const M = { white: clay(0xe9ecf1), soft: clay(0xd5dae3), dark: clay(0x2b3240, 0.5), mid: clay(0x8e97a8, 0.6), wood: clay(0xb08a64, 0.6), blue: clay(0x2f5fa8, 0.55), skin: clay(0xf1f2f4, 0.6), accent: clay(0x3b7dd8, 0.5) };

let uiTexShared = null;
function uiTexture() {
  if (uiTexShared) return uiTexShared;
  uiTexShared = canvasTex(UI_W, UI_H, (g) => drawGedUI(g, { type: 1.3, blink: 0, results: 1, select: 1, flow: 0.75 }));
  return uiTexShared;
}
function box(w, h, d, mat, x, y, z, r = 0.02) { const m = new THREE.Mesh(r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function cyl(r1, r2, h, mat, x, y, z) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 24), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; }
function screen(w, mat) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * UI_H / UI_W), new THREE.MeshBasicMaterial({ map: uiTexture(), color: new THREE.Color(0.95, 0.95, 0.95) })); return m; }

function limb(len, r, mat) { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat); c.position.y = -len / 2; c.castShadow = true; g.add(c); return g; }
// Manequim estilizado. pose: 'sit' | 'stand' | 'sitHold'
function person(pose, mat = M.white) {
  const p = new THREE.Group();
  const hips = new THREE.Group(); p.add(hips);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.36, 6, 14), mat); torso.position.y = 0.3; torso.castShadow = true; hips.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 18), mat); head.scale.set(1, 1.12, 1); head.position.y = 0.72; head.castShadow = true; hips.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 12), mat); neck.position.y = 0.6; hips.add(neck);
  const armL = limb(0.42, 0.045, mat), armR = limb(0.42, 0.045, mat); armL.position.set(-0.2, 0.52, 0); armR.position.set(0.2, 0.52, 0); hips.add(armL, armR);
  const legL = limb(0.4, 0.065, mat), legR = limb(0.4, 0.065, mat); legL.position.set(-0.09, 0, 0); legR.position.set(0.09, 0, 0); p.add(legL, legR);
  const shinL = limb(0.38, 0.055, mat), shinR = limb(0.38, 0.055, mat); shinL.position.y = -0.46; shinR.position.y = -0.46; legL.add(shinL); legR.add(shinR);
  if (pose === 'stand') { p.position.y = 0.9; armL.rotation.set(-0.5, 0, 0.12); armR.rotation.set(-0.7, 0, -0.12); }
  else { p.position.y = 0.5; legL.rotation.x = legR.rotation.x = -Math.PI / 2; shinL.rotation.x = shinR.rotation.x = Math.PI / 2;
    armL.rotation.set(-1.0, 0, 0.15); armR.rotation.set(-1.0, 0, -0.15); if (pose === 'sitHold') { armL.rotation.set(-1.15, 0, 0.35); armR.rotation.set(-1.15, 0, -0.35); } }
  p.userData = { head, hips, armL, armR };
  return p;
}

function windowTex(kind) {
  return canvasTex(1024, 512, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    if (kind === 'city') { sky.addColorStop(0, '#0a1a3a'); sky.addColorStop(1, '#2b5b9c'); }
    else if (kind === 'dusk') { sky.addColorStop(0, '#20345e'); sky.addColorStop(0.7, '#d98e64'); sky.addColorStop(1, '#f2c08a'); }
    else { sky.addColorStop(0, '#6fa8e6'); sky.addColorStop(1, '#d9ecff'); }
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    if (kind === 'city') { let x = 0; let s = 7; const R = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
      while (x < w) { const bw = 40 + R() * 90, bh = 120 + R() * 300; g.fillStyle = '#0b1424'; g.fillRect(x, h - bh, bw, bh);
        g.fillStyle = 'rgba(255,210,140,.75)'; for (let yy = h - bh + 12; yy < h - 10; yy += 18) for (let xx = x + 8; xx < x + bw - 8; xx += 14) if (R() > 0.55) g.fillRect(xx, yy, 6, 8); x += bw + 6; } }
    if (kind === 'airport') { g.fillStyle = '#3d4a5c'; g.fillRect(0, h * 0.78, w, h * 0.22);
      g.fillStyle = '#f4f6fa'; g.save(); g.translate(w * 0.55, h * 0.45); g.rotate(-0.12);
      g.beginPath(); g.ellipse(0, 0, 260, 26, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-40, 0); g.lineTo(-140, 120); g.lineTo(-90, 120); g.lineTo(40, 0); g.fill();
      g.beginPath(); g.moveTo(-40, 0); g.lineTo(-120, -90); g.lineTo(-80, -90); g.lineTo(30, 0); g.fill(); g.beginPath(); g.moveTo(-230, 0); g.lineTo(-270, -80); g.lineTo(-240, -80); g.lineTo(-190, 0); g.fill(); g.restore(); }
    if (kind === 'dusk') { g.fillStyle = 'rgba(30,40,60,.85)'; for (let i = 0; i < 9; i++) { const x = i * 120; g.beginPath(); g.arc(x + 40, h, 90 + (i % 3) * 30, Math.PI, 0); g.fill(); } }
  });
}
function signTex(text) { return canvasTex(1024, 200, (g, w, h) => { g.fillStyle = '#1e3a66'; roundRect(g, 0, 0, w, h, 24); g.fill(); g.fillStyle = '#fff'; g.font = `600 84px ${FONT_D}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4); }); }

function baseRoom(scene, { wall = 0xdfe3ea, floor = 0xc9ced8, win, winW = 3.4, winH = 1.9, winY = 1.6 }) {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), clay(floor, 0.85)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), clay(wall, 0.9)); wl.position.set(0, 3, -2.2); wl.receiveShadow = true; scene.add(wl);
  const wl2 = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), clay(wall, 0.9)); wl2.position.set(-3.6, 3, 1.5); wl2.rotation.y = Math.PI / 2; wl2.receiveShadow = true; scene.add(wl2);
  if (win) { const w = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshBasicMaterial({ map: windowTex(win) })); w.position.set(0.4, winY, -2.19); scene.add(w);
    const fr = box(winW + 0.12, 0.06, 0.08, M.dark, 0.4, winY - winH / 2, -2.16, 0); const fr2 = fr.clone(); fr2.position.y = winY + winH / 2; scene.add(fr, fr2);
    for (const dx of [-winW / 2, 0, winW / 2]) scene.add(box(0.06, winH, 0.08, M.dark, 0.4 + dx, winY, -2.16, 0)); }
}
function lightRig(scene, { key = 0xffffff, ki = 2.4, warm = false } = {}) {
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x4a4f5a, warm ? 0.7 : 1.0));
  const d = new THREE.DirectionalLight(key, ki); d.position.set(3, 6, 4); d.castShadow = true; d.shadow.mapSize.set(1024, 1024);
  Object.assign(d.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 }); d.shadow.bias = -0.0005; d.shadow.radius = 4; scene.add(d);
}

export function office() {
  const s = new THREE.Scene(); s.background = new THREE.Color(0xdfe3ea);
  baseRoom(s, { win: 'city', winW: 4.6, winH: 2.4, winY: 1.75 }); lightRig(s, { ki: 2.0 });
  s.add(box(2.0, 0.05, 0.9, M.wood, 0, 0.76, -0.6), box(0.05, 0.74, 0.8, M.dark, -0.95, 0.38, -0.6, 0), box(0.05, 0.74, 0.8, M.dark, 0.95, 0.38, -0.6, 0));
  s.add(box(0.06, 0.32, 0.06, M.dark, 0, 0.95, -0.85, 0), box(0.3, 0.02, 0.2, M.dark, 0, 0.79, -0.85, 0.005));
  const mon = box(1.04, 0.67, 0.035, M.dark, 0, 1.36, -0.85, 0.01); s.add(mon);
  const sc = screen(0.98); sc.position.set(0, 1.36, -0.83); s.add(sc);
  s.add(box(0.5, 0.02, 0.16, M.soft, -0.05, 0.795, -0.35, 0.005), box(0.08, 0.02, 0.12, M.soft, 0.38, 0.795, -0.35, 0.01));
  const chair = new THREE.Group(); chair.add(box(0.55, 0.08, 0.5, M.dark, 0, 0.47, 0), box(0.5, 0.6, 0.06, M.dark, 0, 0.85, 0.26), cyl(0.03, 0.03, 0.4, M.mid, 0, 0.24, 0), cyl(0.28, 0.28, 0.03, M.mid, 0, 0.03, 0)); chair.position.set(0, 0, 0.3); s.add(chair);
  const p = person('sit'); p.position.set(0, 0.5, 0.25); p.rotation.y = Math.PI; s.add(p);
  s.add(cyl(0.16, 0.12, 0.38, M.white, 1.6, 0.19, -1.6)); for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), clay(0x6f9b7a, 0.7)); l.position.set(1.6 + Math.cos(i) * 0.12, 0.55 + (i % 3) * 0.14, -1.6 + Math.sin(i * 2) * 0.12); l.castShadow = true; s.add(l); }
  const cam = new THREE.PerspectiveCamera(34, 16 / 9, 0.05, 50);
  return { scene: s, camera: cam, update(t) { cam.position.set(2.4 + Math.sin(t * 0.25) * 0.4, 1.75, 2.6); cam.lookAt(0, 1.0, -0.6); p.userData.head.rotation.x = Math.sin(t * 0.7) * 0.05; } };
}

export function publicOffice() {
  const s = new THREE.Scene(); s.background = new THREE.Color(0xe4e1da);
  baseRoom(s, { wall: 0xe8e4dc, floor: 0xcfc9be, win: 'day', winW: 1.4, winH: 2.4, winY: 1.8 }); lightRig(s, { ki: 2.1 });
  for (const x of [-2.2, 2.8]) s.add(cyl(0.18, 0.2, 4, M.white, x, 2, -1.9));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.31), new THREE.MeshBasicMaterial({ map: signTex('Atendimento') })); sign.position.set(-1.0, 2.6, -2.18); s.add(sign);
  s.add(box(3.2, 1.05, 0.6, M.soft, 0, 0.525, 0.1, 0.03), box(3.3, 0.05, 0.75, M.wood, 0, 1.07, 0.1, 0.01));
  s.add(box(0.06, 0.25, 0.06, M.dark, 0.3, 1.2, -0.05, 0)); const mon = box(0.8, 0.52, 0.03, M.dark, 0.3, 1.5, -0.05, 0.01); mon.rotation.y = 0.35; s.add(mon);
  const sc = screen(0.76); sc.position.set(0.31, 1.5, -0.03); sc.rotation.y = 0.35; s.add(sc);
  for (let i = 0; i < 4; i++) s.add(box(0.32, 0.04 + i * 0.0, 0.44, M.white, -1.1, 1.12 + i * 0.045, 0.1, 0.005));
  const p = person('stand'); p.position.set(0.15, 0.9, 0.75); p.rotation.y = Math.PI - 0.3; s.add(p);
  const cam = new THREE.PerspectiveCamera(34, 16 / 9, 0.05, 50);
  return { scene: s, camera: cam, update(t) { cam.position.set(-1.6 + Math.sin(t * 0.25) * 0.4, 1.9, 3.4); cam.lookAt(0, 1.15, -0.4); } };
}

export function homeOffice() {
  const s = new THREE.Scene(); s.background = new THREE.Color(0xe7e0d6);
  baseRoom(s, { wall: 0xebe4da, floor: 0xb99c7c, win: 'dusk', winW: 2.2, winH: 1.7, winY: 1.7 }); lightRig(s, { key: 0xffe2c2, ki: 1.6, warm: true });
  const lamp = new THREE.PointLight(0xffb36b, 6, 6, 1.5); lamp.position.set(-1.7, 1.75, -0.6); s.add(lamp);
  s.add(cyl(0.015, 0.015, 1.7, M.dark, -1.7, 0.85, -0.8), cyl(0.12, 0.2, 0.25, new THREE.MeshStandardMaterial({ color: 0xffe0b8, emissive: 0xffb36b, emissiveIntensity: 0.8 }), -1.7, 1.75, -0.8), cyl(0.18, 0.18, 0.03, M.dark, -1.7, 0.015, -0.8));
  const sofa = clay(0x5b6b84, 0.85);   // sofá ao fundo, à esquerda
  s.add(box(0.9, 0.42, 2.0, sofa, -2.6, 0.31, 0.6, 0.08), box(0.22, 0.55, 2.0, sofa, -3.0, 0.72, 0.6, 0.08));
  s.add(box(1.5, 0.05, 0.7, M.wood, 0.1, 0.76, -1.55, 0.01), box(0.05, 0.74, 0.6, M.dark, -0.6, 0.38, -1.55, 0), box(0.05, 0.74, 0.6, M.dark, 0.8, 0.38, -1.55, 0));
  const lap = new THREE.Group(); lap.add(box(0.62, 0.02, 0.42, M.mid, 0, 0.0, 0, 0.008));
  const lid = new THREE.Group(); lid.position.set(0, 0.01, -0.21); lid.rotation.x = -0.28; const lb = box(0.62, 0.4, 0.015, M.mid, 0, 0.2, 0, 0.006); lid.add(lb);
  const sc = screen(0.58); sc.position.set(0, 0.2, 0.009); lid.add(sc); lap.add(lid); lap.position.set(0.1, 0.795, -1.5); s.add(lap);
  s.add(box(0.5, 0.08, 0.48, M.white, 0.1, 0.47, -0.6, 0.03), box(0.48, 0.5, 0.06, M.white, 0.1, 0.8, -0.36, 0.03), cyl(0.03, 0.03, 0.42, M.mid, 0.1, 0.22, -0.6));
  const p = person('sit'); p.position.set(0.1, 0.52, -0.62); p.rotation.y = Math.PI; s.add(p);
  s.add(box(0.12, 0.1, 0.12, M.white, 0.65, 0.84, -1.45, 0.02));
  for (let i = 0; i < 5; i++) s.add(box(0.9, 0.03, 0.3, M.wood, 2.2, 0.5 + i * 0.42, -2.0, 0)); for (let i = 0; i < 14; i++) s.add(box(0.06, 0.3, 0.22, [M.blue, M.mid, M.white, M.dark][i % 4], 1.88 + (i % 7) * 0.1, 0.68 + Math.floor(i / 7) * 0.84, -2.0, 0.005));
  const cam = new THREE.PerspectiveCamera(34, 16 / 9, 0.05, 50);
  return { scene: s, camera: cam, update(t) { cam.position.set(1.7 + Math.sin(t * 0.25) * 0.3, 1.6, 1.5); cam.lookAt(-0.1, 0.95, -1.2); } };
}

export function travel() {
  const s = new THREE.Scene(); s.background = new THREE.Color(0xdde3ec);
  baseRoom(s, { wall: 0xdfe5ee, floor: 0xb9c1cd, win: 'airport', winW: 5.4, winH: 2.6, winY: 1.65 }); lightRig(s, { ki: 2.2 });
  for (let i = 0; i < 4; i++) { const x = -1.8 + i * 0.66; s.add(box(0.58, 0.07, 0.55, M.dark, x, 0.45, 0, 0.02), box(0.58, 0.5, 0.06, M.dark, x, 0.72, 0.26, 0.02)); }
  s.add(box(2.7, 0.04, 0.08, M.mid, -0.82, 0.3, 0, 0), box(0.06, 0.3, 0.06, M.mid, -1.9, 0.15, 0, 0), box(0.06, 0.3, 0.06, M.mid, 0.3, 0.15, 0, 0));
  const p = person('sitHold'); p.position.set(-0.48, 0.5, 0.05); p.rotation.y = Math.PI; s.add(p);
  const tab = new THREE.Group(); tab.add(box(0.42, 0.28, 0.015, M.dark, 0, 0, 0, 0.012)); const sc = screen(0.39); sc.position.z = -0.009; sc.rotation.y = Math.PI; tab.add(sc);
  tab.position.set(-0.48, 0.92, -0.32); tab.rotation.set(-0.45, Math.PI, 0); s.add(tab);
  const suit = box(0.42, 0.6, 0.24, M.blue, 0.6, 0.36, -0.1, 0.05); s.add(suit, cyl(0.012, 0.012, 0.4, M.mid, 0.5, 0.86, -0.1), cyl(0.012, 0.012, 0.4, M.mid, 0.7, 0.86, -0.1), box(0.24, 0.03, 0.03, M.mid, 0.6, 1.06, -0.1, 0.01));
  const cam = new THREE.PerspectiveCamera(34, 16 / 9, 0.05, 50);
  return { scene: s, camera: cam, update(t) { cam.position.set(0.7 + Math.sin(t * 0.25) * 0.25, 1.6, 1.5); cam.lookAt(-0.55, 0.95, -0.6); } };
}
