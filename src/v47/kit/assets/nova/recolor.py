# Recolore a logo V4.7 enviada (rosa) para outras cores, mantendo o brilho das letras.
import numpy as np
from PIL import Image
src = np.array(Image.open('v47_original_rosa.png').convert('RGB')).astype(float)
G = src[..., 1]
a = np.clip((G - 52) / (255 - 52), 0, 1)            # quanto o pixel é "letra branca"
sh = np.clip((52 - G) / 28, 0, 1)                   # sombra rosa escura em volta das letras
H, W = G.shape
yy, xx = np.mgrid[0:H, 0:W]
dot = (xx - 830) ** 2 + (yy - 762) ** 2 < 50 ** 2   # o ponto do "4.7"
GOLD = np.array([217, 164, 65.])

def make(bg, name, letter=(255, 255, 255), gold_dot=True, shadow=.45):
    bg = np.array(bg, float); L = np.array(letter, float)
    base = bg * (1 - shadow * sh[..., None])
    lt = np.where(dot[..., None] & gold_dot, GOLD * (.55 + .45 * a[..., None]) + 255 * .0, L)
    out = a[..., None] * lt + (1 - a[..., None]) * base
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(name)

make((17, 18, 22), 'v47_grafite.png')
make((23, 37, 84), 'v47_azul_marinho.png')
make((29, 78, 216), 'v47_azul_royal.png')
make((12, 74, 72), 'v47_verde_petroleo.png')
make((244, 241, 234), 'v47_claro.png', letter=(17, 18, 22), shadow=.12)

# versões transparentes (recortadas) para vídeos
x0, x1, y0, y1 = 50, 1210, 395, 880
def cut(letter, name, gold_dot=True):
    L = np.array(letter, float)
    rgb = np.where(dot[..., None] & gold_dot, GOLD, L) * np.ones_like(src)
    al = a.copy()
    img = np.dstack([rgb, al * 255]).astype(np.uint8)[y0:y1, x0:x1]
    Image.fromarray(img, 'RGBA').save(name)
cut((246, 243, 236), 'v47_logo_branca_transp.png')
cut((17, 18, 22), 'v47_logo_escura_transp.png')
print('ok')
