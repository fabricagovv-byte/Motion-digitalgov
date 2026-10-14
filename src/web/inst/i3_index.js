// CENA 3 (20–32 s) — Conferência e indexação (campos de identificação) + busca que encontra o contrato.
import * as THREE from 'three';
import { range, smooth, clamp, easeInOutCubic } from '../core.js';
import { buildRoom, SCR } from './room.js';
import { shots, animateRoom } from './anim.js';
import { drawIndex, drawSearch } from './docs.js';

export function create(env) {
  const R = buildRoom(env); const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.03, 60);
  const g1 = R.idxTex.userData.g, g2 = R.idxTex2.userData.g;
  function update(t, T) {
    animateRoom(R, T, { screens: false });
    // monitor 1: indexação
    const fields = clamp(range(t, 4.4, 8.4) * 5.2, 0, 5);
    const cur = t > 8.2 ? [easeInOutCubic(range(t, 8.0, 8.6)) * 0 + 1370, 1300 - 400 * (1 - easeInOutCubic(range(t, 8.0, 8.6)))] : null;
    drawIndex(g1, SCR.W, SCR.H, { fields: t < 4.4 ? 2.2 : Math.max(0, fields), blink: t, saved: t > 8.75 ? 1 : 0, cursor: null }); R.idxTex.needsUpdate = true;
    // monitor 2: pesquisa
    drawSearch(g2, SCR.W, SCR.H, { type: range(t, 8.7, 9.9), blink: t, results: range(t, 10.05, 10.8), select: smooth(range(t, 10.8, 11.1)), open: range(t, 11.05, 11.6) }); R.idxTex2.needsUpdate = true;
    shots(camera, t, [
      // equipe confere documentos e cadastra informações
      { t0: 0, t1: 4.2, a: { p: [-2.5, 1.45, 3.9], l: [-0.35, 0.98, 2.3], fov: 34 }, b: { p: [-2.1, 1.38, 3.55], l: [-0.35, 0.98, 2.3], fov: 34 } },
      // campos de identificação preenchidos
      { t0: 4.2, t1: 8.5, a: { p: [-0.5, 1.13, 2.95], l: [-0.55, 1.12, 2.2], fov: 33 }, b: { p: [-0.42, 1.12, 2.78], l: [-0.48, 1.12, 2.2], fov: 33 } },
      // busca por um contrato: o documento correto aparece
      { t0: 8.5, t1: 12.4, a: { p: [2.2, 1.4, 3.4], l: [1.45, 1.1, 2.2], fov: 32 }, b: { p: [1.95, 1.25, 2.95], l: [1.45, 1.12, 2.2], fov: 32 } },
    ]);
  }
  return { scene: R.scene, camera, update };
}
