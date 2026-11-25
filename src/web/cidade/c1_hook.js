// CENA 1 (0–6,6 s) — Gancho: "Faltam 30 dias para o governador chegar." Folha de calendário bate na tela sobre a cidade em terra seca.
import * as THREE from 'three';
import { range, smooth, easeOutCubic, easeOutBack, easeInOutCubic, easeOutExpo, lerp, clamp } from './ease.js';
import { buildCity, lights, background } from './city.js';
import { shots, shadeLayer } from './cam.js';

export function create(env) {
  const scene = new THREE.Scene(); scene.environment = env.envMap; scene.environmentIntensity = 0.35;
  scene.background = background('#4a2a14', '#b06e36', '#e2a463'); scene.fog = new THREE.Fog(0xcf9256, 22, 48);
  const city = buildCity(); scene.add(city.root);
  lights(scene, { sun: 0xffc27a, sunI: 3.4, hemiSky: 0xffd9a8, hemiGround: 0x6b4a2a, hemiI: 0.8, pos: [-12, 7, 5], extent: 10 });
  Object.assign(city.state, { base: 0, dust: 1, lights: 0, life: 0, crane: 0 });
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 120);
  function update(t, T) {
    city.update(T);
    shots(camera, t, [
      { t0: 0, t1: 3.3, a: { p: [-6.9, 0.34, 4.05], l: [0.2, 0.5, 1.6], fov: 30 }, b: { p: [-7.6, 2.0, 6.4], l: [0.2, 0.4, 1.0], fov: 32 }, ease: (x) => x },
      { t0: 3.3, t1: 7.0, a: { p: [3.0, 6.5, 13.0], l: [0, 0.2, 0.5], fov: 34 }, b: { p: [5.0, 10.5, 15.0], l: [0, 0, 0], fov: 34 }, ease: (x) => x },
    ], 1);
    if (t < 0.45) { const a = (1 - t / 0.45) * 0.012; camera.rotateX(Math.sin(t * 90) * a); camera.rotateY(Math.cos(t * 77) * a); }
  }
  // ---- interface do gancho
  const $ = env.$; const hook = $('#hook'), leaf = $('#leaf'), words = [...document.querySelectorAll('#hook-line span')], line = $('#hook-line'), q1 = $('#hook-q .l1'), q2 = $('#hook-q .l2');
  const shade = shadeLayer('radial-gradient(ellipse 75% 70% at 45% 50%, rgba(10,6,2,.55), rgba(10,6,2,.15))', hook);
  const wt = [1.47, 1.65, 1.75, 2.15];
  function ui(T) {
    hook.style.opacity = T < 6.9 ? 1 : 0; if (T >= 6.9) return;
    // folha do calendário
    const s = easeOutCubic(range(T, 0, 0.28)); const fly = easeInOutCubic(range(T, 3.0, 3.85));
    leaf.style.opacity = (0.4 + 0.6 * s) * (1 - smooth(range(T, 3.8, 4.0)));
    leaf.style.filter = `blur(${(1 - s) * 10}px)`;
    leaf.style.transform = `translate(${-372 * fly}px, ${-415 * fly}px) scale(${lerp(1.55, 1, s) * lerp(1, 0.284, fly)}) rotate(${lerp(-6, -2.5, s) * (1 - fly)}deg)`;
    // linha "para o governador chegar."
    words.forEach((w, i) => { const p = easeOutCubic(range(T, wt[i] - 0.05, wt[i] + 0.3)); w.style.opacity = p; w.style.transform = `translateY(${(1 - p) * 40}px)`; });
    line.style.opacity = 1 - smooth(range(T, 2.95, 3.3));
    // pergunta
    const a = easeOutCubic(range(T, 3.3, 3.75)), b = easeOutBack(range(T, 3.85, 4.35));
    q1.style.opacity = a; q1.style.transform = `translateY(${(1 - a) * 30}px)`;
    q2.style.opacity = clamp(b * 1.5); q2.style.transform = `scale(${lerp(0.6, 1, b)})`;
    const out = smooth(range(T, 6.15, 6.75)); $('#hook-q').style.opacity = 1 - out;
    shade.style.opacity = T < 6.9 ? 1 - out : 0;
  }
  return { scene, camera, update, ui };
}
