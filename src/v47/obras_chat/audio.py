"""Áudio do reel de Obras pelo chat: música 128 bpm + voz real do pedido + sons de chat."""
import sys, os, wave; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
C = [0, 2.2, 4.6, 6.6, 24.0, 26.0, 28.2]; DUR = C[6]; B = '../../../build/v47_obras_chat'
MSG_T = [7.0, 7.9, 10.6, 12.8, 15.0, 16.8, 18.6, 21.8]
class A: pass
A.DUR = DUR; A.N = int(SR * DUR); A.SC = [0, 2.2, 4.6, 6.6, 10.6, 15.0, 18.6, 24.0]; A.F = C[5]; A.mus = Bus(A.N)
music(A, chords=((50, 53, 57), (46, 50, 53), (48, 52, 55), (45, 48, 52)), beat=60 / 128, drums_from=C[1], gain=.65, end_gain=.75)
fx = Bus(A.N); vox = Bus(A.N)
for i in range(8): fx.add(pop(500 + i * 60, 1000 + i * 60), .1 + i * .1, .14)
fx.add(impact()[: int(.5 * SR)], .9, .25)
for c in C[1:6]: fx.add(whoosh(.4), c - .3, .16); fx.add(impact()[: int(.3 * SR)], c, .16)
t = ta(C[2] - C[1] + .2); hum = (np.sin(2 * np.pi * 180 * t) + .5 * np.sin(2 * np.pi * 362 * t) + .3 * np.sin(2 * np.pi * 541 * t)) * (1 + .15 * np.sin(2 * np.pi * 7 * t))
fx.add(lowpass(hum, 2500) * np.minimum(1, t / .3) * np.minimum(1, (t[-1] - t) / .4) * .18, C[1], 1.0)
for i, t0 in enumerate((.3, .8, 1.2)): fx.add(pop(600 + i * 100, 1200 + i * 100), C[2] + t0, .15)
for i, t0 in enumerate(MSG_T):
    fx.add(blip(1500 if i < 2 else 1100, .07), t0, .3, .3 if i < 2 else -.3); fx.add(blip(2000 if i < 2 else 1500, .05), t0 + .06, .2)
    if i >= 2: fx.add(typing(8, .07), t0 - .7, .12)
with wave.open(f'{B}/pedido.wav') as w: sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(float) / 32768
if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)
vox.add(x, 8.05, 1.0)
for i in range(14): fx.add(pop(380 + i * 30, 800 + i * 30), 13.1 + i * .08, .07, (i % 3 - 1) * .5)          # ponte se montando
for i in range(6): fx.add(tick(2400 + i * 60), 19.0 + i * .25, .1); fx.add(tick(2800), 19.12 + i * .25, .07)
fx.add(pop(700, 1400), 20.6, .2)
for i in range(6): fx.add(whoosh(.3), C[4] + i * .1, .1, (i % 3 - 1) * .4)
fx.add(impact()[: int(.6 * SR)], C[4] + .9, .3); fx.add(pop(600, 1300), C[4] + 1.2, .25)
fx.add(riser(1.0), C[5] - 1.0, .2); fx.add(shimmer(), C[5] + .1, .35)
env = np.abs(vox.L); win = int(.25 * SR); env = np.convolve(env, np.ones(win) / win, mode='same'); duck = np.where(env > .004, 10 ** (-12 / 20), 1.0)
duck = np.convolve(duck, np.ones(int(.3 * SR)) / int(.3 * SR), mode='same'); A.mus.L *= duck; A.mus.R *= duck
st = lambda b: np.stack([b.L, b.R], 1)
mix = st(A.mus) * .85 + st(fx) + st(vox) * 1.1
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) * 1.1
with wave.open(f'{B}/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
