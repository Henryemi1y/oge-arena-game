"""Покадровое пламя жаровни: 48 кадров, зацикленная анимация (2 с при 24 к/с), в палитре нарисованного синего огня.

Движение — из поля шума, периодичного по высоте и по времени (БПФ с затуханием спектра): языки поднимаются, рвутся
и отрываются вверху, основание дрожит меньше, чем верх. Последний кадр стыкуется с первым без скачка.
Цвета — квантили яркости рисованного пламени (assets/environment/arena25d: деталь flame), чтобы пиксель-арт совпадал.

    python3 tools/fire_flipbook.py   → assets/fx/fire/brazier_fire.png (лист 8×6) + brazier_fire.json
"""
import os, json, io, base64
import numpy as np
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(R, 'assets/fx/fire')
W, H, N, COLS = 90, 140, 48, 8
rng = np.random.default_rng(7)


def field(shape, cut):
    """Гладкий случайный тор: шум, периодичный по всем осям (t, y, x); cut — сколько периодов на оси ещё проходит
    (гауссов срез спектра; по высоте меньше, чем по ширине — языки вытянуты вверх). std = 1."""
    k = np.meshgrid(*[np.fft.fftfreq(n) * n for n in shape], indexing='ij')
    amp = np.exp(-sum((ki / c) ** 2 for ki, c in zip(k, cut)))
    spec = (rng.normal(size=shape) + 1j * rng.normal(size=shape)) * amp
    spec.flat[0] = 0
    f = np.real(np.fft.ifftn(spec)); return f / f.std()


def palette():
    """Цвета рисованного пламени по яркости (от тёмного края к белому сердцу)."""
    cache = json.load(open(os.path.join(R, 'src/game/.assets_cache.json')))['A']['props']['flame']
    im = np.array(Image.open(io.BytesIO(base64.b64decode(cache['src'].split(',', 1)[1]))).convert('RGBA')).reshape(-1, 4)
    im = im[im[:, 3] > 200, :3].astype(float); lum = im @ [.3, .5, .2]; o = np.argsort(lum); im = im[o]
    return np.array([im[int(q * (len(im) - 1))] for q in [.03, .16, .32, .5, .68, .84, .97]])


def main():
    os.makedirs(OUT, exist_ok=True)
    PY = 160  # период поля по высоте (px)
    F1 = field((N, PY, W), (2.2, 2.6, 3.2))    # крупные языки
    F2 = field((N, PY, W), (3.5, 5.5, 7))      # мелкая рябь
    FX = field((N, PY, W), (1.6, 1.4, 1.2))    # боковое качание
    pal = palette(); L = len(pal)
    y, x = np.mgrid[0:H, 0:W].astype(float)
    base = H - 6; v = np.clip((base - y) / (H * .9), -.2, 1.2); u0 = (x - W / 2) / (W / 2)
    frames = []
    for i in range(N):
        t = i / N
        sc = (y + 2 * PY * t) % PY  # языки поднимаются: два периода поля за цикл
        yi = sc.astype(int) % PY; yj = (yi + 1) % PY; fy = sc - np.floor(sc)
        def samp(Fi):
            xi = np.clip(x.astype(int), 0, W - 1)
            return Fi[i][yi, xi] * (1 - fy) + Fi[i][yj, xi] * fy
        n1, n2, nx = samp(F1), samp(F2), samp(FX)
        vv = np.clip(v, 0, 1)
        u = u0 + .20 * vv ** 1.3 * nx + .05 * n2 * vv                        # верх качается сильнее основания
        wv = .50 * (1 - vv) ** .8 + .035                                      # сужается к острию
        env = np.exp(-(u / wv) ** 2 * 1.6) * np.clip((v + .02) / .1, 0, 1)   # скруглённое основание
        # форма: огибающая, изрезанная шумом сильнее вверху (языки рвутся и отрываются)
        S_ = env * (1.05 - .55 * vv) + (.42 * n1 + .14 * n2) * (.12 + vv ** 1.2) * env ** .25 - .30 * vv ** 2 - .1
        S_ = np.where(v > 1.05, -1, S_)
        # цвет — «температура»: горячо у основания и на оси, шум только оттеняет
        T = env * (1.15 - 1.0 * vv ** .8) + .10 * n2 + .06 * n1
        lev = np.clip((T - .05) / 1.0, 0, .999) * L
        a = (S_ > 0).astype(np.uint8)
        from scipy import ndimage  # одиночные «крошки» по 1–7 px убрать: на экране они мерцают как шум
        lab, nl = ndimage.label(a); sz = ndimage.sum(a, lab, range(1, nl + 1))
        for j, z in enumerate(sz, 1):
            if z < 8: a[lab == j] = 0
        I = S_ + .1
        img = np.zeros((H, W, 4), np.uint8)
        img[..., :3] = pal[np.clip(lev.astype(int), 0, L - 1)].astype(np.uint8)
        img[..., 3] = a * 255
        # мягкий край в один пиксель (полупрозрачная кайма) — как у рисованного пламени
        edge = (I > .04) & (I <= .1); img[edge, :3] = pal[0]; img[edge, 3] = 120
        frames.append(img)
    rows = (N + COLS - 1) // COLS
    sheet = Image.new('RGBA', (COLS * W, rows * H))
    for i, f in enumerate(frames): sheet.paste(Image.fromarray(f), ((i % COLS) * W, (i // COLS) * H))
    sheet.save(os.path.join(OUT, 'brazier_fire.png'))
    json.dump({'n': N, 'cols': COLS, 'w': W, 'h': H, 'fps': 24, 'base': base}, open(os.path.join(OUT, 'brazier_fire.json'), 'w'))
    print('кадров', N, 'лист', sheet.size)


if __name__ == '__main__':
    main()
