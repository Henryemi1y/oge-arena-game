"""Каменный страж на деталях v2 (задача 017): детали по швам кладки с шаровыми шарнирами.

Из листа деталей и цветовой карты собирает части в формате rig.js: голова, туловище (грудь + таз), руки и ноги,
у которых детали заданы готовыми кусками (верх / низ / стопа) на общем холсте конечности — программа больше не режет
конечность сама. Точки поворота — центры шаров на концах деталей: ищутся по силуэту (шар уже тела детали), для плеча и
предплечья, где шар заслонён наплечником или кулаком, заданы вручную. Масштаб подогнан так, чтобы длина ноги была
прежней (походка и удары босса настроены под неё).

    python3 tools/guardian_v2.py [--debug out.png]   → вызывается из build_game.py (функция build)
"""
import os
import sys
import numpy as np
from PIL import Image, ImageDraw

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(R, 'assets/bosses/stone-guardian')
# цвета деталей на карте (из «Результата» задачи 017)
MAP = {'head': 0xFF4030, 'chest': 0x25BF54, 'pelvis': 0x396FFF, 'uaN': 0xFDBB24, 'uaF': 0xCF42EF, 'faN': 0x27C5CA, 'faF': 0xFF80AA,
       'thN': 0x9182ED, 'thF': 0xB5D143, 'shN': 0xA96A36, 'shF': 0xFF7633, 'ftN': 0x427884, 'ftF': 0xEFF1ED}


# плечевой шар закрыт наплечником: точка на оси «локоть — браслет», продолженной под наплечник (по сетке листа)
SHOULDER = {'uaN': [172, 122], 'uaF': [142, 92]}


