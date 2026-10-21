"""Mixagem do filme V4.7 · Aprendizagem Digital (trilha leve + efeitos sincronizados com o film.html)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); W = A.Wd; fx = A.fx; SC = A.SC
music(A, chords=((60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)))   # C - Am - F - G, clima leve
A.transitions(skip=())
# 1: turma, alunos ficando para trás
for q in range(30): fx.add(blip(900 + (q % 6) * 120, .06), 1.0 + q * .03, .03, (q % 6 - 2.5) * .25)
for q in range(4): fx.add(pop(420, 260), W(1, 'fica para trás') - .3 + q * .08, .14)
fx.add(pop(500, 1000), W(1, 'nem sempre') - .2, .14)
# 2: celular, sinal caindo, modo offline
fx.add(whoosh(.7), SC[1] + .2, .14, .4)
for q in range(3): fx.add(blip(1400 - q * 300, .1), W(2, 'internet fraca') - .2 + q * .7, .1)
fx.add(pop(600, 1200), W(2, 'sem conexão') - .1, .18); fx.add(shimmer(), W(2, 'sem conexão'), .08)
# 3: trilha
for i in range(7): fx.add(pop(500 + i * 90, 900 + i * 90), SC[2] + .4 + i * .38, .1)
fx.add(pop(700, 1400), W(3, 'nível') - .3, .14); fx.add(pop(600, 1100), W(3, 'bncc') - .3, .14)
# 4: erro, explicação, exercícios novos
fx.add(pop(300, 180), W(4, 'errou') - .1, .2)
fx.add(typing(28, .055), W(4, 'outro jeito') - .1, .1)
for i in range(4): fx.add(pop(600 + i * 100, 1000 + i * 100), W(4, 'exemplo') - .2 + i * .35, .1)
fx.add(shimmer(), W(4, 'novos exercícios') - .3, .14); fx.add(pop(700, 1400), W(4, 'novos exercícios') - .3, .14)
# 5: medalhas e sequência
for w in ('metas', 'medalhas', 'sequências'): fx.add(impact()[: int(.4 * SR)], W(5, w) - .3, .14); fx.add(pop(800, 1600), W(5, w) - .3, .12)
for q in range(12): fx.add(tick(2000 + q * 90), W(5, 'sequências') - .2 + q * .13, .04)
fx.add(riser(1.3), W(5, 'leve') - .3, .07)
# 6: heatmap
for q in range(48): fx.add(tick(2600 + (q % 6) * 120), SC[5] + .8 + q * .025, .02, (q % 6 - 2.5) * .2)
fx.add(pop(400, 800), W(6, 'dificuldade') - .2, .16); fx.add(pop(500, 1000), W(6, 'qual habilidade') + .3, .14)
# 7: grupo de reforço
for i in range(4): fx.add(whoosh(.35), W(7, 'monta') - .2 + i * .18, .07, .3)
fx.add(blip(1600, .07), W(7, 'grupo certo') + .1, .2); fx.add(pop(700, 1400), W(7, 'grupo certo') + .3, .16)
fx.add(pop(500, 1000), W(7, 'a ia apoia') - .2, .14)
# 8: secretaria
for i in range(5): fx.add(riser(.8), W(8, 'por escola') - .9 + i * .15, .025)
for q in range(14): fx.add(tick(2200 + q * 60), SC[7] + 1.2 + q * .11, .03)
fx.add(pop(400, 900), W(8, 'tempo real'), .14)
# 9: notificação da família
fx.add(blip(1320, .09), W(9, 'recebem') - .2, .2); fx.add(blip(1760, .12), W(9, 'recebem') - .08, .18)
for i in range(3): fx.add(pop(600, 1100), W(9, 'relatórios') + i * .3, .1)
# 10: cursos e certificado
for i in range(4): fx.add(riser(1.1), SC[9] + .8 + i * .2, .03)
fx.add(impact()[: int(.6 * SR)], W(10, 'capacitação') + .8, .22); fx.add(shimmer(), W(10, 'capacitação') + .9, .12)
# 11: conta ilustrativa
for w in ('5 mil', '20 folhas', '100 mil'):
    t0 = W(11, w) - .3; fx.add(pop(500, 1100), t0, .16)
    for q in range(9): fx.add(tick(2300 + q * 80), t0 + q * .1, .03)
for q in range(18): fx.add(whoosh(.25), W(11, '20 folhas') - .1 + q * .05, .015, (q % 5 - 2) * .4)
fx.add(impact()[: int(.8 * SR)], W(11, '100 mil') - .3, .26)
# 12: segurança
fx.add(riser(1.0), SC[11] - .2, .06); fx.add(impact()[: int(.6 * SR)], SC[11] + .5, .2)
for w in ('lgpd', 'segurança', 'dados', 'proteção'): fx.add(pop(600, 1200), W(12, w) - .3, .12)
# 13: logo
F = A.F
fx.add(riser(1.6), F - 1.4, .22); fx.add(impact(), F + .35, .45); fx.add(shimmer(), F + 1.2, .2)
for q in range(14): fx.add(pop(500 + q * 50, 1000 + q * 50), F + .3 + q * .09, .03, (q % 3 - 1) * .5)
A.finish()
