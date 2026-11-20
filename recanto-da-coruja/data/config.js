/* =====================================================================
   RECANTO DA CORUJA — dados do site (edite aqui; veja README.md, seção "Editar dados")
   ---------------------------------------------------------------------
   Fontes de cada dado confirmado estão em docs/RELATORIO_PESQUISA.md.
   null ou "" = ainda não confirmado: o site mostra "a confirmar".
   Os sabores são um CARDÁPIO SUGERIDO (receitas tradicionais), a validar
   com o proprietário, assim como os preços.
   ===================================================================== */
window.PIZZARIA_DADOS = {
  versao: 1,
  modoApresentacao: true,

  negocio: {
    nome: "Recanto da Coruja",
    nomeCurto: "Recanto da Coruja",
    slogan: "Pizzaria · Churrascaria · Pousada",
    descricao: "Pizza, churrasco e pousada no mesmo endereço, à beira da Estrada Real, em Alvorada de Minas.",
    cidade: "Alvorada de Minas",
    uf: "MG",
    cep: "39140-000",
    endereco: "Rua Ponte da Clara, s/n",                       // Trip.com / guia de turismo de MG
    referencia: "À esquerda da placa da Estrada Real",          // Trip.com
    whatsapp: "5531983582075",                                  // telefone publicado (Trip.com) — confirmar se é WhatsApp
    telefone: "(31) 98358-2075",
    instagram: "",
    facebook: "https://www.facebook.com/recantodacoruja.alvoradademinas/",
    googleMaps: "https://www.google.com/maps/search/?api=1&query=Recanto+da+Coruja+Alvorada+de+Minas+MG",
    googleAvaliar: "https://www.google.com/search?q=Recanto+da+Coruja+Alvorada+de+Minas+avalia%C3%A7%C3%B5es",
    mapaBusca: "Recanto da Coruja, Alvorada de Minas, MG",
    fundacao: "",
    historia: [
      "O Recanto da Coruja fica na área rural de Alvorada de Minas, na Rua Ponte da Clara, à esquerda da placa da Estrada Real. É um lugar para comer bem e descansar: pizzaria, churrascaria e pousada no mesmo endereço.",
      "A cidade está no Caminho dos Diamantes da Estrada Real, entre Conceição do Mato Dentro e o Serro, uma região de serras, cachoeiras e trilhas. Quem passa de carro, de moto ou de bicicleta encontra aqui mesa farta, piscina e cama arrumada."
    ],
    /* Estrutura citada pelo guia de turismo de MG e pelo Trip.com */
    estrutura: [
      { icone: "pool",  titulo: "Piscinas" },
      { icone: "kids",  titulo: "Playground" },
      { icone: "peteca",titulo: "Quadra de peteca" },
      { icone: "bed",   titulo: "10 quartos" },
      { icone: "wifi",  titulo: "Wi-Fi" },
      { icone: "car",   titulo: "Estacionamento" },
      { icone: "paw",   titulo: "Aceita pets" },
      { icone: "card",  titulo: "Cartão e dinheiro" }
    ],
    quartos: 10,
    checkin: "14:00",
    pagamentos: ["Cartão", "Dinheiro"],                         // guia de turismo de MG; Pix a confirmar
    entrega: { ativa: false, retirada: true, taxa: null, pedidoMinimo: null, tempoEstimado: "", area: "" }
  },

  horarios: [
    { dia: 0, nome: "Domingo", abre: null, fecha: null, fechado: false },
    { dia: 1, nome: "Segunda", abre: null, fecha: null, fechado: false },
    { dia: 2, nome: "Terça",   abre: null, fecha: null, fechado: false },
    { dia: 3, nome: "Quarta",  abre: null, fecha: null, fechado: false },
    { dia: 4, nome: "Quinta",  abre: null, fecha: null, fechado: false },
    { dia: 5, nome: "Sexta",   abre: null, fecha: null, fechado: false },
    { dia: 6, nome: "Sábado",  abre: null, fecha: null, fechado: false }
  ],

  tamanhos: [
    { id: "M", nome: "Média",   fatias: 6,  maxSabores: 2 },
    { id: "G", nome: "Grande",  fatias: 8,  maxSabores: 2 },
    { id: "F", nome: "Família", fatias: 12, maxSabores: 2 }
  ],
  regraMeioAMeio: "maior",

  categorias: [
    { id: "pizzas",  nome: "Pizzas",  tipo: "pizza" },
    { id: "doces",   nome: "Doces",   tipo: "pizza" },
    { id: "bebidas", nome: "Bebidas", tipo: "simples" }
  ],

  produtos: [
    { id: "mussarela", categoria: "pizzas", nome: "Mussarela", foto: "mussarela", descricao: "Molho de tomate, mussarela, tomate, orégano e azeitonas.", precos: { M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "calabresa", categoria: "pizzas", nome: "Calabresa", foto: "calabresa", descricao: "Molho de tomate, mussarela, calabresa fatiada, cebola e orégano.", precos: { M: null, G: null, F: null }, ativo: true, destaque: true },
    { id: "portuguesa", categoria: "pizzas", nome: "Portuguesa", foto: "portuguesa", descricao: "Presunto, ovos, cebola, ervilha, azeitonas e mussarela.", precos: { M: null, G: null, F: null }, ativo: true, destaque: true },
    { id: "frango-catupiry", categoria: "pizzas", nome: "Frango com Catupiry", foto: "frango", descricao: "Frango desfiado temperado, Catupiry e mussarela.", precos: { M: null, G: null, F: null }, ativo: true, destaque: true },
    { id: "margherita", categoria: "pizzas", nome: "Margherita", foto: "margherita", descricao: "Mussarela, tomate e manjericão fresco.", precos: { M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "quatro-queijos", categoria: "pizzas", nome: "Quatro Queijos", foto: "quatro-queijos", descricao: "Mussarela, provolone, parmesão e Catupiry.", precos: { M: null, G: null, F: null }, ativo: true, destaque: true },
    { id: "mineira", categoria: "pizzas", nome: "Mineira", foto: "especial", descricao: "Linguiça, milho, bacon e queijo minas.", precos: { M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "pepperoni", categoria: "pizzas", nome: "Pepperoni", foto: "pepperoni", descricao: "Mussarela e fatias de pepperoni.", precos: { M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "vegetariana", categoria: "pizzas", nome: "Vegetariana", foto: "vegetariana", descricao: "Pimentão, cebola, champignon, tomate e azeitonas.", precos: { M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "chocolate", categoria: "doces", nome: "Chocolate", foto: "chocolate", descricao: "Chocolate ao leite derretido com bombons.", precos: { M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "romeu-julieta", categoria: "doces", nome: "Romeu e Julieta", foto: null, descricao: "Queijo minas derretido com goiabada cascão.", precos: { M: null, G: null, F: null }, ativo: true, destaque: false },
    { id: "refri-2l", categoria: "bebidas", nome: "Refrigerante 2 L", foto: null, descricao: "Consulte os sabores.", preco: null, ativo: true },
    { id: "refri-lata", categoria: "bebidas", nome: "Refrigerante lata", foto: null, descricao: "Consulte os sabores.", preco: null, ativo: true },
    { id: "suco", categoria: "bebidas", nome: "Suco natural", foto: null, descricao: "Sabores da estação.", preco: null, ativo: true },
    { id: "agua", categoria: "bebidas", nome: "Água mineral", foto: null, descricao: "Com ou sem gás.", preco: null, ativo: true }
  ],

  promocoes: [],
  avaliacoes: [],
  galeria: ["forno-fogo", "churrasco-espetos", "queijo-puxa", "serra", "pizzaiolo", "churrasco-grelha", "rustica", "campo-por-do-sol", "forno-pa", "fatia-mao"]
};
