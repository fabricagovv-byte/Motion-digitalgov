# Monta a versão completa (ampliada) da proposta para Ibiá: proposta_completa.html
style = open('style.css.part').read()
extra = """<style>
.cards{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin:2mm 0 4mm}
.card{border:1px solid #CBD3DF;border-left:5px solid var(--c);padding:3mm 4mm;background:#fff;page-break-inside:avoid}
.card b{display:block;color:#26305E;font-size:10.4pt;margin-bottom:1mm}
.card span{font-size:9.2pt;color:#222}
.callout{background:#EAF2FB;border-left:5px solid #1BA3DD;padding:3mm 4mm;margin:2mm 0 4mm;font-size:10pt}
.callout b{color:#26305E}
.toc td{background:#fff!important;border:none;border-bottom:1px dotted #9AA7BC;padding:1.6mm 1mm;font-size:10pt}
.toc td.n{width:9mm;font-weight:700;color:#1BA3DD}
.qa{margin:0 0 3mm;page-break-inside:avoid}
.qa b{display:block;color:#26305E;margin-bottom:.6mm}
.pb{break-before:page;margin-top:0}
</style>"""

N = [0]
def sec(title, pb=True):
    N[0] += 1
    st = ' style="break-before:page;margin-top:0"' if pb else ''
    return f'<div class="sec"{st}><div class="n">{N[0]}</div><div class="t">{title}</div></div>'

def table(head, rows, widths=None, kcol=True):
    h = ''.join(f'<th{f" style=\"width:{widths[i]}\"" if widths and widths[i] else ""}>{x}</th>' for i, x in enumerate(head))
    body = ''
    for r in rows:
        body += '<tr>' + ''.join(
            f'<td class="{"k" if (i == 0 and kcol) else ("fill" if c == "@fill" else "")}">{"" if c == "@fill" else c}</td>'
            for i, c in enumerate(r)) + '</tr>'
    return f'<table><tr>{h}</tr>{body}</table>'

def cards(items):
    cols = ['#1BA3DD', '#F5A623', '#8DC63F', '#E8336D', '#26305E', '#7B61C9']
    return '<div class="cards">' + ''.join(
        f'<div class="card" style="--c:{cols[i % len(cols)]}"><b>{t}</b><span>{d}</span></div>' for i, (t, d) in enumerate(items)) + '</div>'

TOC = ['Apresentação e resumo', 'Por que restaurar: benefícios para o município', 'O que é restauração digital',
       'Como funciona', 'O processo passo a passo', 'Controle de qualidade', 'Qualidade: antes e depois',
       'O que a Prefeitura recebe', 'No dia a dia: exemplos de uso', 'Preço por página', 'Estimativa para Ibiá',
       'Etapas e prazos', 'Segurança e LGPD', 'Por que a DigitalGov', 'Perguntas frequentes',
       'Condições comerciais', 'Aceite e assinaturas']

H = []
H.append('<h1>PROPOSTA COMERCIAL</h1><div class="sub">Restauração e digitalização de documentos — Prefeitura Municipal de Ibiá – MG | Proposta nº ___/2026 | Versão completa</div>')
H.append('''<table class="sum"><tr><th style="width:42%">OBJETO</th><th>PREÇO POR PÁGINA</th><th>ESTIMATIVA PARA IBIÁ</th></tr>
<tr><td><b>Restauração digital do acervo documental</b> com entrega da página restaurada e do texto transcrito, acesso seguro e exportação</td>
<td><b>A0: R$ 7,00</b><br><b>A3: R$ 0,75</b><br>por página</td>
<td><b>10 mil páginas:</b> R$ 7.500 a R$ 70.000<br><b>50 mil páginas:</b> R$ 37.500 a R$ 350.000<br>conforme o formato</td></tr></table>''')
H.append('<div class="lab">SUMÁRIO</div><table class="toc">' + ''.join(
    f'<tr><td class="n">{i+1}</td><td>{t}</td></tr>' for i, t in enumerate(TOC)) + '</table>')

