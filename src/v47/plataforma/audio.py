"""Áudio do filme geral V4.7: trilha eletrônica + efeitos nas mesmas marcas do film.html."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); fx = A.fx; Wd = A.Wd; SC = A.SC
music(A, chords=((57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)))
A.transitions()
# 1: sistemas soltos, chiados de cabo
for i in range(6): fx.add(pop(300 + i * 40, 520 + i * 40), .2 + i * .12, .14, (i % 3 - 1) * .5)
for q in range(16): fx.add(tick(900 + (q * 131) % 700), Wd(1, 'não conversam') - .4 + q * .17, .05, (q % 5 - 2) * .4)
fx.add(impact()[: int(.6 * SR)], Wd(1, 'quase') - .2, .2)
# 2: logo
fx.add(riser(1.4), SC[1] - 1.1, .2); fx.add(impact(), SC[1] + .3, .5); fx.add(shimmer(), SC[1] + 1.2, .22)
fx.add(typing(20, .05), Wd(2, 'inteligência') - .1, .25)
# 3: hub
fx.add(pop(400, 900), SC[2] + .2, .2)
for i in range(6): fx.add(blip(900 + i * 140), Wd(3, 'seis') + i * .12, .12, (i % 3 - 1) * .5)
for q in range(10): fx.add(blip(1600 + q * 60, .05), Wd(3, 'conectando') - .3 + q * .12, .05, (q % 3 - 1) * .5)
# 4-9: sistemas
W = {4: ['celular', 'mostra', 'pede'], 5: ['agenda', 'prontuário', 'alerta'], 6: ['pergunte', 'resposta', 'lei'],
     7: ['ritmo', 'tutora', 'professor'], 8: ['fotos', 'quantitativos', 'licitação'], 9: ['ideia', 'cronograma', 'custos']}
for k, ws in W.items():
    fx.add(impact()[: int(.5 * SR)], SC[k - 1] + .3, .22); fx.add(pop(600, 1300), SC[k - 1] + .3, .12)
    for w in ws: fx.add(whoosh(.35), Wd(k, w) - .5, .1, -.4); fx.add(pop(500, 1000), Wd(k, w) - .3, .14)
for q in range(4): fx.add(blip(1200 + q * 200), Wd(4, 'responde') + q * .15, .08)
fx.add(blip(700, .2), Wd(5, 'alerta') - .3, .2); fx.add(blip(700, .2), Wd(5, 'alerta') - .05, .2)
fx.add(typing(26, .045), Wd(6, 'pergunte') - .1, .3); fx.add(typing(30, .04), Wd(6, 'resposta') - .2, .18)
fx.add(blip(500, .15), Wd(7, 'aluno') + .5, .14); fx.add(shimmer(), Wd(7, 'tutora') + .8, .14); fx.add(shimmer(), Wd(7, 'professor'), .12)
sh = Wd(8, 'fotos'); fx.add(clap() * .6, sh, .3)
for q in range(10): fx.add(tick(2600 + q * 40), Wd(8, 'medidas') - .3 + q * .08, .04)
for q in range(12): fx.add(tick(2200 + q * 60), Wd(8, 'orçamento') - .3 + q * .1, .035)
fx.add(riser(1.0), Wd(9, 'cronograma') - .8, .07)
for q in range(10): fx.add(tick(2000 + q * 90), Wd(9, 'cronograma') - .4 + q * .1, .035)
# 10-13
for w in ('saúde', 'escola', 'obras'): fx.add(whoosh(.5), Wd(10, w) - .6, .14, .4); fx.add(pop(500, 1000), Wd(10, w) - .2, .14)
fx.add(impact()[: int(.6 * SR)], SC[10] + .3, .22)
for w in ('papel', 'retrabalho', 'decisões'): fx.add(pop(450, 950), Wd(11, w) - .3, .18)
fx.add(whoosh(.5), Wd(12, 'sugere') - .5, .14, -.5); fx.add(whoosh(.5), Wd(12, 'decide') - .5, .14, .5); fx.add(impact()[: int(.5 * SR)], Wd(12, 'decide') - .3, .2)
fx.add(pop(500, 1100), Wd(13, 'fale') - .1, .18)
# 14: logo final
fx.add(riser(1.6), SC[13] - 1.2, .25); fx.add(impact(), SC[13] + .4, .55); fx.add(shimmer(), SC[13] + 1.3, .22)
fx.add(typing(20, .05), Wd(14, 'inteligência') - .1, .25)
A.finish()
