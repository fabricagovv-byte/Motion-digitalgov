// CENA 3 (21–32 s) — O caixa: quanto tem, quanto entra, quanto gasta, quantos habitantes e o gasto por habitante.
import * as THREE from 'three';
import { range, smooth, easeOutCubic, easeOutExpo, easeInOutCubic, lerp, fmt } from './ease.js';
import { buildCity, lights, background, POI } from './city.js';
import { shots, shadeLayer } from './cam.js';

const AREA_COL = ['#1f6fd1', '#2fb37a', '#f2a93b', '#8a63d2', '#f2d14e', '#9aa7b8'];
export function create(env, TL) {
  const Q = TL.cues.c3, D = TL.caixa;
  const scene = new THREE.Scene(); scene.environment = env.envMap; scene.environmentIntensity = 0.45;
  scene.background = background('#6f96bd', '#c9d6df', '#c3b9a4'); scene.fog = new THREE.Fog(0xc9d3d9, 16, 40);
  const city = buildCity(); scene.add(city.root);
  lights(scene, { sun: 0xfff1dc, sunI: 2.8, hemiSky: 0xe4eef8, hemiGround: 0x7d6a50, hemiI: 1.0, pos: [7, 13, 9], extent: 10 });
  Object.assign(city.state, { base: 1, dust: 0, lights: 0, life: 1, grow: 1 });
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 120);
  const H = POI.hall;
  function update(t, T) {
    city.update(T);
    // órbita lenta na prefeitura (que fica no terço esquerdo do quadro)
    const a = lerp(-0.15, 0.32, t / 11), r = lerp(5.4, 4.8, t / 11);
    const p = [H[0] + Math.sin(a) * r, 2.3, H[2] + Math.cos(a) * r];
    const right = [Math.cos(a), 0, -Math.sin(a)];
    const l = [H[0] + right[0] * 1.9, 0.55, H[2] + right[2] * 1.9];
    shots(camera, t, [{ t0: 0, t1: 11, a: { p, l, fov: 36 }, b: { p, l, fov: 36 } }]);
  }
  // ---- painel
  const $ = env.$; const dash = $('#dash');
  const shade = shadeLayer('linear-gradient(90deg, rgba(8,18,34,0) 25%, rgba(8,18,34,.55) 55%, rgba(8,18,34,.72) 100%)', dash);
  const cards = { saldo: $('#d-saldo'), entrou: $('#d-entrou'), gastou: $('#d-gastou'), areas: $('#d-areas'), hab: $('#d-hab'), per: $('#d-per') };
  const total = D.areas.reduce((s, x) => s + x[1], 0);
  const bar = cards.areas.querySelector('.bar'), leg = cards.areas.querySelector('.legend');
  D.areas.forEach(([n, v], i) => {
    const seg = document.createElement('i'); seg.style.background = AREA_COL[i]; seg.style.flex = `${v} 0 0`; bar.appendChild(seg);
    const s = document.createElement('span'); s.innerHTML = `<i style="background:${AREA_COL[i]}"></i>${n} <b>${Math.round((v / total) * 100)}%</b>`; leg.appendChild(s);
  });
  const segs = [...bar.children], legs = [...leg.children];
  const ppl = cards.hab.querySelector('.people'); for (let k = 0; k < 18; k++) ppl.appendChild(document.createElement('i')); const pp = [...ppl.children];
  // saldo dos últimos 12 meses (ilustrativo)
  const serie = [12.1, 12.8, 12.2, 13.6, 14.1, 13.7, 14.9, 15.6, 15.2, 16.8, 17.5, 18.4];
  const X = (i) => 10 + (i / 11) * 380, Y = (v) => 82 - ((v - 11.5) / 7.2) * 72;
  const dLine = serie.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const spL = cards.saldo.querySelector('.line'), spA = cards.saldo.querySelector('.area');
  spL.setAttribute('d', dLine); spA.setAttribute('d', `${dLine} L390,90 L10,90 Z`); const len = 420; spL.style.strokeDasharray = len;
  const reveal = (el, t0, T) => { const p = easeOutCubic(range(T, t0, t0 + 0.55)); el.style.opacity = p; el.style.transform = `translateY(${(1 - p) * 26}px)`; return p; };
  const num = (el, v) => { el.querySelector('b').textContent = v; };
  function ui(T, active) {
    if (T < 20.8 || T > 32.5) { dash.style.opacity = 0; shade.style.opacity = 0; return; }
    const inn = easeOutCubic(range(T, 21.1, 21.8)), out = smooth(range(T, 31.6, 32.2));
    dash.style.opacity = inn * (1 - out); dash.style.transform = `translateX(${(1 - inn) * 80 - out * 40}px)`;
    shade.style.opacity = smooth(range(T, 20.9, 21.6)) * (1 - out);
    reveal(cards.saldo, Q.caixa, T);
    num(cards.saldo.querySelector('.val'), fmt(D.saldo * easeOutExpo(range(T, Q.tem - 0.1, Q.tem + 1.1))));
    const sp = easeInOutCubic(range(T, Q.tem, Q.tem + 1.3)); spL.style.strokeDashoffset = len * (1 - sp); spA.style.opacity = sp;
    reveal(cards.entrou, Q.entra - 0.15, T); num(cards.entrou, fmt(D.entrou * easeOutExpo(range(T, Q.entra, Q.entra + 0.9))));
    reveal(cards.gastou, Q.gasta - 0.15, T); num(cards.gastou, fmt(D.gastou * easeOutExpo(range(T, Q.gasta, Q.gasta + 0.9))));
    reveal(cards.areas, Q.gasta + 0.25, T);
    segs.forEach((s, i) => { const p = easeOutCubic(range(T, Q.gasta + 0.5 + i * 0.12, Q.gasta + 1.0 + i * 0.12)); s.style.transform = `scaleX(${p})`; });
    legs.forEach((s, i) => { s.style.opacity = easeOutCubic(range(T, Q.gasta + 0.7 + i * 0.12, Q.gasta + 1.1 + i * 0.12)); });
    reveal(cards.hab, Q.habitantes - 0.15, T);
    num(cards.hab, Math.round(D.habitantes * easeOutExpo(range(T, Q.habitantes, Q.habitantes + 1.4))).toLocaleString('pt-BR'));
    pp.forEach((e, i) => { const p = easeOutCubic(range(T, Q.habitantes + 0.2 + i * 0.05, Q.habitantes + 0.5 + i * 0.05)); e.style.opacity = p; e.style.transform = `translateY(${(1 - p) * 8}px)`; });
    reveal(cards.per, Q.decisao - 0.15, T); num(cards.per, Math.round(D.porHabitante * easeOutExpo(range(T, Q.decisao, Q.decisao + 1.0))));
    const glow = Math.max(0, 1 - Math.abs(T - Q.decisao - 1.2) / 0.6);
    cards.per.style.boxShadow = `0 20px 60px rgba(6,20,40,.28), 0 0 0 ${4 * glow}px rgba(31,111,209,${0.8 * glow})`;
  }
  return { scene, camera, update, ui };
}
