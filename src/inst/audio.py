"""Trilha corporativa, efeitos sincronizados e mixagem do vídeo institucional (60 s, 48 kHz estéreo).

Reaproveita os instrumentos sintetizados de src/audio.py (100% originais, sem samples de terceiros).
Saídas: audio/inst/stems/{narration,music,music_ducked,sfx}.wav e audio/inst/mix_master.wav
"""
import json, os, sys
import numpy as np
from scipy.signal import resample_poly
import soundfile as sf
sys.path.insert(0, "src")
import audio as A
from audio import (SR, midi, tt, at, env_adsr, lp, hp, bp, place, fx, additive, pad_chord, bell, pluck, sub_bass, kick, hat,
                   noise_sweep, whoosh, impact, riser, blip, tick, shimmer, lufs)
from pedalboard import Pedalboard, Reverb, Delay, Compressor, HighpassFilter, PeakFilter, HighShelfFilter, Limiter, Gain

TL = json.load(open("src/inst/timeline.json"))
DUR = TL["duration"]; N = int(DUR * SR)
OUT = "audio/inst"
rng = np.random.default_rng(7)
BPM = 96.0; BEAT = 60.0 / BPM; BAR = 4 * BEAT

def auto(points, n=N):
    ts, vs = zip(*points); x = np.interp(tt(n), ts, vs); k = int(0.05 * SR)
    return np.convolve(x, np.ones(k) / k, mode="same")

def piano(freq, dur=2.2, vel=1.0):
    """Piano elétrico suave (FM simples + decaimento)."""
    n = int(dur * SR); t = tt(n)
    mod = np.sin(2 * np.pi * freq * 2 * t) * 1.2 * np.exp(-t * 3.0)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 1.6) + 0.25 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t * 4)
    return lp(s * np.minimum(1, t / 0.004), 4200) * vel

