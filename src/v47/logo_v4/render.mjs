// Render das logos animadas. Precisa de servidor HTTP servindo src/v47 na PORT.
//   node render.mjs probe <v> <w> <h> t1 t2 ...   -> PNGs em <out>
//   node render.mjs frames <v> <w> <h> <fps> <dir>
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const pw = require('playwright');
const PORT = process.env.PORT || 8840;
const [mode, v, w, h, ...rest] = process.argv.slice(2);
const browser = await pw.chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${PORT}/${process.env.NAME||'logo_br'}/logo.html?render=1&v=${v}&w=${w}&h=${h}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
const shot = async (t, path) => { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path, ...(path.endsWith('.png') ? { type: 'png' } : { type: 'jpeg', quality: 95 }) }); };
if (mode === 'probe') { const out = process.env.OUT; mkdirSync(out, { recursive: true }); for (const t of rest) await shot(+t, `${out}/v${v}_${w}x${h}_t${t}.png`); }
else { const [fps, dir] = rest; mkdirSync(dir, { recursive: true }); const dur = await page.evaluate(() => window.DUR); const n = Math.ceil(dur * fps);
  for (let f = 0; f < n; f++) await shot(f / fps, `${dir}/f${String(f).padStart(5, '0')}.jpg`); }
await browser.close();
