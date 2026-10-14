// CENA 3 — O GED em ação: interface demonstrativa (pesquisa, pastas, indexação, visualização, histórico, fluxo, acesso).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { camPath, rng, lerp, range, smooth, easeOutCubic, easeInOutSine, easeInOutCubic } from '../core.js';
import { canvasTex, drawGedUI, drawCard, UI_W, UI_H } from '../textures.js';
import { makePoints, texPlane } from './common.js';

export function create(env) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030712);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.05, 80);

  // Fundo: gradiente radial azul profundo
  const bgTex = canvasTex(1024, 1024, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, '#0a2148'); r.addColorStop(0.45, '#050f24'); r.addColorStop(1, '#01040b'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ map: bgTex })); bg.position.z = -12; scene.add(bg);

  const W = 4.8, H = 3.0;
  const ui = canvasTex(UI_W, UI_H, () => {}); ui.anisotropy = 16;
  const panel = new THREE.Group(); scene.add(panel);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: ui, transparent: true, color: new THREE.Color(0.86, 0.86, 0.86) })); screen.position.z = 0.031; panel.add(screen);
  const frame = new THREE.Mesh(new RoundedBoxGeometry(W + 0.08, H + 0.08, 0.06, 4, 0.04), new THREE.MeshStandardMaterial({ color: 0x0c1424, roughness: 0.25, metalness: 0.8, envMap: env.envMap, envMapIntensity: 0.6 }));
  panel.add(frame);
  const glowTex = canvasTex(512, 320, (g, w, h) => { const r = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.9, H * 1.9), new THREE.MeshBasicMaterial({ map: glowTex, color: 0x1f6fff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.position.z = -0.2; panel.add(glow);
  panel.rotation.y = -0.1;

  // Cartões flutuantes
  const CW = 1000, CH = 520;
  const cardDefs = [
    { title: 'Rastreabilidade', badge: 'Histórico', accent: '#2fa8ff', rows: [{ a: 'Documento visualizado', b: '09:41', dot: '#2fa8ff' }, { a: 'Nova versão anexada', b: '08:57', dot: '#2fa8ff' }, { a: 'Metadados atualizados', b: 'ontem', dot: '#5be0c8' }, { a: 'Fluxo aprovado', b: '14/03', dot: '#5be0c8' }],
      pos: [3.15, 0.95, 0.9] },
    { title: 'Permissões', badge: 'Por perfil', accent: '#5be0c8', rows: [{ a: 'Administrador', b: 'Total', bc: '#5be0c8' }, { a: 'Gestor', b: 'Aprovar · Editar', bc: '#9fd0ff' }, { a: 'Analista', b: 'Consultar · Editar', bc: '#9fd0ff' }, { a: 'Consulta', b: 'Somente leitura', bc: '#8ea6c8' }],
      pos: [3.35, -0.75, 1.35] },
  ];
  const cards = cardDefs.map((d) => { const tex = canvasTex(CW, CH, () => {}); const m = texPlane(tex, 1.9, 1.9 * CH / CW); scene.add(m); return { ...d, tex, m }; });

  // Bokeh / partículas de dados
  const R = rng(3), BK = 260, bokeh = makePoints(BK, env.dot, { size: 0.12, color: 0x3c8dff });
  const bs = []; for (let i = 0; i < BK; i++) bs.push([(R() - 0.5) * 22, (R() - 0.5) * 12, -2 - R() * 9, R() * 6.28, 0.3 + R()]); scene.add(bokeh);

  function update(t) {
    drawGedUI(ui.userData.g, { type: range(t, 0.5, 2.5), blink: t, results: range(t, 2.6, 4.0), select: smooth(range(t, 3.9, 4.5)), flow: easeInOutCubic(range(t, 5.4, 7.6)) });
    ui.needsUpdate = true;
    panel.position.y = Math.sin(t * 0.6) * 0.02;

    cards.forEach((c, i) => {
      const a = easeOutCubic(range(t, 6.8 + i * 0.35, 7.9 + i * 0.35));
      drawCard(c.tex.userData.g, CW, CH, { title: c.title, rows: c.rows, accent: c.accent, badge: c.badge, reveal: range(t, 7.0 + i * 0.35, 8.6 + i * 0.35) }); c.tex.needsUpdate = true;
      c.m.position.set(c.pos[0] + (1 - a) * 0.8, c.pos[1] + Math.sin(t * 0.8 + i) * 0.03, c.pos[2]);
      c.m.rotation.y = lerp(-0.6, -0.28, a); c.m.material.opacity = a; c.m.visible = a > 0;
    });

    const ba = bokeh.geometry.attributes;
    for (let i = 0; i < BK; i++) { const s = bs[i]; ba.position.setXYZ(i, s[0] + Math.sin(t * 0.1 + s[3]) * 0.4, s[1] + t * 0.05 * s[4], s[2]); ba.aAlpha.setX(i, 0.18 * s[4]); ba.aSize.setX(i, s[4]); }
    ba.position.needsUpdate = ba.aAlpha.needsUpdate = ba.aSize.needsUpdate = true;

    const X = (x) => (x / UI_W - 0.5) * W, Y = (y) => (0.5 - y / UI_H) * H;
    camPath(camera, t, [
      { t: -0.6, p: [X(1300), Y(260), 2.3], l: [X(1450), Y(200), 0] },
      { t: 2.3, p: [X(1280), Y(250), 1.85], l: [X(1420), Y(190), 0] },
      { t: 3.6, p: [X(700), Y(420), 2.1], l: [X(950), Y(450), 0] },
      { t: 5.0, p: [X(1700), Y(450), 2.2], l: [X(1950), Y(480), 0] },
      { t: 6.6, p: [X(1500), Y(1150), 2.6], l: [X(1450), Y(1180), 0] },
      { t: 9.0, p: [-0.4, -0.7, 6.6], l: [0.35, 0.45, 0] },
      { t: 11.4, p: [-0.6, -0.75, 7.3], l: [0.4, 0.5, 0] },
    ], easeInOutSine);
  }
  return { scene, camera, update };
}
