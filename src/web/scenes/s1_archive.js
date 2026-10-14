// CENA 1 — O universo dos documentos: arquivo físico que evolui para o digital.
import * as THREE from 'three';
import { rng, lerp, range, smooth, smoother, easeInOutSine, easeOutCubic, clamp } from '../core.js';
import { paperTexture, shaftTexture, canvasTex } from '../textures.js';
import { dissolveMaterial, makePoints, fadedGrid } from './common.js';

export function create(env) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070b);
  scene.fog = new THREE.FogExp2(0x05070b, 0.075);
  scene.environment = env.envMap; scene.environmentIntensity = 0.25;
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.05, 80);
  const R = rng(11);

  // Chão levemente reflexivo
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 60), new THREE.MeshStandardMaterial({ color: 0x0b0d11, roughness: 0.32, metalness: 0.35 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -18; scene.add(floor);
  const grid = fadedGrid(40, 40, 0); grid.position.set(0, 0.003, -6); scene.add(grid);

  // Estantes (instanced)
  const UNIT = 2.0, N = 16, SHELVES = [0.12, 0.8, 1.48, 2.16, 2.84];
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2e36, roughness: 0.45, metalness: 0.7 });
  const plankGeo = new THREE.BoxGeometry(0.62, 0.035, UNIT - 0.04);
  const postGeo = new THREE.BoxGeometry(0.05, 3.25, 0.05);
  const planks = new THREE.InstancedMesh(plankGeo, metal, N * 2 * SHELVES.length);
  const posts = new THREE.InstancedMesh(postGeo, metal, N * 2 * 2);
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const boxTex = canvasTex(256, 256, (g, w, h) => {   // caixa-arquivo: etiqueta, alça e bordas
    g.fillStyle = '#bdbdbd'; g.fillRect(0, 0, w, h);
    const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(255,255,255,.18)'); v.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6); g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h);
    g.fillStyle = '#efece4'; g.fillRect(58, 58, 140, 80); g.fillStyle = 'rgba(40,40,40,.6)'; g.fillRect(70, 74, 100, 8); g.fillRect(70, 92, 70, 6); g.fillRect(70, 108, 90, 6);
    g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(128, 190, 34, 11, 0, 0, 7); g.fill();
  });
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: boxTex, roughness: 0.8, metalness: 0.0 });
  const items = [];
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
  let pi = 0, qi = 0;
  const palette = [0xb59c78, 0xa48b68, 0xc2ac88, 0x8f7b60, 0x2d3a52, 0x3c4a63, 0x6b6f78, 0xd8d0c0];
  for (const side of [-1, 1]) for (let u = 0; u < N; u++) {
    const zc = 4 - u * UNIT - UNIT / 2, xc = side * 2.25;
    for (const y of SHELVES) { M.makeTranslation(xc, y, zc); planks.setMatrixAt(pi++, M); }
    for (const dz of [-1, 1]) { M.makeTranslation(xc + side * 0.0, 1.62, zc + dz * (UNIT / 2 - 0.03)); posts.setMatrixAt(qi++, M); }
    for (let s = 0; s < SHELVES.length; s++) {
      let z = zc - UNIT / 2 + 0.06;
      while (z < zc + UNIT / 2 - 0.12) {
        const binder = R() < 0.35;
        const w = binder ? 0.06 + R() * 0.04 : 0.3 + R() * 0.12, h = binder ? 0.5 + R() * 0.08 : 0.3 + R() * 0.12, d = binder ? 0.42 : 0.5;
        if (z + w > zc + UNIT / 2 - 0.05) break;
        if (R() < 0.08) { z += w + 0.05; continue; }
        const col = binder ? palette[4 + Math.floor(R() * 4)] : palette[Math.floor(R() * 4)];
        items.push({ p: [xc - side * 0.02, SHELVES[s] + 0.018 + h / 2, z + w / 2], s: [d, h, w], c: col, r: (R() - 0.5) * 0.04 });
        z += w + 0.012 + R() * 0.02;
      }
    }
  }
  const boxes = new THREE.InstancedMesh(boxGeo, boxMat, items.length);
  const C = new THREE.Color();
  items.forEach((it, i) => { Q.setFromEuler(new THREE.Euler(0, 0, it.r)); M.compose(P.set(...it.p), Q, S.set(...it.s)); boxes.setMatrixAt(i, M); boxes.setColorAt(i, C.setHex(it.c)); });
  scene.add(planks, posts, boxes);

  // Luminárias + luzes
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffe2b8 });
  const lights = [], lamps = [], shafts = [];
  const shaftTex = shaftTexture();
  for (let i = 0; i < 6; i++) {
    const z = 3 - i * 4.2;
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 1.4), lampMat.clone()); lamp.position.set(0, 3.7, z); scene.add(lamp); lamps.push(lamp);
    const L = new THREE.PointLight(0xffc489, 6, 8, 1.8); L.position.set(0, 3.4, z); scene.add(L); lights.push(L);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.7), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.08, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd7a8, side: THREE.DoubleSide }));
    sh.position.set(0, 1.85, z); scene.add(sh); shafts.push(sh);
  }
  const hemi = new THREE.HemisphereLight(0x8aa0c0, 0x0a0805, 0.12); scene.add(hemi);

  // Poeira
  const DUST = 700, dust = makePoints(DUST, env.dot, { size: 0.018, color: 0xffe6c8 });
  const dseed = []; for (let i = 0; i < DUST; i++) dseed.push([(R() - 0.5) * 3.6, R() * 3.6, 6 - R() * 22, R() * 6.28, 0.3 + R() * 0.7]);
  scene.add(dust);

  // Papéis que flutuam e viram partículas
  const PAPERS = 16, PW = 0.42, PH = 0.594;
  const papers = [];
  for (let i = 0; i < PAPERS; i++) {
    const side = i % 2 ? 1 : -1;
    const mat = dissolveMaterial(paperTexture(100 + i));
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), mat); scene.add(mesh);
    const r = rng(500 + i);
    papers.push({ mesh, mat, side,
      start: new THREE.Vector3(side * 1.95, SHELVES[1 + Math.floor(r() * 3)] + 0.55, -0.5 - r() * 7),
      end: new THREE.Vector3(side * (0.15 + r() * 0.9), 1.6 + r() * 1.5, -2.6 - r() * 6.5),
      t0: 1.0 + i * 0.22 + r() * 0.3, td: 4.4 + i * 0.12 + r() * 0.5, ph: r() * 6.28, spin: (r() - 0.5) * 1.2 });
  }
  const PPP = 170, ppts = makePoints(PAPERS * PPP, env.dot, { size: 0.038, color: 0xffffff });
  const pseed = []; for (let i = 0; i < PAPERS * PPP; i++) pseed.push([R() - 0.5, R() - 0.5, R(), R(), R(), R()]);
  scene.add(ppts);

  const obj = new THREE.Object3D();
  function paperPose(p, t) {
    const u = smoother(range(t, p.t0, p.t0 + 3.6));
    obj.position.lerpVectors(p.start, p.end, u);
    obj.position.y += Math.sin(t * 1.3 + p.ph) * 0.06 * u;
    obj.rotation.set(lerp(-Math.PI / 2, -0.15 + Math.sin(t * 0.9 + p.ph) * 0.35, u), p.side * lerp(0, -0.6, u) + p.spin * u * 0.4, Math.sin(t * 0.7 + p.ph) * 0.25 * u);
    obj.updateMatrix(); return obj.matrix;
  }

  const warm = new THREE.Color(0xffc489), cool = new THREE.Color(0x3d9dff), tmp = new THREE.Color();
  const V = new THREE.Vector3();
  function update(t) {
    const dig = smooth(range(t, 3.8, 8.6));                 // físico -> digital
    tmp.copy(warm).lerp(cool, dig);
    lights.forEach((L, i) => { L.color.copy(tmp); L.intensity = lerp(7, 9, dig) * (0.85 + 0.15 * Math.sin(i * 2.1)); });
    lamps.forEach((l) => l.material.color.copy(tmp).lerp(new THREE.Color(1, 1, 1), 0.4));
    shafts.forEach((s) => { s.material.color.copy(tmp); s.material.opacity = 0.07 + 0.04 * dig; s.rotation.y = Math.atan2(camera.position.x - s.position.x, camera.position.z - s.position.z); });
    scene.fog.color.setRGB(lerp(0.004, 0.002, dig), lerp(0.005, 0.007, dig), lerp(0.009, 0.02, dig));
    scene.background.copy(scene.fog.color);
    boxMat.color.setRGB(lerp(1, 0.55, dig), lerp(1, 0.68, dig), lerp(1, 0.95, dig));
    grid.material.uniforms.uOpacity.value = 0.22 * smooth(range(t, 5.5, 9));

    // Câmera: travelling lento pelo corredor
    const k = easeInOutSine(range(t, -0.5, 10.5));
    camera.position.set(Math.sin(t * 0.35) * 0.18 + 0.25, lerp(1.45, 1.75, k), lerp(5.6, -0.4, k));
    camera.lookAt(lerp(-0.2, 0, k), lerp(1.55, 2.25, k), camera.position.z - 6);
    camera.rotation.z += Math.sin(t * 0.5) * 0.006;

    // Poeira
    const da = dust.geometry.attributes;
    for (let i = 0; i < DUST; i++) { const s = dseed[i];
      da.position.setXYZ(i, s[0] + Math.sin(t * 0.2 * s[4] + s[3]) * 0.2, (s[1] + t * 0.05 * s[4]) % 3.6, s[2] + Math.cos(t * 0.15 + s[3]) * 0.2);
      da.aAlpha.setX(i, 0.35 * (1 - dig * 0.6)); }
    da.position.needsUpdate = da.aAlpha.needsUpdate = true;

    // Papéis
    const pa = ppts.geometry.attributes;
    papers.forEach((p, i) => {
      const mtx = paperPose(p, t); p.mesh.matrix.copy(mtx); p.mesh.matrixAutoUpdate = false; p.mesh.matrixWorldNeedsUpdate = true;
      const prog = range(t, p.td, p.td + 1.3);
      p.mat.uniforms.uProg.value = prog; p.mesh.visible = prog < 1;
      p.mat.uniforms.uTint.value.copy(tmp).lerp(new THREE.Color(1, 1, 1), 0.55).multiplyScalar(0.95);
      const mD = paperPose(p, Math.min(t, p.td + 0.6));
      for (let j = 0; j < PPP; j++) {
        const idx = i * PPP + j, s = pseed[idx];
        const birth = p.td + s[2] * 1.2, age = t - birth;
        if (age < 0) { pa.aAlpha.setX(idx, 0); continue; }
        V.set(s[0] * PW, s[1] * PH, 0).applyMatrix4(mD);
        const a = easeOutCubic(age / 3.5);
        V.x += (s[3] - 0.5) * 1.2 * a + Math.sin(age * 1.5 + s[4] * 6) * 0.05;
        V.y += (0.4 + s[4] * 1.6) * a;
        V.z += -(0.6 + s[5] * 2.5) * a;
        pa.position.setXYZ(idx, V.x, V.y, V.z);
        pa.aAlpha.setX(idx, smooth(age / 0.25) * (1 - smooth(range(age, 3.4, 5.4))) * 1.2);
        const c = smooth(age / 0.8); pa.aColor.setXYZ(idx, lerp(1.0, 0.45, c), lerp(0.9, 0.8, c), 1.0);
        pa.aSize.setX(idx, 0.6 + s[5] * 0.9);
      }
    });
    pa.position.needsUpdate = pa.aAlpha.needsUpdate = pa.aColor.needsUpdate = pa.aSize.needsUpdate = true;
  }
  return { scene, camera, update };
}
