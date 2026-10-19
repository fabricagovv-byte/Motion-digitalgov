"""Gera mouth.json: abertura da boca (0..1) e 'largura' (0..1) a 60 qps, a partir das falas posicionadas no timeline."""
import json, os, wave
import numpy as np
ROOT = os.path.dirname(os.path.abspath(__file__)); V = os.path.join(ROOT, "../../build/apresentadora/voice")
tl = json.load(open(os.path.join(ROOT, "timeline.json"))); FPS = 60; N = int(tl["end"] * FPS) + 1
op = np.zeros(N); wd = np.zeros(N)
for l in tl["lines"]:
    with wave.open(f"{V}/{l['id']}.wav") as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(float) / 32768
    hop = sr // FPS
    for i in range(len(x) // hop):
        seg = x[i * hop:(i + 1) * hop]; f = int(round((l["start"] + i / FPS) * FPS))
        if 0 <= f < N:
            rms = np.sqrt(np.mean(seg ** 2)); hf = np.mean(np.abs(np.diff(seg))) / (np.mean(np.abs(seg)) + 1e-6)
            op[f] = rms; wd[f] = hf
op = np.clip(op / (np.percentile(op[op > 0], 95) + 1e-9), 0, 1) ** 0.7
op = np.convolve(op, [0.25, 0.5, 0.25], mode="same")
wd = np.clip((wd - 0.2) / 1.0, 0, 1) * (op > 0.08)
json.dump({"fps": FPS, "open": [round(v, 3) for v in op], "wide": [round(v, 3) for v in wd]}, open(os.path.join(ROOT, "mouth.json"), "w"))
print("frames", N, "mean open", round(float(op.mean()), 3))
