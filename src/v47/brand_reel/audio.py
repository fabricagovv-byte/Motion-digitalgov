"""Música do reel de identidade V4.7 (v2): batida 128 bpm e efeitos nos cortes da referência."""
import sys, os, wave; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
C = dict(s1=0, s2=.55, s3=.85, s4=1.75, s5=2.0, s6=3.75, s7=9.2, s8=10.8, s9=13.2, s10=14.2, s11=14.8, s12=15.3, end=18.2); DUR = C['end']
class A: pass
A.DUR = DUR; A.N = int(SR * DUR); A.SC = [0, C['s3'], C['s6'], C['s7'], C['s8']]; A.F = C['s12']; A.mus = Bus(A.N)
music(A, chords=((45, 48, 52), (41, 45, 48), (43, 47, 50), (40, 43, 47)), beat=60 / 128, drums_from=C['s3'], gain=.75, end_gain=.85)
fx = Bus(A.N)
fx.add(shimmer(), .05, .3); fx.add(whoosh(.5), C['s2'] - .2, .3)
for k in ('s3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12'): fx.add(whoosh(.4), C[k] - .3, .18); fx.add(impact()[: int(.3 * SR)], C[k], .2)
fx.add(pop(300, 900), C['s3'] + .1, .3)
for q in range(40): fx.add(tick(1800 + (q * 97) % 900), C['s5'] + .2 + q * .012, .03, (q % 3 - 1) * .5)
s6 = C['s6']; fx.add(typing(10, .07), s6 + 1.25, .3); fx.add(pop(900, 300), s6 + 2.1, .3); fx.add(pop(400, 1300), s6 + 2.4, .3)
fx.add(blip(1400, .08), s6 + 2.75, .2)
for q in range(14): fx.add(pop(800 + q * 40, 1400 + q * 40), s6 + 3.25 + q * .03, .05, (q % 3 - 1) * .6)
fx.add(whoosh(1.0), s6 + 4.75, .35); fx.add(riser(1.0), s6 + 4.4, .12)
fx.add(shimmer(), C['s7'] + .2, .25)
for i in range(5): fx.add(pop(500 + i * 90, 1000 + i * 90), C['s8'] + i * .08 + .1, .14)
fx.add(whoosh(.8), C['s11'] - .1, .4); fx.add(typing(16, .05), C['s12'] + .25, .18)
fx.add(impact(), C['s12'] + 2.6, .3)
st = lambda b: np.stack([b.L, b.R], 1)
mix = st(A.mus) * .85 + st(fx)
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) * 1.1
os.makedirs('../../../build/v47_brand_reel', exist_ok=True)
with wave.open('../../../build/v47_brand_reel/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
