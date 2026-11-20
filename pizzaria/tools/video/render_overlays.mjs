// Renderiza legendas (PNG transparente) e cartela final do vídeo a partir de overlay.html + data/config.js
// Uso: node tools/video/render_overlays.mjs <pasta_saida>
import path from 'node:path'; import fs from 'node:fs'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.resolve(process.argv[2] || 'build/overlays'); fs.mkdirSync(out, { recursive: true });
const caps = JSON.parse(fs.readFileSync(path.join(here, 'cenas.json'), 'utf8')).cenas.filter(c => c.titulo);
const b = await chromium.launch();
for (const [w, h, tag] of [[1920, 1080, 'h'], [1080, 1920, 'v']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const c of caps) {
    await p.goto(`file://${here}/overlay.html?k=${encodeURIComponent(c.chamada)}&t=${encodeURIComponent(c.titulo)}`);
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${out}/${tag}_${c.id}.png`, omitBackground: true });
  }
  await p.goto(`file://${here}/overlay.html?end=1`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${tag}_end.png` });
  await p.close();
}
await b.close(); console.log('ok', out);
