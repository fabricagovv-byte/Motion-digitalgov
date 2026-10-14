// Motor de render do vídeo institucional: window.renderFrame(t) desenha o quadro do instante t (determinístico).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, range, smooth, easeOutCubic, easeOutExpo, easeInOutCubic, lerp } from '../core.js';

const params = new URLSearchParams(location.search);
const DPR = parseFloat(params.get('dpr') || '1');
const W = 1920, H = 1080;
const SCENES = {
  i1_open: () => import('./i1_open.js'), i2_digit: () => import('./i2_digit.js'), i3_index: () => import('./i3_index.js'),
  i4_ged: () => import('./i4_ged.js'), i5_end: () => import('./i5_end.js'),
};

async function init() {
  const TL = await (await fetch('/src/inst/timeline.json')).json();
  for (const f of ['600 40px "Inter Display"', '400 40px "Inter"', '500 40px "Inter"', '600 40px "Inter"', '700 40px "Inter"', '400 40px "Liberation Serif"', '700 40px "Liberation Serif"']) await document.fonts.load(f);
  await new Promise((r) => { const img = document.getElementById('logo'); if (img.complete) r(); else img.onload = r; });

  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = { renderer, envMap: pmrem.fromScene(new RoomEnvironment(), 0.04).texture };

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
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.2, 0.4, 1.25));
  const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uSeed; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uSeed)*43758.5453); }
      void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv-.5; d.x *= 1.2; c.rgb *= 1. - .22*smoothstep(.3,.95,length(d)*1.25);
        c.rgb += (h(vUv*1000.)-.5)*.018; gl_FragColor = c; }` });
  composer.addPass(grade); composer.addPass(new OutputPass());

  const dom = { kw: document.getElementById('kw'), card: document.getElementById('card'), logo: document.getElementById('logo'), rule: document.getElementById('card-rule'),
    services: document.getElementById('card-services'), cta: document.getElementById('card-cta'), contacts: document.getElementById('card-contacts'), fade: document.getElementById('fade') };
  const EC = TL.endcard; dom.services.textContent = EC.services; dom.cta.textContent = EC.cta; dom.contacts.textContent = EC.contacts || '';
  env.dom = dom;

  let kwKey = null;
  function keyword(t) {
    const k = TL.keywords.find((x) => t >= x.in && t <= x.out); const el = dom.kw;
    if (!k) { el.style.opacity = 0; return; }
    if (kwKey !== k.in) { kwKey = k.in; el.querySelector('.num').textContent = k.kicker; el.querySelector('.word span').textContent = k.word; el.querySelector('.sub').textContent = k.sub || ''; }
    const lt = t - k.in, out = smooth(range(t, k.out - 0.5, k.out));
    el.style.opacity = 1 - out;
    el.querySelector('.bar').style.transform = `scaleX(${easeOutExpo(range(lt, 0, 0.8))})`;
    const p = easeOutCubic(range(lt, 0.1, 0.9)); const w = el.querySelector('.word span');
    w.style.transform = `translateY(${(1 - p) * 100}%)`; w.style.opacity = p; w.style.filter = `blur(${(1 - p) * 4}px)`;
    const s = el.querySelector('.sub'); const sp = easeOutCubic(range(lt, 0.6, 1.3)); s.style.opacity = sp; s.style.transform = `translateY(${(1 - sp) * 10}px)`;
  }

  // Cartão da marca: abertura (0–3,4 s) e encerramento (a partir de endcard.in)
  function brandCard(t) {
    const c = dom.card; const endIn = EC.in;
    if (t < 3.6) {
      const a = 1 - easeInOutCubic(range(t, 2.75, 3.55)); c.style.opacity = a;
      const p = easeOutCubic(range(t, 0.15, 1.5)); dom.logo.style.opacity = p;
      dom.logo.style.transform = `translateY(0px) scale(${lerp(0.94, 1, p) * lerp(1, 1.04, range(t, 1.5, 3.55))})`; dom.logo.style.filter = `blur(${(1 - p) * 6}px)`;
      dom.rule.style.top = '676px'; dom.rule.style.transform = `scaleX(${easeOutExpo(range(t, 0.9, 1.9))})`;
      for (const e of [dom.services, dom.cta, dom.contacts]) e.style.opacity = 0;
      return;
    }
    if (t < endIn) { c.style.opacity = 0; return; }
    c.style.opacity = easeInOutCubic(range(t, endIn, endIn + 0.7));
    const p = easeOutCubic(range(t, endIn + 0.3, endIn + 1.4)); dom.logo.style.opacity = p; dom.logo.style.filter = `blur(${(1 - p) * 6}px)`;
    const lift = easeInOutCubic(range(t, endIn + 1.3, endIn + 2.2));
    dom.logo.style.transform = `translateY(${-lift * 90}px) scale(${lerp(0.95, 1, p)})`;
    dom.rule.style.top = '640px'; dom.rule.style.transform = `scaleX(${easeOutExpo(range(t, endIn + 1.9, endIn + 2.8))})`;
    [[dom.services, 2.1], [dom.cta, 2.5], [dom.contacts, 2.9]].forEach(([e, d]) => { const q = easeOutCubic(range(t, endIn + d, endIn + d + 0.8)); e.style.opacity = q; e.style.transform = `translateY(${(1 - q) * 14}px)`; });
  }

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
    keyword(t); brandCard(t);
    dom.fade.style.opacity = 0;
  };
  window.TL = TL; window.__ready = true;
  if (params.has('t')) window.renderFrame(parseFloat(params.get('t')));
}
init().catch((e) => { window.__error = String(e.stack || e); console.error(e); });
