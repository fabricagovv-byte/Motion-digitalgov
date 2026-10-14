"""Trilha original, efeitos sincronizados, falas e mixagem do curta de animação (60 s, 48 kHz estéreo).

Trilha 100% sintetizada (instrumentos de src/audio.py, sem samples de terceiros), em Fá maior:
  0–3,2 s   manhã na praça (sinos e pad)            3,2–22,3 s  escritório agitado (pizzicato, marimba, humor leve)
  22,3–39 s pulso tecnológico (arpejo, pads)        39–44,7 s   cordas calorosas, crescendo
  44,7–60 s tema do protagonista (pleno, brilhante) e assinatura sonora no final.
Falas dos personagens com EQ por voz; a trilha abaixa sob as falas (ducking). Murmúrio ambiente de escritório.
Saídas: audio/anim/stems/{dialogue,music,music_ducked,sfx}.wav e audio/anim/mix_master.wav (-14 LUFS, TP <= -1 dBTP)
"""
import json, os, sys
import numpy as np
from scipy.signal import resample_poly
import soundfile as sf
sys.path.insert(0, "src")
from audio import (SR, midi, tt, at, env_adsr, lp, hp, bp, place, fx, additive, pad_chord, bell, pluck, sub_bass, kick, hat,
                   noise_sweep, whoosh, impact, riser, blip, tick, shimmer, lufs)
from pedalboard import Pedalboard, Reverb, Delay, Compressor, HighpassFilter, LowpassFilter, PeakFilter, HighShelfFilter, Limiter, Gain

TL = json.load(open("src/anim/timeline.json"))
LINES = json.load(open("audio/anim/voice/lines.json"))
DUR = TL["duration"]; N = int(DUR * SR)
OUT = "audio/anim"
rng = np.random.default_rng(11)
BPM = 104.0; BEAT = 60.0 / BPM; BAR = 4 * BEAT
AT = {l["id"]: l["at"] for l in TL["lines"]}

def auto(points, n=N):
    ts, vs = zip(*points); x = np.interp(tt(n), ts, vs); k = int(0.05 * SR)
    return np.convolve(x, np.ones(k) / k, mode="same")

def piano(freq, dur=2.2, vel=1.0):
    n = int(dur * SR); t = tt(n)
    mod = np.sin(2 * np.pi * freq * 2 * t) * 1.1 * np.exp(-t * 3.0)
    s = np.sin(2 * np.pi * freq * t + mod) * np.exp(-t * 1.5) + 0.22 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t * 4)
    return lp(s * np.minimum(1, t / 0.004), 4500) * vel

def marimba(freq, dur=0.5, vel=1.0):
    n = int(dur * SR); t = tt(n)
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t * 9) + 0.35 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 30) + 0.1 * np.sin(2 * np.pi * freq * 10 * t) * np.exp(-t * 60)
    return s * np.minimum(1, t / 0.002) * vel

def pizz(freq, dur=0.4, vel=1.0):
    n = int(dur * SR); t = tt(n)
    s = sum((0.55 ** (h - 1)) * np.sin(2 * np.pi * freq * h * t) for h in range(1, 7)) * np.exp(-t * 11)
    return lp(s * np.minimum(1, t / 0.002), 2400) * vel

def shaker(gain=1.0):
    n = int(0.09 * SR); t = tt(n)
    return bp(rng.standard_normal(n), 4000, 11000) * np.sin(np.pi * np.minimum(1, t / 0.09)) ** 2 * gain

def clap(gain=1.0):
    n = int(0.25 * SR); t = tt(n); x = bp(rng.standard_normal(n), 900, 5000)
    e = sum(np.exp(-np.maximum(0, t - d) * 90) * (t >= d) for d in (0, 0.011, 0.022)) * 0.4 + np.exp(-t * 18) * 0.5
    return x * e * gain

def strings(notes, dur, attack=0.6, release=1.2, bright=0.6):
    n = int((dur + release) * SR); t = tt(n)
    s = sum(additive(midi(m), n, harmonics=9, tilt=1.0, bright=bright, detune_cents=(0, -9, 9)) for m in notes)
    vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t)
    return lp(s * vib * env_adsr(n, attack, 0.3, 0.9, release + 0.3), 3800) / len(notes)

