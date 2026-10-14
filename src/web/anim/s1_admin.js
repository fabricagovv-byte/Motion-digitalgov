// Cena 1b (3,2–13,7 s): sala administrativa movimentada. A pilha balança, Rafael segura; Cláudia responde; o prefeito chega.
import * as THREE from 'three';
import { buildAdmin } from './sets.js';
import { make } from './cast.js';
import { act, walkPath, P, F, shots, add, idle, mix, track, V3, eyesOf, carry, focusOn } from './act.js';
import { drawSearch } from './ged.js';
import { clamp, range, smooth, lerp } from '../core.js';

export function adminCast(scene, keys) { const o = {}; for (const k of keys) { o[k] = make(k); scene.add(o[k].root); } return o; }
// Tela de computador "em uso" (planilha / protocolo) para os monitores da prefeitura antes do GED
export function drawOldScreen(g, W, H, seed = 0) {
  g.fillStyle = '#e9edf2'; g.fillRect(0, 0, W, H); g.fillStyle = '#3a5f8f'; g.fillRect(0, 0, W, 64); g.fillStyle = '#fff'; g.font = '600 26px Inter'; g.fillText('Protocolo — Planilha de controle', 28, 42);
  g.fillStyle = '#fff'; g.fillRect(30, 96, W - 60, H - 130); g.strokeStyle = '#c9d2de'; g.lineWidth = 1.5;
  for (let r = 0; r < 18; r++) { g.beginPath(); g.moveTo(30, 96 + r * 46); g.lineTo(W - 30, 96 + r * 46); g.stroke(); }
  for (let c = 0; c < 6; c++) { g.beginPath(); g.moveTo(30 + c * 250, 96); g.lineTo(30 + c * 250, H - 34); g.stroke(); }
  g.fillStyle = '#5a6a82'; g.font = '400 20px Inter';
  for (let r = 1; r < 17; r++) for (let c = 0; c < 6; c++) if ((r * 7 + c * 3 + seed) % 5) g.fillText(['2019/00' + (310 + r), 'Processo', 'ADM', 'Caixa ' + (100 + r), '??', 'pendente'][c], 44 + c * 250, 126 + r * 46);
}

