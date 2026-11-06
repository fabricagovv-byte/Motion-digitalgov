// Artes com pessoa ilustrada: novos serviços, a seleção de artes e o desenho da pessoa.
SIS.dados = { nome: 'Dados', c1: '#14B8A6', c2: '#0F766E', ic: ['🗂️', '🧹', '✅'], kpi: [], A: [
  ['TRATAMENTO DE DADOS', 'Dados limpos|por R$ 0,01', 'POR REGISTRO TRATADO', 'Organizamos cadastros, notas e planilhas.']] };
SIS.digital = { nome: 'Digitalização', c1: '#2E7DF6', c2: '#173E9C', ic: ['📄', '🔍', '✅'], kpi: [], A: [
  ['DIGITALIZAÇÃO DE DOCUMENTOS', 'Papel vira|arquivo digital', 'ACHE EM SEGUNDOS', 'Escaneie, organize e encontre qualquer documento.']] };
const PH_EXTRA = {
  dados: `<div class="card"><div class="sm">Base de cadastros</div><div class="bg">48.210 registros</div><div style="height:10px;border-radius:5px;background:#ffffff40;margin-top:12px"><div style="width:100%;height:100%;border-radius:5px;background:#fff"></div></div></div><div class="card"><div class="row"><span style="width:150px">Duplicados</span>3.102</div><div class="row"><span style="width:150px">Padronizados</span>100%</div><div class="row"><span style="width:150px">Por registro</span>R$ 0,01</div></div><div class="cta">Baixar base limpa</div>`,
  digital: `<div class="card" style="background:#ffffff40"><div style="font-size:19px;font-weight:700">🔍 contrato merenda 2019</div></div><div class="card"><div class="sm">Encontrado em 2 s</div><div style="font-size:21px;font-weight:700;margin-top:6px;line-height:1.3">Contrato nº 045/2019</div><div class="sm" style="margin-top:4px">página 3 · pasta Contratos</div></div><div class="cta">Abrir documento</div>`,
};
const ESCOLHA = [
  { k: 'pesquisa', a: SIS.pesquisa.A[0] }, { k: 'saude', a: SIS.saude.A[0] }, { k: 'juridico', a: SIS.juridico.A[0] },
  { k: 'aprendizagem', a: SIS.aprendizagem.A[0] }, { k: 'obras', a: ['THR · DRONE + SINAPI', 'Obra planejada|ficou fácil!', 'DOCUMENTOS PRONTOS', 'Fale o que quer construir e a IA monta o resto.'] },
  { k: 'engenheiro', a: SIS.engenheiro.A[0] }, { k: 'dados', a: SIS.dados.A[0] }, { k: 'digital', a: SIS.digital.A[0] },
  { k: 'pesquisa', a: ['PESQUISA NA AMAZÔNIA', 'Desmatamento|em queda', 'INPE · PRODES 2026', '3.335 km² em 2026, menor taxa desde 1988.'] },
  { k: 'v4', a: ['PAINEL DO GESTOR', 'A cidade inteira|em uma tela', 'TODOS OS SISTEMAS', 'Números de todas as áreas juntos.'] },
  { k: 'v4', a: SIS.v4.A[0] }, { k: 'v4', a: ['FALE COM A GENTE', 'Vamos|conversar?', '(31) 99827-7323', 'Peça sua demonstração.'] },
].map((x, j) => ({ ...x, j }));
const GENTE = [
  { skin: SKIN[3], hair: HAIR[0], hs: 'curly', beard: true }, { skin: SKIN[1], hair: HAIR[2], hs: 'long' }, { skin: SKIN[2], hair: HAIR[0], hs: 'longc', glasses: true },
  { skin: SKIN[0], hair: HAIR[3], hs: 'bun' }, { skin: SKIN[4], hair: HAIR[0], hs: 'buzz' }, { skin: SKIN[1], hair: HAIR[4], hs: 'short', glasses: true },
  { skin: SKIN[2], hair: HAIR[1], hs: 'short' }, { skin: SKIN[3], hair: HAIR[0], hs: 'longc' }, { skin: SKIN[1], hair: HAIR[1], hs: 'long' },
  { skin: SKIN[4], hair: HAIR[0], hs: 'curly', beard: true }, { skin: SKIN[0], hair: HAIR[2], hs: 'short', beard: true }, { skin: SKIN[2], hair: HAIR[0], hs: 'bun', glasses: true },
];
// pessoa grande no centro, apontando para o celular (como na referência)
function pessoaSVG() {
  const g = GENTE[N % GENTE.length], x = mir ? 470 : 610, top = shade(d.c2, -.15), calca = '#1F2A44';
  const p = person({ ...g, x, y: 1250, s: 1.72, flip: !mir, top, bot: calca, pose: 'point', short: N % 3 === 0 });
  return `<svg class="x" style="left:0;top:0;pointer-events:none" width="1080" height="1350" viewBox="0 0 1080 1350"><defs><linearGradient id="sombra" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>${p}</svg>`;
}
