// Motor de render do filme "30 dias": window.renderFrame(t) desenha o quadro do instante t (determinístico).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { range, smooth, easeOutCubic, easeOutExpo, easeInOutCubic, lerp } from '../core.js';

const params = new URLSearchParams(location.search);
const DPR = parseFloat(params.get('dpr') || '1');
const W = 1920, H = 1080;
const SCENES = {
  c1_hook: () => import('./c1_hook.js'), c2_duas: () => import('./c2_duas.js'), c3_caixa: () => import('./c3_caixa.js'),
  c4_lista: () => import('./c4_lista.js'), c5_final: () => import('./c5_final.js'),
};

async function init() {
  const TL = await (await fetch('/src/cidade/timeline.json')).json();
  for (const f of ['600 40px "Inter Display"', '700 40px "Inter Display"', '800 40px "Inter Display"', '400 40px "Inter"', '500 40px "Inter"', '600 40px "Inter"', '700 40px "Inter"']) await document.fonts.load(f);
  await new Promise((r) => { const img = document.getElementById('logo'); if (img.complete) r(); else img.onload = r; });

  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const $ = (s) => document.querySelector(s);
  const env = { renderer, envMap: pmrem.fromScene(new RoomEnvironment(), 0.04).texture, W, H, $ };

  const only = params.get('only');
  const list = TL.scenes.filter((s) => !only || only.split(',').includes(s.id));
  const inst = {};
  for (const s of list) inst[s.id] = { ...s, ...(await (await SCENES[s.id]()).create(env, TL)) };

  const rtOpts = { type: THREE.HalfFloatType, samples: DPR >= 2 ? 0 : 4 };
  const rtA = new THREE.WebGLRenderTarget(W * DPR, H * DPR, rtOpts), rtB = new THREE.WebGLRenderTarget(W * DPR, H * DPR, rtOpts);
  const composer = new EffectComposer(renderer); composer.setPixelRatio(DPR); composer.setSize(W, H);
  const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
  const blend = new ShaderPass({ uniforms: { tDiffuse: { value: null }, tA: { value: null }, tB: { value: null }, uP: { value: 0 } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tA, tB; uniform float uP; varying vec2 vUv;
      void main(){ vec4 a = texture2D(tA, vUv); if (uP <= 0.) { gl_FragColor = a; return; } vec4 b = texture2D(tB, vUv); gl_FragColor = mix(a, b, uP); }` });
  blend.uniforms.tA.value = rtA.texture; blend.uniforms.tB.value = rtB.texture; composer.addPass(blend);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.25, 0.45, 1.1));
  const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 }, uVig: { value: 0.22 } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uSeed, uVig; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uSeed)*43758.5453); }
      void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv-.5; d.x *= 1.2; c.rgb *= 1. - uVig*smoothstep(.3,.95,length(d)*1.25);
        c.rgb += (h(vUv*1000.)-.5)*.016; gl_FragColor = c; }` });
  composer.addPass(grade); composer.addPass(new OutputPass());

  // ---------------------------------------------------------------- contador permanente (canto superior esquerdo)
  const badge = $('#badge'), bn = badge.querySelector('.n'), bv = badge.querySelector('.v');
  const C4 = TL.cues.c4;
  const steps = [[0, 30], [21.25, 21], [32.4, 12], ...C4.items.map((t, i) => [t + 0.1, 11 - i]), [C4.tudo + 0.2, 3]];
  function badgeUI(t) {
    const vis = smooth(range(t, 3.75, 4.05)) * (1 - smooth(range(t, 44.6, 45.1)));
    badge.style.opacity = vis; if (vis <= 0) return;
    let k = 0; for (let i = 0; i < steps.length; i++) if (t >= steps[i][0]) k = i;
    const [t0, n] = steps[k]; const p = k > 0 ? easeOutCubic(range(t, t0, t0 + 0.35)) : 1;
    bn.textContent = n; bv.textContent = `${n} DIAS`;
    bn.style.transform = `translateY(${(1 - p) * 70}%)`; bn.style.opacity = 0.2 + 0.8 * p;
    badge.querySelector('.box').style.transform = `scale(${1 + 0.12 * Math.sin(Math.PI * range(t, t0, t0 + 0.35)) * (k > 0)})`;
  }
  // ---------------------------------------------------------------- cartão final da marca
  const EC = TL.endcard; const dom = { card: $('#card'), logo: $('#logo'), rule: $('#card-rule'), services: $('#card-services'), cta: $('#card-cta'), contacts: $('#card-contacts') };
  dom.services.textContent = EC.services; dom.cta.textContent = EC.cta; dom.contacts.textContent = EC.contacts || '';
  function brandCard(t) {
    const endIn = EC.in; const c = dom.card;
    if (t < endIn) { c.style.opacity = 0; return; }
    c.style.opacity = easeInOutCubic(range(t, endIn, endIn + 0.7));
    const p = easeOutCubic(range(t, endIn + 0.3, endIn + 1.4)); dom.logo.style.opacity = p; dom.logo.style.filter = `blur(${(1 - p) * 6}px)`;
    const lift = easeInOutCubic(range(t, endIn + 1.3, endIn + 2.2));
    dom.logo.style.transform = `translateY(${-lift * 90}px) scale(${lerp(0.95, 1, p)})`;
    dom.rule.style.transform = `scaleX(${easeOutExpo(range(t, endIn + 1.9, endIn + 2.8))})`;
    [[dom.services, 2.1], [dom.cta, 2.5], [dom.contacts, 2.9]].forEach(([e, d]) => { const q = easeOutCubic(range(t, endIn + d, endIn + d + 0.8)); e.style.opacity = q; e.style.transform = `translateY(${(1 - q) * 14}px)`; });
  }
  const tag = $('#tag');

  const T = TL.transition;
  function renderScene(s, t, rt) { s.update(t - s.start, t); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(s.scene, s.camera); }
  window.renderFrame = (t) => {
    const ss = list.map((x) => inst[x.id]);
    let a = ss.find((s) => t >= s.start && t < s.end) || ss[ss.length - 1];
    const ia = ss.indexOf(a); let b = null, p = 0;
    const next = ss[ia + 1], prev = ss[ia - 1];
    if (next && t > a.end - T / 2) { b = next; p = range(t, a.end - T / 2, a.end + T / 2); }
    else if (prev && t < a.start + T / 2 && !only) { b = a; a = prev; p = range(t, b.start - T / 2, b.start + T / 2); }
    renderScene(a, t, rtA); if (b) renderScene(b, t, rtB);
    blend.uniforms.uP.value = b ? smooth(p) : 0;
    grade.uniforms.uSeed.value = (Math.round(t * 30) % 97) * 1.618;
    renderer.setRenderTarget(null); composer.render();
    for (const s of ss) if (s.ui) s.ui(t, s === a || s === b);
    badgeUI(t); brandCard(t);
    tag.style.opacity = smooth(range(t, 22.6, 23.2)) * (1 - smooth(range(t, 44.4, 44.9)));
  };
  window.TL = TL; window.__ready = true;
  if (params.has('t')) window.renderFrame(parseFloat(params.get('t')));
}
init().catch((e) => { window.__error = String(e.stack || e); console.error(e); });
