// Renderiza o filme quadro a quadro em Chromium headless (WebGL) com vários workers em paralelo.
// Filmes: --film ged (padrão) | inst | anim.  --q 'k=v&k2=v2' repassa parâmetros à página.
// Uso: node src/render.mjs --dpr 2 --out build/frames [--from 0 --to 67] [--step 1] [--workers 4] [--only s1_archive]
//      node src/render.mjs --stills 3,12,24 --out build/stills
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]?.startsWith('--') || arr[i + 1] === undefined ? '1' : arr[i + 1]]] : a), []));
const FILM = args.film || 'ged';
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, { inst: 'src/inst/timeline.json', anim: 'src/anim/timeline.json' }[FILM] || 'src/timeline.json'), 'utf8'));
const dpr = parseFloat(args.dpr || '1'), workers = parseInt(args.workers || '4'), out = path.resolve(ROOT, args.out || 'build/frames');
const fps = TL.fps, from = parseFloat(args.from || '0'), to = parseFloat(args.to || String(TL.duration)), step = parseInt(args.step || '1');
fs.mkdirSync(out, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.otf': 'font/otf' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/' ) p = { inst: '/src/web/inst.html', anim: '/src/web/anim.html' }[FILM] || '/src/web/index.html';
  if (!p.startsWith('/node_modules') && !p.startsWith('/src') && !p.startsWith('/assets') && !p.startsWith('/audio')) p = '/src/web' + p;
  const f = path.join(ROOT, p);
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(0);
const port = server.address().port;

let jobs;
if (args.stills) jobs = args.stills.split(',').map((s) => ({ t: parseFloat(s), name: `t${parseFloat(s).toFixed(2)}.png` }));
else { jobs = []; const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
  for (let f = f0; f < f1; f += step) { const name = `f${String(f).padStart(5, '0')}.jpg`; if (!args.resume || !fs.existsSync(path.join(out, name))) jobs.push({ t: f / fps, name }); } }

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--force-color-profile=srgb'] });
const q = [...jobs]; let done = 0; const t0 = Date.now();
async function worker(id) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dpr });
  page.on('console', (m) => { if (m.type() === 'error') console.error(`[w${id}]`, m.text()); });
  page.on('pageerror', (e) => console.error(`[w${id}] pageerror`, e.message));
  await page.goto(`http://localhost:${port}/?dpr=${dpr}${args.only ? '&only=' + args.only : ''}${args.raw ? '&raw=1' : ''}${args.q ? '&' + args.q : ''}`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 120000 });
  const err = await page.evaluate(() => window.__error); if (err) throw new Error(err);
  const stage = await page.$('#stage');
  while (q.length) {
    const j = q.shift();
    await page.evaluate((t) => window.renderFrame(t), j.t);
    const file = path.join(out, j.name);
    for (let k = 0; ; k++) {   // tolera lentidão momentânea da máquina
      try { await stage.screenshot({ path: file, timeout: 180000, type: j.name.endsWith('.png') ? 'png' : 'jpeg', ...(j.name.endsWith('.jpg') ? { quality: 95 } : {}) }); break; }
      catch (e) { if (k >= 2) throw e; console.error(`[w${id}] retry ${j.name}: ${e.message.split('\n')[0]}`); }
    }
    if (++done % 25 === 0 || done === jobs.length) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${jobs.length}  ${el.toFixed(0)}s  eta ${((jobs.length - done) * el / done).toFixed(0)}s`); }
  }
  await page.close();
}
await Promise.all(Array.from({ length: Math.min(workers, jobs.length) }, (_, i) => worker(i)));
await browser.close(); server.close();
