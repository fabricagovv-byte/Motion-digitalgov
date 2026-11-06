"""Papel timbrado V4 black em Word: a página inteira (imagem) fica atrás do texto, em todas as páginas."""
import sys, copy
from docx import Document
from docx.shared import Cm, Pt, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from lxml import etree
bg, out = sys.argv[1:3]
d = Document(); s = d.sections[0]
s.page_width, s.page_height = Cm(21), Cm(29.7)
s.left_margin = s.right_margin = Cm(2.1); s.top_margin, s.bottom_margin = Cm(5.1), Cm(3.6)
s.header_distance = s.footer_distance = Cm(0)
# imagem de fundo: entra como inline no cabeçalho e vira âncora atrás do texto, presa à página
p = s.header.paragraphs[0]; run = p.add_run(); run.add_picture(bg, width=Cm(21), height=Cm(29.7))
inline = run._r.find('.//' + qn('wp:inline'))
W, H = inline.find(qn('wp:extent')).get('cx'), inline.find(qn('wp:extent')).get('cy')
WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
anchor = etree.fromstring(f'''<wp:anchor xmlns:wp="{WP}" distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="1" layoutInCell="1" allowOverlap="1">
<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH><wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>
<wp:extent cx="{W}" cy="{H}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/></wp:anchor>''')
for tag in ('wp:docPr', 'wp:cNvGraphicFramePr'):
    e = inline.find(qn(tag))
    if e is not None: anchor.append(copy.deepcopy(e))
anchor.append(copy.deepcopy(inline.find(qn('a:graphic'))))
inline.getparent().replace(inline, anchor)
# texto claro
LIGHT, GOLD = RGBColor(0xE6, 0xE1, 0xD6), RGBColor(0x1B, 0xB8, 0xEA)
st = d.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(11); st.font.color.rgb = LIGHT
st.paragraph_format.space_after = Pt(8); st.paragraph_format.line_spacing = 1.3
def P(t, bold=False, align=None, before=0, color=None):
    p = d.add_paragraph(); r = p.add_run(t); r.bold = bold
    if color: r.font.color.rgb = color
    if align: p.alignment = align
    if before: p.paragraph_format.space_before = Pt(before)
    return p
P('Alvorada de Minas, [dia] de [mês] de [ano].', align=WD_ALIGN_PARAGRAPH.RIGHT)
P('Ofício nº [__]/[ano]', bold=True, before=12, color=GOLD)
P('À [nome do órgão ou empresa]\nA/C [nome e cargo]')
p = P('', before=8); r = p.add_run('Assunto: '); r.bold = True; r.font.color.rgb = GOLD; p.add_run('[assunto]')
P('Prezado(a) Senhor(a),', before=8)
P('[Escreva aqui o texto do documento. Apague estas linhas de exemplo e digite normalmente: o fundo black da DigitalGov se repete em todas as páginas. Para imprimir, ative "imprimir imagens de fundo" se o Word pedir.]')
P('Atenciosamente,', before=12)
P('\n\n______________________________', before=6, color=GOLD)
p = P('Warley Luciano Costa Gomes', bold=True); p.add_run('\nAdministrador e Gerente Geral · DigitalGov').bold = False
d.save(out); print('ok', out)
