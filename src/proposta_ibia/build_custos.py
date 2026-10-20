# Documento interno: análise de custos e margem da restauração de documentos (uso interno DigitalGov)
style = open('style.css.part').read()
extra = """<style>
.callout{background:#EAF2FB;border-left:5px solid #1BA3DD;padding:3mm 4mm;margin:2mm 0 4mm;font-size:10pt}
.alert{background:#FDECEC;border-left:5px solid #C0392B;padding:3mm 4mm;margin:2mm 0 4mm;font-size:10pt}
.alert b{color:#9B2A20}.callout b{color:#26305E}
td.neg{color:#B42318;font-weight:700}td.pos{color:#16794A;font-weight:700}
.dec{display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid #CBD3DF;background:#EAF2FB}
.dec div{padding:4mm;font-size:9.4pt;font-weight:700;color:#26305E;display:flex;gap:3mm;align-items:center;border-right:1px solid #CBD3DF}
.dec i{width:5mm;height:5mm;border:1.5px solid #26305E;display:inline-block;flex:none;background:#fff}
</style>"""

def brl(v, d=2):
    s = f'{abs(v):,.{d}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return ('−' if v < 0 else '') + 'R$ ' + s

def pct(v):
    return f'{v*100:.1f}%'.replace('.', ',')

N = [0]
def sec(t, pb=False):
    N[0] += 1
    st = ' style="break-before:page;margin-top:0"' if pb else ''
    return f'<div class="sec"{st}><div class="n">{N[0]}</div><div class="t">{t}</div></div>'

def table(head, rows, widths=None):
    h = ''.join(f'<th{f" style=\"width:{widths[i]}\"" if widths and widths[i] else ""}>{x}</th>' for i, x in enumerate(head))
    b = ''
    for r in rows:
        tds = ''
        for i, c in enumerate(r):
            cls = 'k' if i == 0 else ''
            if isinstance(c, tuple):
                c, cls = c
            tds += f'<td class="{cls}">{c}</td>'
        b += f'<tr>{tds}</tr>'
    return f'<table><tr>{h}</tr>{b}</table>'

def sign(v, txt):
    return (txt, 'neg' if v < 0 else 'pos')

# premissas
PRECO = {'A3': 0.75, 'A0': 7.00}
CUSTOS = [0.10, 0.30, 0.50, 0.75, 1.00]
OPER = 2500.0
PROD = [5000, 10000, 20000]      # páginas por operador por mês (a medir no lote-piloto)
PROD_BASE = 10000

H = []
H.append('<h1>ANÁLISE DE CUSTOS</h1><div class="sub">Restauração de documentos — custo, preço de venda e margem | Base: proposta para Ibiá – MG | Confidencial</div>')
H.append(f'''<table class="sum"><tr><th style="width:34%">CUSTO DE RESTAURAÇÃO</th><th style="width:30%">PREÇO DE VENDA</th><th>CUSTO DO OPERADOR</th></tr>
<tr><td><b>R$ 0,10 a R$ 1,00</b> por página<br>processamento e insumos</td><td><b>A3: R$ 0,75</b> por página<br><b>A0: R$ 7,00</b> por página</td><td><b>R$ 2.500,00</b> por mês<br>por operador</td></tr></table>''')

H.append(sec('FINALIDADE E RESUMO EXECUTIVO'))
H.append('<p>Este documento é para uso interno da DigitalGov. Ele mostra quanto custa restaurar cada página, quanto vendemos e quanto sobra, considerando o custo de restauração por página e o custo do operador. Serve para decidir o preço mínimo e para conferir a viabilidade da proposta de Ibiá.</p>')
H.append(table(['Tema', 'Conclusão'], [
    ['A0 (R$ 7,00)', 'Margem alta em qualquer cenário de custo: sobra de R$ 5,75 a R$ 6,65 por página após restauração e operador (produtividade de 10 mil páginas/mês).'],
    ['A3 (R$ 0,75)', '<b>Atenção:</b> com custo de restauração acima de cerca de R$ 0,50 por página, o A3 dá prejuízo quando se soma o operador. Com custo de R$ 1,00, cada página A3 perde dinheiro mesmo sem operador.'],
    ['Ponto de equilíbrio A3', 'Custo de restauração + operador deve ficar abaixo de R$ 0,75 por página. Com operador a R$ 0,25/pág. (10 mil pág./mês), o custo de restauração precisa ser no máximo <b>R$ 0,50</b>.'],
    ['Operador', 'R$ 2.500/mês. O custo por página depende da produtividade: R$ 0,50 (5 mil pág./mês), R$ 0,25 (10 mil) ou R$ 0,125 (20 mil).'],
    ['Ibiá', 'Projetos com muito A0 são muito lucrativos. Projetos só com A3 dependem de manter o custo de restauração baixo e a produtividade alta.'],
    ['Recomendação', 'Medir no lote-piloto o custo real por página e a produtividade do operador antes de fechar o contrato. Para páginas A3 muito danificadas (custo de R$ 1,00), o preço precisaria ser de cerca de R$ 1,80 para margem de 30% (seção 6).'],
], ['26%', None]))

