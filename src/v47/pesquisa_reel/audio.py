"""Áudio do reel de Pesquisa: música 128 bpm + voz real do morador + efeitos."""
import sys, os, wave; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
C = [0, 2.0, 4.6, 6.6, 10.6, 12.4, 14.8, 16.8, 18.8, 20.6, 22.2, 24.6, 26.6]; DUR = C[12]; B = '../../../build/v47_pesquisa_reel'
class A: pass
A.DUR = DUR; A.N = int(SR * DUR); A.SC = C[:12]; A.F = C[11]; A.mus = Bus(A.N)
music(A, chords=((52, 55, 59), (48, 52, 55), (50, 53, 57), (47, 50, 54)), beat=60 / 128, drums_from=C[1], gain=.7, end_gain=.75)
fx = Bus(A.N); vox = Bus(A.N)
for i in range(8): fx.add(pop(500 + i * 60, 1000 + i * 60), .1 + i * .11, .14)                  # palavras do gancho
fx.add(impact()[: int(.5 * SR)], .9, .25)
for c in C[1:12]: fx.add(whoosh(.4), c - .3, .16); fx.add(impact()[: int(.3 * SR)], c, .16)
for q in range(22): fx.add(blip(1400 + (q * 131) % 900, .05), C[1] + .4 + q * .1, .06, (q % 5 - 2) * .4)   # +1 dos agentes
fx.add(blip(1500, .05), C[2] + .9, .35); fx.add(pop(600, 1200), C[2] + .6, .15); fx.add(pop(600, 1200), C[2] + 1.0, .15)
with wave.open(f'{B}/resp.wav') as w: sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(float) / 32768
if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)
vox.add(x, C[3] + .45, 1.0); fx.add(blip(1300, .08), C[3] + 3.7, .2)
for q in range(30): fx.add(blip(1800 + (q * 97) % 1200, .04), C[4] + .3 + q * .045, .05, (q % 3 - 1) * .5)
for i in range(12): fx.add(pop(450 + i * 40, 900 + i * 40), C[5] + i * .04, .08, (i % 3 - 1) * .5)
fx.add(whoosh(.8), C[5] + .9, .2)
for i in range(4): fx.add(pop(600 + i * 120, 1300 + i * 120), C[5] + 1.4 + i * .1, .16)
for i in range(10): fx.add(pop(400 + i * 50, 800 + i * 50), C[6] + .1 + i * .06, .1)
for i in range(3): fx.add(tick(2400), C[7] + .3 + i * .2, .12)
for i in range(6): fx.add(whoosh(.3), C[8] + i * .12, .1, (i % 3 - 1) * .4)
fx.add(shimmer(), C[8] + 1.6, .25)
fx.add(blip(1500, .05), C[9] + .72, .4); fx.add(riser(.5), C[9] + .8, .2); fx.add(impact(), C[9] + .85, .35)
fx.add(impact()[: int(.6 * SR)], C[10] + .05, .3); fx.add(pop(700, 1400), C[10] + .7, .25)
fx.add(riser(1.0), C[11] - 1.0, .2); fx.add(shimmer(), C[11] + .1, .35)
env = np.abs(vox.L); win = int(.25 * SR); env = np.convolve(env, np.ones(win) / win, mode='same'); duck = np.where(env > .004, 10 ** (-12 / 20), 1.0)
duck = np.convolve(duck, np.ones(int(.3 * SR)) / int(.3 * SR), mode='same'); A.mus.L *= duck; A.mus.R *= duck
st = lambda b: np.stack([b.L, b.R], 1)
mix = st(A.mus) * .85 + st(fx) + st(vox) * 1.1
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) * 1.1
with wave.open(f'{B}/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
