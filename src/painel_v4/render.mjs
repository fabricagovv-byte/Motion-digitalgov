// Exporta o painel de entrada da V4: 6 posts 1080×1350 (grade 3×2) + a prévia do painel inteiro.
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const PORT = process.env.PORT || 8860, OUT = '../../deliverables/painel_v4'; mkdirSync(OUT, { recursive: true });
const N = ['1_sistemas_ia', '2_quem_somos', '3_nova_ia', '4_um_so_sistema', '5_ideal_para', '6_contato'];
const b = await pw.chromium.launch(); const p = await b.newPage({ viewport: { width: 3240, height: 2700 } });
await p.goto(`http://127.0.0.1:${PORT}/painel_v4/panel.html`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/V4_Painel_previa_completa.png` });
for (let i = 0; i < 6; i++) { const x = (i % 3) * 1080, y = Math.floor(i / 3) * 1350; await p.screenshot({ path: `${OUT}/V4_Painel_post_${N[i]}.png`, clip: { x, y, width: 1080, height: 1350 } }); }
await b.close();
