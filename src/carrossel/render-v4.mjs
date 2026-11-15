// Carrossel V4 Fábrica GOV (preto premium + verde neon, 1080x1350) -> deliverables/carrossel-v4-fabrica-gov/
// Foto original em src/carrossel/foto.jpg (usada sem retoque: apenas enquadramento e degradê por cima).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../../deliverables/carrossel-v4-fabrica-gov');
const b64 = f => fs.readFileSync(path.join(dir, f)).toString('base64');
const FOTO = `data:image/jpeg;base64,${b64('foto.jpg')}`;
const AVATAR = `data:image/png;base64,${b64('avatar.png')}`;
const NOME = 'Arthur7dev', ARROBA = '@arthur_miguel_c022';
const N = 10;

const k = (n, t) => `<div class="kicker"><i></i>${String(n).padStart(2, '0')} — ${t}</div>`;
const slides = [
  { cls: 'cover dense', pre: `<div class="bg" style="background-image:url(${FOTO})"></div><div class="shade"></div>`,
    html: `<div class="grow"></div>${k(1, 'CAPA')}
    <h1 style="font-size:84px;margin-bottom:26px">TENHO <em>14 ANOS.</em><br>SOU DO INTERIOR DE MINAS.<br>E DECIDI CRIAR UMA<br><em>FÁBRICA DE SOFTWARE.</em></h1>
    <p><b>De Alvorada de Minas para o mundo da tecnologia.</b></p>
    <p>Uma história que começou com uma ideia e se transformou em um projeto para desenvolver soluções para o setor público.</p>
    <p class="punch">Essa é a história da V4 Fábrica GOV.</p>` },

  { cls: 'dense', html: `${k(2, 'ORIGEM')}
    <h1 style="font-size:90px">QUEM DISSE QUE A INOVAÇÃO PRECISA NASCER <em>EM UMA CAPITAL?</em></h1>
    <p>Nasci em uma realidade distante dos grandes centros tecnológicos.</p>
    <p><b>Sou de Alvorada de Minas, uma pequena cidade mineira.</b></p>
    <p>Enquanto muitos enxergavam distância dos grandes mercados, eu enxergava a possibilidade de criar algo sem fronteiras.</p>
    <div class="grow"></div>
    <p class="punch">Minha origem nunca precisou limitar o tamanho dos meus sonhos.</p>
    <div class="place"><i></i>ALVORADA DE MINAS<span>MINAS GERAIS · BRASIL</span></div>` },

  { cls: 'dense', html: `${k(3, 'A IDEIA')}
    <h1 style="font-size:96px">E SE UMA FÁBRICA DE SOFTWARE NÃO DEPENDESSE <em>APENAS DE PROGRAMADORES?</em></h1>
    <p>Comecei a pensar em uma estrutura diferente.</p>
    <p>Uma fábrica onde agentes de inteligência artificial pudessem participar do planejamento, da programação, dos testes e da documentação.</p>
    <div class="grow"></div>
    <div class="flow"><div><b>AGENTE</b><span>PLANEJAMENTO</span></div><u>+</u><div><b>AGENTE</b><span>PROGRAMAÇÃO</span></div><u>+</u><div><b>AGENTE</b><span>TESTES</span></div><u>+</u><div><b>AGENTE</b><span>DOCUMENTAÇÃO</span></div></div>
    <p class="punch">Não apenas uma IA respondendo perguntas. Uma estrutura de agentes trabalhando em conjunto.</p>` },

  { cls: 'dense', html: `${k(4, 'A CRIAÇÃO')}
    <h1><span class="over">FOI ASSIM QUE SURGIU A</span><em class="hero" style="font-size:210px">V4 FÁBRICA</em><em class="hero" style="font-size:210px">GOV.</em></h1>
    <div class="grow"></div>
    <p>Uma proposta de fábrica de software orientada por metodologias, automação e inteligência artificial.</p>
    <p>Criada para transformar demandas complexas em projetos organizados, com etapas definidas, acompanhamento técnico e entregas verificáveis.</p>
    <p class="punch">A ideia é simples: transformar necessidades em software de verdade.</p>` },

  { cls: 'dense', html: `${k(5, 'O MERCADO')}
    <h1 style="margin-bottom:30px"><em class="hero" style="font-size:150px;line-height:1.02">MUNICÍPIOS.<br>ESTADOS.<br>UNIÃO.</em><span class="under" style="font-size:62px;margin-top:18px">TRÊS ESFERAS, INÚMERAS DEMANDAS.</span></h1>
    <div class="cards3"><div><b>PREFEITURAS</b><span>precisam de sistemas.</span></div><div><b>GOVERNOS ESTADUAIS</b><span>precisam modernizar serviços.</span></div><div><b>ÓRGÃOS FEDERAIS</b><span>lidam com operações digitais complexas.</span></div></div>
    <div class="grow"></div>
    <p>A V4 Fábrica GOV foi pensada para atuar nesse cenário, desenvolvendo soluções conforme as necessidades e exigências de cada contratação.</p>
    <p class="punch">Do pequeno município aos grandes projetos públicos.</p>` },

  { cls: 'dense tight', html: `${k(6, 'COMO FUNCIONA')}
    <h1 style="font-size:72px;margin-bottom:22px">UMA DEMANDA ENTRA. <em>UMA OPERAÇÃO INTELIGENTE COMEÇA.</em></h1>
    <div class="dia">
      <div class="box"><b>ÓRGÃO PÚBLICO</b><span>Edital, contrato, ordem de serviço ou demanda</span></div><u>↓</u>
      <div class="box on"><b>V4 FÁBRICA GOV</b><span>Análise, planejamento e distribuição das tarefas</span></div><u>↓</u>
      <div class="row3"><div>ARQUITETURA</div><div>CÓDIGO</div><div>TESTES</div></div><u>↓</u>
      <div class="box out"><b>VALIDAÇÃO HUMANA E ENTREGA</b><span>Software testado, documentado e validado conforme os requisitos</span></div>
    </div>
    <div class="grow"></div>
    <p>Agentes especializados apoiam o desenvolvimento do banco de dados, backend, frontend, integrações, testes e documentação. Cada etapa passa por critérios de validação e supervisão humana.</p>
    <p class="punch">Não é simplesmente pedir um código à IA. É organizar uma engenharia de software.</p>` },

  { cls: 'dense', html: `${k(7, 'METODOLOGIA')}
    <h1 style="font-size:92px">A INTELIGÊNCIA ARTIFICIAL EXECUTA. <em>A METODOLOGIA ORGANIZA.</em></h1>
    <div class="pipe"><span><b>01</b>PLANEJAMENTO</span><span><b>02</b>AGENTES ESPECIALIZADOS</span><span><b>03</b>DESENVOLVIMENTO</span><span><b>04</b>REVISÃO</span><span><b>05</b>TESTES</span><span><b>06</b>SEGURANÇA</span><span class="on"><b>07</b>ENTREGA</span></div>
    <div class="grow"></div>
    <p>Com acompanhamento de demandas, rastreabilidade e medição de serviços por <b>UST, pontos de função ou horas técnicas</b>, conforme o contrato.</p>
    <p class="punch">A estratégia é transformar automação em produtividade com controle.</p>` },

  { cls: 'dense', html: `${k(8, 'TECNOLOGIA')}
    <h1 style="font-size:88px">NÃO É UM ÚNICO AGENTE. <em>É UMA FÁBRICA COM FUNÇÕES ESPECIALIZADAS.</em></h1>
    <div class="agents"><div><b>AGENTE 01</b>ARQUITETURA</div><div><b>AGENTE 02</b>PROGRAMAÇÃO</div><div><b>AGENTE 03</b>BANCO DE DADOS</div><div><b>AGENTE 04</b>QUALIDADE</div><div><b>AGENTE 05</b>SEGURANÇA</div><div><b>AGENTE 06</b>DOCUMENTAÇÃO</div></div>
    <div class="human">REVISÃO TÉCNICA · RESPONSABILIDADE HUMANA</div>
    <div class="grow"></div>
    <p>Todos organizados em fluxos de trabalho, com integração entre as etapas e revisão técnica.</p>
    <p class="punch">A visão é fazer a tecnologia trabalhar de forma coordenada, sem abrir mão da responsabilidade humana.</p>` },

  { cls: 'who dense tight', html: `<div class="pic"><div style="background-image:url(${FOTO})"></div></div>
    ${k(9, 'O FUNDADOR')}
    <h1 style="font-size:80px;margin-bottom:24px">POR TRÁS DESSA VISÃO, <em>UM JOVEM MINEIRO DE 14 ANOS.</em></h1>
    <p>Não sou de São Paulo. Não sou do Vale do Silício. <b>Sou de Alvorada de Minas.</b></p>
    <p>E acredito que uma grande ideia pode surgir em qualquer lugar, independentemente da idade de quem a teve.</p>
    <p class="punch">Não quero que minha idade seja o maior destaque. Quero que a tecnologia que estou construindo fale por mim.</p>` },

  { cls: 'dense', html: `${k(10, 'ENCERRAMENTO')}
    <h1 style="font-size:100px">E SE A PRÓXIMA GRANDE INOVAÇÃO DO SETOR PÚBLICO VIESSE <em>DO INTERIOR DE MINAS?</em></h1>
    <p><b>Tenho 14 anos. Uma origem simples. Uma visão ambiciosa.</b></p>
    <p>E um projeto que pretende unir inteligência artificial, engenharia de software e transformação digital do governo.</p>
    <div class="grow"></div>
    <div class="cta end"><span>DE ALVORADA DE MINAS PARA O FUTURO DA TECNOLOGIA PÚBLICA</span>V4 FÁBRICA GOV.<small>E isso é só o começo.</small></div>` },
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

.dense p{font-size:32px;line-height:1.34}.dense p+p{margin-top:18px}.tight p{font-size:29px}
p.punch{color:#fff;font-weight:700;border-left:5px solid ${G};padding-left:24px;margin-top:28px!important}
.cover .bg{background-position:center -36px;background-size:100% auto;background-repeat:no-repeat}
.cover .shade{background:linear-gradient(180deg,#040404cc 0,#04040400 13%,#04040400 31%,#040404c7 40%,#040404f7 47%,#040404 60%)}
.place{display:flex;align-items:center;gap:20px;font-family:Anton;font-size:64px;margin-top:40px;padding-top:30px;border-top:2px solid #ffffff24;white-space:nowrap}
.place i{width:22px;height:22px;border-radius:50%;background:${G};box-shadow:0 0 0 10px #c6ff2e2e,0 0 30px ${G};margin:0 8px}
.place span{margin-left:auto;font-family:Inter;font-size:19px;font-weight:800;letter-spacing:3px;color:#6d7278}
.dense .flow{margin-bottom:6px}.dense .flow span{font-size:29px}.dense .flow b{margin-bottom:26px;font-size:19px}
.cards3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.cards3 div{border:2px solid #ffffff2b;border-radius:18px;padding:20px 20px 22px}
.cards3 b{display:block;font-family:Anton;font-weight:400;font-size:34px;color:${G};margin-bottom:8px;white-space:nowrap}
.cards3 span{font-size:25px;line-height:1.25;color:#cfd3d8;display:block}
.dia{display:flex;flex-direction:column;align-items:stretch}
.dia u{text-decoration:none;text-align:center;color:${G};font-size:28px;font-weight:800;line-height:32px}
.dia .box{border:2px solid #ffffff38;border-radius:16px;padding:14px 26px 16px;display:flex;align-items:baseline;gap:22px}
.dia .box b{font-family:Anton;font-weight:400;font-size:40px;white-space:nowrap}.dia .box span{font-size:23px;color:#cfd3d8;line-height:1.25}
.dia .on{border-color:${G};box-shadow:0 0 40px #c6ff2e33 inset}.dia .on b{color:${G}}
.dia .out{background:${G};border-color:${G}}.dia .out b,.dia .out span{color:#040404}.dia .out span{font-weight:650}
.row3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.row3 div{border:2px dashed #c6ff2e99;border-radius:16px;padding:14px 0;text-align:center;font-family:Anton;font-size:36px;color:${G}}
.pipe{display:flex;flex-wrap:wrap;gap:12px}
.pipe span{font-family:Anton;font-size:44px;border:2px solid #ffffff2b;border-radius:14px;padding:12px 22px 14px;display:flex;align-items:center;gap:14px}
.pipe b{font-family:Inter;font-size:19px;font-weight:800;letter-spacing:2px;color:${G}}
.pipe .on{background:${G};border-color:${G};color:#040404}.pipe .on b{color:#040404}
.agents{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.agents div{border:2px solid #ffffff2b;border-radius:18px;padding:20px 20px 22px;font-family:Anton;font-size:36px;white-space:nowrap}
.agents b{display:block;font-family:Inter;font-size:18px;font-weight:800;letter-spacing:3px;color:${G};margin-bottom:22px}
.human{margin-top:14px;border:2px solid ${G};border-radius:18px;padding:16px;text-align:center;font-size:22px;font-weight:800;letter-spacing:4px;color:${G}}
.who.tight .pic{height:400px;margin-bottom:36px}.who.tight .pic div{background-position:center 5%}.who.tight p{font-size:31px}
.cta.end{font-size:132px;line-height:1.05}.cta.end span{font-size:19px;letter-spacing:3px;margin-bottom:10px}
.cta.end small{font-family:Inter;font-size:30px;font-weight:800;letter-spacing:0;color:#040404;margin-top:8px}
`;
const grain = `<svg class="grain" width="1080" height="1350"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;

const page_html = (s, i) => `<!doctype html><meta charset="utf-8"><style>${css}</style><body class="${s.cls || ''}">
${s.pre || ''}<div class="glow"></div>${grain}<div class="edge"></div><main>
<div class="top"><i></i>V4 FÁBRICA GOV<span>${String(i + 1).padStart(2, '0')}<s> / ${N}</s></span></div>
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