# 1
H.append(sec('APRESENTAÇÃO E RESUMO'))
H.append('''<p>A DigitalGov apresenta à Prefeitura Municipal de Ibiá esta proposta de <b>restauração e digitalização do acervo documental</b>. Prefeituras guardam em papel a história e os direitos da cidade e dos cidadãos: atas da Câmara, leis e decretos, processos, registros funcionais, plantas de loteamentos e projetos de obras. Com o tempo, esse papel sofre com umidade, mofo, amarelamento e tinta apagada, e cada consulta exige horas no arquivo físico.</p>
<p>A solução da DigitalGov transforma cada página em <b>duas entregas digitais</b>: a imagem restaurada, limpa e legível, e o texto transcrito, que pode ser pesquisado por palavra. Tudo fica organizado numa plataforma de acesso seguro, pelo computador ou celular, e o papel original é preservado.</p>''')
H.append(table(['Tema', 'Resumo'], [
    ['Objeto', 'Restauração e digitalização de documentos do acervo municipal (atas, leis, processos, livros, plantas e mapas).'],
    ['O que é entregue', 'Para cada página: <b>imagem restaurada</b> + <b>texto limpo transcrito</b>, com busca por palavra e exportação em PDF, imagem ou texto.'],
    ['Preço', '<b>R$ 7,00</b> por página em formato A0 e <b>R$ 0,75</b> por página em formato A3.'],
    ['Estimativa 10 mil páginas', 'R$ 7.500,00 (todas A3) a R$ 70.000,00 (todas A0).'],
    ['Estimativa 50 mil páginas', 'R$ 37.500,00 (todas A3) a R$ 350.000,00 (todas A0).'],
    ['Benefício principal', 'Acervo preservado, encontrado em segundos e disponível para atender cidadãos, órgãos de controle e a própria administração.'],
    ['Segurança', 'Acesso por usuário e senha, controle por setor e tratamento de dados conforme a LGPD.'],
    ['Próximo passo', 'Diagnóstico do acervo para confirmar a quantidade de páginas por formato e fechar o valor final.'],
], ['30%', None]))

# 2 benefícios
H.append(sec('POR QUE RESTAURAR: BENEFÍCIOS PARA O MUNICÍPIO'))
H.append('<p>Restaurar e digitalizar o acervo não é só uma questão de organização. É uma forma de proteger a memória de Ibiá, atender melhor o cidadão e dar mais segurança às decisões da administração.</p>')
H.append(cards([
    ('Memória da cidade preservada', 'Documentos históricos deixam de se perder com o tempo. A versão digital fica guardada mesmo se o papel sofrer com umidade, mofo, enchente ou incêndio.'),
    ('Atendimento mais rápido ao cidadão', 'Pedidos de certidões, cópias de atas, leis antigas e históricos são respondidos em minutos, sem procurar caixa por caixa.'),
    ('Transparência e acesso à informação', 'Facilita responder pedidos pela Lei de Acesso à Informação e publicar documentos de interesse público.'),
    ('Mais tempo para os servidores', 'Menos horas gastas procurando papéis no arquivo. A equipe se dedica ao atendimento e às tarefas da Prefeitura.'),
    ('Segurança jurídica', 'Plantas, processos e registros ficam legíveis e fáceis de achar para comprovar direitos, regularizar imóveis e instruir processos.'),
    ('Continuidade da gestão', 'O conhecimento não depende de quem “sabe onde está o papel”. Qualquer gestão encontra o que precisa.'),
    ('Preservação do original', 'Com a consulta feita no digital, o papel antigo é menos manuseado e dura mais.'),
    ('Base para um governo digital', 'O acervo em texto pesquisável pode alimentar outros sistemas, portais e serviços online da Prefeitura.'),
]))
H.append('<div class="lab">BENEFÍCIOS POR ÁREA DA PREFEITURA</div>')
H.append(table(['Área', 'Como a restauração ajuda'], [
    ['Gabinete e Administração', 'Acesso rápido a decretos, portarias, contratos e histórico de decisões.'],
    ['Câmara e Legislação', 'Atas e leis antigas legíveis e pesquisáveis por assunto, data ou nome.'],
    ['Obras e Urbanismo', 'Plantas de loteamentos e projetos em A0 recuperados para regularização fundiária e novas obras.'],
    ['Recursos Humanos', 'Fichas funcionais e históricos para aposentadorias, certidões de tempo de serviço e auditorias.'],
    ['Fazenda e Tributos', 'Cadastros e processos antigos de imóveis encontrados com rapidez.'],
    ['Cultura e Turismo', 'Documentos históricos prontos para exposições, pesquisas e divulgação da história de Ibiá.'],
], ['32%', None]))
H.append('<div class="callout"><b>Base legal.</b> A Constituição Federal (art. 216, § 2º) atribui à administração pública a gestão da documentação governamental e o acesso a ela. A Lei 8.159/1991 trata da gestão e proteção dos documentos de arquivo; a Lei 12.527/2011 (Lei de Acesso à Informação) garante ao cidadão o acesso às informações públicas; a Lei 12.682/2012 e o Decreto 10.278/2020 tratam da digitalização de documentos. A forma de contratação e a eventual eliminação de originais devem seguir a orientação jurídica e arquivística do município.</div>')

