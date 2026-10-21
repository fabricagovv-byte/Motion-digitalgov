"""Áudio do filme V4.7 · Sistema de Pesquisa: trilha + efeitos sincronizados com film.html."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); W = A.Wd; S = A.SC; fx = A.fx
music(A, chords=((57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)))
A.transitions()
# 1 · problema
for i in range(14): fx.add(whoosh(.35), .2 + i * .12, .03, (i % 5 - 2) * .4); fx.add(pop(220, 150), .75 + i * .12, .05)
fx.add(impact()[: int(.7 * SR)], W(1, 'demora') - .1, .25)
for q in range(6): fx.add(tick(1800 + q * 120), W(1, 'semanas') - .2 + q * .2, .05)
fx.add(impact()[: int(.5 * SR)], W(1, 'velha') - .05, .28); fx.add(pop(300, 200), W(1, 'velha') - .05, .15)
# 2 · IA monta o questionário
fx.add(typing(40, .05), W(2, 'descreve') - .4, .25, .2)
tc = W(2, 'monta') - .5
fx.add(blip(1500), tc, .2); fx.add(riser(1.2), tc, .06)
for i in range(4): fx.add(pop(600 + i * 80, 1100 + i * 80), tc + .4 + i * .45, .15, .3)
for i in range(3): fx.add(blip(2000 + i * 200), tc + 2.2 + i * .15, .08)
# 3 · tipos
for w in ('fechadas', 'escalas', 'espaço'): fx.add(pop(450, 950), W(3, w) - .4, .16)
fx.add(blip(1300), W(3, 'fechadas') + .5, .12)
for i in range(4): fx.add(tick(2200 + i * 200), W(3, 'escalas') + .2 + (i + 1) * .18, .08)
fx.add(typing(30, .042), W(3, 'próprias') - .6, .2, .25)
# 4 · coleta offline
fx.add(blip(1200), W(4, 'coletam') + .3, .12)
for i in range(9): fx.add(blip(1600 + i * 60, .06), W(4, 'coletam') + .3 + i * .22, .05, .3)
fx.add(pop(500, 1200), W(4, 'bairro') - .8, .18); fx.add(shimmer(), W(4, 'bairro') - .6, .06)
for i in range(12): fx.add(tick(2600), W(4, 'internet') + i * .25, .04)
# 5 · sincroniza
tv = W(5, 'volta') - .1
fx.add(blip(900), tv, .15); fx.add(blip(1400), tv + .1, .15); fx.add(whoosh(1.0), tv, .14, -.3); fx.add(whoosh(1.0), tv + .5, .12, .3)
for i in range(16): fx.add(tick(2400 + (i % 4) * 150), W(5, 'painel') - .3 + i * .13, .035, .2)
# 6 · mapa de calor
th = W(6, 'mapa') - .2
for i in range(12): fx.add(pop(400 + i * 40, 700 + i * 40), th + i * .1, .07, (i % 3 - 1) * .5)
fx.add(pop(500, 1000), W(6, 'satisfação cai') - .2, .18)
# 7 · filtros
for w in ('idade', 'região', 'tema'): fx.add(blip(1700), W(7, w) - .1, .18); fx.add(whoosh(.5), W(7, w), .08)
# 8 · IA lê
fx.add(pop(300, 700), W(8, 'lê') - .5, .15)
for i in range(6): fx.add(whoosh(.6), W(8, 'lê') + i * .35, .06, .3)
for i in range(3): fx.add(pop(600, 1200), W(8, 'agrupa') - .2 + i * .3, .16, .3)
fx.add(typing(46, .036), W(8, 'resume') - .2, .2, .3)
# 9 · prioridades
for i in range(3): fx.add(pop(500, 1000), W(9, 'prioridades') - .4 + i * .25, .14, -.3)
tc = W(9, 'gestão') + .1
fx.add(blip(1500), tc, .2); fx.add(impact()[: int(.5 * SR)], tc + .35, .25)
# 10 · relatório
for i in range(3): fx.add(whoosh(.5), W(10, 'relatório') - .3 + i * .15, .1, (i - 1) * .5)
fx.add(pop(600, 1300), W(10, 'comparação') + .5, .16)
# 11 · cenário ilustrativo
for w, o in (('mil', -.2), ('5 minutos', -.2), ('somam', 0), ('80 horas', -.2)): fx.add(impact()[: int(.4 * SR)], W(11, w) + o, .2); fx.add(pop(600, 1300), W(11, w) + o, .1)
fx.add(riser(1.0), W(11, '80 horas') - .8, .06)
fx.add(shimmer(), W(11, 'tabulados') - .6, .12)
# 12 · segurança
ta = W(12, 'anonimizadas') - .1
fx.add(whoosh(.6), ta, .12)
for i in range(3): fx.add(tick(1500), ta + .4 + i * .2, .1)
fx.add(pop(400, 900), W(12, 'dados') - .3, .18)
for i in range(3): fx.add(blip(1800 + i * 150), W(12, 'dados') + i * .2, .08)
# 13 · logo
F = S[-1]
fx.add(riser(1.6), F - 1.4, .2); fx.add(impact(), F + .3, .45); fx.add(shimmer(), F + 1.2, .18)
for i in range(6): fx.add(pop(500 + i * 90, 1000 + i * 90), F + .2 + i * .12, .06)
A.finish()
