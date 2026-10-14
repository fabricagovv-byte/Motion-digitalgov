"""Trilha original, sound design e mixagem final (48 kHz, estéreo).

Gera, de forma determinística e 100% sintetizada (sem samples de terceiros):
  audio/stems/music.wav       trilha completa (sem ducking)
  audio/stems/music_ducked.wav trilha com ducking sob a narração (como está na mixagem)
  audio/stems/sfx.wav          efeitos sonoros sincronizados
  audio/stems/narration.wav    narração posicionada no tempo, tratada (EQ/compressão)
  audio/mix_master.wav         mixagem final (-14 LUFS integrado, true peak <= -1 dBTP)
"""
import json, os
import numpy as np
from scipy.signal import butter, sosfilt, resample_poly
import soundfile as sf
import pyloudnorm as pyln
from pedalboard import Pedalboard, Reverb, Delay, Compressor, HighpassFilter, LowpassFilter, PeakFilter, HighShelfFilter, Limiter, Gain

SR = 48000
TL = json.load(open("src/timeline.json"))
DUR = TL["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(2024)
BPM = 100.0
BEAT = 60.0 / BPM
SCN = {s["id"]: s for s in TL["scenes"]}

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def tt(n): return np.arange(n) / SR
def at(t): return int(round(t * SR))

def env_adsr(n, a, d, s, r, sr=SR):
    e = np.ones(n) * s
    A, D, Rr = int(a * sr), int(d * sr), int(r * sr)
    A = min(A, n); e[:A] = np.linspace(0, 1, A, endpoint=False) if A else e[:A]
    if D: e[A:A + D] = np.linspace(1, s, len(e[A:A + D]))
    if Rr: e[max(0, n - Rr):] *= np.linspace(1, 0, len(e[max(0, n - Rr):]))
    return e

def lp(x, f, order=2): return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)

def add(*sigs):
    """Soma sinais mono de comprimentos diferentes."""
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs: out[:len(x)] += x
    return out

def place(buf, sig, t, pan=0.0, gain=1.0):
    """Soma um sinal mono (ou estéreo) no buffer estéreo a partir de t (s), com pan de potência constante."""
    i = at(t)
    if i >= buf.shape[1]: return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.vstack([sig * l, sig * r])
    j0 = max(0, -i); i = max(0, i)
    n = min(sig.shape[1] - j0, buf.shape[1] - i)
    buf[:, i:i + n] += sig[:, j0:j0 + n] * gain

def fx(x, board):
    y = board(x.astype(np.float32), SR)
    return y.astype(np.float64)

def automation(points, n=N):
    """Curva de automação suave a partir de [(t, valor), ...]."""
    ts, vs = zip(*points)
    x = np.interp(tt(n), ts, vs)
    k = int(0.05 * SR)
    return np.convolve(x, np.ones(k) / k, mode="same")

# ----------------------------------------------------------------------------
# Instrumentos
# ----------------------------------------------------------------------------
def additive(freq, n, harmonics=12, tilt=1.0, detune_cents=(0, -7, 7), bright=1.0):
    t = tt(n); out = np.zeros(n)
    for dc in detune_cents:
        f = freq * 2 ** (dc / 1200)
        ph = rng.uniform(0, 2 * np.pi, harmonics)
        for h in range(1, harmonics + 1):
            if f * h > 12000: break
            out += np.sin(2 * np.pi * f * h * t + ph[h - 1]) * (1.0 / h ** tilt) * (bright ** (h - 1))
    return out / len(detune_cents)

def pad_chord(notes, dur, attack=1.6, release=2.0, bright=0.8):
    n = int((dur + release) * SR)
    s = sum(additive(midi(m), n, harmonics=10, tilt=1.15, bright=bright) for m in notes)
    s *= env_adsr(n, attack, 0.5, 0.85, release + 0.4)
    return lp(s, 2600) / len(notes)

def bell(freq, dur=2.5, bright=1.0):
    n = int(dur * SR); t = tt(n)
    parts = [(1, 1.0, 1.6), (2.0, 0.35 * bright, 2.6), (3.01, 0.18 * bright, 4.0), (4.2, 0.08 * bright, 6.0), (5.43, 0.05 * bright, 8.0)]
    s = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t * d) for r, a, d in parts)
    s *= np.minimum(1, t / 0.004)
    return s

