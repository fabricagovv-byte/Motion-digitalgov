"""Mixagem do filme "DigitalGov · Digitalização": narração (Piper) + trilha sintetizada (abaixa sob a voz) + efeitos.
Lê timeline.json (gerado por narration.py). Saídas em build/digitalgov/:
mix_raw.wav, stem_voz.wav, stem_trilha.wav, stem_efeitos.wav e legendas_ptBR.srt."""
import json, os, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(ROOT, "../../build/digitalgov")
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


def clap():
    t = ta(0.18); n = rng.standard_normal(len(t)); n = lowpass(n, 5000) - lowpass(n, 900)
    env = np.exp(-t * 28) + 0.6 * np.exp(-((t - 0.012) ** 2) / 1e-5) + 0.5 * np.exp(-((t - 0.024) ** 2) / 1e-5)
    return n * env * 0.9


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
    if bt >= 2.0:
        mus.add(kick(0.7 if bt < F else 0.95), bt)
    if bt >= SC[1] - 2:
        mus.add(hat(), bt + BEAT / 2, .4 if bt < F else .55, .3)
        mus.add(hat(), bt + BEAT / 4, .16, -.3); mus.add(hat(), bt + 3 * BEAT / 4, .16, -.3)
    if bt >= SC[1] and i % 2 == 1:
        mus.add(clap(), bt, .32 if bt < F else .42, .05)
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
duck = np.where(env > 0.004, 10 ** (-13 / 20), 1.0)
sm = int(0.3 * SR); duck = np.convolve(duck, np.ones(sm) / sm, mode="same")
mus.L *= duck; mus.R *= duck

# ---------------- sfx (same times as film.html) ----------------
fx = Bus()
LN = TL["lines"]
def Wd(k, word, off=0.0):
    ln = LN[k - 1]; c = ln["caption"].lower(); i = c.find(word.lower())
    return ln["start"] + ln["dur"] * (0 if i < 0 else i / len(c)) + off
for k in (2, 3, 4, 5, 6, 7, 12, 13, 14):                       # transições em mosaico
    s = SC[k - 1]
    fx.add(whoosh(.6), s - 0.35, .2, .2)
    for q in range(10): fx.add(pop(500 + q * 60, 900 + q * 60), s - 0.36 + q * .03, .03, (q % 3 - 1) * .5)
for q in range(22): fx.add(whoosh(.35), .3 + q * .26, .022, (q % 5 - 2) * .4)        # papéis caindo
t0 = Wd(1, "38") - 0.15; fx.add(impact()[: int(.8 * SR)], t0, .35); fx.add(pop(600, 1300), t0, .16)
fx.add(pop(500, 1000), Wd(2, "2 milhões", -.2), .18); fx.add(pop(700, 1400), Wd(2, "1 bilhão", -.2), .2)
for q in range(12): fx.add(tick(1800 + q * 80), SC[1] + .2 + q * .12, .035)
for w in ("ocupa", "se perde", "amarela", "consome"): fx.add(pop(380, 900), Wd(3, w) - .1, .2)
for q in range(6): fx.add(pop(220, 160), Wd(3, "ocupa") + .1 + q * .08, .12)
fx.add(whoosh(.8), Wd(3, "se perde") + .3, .12, .4)
for q in range(10): fx.add(tick(2600), Wd(3, "consome") + q * .1, .06)
fx.add(pop(400, 800), Wd(4, "Bahia") - .2, .16)
for w in ("1,2 bilhão", "50 milhões"):
    fx.add(pop(600, 1200), Wd(4, w, -.3), .2)
    for q in range(10): fx.add(tick(2200 + q * 70), Wd(4, w, -.3) + q * .11, .04)
fx.add(pop(300, 700), SC[4] + .25, .18)
for w in ("saúde", "educação", "cidade"):
    fx.add(pop(450, 950), Wd(5, w) - .1, .18)
    for q in range(10): fx.add(tick(3000 + q * 40), Wd(5, w) - .2 + q * .07, .03, .2)
for q in range(6): fx.add(pop(420 + q * 60, 900 + q * 60), Wd(6, "seis") + q * .12, .16)
# etapas
fx.add(pop(500, 1000), SC[6], .16)
for q in range(5): fx.add(pop(900, 1400), Wd(7, "grampos") + q * .1, .06)
fx.add(whoosh(.6), Wd(7, "organizamos"), .14); fx.add(whoosh(1.2), Wd(7, "higienizamos"), .08, .3)
fx.add(pop(500, 1000), SC[7], .16); fx.add(riser(1.5), Wd(8, "escaneada", -.3), .1); fx.add(shimmer(), Wd(8, "tratada"), .12)
fx.add(pop(500, 1000), SC[8], .16)
for w in ("nome", "número", "data", "setor"):
    for q in range(5): fx.add(tick(3100 + (q * 61) % 300), Wd(9, w, -.1) + q * .07, .03, .2)
    fx.add(pop(700, 1300), Wd(9, w, .25), .1)
fx.add(pop(500, 1000), SC[9], .16)
for q in range(24): fx.add(tick(2800 + (q % 4) * 120), SC[9] + .5 + q * .1, .05)
fx.add(pop(500, 1000), SC[10], .16)
for q in range(10): fx.add(tick(3000 + q * 30), SC[10] + .4 + q * .08, .035)
fx.add(pop(600, 1100), Wd(11, "qualquer", -.4), .16)
for w in ("853", "20 mil", "30 centavos"): fx.add(pop(420, 900), Wd(12, w, -.2), .18)
for w in ("5 milhões", "60 milhões"):
    t0 = Wd(12, w, -.3); fx.add(impact()[: int(.6 * SR)], t0, .3); fx.add(pop(700, 1500), t0, .14)
for w in ("10 anos", "atendimento", "segurança", "preço"): fx.add(whoosh(.35), Wd(13, w) - .3, .14); fx.add(pop(450, 950), Wd(13, w) - .1, .18)
fx.add(pop(500, 1100), SC[13] + .3, .2)
for q in range(26): fx.add(tick(1500 + (q * 113) % 1500), Wd(14, "atendemos") - .4 + q * .05, .04, (q % 5 - 2) * .4)
fx.add(riser(1.8), F - 1.8, .3); fx.add(impact(), F, .55); fx.add(shimmer(), F + .6, .2)
for q in range(16): fx.add(pop(500 + q * 50, 1000 + q * 50), F + .8 + q * .05, .04, (q % 3 - 1) * .6)
fx.add(pop(600, 1200), Wd(15, "Warley", -.3), .16)


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
