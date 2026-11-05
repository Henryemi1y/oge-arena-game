"""Собирает риг 3/4 в позу покоя из деталей и кладёт рядом с якорем для сверки."""
import json, sys
from PIL import Image
R=json.load(open('assets/characters/hero/parts/rig34.json'))
ANC={'front':'hero_34front_rigpose_v2.png','back':'hero_34back_rigpose_v1.png'}
def comp(v,arm_ang=(0,0),leg_ang=(0,0)):
    r=R[v];P={n:Image.open(f'assets/characters/hero/parts/34{v}/{n}.png').convert('RGBA') for n in r};W,H=1024,1536
    out=Image.new('RGBA',(W,H));T=(400,330)  # торс в кадре
    at=lambda p:(T[0]+p[0],T[1]+p[1])
    def put(n,piv,dst,ang=0):
        im=P[n];big=Image.new('RGBA',(W,H));big.paste(im,(int(dst[0]-piv[0]),int(dst[1]-piv[1])),im)
        out.alpha_composite(big.rotate(ang,resample=Image.NEAREST,center=tuple(dst)))
    t=r['torso'];near_first=False
    # порядок: дальняя рука, дальняя нога, плащ, ближняя нога, торс, голова, ближняя рука (для лицом к камере)
    if v=='front':
        put('armF',r['armF']['sh'],at(t['shF']),arm_ang[1]);put('cape',r['cape']['top'],at(t['capeTop']))
        put('legF',r['legF']['hip'],at(t['hipF']),leg_ang[1]);put('legN',r['legN']['hip'],at(t['hipN']),leg_ang[0])
        put('torso',(0,0),T);put('head',r['head']['neck'],at(t['neck']));put('armN',r['armN']['sh'],at(t['shN']),arm_ang[0])
    else:
        put('armF',r['armF']['sh'],at(t['shF']),arm_ang[1]);put('legF',r['legF']['hip'],at(t['hipF']),leg_ang[1]);put('legN',r['legN']['hip'],at(t['hipN']),leg_ang[0])
        put('torso',(0,0),T);put('head',r['head']['neck'],at(t['neck']));put('cape',r['cape']['top'],at(t['capeTop']));put('armN',r['armN']['sh'],at(t['shN']),arm_ang[0])
    return out
ims=[]
for v in ['front','back']:
    a=Image.open('assets/characters/hero/sheets/'+ANC[v]).convert('RGBA');c=comp(v,(-12,12) if v=='front' else (12,-12))
    for im in (a,c):
        bg=Image.new('RGBA',im.size,(40,44,58,255));bg.alpha_composite(im);ims.append(bg.convert('RGB').resize((400,600)))
S=Image.new('RGB',(1600,600));[S.paste(im,(i*400,0)) for i,im in enumerate(ims)];S.save(sys.argv[1] if len(sys.argv)>1 else '/home/claude/c34.png')
