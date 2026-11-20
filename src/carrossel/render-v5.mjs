// Anúncio 6 soluções V4 fábricagov (preto premium + verde neon, 1080x1350) -> deliverables/carrossel-v4-fabricagov-solucoes/
// Foto original em src/carrossel/foto.jpg (usada sem retoque: apenas enquadramento e degradê por cima).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../../deliverables/carrossel-v4-fabricagov-solucoes');
const b64 = f => fs.readFileSync(path.join(dir, f)).toString('base64');
const FOTO = `data:image/jpeg;base64,${b64('foto.jpg')}`;
const AVATAR = `data:image/png;base64,${b64('avatar.png')}`;
const NOME = 'Arthur7dev', ARROBA = '@arthur_miguel_c022';

const k = (n, t) => `<div class="kicker"><i></i>${String(n).padStart(2, '0')} — ${t}</div>`;
const slides = [
  { cls: 'cover', pre: `<div class="bg" style="background-image:url(${FOTO})"></div><div class="shade"></div>`,
    html: `<div class="grow"></div><div class="logo"><b>V4</b><div><span>fábricagov</span><small>SOFTHOUSE</small></div></div>
    <h1 style="font-size:96px;margin-bottom:28px">SOMOS UMA STARTUP DE <em>2 ANOS</em> DO INTERIOR DE MINAS.</h1>
    <p class="punch">E criamos 6 soluções de inteligência artificial para reduzir custos de grandes empresas.</p>` },

  { html: `${k(2, 'O QUE MUDA')}
    <h1 style="font-size:96px">O QUE LEVAVA ANOS, MESES OU SEMANAS <em>AGORA LEVA MUITO MENOS.</em></h1>
    <p>Plataformas especializadas em pesquisa, engenharia, compras, gestão operacional e processamento de grandes volumes de dados.</p>
    <div class="grow"></div>
    <div class="gains"><div><b>−</b>DESPESAS</div><div><b>−</b>TEMPO</div><div><b>−</b>DESPERDÍCIO</div><div class="on"><b>+</b>PRODUTIVIDADE</div></div>
    <small class="note">Nos próximos slides: simulações com bases de despesa de referência. Valores ilustrativos.</small>` },

  { html: `${k(3, 'SOLUÇÃO 01 DE 06')}
    <h1 style="font-size:96px">IA DE PESQUISA E <em>INTELIGÊNCIA DE DADOS</em></h1>
    <p>Pesquisa, cruza e interpreta milhões de informações de diferentes fontes.</p>
    <ul class="ticks"><li>Pesquisa em bancos de dados e documentos</li><li>Compara preços, fornecedores e contratos</li><li>Produz estudos e relatórios automaticamente</li></ul>
    <div class="grow"></div>
    <div class="eco"><div class="l"><small>GASTO ANUAL COM PESQUISAS MANUAIS</small><b>R$ 1 MI</b><span>economia simulada de <strong>30%</strong></span></div>
    <div class="r"><small>ECONOMIA ANUAL SIMULADA</small><b>R$ 300 MIL</b><span>≈ R$ 25 mil por mês</span></div></div>
    <small class="note">Simulação ilustrativa. Não é economia garantida.</small>` },
  { html: `${k(4, 'SOLUÇÃO 02 DE 06')}
    <h1 style="font-size:90px">IA DE OBRAS, <em>ENGENHARIA E PLANEJAMENTO</em></h1>
    <p>Planeja, prepara e acompanha obras e projetos de engenharia.</p>
    <ul class="ticks"><li>Interpreta plantas e projetos</li><li>Estima materiais, custos e cronogramas</li><li>Identifica riscos e atrasos</li></ul>
    <div class="grow"></div>
    <div class="eco"><div class="l"><small>OBRAS EXECUTADAS POR ANO</small><b>R$ 10 MI</b><span>economia simulada de <strong>15%</strong></span></div>
    <div class="r"><small>ECONOMIA ANUAL SIMULADA</small><b>R$ 1,5 MI</b><span>≈ R$ 125 mil por mês</span></div></div>
    <small class="note">Simulação ilustrativa. Não é economia garantida.</small>` },
  { html: `${k(5, 'SOLUÇÃO 03 DE 06')}
    <h1 style="font-size:84px">IA DE COMPRA INTELIGENTE DE <em>MÁQUINAS E EQUIPAMENTOS</em></h1>
    <p>Pesquisa o mercado e encontra as melhores oportunidades de aquisição.</p>
    <ul class="ticks"><li>Pesquisa equipamentos novos e usados</li><li>Compara compra, financiamento e aluguel</li><li>Avalia o custo total de propriedade</li></ul>
    <div class="grow"></div>
    <div class="eco"><div class="l"><small>INVESTIMENTO ANUAL EM MÁQUINAS</small><b>R$ 5 MI</b><span>economia simulada de <strong>12%</strong></span></div>
    <div class="r"><small>ECONOMIA ANUAL SIMULADA</small><b>R$ 600 MIL</b><span>≈ R$ 50 mil por mês</span></div></div>
    <small class="note">Simulação ilustrativa. Não é economia garantida.</small>` },
  { html: `${k(6, 'SOLUÇÃO 04 DE 06')}
    <h1 style="font-size:96px">IA DE GESTÃO DE <em>MÁQUINAS E SERVIÇOS</em></h1>
    <p>Administra máquinas, equipamentos, veículos e equipes operacionais.</p>
    <ul class="ticks"><li>Monitora máquinas em tempo real</li><li>Prevê falhas e manutenções</li><li>Identifica equipamentos parados e desperdícios</li></ul>
    <div class="grow"></div>
    <div class="eco"><div class="l"><small>GASTO ANUAL COM OPERAÇÃO E MANUTENÇÃO</small><b>R$ 4 MI</b><span>economia simulada de <strong>15%</strong></span></div>
    <div class="r"><small>ECONOMIA ANUAL SIMULADA</small><b>R$ 600 MIL</b><span>≈ R$ 50 mil por mês</span></div></div>
    <small class="note">Simulação ilustrativa. Não é economia garantida.</small>` },
  { html: `${k(7, 'SOLUÇÃO 05 DE 06')}
    <h1 style="font-size:96px">IA DE PROCESSAMENTO DE <em>DADOS PESADOS</em></h1>
    <p>Processa, organiza e cruza volumes gigantescos de dados empresariais.</p>
    <ul class="ticks"><li>Processa bilhões de registros</li><li>Cruza grandes bancos e integra sistemas</li><li>Consultas inteligentes em linguagem natural</li></ul>
    <div class="grow"></div>
    <div class="eco"><div class="l"><small>GASTO ANUAL COM INFRAESTRUTURA DE DADOS</small><b>R$ 2 MI</b><span>economia simulada de <strong>20%</strong></span></div>
    <div class="r"><small>ECONOMIA ANUAL SIMULADA</small><b>R$ 400 MIL</b><span>≈ R$ 33,3 mil por mês</span></div></div>
    <small class="note">Simulação ilustrativa. Não é economia garantida.</small>` },
  { html: `${k(8, 'SOLUÇÃO 06 DE 06')}
    <h1 style="font-size:82px">IA DE GESTÃO INTEGRADA DE <em>COMPRAS, CONTRATOS E OPERAÇÕES</em></h1>
    <p>Da necessidade de compra até a conclusão do serviço.</p>
    <ul class="ticks"><li>Pesquisa fornecedores e analisa propostas</li><li>Acompanha contratos, entregas e estoque</li><li>Monitora custos previstos e realizados</li></ul>
    <div class="grow"></div>
    <div class="eco"><div class="l"><small>CONTRATO DE 12 MESES</small><b>R$ 8 MI</b><span>economia simulada de <strong>10% dos custos controláveis</strong></span></div>
    <div class="r"><small>ECONOMIA ANUAL SIMULADA</small><b>R$ 800 MIL</b><span>≈ R$ 66,7 mil por mês</span></div></div>
    <small class="note">Simulação ilustrativa. Não é economia garantida.</small>` },
  { html: `${k(9, 'O POTENCIAL SOMADO')}
    <h1><span class="over">ECONOMIA ANUAL SIMULADA</span><em class="hero" style="font-size:168px">R$ 4,2 MI</em><span class="under" style="font-size:52px">≈ R$ 350 MIL POR MÊS</span></h1>
    <div class="grow"></div>
    <div class="tab"><div><span>Pesquisa e inteligência</span><b>R$ 300 mil</b></div><div><span>Obras e engenharia</span><b>R$ 1,5 mi</b></div><div><span>Compra de máquinas</span><b>R$ 600 mil</b></div><div><span>Gestão de máquinas</span><b>R$ 600 mil</b></div><div><span>Processamento de dados</span><b>R$ 400 mil</b></div><div><span>Gestão integrada</span><b>R$ 800 mil</b></div></div>
    <small class="note">Soma de operações distintas, sem sobreposição. Na prática é preciso validar os custos e descontar a implantação.</small>` },

  { html: `${k(10, 'O ARGUMENTO')}
    <h1 style="font-size:100px">NÃO É SÓ SOFTWARE. <em>É RESULTADO FINANCEIRO MENSURÁVEL.</em></h1>
    <div class="grow"></div>
    <div class="roi"><div><small>IMPLANTAÇÃO</small><b>R$ 200 MIL</b></div><u>→</u><div><small>ECONOMIA COMPROVADA</small><b>R$ 1 MI/ANO</b></div><u>=</u><div class="on"><small>BENEFÍCIO LÍQUIDO NO 1º ANO</small><b>R$ 800 MIL</b></div></div>
    <small class="note">Exemplo, antes de outros custos recorrentes.</small>` },

  { cls: 'end', html: `<div class="grow"></div><div class="logo"><b>V4</b><div><span>fábricagov</span><small>SOFTHOUSE</small></div></div>
    <h1 style="margin-bottom:40px"><span class="over" style="font-size:72px">COMPARTILHE ESTE POST E GANHE</span><em class="hero" style="font-size:330px;line-height:1">80%</em><span class="under" style="font-size:72px">DE DESCONTO NO SISTEMA.</span></h1>
    <div class="cta">V4 FÁBRICAGOV<small>Inteligência artificial que reduz custos. Do interior de Minas para grandes empresas.</small></div>
    <div class="grow"></div>` },
];
const N = slides.length;

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

