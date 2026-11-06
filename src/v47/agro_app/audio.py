"""Áudio do motion 'V4.7 Agro': batida orgânica leve + toques de interface e drone."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); W = A.Wd; fx = A.fx; SC = A.SC
music(A, chords=((45, 49, 52), (42, 45, 49), (38, 42, 45), (40, 44, 47)), beat=60 / 104, drums_from=.8, gain=.5, end_gain=.65)
A.transitions()
fx.add(impact(), .6, .3); fx.add(shimmer(), 1.4, .18)
for j in range(6): fx.add(pop(700 + j * 60, 1300 + j * 60), 1.3 + j * .12, .1)
fx.add(riser(1.2), SC[1] + .2, .1); fx.add(whoosh(.8), SC[1] + .5, .14)
for j in range(4): fx.add(blip(1000 + j * 80, .08), SC[1] + 1.2 + j * .55, .16)
for j in range(6): fx.add(tick(), SC[2] + .6 + j * .14, .14)
fx.add(blip(600, .15), SC[3] + 2.0, .25)
for j in range(4): fx.add(pop(800 + j * 70, 1400 + j * 70), SC[4] + .5 + j * .14, .12)
for j in range(6): fx.add(tick(), SC[5] + .6 + j * .14, .14)
fx.add(shimmer(), SC[6] + 1.6, .2); fx.add(blip(1400, .08), SC[6] + 2.8, .2)
fx.add(impact(), SC[7] + .2, .4)
fx.add(riser(.8), SC[8] - .8, .14); fx.add(impact(), SC[8] + .1, .5); fx.add(shimmer(), SC[8] + .5, .22)
A.finish(duck_db=-12)
