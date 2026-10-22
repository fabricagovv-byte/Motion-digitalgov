"""Áudio do reel vertical 'todos os sistemas': música + voz + sons de chat."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); L = lambda k: A.lines[k - 1]['start']
SC = [0, L(3) - .5, L(9) - .4, L(10) - .4]; A.SC = SC; A.F = SC[3]
music(A, chords=((50, 53, 57), (46, 50, 53), (48, 52, 55), (45, 48, 52)), beat=60 / 124, drums_from=1.0, gain=.6, end_gain=.75)
fx = A.fx
fx.add(impact()[: int(.6 * SR)], .5, .3)
for i in range(6): fx.add(pop(500 + i * 70, 1000 + i * 70), L(2) + .3 + i * .12, .14, (i % 3 - 1) * .5)  # chips
for s in SC[1:]: fx.add(whoosh(.5), s - .4, .17); fx.add(impact()[: int(.3 * SR)], s, .15)
for k in range(3, 9):
    me, ai = L(k) - .2, L(k) + (1.5 if k == 7 else 1.2)
    fx.add(blip(1500, .07), me, .3, .3); fx.add(blip(2000, .05), me + .06, .2, .3)
    fx.add(typing(8, .07), ai - .8, .12)
    fx.add(blip(1100, .07), ai, .3, -.3); fx.add(blip(1500, .05), ai + .06, .2, -.3)
for i in range(8): fx.add(tick(2400 + i * 60), L(7) + 1.8 + i * .2, .08)   # contador R$
for i in range(6): fx.add(pop(600 + i * 90, 1200 + i * 90), SC[2] + .4 + i * .15, .14, (i % 3 - 1) * .5)  # nós
fx.add(riser(1.0), SC[3] - 1.0, .2); fx.add(shimmer(), SC[3] + .1, .35)
A.finish(duck_db=-13, music_gain=.8, fx_gain=.9)
print('ok')
