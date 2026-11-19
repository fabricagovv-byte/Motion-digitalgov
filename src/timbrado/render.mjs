// Gera o papel timbrado: PDF A4 (vetorial) e PNG de prévia. node src/timbrado/render.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'); const out = path.join(ROOT, 'deliverables/timbrado'); fs.mkdirSync(out, { recursive: true });
const MIME = { '.html': 'text/html', '.png': 'image/png' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const browser = await chromium.launch();
for (const [q, nome] of [['', 'papel_timbrado_digitalgov_oficio'], ['?vazio=1', 'papel_timbrado_digitalgov_em_branco']]) {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 3 });
  await page.goto(`http://localhost:${server.address().port}/src/timbrado/timbrado.html${q}`); await page.waitForFunction('window.__ok === true');
  await page.pdf({ path: path.join(out, nome + '.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await page.locator('.folha').screenshot({ path: path.join(out, nome + '.png') }); console.log(nome); await page.close();
}
await browser.close(); server.close();
