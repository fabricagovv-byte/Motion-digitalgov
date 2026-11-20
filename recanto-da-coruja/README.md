# Recanto da Coruja: site, pedido pelo WhatsApp e vídeo

Site da pousada, pizzaria e churrascaria Recanto da Coruja (Alvorada de Minas – MG). A identidade é a "noite na Estrada Real": uma coruja cujos olhos seguem o cursor e piscam, e um movimento guiado pela rolagem.

## O que tem

- **Abertura**: a coruja abre os olhos com um contador, só na primeira visita da sessão. Depois as palavras do título sobem, a lua aparece e as etiquetas surgem com efeito de mola.
- **Vídeo** sem som que se abre com a rolagem (de cartão arredondado a tela cheia). O botão "Assistir com som" abre o vídeo promocional.
- **Faixa** que acelera e inclina conforme a velocidade da rolagem.
- **Manifesto** em que as palavras acendem com a rolagem.
- **Três cartões empilhados** (Pizzaria, Churrascaria, Pousada) que encolhem e escurecem quando o próximo chega.
- **Cardápio** por categorias, com montador de tamanho e meio a meio, e carrinho.
- **Pedido**: envio pelo WhatsApp (31) 98358-2075, com as opções "Retirar" ou "Comer no Recanto" e horário desejado.
- **Galeria horizontal** fixada na tela (no celular, rolagem lateral nativa), com ampliação das fotos.
- **Pousada**: estrutura com ícones, contador de quartos e botão de reserva pelo WhatsApp.
- **Como chegar**: endereço, referência, horários, links para o Google Maps e o Facebook, e uma rota animada.
- **Rodapé** com o letreiro gigante "Recanto da Coruja", em que as letras reagem ao passar do mouse.
- Cursor próprio e botões magnéticos (só com mouse). Rolagem suave com Lenis.
- **Acessibilidade**: com "reduzir movimento" ligado no aparelho, ou sem internet para as bibliotecas, o site fica completo e estático.

## Estrutura

```
index.html           página
css/site.css         estilos (tokens de cor e tipografia no topo)
js/dados.js          leitura dos dados e cálculo de preços (meio a meio)
js/pedido.js         cardápio, montador, carrinho e mensagem do WhatsApp
js/motion.js         animações (GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13, via CDN)
data/config.js       TODOS os dados editáveis: contatos, horários, sabores, preços
img/                 fotos em WebP (480/960/1600 px) + coruja.svg
video/               promo_16x9_1080p.mp4, promo_9x16_1080x1920.mp4, hero_720p.mp4
creditos.html        fontes de todas as imagens (gerado por tools/gerar_creditos.py)
preview/             prévia em arquivo único (gerada por tools/gerar_preview.py)
tools/               otimização de imagens, montagem do vídeo, trilha, prévia
docs/                relatório da pesquisa e instruções
```

## Editar dados

Abra `data/config.js`. O que está como `null` aparece no site como "a confirmar".

- **Preços**: `precos: { M: 45, G: 55, F: 70 }` em cada pizza; `preco: 12` nas bebidas.
- **Horários**: `abre: "18:00", fecha: "23:00"`, ou `fechado: true`.
- **Entrega**: `entrega.ativa: true` e `entrega.taxa: 5`.
- **Avaliações reais**: `{ autor: "Nome", texto: "…", fonte: "Google" }` em `avaliacoes`.
- Quando tudo estiver confirmado, mude `modoApresentacao` para `false` (some a faixa amarela).

## Publicar

É um site estático, sem servidor nem banco de dados. Funciona em qualquer hospedagem:

1. **Netlify ou Vercel** (grátis): arraste a pasta `recanto-da-coruja/` para app.netlify.com/drop.
2. **GitHub Pages**: publique a pasta como site do repositório.
3. **Hospedagem comum (cPanel)**: envie o conteúdo da pasta para `public_html/`.

Depois, aponte o domínio (ex.: recantodacoruja.com.br) e cadastre o endereço do site no Perfil da Empresa no Google.

## Regenerar materiais

```bash
python3 tools/otimizar_imagens.py <pasta_com_originais>    # fotos WebP
python3 tools/gerar_creditos.py                             # creditos.html
python3 tools/gerar_preview.py                              # preview/…html (arquivo único)
node tools/video/render_overlays.mjs build/ov               # legendas e cartela final do vídeo
python3 tools/video/trilha.py build/trilha.wav 20.2         # trilha original
python3 tools/video/montar_video.py --fontes <clipes> --overlays build/ov --trilha build/trilha.wav --saida video
```

O roteiro do vídeo está em `tools/video/cenas.json`. As cenas são: massa, recheio, cobertura, forno, queijo, brasa, servindo e cartela final com o telefone.
