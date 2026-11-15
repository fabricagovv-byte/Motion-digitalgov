// Carrossel v2 (estilo escuro/editorial, 1080x1350) -> deliverables/carrossel-pesquise-gov-v2/
// Foto: coloque src/carrossel/foto.jpg (ou .png); sem ela, usa avatar.png como provisória.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../../deliverables/carrossel-pesquise-gov-v2');
const b64 = f => fs.readFileSync(path.join(dir, f)).toString('base64');
const fotoFile = ['foto.jpg', 'foto.jpeg', 'foto.png'].find(f => fs.existsSync(path.join(dir, f))) || 'avatar.png';
const FOTO = `data:image/${fotoFile.endsWith('png') ? 'png' : 'jpeg'};base64,${b64(fotoFile)}`;
const NOME = 'Arthur7dev', ARROBA = '@grupodigitalgov';

const label = t => `<div class="label">${t}</div>`;
const slides = [
  // 1 capa
  { cls: 'cover', html: `<div class="bg" style="background-image:url(${FOTO})"></div><div class="shade"></div>
    <div class="grow"></div>${label('A HISTÓRIA DO PESQUISE.GOV')}
    <h1 class="xl">DE 1 PESSOA E 1 PC A <em>R$ 1,7 MILHÃO</em></h1>
    <p>Eu comecei jovem. E construí uma inteligência artificial do zero.</p>` },
  // 2 começo
  { html: `${label('O COMEÇO')}<h1 class="xxl">EU COMECEI <em>JOVEM.</em></h1>
    <p>Sozinho, com um computador e uma ideia na cabeça.</p><div class="grow"></div>
    <div class="boxes"><div><b>1</b><span>PESSOA</span></div><div><b>1</b><span>PC</span></div><div><b>1</b><span>IDEIA</span></div></div>` },
  // 3 problema produtos
  { html: `${label('ANTES · PESQUISA DE PRODUTOS')}<h1 class="num">R$ 10 MIL<br><em>A R$ 100 MIL</em></h1><div class="grow"></div>
    <p>Era o que órgãos públicos e empresas gastavam para fazer <strong>uma única pesquisa de produtos.</strong></p>` },
  // 4 problema solo
  { html: `${label('ANTES · PESQUISA DE SOLO')}<h1 class="num">R$ 150 MIL<br><em>A R$ 1 MILHÃO</em></h1><div class="grow"></div>
    <p>Em pesquisa de solo, a conta era ainda mais pesada.</p>` },
  // 5 criado com IA
  { html: `${label('A VIRADA')}<h1 class="xl">CRIEI O SOFTWARE <em>COM INTELIGÊNCIA ARTIFICIAL.</em></h1>
    <p>Usei I.A. para construir uma I.A. O desenvolvimento levou, em média, um ano.</p><div class="grow"></div>
    <div class="boxes two"><div><b>~1 ANO</b><span>DE DESENVOLVIMENTO</span></div><div><b>I.A.</b><span>USADA PARA CRIAR O SOFTWARE</span></div></div>` },
  // 6 produto
  { html: `${label('O RESULTADO')}<h1 class="xxl"><em>PESQUISE</em>.GOV</h1>
    <p>Uma super inteligência artificial que faz a pesquisa por você.</p><div class="grow"></div>
    <div class="steps"><div><b>01</b><span>COLETA OS DADOS</span></div><div><b>02</b><span>ANALISA O SEU PRODUTO</span></div>
    <div><b>03</b><span>ENTREGA UM RELATÓRIO COM ESTRATÉGIAS</span></div></div>` },
  // 7 alcance
  { html: `${label('VAI ALÉM')}<h1 class="xl">PRODUTO, SOLO E <em>O QUE VOCÊ PRECISAR.</em></h1>
    <p>Também coletamos dados de solo. E de praticamente tudo o que precisa ser pesquisado.</p><div class="grow"></div>
    <div class="chips"><span>PRODUTOS</span><span>SOLO</span><span>DADOS</span><span>RELATÓRIOS</span><span>ESTRATÉGIAS</span></div>` },
  // 8 linha do tempo
  { html: `${label('A LINHA DO TEMPO')}<h1 class="lg">DO ZERO AO <em>R$ 1,7 MI</em></h1><div class="grow"></div>
    <div class="tl"><div><b>DIA 1</b><span>1 pessoa, 1 PC e uma ideia.</span></div>
    <div><b>~1 ANO</b><span>Construindo o software com inteligência artificial.</span></div>
    <div class="on"><b>HOJE</b><span>Software avaliado em R$ 1,7 milhão.</span></div></div><div class="grow"></div>` },
  // 9 quem criou
  { cls: 'photo', html: `<div class="pic" style="background-image:url(${FOTO})"></div>
    ${label('QUEM CRIOU ISSO')}<h1 class="xl">UM <em>ADOLESCENTE.</em></h1>
    <p>Eu comecei jovem. E não esperei ficar mais velho pra construir.</p>` },
  // 10 fechamento
  { html: `<div class="grow"></div>${label('AGORA ME DIZ')}<h1 class="xxl">E AÍ, ACHA QUE <em>VALEU ISSO TUDO?</em></h1>
    <p>Comenta aqui 👇</p><div class="grow"></div><div class="follow">SEGUE ${ARROBA} →</div>` },
];

