# GED — Gestão Eletrônica de Documentos · Filme publicitário (Digital Gov)

Peça audiovisual de **67 s** em motion graphics 3D, com narração em português brasileiro, trilha original,
sound design sincronizado, legendas e a logo oficial da Digital Gov aplicada sem alterações.

Conceito: **Do papel ao mundo digital** · Mensagem: **Seus documentos, disponíveis onde você estiver.**

## Entregáveis (`deliverables/`)

| Arquivo | Descrição |
|---|---|
| `GED_Digital_Gov_4K_HEVC.mp4` | Versão principal 3840×2160, 30 fps, 16:9, H.265 + AAC 320 kb/s, faixa de legenda opcional (pt-BR) |
| `GED_Digital_Gov_1080p.mp4` | 1920×1080 H.264 (compatibilidade máxima), faixa de legenda opcional |
| `GED_Digital_Gov_1080p_legendado.mp4` | 1080p com legendas embutidas (redes sociais / reprodução sem som) |
| `legendas_ptBR.srt` / `.vtt` | Legendas revisadas, sincronizadas com a narração real |
| `audio/mix_final_48k24.wav` | Mixagem final: −14 LUFS integrado, true peak ≤ −1 dBTP, 48 kHz / 24 bits |
| `audio/stem_narracao.flac` | Narração isolada, já tratada e posicionada no tempo |
| `audio/stem_trilha.flac` | Trilha completa sem ducking |
| `audio/stem_trilha_com_ducking.flac` | Trilha exatamente como está na mixagem (abaixa sob a fala) |
| `audio/stem_efeitos.flac` | Efeitos sonoros sincronizados |

Todos os stems têm a mesma duração e começam em 00:00, então basta alinhá-los no início da timeline de qualquer editor.

## Roteiro técnico (timeline)

| Tempo | Cena | Imagem | Texto na tela | Narração |
|---|---|---|---|---|
| 00:00–09:6 | 1 · Universo dos documentos | Travelling em arquivo físico escuro; papéis flutuam e se dissolvem em partículas; luz âmbar → azul | “Milhares de documentos. Uma nova maneira de gerenciar.” | “Imagine ter seus documentos: organizados, disponíveis e prontos, para serem encontrados.” |
| 09:6–18:6 | 2 · Transformação digital | Scanner 3D, barra de luz converte o papel; holograma com OCR, metadados e organização automática em pastas | “Digitalização inteligente. Organização. Agilidade.” | “Com a Gestão Eletrônica de Documentos, o GED, a informação deixa de ficar presa ao papel.” |
| 18:6–29:2 | 3 · GED em ação | Interface demonstrativa: pesquisa, pastas, indexação, visualização, histórico, fluxo, permissões | “Tudo organizado. Tudo mais fácil de encontrar.” | “Seus arquivos são digitalizados, organizados e indexados para facilitar a consulta e o gerenciamento.” |
| 29:2–43:2 | 4 · Acesso de qualquer lugar (principal) | Globo 3D com conexões; escritório, setor público, home office e viagem com a interface em monitor, notebook e tablet | “Seus documentos. Em qualquer lugar do mundo.” / “Acesse seus arquivos de onde estiver, quando precisar.” | “No escritório, em casa ou em qualquer lugar do mundo, você pode acessar seus documentos de forma prática, conforme suas permissões de acesso.” |
| 43:2–50:2 | 5 · Segurança e controle | Camadas de vidro, anéis orbitais, autenticação, perfis e registro de atividades (sem cadeados) | “Mais controle. Mais organização. Mais confiança.” | “Mais organização. Mais agilidade. Mais controle.” |
| 50:2–56:2 | 6 · O futuro é digital | O arquivo da cena 1 renasce como arquitetura de luz; câmera avança ao núcleo | “Transforme documentos em informação acessível.” | — (trilha cresce) |
| 56:2–67:0 | 7 · Assinatura | Partículas convergem; logo oficial surge em cartão branco com entrada 3D discreta | “GED — Gestão Eletrônica de Documentos” / “Organização inteligente. Acesso global. Gestão digital.” | “GED. Uma nova dimensão para a gestão documental.” + assinatura sonora |

## Decisões de direção

