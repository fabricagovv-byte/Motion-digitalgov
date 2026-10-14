// Motor de render determinístico: window.renderFrame(t) desenha o quadro do instante t.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, range, smooth, easeOutCubic, easeOutExpo, lerp } from './core.js';
import { dotTexture } from './textures.js';
import { GLSL_NOISE } from './scenes/common.js';

const params = new URLSearchParams(location.search);
const DPR = parseFloat(params.get('dpr') || '1');
const W = 1920, H = 1080;

const SCENES = {
  s1_archive: () => import('./scenes/s1_archive.js'),
  s2_scan: () => import('./scenes/s2_scan.js'),
  s3_ged: () => import('./scenes/s3_ged.js'),
  s4_globe: () => import('./scenes/s4_globe.js'),
  s5_security: () => import('./scenes/s5_security.js'),
  s6_future: () => import('./scenes/s6_future.js'),
  s7_brand: () => import('./scenes/s7_brand.js'),
};

async function init() {
  const TL = await (await fetch('/src/timeline.json')).json();
  await document.fonts.load('600 40px "Inter Display"'); await document.fonts.load('300 40px "Inter Display"');
  await document.fonts.load('400 40px "Inter"'); await document.fonts.load('500 40px "Inter"'); await document.fonts.load('600 40px "Inter"'); await document.fonts.load('700 40px "Inter Display"');
  await new Promise((r) => { const img = document.getElementById('logo'); if (img.complete) r(); else img.onload = r; });

  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = { renderer, envMap: pmrem.fromScene(new RoomEnvironment(), 0.04).texture, dot: dotTexture(), dom: {
    title: document.getElementById('title'), brand: document.getElementById('brand'), card: document.getElementById('brand-card'),
    sheen: document.getElementById('sheen'), l1: document.getElementById('brand-line1'), l2: document.getElementById('brand-line2') } };

  const only = params.get('only');
  const list = TL.scenes.filter((s) => !only || only.split(',').includes(s.id));
  const inst = {};
  for (const s of list) inst[s.id] = { ...s, ...(await (await SCENES[s.id]()).create(env)) };

  const rtOpts = { type: THREE.HalfFloatType, samples: 4 };
  const rtA = new THREE.WebGLRenderTarget(W * DPR, H * DPR, rtOpts), rtB = new THREE.WebGLRenderTarget(W * DPR, H * DPR, rtOpts);

  const composer = new EffectComposer(renderer); composer.setPixelRatio(DPR); composer.setSize(W, H);
  const blend = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, tA: { value: rtA.texture }, tB: { value: rtB.texture }, uP: { value: 0 }, uDir: { value: new THREE.Vector2(1, 0.25) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: GLSL_NOISE + `uniform sampler2D tA, tB; uniform float uP; uniform vec2 uDir; varying vec2 vUv;
      void main(){ vec4 a = texture2D(tA, vUv); if (uP <= 0.) { gl_FragColor = a; return; }
        vec4 b = texture2D(tB, vUv); if (uP >= 1.) { gl_FragColor = b; return; }
        float e = dot(vUv - .5, normalize(uDir)) * .55 + .5; e = e*.62 + fbm(vUv*vec2(7.,4.))*.38;
        float th = uP*1.5 - .25; float m = smoothstep(th + .09, th - .09, e);
        float edge = 1. - abs(m*2. - 1.);
        vec4 c = mix(a, b, m); c.rgb += vec3(.18,.5,1.)*edge*edge*.35*(1.-abs(uP*2.-1.)); gl_FragColor = c; }`,
  });
  blend.uniforms.tA.value = rtA.texture; blend.uniforms.tB.value = rtB.texture; // ShaderPass clona uniforms
  composer.addPass(blend);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.55, 0.55, 0.82); composer.addPass(bloom);
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 }, uVig: { value: 0.32 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uSeed, uVig; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uSeed)*43758.5453); }
      void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv-.5; d.x *= 1.25; float v = 1. - uVig*smoothstep(.25,.95,length(d)*1.3);
        c.rgb *= v; c.rgb += (h(vUv*1000.)-.5)*.012; gl_FragColor = c; }`,
  });
  composer.addPass(grade); composer.addPass(new OutputPass());

  const T = TL.transition;
  const titleEl = env.dom.title; let titleKey = null;
  function setTitle(t) {
    const cur = TL.titles.find((x) => t >= x.in - 0.05 && t <= x.out + 0.05 && (!only || inst[x.scene]));
    const scrim = document.getElementById('scrim');
    if (!cur) { titleEl.style.opacity = 0; scrim.style.opacity = 0; return; }
    scrim.className = cur.hero ? 'hero' : '';
    scrim.style.opacity = smooth(range(t, cur.in - 0.3, cur.in + 0.5)) * (1 - smooth(range(t, cur.out - 0.6, cur.out + 0.1)));
    const key = cur.in;
    if (titleKey !== key) {
      titleKey = key; titleEl.className = 'title' + (cur.hero ? ' hero' : '');
      titleEl.innerHTML = `<div class="rule"></div>` + cur.lines.map((l, i) => `<div class="line"><span class="l${i}">${l}</span></div>`).join('') + (cur.sub ? `<div class="sub">${cur.sub}</div>` : '');
    }
    titleEl.style.opacity = 1;
    const lt = t - cur.in, outP = smooth(range(t, cur.out - 0.7, cur.out));
    titleEl.querySelector('.rule').style.transform = `scaleX(${easeOutExpo(range(lt, 0, 0.9)) * (1 - outP)})`;
    titleEl.querySelectorAll('.line span').forEach((s, i) => {
      const p = easeOutCubic(range(lt, 0.12 + i * 0.22, 1.1 + i * 0.22));
      s.style.transform = `translateY(${(1 - p) * 105 - outP * 30}%)`;
      s.style.opacity = p * (1 - outP); s.style.filter = `blur(${(1 - p) * 6 + outP * 8}px)`;
      s.style.letterSpacing = `${(1 - p) * 0.04 - 0.02}em`;
    });
    const sub = titleEl.querySelector('.sub');
    if (sub) { const p = easeOutCubic(range(lt, 0.9, 1.9)); sub.style.opacity = p * (1 - outP); sub.style.transform = `translateY(${(1 - p) * 16}px)`; }
  }

  function renderScene(s, t, rt) {
    s.update(t - s.start, t);
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(s.scene, s.camera);
  }

  window.renderFrame = (t) => {
    env.dom.brand.style.opacity = 0;
    const ss = list.map((x) => inst[x.id]);
    let a = ss.find((s) => t >= s.start && t < s.end) || ss[ss.length - 1];
    let ia = ss.indexOf(a), b = null, p = 0;
    const next = ss[ia + 1], prev = ss[ia - 1];
    if (next && t > a.end - T / 2) { b = next; p = range(t, a.end - T / 2, a.end + T / 2); }
    else if (prev && t < a.start + T / 2 && !only) { b = a; a = prev; p = range(t, b.start - T / 2, b.start + T / 2); }
    renderScene(a, t, rtA);
    if (b) renderScene(b, t, rtB);
    blend.uniforms.uP.value = b ? smooth(p) : 0;
    grade.uniforms.uSeed.value = (Math.round(t * 30) % 97) * 1.618;
    renderer.setRenderTarget(null);
    if (params.has('raw')) { renderer.render(a.scene, a.camera); } else composer.render();
    setTitle(t);
    const f = document.getElementById('fade');
    f.style.opacity = Math.max(1 - range(t, 0, 1.2), smooth(range(t, TL.duration - 1.1, TL.duration - 0.05)));
  };
  window.TL = TL;
  window.__ready = true;
  if (params.has('t')) window.renderFrame(parseFloat(params.get('t')));
}
init().catch((e) => { window.__error = String(e.stack || e); console.error(e); });
