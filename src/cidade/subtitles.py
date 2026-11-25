"""Legendas pt-BR (SRT, VTT e ASS) do filme "30 dias", sincronizadas com a narração real."""
import json, os, sys
sys.path.insert(0, "src")
from subtitles import wrap, ts

TL = json.load(open("src/cidade/timeline.json"))
DURS = json.load(open("audio/cidade/narration/durations.json"))
OUT = "deliverables/cidade_30dias"
SPLITS = {
    "c2a": ["Olhe estas duas cidades.", "Numa, a terra é seca: a obra parou,", "a rua tem buraco, e ninguém sabe quanto tem."],
    "c2b": ["Na outra, a terra está molhada.", "Tudo brota, porque cada real", "e cada rua estão sob controle."],
    "c3": ["Tudo começa pelo caixa:", "quanto tem, quanto entra, quanto gasta.", "E quantos habitantes dependem de cada decisão."],
    "c4": ["Depois, a lista para apurar a cidade:", "ruas, iluminação, água, escolas, saúde, coleta e obras.", "Item por item, bairro por bairro.", "Está tudo ali."],
    "c5a": ["No trigésimo dia, o governador chega", "e encontra uma cidade pronta."],
    "c5b": ["DigitalGov:", "gestão que faz a cidade florescer."],
}

def cues():
    out = []
    for item in TL["narration"]:
        d = DURS[item["id"]]; start, dur = item["at"], d["dur"]
        parts = SPLITS.get(item["id"], [d["caption"]]); total = sum(len(p) for p in parts); t = start
        for p in parts:
            pd = dur * len(p) / total; out.append((t, t + pd, p)); t += pd
    res = []
    for i, (a, b, txt) in enumerate(out):
        nxt = out[i + 1][0] if i + 1 < len(out) else TL["duration"]
        res.append((a, min(b + 0.3, nxt - 0.04), txt))
    return res

def main():
    os.makedirs(OUT, exist_ok=True); os.makedirs("build", exist_ok=True)
    C = cues()
    with open(f"{OUT}/legendas_ptBR.srt", "w", encoding="utf-8") as f:
        for i, (a, b, txt) in enumerate(C, 1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n" + "\n".join(wrap(txt)) + "\n\n")
    with open(f"{OUT}/legendas_ptBR.vtt", "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for a, b, txt in C: f.write(f"{ts(a, '.')} --> {ts(b, '.')}\n" + "\n".join(wrap(txt)) + "\n\n")
    with open("build/legendas_cidade.ass", "w", encoding="utf-8") as f:
        f.write("""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Leg,Inter,38,&H00FFFFFF,&H00FFFFFF,&H64000000,&H9605080F,0,0,0,0,100,100,0,0,3,14,0,2,200,200,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""")
        s = lambda t: f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
        for a, b, txt in C: f.write(f"Dialogue: 0,{s(a)},{s(b)},Leg,,0,0,0,,{{\\fad(100,100)}}" + "\\N".join(wrap(txt, 56)) + "\n")
    print(len(C), "legendas")

if __name__ == "__main__":
    main()
