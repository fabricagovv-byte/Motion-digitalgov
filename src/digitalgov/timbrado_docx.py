"""Papel timbrado DigitalGov em Word: a página inteira (imagem) fica atrás do texto em todas as páginas.
Uso: python3 timbrado_docx.py fundo.jpg saida.docx exec|tec"""
import sys, copy
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from lxml import etree
bg, out, est = sys.argv[1:4]
d = Document(); s = d.sections[0]
s.page_width, s.page_height = Cm(21), Cm(29.7)
if est == 'exec': s.left_margin, s.right_margin, s.top_margin, s.bottom_margin = Cm(1.9), Cm(1.9), Cm(5.0), Cm(3.2)
else: s.left_margin, s.right_margin, s.top_margin, s.bottom_margin = Cm(4.7), Cm(1.2), Cm(3.9), Cm(2.4)
s.header_distance = s.footer_distance = Cm(0)
# fundo: imagem inline no cabeçalho convertida em âncora atrás do texto, presa à página
p = s.header.paragraphs[0]; run = p.add_run(); run.add_picture(bg, width=Cm(21), height=Cm(29.7))
inline = run._r.find('.//' + qn('wp:inline')); ext = inline.find(qn('wp:extent'))
WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
anchor = etree.fromstring(f'''<wp:anchor xmlns:wp="{WP}" distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="1" layoutInCell="1" allowOverlap="1">
<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH><wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>
<wp:extent cx="{ext.get('cx')}" cy="{ext.get('cy')}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/></wp:anchor>''')
for tag in ('wp:docPr', 'wp:cNvGraphicFramePr'):
    e = inline.find(qn(tag))
    if e is not None: anchor.append(copy.deepcopy(e))
anchor.append(copy.deepcopy(inline.find(qn('a:graphic')))); inline.getparent().replace(inline, anchor)
NAVY, TXT = RGBColor(0x26, 0x30, 0x50), RGBColor(0x33, 0x39, 0x4F)
st = d.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(11 if est == 'exec' else 10.5); st.font.color.rgb = TXT
st.paragraph_format.space_after = Pt(8); st.paragraph_format.line_spacing = 1.3
def P(t='', bold=False, align=None, before=0, color=None, size=None):
    p = d.add_paragraph(); r = p.add_run(t); r.bold = bold
    if color: r.font.color.rgb = color
    if size: r.font.size = Pt(size)
    if align: p.alignment = align
    if before: p.paragraph_format.space_before = Pt(before)
    return p
if est == 'exec':
    P('Alvorada de Minas, [dia] de [mês] de [ano].', align=WD_ALIGN_PARAGRAPH.RIGHT)
    P('Ofício DG nº [__]/[ano]', bold=True, before=12, color=NAVY)
    P('Ao(À) Senhor(a)\n[Nome]\n[Cargo · Órgão ou empresa]')
    p = P(before=8); r = p.add_run('Assunto: '); r.bold = True; r.font.color.rgb = NAVY; p.add_run('[assunto]')
    P('Prezado(a) Senhor(a),', before=8)
    P('[Escreva aqui o texto. Apague estas linhas de exemplo e digite normalmente: o timbrado da DigitalGov se repete em todas as páginas.]')
    P('Atenciosamente,', before=12)
    P('\n\n______________________________', before=6)
    p = P('Warley Luciano Costa Gomes', bold=True, color=NAVY); p.add_run('\nAdministrador e Gerente Geral · DigitalGov').bold = False
else:
    P('[Título do relatório técnico]', bold=True, color=NAVY, size=16)
    P('DG-TEC-[____] · Rev. 00 · [data]', color=RGBColor(0x8A, 0x90, 0xA6), size=9)
    for n, t, txt in [('1', 'Objetivo', '[Descreva o objetivo do documento.]'), ('2', 'Escopo', '[O que está incluído e o que não está.]'),
                      ('3', 'Situação atual', '[Diagnóstico: sistemas, dados e infraestrutura existentes.]'), ('4', 'Solução proposta', '[Arquitetura, tecnologias e integração.]'),
                      ('5', 'Cronograma e medição', '[Etapas, prazos e medição por UST, ponto de função ou hora técnica.]'), ('6', 'Segurança e LGPD', '[Controle de acesso, registro e base legal do tratamento de dados.]')]:
        P(f'{n}. {t}', bold=True, color=NAVY, before=8, size=12); P(txt)
    P('Preencha os campos da coluna Controle (projeto, responsável, revisão) à mão ou em PDF.', color=RGBColor(0x8A, 0x90, 0xA6), size=8.5, before=10)
d.save(out); print('ok', out)
