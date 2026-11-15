// Gera o carrossel (1080x1350) a partir de slides.json -> deliverables/carrossel-pesquise-gov/
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../../deliverables/carrossel-pesquise-gov');
const { perfil, slides } = JSON.parse(fs.readFileSync(path.join(dir, 'slides.json'), 'utf8'));
const b64 = f => fs.readFileSync(path.join(dir, f)).toString('base64');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const pad = n => String(n).padStart(2, '0');

const card = c => {
  if (c.tipo === 'linhas') return c.linhas.map(([l, v]) =>
    `<div class="row"><span class="lab">${esc(l)}</span><span class="val ${v === '✓' ? 'ok' : ''}">${esc(v)}</span></div>`).join('');
  if (c.tipo === 'frase') return `<div class="center"><div class="big">${esc(c.frase)}</div><div class="lab">${esc(c.sub)}</div></div>`;
  if (c.tipo === 'busca') return `<div class="center"><div class="search"><i></i>${esc(c.busca)}</div>
    <div class="chips">${c.chips.map(x => `<span>${esc(x)}</span>`).join('<b>→</b>')}</div></div>`;
  if (c.tipo === 'passos') return c.passos.map(([n, t]) =>
    `<div class="row step"><span class="val">${n}</span><span class="steptxt">${esc(t)}</span></div>`).join('');
  if (c.tipo === 'criador') return `<div class="creator"><img src="data:image/png;base64,${b64('avatar.png')}">
    <div><div class="big">${esc(c.nome)}</div><div class="lab">${esc(c.sub)}</div></div></div>
    <div class="row"><span class="lab">AVALIAÇÃO DO SOFTWARE</span><span class="val">${esc(c.valor)}</span></div>`;
};

const html = (s, i) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url(data:font/woff2;base64,${b64('anton.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;background:#fff;color:#0f1419;font-family:Inter,'Noto Color Emoji',sans-serif;
  padding:64px 64px 52px;display:flex;flex-direction:column}
header{display:flex;align-items:center;gap:24px;margin-bottom:40px}
header img{width:112px;height:112px;border-radius:50%;object-fit:cover}
.name{font-size:36px;font-weight:800;letter-spacing:-.5px}.at{font-size:30px;color:#657786;margin-top:2px}
h1{font-size:50px;line-height:1.16;font-weight:800;letter-spacing:-1.2px;margin-bottom:34px}
p{font-size:44px;line-height:1.24;letter-spacing:-.9px;margin-bottom:30px;font-weight:450}
.card{flex:1;min-height:0;margin-top:14px;background:#f3f2ef;border:1px solid #e9e7e2;border-radius:30px;
  padding:26px 46px;display:flex;flex-direction:column;justify-content:center}
.row{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:22px 0;border-top:2px solid #dcdad4}
.row:last-child{border-bottom:2px solid #dcdad4}
.lab{font-size:27px;font-weight:800;letter-spacing:1.6px;color:#6b6f76}
.val{font-family:Anton;font-size:104px;line-height:1.08;white-space:nowrap}
.val.ok{font-size:76px;color:#0a7d3e}
.center{text-align:center}.big{font-family:Anton;font-size:96px;line-height:1.1;margin-bottom:22px}
.search{display:inline-flex;align-items:center;gap:22px;background:#fff;border:3px solid #0f1419;border-radius:999px;
  padding:26px 54px 26px 40px;font-size:60px;font-weight:800;letter-spacing:-1.5px}
.search i{width:38px;height:38px;border:6px solid #0f1419;border-radius:50%;position:relative}
.search i:after{content:'';position:absolute;width:6px;height:20px;background:#0f1419;right:-13px;bottom:-17px;transform:rotate(-45deg);border-radius:3px}
.chips{margin-top:44px;display:flex;justify-content:center;align-items:center;gap:20px;font-family:Anton;font-size:50px}
.chips b{color:#9a9da3;font-family:Inter}
.step{justify-content:flex-start;gap:40px}.step .val{font-size:92px;color:#9a9da3;width:120px}
.steptxt{font-family:Anton;font-size:50px;line-height:1.12}
.creator{display:flex;align-items:center;gap:36px;padding-bottom:30px}
.creator img{width:190px;height:190px;border-radius:50%;object-fit:cover}.creator .big{margin-bottom:6px}
footer{display:flex;justify-content:space-between;margin-top:28px;font-size:24px;color:#8a8f96}
footer b{color:#0f1419;font-weight:800;font-size:26px}
</style>
<header><img src="data:image/png;base64,${b64('avatar.png')}"><div><div class="name">${esc(perfil.nome)}</div><div class="at">${esc(perfil.arroba)}</div></div></header>
<h1>${esc(s.titulo)}</h1>${s.texto.map(t => `<p>${esc(t)}</p>`).join('')}
<div class="card">${card(s.card)}</div>
<footer><span>${esc(perfil.rodape)}</span><b>${pad(i + 1)}/${pad(slides.length)}</b></footer>`;

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (const [i, s] of slides.entries()) {
  await page.setContent(html(s, i));
  await page.evaluate(() => document.fonts.ready);
  const over = await page.evaluate(() => document.body.scrollHeight > 1350 || [...document.querySelectorAll('.card')].some(c => c.scrollHeight > c.clientHeight + 1 || c.clientHeight < 300));
  if (over) console.warn('overflow no slide', i + 1);
  await page.screenshot({ path: path.join(out, `${pad(i + 1)}.png`) });
}
await browser.close();
