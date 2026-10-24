// Exporta o carrossel "Quem é a V4" (panorama 10800×1350 cortado em 10 slides de 1080×1350).
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const PORT = process.env.PORT || 8850, OUT = '../../deliverables/carrossel_v4'; mkdirSync(OUT, { recursive: true });
const N = ['01_capa', '02_quem_somos', '03_proposito', '04_o_que_fazemos', '05_ia_v47', '06_ia_de_obras', '07_os_6_sistemas', '08_para_quem', '09_como_trabalhamos', '10_contato'];
const b = await pw.chromium.launch(); const p = await b.newPage({ viewport: { width: 10800, height: 1350 } });
await p.goto(`http://127.0.0.1:${PORT}/carrossel_v4/carrossel.html`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/V4_Quem_Somos_panorama.png` });
for (let i = 0; i < 10; i++) { await p.screenshot({ path: `${OUT}/V4_Quem_Somos_${N[i]}.png`, clip: { x: i * 1080, y: 0, width: 1080, height: 1350 } }); console.log(N[i]); }
await b.close();
