"""Sting do emblema V4. Uso: python3 sting.py <saida.wav>"""
import sys, os, wave
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../kit'))
from audio_lib import *
D = 5.5; B = Bus(int(SR * D))
B.add(pad([note(m) for m in (45, 52, 57, 60, 64)], D), 0, .13)
B.add(whoosh(1.0), 0, .45, -.5); B.add(riser(1.55), 0, .4)
B.add(whoosh(.6), .7, .3, .3); B.add(pluck(note(69), .6), 1.2, .3, .5)
B.add(impact(), 1.55, 1.0); B.add(kick(1.0), 1.55, .6)
B.add(whoosh(.5), 2.0, .35, .5); B.add(shimmer(), 2.7, .45); B.add(pop(500, 1000), 2.9, .25)
B.add(shimmer(), 3.25, .35, .4); B.add(blip(2600), 3.7, .15, -.4)
L, R = B.L, B.R; f = np.minimum(1, (D - ta(D)) / .7); L *= f; R *= f
m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * .89, R / m * .89
with wave.open(sys.argv[1], 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes())
