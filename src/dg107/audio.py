"""Trilha tecnológica, efeitos sincronizados e mixagem do filme DIGITALGOV 10.7 (90 s, 48 kHz estéreo).

Reaproveita os instrumentos sintetizados de src/audio.py e a cadeia de voz/mixagem de src/inst/audio.py
(100% originais, sem samples de terceiros).
Saídas: audio/dg107/stems/{narration,music,music_ducked,sfx}.wav e audio/dg107/mix_master.wav
"""
import importlib.util, json, sys
import numpy as np
sys.path.insert(0, "src")
spec = importlib.util.spec_from_file_location("inst_audio", "src/inst/audio.py"); I = importlib.util.module_from_spec(spec); spec.loader.exec_module(I)
from audio import SR, midi, tt, lp, hp, place, fx, pad_chord, bell, pluck, sub_bass, kick, hat, whoosh, impact, riser, blip, tick, shimmer
from pedalboard import Pedalboard, Reverb, Delay, Compressor, HighpassFilter, PeakFilter, HighShelfFilter

TL = json.load(open("src/dg107/timeline.json"))
DUR = TL["duration"]; N = int(DUR * SR)
I.TL, I.DUR, I.N, I.OUT = TL, DUR, N, "audio/dg107"
def auto(points, n=N):
    ts, vs = zip(*points); x = np.interp(tt(n), ts, vs); k = int(0.05 * SR)
    return np.convolve(x, np.ones(k) / k, mode="same")
I.auto = auto
BPM = 100.0; BEAT = 60.0 / BPM; BAR = 4 * BEAT
S = [s["start"] for s in TL["scenes"]]; END = TL["endcard"]["in"]

