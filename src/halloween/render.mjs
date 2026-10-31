// Gera as artes de Halloween (8 feed 1080×1350 + 2 stories 1080×1920). Dados do evento: DATA, HORA, LOCAL (opcionais).
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs'; const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const OUT = process.env.OUT || '../../deliverables/halloween', PORT = process.env.PORT || 8890; mkdirSync(OUT, { recursive: true });
const NM = ['01_Convite_feed', '02_Falta_1_dia', '03_Medo_de_planilha_THR', '04_Remedio_fantasma_Saude', '05_Arquivo_morto_Digitalizacao', '06_Obra_assombrada_Engenheiro', '07_Lei_arrepio_Juridico', '08_Feliz_Halloween_feed', '09_Convite_story', '10_Feliz_Halloween_story'];
const ev = new URLSearchParams(); for (const k of ['data', 'hora', 'local']) if (process.env[k.toUpperCase()]) ev.set(k, process.env[k.toUpperCase()]);
const b = await pw.chromium.launch();
for (let n = 0; n < 10; n++) { const p = await b.newPage({ viewport: { width: 1080, height: n >= 8 ? 1920 : 1350 } }); await p.goto(`http://127.0.0.1:${PORT}/halloween/arte.html?n=${n}&${ev}`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/V4_Halloween_${NM[n]}.png` }); await p.close(); }
await b.close(); console.log('ok');