def pluck(freq, dur=0.6, cutoff=3200):
    n = int(dur * SR); t = tt(n)
    s = sum((0.6 ** (h - 1)) * np.sin(2 * np.pi * freq * h * t) for h in range(1, 6)) * np.exp(-t * 7.0)
    s *= np.minimum(1, t / 0.003)
    return lp(s, cutoff)

def sub_bass(freq, dur):
    n = int(dur * SR); t = tt(n)
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    s = np.tanh(1.3 * s) * env_adsr(n, 0.02, 0.3, 0.7, 0.25)
    return lp(s, 400)

def kick(gain=1.0):
    n = int(0.45 * SR); t = tt(n)
    f = 45 + 85 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    click = lp(rng.standard_normal(n) * np.exp(-t * 300), 3000) * 0.15
    return (s + click) * gain

def hat(gain=1.0, dur=0.07):
    n = int(dur * SR); t = tt(n)
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * 60) * gain

def noise_sweep(dur, f0, f1, q=0.25, shape=1.0):
    """Ruído filtrado com banda que varre de f0 a f1 (processado em blocos)."""
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); blk = 1024
    for i in range(0, n, blk):
        p = (i / n) ** shape; f = f0 * (f1 / f0) ** p
        lo, hi = max(30, f * (1 - q)), min(SR / 2 - 100, f * (1 + q))
        out[i:i + blk] = bp(x[max(0, i - 2048):i + blk], lo, hi)[-len(x[i:i + blk]):]
    return out

def whoosh(dur=1.4, f0=300, f1=4000, peak=0.55):
    n = int(dur * SR); t = tt(n) / dur
    s = noise_sweep(dur, f0, f1, 0.6) if f1 > f0 else noise_sweep(dur, f0, f1, 0.6)
    e = np.where(t < peak, (t / peak) ** 2, ((1 - t) / (1 - peak)) ** 1.5)
    return s * e

def impact(gain=1.0, dur=3.5):
    n = int(dur * SR); t = tt(n)
    boom = np.sin(2 * np.pi * (38 + 30 * np.exp(-t * 6)) * t) * np.exp(-t * 1.6)
    body = lp(rng.standard_normal(n), 900) * np.exp(-t * 4.5) * 0.4
    air = hp(rng.standard_normal(n), 3000) * np.exp(-t * 9) * 0.08
    return (np.tanh(1.5 * boom) * 0.9 + body + air) * gain

def riser(dur, gain=1.0):
    n = int(dur * SR); t = tt(n) / dur
    s = noise_sweep(dur, 400, 7000, 0.35, shape=1.6) * t ** 2
    f = 220 * 2 ** (t * 1.5); ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * 0.12 * t ** 2.5
    return (s * 0.8 + tone) * gain

def blip(freq, dur=0.09, gain=1.0):
    n = int(dur * SR); t = tt(n)
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)) * np.exp(-t * 55) * np.minimum(1, t / 0.002) * gain

def tick(gain=1.0):
    n = int(0.03 * SR); t = tt(n)
    return bp(rng.standard_normal(n), 2500, 6000) * np.exp(-t * 220) * gain

def shimmer(dur, density=40, lo=1800, hi=5200, gain=1.0):
    n = int(dur * SR); out = np.zeros(n)
    for _ in range(int(density * dur)):
        f = rng.uniform(lo, hi); d = rng.uniform(0.15, 0.5); s = bell(f, d, 0.3) * rng.uniform(0.2, 1)
        i = rng.integers(0, max(1, n - len(s))); out[i:i + len(s)] += s
    tn = tt(n) / dur
    return out * np.sin(np.pi * tn) * gain