# 3 o que é
H.append(sec('O QUE É RESTAURAÇÃO DIGITAL', pb=False))
H.append('<p>A restauração digital trabalha sobre a <b>imagem</b> do documento, não sobre o papel. A página é digitalizada e o software corrige os defeitos na versão digital. O original físico não recebe produtos químicos nem intervenções e volta para o arquivo como estava.</p>')
H.append(table(['', 'Restauração física (tradicional)', 'Restauração digital (DigitalGov)'], [
    ['Onde atua', 'No próprio papel, em laboratório', 'Na imagem digital da página'],
    ['Risco ao original', 'Exige manuseio especializado', 'Nenhuma intervenção no papel'],
    ['Velocidade', 'Página a página, manual', 'Em lote, milhares de páginas'],
    ['Texto pesquisável', 'Não', 'Sim, texto transcrito de cada página'],
    ['Acesso', 'No arquivo físico', 'Computador ou celular, com senha'],
    ['Indicação', 'Peças raras que precisam de conservação física', 'Acervo administrativo e histórico em geral'],
], ['22%', '39%', '39%']))
H.append('<p class="note">As duas formas podem ser combinadas: documentos raros em estado crítico podem receber conservação física especializada, contratada à parte.</p>')

# 4 como funciona (fluxo da versão anterior)
H.append(sec('COMO FUNCIONA'))
H.append(open('flow.part').read())

# 5 passo a passo
H.append(sec('O PROCESSO PASSO A PASSO', pb=False))
H.append('<p>Cada etapa tem um responsável e um resultado verificável. A Prefeitura acompanha o andamento dos lotes pela plataforma.</p>')
H.append(table(['Etapa', 'O que acontece', 'Quem', 'Resultado'], [
    ['1. Reunião inicial', 'Alinhamento de objetivos, setores envolvidos e prioridades (o que restaurar primeiro).', 'DigitalGov + Prefeitura', 'Plano de trabalho'],
    ['2. Diagnóstico', 'Levantamento do acervo: quantidade de páginas, formatos (A3 ou A0), estado de conservação e local de guarda.', 'DigitalGov', 'Quantitativo e valor final'],
    ['3. Inventário e lotes', 'Divisão do acervo em lotes por setor, tipo e período, com controle de saída e retorno.', 'DigitalGov + Prefeitura', 'Lista de lotes'],
    ['4. Preparação', 'Organização e conferência das páginas antes da captura, sem danificar o original.', 'DigitalGov', 'Lote pronto para captura'],
    ['5. Captura', 'Digitalização em scanner adequado ao formato (A3 ou A0) ou fotos pela plataforma.', 'DigitalGov', 'Imagem original de cada página'],
    ['6. Restauração', 'Remoção de manchas, correção de cor, recuperação do texto, endireitamento e limpeza.', 'Software DigitalGov', 'Página restaurada'],
    ['7. Transcrição', 'Leitura do texto da página restaurada e revisão.', 'Software + revisão', 'Texto limpo pesquisável'],
    ['8. Indexação', 'Registro de tipo, data, órgão e palavras-chave de cada documento.', 'DigitalGov', 'Busca por filtros'],
    ['9. Conferência', 'Controle de qualidade do lote (seção 6) e aprovação pela Prefeitura.', 'DigitalGov + Prefeitura', 'Lote aprovado'],
    ['10. Publicação', 'Disponibilização na plataforma, com permissões por setor.', 'DigitalGov', 'Acervo disponível'],
    ['11. Devolução', 'Retorno dos originais ao arquivo, na ordem em que foram entregues.', 'DigitalGov', 'Termo de devolução'],
    ['12. Treinamento e suporte', 'Capacitação dos servidores e suporte no uso da plataforma.', 'DigitalGov', 'Equipe usando o acervo'],
], ['19%', '43%', '18%', '20%']))

