// CENA 2 — A transformação digital: scanner, OCR, indexação e organização automática.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { camPath, rng, lerp, range, smooth, smoother, easeOutCubic, easeInOutCubic, easeInOutSine, clamp, roundRect, FONT } from '../core.js';
import { paperTexture, chipTexture, labelTexture, canvasTex } from '../textures.js';
import { dissolveMaterial, makePoints, fadedGrid, texPlane } from './common.js';

export function create(env) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020409);
  scene.fog = new THREE.Fog(0x020409, 7, 18);
  scene.environment = env.envMap; scene.environmentIntensity = 0.35;
  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.05, 60);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x05080d, roughness: 0.28, metalness: 0.5 }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const grid = fadedGrid(22, 22, 0.18); grid.position.y = 0.002; scene.add(grid);

  // Scanner profissional (flatbed) — grafite com vidro e LED
  const body = new THREE.Mesh(new RoundedBoxGeometry(2.5, 0.34, 1.9, 5, 0.07), new THREE.MeshStandardMaterial({ color: 0x1a1e26, roughness: 0.35, metalness: 0.75 }));
  body.position.y = 0.17; scene.add(body);
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(2.36, 0.02, 1.62, 3, 0.01), new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: 0.2, metalness: 0.4 }));
  bezel.position.set(0, 0.345, 0.04); scene.add(bezel);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.42), new THREE.MeshStandardMaterial({ color: 0x0c1622, roughness: 0.06, metalness: 0.9, envMapIntensity: 1.2 }));
  glass.rotation.x = -Math.PI / 2; glass.position.set(0, 0.357, 0.04); scene.add(glass);
  const led = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.012, 0.01), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.4, 3.0) }));
  led.position.set(0, 0.2, 0.952); scene.add(led);

  // Folha de papel -> versão digital
  const ptex = paperTexture(77), dtex = paperTexture(77, true);
  const pmat = dissolveMaterial(ptex); pmat.uniforms.uMap2.value = dtex; pmat.transparent = false;
  const PW = 0.84, PH = 1.188;
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), pmat); scene.add(paper);

  // Barra de luz do scanner
  const barGeo = new THREE.BoxGeometry(0.03, 0.012, 1.36);
  const bar = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 3.2, 6.0) })); scene.add(bar);
  const barGlowTex = canvasTex(256, 64, (g, w, h) => { const r = g.createLinearGradient(0, 0, w, 0); r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(0.5, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const barGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.5), new THREE.MeshBasicMaterial({ map: barGlowTex, color: 0x3aa0ff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }));
  barGlow.rotation.x = -Math.PI / 2; scene.add(barGlow);
  const barLight = new THREE.PointLight(0x5ab8ff, 0, 2.5, 2); scene.add(barLight);

  // Holograma do documento digital + camada de OCR
  const holo = new THREE.Group(); scene.add(holo);
  const holoDoc = texPlane(dtex, PW * 1.3, PH * 1.3, { additive: true }); holo.add(holoDoc);
  const ocr = canvasTex(512, 704, () => {}); const ocrPlane = texPlane(ocr, PW * 1.3, PH * 1.3, { additive: true }); ocrPlane.position.z = 0.01; holo.add(ocrPlane);
  const regions = ptex.userData.regions;
  function drawOCR(p, scanY) {
    const g = ocr.userData.g; g.clearRect(0, 0, 512, 704);
    if (p <= 0) return;
    g.fillStyle = 'rgba(80,190,255,.9)'; g.fillRect(0, scanY * 704 - 2, 512, 3);
    const gr = g.createLinearGradient(0, scanY * 704 - 60, 0, scanY * 704); gr.addColorStop(0, 'rgba(60,160,255,0)'); gr.addColorStop(1, 'rgba(60,160,255,.25)');
    g.fillStyle = gr; g.fillRect(0, scanY * 704 - 60, 512, 60);
    regions.forEach(([x, y, w, h], i) => {
      const a = smooth(range(scanY * 704 - y, 0, 40));
      if (a <= 0) return;
      g.strokeStyle = `rgba(90,224,200,${0.95 * a})`; g.lineWidth = 2.5;
      const c = 10; // cantos estilo "detecção"
      g.beginPath(); g.moveTo(x, y + c); g.lineTo(x, y); g.lineTo(x + c, y); g.moveTo(x + w - c, y); g.lineTo(x + w, y); g.lineTo(x + w, y + c);
      g.moveTo(x + w, y + h - c); g.lineTo(x + w, y + h); g.lineTo(x + w - c, y + h); g.moveTo(x + c, y + h); g.lineTo(x, y + h); g.lineTo(x, y + h - c); g.stroke();
      g.fillStyle = `rgba(90,224,200,${0.08 * a})`; g.fillRect(x, y, w, h);
    });
    ocr.needsUpdate = true;
  }
  const ocrTag = texPlane(labelTexture('OCR · reconhecimento de caracteres', { size: 30, color: '#5be0c8', weight: 600, w: 720, h: 60 }), 1.2, 0.1, { additive: true });
  ocrTag.position.set(0, PH * 0.65 + 0.12, 0); holo.add(ocrTag);

  // Metadados (ilustrativos)
  const CHIPS = [['Tipo', 'Contrato', '#2fa8ff'], ['Nº', '2024-0187', '#2fa8ff'], ['Data', '12/03/2024', '#5be0c8'], ['Setor', 'Administrativo', '#5be0c8'], ['Índice', 'prestação · serviços', '#9fd0ff']];
  const chips = CHIPS.map(([a, b, c], i) => { const m = texPlane(chipTexture(a, b, c), 0.96, 0.18); scene.add(m); return m; });

  // Estrutura de pastas digitais
  const COLS = ['Contratos', 'Financeiro', 'Recursos Humanos', 'Protocolos'];
  const colLabels = COLS.map((c, i) => { const m = texPlane(labelTexture(c, { size: 50, color: '#cfe6ff', w: 640, h: 90 }), 1.35, 0.19); scene.add(m); return m; });
  const cardTex = [0, 1, 2, 3].map((i) => paperTexture(300 + i, true));
  const CARDS = 40, cards = [];
  const R = rng(9);
  for (let i = 0; i < CARDS; i++) { const col = i % 4, row = Math.floor(i / 4);
    const m = texPlane(cardTex[col], 0.42, 0.594, { additive: true }); scene.add(m);
    cards.push({ m, col, row, d: R() * 0.5, from: new THREE.Vector3((R() - 0.5) * 1.5, 1.4 + R() * 1.2, (R() - 0.5) * 1.2) }); }
  const colX = (c) => (c - 1.5) * 1.65;

  // Faíscas digitais
  const SP = 500, sparks = makePoints(SP, env.dot, { size: 0.025, color: 0x8fd3ff });
  const ss = []; for (let i = 0; i < SP; i++) ss.push([R(), R(), R(), R()]); scene.add(sparks);

  const key = new THREE.SpotLight(0xdce9ff, 30, 14, 0.5, 0.6, 1.5); key.position.set(-3, 5, 3); key.target.position.set(0, 0, 0); scene.add(key, key.target);
  const rim = new THREE.PointLight(0x2a7dff, 14, 9, 1.6); rim.position.set(2.8, 1.6, -2.4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0x405a80, 0x020304, 0.15));

  const V = new THREE.Vector3(), V2 = new THREE.Vector3();
  function update(t) {
    // Papel desce sobre o vidro
    const land = smoother(range(t, -0.6, 1.9));
    paper.position.set(lerp(-0.35, 0, land), lerp(1.6, 0.362, land), lerp(-0.4, 0.04, land));
    paper.rotation.set(lerp(-1.1, -Math.PI / 2, land), 0, lerp(0.5, Math.PI / 2, land) + Math.sin(t * 2) * 0.05 * (1 - land));
    // Barra de luz percorre o documento
    const sw = easeInOutSine(range(t, 2.0, 4.4));
    const bx = lerp(-0.66, 0.66, sw), onBar = smooth(range(t, 1.7, 2.1)) * (1 - smooth(range(t, 4.4, 4.9)));
    bar.position.set(bx, 0.37, 0.04); bar.visible = onBar > 0.01; bar.scale.set(1, 1, onBar);
    barGlow.position.set(bx, 0.366, 0.04); barGlow.material.opacity = 0.55 * onBar;
    barLight.position.set(bx, 0.6, 0.04); barLight.intensity = 3.5 * onBar;
    // papel girado 90°: a barra (eixo x) percorre o eixo v da textura
    pmat.uniforms.uDigital.value = sw > 0 ? sw * 1.001 : 0;
    pmat.uniforms.uTint.value.setScalar(lerp(0.85, 0.75, sw));
    led.material.color.setRGB(0.4 + onBar, 1.4 + onBar * 2, 3 + onBar * 2);

    // Holograma sobe
    const up = easeOutCubic(range(t, 4.3, 6.0));
    holo.visible = up > 0;
    holo.position.set(lerp(0, -0.55, up), lerp(0.4, 1.55, up), lerp(0.04, 0.0, up));
    holo.rotation.set(lerp(-Math.PI / 2, 0, up), lerp(0, 0.18, up), lerp(Math.PI / 2, 0, up));
    holo.scale.setScalar(lerp(0.77, 1, up));
    const fadeHolo = 1 - smooth(range(t, 7.6, 8.6));
    holoDoc.material.opacity = up * fadeHolo; ocrPlane.material.opacity = fadeHolo; ocrTag.material.opacity = smooth(range(t, 5.4, 5.9)) * fadeHolo;
    drawOCR(range(t, 5.2, 5.4), easeInOutSine(range(t, 5.3, 6.9)));

    // Metadados voam para fora
    chips.forEach((c, i) => {
      const a = easeOutCubic(range(t, 5.7 + i * 0.22, 6.6 + i * 0.22));
      const out = smooth(range(t, 7.5, 8.3));
      c.position.set(lerp(-0.4, 0.75, a) + out * 0.3, lerp(1.6, 2.25 - i * 0.24, a), lerp(0, 0.35, a));
      c.rotation.y = lerp(0.4, -0.12, a); c.material.opacity = a * (1 - out); c.visible = a > 0;
    });

    // Organização automática em pastas
    colLabels.forEach((l, i) => { const a = smooth(range(t, 6.9 + i * 0.12, 7.6 + i * 0.12)); l.position.set(colX(i), 2.75, -2.6); l.material.opacity = a; l.visible = a > 0; });
    cards.forEach((c) => {
      const t0 = 6.9 + c.row * 0.09 + c.col * 0.05 + c.d * 0.15;
      const a = easeInOutCubic(range(t, t0, t0 + 1.2));
      V.copy(c.from).add(V2.set(-0.55, 0.2, 0)); V2.set(colX(c.col) + c.row * 0.012, 1.55 - c.row * 0.012, -2.6 - c.row * 0.08);
      c.m.position.lerpVectors(V, V2, a); c.m.position.y += Math.sin(a * Math.PI) * 0.5;
      c.m.rotation.set(0, lerp(0.6, 0, a), lerp(0.3, 0, a));
      c.m.material.opacity = smooth(range(t, t0 - 0.1, t0 + 0.3)) * (0.35 + 0.65 * (c.row === 9 ? 1 : 0.5));
      c.m.visible = t > t0 - 0.1;
    });

    // Faíscas: rastro da barra e do holograma
    const sa = sparks.geometry.attributes;
    for (let i = 0; i < SP; i++) { const s = ss[i];
      const birth = 2.0 + s[0] * 5.5, age = t - birth;
      if (age < 0 || age > 2.2) { sa.aAlpha.setX(i, 0); continue; }
      const sx = birth < 4.4 ? lerp(-0.66, 0.66, easeInOutSine(range(birth, 2.0, 4.4))) : holo.position.x + (s[1] - 0.5);
      sa.position.setXYZ(i, sx + (s[2] - 0.5) * 0.2, 0.38 + age * (0.3 + s[3] * 0.6), (s[1] - 0.5) * 1.3 + Math.sin(age * 3 + s[2] * 9) * 0.05);
      sa.aAlpha.setX(i, (1 - age / 2.2) * 0.8); }
    sa.position.needsUpdate = sa.aAlpha.needsUpdate = true;

    // Câmera
    camPath(camera, t, [
      { t: -0.6, p: [1.7, 2.1, 2.3], l: [0, 0.3, 0.05] },
      { t: 4.2, p: [0.9, 1.5, 1.75], l: [0, 0.42, 0.05] },
      { t: 6.6, p: [0.75, 1.75, 5.0], l: [-0.1, 1.5, 0] },
      { t: 9.6, p: [0.3, 2.35, 6.6], l: [0, 1.7, -1.4] },
    ], easeInOutSine);
  }
  return { scene, camera, update };
}
