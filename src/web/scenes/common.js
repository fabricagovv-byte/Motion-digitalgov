import * as THREE from 'three';
import { canvasTex } from '../textures.js';

export const GLSL_NOISE = /* glsl */`
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*vnoise(p); p*=2.03; a*=.5; } return v; }
`;

// Papel que se dissolve em luz (borda luminosa azul).
export function dissolveMaterial(map) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, uProg: { value: 0 }, uTint: { value: new THREE.Color(1, 1, 1) }, uOpacity: { value: 1 }, uGlow: { value: new THREE.Color(0.35, 0.75, 1.0) }, uDigital: { value: 0 }, uMap2: { value: null } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: GLSL_NOISE + `
      uniform sampler2D map; uniform sampler2D uMap2; uniform float uProg, uOpacity, uDigital; uniform vec3 uTint, uGlow; varying vec2 vUv;
      void main(){
        float n = fbm(vUv*vec2(5.,7.))*0.85 + 0.15*vUv.y;
        float p = uProg*1.25 - 0.1;
        if (n < p) discard;
        vec4 c = texture2D(map, vUv);
        if (uDigital > 0.) { vec4 d = texture2D(uMap2, vUv); float m = step(1. - vUv.y, uDigital);
          c.rgb = mix(c.rgb, d.rgb*1.6 + vec3(0.02,0.06,0.12), m); }
        float edge = 1. - smoothstep(p, p+0.07, n);
        vec3 col = c.rgb*uTint + uGlow*edge*3.0*step(0.001,uProg);
        gl_FragColor = vec4(col, uOpacity);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide, transparent: true,
  });
}

// Pontos luminosos com tamanho/opacidade por ponto (shader próprio, aditivo).
export function makePoints(count, sprite, { size = 0.05, color = 0x9fd8ff } = {}) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(count), 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(count).fill(1), 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(count * 3).fill(1), 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: sprite }, uSize: { value: size }, uColor: { value: new THREE.Color(color) }, uScale: { value: 540 }, uGain: { value: 1 } },
    vertexShader: `attribute float aAlpha; attribute float aSize; attribute vec3 aColor; varying float vA; varying vec3 vC; uniform float uSize, uScale;
      void main(){ vA=aAlpha; vC=aColor; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = uSize*aSize*uScale/ -mv.z; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 uColor; uniform float uGain; varying float vA; varying vec3 vC;
      void main(){ float a = texture2D(map, gl_PointCoord).a * vA * uGain; if (a < 0.003) discard; gl_FragColor = vec4(uColor*vC*a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  return pts;
}

export function gridTexture(cells = 8, line = 'rgba(90,170,255,.9)') {
  return canvasTex(512, 512, (g, w) => {
    g.clearRect(0, 0, w, w); g.strokeStyle = line; g.lineWidth = 2;
    for (let i = 0; i <= cells; i++) { const p = Math.round(i * w / cells); g.beginPath(); g.moveTo(p, 0); g.lineTo(p, w); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
    g.fillStyle = 'rgba(160,220,255,1)'; for (let i = 0; i <= cells; i++) for (let j = 0; j <= cells; j++) g.fillRect(i * w / cells - 3, j * w / cells - 3, 6, 6);
  }, { repeat: true });
}

// Plano com fade radial (chão/fundo) para grids.
export function fadedGrid(size, reps, opacity = 0.25) {
  const tex = gridTexture(); tex.repeat.set(reps, reps);
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, uOpacity: { value: opacity }, uRep: { value: reps }, uColor: { value: new THREE.Color(0x3aa0ff) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D map; uniform float uOpacity, uRep; uniform vec3 uColor; varying vec2 vUv;
      void main(){ float a = texture2D(map, vUv*uRep).a; float r = length(vUv-.5)*2.; a *= (1.-smoothstep(.2,1.,r)) * uOpacity; gl_FragColor = vec4(uColor*a, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat); m.rotation.x = -Math.PI / 2; return m;
}

// Plano que exibe uma CanvasTexture com transparência.
export function texPlane(tex, w, h, { additive = false, opacity = 1 } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false }));
  return m;
}
