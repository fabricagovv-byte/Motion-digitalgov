"""Biblioteca de áudio da série V4.7: sintetizadores, barramentos, voz, ducking e mixagem final.
Uso no audio.py de cada filme:
    import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../kit')); from audio_lib import *
    A = Ctx()                    # lê ./timeline.json; A.SC (inícios de cena), A.Wd(k, palavra), A.DUR, A.F (última cena)
    music(A, chords=..., ...)    # trilha pronta (ou escreva a sua em A.mus)
    A.fx.add(pop(500, 1000), A.Wd(3, 'palavra') - .2, .16)
    A.finish()                   # voz + ducking + mix_raw.wav, stems e legendas_ptBR.srt em build/v47_<pasta>/
"""
import json, os, wave
import numpy as np
SR = 48000
rng = np.random.default_rng(5)
N = 0


class Bus:
    def __init__(self, n):
        self.L = np.zeros(n); self.R = np.zeros(n); self.N = n

    def add(self, sig, t0, g=1.0, pan=0.0):
        i = int(t0 * SR)
        if i >= self.N or i < 0:
            return
        s = sig[: self.N - i] * g
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




def bass(f, d=0.5):
    t = ta(d); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 4) * np.minimum(1, t / .01)


def arp_note(f, d=0.22):
    t = ta(d); s = np.sign(np.sin(2 * np.pi * f * t)) * .3 + np.sin(2 * np.pi * f * t)
    return lowpass(s, 2800) * np.exp(-t * 12)


def blip(f=1200, d=0.09):
    t = ta(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 45)


def typing(n=12, gap=.06):
    out = np.zeros(int(SR * (n * gap * 1.2 + .1)))
    for q in range(n):
        c = lowpass(rng.standard_normal(int(SR * .03)), 4000) * np.exp(-ta(.03) * 120) * .5
        i = int(q * gap * SR * (0.8 + 0.4 * rng.random())); out[i:i + len(c)] += c[: len(out) - i]
    return out


class Ctx:
    def __init__(self):
        film = os.getcwd(); name = os.path.basename(film)
        self.B = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"../../../build/v47_{name}")
        self.TL = json.load(open(os.path.join(film, "timeline.json")))
        self.DUR = self.TL["end"]; self.N = int(SR * self.DUR)
        self.lines = self.TL["lines"]
        self.SC = [(0 if i == 0 else l["start"] - 0.4) for i, l in enumerate(self.lines)]
        self.F = self.SC[-1]
        self.mus = Bus(self.N); self.vox = Bus(self.N); self.fx = Bus(self.N)

    def Wd(self, k, word, off=0.0):
        ln = self.lines[k - 1]; c = ln["caption"].lower(); i = c.find(word.lower())
        return ln["start"] + ln["dur"] * (0 if i < 0 else i / len(c)) + off

    def transitions(self, skip=()):
        for k in range(2, len(self.SC) + 1):
            if k in skip: continue
            s = self.SC[k - 1]
            self.fx.add(whoosh(.55), s - .45, .17, .2)
            for q in range(8): self.fx.add(pop(600 + q * 70, 1000 + q * 70), s - .45 + q * .03, .022, (q % 3 - 1) * .5)

    def finish(self, duck_db=-13, music_gain=.8, fx_gain=.9):
        for l in self.lines:
            with wave.open(os.path.join(self.B, "voice", l["id"] + ".wav")) as w:
                sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768
            if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)
            self.vox.add(x, l["start"], 1.0)
        env = np.abs(self.vox.L); win = int(.25 * SR); env = np.convolve(env, np.ones(win) / win, mode="same")
        duck = np.where(env > .004, 10 ** (duck_db / 20), 1.0); sm = int(.3 * SR); duck = np.convolve(duck, np.ones(sm) / sm, mode="same")
        self.mus.L *= duck; self.mus.R *= duck
        st = lambda b: np.stack([b.L, b.R], axis=1)
        mix = st(self.mus) * music_gain + st(self.vox) + st(self.fx) * fx_gain
        fo = int(2.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
        peak = np.max(np.abs(mix)) * 1.1
        def save(arr, name):
            pcm = (np.clip(arr / peak, -1, 1) * 32767).astype("<i2")
            with wave.open(os.path.join(self.B, name), "wb") as w:
                w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
        save(mix, "mix_raw.wav"); save(st(self.vox), "stem_voz.wav"); save(st(self.mus) * music_gain, "stem_trilha.wav"); save(st(self.fx) * fx_gain, "stem_efeitos.wav")
        def ts(x):
            h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
            return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"
        with open(os.path.join(self.B, "legendas_ptBR.srt"), "w") as f:
            for i, l in enumerate(self.lines, 1):
                f.write(f"{i}\n{ts(l['start'])} --> {ts(l['start'] + l['dur'] + .2)}\n{l['caption']}\n\n")
        print("ok", self.DUR)


def music(A, chords=((57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)), beat=.5, drums_from=None, arp=True, gain=.6, end_gain=.85):
    """Trilha eletrônica moderna: pad + baixo + bumbo/caixa/chimbal + arpejo. Batida alinhada com a última cena (logo)."""
    F = A.F; OFF = F % beat; DUR = A.DUR; mus = A.mus
    drums_from = A.SC[1] - 2 if drums_from is None else drums_from
    t = OFF; k = 0
    while t < DUR:
        c = chords[k % len(chords)]; g = gain if t < F else end_gain
        mus.add(pad([note(m) for m in c], 4.3), t, g, -.1); mus.add(pad([note(m + 12) for m in c[1:]], 4.3), t, g * .25, .15)
        for q in range(8): mus.add(bass(note(c[0] - 24), .45), t + q * beat, .22 if t >= drums_from else .1)
        t += 8 * beat; k += 1
    bt = OFF; i = 0
    while bt < DUR:
        if F - 1.0 <= bt < F: bt += beat; i += 1; continue
        if bt >= 1.5: mus.add(kick(.75 if bt < F else .95), bt)
        if bt >= drums_from:
            mus.add(hat(), bt + beat / 2, .35, .3); mus.add(hat(), bt + beat / 4, .12, -.3); mus.add(hat(), bt + 3 * beat / 4, .12, -.3)
            if i % 2 == 1: mus.add(clap(), bt, .3, .05)
            if arp and bt < F - 1:
                c = chords[int((bt - OFF) // (8 * beat)) % len(chords)]
                for j in range(2):
                    m = (list(c) + [x + 12 for x in c])[(i * 2 + j) % 6]
                    mus.add(arp_note(note(m + 12)), bt + j * beat / 2, .05, .35 if j else -.35)
        bt += beat; i += 1
