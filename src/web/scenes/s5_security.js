// CENA 5 — Segurança e controle: camadas de proteção, autenticação, perfis e registros (sem clichês de cadeado).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { camPath, rng, lerp, range, smooth, easeOutCubic, easeInOutSine, easeInOutCubic } from '../core.js';
import { canvasTex, paperTexture, drawCard } from '../textures.js';
import { makePoints, texPlane, GLSL_NOISE } from './common.js';

export function create(env) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020610);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.05, 80);

  // Fundo hexagonal sutil
  const hexMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uA: { value: 0.35 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: GLSL_NOISE + `uniform float uT, uA; varying vec2 vUv;
      float hexd(vec2 p){ p = abs(p); return max(dot(p, normalize(vec2(1.,1.732))), p.x); }
      void main(){ vec2 p = (vUv-.5)*vec2(32.,18.); vec2 r = vec2(1.,1.732); vec2 h = r*.5;
        vec2 a = mod(p, r)-h, b = mod(p-h, r)-h; vec2 g = dot(a,a) < dot(b,b) ? a : b;
        float e = smoothstep(.47,.5, hexd(g)); vec2 id = p - g;
        float pulse = smoothstep(.75,1., sin(uT*1.2 - length(id)*.35)*.5+.5);
        float fade = 1. - smoothstep(.15,.75, length(vUv-.5));
        float c = (e*.35 + e*pulse*.9) * fade * uA; gl_FragColor = vec4(vec3(.15,.45,1.)*c, c); }`,
  });
  const hex = new THREE.Mesh(new THREE.PlaneGeometry(32, 18), hexMat); hex.position.z = -5; scene.add(hex);

  // Documentos protegidos
  const docs = new THREE.Group(); scene.add(docs);
  [0, 1, 2].forEach((i) => { const m = texPlane(paperTexture(600 + i, true), 1.05, 1.48, { additive: true }); m.position.set((i - 1) * 0.16, (1 - i) * 0.1, -i * 0.14); m.material.opacity = 0.75 + i * 0.1; docs.add(m); });

  // Camadas de proteção (vidro com borda luminosa)
  const layerTex = canvasTex(512, 640, (g, w, h) => { g.clearRect(0, 0, w, h);
    const grd = g.createLinearGradient(0, 0, w, h); grd.addColorStop(0, 'rgba(90,170,255,.10)'); grd.addColorStop(1, 'rgba(90,170,255,.03)');
    g.fillStyle = grd; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 36); g.fill();
    g.strokeStyle = 'rgba(140,210,255,.85)'; g.lineWidth = 4; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 36); g.stroke(); });
  const layers = [0, 1, 2].map((i) => { const m = texPlane(layerTex, 1.6 + i * 0.32, 2.0 + i * 0.4, { additive: true }); scene.add(m); return m; });

  // Anéis orbitais tracejados
  const ringMat = (seg) => new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uA: { value: 0 }, uSeg: { value: seg } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uT, uA, uSeg; varying vec2 vUv; void main(){ float d = step(.35, fract(vUv.x*uSeg + uT)); float c = d*uA; gl_FragColor = vec4(vec3(.35,.75,1.4)*c, c); }` });
  const rings = [[1.75, 60, 0.9], [2.15, 24, -0.6], [2.5, 90, 0.4]].map(([r, seg, sp], i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 6, 256), ringMat(seg)); m.userData.sp = sp; m.rotation.x = 1.25 + i * 0.12; m.rotation.y = (i - 1) * 0.3; scene.add(m); return m; });

  // Cartões de autenticação e registro de atividades (ilustrativos)
  const CW = 1000, CH = 470;
  const defs = [
    { title: 'Autenticação', badge: 'Verificado', accent: '#5be0c8', rows: [{ a: 'Usuário', b: 'a.souza' }, { a: 'Perfil de acesso', b: 'Analista', bc: '#9fd0ff' }, { a: 'Sessão', b: 'Autenticada', bc: '#5be0c8' }], pos: [-2.45, 0.62, 0.2], ry: 0.3 },
    { title: 'Registro de atividades', accent: '#2fa8ff', rows: [{ a: 'Consulta · Contrato 0187', b: '09:41', dot: '#2fa8ff' }, { a: 'Edição · Processo 1123', b: '09:35', dot: '#2fa8ff' }, { a: 'Acesso negado · Pasta RH', b: '09:30', dot: '#f0b44c' }], pos: [2.45, -0.5, 0.2], ry: -0.3 },
  ];
  const cards = defs.map((d) => { const tex = canvasTex(CW, CH, () => {}); const m = texPlane(tex, 2.1, 2.1 * CH / CW); scene.add(m); return { ...d, tex, m }; });

  const R = rng(5), NP = 300, motes = makePoints(NP, env.dot, { size: 0.05, color: 0x7fc4ff });
  const ms = []; for (let i = 0; i < NP; i++) ms.push([R() * 6.28, 1.6 + R() * 1.4, (R() - 0.5) * 2.4, R()]); scene.add(motes);

  function update(t) {
    hexMat.uniforms.uT.value = t;
    docs.rotation.y = Math.sin(t * 0.4) * 0.12; docs.position.y = Math.sin(t * 0.7) * 0.04;
    layers.forEach((l, i) => { const a = easeOutCubic(range(t, 0.5 + i * 0.45, 1.6 + i * 0.45));
      l.position.set(0, 0, lerp(2.5, 0.35 + i * 0.32, a)); l.material.opacity = a * (0.9 - i * 0.2); l.visible = a > 0; l.rotation.y = Math.sin(t * 0.4) * 0.12; });
    rings.forEach((r, i) => { r.rotation.z = t * 0.25 * r.userData.sp; r.material.uniforms.uT.value = t * 0.1 * r.userData.sp; r.material.uniforms.uA.value = 0.7 * smooth(range(t, 1.2 + i * 0.3, 2.2 + i * 0.3)); });
    cards.forEach((c, i) => { const a = easeOutCubic(range(t, 1.9 + i * 0.4, 3.0 + i * 0.4));
      drawCard(c.tex.userData.g, CW, CH, { title: c.title, rows: c.rows, accent: c.accent, badge: c.badge, reveal: range(t, 2.1 + i * 0.4, 3.9 + i * 0.4) }); c.tex.needsUpdate = true;
      c.m.position.set(c.pos[0] * lerp(1.25, 1, a), c.pos[1] + Math.sin(t * 0.8 + i) * 0.03, c.pos[2]); c.m.rotation.y = c.ry; c.m.material.opacity = a; c.m.visible = a > 0; });
    const pa = motes.geometry.attributes;
    for (let i = 0; i < NP; i++) { const s = ms[i]; const an = s[0] + t * 0.2 * (0.5 + s[3]); pa.position.setXYZ(i, Math.cos(an) * s[1], s[2], Math.sin(an) * s[1] * 0.5); pa.aAlpha.setX(i, 0.4 * smooth(range(t, 0.8, 2))); }
    pa.position.needsUpdate = pa.aAlpha.needsUpdate = true;
    camPath(camera, t, [
      { t: -0.6, p: [1.3, 0.7, 8.6], l: [0, 0, 0] },
      { t: 7.8, p: [-0.5, 0.25, 7.3], l: [0, -0.05, 0] },
    ], easeInOutSine);
  }
  return { scene, camera, update };
}
