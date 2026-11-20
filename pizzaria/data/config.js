/* =====================================================================
   DADOS DA PIZZARIA — edite aqui ou pelo painel (admin.html → Exportar)
   ---------------------------------------------------------------------
   Regra do projeto: nada foi inventado como fato. Campos com null ou ""
   ainda não foram confirmados com a pizzaria e aparecem no site como
   "a confirmar". Os sabores e descrições são um CARDÁPIO SUGERIDO com
   receitas tradicionais brasileiras, a ser validado pelo proprietário.
   ===================================================================== */
window.PIZZARIA_DADOS = {
  versao: 1,

  /* Enquanto true, o site exibe uma faixa "versão de apresentação" e marca
     exemplos como tais. Mude para false quando os dados estiverem confirmados. */
  modoApresentacao: true,

  negocio: {
    nome: "Forno Alvorada",            // NOME PROVISÓRIO — trocar pelo nome real
    nomeCurto: "Forno Alvorada",
    slogan: "Pizza artesanal na Estrada Real",
    descricao: "Pizzas assadas na hora, com ingredientes selecionados, para comer no salão ou receber em casa em Alvorada de Minas.",
    cidade: "Alvorada de Minas",
    uf: "MG",
    cep: "39140-000",
    endereco: "",                      // ex.: "Rua ..., 123 - Centro"
    whatsapp: "",                      // só números, com 55 + DDD. ex.: "5538999999999"
    telefone: "",                      // ex.: "(38) 3333-3333"
    instagram: "",                     // ex.: "https://instagram.com/usuario"
    facebook: "",
    googleMaps: "",                    // link "Compartilhar" do Google Maps
    googleAvaliar: "",                 // link para deixar avaliação no Google
    mapaBusca: "Alvorada de Minas, MG, Brasil", // texto usado no mapa incorporado
    fundacao: "",                      // ex.: "2015"
    historia: [
      "Este espaço é para contar a história da casa: quem fundou, quando abriu as portas, de onde vem a receita da massa e o que torna a pizza daqui diferente.",
      "Alvorada de Minas fica no Caminho dos Diamantes da Estrada Real, entre Conceição do Mato Dentro e o Serro, terra de queijo, de fogão a lenha e de receber bem. É desse jeito mineiro que a pizzaria quer servir quem é da cidade e quem está de passagem."
    ],
    diferenciais: [
      { icone: "flame", titulo: "Assada na hora", texto: "Cada pizza vai ao forno só depois do pedido." },
      { icone: "leaf",  titulo: "Ingredientes selecionados", texto: "Molho, queijo e coberturas escolhidos com cuidado." },
      { icone: "half",  titulo: "Meio a meio", texto: "Dois sabores na mesma pizza, do seu jeito." },
      { icone: "bike",  titulo: "Entrega ou retirada", texto: "Peça pelo site e finalize no WhatsApp." }
    ],
    pagamentos: [],                    // ex.: ["Pix", "Dinheiro", "Cartão de débito", "Cartão de crédito"]
    entrega: {
      ativa: true,
      retirada: true,
      taxa: null,                      // número em reais, ex.: 5  (null = a confirmar)
      pedidoMinimo: null,
      tempoEstimado: "",               // ex.: "40 a 60 min"
      area: ""                         // ex.: "Sede de Alvorada de Minas"
    }
  },

  /* Dias: 0 = domingo ... 6 = sábado. abre/fecha em "HH:MM". null = a confirmar. */
  horarios: [
    { dia: 0, nome: "Domingo", abre: null, fecha: null, fechado: false },
    { dia: 1, nome: "Segunda", abre: null, fecha: null, fechado: false },
    { dia: 2, nome: "Terça",   abre: null, fecha: null, fechado: false },
    { dia: 3, nome: "Quarta",  abre: null, fecha: null, fechado: false },
    { dia: 4, nome: "Quinta",  abre: null, fecha: null, fechado: false },
    { dia: 5, nome: "Sexta",   abre: null, fecha: null, fechado: false },
    { dia: 6, nome: "Sábado",  abre: null, fecha: null, fechado: false }
  ],

  /* Tamanhos de pizza. maxSabores define até quantos sabores cabem (meio a meio = 2). */
  tamanhos: [
    { id: "P", nome: "Pequena", fatias: 4,  maxSabores: 1 },
    { id: "M", nome: "Média",   fatias: 6,  maxSabores: 2 },
    { id: "G", nome: "Grande",  fatias: 8,  maxSabores: 2 },
    { id: "F", nome: "Família", fatias: 12, maxSabores: 2 }
  ],

  /* Como cobrar a pizza com 2 sabores: "maior" (vale o sabor mais caro) ou "media". */
  regraMeioAMeio: "maior",

  categorias: [
    { id: "tradicionais", nome: "Tradicionais", tipo: "pizza" },
    { id: "especiais",    nome: "Especiais",    tipo: "pizza" },
    { id: "doces",        nome: "Doces",        tipo: "pizza" },
    { id: "bebidas",      nome: "Bebidas",      tipo: "simples" }
  ],

  /* precos: { P: 0, M: 0, G: 0, F: 0 } — deixe null enquanto não confirmado. */
  produtos: [
    { id: "mussarela", categoria: "tradicionais", nome: "Mussarela", foto: "mussarela",
      descricao: "Molho de tomate, mussarela, tomate em rodelas, orégano e azeitonas.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "calabresa", categoria: "tradicionais", nome: "Calabresa", foto: "calabresa",
      descricao: "Molho de tomate, mussarela, calabresa fatiada, cebola e orégano.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: true },
    { id: "portuguesa", categoria: "tradicionais", nome: "Portuguesa", foto: "portuguesa",
      descricao: "Molho de tomate, mussarela, presunto, ovos, cebola, ervilha, azeitonas e orégano.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: true },
    { id: "margherita", categoria: "tradicionais", nome: "Margherita", foto: "margherita",
      descricao: "Molho de tomate, mussarela, tomate e manjericão fresco.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "napolitana", categoria: "tradicionais", nome: "Napolitana", foto: "napolitana",
      descricao: "Molho de tomate, mussarela, tomate, parmesão e manjericão.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "frango-catupiry", categoria: "tradicionais", nome: "Frango com Catupiry", foto: "frango",
      descricao: "Molho de tomate, mussarela, frango desfiado temperado e Catupiry.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: true },

    { id: "quatro-queijos", categoria: "especiais", nome: "Quatro Queijos", foto: "quatro-queijos",
      descricao: "Mussarela, provolone, parmesão e Catupiry sobre molho de tomate.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: true },
    { id: "pepperoni", categoria: "especiais", nome: "Pepperoni", foto: "pepperoni",
      descricao: "Molho de tomate, mussarela e fatias de pepperoni.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "mineira", categoria: "especiais", nome: "Mineira", foto: "especial",
      descricao: "Molho de tomate, mussarela, linguiça, milho, bacon e queijo minas.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: true },
    { id: "vegetariana", categoria: "especiais", nome: "Vegetariana", foto: "vegetariana",
      descricao: "Molho de tomate, mussarela, pimentão, cebola, champignon, tomate e azeitonas.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "caprese", categoria: "especiais", nome: "Caprese", foto: "caprese",
      descricao: "Molho de tomate, mussarela de búfala, tomate e folhas de manjericão.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: false },

    { id: "chocolate", categoria: "doces", nome: "Chocolate", foto: "chocolate",
      descricao: "Chocolate ao leite derretido com granulado ou bombons por cima.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "romeu-julieta", categoria: "doces", nome: "Romeu e Julieta", foto: null,
      descricao: "Queijo minas derretido com goiabada cascão. O clássico mineiro.",
      precos: { P: null, M: null, G: null, F: null }, ativo: true, destaque: false },

    { id: "refri-2l", categoria: "bebidas", nome: "Refrigerante 2 L", foto: null,
      descricao: "Consulte os sabores disponíveis.", preco: null, ativo: true },
    { id: "refri-lata", categoria: "bebidas", nome: "Refrigerante lata 350 ml", foto: null,
      descricao: "Consulte os sabores disponíveis.", preco: null, ativo: true },
    { id: "suco", categoria: "bebidas", nome: "Suco natural 500 ml", foto: null,
      descricao: "Sabores da estação.", preco: null, ativo: true },
    { id: "agua", categoria: "bebidas", nome: "Água mineral 500 ml", foto: null,
      descricao: "Com ou sem gás.", preco: null, ativo: true }
  ],

  /* exemplo: true = só aparece em modoApresentacao, com selo "Exemplo". */
  promocoes: [
    { id: "promo-1", titulo: "Terça da Família", texto: "Espaço para uma promoção fixa da semana, como um preço especial na pizza Família.", selo: "Toda terça", foto: "mesa", ativo: true, exemplo: true },
    { id: "promo-2", titulo: "Pizza + refri", texto: "Combo de pizza grande com refrigerante 2 L. Defina o preço no painel.", selo: "Combo", foto: "caixa", ativo: true, exemplo: true }
  ],

  /* Somente avaliações REAIS, copiadas do Google/Facebook com autorização. */
  avaliacoes: [],

  galeria: ["forno-fogo", "queijo-puxa", "pizzaiolo", "rustica", "caixas-pilha", "forno-pa", "fatia-mao", "ambiente", "pa-forno", "mesa"]
};
