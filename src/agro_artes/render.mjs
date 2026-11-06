// Gera as artes V4.7 Agro (8 feed 1080×1350 + 3 stories 1080×1920).
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs'; const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const OUT = '../../deliverables/agro_artes', PORT = process.env.PORT || 8997; mkdirSync(OUT, { recursive: true });
const NM = ['Produza_mais', 'Mapeie_com_drone', 'Chuva_antes', 'Custo_no_celular', 'Valor_da_safra', 'Semente_por_talhao', 'Equipe_e_tarefas', 'Colha_mais'];
const b = await pw.chromium.launch();
const jobs = NM.map((n, i) => [i, 0, n]).concat([[0, 1, 'Produza_mais'], [1, 1, 'Mapeie_com_drone'], [4, 1, 'Valor_da_safra']]);
for (const [i, st, n] of jobs) { const p = await b.newPage({ viewport: { width: 1080, height: st ? 1920 : 1350 } }); await p.goto(`http://127.0.0.1:${PORT}/agro_artes/arte.html?n=${i}${st ? '&story' : ''}`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(200);
  await p.screenshot({ path: `${OUT}/V47_Agro_${String(i + 1).padStart(2, '0')}_${n}_${st ? 'story' : 'feed'}.png` }); await p.close(); }
await b.close(); console.log('ok');
