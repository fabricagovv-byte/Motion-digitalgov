// CENA 6 — O futuro é digital: o arquivo do início renasce como arquitetura de luz organizada.
import * as THREE from 'three';
import { camPath, rng, lerp, range, smooth, easeOutCubic, easeInOutSine, easeInOutCubic } from '../core.js';
import { paperTexture } from '../textures.js';
import { makePoints, fadedGrid } from './common.js';

export function create(env) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x01030a);
  scene.fog = new THREE.FogExp2(0x01030a, 0.045);
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.05, 120);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 80), new THREE.MeshStandardMaterial({ color: 0x03060c, roughness: 0.15, metalness: 0.6, envMap: env.envMap, envMapIntensity: 0.3 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -30; scene.add(floor);
  const grid = fadedGrid(60, 60, 0.22); grid.position.set(0, 0.003, -18); scene.add(grid);

  // Estantes de luz (mesma métrica do arquivo da cena 1)
  const UNIT = 2.0, N = 18, SHELVES = [0.12, 0.8, 1.48, 2.16, 2.84];
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: true });
  const plank = new THREE.InstancedMesh(new THREE.BoxGeometry(0.6, 0.012, UNIT - 0.05), glowMat, N * 2 * SHELVES.length);
  const post = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 3.0, 0.012), glowMat, N * 2 * 4);
  const M = new THREE.Matrix4(), C = new THREE.Color();
  let a = 0, b = 0; const meta = [];
  for (const side of [-1, 1]) for (let u = 0; u < N; u++) { const zc = 4 - u * UNIT - UNIT / 2, xc = side * 2.25;
    for (const y of SHELVES) { M.makeTranslation(xc, y, zc); plank.setMatrixAt(a, M); plank.setColorAt(a, C.setRGB(0.06, 0.2, 0.55)); meta.push(zc); a++; }
    for (const dx of [-0.29, 0.29]) for (const dz of [-1, 1]) { M.makeTranslation(xc + dx, 1.5, zc + dz * (UNIT / 2 - 0.03)); post.setMatrixAt(b, M); post.setColorAt(b, C.setRGB(0.05, 0.18, 0.5)); b++; } }
  scene.add(plank, post);

  // Documentos como cartões luminosos em ordem
  const R = rng(17);
  const docTex = paperTexture(901, true);
  const items = [];
  for (const side of [-1, 1]) for (let u = 0; u < N; u++) for (let s = 0; s < SHELVES.length; s++) { const zc = 4 - u * UNIT - UNIT / 2;
    for (let k = 0; k < 5; k++) items.push({ x: side * 2.18, y: SHELVES[s] + 0.3, z: zc - 0.72 + k * 0.36, side, d: R() }); }
  const docs = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.3, 0.42), new THREE.MeshBasicMaterial({ map: docTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), items.length);
  scene.add(docs);

  // Núcleo de luz ao fundo + fluxos de dados
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: env.dot, color: new THREE.Color(0.6, 1.2, 2.5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  core.position.set(0, 1.6, -34); scene.add(core);
  const NS = 900, streams = makePoints(NS, env.dot, { size: 0.05, color: 0x8fd3ff });
  const ss = []; for (let i = 0; i < NS; i++) ss.push([Math.floor(R() * 7) - 3, R(), R(), R()]); scene.add(streams);

  const Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), E = new THREE.Euler();
  function update(t) {
    // Estantes "acendem" em onda a partir da câmera
    const wave = t * 9 - 4;
    for (let i = 0; i < a; i++) { const d = 4 - meta[i]; const k = smooth(range(wave - d, 0, 3)); plank.setColorAt(i, C.setRGB(0.06 * k, 0.2 * k, 0.55 * k)); }
    plank.instanceColor.needsUpdate = true;
    items.forEach((it, i) => { const d = 4 - it.z; const k = easeOutCubic(range(wave - d - it.d * 1.5, 0, 2));
      P.set(it.x - it.side * (1 - k) * 0.9, it.y + (1 - k) * 0.8, it.z); E.set(0, it.side * Math.PI / 2, (1 - k) * 0.6); Q.setFromEuler(E); S.setScalar(k);
      M.compose(P, Q, S); docs.setMatrixAt(i, M); });
    docs.instanceMatrix.needsUpdate = true;
    core.scale.setScalar(lerp(6, 16, smooth(range(t, 2, 6.5))));
    core.material.opacity = 0.6 + 0.4 * smooth(range(t, 2.5, 6.5));
    const pa = streams.geometry.attributes;
    for (let i = 0; i < NS; i++) { const s = ss[i]; const z = 6 - ((s[1] * 40 + t * (6 + s[2] * 6)) % 40);
      pa.position.setXYZ(i, s[0] * 0.28 + (s[3] - 0.5) * 0.05, 0.02 + s[3] * 0.02, z); pa.aAlpha.setX(i, 0.7 * smooth(range(t, 0.2, 1.2))); }
    pa.position.needsUpdate = pa.aAlpha.needsUpdate = true;
    camPath(camera, t, [
      { t: -0.6, p: [0.6, 2.4, 7.0], l: [0, 1.7, -6] },
      { t: 3.2, p: [0.2, 1.8, -2.0], l: [0, 1.65, -14] },
      { t: 6.8, p: [0, 1.65, -14.0], l: [0, 1.6, -34] },
    ], (x) => x);
  }
  return { scene, camera, update };
}