# ---------------------------------------------------------------- Música: Ré maior, I–V–vi–IV, 96 BPM
def build_music():
    mus = np.zeros((2, N + SR * 4))
    CH = [([50, 57, 62, 66, 69], 38), ([45, 57, 61, 64, 69], 33), ([47, 54, 59, 62, 66], 35), ([43, 55, 59, 62, 67], 31)]
    end = TL["endcard"]["in"]
    t = 0.6; k = 0
    while t < end - 0.05:
        notes, root = CH[k % 4]; d = min(BAR, end - t)
        bright = 0.5 + 0.3 * np.clip((t - 8) / 30, 0, 1)
        place(mus, pad_chord(notes, d, attack=1.2 if t < 1 else 0.7, release=1.4, bright=bright), t, 0, 0.16)
        if t >= 8 - 0.1: place(mus, sub_bass(midi(root), d * 0.96) * 0.8, t, 0, 0.26)
        if t >= 20 and t < end - 0.5:   # cordas suaves (camada superior)
            place(mus, pad_chord([m + 12 for m in notes[2:5]], d, attack=0.9, release=1.2, bright=0.6), t, 0, 0.06)
        t += d; k += 1
    # piano: motivo de colcheias pontuadas (8 s em diante), arpejo discreto na abertura
    for i, (m, tm) in enumerate([(74, 0.25), (78, 1.0), (81, 1.75), (86, 3.0), (85, 4.6), (81, 5.8)]):
        place(mus, piano(midi(m), 3.0, 0.5), tm, (-0.25 if i % 2 else 0.25), 0.12)
    pat = [0, 2, 4, 3, 2, 4, 3, 1]
    tp = 8.0; i = 0
    while tp < end - 0.3:
        ci = int((tp - 0.6) // BAR) % 4; notes = CH[ci][0]
        m = notes[1 + pat[i % 8] % 4] + 12
        vel = 0.55 + 0.25 * (i % 4 == 0)
        place(mus, pluck(midi(m), 0.45, cutoff=1800 + 2400 * float(np.clip((tp - 20) / 25, 0, 1))) * vel, tp, (-0.3 if i % 2 else 0.3), 0.07)
        tp += BEAT / 2; i += 1
    # percussão leve a partir da cena 2; batida completa nas cenas 4–5
    for b in np.arange(8.0, end - 0.5, BEAT):
        bi = int(round((b - 8.0) / BEAT)); full = b >= 32
        if full or bi % 2 == 0: place(mus, kick(0.32 if full else 0.24), b)
        place(mus, hat(0.03 if full else 0.02), b + BEAT / 2, 0.2)
    # transições e chegada à marca
    place(mus, riser(2.4, 0.06), 32 - 2.3, 0)
    place(mus, riser(3.2, 0.08), end - 3.1, 0)
    place(mus, impact(0.22, 3.0), end + 0.05, 0)
    # resolução + assinatura sonora (Lá–Ré–Fá#–Lá)
    place(mus, pad_chord([50, 57, 62, 66, 69, 74], DUR - end, attack=0.25, release=2.0, bright=0.75), end, 0, 0.2)
    place(mus, sub_bass(midi(38), 3.2) * 0.8, end, 0, 0.26)
    for j, (m, dt, pan) in enumerate([(81, 0.6, -0.2), (86, 0.76, 0.0), (90, 0.92, 0.2), (93, 1.12, 0.0)]):
        place(mus, bell(midi(m), 3.6, 0.7), end + dt, pan, 0.08 if j < 3 else 0.05)
    mus = mus[:, :N + SR * 2]
    mus = fx(mus, Pedalboard([HighpassFilter(32), Reverb(room_size=0.75, damping=0.55, wet_level=0.2, dry_level=0.85, width=1.0),
                              Compressor(threshold_db=-18, ratio=2.0, attack_ms=30, release_ms=250), PeakFilter(300, -2.0, 1.0), HighShelfFilter(9000, 1.0)]))
    shape = auto([(0, -2), (8, -1.5), (20, -1), (32, 0), (46, 0.5), (end - 0.5, 2.0), (end + 0.5, 1.5), (60, 1.0)])
    return mus[:, :N] * 10 ** (shape / 20)

# ---------------------------------------------------------------- Efeitos realistas (discretos)
def paper(dur=0.35, g=1.0):
    n = int(dur * SR); t = tt(n) / dur; x = rng.standard_normal(n)
    crack = (rng.random(n) < 0.004) * rng.standard_normal(n) * 6
    s = bp(x + crack, 1500, 7000) * np.sin(np.pi * t) ** 0.7 * (0.6 + 0.4 * np.abs(np.sin(t * 23)))
    return s * g
def click(g=1.0):
    n = int(0.025 * SR); t = tt(n)
    return (bp(rng.standard_normal(n), 2000, 7000) * np.exp(-t * 400) + np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 300) * 0.3) * g
def key(g=1.0):
    n = int(0.05 * SR); t = tt(n)
    return (bp(rng.standard_normal(n), 900, 5000) * np.exp(-t * 160) + lp(rng.standard_normal(n), 400) * np.exp(-t * 90) * 0.4) * g * rng.uniform(0.7, 1.1)
def rolling(dur, g=1.0):
    n = int(dur * SR); x = lp(rng.standard_normal(n), 260) * 2.2 + bp(rng.standard_normal(n), 800, 1600) * 0.15
    rumble = 1 + 0.3 * np.sin(2 * np.pi * 7.3 * tt(n)); e = np.minimum(1, tt(n) / 0.6) * np.minimum(1, (dur - tt(n)) / 0.5)
    return x * rumble * e * g
def scanner_run(dur, pps=1.6, g=1.0):
    n = int(dur * SR); t = tt(n)
    motor = (np.sin(2 * np.pi * 118 * t) * 0.5 + np.sin(2 * np.pi * 236 * t) * 0.25) * 0.25 + bp(rng.standard_normal(n), 300, 900) * 0.25
    out = motor * np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.3)
    for tp in np.arange(0.15, dur - 0.3, 1 / pps):
        s = noise_sweep(0.32, 1800, 4200, 0.3) * np.sin(np.pi * np.linspace(0, 1, int(0.32 * SR))) * 0.9
        i = at(tp); out[i:i + len(s)] += s[: len(out) - i]
        c = click(0.4); j = at(tp + 0.05); out[j:j + len(c)] += c[: len(out) - j]
    return out * g