export async function create(env) {
  const scene = new THREE.Scene(); const A = buildAdmin(scene, env, { tidy: false });
  for (const k in A.screens) { const t = A.screens[k]; drawOldScreen(t.userData.g, 1600, 1000, k.length); t.needsUpdate = true; }
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 60);
  const c = adminCast(scene, ['rafael', 'claudia', 'paulo', 'juliana', 'fatima', 'marcos', 'prefeito', 'jose']);
  const box = carry.box(c.marcos, { code: 'ADM-152', year: '2014', title: 'Contratos' });
  carry.inHand(c.paulo, 'r', carry.folder(0x3f8a5a), [0.0, -0.1, 0.06], [Math.PI / 2 - 0.3, 0, 0]);
  const chairF = new THREE.Vector3(3.4, 0, -3.25);
  const pileTop = () => { A.pile.updateWorldMatrix(true, true); return A.pile.userData.pivot.localToWorld(new THREE.Vector3(0, A.pile.userData.h, 0)); };
  const pileAt = (y, dx = 0, dz = 0) => { A.pile.updateWorldMatrix(true, true); return A.pile.userData.pivot.localToWorld(new THREE.Vector3(dx, y, dz)); };
  const drawer = A.cabinets[1].userData.drawers[2];
  // Planos
  const SH = [
    { t0: 3.2, t1: 4.8, a: { p: [-0.9, 1.25, 4.4], l: [1.6, 1.05, 0.3], fov: 40 }, b: { p: [-0.5, 1.3, 4.1], l: [1.75, 1.1, 0.5], fov: 37 }, focus: 'rafael' },
    { t0: 4.8, t1: 7.15, a: { p: [0.55, 1.48, 2.95], l: [1.95, 1.38, 0.85], fov: 31 }, b: { p: [0.75, 1.48, 2.7], l: [2.0, 1.4, 0.85], fov: 28 }, focus: 'rafael' },
    { t0: 7.15, t1: 9.95, a: { p: [-1.05, 1.42, 1.75], l: [-2.3, 1.3, -0.6], fov: 31 }, b: { p: [-1.2, 1.42, 1.5], l: [-2.3, 1.32, -0.6], fov: 28 }, focus: 'claudia' },
    { t0: 9.95, t1: 13.8, a: { p: [-1.2, 1.45, 3.4], l: [-3.7, 1.3, 0.1], fov: 34 }, b: { p: [-1.75, 1.45, 3.0], l: [-3.85, 1.38, 0.25], fov: 30 }, focus: 'prefeito' },
  ];
  return { scene, camera, update(lt, T) {
    // --- pilha que balança
    const lean = track(T, [[3.75, 0], [3.9, -0.05], [4.0, -0.01], [4.12, -0.09], [4.3, -0.17], [4.45, -0.13], [4.9, -0.05], [5.6, -0.035]]);
    const wob = T > 3.75 && T < 4.4 ? Math.sin((T - 3.75) * 34) * 0.012 * (1 - range(T, 4.2, 4.4)) : 0;
    A.pile.userData.pivot.rotation.z = lean + wob; A.pile.userData.pivot.rotation.x = lean * 0.25;
    A.pile.userData.items.forEach(([m, y], i) => { m.position.x = (m.userData.x0 ??= m.position.x) - lean * y * 0.35 * (i % 2 ? 1 : 0.6); });
    // --- Rafael: coloca uma pasta na pilha, recua, percebe e segura
    const rPos = track(T, [[3.2, [2.55, 1.35]], [3.55, [2.3, 1.0]], [3.85, [2.45, 1.15]], [4.12, [2.38, 1.08]], [4.3, [2.2, 0.98]]]);
    const rYaw = Math.atan2(1.55 - rPos[0], 0.6 - rPos[1]);
    const catching = T > 4.12;
    const rk = smooth(range(T, 4.05, 4.3));
    let rPose = add(idle(c.rafael, T), mix(P.holdFolder, P.stand, range(T, 3.5, 3.7)), { spineX: 0.25 * rk, headX: 0.05 });
    if (T > 4.6) rPose = add(rPose, { spineX: -0.15 * smooth(range(T, 4.6, 5.0)), headY: -0.35 * smooth(range(T, 4.7, 5.1)) }, mix({}, P.openL, smooth(range(T, 5.1, 5.5)) * (1 - smooth(range(T, 6.7, 7.1)))));
    const rIk = [];
    if (T < 3.62) { const k = smooth(range(T, 3.3, 3.55)); if (k > 0) rIk.push(['r', pileTop().add(V3(0.08, 0.06, 0.05 + (1 - k) * 0.2))], ['l', pileTop().add(V3(0.0, 0.06, 0.14 + (1 - k) * 0.2))]); }
    if (catching) { rIk.push(['r', pileAt(0.62, 0.17, 0.0)]); if (T < 5.15) rIk.push(['l', pileAt(0.95, 0.15, 0.08)]); }
    const rLook = T < 4.75 ? pileTop() : T < 6.9 ? V3(0.65, 1.5, 2.8) : eyesOf(c.claudia);
    const rFace = T < 3.8 ? F.focus : T < 4.6 ? F.surprised : { smile: 0.55, browUp: 0.3, squint: 0.1 };
    act(c.rafael, T, { pose: rPose, pos: rPos, yaw: rYaw + (T > 4.75 ? 0.85 * smooth(range(T, 4.7, 5.3)) * (1 - 0.5 * smooth(range(T, 6.8, 7.3))) : 0), face: rFace, who: 'rafael', look: rLook, lookAmt: 0.75, ik: rIk });
    // --- Cláudia: mexe nos papéis; responde com humor; vira para o prefeito
    const cPos = [-2.25, -0.62];
    const shuffle = Math.sin(T * 2.2) * 0.5 + 0.5;
    const cTalk = T > 7.2 && T < 10.0;
    let cPose = add(idle(c.claudia, T), { spineX: 0.18 * (1 - smooth(range(T, 6.6, 7.1))), headX: 0.2 * (1 - smooth(range(T, 6.6, 7.1))) });
    const cIk = [];
    if (T < 6.8) { cIk.push(['r', V3(-1.95 + shuffle * 0.08, 0.82 + shuffle * 0.05, -0.15)], ['l', V3(-2.55, 0.8, -0.05 + shuffle * 0.05)]); }
    if (cTalk) cPose = add(cPose, mix(mix({}, P.openBoth, smooth(range(T, 7.3, 7.7))), P.hipR, smooth(range(T, 8.8, 9.3))));
    if (T > 9.95) cPose = add(cPose, P.handsFront);
    const cLook = T < 6.6 ? V3(-2.4, 0.8, 0.0) : T < 7.2 ? eyesOf(c.rafael) : T < 9.6 ? V3(-1.2, 1.45, 2.3) : eyesOf(c.prefeito);
    act(c.claudia, T, { pose: cPose, pos: cPos, yaw: T > 9.6 ? -0.7 * smooth(range(T, 9.6, 10.2)) : 0.1, face: cTalk ? { smile: 0.5, browUp: 0.35, browIn: -0.2 } : T > 9.6 ? F.neutral : F.focus, who: 'claudia', look: cLook, ik: cIk });
    // --- Paulo: olha a quantidade de caixas; acompanha a conversa
    const scan = Math.sin((T - 3.2) * 1.1);
    const pLook = T < 4.1 ? V3(0.25 + scan * 0.6, 0.6 + Math.abs(scan) * 0.3, -2.1) : T < 4.5 ? pileTop() : T < 7.2 ? eyesOf(c.rafael) : T < 9.8 ? eyesOf(c.claudia) : eyesOf(c.prefeito);
    act(c.paulo, T, { pose: add(idle(c.paulo, T), P.holdFolder, { headX: 0.08 }), pos: [0.25, 1.85], yaw: T < 4.1 ? Math.PI - 0.15 : T < 9.8 ? -2.2 : -1.5, face: T < 4.6 ? F.worried : { smile: 0.4, browUp: 0.2 }, look: pLook, lookAmt: 0.8 });
    // --- Juliana: procurando no arquivo de aço (fundo)
    drawer.position.z = 0.31 + 0.32 * smooth(range(T, 3.0, 3.6));
    drawer.updateWorldMatrix(true, true);
    const flip = Math.sin(T * 3.1) * 0.5 + 0.5;
    const jIk = T < 9.8 ? [['r', drawer.localToWorld(V3(0.05, 0.1, -0.1 - flip * 0.25))], ['l', drawer.localToWorld(V3(-0.12, 0.06, -0.2))]] : [];
    act(c.juliana, T, { pose: add(idle(c.juliana, T), { spineX: 0.3, headX: 0.25 }), pos: [5.0, 0.98], yaw: Math.PI / 2, face: F.focus, look: T < 9.9 ? drawer.localToWorld(V3(0, 0.0, -0.2)) : eyesOf(c.prefeito), ik: jIk });
    // --- Fátima: sentada conferindo papéis (fundo)
    act(c.fatima, T, { pose: add(P.sit, P.typing, idle(c.fatima, T, 0.4)), pos: [3.4, -3.08, 0], yaw: 0, face: T > 5 && T < 7.5 ? F.smile : F.focus, look: T > 5 && T < 7.5 ? eyesOf(c.rafael) : V3(3.4, 1.0, -2.3) });
    // --- Marcos: atravessa a sala com uma caixa
    const w = walkPath(T, 3.0, 9.4, [[-5.2, 3.7], [0.0, 3.5], [4.6, 2.9]]);
    act(c.marcos, T, { pose: add(w.pose, P.holdBox, { lShX: 0, rShX: 0 }), pos: [w.x, w.z], yaw: w.yaw, face: F.focus, ik: carry.ik(c.marcos, box) });
    // --- Prefeito: entra pela porta da recepção e fala com a equipe
    const wp = walkPath(T, 8.2, 10.25, [[-7.2, -1.4], [-5.4, -1.3], [-4.1, 0.5]]);
    const atStop = T >= 10.25;
    const pyaw = atStop ? lerp(wp.yaw, 1.2, smooth(range(T, 10.2, 10.7))) : wp.yaw;
    let pPose = add(wp.pose, idle(c.prefeito, T, atStop ? 1 : 0.3));
    if (atStop) pPose = add(pPose, mix(mix({}, P.openBoth, smooth(range(T, 10.3, 10.8)) * (1 - smooth(range(T, 11.5, 11.9)))), P.chinR, smooth(range(T, 12.2, 12.8))), { spineX: 0.03 });
    const prefLook = T < 10.4 ? eyesOf(c.claudia) : T < 11.6 ? V3(0.5, 1.2, 0.8) : T < 12.4 ? eyesOf(c.rafael) : V3(-0.6, 1.5, 3.0);
    act(c.prefeito, T, { pose: pPose, pos: [wp.x, wp.z], yaw: pyaw, face: atStop ? { smile: 0.05, browIn: 0.25, browUp: 0.15 } : F.neutral, who: 'prefeito', look: prefLook, lookAmt: 0.7 });
    // --- Seu José: aguardando atendimento na recepção
    act(c.jose, T, { pose: add(P.sitBench, idle(c.jose, T, 0.5), { lShX: -0.45, rShX: -0.4, lEl: -1.2, rEl: -1.25, lShY: -0.3, rShY: -0.3 }), pos: [-9.75, -1.2, 0], yaw: Math.PI / 2, face: F.neutral, look: T < 8 ? V3(-10.4, 2.4, -2.4) : V3(-6, 1.5, -1.4) });
    const s = shots(camera, T, SH);
    return { focus: focusOn(camera, c[s.focus]), aperture: 0.9, warm: 0.45, vignette: 0.24 };
  } };
}
