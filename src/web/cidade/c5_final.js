// CENA 5 (45–60 s) — Dia 30: o comboio do governador chega à prefeitura numa cidade pronta; encerramento com a marca.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { range, smooth, easeOutCubic, easeInOutCubic, easeOutBack, lerp, clamp } from './ease.js';
import { buildCity, lights, background, POI } from './city.js';
import { shots } from './cam.js';

function convoyCar() {
  const g = new THREE.Group(); const body = new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 0.22, metalness: 0.6 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.08, metalness: 0.8 });
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o); };
  add(new RoundedBoxGeometry(0.42, 0.11, 0.19, 2, 0.04), body, 0, 0.085, 0);
  add(new RoundedBoxGeometry(0.26, 0.09, 0.17, 2, 0.035), glass, -0.03, 0.17, 0);
  for (const [x, z] of [[0.13, 0.09], [-0.13, 0.09], [0.13, -0.09], [-0.13, -0.09]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 14), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.04, z); g.add(w); }
  const hl = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.8, 2.2), toneMapped: false });
  for (const z of [-0.06, 0.06]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, 0.035), hl); h.position.set(-0.212, 0.1, z); g.add(h); }
  const fl = new THREE.MeshStandardMaterial({ color: 0x1f5fbf, roughness: 0.7 }); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.09, 6), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
  pole.position.set(-0.19, 0.18, 0.08); g.add(pole); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.03), fl); f.position.set(-0.165, 0.21, 0.08); g.add(f);
  return g;
}

export function create(env, TL) {
  const Q = TL.cues.c5;
  const scene = new THREE.Scene(); scene.environment = env.envMap; scene.environmentIntensity = 0.4;
  scene.background = background('#3e5d8a', '#e9b07c', '#e59d62'); scene.fog = new THREE.Fog(0xe7aa74, 18, 44);
  const city = buildCity(); scene.add(city.root);
  lights(scene, { sun: 0xffc98f, sunI: 3.0, hemiSky: 0xffe2c2, hemiGround: 0x6d5a48, hemiI: 0.9, pos: [-11, 6.5, 7], extent: 10 });
  Object.assign(city.state, { base: 1, dust: 0, lights: 0.85, life: 0.55, grow: 1 });
  const convoy = [0, 1, 2].map(() => { const c = convoyCar(); c.rotation.y = Math.PI; c.scale.setScalar(0.72); scene.add(c); return c; });
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.03, 120);
  const ZL = 1.2;
  function update(t, T) {
    city.update(T);
    const k = easeOutCubic(range(t, 0, 4.4)); const lead = lerp(7.6, 0.15, k);
    convoy.forEach((c, i) => c.position.set(lead + i * 0.44, 0, ZL));
    shots(camera, t, [
      { t0: 0, t1: 3.2, a: { p: [lead + 2.1, 0.42, ZL + 0.62], l: [lead - 1.3, 0.32, ZL - 0.25], fov: 34 }, b: { p: [lead + 2.1, 0.42, ZL + 0.62], l: [lead - 1.3, 0.32, ZL - 0.25], fov: 34 } },
      { t0: 3.2, t1: 7.6, a: { p: [1.8, 0.9, 4.4], l: [0.1, 0.55, 0.4], fov: 34 }, b: { p: [4.2, 5.2, 10.4], l: [0, 0.2, 0], fov: 34 }, ease: easeInOutCubic },
      { t0: 7.6, t1: 15, a: { p: [4.2, 5.2, 10.4], l: [0, 0.2, 0], fov: 34 }, b: { p: [4.6, 5.8, 11.2], l: [0, 0.2, 0], fov: 34 } },
    ]);
  }
  const $ = env.$; const ar = $('#arrive'), k = ar.querySelector('.k'), h = ar.querySelector('.h');
  function ui(T) {
    if (T < 45.5 || T > 52.8) { ar.style.opacity = 0; return; }
    ar.style.opacity = 1 - smooth(range(T, 51.2, 51.8));
    const a = easeOutBack(range(T, Q.dia, Q.dia + 0.45)); k.style.opacity = clamp(a * 2); k.style.transform = `scale(${lerp(0.6, 1, a)})`;
    const b = easeOutCubic(range(T, Q.pronta, Q.pronta + 0.6)); h.style.opacity = b; h.style.transform = `translateY(${(1 - b) * 40}px)`; h.style.filter = `blur(${(1 - b) * 8}px)`;
  }
  return { scene, camera, update, ui };
}
