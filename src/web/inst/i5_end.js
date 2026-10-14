// CENA 5 (46–60 s) — Resultado: arquivo físico organizado, digitalização, documento encontrado em instantes; encerramento com a marca.
import * as THREE from 'three';
import { range, smooth } from '../core.js';
import { buildRoom, SCR } from './room.js';
import { shots, animateRoom } from './anim.js';
import { drawSearch } from './docs.js';

export function create(env, TL) {
  const R = buildRoom(env); const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.03, 60);
  const g2 = R.idxTex2.userData.g;
  function update(t, T) {
    animateRoom(R, T, { screens: false, pages: 12 });
    drawSearch(g2, SCR.W, SCR.H, { query: 'processo 2023/004518', type: range(t, 5.4, 6.3), blink: t, results: range(t, 6.45, 6.9), select: smooth(range(t, 6.9, 7.1)), open: range(t, 7.05, 7.5) }); R.idxTex2.needsUpdate = true;
    shots(camera, t, [
      // arquivo físico organizado (etiquetas legíveis)
      { t0: 0, t1: 2.7, a: { p: [-3.3, 1.35, -2.75], l: [-2.6, 1.1, -3.95], fov: 34 }, b: { p: [-1.9, 1.35, -2.75], l: [-1.2, 1.1, -3.95], fov: 34 } },
      // digitalização em andamento
      { t0: 2.7, t1: 5.2, a: { p: [0.05, 1.3, -0.35], l: [0.8, 0.88, -1.3], fov: 32 }, b: { p: [0.2, 1.25, -0.45], l: [0.8, 0.88, -1.3], fov: 32 } },
      // servidor encontra o documento em poucos instantes
      { t0: 5.2, t1: 8.6, a: { p: [1.47, 1.12, 2.85], l: [1.47, 1.12, 2.2], fov: 32 }, b: { p: [1.47, 1.12, 2.76], l: [1.47, 1.12, 2.2], fov: 32 } },
      { t0: 8.6, t1: 14, a: { p: [4.6, 1.9, 6.0], l: [-0.6, 0.9, -1.0], fov: 36 }, b: { p: [4.2, 1.8, 5.5], l: [-0.6, 0.9, -1.0], fov: 36 } },
    ]);
  }
  return { scene: R.scene, camera, update };
}