p+p{margin-top:22px}p.punch{font-size:44px;line-height:1.22;letter-spacing:-.8px}
.dia .box{flex-direction:column;align-items:flex-start;gap:4px;padding:20px 28px 22px}.dia .box b{font-size:46px}.dia .box span{font-size:26px}
.dia u{line-height:44px}.row3 div{padding:20px 0;font-size:40px}
.steps7{display:flex;flex-direction:column}.steps7 span{font-family:Anton;font-size:54px;line-height:1.28;color:#fff;padding-left:26px;border-left:4px solid #ffffff2b}
.steps7 .on{color:${G};border-color:${G}}
.agents div{padding:34px 22px;font-size:38px;text-align:left}
.who .pic{height:470px}.who .pic div{background-position:center 8%}
.cta.end{font-size:126px}

.logo{display:flex;align-items:center;gap:20px;margin-bottom:34px;color:#fff}
.logo>b{font-family:Inter;font-weight:900;font-size:92px;letter-spacing:-6px;font-style:italic;line-height:1;padding-right:6px}
.logo span{display:block;font-size:56px;font-weight:500;letter-spacing:-1px;line-height:1}
.logo small{display:flex;align-items:center;gap:12px;font-size:16px;font-weight:800;letter-spacing:6px;color:#cfd3d8;margin-top:8px}
.logo small:before,.logo small:after{content:'';flex:1;height:2px;background:#cfd3d8}
.ticks{list-style:none;padding:0;margin-top:26px}.ticks li{font-size:34px;line-height:1.25;padding:14px 0 14px 46px;position:relative;color:#fff;border-top:1px solid #ffffff1f}
.ticks li:before{content:'';position:absolute;left:4px;top:27px;width:16px;height:8px;border-left:4px solid ${G};border-bottom:4px solid ${G};transform:rotate(-45deg)}
.eco{display:grid;grid-template-columns:1fr 1.25fr;gap:16px}
.eco>div{border-radius:20px;padding:24px 26px 26px;border:2px solid #ffffff2b}
.eco small,.roi small{display:block;font-size:17px;font-weight:800;letter-spacing:2.5px;color:#a9aeb5;margin-bottom:10px;line-height:1.3}
.eco .l b{display:block;font-family:Anton;font-weight:400;font-size:76px;line-height:1.05}
.eco span{display:block;font-size:24px;color:#cfd3d8;margin-top:6px}.eco strong{color:${G}}
.eco .r{border-color:${G};background:#c6ff2e12}.eco .r small{color:${G}}
.eco .r b{display:block;font-family:Anton;font-weight:400;font-size:104px;line-height:1.02;color:${G};white-space:nowrap;text-shadow:0 0 50px #c6ff2e40}
.note{margin-top:18px;font-size:20px;letter-spacing:.3px;font-weight:600;line-height:1.4;color:#8a8f96}
.gains{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.gains div{border:2px solid #ffffff2b;border-radius:20px;padding:20px 26px;font-family:Anton;font-size:46px;display:flex;align-items:center;gap:18px}
.gains b{font-family:Anton;font-weight:400;font-size:64px;color:${G};width:34px}
.gains .on{background:${G};border-color:${G};color:#040404}.gains .on b{color:#040404}
.tab div{display:flex;justify-content:space-between;align-items:baseline;padding:11px 0;border-top:1px solid #ffffff24;font-size:32px}
.tab div:last-child{border-bottom:1px solid #ffffff24}.tab b{font-family:Anton;font-weight:400;font-size:44px;color:${G}}
.roi{display:flex;flex-direction:column;gap:6px}.roi u{text-decoration:none;color:${G};font-size:40px;font-weight:800;text-align:center;line-height:1.1}
.roi div{border:2px solid #ffffff2b;border-radius:20px;padding:22px 28px;display:flex;justify-content:space-between;align-items:center;gap:20px}
.roi div small{margin:0}.roi b{font-family:Anton;font-weight:400;font-size:74px;line-height:1.05;white-space:nowrap}
.roi .on{background:${G};border-color:${G}}.roi .on small,.roi .on b{color:#040404}
.end .cta{font-size:72px;padding:30px 40px 34px}.end .cta small{display:block;font-family:Inter;font-size:28px;letter-spacing:0;line-height:1.3;font-weight:700;color:#040404;margin-top:10px}
`;
const grain = `<svg class="grain" width="1080" height="1350"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;

const page_html = (s, i) => `<!doctype html><meta charset="utf-8"><style>${css}</style><body class="${s.cls || ''}">
${s.pre || ''}<div class="glow"></div>${grain}<div class="edge"></div><main>
<div class="top"><i></i>V4 FÁBRICAGOV<span>${String(i + 1).padStart(2, '0')}<s> / ${String(N).padStart(2, '0')}</s></span></div>
<div class="body">${s.html}</div>
<div class="bot"><img src="${AVATAR}"><div><div class="n">${NOME}</div><div class="a">${ARROBA}</div></div>
${i < N - 1 ? '<span class="next" style="margin-left:auto">ARRASTE →</span>' : ''}</div></main>`;

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
