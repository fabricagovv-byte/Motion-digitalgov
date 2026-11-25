"""Narração do filme "30 dias" (60 s) — Piper, voz neural pt_BR-cadu-medium.

Texto da legenda = roteiro aprovado (literal). Texto falado = mesma frase com grafia fonética
onde necessário ("GED" -> "Gê É Dê", "DigitalGov" -> "Digital Góvi", "pilhas" -> "pílias").
Uso: python3 src/cidade/narration.py [--scale 0.82] [--tempo 1.07] [--takes 6]
"""
import json, os, subprocess, sys, wave

VOICE = os.environ.get("PIPER_VOICE", "voices/vits-piper-pt_BR-cadu-medium/pt_BR-cadu-medium.onnx")
OUT = "audio/cidade/narration"
SCALE = sys.argv[sys.argv.index("--scale") + 1] if "--scale" in sys.argv else "0.82"
TEMPO = float(sys.argv[sys.argv.index("--tempo") + 1]) if "--tempo" in sys.argv else 1.07  # leve aceleração (WSOLA) p/ ritmo de locução comercial

# id, legenda (roteiro), texto enviado ao TTS, [pausa entre frases]
LINES = [
    ("c1a", "Faltam trinta dias para o governador chegar.", "Faltam trinta dias para o governador chegar.", 0.1),
    ("c1b", "O que a sua cidade vai mostrar?", "O que a sua cidade vai mostrar?", 0.1),
    ("c2a", "Olhe estas duas cidades. Numa, a terra é seca: a obra parou, a rua tem buraco, e ninguém sabe quanto tem.",
            "Olhe estas duas cidades. Numa, a terra é seca: a óbra parou, a rua tem buraco, e ninguém sabe quanto tem.", 0.12),
    ("c2b", "Na outra, a terra está molhada. Tudo brota, porque cada real e cada rua estão sob controle.",
            "Na outra, a terra está molhada. Tudo brota, porque cada real, e cada rua, estão sob controle.", 0.12),
    ("c3", "Tudo começa pelo caixa: quanto tem, quanto entra, quanto gasta. E quantos habitantes dependem de cada decisão.",
           "Tudo começa pelo caixa: quanto tem, quanto entra, quanto gasta. E quantos habitantes dependem de cada decisão.", 0.15),
    ("c4", "Depois, a lista para apurar a cidade: ruas, iluminação, água, escolas, saúde, coleta e obras. Item por item, bairro por bairro. Está tudo ali.",
           "Depois, a lista para apurar a cidade: ruas, iluminação, água, escolas, saúde, coleta, e obras. Item por item, bairro por bairro. Está tudo ali.", 0.15),
    ("c5a", "No trigésimo dia, o governador chega e encontra uma cidade pronta.", "No trigésimo dia, o governador chega, e encontra uma cidade pronta.", 0.12),
    ("c5b", "DigitalGov: gestão que faz a cidade florescer.", "Digital Góvi. Gestão que faz a cidade florescer.", 0.18),
]

TAKES = int(sys.argv[sys.argv.index("--takes") + 1]) if "--takes" in sys.argv else 1
ONLY = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None
ASR = "voices/asr/sherpa-onnx-whisper-small/"

def _norm(t):
    import re, unicodedata
    t = unicodedata.normalize("NFKD", t.lower()); t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", t.replace("ged", "ged")).split()

def wer(ref, hyp):
    r, h = _norm(ref), _norm(hyp); d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1])); prev, d[j] = d[j], cur
    return d[len(h)] / max(1, len(r))

_rec = None
def transcribe(path):
    """Transcrição automática (Whisper small via sherpa-onnx) para escolher a melhor tomada."""
    global _rec
    import numpy as np, soundfile as sf, sherpa_onnx
    from scipy.signal import resample_poly
    if _rec is None:
        _rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=ASR + "small-encoder.int8.onnx", decoder=ASR + "small-decoder.int8.onnx",
                                                          tokens=ASR + "small-tokens.txt", language="pt", task="transcribe", num_threads=2)
    x, sr = sf.read(path); x = resample_poly(x, 16000, sr); st = _rec.create_stream(); st.accept_waveform(16000, x.astype(np.float32)); _rec.decode_stream(st)
    return st.result.text.strip()

def main():
    os.makedirs(OUT, exist_ok=True)
    durs = json.load(open(f"{OUT}/durations.json")) if ONLY and os.path.exists(f"{OUT}/durations.json") else {}
    for lid, caption, tts, *rest in LINES:
        if ONLY and lid not in ONLY: continue
        pause = rest[0] if rest else 0.2
        path, raw = f"{OUT}/{lid}.wav", f"{OUT}/{lid}_raw.wav"
        best = None
        for k in range(TAKES):   # várias tomadas (a síntese varia a cada execução); fica a mais inteligível
            take = f"{OUT}/{lid}_take{k}.wav"
            subprocess.run([sys.executable, "-m", "piper", "-m", VOICE, "-f", raw,
                            "--length-scale", SCALE, "--noise-scale", "0.6", "--noise-w-scale", "0.7",
                            "--sentence-silence", str(pause)], input=tts.encode(), check=True, capture_output=True)
            # remove silêncio das bordas e aplica o andamento
            trim = "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", f"{trim},atempo={TEMPO}", "-ar", "22050", take], check=True)
            if TAKES == 1: os.replace(take, path); break
            hyp = transcribe(take); e = wer(caption.replace("GED", "GED").replace("DigitalGov", "Digital Gov"), hyp)
            print(f"  {lid} tomada {k}: WER {e:.2f} | {hyp}")
            if best is None or e < best[0]: best = (e, take)
        if TAKES > 1:
            os.replace(best[1], path)
            for k in range(TAKES):
                if os.path.exists(f"{OUT}/{lid}_take{k}.wav"): os.remove(f"{OUT}/{lid}_take{k}.wav")
        os.remove(raw)
        with wave.open(path) as w:
            durs[lid] = {"dur": w.getnframes() / w.getframerate(), "caption": caption}
        print(lid, round(durs[lid]["dur"], 2))
    json.dump(durs, open(f"{OUT}/durations.json", "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
