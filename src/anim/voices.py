"""Vozes do curta de animação (60 s): diálogos dos personagens + narração, e dados de sincronia labial.

Cada personagem tem uma voz neural pt-BR própria (sherpa-onnx):
  Prefeito  -> Piper pt_BR-cadu-medium (grave, maduro)
  Rafael    -> Kokoro pm_santa (jovem, bem-humorado)
  Cláudia   -> Kokoro pf_dora
  Juliana   -> Kokoro pf_dora com timbre mais agudo e andamento mais leve (outra personagem)
  Narrador  -> Piper pt_BR-faber-medium
  Protagonista DigitalGov -> Kokoro pm_alex (caloroso, confiante)
Para cada fala são geradas várias tomadas; cada uma é transcrita (Whisper small) e fica a mais inteligível.
Saídas: audio/anim/voice/<id>.wav (48 kHz mono), audio/anim/voice/lines.json (duração + legenda) e
        audio/anim/lipsync.json (abertura/largura/arredondamento da boca, 30 quadros/s).
Uso: python3 src/anim/voices.py [--takes 4] [--only L1,L2]
"""
import json, os, sys
import numpy as np
import soundfile as sf
import sherpa_onnx as so
from scipy.signal import resample_poly, butter, sosfilt
from pedalboard import Pedalboard, PitchShift

sys.path.insert(0, "src/inst")
from narration import transcribe, wer  # Whisper small (sherpa-onnx) + WER normalizado

V = "voices/"
OUT = "audio/anim/voice"
SR = 48000
FPS = 30
TAKES = int(sys.argv[sys.argv.index("--takes") + 1]) if "--takes" in sys.argv else 4
ONLY = sys.argv[sys.argv.index("--only") + 1].split(",") if "--only" in sys.argv else None

# voz: (motor, sid, velocidade, semitons)
CAST = {
    "prefeito": ("cadu", 0, 1.0, 0.0),
    "rafael": ("kokoro", 44, 1.08, 0.0),
    "claudia": ("kokoro", 42, 1.1, 0.0),
    "juliana": ("kokoro", 42, 1.1, 2.6),
    "narrador": ("faber", 0, 1.0, 0.0),
    "heroi": ("kokoro", 43, 1.16, 0.0),
}
# id, personagem, legenda (texto literal do roteiro), texto enviado à voz
LINES = [
    ("L1", "rafael", "Gente, alguém viu o processo que estava aqui?", "Gente, alguém viu o processo que estava aqui?"),
    ("L2", "claudia", "Se eu soubesse onde ele está, já tinha encontrado!", "Se eu soubesse onde ele está, já tinha encontrado!"),
    ("L3", "prefeito", "Precisamos resolver isso. Como vamos organizar tanta coisa?", "Precisamos resolver isso. Como vamos organizar tanta coisa?"),
    ("L4", "juliana", "Achei! Mas precisamos de um jeito melhor de organizar tudo isso.", "Achei! Mas precisamos de um jeito melhor de organizar tudo isso."),
    ("L5", "prefeito", "É hora de modernizar nossa gestão documental.", "É hora de modernizar nossa gestão documental."),
    ("N1", "narrador", "A DigitalGov trabalha com digitalização documental, indexação e Gestão Eletrônica de Documentos, ajudando instituições públicas a organizar suas informações e facilitar o acesso aos arquivos.",
           "A Digital Góvi trabalha com digitalização documental, indexação e Gestão Eletrônica de Documentos, ajudando instituições públicas a organizar suas informações e facilitar o acesso aos arquivos."),
    ("L6", "claudia", "Olha só! Agora conseguimos localizar a informação sem procurar em todas essas pastas!", "Olha só! Agora conseguimos localizar a informação sem procurar em todas essas pastas!"),
    ("L7", "prefeito", "É disso que precisamos: organização, tecnologia e mais facilidade no dia a dia!", "É disso que precisamos: organização, tecnologia, e mais facilidade no dia a dia!"),
    ("P1", "heroi", "Olá! Nós somos a DigitalGov. Ajudamos prefeituras e instituições públicas a transformar a gestão documental com digitalização, indexação e GED. Vamos levar mais organização e tecnologia para sua instituição?",
           "Olá! Nós somos a Digital Góv. Ajudamos prefeituras e instituições públicas a transformar a gestão documental com digitalização, indexação e Gê É Dê. Vamos levar mais organização e tecnologia para sua instituição?"),
]

