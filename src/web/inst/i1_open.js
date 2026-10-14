// CENA 1 (0–8 s) — Abertura com a logo oficial; revelação da central de tratamento documental em funcionamento.
import * as THREE from 'three';
import { buildRoom } from './room.js';
import { shots, animateRoom } from './anim.js';

export function create(env) {
  const R = buildRoom(env); const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 60);
  function update(t, T) {
    animateRoom(R, T, { cart: 'hidden' });
    shots(camera, t, [
      { t0: 0, t1: 5.6, a: { p: [5.4, 2.15, 6.6], l: [-0.6, 0.85, -0.9], fov: 36 }, b: { p: [4.4, 1.85, 5.6], l: [-0.9, 0.9, -1.0], fov: 36 } },
      { t0: 5.6, t1: 8.4, a: { p: [-1.6, 1.5, 4.9], l: [0.4, 1.0, 2.0], fov: 34 }, b: { p: [-1.1, 1.45, 4.6], l: [0.5, 1.0, 2.0], fov: 34 } },
    ]);
  }
  return { scene: R.scene, camera, update };
}