- **Logo**: usada a imagem original fornecida (`assets/logo-digitalgov.png`), sem redesenho, recorte ou recoloração.
  Como as letras da marca são azul-marinho, ela é apresentada sobre um cartão branco luminoso, preservando cores e
  legibilidade sobre o fundo tecnológico escuro. A rotação 3D de entrada termina exatamente plana (sem deformação final).
  **Observação:** o arquivo recebido tem 588×189 px; em 4K ele é exibido ampliado (~2×). Para nitidez máxima, envie a logo
  em vetor (SVG/PDF) ou PNG ≥ 2400 px de largura e rode o pipeline novamente — nada mais precisa mudar.
- **Interface**: é uma **interface demonstrativa ilustrativa** (identificada na própria tela), com dados fictícios. Não reproduz
  telas de nenhum produto existente. Substituível por capturas reais quando disponíveis.
- **Pessoas**: representadas como manequins estilizados em estilo “clay render” premium — evita rostos sintéticos artificiais.
- **Claims**: nenhuma certificação, criptografia ou disponibilidade absoluta é afirmada; o acesso remoto aparece sempre
  “conforme suas permissões de acesso”.

## Áudio

- **Narração**: voz neural pt-BR (Piper, modelo `pt_BR-faber-medium`), sintetizada frase a frase. “GED” é pronunciado
  “Gê-É-Dê”. Cada frase foi verificada por transcrição automática (Whisper) — inclusive na mixagem final — e todas as frases
  são reconhecidas integralmente. Tratamento: passa-altas, EQ de presença, compressão 3:1, micro-fades contra estalos.
- **Trilha**: composição original 100 % sintetizada (sem samples de terceiros), 100 BPM, Ré menor → resolução em Ré maior
  na assinatura. Pads, arpejo com delay, cordas sintéticas, baixo, percussão suave, riser + impacto na revelação do globo e
  na marca, e uma assinatura sonora de sinos (Lá–Ré–Fá♯) no encerramento.
- **Mixagem**: ducking automático da trilha (−9 dB) durante a fala — a voz fica 11–15 dB acima da música em todos os
  trechos falados —, compressão de barramento, limitador, −14 LUFS integrado, true peak ≤ −1 dBTP, fade-out limpo.

## Como reproduzir / editar

```bash
npm install                         # three.js, world-atlas, topojson-client
pip install piper-tts sherpa-onnx numpy scipy soundfile pyloudnorm pedalboard
python3 src/narration.py            # narração (requer o modelo de voz em voices/)
python3 src/audio.py                # trilha, efeitos, mixagem e stems
python3 src/subtitles.py            # legendas
node src/render.mjs --dpr 2 --out build/frames --workers 4   # quadros 4K (Chromium headless + WebGL)
bash src/assemble.sh                # vídeos finais + stems em deliverables/
```

- Textos na tela e tempos: `src/timeline.json` (fonte única para imagem, áudio e legendas).
- Narração: `src/narration.py` (texto da legenda e texto falado separados).
- Cenas: `src/web/scenes/s1_archive.js` … `s7_brand.js`. Prévia de quadros: `node src/render.mjs --stills 12.5,40 --out build/stills`.
- Modelo de voz: `vits-piper-pt_BR-faber-medium` (releases `tts-models` do projeto k2-fsa/sherpa-onnx) extraído em `voices/`.

---

# DigitalGov · Vídeo institucional (60 s)

Vídeo institucional de **60 s** (1920×1080, 30 fps) que segue o roteiro de 5 cenas: apresentação → digitalização →
indexação e organização → GED na prática → resultado e assinatura. Mostra o fluxo completo
**documento físico → preparação → digitalização → indexação → consulta no GED**, num único ambiente contínuo
(central de tratamento documental), com cortes secos entre planos, como num filme de câmera.

## Entregáveis (`deliverables/institucional/`)

| Arquivo | Descrição |
|---|---|
| `DigitalGov_Institucional_60s_1080p.mp4` | Versão principal, H.264 + AAC 320 kb/s, faixa de legenda opcional (pt-BR) |
| `DigitalGov_Institucional_60s_1080p_legendado.mp4` | Legendas embutidas (redes sociais / reprodução sem som) |
| `legendas_ptBR.srt` / `.vtt` | Legendas com o texto literal do roteiro, sincronizadas com a fala real |
| `audio/mix_final_48k24.wav` | Mixagem final −14 LUFS, true peak ≤ −1 dBTP |
| `audio/stem_*.flac` | Narração, trilha (com e sem ducking) e efeitos, separados |
| `DECUPAGEM_FILMAGEM_REAL.md` | Plano a plano para refazer com filmagem real usando a mesma trilha/locução |

