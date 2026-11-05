"""Нарезка вида спереди/сзади героя на детали скелета.
Каждая деталь — PNG в полный кадр 1024×1536 (без смещений, проще собирать) + обрезанный вариант с pivot в rig_*.json.
Места, закрытые конечностями, на нижних слоях дорисовываются (inpaint), чтобы при движении не было дыр.
Запуск: python3 tools/cut_front_back.py (из корня репозитория)."""
import json, os, numpy as np, cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERO = os.path.join(ROOT, 'assets/characters/hero')

# суставы (координаты кадра 1024×1536); L — левая сторона экрана
J = {
 'neck': (512, 290),
 'shL': (352, 385), 'shR': (672, 385), 'elL': (288, 562), 'elR': (736, 562), 'wrL': (246, 728), 'wrR': (778, 728), 'haL': (228, 852), 'haR': (796, 852),
 'hiL': (445, 790), 'hiR': (579, 790), 'knL': (405, 1015), 'knR': (619, 1015), 'anL': (385, 1330), 'anR': (639, 1330), 'toL': (380, 1445), 'toR': (644, 1445),
}
BACK_ARMS = {'shL': (342, 382), 'shR': (682, 382), 'elL': (300, 565), 'elR': (724, 565), 'wrL': (248, 730), 'wrR': (776, 730), 'haL': (228, 852), 'haR': (796, 852)}

TORSO = [(358, 282), (666, 282), (690, 392), (662, 560), (668, 832), (356, 832), (362, 560), (334, 392)]
HEAD = [(408, 70), (616, 70), (632, 190), (628, 300), (396, 300), (392, 190)]


def seg_dist(P, a, b):
    a = np.array(a, float); b = np.array(b, float); ab = b - a
    t = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1)
    return np.linalg.norm(P - (a + t[..., None] * ab), axis=-1)


def poly_mask(shape, pts):
    m = np.zeros(shape, np.uint8); cv2.fillPoly(m, [np.array(pts, np.int32)], 1); return m.astype(bool)


def blue_mask(rgb):
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)  # H 0..180
    h, s, v = hsv[..., 0].astype(int), hsv[..., 1] / 255, hsv[..., 2] / 255
    return (h >= 100) & (h <= 130) & (s > .35) & (v > .10)


def inpaint_rgba(rgba, hole, keep_alpha=None, r=9):
    """Заполняет hole цветом соседей; альфа тоже интерполируется (порог 0.5), если keep_alpha не задана."""
    rgb = np.ascontiguousarray(rgba[..., :3]); a = rgba[..., 3]
    h8 = hole.astype(np.uint8)
    rgb2 = cv2.inpaint(rgb, h8, r, cv2.INPAINT_TELEA)
    if keep_alpha is None:
        a2 = cv2.inpaint(a, h8, r, cv2.INPAINT_TELEA); a2 = np.where(a2 > 127, 255, 0).astype(np.uint8)
    else:
        a2 = np.where(keep_alpha, 255, 0).astype(np.uint8)
    out = rgba.copy(); out[hole, :3] = rgb2[hole]; out[hole, 3] = np.where(hole, a2, a)[hole]
    return out


def limb_masks(alpha, blue, P, j, bones, inner):
    """bones: имя -> (a, b, radius). Пиксель силуэта внутри капсулы отдаётся ближайшей кости; синий — только в узкой внутренней капсуле."""
    names = list(bones); D = np.stack([seg_dist(P, j[bones[n][0]], j[bones[n][1]]) - bones[n][2] for n in names])
    best = D.argmin(0); inside = D.min(0) <= 0
    res = {}
    for i, n in enumerate(names):
        a, b, rad = bones[n]
        m = alpha & inside & (best == i) & (~blue | (seg_dist(P, j[a], j[b]) <= inner))
        m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool) & alpha
        res[n] = m
    return res


def save(img, path):
    a = (img[..., 3] > 0).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(a, 8)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < 600: img[lab == i] = 0  # обрывки чужих деталей
    Image.fromarray(img, 'RGBA').save(path, optimize=True)


