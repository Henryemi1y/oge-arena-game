"""Сборка рига спереди/сзади в позу (проверка нарезки): python3 tools/pose_preview.py out.png"""
import json, sys, math, os
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(ROOT,'assets/characters/hero/parts')
def render(view,ang,bg=(225,225,232,255)):
    rig=json.load(open(f'{P}/rig_{view}.json'));W,H=rig['canvas'];out=Image.new('RGBA',(W,H),bg)
    world={}
    def xf(n):
        if n in world:return world[n]
        p=rig['parts'][n];a=ang.get(n,0);px,py=p['pivot']
        if p['parent']:
            pa,(ox,oy),(qx,qy)=xf(p['parent'])  # родитель: угол, его пивот исходный, его пивот мировой
            c,s=math.cos(pa),math.sin(pa);dx,dy=px-ox,py-oy;wx,wy=qx+c*dx-s*dy,qy+s*dx+c*dy;a+=pa
        else:wx,wy=px,py
        world[n]=(a,(px,py),(wx,wy));return world[n]
    for n in rig['order']:
        a,(px,py),(wx,wy)=xf(n);im=Image.open(f"{P}/{view}/{rig['parts'][n]['file']}")
        # поворот вокруг пивота и перенос пивота в мировую точку
        r=im.rotate(-math.degrees(a),resample=Image.NEAREST,center=(px,py),translate=(wx-px,wy-py))
        out.alpha_composite(r)
    return out
poses={'rest':{},'pose':{'upperarmL':.55,'forearmL':.7,'upperarmR':-.35,'forearmR':-.9,'thighL':.18,'shinL':-.25,'thighR':-.12,'shinR':.3,'head':.08}}
ims=[render(v,a) for v in ['front','back'] for a in poses.values()]
S=Image.new('RGBA',(1024*4,1536));[S.paste(im,(i*1024,0)) for i,im in enumerate(ims)]
S.convert('RGB').resize((2048,768)).save(sys.argv[1] if len(sys.argv)>1 else 'pose.png')
