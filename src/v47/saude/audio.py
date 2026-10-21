"""Mixagem do filme "V4.7 · Sistema de Saúde" (efeitos nos mesmos instantes do film.html)."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit'))
from audio_lib import *

A = Ctx(); W = A.Wd; fx = A.fx; S = A.SC
music(A, chords=((57, 60, 64), (53, 57, 60), (60, 64, 67), (55, 59, 62)))
A.transitions()
# 1 · problema
fx.add(impact()[: int(.8 * SR)], .6, .25)
for q in range(18): fx.add(pop(300 + q * 20, 500 + q * 20), W(1, 'filas') - .2 + q * .06, .05, (q % 5 - 2) * .3)
for q in range(14): fx.add(whoosh(.35), W(1, 'papéis') - .2 + q * .05, .05, (q % 3 - 1) * .5)
fx.add(pop(600, 1100), W(1, 'remédio') - .3, .16); fx.add(impact()[: int(.5 * SR)], W(1, 'remédio') + .7, .25)
# 2 · plataforma
fx.add(shimmer(), W(2, 'sistema') - .1, .2)
for i in range(6): fx.add(blip(900 + i * 120), W(2, 'reúne') - .2 + i * .13, .14, (i % 3 - 1) * .5)
# 3 · celular
fx.add(whoosh(.6), S[2] + .1, .14); fx.add(typing(13, .055), S[2] + .7, .22)
tday = W(3, 'consulta') + .2
for t0 in (tday, tday + .6, tday + 1.2): fx.add(tick(2600), t0, .2)
fx.add(pop(500, 1000), tday + 1.5, .14)
tq = W(3, 'acompanha')
for q in range(5): fx.add(blip(1400 + q * 100), tq + (q + 1) * 2.8 / 6, .1)
fx.add(blip(1800), W(3, 'sem sair') - .1, .16); fx.add(blip(2200), W(3, 'sem sair'), .12)
# 4 · prontuário
fx.add(whoosh(.6), S[3] + .1, .14)
for i in range(3): fx.add(pop(600, 1100), W(4, 'prontuário') + i * .25, .1)
fx.add(tick(2400), W(4, 'exames') - .2, .18); fx.add(riser(1.0), W(4, 'exames') - .1, .05); fx.add(tick(2400), W(4, 'receitas') - .2, .18)
fx.add(pop(500, 900), W(4, 'ubs') - .2, .14); fx.add(pop(500, 900), W(4, 'hospital') - .2, .14)
# 5 · estoque
for i in range(5):
    for q in range(5): fx.add(tick(2000 + q * 90), S[4] + .9 + i * .12 + q * .12, .03)
fx.add(blip(700, .2), W(5, 'falta') - .3, .2); fx.add(blip(560, .2), W(5, 'falta') - .1, .16)
fx.add(blip(900, .2), W(5, 'validade') - .3, .18)
# 6 · painel
for w, n in (('atendimentos', 12), ('filas', 10)):
    for q in range(n): fx.add(tick(2200 + q * 70), W(6, w) - .3 + q * .09, .035)
for q in range(8): fx.add(pop(400 + q * 40, 700 + q * 40), W(6, 'mapa') - .3 + q * .07, .06)
# 7 · IA
for q in range(8): fx.add(pop(450, 800), S[6] + .3 + q * .06, .05)
for q in range(4): fx.add(blip(520, .25), W(7, 'vila nova') - .3 + q * 1.2, .14)
fx.add(riser(2.0), W(7, 'tendências'), .07); fx.add(typing(24, .05), W(7, 'exemplo'), .2)
# 8 · sugere e aprova
for i in range(3): fx.add(whoosh(.35), W(8, 'sugere') - .1 + i * .18, .1)
fx.add(tick(2800), W(8, 'mutirão') + .2, .22)
tap = W(8, 'gestor') - .6; fx.add(tick(2600), tap, .22); fx.add(shimmer(), tap + .3, .18); fx.add(pop(600, 1300), tap + .45, .14)
# 9 · telessaúde
fx.add(whoosh(.6), S[8] + .1, .14); fx.add(blip(1100), W(9, 'paciente') - .2, .14); fx.add(blip(1500), W(9, 'paciente'), .12)
fx.add(typing(30, .05), W(9, 'vídeo'), .18); fx.add(pop(600, 1100), W(9, 'registradas') - .2, .16)
# 10 · integração
fx.add(pop(400, 800), S[9] + .4, .16)
for w in ('conecta', 'saúde', 'município', 'já usa'): fx.add(blip(1200), W(10, w) - .2, .12); fx.add(whoosh(.3), W(10, w) - .25, .06)
fx.add(impact()[: int(.4 * SR)], W(10, 'segurança') - .3, .2)
for i in range(3): fx.add(tick(2400), W(10, 'lgpd') - .2 + i * .3, .14)
# 11 · cenário
for w in ('1.000', '15%'):
    t0 = W(11, w) - .3; fx.add(pop(500, 1000), t0, .14)
    for q in range(8): fx.add(tick(2300 + q * 80), t0 + q * .09, .03)
fx.add(pop(450, 900), W(11, '15%') + .6, .14); fx.add(riser(1.2), W(11, 'lembrete'), .06)
t0 = W(11, 'são 75') - .3; fx.add(impact()[: int(.7 * SR)], t0, .3); fx.add(shimmer(), t0 + .1, .14)
# 12 · fechamento
for w in ('fila', 'desperdício', 'cuidado'): fx.add(impact()[: int(.5 * SR)], W(12, w) - .4, .2); fx.add(pop(600, 1200), W(12, w) - .4, .12)
# 13 · logo
F = S[12]; fx.add(riser(1.6), F - 1.6, .25)
for i in range(6): fx.add(whoosh(.3), F + .2 + i * .12, .06, (i % 3 - 1) * .5)
fx.add(impact(), F + .7, .5); fx.add(shimmer(), F + 1.2, .2); fx.add(pop(800, 1600), F + 1.2, .12)
A.finish()
