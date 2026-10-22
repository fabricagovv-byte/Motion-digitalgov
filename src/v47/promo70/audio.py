"""Áudio da promo em tipografia animada: batida rápida (143 bpm) + efeitos em cada letra."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
A = Ctx(); fx = A.fx; Wd = A.Wd
A.SC = [(0 if i == 0 else l["start"] - .3) for i, l in enumerate(A.lines)]; A.F = A.SC[-1]; SC = A.SC
music(A, chords=((50, 53, 57), (46, 50, 53), (48, 52, 55), (45, 48, 52)), beat=.42, drums_from=0.6, gain=.65, end_gain=.9)
ROWS = {  # (fala, palavra-âncora, efeito, nº de letras)
 1: [('faça', 'assemble', 10), ('sistema', 'assemble', 7)], 2: [('seu', 'slide', 13), ('operacional', 'decode', 11)],
 3: [('o seu', 'drop', 5), ('software', 'decode', 8)], 4: [('do seu', 'slide', 6), ('jeito', 'drop', 5)], 5: [('com a', 'assemble', 5)],
 6: [('quem', 'slide', 12), ('até o dia', 'assemble', 12), ('70%', 'pop', 7)], 7: [('setenta', 'pop', 3), ('só até', 'decode', 15)],
 8: [('chame', 'slide', 8), ('whatsapp', 'assemble', 8), ('(31)', 'decode', 15)], 9: [('o seu', 'assemble', 14), ('começa', 'assemble', 11)]}
for k, rows in ROWS.items():
    for w, f, n in rows:
        t0 = Wd(k, w) - .25
        if f == 'assemble':
            fx.add(whoosh(.5), t0, .12, .3)
            for i in range(n): fx.add(tick(2200 + (i * 173) % 900), t0 + i * .028 + .45, .05, (i % 3 - 1) * .5)
        elif f == 'decode':
            for i in range(n * 3): fx.add(blip(1500 + (i * 97) % 1400, .04), t0 + i * .016, .035, (i % 3 - 1) * .4)
            fx.add(pop(600, 1300), t0 + .22 + n * .045, .12)
        elif f == 'slide':
            fx.add(whoosh(.45), t0 - .1, .18, -.5 if k % 2 else .5)
        elif f == 'drop':
            for i in range(n): fx.add(pop(260, 140), t0 + i * .045 + .12, .12, (i % 3 - 1) * .4)
        elif f == 'pop':
            fx.add(impact()[: int(.6 * SR)], t0, .3)
            for i in range(n): fx.add(pop(500 + i * 80, 1100 + i * 80), t0 + i * .06, .1)
for s in SC[1:]: fx.add(whoosh(.4), s - .25, .14, .2); fx.add(clap() * .5, s, .12)          # cortes com faixa dourada
fx.add(riser(1.2), Wd(5, 'v4') - 1.3, .12); fx.add(impact(), Wd(5, 'v4') - .2, .5); fx.add(shimmer(), Wd(5, 'v4') + .2, .2)
fx.add(blip(880, .12), Wd(6, 'atenção') - .2, .25); fx.add(blip(880, .12), Wd(6, 'atenção') + .05, .25)
fx.add(riser(1.4), Wd(6, '70%') - 1.6, .16)
fx.add(riser(1.0), SC[8] - 1.0, .2); fx.add(impact(), SC[8] + .25, .55); fx.add(shimmer(), SC[8] + .6, .22)
fx.add(pop(700, 1500), Wd(9, 'começa') + .6, .16)
A.finish(duck_db=-9, music_gain=.85)
