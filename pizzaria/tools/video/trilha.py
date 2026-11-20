"""Trilha original (gerada por síntese, sem samples de terceiros) para o vídeo promocional.
Violão dedilhado (Karplus-Strong), baixo, shaker e bumbo suave. 100 BPM, ~19 s.
Uso: python3 tools/video/trilha.py saida.wav [duracao_s]"""
import sys, wave, numpy as np
SR = 48000; BPM = 100; BEAT = 60 / BPM
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 19.0
N = int(SR * dur); L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def pluck(f, t, amp=0.25, decay=0.996, pan=0.5, length=2.2):
    n = int(SR * length); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = decay * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    s = int(t * SR); e = min(N, s + n); seg = out[:e - s] * amp
    L[s:e] += seg * (1 - pan) * 1.2; R[s:e] += seg * pan * 1.2
def bass(f, t, length, amp=0.32):
    s = int(t * SR); n = min(int(length * SR), N - s); tt = np.arange(n) / SR
    env = np.minimum(1, tt / 0.01) * np.exp(-tt * 2.2)
    sig = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * env * amp
    L[s:s + n] += sig; R[s:s + n] += sig
def kick(t, amp=0.5):
    s = int(t * SR); n = min(int(0.35 * SR), N - s); tt = np.arange(n) / SR
    f = 40 + 90 * np.exp(-tt * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(ph) * np.exp(-tt * 9) * amp; L[s:s + n] += sig; R[s:s + n] += sig
def shaker(t, amp=0.05, pan=0.65):
    s = int(t * SR); n = min(int(0.09 * SR), N - s); tt = np.arange(n) / SR
    no = rng.uniform(-1, 1, n); no = np.diff(np.concatenate([[0], no]))  # high-pass simples
    sig = no * np.exp(-tt * 45) * amp; L[s:s + n] += sig * (1 - pan); R[s:s + n] += sig * pan
# Progressão I - vi - IV - V em Ré maior (2 compassos cada acorde = 8 tempos? usamos 4 tempos)
prog = [(62, [62, 66, 69, 74]), (59, [59, 62, 66, 71]), (55, [55, 59, 62, 67]), (57, [57, 61, 64, 69])]
bars = int(dur / (4 * BEAT)) + 1
end_t = dur - 3.6  # início da cartela final
for b in range(bars):
    root, ch = prog[b % 4]; t0 = b * 4 * BEAT
    if t0 >= end_t: break
    bass(hz(root - 24), t0, 4 * BEAT); bass(hz(root - 12), t0 + 2.5 * BEAT, 1.5 * BEAT, 0.18)
    pat = [0, 2, 1, 3, 2, 1, 3, 2]
    for k, idx in enumerate(pat):
        tt = t0 + k * BEAT / 2
        if tt < end_t: pluck(hz(ch[idx]), tt, 0.16 if k % 2 else 0.2, pan=0.35 + 0.3 * (k % 2))
    for k in range(4):
        if b > 0: kick(t0 + k * BEAT, 0.33 if k % 2 == 0 else 0.0)
        for h in range(2): shaker(t0 + k * BEAT + h * BEAT / 2, 0.035 if h else 0.05)
# Acorde final (Ré maior com 9ª) na cartela
for i, m in enumerate([50, 62, 66, 69, 74, 76]):
    pluck(hz(m), end_t + i * 0.045, 0.2, decay=0.9985, pan=0.3 + 0.08 * i, length=min(3.5, dur - end_t - 0.05))
bass(hz(38), end_t, 3.4, 0.35)
mix = np.stack([L, R], 1)
# reverb curto (eco múltiplo) para dar ambiência
for d, g in [(0.031, 0.25), (0.047, 0.2), (0.071, 0.15), (0.113, 0.1)]:
    k = int(d * SR); mix[k:] += mix[:-k] * g * 0.6
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]; mix[:int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))[:, None]
mix = np.tanh(mix * 1.1); mix /= np.max(np.abs(mix)) / 0.7
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', dur)
