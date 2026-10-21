"""Narração da série V4.7 (Kokoro v1.0, voz pm_alex). Uso, de dentro da pasta do filme:
    python3 ../kit/narration.py
Lê LINES de lines.py (id, legenda, texto para o TTS, pausa depois) e grava ./timeline.json.
Os WAVs ficam em build/v47_<pasta>/voice/."""
import json, os, subprocess, sys, wave, importlib.util
import soundfile as sf

FILM = os.getcwd(); NAME = os.path.basename(FILM)
KIT = os.path.dirname(os.path.abspath(__file__))
KDIR = os.path.join(KIT, "../../../voices/kokoro")
spec = importlib.util.spec_from_file_location("lines", os.path.join(FILM, "lines.py")); L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)
VOICE = getattr(L, "VOICE", "pm_alex"); SPEED = getattr(L, "SPEED", 1.08)
START = getattr(L, "START", 0.8); BEFORE_END = getattr(L, "BEFORE_END", 1.0); TAIL = getattr(L, "TAIL", 4.0)
OUT = os.path.join(KIT, f"../../../build/v47_{NAME}/voice")
FX = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
      "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,"
      "highpass=f=70,equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=3500:t=q:w=1.4:g=1.5,"
      "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,"
      "aresample=48000:resampler=soxr,loudnorm=I=-16:TP=-1.5:LRA=7")

def main():
    from kokoro_onnx import Kokoro
    K = Kokoro(f"{KDIR}/kokoro-v1.0.onnx", f"{KDIR}/voices-v1.0.bin")
    os.makedirs(OUT, exist_ok=True)
    t = START; tl = []
    for i, (lid, cap, tts, pause) in enumerate(L.LINES):
        path = f"{OUT}/{lid}.wav"; raw = f"{OUT}/{lid}_raw.wav"
        samples, sr = K.create(tts, voice=VOICE, speed=SPEED, lang="pt-br")
        sf.write(raw, samples, sr)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", FX, "-ac", "1", path], check=True)
        with wave.open(path) as w: d = w.getnframes() / w.getframerate()
        if i == len(L.LINES) - 1: t += BEFORE_END
        tl.append({"id": lid, "start": round(t, 3), "dur": round(d, 3), "caption": cap})
        t += d + pause
    end = round(t + TAIL, 2)
    json.dump({"lines": tl, "end": end}, open(os.path.join(FILM, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    for l in tl: print(l["id"], l["start"], l["dur"])
    print("end", end)

if __name__ == "__main__":
    main()
