// Render do carrossel: node render.mjs <dirSaida> [n...]  (servidor HTTP servindo esta pasta na PORT)
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs';
const pw = createRequire(import.meta.url)('playwright');
const [out, ...ns] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const b = await pw.chromium.launch({ args: ['--force-color-profile=srgb'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
for (const n of (ns.length ? ns : ['0', '1', '2', '3', '4', '5', '6'])) {
  await p.goto(`http://127.0.0.1:${process.env.PORT || 8850}/arte.html?n=${n}`); await p.waitForFunction(() => window.ready === true);
  await p.locator('#p').screenshot({ path: `${out}/V4_carrossel_minas_${String(+n + 1).padStart(2, '0')}.png` });
}
await b.close();