def chime(g=1.0):
    return (bell(midi(84), 1.2, 0.4) + bell(midi(91), 1.2, 0.4) * 0.6) * g

def build_sfx():
    sfx = np.zeros((2, N + SR * 4))
    # abertura: brilho suave na logo
    place(sfx, shimmer(1.8, 20, 2500, 6500, 0.04), 0.1, 0); place(sfx, whoosh(1.2, 300, 2000, 0.7), 2.4, 0, 0.05)
    # ambiente da sala (ar-condicionado / respiração do espaço)
    room = lp(hp(rng.standard_normal(N), 120), 900) * 0.006 * auto([(0, 0), (2.8, 0), (3.6, 1), (54, 1), (55, 0), (60, 0)])
    place(sfx, np.vstack([room, np.roll(room, 2111)]), 0)
    # cena 2: carrinho, papéis, scanner
    place(sfx, rolling(3.8, 0.10), 7.7, 0.4)
    for c in np.arange(11.6, 14.7, 1 / 0.62):
        place(sfx, paper(0.4, 0.10), c + 0.12, -0.2); place(sfx, paper(0.3, 0.07), c + 0.82, 0.15)
    place(sfx, scanner_run(6.0, 1.6, 0.12), 14.5, 0.1)
    place(sfx, scanner_run(2.8, 1.6, 0.05), 20.4 - 0.3 - 2.5, 0.1)
    # cena 3: digitação dos campos, salvar, pesquisa
    vals = ["2023/004518", "14/03/2023", "Contrato", "Secretaria Municipal de Administração", "contrato prestação de serviços limpeza"]
    for i, v in enumerate(vals):
        t0 = 24.4 + i * (4.0 / 5.2); n = len(v)
        for j in range(n):
            if v[j] != " " and j % (1 if n < 15 else 2) == 0: place(sfx, key(0.12), t0 + (4.0 / 5.2) * j / n, 0.05)
    place(sfx, click(0.25), 28.72, 0); place(sfx, chime(0.03), 28.8, 0)
    for j in range(18): place(sfx, key(0.12), 28.7 + 1.2 * j / 18, 0.05)
    place(sfx, click(0.22), 29.95, 0)
    place(sfx, click(0.22), 30.85, 0)
    # cena 4: GED — histórico, encaminhar, confirmação
    for tc in [35.0, 37.3, 38.3, 39.6]: place(sfx, click(0.25), tc, 0)
    for j in range(14): place(sfx, key(0.1), 38.7 + 0.7 * j / 14, 0.05)
    place(sfx, chime(0.06), 39.75, 0.1)
    place(sfx, click(0.16), 43.6, -0.2)
    # cena 5
    place(sfx, scanner_run(2.6, 1.6, 0.08), 48.65, 0.1)
    for j in range(20): place(sfx, key(0.1), 51.4 + 0.9 * j / 20, 0.05)
    place(sfx, click(0.22), 52.4, 0); place(sfx, click(0.2), 52.95, 0)
    place(sfx, whoosh(1.4, 400, 2600, 0.6), TL["endcard"]["in"] - 0.5, 0, 0.05)
    for s in TL["scenes"][1:]: place(sfx, whoosh(0.9, 500, 2200, 0.5), s["start"] - 0.45, 0, 0.02)
    sfx = sfx[:, :N + SR * 2]
    sfx = fx(sfx, Pedalboard([HighpassFilter(60), Reverb(room_size=0.3, damping=0.6, wet_level=0.12, dry_level=0.95, width=0.8), Compressor(threshold_db=-22, ratio=2.5, attack_ms=5, release_ms=120)]))
    return sfx[:, :N]

