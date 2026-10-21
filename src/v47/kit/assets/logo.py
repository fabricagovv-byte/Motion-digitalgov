# Gera a logo V4.7 em SVG (marca angular no estilo do V4 FábricaGov + ".7" dourado + nós de IA)
INK='#111216'; GOLD='#D9A441'
def mark(fg, gold):
    V  = f'<polygon points="0,40 118,40 236,300 354,40 472,40 290,440 182,440" fill="{fg}"/>'
    F1 = f'<polygon points="560,40 672,40 498,262 386,262" fill="{fg}"/>'           # diagonal do 4
    F2 = f'<polygon points="386,262 730,262 706,330 362,330" fill="{fg}"/>'         # barra do 4
    F3 = f'<polygon points="604,150 682,96 682,440 604,440" fill="{fg}"/>'          # haste do 4
    DOT= f'<rect x="742" y="370" width="70" height="70" fill="{gold}"/>'
    S7 = f'<polygon points="840,40 1080,40 1080,104 948,440 856,440 984,112 840,112" fill="{gold}"/>'
    NET= (f'<g stroke="{gold}" stroke-width="7"><line x1="1080" y1="40" x2="1150" y2="0"/><line x1="1080" y1="40" x2="1168" y2="80"/>'
          f'<line x1="1150" y1="0" x2="1168" y2="80"/></g>'
          f'<circle cx="1150" cy="0" r="16" fill="{gold}"/><circle cx="1168" cy="80" r="16" fill="{gold}"/><circle cx="1080" cy="40" r="20" fill="{fg}" stroke="{gold}" stroke-width="7"/>')
    return V+F1+F2+F3+DOT+S7+NET
def svg(fg, bg=None, tag=True):
    h = 640 if tag else 500
    b = f'<rect x="-60" y="-80" width="1320" height="{h+110}" fill="{bg}"/>' if bg else ''
    t = (f'<text x="590" y="560" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="58" letter-spacing="16" fill="{fg}">INTELIGÊNCIA PÚBLICA</text>'
         f'<text x="590" y="620" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="30" letter-spacing="8" fill="{GOLD}">por V4 FábricaGov</text>') if tag else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -80 1320 {h+110}" width="1320" height="{h+110}">{b}<g>{mark(fg,GOLD)}</g>{t}</svg>'
open('v47_logo_dark.svg','w').write(svg(INK))           # para fundo claro
open('v47_logo_white.svg','w').write(svg('#F4F1EA'))     # para fundo escuro
open('v47_mark_white.svg','w').write(svg('#F4F1EA', tag=False))
open('v47_mark_dark.svg','w').write(svg(INK, tag=False))
open('v47_logo_on_ink.svg','w').write(svg('#F4F1EA', bg=INK))
print('ok')
