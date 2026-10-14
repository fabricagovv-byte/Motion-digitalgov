// Cena 2 (13,7–22,3 s): o desafio da papelada no arquivo. Juliana encontra a pasta; o prefeito decide modernizar.
import * as THREE from 'three';
import { buildArchive } from './sets.js';
import { make } from './cast.js';
import { act, walkPath, P, F, shots, add, idle, mix, track, V3, eyesOf, carry, focusOn } from './act.js';
import { clamp, range, smooth, lerp } from '../core.js';

export async function create(env) {
  const scene = new THREE.Scene(); const A = buildArchive(scene, env);
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 60);
  const c = {}; for (const k of ['juliana', 'marcos', 'rafael', 'fatima', 'paulo', 'prefeito', 'claudia']) { c[k] = make(k); scene.add(c[k].root); }
  const boxM = carry.box(c.marcos, { code: 'PRT-211', year: '2011', title: 'Protocolos' });
  const boxR = carry.box(c.rafael, { code: 'PRT-215', year: '2010', title: 'Processos' });
  const clip = carry.inHand(c.fatima, 'l', carry.folder(0x8a6a3a, 0.23, 0.31), [0.0, -0.1, 0.05], [Math.PI / 2 - 0.25, 0, Math.PI / 2]);
  carry.inHand(c.claudia, 'r', carry.folder(0xc0392b), [0.0, -0.1, 0.06], [Math.PI / 2 - 0.3, 0, 0]);
  // pasta encontrada por Juliana: na estante e depois na mão
  const shelfFolder = carry.folder(0xe0a82e, 0.24, 0.3); shelfFolder.position.set(4.45, 1.23, -1.98); shelfFolder.rotation.set(0, Math.PI / 2, 0); scene.add(shelfFolder);
  const handFolder = carry.inHand(c.juliana, 'r', carry.folder(0xe0a82e, 0.24, 0.3), [0.0, -0.11, 0.04], [Math.PI / 2 - 0.2, 0, 0]);
  const SH = [
    { t0: 13.7, t1: 15.0, a: { p: [0.55, 1.42, 3.7], l: [-0.6, 1.05, 1.2], fov: 33 }, b: { p: [0.4, 1.4, 3.4], l: [-0.6, 1.05, 1.2], fov: 31 }, focus: 'fatima' },
    { t0: 15.0, t1: 16.1, a: { p: [0.2, 1.3, 3.3], l: [0.0, 1.15, -1.5], fov: 38 }, b: { p: [0.05, 1.32, 2.6], l: [0.2, 1.15, -1.5], fov: 36 }, focus: 'rafael' },
    { t0: 16.1, t1: 20.05, a: { p: [3.45, 1.42, -0.45], l: [4.05, 1.32, -2.1], fov: 34 }, b: { p: [3.4, 1.42, -0.7], l: [4.05, 1.35, -2.05], fov: 31 }, focus: 'juliana' },
    { t0: 20.05, t1: 22.4, a: { p: [0.25, 1.48, 3.75], l: [2.6, 1.45, 2.05], fov: 31 }, b: { p: [0.45, 1.48, 3.5], l: [2.6, 1.47, 2.05], fov: 28 }, focus: 'prefeito' },
  ];
  return { scene, camera, update(lt, T) {
    // Fátima confere números das caixas na mesa
    const fPose = add(idle(c.fatima, T), { lShX: -0.55, lShY: -0.3, lEl: -1.35, lWrY: 0.4, spineX: 0.2, headX: 0.15 });
    const fIk = [['r', V3(-0.55 + Math.sin(T * 1.4) * 0.08, 0.98, 1.5)]];
    act(c.fatima, T, { pose: fPose, pos: [-0.35, 0.92], yaw: 0, face: F.focus, look: T < 19.5 ? A.openBox.localToWorld(V3(0, 0.2, 0.1)) : eyesOf(c.prefeito), ik: T < 19.5 ? fIk : [] });
    // Paulo abre outra caixa
    A.lid.rotation.x = -1.9 * smooth(range(T, 13.9, 14.6));
    A.openBox.updateWorldMatrix(true, true);
    const pIk = T < 14.6 ? [['r', A.lid.localToWorld(V3(0, 0.02, 0.28))], ['l', A.openBox.localToWorld(V3(-0.15, 0.25, 0.1))]] : [['r', A.openBox.localToWorld(V3(0.05, 0.22, -0.02 + Math.sin(T * 2.5) * 0.06))]];
    act(c.paulo, T, { pose: add(idle(c.paulo, T), { spineX: 0.28, headX: 0.25 }), pos: [-1.2, 1.5], yaw: Math.PI / 2, face: F.focus, look: T < 19.5 ? A.openBox.localToWorld(V3(0, 0.2, 0)) : eyesOf(c.prefeito), ik: T < 19.8 ? pIk : [] });
    // Marcos e Rafael carregam caixas pelo corredor
    const wm = walkPath(T, 13.5, 18.5, [[0.45, -4.2], [0.35, 0.4], [-0.9, 2.7]]);
    act(c.marcos, T, { pose: add(wm.pose, P.holdBox, { lShX: 0, rShX: 0 }), pos: [wm.x, wm.z], yaw: wm.yaw, face: F.focus, ik: carry.ik(c.marcos, boxM) });
    const wr = walkPath(T, 14.3, 19.2, [[-0.35, -4.6], [-0.4, -0.5], [-2.8, 0.6]]);
    act(c.rafael, T, { pose: add(wr.pose, P.holdBox, { lShX: 0, rShX: 0 }), pos: [wr.x, wr.z], yaw: wr.yaw, face: T > 15.2 && T < 16 ? F.smile : F.focus, look: T > 15.2 && T < 16 ? eyesOf(c.marcos) : null, ik: carry.ik(c.rafael, boxR) });
    // Juliana procura, encontra e comenta
    const found = T >= 16.12;
    shelfFolder.visible = !found; handFolder.visible = found;
    const jYaw = lerp(Math.PI / 2, -0.25, smooth(range(T, 16.5, 17.3)));
    let jPose = add(idle(c.juliana, T));
    const jIk = [];
    if (!found) { const sx = Math.sin(T * 2.2) * 0.12; jIk.push(['r', V3(4.4, 1.33, -1.95 + sx)], ['l', V3(4.4, 1.25, -2.35 + sx * 0.5)]); jPose = add(jPose, { headX: 0.05, spineX: 0.05 }); }
    else {
      const up = smooth(range(T, 16.12, 16.45)) * (1 - smooth(range(T, 17.0, 17.6)));
      jPose = add(jPose, mix(P.holdFolder, { rShX: -1.35, rShZ: 0.35, rEl: -0.9, rWrY: 0.4, rCurl: 0.5 }, up), { headX: -0.08 * up },
        mix({}, { lShX: -0.5, lShZ: 0.55, lEl: -0.5, lWrY: 1.2, lCurl: 0.1, lSpread: 0.6 }, smooth(range(T, 18.2, 18.7)) * (1 - smooth(range(T, 19.6, 20.0)))));
    }
    const jLook = !found ? V3(4.4, 1.3, -2.0) : T < 16.7 ? V3(4.0, 1.75, -1.4) : T < 18.3 ? V3(3.35, 1.45, -0.7) : T < 19.4 ? V3(4.3, 1.4, -1.2) : V3(3.1, 1.5, -0.4);
    act(c.juliana, T, { pose: jPose, pos: [3.98, -2.05], yaw: jYaw, face: !found ? F.focus : T < 17.0 ? F.relief : { smile: 0.35, browUp: 0.3, browIn: 0.1 }, who: 'juliana', look: jLook, lookAmt: 0.75, ik: jIk });
    // Prefeito e Cláudia entram pela porta do arquivo
    const wp = walkPath(T, 17.6, 20.1, [[7.6, 3.5], [5.2, 3.1], [2.65, 2.1]]);
    const st = T >= 20.1; const pYaw = st ? lerp(wp.yaw, -1.75, smooth(range(T, 20.0, 20.5))) : wp.yaw;
    let pPose = add(wp.pose, idle(c.prefeito, T, st ? 1 : 0.3));
    if (st) pPose = add(pPose, mix({}, P.openR, smooth(range(T, 20.5, 20.9)) * (1 - smooth(range(T, 21.8, 22.3)))), { spineX: -0.04 });
    act(c.prefeito, T, { pose: pPose, pos: [wp.x, wp.z], yaw: pYaw, face: st ? { smile: 0.35, browUp: 0.15 } : F.neutral, who: 'prefeito', look: T < 20.1 ? eyesOf(c.juliana) : V3(0.0, 1.4, 1.4), lookAmt: 0.7 });
    const wc = walkPath(T, 17.9, 20.4, [[7.6, 3.9], [5.4, 3.6], [3.25, 2.95]]);
    act(c.claudia, T, { pose: add(wc.pose, idle(c.claudia, T, 0.5), P.holdFolder), pos: [wc.x, wc.z], yaw: T >= 20.4 ? lerp(wc.yaw, -1.6, smooth(range(T, 20.3, 20.8))) : wc.yaw, face: T > 20.3 ? F.smile : F.neutral, look: eyesOf(c.prefeito) });
    const s = shots(camera, T, SH);
    return { focus: focusOn(camera, c[s.focus]), aperture: 0.9, warm: 0.3, vignette: 0.24 };
  } };
}
