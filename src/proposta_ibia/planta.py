# Segundo exemplo: planta antiga (formato A0) simulada, degradada e restaurada com OpenCV.
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
rng=np.random.default_rng(11)
W,H=1700,1200
F='/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
FB='/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
img=Image.new('L',(W,H),255); d=ImageDraw.Draw(img)
d.rectangle([40,40,W-40,H-40],outline=20,width=4); d.rectangle([55,55,W-55,H-55],outline=40,width=1)
# quadras e lotes
x0,y0=140,170
for qi,(qx,qy) in enumerate([(0,0),(1,0),(2,0),(0,1),(1,1),(2,1)]):
    X=x0+qx*430; Y=y0+qy*400
    d.rectangle([X,Y,X+360,Y+320],outline=25,width=3)
    for k in range(1,6): d.line([X+k*60,Y,X+k*60,Y+160],fill=35,width=2); d.line([X+k*60,Y+160,X+k*60,Y+320],fill=35,width=2)
    d.line([X,Y+160,X+360,Y+160],fill=35,width=2)
    n=1
    for r in range(2):
        for c in range(6):
            d.text((X+30+c*60,Y+80+r*160),str(n),font=ImageFont.truetype(F,22),fill=50,anchor='mm'); n+=1
    d.text((X+180,Y+160),f'QUADRA {qi+1}',font=ImageFont.truetype(FB,24),fill=20,anchor='mm')
fs=ImageFont.truetype(FB,24)
d.text((x0+180+430,y0+360),'RUA DAS FLORES',font=fs,fill=30,anchor='mm')
d.text((x0+395,y0+340),'AV.',font=fs,fill=30,anchor='mm')
d.text((x0+825,y0+340),'RUA',font=fs,fill=30,anchor='mm')
# carimbo
d.rectangle([W-520,H-230,W-70,H-70],outline=20,width=3)
d.text((W-295,H-195),'PLANTA DE LOTEAMENTO',font=ImageFont.truetype(FB,28),fill=15,anchor='mm')
d.text((W-295,H-150),'Prefeitura Municipal — 1958',font=ImageFont.truetype(F,24),fill=25,anchor='mm')
d.text((W-295,H-110),'Escala 1:1000   Folha 01/03',font=ImageFont.truetype(F,22),fill=25,anchor='mm')
# norte
d.polygon([(W-140,100),(W-160,170),(W-140,155),(W-120,170)],fill=30); d.text((W-140,80),'N',font=fs,fill=20,anchor='mm')
clean=np.array(img).astype(np.float32)/255
ink=1-clean
yy,xx=np.mgrid[0:H,0:W]
fade=np.clip(0.3+0.9*cv2.GaussianBlur(rng.random((H,W)).astype(np.float32),(0,0),110),0.25,0.9)
ink=cv2.GaussianBlur(ink*fade,(0,0),1.0)
paper=0.86-0.10*cv2.GaussianBlur(rng.random((H,W)).astype(np.float32),(0,0),60)
paper-=0.2*np.clip(((xx-W/2)**2/(W*0.6)**2+(yy-H/2)**2/(H*0.6)**2),0,1.2)
stain=np.zeros((H,W),np.float32)
for cx,cy,r in [(500,400,260),(1250,800,300),(1500,300,150)]:
    dist=np.sqrt((xx-cx)**2+(yy-cy)**2); stain+=0.30*np.exp(-((dist-r)/40)**2)+0.12*(dist<r)
for _ in range(240):
    cx,cy=rng.integers(0,W),rng.integers(0,H); r=rng.uniform(3,14)
    stain+=0.45*np.exp(-((xx-cx)**2+(yy-cy)**2)/(2*r*r))
stain=cv2.GaussianBlur(stain,(0,0),2)
fold=0.09*np.exp(-((xx-W/3)/6)**2)+0.09*np.exp(-((xx-2*W/3)/6)**2)+0.07*np.exp(-((yy-H/2)/6)**2)
paper=np.clip(paper-fold,0.3,1)
noise=rng.normal(0,0.03,(H,W)).astype(np.float32); inkk=1-ink*0.85
B=np.clip(paper*0.62*(1-stain*1.05)*inkk+noise,0,1)
G=np.clip(paper*0.86*(1-stain*0.80)*inkk+noise,0,1)
R=np.clip(paper*1.00*(1-stain*0.30)*inkk+noise,0,1)
antes=(np.stack([B,G,R],-1)*255).astype(np.uint8)
M=cv2.getRotationMatrix2D((W/2,H/2),-1.2,1.0)
antes=cv2.warpAffine(antes,M,(W,H),borderValue=(70,95,120))
cv2.imwrite('planta_antes.png',antes)
# restauração
g=antes[...,2].copy()
th=cv2.adaptiveThreshold(g,255,cv2.ADAPTIVE_THRESH_MEAN_C,cv2.THRESH_BINARY_INV,41,15)
best=(0,0)
for a in np.arange(-3,3.01,0.1):
    Rm=cv2.getRotationMatrix2D((W/2,H/2),a,1.0); t=cv2.warpAffine(th,Rm,(W,H))
    s=np.var(t.sum(1))+np.var(t.sum(0))
    if s>best[0]: best=(s,a)
Rm=cv2.getRotationMatrix2D((W/2,H/2),best[1],1.0)
g=cv2.warpAffine(g,Rm,(W,H),borderValue=255)
g=cv2.fastNlMeansDenoising(g,None,12,7,21)
bg=cv2.GaussianBlur(cv2.morphologyEx(g,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25))),(0,0),3)
norm=cv2.normalize(cv2.divide(g,bg,scale=255),None,0,255,cv2.NORM_MINMAX)
out=cv2.LUT(norm,np.clip((np.arange(256)-120)*255/(225-120),0,255).astype(np.uint8))
out=cv2.addWeighted(out,1.5,cv2.GaussianBlur(out,(0,0),1.2),-0.5,0)
out=np.where(out>232,255,out).astype(np.uint8)
mask=cv2.warpAffine(np.full((H,W),255,np.uint8),Rm@np.vstack([M,[0,0,1]]),(W,H)); out[mask<128]=255
out=cv2.resize(out[25:H-25,25:W-25],(W,H),interpolation=cv2.INTER_AREA)
# quadro vertical: antes em cima, depois embaixo
def card(im,label,col):
    im=cv2.cvtColor(im,cv2.COLOR_GRAY2BGR) if im.ndim==2 else im
    im=cv2.resize(im,(1240,875),interpolation=cv2.INTER_AREA)
    c=Image.new('RGB',(1300,960),'#ffffff'); c.paste(Image.fromarray(cv2.cvtColor(im,cv2.COLOR_BGR2RGB)),(30,70))
    dd=ImageDraw.Draw(c); dd.rounded_rectangle([30,12,260,60],12,fill=col)
    dd.text((145,36),label,font=ImageFont.truetype(FB,28),fill='white',anchor='mm'); return c
S=Image.new('RGB',(2640,960),'#EAF0F8'); S.paste(card(antes,'ANTES','#C0392B'),(10,0)); S.paste(card(out,'DEPOIS','#0E7CB8'),(1330,0))
S.convert('RGB').save('planta_antes_depois.jpg',quality=86)
print('ok',round(best[1],1))