# ---------------------------------------------------------------- Música: Ré menor (i–VI–III–VII), 100 BPM, resolução em Ré maior
def build_music():
    mus = np.zeros((2, N + SR * 4))
    CH = [([50, 57, 62, 65, 69], 38), ([46, 58, 62, 65, 70], 34), ([53, 57, 60, 65, 69], 41), ([48, 55, 60, 64, 67], 36)]
    t = 0.4; k = 0
    while t < END - 0.05:
        notes, root = CH[k % 4]; d = min(BAR, END - t)
        bright = 0.45 + 0.35 * np.clip((t - S[1]) / 50, 0, 1)
        place(mus, pad_chord(notes, d, attack=1.4 if t < 1 else 0.6, release=1.4, bright=bright), t, 0, 0.15)
        if t >= 6.5: place(mus, sub_bass(midi(root), d * 0.96) * 0.8, t, 0, 0.27)
        if t >= S[3]: place(mus, pad_chord([m + 12 for m in notes[2:5]], d, attack=0.8, release=1.2, bright=0.6), t, 0, 0.055)
        t += d; k += 1
    # arpejo em semicolcheias com delay (pulso "tecnológico"); abre o filtro ao longo do filme
    pat = [0, 2, 4, 2, 3, 2, 4, 1]; tp = 2.8; i = 0
    while tp < END - 0.2:
        ci = int((tp - 0.4) // BAR) % 4; notes = CH[ci][0]
        m = notes[1 + pat[i % 8] % 4] + 12
        vel = (0.5 + 0.3 * (i % 4 == 0)) * (0.55 if tp < S[1] else 1.0)
        place(mus, pluck(midi(m), 0.3, cutoff=1500 + 2800 * float(np.clip((tp - S[1]) / 55, 0, 1))) * vel, tp, (-0.35 if i % 2 else 0.35), 0.065)
        tp += BEAT / 4 * (2 if tp < S[1] else 1); i += 1
    # percussão: leve a partir da cena 2, completa das cenas 4 a 7
    for b in np.arange(S[1], END - 0.4, BEAT):
        bi = int(round((b - S[1]) / BEAT)); full = b >= S[3]
        if full or bi % 2 == 0: place(mus, kick(0.34 if full else 0.24), b)
        place(mus, hat(0.03 if full else 0.018), b + BEAT / 2, 0.25)
        if full: place(mus, hat(0.014), b + BEAT / 4, -0.25); place(mus, hat(0.014), b + 3 * BEAT / 4, -0.25)
    # marcações: título (7,4 s), viradas de cena e chegada à assinatura
    place(mus, riser(2.6, 0.07), 7.3 - 2.5, 0); place(mus, impact(0.2, 3.0), 7.35, 0)
    for s in S[1:]: place(mus, riser(1.6, 0.035), s - 1.55, 0)
    place(mus, riser(3.4, 0.09), END - 3.3, 0); place(mus, impact(0.26, 3.4), END + 0.05, 0)
    place(mus, pad_chord([50, 57, 62, 66, 69, 76], DUR - END, attack=0.25, release=2.2, bright=0.8), END, 0, 0.2)
    place(mus, sub_bass(midi(38), 3.6) * 0.8, END, 0, 0.27)
    for j, (m, dt, pan) in enumerate([(81, 1.1, -0.2), (86, 1.28, 0.0), (90, 1.46, 0.2), (93, 1.7, 0.0)]):   # assinatura sonora
        place(mus, bell(midi(m), 3.6, 0.7), END + dt, pan, 0.08 if j < 3 else 0.05)
    mus = mus[:, :N + SR * 2]
    mus = fx(mus, Pedalboard([HighpassFilter(32), Delay(delay_seconds=BEAT * 0.75, feedback=0.22, mix=0.12), Reverb(room_size=0.8, damping=0.5, wet_level=0.22, dry_level=0.85, width=1.0),
                              Compressor(threshold_db=-18, ratio=2.0, attack_ms=30, release_ms=250), PeakFilter(300, -2.0, 1.0), HighShelfFilter(9000, 1.0)]))
    shape = auto([(0, -3), (6, -2), (S[1], -1.5), (S[3], 0), (S[5], 0.5), (END - 0.5, 2.0), (END + 0.6, 1.5), (DUR, 1.0)])
    return mus[:, :N] * 10 ** (shape / 20)

# ---------------------------------------------------------------- Efeitos de interface (discretos, sincronizados com a imagem)
def build_sfx():
    sfx = np.zeros((2, N + SR * 4)); rng = np.random.default_rng(11)
    ui = lambda t, f=1400, g=0.05, pan=0.0: place(sfx, blip(f, 0.07, 1.0), t, pan, g)
    tk = lambda t, g=0.05, pan=0.0: place(sfx, tick(1.0), t, pan, g)
    for s in S[1:]: place(sfx, whoosh(1.0, 400, 3000, 0.5), s - 0.5, 0, 0.05)
    # cena 1: arquivos entrando, painel, cartões dos módulos, título
    place(sfx, shimmer(3.2, 30, 2000, 6000, 0.05), 0.2, 0); place(sfx, whoosh(1.8, 200, 2600, 0.7), 0.6, 0, 0.06)
    for i in range(6): ui(2.4 + i * 0.13, 1100 + i * 140, 0.035, 0.4)
    for t in np.arange(3.2, 6.8, 0.22): tk(t + rng.uniform(-0.03, 0.03), 0.018, rng.uniform(-0.5, 0.5))
    place(sfx, shimmer(2.2, 24, 3000, 7000, 0.04), 7.3, 0)
    # cena 2: agentes em paralelo (etapas concluídas) e impactos
    for t in np.arange(S[1] + 0.8, S[2] - 0.6, 0.31): tk(t + rng.uniform(-0.04, 0.04), 0.016, rng.uniform(-0.6, 0.2))
    for i in range(5): ui(S[1] + 3.2 + i * 1.75 + 0.35, 1320 + i * 110, 0.05, 0.45)
    # cena 3: varredura de diagnóstico, divisor antes/depois, triagem
    place(sfx, whoosh(2.0, 900, 3600, 0.5), S[2] + 0.9, -0.2, 0.035)
    for i in range(4): ui(S[2] + 1.5 + i * 0.35, 760, 0.035, -0.3)
    place(sfx, whoosh(3.4, 300, 5000, 0.6), S[2] + 3.6, 0, 0.06); place(sfx, shimmer(3.0, 26, 2600, 7000, 0.035), S[2] + 4.0, 0)
    for i in range(4): ui(S[2] + 4.3 + i * 0.6, 1500 + i * 120, 0.04, 0.4)
    for i in range(6): ui(S[2] + 8.6 + i * 0.3 + 0.1, 880 if i == 3 else 1680, 0.035, 0.4)
    place(sfx, bell(midi(76), 1.2, 0.5), S[2] + 11.4, 0.4, 0.03)
    # cena 4: indicadores, barras, linha do tempo
    for i in range(12): tk(S[3] + 1.0 + i * 0.11, 0.03, -0.4 + i * 0.03)
    for i in range(4): ui(S[3] + 0.5 + i * 0.15, 1200 + i * 90, 0.03, -0.3 + i * 0.2)
    for i in range(7): ui(S[3] + 6.0 + i * 0.22, 700, 0.03, -0.3 + i * 0.1)
    for i in range(4): ui(S[3] + 7.4 + i * 0.28, 1500 + i * 100, 0.04, -0.3 + i * 0.12)
    # cena 5: árvore do pacote, validações, pesquisa, lote entregue
    for i in range(9): tk(S[4] + 0.7 + i * 0.5, 0.035, -0.5)
    for i in range(4): ui(S[4] + 3.4 + i * 0.75, 1560, 0.04, 0.0)
    for i in range(7): ui(S[4] + 1.6 + i * 0.95 + 0.3, 1320 + i * 60, 0.03, 0.5)
    for j in range(11): tk(S[4] + 6.0 + j * 0.135, 0.03, 0.0)
    place(sfx, bell(midi(84), 1.4, 0.5) + bell(midi(91), 1.4, 0.5) * 0.6, S[4] + 10.2, 0, 0.045)
    # cena 6: jornadas, convergência das etapas manuais
    for i in range(7): ui(S[5] + 0.6 + i * 0.3, 640, 0.035, -0.5 + i * 0.16)
    for i in range(4): ui(S[5] + 3.8 + i * 0.35, 1500 + i * 110, 0.045, -0.4 + i * 0.25)
    for k in range(5): place(sfx, whoosh(1.3, 500, 3400, 0.6), S[5] + 5.4 + k * 0.16, 0.3 - k * 0.12, 0.035)
    place(sfx, shimmer(1.6, 30, 2800, 7000, 0.04), S[5] + 6.6, 0)
    # cena 7: travelling, lote concluído, assinatura
    place(sfx, whoosh(4.5, 200, 2400, 0.6), S[6] + 0.2, 0, 0.05)
    place(sfx, bell(midi(81), 1.6, 0.5) + bell(midi(88), 1.6, 0.5) * 0.6, S[6] + 3.3, 0, 0.05)
    for i in range(5): tk(S[6] + 3.5 + i * 0.22, 0.03, 0.1)
    place(sfx, whoosh(1.6, 300, 3200, 0.6), END - 0.7, 0, 0.06); place(sfx, shimmer(3.0, 26, 3000, 7500, 0.04), END + 0.2, 0)
    sfx = sfx[:, :N + SR * 2]
    sfx = fx(sfx, Pedalboard([HighpassFilter(80), Reverb(room_size=0.35, damping=0.6, wet_level=0.14, dry_level=0.95, width=0.9), Compressor(threshold_db=-22, ratio=2.5, attack_ms=5, release_ms=120)]))
    return sfx[:, :N]

I.build_music, I.build_sfx = build_music, build_sfx
if __name__ == "__main__":
    I.main()