# 6 qualidade
H.append(sec('CONTROLE DE QUALIDADE', pb=False))
H.append('<p>Cada lote passa por conferência antes de ser entregue. Um lote só é faturado depois de aprovado pela Prefeitura.</p>')
H.append(table(['Verificação', 'Como é feita'], [
    ['Página completa', 'Conferência da quantidade de páginas do lote contra o inventário.'],
    ['Legibilidade', 'Amostragem de páginas restauradas para confirmar que o texto está legível.'],
    ['Fidelidade', 'Comparação lado a lado com a imagem original, que fica guardada.'],
    ['Texto transcrito', 'Revisão por amostragem do texto gerado e correção dos trechos com erro.'],
    ['Indexação', 'Conferência de tipo, data e órgão de cada documento.'],
    ['Aprovação', 'A Prefeitura confere o lote na plataforma e aprova ou pede ajustes.'],
], ['30%', None]))
H.append('<div class="callout"><b>Original sempre guardado.</b> A imagem original, sem tratamento, fica arquivada junto da versão restaurada. Assim, qualquer dúvida pode ser conferida com a página como ela foi digitalizada.</div>')

# 7 antes e depois
H.append(sec('QUALIDADE: ANTES E DEPOIS', pb=False))
H.append('<div class="avoid"><p><b>Exemplo 1 — Ata em formato A3.</b> Página com manchas de umidade, papel amarelado, tinta desbotada e folha torta.</p>')
H.append('<div class="fig"><img src="antes_depois.jpg" alt="Antes e depois — ata"><div class="cap">Documento simulado para demonstração. A imagem “depois” foi gerada processando a imagem “antes”.</div></div></div>')
H.append('<div class="avoid"><p style="margin-top:4mm"><b>Exemplo 2 — Planta em formato A0.</b> Planta de loteamento com manchas, dobras e linhas apagadas.</p>')
H.append('<div class="fig"><img src="planta_antes_depois.jpg" alt="Antes e depois — planta"><div class="cap">Documento simulado para demonstração. A imagem “depois” foi gerada processando a imagem “antes”.</div></div></div>')
H.append(table(['Problema na página', 'O que o software faz'], [
    ['Manchas de umidade e mofo', 'Separa a mancha da tinta e remove a mancha, mantendo as letras e linhas.'],
    ['Papel amarelado', 'Corrige a cor do fundo e devolve o contraste entre papel e texto.'],
    ['Tinta desbotada', 'Reforça as letras fracas para que fiquem legíveis e possam ser transcritas.'],
    ['Página torta e dobras', 'Endireita a página automaticamente e suaviza marcas de dobra.'],
    ['Ruído e sujeira', 'Limpa pontos e granulação da digitalização.'],
], ['30%', None]))

# 8 entregas
H.append(sec('O QUE A PREFEITURA RECEBE'))
H.append(table(['Entrega', 'Descrição'], [
    ['Página restaurada', 'Imagem recuperada e fiel ao original, para arquivo e preservação histórica.'],
    ['Texto transcrito', 'Conteúdo da página em texto digital: pesquisar palavras, copiar trechos e reaproveitar.'],
    ['Imagem original', 'A digitalização sem tratamento é mantida, para comparação e segurança jurídica.'],
    ['Plataforma de acesso', 'Consulta pelo computador ou celular, busca por palavra, filtros por tipo, data e órgão.'],
    ['Exportação', 'Download em PDF, imagem ou texto, para uso em outros sistemas da Prefeitura.'],
    ['Espaço de trabalho', 'Usuários por setor, permissões de acesso e histórico de versões de cada documento.'],
    ['Relatórios', 'Andamento dos lotes, páginas entregues e páginas aprovadas.'],
], ['30%', None]))

