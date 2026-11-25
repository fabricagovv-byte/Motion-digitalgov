// CENA 2 (6,6–21 s) — Duas cidades, lado a lado: a de terra seca (obra parada, rua com buraco, caixa desconhecido)
// e a de terra molhada (chuva, tudo brota, cada real e cada rua sob controle).
import * as THREE from 'three';
import { range, smooth, easeOutCubic, easeOutBack, easeInOutCubic, lerp, clamp } from './ease.js';
import { buildCity, lights, background, cloud, POI, bc } from './city.js';
import { shots, toScreen } from './cam.js';

const DX = 8.6;
export function create(env, TL) {
  const Q = TL.cues.c2;
  const scene = new THREE.Scene(); scene.environment = env.envMap; scene.environmentIntensity = 0.45;
  scene.background = background('#7f9fbe', '#cfd6da', '#cbbfa8'); scene.fog = new THREE.Fog(0xcdd2d2, 30, 70);
  const dry = buildCity({ seed: 3 }), wet = buildCity({ seed: 3 });
  dry.root.position.x = -DX; wet.root.position.x = DX; scene.add(dry.root, wet.root);
  const L = lights(scene, { sun: 0xfff0d8, sunI: 2.8, hemiSky: 0xe4eef8, hemiGround: 0x8a7458, hemiI: 1.0, pos: [6, 16, 9], extent: 19 });
  Object.assign(dry.state, { base: 0, dust: 1, lights: 0, life: 0, crane: 0 });
  Object.assign(wet.state, { base: 1, dust: 0, lights: 0, life: 1, grow: 0.55, rainTop: 4.6 });
  // nuvem de chuva sobre a cidade molhada; sol forte sobre a seca
  const cl = cloud(7); cl.position.set(DX + 0.5, 5.4, 0.5); cl.scale.setScalar(1.25); scene.add(cl);
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.4, 1.3), toneMapped: false, transparent: true, fog: false }));
  sunDisc.position.set(-DX - 1, 7.5, -6); scene.add(sunDisc);
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 160);
  const WIDE = [{ t0: 0, t1: 2.6, a: { p: [0, 13.5, 34.5], l: [0, 3.6, 0], fov: 35 }, b: { p: [0, 12.5, 32.0], l: [0, 3.4, 0], fov: 35 } }];
  const SH = [
    ...WIDE,
    // terra seca: a obra parou
    { t0: 2.6, t1: 4.9, a: { p: [-1.6, 3.4, 8.4], l: [-DX + 4.6, 1.0, 1.6], fov: 34 }, b: { p: [-2.0, 2.9, 7.6], l: [-DX + 4.8, 1.0, 1.8], fov: 34 } },
    // ...a rua tem buraco
    { t0: 4.9, t1: 7.7, a: { p: [-DX - 0.2, 1.25, 5.6], l: [-DX - 1.2, 0.0, 2.4], fov: 32 }, b: { p: [-DX - 1.6, 1.15, 5.4], l: [-DX - 2.6, 0.0, 2.2], fov: 32 } },
    // terra molhada: chuva
    { t0: 7.7, t1: 10.4, a: { p: [DX + 1.2, 7.2, 15.5], l: [DX, 1.0, 0], fov: 35 }, b: { p: [DX + 0.6, 6.4, 13.6], l: [DX, 0.8, 0], fov: 35 } },
    // tudo brota
    { t0: 10.4, t1: 12.6, a: { p: [DX + 6.6, 2.4, 8.2], l: [DX + 2.4, 0.4, 2.4], fov: 33 }, b: { p: [DX + 6.0, 2.1, 7.4], l: [DX + 2.2, 0.4, 2.4], fov: 33 } },
    // as duas, de novo
    { t0: 12.6, t1: 14.8, a: { p: [0, 11.5, 30.5], l: [0, 3.4, 0], fov: 35 }, b: { p: [0, 12.5, 33.0], l: [0, 3.6, 0], fov: 35 } },
  ];
  let shotIdx = 0;
  function update(t, T) {
    // chuva cai e passa; árvores brotam; carros e ruas em ordem
    wet.state.rain = smooth(range(T, 13.9, 14.6)) * (1 - smooth(range(T, Q.brota - 0.2, Q.brota + 0.8)));
    const gp = range(T, Q.brota - 0.1, Q.brota + 0.9); wet.state.grow = lerp(0.55, 1, easeOutBack(gp));
    cl.position.x = DX + 0.5 + smooth(range(T, Q.brota, Q.brota + 3)) * 9; cl.userData.mat.color.setRGB(lerp(0.78, 1, smooth(range(T, Q.brota - 0.5, Q.brota + 1))), lerp(0.8, 1, smooth(range(T, Q.brota - 0.5, Q.brota + 1))), lerp(0.84, 1, smooth(range(T, Q.brota - 0.5, Q.brota + 1))));
    dry.update(T); wet.update(T);
    const s = shots(camera, t, SH); shotIdx = SH.indexOf(s);
  }
  // ---- rótulos
  const $ = env.$; const ld = $('#lab-dry'), lw = $('#lab-wet');
  const tagsD = [...ld.querySelectorAll('.tags span')], tagsW = [...lw.querySelectorAll('.tags span')];
  const tD = [Q.obra, Q.buraco, Q.ninguem], tW = [Q.brota, Q.real, Q.rua];
  function place(el, wide, wx, fixed) {
    if (wide) { const [x, y] = toScreen(camera, wx, 2.6, -1.5); el.style.left = `${clamp(x, 330, 1590)}px`; el.style.top = `${clamp(y, 170, 900)}px`; }
    else { el.style.left = `${fixed[0]}px`; el.style.top = `${fixed[1]}px`; }
  }
  function ui(T, active) {
    if (!active || T < 6.6 || T > 21.3) { ld.style.opacity = lw.style.opacity = 0; return; }
    const t = T - 6.6; const wide = shotIdx === 0 || shotIdx === 5;
    const dryVis = (T < 14.2 ? smooth(range(T, Q.seca - 0.5, Q.seca)) : 0) + (T > 19.3 ? smooth(range(T, 19.3, 19.8)) : 0);
    const wetVis = T > 14.2 ? smooth(range(T, Q.molhada - 0.5, Q.molhada)) : 0;
    const fade = 1 - smooth(range(T, 20.6, 21.1));
    place(ld, wide, -DX, [960, 230]); place(lw, wide, DX, [960, 230]);
    ld.style.opacity = clamp(dryVis) * fade; lw.style.opacity = (wide || T < 19.2 ? wetVis : 0) * fade;
    const pop = (el, k) => { el.querySelector('.t').style.transform = `scale(${lerp(0.7, 1, easeOutBack(k))})`; };
    pop(ld, range(T, Q.seca - 0.5, Q.seca)); pop(lw, range(T, Q.molhada - 0.5, Q.molhada));
    tagsD.forEach((e, i) => { const p = T > 19.3 ? 1 : easeOutCubic(range(T, tD[i], tD[i] + 0.35)); e.style.opacity = p; e.style.transform = `translateY(${(1 - p) * 14}px)`; e.style.background = i === 2 ? 'rgba(160,52,36,.85)' : ''; });
    tagsW.forEach((e, i) => { const p = easeOutCubic(range(T, tW[i], tW[i] + 0.35)); e.style.opacity = p; e.style.transform = `translateY(${(1 - p) * 14}px)`; });
  }
  return { scene, camera, update, ui };
}
