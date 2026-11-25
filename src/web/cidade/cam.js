// Câmera por planos (corte seco entre planos, movimento suave dentro do plano) + utilidades de projeção para rótulos.
import * as THREE from 'three';
import { lerp, range, easeInOutSine } from '../core.js';

const _p = new THREE.Vector3(), _l = new THREE.Vector3(), _b = new THREE.Vector3();
export function shots(camera, t, list, shake = 1) {
  let s = list[0]; for (const x of list) if (t >= x.t0) s = x;
  const k = (s.ease || easeInOutSine)(range(t, s.t0, s.t1));
  _p.set(...s.a.p).lerp(_b.set(...s.b.p), k); _l.set(...s.a.l).lerp(_b.set(...s.b.l), k);
  camera.position.copy(_p); camera.lookAt(_l);
  const fov = lerp(s.a.fov || 35, s.b.fov || s.a.fov || 35, k); if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  camera.rotateZ(Math.sin(t * 0.9) * 0.0015 * shake); camera.rotateX(Math.sin(t * 0.63 + 1) * 0.0012 * shake); camera.rotateY(Math.sin(t * 0.47) * 0.0012 * shake);
  return s;
}
const _v = new THREE.Vector3();
export function toScreen(camera, x, y, z, W = 1920, H = 1080) {
  camera.updateMatrixWorld(); _v.set(x, y, z).project(camera);
  return [(_v.x * 0.5 + 0.5) * W, (-_v.y * 0.5 + 0.5) * H, _v.z < 1];
}
// Camada de escurecimento própria de cada cena (para dar contraste aos textos).
export function shadeLayer(background, before = null) {
  const d = document.createElement('div'); d.style.cssText = `position:absolute;inset:0;opacity:0;background:${background}`;
  const ov = document.getElementById('overlay'); ov.insertBefore(d, ov.firstChild); return d;  // sempre abaixo de todos os textos
}
