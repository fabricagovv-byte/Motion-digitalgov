"""Trilha + efeitos 100% sintetizados para o filme "Pesquisas" (44 s, 120 BPM).
Saída: build/pesquisa/mix_raw.wav (depois normalizado a -14 LUFS pelo render.sh).
Todos os eventos usam os mesmos tempos do film.html."""
import sys, wave
import numpy as np

SR = 48000
DUR = 44.0
BEAT = 0.5
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)


def t_arr(d):
    return np.arange(int(SR * d)) / SR


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    s = sig[: N - i] * gain
    L[i:i + len(s)] += s * (1 - max(0, pan))
    R[i:i + len(s)] += s * (1 + min(0, pan))


def note(f):
    return 440.0 * 2 ** ((f - 69) / 12)


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


# ---------------- music ----------------
def pad(freqs, d):
    t = t_arr(d)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            for h, a in ((1, 1), (2, .35), (3, .15), (4, .07)):
                s += a * np.sin(2 * np.pi * ff * h * t + h * det)
    env = np.minimum(1, t / 0.9) * np.minimum(1, (d - t) / 1.2)
    return s * env / (len(freqs) * 6)


def kick(g=1.0):
    t = t_arr(0.45)
    f = 48 + 110 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return g * np.sin(ph) * np.exp(-t * 7.5)


def hat():
    t = t_arr(0.06)
    n = rng.standard_normal(len(t))
    n = n - lowpass(n, 6000)
    return n * np.exp(-t * 70) * 0.5


def bass(f, d):
    t = t_arr(d)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return s * np.minimum(1, t / 0.01) * np.exp(-t * 2.2)


def pluck(f, d=0.5):
    t = t_arr(d)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 9)


# Am - F - C - G (2 bars each = 4 s)
CH = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
ROOT = [45, 41, 48, 43]
for k in range(11):
    t0 = k * 4.0
    c = CH[k % 4]
    pg = 0.55 if t0 < 38 else 0.75
    add(pad([note(m) for m in c], 4.3), t0, pg, pan=-0.1)
    add(pad([note(m + 12) for m in c[1:]], 4.3), t0, pg * 0.35, pan=0.15)

beats = np.arange(0, DUR, BEAT)
for i, b in enumerate(beats):
    if 37.0 <= b < 38.0:
        continue  # breath before the drop
    bar_pos = i % 4
    if b >= 4.0:
        g = 0.55 if b < 8 else (0.8 if b < 38 else 1.0)
        if b < 8 and bar_pos % 2:
            pass
        else:
            add(kick(g), b)
    if b >= 8.0:
        r = ROOT[int(b // 4) % 4]
        if bar_pos in (0, 2) or b >= 38:
            add(bass(note(r - 12), 0.45), b, 0.32)
    if b >= 15.0:
        add(hat(), b + BEAT / 2, 0.45 if b < 38 else 0.6, pan=0.3)
    if b >= 27.0 and b < 37:
        add(hat(), b + BEAT / 4, 0.18, pan=-0.3)
# arpeggio during data scenes
arp_t = 8.0
while arp_t < 37.0:
    c = CH[int(arp_t // 4) % 4]
    step = int(arp_t / 0.25) % 6
    m = (c + [x + 12 for x in c])[step]
    add(pluck(note(m + 12), 0.4), arp_t, 0.07, pan=0.35 if step % 2 else -0.35)
    arp_t += 0.25

# ---------------- sfx ----------------
def whoosh(d=0.6, up=True):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    lo = lowpass(n, 900); hi = lowpass(n, 3500) - lo
    x = t / d
    env = np.sin(np.pi * x) ** 2
    mix = (x if up else 1 - x)
    return (lo * (1 - mix) + hi * mix * 1.5) * env * 0.9


def tick(f=2400):
    t = t_arr(0.08)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 60)


def pop(f0=500, f1=900):
    t = t_arr(0.14)
    f = f0 + (f1 - f0) * (t / 0.14)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)


def impact():
    t = t_arr(1.6)
    f = 40 + 80 * np.exp(-t * 12)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    n = lowpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 9)
    return body + 0.6 * n


def riser(d):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    hi = n - lowpass(n, 1500)
    return hi * (t / d) ** 2.2 * 0.5


def shimmer():
    t = t_arr(1.4)
    s = sum(np.sin(2 * np.pi * note(m) * t) for m in (81, 84, 88, 93))
    return s * np.exp(-t * 2.5) * np.minimum(1, t / 0.02) / 4


# scene transitions (just before the visual moves, so the peak lands on it)
for tt in (4.05, 14.75, 21.0, 26.95, 31.85):
    add(whoosh(0.5), tt - 0.1, 0.22, pan=0.2)
# counters
for tt in (8.3, 9.15, 10.0, 10.85, 24.4, 25.2):
    add(tick(2600), tt, 0.16)
    add(tick(1800), tt + 0.06, 0.08)
# bars + badge
for i in range(5):
    add(pop(380 + i * 60, 760 + i * 80), 16.0 + i * 0.38, 0.18)
add(pop(600, 1400), 18.4, 0.24); add(tick(3200), 18.42, 0.12)
# map highlights
for i in range(9):
    add(tick(1400 + i * 120), 5.6 + i * 0.12, 0.05)
add(pop(300, 700), 22.4, 0.16)      # MG lights up
add(pop(700, 1200), 24.0, 0.16)     # pin
# dashboard
for i in range(4):
    add(tick(2200 + i * 200), 27.6 + i * 0.18, 0.1)
# delivery cards
for i in range(4):
    add(pop(420 + i * 70, 820 + i * 90), 33.0 + i * 0.7, 0.2)
# drop
add(riser(1.9), 36.1, 0.32)
add(impact(), 38.0, 0.55)
add(whoosh(0.4, up=False), 37.85, 0.25)
add(shimmer(), 38.55, 0.18)
add(pop(500, 1000), 39.6, 0.08)

mix = np.stack([L, R], axis=1)
# fades
fade_in = int(0.03 * SR); mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
fo = int(2.5 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) * 1.12
pcm = (mix * 32767).astype('<i2')
out = sys.argv[1] if len(sys.argv) > 1 else 'mix_raw.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(out)
