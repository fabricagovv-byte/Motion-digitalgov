"""Legendas pt-BR (SRT, VTT e ASS) do curta de animação, sincronizadas com as falas reais."""
import json, os, sys
sys.path.insert(0, "src")
from subtitles import wrap, ts

TL = json.load(open("src/anim/timeline.json"))
LINES = json.load(open("audio/anim/voice/lines.json"))
OUT = "deliverables/animacao"
SPLITS = {
    "L3": ["Precisamos resolver isso.", "Como vamos organizar tanta coisa?"],
    "L4": ["Achei! Mas precisamos de um jeito melhor", "de organizar tudo isso."],
    "N1": ["A DigitalGov trabalha com digitalização documental, indexação", "e Gestão Eletrônica de Documentos,", "ajudando instituições públicas a organizar suas informações", "e facilitar o acesso aos arquivos."],
    "L6": ["Olha só! Agora conseguimos localizar a informação", "sem procurar em todas essas pastas!"],
    "L7": ["É disso que precisamos:", "organização, tecnologia e mais facilidade no dia a dia!"],
    "P1": ["Olá! Nós somos a DigitalGov.", "Ajudamos prefeituras e instituições públicas", "a transformar a gestão documental", "com digitalização, indexação e GED.", "Vamos levar mais organização e tecnologia", "para sua instituição?"],
}

def cues():
    out = []
    for item in TL["lines"]:
        d = LINES[item["id"]]; start, dur = item["at"], d["dur"]
        parts = SPLITS.get(item["id"], [d["caption"]]); total = sum(len(p) + 6 for p in parts); t = start
        for p in parts:
            pd = dur * (len(p) + 6) / total; out.append((t, t + pd, p)); t += pd
    res = []
    for i, (a, b, txt) in enumerate(out):
        nxt = out[i + 1][0] if i + 1 < len(out) else TL["duration"]
        res.append((a, min(b + 0.25, nxt - 0.04), txt))
    return res

def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs("build", exist_ok=True)
    C = cues()
    with open(f"{OUT}/legendas_ptBR.srt", "w", encoding="utf-8") as f:
        for i, (a, b, txt) in enumerate(C, 1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n" + "\n".join(wrap(txt)) + "\n\n")
    with open(f"{OUT}/legendas_ptBR.vtt", "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for a, b, txt in C: f.write(f"{ts(a, '.')} --> {ts(b, '.')}\n" + "\n".join(wrap(txt)) + "\n\n")
    with open("build/legendas_anim.ass", "w", encoding="utf-8") as f:
        f.write("""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Leg,Inter,40,&H00FFFFFF,&H00FFFFFF,&H64000000,&H9605080F,0,0,0,0,100,100,0,0,3,14,0,2,200,200,46,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""")
        s = lambda t: f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
        for a, b, txt in C:
            if a >= TL["endcard"]["in"] - 0.05: style = "{\\an1\\pos(120,1000)\\fad(100,100)}"   # na tela final, legenda à esquerda (não cobre os contatos)
            else: style = "{\\fad(100,100)}"
            f.write(f"Dialogue: 0,{s(a)},{s(b)},Leg,,0,0,0,,{style}" + "\\N".join(wrap(txt, 48 if a >= TL['endcard']['in'] - 0.05 else 56)) + "\n")
    print(len(C), "legendas")

if __name__ == "__main__":
    main()
