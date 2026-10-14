// CENA 4 — Acesso de qualquer lugar do mundo: globo 3D, conexões e ambientes de trabalho.
import * as THREE from 'three';
import { feature } from '/node_modules/topojson-client/src/index.js';
import { camPath, rng, lerp, range, smooth, easeOutCubic, easeInOutSine, easeInOutCubic, clamp } from '../core.js';
import { canvasTex, labelTexture } from '../textures.js';
import { makePoints, texPlane } from './common.js';
import { office, publicOffice, homeOffice, travel } from './s4_dioramas.js';

const RAD = 2.0;
function ll(lat, lon, r = RAD) { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return new THREE.Vector3(r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b)); }

export async function create(env) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x01030a);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.05, 200);

  // Estrelas discretas
  const R = rng(21), ST = 1400, stars = makePoints(ST, env.dot, { size: 0.5, color: 0xaecbff });
  const sa = stars.geometry.attributes; stars.material.uniforms.uSize.value = 0.9;
  for (let i = 0; i < ST; i++) { const v = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(60 + R() * 30); sa.position.setXYZ(i, v.x, v.y, v.z); sa.aAlpha.setX(i, 0.15 + R() * 0.45); sa.aSize.setX(i, 0.5 + R()); }
  scene.add(stars);

  const globe = new THREE.Group(); scene.add(globe);
  // Esfera com brilho de borda (fresnel)
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(RAD, 96, 64), new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(0x041027) }, uRim: { value: new THREE.Color(0x1a6dff) } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uCol, uRim; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - max(dot(vN, vV), 0.), 2.6); gl_FragColor = vec4(uCol + uRim*f*0.9, 1.); }`,
  }));
  globe.add(sphere);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(RAD * 1.16, 64, 48), new THREE.ShaderMaterial({
    uniforms: { uRim: { value: new THREE.Color(0x2a7dff) } }, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uRim; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(max(dot(vN, vV), 0.)*1.15, 5.0); gl_FragColor = vec4(uRim*f*0.8, f); }`,
  }));
  scene.add(atmo);

  // Continentes em pontos (máscara a partir do world-atlas)
  const topo = await (await fetch('/node_modules/world-atlas/land-50m.json')).json();
  const land = feature(topo, topo.objects.land);
  const MW = 2048, MH = 1024;
  const mask = document.createElement('canvas'); mask.width = MW; mask.height = MH; const mg = mask.getContext('2d');
  mg.fillStyle = '#000'; mg.fillRect(0, 0, MW, MH); mg.fillStyle = '#fff';
  for (const f of land.features) { const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) { mg.beginPath(); for (const ring of poly) ring.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * MW, y = (90 - la) / 180 * MH; i ? mg.lineTo(x, y) : mg.moveTo(x, y); }); mg.fill('evenodd'); } }
  const md = mg.getImageData(0, 0, MW, MH).data;
  const N = 60000, pts = [];
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
    const x = Math.cos(th) * r, z = Math.sin(th) * r; const lat = Math.asin(y) * 180 / Math.PI, lon = Math.atan2(x, z) * 180 / Math.PI;
    const px = Math.floor((lon + 180) / 360 * MW) % MW, py = Math.min(MH - 1, Math.floor((90 - lat) / 180 * MH));
    if (md[(py * MW + px) * 4] > 128) pts.push(ll(lat, lon, RAD * 1.002)); }
  window.__landDots = pts.length;
  const dots = makePoints(pts.length, env.dot, { size: 0.062, color: 0x7cc0ff });
  const da = dots.geometry.attributes; const dseed = [];
  pts.forEach((v, i) => { da.position.setXYZ(i, v.x, v.y, v.z); da.aAlpha.setX(i, 0.85); dseed.push(R()); });
  globe.add(dots);

  // Cidades e arcos (Brasil como origem)
  const CITIES = { bsb: [-15.8, -47.9], sp: [-23.5, -46.6], mao: [-3.1, -60.0], rec: [-8.05, -34.9], poa: [-30.0, -51.2], lis: [38.7, -9.1], ny: [40.7, -74.0], lon: [51.5, -0.1], tok: [35.7, 139.7], jnb: [-26.2, 28.0], syd: [-33.9, 151.2], mex: [19.4, -99.1], dxb: [25.2, 55.3], bue: [-34.6, -58.4], par: [48.9, 2.35], mia: [25.8, -80.2], scl: [-33.4, -70.6] };
  const ARCS = [['bsb', 'sp'], ['bsb', 'mao'], ['bsb', 'rec'], ['sp', 'poa'], ['bsb', 'lis'], ['sp', 'ny'], ['bsb', 'mex'], ['sp', 'bue'], ['bsb', 'lon'], ['sp', 'jnb'], ['lis', 'par'], ['ny', 'lon'], ['lon', 'dxb'], ['dxb', 'tok'], ['jnb', 'syd'], ['bsb', 'mia'], ['bue', 'scl'], ['tok', 'syd']];
  const arcMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 0.8, 1.6), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const arcs = ARCS.map(([a, b], i) => {
    const A = ll(...CITIES[a]), B = ll(...CITIES[b]); const ang = A.angleTo(B); const pts = [];
    for (let k = 0; k <= 64; k++) { const s = k / 64; const v = new THREE.Vector3().copy(A).normalize().lerp(B.clone().normalize(), s).normalize();
      pts.push(v.multiplyScalar(RAD * (1.004 + Math.sin(Math.PI * s) * (0.04 + ang * 0.1)))); }
    const curve = new THREE.CatmullRomCurve3(pts); const geo = new THREE.TubeGeometry(curve, 96, 0.0065, 6, false);
    const m = new THREE.Mesh(geo, arcMat); globe.add(m);
    return { m, curve, count: geo.index.count, t0: 0.4 + i * 0.22 };
  });
  const pulseMat = new THREE.SpriteMaterial({ map: env.dot, color: 0xbfe6ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const pulses = ARCS.flatMap(() => [0, 1].map(() => { const sp = new THREE.Sprite(pulseMat.clone()); sp.scale.setScalar(0.09); globe.add(sp); return sp; }));
  const cityPts = makePoints(Object.keys(CITIES).length, env.dot, { size: 0.16, color: 0x8fd3ff }); globe.add(cityPts);
  Object.values(CITIES).forEach((c, i) => { const v = ll(...c, RAD * 1.006); cityPts.geometry.attributes.position.setXYZ(i, v.x, v.y, v.z); });
  const ringTex = canvasTex(256, 256, (g) => { g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 100, 0, 7); g.stroke(); });
  const hubRing = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: ringTex, color: 0x5ab8ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  const hubPos = ll(...CITIES.bsb, RAD * 1.01); hubRing.position.copy(hubPos); hubRing.lookAt(hubPos.clone().multiplyScalar(2)); globe.add(hubRing);

  // Ambientes (render targets exibidos em cartões de vidro)
  const DPR = env.renderer.getPixelRatio();
  const envs = [
    { d: office(), label: 'Escritório', ang: -0.95, y: 0.95 },
    { d: publicOffice(), label: 'Setor público', ang: -0.32, y: -0.85 },
    { d: homeOffice(), label: 'Home office', ang: 0.32, y: 0.95 },
    { d: travel(), label: 'Em viagem', ang: 0.95, y: -0.85 },
  ];
  const CW = 2.4, CH = 1.35;
  envs.forEach((e, i) => {
    e.rt = new THREE.WebGLRenderTarget(Math.round(1280 * Math.min(DPR, 1.6)), Math.round(720 * Math.min(DPR, 1.6)), { samples: DPR >= 2 ? 2 : 4, type: THREE.HalfFloatType });
    e.rt.texture.colorSpace = THREE.LinearSRGBColorSpace;
    const g = new THREE.Group();
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshBasicMaterial({ map: e.rt.texture, transparent: true })); g.add(pic);
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(CW + 0.05, CH + 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.7, 1.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); fr.position.z = -0.005; g.add(fr);
    const lab = texPlane(labelTexture(e.label, { size: 52, color: '#e6f3ff', w: 720, h: 100 }), 1.3, 0.18); lab.position.set(-CW / 2 + 0.7, -CH / 2 - 0.17, 0); g.add(lab);
    const dist = 4.3; g.position.set(Math.sin(e.ang) * dist, e.y, Math.cos(e.ang) * dist - 0.4); g.lookAt(Math.sin(e.ang) * 20, e.y * 1.2, Math.cos(e.ang) * 20);
    e.g = g; e.pic = pic; e.fr = fr; e.lab = lab; scene.add(g);
    e.normal = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion);
  });
  // Linhas de conexão cartão -> globo
  const linkMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.25, 0.6, 1.2), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
  envs.forEach((e) => { const a = e.g.position.clone(), b = e.g.position.clone().normalize().multiplyScalar(RAD * 1.05);
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 0.25, 0)); const geo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 40, 0.006, 6, false);
    e.link = new THREE.Mesh(geo, linkMat.clone()); e.linkCount = geo.index.count; scene.add(e.link); });

  const W = new THREE.Vector3(), V = new THREE.Vector3();
  function update(t) {
    globe.rotation.y = 0.84 + 0.12 - t * 0.022; globe.rotation.x = 0.2;
    atmo.position.copy(globe.position);
    for (let i = 0; i < pts.length; i += 1) da.aAlpha.setX(i, 0.55 + 0.4 * Math.sin(t * 1.5 + dseed[i] * 40));
    da.aAlpha.needsUpdate = true;
    arcs.forEach((a, i) => { const p = easeInOutCubic(range(t, a.t0, a.t0 + 1.4)); a.m.geometry.setDrawRange(0, Math.floor(a.count * p / 3) * 3); a.m.visible = p > 0;
      for (let k = 0; k < 2; k++) { const sp = pulses[i * 2 + k]; const u = ((t - a.t0 - 1.0) * 0.45 + k * 0.5) % 1;
        sp.visible = t > a.t0 + 1.0; if (!sp.visible) continue; a.curve.getPoint(u, sp.position); sp.material.opacity = Math.sin(Math.PI * u); } });
    const ca = cityPts.geometry.attributes; for (let i = 0; i < ca.count; i++) ca.aAlpha.setX(i, smooth(range(t, 0.3 + i * 0.1, 0.9 + i * 0.1)) * (0.7 + 0.3 * Math.sin(t * 3 + i))); ca.aAlpha.needsUpdate = true;
    const hp = (t * 0.8) % 1; hubRing.scale.setScalar(0.4 + hp * 1.6); hubRing.material.opacity = (1 - hp) * 0.9;

    // Cartões dos ambientes
    envs.forEach((e, i) => {
      const a = easeOutCubic(range(t, 2.2 + i * 0.25, 3.4 + i * 0.25)) * (1 - smooth(range(t, 9.3, 10.3)));
      e.g.visible = a > 0.001; e.g.scale.setScalar(lerp(0.6, 1, a));
      e.pic.material.opacity = a; e.fr.material.opacity = 0.55 * a; e.lab.material.opacity = a;
      const lp = easeInOutCubic(range(t, 2.6 + i * 0.25, 3.8 + i * 0.25)); e.link.geometry.setDrawRange(0, Math.floor(e.linkCount * lp / 3) * 3); e.link.visible = lp > 0 && a > 0.001; e.link.material.opacity = 0.6 * a;
      if (e.g.visible) { e.d.update(t); env.renderer.setRenderTarget(e.rt); env.renderer.clear(); env.renderer.render(e.d.scene, e.d.camera); }
    });

    // Câmera: aproxima no Brasil -> recua -> percorre ambientes -> plano aberto (herói)
    globe.updateMatrixWorld(); W.copy(hubPos).applyMatrix4(globe.matrixWorld);
    const hubN = W.clone().normalize();
    const visit = (e, d = 2.75) => ({ p: e.g.position.clone().addScaledVector(e.normal, d).toArray(), l: e.g.position.toArray() });
    const K = [
      { t: -0.6, p: hubN.clone().multiplyScalar(2.75).add(new THREE.Vector3(0.25, -0.2, 0)).toArray(), l: W.toArray() },
      { t: 0.6, p: hubN.clone().multiplyScalar(3.05).add(new THREE.Vector3(0.15, -0.1, 0)).toArray(), l: W.clone().multiplyScalar(0.9).toArray() },
      { t: 2.5, p: [0, 0.4, 9.6], l: [0, 0, 0] },
      { t: 4.0, ...visit(envs[0]) },
      { t: 5.6, ...visit(envs[1]) },
      { t: 7.2, ...visit(envs[2]) },
      { t: 8.8, ...visit(envs[3]) },
      { t: 11.0, p: [0, -0.5, 6.6], l: [0, 1.05, 0] },
      { t: 14.6, p: [0, -0.35, 7.3], l: [0, 1.1, 0] },
    ];
    camPath(camera, t, K, easeInOutSine);
  }
  return { scene, camera, update };
}
