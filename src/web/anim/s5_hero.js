// Cena 5 (44,7–60 s): o grande personagem da DigitalGov se apresenta; ao fundo, a equipe da prefeitura num ambiente organizado.
import * as THREE from 'three';
import { buildAdmin, rollupBanner } from './sets.js';
import { make } from './cast.js';
import { act, P, F, shots, add, idle, mix, track, V3, eyesOf, focusOn, mouthAt, walkPath } from './act.js';
import { tidyScreens } from './s4_hall.js';
import { range, smooth, lerp, easeInOutCubic } from '../core.js';

export async function create(env, TL) {
  const scene = new THREE.Scene(); const A = buildAdmin(scene, env, { tidy: true }); tidyScreens(A, 0);
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 60);
  const c = {}; for (const k of ['prefeito', 'claudia', 'rafael', 'juliana', 'marcos', 'paulo', 'fatima', 'jose']) { c[k] = make(k); scene.add(c[k].root); }
  const hero = make('heroi', { scale: 1.16 }); scene.add(hero.root);
  const ban = rollupBanner(2.05); ban.position.set(-1.45, 0, 0.35); ban.rotation.y = 0.4; scene.add(ban);
  const HP = [0.35, 1.75];   // posição do protagonista (primeiro plano)
  const EC = TL.endcard.in;
  const SH = [
    // revela: começa na equipe ao fundo e desliza até o protagonista
    { t0: 44.7, t1: 46.2, a: { p: [2.7, 1.6, 4.7], l: [-0.6, 1.25, -1.5], fov: 36 }, b: { p: [1.05, 1.74, 4.25], l: [0.3, 1.7, 1.2], fov: 33 }, ease: easeInOutCubic, focus: 'hero' },
    { t0: 46.2, t1: EC - 0.4, a: { p: [1.05, 1.74, 4.25], l: [0.3, 1.7, 1.2], fov: 33 }, b: { p: [0.85, 1.76, 3.9], l: [0.3, 1.74, 1.2], fov: 32 }, focus: 'hero' },
    // composição final: protagonista no terço esquerdo, cartão à direita
    { t0: EC - 0.4, t1: EC + 1.2, a: { p: [0.85, 1.76, 3.9], l: [0.3, 1.74, 1.2], fov: 32 }, b: { p: [1.6, 1.7, 4.75], l: [1.75, 1.6, 1.2], fov: 35 }, ease: easeInOutCubic, focus: 'hero' },
    { t0: EC + 1.2, t1: 60.5, a: { p: [1.6, 1.7, 4.75], l: [1.75, 1.6, 1.2], fov: 35 }, b: { p: [1.58, 1.7, 4.62], l: [1.75, 1.61, 1.2], fov: 34.5 }, focus: 'hero' },
  ];
  return { scene, camera, update(lt, T) {
    tidyScreens(A, T);
    const s = shots(camera, T, SH); camera.updateMatrixWorld();
    // --- Protagonista: entra no quadro, cumprimenta e apresenta a DigitalGov
    const enter = smooth(range(T, 44.7, 45.6));
    const wk = walkPath(T, 44.3, 45.55, [[HP[0] + 1.5, HP[1] - 0.35], [HP[0], HP[1]]]); const hx = wk.x, hz = wk.z;
    const m = mouthAt('heroi', T);
    const g = (a, b) => smooth(range(T, a, b));
    // gestos ao longo da fala (P1: 45,6 → 58,3)
    let pose = add(idle(hero, T), wk.pose, { spineX: -0.02 });
    pose = add(pose, mix({}, P.waveR, g(45.4, 45.75) * (1 - g(46.5, 46.9))));                                   // "Olá!"
    pose = add(pose, { rWrZ: Math.sin(T * 9) * 0.25 * g(45.5, 45.8) * (1 - g(46.4, 46.7)) });
    pose = add(pose, mix({}, P.chestR, g(46.9, 47.2) * (1 - g(48.3, 48.7))));                                   // "Nós somos a DigitalGov."
    pose = add(pose, mix({}, P.openBoth, g(48.8, 49.3) * (1 - g(51.5, 51.9))));                                 // "Ajudamos prefeituras..."
    pose = add(pose, mix({}, { rShX: -0.6, rShZ: 0.25, rEl: -1.25, rCurl: 0.9, rPoint: 1, rThumb: 0.6, rWrY: 0.3, lShX: -0.45, lShZ: 0.2, lEl: -1.35, lWrY: 1.2, lCurl: 0.1, lSpread: 0.5 }, g(51.9, 52.2) * (1 - g(54.4, 54.8))));   // enumera serviços
    pose = add(pose, mix({}, P.presentR, g(54.9, 55.6) * (1 - g(58.4, 59.0))));                                 // convite → cartão final
    pose = add(pose, mix({}, P.handsFront, g(58.6, 59.2)));
    const look = T < 44.95 ? V3(-1, 1.4, -1) : T < 55.2 || T > 56.9 ? camera.position.clone() : V3(3.2, 1.6, 2.6);
    act(hero, T, { pose, pos: [hx, hz], yaw: lerp(wk.yaw, 0.12, smooth(range(T, 45.3, 45.9))) + (T > 55 ? 0.12 * g(55, 55.8) : 0), face: m.active ? { smile: 0.55, browUp: 0.1 } : F.bigSmile, who: 'heroi', look, lookAmt: 0.55 });
    // --- Equipe ao fundo (ambiente organizado e agradável)
    act(c.prefeito, T, { pose: add(idle(c.prefeito, T), T > 46.5 && T < 48.5 ? { rShX: -0.2, rShZ: 2.2, rEl: -1.0, rWrY: -1.5, rCurl: 0.05, rSpread: 0.6 } : P.hipR), pos: [-0.9, -1.0], yaw: 0.35, face: F.bigSmile, look: T > 46 && T < 49 ? eyesOf(hero) : eyesOf(c.claudia) });
    act(c.claudia, T, { pose: add(idle(c.claudia, T), P.handsFront), pos: [-0.15, -1.25], yaw: -0.4, face: F.smile, look: T > 46 && T < 49 ? eyesOf(hero) : eyesOf(c.prefeito) });
    act(c.rafael, T, { pose: add(idle(c.rafael, T), T > 50 && T < 52 ? { lShX: -0.3, lShZ: 0.4, lEl: -1.7, lCurl: 0.95, lThumb: 0, lWrY: 0.5 } : P.hipL), pos: [1.6, -1.9], yaw: -0.35, face: F.bigSmile, look: T > 49 && T < 53 ? eyesOf(hero) : eyesOf(c.juliana) });
    act(c.juliana, T, { pose: add(idle(c.juliana, T), P.holdFolder), pos: [2.35, -1.45], yaw: -0.9, face: F.smile, look: eyesOf(c.rafael) });
    act(c.paulo, T, { pose: add(idle(c.paulo, T), P.armsCross), pos: [-2.0, -1.9], yaw: 0.6, face: F.smile, look: T > 47 && T < 52 ? eyesOf(hero) : eyesOf(c.prefeito) });
    const sw = Math.sin(T * 1.6) * 0.5 + 0.5;
    act(c.marcos, T, { pose: add(idle(c.marcos, T)), pos: [5.1, -1.8], yaw: Math.PI / 2, face: F.smile, look: V3(5.75, 1.3, -1.8 + sw * 0.2), ik: [['r', V3(5.55, 1.28, -1.95 + sw * 0.35)]] });
    // Seu José, finalmente atendido por Fátima
    act(c.fatima, T, { pose: add(P.sit, P.mouse, idle(c.fatima, T, 0.3)), pos: [-2.42, -0.72, 0], yaw: 0.6, face: F.smile, look: T % 6 < 3 ? eyesOf(c.jose) : V3(-2.95, 1.07, 0.12) });
    act(c.jose, T, { pose: add(idle(c.jose, T), P.handsFront), pos: [-2.0, 0.75], yaw: Math.PI + 0.35, face: F.bigSmile, look: eyesOf(c.fatima) });
    const f = s.focus === 'hero' ? (T < 45.2 ? lerp(7, focusOn(camera, hero), smooth(range(T, 44.7, 45.4))) : focusOn(camera, hero)) : 5;
    return { focus: f, aperture: 1.25, warm: 0.45, vignette: 0.22, bloom: 0.18 };
  } };
}