## Roteiro técnico

| Tempo | Cena | Imagem | Destaque na tela |
|---|---|---|---|
| 0:00–0:08 | 1 · Apresentação | Logo oficial sobre branco → central de tratamento documental em funcionamento | — |
| 0:08–0:20 | 2 · Digitalização | Carrinho com caixas chega; retirada de grampos e montagem de lotes; scanner de produção; páginas surgindo no software de captura | 01 Digitalização |
| 0:20–0:32 | 3 · Indexação e organização | Equipe cadastra nº do processo, data, tipo documental, setor e palavras-chave; busca encontra o contrato | 02 Indexação · 03 Organização |
| 0:32–0:46 | 4 · GED na prática | Documento aberto, histórico, encaminhamento a outro setor; acesso pelo notebook e pelo celular | 04 GED |
| 0:46–1:00 | 5 · Resultado | Arquivo organizado, scanner, documento encontrado em instantes; cartela final | Logo + serviços + chamada |

## Decisões e limites

- **Não é filmagem real.** É computação gráfica 3D (Three.js) com luz natural, sombras suaves e materiais foscos.
  As pessoas são manequins sem rosto, para evitar rostos sintéticos artificiais. Para um resultado "filmado", use
  `DECUPAGEM_FILMAGEM_REAL.md`: a trilha, a locução e as legendas servem igualmente para a filmagem.
- **Telas**: interface **ilustrativa** (identificada como "Ambiente demonstrativo"), em tema claro e sóbrio, mostrando
  apenas as funções citadas no roteiro: captura, indexação, pesquisa, visualização, histórico, encaminhamento entre
  setores e acesso por perfil. Os dados são fictícios e genéricos. Se houver telas reais do sistema, substitua as funções
  `drawCapture`, `drawIndex`, `drawSearch`, `drawGed` e `drawMobile` em `src/web/inst/docs.js` por capturas reais.
- **Documentos** com texto real e legível (contrato, ofício, memorando, processo, requerimento genéricos), sem "texto falso".
- **Sem claims**: nenhum cliente, certificação, número de desempenho ou tempo de resposta.
- **Logo** original (`assets/logo-digitalgov.png`) exibida em tamanho nativo (1:1) sobre fundo branco, sem alterações.
- **Contatos**: o roteiro pede telefone, WhatsApp e site oficiais, que não foram fornecidos. A linha existe e fica vazia
  até ser preenchida em `src/inst/timeline.json` → `endcard.contacts`; depois basta renderizar a cena 5 de novo.

## Áudio

- **Locução**: voz neural pt-BR (Piper `pt_BR-cadu-medium`), com o texto literal do roteiro. A grafia fonética é usada
  só no texto enviado à voz ("Gê É Dê", "Digital Góvi", "pílias"). Para cada fala, a voz gera 6 tomadas, cada tomada
  é transcrita automaticamente (Whisper small) e fica a mais inteligível. O andamento foi ajustado (×1,07) para que o
  roteiro inteiro caiba em 60 s com respiro no final.
- **Trilha** original sintetizada, sem samples de terceiros: Ré maior, 96 BPM, piano elétrico, pads, cordas suaves e
  percussão discreta, com resolução e assinatura sonora na cartela. Ducking de −10 dB sob a voz.
- **Efeitos** sincronizados e discretos: carrinho, folhas, alimentação do scanner, teclado, cliques e confirmação do
  encaminhamento.

## Como reproduzir

```bash
python3 src/inst/narration.py --takes 6     # voz em voices/vits-piper-pt_BR-cadu-medium (+ ASR em voices/asr/)
python3 src/inst/audio.py                   # trilha, efeitos, mixagem e stems
python3 src/inst/subtitles.py               # legendas
node src/render.mjs --film inst --out build/inst_frames --workers 4    # 1.800 quadros 1080p
bash src/inst/assemble.sh                   # vídeos finais em deliverables/institucional/
```

Prévia de quadros: `node src/render.mjs --film inst --stills 5,15,25 --out build/stills`.
Cenas: `src/web/inst/i1_open.js` … `i5_end.js`; cenário: `room.js`; objetos e pessoas: `kit.js`; documentos e telas: `docs.js`.
