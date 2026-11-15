import sys
from PIL import Image
d=sys.argv[1]
ims=[Image.open(f'{d}/{i:02d}.png').resize((432,540)) for i in range(1,11)]
s=Image.new('RGB',(432*5+60,540*2+30),'#777')
for i,im in enumerate(ims): s.paste(im,(10+(i%5)*442,10+(i//5)*550))
s.save(f'{d}/previa.png')
