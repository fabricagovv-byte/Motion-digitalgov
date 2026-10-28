"""Áudio do reel Black Friday V4.7: batida rápida + impactos nos preços."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); W = A.Wd; fx = A.fx; SC = A.SC
music(A, chords=((45, 48, 52), (41, 45, 48), (43, 47, 50), (40, 43, 47)), beat=60 / 128, drums_from=.3, gain=.62, end_gain=.75)
A.transitions()
fx.add(impact(), .3, .45); fx.add(impact(), .75, .45); fx.add(shimmer(), 1.6, .2)
for k, w in ((2, 'max: de'), (3, 'master: de'), (4, 'simples: de')):
    a = W(k, w, -.15); fx.add(whoosh(.4), a + .3, .12); fx.add(pop(300, 200), a + .55, .2)
    b = W(k, 'por', -.15); fx.add(impact(), b, .5); fx.add(clap(), b, .3); fx.add(pop(900, 1600), b + .35, .25)
    for j in range(3): fx.add(pop(700 + j * 80, 1300 + j * 80), b + .9 + j * .18, .12)
fx.add(impact(), SC[4] + .1, .4); fx.add(impact(), W(5, '90%', -.2), .55); fx.add(riser(.8), W(5, '90%', -1.0), .15)
for w in ('drone', 'orçamento', 'documentos'): fx.add(pop(600, 1200), W(5, w, -.15), .16)
fx.add(shimmer(), SC[5] + .4, .25); fx.add(blip(1200, .1), W(6, 'whatsapp', -.2), .3)
A.finish(duck_db=-11)
