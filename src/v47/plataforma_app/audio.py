"""Áudio do motion 'Plataforma V4.7 · todos os sistemas abertos': batida tech + toques de interface por sistema."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); W = A.Wd; fx = A.fx; SC = A.SC
music(A, chords=((48, 52, 55), (45, 48, 52), (41, 45, 48), (43, 47, 50)), beat=60 / 118, drums_from=.5, gain=.55, end_gain=.7)
A.transitions()
fx.add(impact(), .5, .35); fx.add(whoosh(.5), 1.0, .15); fx.add(shimmer(), 1.6, .2)
for j in range(8): fx.add(pop(700 + j * 60, 1300 + j * 60), 1.15 + j * .09, .1)
for k in range(1, 9):
    s = SC[k]
    fx.add(blip(900 + k * 40, .08), s + .35, .16)
    for j in range(4): fx.add(tick(), s + .5 + j * .12, .12)
    fx.add(pop(800, 1500), s + .6, .16); fx.add(pop(900, 1600), s + .8, .14)
fx.add(typing(14), SC[7] + .4, .16)
fx.add(riser(.8), SC[9] - .8, .15); fx.add(impact(), SC[9] + .1, .5); fx.add(shimmer(), SC[9] + .5, .25)
for j in range(8): fx.add(pop(700 + j * 70, 1300 + j * 70), SC[9] + .5 + j * .08, .1)
A.finish(duck_db=-11)
