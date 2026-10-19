"""Mixagem do filme "Restauração de documentos": narração (Piper) + trilha sintetizada (abaixa sob a voz) + efeitos.
Lê timeline.json (gerado por narration.py). Saídas em build/restauracao/:
mix_raw.wav, stem_voz.wav, stem_trilha.wav, stem_efeitos.wav e legendas_ptBR.srt."""
import json, os, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(ROOT, "../../build/restauracao")
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
SR = 48000
DUR = TL["end"]
N = int(SR * DUR)
rng = np.random.default_rng(5)
lines = TL["lines"]
starts = [l["start"] for l in lines]
SC = [(0 if i == 0 else s - 0.4) for i, s in enumerate(starts)]   # scene starts (same rule as film.html)
F = SC[-1]                                                          # flood / logo
BEAT = 0.5
OFF = F % BEAT                                                      # beat grid lands on the flood


class Bus:
    def __init__(self):
        self.L = np.zeros(N); self.R = np.zeros(N)

    def add(self, sig, t0, g=1.0, pan=0.0):
        i = int(t0 * SR)
        if i >= N or i < 0:
            return
        s = sig[: N - i] * g
        self.L[i:i + len(s)] += s * (1 - max(0, pan)); self.R[i:i + len(s)] += s * (1 + min(0, pan))


def ta(d): return np.arange(int(SR * d)) / SR
def note(m): return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y


def pad(freqs, d):
    t = ta(d); s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.1, 0.0, 0.1):
            ff = f * 2 ** (det / 12)
            for h, a in ((1, 1), (2, .3), (3, .12)):
                s += a * np.sin(2 * np.pi * ff * h * t + h * det)
    return s * np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.2) / (len(freqs) * 5)


def kick(g=1.0):
    t = ta(0.4); f = 50 + 100 * np.exp(-t * 30)
    return g * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)


def hat():
    t = ta(0.05); n = rng.standard_normal(len(t)); n = n - lowpass(n, 6500)
    return n * np.exp(-t * 80) * 0.4


def pluck(f, d=0.5):
    t = ta(d); return (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 7)


def whoosh(d=0.5):
    t = ta(d); n = rng.standard_normal(len(t)); lo = lowpass(n, 900); hi = lowpass(n, 3500) - lo
    x = t / d; return (lo * (1 - x) + hi * x * 1.5) * np.sin(np.pi * x) ** 2 * 0.9


def tick(f=2400):
    t = ta(0.07); return np.sin(2 * np.pi * f * t) * np.exp(-t * 60)


def pop(f0=500, f1=900):
    t = ta(0.14); f = f0 + (f1 - f0) * (t / 0.14)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)


def impact():
    t = ta(1.6); f = 40 + 80 * np.exp(-t * 12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) + .5 * lowpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 9)


def riser(d):
    t = ta(d); n = rng.standard_normal(len(t)); return (n - lowpass(n, 1500)) * (t / d) ** 2.2 * 0.5


def shimmer():
    t = ta(1.6); s = sum(np.sin(2 * np.pi * note(m) * t) for m in (79, 83, 86, 91))
    return s * np.exp(-t * 2.2) * np.minimum(1, t / 0.02) / 4


# ---------------- music: warm, hopeful (C - G - Am - F) ----------------
mus = Bus()
CH = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
k = 0; t = OFF - 4 * BEAT * 2 if OFF > 0 else 0
t = OFF
while t < DUR:
    c = CH[k % 4]
    g = 0.6 if t < F - 0.01 else 0.8
    mus.add(pad([note(m) for m in c], 4.3), t, g, -0.1)
    mus.add(pad([note(m + 12) for m in c[1:]], 4.3), t, g * .3, .15)
    t += 4.0; k += 1