def cut(view):
    src = np.array(Image.open(os.path.join(HERO, f'sheets/hero_{view}_rigpose_v1.png')).convert('RGBA'))
    H, W = src.shape[:2]; alpha = src[..., 3] > 127; rgb = src[..., :3]; blue = blue_mask(rgb)
    yy, xx = np.mgrid[0:H, 0:W]; P = np.stack([xx, yy], -1).astype(float)
    j = dict(J); j.update(BACK_ARMS if view == 'back' else {})
    arms = limb_masks(alpha, blue, P, j, {'upperarmL': ('shL', 'elL', 62), 'forearmL': ('elL', 'haL', 50), 'upperarmR': ('shR', 'elR', 62), 'forearmR': ('elR', 'haR', 50)}, 0)
    legs = limb_masks(alpha, blue, P, j, {'thighL': ('hiL', 'knL', 64), 'shinL': ('knL', 'toL', 66), 'thighR': ('hiR', 'knR', 64), 'shinR': ('knR', 'toR', 66)}, 0)
    out = os.path.join(HERO, 'parts', view); os.makedirs(out, exist_ok=True)
    layers = []
    arm_all = np.any(list(arms.values()), 0); leg_all = np.any(list(legs.values()), 0)

    def part(name, mask, fill_hidden=None):
        img = np.zeros_like(src); img[mask] = src[mask]
        if fill_hidden is not None and fill_hidden.any():  # скрытая (перекрытая) часть кости — дорисовать цветом самой детали
            tmp = img.copy(); tmp[..., 3] = np.where(mask, 255, 0)
            filled = inpaint_rgba(tmp, fill_hidden & ~mask, keep_alpha=fill_hidden | mask, r=15)
            img = filled
        save(img, os.path.join(out, f'{name}.png')); return img

    if view == 'front':
        torso_m = poly_mask((H, W), TORSO) & alpha & ~arm_all & ~leg_all
        head_m = poly_mask((H, W), HEAD) & alpha
        cape_m = alpha & ~torso_m & ~arm_all & ~leg_all & ~head_m
        # плащ за ногами и руками дорисовываем
        hole = (arm_all | leg_all | torso_m) & ~cape_m
        cape = src.copy(); cape[~cape_m] = 0
        cape = inpaint_rgba(cape, hole & (seg_or(P, j) | torso_m), r=12)
        save(cape, os.path.join(out, 'cape.png'))
        # торс: под руками дорисовать край туники
        torso = src.copy(); torso[~torso_m] = 0
        th = poly_mask((H, W), TORSO) & (arm_all | leg_all) & ~torso_m
        torso = inpaint_rgba(torso, th, keep_alpha=torso_m | th, r=10); save(torso, os.path.join(out, 'torso.png'))
        for n in ['thighL', 'thighR', 'shinL', 'shinR']:
            a, b = {'thighL': ('hiL', 'knL'), 'thighR': ('hiR', 'knR'), 'shinL': ('knL', 'anL'), 'shinR': ('knR', 'anR')}[n]
            hid = (seg_dist(P, j[a], j[b]) <= 46) & (yy < j[b][1] + 10) if n.startswith('thigh') else None
            part(n, legs[n], hid)
        for n in arms: part(n, arms[n])
        head = src.copy(); head[~head_m] = 0; save(head, os.path.join(out, 'head.png'))
        order = ['cape', 'thighL', 'thighR', 'shinL', 'shinR', 'torso', 'upperarmL', 'forearmL', 'upperarmR', 'forearmR', 'head']
    else:
        head_m = poly_mask((H, W), HEAD) & alpha
        body_m = alpha & ~arm_all & ~leg_all
        body = src.copy(); body[~body_m] = 0
        body = inpaint_rgba(body, (arm_all) & poly_mask((H, W), [(300, 300), (724, 300), (760, 1100), (264, 1100)]), r=12)
        save(body, os.path.join(out, 'body.png'))
        for n in ['thighL', 'thighR', 'shinL', 'shinR']:
            a, b = {'thighL': ('hiL', 'knL'), 'thighR': ('hiR', 'knR'), 'shinL': ('knL', 'anL'), 'shinR': ('knR', 'anR')}[n]
            hid = (seg_dist(P, j[a], j[b]) <= 48)  # под плащом: штанина дорисовывается до бедра
            part(n, legs[n], hid)
        for n in arms: part(n, arms[n])
        head = src.copy(); head[~head_m] = 0; save(head, os.path.join(out, 'head.png'))
        order = ['thighL', 'thighR', 'shinL', 'shinR', 'body', 'upperarmL', 'forearmL', 'upperarmR', 'forearmR', 'head']
    piv = {'cape': 'neck', 'torso': 'neck', 'body': 'neck', 'head': 'neck', 'upperarmL': 'shL', 'forearmL': 'elL', 'upperarmR': 'shR', 'forearmR': 'elR',
           'thighL': 'hiL', 'shinL': 'knL', 'thighR': 'hiR', 'shinR': 'knR'}
    par = {'upperarmL': None, 'forearmL': 'upperarmL', 'upperarmR': None, 'forearmR': 'upperarmR', 'thighL': None, 'shinL': 'thighL', 'thighR': None, 'shinR': 'thighR'}
    rig = {'canvas': [W, H], 'joints': j, 'order': order,
           'parts': {n: {'file': f'{n}.png', 'pivot': j[piv[n]], 'parent': par.get(n)} for n in order}}
    json.dump(rig, open(os.path.join(HERO, 'parts', f'rig_{view}.json'), 'w'), ensure_ascii=False, indent=1)
    print(view, {n: int((np.array(Image.open(os.path.join(out, n + '.png')))[..., 3] > 0).sum()) for n in order})


def seg_or(P, j):
    m = np.zeros(P.shape[:2], bool)
    for a, b, r in [('shL', 'haL', 70), ('shR', 'haR', 70), ('hiL', 'toL', 70), ('hiR', 'toR', 70)]:
        m |= seg_dist(P, j[a], j[b]) <= r
    return m


if __name__ == '__main__':
    cut('front'); cut('back')
