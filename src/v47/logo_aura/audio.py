"""Trilha da logo aura: drone que cresce, brilhos, sopro invertido e impacto suave na revelação."""
import sys, os, wave; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit')); from audio_lib import *
import numpy as np
DUR = 10.0; n = int(SR * DUR); mus = Bus(n); fx = Bus(n)
mus.add(pad([note(m) for m in (45, 52, 57, 64)], 10.0), 0, 1.1)                  # drone grave
mus.add(pad([note(m) for m in (69, 76, 81)], 7.2), 2.8, .55, .2)                     # camada aberta após a revelação
mus.add(pad([note(m) for m in (64, 71, 76)], 7.0), 3.0, .4, -.2)
t = ta(3.0); sw = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / 3) ** 2) / SR) * (t / 3) ** 2 * .25
fx.add(lowpass(sw, 3000), .1, .5)                                                    # subida
fx.add(riser(2.6), .5, .35); fx.add(whoosh(1.2)[::-1].copy(), 1.9, .3)
fx.add(impact(), 3.0, .55); fx.add(kick(1.0), 3.0, .5)
for i, m in enumerate((81, 86, 88, 93, 95, 100)): fx.add(np.sin(2 * np.pi * note(m) * ta(2.2)) * np.exp(-ta(2.2) * 2.5) * .25, 3.05 + i * .09, .5, (i % 3 - 1) * .6)
fx.add(shimmer(), 4.6, .45)                                                          # reflexo
for i in range(20): fx.add(np.sin(2 * np.pi * note(84 + (i * 5) % 17) * ta(.6)) * np.exp(-ta(.6) * 8) * .2, 5.2 + i * .05, .3, (i % 5 - 2) * .4)
fx.add(shimmer(), 6.3, .3)
for q in range(30): fx.add(np.sin(2 * np.pi * (2000 + (q * 337) % 3000) * ta(.12)) * np.exp(-ta(.12) * 40) * .1, .3 + q * .09, .2, (q % 5 - 2) * .5)   # brilhos das partículas
st = lambda b: np.stack([b.L, b.R], 1)
mix = st(mus) * .9 + st(fx)
fo = int(1.2 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5; fi = int(.3 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
mix /= np.max(np.abs(mix)) * 1.12
os.makedirs('../../../build/v47_logo_aura', exist_ok=True)
with wave.open('../../../build/v47_logo_aura/mix_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
