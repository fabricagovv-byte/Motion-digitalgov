"""Gera WebP otimizados (480/960/1600 px) + JPG da imagem de compartilhamento a partir das fotos originais.
Uso: python3 tools/otimizar_imagens.py <pasta_com_originais_{id}.jpg>
Os originais podem ser baixados de https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg"""
import json, sys, pathlib
from PIL import Image, ImageOps
base = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1])
data = json.loads((base / "tools/fontes_imagens.json").read_text())
out = base / "img"; out.mkdir(exist_ok=True)
for nome, info in data["fotos"].items():
    im = ImageOps.exif_transpose(Image.open(src / f"{info['id']}.jpg")).convert("RGB")
    for w in (480, 960, 1600):
        if w > im.width and w != 480: continue
        r = im.copy(); r.thumbnail((w, w * 3))
        r.save(out / f"{nome}-{w}.webp", "WEBP", quality=74, method=6)
    if nome == "hero":  # JPG só para a imagem de compartilhamento (og:image)
        r = im.copy(); r.thumbnail((960, 2880)); r.save(out / f"{nome}-960.jpg", "JPEG", quality=78, optimize=True, progressive=True)
    print(nome, im.size)
(base / "js/fotos.js").write_text("/* Fotos disponíveis em img/ (gerado por tools/otimizar_imagens.py) */\nwindow.PIZZARIA_FOTOS = " + json.dumps(sorted(data["fotos"]), ensure_ascii=False) + ";\n")
