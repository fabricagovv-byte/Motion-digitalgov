// Renderiza o mockup do boné: node src/bone/render.mjs [--dpr 2] [--out build/bone/renders]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const a = process.argv.slice(2); const arg = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
const dpr = parseFloat(arg('dpr', '1')), out = path.resolve(ROOT, arg('out', 'build/bone/renders')), only = arg('only', '');
fs.mkdirSync(out, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const jobs = [];
for (const cor of ['branco', 'marinho']) for (const vista of ['frente34', 'frente', 'lado', 'tras']) jobs.push({ cor, vista, q: `cor=${cor}&vista=${vista}`, name: `bone_${cor}_${vista}` });
for (const m of ['americano', 'trucker', 'abareta', 'dad']) for (const vista of ['frente34', 'tras']) jobs.push({ cor: m, vista, q: `modelo=${m}&vista=${vista}`, name: `modelo_${m}_${vista}` });
for (const j of jobs.filter((j) => !only || only.split(',').includes(`${j.cor}_${j.vista}`))) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: dpr });
  page.on('console', (m) => m.type() === 'error' && console.error(m.text())); page.on('pageerror', (e) => console.error(e));
  await page.goto(`http://localhost:${port}/src/bone/bone.html?${j.q}`);
  await page.waitForFunction('window.__ready === true', null, { timeout: 120000 });
  const f = path.join(out, `${j.name}.png`); await page.locator('canvas').screenshot({ path: f }); console.log(f); await page.close();
}
await browser.close(); server.close();
