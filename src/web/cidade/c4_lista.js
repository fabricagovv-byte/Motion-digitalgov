// CENA 4 (32–45 s) — A lista para apurar a cidade: cada item marcado molha a terra a partir daquele ponto,
// até a cidade inteira florescer ("Está tudo ali").
import * as THREE from 'three';
import { range, smooth, easeOutCubic, easeOutBack, easeInOutCubic, lerp, clamp } from './ease.js';
import { buildCity, lights, background, POI } from './city.js';
import { shots, toScreen, shadeLayer } from './cam.js';

export function create(env, TL) {
  const Q = TL.cues.c4, LIST = TL.lista;
  const scene = new THREE.Scene(); scene.environment = env.envMap; scene.environmentIntensity = 0.45;
  scene.background = background('#5f86ad', '#c4ced4', '#c2b49a'); scene.fog = new THREE.Fog(0xc4cbcc, 26, 60);
  const city = buildCity(); scene.add(city.root);
  lights(scene, { sun: 0xfff0da, sunI: 2.8, hemiSky: 0xe0ecf7, hemiGround: 0x7d6a50, hemiI: 1.0, pos: [7, 14, 8], extent: 10 });
  Object.assign(city.state, { base: 0, dust: 0.7, lights: 0, life: 0, grow: 1 });
  const R = { road: 6.5, lights: 3.2, tower: 3.4, school: 3.0, ubs: 3.0, trash: 3.0, works: 3.2 };
  city.state.spots = LIST.map(([, , k], i) => ({ x: POI[k][0], z: POI[k][2], r: R[k] || 3, k: 0, t: Q.items[i] }));
  // anéis de pulso no chão
  const rings = LIST.map(([, , k]) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 64), new THREE.MeshBasicMaterial({ color: 0x7dffb6, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(POI[k][0], 0.05, POI[k][2]); scene.add(m); return m; });
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 120);
  const C = [0, 0, 0];
  function update(t, T) {
    city.state.spots.forEach((s) => { s.k = easeOutCubic(range(T, s.t, s.t + 2.4)); });
    city.state.lights = smooth(range(T, Q.items[1], Q.items[1] + 0.8));
    city.state.base = lerp(0, 0.55, smooth(range(T, Q.item, Q.bairro + 0.8))) + 0.45 * smooth(range(T, Q.tudo, Q.tudo + 1.0));
    city.state.life = smooth(range(T, Q.items[0] + 0.5, Q.tudo + 1));
    city.state.dust = 0.7 * (1 - smooth(range(T, Q.items[0], Q.tudo)));
    rings.forEach((m, i) => { const p = range(T, Q.items[i], Q.items[i] + 1.4); m.scale.setScalar(0.2 + easeOutCubic(p) * (R[LIST[i][2]] || 3) * 0.8); m.material.opacity = p > 0 && p < 1 ? 0.9 * (1 - p) : 0; });
    city.update(T);
    // vista 3/4 da cidade inteira, deslocada para a direita (a lista ocupa a esquerda)
    const a = lerp(0.62, 0.38, t / 13), r = lerp(19.5, 17.5, t / 13), h = lerp(13.5, 12.2, t / 13);
    const p = [C[0] + Math.sin(a) * r, h, C[2] + Math.cos(a) * r];
    const right = [Math.cos(a), 0, -Math.sin(a)];
    const l = [C[0] - right[0] * 4.3, -0.8, C[2] - right[2] * 4.3];
    shots(camera, t, [{ t0: 0, t1: 13, a: { p, l, fov: 35 }, b: { p, l, fov: 35 } }]);
  }
  // ---- interface: lista + marcadores
  const $ = env.$; const list = $('#list'); const itemsEl = list.querySelector('.items');
  const shade = shadeLayer('linear-gradient(90deg, rgba(8,18,34,.72) 0%, rgba(8,18,34,.45) 35%, rgba(8,18,34,0) 55%)', list);
  const rows = LIST.map(([n, st]) => { const d = document.createElement('div'); d.className = 'it'; d.innerHTML = `<div class="hl"></div><div class="ck"></div><div class="nm">${n}</div><div class="st">${st}</div>`; itemsEl.appendChild(d); return d; });
  const SHORT = { road: 'Ruas', lights: 'Iluminação', tower: 'Água', school: 'Escolas', ubs: 'Saúde', trash: 'Coleta', works: 'Obras' };
  const pins = LIST.map(([, , k]) => { const d = document.createElement('div'); d.className = 'pin'; d.innerHTML = `<div class="b"><i></i>${SHORT[k]}</div><div class="stem"></div>`; $('#pins').appendChild(d); return d; });
  const footB = list.querySelector('.foot b'), prog = list.querySelector('.prog i'), stamp = list.querySelector('.stamp');
  function ui(T, active) {
    if (T < 31.7 || T > 45.4) { list.style.opacity = 0; shade.style.opacity = 0; pins.forEach((p) => (p.style.opacity = 0)); return; }
    const inn = easeOutCubic(range(T, 32.1, 32.8)), out = smooth(range(T, 44.4, 45.0));
    list.style.opacity = inn * (1 - out); list.style.transform = `translateX(${(inn - 1) * 80}px)`; shade.style.opacity = smooth(range(T, 31.8, 32.5)) * (1 - out);
    rows.forEach((r, i) => {
      const ti = Q.items[i]; const c = easeOutBack(range(T, ti, ti + 0.35)); r.classList.toggle('on', T >= ti);
      r.querySelector('.ck').style.setProperty('--c', c.toFixed(3)); r.querySelector('.ck').style.transform = `scale(${1 + 0.18 * Math.sin(Math.PI * range(T, ti, ti + 0.35))})`;
      const s = easeOutCubic(range(T, ti + 0.1, ti + 0.5)); r.querySelector('.st').style.opacity = s; r.querySelector('.st').style.transform = `translateX(${(1 - s) * 16}px)`;
      r.querySelector('.hl').style.opacity = Math.max(0, 1 - Math.abs(T - ti - 0.3) / 0.6);
    });
    const b = Math.round(12 * easeInOutCubic(range(T, Q.item, Q.bairro + 0.75))); footB.textContent = `${b} de 12`; prog.style.transform = `scaleX(${b / 12})`;
    const sp = easeOutBack(range(T, Q.tudo, Q.tudo + 0.4)); stamp.style.opacity = clamp(sp * 2); stamp.style.transform = `rotate(-8deg) scale(${lerp(1.7, 1, sp)})`;
    pins.forEach((p, i) => {
      const k = LIST[i][2]; const P = POI[k]; const [x, y, ok] = toScreen(camera, P[0], P[1] + 0.25, P[2]);
      const v = easeOutBack(range(T, Q.items[i] + 0.15, Q.items[i] + 0.55)); p.style.opacity = active && ok && x > 860 ? clamp(v * 2) * (1 - out) : 0;
      p.style.left = `${x}px`; p.style.top = `${y}px`; p.style.transform = `translate(-50%, -100%) scale(${lerp(0.4, 1, v)})`;
    });
  }
  return { scene, camera, update, ui };
}
