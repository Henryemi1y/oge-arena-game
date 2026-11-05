"""Сборка игры «Арена осколков» в один самодостаточный HTML.

python3 tools/build_game.py [out.html]

1. Ассеты: листы Codex режутся по альфе (связные компоненты), уменьшаются и кодируются в WebP (data URI).
   Суставы врагов и боссов — из assets/characters_rigs.json (нарезка tools/slice_chars.py), герой — src/hero/hero_side4.json.
   Душа: части листа 011 сопоставляются с собранной фигурой (matchTemplate) — так получаются точки крепления.
2. Код: модули src/game/js/*.js склеиваются в порядке MODULES и вставляются в src/game/index.tpl.html.
Выход по умолчанию: src/game/index.html (+ ассеты кэшируются в src/game/.assets_cache.json, чтобы не пересчитывать).
"""
import os, sys, io, json, base64, hashlib
import numpy as np, cv2
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = os.path.join(R, 'src/game')
MODULES = ['core', 'audio', 'assets', 'problems', 'world', 'fx', 'rig', 'hero', 'enemies', 'boss', 'soul', 'companion', 'ui', 'critic', 'main']
Q = 90


def uri(im, q=Q):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()


def rs(im, k):
    return im if k == 1 else im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)


def comps(im, min_area=400, thr=20):
    a = (np.array(im)[..., 3] > thr).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(a, 8)
    out = [(i, tuple(int(v) for v in st[i, :4])) for i in range(1, n) if st[i, 4] > min_area]
    return lab, out


def crop_comp(im, lab, ids):
    m = np.isin(lab, ids); ys, xs = np.where(m); x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    p = np.array(im)[y0:y1, x0:x1].copy(); p[~m[y0:y1, x0:x1]] = 0
    return Image.fromarray(p), (int(x0), int(y0), int(x1 - x0), int(y1 - y0))


def merge_near(cs, gap):
    """Объединяет компоненты, прямоугольники которых ближе gap пикселей (мелкие отколы, языки пламени)."""
    groups = [[c] for c in cs]
    def bb(g):
        x0 = min(c[1][0] for c in g); y0 = min(c[1][1] for c in g); x1 = max(c[1][0] + c[1][2] for c in g); y1 = max(c[1][1] + c[1][3] for c in g)
        return x0, y0, x1, y1
    ch = True
    while ch:
        ch = False
        for i in range(len(groups)):
            for j in range(i + 1, len(groups)):
                a, b = bb(groups[i]), bb(groups[j])
                if a[0] - gap < b[2] and b[0] - gap < a[2] and a[1] - gap < b[3] and b[1] - gap < a[3]:
                    groups[i] += groups[j]; del groups[j]; ch = True; break
            if ch: break
    return [([c[0] for c in g], bb(g)) for g in groups]


def sheet_parts(path, gap, min_area=400):
    im = Image.open(path).convert('RGBA'); lab, cs = comps(im, min_area)
    gs = merge_near(cs, gap); gs.sort(key=lambda g: (g[1][0]))
    return im, lab, gs


