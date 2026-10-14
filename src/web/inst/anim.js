// Câmera por planos (cortes secos entre planos, movimento suave dentro do plano) e animação contínua do ambiente.
import * as THREE from 'three';
import { lerp, clamp, range, smooth, easeInOutSine, easeInOutCubic } from '../core.js';
import { reach, poseStand, poseWalk } from './kit.js';
import { drawCapture, drawIndex, drawSearch } from './docs.js';
import { SCR } from './room.js';

const _p = new THREE.Vector3(), _l = new THREE.Vector3();
// shots: [{ t0, t1, a:{p,l,fov}, b:{p,l,fov}, ease }]
export function shots(camera, t, list) {
  let s = list[0]; for (const x of list) if (t >= x.t0) s = x;
  const k = (s.ease || easeInOutSine)(range(t, s.t0, s.t1));
  _p.set(...s.a.p).lerp(new THREE.Vector3(...s.b.p), k); _l.set(...s.a.l).lerp(new THREE.Vector3(...s.b.l), k);
  camera.position.copy(_p); camera.lookAt(_l);
  const fov = lerp(s.a.fov || 35, s.b.fov || s.a.fov || 35, k); if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  // micro-movimento de câmera na mão (muito sutil)
  camera.rotation.z += Math.sin(t * 0.9) * 0.0015; camera.rotateX(Math.sin(t * 0.63 + 1) * 0.0012); camera.rotateY(Math.sin(t * 0.47) * 0.0012);
  return s;
}

const V = new THREE.Vector3(), V2 = new THREE.Vector3();
const PPS = 1.6;   // páginas por segundo no alimentador

