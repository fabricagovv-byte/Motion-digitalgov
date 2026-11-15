// Carrossel v3 (preto premium + verde neon, 1080x1350) -> deliverables/carrossel-pesquise-gov-v3/
// Foto original em src/carrossel/foto.jpg (usada sem retoque: apenas enquadramento e degradê por cima).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../../deliverables/carrossel-pesquise-gov-v3');
const b64 = f => fs.readFileSync(path.join(dir, f)).toString('base64');
const FOTO = `data:image/jpeg;base64,${b64('foto.jpg')}`;
const AVATAR = `data:image/png;base64,${b64('avatar.png')}`;
const NOME = 'Arthur7dev', ARROBA = '@arthur_miguel_c022';
const N = 10;

const k = (n, t) => `<div class="kicker"><i></i>${String(n).padStart(2, '0')} — ${t}</div>`;
const slides = [
  { cls: 'cover', pre: `<div class="bg" style="background-image:url(${FOTO})"></div><div class="shade"></div>`,
    html: `<div class="grow"></div>${k(1, 'A HISTÓRIA')}
    <h1 style="font-size:98px">1 PESSOA.<br>1 COMPUTADOR.<br>UMA IDEIA DE<br><em style="font-size:158px;line-height:1.08">R$ 1,7 MILHÃO.</em></h1>
    <p class="sm">Comecei jovem, sem investidores milionários e sem uma grande equipe. <b>Apenas com um computador e uma ideia que parecia impossível.</b></p>` },

  { html: `${k(2, 'O INÍCIO')}
    <h1 style="font-size:116px">ENQUANTO MUITOS ESPERAVAM, <em>EU COMECEI.</em></h1>
    <p>Sem escritório de luxo. Sem grandes recursos. Sem saber todas as respostas. <b>Mas com uma vontade enorme de construir algo extraordinário.</b></p>
    <div class="grow"></div>
    <div class="trio"><div><b>1</b><span>PESSOA</span></div><div><b>1</b><span>COMPUTADOR</span></div><div><b>1</b><span>VISÃO</span></div></div>` },

  { html: `${k(3, 'O MERCADO')}
    <h1><span class="over">ATÉ</span><em class="hero">R$ 100 MIL</em><span class="under">POR UMA PESQUISA?</span></h1>
    <div class="grow"></div>
    <div class="range"><div class="rl"><span>R$ 10 MIL</span><span>R$ 100 MIL</span></div><div class="rb"><i></i></div><small>FAIXA DE REFERÊNCIA · PESQUISA DE PRODUTOS</small></div>
    <p>Pesquisas de produtos podiam custar de R$ 10 mil a R$ 100 mil. <b>Foi quando percebi que existia um problema enorme esperando por uma solução.</b></p>` },

  { html: `${k(4, 'O DESAFIO')}
    <h1><span class="over">E QUANDO O CUSTO CHEGAVA A</span><em class="hero" style="font-size:176px">R$ 1 MILHÃO?</em></h1>
    <div class="grow"></div>
    <p>Em determinados projetos, pesquisas e estudos especializados podiam alcançar valores altíssimos. <b>Eu comecei a imaginar uma forma de tornar o acesso à informação mais inteligente.</b></p>
    <small class="note">VALORES DE REFERÊNCIA, ESTIMADOS.</small>` },

  { html: `${k(5, 'A DECISÃO')}
    <h1 style="font-size:138px">DECIDI CONSTRUIR O QUE ANTES PARECIA <em>IMPOSSÍVEL.</em></h1>
    <div class="grow"></div>
    <p>Usei inteligência artificial para acelerar o desenvolvimento de uma tecnologia própria. <b>Foram meses de trabalho, aprendizado e evolução.</b></p>` },

  { html: `${k(6, 'A CRIAÇÃO')}
    <h1><span class="over">ASSIM NASCEU O</span><em class="hero" style="font-size:178px">PESQUISE.GOV</em></h1>
    <p>Uma plataforma inteligente para coletar dados, analisar informações e produzir relatórios estratégicos. <b>Uma ideia que finalmente se transformou em tecnologia.</b></p>
    <div class="grow"></div>
    <div class="flow"><div><b>01</b><span>COLETA</span></div><u>→</u><div><b>02</b><span>ANÁLISE</span></div><u>→</u><div><b>03</b><span>INTELIGÊNCIA</span></div><u>→</u><div class="on"><b>04</b><span>RESULTADOS</span></div></div>` },

  { html: `${k(7, 'A VISÃO')}
    <h1 style="font-size:116px">NÃO ERA APENAS SOBRE CRIAR <em>UM SOFTWARE.</em></h1>
    <p>Era sobre construir uma solução capaz de transformar pesquisas de produtos, dados e estudos técnicos em <b>informações que apoiam decisões.</b></p>
    <div class="grow"></div>
    <div class="conv"><div class="in"><span>PESQUISAS DE PRODUTOS</span><span>DADOS</span><span>ESTUDOS TÉCNICOS</span></div><u>→</u><div class="outb">DECISÕES</div></div>` },

  { html: `${k(8, 'A EVOLUÇÃO')}
    <h1 style="font-size:150px">DO ZERO A<br><em>R$ 1,7 MILHÃO.</em></h1>
    <div class="grow"></div>
    <div class="tl"><div><b>DIA 1</b><span>Um computador e uma ideia.</span></div>
      <div><b>QUASE 1 ANO</b><span>Desenvolvimento com inteligência artificial.</span></div>
      <div class="on"><b>HOJE</b><span>Projeto com avaliação estimada em R$ 1,7 milhão.</span></div></div>
    <div class="grow"></div>` },

  { cls: 'who', html: `<div class="pic"><div style="background-image:url(${FOTO})"></div></div>
    ${k(9, 'QUEM ESTÁ POR TRÁS')}
    <h1 style="font-size:92px;margin-bottom:24px">UM JOVEM DE <em>14 ANOS</em> QUE DECIDIU NÃO ESPERAR.</h1>
    <div class="facts"><span>MINEIRO DE ALVORADA DE MINAS</span><span>GERENTE DE TECNOLOGIA DO GRUPO DIGITALGOV</span></div>
    <p class="sm">Não esperei ter a idade perfeita, os recursos perfeitos ou as condições ideais. <b>Comecei com o que tinha. E continuo construindo algo maior.</b></p>` },

  { html: `${k(10, 'O IMPACTO FINAL')}
    <h1 style="font-size:134px">E SE EU TIVESSE DESISTIDO <em>ANTES DE COMEÇAR?</em></h1>
    <p>Talvez tudo ainda fosse apenas uma ideia guardada no computador. <b>Mas eu decidi tentar.</b></p>
    <div class="grow"></div>
    <div class="cta"><span>E VOCÊ?</span>TERIA CORAGEM DE COMEÇAR DO ZERO?</div>` },
];

