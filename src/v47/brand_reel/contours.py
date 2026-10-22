# Extrai o contorno da logo V4.7 (PNG transparente) como polígonos com pontos de âncora, para a cena "vetor".
import cv2, json, numpy as np
im = cv2.imread('../kit/assets/nova/v47_logo_branca_transp.png', cv2.IMREAD_UNCHANGED)
a = (im[..., 3] > 110).astype(np.uint8) * 255
a = cv2.morphologyEx(a, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
cs, hier = cv2.findContours(a, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
out = []
for c in cs:
    if cv2.contourArea(c) < 600: continue
    fine = cv2.approxPolyDP(c, 1.2, True)[:, 0, :].tolist()
    anchors = cv2.approxPolyDP(c, 9, True)[:, 0, :].tolist()
    out.append({'d': fine, 'a': anchors})
json.dump({'w': im.shape[1], 'h': im.shape[0], 'shapes': out}, open('contours.json', 'w'))
print(len(out), [len(s['a']) for s in out])