# ---------------------------------------------------------------- Música
F_, Dm, Bb, C_, Gm, Am = [53, 60, 65, 69, 72], [50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [48, 55, 60, 64, 67], [43, 55, 58, 62, 67], [45, 52, 57, 60, 64]
def build_music():
    M = np.zeros((2, N + SR * 4))
    S1, S3, S4, S5 = 3.2, 22.3, 39.0, 44.7
    # A) manhã na praça: pad + sinos
    place(M, pad_chord([53, 60, 65, 69, 72], 3.4, attack=1.0, release=1.2, bright=0.7), 0.0, 0, 0.14)
    for i, (m, tm) in enumerate([(77, 0.35), (81, 0.85), (84, 1.35), (89, 2.2)]): place(M, bell(midi(m), 2.6, 0.6), tm, (-0.3 if i % 2 else 0.3), 0.06)
    # B) escritório agitado: walking pizz + marimba staccato + shaker
    prog = [F_, Dm, Bb, C_]; t = S1; k = 0
    while t < S3 - 0.05:
        ch = prog[k % 4]; d = min(BAR, S3 - t)
        place(M, pad_chord(ch[1:4], d, attack=0.4, release=0.6, bright=0.55), t, 0, 0.06)
        root = ch[0]
        for j, off in enumerate([0, 7, 12, 7]):                   # baixo pizzicato em semínimas
            if t + j * BEAT < S3 - 0.05: place(M, pizz(midi(root - 12 + off), 0.4, 0.9), t + j * BEAT, -0.15, 0.32)
        mel = [ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 12, ch[4] + 12, ch[3] + 12, ch[1] + 12]
        for j, m in enumerate(mel):                                  # marimba em colcheias com síncope
            tj = t + j * BEAT / 2 + (0.03 if j % 2 else 0)
            if tj < S3 - 0.1 and (j % 4 != 3 or k % 2 == 0): place(M, marimba(midi(m), 0.45, 0.8 + 0.2 * (j % 2 == 0)), tj, 0.25 if j % 2 else -0.05, 0.11)
        for j in range(8):
            tj = t + j * BEAT / 2
            if tj < S3 - 0.1: place(M, shaker(0.5 + 0.3 * (j % 2)), tj, 0.35, 0.06)
        t += d; k += 1
    # gag da pilha: puxada descendente e "segurou!" (3,8–4,4 s)
    for j, m in enumerate([84, 81, 77, 72, 69]): place(M, pizz(midi(m), 0.25, 0.8), 3.82 + j * 0.06, 0.2, 0.18)
    place(M, marimba(midi(77), 0.5) + marimba(midi(81), 0.5), 4.32, 0, 0.14)
    # "Achei!" (16,2 s): pequena fanfarra de sinos
    for j, m in enumerate([81, 84, 89]): place(M, bell(midi(m), 1.6, 0.5), AT["L4"] + 0.02 + j * 0.07, (j - 1) * 0.3, 0.05)
    # decisão do prefeito (20,15 s): acorde sustentado + riser para a transição
    place(M, strings([65, 69, 72, 77], 2.3, attack=0.5, release=0.8), 20.0, 0, 0.1)
    place(M, riser(2.2, 0.07), S3 - 2.1, 0)
    # C) pulso tecnológico: arpejo com delay, pads e kick em meio-tempo
    prog2 = [Dm, Bb, F_, C_]; t = S3; k = 0
    while t < S4 - 0.05:
        ch = prog2[k % 4]; d = min(BAR, S4 - t); bright = 0.55 + 0.25 * min(1, (t - S3) / 14)
        place(M, pad_chord(ch[1:5], d, attack=0.5, release=0.8, bright=bright), t, 0, 0.12)
        place(M, sub_bass(midi(ch[0] - 12), d * 0.95) * 0.85, t, 0, 0.22)
        for j in range(16):
            tj = t + j * BEAT / 4
            if tj < S4 - 0.05: m = ch[1 + [0, 1, 2, 3, 2, 1, 3, 2][j % 8]] + 12; place(M, pluck(midi(m), 0.32, cutoff=1500 + 2600 * min(1, (t - S3) / 12)) * (0.7 + 0.3 * (j % 4 == 0)), tj, (-0.35 if j % 2 else 0.35), 0.06)
        for j in range(4):
            tj = t + j * BEAT
            if tj < S4 - 0.05:
                if j % 2 == 0: place(M, kick(0.3), tj)
                place(M, hat(0.035), tj + BEAT / 2, 0.2)
        t += d; k += 1
    place(M, bell(midi(84), 2.0, 0.5) + bell(midi(91), 2.0, 0.4) * 0.6, AT["L6"] - 0.1, 0.1, 0.05)   # documento localizado
    # D) cordas calorosas + piano, crescendo
    t = S4; k = 0
    for ch in [F_, Am, Bb, C_]:
        d = (S5 - S4) / 4
        place(M, strings([n + 12 for n in ch[1:4]], d, attack=0.35, release=0.6, bright=0.65), t, 0, 0.12)
        place(M, sub_bass(midi(ch[0] - 12), d * 0.95) * 0.8, t, 0, 0.22)
        for j, m in enumerate(ch[1:5]): place(M, piano(midi(m + 12), 1.6, 0.5), t + j * 0.12, (j - 1.5) * 0.2, 0.07)
        place(M, kick(0.26), t); place(M, kick(0.2), t + d / 2)
        t += d; k += 1
    place(M, riser(2.6, 0.1), S5 - 2.5, 0)
    # E) tema do protagonista
    place(M, impact(0.2, 3.0), S5 + 0.02, 0)
    prog3 = [F_, C_, Dm, Bb]; t = S5; k = 0; END = 58.45
    while t < END - 0.05:
        ch = prog3[k % 4]; d = min(BAR, END - t)
        place(M, pad_chord(ch[1:5], d, attack=0.3, release=0.8, bright=0.8), t, 0, 0.13)
        place(M, strings([n + 12 for n in ch[2:5]], d, attack=0.3, release=0.6, bright=0.7), t, 0, 0.07)
        place(M, sub_bass(midi(ch[0] - 12), d * 0.95) * 0.9, t, 0, 0.24)
        for j in range(4):
            tj = t + j * BEAT
            if tj < END - 0.05: place(M, kick(0.3), tj); place(M, hat(0.04), tj + BEAT / 2, 0.2)
            if j in (1, 3) and tj < END - 0.05: place(M, clap(0.5), tj, -0.1, 0.08)
        for j in range(8):
            tj = t + j * BEAT / 2
            if tj < END - 0.05: m = ch[1 + [0, 2, 1, 3, 2, 1, 3, 2][j]] + 12; place(M, marimba(midi(m), 0.4, 0.7), tj, (-0.3 if j % 2 else 0.3), 0.07)
        t += d; k += 1
    # assinatura sonora (Dó–Fá–Lá–Dó) e resolução em Fá maior
    place(M, pad_chord([53, 60, 65, 69, 72, 77], DUR - END + 0.5, attack=0.2, release=1.4, bright=0.85), END, 0, 0.17)
    place(M, sub_bass(midi(41), 1.6) * 0.8, END, 0, 0.24); place(M, impact(0.14, 2.0), END, 0)
    for j, (m, dt, pan) in enumerate([(72, 0.0, -0.2), (77, 0.14, 0.0), (81, 0.28, 0.2), (84, 0.46, 0.0)]): place(M, bell(midi(m), 2.4, 0.7), END + dt, pan, 0.09 if j < 3 else 0.07)
    M = M[:, :N + SR * 2]
    M = fx(M, Pedalboard([HighpassFilter(30), Reverb(room_size=0.62, damping=0.5, wet_level=0.16, dry_level=0.9, width=1.0), Compressor(threshold_db=-18, ratio=2.0, attack_ms=25, release_ms=220), HighShelfFilter(9000, 1.0)]))
    shape = auto([(0, -1.5), (3.2, -1.0), (22.3, -0.5), (39, 0.0), (44.7, 1.5), (58.4, 2.0), (60, 1.0)])
    return M[:, :N] * 10 ** (shape / 20)

# ---------------------------------------------------------------- Efeitos
def paper(dur=0.35, g=1.0):
    n = int(dur * SR); t = tt(n) / dur; x = rng.standard_normal(n); crack = (rng.random(n) < 0.004) * rng.standard_normal(n) * 6
    return bp(x + crack, 1500, 7000) * np.sin(np.pi * t) ** 0.7 * (0.6 + 0.4 * np.abs(np.sin(t * 23))) * g
def click(g=1.0):
    n = int(0.025 * SR); t = tt(n); return (bp(rng.standard_normal(n), 2000, 7000) * np.exp(-t * 400) + np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 300) * 0.3) * g