// Anima o ambiente no tempo global T (contínuo entre cenas).
export function animateRoom(R, T, { cart = 'parked', capture = true, pages = null, scanRate = PPS, screens = true } = {}) {
  if (screens) {   // telas da indexação em estado de trabalho
    if (!R._scr) { drawIndex(R.idxTex.userData.g, SCR.W, SCR.H, { fields: 3.4, blink: 0, saved: 0 }); R.idxTex.needsUpdate = true;
      drawSearch(R.idxTex2.userData.g, SCR.W, SCR.H, { type: 1.2, results: 1, select: 1, open: 1, blink: 0 }); R.idxTex2.needsUpdate = true; R._scr = true; }
  }
  // --- Preparação: retira folha da pilha (grampos já removidos) e monta o lote
  const u = R.prepper.userData; const cyc = (T * 0.62) % 1;
  const pickP = R.inStack.localToWorld(V.set(0, 0.07, 0.02)); const placeP = R.batch.localToWorld(V2.set(0, 0.03, 0.02));
  const k = cyc < 0.5 ? easeInOutCubic(cyc / 0.5) : 1 - easeInOutCubic((cyc - 0.5) / 0.5);
  R.prep.updateWorldMatrix(true, true);
  const target = pickP.clone().lerp(placeP, k); target.y += Math.sin(k * Math.PI) * 0.12;
  u.spine.rotation.set(0.32, 0, 0); u.head.rotation.x = 0.35;
  R.prepper.updateWorldMatrix(true, true); reach(u.armR, target);
  reach(u.armL, R.inStack.localToWorld(V.set(-0.1, 0.07, 0.08)));
  // --- Digitalização: folhas atravessam o scanner
  const sc = R.scanner, inT = sc.userData.inT, outT = sc.userData.outT;
  const total = 14; const n = (T * scanRate) % total; const done = Math.floor(n);
  const inH = Math.max(1, total - done), outH = Math.max(1, done + 2);
  // pilhas: entrada no plano da bandeja inclinada, saída na bandeja frontal
  if (R.scanIn.parent !== inT) { inT.add(R.scanIn); R.scanIn.position.set(0, 0.005, -0.18); }
  if (R.scanOut.parent !== outT) { outT.add(R.scanOut); R.scanOut.position.set(0, 0.005, 0.18); }
  R.scanIn.scale.set(1, inH / 14, 1); R.scanOut.scale.set(1, outH / 4, 1);
  R.flying.forEach((sh, i) => {
    sh.visible = false; if (i > 0) return; const p = n - done;
    sc.updateWorldMatrix(true, true);
    if (p < 0.38) { const a = easeInOutSine(p / 0.38); const P0 = inT.localToWorld(V.set(0, 0.006 + inH * 0.0011, -0.18)), P1 = inT.localToWorld(V2.set(0, 0.006, 0.02));
      sh.position.copy(R.scanSt.worldToLocal(P0.lerp(P1, a))); sh.rotation.set(0.62 - Math.PI / 2, 0, 0); sh.visible = a < 0.85; sh.position.y += 0.0015; }
    else if (p > 0.55) { const a = easeInOutSine((p - 0.55) / 0.45); const P0 = sc.localToWorld(V.set(0, 0.12, 0.08)), P1 = outT.localToWorld(V2.set(0, 0.006 + outH * 0.0011, 0.18));
      sh.position.copy(R.scanSt.worldToLocal(P0.lerp(P1, a))); sh.position.y += Math.sin(a * Math.PI) * 0.015; sh.rotation.set(-0.12 - Math.PI / 2 + (1 - a) * 0.1, 0, 0); sh.visible = a > 0.08; }
  });
  sc.userData.led.material.color.setRGB(0.2, 1.6 + Math.sin(T * 9) * 0.4, 0.5);
  const so = R.scanOp.userData; so.spine.rotation.x = 0.18; so.head.rotation.x = 0.3; R.scanOp.updateWorldMatrix(true, true);
  reach(so.armR, sc.localToWorld(V.set(0.14, 0.2, 0.32 + Math.sin(T * 1.3) * 0.02)));
  reach(so.armL, R.scanOut.localToWorld(V.set(-0.05, 0.03, 0.05)));
  if (capture) { drawCapture(R.capTex.userData.g, SCR.W, SCR.H, { pages: pages != null ? pages : 9, scanLine: (T * scanRate) % 1, done: false }); R.capTex.needsUpdate = true; }
  // --- Indexação: digitação sutil
  R.people.forEach((p, i) => { const a = p.userData; a.armR.el.rotation.x = -0.95 + Math.sin(T * 13 + i) * 0.05 * (Math.sin(T * 1.7 + i * 2) > 0 ? 1 : 0); a.armL.el.rotation.x = -0.95 + Math.cos(T * 11 + i) * 0.04;
    a.head.rotation.set(0.05 + Math.sin(T * 0.4 + i) * 0.04, Math.sin(T * 0.3 + i * 3) * 0.08, 0); });
  // --- Carrinho
  const A = new THREE.Vector3(5.4, 0, 0.9), B = new THREE.Vector3(-0.3, 0, -0.05);
  let ck = cart === 'parked' ? 1 : cart === 'hidden' ? -1 : cart;
  R.cart.visible = R.pusher.visible = ck >= 0;
  if (ck >= 0) {
    const e = easeInOutSine(clamp(ck)); R.cart.position.lerpVectors(A, B, e); R.cart.rotation.y = Math.PI;
    const walking = ck < 1; R.pusher.position.copy(R.cart.position).add(V.set(0.82, 0, 0)); R.pusher.rotation.y = -Math.PI / 2;
    poseStand(R.pusher); const pu = R.pusher.userData;
    if (walking) poseWalk(R.pusher, e * 6.5, 1 - smooth(range(ck, 0.85, 1)));
    else { R.pusher.position.add(V.set(0.1, 0, 0.0)); }
    pu.spine.rotation.x = 0.12; R.pusher.updateWorldMatrix(true, true);
    reach(pu.armR, R.cart.localToWorld(V.set(-0.43, 1.0, -0.18))); reach(pu.armL, R.cart.localToWorld(V.set(-0.43, 1.0, 0.18)));
  }
}
