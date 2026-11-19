# Prepara a logo para bordado: remove o fundo branco (com descontaminação de borda),
# amplia 4x e gera variantes: original, letras brancas (tecido escuro) e só o ícone "D".
import numpy as np
from PIL import Image
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
out = ROOT / 'build/bone'; out.mkdir(parents=True, exist_ok=True)
im = Image.open(ROOT / 'assets/logo-digitalgov.png').convert('RGB')
S = 4
im = im.resize((im.width * S, im.height * S), Image.LANCZOS)
a = np.asarray(im).astype(np.float32)
mn = a.min(axis=2)
alpha = np.clip((248 - mn) / 48.0, 0, 1)
col = np.where(alpha[..., None] > 0.02, (a - (1 - alpha[..., None]) * 255) / np.maximum(alpha[..., None], 1e-3), 0)
col = np.clip(col, 0, 255)
rgba = np.dstack([col, alpha * 255]).astype(np.uint8)
Image.fromarray(rgba).save(out / 'logo_rgba.png')
ICON_X = 150 * S
w = rgba.copy()
x = np.arange(w.shape[1])[None, :]
navy = (col[..., 2] > col[..., 0] + 15) & (col.max(axis=2) < 130) & (x >= ICON_X - 0)
w[navy, :3] = 255
Image.fromarray(w).save(out / 'logo_rgba_branca.png')
Image.fromarray(rgba[:, :ICON_X]).save(out / 'icone_rgba.png')
print(rgba.shape)