H.append(sec('PREMISSAS', pb=True))
H.append('<p>Valores informados pela diretoria e pontos que ainda precisam ser confirmados. Os campos em azul são para preenchimento.</p>')
H.append(table(['Premissa', 'Valor', 'Situação'], [
    ['Preço de venda A3', 'R$ 0,75 por página', 'Informado'],
    ['Preço de venda A0', 'R$ 7,00 por página', 'Informado'],
    ['Custo de restauração', 'R$ 0,10 a R$ 1,00 por página', 'Informado (faixa)'],
    ['Custo do operador', 'R$ 2.500,00 por mês', 'Informado'],
    ['Produtividade do operador', '5 mil, 10 mil ou 20 mil páginas por mês', 'Hipótese — medir no lote-piloto'],
    ['Encargos sobre o operador', 'Não incluídos nos R$ 2.500', ('[confirmar]', 'fill')],
    ['Impostos sobre a venda', 'Não incluídos nos cálculos', ('[__]% sobre o faturamento', 'fill')],
    ['Equipamentos (scanner A0/A3), deslocamento', 'Não incluídos', ('[__]', 'fill')],
], ['34%', '36%', None]))
H.append('<div class="callout"><b>Como ler os números.</b> Margem por página = preço de venda − custo de restauração − custo do operador por página. Custo do operador por página = R$ 2.500 ÷ páginas que o operador faz no mês. Impostos, encargos e equipamentos ainda não estão descontados, por isso a margem real será menor.</div>')

H.append(sec('MARGEM POR PÁGINA SEM O OPERADOR'))
H.append('<p>Primeiro olhar: quanto sobra só descontando o custo de restauração.</p>')
rows = []
for c in CUSTOS:
    r = [brl(c)]
    for f in ('A3', 'A0'):
        m = PRECO[f] - c
        r.append(sign(m, f'{brl(m)} ({pct(m/PRECO[f])})'))
    rows.append(r)
H.append(table(['Custo de restauração por página', 'Sobra no A3 (venda R$ 0,75)', 'Sobra no A0 (venda R$ 7,00)'], rows, ['34%', None, None]))
H.append('<div class="alert"><b>Ponto crítico do A3.</b> Com custo de R$ 0,75 o A3 empata, e acima disso perde dinheiro em cada página, antes mesmo de pagar o operador.</div>')

H.append(sec('CUSTO DO OPERADOR POR PÁGINA'))
H.append(table(['Produtividade do operador', 'Páginas por dia útil (22 dias)', 'Custo do operador por página'], [
    [f'{p:,}'.replace(',', '.') + ' páginas/mês', f'{p/22:,.0f}'.replace(',', '.'), brl(OPER / p, 3)] for p in PROD
], ['36%', None, None]))
H.append('<p class="note">Plantas A0 levam mais tempo por página que o A3. A produtividade de cada formato deve ser medida separadamente no lote-piloto.</p>')

H.append(sec('MARGEM POR PÁGINA COM O OPERADOR', pb=True))
for f in ('A3', 'A0'):
    H.append(f'<div class="lab">FORMATO {f} — VENDA {brl(PRECO[f])} POR PÁGINA</div>')
    head = ['Custo de restauração'] + [f'Operador {p//1000} mil pág./mês ({brl(OPER/p,3)})' for p in PROD]
    rows = []
    for c in CUSTOS:
        r = [brl(c)]
        for p in PROD:
            m = PRECO[f] - c - OPER / p
            r.append(sign(m, f'{brl(m, 3)} ({pct(m/PRECO[f])})'))
        rows.append(r)
    H.append(table(head, rows, ['22%', None, None, None]))
H.append('<p class="note">Verde: sobra por página. Vermelho: prejuízo por página. Percentual sobre o preço de venda.</p>')

H.append(sec('PREÇO MÍNIMO RECOMENDADO PARA O A3', pb=True))
H.append('<p>Preço de venda necessário para garantir a margem desejada, com operador a 10 mil páginas por mês (R$ 0,25 por página) e antes de impostos.</p>')
rows = []
for c in CUSTOS:
    base = c + OPER / PROD_BASE
    rows.append([brl(c), brl(base), brl(base / 0.8), brl(base / 0.7), brl(base / 0.5)])
H.append(table(['Custo de restauração', 'Custo total por página', 'Preço p/ margem 20%', 'Preço p/ margem 30%', 'Preço p/ margem 50%'], rows, ['22%', None, None, None, None]))
H.append('<div class="callout"><b>Leitura.</b> O preço de R$ 0,75 no A3 só garante margem de 30% se o custo total (restauração + operador) ficar em até cerca de R$ 0,52 por página. Para páginas muito danificadas, que custam mais para restaurar, vale ter um preço diferente (por exemplo, A3 “estado crítico”).</div>')

H.append(sec('SIMULAÇÃO PARA IBIÁ'))
H.append(f'<p>Resultado do projeto antes de impostos, com operador a {PROD_BASE//1000} mil páginas por mês. Custo mínimo = restauração a R$ 0,10/pág.; custo máximo = R$ 1,00/pág.</p>')
cen = [('10 mil — todas A3', 10000, 0), ('10 mil — todas A0', 0, 10000), ('10 mil — misto 90% A3 + 10% A0', 9000, 1000),
       ('50 mil — todas A3', 50000, 0), ('50 mil — todas A0', 0, 50000), ('50 mil — misto 90% A3 + 10% A0', 45000, 5000)]
