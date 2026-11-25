"""Trilha, efeitos sincronizados e mixagem do filme "30 dias" (60 s, 48 kHz estéreo).

Reaproveita os instrumentos sintetizados de src/audio.py (100% originais, sem samples de terceiros).
Saídas: audio/cidade/stems/{narration,music,music_ducked,sfx}.wav e audio/cidade/mix_master.wav
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

TL = json.load(open("src/cidade/timeline.json"))
DUR = TL["duration"]; N = int(DUR * SR)
OUT = "audio/cidade"
rng = np.random.default_rng(30)
BPM = 100.0; BEAT = 60.0 / BPM; BAR = 4 * BEAT

def auto(points, n=N):
    ts, vs = zip(*points); x = np.interp(tt(n), ts, vs); k = int(0.05 * SR)
    return np.convolve(x, np.ones(k) / k, mode="same")

def piano(freq, dur=2.2, vel=1.0):
    """Piano elétrico suave (FM simples + decaimento)."""
    n = int(dur * SR); t = tt(n)
    mod = np.sin(2 * np.pi * freq * 2 * t) * 1.2 * np.exp(-t * 3.0)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 1.6) + 0.25 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t * 4)
    return lp(s * np.minimum(1, t / 0.004), 4200) * vel

Q2, Q3, Q4, Q5 = (TL["cues"][k] for k in ("c2", "c3", "c4", "c5"))
END = TL["endcard"]["in"]
DRY_END, WET = 14.6, Q2["brota"]

def piano(freq, dur=2.2, vel=1.0):
    n = int(dur * SR); t = tt(n)
    mod = np.sin(2 * np.pi * freq * 2 * t) * 1.2 * np.exp(-t * 3.0)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 1.6) + 0.25 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t * 4)
    return lp(s * np.minimum(1, t / 0.004), 4200) * vel

def drone(dur, f, g=1.0):
    n = int(dur * SR); t = tt(n)
    s = sum(np.sin(2 * np.pi * f * h * t + h) / h for h in (1, 2, 3, 5)) + 0.4 * np.sin(2 * np.pi * f * 1.004 * t)
    e = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.8)
    return lp(s, 700) * e * g

# ---------------------------------------------------------------- Música
# Gancho e terra seca: Ré menor, tensa (pulso de relógio). Terra molhada: abre em Ré maior. Caixa/lista: groove positivo.
def build_music():
    mus = np.zeros((2, N + SR * 4))
    # --- 0–6,6: gancho
    place(mus, drone(7.0, midi(38), 1.0), 0.0, 0, 0.2)
    place(mus, pad_chord([50, 53, 57, 62], 6.8, attack=0.05, release=1.0, bright=0.5), 0.0, 0, 0.12)
    for b in np.arange(0.0, 6.4, BEAT):
        place(mus, kick(0.30 if int(round(b / BEAT)) % 2 == 0 else 0.16), b)
    place(mus, riser(2.0, 0.07), 6.6 - 1.9, 0)
    # --- 6,6–14,6: terra seca (Dm – Bb – Gm – A)
    DRY = [([50, 53, 57, 62], 38), ([46, 53, 58, 62], 34), ([43, 50, 55, 58], 31), ([45, 52, 57, 61], 33)]
    t = 6.6; k = 0
    while t < DRY_END - 0.05:
        notes, root = DRY[k % 4]; d = min(BAR, DRY_END - t)
        place(mus, pad_chord(notes, d, attack=0.5, release=1.0, bright=0.45), t, 0, 0.14)
        place(mus, sub_bass(midi(root), d * 0.95) * 0.7, t, 0, 0.22)
        for j, m in enumerate([notes[1] + 12, notes[2] + 12, notes[3] + 12]):
            place(mus, pluck(midi(m), 0.7, 1400) * 0.6, t + j * BEAT * 1.5, (-0.3, 0, 0.3)[j], 0.07)
        t += d; k += 1
    for b in np.arange(6.6, DRY_END - 0.2, BEAT): place(mus, kick(0.2), b) if int(round((b - 6.6) / BEAT)) % 2 == 0 else None
    # --- 14,6–21: terra molhada; chuva e, em "tudo brota", abre para Ré maior
    place(mus, pad_chord([45, 52, 57, 60, 64], WET - DRY_END + 0.3, attack=1.0, release=0.8, bright=0.55), DRY_END, 0, 0.14)
    place(mus, riser(1.6, 0.05), WET - 1.5, 0)
    MAJ = [([50, 57, 62, 66, 69], 38), ([45, 57, 61, 64, 69], 33), ([47, 54, 59, 62, 66], 35), ([43, 55, 59, 62, 67], 31)]
    t = WET; k = 0
    while t < END - 0.05:
        notes, root = MAJ[k % 4]; d = min(BAR, END - t)
        place(mus, pad_chord(notes, d, attack=0.6 if k == 0 else 0.5, release=1.2, bright=0.65), t, 0, 0.15)
        place(mus, sub_bass(midi(root), d * 0.96) * 0.8, t, 0, 0.26)
        if t >= 32: place(mus, pad_chord([m + 12 for m in notes[2:5]], d, attack=0.7, release=1.0, bright=0.6), t, 0, 0.05)
        t += d; k += 1
    for i, (m, dt) in enumerate([(74, 0), (78, 0.15), (81, 0.3), (86, 0.45)]): place(mus, bell(midi(m), 2.5, 0.6), WET + dt, (-0.3 + 0.2 * i), 0.06)
    pat = [0, 2, 4, 3, 2, 4, 3, 1]; tp = WET + BAR; i = 0
    while tp < END - 0.3:
        ci = int((tp - WET) // BAR) % 4; notes = MAJ[ci][0]; m = notes[1 + pat[i % 8] % 4] + 12
        place(mus, pluck(midi(m), 0.45, cutoff=1800 + 2400 * float(np.clip((tp - 21) / 20, 0, 1))) * (0.55 + 0.25 * (i % 4 == 0)), tp, (-0.3 if i % 2 else 0.3), 0.07)
        tp += BEAT / 2; i += 1
    for b in np.arange(WET + BAR, END - 0.5, BEAT):
        full = b >= 32; bi = int(round((b - WET) / BEAT))
        if full or bi % 2 == 0: place(mus, kick(0.32 if full else 0.24), b)
        place(mus, hat(0.03 if full else 0.02), b + BEAT / 2, 0.2)
    for tm, m in [(45.2, 78), (46.0, 81), (46.8, 86), (48.0, 85), (49.4, 81)]: place(mus, piano(midi(m), 3.0, 0.5), tm, 0.2, 0.1)
    place(mus, riser(2.4, 0.06), 32 - 2.3, 0)
    place(mus, riser(3.0, 0.08), END - 2.9, 0)
    place(mus, impact(0.22, 3.0), END + 0.05, 0)
    place(mus, pad_chord([50, 57, 62, 66, 69, 74], DUR - END, attack=0.25, release=2.0, bright=0.75), END, 0, 0.2)
    place(mus, sub_bass(midi(38), 3.2) * 0.8, END, 0, 0.26)
    for j, (m, dt, pan) in enumerate([(81, 0.6, -0.2), (86, 0.76, 0.0), (90, 0.92, 0.2), (93, 1.12, 0.0)]):
        place(mus, bell(midi(m), 3.6, 0.7), END + dt, pan, 0.08 if j < 3 else 0.05)
    mus = mus[:, :N + SR * 2]
    mus = fx(mus, Pedalboard([HighpassFilter(32), Reverb(room_size=0.75, damping=0.55, wet_level=0.2, dry_level=0.85, width=1.0),
                              Compressor(threshold_db=-18, ratio=2.0, attack_ms=30, release_ms=250), PeakFilter(300, -2.0, 1.0), HighShelfFilter(9000, 1.0)]))
    shape = auto([(0, 0.5), (6.6, 0.5), (8, -1.5), (14, -1.5), (WET, 0), (32, 0.5), (END - 0.5, 2.0), (END + 0.5, 1.5), (60, 1.0)])
    return mus[:, :N] * 10 ** (shape / 20)

# ---------------------------------------------------------------- Efeitos
def wind(dur, g=1.0):
    n = int(dur * SR); x = bp(rng.standard_normal(n), 250, 1400)
    m = 0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt(n)) * np.sin(2 * np.pi * 0.11 * tt(n) + 1)
    return x * m * np.minimum(1, tt(n) / 0.8) * np.minimum(1, (dur - tt(n)) / 0.8) * g
def rain(dur, g=1.0):
    n = int(dur * SR); x = hp(rng.standard_normal(n), 1200) * 0.6 + lp(rng.standard_normal(n), 600) * 0.4
    drops = (rng.random(n) < 0.0025) * rng.standard_normal(n) * 3
    return (x + bp(drops, 1500, 6000)) * np.minimum(1, tt(n) / 0.6) * np.minimum(1, (dur - tt(n)) / 1.2) * g
def clock_tick(g=1.0):
    n = int(0.06 * SR); t = tt(n)
    return (bp(rng.standard_normal(n), 1800, 5200) * np.exp(-t * 180) + np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 120) * 0.5) * g
def ding(m, g=1.0):
    a = blip(midi(m), 0.14, 1.0); b = blip(midi(m + 7), 0.22, 0.8); o = np.zeros(int(0.3 * SR)); o[:len(a)] += a; j = int(0.07 * SR); o[j:j + len(b)] += b
    return o * g
def stamp(g=1.0):
    n = int(0.5 * SR); t = tt(n)
    return (lp(rng.standard_normal(n), 500) * np.exp(-t * 22) * 1.2 + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 18)) * g
def engine(dur, g=1.0):
    n = int(dur * SR); t = tt(n); f = 52 + 6 * np.sin(2 * np.pi * 0.3 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR; s = np.tanh(2 * np.sin(ph)) * 0.5 + lp(rng.standard_normal(n), 300) * 0.5
    return lp(s, 500) * np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 1.0) * g

def build_sfx():
    sfx = np.zeros((2, N + SR * 4))
    # gancho: impacto no quadro 0, folha do calendário, relógio
    place(sfx, impact(0.5, 1.2), 0.0, 0); place(sfx, whoosh(0.35, 3000, 600, 0.2), 0.0, 0, 0.3)
    for k, tk in enumerate(np.arange(0.6, 6.4, 0.5)): place(sfx, clock_tick((0.35 if k % 2 == 0 else 0.25) * (0.45 if 0.5 < tk < 4.9 else 1)), tk, 0.15 * (-1) ** k)
    place(sfx, whoosh(0.9, 500, 2600, 0.5), 2.95, -0.3, 0.6)                    # folha voa para o canto
    place(sfx, impact(0.18, 1.5), 3.9, 0)                                        # "vai mostrar?"
    # terra seca: vento e poeira
    w = wind(8.6, 0.5); place(sfx, np.vstack([w, np.roll(w, 3001)]), 6.2)
    place(sfx, wind(3.0, 0.25), 0.0, 0)
    # terra molhada: chuva, depois brotar
    r = rain(4.0, 0.35); place(sfx, np.vstack([r, np.roll(r, 2203)]), 13.9)
    place(sfx, shimmer(1.6, 30, 2500, 6500, 0.05), WET, 0)
    # caixa: números rolando e cartões
    for t0, dur in [(Q3["tem"], 1.1), (Q3["entra"], 0.9), (Q3["gasta"], 0.9), (Q3["habitantes"], 1.4), (Q3["decisao"], 1.0)]:
        for j, tk in enumerate(np.arange(t0, t0 + dur, 0.045)): place(sfx, tick(0.12 * (1 - (tk - t0) / dur * 0.7)), tk, 0.1)
        place(sfx, ding(91, 0.05), t0 + dur, 0.1)
    for tc in [21.1, Q3["caixa"], Q3["entra"] - 0.15, Q3["gasta"] - 0.15, Q3["habitantes"] - 0.15, Q3["decisao"] - 0.15]: place(sfx, whoosh(0.5, 800, 3000, 0.5), tc, 0.2, 0.04)
    # lista: um "check" por item, contador de bairros, carimbo
    for i, ti in enumerate(Q4["items"]): place(sfx, ding(81 + [0, 2, 4, 5, 7, 9, 11][i], 0.16), ti, -0.25 + 0.08 * i)
    for tk in np.linspace(Q4["item"], Q4["bairro"] + 0.75, 12): place(sfx, tick(0.18), tk, 0)
    place(sfx, stamp(0.45), Q4["tudo"] + 0.15, 0); place(sfx, shimmer(1.4, 30, 2500, 6500, 0.05), Q4["tudo"] + 0.2, 0)
    # comboio do governador
    e = engine(5.0, 0.18); place(sfx, np.vstack([e, np.roll(e, 900)]), 45.0)
    place(sfx, whoosh(1.4, 400, 2600, 0.6), END - 0.5, 0, 0.05)
    for s in TL["scenes"][1:]: place(sfx, whoosh(0.9, 500, 2200, 0.5), s["start"] - 0.45, 0, 0.03)
    sfx = sfx[:, :N + SR * 2]
    sfx = fx(sfx, Pedalboard([HighpassFilter(40), Reverb(room_size=0.3, damping=0.6, wet_level=0.12, dry_level=0.95, width=0.8), Compressor(threshold_db=-22, ratio=2.5, attack_ms=5, release_ms=120)]))
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
