# Cria um documento antigo simulado, degrada e depois restaura com processamento de imagem real (OpenCV).
import numpy as np, cv2, textwrap
from PIL import Image, ImageDraw, ImageFont
rng=np.random.default_rng(7)
W,H=1240,1700
F='/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'
FB='/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
img=Image.new('L',(W,H),255); d=ImageDraw.Draw(img)
d.text((W//2,140),'ACTA DA SESSÃO ORDINÁRIA',font=ImageFont.truetype(FB,46),fill=20,anchor='mm')
d.text((W//2,200),'Camara Municipal — 12 de março de 1923',font=ImageFont.truetype(F,34),fill=30,anchor='mm')
body=("Aos doze dias do mez de março do anno de mil novecentos e vinte e tres, nesta cidade, "
"no edificio da Camara Municipal, presentes os senhores vereadores abaixo assignados, foi aberta a sessão "
"pelo senhor Presidente. Lida e approvada a acta da sessão anterior, passou-se ao expediente. "
"Foi apresentado o projecto para a construcção da ponte sobre o ribeirão, ligando o districto "
"á séde do municipio, sendo o mesmo approvado por unanimidade. Em seguida tratou-se da "
"conservação das estradas municipaes e do abastecimento de agua da cidade, ficando resolvido "
"que o Agente Executivo apresentasse o orçamento na proxima sessão. Nada mais havendo a tratar, "
"o senhor Presidente encerrou a sessão, e eu, secretario, lavrei a presente acta que vae "
"assignada por todos os presentes.")
f=ImageFont.truetype(F,33); y=300
for ln in textwrap.wrap(body,58):
    d.text((120,y),ln,font=f,fill=25); y+=58
y+=60
for nm in ['O Presidente  ____________________','O Secretario  ____________________','Vereador  ____________________']:
    d.text((120,y),nm,font=f,fill=30); y+=70
clean=np.array(img).astype(np.float32)/255

# --- degradação: tinta desbotada, papel amarelado, manchas de umidade, pontos, dobra, ruído
ink=1-clean
yy,xx=np.mgrid[0:H,0:W]
fade=0.35+0.45*cv2.GaussianBlur(rng.random((H,W)).astype(np.float32),(0,0),120)*2
fade=np.clip(fade,0.25,0.9)
ink=ink*fade
ink=cv2.GaussianBlur(ink,(0,0),1.1)
paper=0.86-0.10*cv2.GaussianBlur(rng.random((H,W)).astype(np.float32),(0,0),60)
vign=((xx-W/2)**2/(W*0.62)**2+(yy-H/2)**2/(H*0.62)**2); paper-=0.18*np.clip(vign,0,1.2)
stain=np.zeros((H,W),np.float32)
for cx,cy,r in [(930,520,230),(260,1250,300),(1000,1450,170),(420,380,120)]:
    dist=np.sqrt((xx-cx)**2+(yy-cy)**2)
    stain+=0.30*np.exp(-((dist-r)/38)**2)+0.12*(dist<r)
for _ in range(220):
    cx,cy=rng.integers(0,W),rng.integers(0,H); r=rng.uniform(3,14)
    stain+=0.45*np.exp(-((xx-cx)**2+(yy-cy)**2)/(2*r*r))
stain=cv2.GaussianBlur(stain,(0,0),2)
fold=0.08*np.exp(-((yy-H*0.5)/6)**2)+0.05*np.exp(-((xx-W*0.52)/5)**2)
paper=np.clip(paper-fold,0.3,1)
noise=rng.normal(0,0.03,(H,W)).astype(np.float32)
inkk=1-ink*0.85
# manchas marrons: escurecem forte o azul/verde e pouco o vermelho (como mofo/umidade real)
B=np.clip(paper*0.62*(1-stain*1.05)*inkk+noise,0,1)
G=np.clip(paper*0.86*(1-stain*0.80)*inkk+noise,0,1)
Rr=np.clip(paper*1.00*(1-stain*0.30)*inkk+noise,0,1)
antes=(np.stack([B,G,Rr],-1)*255).astype(np.uint8)
M=cv2.getRotationMatrix2D((W/2,H/2),1.6,1.0)
antes=cv2.warpAffine(antes,M,(W,H),borderValue=(70,95,120))
cv2.imwrite('antes.png',antes)

# --- restauração (processamento real sobre a imagem degradada)
g=antes[...,2].copy()   # canal vermelho: onde a mancha marrom quase some e a tinta continua escura
# endireitar: estima o ângulo pelas linhas de texto
th=cv2.adaptiveThreshold(g,255,cv2.ADAPTIVE_THRESH_MEAN_C,cv2.THRESH_BINARY_INV,41,15)
best=(0,-1)
for a in np.arange(-3,3.01,0.1):
    R=cv2.getRotationMatrix2D((W/2,H/2),a,1.0); t=cv2.warpAffine(th,R,(W,H))
    s=np.var(t.sum(1)); best=max(best,(s,a)) if s>best[0] else best
R=cv2.getRotationMatrix2D((W/2,H/2),best[1],1.0)
g=cv2.warpAffine(g,R,(W,H),borderValue=255)
g=cv2.fastNlMeansDenoising(g,None,12,7,21)
bg=cv2.morphologyEx(g,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25)))
bg=cv2.GaussianBlur(bg,(0,0),3)
norm=cv2.divide(g,bg,scale=255)                   # remove manchas e amarelado
norm=cv2.normalize(norm,None,0,255,cv2.NORM_MINMAX)
lut=np.clip((np.arange(256)-120)*255/(225-120),0,255).astype(np.uint8)  # reforça a tinta, papel limpo
out=cv2.LUT(norm,lut)
out=cv2.addWeighted(out,1.5,cv2.GaussianBlur(out,(0,0),1.2),-0.5,0)
out=np.where(out>232,255,out).astype(np.uint8)
# borda preta da rotação → branco
mask=cv2.warpAffine(np.full((H,W),255,np.uint8),R@np.vstack([M,[0,0,1]]),(W,H))
out[mask<128]=255
out=out[30:H-30,30:W-30]; out=cv2.resize(out,(W,H),interpolation=cv2.INTER_AREA)
cv2.imwrite('depois.png',out)

# --- quadro lado a lado
def card(im,label,col):
    im=cv2.cvtColor(im,cv2.COLOR_GRAY2BGR) if im.ndim==2 else im
    im=cv2.resize(im,(620,850),interpolation=cv2.INTER_AREA)
    pil=Image.fromarray(cv2.cvtColor(im,cv2.COLOR_BGR2RGB))
    c=Image.new('RGB',(660,960),'#ffffff'); c.paste(pil,(20,90))
    dd=ImageDraw.Draw(c); dd.rounded_rectangle([20,20,250,72],12,fill=col)
    dd.text((135,46),label,font=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',30),fill='white',anchor='mm')
    return c
A=card(antes,'ANTES','#C0392B'); B=card(out,'DEPOIS','#0E7CB8')
S=Image.new('RGB',(1380,960),'#EAF0F8'); S.paste(A,(20,0)); S.paste(B,(700,0))
dd=ImageDraw.Draw(S); dd.polygon([(682,450),(698,480),(682,510)],fill='#263050')
S.save('antes_depois.png')
print('ok, ângulo corrigido',round(best[1],1))
