"""Нарезает листы деталей врагов и боссов (задачи 005–010) и измеряет суставы по альфе.
Выход: <папка персонажа>/parts/<деталь>.png и rig.json (суставы в координатах детали), плюс превью с точками суставов.
python3 tools/slice_chars.py"""
import json, os, re
import numpy as np, cv2
from PIL import Image, ImageDraw
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = {  # персонаж: (лист, файл задачи)
 'ghoul': ('assets/enemies/ghoul/ghoul_side_parts_v1.png', '005-ghoul'),
 'knight': ('assets/enemies/knight/knight_side_parts_v2.png', '006-knight'),
 'doctor': ('assets/enemies/plague-doctor/doctor_side_parts_v1.png', '007-plague-doctor'),
 'goatman': ('assets/enemies/goatman/goatman_side_parts_v1.png', '008-goatman'),
 'guardian': ('assets/bosses/stone-guardian/guardian_side_parts_v2.png', '009-boss-stone-guardian'),
 'executioner': ('assets/bosses/stone-executioner/executioner_side_parts_v1.png', '010-boss-stone-executioner'),
}
NAMES = {'Голова': 'head', 'Торс': 'torso', 'Ближняя рука': 'armN', 'Дальняя рука': 'armF', 'Ближняя нога': 'legN', 'Дальняя нога': 'legF',
 'Набедренная ткань с поясом': 'cloth', 'Передняя пола': 'clothF', 'Задняя пола': 'clothB', 'Меч': 'weapon', 'Топор': 'weapon',
 'Цельные нижние полы пальто': 'cloth', 'Склянка': 'flask', 'Культя ближнего плеча': 'stumpShN', 'Культя дальнего плеча': 'stumpShF',
 'Культя ближнего бедра': 'stumpHipN', 'Культя дальнего бедра': 'stumpHipF'}

def tables(md):
    out, cur = [], None
    for line in md.splitlines():
        m = re.match(r'\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|', line)
        if m and m.group(1) in NAMES:
            if cur is None: cur = {}; out.append(cur)
            cur[NAMES[m.group(1)]] = tuple(int(m.group(i)) for i in range(2, 6))
        elif not line.startswith('|'): cur = None
    return out

def iou(a, b):
    ax, ay, aw, ah = a; bx, by, bw, bh = b; x0, y0, x1, y1 = max(ax, bx), max(ay, by), min(ax + aw, bx + bw), min(ay + ah, by + bh)
    i = max(0, x1 - x0) * max(0, y1 - y0); return i / (aw * ah + bw * bh - i + 1e-9)

def limb_joints(a, kind):
    """a — альфа вертикальной конечности (корень сверху). Корень — центр скругления сверху; сустав и лодыжка/запястье — по долям длины,
    по центру силуэта на этой высоте."""
    ys = np.where(a.any(1))[0]; top, bot = ys[0], ys[-1]; h = bot - top
    cx = lambda y: float(np.mean(np.where(a[int(y)])[0])) if a[int(y)].any() else a.shape[1] / 2
    wid = lambda y: int(a[int(y)].sum())
    r = wid(top + h * .06) / 2; root = [cx(top + r * .9), top + r * .9]
    if kind == 'leg':
        kn = top + h * .47; an = bot - h * .085
        return {'root': root, 'joint': [cx(kn), kn], 'end': [cx(an), an], 'sole': float(bot), 'r': wid(kn) / 2}
    el = top + h * .43; wr = top + h * .74
    return {'root': root, 'joint': [cx(el), el], 'end': [cx(wr), wr], 'hand': [cx(top + h * .86), top + h * .86], 'r': wid(el) / 2}

def main():
    allrig = {}
    for name, (sheet, task) in CH.items():
        im = np.array(Image.open(os.path.join(R, sheet)).convert('RGBA')); a = im[..., 3] > 20
        n, lab, st, _ = cv2.connectedComponentsWithStats(a.astype(np.uint8), 8)
        comps = [(i, tuple(int(v) for v in st[i, :4])) for i in range(1, n) if st[i, 4] > 800]
        md = open(os.path.join(R, 'codex/tasks', task + '.md'), encoding='utf-8').read(); tbs = tables(md)
        best = max(tbs, key=lambda t: sum(max((iou(bb, c[1]) for c in comps), default=0) for bb in t.values()))
        out = os.path.join(os.path.dirname(os.path.join(R, sheet)), 'parts'); os.makedirs(out, exist_ok=True)
        rig = {'parts': {}}
        for part, bb in best.items():
            ids = [i for i, cb in comps if iou(bb, cb) > .05 or (cb[0] >= bb[0] - 20 and cb[1] >= bb[1] - 20 and cb[0] + cb[2] <= bb[0] + bb[2] + 20 and cb[1] + cb[3] <= bb[1] + bb[3] + 20)]
            if not ids: print('  !! нет компоненты', name, part); continue
            m = np.isin(lab, ids); ys, xs = np.where(m); x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
            p = im[y0:y1, x0:x1].copy(); p[~m[y0:y1, x0:x1]] = 0
            Image.fromarray(p).save(os.path.join(out, part + '.png'))
            pa = p[..., 3] > 20; info = {'w': int(x1 - x0), 'h': int(y1 - y0)}
            if part.startswith('leg'): info.update(limb_joints(pa, 'leg'))
            elif part.startswith('arm'): info.update(limb_joints(pa, 'arm'))
            elif part == 'torso':
                ys2 = np.where(pa.any(1))[0]; t0, t1 = ys2[0], ys2[-1]; hh = t1 - t0; c = lambda y: float(np.mean(np.where(pa[int(y)])[0]))
                info.update({'neck': [c(t0 + hh * .03), t0 + hh * .03], 'sh': [c(t0 + hh * .17), t0 + hh * .17], 'hip': [c(t1 - hh * .12), t1 - hh * .12]})
            elif part == 'head':
                ys2 = np.where(pa.any(1))[0]; t1 = ys2[-1]; xs2 = np.where(pa[t1 - 8])[0]
                info.update({'neck': [float(np.mean(xs2)), float(t1 - 10)]})
            else:
                ys2 = np.where(pa.any(1))[0]; t0 = ys2[0]; xs2 = np.where(pa[t0 + 6])[0]
                info.update({'top': [float(np.mean(xs2)), float(t0 + 6)]})
            rig['parts'][part] = info
        allrig[name] = rig; json.dump(rig, open(os.path.join(out, 'rig.json'), 'w'), ensure_ascii=False, indent=1)
        # превью с суставами
        prev = Image.new('RGBA', (sum(v['w'] + 30 for v in rig['parts'].values()), max(v['h'] for v in rig['parts'].values()) + 10), (40, 44, 58, 255)); x = 0; d = ImageDraw.Draw(prev)
        for part, v in rig['parts'].items():
            pi = Image.open(os.path.join(out, part + '.png')); prev.alpha_composite(pi, (x, 0))
            for k in ['root', 'joint', 'end', 'hand', 'neck', 'sh', 'hip', 'top']:
                if k in v: px, py = v[k]; d.ellipse([x + px - 7, py - 7, x + px + 7, py + 7], fill=(255, 216, 74, 255))
            x += v['w'] + 30
        prev.convert('RGB').save(os.path.join(out, '_joints_preview.png'))
        print(name, {k: (v['w'], v['h']) for k, v in rig['parts'].items()})
    json.dump(allrig, open(os.path.join(R, 'assets/characters_rigs.json'), 'w'), ensure_ascii=False)

if __name__ == '__main__': main()
