"""Áudio do filme V4.7 · Sistema Jurídico (trilha + efeitos sincronizados com film.html)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit'))
from audio_lib import *

def typing(n=12, gap=.06):   # versão local: a do kit pode estourar o buffer em textos longos
    out = np.zeros(int(SR * (n * gap * 1.3 + .2)))
    for q in range(n):
        c = lowpass(rng.standard_normal(int(SR * .03)), 4000) * np.exp(-ta(.03) * 120) * .5
        i = int(q * gap * SR * (0.8 + 0.4 * rng.random())); out[i:i + len(c)] += c
    return out


A = Ctx(); fx = A.fx; W = A.Wd; SC = A.SC
music(A, chords=((57, 60, 64), (53, 57, 60), (50, 53, 57), (52, 56, 59)))   # Am F Dm E: sóbrio, institucional
A.transitions()
# 1 · problema: papéis caindo e relógio correndo
for w in ('leis', 'decretos', 'jurisprudência', 'prazos', 'papéis', 'planilhas'):
    fx.add(whoosh(.35), W(1, w) - .35, .10, .3); fx.add(pop(260, 180), W(1, w) - .05, .14)
for q in range(34): fx.add(tick(1500 + (q % 2) * 300), W(1, 'horas') + q * .1, .035, .2)
# 2 · digitação da pergunta e envio
tq = W(2, 'servidor') - .2; send = tq + 54 / 30 + .25
fx.add(typing(54, 1 / 30), tq, .22); fx.add(blip(1500), send, .2); fx.add(pop(500, 1000), send + .05, .14)
# 3 · resposta e citação
fx.add(typing(60, 1 / 34), SC[2] + .7, .12); fx.add(pop(600, 1200), W(3, '14.133') - .3, .2); fx.add(shimmer(), W(3, '14.133') + .5, .12)
fx.add(riser(.7), W(3, 'controle prévio') - .6, .07)
# 4 · clique e destaque
fx.add(blip(1800, .06), W(4, 'clique') - .1, .25); fx.add(whoosh(.6), W(4, 'clique'), .1); fx.add(shimmer(), W(4, 'fonte') - .2, .14)
# 5 · checklist
for w in ('estudo', 'termo', 'orçamento'): fx.add(pop(700, 1300), W(5, w) - .1, .16)
fx.add(pop(300, 200), W(5, 'análise de riscos') - .1, .22); fx.add(blip(600, .15), W(5, 'análise de riscos'), .14)
# 6 · sugestão
fx.add(impact()[: int(.5 * SR)], SC[5] + .2, .18); fx.add(whoosh(.5), W(6, 'sugestão') - .3, .12); fx.add(blip(1800, .06), W(6, 'fundamenta') + .3, .25)
# 7 · prazos
for q in range(15): fx.add(tick(2400 + q * 30), W(7, 'dias úteis') + q * .05, .03, .2)
fx.add(pop(600, 1300), W(7, 'dobro') - .2, .18)
tav = W(7, 'avisa') - .2
for q in range(6): fx.add(blip(1320 if q % 2 else 1760, .12), tav + q * .14, .12)
# 8 · documento a partir do modelo
fx.add(pop(500, 1000), W(8, 'modelos') - .2, .16); fx.add(typing(60, 1 / 95), W(8, 'modelos') + .3, .1)
for i in range(3): fx.add(pop(800, 1500), W(8, 'citações') - .2 + i * .35, .14)
# 9 · base de leis e alerta
for w in ('federais', 'estaduais', 'municipais'): fx.add(whoosh(.35), W(9, w) - .45, .1); fx.add(pop(450, 900), W(9, w) - .3, .14)
fx.add(riser(.8), W(9, 'muda') - .8, .08)
for i in range(3): fx.add(blip(1500, .1), W(9, 'afetados') + .1 + i * .15, .14)
# 10 · revisão humana
for w in ('sugere', 'revisa', 'assina', 'decide'): fx.add(pop(450, 950), W(10, w) - .25, .17)
for i in range(4): fx.add(tick(2800), W(10, 'registrado') - .5 + i * .2, .06)
fx.add(pop(300, 700), W(10, 'seguro') - .3, .16)
# 11 · economia
fx.add(pop(500, 1000), W(11, '4 horas') - .3, .14); fx.add(pop(900, 1400), W(11, 'para 1') - .2, .14)
for q in range(10): fx.add(tick(2600 + q * 60), W(11, '120') - .3 + q * .1, .04)
fx.add(impact()[: int(.6 * SR)], W(11, '120') + .7, .22)
# 12 · público
for w in ('procuradorias', 'câmaras', 'secretarias'): fx.add(pop(500, 1000), W(12, w) - .3, .15)
fx.add(impact()[: int(.8 * SR)], W(12, 'segurança') - .25, .26)
# 13 · logo
F = SC[-1]
fx.add(riser(1.6), F - 1.4, .22)
for i in range(6): fx.add(whoosh(.3), F + .2 + i * .12, .07, (i % 3 - 1) * .5)
fx.add(impact(), F + .9, .45); fx.add(shimmer(), F + 1.2, .2)
A.finish()
