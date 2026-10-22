"""Áudio do reel de Obras v2: música 128 bpm + voz real do pedido + efeitos (drone, medidas, documentos)."""
import sys, os, wave; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
C = [0, 2.6, 4.6, 6.6, 9.8, 11.8, 13.8, 15.8, 17.4, 19.0, 21.4, 23.0, 25.2]; DUR = C[12]
B = '../../../build/v47_obras_reel'
class A: pass
A.DUR = DUR; A.N = int(SR * DUR); A.SC = C[:12]; A.F = C[11]; A.mus = Bus(A.N)
music(A, chords=((50, 53, 57), (46, 50, 53), (48, 52, 55), (45, 48, 52)), beat=60 / 128, drums_from=C[1], gain=.7, end_gain=.75)
fx = Bus(A.N); vox = Bus(A.N)
# drone: zumbido dos motores
t = ta(C[1] + .3); hum = (np.sin(2 * np.pi * 180 * t) + .5 * np.sin(2 * np.pi * 362 * t) + .3 * np.sin(2 * np.pi * 541 * t)) * (1 + .15 * np.sin(2 * np.pi * 7 * t))
hum = lowpass(hum, 2500) * np.minimum(1, t / .4) * np.minimum(1, (C[1] + .3 - t) / .5) * .18; fx.add(hum, 0, 1.0)
for q in range(14): fx.add(blip(3200, .03), .3 + q * .17, .12, (q % 3 - 1) * .5)                          # disparos de foto
for c in C[1:12]: fx.add(whoosh(.4), c - .3, .16); fx.add(impact()[: int(.3 * SR)], c, .16)
for i, t0 in enumerate((.2, .3, .4, .5, .8, 1.1, 1.4)): fx.add(pop(600 + i * 60, 1200 + i * 60), C[1] + t0, .12)        # medidas no mapa
for i in range(6): fx.add(tick(2600), C[2] + .35 + i * .18, .12)                                     # linhas da aba Medidas
# voz real do pedido
with wave.open(f'{B}/pedido.wav') as w: sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(float) / 32768
if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) / SR, np.arange(len(x)) / sr, x)
vox.add(x, C[3] + .45, 1.0)
for t0 in (1.4, 2.1, 2.7, 3.2, 3.4, 3.6): fx.add(pop(700, 1400), C[3] + t0, .12)
fx.add(blip(1300, .08), C[3] + 3.7, .2)
for q in range(30): fx.add(tick(1800 + (q * 97) % 900), C[4] + .1 + q * .05, .04, (q % 3 - 1) * .5)
for i in range(18): fx.add(pop(380 + i * 30, 800 + i * 30), C[5] + .25 + i * .06, .07, (i % 3 - 1) * .5)
for i in range(6): fx.add(pop(500 + i * 80, 1000 + i * 80), C[6] + i * .1 + .1, .15)
for q in range(14): fx.add(tick(2200 + q * 70), C[7] + .1 + q * .07, .05)
for i in range(3): fx.add(whoosh(.35), C[8] + i * .14, .14, (i - 1) * .5)
fx.add(impact()[: int(.5 * SR)], C[8] + 1.0, .3)
for i in range(6): fx.add(whoosh(.3), C[9] + i * .14, .1, (i % 3 - 1) * .4)
for q in range(20): fx.add(tick(2000 + q * 60), C[9] + .9 + q * .05, .04)
fx.add(shimmer(), C[9] + 1.9, .25)
fx.add(blip(1500, .05), C[10] + .78, .4); fx.add(riser(.6), C[10] + .85, .2); fx.add(impact(), C[10] + .9, .35)
fx.add(riser(1.0), C[11] - 1.0, .2); fx.add(shimmer(), C[11] + .1, .35); fx.add(impact()[: int(.8 * SR)], C[11], .3)
# abaixa a música sob a voz
env = np.abs(vox.L); win = int(.25 * SR); env = np.convolve(env, np.ones(win) / win, mode='same'); duck = np.where(env > .004, 10 ** (-12 / 20), 1.0)
duck = np.convolve(duck, np.ones(int(.3 * SR)) / int(.3 * SR), mode='same'); A.mus.L *= duck; A.mus.R *= duck
st = lambda b: np.stack([b.L, b.R], 1)
mix = st(A.mus) * .85 + st(fx) + st(vox) * 1.1
fo = int(1.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix /= np.max(np.abs(mix)) * 1.1
with wave.open(f'{B}/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
