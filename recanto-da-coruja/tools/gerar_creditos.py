"""Gera creditos.html a partir de tools/fontes_imagens.json.
Uso: python3 tools/gerar_creditos.py"""
import html
import json
import pathlib

base = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((base / "tools/fontes_imagens.json").read_text())
linhas = []
for k, v in d["fotos"].items():
    linhas.append(
        f'<tr><td><img src="img/{k}-480.webp" alt="" loading="lazy" width="96" height="64"></td>'
        f'<td>{html.escape(v["titulo"])}</td>'
        f'<td><a href="https://www.pexels.com/photo/{v["id"]}/" target="_blank" rel="noopener">pexels.com/photo/{v["id"]}</a></td></tr>'
    )
for v in d["videos"].values():
    linhas.append(
        f'<tr><td>Vídeo</td><td>{html.escape(v["titulo"])}</td>'
        f'<td><a href="https://www.pexels.com/video/{v["id"]}/" target="_blank" rel="noopener">pexels.com/video/{v["id"]}</a></td></tr>'
    )

pagina = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Créditos das imagens · Recanto da Coruja</title><meta name="robots" content="noindex">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{{color-scheme:dark;--bg:#0e1613;--fg:#f3ead9;--fg2:rgba(243,234,217,.7);--line:rgba(243,234,217,.14);--accent:#f5b544}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 Inter,system-ui,sans-serif}}
main{{max-width:920px;margin:auto;padding-block:48px 80px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}}
h1{{font:800 clamp(34px,6vw,60px)/.95 "Bricolage Grotesque",system-ui,sans-serif;letter-spacing:-.04em;margin:0 0 16px}}
p{{color:var(--fg2);max-width:65ch}} a{{color:var(--accent)}} .tw{{overflow-x:auto}}
table{{width:100%;border-collapse:collapse;margin-top:24px}} td{{padding:8px;border-bottom:1px solid var(--line);vertical-align:middle}}
td img{{border-radius:8px;object-fit:cover;width:96px;height:64px}}
</style></head><body><main>
<p><a href="index.html">← Voltar ao site</a></p>
<h1>Créditos das imagens</h1>
<p>As fotos e os trechos de vídeo deste site vêm do banco <a href="https://www.pexels.com/license/" target="_blank" rel="noopener">Pexels</a>, cuja licença permite uso gratuito, comercial e não comercial, sem atribuição obrigatória. Mesmo assim, listamos as fontes. São <strong>imagens ilustrativas</strong>: não mostram o Recanto da Coruja nem os seus pratos, e devem ser trocadas por fotos próprias.</p>
<p>A trilha do vídeo é original, gerada por síntese para este projeto. O símbolo da coruja é uma proposta de identidade criada para este projeto.</p>
<div class="tw"><table><tbody>{"".join(linhas)}</tbody></table></div>
</main></body></html>
"""
(base / "creditos.html").write_text(pagina)
print("creditos.html:", len(linhas), "itens")