def parts():
    im = np.array(Image.open(os.path.join(D, 'guardian_side_parts_v2.png')).convert('RGBA'))
    mp = np.array(Image.open(os.path.join(D, 'guardian_side_parts_v2_map.png')).convert('RGBA'))
    out = {}
    for n, c in MAP.items():
        col = np.array([(c >> 16) & 255, (c >> 8) & 255, c & 255])
        m = (np.abs(mp[..., :3].astype(int) - col).sum(2) < 40) & (mp[..., 3] > 128)
        ys, xs = np.where(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        p = im[y0:y1, x0:x1].copy(); p[..., 3] = np.where(m[y0:y1, x0:x1], p[..., 3], 0)
        out[n] = p
    return out


def rune_mirror(a, clean=False):
    """Копия детали, где светящаяся цифра (7 на плече, 2 на голени) отражена на месте: когда страж смотрит влево,
    весь спрайт зеркалится, и цифра снова читается правильно. Под старой цифрой — заливка камнем (inpaint)."""
    import cv2
    q = a.astype(int); m = ((q[..., 2] > 150) & (q[..., 1] > 120) & (q[..., 2] - q[..., 0] > 45) & (q[..., 3] > 100)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    if n < 2: return None
    i = 1 + int(np.argmax(st[1:, 4])); mm = cv2.dilate((lab == i).astype(np.uint8), np.ones((19, 19), np.uint8))
    if clean:  # вместе с голубым ореолом вокруг цифры
        glow = ((q[..., 2] - q[..., 0] > 22) & (q[..., 2] > 110) & (q[..., 3] > 100)).astype(np.uint8)
        mm = cv2.dilate(mm | (cv2.dilate(mm, np.ones((31, 31), np.uint8)) & glow), np.ones((7, 7), np.uint8))
    ys, xs = np.where(mm); x0, x1 = xs.min(), xs.max() + 1
    rgb = np.ascontiguousarray(a[..., :3]); base = cv2.inpaint(rgb, mm * 255, 6, cv2.INPAINT_TELEA)
    out = a.copy(); out[..., :3] = base
    if clean: return out
    fl = a[:, x0:x1][:, ::-1]; fm = mm[:, x0:x1][:, ::-1] > 0
    reg = out[:, x0:x1]; reg[fm] = fl[fm]; out[:, x0:x1] = reg
    out[..., 3] = a[..., 3]
    return out


def ball(a, end='top'):
    """Центр шара на верхнем или нижнем конце детали: окружность по краям силуэта (МНК), берётся самая глубокая полоса
    строк, на которой края ещё ложатся на окружность (ниже начинается тело детали)."""
    m = a[..., 3] > 40
    rows = np.where(m.any(1))[0]
    y0 = rows[0] if end == 'top' else rows[-1]
    def pts(D):
        P = []
        for d in range(1, D):
            y = y0 + d if end == 'top' else y0 - d
            xs = np.where(m[y])[0]
            if len(xs) > 1: P += [(xs.min(), y), (xs.max() + 1, y)]
        return np.array(P, float)
    best = None
    for D in range(12, 140, 2):
        P = pts(D); x, y = P[:, 0], P[:, 1]
        A = np.c_[2 * x, 2 * y, np.ones(len(x))]; c, *_ = np.linalg.lstsq(A, x * x + y * y, rcond=None)
        cx, cy = c[0], c[1]; r = np.sqrt(c[2] + cx * cx + cy * cy)
        res = np.sqrt(np.mean((np.hypot(x - cx, y - cy) - r) ** 2))
        if res > 1.6 or (best and abs(cy - y0) > r * 1.05): break
        best = ([float(cx), float(cy)], float(r))
    return best


def build(k_out=.5, debug=None):
    P = parts()
    piv = {}
    for n in ['head', 'chest', 'pelvis', 'thN', 'thF', 'shN', 'shF', 'ftN', 'ftF', 'faN', 'faF']:
        a = P[n]; piv[n] = {}
        if n != 'head': piv[n]['top'], piv[n]['rt'] = ball(a, 'top')
        if n in ('head', 'chest', 'thN', 'thF', 'shN', 'shF'): piv[n]['bot'], piv[n]['rb'] = ball(a, 'bottom')
    # плечо: шар сверху закрыт наплечником, шар локтя внизу справа — по силуэту в нижней части; кисть — центр кулака
    for n in ['uaN', 'uaF']:
        a = P[n]; m = a[..., 3] > 40; h, w = m.shape
        bot, rb = ball(a, 'bottom'); piv[n] = {'bot': bot, 'rb': rb}
        piv[n]['top'] = SHOULDER[n]  # центр плечевого шара под наплечником (по оси руки)
    for n in ['faN', 'faF']:
        a = P[n]; m = a[..., 3] > 40; h, w = m.shape
        ys, xs = np.where(m[int(h * .62):]); piv[n]['hand'] = [float(xs.mean()), float(ys.mean() + h * .62)]
        top = piv[n]['top']; hd = piv[n]['hand']; piv[n]['end'] = [top[0] + (hd[0] - top[0]) * .72, top[1] + (hd[1] - top[1]) * .72]
    for n in ['ftN', 'ftF']:
        m = P[n][..., 3] > 40; piv[n]['sole'] = float(np.where(m.any(1))[0].max())
    # масштаб: длина ближней ноги (бедро + голень) — как у старого стража (rig.json, k = 1)
    import json
    old = json.load(open(os.path.join(R, 'assets/characters_rigs.json')))['guardian']['parts']['legN']
    dist = lambda a, b: float(np.hypot(a[0] - b[0], a[1] - b[1]))
    L_old = dist(old['root'], old['joint']) + dist(old['joint'], old['end'])
    L_new = dist(piv['thN']['top'], piv['thN']['bot']) + dist(piv['shN']['top'], piv['shN']['bot'])
    f = L_old / L_new
    return P, piv, f


def compose(P, piv, f, k):
    """Части в формате rig.js (координаты — в пикселях готовых картинок)."""
    s = f * k
    def img(n): a = Image.fromarray(P[n], 'RGBA'); return a.resize((max(1, round(a.width * s)), max(1, round(a.height * s))), Image.LANCZOS)
    def sc(p): return [p[0] * s, p[1] * s]
    out = {}
    # голова
    out['head'] = {'img': img('head'), 'neck': sc(piv['head']['bot'])}
    # туловище: таз под грудью, шар таза уходит под грудь
    ch, pv = img('chest'), img('pelvis')
    c_w, p_t = sc(piv['chest']['bot']), sc(piv['pelvis']['top'])
    ox = round(max(0, p_t[0] - c_w[0])); px = round(c_w[0] + ox - p_t[0]); py = round(c_w[1] - p_t[1] - 10 * s)
    W = max(ch.width + ox, px + pv.width); H = max(ch.height, py + pv.height)
    T = Image.new('RGBA', (W, H)); T.alpha_composite(pv, (px, py)); T.alpha_composite(ch, (ox, 0))
    neck = sc(piv['chest']['top']); neck = [neck[0] + ox, neck[1] + piv['chest']['rt'] * s * .6]
    out['torso'] = {'img': T, 'neck': neck, 'sh': [ox + ch.width * .52, ch.height * .3], 'hip': [px + pv.width * .5, py + pv.height * .52]}
    # конечности: общий холст, куски сдвинуты так, чтобы шары соседних деталей совпали
    def limb(upN, loN, ftN=None):
        up, lo = img(upN), img(loN); ut, ub, lt = sc(piv[upN]['top']), sc(piv[upN]['bot']), sc(piv[loN]['top'])
        pos = {upN: [0, 0], loN: [ub[0] - lt[0], ub[1] - lt[1]]}
        ims = {upN: up, loN: lo}
        if ftN:
            ft = img(ftN); lb = sc(piv[loN]['bot']); at = sc(piv[ftN]['top'])
            pos[ftN] = [pos[loN][0] + lb[0] - at[0], pos[loN][1] + lb[1] - at[1]]; ims[ftN] = ft
        mnx = min(p[0] for p in pos.values()); mny = min(p[1] for p in pos.values())
        for q in pos: pos[q] = [round(pos[q][0] - mnx + 4), round(pos[q][1] - mny + 4)]
        Wl = max(pos[q][0] + ims[q].width for q in pos) + 4; Hl = max(pos[q][1] + ims[q].height for q in pos) + 4
        pieces = {}
        for role, q in zip(['up', 'lo', 'ft'], [upN, loN, ftN]):
            if not q: continue
            c = Image.new('RGBA', (Wl, Hl)); c.alpha_composite(ims[q], tuple(pos[q])); pieces[role] = c
        full = Image.new('RGBA', (Wl, Hl))
        for role in ['ft', 'lo', 'up']:
            if role in pieces: full.alpha_composite(pieces[role])
        P0 = lambda q, p: [pos[q][0] + p[0], pos[q][1] + p[1]]
        info = {'root': P0(upN, ut), 'joint': P0(upN, ub)}
        if ftN:
            info['end'] = P0(loN, sc(piv[loN]['bot'])); info['sole'] = pos[ftN][1] + piv[ftN]['sole'] * s; info['r'] = piv[upN]['rb'] * s
        else:
            info['end'] = P0(loN, sc(piv[loN]['end'])); info['hand'] = P0(loN, sc(piv[loN]['hand'])); info['r'] = piv[upN]['rb'] * s
        return full, pieces, info
    for nm, (u, l, ft) in {'legN': ('thN', 'shN', 'ftN'), 'legF': ('thF', 'shF', 'ftF'), 'armN': ('uaN', 'faN', None), 'armF': ('uaF', 'faF', None)}.items():
        full, pieces, info = limb(u, l, ft)
        # вариант с отражённой цифрой для взгляда влево (тот же холст, та же точка)
        for role, q in [('up', u), ('lo', l)]:
            mr = rune_mirror(P[q])
            if mr is None: continue
            keep = P[q]; P[q] = mr; _, pm, _ = limb(u, l, ft); P[q] = keep
            pieces[role + 'm'] = pm[role]
        # для культи — верхняя деталь без цифры (культя не знает, куда смотрит страж)
        cu = rune_mirror(P[u], clean=True)
        if cu is not None: keep = P[u]; P[u] = cu; _, pc_, _ = limb(u, l, ft); P[u] = keep; pieces['_clean'] = pc_['up']
        out[nm] = {'img': full, 'pieces': pieces, **info}
    # культи: верх верхней детали (наплечник / верх бедра) с отколотым неровным низом; rigStump ставит верх картинки
    # туда же, где верх целой конечности, поэтому точка крепления — корень, поднятый на 95 % его высоты
    rng = np.random.default_rng(17)
    for st, nm, fr in [('stumpShN', 'armN', .5), ('stumpShF', 'armF', .5), ('stumpHipN', 'legN', .36), ('stumpHipF', 'legF', .36)]:
        L = out[nm]; up = np.array(L['pieces'].pop('_clean', None) or L['pieces']['up']); rt = L['root']; yc = int(rt[1] + (L['joint'][1] - rt[1]) * fr)
        a = up[..., 3].astype(float); h, w = a.shape; xs = np.arange(w)
        # скол: ломаная с изломами через 14–26 px (не «бахрома» по столбцам)
        kx = [0]
        while kx[-1] < w: kx.append(kx[-1] + int(rng.integers(14, 27)))
        edge = np.interp(np.arange(w), kx, yc + rng.uniform(-11, 11, len(kx)))
        yy = np.arange(h)[:, None]; a[yy >= edge[None, :]] = 0
        up[..., 3] = a.astype(np.uint8)
        # тёмный скол по краю
        m = a > 40; ys = np.where(m.any(1))[0]
        band = m & (yy >= edge[None, :] - 9); up[band, :3] = (up[band, :3] * .38).astype(np.uint8)
        ys = np.where(m.any(1))[0]; xs_ = np.where(m.any(0))[0]
        im = Image.fromarray(up[:ys.max() + 1, xs_.min():xs_.max() + 1], 'RGBA')
        out[st] = {'img': im, 'top': [rt[0] - xs_.min(), rt[1] * .05]}
    return out


if __name__ == '__main__':
    P, piv, f = build()
    print('масштаб', round(f, 3))
    for n, v in piv.items(): print(n, {kk: ([round(x) for x in vv] if isinstance(vv, list) else round(vv)) for kk, vv in v.items()})
    if '--debug' in sys.argv:
        o = compose(P, piv, f, 1)
        tiles = []
        for n in ['head', 'torso', 'armN', 'armF', 'legN', 'legF']:
            im = o[n]['img'].copy(); bg = Image.new('RGBA', im.size, (60, 60, 70, 255)); bg.alpha_composite(im); d = ImageDraw.Draw(bg)
            for kk in ['neck', 'sh', 'hip', 'root', 'joint', 'end', 'hand']:
                if kk in o[n]: x, y = o[n][kk]; d.ellipse([x - 7, y - 7, x + 7, y + 7], outline=(255, 220, 0, 255), width=3)
            if 'sole' in o[n]: d.line([(0, o[n]['sole']), (im.width, o[n]['sole'])], fill=(255, 0, 0, 255), width=2)
            tiles.append(bg)
        Wt = sum(t.width for t in tiles) + 10 * len(tiles); Ht = max(t.height for t in tiles)
        S = Image.new('RGB', (Wt, Ht), (20, 20, 20)); x = 0
        for t in tiles: S.paste(t.convert('RGB'), (x, 0)); x += t.width + 10
        S.save(sys.argv[sys.argv.index('--debug') + 1]); print('debug', S.size)
