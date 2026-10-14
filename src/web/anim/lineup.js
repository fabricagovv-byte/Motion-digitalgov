// Cena de teste: elenco completo lado a lado (prévia de aparência).
import * as THREE from 'three';
import { make, CAST } from './cast.js';
import { act, P, F, V3 } from './act.js';
export async function create(env) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xd9dee6); scene.environment = env.envMap; scene.environmentIntensity = 0.5;
  const sun = new THREE.DirectionalLight(0xfff1e0, 2.6); sun.position.set(3, 6, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 4, bottom: -1 }); sun.shadow.bias = -0.0004; scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x8a7a68, 0.9));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshStandardMaterial({ color: 0xc8c2b8, roughness: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const keys = new URLSearchParams(location.search).get('cast')?.split(',') || Object.keys(CAST);
  const cs = keys.map((k, i) => { const c = make(k); c.root.position.set((i - (keys.length - 1) / 2) * 0.75, 0, 0); scene.add(c.root); return c; });
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 100);
  const q = new URLSearchParams(location.search); const close = q.get('close');
  return { scene, camera, update(t) {
    const fx = [F.neutral, F.smile, F.surprised, F.worried, F.bigSmile, F.think];
    cs.forEach((c, i) => act(c, t, { pose: [P.stand, P.openR, P.hipL, P.shrug, P.presentR, P.chinR][i % 6], face: { ...fx[i % 6], open: q.get('open') ? +q.get('open') : 0 }, look: V3(0, 1.5, 6) }));
    if (close != null) { const c = cs[+close]; const p = c.root.position; camera.position.set(p.x, 1.62 * c.S.scale, 1.1); camera.lookAt(p.x, 1.55 * c.S.scale, 0); }
    else if (q.get("mid")) { const x = +q.get("mid"); camera.position.set(x, 1.2, 4.2); camera.lookAt(x, 1.0, 0); } else { camera.position.set(0, 1.25, 14.5); camera.lookAt(0, 0.95, 0); }
    return { focus: 10, aperture: 0 };
  } };
}