def build_assets():
    A = {}
    # ---------- окружение ----------
    E = 'assets/environment/arena25d/'
    for k in ['bg_far', 'bg_mid', 'floor', 'fg']:
        im = Image.open(os.path.join(R, E, k + '.png')).convert('RGBA'); A[k] = {'src': uri(im, 88), 'w': im.width, 'h': im.height}
    for k in ['gate_left', 'gate_right']:
        im = rs(Image.open(os.path.join(R, E, k + '.png')).convert('RGBA'), .5); A[k] = {'src': uri(im), 'w': im.width, 'h': im.height, 'k': .5}
    # реквизит: компоненты листа, имена — по положению (таблица в задаче 012 перепутала подписи у нижнего ряда)
    im, lab, gs = sheet_parts(os.path.join(R, E, 'props.png'), 30, 1500)
    names = {}
    for ids, (x0, y0, x1, y1) in gs:
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        if cy < 800:
            n = 'monolith' if cx < 650 else 'brazier' if cx < 1200 else 'flame'
        else:
            n = 'column' if cx < 500 else 'rubble' if cx < 1000 else 'bust' if cx < 1650 else 'chain'
        p, box = crop_comp(im, lab, ids); k = .5
        names[n] = {'src': uri(rs(p, k)), 'w': round(p.width * k), 'h': round(p.height * k), 'k': k, 'box': box}
    A['props'] = names
    # панель монолита: внутренний тёмный прямоугольник (ищем по яркости в центре)
    mono = np.array(Image.open(os.path.join(R, E, 'props.png')).convert('RGBA'))
    bx = names['monolith']['box']; sub = mono[bx[1]:bx[1] + bx[3], bx[0]:bx[0] + bx[2]]
    lum = sub[..., :3].mean(2); cy0 = bx[3] // 2; cx0 = bx[2] // 2
    row = lum[cy0]; col = lum[:, cx0]; dark = lum[cy0, cx0]
    l = cx0
    while l > 0 and abs(row[l] - dark) < 18: l -= 1
    r = cx0
    while r < bx[2] - 1 and abs(row[r] - dark) < 18: r += 1
    t = cy0
    while t > 0 and abs(col[t] - dark) < 18: t -= 1
    b = cy0
    while b < bx[3] - 1 and abs(col[b] - dark) < 18: b += 1
    names['monolith']['panel'] = [l + 1, t + 1, r - l - 1, b - t - 1]  # в пикселях исходника детали
    # ---------- эффекты ----------
    im, lab, gs = sheet_parts(os.path.join(R, 'assets/fx/shards.png'), 4, 800)
    sh = []
    for ids, _ in gs:
        p, box = crop_comp(im, lab, ids); p = rs(p, .5); sh.append({'src': uri(p), 'w': p.width, 'h': p.height})
    A['shards'] = sh
    im, lab, gs = sheet_parts(os.path.join(R, 'assets/fx/cracks.png'), 40, 30)
    A['cracks'] = []
    for ids, _ in gs:
        p, box = crop_comp(im, lab, ids); A['cracks'].append({'src': uri(p), 'w': p.width, 'h': p.height})
    im = Image.open(os.path.join(R, 'assets/fx/dust.png')).convert('RGBA'); A['dust'] = {'src': uri(rs(im, .5)), 'w': im.width // 2, 'h': im.height // 2, 'n': 6}
    # ---------- спутник-глаз ----------
    im, lab, gs = sheet_parts(os.path.join(R, 'assets/characters/companion-eye/eye_parts_v1.png'), 20, 200)
    en = ['eye', 'ring', 'flame', 'chip']; A['eye'] = {}
    for n, (ids, _) in zip(en, gs):
        p, box = crop_comp(im, lab, ids); A['eye'][n] = {'src': uri(p), 'w': p.width, 'h': p.height}
    # ---------- душа ----------
    A['soul'] = soul_parts()
    # ---------- враги и боссы ----------
    rigs = json.load(open(os.path.join(R, 'assets/characters_rigs.json')))
    DIRS = {'ghoul': 'assets/enemies/ghoul', 'knight': 'assets/enemies/knight', 'doctor': 'assets/enemies/plague-doctor', 'goatman': 'assets/enemies/goatman',
            'guardian': 'assets/bosses/stone-guardian', 'executioner': 'assets/bosses/stone-executioner'}
    A['ch'] = {}
    for n, d in DIRS.items():
        k = .5 if 'bosses' in d else .42; parts = {}
        for p, info in rigs[n]['parts'].items():
            im = Image.open(os.path.join(R, d, 'parts', p + '.png')).convert('RGBA'); im2 = rs(im, k)
            q = {kk: (vv * k if isinstance(vv, (int, float)) else ([x * k for x in vv] if isinstance(vv, list) else vv)) for kk, vv in info.items()}
            q['w'], q['h'] = im2.width, im2.height; q['src'] = uri(im2)
            if p in ('weapon', 'flask'):
                a = np.array(im2)[..., 3] > 20; y = int(im2.height * (.82 if p == 'weapon' else .5)); xs = np.where(a[y])[0]
                q['grip'] = [float(xs.mean()) if len(xs) else im2.width / 2, float(y)]
                if p == 'weapon':  # конец оружия (остриё/лезвие) — самая дальняя от хвата точка силуэта по вертикали
                    ys = np.where(a.any(1))[0]; top = ys[0]; xt = np.where(a[top + 3])[0]
                    q['tip'] = [float(xt.mean()), float(top)]
                    if n == 'executioner':  # лезвие топора: самая правая точка силуэта в верхней трети
                        sub = a[: im2.height // 3]; cols = np.where(sub.any(0))[0]; xr = cols[-1]; yr = np.where(sub[:, xr])[0]
                        q['blade'] = [float(xr - 6), float(yr.mean())]
            parts[p] = q
        parts['_k'] = k; A['ch'][n] = parts
    # ---------- герой: перекодировать PNG → WebP (координаты J не меняются) ----------
    H = json.load(open(os.path.join(R, 'src/hero/hero_side4.json')))
    for k, s in H['img'].items():
        im = Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA'); H['img'][k] = uri(im, 92)
    A['hero'] = H
    return A


def soul_parts():
    path = os.path.join(R, 'assets/characters/soul/soul_side_parts_v1.png')
    im, lab, gs = sheet_parts(path, 25, 3000)
    T = {'torso': (45, 80, 363, 828), 'head': (492, 80, 252, 250), 'armN': (495, 440, 134, 560), 'armF': (719, 440, 121, 530), 'tail': (960, 575, 295, 865), 'full': (1445, 75, 477, 1371)}
    def best(bb):
        def iou(a, b):
            ax, ay, aw, ah = a; x0, y0, x1, y1 = b; bw, bh = x1 - x0, y1 - y0
            i = max(0, min(ax + aw, x1) - max(ax, x0)) * max(0, min(ay + ah, y1) - max(ay, y0)); return i / (aw * ah + bw * bh - i + 1e-9)
        return max(gs, key=lambda g: iou(bb, g[1]))
    P = {}
    for n, bb in T.items():
        ids, _ = best(bb); p, box = crop_comp(im, lab, ids); P[n] = (p, box)
    # Части на листе нарисованы не пиксель-в-пиксель с собранной фигурой (matchTemplate промахивается),
    # поэтому точки крепления сняты вручную по сетке (в пикселях деталей при k=.45) и сверены с собранной фигурой.
    k = .45
    RIG = {'torso': {'neck': [92, 45], 'shN': [118, 78], 'shF': [86, 80], 'waist': [108, 163], 'cap': [122, 62, 36]},
           'head': {'neck': [70, 100]}, 'armN': {'root': [30, 12]}, 'armF': {'root': [27, 12]}, 'tail': {'top': [60, 8]}}
    out = {}
    for n in ['torso', 'head', 'armN', 'armF', 'tail', 'full']:
        p = P[n][0]; out[n] = {'src': uri(rs(p, k)), 'w': round(p.width * k), 'h': round(p.height * k), **RIG.get(n, {})}
    out['_k'] = k
    return out


def main():
    cache = os.path.join(G, '.assets_cache.json')
    src_files = []
    for root, _, fs in os.walk(os.path.join(R, 'assets')):
        for f in fs:
            if f.endswith(('.png', '.json')): src_files.append(os.path.join(root, f))
    src_files += [os.path.join(R, 'src/hero/hero_side4.json'), __file__]
    h = hashlib.md5()
    for f in sorted(src_files): h.update(f.encode()); h.update(str(os.path.getmtime(f)).encode())
    key = h.hexdigest()
    A = None
    if os.path.exists(cache):
        c = json.load(open(cache))
        if c.get('key') == key: A = c['A']
    if A is None:
        A = build_assets(); json.dump({'key': key, 'A': A}, open(cache, 'w'))
    js = []
    for m in MODULES:
        js.append(f'// ===== {m}.js =====\n' + open(os.path.join(G, 'js', m + '.js'), encoding='utf-8').read())
    js.insert(0, '// ===== walker.js (src/engine) =====\n' + open(os.path.join(R, 'src/engine/walker.js'), encoding='utf-8').read())
    tpl = open(os.path.join(G, 'index.tpl.html'), encoding='utf-8').read()
    html = tpl.replace('/*__ASSETS__*/', 'const ASSETS=' + json.dumps(A, separators=(',', ':')) + ';').replace('/*__CODE__*/', '\n'.join(js))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(G, 'index.html')
    open(out, 'w', encoding='utf-8').write(html)
    print('built', out, round(os.path.getsize(out) / 1e6, 2), 'MB')


if __name__ == '__main__':
    main()