# 9 dia a dia
H.append(sec('NO DIA A DIA: EXEMPLOS DE USO', pb=False))
H.append(table(['Situação', 'Antes', 'Com a DigitalGov'], [
    ['Cidadão pede cópia de uma ata antiga', 'Servidor procura em caixas e livros no arquivo', 'Busca por data ou palavra e envio do PDF'],
    ['Regularização de um loteamento', 'Planta em A0 rasgada e apagada', 'Planta restaurada, legível e ampliável na tela'],
    ['Servidor pede certidão de tempo de serviço', 'Fichas funcionais espalhadas e desbotadas', 'Histórico encontrado pelo nome'],
    ['Pedido pela Lei de Acesso à Informação', 'Prazo apertado para localizar documentos', 'Documento localizado e exportado em minutos'],
    ['Pesquisa sobre a história de Ibiá', 'Acesso restrito a quem vai ao arquivo', 'Acervo histórico pesquisável e preservado'],
], ['30%', '35%', '35%']))

# 10 preço
H.append(sec('PREÇO POR PÁGINA'))
H.append('''<div class="big">
 <div style="--c:#1BA3DD"><span>Formato A3 (29,7 × 42 cm)</span><b>R$ 0,75</b><span>por página</span></div>
 <div style="--c:#26305E"><span>Formato A0 (84,1 × 118,9 cm)</span><b>R$ 7,00</b><span>por página</span></div>
</div>''')
H.append(table(['Formato', 'Dimensão', 'Documentos típicos', 'Preço por página'], [
    ['A3', '29,7 × 42 cm', 'Livros de atas, leis, decretos, processos e registros', '<b>R$ 0,75</b>'],
    ['A0', '84,1 × 118,9 cm', 'Plantas, mapas, projetos de obras e loteamentos', '<b>R$ 7,00</b>'],
], ['16%', '22%', None, '18%']))
H.append('<p class="note">O preço inclui restauração, transcrição do texto e disponibilização na plataforma. A Prefeitura paga apenas pelas páginas entregues e aprovadas.</p>')

# 11 estimativa
H.append(sec('ESTIMATIVA PARA IBIÁ', pb=False))
H.append('<p>Valor total = quantidade de páginas × preço por página. Os cenários abaixo mostram 10 mil e 50 mil páginas.</p>')
H.append(table(['Cenário', '10.000 páginas', '50.000 páginas'], [
    ['Todas em A3 (R$ 0,75)', 'R$ 7.500,00', 'R$ 37.500,00'],
    ['Todas em A0 (R$ 7,00)', 'R$ 70.000,00', 'R$ 350.000,00'],
    ['Misto: 90% A3 + 10% A0', 'R$ 13.750,00<br><span class="note">9.000 A3 + 1.000 A0</span>', 'R$ 68.750,00<br><span class="note">45.000 A3 + 5.000 A0</span>'],
], ['34%', None, None]))
H.append('<p class="note">O cenário misto é apenas um exemplo. A divisão real entre A3 e A0 sai do diagnóstico do acervo.</p>')
H.append('''<div class="avoid"><div class="lab">NOSSA PROJEÇÃO PARA IBIÁ</div><div class="box" style="grid-template-columns:1fr 1fr 1fr">
 <div>Páginas em A3:</div><div>Páginas em A0:</div><div>Valor total estimado:</div>
 <div class="f"></div><div class="f"></div><div class="f"></div></div></div>''')

# 12 prazos
H.append(sec('ETAPAS E PRAZOS'))
H.append('<p>A coluna da direita serve para registrar o responsável na Prefeitura.</p>')
H.append(table(['Evento', 'Prazo', 'Responsável Prefeitura'], [
    ['Reunião de apresentação', 'A combinar', '@fill'],
    ['Diagnóstico do acervo', '[__] dias após a autorização', '@fill'],
    ['Lote-piloto (amostra)', '[__] dias após o diagnóstico', '@fill'],
    ['Produção em lotes', '[__] páginas por semana', '@fill'],
    ['Treinamento dos usuários', 'Na entrega do primeiro lote', '@fill'],
    ['Entrega final', '[__] dias', '@fill'],
], ['30%', None, '24%']))

# 13 segurança
H.append(sec('SEGURANÇA E LGPD', pb=False))
H.append('''<ul>
<li><b>Acesso controlado:</b> cada servidor entra com usuário e senha e vê apenas o que o setor permite.</li>
<li><b>Histórico:</b> registro de quem consultou, enviou ou alterou cada documento.</li>
<li><b>LGPD (Lei 13.709/2018):</b> dados pessoais tratados somente para a finalidade contratada.</li>
<li><b>Original preservado:</b> a imagem original fica guardada junto da versão restaurada.</li>
<li><b>Guarda dos papéis:</b> controle de saída e devolução de cada lote, com termo assinado.</li>
</ul>''')

