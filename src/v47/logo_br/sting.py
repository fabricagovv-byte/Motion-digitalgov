"""Trilha curta (sting) das logos. Uso: python3 sting.py <v> <saida.wav>"""
import sys, os, wave
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit'))
from audio_lib import *
v, out = int(sys.argv[1]), sys.argv[2]
D = 6.5; B = Bus(int(SR * D))
B.add(pad([note(m) for m in (50, 57, 62, 66)], D), 0, .12)
if v == 1:
    B.add(riser(1.1), 0, .5); B.add(whoosh(.6), .05, .4); B.add(impact(), 1.08, .9); B.add(pop(500, 1100), 1.85, .35)
    B.add(whoosh(.4), 1.5, .25, .4); B.add(shimmer(), 2.3, .5); B.add(shimmer(), 3.6, .3, .5); B.add(blip(2400), 4.4, .2, -.4)
elif v == 2:
    for i in range(3): B.add(whoosh(.55), i * .12, .5, -.6 + .6 * i)
    B.add(whoosh(.45), 1.05, .4); B.add(impact(), 1.38, .9); B.add(riser(.8), .6, .3)
    B.add(pop(400, 900), 2.0, .25); B.add(shimmer(), 3.4, .55); B.add(blip(2600), 3.9, .2, .5)
else:
    for i in range(14): B.add(tick(2000 + 90 * i), .1 + i * .11, .25, (-1) ** i * .4)
    B.add(riser(1.6), .4, .45); B.add(impact(), 2.0, .8)
    for i in range(6): B.add(blip(1400 + 200 * i), 2.25 + i * .07, .18, (-1) ** i * .5)
    B.add(whoosh(.6), 2.95, .4); B.add(impact(), 3.42, .7); B.add(pop(500, 1000), 3.55, .3); B.add(shimmer(), 3.75, .5); B.add(blip(2400), 4.3, .2)
L, R = B.L, B.R; fade = np.minimum(1, (D - ta(D)) / .8); L *= fade; R *= fade
m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * .89, R / m * .89
st = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
