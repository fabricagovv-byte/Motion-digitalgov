// Gera as 30 artes com pessoas (1080×1350) e confere textos/cartões fora do espaço ou se tocando.
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs'; const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const OUT = process.env.OUT || '../../deliverables/artes_cenas', PORT = process.env.PORT || 8880; mkdirSync(OUT, { recursive: true });
const NM = { dig: 'Digitalizacao', sau: 'Saude', pes: 'Pesquisa' }; const b = await pw.chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } }); const bad = [];
const ns = (process.env.N || '').split(',').filter(Boolean).map(Number), list = ns.length ? ns : [...Array(30).keys()];
for (const n of list) { await p.goto(`http://127.0.0.1:${PORT}/artes_cenas/arte.html?n=${n}`); await p.waitForFunction(() => window.ready);
  const r = await p.evaluate(() => { const els = [document.getElementById('hl'), document.getElementById('tg'), ...document.querySelectorAll('.cd,.ph,.lb,.bb')]; const R = els.map(e => e.getBoundingClientRect()); const o = [];
    R.forEach((a, i) => { if (a.left < 30 || a.right > 1050 || a.top < 30 || a.bottom > 1268) o.push(`${els[i].id || els[i].className} fora`); R.forEach((c, j) => { if (j > i && a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom) o.push(`${els[i].id || els[i].className} x ${els[j].id || els[j].className}`); }); });
    return { t: CENAS[N][0], o }; });
  const name = `${String(n + 1).padStart(2, '0')}_${NM[r.t]}.png`; await p.screenshot({ path: `${OUT}/${name}` }); if (r.o.length) bad.push(name + ': ' + r.o.join(', ')); }
await b.close(); console.log(bad.length ? bad.join('\n') : 'tudo dentro do espaço');
