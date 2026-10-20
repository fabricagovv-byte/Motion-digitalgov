"""Trilha do post animado (30 s): batida 120 BPM + efeitos nos eventos do app.html. Saída: build/app_pesquisa/mix.wav"""
import os, sys, wave
import numpy as np
SR = 48000; DUR = 30.0; N = int(SR * DUR); rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
def add(s, t, g=1.0, pan=0.0):
    i = int(t * SR); s = s[: max(0, N - i)] * g; L[i:i + len(s)] += s * (1 - max(0, pan)); R[i:i + len(s)] += s * (1 + min(0, pan))
ta = lambda d: np.arange(int(SR * d)) / SR
note = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); c = 0.0
    for i in range(len(x)): c = (1 - a) * x[i] + a * c; y[i] = c
    return y
def kick(): t = ta(.4); return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t * 30)) / SR) * np.exp(-t * 8)
def hat(): t = ta(.05); n = rng.standard_normal(len(t)); return (n - lp(n, 6500)) * np.exp(-t * 80) * .4
def clap(): t = ta(.16); n = rng.standard_normal(len(t)); return (lp(n, 5000) - lp(n, 900)) * np.exp(-t * 28)
def pad(fs, d):
    t = ta(d); s = sum(np.sin(2 * np.pi * f * h * t) * a for f in fs for h, a in ((1, 1), (2, .3), (3, .1)))
    return s * np.minimum(1, t / .6) * np.minimum(1, (d - t) / .8) / (len(fs) * 3)
def pluck(f): t = ta(.35); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 8)
def pop(a, b): t = ta(.13); return np.sin(2 * np.pi * np.cumsum(a + (b - a) * t / .13) / SR) * np.exp(-t * 30)
def tick(f): t = ta(.06); return np.sin(2 * np.pi * f * t) * np.exp(-t * 70)
def whoosh(d=.45):
    t = ta(d); n = rng.standard_normal(len(t)); x = t / d; lo = lp(n, 900); hi = lp(n, 3500) - lo
    return (lo * (1 - x) + hi * x * 1.4) * np.sin(np.pi * x) ** 2
def impact(): t = ta(1.4); return np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-t * 12)) / SR) * np.exp(-t * 3) + .4 * lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 9)
CH = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
for k in range(8): add(pad([note(m) for m in CH[k % 4]], 4.2), k * 4, .5)
b = 0.0; i = 0
while b < DUR:
    if not (27.7 <= b < 28.2):
        add(kick(), b, .8 if b > .4 else .4)
        add(hat(), b + .25, .4, .3); add(hat(), b + .125, .14, -.3); add(hat(), b + .375, .14, -.3)
        if i % 2: add(clap(), b, .3)
        c = CH[int(b // 4) % 4]; add(pluck(note(c[i % 3] + 12)), b, .06, .3); add(pluck(note(c[(i + 1) % 3] + 24)), b + .25, .04, -.3)
    b += .5; i += 1
PH = [2.4, 5.4, 8.4, 13.2, 16.6, 19.8, 22.8, 25.6]
for t in PH: add(whoosh(), t - .2, .2, .2)
for t in (.2, .35, .5): add(pop(500, 1000), t, .14)
add(pop(400, 800), .7, .14); add(pop(300, 200), 4.25, .2); add(pop(700, 1400), 4.65, .16)
for q in range(6): add(pop(450 + q * 60, 900 + q * 60), 5.4 + q * .09, .15)
a = 8.4
add(pop(500, 1000), a + .9, .16); add(whoosh(.3), a + 1.6, .1)
for q in range(4): add(pop(600 + q * 90, 1000 + q * 90), a + 1.9 + q * .16, .12)
for q in range(14): add(tick(3000 + (q * 37) % 400), a + 2.3 + q * .045, .03)
add(whoosh(.3), a + 3.0, .1); add(pop(1500, 900), a + 3.5, .2); add(tick(4000), a + 3.5, .12)
add(pop(700, 1400), a + 4.0, .16)
a = 13.2
for q in range(21): add(tick(3000 + (q * 37) % 400), a + .4 + q * .04, .04)
for t in (a + 1.3, a + 1.9, a + 2.4): add(pop(500, 1000), t, .18)
add(pop(700, 1400), a + 2.6, .16)
for q in range(10): add(tick(2200 + q * 80), 16.7 + q * .1, .05)
for q in range(20): add(pop(700 + (q * 53) % 500, 1100 + (q * 53) % 500), 20.2 + q * .06, .05, (q % 3 - 1) * .5)
a = 22.8
for q in range(10): add(tick(2600 + q * 40), a + .3 + q * .11, .04)
add(pop(700, 1400), a + 1.4, .16); add(pop(300, 200), a + 1.9, .2); add(whoosh(.4), a + 2.1, .14); add(pop(800, 1500), a + 2.3, .18)
a = 25.6
for q in range(5): add(pop(450 + q * 70, 900 + q * 70), a + .2 + q * .12, .12)
for q in range(10): add(tick(2200 + q * 80), a + q * .12, .04)
add(impact(), 28.2, .5); add(whoosh(.5), 28.0, .2)
mix = np.stack([L, R], 1); fo = int(1.2 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix /= np.max(np.abs(mix)) * 1.12
os.makedirs(os.path.dirname(sys.argv[1]), exist_ok=True)
with wave.open(sys.argv[1], "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype("<i2").tobytes())
print("ok")
