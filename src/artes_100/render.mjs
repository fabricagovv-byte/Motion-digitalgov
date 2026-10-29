// Gera as 100 artes (1080×1350) e confere se algum texto sai do espaço ou encosta em outro.
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs'; const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const OUT = process.env.OUT || '../../deliverables/artes_100', PORT = process.env.PORT || 8870; mkdirSync(OUT, { recursive: true });
const NOMES = { pesquisa: 'Pesquisa', saude: 'Saude', juridico: 'Juridico', aprendizagem: 'Aprendizagem', obras: 'Obras', engenheiro: 'Engenheiro', v4: 'V4' };
const ns = (process.env.N || '').split(',').filter(Boolean).map(Number); const list = ns.length ? ns : [...Array(100).keys()];
const b = await pw.chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } }); const bad = [];
for (const n of list) {
  await p.goto(`http://127.0.0.1:${PORT}/artes_100/arte.html?n=${n}`); await p.waitForFunction(() => window.ready);
  const r = await p.evaluate(() => { const R = id => document.getElementById(id).getBoundingClientRect(); const o = []; const k = window.it.k;
    const hl = R('hl'), tg = R('tg'), sd = R('sd'), tp = R('tp');
    for (const [nm, e] of [['titulo', hl], ['selo', tg], ['frase', sd], ['topo', tp]]) if (e.left < 40 || e.right > 1040 || e.top < 20 || e.bottom > 1262) o.push(nm + ' fora');
    const hit = (a, c) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
    if (hit(hl, tg) || hit(hl, sd)) o.push('titulo encosta'); if (hit(tg, sd)) o.push('selo x frase'); if (sd.height > 72) o.push('frase 3 linhas');
    return { k, o, f: getComputedStyle(document.getElementById('hl')).fontSize }; });
  const name = `${String(n + 1).padStart(3, '0')}_${NOMES[r.k]}.png`; await p.screenshot({ path: `${OUT}/${name}` });
  if (r.o.length) bad.push(name + ': ' + r.o.join(', '));
}
await b.close(); console.log(bad.length ? bad.join('\n') : 'tudo dentro do espaço');
