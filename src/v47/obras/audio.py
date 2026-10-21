"""Trilha e efeitos do filme "V4.7 · Sistema de Obras" (usa o kit da série)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *

A = Ctx(); W = A.Wd; fx = A.fx; SC = A.SC
music(A, chords=((52, 55, 59), (48, 52, 55), (55, 59, 62), (50, 54, 57)))
A.transitions()

def shutter():
    t = ta(.16); n = rng.standard_normal(len(t)); c = lowpass(n, 6000) - lowpass(n, 1200)
    return c * (np.exp(-t * 60) + .7 * np.exp(-((t - .07) ** 2) / 2e-5))

# 1 · problema: carimbos
for w in ('aditivo', 'atraso', 'retrabalho'): fx.add(impact()[: int(.5 * SR)], W(1, w, -.15), .22); fx.add(clap(), W(1, w, -.15), .25)
fx.add(pop(300, 200), W(1, 'medida está errada', -.2), .18)
# 2 · celular sobe e fotografa
fx.add(whoosh(.7), SC[1] + .05, .16, .3)
fx.add(shutter(), W(2, 'fotografa', .1), .5); fx.add(shimmer(), W(2, 'fotografa', .15), .06)
# 3 · medição AR
for i in range(4): fx.add(blip(1500 + i * 150), SC[2] + .5 + i * .25, .14)
for w in ('largura', 'comprimento'):
    t0 = W(3, w, -.2)
    for q in range(10): fx.add(tick(2600 + q * 60), t0 + q * .07, .035, .2)
    fx.add(pop(600, 1200), t0 + .5, .14)
t0 = W(3, 'área', -.25)
for q in range(14): fx.add(tick(2000 + q * 90), t0 + q * .07, .035, -.2)
fx.add(pop(500, 1300), t0 + 1.0, .18)
# 4 · voz e etiquetas
fx.add(blip(900, .15), W(4, 'quero uma', -.3), .2)
fx.add(typing(40, .06), W(4, 'quero uma', -.1), .35)
for w in ('praça', 'quadra', 'bancos', 'iluminação'): fx.add(pop(700, 1400), W(4, w, .25), .14)
fx.add(pop(500, 1000), W(4, 'iluminação', .9), .12)
# 5 · IA desenha
fx.add(riser(1.0), SC[4] + .1, .08)
for w in ('caminhos', 'quadra', 'bancos', 'postes'): fx.add(whoosh(.45), W(5, w, -.35), .1, .2); fx.add(pop(600, 1100), W(5, w, -.2), .14)
for i in range(6): fx.add(blip(1800 + i * 90, .06), W(5, 'bancos', -.2) + i * .08, .08)
for i in range(8): fx.add(blip(2400 + i * 60, .05), W(5, 'postes', -.2) + i * .09, .07, (i % 2 - .5))
fx.add(shimmer(), W(5, 'postes', .5), .1)
# 6 · quantitativos
for w in ('piso', 'meio-fio', 'metros quadrados', 'quadrados de piso', 'postes', 'número'):
    t0 = W(6, w, -.3); fx.add(pop(800, 1300), t0, .1)
    for q in range(6): fx.add(tick(2800 + q * 50), t0 + .05 + q * .1, .03)
# 7 · orçamento somando
t0 = W(7, 'orçamento', -.2)
for i in range(6):
    fx.add(pop(700 + i * 40, 1200 + i * 40), t0 + i * .32, .1)
    for q in range(5): fx.add(tick(3200 + q * 40), t0 + i * .32 + q * .1, .025, .3)
fx.add(blip(1300, .2), t0 + 2.3, .14)
fx.add(pop(400, 800), W(7, 'lei', -.3), .14)
# 8 · documentos
for w in ('estudo', 'termo', 'cronograma'): fx.add(whoosh(.5), W(8, w, -.35), .14, .3); fx.add(typing(14, .05), W(8, w, 0), .2)
# 9 · engenheiro valida
fx.add(pop(500, 900), W(9, 'a ia estima', -.2), .16); fx.add(whoosh(.5), W(9, 'o engenheiro', -.4), .12); fx.add(pop(700, 1300), W(9, 'o engenheiro', -.2), .16)
fx.add(lowpass(rng.standard_normal(int(.9 * SR)), 1800) * .25, W(9, 'assina', -.1), .3)
fx.add(impact()[: int(.6 * SR)], W(9, 'com art', -.1), .3); fx.add(clap(), W(9, 'com art', -.1), .3)
# 10 · publicar
for i in range(5): fx.add(blip(1200 + i * 120), SC[9] + .4 + i * .18, .12)
fx.add(blip(700, .12), W(10, 'publicar', -.1), .3); fx.add(pop(600, 1500), W(10, 'publicar', .25), .2)
for q in range(24): fx.add(pop(900 + (q * 97) % 900, 1500 + (q * 97) % 900), W(10, 'publicar', .3) + q * .035, .025, (q % 5 - 2) * .4)
# 11 · economia
for w in ('uma obra', 'aditivo'): fx.add(pop(500, 1000), W(11, w, -.2), .16)
t0 = W(11, 'economiza', -.2); fx.add(impact()[: int(.7 * SR)], t0, .22)
for q in range(10): fx.add(tick(2200 + q * 70), t0 + q * .1, .035)
# 12 · benefícios
for w in ('menos erro', 'retrabalho', 'licitação'): fx.add(whoosh(.4), W(12, w, -.5), .12); fx.add(pop(450, 950), W(12, w, -.3), .16)
# 13 · logo
fx.add(riser(1.6), SC[12] - 1.3, .22)
for i in range(6): fx.add(whoosh(.3), SC[12] + .3 + i * .12, .08, (i % 3 - 1) * .5)
fx.add(impact(), SC[12] + 1.0, .5); fx.add(shimmer(), SC[12] + 1.2, .2)
A.finish()
