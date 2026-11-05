"""Собирает тестовую страницу героя 3/4: детали, точки суставов (rig34.json), меч и таблица ударов вида сбоку
встраиваются в HTML. python3 tools/build_34.py [out.html]  (по умолчанию src/hero/hero_34.html)"""
import json, os, sys, base64, io, re
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PD = os.path.join(ROOT, 'assets/characters/hero/parts')
def b64(path):
    im = Image.open(path).convert('RGBA'); b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
rig = json.load(open(os.path.join(PD, 'rig34.json')))
tex = {v: {n: b64(os.path.join(PD, '34' + v, n + '.png')) for n in rig[v]} for v in rig}
for v in rig:  # кулак под меч (задача 004), если уже нарезан
    p = os.path.join(PD, '34' + v, 'armN_fist.png')
    if os.path.exists(p): tex[v]['armN_fist'] = b64(p)
tex['sword'] = b64(os.path.join(PD, 'sword.png'))
side = open(os.path.join(ROOT, 'src/hero/hero_run.html'), encoding='utf-8').read()
atk = side[side.find('const CHN='):side.find('const BK=')]  # те же ключевые позы ударов, что у вида сбоку
tpl = open(os.path.join(ROOT, 'src/hero/hero_34.tpl.html'), encoding='utf-8').read()
html = tpl.replace('__RIG__', json.dumps(rig)).replace('__TEX__', json.dumps(tex)).replace('/*__ATK__*/', atk)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'src/hero/hero_34.html')
open(out, 'w', encoding='utf-8').write(html); print('built', out, round(os.path.getsize(out) / 1e6, 2), 'MB')
