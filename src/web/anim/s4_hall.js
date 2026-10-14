// Cena 4 (39–44,7 s): a prefeitura organizada; o prefeito comemora a mudança com a equipe.
import * as THREE from 'three';
import { buildAdmin, rollupBanner } from './sets.js';
import { make } from './cast.js';
import { act, walkPath, P, F, shots, add, idle, mix, V3, eyesOf, focusOn, carry } from './act.js';
import { drawSearch } from './ged.js';
import { range, smooth, lerp } from '../core.js';

export function tidyScreens(A, T) {
  for (const k in A.screens) { drawSearch(A.screens[k].userData.g, 1600, 1000, { type: 1, blink: T, subject: 1, results: 1, select: 1, open: k === 'claudia' ? 1 : 0.3, query: 'processo 2023/004518' }); A.screens[k].needsUpdate = true; }
}
export async function create(env) {
  const scene = new THREE.Scene(); const A = buildAdmin(scene, env, { tidy: true });
  tidyScreens(A, 0);
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 60);
  const c = {}; for (const k of ['prefeito', 'claudia', 'paulo', 'juliana', 'marcos', 'rafael', 'fatima']) { c[k] = make(k); scene.add(c[k].root); }
  const fold = carry.inHand(c.marcos, 'r', carry.folder(0x2f5ea8, 0.08, 0.3), [0.0, -0.1, 0.04], [Math.PI / 2, 0, Math.PI / 2]);
  const SH = [
    { t0: 39.0, t1: 41.6, a: { p: [2.6, 1.55, 3.9], l: [-0.6, 1.2, -0.6], fov: 40 }, b: { p: [2.2, 1.52, 3.5], l: [-0.8, 1.22, -0.6], fov: 37 }, focus: 'prefeito', ap: 0.6 },
    { t0: 41.6, t1: 44.8, a: { p: [0.35, 1.5, 1.95], l: [-0.85, 1.42, -0.1], fov: 30 }, b: { p: [0.2, 1.5, 1.7], l: [-0.85, 1.44, -0.1], fov: 28 }, focus: 'prefeito', ap: 0.9 },
  ];
  return { scene, camera, update(lt, T) {
    // prefeito, Cláudia e Paulo conversam no centro da sala
    const pPose = add(idle(c.prefeito, T), mix(mix({}, P.openBoth, smooth(range(T, 39.7, 40.2)) * (1 - smooth(range(T, 41.0, 41.4)))), P.presentR, smooth(range(T, 41.6, 42.1)) * (1 - smooth(range(T, 43.6, 44.2)))));
    const pLook = T < 41.2 ? eyesOf(c.claudia) : T < 42.6 ? V3(0.6, 1.3, -2.6) : T < 43.5 ? eyesOf(c.paulo) : eyesOf(c.claudia);
    act(c.prefeito, T, { pose: pPose, pos: [-0.85, -0.25], yaw: 0.55, face: { smile: 0.8, squint: 0.2, browUp: 0.2 }, who: 'prefeito', look: pLook });
    act(c.claudia, T, { pose: add(idle(c.claudia, T), P.handsFront), pos: [0.05, 0.55], yaw: -2.2, face: F.smile, look: eyesOf(c.prefeito) });
    act(c.paulo, T, { pose: add(idle(c.paulo, T), T > 42.8 ? { rShX: -0.5, rShZ: 0.2, rEl: -1.6, rCurl: 0.95, rThumb: 0, rWrY: 0.5 } : P.armsCross), pos: [-1.6, 0.75], yaw: 2.4, face: T > 42.5 ? F.bigSmile : F.smile, look: T > 42.5 && T < 43.5 ? eyesOf(c.prefeito) : eyesOf(c.claudia) });
    // Juliana consulta um documento no computador (sentada)
    act(c.juliana, T, { pose: add(P.sit, P.mouse, { lShX: -0.5, lEl: -1.1, lShZ: 0.1 }, idle(c.juliana, T, 0.3)), pos: [3.4, -3.08, 0], yaw: 0, face: T > 42.4 ? F.smile : F.focus, look: T > 42.4 && T < 43.6 ? eyesOf(c.prefeito) : V3(3.4, 1.0, -2.35) });
    // Marcos organiza as pastas restantes na estante
    const sw = Math.sin(T * 1.6) * 0.5 + 0.5;
    act(c.marcos, T, { pose: add(idle(c.marcos, T), { spineX: 0.05 }), pos: [5.1, -1.8], yaw: Math.PI / 2, face: F.smile, look: V3(5.75, 1.3, -1.8 + sw * 0.2), ik: [['r', V3(5.55, 1.28, -1.95 + sw * 0.35)]] });
    act(c.rafael, T, { pose: add(idle(c.rafael, T), P.hipL), pos: [0.9, -1.25], yaw: -0.9, face: F.smile, look: eyesOf(c.prefeito) });
    act(c.fatima, T, { pose: add(P.sit, P.typing, idle(c.fatima, T, 0.3)), pos: [-2.42, -0.72, 0], yaw: -0.5, face: F.smile, look: V3(-2.95, 1.07, 0.12) });
    tidyScreens(A, T);
    const s = shots(camera, T, SH);
    return { focus: focusOn(camera, c[s.focus]), aperture: s.ap, warm: 0.5, vignette: 0.2 };
  } };
}