# 14 por que
H.append(sec('POR QUE A DIGITALGOV', pb=False))
H.append(table(['Diferencial', 'Descrição'], [
    ['Experiência', 'Mais de 10 anos de atuação em tecnologia para empresas e órgãos públicos.'],
    ['Proximidade', 'Sede em Alvorada de Minas – MG, com atendimento em todo o estado.'],
    ['Preço por página', 'A Prefeitura paga pelo que for restaurado, conforme o formato.'],
    ['Duas entregas', 'Página restaurada e texto transcrito no mesmo preço.'],
    ['Acompanhamento', 'Lotes, prazos e aprovações visíveis na plataforma.'],
], ['30%', None]))

# 15 FAQ
H.append(sec('PERGUNTAS FREQUENTES'))
for q, a in [
    ('O papel original é alterado?', 'Não. A restauração é feita na imagem digital. O papel volta ao arquivo como estava.'),
    ('O que acontece com páginas muito danificadas?', 'O software recupera o máximo possível. Trechos totalmente perdidos são indicados na transcrição, e a imagem original continua disponível.'),
    ('Os documentos saem da Prefeitura?', 'Isso é definido no plano de trabalho: a captura pode ser feita no local ou com retirada controlada por termo de saída e devolução.'),
    ('Quem pode acessar o acervo digital?', 'Somente usuários cadastrados pela Prefeitura, com permissões por setor.'),
    ('É possível começar com uma amostra?', 'Sim. O lote-piloto permite avaliar a qualidade antes da produção completa.'),
    ('Como é cobrado?', 'Por página entregue e aprovada: R$ 0,75 (A3) e R$ 7,00 (A0).'),
    ('Os arquivos podem ser usados em outros sistemas?', 'Sim. A exportação em PDF, imagem e texto permite levar o acervo para outros sistemas da Prefeitura.'),
]:
    H.append(f'<div class="qa"><b>{q}</b>{a}</div>')

# 16 condições
H.append(sec('CONDIÇÕES COMERCIAIS', pb=False))
H.append(table(['Item', 'Condição'], [
    ['Validade da proposta', '[__] dias a partir da data de emissão'],
    ['Forma de contratação', '[conforme a legislação aplicável]'],
    ['Faturamento', '[Por lote entregue e aprovado]'],
    ['Pagamento', '[__] dias após o aceite de cada lote'],
], ['30%', None]))

# 17 aceite
N[0] += 1
H.append(f'''<div class="avoid"><div class="sec"><div class="n">{N[0]}</div><div class="t">ACEITE E ASSINATURAS</div></div>
<div class="lab">LOCAL E DATA</div><div class="box" style="grid-template-columns:1fr 1fr"><div>Local:</div><div>Data:</div><div class="f"></div><div class="f"></div></div>
<div class="sig"><div><b>Warley Luciano Costa Gomes</b><br>Administrador e Gerente Geral<br>DigitalGov Tecnologia da Informação Ltda.</div>
<div><b>[Nome do responsável]</b><br>[Cargo]<br>Prefeitura Municipal de Ibiá – MG</div></div></div>''')
H.append('''<div class="sec" style="margin-top:8mm"><div class="n" style="background:#1BA3DD"></div><div class="t">FONTES</div></div>
<ul style="font-size:9pt"><li>Constituição Federal, art. 216, § 2º</li><li>Lei nº 8.159/1991 (Política Nacional de Arquivos Públicos e Privados)</li>
<li>Lei nº 12.527/2011 (Lei de Acesso à Informação)</li><li>Lei nº 12.682/2012 e Decreto nº 10.278/2020 (digitalização de documentos)</li>
<li>Lei nº 13.709/2018 (Lei Geral de Proteção de Dados)</li><li>Imagens de antes e depois: documentos simulados, processados pelo método de restauração descrito nesta proposta</li></ul>''')

html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Proposta Completa · Restauração · Ibiá</title>' + style + extra + '</head><body>' + '\n'.join(H) + '</body></html>'
open('proposta_completa.html', 'w').write(html)
print('ok', N[0], 'seções')
