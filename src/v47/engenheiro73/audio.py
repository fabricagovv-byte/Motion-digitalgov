"""Mixagem do filme "V4.7 · Engenheiro 7.3": trilha do kit + efeitos sincronizados com as cenas."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); fx = A.fx; W = A.Wd; SC = A.SC
music(A, chords=((57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)))
A.transitions()
# 1: problema
fx.add(riser(2.0), 0.2, .06)
for w in ("projeto incompleto", "orçamento furado", "atraso", "aditivo"):
    t0 = W(1, w) - .3; fx.add(pop(300, 200), t0, .2); fx.add(impact()[: int(.35 * SR)], t0, .12)
# 2: apresentação
fx.add(impact(), W(2, "engenheiro") - .1, .35); fx.add(shimmer(), W(2, "engenheiro") + .3, .14)
for w in ("inteligência", "equipe"): fx.add(pop(500, 1000), W(2, w) - .2, .16)
for i in range(7): fx.add(blip(900 + i * 120), W(2, "equipe") + .6 + i * .12, .12, (i - 3) * .12)
# 3–7: etapas (avanço da pipeline em cada cena)
for k in (3, 4, 5, 6, 7, 13):
    fx.add(blip(1400), SC[k - 1] + .5, .14); fx.add(blip(1800), SC[k - 1] + .62, .1)
fx.add(typing(14, .05), W(3, "diz") - .3, .25); fx.add(pop(700, 1200), W(3, "seis") + .3, .12)
fx.add(whoosh(.8), W(3, "escola") - .4, .1)
for w in ("terreno", "demanda", "custo", "prazo"): fx.add(pop(500, 1000), W(4, w) - .3, .15)
fx.add(shimmer(), W(4, "prazo") + .7, .12)
for i in range(5): fx.add(whoosh(.4), SC[4] + .4 + i * .35, .05, (i % 2 - .5))
for i in range(5): fx.add(tick(2600 + i * 80), W(5, "plantas") - .2 + i * .3, .05)
fx.add(pop(600, 1200), W(5, "conferidos") - .2, .16)
for i in range(7): fx.add(tick(2200 + i * 60), W(6, "item") - .2 + i * .32, .05)
for q in range(26): fx.add(tick(3000 + (q % 4) * 90), W(6, "item") + q * .1, .02)
fx.add(pop(500, 1000), W(6, "tabelas") - .3, .14)
for i in range(4): fx.add(whoosh(.35), W(7, "documentos") + i * .25, .1, (i - 1.5) * .3); fx.add(pop(700, 1300), W(7, "documentos") + i * .25 + .5, .1)
fx.add(impact()[: int(.8 * SR)], W(7, "certas") + .2, .35)
# 8–10: execução
fx.add(lowpass(rng.standard_normal(int(.12 * SR)), 6000) * np.exp(-ta(.12) * 30), W(8, "fotos") - .1, .4)   # obturador
for i in range(5): fx.add(pop(600, 1100), W(8, "digital") - .3 + i * .45, .1)
for i in range(6): fx.add(pop(220, 160), SC[7] + .6 + i * .8, .1)
fx.add(riser(1.6), W(9, "previsto") - .4, .06); fx.add(riser(1.6), W(9, "realizado") - .3, .06)
for w in ("previsto", "realizado", "todos"): fx.add(pop(500, 1000), W(9, w) - .2, .13)
for i in range(3): fx.add(blip(1500), SC[9] + .3 + i * .18, .18)
fx.add(pop(300, 220), W(10, "atrasa") - .3, .2); fx.add(pop(300, 220), W(10, "custo") - .2, .2); fx.add(shimmer(), W(10, "antes") - .1, .14)
# 11–12: economia
for w in ("cada", "r$ 50", "economiza"): fx.add(pop(500, 1000), W(11, w) - .3, .15)
fx.add(impact()[: int(.6 * SR)], W(11, "economiza") - .2, .25)
for w in ("10%", "r$ 1,2", "poupa"): fx.add(pop(500, 1000), W(12, w) - .3, .15)
for q in range(14): fx.add(tick(2400 + q * 60), W(12, "r$ 120") + .4 + q * .08, .03)
fx.add(impact()[: int(.7 * SR)], W(12, "r$ 120") + 1.6, .25)
# 13: entrega
fx.add(whoosh(.5), W(13, "entrega") + .4, .2); fx.add(shimmer(), W(13, "entrega") + .5, .18)
for w in ("cidadão", "órgãos", "controle"): fx.add(pop(500, 1000), W(13, w) - .2, .13)
# 14: responsabilidade
fx.add(impact()[: int(.5 * SR)], W(14, "a ia") - .1, .2); fx.add(impact()[: int(.6 * SR)], W(14, "quem assina") - .1, .25)
fx.add(whoosh(1.4), W(14, "assina") + .2, .06)
# 15: logo
F = A.F
fx.add(riser(1.8), F - 1.6, .25); fx.add(impact(), F + .3, .5)
for i in range(6): fx.add(whoosh(.3), F + .3 + i * .12, .06, (i - 2.5) * .3)
fx.add(shimmer(), F + 1.3, .22)
A.finish()
