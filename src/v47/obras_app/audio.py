"""Áudio do motion 'Sistema de Obras — o app': batida leve de tecnologia + toques de interface."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); W = A.Wd; fx = A.fx; SC = A.SC
music(A, chords=((48, 52, 55), (45, 48, 52), (41, 45, 48), (43, 47, 50)), beat=60 / 112, drums_from=.5, gain=.55, end_gain=.7)
A.transitions()
fx.add(impact(), .5, .35); fx.add(shimmer(), 1.3, .2); fx.add(whoosh(.5), 1.0, .15)
fx.add(blip(1100, .08), W(2, 'drone', -.1), .2)
for j in range(3): fx.add(tick(), W(2, 'drone', .6 + j * .5), .2)
fx.add(blip(900, .1), W(3, 'fala', -.1), .2); fx.add(typing(14), W(3, 'fala', .3), .18)
for j in range(4): fx.add(pop(700 + j * 90, 1300 + j * 90), W(3, 'lista', -.1 + j * .15), .12)
for j in range(6): fx.add(tick(), SC[3] + .6 + j * .25, .18)
fx.add(pop(900, 1600), W(4, 'sinapi', 0), .25)
for j in range(5): fx.add(pop(800 + j * 70, 1400 + j * 70), SC[4] + .7 + j * .3, .14)
fx.add(blip(600, .15), W(6, 'avisa', -.1), .25)
fx.add(impact(), SC[6] + .1, .4); fx.add(clap(), W(7, 'empresas', -.1), .25)
fx.add(riser(.8), SC[7] - .8, .15); fx.add(impact(), SC[7] + .1, .5); fx.add(shimmer(), SC[7] + .5, .25)
A.finish(duck_db=-11)