rows = []
for nome, a3, a0 in cen:
    pg = a3 + a0
    rec = a3 * PRECO['A3'] + a0 * PRECO['A0']
    meses = pg / PROD_BASE
    op = meses * OPER
    rmin = rec - pg * 0.10 - op
    rmax = rec - pg * 1.00 - op
    rows.append([nome, brl(rec, 0), f'{meses:.0f}'.replace('.', ','), brl(op, 0),
                 sign(rmin, brl(rmin, 0)), sign(rmax, brl(rmax, 0))])
H.append(table(['Cenário', 'Faturamento', 'Meses de operador', 'Custo operador', 'Resultado (custo R$ 0,10)', 'Resultado (custo R$ 1,00)'], rows,
               ['27%', None, '11%', None, None, None]))
H.append('<p class="note">“Meses de operador” = páginas ÷ 10 mil. Com mais operadores o prazo cai, mas o custo total de operador é o mesmo para a mesma produtividade.</p>')
H.append('<div class="alert"><b>Cenário de risco.</b> Um contrato só com A3 e custo de restauração de R$ 1,00 por página dá prejuízo. Antes de assinar, confirmar a quantidade de A0 e o custo real por página.</div>')
H.append('''<div class="lab">NOSSA PROJEÇÃO PARA IBIÁ</div><div class="box" style="grid-template-columns:1fr 1fr 1fr 1fr">
<div>Páginas A3:</div><div>Páginas A0:</div><div>Custo real por página:</div><div>Resultado estimado:</div>
<div class="f"></div><div class="f"></div><div class="f"></div><div class="f"></div></div>''')

H.append(sec('RISCOS E COMO REDUZIR'))
H.append(table(['Risco', 'Impacto', 'Como reduzir'], [
    ['Custo de restauração alto no A3', 'Prejuízo por página', 'Medir no lote-piloto; preço separado para páginas em estado crítico'],
    ['Produtividade abaixo do previsto', 'Operador mais caro por página', 'Medir páginas/dia por formato; ajustar prazo e equipe'],
    ['Pouco A0 no acervo', 'Faturamento menor que o previsto', 'Confirmar a divisão A3/A0 no diagnóstico'],
    ['Encargos e impostos', 'Margem real menor', 'Incluir encargos do operador e alíquota de impostos nesta planilha'],
    ['Equipamento A0', 'Investimento ou aluguel de scanner', 'Orçar compra ou locação antes do contrato'],
], ['28%', '26%', None]))

H.append(sec('RECOMENDAÇÕES'))
H.append('''<ul>
<li>Manter o A0 a R$ 7,00: é o item que sustenta a margem do projeto.</li>
<li>No A3, trabalhar com custo de restauração de no máximo R$ 0,50 por página, ou rever o preço.</li>
<li>Fazer um lote-piloto em Ibiá para medir o custo real por página e a produtividade do operador em cada formato.</li>
<li>Incluir encargos, impostos e equipamentos nesta análise antes de enviar a proposta final.</li>
<li>Criar uma faixa de preço para páginas A3 em estado crítico.</li>
</ul>''')
H.append('''<div class="avoid"><div class="lab">DECISÃO DA DIRETORIA</div><div class="dec">
<div><i></i>Manter preços (A3 R$ 0,75 / A0 R$ 7,00)</div><div><i></i>Ajustar preço do A3</div><div style="border-right:none"><i></i>Aguardar lote-piloto</div></div>
<div class="lab">JUSTIFICATIVA</div><div class="box"><div>Justificativa da decisão e condições:</div><div class="f" style="height:16mm"></div></div></div>''')

N[0] += 1
H.append(f'''<div class="avoid"><div class="sec"><div class="n">{N[0]}</div><div class="t">APROVAÇÃO E ASSINATURAS</div></div>
<p>Aprovo a análise de custos e a decisão registrada.</p>
<div class="lab">LOCAL E DATA</div><div class="box" style="grid-template-columns:1fr 1fr"><div>Local:</div><div>Data:</div><div class="f"></div><div class="f"></div></div>
<div class="sig"><div><b>Arthur Miguel</b><br>Diretor de Vendas e Tecnologia<br>DigitalGov Tecnologia da Informação Ltda.</div>
<div><b>Warley Luciano Costa Gomes</b><br>Administrador e Gerente Geral<br>DigitalGov Tecnologia da Informação Ltda.</div></div>
<p class="note" style="margin-top:6mm">Análise interna feita com os valores informados pela diretoria (custo de restauração, preço de venda e custo do operador). A produtividade do operador é hipótese e deve ser medida. Não inclui impostos, encargos nem equipamentos.</p></div>''')

html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Análise de Custos · Restauração</title>' + style + extra + '</head><body>' + '\n'.join(H) + '</body></html>'
open('custos.html', 'w').write(html)
print('ok')
