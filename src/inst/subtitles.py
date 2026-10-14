"""Legendas pt-BR (SRT, VTT e ASS) do vídeo institucional, sincronizadas com a narração real."""
import json, os, sys
sys.path.insert(0, "src")
from subtitles import wrap, ts

TL = json.load(open("src/inst/timeline.json"))
DURS = json.load(open("audio/inst/narration/durations.json"))
OUT = "deliverables/institucional"
SPLITS = {
    "a1": ["Somos a DigitalGov.", "Transformamos a maneira como instituições públicas", "organizam, digitalizam e gerenciam suas informações."],
    "a2": ["Com nossos serviços de digitalização documental,", "documentos físicos são preparados, digitalizados", "e transformados em arquivos digitais,", "facilitando a conservação, a consulta e o acesso às informações."],
    "a3b": ["Nós organizamos e indexamos os documentos", "para que cada informação possa ser localizada com mais facilidade,", "sem depender de buscas demoradas", "em pilhas de papel e arquivos físicos."],
    "a4": ["Com o GED, a Gestão Eletrônica de Documentos,", "sua instituição pode centralizar arquivos digitais,", "pesquisar documentos, organizar informações", "e facilitar o fluxo de trabalho entre setores,", "com acesso conforme as permissões configuradas."],
    "a5b": ["A DigitalGov ajuda sua instituição", "a avançar na transformação digital,", "do papel à gestão documental inteligente."],
    "a5c": ["DigitalGov:", "informação organizada, gestão modernizada."],
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
    with open("build/legendas_inst.ass", "w", encoding="utf-8") as f:
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