_eng = {}
def engine(name):
    if name in _eng: return _eng[name]
    if name == "kokoro":
        d = V + "kokoro-multi-lang-v1_0/"
        m = so.OfflineTtsModelConfig(kokoro=so.OfflineTtsKokoroModelConfig(model=d + "model.onnx", voices=d + "voices.bin", tokens=d + "tokens.txt",
                                                                           data_dir=d + "espeak-ng-data", lang="pt-br"), num_threads=4)
    else:
        n = f"pt_BR-{name}-medium"; d = V + f"vits-piper-{n}/"
        m = so.OfflineTtsModelConfig(vits=so.OfflineTtsVitsModelConfig(model=d + f"{n}.onnx", tokens=d + "tokens.txt", data_dir=d + "espeak-ng-data",
                                                                       length_scale=0.92, noise_scale=0.62, noise_scale_w=0.75), num_threads=4)
    _eng[name] = so.OfflineTts(so.OfflineTtsConfig(model=m)); return _eng[name]

def trim(x, sr, thr_db=-46):
    """Remove silêncio das bordas, preservando 30 ms de respiro."""
    e = np.sqrt(np.convolve(x ** 2, np.ones(int(0.01 * sr)) / int(0.01 * sr), mode="same") + 1e-12)
    idx = np.where(20 * np.log10(e) > thr_db)[0]
    if not len(idx): return x
    a, b = max(0, idx[0] - int(0.03 * sr)), min(len(x), idx[-1] + int(0.06 * sr))
    return x[a:b]

def synth(line, take):
    lid, who, caption, text = line
    eng, sid, speed, semi = CAST[who]
    sp = speed * (1.0 + (0.0, -0.025, 0.025, -0.05, 0.05)[take % 5]) if eng == "kokoro" else speed
    a = engine(eng).generate(text, sid=sid, speed=sp)
    x = np.asarray(a.samples, dtype=np.float32); sr = a.sample_rate
    g = np.gcd(SR, sr); x = resample_poly(x, SR // g, sr // g).astype(np.float32) if sr != SR else x
    if semi:  # personagem distinta: timbre mais agudo (sem alterar o andamento)
        x = Pedalboard([PitchShift(semitones=semi)])(x[None, :], SR)[0]
    x = trim(x, SR)
    f = int(0.006 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x / (np.max(np.abs(x)) + 1e-9) * 0.9

def lipsync(x):
    """Curvas de boca por quadro: open (energia da voz), wide (fricativas/vogais abertas-anteriores), round (o/u)."""
    hop = SR // FPS; n = int(np.ceil(len(x) / hop))
    band = lambda lo, hi: sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)
    lowv, mid, hi = band(150, 900), band(900, 3000), band(3500, 9000)
    def rms(s):
        p = np.pad(s, (0, n * hop - len(s))); return np.sqrt((p.reshape(n, hop) ** 2).mean(1) + 1e-12)
    rl, rm, rh = rms(lowv), rms(mid), rms(hi)
    tot = rl + rm
    o = np.clip((20 * np.log10(tot + 1e-9) - (20 * np.log10(tot.max()) - 30)) / 30, 0, 1) ** 1.3
    w = np.clip(rh / (tot + rh + 1e-9) * 2.2, 0, 1)
    r = np.clip(rl / (rm + rl + 1e-9) - 0.45, 0, 0.55) / 0.55 * (o > 0.2)
    sm = lambda v, k=3: np.convolve(np.pad(v, (k // 2, k // 2), mode="edge"), np.ones(k) / k, mode="valid")
    return {"open": [round(float(v), 2) for v in sm(o)], "wide": [round(float(v), 2) for v in sm(w)], "round": [round(float(v), 2) for v in sm(r, 5)]}

def main():
    os.makedirs(OUT, exist_ok=True)
    meta = json.load(open(f"{OUT}/lines.json")) if os.path.exists(f"{OUT}/lines.json") else {}
    lips = json.load(open("audio/anim/lipsync.json")) if os.path.exists("audio/anim/lipsync.json") else {}
    for line in LINES:
        lid, who, caption, _ = line
        if ONLY and lid not in ONLY: continue
        best = None
        for k in range(TAKES):
            x = synth(line, k); p = f"{OUT}/{lid}_take.wav"; sf.write(p, x, SR)
            hyp = transcribe(p); e = wer(caption.replace("DigitalGov", "Digital Gov").replace("—", ""), hyp)
            print(f"  {lid} tomada {k}: WER {e:.2f} {len(x) / SR:.2f}s | {hyp}")
            if best is None or e < best[0] - 1e-6: best = (e, x)
            if e == 0 and k >= 1: break
        os.remove(f"{OUT}/{lid}_take.wav")
        x = best[1]; sf.write(f"{OUT}/{lid}.wav", x, SR, subtype="PCM_24")
        meta[lid] = {"who": who, "dur": round(len(x) / SR, 3), "caption": caption, "wer": round(best[0], 3)}
        lips[lid] = lipsync(x)
        print(lid, who, meta[lid]["dur"], "s  WER", meta[lid]["wer"])
    json.dump(meta, open(f"{OUT}/lines.json", "w"), ensure_ascii=False, indent=1)
    json.dump(lips, open("audio/anim/lipsync.json", "w"), separators=(",", ":"))

if __name__ == "__main__":
    main()
