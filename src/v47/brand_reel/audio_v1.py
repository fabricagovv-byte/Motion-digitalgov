"""Música do reel de marca V4.7: eletrônica 128 bpm, cortes na batida, sem narração."""
import sys, os, wave; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
B = 60 / 128; CUT = [b * B for b in (0, 4, 8, 14, 22, 26, 32, 34, 41, 46)]; DUR = CUT[-1] + .6
class A: pass
A.DUR = DUR; A.N = int(SR * DUR); A.SC = CUT[:-1]; A.F = CUT[8]; A.mus = Bus(A.N)
music(A, chords=((45, 48, 52), (41, 45, 48), (43, 47, 50), (40, 43, 47)), beat=B, drums_from=CUT[1], gain=.75, end_gain=.9)
fx = Bus(A.N)
fx.add(riser(1.6), .2, .25); fx.add(shimmer(), .9, .25)                                     # esfera
for i, c in enumerate(CUT[1:-1], 2):
    fx.add(whoosh(.45), c - .38, .22, (i % 2) * .6 - .3); fx.add(impact()[: int(.35 * SR)], c, .22)
for q in range(5): fx.add(tick(2400), CUT[2] + .3 + q * .05, .08)                            # vetor: pontos
for q in range(30): fx.add(tick(1800 + (q * 97) % 900), CUT[2] + .3 + q * .02, .03, (q % 3 - 1) * .5)
fx.add(blip(1200, .08), CUT[2] + 1.4, .2); fx.add(blip(1500, .08), CUT[2] + 2.2, .2)        # clique e arrasto do cursor
fx.add(pop(900, 300), CUT[3] + 2 * B, .25); fx.add(pop(400, 1200), CUT[3] + 4 * B, .25)        # logo vira ponto, ponto vira padrão
for q in range(16): fx.add(pop(800 + q * 40, 1400 + q * 40), CUT[3] + 4 * B + q * .03, .05, (q % 3 - 1) * .6)
fx.add(whoosh(1.0), CUT[3] + 6.5 * B, .3)                                                    # bolha líquida
fx.add(shimmer(), CUT[4] + .2, .3); fx.add(riser(1.2), CUT[5] - 1.2, .15)
for i in range(5): fx.add(pop(500 + i * 90, 1000 + i * 90), CUT[5] + i * .12 + .1, .16)      # cartões da paleta
fx.add(whoosh(.8), CUT[6] - .1, .4)                                                          # zoom com desfoque
fx.add(typing(18, .05), CUT[7] + .2, .2)                                                    # site
fx.add(riser(1.4), CUT[8] - 1.4, .25); fx.add(impact(), CUT[8], .5); fx.add(shimmer(), CUT[8] + .5, .3)
st = lambda b: np.stack([b.L, b.R], 1)
mix = st(A.mus) * .85 + st(fx)
fo = int(1.4 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) * 1.1
os.makedirs('../../../build/v47_brand_reel', exist_ok=True)
with wave.open('../../../build/v47_brand_reel/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', round(DUR, 2))