const G = '#c6ff2e';
const css = `
@font-face{font-family:Anton;src:url(data:font/woff2;base64,${b64('anton.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;overflow:hidden;position:relative;color:#fff;background:#040404;font-family:Inter,sans-serif}
.glow{position:absolute;inset:0;background:radial-gradient(760px 620px at 108% -6%,#c6ff2e24 0,transparent 62%),radial-gradient(700px 600px at -12% 108%,#c6ff2e12 0,transparent 60%)}
.grain{position:absolute;inset:0;opacity:.07;mix-blend-mode:screen}
.edge{position:absolute;left:0;top:0;bottom:0;width:6px;background:${G}}
main{position:absolute;inset:0;padding:58px 72px 54px 78px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;font-size:22px;font-weight:800;letter-spacing:5px;margin-bottom:58px}
.top i{width:12px;height:12px;border-radius:50%;background:${G};margin-right:16px;box-shadow:0 0 18px ${G}}
.top span{margin-left:auto;font-family:Anton;font-weight:400;font-size:30px;letter-spacing:2px;color:#fff}.top span s{text-decoration:none;color:#6d7278}
.body{flex:1;min-height:0;display:flex;flex-direction:column}
.grow{flex:1}
.kicker{display:flex;align-items:center;gap:18px;font-size:24px;font-weight:800;letter-spacing:5px;color:${G};margin-bottom:30px}
.kicker i{width:56px;height:3px;background:${G}}
h1{font-family:Anton;font-weight:400;text-transform:uppercase;line-height:1.03;font-size:130px;margin-bottom:36px;text-wrap:balance}
h1 em{font-style:normal;color:${G}}
h1 .over,h1 .under{display:block;font-size:76px;line-height:1.1}h1 .under{margin-top:6px}
h1 .hero{display:block;font-size:218px;line-height:1.04;white-space:nowrap;text-shadow:0 0 70px #c6ff2e40}
p{font-size:39px;line-height:1.32;letter-spacing:-.5px;color:#a9aeb5;font-weight:450}
p b{color:#fff;font-weight:650}p.sm{font-size:35px}
small{display:block;font-size:20px;font-weight:800;letter-spacing:4px;color:#6d7278}
.note{margin-top:30px}
.trio{display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid #ffffff24}
.trio div{padding:26px 0 0 30px;border-left:2px solid #ffffff24}.trio div:first-child{padding-left:0;border:0}
.trio b{display:block;font-family:Anton;font-weight:400;font-size:140px;line-height:1;color:${G}}
.trio span{font-size:26px;font-weight:800;letter-spacing:4px}
.range{margin-bottom:44px}.rl{display:flex;justify-content:space-between;font-family:Anton;font-size:44px;margin-bottom:14px}
.rl span:last-child{color:${G}}
.rb{height:10px;border-radius:5px;background:#ffffff1f;margin-bottom:16px}.rb i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#c6ff2e33,${G});box-shadow:0 0 24px #c6ff2e66}
.flow{display:flex;align-items:stretch;gap:10px}.flow u{text-decoration:none;align-self:center;color:${G};font-size:30px;font-weight:800}
.flow div{flex:1;border:2px solid #ffffff2b;border-radius:18px;padding:22px 16px 24px 20px}
.flow b{display:block;font-size:22px;font-weight:800;letter-spacing:3px;color:${G};margin-bottom:38px}
.flow span{font-family:Anton;font-size:31px;letter-spacing:.5px}
.flow .on{background:${G};border-color:${G};color:#040404}.flow .on b{color:#040404}
.conv{display:flex;align-items:center;gap:26px}.conv u{text-decoration:none;color:${G};font-size:54px;font-weight:800}
.conv .in{flex:1}.conv .in span{display:block;font-family:Anton;font-size:44px;padding:20px 0;border-top:2px solid #ffffff24}
.conv .in span:last-child{border-bottom:2px solid #ffffff24}
.outb{font-family:Anton;font-size:76px;color:#040404;background:${G};padding:66px 34px;border-radius:20px;box-shadow:0 0 60px #c6ff2e40}
.tl{border-left:4px solid #ffffff2b;margin-left:16px;padding-left:56px;display:flex;flex-direction:column;gap:58px}
.tl div{position:relative}.tl div:before{content:'';position:absolute;left:-76px;top:20px;width:32px;height:32px;border-radius:50%;background:#040404;border:4px solid #fff}
.tl .on:before{background:${G};border-color:${G};box-shadow:0 0 0 12px #c6ff2e2e,0 0 40px ${G}}
.tl b{display:block;font-family:Anton;font-weight:400;font-size:88px;line-height:1.05}.tl .on b{color:${G}}
.tl span{font-size:37px;color:#a9aeb5;letter-spacing:-.4px}.tl .on span{color:#fff}
.cta{font-family:Anton;font-size:78px;line-height:1.1;text-wrap:balance;color:#040404;background:${G};padding:38px 44px 42px;border-radius:22px;box-shadow:0 0 70px #c6ff2e40}
.cta span{display:block;font-family:Inter;font-size:24px;font-weight:800;letter-spacing:5px;margin-bottom:12px}
.bot{display:flex;align-items:center;gap:18px;margin-top:44px}
.bot img{width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid ${G}}
.bot .n{font-size:24px;font-weight:800}.bot .a{font-size:21px;color:#a9aeb5}
.dots{margin-left:auto;display:flex;gap:7px;align-items:center}.dots i{width:22px;height:5px;border-radius:3px;background:#ffffff2b}.dots i.on{background:${G};width:44px}
.next{font-size:20px;font-weight:800;letter-spacing:3px;margin-left:18px}
.cover .bg{position:absolute;inset:0;background-size:cover;background-position:center top}
.cover .shade{position:absolute;inset:0;background:linear-gradient(180deg,#040404d9 0,#04040400 15%,#04040400 34%,#040404b8 46%,#040404f5 55%,#040404 70%)}
.cover .glow{display:none}
.who .pic{position:relative;height:420px;flex:none;margin:-14px 0 40px}
.facts{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px}.facts span{font-size:21px;font-weight:800;letter-spacing:2.5px;color:${G};border:2px solid #c6ff2e80;border-radius:999px;padding:10px 20px}
.who .pic div{position:absolute;inset:0;border-radius:6px;background-size:cover;background-position:center 9%}
.who .pic:before,.who .pic:after{content:'';position:absolute;width:64px;height:64px;border:5px solid ${G};z-index:1}
.who .pic:before{left:-14px;top:-16px;border-right:0;border-bottom:0}.who .pic:after{right:-14px;bottom:-16px;border-left:0;border-top:0}
`;
const grain = `<svg class="grain" width="1080" height="1350"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;

const page_html = (s, i) => `<!doctype html><meta charset="utf-8"><style>${css}</style><body class="${s.cls || ''}">
${s.pre || ''}<div class="glow"></div>${grain}<div class="edge"></div><main>
<div class="top"><i></i>PESQUISE.GOV<span>${String(i + 1).padStart(2, '0')}<s> / ${N}</s></span></div>
<div class="body">${s.html}</div>
<div class="bot"><img src="${AVATAR}"><div><div class="n">${NOME}</div><div class="a">${ARROBA}</div></div>
<div class="dots">${Array.from({ length: N }, (_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>${i < N - 1 ? '<span class="next">ARRASTE →</span>' : ''}</div></main>`;

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (const [i, s] of slides.entries()) {
  await page.setContent(page_html(s, i));
  await page.evaluate(() => document.fonts.ready);
  const over = await page.evaluate(() => { const b = document.querySelector('.body'); return [b.scrollHeight - b.clientHeight, b.scrollWidth - b.clientWidth]; });
  if (over[0] > 1 || over[1] > 1) console.warn('overflow no slide', i + 1, over);
  await page.screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}.png`) });
}
await browser.close();
