// Motor de render do curta de animação DigitalGov: window.renderFrame(t) desenha o quadro do instante t (determinístico).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, range, smooth, easeOutCubic, easeInOutCubic, lerp } from '../core.js';
import { setSpeech } from './act.js';

const params = new URLSearchParams(location.search);
const DPR = parseFloat(params.get('dpr') || '1');
const W = 1920, H = 1080;
const SCENES = {
  s1_ext: () => import('./s1_ext.js'), s1_admin: () => import('./s1_admin.js'), s2_archive: () => import('./s2_archive.js'),
  s3_ops: () => import('./s3_ops.js'), s3_ged: () => import('./s3_ged.js'), s4_hall: () => import('./s4_hall.js'), s5_hero: () => import('./s5_hero.js'),
  lineup: () => import('./lineup.js'),
};

async function init() {
  const TL = await (await fetch('/src/anim/timeline.json')).json();
  const lips = await (await fetch('/audio/anim/lipsync.json')).json();
  const lines = await (await fetch('/audio/anim/voice/lines.json')).json();
  setSpeech(TL, lips, lines);
  for (const f of ['600 40px "Inter Display"', '700 40px "Inter Display"', '400 40px "Inter"', '500 40px "Inter"', '600 40px "Inter"', '700 40px "Inter"', '400 40px "Liberation Serif"', '700 40px "Liberation Serif"']) await document.fonts.load(f);
  for (const id of ['logo-src', 'end-logo']) await new Promise((r) => { const img = document.getElementById(id); if (img.complete) r(); else img.onload = r; });

  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = 1.0;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = { renderer, envMap: pmrem.fromScene(new RoomEnvironment(), 0.04).texture, TL };

  const only = params.get('only');
  const list = (only === 'lineup' ? [{ id: 'lineup', start: 0, end: 60 }] : TL.scenes).filter((s) => !only || only === 'lineup' || only.split(',').includes(s.id));
  const inst = {};
  for (const s of list) inst[s.id] = { ...s, ...(await (await SCENES[s.id]()).create(env, TL)) };

  const mkRT = () => { const rt = new THREE.WebGLRenderTarget(W * DPR, H * DPR, { type: THREE.HalfFloatType, samples: 4 });
    rt.depthTexture = new THREE.DepthTexture(W * DPR, H * DPR); rt.depthTexture.type = THREE.UnsignedIntType; return rt; };
  const rtA = mkRT(), rtB = mkRT();
  const composer = new EffectComposer(renderer); composer.setPixelRatio(DPR); composer.setSize(W, H);
  const VS = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
  // Profundidade de campo (gather com pesos por CoC) + mistura entre planos
  const DOF = `
    float lin(sampler2D d, vec2 uv, vec2 nf){ float z = texture2D(d, uv).x*2.-1.; return 2.*nf.x*nf.y/(nf.y+nf.x-z*(nf.y-nf.x)); }
    vec3 dof(sampler2D c, sampler2D d, vec2 uv, vec2 nf, vec2 fa){
      float zc = lin(d, uv, nf); float cc = clamp(fa.y*abs(zc-fa.x)/max(zc,0.001), 0., 1.);
      vec3 col = texture2D(c, uv).rgb; if (fa.y <= 0.) return col;
      vec3 acc = col; float wsum = 1.;
      for (int i = 0; i < 28; i++) { float fi = float(i)+0.5; float r = sqrt(fi/28.); float a = fi*2.39996;
        vec2 o = vec2(cos(a), sin(a))*r*uMaxR*vec2(1., uAsp);
        float zs = lin(d, uv+o*cc, nf); float cs = clamp(fa.y*abs(zs-fa.x)/max(zs,0.001), 0., 1.);
        float w = zs < zc ? smoothstep(0., 1., cs*1.4) : 1.; w *= smoothstep(r-0.25, r, max(cs,cc)+0.15);
        acc += texture2D(c, uv+o*cc).rgb*w; wsum += w; }
      return acc/wsum; }`;
  const blend = new ShaderPass({ uniforms: { tDiffuse: { value: null }, tA: { value: null }, tB: { value: null }, dA: { value: null }, dB: { value: null }, uP: { value: 0 },
    nfA: { value: new THREE.Vector2(0.1, 100) }, nfB: { value: new THREE.Vector2(0.1, 100) }, faA: { value: new THREE.Vector2(3, 0) }, faB: { value: new THREE.Vector2(3, 0) },
    uMaxR: { value: 0.012 }, uAsp: { value: W / H }, uDip: { value: 0 } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tA, tB, dA, dB; uniform float uP, uMaxR, uAsp, uDip; uniform vec2 nfA, nfB, faA, faB; varying vec2 vUv;
      ${DOF}
      void main(){ vec3 a = dof(tA, dA, vUv, nfA, faA); if (uP > 0.) { vec3 b = dof(tB, dB, vUv, nfB, faB); a = mix(a, b, uP); }
        gl_FragColor = vec4(a*(1.-uDip), 1.); }` });
  blend.uniforms.tA.value = rtA.texture; blend.uniforms.tB.value = rtB.texture; blend.uniforms.dA.value = rtA.depthTexture; blend.uniforms.dB.value = rtB.depthTexture;
  composer.addPass(blend);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.18, 0.5, 1.05); composer.addPass(bloom);
  const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uSeed: { value: 0 }, uWarm: { value: 0.0 }, uVig: { value: 0.22 } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uSeed, uWarm, uVig; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + uSeed)*43758.5453); }
      void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv-.5; d.x *= 1.25;
        c.rgb *= 1. - uVig*smoothstep(.35,1.0,length(d)*1.3);
        c.rgb *= vec3(1.+uWarm*.05, 1.+uWarm*.01, 1.-uWarm*.05);
        c.rgb += (h(vUv*1000.)-.5)*.012; gl_FragColor = c; }` });
  composer.addPass(grade); composer.addPass(new OutputPass());

  // Tela final (DOM): cartão com logo, serviços e contatos
  const $ = (id) => document.getElementById(id);
  const dom = { end: $('end'), card: $('end-card'), logo: $('end-logo'), brand: $('end-brand'), services: $('end-services'), rule: $('end-rule'), phone: $('end-phone'), mail: $('end-mail'), tag: $('end-tag'), fade: $('fade') };
  function endCard(t) {
    const t0 = TL.endcard.in; if (t < t0 || only === 'lineup') { dom.end.style.opacity = 0; return; }
    dom.end.style.opacity = 1;
    const c = easeOutCubic(range(t, t0, t0 + 0.9)); dom.card.style.opacity = c; dom.card.style.transform = `translateX(${(1 - c) * 120}px) scale(${lerp(0.96, 1, c)})`;
    const step = (el, d, dy = 16) => { const q = easeOutCubic(range(t, t0 + d, t0 + d + 0.7)); el.style.opacity = q; el.style.transform = `translateY(${(1 - q) * dy}px)`; };
    const lq = easeOutCubic(range(t, t0 + 0.35, t0 + 1.2)); dom.logo.style.opacity = lq; dom.logo.style.filter = `blur(${(1 - lq) * 5}px)`;
    step(dom.brand, 0.7); step(dom.services, 0.9); dom.rule.style.transform = `scaleX(${easeOutCubic(range(t, t0 + 1.1, t0 + 1.8))})`;
    step(dom.phone, 1.3, 20); step(dom.mail, 1.55, 20); step(dom.tag, TL.endcard.tag - t0, 12);
  }

  function renderScene(s, t, rt, nf, fa) {
    const r = s.update(t - s.start, t) || {};
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(s.scene, s.camera);
    nf.set(s.camera.near, s.camera.far); fa.set(r.focus ?? 3, r.aperture ?? 0);
    return r;
  }
  window.renderFrame = (t) => {
    const ss = list.map((x) => inst[x.id]);
    let a = ss.find((s) => t >= s.start && t < s.end) || ss[ss.length - 1];
    const ia = ss.indexOf(a); let b = null, p = 0;
    const next = ss[ia + 1], prev = ss[ia - 1];
    const T = (x) => x.dissolve || 0;
    if (next && T(next) && t > next.start - T(next) / 2) { b = next; p = range(t, next.start - T(next) / 2, next.start + T(next) / 2); }
    else if (prev && T(a) && t < a.start + T(a) / 2 && !only) { b = a; a = prev; p = range(t, b.start - T(b) / 2, b.start + T(b) / 2); }
    const ra = renderScene(a, t, rtA, blend.uniforms.nfA.value, blend.uniforms.faA.value);
    let rb = {}; if (b) rb = renderScene(b, t, rtB, blend.uniforms.nfB.value, blend.uniforms.faB.value);
    blend.uniforms.uP.value = b ? smooth(p) : 0;
    const look = b && p > 0.5 ? rb : ra;
    grade.uniforms.uWarm.value = look.warm ?? 0.3; grade.uniforms.uVig.value = look.vignette ?? 0.22;
    bloom.strength = look.bloom ?? 0.18;
    grade.uniforms.uSeed.value = (Math.round(t * 30) % 97) * 1.618;
    // fades de abertura e final
    blend.uniforms.uDip.value = only === 'lineup' ? 0 : Math.max(1 - range(t, 0, 0.6), range(t, TL.duration - 0.5, TL.duration) * 0.0);
    renderer.setRenderTarget(null); composer.render();
    endCard(t);
    dom.fade.style.opacity = only === 'lineup' ? 0 : range(t, TL.duration - 0.35, TL.duration) * 0;
  };
  window.TL = TL; window.__ready = true;
  if (params.has('t')) window.renderFrame(parseFloat(params.get('t')));
}
init().catch((e) => { window.__error = String(e.stack || e); console.error(e); });
