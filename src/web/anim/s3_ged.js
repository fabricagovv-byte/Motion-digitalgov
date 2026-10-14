// Cena 3b (32,9–39 s): de volta à prefeitura, Cláudia encontra o processo no GED na hora.
import * as THREE from 'three';
import { buildAdmin } from './sets.js';
import { make } from './cast.js';
import { act, P, F, shots, add, idle, mix, V3, eyesOf, focusOn } from './act.js';
import { drawSearch } from './ged.js';
import { drawOldScreen } from './s1_admin.js';
import { range, smooth, lerp } from '../core.js';

export async function create(env) {
  const scene = new THREE.Scene(); const A = buildAdmin(scene, env, { tidy: false });
  for (const k in A.screens) { if (k === 'claudia') continue; const t = A.screens[k]; drawOldScreen(t.userData.g, 1600, 1000, k.length); t.needsUpdate = true; }
  A.deskPiles[1].position.set(-3.1, 0.745, 0.2); A.deskPiles[2].position.set(-1.75, 0.745, 0.3); A.deskPiles[2].scale.y = 0.6; A.deskPiles[3].position.set(-2.1, 0.745, 0.32);
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 60);
  const c = {}; for (const k of ['claudia', 'rafael', 'juliana', 'paulo']) { c[k] = make(k); scene.add(c[k].root); }
  A.monClaudia.updateWorldMatrix(true, true); const scr = A.monClaudia.localToWorld(V3(0, A.monClaudia.userData.cy, 0.01));
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(A.monClaudia.getWorldQuaternion(new THREE.Quaternion()));
  const camA = scr.clone().add(n.clone().multiplyScalar(0.75)).add(V3(0.18, 0.12, 0)), camA2 = scr.clone().add(n.clone().multiplyScalar(0.6)).add(V3(0.12, 0.08, 0));
  const SH = [
    { t0: 32.9, t1: 34.25, a: { p: camA.toArray(), l: scr.toArray(), fov: 33 }, b: { p: camA2.toArray(), l: scr.toArray(), fov: 32 }, focus: scr, ap: 0.5, hand: 0.5 },
    { t0: 34.25, t1: 39.1, a: { p: [-1.05, 1.32, 0.85], l: [-2.4, 1.12, -0.95], fov: 36 }, b: { p: [-1.15, 1.3, 0.65], l: [-2.4, 1.14, -0.95], fov: 33 }, focus: 'claudia', ap: 0.8 },
  ];
  const chairPos = [-2.42, -0.78];
  return { scene, camera, update(lt, T) {
    drawSearch(A.screens.claudia.userData.g, 1600, 1000, { type: 1, blink: T, subject: 1, results: 1, select: smooth(range(T, 32.9, 33.1)), open: lerp(0.5, 1, smooth(range(T, 33.2, 33.8))) * (T > 33.15 ? 1 : 0.6),
      query: 'processo 2023/004518', cursor: T < 33.3 ? [lerp(760, 640, range(T, 32.9, 33.15)), 420] : null }); A.screens.claudia.needsUpdate = true;
    // Cláudia sentada diante do GED
    const talkT = T > 33.5;
    let cPose = add(P.sit, idle(c.claudia, T, 0.4), mix(P.mouse, {}, smooth(range(T, 33.6, 34.0))));
    if (talkT) cPose = add(cPose, mix(mix({}, { rShX: -0.7, rShZ: 0.2, rEl: -0.9, rWrY: 1.0, rCurl: 0.1, rSpread: 0.5 }, smooth(range(T, 34.6, 35.0)) * (1 - smooth(range(T, 36.2, 36.6)))),
      { lShX: -0.55, lShZ: 0.75, lEl: -0.5, lWrY: 1.2, lCurl: 0.05, lSpread: 0.6 }, smooth(range(T, 36.7, 37.2)) * (1 - smooth(range(T, 38.6, 39.0)))), { spineX: -0.06 * smooth(range(T, 33.6, 34)) });
    const cLook = T < 33.6 ? scr : T < 34.6 ? eyesOf(c.rafael) : T < 36.3 ? scr : T < 37.6 ? V3(-1.8, 1.0, 0.3) : eyesOf(c.juliana);
    act(c.claudia, T, { pose: cPose, pos: [chairPos[0], chairPos[1], 0], yaw: -0.5 + 0.45 * smooth(range(T, 33.5, 34.2)), face: T < 33.5 ? F.focus : T < 34.4 ? F.surprised : F.bigSmile, who: 'claudia', look: cLook, lookAmt: 0.7 });
    // Rafael e Juliana se inclinam para ver
    act(c.rafael, T, { pose: add(idle(c.rafael, T), P.lean, { spineX: -0.15, lShX: -0.2, rShX: -0.2 }, T > 37 ? { lShX: -0.3, lShZ: 0.4, lEl: -1.7, lCurl: 0.95, lThumb: 0, lWrY: 0.5 } : {}),
      pos: [-1.85, -1.55], yaw: -0.25, face: T > 33.8 ? F.bigSmile : F.focus, look: T < 34.8 ? scr : eyesOf(c.claudia) });
    act(c.juliana, T, { pose: add(idle(c.juliana, T), P.lean, { spineX: -0.12 }, P.handsFront), pos: [-2.9, -1.55], yaw: 0.35, face: T > 34 ? F.smile : F.focus, look: T < 36.5 ? scr : eyesOf(c.claudia) });
    act(c.paulo, T, { pose: add(idle(c.paulo, T), P.armsCross), pos: [-1.05, -2.35], yaw: -0.6, face: T > 35 ? F.smile : F.neutral, look: eyesOf(c.claudia) });
    const s = shots(camera, T, SH);
    const f = typeof s.focus === 'string' ? focusOn(camera, c[s.focus]) : focusOn(camera, s.focus);
    return { focus: f, aperture: s.ap ?? 0.8, warm: 0.4, vignette: 0.24 };
  } };
}
