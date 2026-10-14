// Cenário contínuo: central de tratamento documental (preparação, digitalização, indexação e arquivo).
// Todas as cenas internas usam este mesmo ambiente para dar sensação de filmagem contínua.
import * as THREE from 'three';
import { rng, roundRect } from '../core.js';
import { canvasTex } from '../textures.js';
import { MAT, box, cyl, group, desk, chair, monitor, keyboard, laptop, phone, poseSit as _ps, shelfUnit, archiveBox, cart, paperStack, folder, productionScanner, person, poseSit, poseStand, plant, sheet } from './kit.js';
import { docTexture, screenTexture } from './docs.js';

export const SCR = { W: 1600, H: 1000 };

function windowView() {
  return canvasTex(1024, 640, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#bcd6ef'); sky.addColorStop(0.6, '#e8f1f8'); sky.addColorStop(1, '#f4f6f2'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    const R = rng(4); g.fillStyle = 'rgba(160,180,170,.55)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(R() * w, h * 0.78 + R() * 60, 60 + R() * 90, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(205,210,214,.9)'; for (let i = 0; i < 6; i++) { const x = i * 190 + R() * 40; g.fillRect(x, h * 0.45 + R() * 80, 120 + R() * 60, h); }
  });
}
function signTex(t1, t2) {
  return canvasTex(1024, 256, (g, w, h) => { g.fillStyle = '#16325c'; roundRect(g, 0, 0, w, h, 18); g.fill(); g.fillStyle = '#fff'; g.font = '600 74px "Inter Display", "Inter"'; g.textBaseline = 'middle'; g.fillText(t1, 60, 100);
    g.fillStyle = '#9fc2ee'; g.font = '400 42px "Inter"'; g.fillText(t2, 62, 182); });
}

