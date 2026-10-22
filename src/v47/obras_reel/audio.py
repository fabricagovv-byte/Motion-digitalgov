"""Música do reel de Obras por dentro da IA: 128 bpm, efeitos em cada etapa."""
import sys, os, wave; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
C = [0, 1.3, 3.4, 5.0, 7.4, 9.6, 11.8, 13.6, 15.4, 17.2, 19.6]; DUR = C[10]
class A: pass
A.DUR = DUR; A.N = int(SR * DUR); A.SC = C[:10]; A.F = C[9]; A.mus = Bus(A.N)
music(A, chords=((50, 53, 57), (46, 50, 53), (48, 52, 55), (45, 48, 52)), beat=60 / 128, drums_from=C[1], gain=.7, end_gain=.75)
fx = Bus(A.N)
fx.add(riser(.8), .0, .12); fx.add(clap() * .9, .82, .45); fx.add(blip(3000, .03), .82, .3)          # obturador
for c in C[1:10]: fx.add(whoosh(.4), c - .3, .18); fx.add(impact()[: int(.3 * SR)], c, .18)
for i in range(3):
    for q in range(8): fx.add(tick(2400 + q * 60), C[1] + .4 + i * .3 + q * .04, .05)
    fx.add(pop(600, 1200), C[1] + .7 + i * .3, .14)
fx.add(blip(900, .1), C[2] + .2, .25); fx.add(typing(28, .045), C[2] + .3, .2)
for q in range(30): fx.add(tick(1800 + (q * 97) % 900), C[3] + .1 + q * .05, .04, (q % 3 - 1) * .5)
for i in range(18): fx.add(pop(380 + i * 30, 800 + i * 30), C[4] + .25 + i * .06, .07, (i % 3 - 1) * .5)  # peças da praça
for i in range(6): fx.add(pop(500 + i * 80, 1000 + i * 80), C[5] + i * .1 + .1, .15)
for q in range(14): fx.add(tick(2200 + q * 70), C[6] + .1 + q * .07, .05)
fx.add(pop(700, 1400), C[6] + .9, .2)
for i in range(3): fx.add(whoosh(.35), C[7] + i * .14, .14, (i - 1) * .5)
fx.add(impact()[: int(.5 * SR)], C[7] + 1.0, .3)
fx.add(blip(1500, .05), C[8] + .78, .4); fx.add(riser(.6), C[8] + .85, .2); fx.add(impact(), C[8] + .9, .35)
fx.add(riser(1.0), C[9] - 1.0, .2); fx.add(shimmer(), C[9] + .1, .35); fx.add(impact()[: int(.8 * SR)], C[9], .3)
st = lambda b: np.stack([b.L, b.R], 1)
mix = st(A.mus) * .85 + st(fx)
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) * 1.1
os.makedirs('../../../build/v47_obras_reel', exist_ok=True)
with wave.open('../../../build/v47_obras_reel/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
