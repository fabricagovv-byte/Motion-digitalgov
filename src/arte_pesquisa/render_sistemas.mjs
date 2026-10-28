import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs'; const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const OUT = '../../deliverables/arte_pesquisa'; mkdirSync(OUT, { recursive: true }); const b = await pw.chromium.launch();
const K = [['pesquisa', '1_Pesquisa'], ['saude', '2_Saude'], ['juridico', '3_Juridico'], ['aprendizagem', '4_Aprendizagem'], ['obras', '5_Obras'], ['engenheiro', '6_Engenheiro_7_3']];
for (const [k, n] of K) { const p = await b.newPage({ viewport: { width: 1080, height: 1350 } }); await p.goto(`http://127.0.0.1:${process.env.PORT || 8860}/arte_pesquisa/sistemas.html?s=${k}`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(300); await p.screenshot({ path: `${OUT}/V47_Arte_${n}.png` }); await p.close(); }
await b.close();