def key(g=1.0):
    n = int(0.05 * SR); t = tt(n); return (bp(rng.standard_normal(n), 900, 5000) * np.exp(-t * 160) + lp(rng.standard_normal(n), 400) * np.exp(-t * 90) * 0.4) * g * rng.uniform(0.7, 1.1)
def step(g=1.0, hard=True):
    n = int(0.12 * SR); t = tt(n); x = lp(rng.standard_normal(n), 900 if hard else 500) * np.exp(-t * 45) + bp(rng.standard_normal(n), 2000, 6000) * np.exp(-t * 120) * (0.3 if hard else 0.1)
    return x * g * rng.uniform(0.75, 1.1)
def thump(g=1.0):
    n = int(0.35 * SR); t = tt(n); return (np.sin(2 * np.pi * (70 + 40 * np.exp(-t * 30)) * t) * np.exp(-t * 14) + lp(rng.standard_normal(n), 1200) * np.exp(-t * 30) * 0.5) * g
def slide(dur=0.5, g=1.0):  # gaveta de aço / caixa deslizando
    n = int(dur * SR); t = tt(n) / dur; return (bp(rng.standard_normal(n), 300, 2500) * (0.6 + 0.4 * np.sin(t * 60)) + np.sin(2 * np.pi * 180 * tt(n)) * 0.15) * np.sin(np.pi * t) ** 0.6 * g
