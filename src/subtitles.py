"""Gera legendas pt-BR (SRT, VTT e ASS) sincronizadas com a narração real (tempos medidos dos WAVs)."""
import json, os, textwrap

TL = json.load(open("src/timeline.json"))
DURS = json.load(open("audio/narration/durations.json"))
MAXC = 42  # caracteres por linha

# Divide falas longas em blocos (pontos naturais de pausa); tempo proporcional ao nº de caracteres.
SPLITS = {
    "n1": ["Imagine ter seus documentos organizados,", "disponíveis e prontos para serem encontrados."],
    "n2": ["Com a Gestão Eletrônica de Documentos, o GED,", "a informação deixa de ficar presa ao papel."],
    "n3": ["Seus arquivos são digitalizados, organizados e indexados", "para facilitar a consulta e o gerenciamento."],
    "n4b": ["você pode acessar seus documentos de forma prática,", "conforme suas permissões de acesso."],
    "n6": ["GED.", "Uma nova dimensão para a gestão documental."],
}

def cues():
    out = []
    for item in TL["narration"]:
        d = DURS[item["id"]]; start, dur = item["at"], d["dur"]
        parts = SPLITS.get(item["id"], [d["caption"]])
        total = sum(len(p) for p in parts); t = start
        for p in parts:
            pd = dur * len(p) / total
            out.append((t, t + pd, p)); t += pd
    # leve extensão para leitura confortável, sem sobrepor a próxima legenda
    res = []
    for i, (a, b, txt) in enumerate(out):
        nxt = out[i + 1][0] if i + 1 < len(out) else TL["duration"]
        res.append((a, min(b + 0.35, nxt - 0.04), txt))
    return res

def wrap(txt, maxc=MAXC):
    """Quebra equilibrada em no máximo 2 linhas."""
    if len(txt) <= maxc: return [txt]
    w = txt.split(" "); best = None
    for i in range(1, len(w)):
        a, b = " ".join(w[:i]), " ".join(w[i:])
        sc = max(len(a), len(b)) + (0 if len(a) <= len(b) + 6 else 3)
        if best is None or sc < best[0]: best = (sc, [a, b])
    return best[1]

def ts(t, sep=","):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d}{sep}{int(round((s - int(s)) * 1000)):03d}"

def main():
    os.makedirs("deliverables", exist_ok=True)
    C = cues()
    with open("deliverables/legendas_ptBR.srt", "w", encoding="utf-8") as f:
        for i, (a, b, txt) in enumerate(C, 1):
            f.write(f"{i}\n{ts(a)} --> {ts(b)}\n" + "\n".join(wrap(txt)) + "\n\n")
    with open("deliverables/legendas_ptBR.vtt", "w", encoding="utf-8") as f:
        f.write("WEBVTT\n\n")
        for a, b, txt in C:
            f.write(f"{ts(a, '.')} --> {ts(b, '.')}\n" + "\n".join(wrap(txt)) + "\n\n")
    # ASS com estilo da campanha (para a versão com legendas embutidas)
    with open("build/legendas.ass", "w", encoding="utf-8") as f:
        f.write("""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Leg,Inter,38,&H00FFFFFF,&H00FFFFFF,&H64000000,&H8C05080F,0,0,0,0,100,100,0,0,3,14,0,2,200,200,46,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""")
        for a, b, txt in C:
            s = lambda t: f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
            f.write(f"Dialogue: 0,{s(a)},{s(b)},Leg,,0,0,0,,{{\\fad(120,120)}}" + "\\N".join(wrap(txt, 56)) + "\n")
    print(len(C), "legendas")

if __name__ == "__main__":
    main()
