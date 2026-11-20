"""Gera um arquivo HTML único (com CSS, JS, imagens e o vídeo do topo embutidos) para
mostrar o site sem servidor: basta abrir o arquivo no navegador ou enviá-lo por mensagem.
As bibliotecas de animação continuam vindo da CDN (sem internet, o site aparece sem animações).
Uso: python3 tools/gerar_preview.py [saida.html]"""
import base64
import pathlib
import re
import sys

base = pathlib.Path(__file__).resolve().parent.parent
saida = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else base / "preview" / "recanto-da-coruja-preview.html"


def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


html = (base / "index.html").read_text()
css = (base / "css/site.css").read_text()
js = {n: (base / f"js/{n}.js").read_text() for n in ("pedido", "motion")}
config = (base / "data/config.js").read_text()
dados = (base / "js/dados.js").read_text()

# imagens: usa a versão de 960 px de cada foto citada
nomes = set(re.findall(r"img/([a-z0-9-]+)-\d+\.webp", html + css))
nomes |= set(re.findall(r'foto: "([a-z0-9-]+)"', config))
nomes |= set(re.findall(r'"([a-z0-9-]+)"', config.split("galeria:")[1]))
imgs = {}
for n in sorted(nomes):
    f = base / "img" / f"{n}-960.webp"
    if f.exists():
        imgs[n] = data_uri(f, "image/webp")
coruja = data_uri(base / "img/coruja.svg", "image/svg+xml")

html = re.sub(r'\s+srcset="[^"]*"', "", html)
html = re.sub(r"img/([a-z0-9-]+)-\d+\.webp", lambda m: imgs.get(m.group(1), m.group(0)), html)
css = re.sub(r"\.\./img/([a-z0-9-]+)-\d+\.webp", lambda m: imgs.get(m.group(1), m.group(0)), css)
html = html.replace('href="img/favicon.svg"', f'href="{coruja}"')
html = html.replace("video/hero_poster.webp", data_uri(base / "video/hero_poster.webp", "image/webp"))
html = html.replace('src="video/hero_720p.mp4"', f'src="{data_uri(base / "video/hero_720p.mp4", "video/mp4")}"')
html = re.sub(r'<link rel="(manifest|preload)"[^>]*>\s*', "", html)
html = html.replace('href="creditos.html"', 'href="#topo"')
# o vídeo com som (12 MB) não vai embutido: o botão some na prévia
html = re.sub(r'<button class="pill pill--glass" type="button" data-play-promo>.*?</button>', "", html, flags=re.S)
js["pedido"] = js["pedido"].replace(
    "$('[data-play-promo]').addEventListener", "($('[data-play-promo]') || document.createElement('i')).addEventListener")
js["pedido"] = js["pedido"].replace("'img/coruja.svg'", repr(coruja)).replace('"img/coruja.svg"', '"' + coruja + '"')

foto_patch = "window.__IMGS = " + repr(imgs).replace("'", '"') + ";\nwindow.Pizzaria.foto = function (n) { return n ? window.__IMGS[n] || '' : null; };\n"

html = html.replace('<link rel="stylesheet" href="css/site.css">', f"<style>{css}</style>")
html = html.replace('<script src="data/config.js"></script>', f"<script>{config}</script>")
html = html.replace('<script src="js/dados.js"></script>', f"<script>{dados}\n{foto_patch}</script>")
html = html.replace('<script src="js/pedido.js"></script>', f"<script>{js['pedido']}</script>")
html = html.replace('<script src="js/motion.js"></script>', f"<script>{js['motion']}</script>")

saida.parent.mkdir(parents=True, exist_ok=True)
saida.write_text(html)
print(saida, round(saida.stat().st_size / 1e6, 2), "MB,", len(imgs), "imagens")