def creak(dur=0.5, g=1.0):
    n = int(dur * SR); t = tt(n); f = 220 + 80 * np.sin(2 * np.pi * 1.3 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    return bp(np.sign(np.sin(ph)) * (rng.random(n) < 0.3), 400, 3000) * np.sin(np.pi * t / (dur)) * g
def scanner_run(dur, pps=1.4, g=1.0):
    n = int(dur * SR); t = tt(n); motor = (np.sin(2 * np.pi * 118 * t) * 0.5 + np.sin(2 * np.pi * 236 * t) * 0.25) * 0.25 + bp(rng.standard_normal(n), 300, 900) * 0.25
    out = motor * np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.3)
    for tp in np.arange(0.15, dur - 0.3, 1 / pps):
        s = noise_sweep(0.32, 1800, 4200, 0.3) * np.sin(np.pi * np.linspace(0, 1, int(0.32 * SR))) * 0.9; i = at(tp); out[i:i + len(s)] += s[: len(out) - i]
    return out * g
def birds(dur, g=1.0):
    n = int(dur * SR); out = np.zeros(n)
    for _ in range(int(dur * 3)):
        tp = rng.uniform(0, dur - 0.4); f0 = rng.uniform(2800, 4500); k = int(rng.uniform(0.06, 0.14) * SR); tk = tt(k)
        for r in range(rng.integers(1, 4)):
            f = f0 * (1 + 0.25 * np.sin(np.pi * tk / tk[-1])); ph = 2 * np.pi * np.cumsum(f) / SR; s = np.sin(ph) * np.sin(np.pi * tk / tk[-1]) ** 2
            i = at(tp + r * 0.16); out[i:i + k] += s[: max(0, min(k, n - i))]
    return out * g

def walla(T0, T1, gain, lines):
    """Murmúrio de vozes ao fundo (frases curtas sintetizadas, filtradas e com reverberação)."""
    out = np.zeros((2, N)); import sherpa_onnx as so
    d = "voices/kokoro-multi-lang-v1_0/"; tts = so.OfflineTts(so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(kokoro=so.OfflineTtsKokoroModelConfig(model=d + "model.onnx", voices=d + "voices.bin", tokens=d + "tokens.txt", data_dir=d + "espeak-ng-data", lang="pt-br"), num_threads=4)))
    t = T0
    for i, (txt, sid) in enumerate(lines):
        a = tts.generate(txt, sid=sid, speed=1.0); x = resample_poly(np.asarray(a.samples, dtype=np.float64), 2, 1)
        x = lp(hp(x, 300), 2600); place(out, x, t, (-0.6 if i % 2 else 0.5), gain); t += len(x) / SR * 0.55 + 0.4
        if t > T1: t = T0 + (i % 3) * 0.7
    return fx(out, Pedalboard([Reverb(room_size=0.7, damping=0.6, wet_level=0.5, dry_level=0.5, width=1.0)]))

