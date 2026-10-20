"""Mixagem do filme "Ibiá – MG": narração (Kokoro) + trilha sintetizada (abaixa sob a voz) + efeitos.
Lê timeline.json (gerado por narration.py). Saídas em build/ibia_motion/:
mix_raw.wav, stem_voz.wav, stem_trilha.wav, stem_efeitos.wav e legendas_ptBR.srt."""
import json, os, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(ROOT, "../../build/ibia_motion")
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


# ---------------- music: warm, nostalgic (D - A - Bm - G), soft groove ----------------
mus = Bus()
CH = [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]]
k = 0; t = OFF
while t < DUR:
    c = CH[k % 4]
    g = 0.65 if t < F - 0.01 else 0.85
    mus.add(pad([note(m - 12) for m in c], 4.3), t, g, -0.1)
    mus.add(pad([note(m) for m in c[1:]], 4.3), t, g * .3, .15)
    t += 4.0; k += 1
bt = OFF; i = 0
while bt < DUR:
    if F - 1.0 <= bt < F:
        bt += BEAT; i += 1; continue
    if bt >= SC[1] - 1 and i % 2 == 0:
        mus.add(kick(0.55 if bt < F else 0.8), bt)
    if bt >= SC[1]:
        mus.add(hat(), bt + BEAT / 2, .25, .3)
    if bt >= SC[2] and i % 4 == 2:
        mus.add(clap(), bt, .22, .05)
    c = CH[int((bt - OFF) // 4) % 4]
    for j in range(2):                       # dedilhado tipo viola
        m = (c + [x + 12 for x in c])[(i * 2 + j) % 6]
        mus.add(pluck(note(m), .6), bt + j * BEAT / 2, .085 if bt < F else .1, .35 if j else -.35)
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
for k in range(2, len(SC) + 1):                                # transições em mosaico
    s = SC[k - 1]
    fx.add(whoosh(.6), s - 0.4, .18, .2)
    for q in range(8): fx.add(pop(500 + q * 60, 900 + q * 60), s - 0.4 + q * .035, .025, (q % 3 - 1) * .5)
fx.add(shimmer(), 0.6, .12)
t0 = Wd(2, "ibiá") - .05; fx.add(impact()[: int(.9 * SR)], t0, .3); fx.add(pop(600, 1300), t0, .14)
for w in ("22 mil", "2.700", "895"):
    t0 = Wd(2, w) - .35; fx.add(pop(500, 1000), t0, .16)
    for q in range(10): fx.add(tick(2200 + q * 80), t0 + q * .09, .03)
fx.add(pop(380, 800), Wd(3, "pouso") - .2, .18); fx.add(riser(.9), Wd(3, "promessa") - .9, .08); fx.add(shimmer(), Wd(3, "promessa"), .1)
for q in range(22): fx.add(tick(3000 + (q % 3) * 90), Wd(3, "são pedro") - .1 + q / 22, .025, .2)
fx.add(impact()[: int(1.2 * SR)], Wd(4, "quilombo") - .2, .25)
t0 = Wd(4, "destruído") - .3
for q in range(12): fx.add(tick(1800 + q * 60), t0 + q * .1, .04)
fx.add(impact()[: int(.7 * SR)], t0 + 1.2, .22)
fx.add(whoosh(1.0), Wd(5, "vigiavam") - .4, .12, -.4); fx.add(pop(500, 1100), Wd(5, "1998") - .35, .18)
for q in range(14): fx.add(tick(900 + (q % 2) * 200), SC[5] + .5 + q * .32, .05, .3)      # trem nos trilhos
fx.add(whoosh(.8), Wd(6, "entroncamento") - .4, .14)
for w in ("7 de", "setembro", "1923"): fx.add(impact()[: int(.5 * SR)], Wd(7, w) - .1, .22); fx.add(pop(600, 1200), Wd(7, w) - .1, .12)
for q in range(30): fx.add(pop(800 + (q * 97) % 900, 1400 + (q * 97) % 900), Wd(7, "município") - .4 + q * .04, .03, (q % 5 - 2) * .4)
for w in ("fotos", "peças", "urnas"): fx.add(pop(450, 950), Wd(8, w) - .35, .18)
for w in ("rodeio", "queima", "desfile", "música"):
    t0 = Wd(9, w) - .3; fx.add(pop(500, 1000), t0, .16)
    for q in range(14): fx.add(pop(1200 + q * 50, 1800 + q * 40), t0 + .15 + q * .04, .02, (q % 3 - 1) * .6)
for w in ("soja", "café", "milho"):
    t0 = Wd(10, w) - .3; fx.add(riser(.9), t0 - .3, .05)
    for q in range(8): fx.add(tick(2400 + q * 70), t0 + q * .1, .03)
t0 = Wd(10, "1 bilhão") - .4; fx.add(impact()[: int(.7 * SR)], t0, .25); fx.add(pop(700, 1500), t0, .12)
fx.add(riser(1.8), F - 1.8, .25); fx.add(impact(), F + .6, .45); fx.add(shimmer(), F + 1.0, .2)

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
