// Cena 3a (22,3–32,9 s): operação DigitalGov — preparação, digitalização, indexação, GED e conferência de qualidade.
import * as THREE from 'three';
import { buildOps } from './sets.js';
import { make } from './cast.js';
import { act, P, F, shots, add, idle, mix, track, V3, eyesOf, carry, focusOn } from './act.js';
import { drawCapture, drawQC, drawIndex, drawSearch } from './ged.js';
import { paperStack, sheet } from '../inst/kit.js';
import { docTexture } from '../inst/docs.js';
import { clamp, range, smooth, lerp, easeInOutSine } from '../core.js';

export async function create(env) {
  const scene = new THREE.Scene(); const A = buildOps(scene, env);
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 60);
  const c = {}; for (const k of ['ana', 'diego', 'bruna', 'lucas']) { c[k] = make(k); scene.add(c[k].root); }
  // scanner: pilhas de entrada/saída e folha em trânsito
  const sc = A.scanner, inT = sc.userData.inT, outT = sc.userData.outT;
  const inS = paperStack(14, docTexture(1, { res: 512 }), { seed: 8 }); inT.add(inS); inS.position.set(0, 0.005, -0.18);
  const outS = paperStack(4, docTexture(0, { res: 512 }), { seed: 9 }); outT.add(outS); outS.position.set(0, 0.005, 0.18);
  const fly = sheet(docTexture(2, { res: 512 }), { back: true }); scene.add(fly);
  const prepSheet = sheet(docTexture(4, { res: 512 }), { back: true }); scene.add(prepSheet);
  const V = new THREE.Vector3(), V2 = new THREE.Vector3();
  A.ixBench.updateWorldMatrix(true, true); const lucasSeat = A.ixBench.localToWorld(V3(0, 0, 0.62)); const ixYaw = A.ixBench.rotation.y + Math.PI;
  A.gedMon.updateWorldMatrix(true, true); const gedScreen = A.gedMon.localToWorld(V3(0, A.gedMon.userData.cy, 0.01));
  const gedN = new THREE.Vector3(0, 0, 1).applyQuaternion(A.gedMon.getWorldQuaternion(new THREE.Quaternion()));
  const gedCam = gedScreen.clone().add(gedN.clone().multiplyScalar(0.62)); const gedCamB = gedScreen.clone().add(gedN.clone().multiplyScalar(0.55));
  A.ixMon.updateWorldMatrix(true, true); const ixScreen = A.ixMon.localToWorld(V3(0, A.ixMon.userData.cy, 0));
  const SH = [
    { t0: 22.3, t1: 24.25, a: { p: [2.6, 2.3, 3.6], l: [-1.2, 1.35, -3.0], fov: 42 }, b: { p: [2.2, 1.65, 2.2], l: [-1.2, 1.25, -3.0], fov: 40 }, focus: V3(-1.1, 1.4, -3.0), ap: 0.45 },
    { t0: 24.25, t1: 26.0, a: { p: [-0.35, 1.4, -0.75], l: [-1.12, 1.12, -2.75], fov: 38 }, b: { p: [-0.5, 1.36, -0.95], l: [-1.12, 1.12, -2.75], fov: 35 }, focus: V3(-1.12, 1.05, -2.45), ap: 0.9 },
    { t0: 26.0, t1: 27.55, a: { p: [lucasSeat.x + 0.55, 1.4, lucasSeat.z + 0.75], l: [ixScreen.x, ixScreen.y - 0.02, ixScreen.z], fov: 30 }, b: { p: [lucasSeat.x + 0.45, 1.36, lucasSeat.z + 0.6], l: [ixScreen.x, ixScreen.y, ixScreen.z], fov: 28 }, focus: ixScreen, ap: 1.0 },
    { t0: 27.55, t1: 30.1, a: { p: gedCam.toArray(), l: gedScreen.toArray(), fov: 32 }, b: { p: gedCamB.toArray(), l: gedScreen.toArray(), fov: 31 }, focus: gedScreen, ap: 0.4, hand: 0.4 },
    { t0: 30.1, t1: 33.0, a: { p: [-1.75, 1.55, 0.95], l: [-0.55, 1.15, -2.8], fov: 42 }, b: { p: [-1.4, 1.5, 0.6], l: [-0.5, 1.15, -2.8], fov: 39 }, focus: 'diego', ap: 0.6 },
  ];
  return { scene, camera, update(lt, T) {
    // ---- telas
    drawCapture(A.capTex.userData.g, 1600, 1000, { pages: 6 + (T - 22.3) * 1.4, scanLine: (T * 1.4) % 1 }); A.capTex.needsUpdate = true;
    drawQC(A.qcTex.userData.g, 1600, 1000, { zoom: smooth(range(T, 30.3, 30.9)), check: clamp((T - 30.6) * 2.2, 0, 4) + (T < 30 ? 2 : 0) }); A.qcTex.needsUpdate = true;
    drawIndex(A.ixTex.userData.g, 1600, 1000, { fields: T < 26 ? 1.2 : 1.2 + (T - 26) * 2.4, blink: T }); A.ixTex.needsUpdate = true;
    const q = 'processo 2023/004518';
    drawSearch(A.gedTex.userData.g, 1600, 1000, { type: range(T, 27.8, 28.8), blink: T, subject: T > 28.9 ? 1 : 0, results: range(T, 29.0, 29.8), select: smooth(range(T, 29.7, 30.0)), open: 0, query: q,
      cursor: T > 29.3 ? [lerp(1200, 700, smooth(range(T, 29.3, 29.8))), lerp(700, 400, smooth(range(T, 29.3, 29.8)))] : null }); A.gedTex.needsUpdate = true;
    // ---- scanner: folhas atravessam
    const pps = 1.4, n = (T * pps) % 12, done = Math.floor(n), p = n - done;
    inS.scale.y = Math.max(0.15, (12 - done) / 12); outS.scale.y = (done + 2) / 4;
    sc.updateWorldMatrix(true, true); fly.visible = false;
    if (p < 0.38) { const a = easeInOutSine(p / 0.38); const P0 = inT.localToWorld(V.set(0, 0.012 + inS.scale.y * 0.015, -0.18)), P1 = inT.localToWorld(V2.set(0, 0.006, 0.02));
      fly.position.copy(P0.lerp(P1, a)); fly.quaternion.copy(inT.getWorldQuaternion(new THREE.Quaternion())); fly.rotateX(-Math.PI / 2); fly.visible = a < 0.85; }
    else if (p > 0.55) { const a = easeInOutSine((p - 0.55) / 0.45); const P0 = sc.localToWorld(V.set(0, 0.12, 0.08)), P1 = outT.localToWorld(V2.set(0, 0.012 + outS.scale.y * 0.004, 0.18));
      fly.position.copy(P0.lerp(P1, a)); fly.position.y += Math.sin(a * Math.PI) * 0.02; fly.quaternion.copy(outT.getWorldQuaternion(new THREE.Quaternion())); fly.rotateX(-Math.PI / 2); fly.visible = a > 0.08; }
    sc.userData.led.material.color.setRGB(0.2, 1.6 + Math.sin(T * 9) * 0.4, 0.5);
    // ---- Ana: prepara folhas (retira da pilha e monta o lote)
    const cyc = (T * 0.55) % 1; const k = cyc < 0.5 ? easeInOutSine(cyc / 0.5) : 1 - easeInOutSine((cyc - 0.5) / 0.5);
    const pickP = A.prepIn.localToWorld(V3(0, 0.06, 0.03)), placeP = A.prepOut.localToWorld(V3(0, 0.04, 0.03));
    const tgt = pickP.clone().lerp(placeP, k); tgt.y += Math.sin(k * Math.PI) * 0.1;
    prepSheet.visible = cyc < 0.5 && k > 0.05 && k < 0.95; prepSheet.position.copy(tgt).add(V3(0, -0.02, 0.02)); prepSheet.rotation.set(-Math.PI / 2 + 0.3, 0, 0.2);
    act(c.ana, T, { pose: add(idle(c.ana, T, 0.5), { spineX: 0.32, headX: 0.25 }), pos: [-4.05, -2.08], yaw: 0, face: T > 30.5 ? F.smile : F.focus, look: T > 30.9 && T < 32.2 ? eyesOf(c.diego) : tgt, ik: [['r', tgt], ['l', A.prepIn.localToWorld(V3(-0.12, 0.06, 0.08))]] });
    // ---- Diego: alimenta o scanner
    act(c.diego, T, { pose: add(idle(c.diego, T, 0.5), { spineX: 0.22, headX: 0.25 }), pos: [-1.12, -3.05], yaw: 0.05, face: T > 31 ? F.smile : F.focus, look: T > 31 && T < 31.7 ? eyesOf(c.ana) : T >= 31.7 ? eyesOf(c.bruna) : sc.localToWorld(V3(0, 0.25, 0.1)),
      ik: [['r', sc.localToWorld(V3(-0.13, 0.24, 0.3 + Math.sin(T * 1.3) * 0.02))], ['l', outT.localToWorld(V3(0.08, 0.03, 0.12))]] });
    // ---- Bruna: confere a qualidade das imagens
    const bIk = [['r', V3(1.95, 0.8, -2.62 + Math.sin(T * 0.8) * 0.02)]];
    act(c.bruna, T, { pose: add(idle(c.bruna, T, 0.5), { spineX: 0.18, headX: 0.1 }, T > 31.6 ? mix({}, { lShX: -0.5, lShZ: 0.2, lEl: -1.6, lCurl: 0.95, lThumb: 0.0, lWrY: 0.5 }, smooth(range(T, 31.6, 32.0))) : {}),
      pos: [1.72, -3.0], yaw: 0, face: T > 31.5 ? F.bigSmile : F.focus, look: T > 31.6 ? eyesOf(c.diego) : V3(1.7, 1.0, -2.2), ik: bIk });
    // ---- Lucas: indexa os documentos (sentado)
    const typ = { lEl: -0.95 + Math.sin(T * 13) * 0.05, rEl: -0.95 + Math.cos(T * 11) * 0.05 };
    act(c.lucas, T, { pose: add(P.sit, P.typing, typ, idle(c.lucas, T, 0.3)), pos: [lucasSeat.x, lucasSeat.z, 0], yaw: ixYaw, face: T > 31 && T < 32.2 ? F.smile : F.focus, look: T > 31 && T < 32.2 ? eyesOf(c.diego) : ixScreen });
    const s = shots(camera, T, SH);
    const f = typeof s.focus === 'string' ? focusOn(camera, c[s.focus]) : focusOn(camera, s.focus);
    return { focus: f, aperture: s.ap ?? 0.8, warm: 0.25, vignette: 0.22, bloom: 0.16 };
  } };
}
