// CENA 7 — Assinatura da marca: partículas convergem e revelam a logo oficial (aplicada sem alterações).
import * as THREE from 'three';
import { rng, lerp, range, smooth, smoother, easeOutCubic, easeInOutCubic, easeOutExpo } from '../core.js';
import { makePoints } from './common.js';

export function create(env) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x01030a);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 100);
  camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0);

  // Geometria do cartão da logo (mesma posição do elemento DOM #brand-card) em unidades de mundo
  const PX = 1080 / (2 * 10 * Math.tan(18 * Math.PI / 180));
  const cx = 0, cy = (540 - 410) / PX, hw = 380 / PX, hh = 150 / PX;

  const bgGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: env.dot, color: new THREE.Color(0.05, 0.25, 0.7), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  bgGlow.position.set(cx, cy, -2); scene.add(bgGlow);

  const R = rng(77), NP = 2400, pts = makePoints(NP, env.dot, { size: 0.1, color: 0x9fd8ff });
  const seeds = [];
  for (let i = 0; i < NP; i++) {
    const v = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(6 + R() * 10); v.z -= 4;
    // alvo: contorno do cartão + halo suave
    const per = R(), edge = R() < 0.7; let tx, ty;
    const L = 2 * (hw + hh); let d = per * 2 * L;
    if (d < 2 * hw) { tx = -hw + d; ty = hh; } else if ((d -= 2 * hw) < 2 * hh) { tx = hw; ty = hh - d; } else if ((d -= 2 * hh) < 2 * hw) { tx = hw - d; ty = -hh; } else { d -= 2 * hw; tx = -hw; ty = -hh + d % (2 * hh); }
    const spread = edge ? 0.05 + R() * 0.12 : 0.4 + R() * 1.8; const ang = R() * 6.28;
    seeds.push({ from: v, to: new THREE.Vector3(cx + tx * (1 + spread * 0.15) + Math.cos(ang) * spread * 0.3, cy + ty * (1 + spread * 0.25) + Math.sin(ang) * spread * 0.2, (R() - 0.5) * 0.6),
      d: R() * 0.7, ph: R() * 6.28, sp: 0.4 + R() * 0.8, edge });
  }
  scene.add(pts);

  const V = new THREE.Vector3();
  function update(t) {
    const dom = env.dom; dom.brand.style.opacity = 1;
    const pa = pts.geometry.attributes;
    seeds.forEach((s, i) => {
      const k = easeInOutCubic(range(t, 0.2 + s.d, 2.4 + s.d));
      V.lerpVectors(s.from, s.to, k);
      const swirl = (1 - k) * 1.2; V.x += Math.sin(t * s.sp + s.ph) * swirl * 0.4; V.y += Math.cos(t * s.sp * 1.3 + s.ph) * swirl * 0.3;
      V.x += Math.sin(t * 0.5 * s.sp + s.ph) * 0.03 * k; V.y += Math.cos(t * 0.4 * s.sp + s.ph) * 0.03 * k;
      pa.position.setXYZ(i, V.x, V.y, V.z);
      const settle = smooth(range(t, 2.6, 4.2));
      pa.aAlpha.setX(i, smooth(range(t, 0.0 + s.d * 0.5, 0.8 + s.d)) * (s.edge ? lerp(1, 0.25, settle) : lerp(0.7, 0.3, settle)));
    });
    pa.position.needsUpdate = pa.aAlpha.needsUpdate = true;
    const gs = lerp(5, 11, smooth(range(t, 1.5, 4))); bgGlow.scale.set(gs * 1.7, gs, 1); bgGlow.material.opacity = smooth(range(t, 1.2, 3.5)) * 0.45;

    // Logo: entrada tridimensional discreta e assentamento exato (sem deformação final)
    const a = easeOutExpo(range(t, 2.1, 3.9));
    dom.card.style.opacity = smooth(range(t, 2.1, 2.9));
    dom.card.style.transform = `perspective(1400px) translateZ(${(1 - a) * -140}px) rotateX(${(1 - a) * 16}deg) rotateY(${(1 - a) * -10}deg)`;
    const sh = range(t, 4.0, 5.1); dom.sheen.style.left = `${lerp(-220, 900, easeInOutCubic(sh))}px`; dom.sheen.style.opacity = sh > 0 && sh < 1 ? 1 : 0;
    const l1 = easeOutCubic(range(t, 3.6, 4.6)), l2 = easeOutCubic(range(t, 4.2, 5.2));
    dom.l1.style.opacity = l1; dom.l1.style.transform = `translateY(${(1 - l1) * 18}px)`; dom.l1.style.filter = `blur(${(1 - l1) * 6}px)`;
    dom.l2.style.opacity = l2; dom.l2.style.transform = `translateY(${(1 - l2) * 18}px)`; dom.l2.style.filter = `blur(${(1 - l2) * 6}px)`;
    camera.position.set(Math.sin(t * 0.2) * 0.1, 0, lerp(11, 10, easeOutCubic(range(t, 0, 4))));
    camera.lookAt(0, 0, 0);
  }
  return { scene, camera, update };
}
