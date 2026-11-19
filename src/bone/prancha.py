# Monta pranchas de apresentação dos bonés a partir dos renders.
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
R = Path(__file__).resolve().parents[2]; src = R / 'build/bone/renders'; out = R / 'deliverables/bone'; out.mkdir(parents=True, exist_ok=True)
F = lambda w, s: ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', s)
NAVY = (20, 32, 74)
def board(items, title, sub, name, cols=2):
    cw, ch = 1500, 1125; rows = (len(items) + cols - 1) // cols
    W, H = cols * cw + 120 + (cols - 1) * 40, 260 + rows * (ch + 110) + 60
    b = Image.new('RGB', (W, H), (247, 247, 245)); d = ImageDraw.Draw(b)
    d.rectangle((0, 0, W, 22), fill=NAVY); d.rectangle((0, 22, W, 30), fill=(11, 78, 162))
    logo = Image.open(R / 'build/bone/logo_rgba.png'); logo = logo.resize((560, int(560 * logo.height / logo.width)), Image.LANCZOS)
    b.paste(logo, (W - 60 - 560, 70), logo)
    d.text((60, 80), title, font=F('Bold', 64), fill=NAVY); d.text((60, 165), sub, font=F('Regular', 32), fill=(100, 106, 122))
    for i, (f, lab) in enumerate(items):
        x, y = 60 + (i % cols) * (cw + 40), 260 + (i // cols) * (ch + 110)
        im = Image.open(src / f).convert('RGB').resize((cw, ch), Image.LANCZOS); b.paste(im, (x, y))
        d.text((x, y + ch + 22), lab, font=F('SemiBold', 34), fill=NAVY)
    b.save(out / f'{name}.png', optimize=True); b.convert('RGB').save(out / f'{name}.jpg', quality=92); print(name)
board([(f'modelo_{m}_frente34.png', l) for m, l in [('americano', 'Americano 6 gomos · aba curva · estruturado'), ('trucker', 'Trucker · frente em espuma + tela traseira'),
      ('abareta', 'Snapback · aba reta · copa alta'), ('dad', 'Dad hat · desestruturado · fivela metálica')]],
      'Bonés DigitalGov — Modelos', 'Logo em bordado · ícone "D" bordado na lateral · ajuste traseiro', 'prancha_modelos')
for cor, nome in [('branco', 'Branco'), ('marinho', 'Azul-marinho')]:
    board([(f'bone_{cor}_{v}.png', l) for v, l in [('frente34', '3/4 frontal'), ('frente', 'Frente'), ('lado', 'Lateral (ícone bordado)'), ('tras', 'Traseira (snapback)')]],
          f'Boné Americano — {nome}', 'Logo oficial em bordado com relevo · 6 gomos · ilhoses bordados', f'prancha_americano_{cor}')
board([('modelo_brasil_frente34.png', '3/4 frontal · logo azul-marinho bordada · listra Brasil na aba'), ('modelo_brasil_tras.png', 'Traseira · ajuste snapback')],
      'Boné DigitalGov — Brasil Tech', 'Americano 6 gomos branco · logo monocromática azul-marinho · listra verde-amarelo-azul', 'prancha_brasil_tech')
