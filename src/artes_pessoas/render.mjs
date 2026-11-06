// Gera as 12 artes com pessoa (1080×1350) e confere se algum texto sai do espaço.
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs'; const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const OUT = process.env.OUT || '../../deliverables/artes_pessoas', PORT = process.env.PORT || 8990; mkdirSync(OUT, { recursive: true });
const NM = ['Pesquisa', 'Saude', 'Juridico', 'Aprendizagem', 'THR_Obras', 'Engenheiro_7_3', 'Dados_1_centavo', 'Digitalizacao', 'Pesquisa_Amazonia', 'Painel_do_Gestor', 'V4_Plataforma', 'Contato'];
const b = await pw.chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } }); const bad = [];
for (let n = 0; n < NM.length; n++) { await p.goto(`http://127.0.0.1:${PORT}/artes_pessoas/arte.html?n=${n}`); await p.waitForFunction(() => window.ready);
  const o = await p.evaluate(() => { const R = id => document.getElementById(id).getBoundingClientRect(); const r = []; for (const id of ['hl', 'tg', 'sd', 'tp']) { const e = R(id); if (e.left < 30 || e.right > 1050 || e.bottom > 1262) r.push(id + ' fora'); } return r; });
  await p.screenshot({ path: `${OUT}/${String(n + 1).padStart(2, '0')}_${NM[n]}.png` }); if (o.length) bad.push(NM[n] + ': ' + o.join(',')); }
await b.close(); console.log(bad.length ? bad.join('\n') : 'tudo dentro do espaço');
