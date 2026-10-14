// Cena 1a (0–3,2 s): fachada da prefeitura num dia movimentado; cidadão e servidor chegam.
import * as THREE from 'three';
import { buildExterior, waveFlags } from './sets.js';
import { make } from './cast.js';
import { makeToon } from './toon.js';
import { act, walkPath, P, F, shots, add, idle, V3, carry } from './act.js';

export async function create(env) {
  const scene = new THREE.Scene(); const A = buildExterior(scene, env);
  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.3, 300);
  const jose = make('jose'), marcos = make('marcos');
  const ex1 = makeToon({ name: 'ext1', female: true, skin: 0xb98260, hair: { style: 'long', color: 0x2a1a12 }, top: { type: 'blouse', color: 0xd45a7a }, pants: 0x2f3f5f, scale: 0.94 });
  const ex2 = makeToon({ name: 'ext2a', skin: 0xe6b894, hair: { style: 'short', color: 0x5a4030 }, top: { type: 'shirt', color: 0xf0f0f0 }, pants: 0x2a2f3a, scale: 1.0 });
  const ex3 = makeToon({ name: 'ext3bb', female: true, skin: 0x6e4630, hair: { style: 'curly', color: 0x1a1210 }, top: { type: 'cardigan', color: 0x3a7a9a, inner: 0xf5f0e6 }, pants: 0x4a3a30, scale: 0.92 });
  for (const c of [jose, marcos, ex1, ex2, ex3]) scene.add(c.root);
  const box = carry.box(marcos, { code: 'ADM-118', year: '2012', title: 'Processos' });
  const SH = [{ t0: 0, t1: 3.4, a: { p: [-13, 1.1, 21], l: [-0.5, 4.8, -9], fov: 38 }, b: { p: [-8.5, 2.7, 13.5], l: [0, 3.4, -8], fov: 35 }, hand: 0.6 }];
  return { scene, camera, update(lt, T) {
    waveFlags(A, T);
    const w1 = walkPath(T, -1.0, 4.2, [[-3.6, 0.2], [-2.2, -3.4], [-1.5, -5.6]]);
    act(jose, T, { pose: add(w1.pose, idle(jose, T, 0.3)), pos: [w1.x, w1.z], yaw: w1.yaw, face: F.neutral, look: V3(0, 2, -9) });
    const w2 = walkPath(T, -0.6, 4.6, [[3.9, 1.8], [2.6, -2.0], [1.4, -5.2]]);
    act(marcos, T, { pose: add(w2.pose, P.holdBox, { lShX: 0, rShX: 0 }), pos: [w2.x, w2.z], yaw: w2.yaw, face: F.focus, ik: carry.ik(marcos, box) });
    const w3 = walkPath(T, -2, 6, [[-3.5, -7.0], [-6.5, -1.0], [-8.0, 5]]);
    act(ex1, T, { pose: w3.pose, pos: [w3.x, w3.z], yaw: w3.yaw, face: F.smile });
    const w4 = walkPath(T, -1, 7, [[9.5, 6.5], [4.0, 9.0], [-4, 12.5]]);
    act(ex2, T, { pose: w4.pose, pos: [w4.x, w4.z], yaw: w4.yaw, face: F.smile, look: V3(-3, 1.5, 11) });
    act(ex3, T, { pose: add(P.sitBench, idle(ex3, T, 0.5), { lShX: -0.4, rShX: -0.4, lEl: -1.3, rEl: -1.3 }), pos: [-8.8, 9.2, 0], yaw: 0.2 + Math.PI, face: F.smile, look: V3(-6, 1.5, 6) });
    shots(camera, T, SH);
    return { focus: 24, aperture: 0.0, warm: 0.35, vignette: 0.2, bloom: 0.15 };
  } };
}