def build_sfx():
    X = np.zeros((2, N + SR * 4))
    # exterior: pássaros, cidade ao longe, passos
    place(X, birds(3.4, 0.05), 0.0, -0.3); place(X, birds(3.4, 0.04), 0.1, 0.4)
    city = lp(rng.standard_normal(at(3.6)), 500) * 0.05 * np.minimum(1, tt(at(3.6)) / 0.5) * np.minimum(1, (3.6 - tt(at(3.6))) / 0.4); place(X, city, 0, 0)
    for j in range(5): place(X, step(0.05), 0.4 + j * 0.55, -0.2); place(X, step(0.04), 0.6 + j * 0.53, 0.3)
    # sala administrativa: ambiente, teclado, papéis, passos de Marcos, gaveta
    room = lp(hp(rng.standard_normal(N), 120), 900) * 0.008 * auto([(0, 0), (3.0, 0), (3.3, 1), (22.2, 1), (22.4, 0.7), (60, 0.7)])
    place(X, np.vstack([room, np.roll(room, 2111)]), 0)
    place(X, slide(0.55, 0.1), 3.05, 0.6)
    for j in range(12): place(X, step(0.06), 3.2 + j * 0.5, -0.5 + j * 0.08)
    for j in range(30): place(X, key(0.04), 3.3 + j * 0.31 + rng.uniform(0, 0.1), 0.55)
    for tp in np.arange(3.3, 6.8, 0.9): place(X, paper(0.4, 0.09), tp, -0.3)
    # pilha: rangido, papéis escorregando e o "segurou!"
    place(X, creak(0.45, 0.05), 3.78, 0.2); place(X, paper(0.5, 0.18), 3.95, 0.2); place(X, paper(0.3, 0.14), 4.18, 0.25); place(X, thump(0.22), 4.28, 0.2)
    for j in range(5): place(X, step(0.06), 8.25 + j * 0.42, -0.6 + j * 0.15)   # prefeito chegando
    # arquivo: tampa de caixa, passos, pasta puxada
    place(X, slide(0.4, 0.08), 13.95, -0.3); place(X, thump(0.08), 14.55, -0.3)
    for j in range(14): place(X, step(0.05, hard=False), 13.8 + j * 0.45, (-0.3 if j % 2 else 0.3))
    place(X, slide(0.35, 0.12), 15.95, 0.3); place(X, paper(0.35, 0.12), 16.08, 0.3)
    for j in range(5): place(X, step(0.05, hard=False), 17.7 + j * 0.48, 0.5)
    # central DigitalGov: scanner, teclado, cliques
    place(X, scanner_run(10.0, 1.4, 0.11), 22.6, -0.1)
    for j in range(26): place(X, key(0.07), 26.0 + j * 0.06 + rng.uniform(0, 0.02), 0.3)
    for j in range(20): place(X, key(0.06), 27.8 + j * 0.05, 0.0)
    place(X, click(0.22), 28.9, 0); place(X, click(0.2), 29.75, 0); place(X, paper(0.5, 0.07), 30.3, -0.4)
    # GED na prefeitura: clique e confirmação
    place(X, click(0.24), 33.15, -0.1); place(X, blip(1318, 0.12, 0.12), 33.4, 0); place(X, blip(1760, 0.12, 0.1), 33.47, 0)
    # sala organizada
    for j in range(16): place(X, key(0.04), 39.3 + j * 0.3, 0.5)
    for j in range(4): place(X, step(0.05), 44.3 + j * 0.42, 0.5)
    # revelação e cartão final
    place(X, whoosh(1.2, 400, 2600, 0.6), 44.4, 0.2, 0.06)
    place(X, whoosh(1.0, 500, 3200, 0.5), TL["endcard"]["in"] - 0.3, 0.3, 0.05)
    place(X, shimmer(1.6, 18, 2500, 6500, 0.035), TL["endcard"]["in"] + 0.2, 0.3)
    # transições entre cenas
    for s in TL["scenes"][1:]: place(X, whoosh(0.7, 600, 2400, 0.5), s["start"] - 0.35, 0, 0.012)
    X = X[:, :N + SR * 2]
    X = fx(X, Pedalboard([HighpassFilter(50), Reverb(room_size=0.3, damping=0.6, wet_level=0.1, dry_level=0.95, width=0.8), Compressor(threshold_db=-22, ratio=2.5, attack_ms=5, release_ms=120)]))
    X = X[:, :N]
    W = walla(3.4, 13.0, 0.035, [("Bom dia, tudo bem?", 42), ("Pode assinar aqui, por favor.", 43), ("Já volto, só um minuto.", 44), ("Onde está a caixa de dois mil e quinze?", 42), ("Senha quarenta e dois.", 43), ("Obrigada!", 42), ("Vou ver no arquivo.", 44)])
    return X + W

