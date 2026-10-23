"""Trilha e efeitos do filme "V4.7 · Do terreno à obra (3D)"."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
A = Ctx(); W = A.Wd; fx = A.fx; SC = A.SC
music(A, chords=((52, 55, 59), (48, 52, 55), (55, 59, 62), (50, 54, 57)), gain=.55)
A.transitions(skip=(2, 3, 4, 5, 6, 7, 8, 9))
fx.add(impact()[: int(.6 * SR)], .5, .3); fx.add(shimmer(), W(1, 'terreno', 0), .1)
t = ta(4.6); hum = (np.sin(2 * np.pi * 180 * t) + .5 * np.sin(2 * np.pi * 362 * t) + .3 * np.sin(2 * np.pi * 541 * t)) * (1 + .15 * np.sin(2 * np.pi * 7 * t))
fx.add(lowpass(hum, 2500) * np.minimum(1, t / .3) * np.minimum(1, (t[-1] - t) / .5) * .14, SC[1], 1.0)
for w in ('frente', 'lateral', 'área'): fx.add(pop(600, 1200), W(2, w, -.2), .15)
fx.add(typing(26, .06), W(3, 'quero um', -.1), .28)
for i in range(12): fx.add(pop(600 + i * 40, 1100 + i * 40), W(3, 'projeta', -.3) + i * .1, .07, (i % 3 - 1) * .4)
t0 = W(4, 'orçamento', -.2)
for i in range(6):
    fx.add(pop(700 + i * 40, 1200 + i * 40), t0 + i * .25, .1)
    for q in range(4): fx.add(tick(3200 + q * 40), t0 + i * .25 + q * .08, .025)
for w in ('equipe', 'compras'): fx.add(pop(500, 1000), W(4, w, -.2), .14)
r = np.random.default_rng(3)
for k in range(70):
    tt = SC[4] + .5 + k * (SC[8] - SC[4] - 1.2) / 70
    fx.add(clap() * .5 if k % 3 else impact()[: int(.12 * SR)], tt + r.random() * .1, .05, (r.random() - .5))
for k in (5, 6, 7, 8): fx.add(whoosh(.4), SC[k - 1] - .2, .1); fx.add(blip(1200, .08), SC[k - 1] + .2, .15)
fx.add(blip(800, .12), W(7, 'alertas', -.2), .28); fx.add(blip(800, .12), W(7, 'alertas', 0), .28)
fx.add(riser(1.4), SC[8] - 1.0, .15); fx.add(impact()[: int(.7 * SR)], W(9, 'obra entregue', 0), .28); fx.add(shimmer(), W(9, 'prontas', 0), .22)
for i in range(4): fx.add(pop(600 + i * 60, 1200 + i * 60), SC[9] + .8 + i * .25, .12)
t0 = W(10, 'na v4.7', -.2)
for i in range(5): fx.add(whoosh(.3), t0 + i * .12, .08); fx.add(pop(500, 1000), t0 + .2 + i * .12, .1)
t0 = W(10, '60%', -.1); fx.add(impact()[: int(.7 * SR)], t0, .22)
for q in range(12): fx.add(tick(2200 + q * 70), t0 + q * .1, .035)
for w in ('14', '12'):
    t0 = W(11, w, -.3)
    for q in range(8): fx.add(tick(2600 + q * 60), t0 + q * .1, .035)
fx.add(riser(1.6), SC[11] - 1.3, .22)
for i in range(6): fx.add(whoosh(.3), SC[11] + .3 + i * .12, .08, (i % 3 - 1) * .5)
fx.add(impact(), SC[11] + 1.0, .5); fx.add(shimmer(), SC[11] + 1.2, .2)
A.finish()
