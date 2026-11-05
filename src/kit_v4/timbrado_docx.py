"""Gera o papel timbrado V4 em Word (.docx): cabeçalho e rodapé em imagem, área livre para digitar."""
import sys
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
hdr, ftr, out = sys.argv[1:4]
d = Document(); s = d.sections[0]
s.page_width, s.page_height = Cm(21), Cm(29.7)
s.left_margin, s.right_margin, s.top_margin, s.bottom_margin = Cm(2.0), Cm(1.7), Cm(4.4), Cm(2.6)
s.header_distance = s.footer_distance = Cm(0)
for part, img, h in ((s.header, hdr, 3.97), (s.footer, ftr, 1.64)):
    p = part.paragraphs[0]; pf = p.paragraph_format
    pf.left_indent, pf.right_indent = Cm(-2.0), Cm(-1.7); pf.space_before = pf.space_after = Pt(0)
    p.add_run().add_picture(img, width=Cm(21))
st = d.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(11); st.font.color.rgb = RGBColor(0x2A, 0x2B, 0x31)
st.paragraph_format.space_after = Pt(8); st.paragraph_format.line_spacing = 1.3
def P(t, bold=False, align=None, before=0):
    p = d.add_paragraph(); r = p.add_run(t); r.bold = bold
    if align: p.alignment = align
    if before: p.paragraph_format.space_before = Pt(before)
    return p
P('Alvorada de Minas, [dia] de [mês] de [ano].', align=WD_ALIGN_PARAGRAPH.RIGHT)
P('Ofício nº [__]/[ano]', bold=True, before=12)
P('À [nome do órgão ou empresa]\nA/C [nome e cargo]')
p = P('', before=8); p.add_run('Assunto: ').bold = True; p.add_run('[assunto]')
P('Prezado(a) Senhor(a),', before=8)
P('[Escreva aqui o texto do documento. Apague estas linhas de exemplo e digite normalmente: o cabeçalho e o rodapé da V4 se repetem em todas as páginas.]')
P('Atenciosamente,', before=12)
P('\n\n______________________________', before=6)
p = P('Warley Luciano Costa Gomes', bold=True); p.add_run('\nAdministrador e Gerente Geral · DigitalGov').bold = False
d.save(out); print('ok', out)