# ---------------------------------------------------------------- Falas
VOICE_EQ = {
    "prefeito": [PeakFilter(220, 1.0, 1.0), PeakFilter(3200, 2.0, 1.0)], "rafael": [PeakFilter(3000, 2.0, 1.0)], "claudia": [PeakFilter(3500, 1.5, 1.0)],
    "juliana": [PeakFilter(3800, 1.0, 1.0)], "narrador": [PeakFilter(180, 1.0, 1.0), PeakFilter(3000, 2.5, 0.9)], "heroi": [PeakFilter(200, 1.5, 1.0), PeakFilter(3200, 2.5, 0.9), HighShelfFilter(10000, 1.5)],
}
PAN = {"rafael": 0.12, "claudia": -0.12, "juliana": 0.08, "prefeito": -0.06, "narrador": 0.0, "heroi": 0.0}
def build_dialogue():
    D = np.zeros((2, N + SR * 3)); spans = []
    for item in TL["lines"]:
        lid = item["id"]; who = LINES[lid]["who"]; x, sr = sf.read(f"{OUT}/voice/{lid}.wav")
        if x.ndim > 1: x = x.mean(1)
        f = int(0.006 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
        chain = Pedalboard([HighpassFilter(85), *VOICE_EQ.get(who, []), Compressor(threshold_db=-20, ratio=3.0, attack_ms=8, release_ms=120)])
        x = fx(x[None, :], chain)[0]; x *= 10 ** ((-18.0 - lufs(np.vstack([x, x]))) / 20)
        place(D, x, item["at"], PAN.get(who, 0.0)); spans.append((item["at"], item["at"] + len(x) / SR, who))
    D = D[:, :N]
    room = Pedalboard([Reverb(room_size=0.18, damping=0.7, wet_level=0.06, dry_level=1.0, width=0.4)])
    return fx(D, room), spans

def duck_curve(spans, depth_db=-12.0, attack=0.12, release=0.6):
    g = np.zeros(N)
    for a, b, *_ in spans: g[max(0, at(a - attack)):at(b + 0.12)] = 1.0
    out = np.zeros(N); y = 0.0; ca, cr = 1 - np.exp(-1 / (attack * SR)), 1 - np.exp(-1 / (release * SR))
    for i in range(0, N, 64):
        tgt = g[i]; c = ca if tgt > y else cr; y += (tgt - y) * (1 - (1 - c) ** 64); out[i:i + 64] = y
    return 10 ** (depth_db * out / 20)

def main():
    os.makedirs(f"{OUT}/stems", exist_ok=True)
    dia, spans = build_dialogue(); mus = build_music(); sfx = build_sfx()
    duck = duck_curve(spans)
    dia *= 10 ** ((-16.0 - lufs(dia)) / 20)
    gm = 10 ** ((-23.0 - lufs(mus)) / 20); gs = 10 ** ((-27.0 - lufs(sfx)) / 20)
    mus_d, mus_c = mus * duck * gm, mus * gm; sfx_c = sfx * gs; sfx_d = sfx_c * (0.7 + 0.3 * duck)
    mix = dia + mus_d + sfx_d
    fo = auto([(0, 0), (0.25, 1), (DUR - 0.6, 1), (DUR - 0.02, 0), (DUR, 0)]); mix *= fo
    mix = fx(mix, Pedalboard([Compressor(threshold_db=-14, ratio=1.8, attack_ms=20, release_ms=200)]))
    g = 10 ** ((-14.0 - lufs(mix)) / 20)
    lim = lambda x: fx(x, Pedalboard([Limiter(threshold_db=-1.5, release_ms=80)])) * 10 ** (-1.5 / 20)
    for _ in range(4):
        out = lim(mix * g); g *= 10 ** ((-14.0 - lufs(out)) / 20)
    mix = lim(mix * g)
    tp = np.max(np.abs(resample_poly(mix, 4, 1, axis=1)))
    if tp > 10 ** (-1.0 / 20): mix *= 10 ** (-1.0 / 20) / tp
    for name, x in [("dialogue", dia * fo), ("music", mus_c * fo), ("music_ducked", mus_d * fo), ("sfx", sfx_d * fo)]:
        sf.write(f"{OUT}/stems/{name}.wav", x.T.astype(np.float32), SR, subtype="PCM_24")
    sf.write(f"{OUT}/mix_master.wav", mix.T.astype(np.float32), SR, subtype="PCM_24")
    tp = np.max(np.abs(resample_poly(mix, 4, 1, axis=1)))
    print(f"mix: {lufs(mix):.1f} LUFS, true peak {20*np.log10(tp):.2f} dBTP")
    print("falas:", [(w, round(a, 2), round(b, 2)) for a, b, w in spans])

if __name__ == "__main__":
    main()
