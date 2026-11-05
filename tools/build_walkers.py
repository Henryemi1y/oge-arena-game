"""Собирает демо походок: walker.js + детали персонажей (уменьшены вдвое) + слои арены и эффекты встраиваются в HTML.
python3 tools/build_walkers.py [out]"""
import os, sys, json, base64, io
from PIL import Image
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
K = .5  # масштаб текстур в странице
def b64(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
def half(path, k=K):
    im = Image.open(path).convert('RGBA'); return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
DIRS = {'ghoul': 'assets/enemies/ghoul', 'knight': 'assets/enemies/knight', 'doctor': 'assets/enemies/plague-doctor', 'goatman': 'assets/enemies/goatman',
        'guardian': 'assets/bosses/stone-guardian', 'executioner': 'assets/bosses/stone-executioner'}
rigs = json.load(open(os.path.join(R, 'assets/characters_rigs.json')))
def sc(v):
    if isinstance(v, list): return [x * K for x in v]
    if isinstance(v, (int, float)): return v * K
    return v
CH = {}
BOSSK = .9  # боссы встраиваются крупнее: на экране они в ~2,5 раза выше героя
for n, d in DIRS.items():
    parts = {}; k = BOSSK if 'bosses' in d else K
    for p, info in rigs[n]['parts'].items():
        parts[p] = {kk: (vv * k if isinstance(vv, (int, float)) else ([x * k for x in vv] if isinstance(vv, list) else vv)) for kk, vv in info.items()}; im = half(os.path.join(R, d, 'parts', p + '.png'), k); parts[p]['src'] = b64(im)
        if p in ('weapon', 'flask'):  # точка хвата: центр силуэта на 82% высоты (рукоять)
            import numpy as np; a = np.array(im)[..., 3] > 20; y = int(im.height * (.82 if p == 'weapon' else .5)); xs = np.where(a[y])[0]
            parts[p]['grip'] = [float(xs.mean()) if len(xs) else im.width / 2, float(y)]
    parts['_k'] = k; CH[n] = parts
A = 'assets/environment/arena25d/'
ENV = {k: b64(half(os.path.join(R, A, k + '.png'))) for k in ['bg_far', 'bg_mid', 'floor', 'fg']}
FX = {k: b64(half(os.path.join(R, 'assets/fx', k + '.png'))) for k in ['cracks', 'dust']}
w = open(os.path.join(R, 'src/engine/walker.js'), encoding='utf-8').read()
t = open(os.path.join(R, 'src/characters/walkers.tpl.html'), encoding='utf-8').read()
html = t.replace('/*__WALKER__*/', w).replace('__CH__', json.dumps(CH)).replace('__ENV__', json.dumps(ENV)).replace('__FX__', json.dumps(FX))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, 'src/characters/walkers.html')
open(out, 'w', encoding='utf-8').write(html); print('built', out, round(os.path.getsize(out) / 1e6, 1), 'MB')
