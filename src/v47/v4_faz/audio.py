"""Trilha do "O que a V4 faz + a nova IA": batida leve + sons de cada movimento (letras, quiques, botão, números)."""
import sys, os, wave; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
T = dict(s1=0, s2=3.0, s3=5.6, s4=8.2, s5=10.6, s6=13.6, s7=16.4, end=20.2); DUR = T['end']
class A: pass
A.DUR = DUR; A.N = int(SR * DUR); A.SC = [0, T['s2'], T['s4'], T['s5'], T['s6']]; A.F = T['s7']; A.mus = Bus(A.N)
music(A, chords=((52, 55, 59), (48, 52, 55), (50, 53, 57), (47, 50, 54)), beat=.5, drums_from=T['s2'], gain=.6, end_gain=.75)
fx = Bus(A.N)
for i in range(8): fx.add(pop(300, 120) * 1.2, .25 + i * .1 + .35, .35, (i - 3.5) / 5)            # letras caindo
fx.add(whoosh(.6), 2.0, .25); fx.add(shimmer(), 2.3, .25)                                     # letras somem, O dourado
hops = [.62, .52, .44, .36, .30, .26]; t = T['s2'] + .35
for i, d in enumerate(hops[1:]):
    t += d; fx.add(pop(220 - i * 10, 120), t, .5 - i * .07); fx.add(kick(.4 - i * .05), t, .5)   # quiques
fx.add(whoosh(1.0), T['s3'] - .1, .3); fx.add(riser(1.2), T['s3'] + .6, .08)                  # câmera recua
fx.add(blip(1600, .06), T['s4'] + .6, .4); fx.add(blip(2200, .05), T['s4'] + .66, .3)          # clique do botão
for q in range(16): fx.add(tick(2600 + q * 40), T['s4'] + 1.3 + q * .04, .06)                 # integração girando
fx.add(riser(.6), T['s4'] + 1.5, .2); fx.add(impact()[: int(.6 * SR)], T['s4'] + 2.1, .4)     # cor enche a tela
fx.add(whoosh(1.4), T['s5'] + .2, .3); fx.add(pop(500, 1100), T['s5'] + .4, .2)
for i in range(4):
    t0 = T['s6'] + i * .7
    for q in range(10): fx.add(tick(1800 + q * 120), t0 + q * .028, .07)
    fx.add(pop(600 + i * 120, 1300 + i * 120), t0 + .3, .25)
for i in range(13): fx.add(tick(2200 + (i * 151) % 900), T['s7'] + i * .04 + .3, .08, (i % 3 - 1) * .5)  # letras do nome
fx.add(impact(), T['s7'] + 1.2, .45); fx.add(shimmer(), T['s7'] + 1.5, .3); fx.add(pop(700, 1500), T['s7'] + 1.7, .25)
st = lambda b: np.stack([b.L, b.R], 1)
mix = st(A.mus) * .8 + st(fx)
fo = int(1.2 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) * 1.1
os.makedirs('../../../build/v47_v4_faz', exist_ok=True)
with wave.open('../../../build/v47_v4_faz/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