# ----------------------------------------------------------------------------
# Música
# ----------------------------------------------------------------------------
def build_music():
    mus = np.zeros((2, N + SR * 4))
    # Progressão em Ré menor (i–VI–III–VII), 2 compassos por acorde; resolve em Ré maior na assinatura.
    CH = [([50, 57, 60, 64, 65], 38), ([46, 53, 57, 62, 65], 34), ([53, 57, 60, 64, 67], 41), ([48, 55, 62, 64, 67], 36)]
    bar2 = 8 * BEAT
    t = 0.0; k = 0
    s7 = SCN["s7_brand"]["start"]
    sig_t = 62.0                               # assinatura sonora
    while t < sig_t - 0.1:
        notes, root = CH[k % 4]
        d = min(bar2, sig_t - t)
        if t >= s7 - 0.2: notes, root = [46, 53, 57, 62, 69], 34   # Bbmaj9 suspenso antes da resolução
        bright = 0.55 + 0.35 * np.clip((t - 25) / 15, 0, 1) - 0.15 * np.clip((t - 43) / 4, 0, 1) * (t < 50)
        place(mus, pad_chord(notes, d, attack=1.8 if t < 1 else 0.9, release=1.6, bright=bright), t, 0, 0.22)
        # camada aguda (cordas sintéticas) a partir do globo
        if 29 <= t < 56.5:
            place(mus, pad_chord([m + 12 for m in notes[1:4]], d, attack=1.4, release=1.6, bright=0.7), t, 0, 0.09 * (1.4 if t > 33 else 1))
        # baixo
        if t >= SCN["s3_ged"]["start"] - 0.1 and t < 56:
            for b in range(0, 8, 2):
                place(mus, sub_bass(midi(root), 2 * BEAT * 0.95), t + b * BEAT, 0, 0.32)
        t += d; k += 1
    # Drone inicial e textura de ar
    n0 = at(12); dr = additive(midi(38), n0, harmonics=6, tilt=1.6) * env_adsr(n0, 3.0, 1, 1, 4.0)
    place(mus, lp(dr, 500) * 0.35, 0)
    air = hp(lp(rng.standard_normal(N), 6000), 2500) * 0.012 * automation([(0, 0), (2, 1), (9, 1), (11, 0.4), (67, 0.4)])
    place(mus, np.vstack([air, np.roll(air, 977)]), 0)
    # Piano/bell esparso na abertura
    for i, (m, tm) in enumerate([(74, 1.2), (69, 2.6), (72, 4.0), (76, 5.4), (74, 7.0), (81, 8.4)]):
        place(mus, bell(midi(m), 3.0, 0.6), tm, (-0.3 if i % 2 else 0.3), 0.07)
    # Arpejo em semicolcheias (cena 2 em diante), com abertura de filtro
    arp = np.zeros(N + SR * 2)
    a0, a1 = SCN["s2_scan"]["start"] + 0.3, 56.0
    step = BEAT / 4; i = 0; tt0 = a0
    pattern = [0, 2, 3, 4, 3, 2, 1, 2]
    while tt0 < a1:
        chord_idx = int(tt0 // bar2) % 4; notes = CH[chord_idx][0]
        if tt0 >= s7 - 0.2: break
        m = notes[pattern[i % 8] % len(notes)] + 12
        vel = 0.75 + 0.25 * (i % 4 == 0)
        cut = 1200 + 3800 * float(np.clip((tt0 - 26) / 14, 0, 1))
        s = pluck(midi(m), 0.5, cutoff=cut) * vel
        j = at(tt0); arp[j:j + len(s)] += s[: len(arp) - j]
        tt0 += step; i += 1
    arp_lvl = automation([(0, 0), (a0, 0), (a0 + 1.5, 0.10), (18.6, 0.11), (29.2, 0.12), (38.6, 0.16), (43.2, 0.08), (50.2, 0.11), (55.6, 0.15), (56.4, 0)], len(arp))
    arp *= arp_lvl
    arp_st = fx(np.vstack([arp, arp]), Pedalboard([Delay(delay_seconds=BEAT * 0.75, feedback=0.32, mix=0.28), Reverb(room_size=0.55, wet_level=0.25, dry_level=0.8, width=1.0)]))
    place(mus, arp_st, 0)
    # Percussão suave (cena 3 em diante), "four on the floor" no globo
    for b in np.arange(SCN["s3_ged"]["start"], 56.0, BEAT):
        bi = int(round((b - SCN["s3_ged"]["start"]) / BEAT))
        globe = SCN["s4_globe"]["start"] <= b < SCN["s5_security"]["start"]
        if globe or bi % 2 == 0: place(mus, kick(0.5 if globe else 0.38), b)
        place(mus, hat(0.05 if globe else 0.035), b + BEAT / 2, 0.2)
        if globe: place(mus, hat(0.025), b + BEAT / 4, -0.25); place(mus, hat(0.025), b + 3 * BEAT / 4, -0.25)
    # Riser + impacto na revelação do globo (herói) e crescendo final
    hero = 38.55
    place(mus, riser(3.2, 0.10), hero - 3.2, 0)
    place(mus, impact(0.45), hero, 0)
    place(mus, riser(5.6, 0.14), SCN["s7_brand"]["start"] - 5.4, 0)
    place(mus, impact(0.5, 4.5), SCN["s7_brand"]["start"] + 2.1, 0)
    # Resolução em Ré maior + assinatura sonora (A5–D6–F#6 / A6)
    place(mus, pad_chord([50, 57, 64, 66, 69], 4.6, attack=0.35, release=2.4, bright=0.75), sig_t, 0, 0.25)
    place(mus, sub_bass(midi(38), 3.5) * 0.9, sig_t, 0, 0.3)
    for j, (m, dt, pan) in enumerate([(81, 0.0, -0.2), (86, 0.16, 0.0), (90, 0.32, 0.2), (93, 0.52, 0.0)]):
        place(mus, bell(midi(m), 3.6, 0.8), sig_t + dt, pan, 0.11 if j < 3 else 0.07)
    place(mus, shimmer(2.6, 22, 2500, 6000, 0.05), sig_t + 0.3, 0)
    # Cadeia da música
    mus = mus[:, :N + SR * 2]
    mus = fx(mus, Pedalboard([HighpassFilter(30), Reverb(room_size=0.82, damping=0.5, wet_level=0.22, dry_level=0.85, width=1.0),
                              Compressor(threshold_db=-18, ratio=2.0, attack_ms=30, release_ms=250), PeakFilter(250, -2.0, 1.0), HighShelfFilter(9000, 1.5)]))
    # Arco dramático por seção (dB): abertura contida, crescimento no globo, respiro na segurança, clímax antes da marca
    shape = automation([(0, -3), (9.6, -3), (12, -1.5), (18.6, -1), (29.2, 0), (36, 1.5), (38.6, 3.5), (41.5, 2), (43.2, -1), (47, -2),
                        (50.2, -1), (55.6, 3.5), (56.6, 2), (60, 0), (67, 0)])
    return mus[:, :N] * 10 ** (shape / 20)

# ----------------------------------------------------------------------------
# Efeitos sonoros sincronizados com a imagem
# ----------------------------------------------------------------------------
def build_sfx():
    sfx = np.zeros((2, N + SR * 4))
    S = lambda sid: SCN[sid]["start"]
    # Transições entre cenas: whoosh suave centrado no corte
    for sc in TL["scenes"][1:]:
        b = sc["start"]
        place(sfx, whoosh(1.5, 250, 3500, 0.6), b - 0.95, 0, 0.10)
    # Cena 1: papéis flutuando (sopros) + partículas
    for i in range(16):
        r = np.random.default_rng(500 + i)
        t0 = 1.0 + i * 0.22 + r.random() * 0.3
        if i % 3 == 0: place(sfx, whoosh(1.2, 600, 2200, 0.4), t0, (-0.5 if i % 2 == 0 else 0.5), 0.045)
    place(sfx, shimmer(4.5, 30, 2000, 6500, 0.07), 4.3, 0)
    # Cena 2: pouso do papel, varredura do scanner, OCR e metadados
    s2 = S("s2_scan")
    place(sfx, lp(rng.standard_normal(int(0.25 * SR)), 1200) * np.exp(-tt(int(0.25 * SR)) * 25) * 0.25, s2 + 1.85, 0)
    scan = noise_sweep(2.6, 900, 3400, 0.2, 1.0) * np.sin(np.pi * np.linspace(0, 1, int(2.6 * SR))) ** 0.6
    hum = np.sin(2 * np.pi * 110 * tt(len(scan))) * 0.25 * np.sin(np.pi * np.linspace(0, 1, len(scan)))
    place(sfx, add(scan * 0.6, hum) * 0.22, s2 + 1.9, 0)
    for i in range(6): place(sfx, blip(1400 + i * 180, 0.08, 0.10), s2 + 5.3 + i * 0.26, -0.2 + 0.08 * i)
    for i in range(5): place(sfx, add(blip(2200, 0.06, 0.07), blip(3300, 0.06, 0.04)), s2 + 5.75 + i * 0.22, 0.4)
    for i in range(10): place(sfx, whoosh(0.5, 1500, 5000, 0.4), s2 + 6.9 + i * 0.12, (i % 4 - 1.5) * 0.3, 0.025)
    # Cena 3: digitação, resultados, seleção, etapas do fluxo
    s3 = S("s3_ged")
    q = "contrato prestação 2024"
    for i in range(len(q)):
        tc = s3 + 0.5 + 2.0 * (i + 0.5) / len(q)
        if q[i] != " ": place(sfx, tick(0.16), tc, 0.1)
    for i in range(5): place(sfx, blip(1700 + 120 * i, 0.07, 0.08), s3 + 2.65 + i * 0.17, 0.0)
    place(sfx, add(blip(2600, 0.1, 0.12), blip(3900, 0.08, 0.05)), s3 + 3.95, 0.15)
    for i in range(5): place(sfx, bell(midi(81 + [0, 2, 4, 7, 9][i]), 0.9, 0.4), s3 + 5.4 + i * 0.55, -0.3 + 0.15 * i, 0.06)
    for i in range(2): place(sfx, whoosh(0.8, 900, 3000, 0.4), s3 + 6.75 + i * 0.35, 0.6, 0.05)
    # Cena 4: conexões do globo e ambientes
    s4 = S("s4_globe")
    for i in range(18): place(sfx, blip(2000 + (i * 137) % 1600, 0.12, 0.05), s4 + 0.4 + i * 0.22 + 1.2, ((i * 37) % 9 - 4) / 5)
    for k, tv in enumerate([4.0, 5.6, 7.2, 8.8]): place(sfx, whoosh(1.6, 300, 2500, 0.55), s4 + tv - 1.1, [-0.5, 0.5, -0.4, 0.4][k], 0.07)
    # Cena 5: camadas de proteção e cartões
    s5 = S("s5_security")
    for i in range(3): place(sfx, add(bell(midi(69 + [0, 5, 7][i]), 2.0, 0.25) * 0.8, whoosh(0.7, 2000, 600, 0.3) * 0.3), s5 + 0.6 + i * 0.45, 0, 0.07)
    for i in range(2): place(sfx, blip(1900, 0.09, 0.08), s5 + 2.0 + i * 0.4, [-0.5, 0.5][i])
    # Cena 6: arquitetura de luz acendendo
    s6 = S("s6_future")
    place(sfx, shimmer(4.5, 35, 1500, 5500, 0.05), s6 + 0.4, 0)
    # Cena 7: partículas convergindo
    s7 = S("s7_brand")
    place(sfx, whoosh(2.4, 4000, 500, 0.75), s7 + 0.1, 0, 0.08)
    place(sfx, shimmer(2.0, 40, 3000, 7000, 0.05), s7 + 0.4, 0)
    sfx = sfx[:, :N + SR * 2]
    sfx = fx(sfx, Pedalboard([HighpassFilter(80), Reverb(room_size=0.6, wet_level=0.25, dry_level=0.85, width=1.0), Compressor(threshold_db=-20, ratio=2.5, attack_ms=5, release_ms=120)]))
    return sfx[:, :N]

# ----------------------------------------------------------------------------
# Narração
# ----------------------------------------------------------------------------
def build_voice():
    durs = json.load(open("audio/narration/durations.json"))
    vox = np.zeros(N + SR * 2); spans = []
    chain = Pedalboard([HighpassFilter(75), PeakFilter(220, -1.5, 1.0), PeakFilter(3200, 2.0, 0.9), HighShelfFilter(10000, 1.5),
                        Compressor(threshold_db=-20, ratio=3.0, attack_ms=8, release_ms=120), Gain(2.0)])
    for item in TL["narration"]:
        x, sr = sf.read(f"audio/narration/{item['id']}.wav")
        if x.ndim > 1: x = x.mean(1)
        x = resample_poly(x, 320, 147) if sr == 22050 else x
        # micro-fades para evitar estalos
        f = int(0.008 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        x = fx(x[None, :], chain)[0]
        i = at(item["at"]); vox[i:i + len(x)] += x
        spans.append((item["at"], item["at"] + len(x) / SR))
    vox = vox[:N]
    # Ambiência mínima (sala curta) para naturalidade
    st = fx(np.vstack([vox, vox]), Pedalboard([Reverb(room_size=0.12, damping=0.7, wet_level=0.06, dry_level=1.0, width=0.3)]))
    return st[:, :N], spans

def duck_curve(spans, depth_db=-13.0, attack=0.12, release=0.5):
    g = np.zeros(N)
    for a, b in spans: g[at(a - attack):at(b + 0.15)] = 1.0
    # suavização assimétrica (ataque/relaxamento)
    out = np.zeros(N); y = 0.0
    ca, cr = 1 - np.exp(-1 / (attack * SR)), 1 - np.exp(-1 / (release * SR))
    for i in range(0, N, 64):
        tgt = g[i]; c = ca if tgt > y else cr
        y += (tgt - y) * (1 - (1 - c) ** 64); out[i:i + 64] = y
    return 10 ** (depth_db * out / 20)

def lufs(x):
    m = pyln.Meter(SR); return m.integrated_loudness(x.T)

def main():
    os.makedirs("audio/stems", exist_ok=True)
    print("narração..."); vox, spans = build_voice()
    print("música...");   mus = build_music()
    print("efeitos...");  sfx = build_sfx()
    duck = duck_curve(spans)
    mus_d = mus * duck; sfx_d = sfx * (0.6 + 0.4 * duck)
    # níveis relativos (fala > música > efeitos)
    vox *= 10 ** ((-15.5 - lufs(vox)) / 20)
    mus_d *= 10 ** ((-25.5 - lufs(mus)) / 20); mus_clean = mus * 10 ** ((-25.5 - lufs(mus)) / 20)
    sfx_d *= 10 ** ((-29.0 - lufs(sfx)) / 20); sfx_clean = sfx * 10 ** ((-29.0 - lufs(sfx)) / 20)
    mix = vox + mus_d + sfx_d
    # fade-out limpo
    fo = automation([(0, 1), (DUR - 2.6, 1), (DUR - 0.15, 0), (DUR, 0)])
    fi = np.clip(tt(N) / 0.02, 0, 1)
    mix *= fo * fi
    mix = fx(mix, Pedalboard([Compressor(threshold_db=-14, ratio=1.8, attack_ms=20, release_ms=200)]))
    # normalização para -14 LUFS com limitador (o Limiter do JUCE aplica ganho de compensação; desfazemos)
    g = 10 ** ((-14.0 - lufs(mix)) / 20)
    lim = lambda x: fx(x, Pedalboard([Limiter(threshold_db=-1.5, release_ms=80)])) * 10 ** (-1.5 / 20)
    for _ in range(4):
        out = lim(mix * g); g *= 10 ** ((-14.0 - lufs(out)) / 20)
    mix = lim(mix * g)
    tp = np.max(np.abs(resample_poly(mix, 4, 1, axis=1)))
    if tp > 10 ** (-1.0 / 20): mix *= 10 ** (-1.0 / 20) / tp
    for name, x in [("narration", vox), ("music", mus_clean * fo), ("music_ducked", mus_d * fo), ("sfx", sfx_clean * fo)]:
        sf.write(f"audio/stems/{name}.wav", (x.T).astype(np.float32), SR, subtype="PCM_24")
    sf.write("audio/mix_master.wav", mix.T.astype(np.float32), SR, subtype="PCM_24")
    tp = np.max(np.abs(resample_poly(mix, 4, 1, axis=1)))
    print(f"mix: {lufs(mix):.1f} LUFS, true peak {20*np.log10(tp):.2f} dBTP, pico amostra {20*np.log10(np.max(np.abs(mix))):.2f} dBFS")
    json.dump({"spans": spans}, open("audio/stems/narration_spans.json", "w"), indent=1)

if __name__ == "__main__":
    main()
