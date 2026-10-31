"""Áudio do reel de Halloween: clima sombrio leve, morcegos e trovão na virada."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); W = A.Wd; fx = A.fx; SC = A.SC
music(A, chords=((45, 48, 52), (41, 44, 48), (43, 46, 50), (40, 44, 47)), beat=60 / 100, drums_from=.8, gain=.55, end_gain=.7)
fx.add(riser(.6), 0.0, .12); fx.add(impact(), .6, .45); fx.add(whoosh(.5), .55, .2)
fx.add(pop(500, 300), .3, .2); fx.add(pop(480, 280), .5, .2)
fx.add(impact(), SC[0] + .6, .4); fx.add(clap(), SC[0] + .6, .25)
fx.add(whoosh(.6), SC[1] + .4, .18); fx.add(pop(900, 1500), SC[1] + .8, .2)
fx.add(impact(), SC[2], .6); fx.add(lowpass(impact(), 300), SC[2] + .05, .5); fx.add(shimmer(), SC[2] + .3, .25)
A.finish(duck_db=-10)
