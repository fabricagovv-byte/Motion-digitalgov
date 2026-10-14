// CENA 2 (8–20 s) — Caixas chegam; preparação (retirada de grampos, separação, lotes); scanner de produção; imagem na tela.
import * as THREE from 'three';
import { range } from '../core.js';
import { buildRoom } from './room.js';
import { shots, animateRoom } from './anim.js';

export function create(env) {
  const R = buildRoom(env); const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.03, 60);
  function update(t, T) {
    animateRoom(R, T, { cart: range(t, -0.4, 3.4), pages: Math.min(15, 2 + Math.max(0, t - 6.0) * 1.6) });
    shots(camera, t, [
      // carrinho com caixas chegando ao setor
      { t0: 0, t1: 3.6, a: { p: [-0.7, 1.05, 1.35], l: [2.6, 0.65, 0.3], fov: 36 }, b: { p: [-0.9, 1.1, 1.3], l: [0.6, 0.6, -0.1], fov: 36 } },
      // preparação: folhas retiradas da pilha e organizadas em lotes
      { t0: 3.6, t1: 6.6, a: { p: [-1.05, 1.4, -2.45], l: [-2.15, 0.95, -0.35], fov: 38 }, b: { p: [-1.25, 1.36, -2.3], l: [-2.2, 0.95, -0.35], fov: 38 } },
      // scanner de produção digitalizando
      { t0: 6.6, t1: 9.6, a: { p: [-0.45, 1.3, -0.35], l: [0.85, 0.85, -1.2], fov: 34 }, b: { p: [-0.2, 1.22, -0.5], l: [0.85, 0.85, -1.2], fov: 34 } },
      // documento físico convertido em arquivo digital na tela
      { t0: 9.6, t1: 12.4, a: { p: [1.25, 1.15, -0.55], l: [1.62, 1.1, -1.38], fov: 30 }, b: { p: [1.4, 1.13, -0.78], l: [1.63, 1.1, -1.38], fov: 30 } },
    ]);
  }
  return { scene: R.scene, camera, update };
}
