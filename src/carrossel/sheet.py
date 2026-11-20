import sys, glob
from PIL import Image
d=sys.argv[1]
fs=sorted(f for f in glob.glob(f'{d}/[0-9][0-9].png'))
cols=6 if len(fs)>10 else 5; rows=-(-len(fs)//cols)
s=Image.new('RGB',(432*cols+10*(cols+1),540*rows+10*(rows+1)),'#777')
for i,f in enumerate(fs): s.paste(Image.open(f).resize((432,540)),(10+(i%cols)*442,10+(i//cols)*550))
s.save(f'{d}/previa.png')
