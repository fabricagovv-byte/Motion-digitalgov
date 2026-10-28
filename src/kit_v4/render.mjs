// Kit de identidade V4 Tecnologia Brasil: uma imagem 1080×1350 por peça + papel timbrado A4 (PDF e PNG).
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const PORT = process.env.PORT || 8860, OUT = '../../deliverables/kit_v4'; mkdirSync(OUT, { recursive: true });
const b = await pw.chromium.launch();
const I = [['composicao', '0_Composicao_geral'], ['timbrado', '1_Papel_timbrado'], ['computador', '2_Computador_sistema'], ['uniforme', '3_Uniforme'], ['caneta', '4_Caneta'], ['cartao', '5_Cartao_de_visita'], ['pessoa', '6_Pessoa_uniforme']];
for (const [k, n] of I) { const p = await b.newPage({ viewport: { width: 1080, height: 1350 } }); await p.goto(`http://127.0.0.1:${PORT}/kit_v4/kit.html?i=${k}`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/V4_Kit_${n}.png` }); await p.close(); console.log(n); }
for (const v of ['preto', 'claro']) { const p = await b.newPage({ viewport: { width: 794, height: 1123 } }); await p.goto(`http://127.0.0.1:${PORT}/kit_v4/timbrado_a4.html?${v}`); await p.waitForFunction(() => window.ready);
  await p.pdf({ path: `${OUT}/V4_Papel_timbrado_A4_${v}.pdf`, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await p.setViewportSize({ width: 2480, height: 3508 }); await p.evaluate(() => document.body.style.zoom = 2480 / 794); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/V4_Papel_timbrado_A4_${v}.png` }); await p.close(); }
await b.close();