def build_voice():
    vox = np.zeros(N + SR * 3); spans = []
    chain = Pedalboard([HighpassFilter(75), PeakFilter(200, -1.5, 1.0), PeakFilter(3000, 2.5, 0.9), HighShelfFilter(10000, 1.5),
                        Compressor(threshold_db=-20, ratio=3.0, attack_ms=8, release_ms=120), Gain(2.0)])
    for item in TL["narration"]:
        x, sr = sf.read(f"{OUT}/narration/{item['id']}.wav")
        if x.ndim > 1: x = x.mean(1)
        if sr == 22050: x = resample_poly(x, 320, 147)
        f = int(0.008 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        x = fx(x[None, :], chain)[0]; i = at(item["at"]); vox[i:i + len(x)] += x
        spans.append((item["at"], item["at"] + len(x) / SR))
    vox = vox[:N]
    st = fx(np.vstack([vox, vox]), Pedalboard([Reverb(room_size=0.1, damping=0.7, wet_level=0.05, dry_level=1.0, width=0.3)]))
    return st[:, :N], spans

def duck_curve(spans, depth_db=-10.0, attack=0.12, release=0.6):
    g = np.zeros(N)
    for a, b in spans: g[max(0, at(a - attack)):at(b + 0.15)] = 1.0
    out = np.zeros(N); y = 0.0; ca, cr = 1 - np.exp(-1 / (attack * SR)), 1 - np.exp(-1 / (release * SR))
    for i in range(0, N, 64):
        tgt = g[i]; c = ca if tgt > y else cr; y += (tgt - y) * (1 - (1 - c) ** 64); out[i:i + 64] = y
    return 10 ** (depth_db * out / 20)

def main():
    os.makedirs(f"{OUT}/stems", exist_ok=True)
    vox, spans = build_voice(); mus = build_music(); sfx = build_sfx()
    duck = duck_curve(spans)
    vox *= 10 ** ((-16.5 - lufs(vox)) / 20)
    gm = 10 ** ((-24.0 - lufs(mus)) / 20); gs = 10 ** ((-28.0 - lufs(sfx)) / 20)
    mus_d, mus_c = mus * duck * gm, mus * gm; sfx_c = sfx * gs; sfx_d = sfx_c * (0.75 + 0.25 * duck)
    mix = vox + mus_d + sfx_d
    fo = auto([(0, 1), (DUR - 1.4, 1), (DUR - 0.05, 0), (DUR, 0)]); mix *= fo * np.clip(tt(N) / 0.02, 0, 1)
    mix = fx(mix, Pedalboard([Compressor(threshold_db=-14, ratio=1.8, attack_ms=20, release_ms=200)]))
    g = 10 ** ((-14.0 - lufs(mix)) / 20)
    lim = lambda x: fx(x, Pedalboard([Limiter(threshold_db=-1.5, release_ms=80)])) * 10 ** (-1.5 / 20)
    for _ in range(4):
        out = lim(mix * g); g *= 10 ** ((-14.0 - lufs(out)) / 20)
    mix = lim(mix * g)
    tp = np.max(np.abs(resample_poly(mix, 4, 1, axis=1)))
    if tp > 10 ** (-1.0 / 20): mix *= 10 ** (-1.0 / 20) / tp
    for name, x in [("narration", vox), ("music", mus_c * fo), ("music_ducked", mus_d * fo), ("sfx", sfx_d * fo)]:
        sf.write(f"{OUT}/stems/{name}.wav", x.T.astype(np.float32), SR, subtype="PCM_24")
    sf.write(f"{OUT}/mix_master.wav", mix.T.astype(np.float32), SR, subtype="PCM_24")
    tp = np.max(np.abs(resample_poly(mix, 4, 1, axis=1)))
    print(f"mix: {lufs(mix):.1f} LUFS, true peak {20*np.log10(tp):.2f} dBTP"); print("falas:", [(round(a, 2), round(b, 2)) for a, b in spans])

if __name__ == "__main__":
    main()