const page_html = (s, i) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Anton;src:url(data:font/woff2;base64,${b64('anton.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;overflow:hidden;position:relative;color:#fff;font-family:Inter,'Noto Color Emoji',sans-serif;
  background:radial-gradient(900px 700px at 100% 0,#1b2a10 0,transparent 60%),radial-gradient(800px 800px at 0 100%,#101a2e 0,transparent 60%),#07090c}
body:before{content:'';position:absolute;inset:0;background-image:linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px);background-size:90px 90px}
main{position:absolute;inset:0;padding:60px 68px 56px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:18px;margin-bottom:64px;position:relative}
.top img{width:68px;height:68px;border-radius:50%;object-fit:cover;border:3px solid #c8ff2e}
.top .n{font-weight:800;font-size:28px}.top .a{font-size:23px;color:#a3abb5}
.top .c{margin-left:auto;font-family:Anton;font-size:34px;color:#c8ff2e}
.body{flex:1;display:flex;flex-direction:column;min-height:0;position:relative}
.grow{flex:1}
.label{align-self:flex-start;font-size:25px;font-weight:800;letter-spacing:3px;color:#07090c;background:#c8ff2e;padding:10px 18px;border-radius:8px;margin-bottom:30px}
h1{font-family:Anton;font-weight:400;text-transform:uppercase;line-height:1.04;margin-bottom:32px}
h1 em{font-style:normal;color:#c8ff2e}
.lg{font-size:118px}.xl{font-size:124px}.xxl{font-size:176px}.num{font-size:158px;line-height:1.04;white-space:nowrap}
p{font-size:44px;line-height:1.26;letter-spacing:-.6px;color:#cfd4db;max-width:900px}p strong{color:#fff}
.boxes{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.boxes.two{grid-template-columns:repeat(2,1fr)}
.boxes div{border:2px solid #ffffff26;background:#ffffff0d;border-radius:26px;padding:30px 30px 34px}
.boxes b{display:block;font-family:Anton;font-weight:400;font-size:128px;line-height:1.05;color:#c8ff2e}
.boxes.two b{font-size:112px}.boxes span{font-size:25px;font-weight:800;letter-spacing:2.5px;color:#cfd4db}
.steps div{display:flex;align-items:center;gap:34px;padding:26px 0;border-top:2px solid #ffffff26}
.steps b{font-family:Anton;font-weight:400;font-size:86px;color:#c8ff2e;width:110px;line-height:1}
.steps span{font-family:Anton;font-size:50px;line-height:1.12}
.chips{display:flex;flex-wrap:wrap;gap:18px}.chips span{font-family:Anton;font-size:46px;padding:14px 32px;border:2px solid #c8ff2e;border-radius:999px;color:#c8ff2e}
.tl{border-left:5px solid #ffffff33;margin-left:16px;padding-left:52px;display:flex;flex-direction:column;gap:56px}
.tl div{position:relative}.tl div:before{content:'';position:absolute;left:-72px;top:22px;width:34px;height:34px;border-radius:50%;background:#07090c;border:5px solid #fff}
.tl .on:before{background:#c8ff2e;border-color:#c8ff2e;box-shadow:0 0 0 12px #c8ff2e33}
.tl b{display:block;font-family:Anton;font-weight:400;font-size:84px;line-height:1.05}.tl .on b{color:#c8ff2e}
.tl span{font-size:38px;color:#cfd4db;letter-spacing:-.4px}
.follow{align-self:flex-start;font-family:Anton;font-size:48px;color:#07090c;background:#c8ff2e;padding:22px 40px;border-radius:999px}
.bot{display:flex;align-items:center;gap:22px;margin-top:40px;font-size:24px;font-weight:700;color:#a3abb5;position:relative}
.bar{flex:1;height:6px;border-radius:3px;background:#ffffff26;overflow:hidden}.bar i{display:block;height:100%;background:#c8ff2e;width:${(i + 1) * 10}%}
.cover .bg{position:absolute;inset:0;background-size:cover;background-position:center 20%}
.cover .shade{position:absolute;inset:0;background:linear-gradient(180deg,#07090ccc 0,#07090c33 22%,#07090c66 42%,#07090cf2 68%,#07090c 100%)}
.photo .pic{height:470px;margin:-20px 0 44px;border-radius:30px;background-size:cover;background-position:center 20%;border:3px solid #c8ff2e;flex:none}
</style><body class="${s.cls || ''}">${s.cls === 'cover' ? s.html.split('<div class="grow">')[0] : ''}<main>
<div class="top"><img src="data:image/png;base64,${b64('avatar.png')}"><div><div class="n">${NOME}</div><div class="a">${ARROBA}</div></div><div class="c">${String(i + 1).padStart(2, '0')}/10</div></div>
<div class="body">${s.cls === 'cover' ? '<div class="grow">' + s.html.split('<div class="grow">')[1] : s.html}</div>
<div class="bot"><span>pesquise.gov</span><div class="bar"><i></i></div><span>${i < 9 ? 'ARRASTA →' : 'FIM'}</span></div></main>`;

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (const [i, s] of slides.entries()) {
  await page.setContent(page_html(s, i));
  await page.evaluate(() => document.fonts.ready);
  const over = await page.evaluate(() => { const b = document.querySelector('.body'); return b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1; });
  if (over) console.warn('overflow no slide', i + 1);
  await page.screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}.png`) });
}
await browser.close();
console.log('foto usada:', fotoFile);