export function buildRoom(env, { cartStart = true } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfe2e6);
  scene.environment = env.envMap; scene.environmentIntensity = 0.35;
  scene.fog = new THREE.Fog(0xdfe2e6, 14, 30);

  // Arquitetura
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), MAT.floor); fl.rotation.x = -Math.PI / 2; fl.position.z = 1; fl.receiveShadow = true; scene.add(fl);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2), MAT.wall); back.position.set(0, 1.6, -4.3); back.receiveShadow = true; scene.add(back);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), MAT.wall); right.position.set(6.2, 1.6, 1); right.rotation.y = -Math.PI / 2; right.receiveShadow = true; scene.add(right);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2), MAT.wall); front.position.set(0, 1.6, 7.5); front.rotation.y = Math.PI; scene.add(front);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), MAT.ceiling); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.2, 1); scene.add(ceil);
  // parede esquerda com janelas
  const wv = windowView(); const winMat = new THREE.MeshBasicMaterial({ map: wv, toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.15) });
  for (let i = 0; i < 4; i++) { const z = -2.8 + i * 2.4;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.7), winMat); win.position.set(-6.2, 1.75, z); win.rotation.y = Math.PI / 2; scene.add(win);
    for (const dz of [-0.92, 0.92]) scene.add(box(0.12, 1.84, 0.06, MAT.graphite, -6.17, 1.75, z + dz, 0));
    for (const dy of [-0.88, 0.88]) scene.add(box(0.12, 0.06, 1.9, MAT.graphite, -6.17, 1.75 + dy, z, 0));
    scene.add(box(0.12, 0.04, 1.8, MAT.graphite, -6.17, 1.75, z, 0));
    const wl = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 3.2), MAT.wall); }
  const lw = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), MAT.wall); lw.position.set(-6.25, 1.6, 1); lw.rotation.y = Math.PI / 2; scene.add(lw);
  // rodapé e faixa de cor institucional na parede do fundo
  scene.add(box(16, 0.1, 0.02, MAT.graphite, 0, 0.05, -4.29, 0));
  const accent = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), MAT.wallAccent); accent.position.set(4.0, 1.6, -4.28); scene.add(accent);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshStandardMaterial({ map: signTex('Tratamento Documental', 'Preparação · Digitalização · Indexação'), roughness: 0.5 }));
  sign.position.set(4.0, 2.35, -4.26); scene.add(sign);

  // Iluminação: luz do dia pelas janelas + luminárias lineares
  scene.add(new THREE.HemisphereLight(0xf2f5fa, 0x8a8478, 1.05));
  const sun = new THREE.DirectionalLight(0xfff1df, 2.3); sun.position.set(-9, 6.5, 2.5); sun.target.position.set(0, 0, 0.5);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 1, far: 25 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 5;
  scene.add(sun, sun.target);
  const fixMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.55), toneMapped: false });
  for (const x of [-3, 0, 3]) for (const z of [-2, 1, 4]) { scene.add(box(0.12, 0.03, 1.6, MAT.white, x, 3.17, z, 0)); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 1.5), fixMat); f.rotation.x = Math.PI / 2; f.position.set(x, 3.15, z); scene.add(f); }
  for (const [x, z] of [[-2.5, -0.5], [1.5, -0.8], [0.5, 2.6], [3.5, 2.5]]) { const L = new THREE.PointLight(0xfff6ea, 2.2, 7, 1.6); L.position.set(x, 2.9, z); scene.add(L); }

  // Estantes de arquivo (fundo)
  for (let i = 0; i < 6; i++) { const s = shelfUnit(1.0, 5, { seed: 3 + i, prefix: ['ADM', 'ADM', 'RH', 'FIN', 'PROT', 'JUR'][i], year0: 2012 + i }); s.position.set(-5.3 + i * 1.05, 0, -3.95); scene.add(s); }
  scene.add(plant(5.6, -3.7, 1.2), plant(-5.6, 6.5, 1.1));

  // --- Estação 1: preparação (mesa longa)
  const prep = new THREE.Group(); prep.position.set(-2.2, 0, -0.5); scene.add(prep);
  prep.add(desk(2.4, 0.95, MAT.white));
  const T = 0.75;
  const openBox = archiveBox({ code: 'ADM-139', title: 'Processos', year: '2023' }, { seed: 900 }); openBox.rotation.y = Math.PI / 2; openBox.position.set(-0.85, T, -0.15); prep.add(openBox);
  const inStack = paperStack(60, docTexture(3, { res: 512, aged: 0.5 }), { seed: 5 }); inStack.position.set(-0.35, T, 0.05); prep.add(inStack);
  const batch = paperStack(10, docTexture(0, { res: 512, aged: 0.2 }), { seed: 6 }); batch.position.set(0.32, T, 0.05); prep.add(batch);
  const tray = box(0.3, 0.03, 0.38, MAT.graphite, 0.32, T + 0.015, 0.05, 0.006); tray.visible = false; prep.add(tray);
  const sep = box(0.22, 0.002, 0.31, MAT.blueFolder, 0.32, T + 0.004, 0.05, 0); prep.add(sep);
  const done = paperStack(80, docTexture(1, { res: 512, aged: 0.2 }), { seed: 7 }); done.position.set(0.85, T, -0.15); prep.add(done);
  const doneSep = box(0.235, 0.004, 0.32, MAT.greenFolder, 0.85, T + 0.05, -0.15, 0); prep.add(doneSep);
  const stapleTray = box(0.12, 0.02, 0.08, MAT.steel, -0.05, T + 0.01, -0.3, 0.004); prep.add(stapleTray);
  const remover = box(0.06, 0.015, 0.03, MAT.black, 0.06, T + 0.008, -0.32, 0.005); prep.add(remover);
  const f1 = folder(MAT.blueFolder); f1.position.set(-0.4, T, -0.33); f1.rotation.y = 0.15; prep.add(f1);
  const f2 = folder(MAT.greenFolder); f2.position.set(-0.38, T + 0.012, -0.34); f2.rotation.y = 0.05; prep.add(f2);
  const prepper = person({ shirt: MAT.shirtBlue, vest: MAT.vest }); poseStand(prepper); prepper.position.set(-0.1, 0, 0.62); prepper.rotation.y = Math.PI; prep.add(prepper);

  // --- Estação 2: digitalização
  const scanSt = new THREE.Group(); scanSt.position.set(1.15, 0, -1.25); scene.add(scanSt);
  scanSt.add(desk(1.9, 0.85, MAT.white));
  const scanner = productionScanner(); scanner.position.set(-0.35, T, 0.0); scanSt.add(scanner);
  const capTex = screenTexture(SCR.W, SCR.H); const capMon = monitor(capTex, 0.6); capMon.position.set(0.5, T, -0.15); capMon.rotation.y = -0.35; scanSt.add(capMon);
  const kb2 = keyboard(); kb2.position.set(0.45, T, 0.18); kb2.rotation.y = -0.2; scanSt.add(kb2);
  const scanIn = paperStack(14, docTexture(1, { res: 512, aged: 0.2 }), { seed: 8 }); scanSt.add(scanIn);
  const scanOut = paperStack(4, docTexture(0, { res: 512, aged: 0.2 }), { seed: 9 }); scanSt.add(scanOut);
  const scanOp = person({ shirt: MAT.shirt, vest: MAT.vest }); poseStand(scanOp); scanOp.position.set(-0.15, 0, 0.75); scanOp.rotation.y = Math.PI + 0.15; scanSt.add(scanOp);
  // folhas em trânsito no alimentador
  const flying = []; for (let i = 0; i < 6; i++) { const sh = sheet(docTexture(i % 5, { res: 512, aged: 0.2 })); sh.visible = false; scanSt.add(sh); flying.push(sh); }

  // --- Estação 3: indexação (duas mesas, operadores de costas p/ a câmera)
  const idx = new THREE.Group(); idx.position.set(0.4, 0, 2.4); scene.add(idx);
  const idxTex = screenTexture(SCR.W, SCR.H), idxTex2 = screenTexture(SCR.W, SCR.H);
  const people = [];
  [[-1.0, idxTex], [1.0, idxTex2]].forEach(([dx, tex], k) => {
    const d = desk(1.6, 0.8, MAT.oak); d.position.set(dx, 0, 0); idx.add(d);
    const m = monitor(tex, 0.62); m.position.set(dx + 0.05, T, -0.2); idx.add(m);
    const kb = keyboard(); kb.position.set(dx + 0.05, T, 0.12); idx.add(kb);
    const docs = paperStack(12, docTexture(k ? 2 : 0, { res: 512, aged: 0.2 }), { seed: 20 + k }); docs.position.set(dx - 0.55, T, 0.02); docs.rotation.y = 0.2; idx.add(docs);
    const ch = chair(); ch.position.set(dx + 0.05, 0, 0.72); ch.rotation.y = Math.PI; idx.add(ch);
    const p = person({ shirt: k ? MAT.shirt : MAT.shirtBlue, vest: k ? MAT.vest : null }); poseSit(p); p.position.set(dx + 0.05, 0, 0.62); p.rotation.y = Math.PI; idx.add(p); people.push(p);
    const cup = cyl(0.04, 0.035, 0.1, MAT.white, dx + 0.6, T + 0.05, -0.05, 16); idx.add(cup);
  });

  // --- Carrinho com caixas (chega à preparação na cena 2)
  const crt = cart(); scene.add(crt);
  const cartBoxes = []; [[-0.2, -0.13], [0.2, -0.13], [-0.2, 0.13], [0.2, 0.13], [0, 0]].forEach(([x, z], i) => {
    const b = archiveBox({ code: `ADM-${139 + i}`, title: ['Processos', 'Contratos', 'Ofícios', 'Protocolos', 'Processos'][i], year: String(2018 + i) }, { seed: 950 + i, w: 0.36, h: 0.25, d: 0.14 });
    b.rotation.y = Math.PI / 2; b.position.set(x, 0.22 + (i === 4 ? 0.25 : 0), z); crt.add(b); cartBoxes.push(b); });
  const pusher = person({ shirt: MAT.shirtBlue, vest: MAT.vest }); poseStand(pusher); scene.add(pusher);

  // --- Mesa junto à janela: acesso pelo notebook e pelo celular (usuário autorizado)
  const lounge = new THREE.Group(); lounge.position.set(-3.7, 0, 3.9); scene.add(lounge);
  lounge.add(cyl(0.55, 0.55, 0.035, MAT.oak, 0, 0.74, 0, 48), cyl(0.04, 0.04, 0.72, MAT.graphite, 0, 0.37, 0), cyl(0.28, 0.3, 0.025, MAT.graphite, 0, 0.012, 0, 32));
  const lapTex = screenTexture(SCR.W, SCR.H); const lap = laptop(lapTex); lap.position.set(0.05, 0.758, -0.12); lap.rotation.y = 0.25; lounge.add(lap);
  const mobTex = screenTexture(540, 1140); const ph = phone(mobTex); scene.add(ph);
  const lch = chair(MAT.fabric); lch.position.set(0.0, 0, 0.55); lch.rotation.y = Math.PI + 0.2; lounge.add(lch);
  const mobUser = person({ shirt: MAT.shirt, pants: MAT.pants }); _ps(mobUser); mobUser.position.set(0.02, 0, 0.47); mobUser.rotation.y = Math.PI + 0.2; lounge.add(mobUser);
  const cup2 = cyl(0.04, 0.035, 0.1, MAT.white, -0.3, 0.8, 0.1, 16); lounge.add(cup2);
  return { scene, sun, lounge, lapTex, mobTex, phone: ph, mobUser, prep, prepper, inStack, batch, done, sep, scanSt, scanner, scanIn, scanOut, scanOp, flying, capTex, capMon, idx, idxTex, idxTex2, people, cart: crt, pusher, T };
}
