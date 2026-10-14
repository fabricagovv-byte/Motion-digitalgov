// CENA 4 (32–46 s) — GED na prática: pesquisa/visualização, histórico, encaminhamento a outro setor; acesso pelo notebook e celular.
import * as THREE from 'three';
import { range, smooth, clamp, lerp, easeInOutCubic } from '../core.js';
import { buildRoom, SCR } from './room.js';
import { shots, animateRoom } from './anim.js';
import { drawGed, drawMobile } from './docs.js';
import { reach } from './kit.js';

const V = new THREE.Vector3();
function path(t, pts) { // cursor por pontos [t, x, y]
  let i = 0; while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
  const [t0, x0, y0] = pts[i], [t1, x1, y1] = pts[i + 1]; const k = easeInOutCubic(range(t, t0, t1)); return [lerp(x0, x1, k), lerp(y0, y1, k)];
}
export function create(env) {
  const R = buildRoom(env); const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.02, 60);
  const g2 = R.idxTex2.userData.g, gl = R.lapTex.userData.g, gm = R.mobTex.userData.g;
  drawGed(gl, SCR.W, SCR.H, { history: 1, sent: 2.5, dialog: 0, pick: 0, note: 0, press: 0 }); R.lapTex.needsUpdate = true;
  function update(t, T) {
    animateRoom(R, T, { screens: false });
    // ponteiro: aba Histórico (3,0 s) -> Encaminhar (5,3 s) -> diálogo -> Encaminhar (7,6 s)
    const cur = path(t, [[0, 900, 760], [2.6, 1325, 232], [3.4, 1325, 232], [4.9, 1450, 152], [5.6, 1450, 152], [6.3, 1000, 470], [7.1, 1000, 470], [7.6, 1030, 720], [9, 1030, 720]]);
    drawGed(g2, SCR.W, SCR.H, { history: range(t, 3.0, 4.6), dialog: range(t, 5.4, 5.9), pick: range(t, 6.3, 6.9), note: range(t, 6.7, 7.4), press: (t > 7.55 && t < 7.75) || (t > 5.25 && t < 5.45) ? 1 : 0, sent: t > 7.7 ? (t - 7.7) : 0, cursor: cur });
    R.idxTex2.needsUpdate = true;
    drawMobile(gm, 540, 1140, { view: t > 11.6 ? 1 : 0 }); R.mobTex.needsUpdate = true;
    // celular na mão do usuário (perto do peito, inclinado)
    const u = R.mobUser.userData; R.mobUser.updateWorldMatrix(true, true);
    const hp = R.mobUser.localToWorld(V.set(0.02, 1.0, 0.32)); R.phone.position.copy(hp);
    R.phone.rotation.set(-0.75, Math.PI + 0.2, 0, 'YXZ'); R.phone.rotation.set(0, 0, 0); R.phone.lookAt(R.mobUser.localToWorld(new THREE.Vector3(0, 1.62, 0.02)));
    reach(u.armR, R.phone.localToWorld(V.set(0.03, -0.04, -0.01))); reach(u.armL, R.phone.localToWorld(V.set(-0.03, -0.05, -0.01)));
    u.head.rotation.x = 0.45; u.spine.rotation.x = 0.05;
    const PH = R.phone.position;
    shots(camera, t, [
      { t0: 0, t1: 3.0, a: { p: [1.47, 1.12, 2.86], l: [1.47, 1.12, 2.2], fov: 32 }, b: { p: [1.5, 1.12, 2.78], l: [1.5, 1.12, 2.2], fov: 32 } },
      { t0: 3.0, t1: 5.2, a: { p: [1.62, 1.13, 2.8], l: [1.62, 1.12, 2.2], fov: 30 }, b: { p: [1.62, 1.13, 2.74], l: [1.62, 1.12, 2.2], fov: 30 } },
      { t0: 5.2, t1: 9.0, a: { p: [1.5, 1.13, 2.86], l: [1.48, 1.12, 2.2], fov: 32 }, b: { p: [1.48, 1.12, 2.8], l: [1.47, 1.12, 2.2], fov: 32 } },
      // usuário autorizado: notebook junto à janela
      { t0: 9.0, t1: 11.5, a: { p: [-2.55, 1.5, 4.75], l: [-3.68, 0.88, 3.75], fov: 34 }, b: { p: [-2.7, 1.45, 4.6], l: [-3.68, 0.88, 3.75], fov: 34 } },
      // ...e pelo celular (plano fechado sobre o ombro)
      { t0: 11.5, t1: 14.4, a: { p: [PH.x + 0.12, PH.y + 0.3, PH.z + 0.34], l: [PH.x, PH.y, PH.z], fov: 30 }, b: { p: [PH.x + 0.1, PH.y + 0.26, PH.z + 0.29], l: [PH.x, PH.y, PH.z], fov: 30 } },
    ]);
  }
  return { scene: R.scene, camera, update };
}
