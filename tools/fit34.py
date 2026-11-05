"""Находит положение каждой детали листа 3/4 на якоре (сдвиг, поворот, масштаб) масочным сопоставлением."""
import numpy as np, cv2, json, sys
from PIL import Image
ANC={'front':'hero_34front_rigpose_v2.png','back':'hero_34back_rigpose_v1.png'}
def load(p):return np.array(Image.open(p).convert('RGBA')).astype(np.float32)
def rot_part(p,ang,sc):
    h,w=p.shape[:2];c=(w/2,h/2);M=cv2.getRotationMatrix2D(c,ang,sc)
    cos,sin=abs(M[0,0]),abs(M[0,1]);nw,nh=int(h*sin+w*cos)+2,int(h*cos+w*sin)+2
    M[0,2]+=nw/2-c[0];M[1,2]+=nh/2-c[1]
    return cv2.warpAffine(p,M,(nw,nh),flags=cv2.INTER_NEAREST),M
res={}
for v,af in ANC.items():
    A=load(f'assets/characters/hero/sheets/{af}');k=.5;As=cv2.resize(A,None,fx=k,fy=k,interpolation=cv2.INTER_AREA)
    res[v]={}
    for name in ['head','torso','cape','armN','armF','legN','legF']:
        P=load(f'assets/characters/hero/parts/34{v}/{name}.png');best=None
        angs=range(-36,37,3) if name.startswith(('arm','leg')) else range(-9,10,3)
        for ang in angs:
            for sc in [.9,.95,1.0,1.05,1.1]:
                R,M=rot_part(P,ang,sc*k);m=(R[...,3]>0).astype(np.float32)
                if m.sum()<50 or R.shape[0]>=As.shape[0] or R.shape[1]>=As.shape[1]:continue
                mm=np.repeat(m[...,None],3,2)
                r=cv2.matchTemplate(As[...,:3],R[...,:3],cv2.TM_SQDIFF,mask=mm)/m.sum()
                mn,_,loc,_=cv2.minMaxLoc(r)
                if best is None or mn<best[0]:best=(mn,ang,sc,loc)
        mn,ang,sc,loc=best;res[v][name]={'err':round(float(mn),1),'ang':ang,'sc':sc,'xy':[loc[0]/k,loc[1]/k]}
        print(v,name,res[v][name])
json.dump(res,open('assets/characters/hero/parts/fit34_coarse.json','w'),indent=1)
