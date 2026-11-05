"""Собирает тестовую страницу рига спереди/сзади: детали обрезаются по альфе и встраиваются base64 в HTML.
python3 tools/build_frontback.py [out.html]  (по умолчанию src/hero/hero_frontback.html)"""
import json, os, sys, base64, io
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PD = os.path.join(ROOT, 'assets/characters/hero/parts')
data = {}
for view in ['front', 'back']:
    rig = json.load(open(os.path.join(PD, f'rig_{view}.json')))
    files = {n: p['file'] for n, p in rig['parts'].items()}
    files.update({'cap_' + k: c['file'] for k, c in rig['caps'].items()})
    tex = {}
    for n, f in files.items():
        im = Image.open(os.path.join(PD, view, f)).convert('RGBA'); bb = im.getchannel('A').getbbox()
        if bb is None: print('empty', view, n); continue
        b = io.BytesIO(); im.crop(bb).save(b, 'PNG', optimize=True)
        tex[n] = {'x': bb[0], 'y': bb[1], 'src': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}
    data[view] = {'rig': rig, 'tex': tex}
tpl = open(os.path.join(ROOT, 'src/hero/hero_frontback.tpl.html'), encoding='utf-8').read()
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'src/hero/hero_frontback.html')
open(out, 'w', encoding='utf-8').write(tpl.replace('__RIGDATA__', json.dumps(data)))
print('built', out, round(os.path.getsize(out) / 1e6, 2), 'MB')