bt = OFF; i = 0
while bt < DUR:
    if F - 1.0 <= bt < F:
        bt += BEAT; i += 1; continue
    if bt >= SC[1]:
        mus.add(kick(0.55 if bt < F else 0.9), bt)
    if bt >= SC[2]:
        mus.add(hat(), bt + BEAT / 2, .35 if bt < F else .5, .3)
    if SC[1] <= bt < F - 1.0:
        c = CH[int((bt - OFF) // 4) % 4]
        for j in range(2):
            m = (c + [x + 12 for x in c])[(i * 2 + j) % 6]
            mus.add(pluck(note(m + 12), .45), bt + j * BEAT / 2, .06, .35 if j else -.35)
    bt += BEAT; i += 1

# ---------------- voice ----------------
vox = Bus()
for l in lines:
    with wave.open(os.path.join(B, "voice", l["id"] + ".wav")) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768
    if sr != SR:
        x = np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)
    vox.add(x, l["start"], 1.0)

# duck music ~9 dB under the voice (smoothed envelope)
env = np.abs(vox.L)
win = int(0.25 * SR); env = np.convolve(env, np.ones(win) / win, mode="same")
duck = np.where(env > 0.004, 10 ** (-9 / 20), 1.0)
sm = int(0.3 * SR); duck = np.convolve(duck, np.ones(sm) / sm, mode="same")
mus.L *= duck; mus.R *= duck

# ---------------- sfx (same times as film.html) ----------------
fx = Bus()
Lx = starts
for s in SC[1:-1]:
    fx.add(whoosh(.5), s - 0.15, .16, .2)
fx.add(whoosh(1.2), 0.2, .08, -.3)                                  # 1 papel entrando
fx.add(shimmer(), SC[1] + .3, .12)                                   # 2 logo
for d in (6.2, 7.6): fx.add(pop(450, 880), Lx[1] + d, .16)
fx.add(pop(500, 900), SC[2] + .3, .14)                               # 3 upload + varredura
for q in range(8): fx.add(tick(2400 + q * 50), SC[2] + .5 + q * .15, .04)
fx.add(riser(4.2), Lx[2] + 2.2, .08)
for d in (2.3, 3.9, 5.6): fx.add(pop(420, 900), Lx[2] + d, .18)
for d in (2.0, 3.6): fx.add(pop(450, 850), Lx[3] + d, .16)            # 4 duas versões + digitação
for q in range(40): fx.add(tick(3000 + (q * 37) % 400), Lx[3] + 4.2 + q * .1, .025, .2)
fx.add(pop(380, 700), Lx[4] + .6, .16); fx.add(pop(700, 1400), Lx[4] + 5.4, .2); fx.add(pop(500, 1000), Lx[4] + 7.4, .14)   # 5
for q in range(10): fx.add(tick(1800 + q * 100), Lx[5] + 1.2 + q * .14, .05)                                        # 6
for d in (4.0, 7.6, 9.6): fx.add(pop(400, 820), Lx[5] + d, .2)
for q in range(14): fx.add(tick(2600), SC[6] + 1.0 + q * .11, .04)                                                   # 7
fx.add(pop(700, 1400), SC[6] + 2.6, .18)
fx.add(pop(500, 900), Lx[7] + 3.6, .16)                                                                              # 8
for d in range(3): fx.add(tick(2400), Lx[7] + 2.4 + d * .5, .08)
fx.add(pop(600, 1100), Lx[8] + 1.3, .14)                                                                             # 9
for d in range(3): fx.add(pop(300, 500), Lx[8] + 1.6 + d * .3, .14)
for d in range(3): fx.add(tick(3000), Lx[8] + 4.7 + d * .3, .1)
for d in (2.6, 4.0, 5.6): fx.add(pop(500, 950), Lx[9] + d, .16)                                                      # 10
for q in range(14): fx.add(tick(3100 + (q * 41) % 300), Lx[9] + 6.0 + q * .085, .03)
fx.add(pop(700, 1400), Lx[9] + 7.6, .16)
fx.add(riser(1.8), F - 1.8, .3); fx.add(impact(), F, .5); fx.add(shimmer(), F + .6, .16)


def stereo(b): return np.stack([b.L, b.R], axis=1)


mix = stereo(mus) * 0.8 + stereo(vox) * 1.0 + stereo(fx) * 0.9
fo = int(2.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
peak = np.max(np.abs(mix)) * 1.1


def save(arr, name):
    pcm = (np.clip(arr / peak, -1, 1) * 32767).astype("<i2")
    with wave.open(os.path.join(B, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


save(mix, "mix_raw.wav"); save(stereo(vox), "stem_voz.wav"); save(stereo(mus) * .8, "stem_trilha.wav"); save(stereo(fx) * .9, "stem_efeitos.wav")


def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"


with open(os.path.join(B, "legendas_ptBR.srt"), "w") as f:
    for i, l in enumerate(lines, 1):
        f.write(f"{i}\n{ts(l['start'])} --> {ts(l['start'] + l['dur'] + 0.2)}\n{l['caption']}\n\n")
print("ok", DUR)
