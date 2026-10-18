// Render do filme "Pesquisas" quadro a quadro.
// Uso:
//   node render.mjs probe 1 6 12 18 25 30 35 40   -> build/pesquisa/probe/sheet.png
//   node render.mjs frames <fps> <a> <b> <dir>   -> quadros a..b-1 em JPEG
// Precisa de um servidor HTTP servindo esta pasta (porta via PORT, padrão 8765).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

const PORT = process.env.PORT || 8765;
const URL = `http://127.0.0.1:${PORT}/film.html?render=1`;
const [mode, ...args] = process.argv.slice(2);

async function open() {
  const browser = await pw.chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-threaded-animation'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(URL);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
  return { browser, page };
}
async function shot(page, t, path) {
  await page.evaluate(async (t) => { window.seek(t); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);
  await page.screenshot({ path, type: path.endsWith('.png') ? 'png' : 'jpeg', quality: path.endsWith('.png') ? undefined : 94 });
}

if (mode === 'probe') {
  const dir = '../../build/pesquisa/probe'; mkdirSync(dir, { recursive: true });
  const { browser, page } = await open();
  const files = [];
  for (const t of args.map(Number)) { const f = `${dir}/t${t.toFixed(2)}.png`; await shot(page, t, f); files.push(f); }
  await browser.close();
  const cols = Math.min(3, files.length), rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap(f => ['-i', f]);
  const n = files.length;
  const scaled = files.map((_, i) => `[${i}:v]scale=640:360[s${i}]`).join(';');
  const pads = [];
  for (let i = n; i < cols * rows; i++) pads.push(`color=c=black:s=640x360[s${i}]`);
  const layout = Array.from({ length: cols * rows }, (_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|');
  const fc = [scaled, ...pads].join(';') + ';' + Array.from({ length: cols * rows }, (_, i) => `[s${i}]`).join('') + `xstack=inputs=${cols * rows}:layout=${layout}[o]`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', fc, '-map', '[o]', '-frames:v', '1', `${dir}/sheet.png`]);
  console.log(`${dir}/sheet.png`);
} else if (mode === 'frames') {
  const [fps, a, b, dir] = [Number(args[0]), Number(args[1]), Number(args[2]), args[3]];
  mkdirSync(dir, { recursive: true });
  const { browser, page } = await open();
  for (let f = a; f < b; f++) {
    await shot(page, f / fps, `${dir}/f${String(f).padStart(5, '0')}.jpg`);
    if (f % 120 === 0) console.log(`frame ${f}`);
  }
  await browser.close();
}
