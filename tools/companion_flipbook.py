"""Зелёный спутник (концепт docs/concept/companion_green_front.png): покадровая анимация 48 кадров (2 с при 24 к/с).

Языки пламени колышутся бегущей волной: у глаза тело неподвижно, к кончикам амплитуда растёт; тело «дышит»; отдельная
капля плавает сама по себе. Цикл замкнут (все колебания — целые периоды за 48 кадров).
Глаз в кадрах пустой (белок без зрачка): зрачок — отдельная картинка, игра двигает его к цели и закрывает веко.

    python3 tools/companion_flipbook.py  → assets/characters/companion-green/flipbook.png (лист 8×6), pupil.png, flipbook.json
"""
import os, json
import numpy as np, cv2
from PIL import Image
from scipy import ndimage

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(R, 'docs/concept/companion_green_front.png')
OUT = os.path.join(R, 'assets/characters/companion-green')
N, COLS, SC = 48, 8, .2          # кадров, столбцов листа, масштаб к концепту
EYE = (838.0, 781.0, 96.0, 89.0)  # центр и полуоси белка на концепте (px)


def main():
    os.makedirs(OUT, exist_ok=True)
    im = np.array(Image.open(SRC).convert('RGBA')).astype(np.float32)
    a = im[..., 3] > 128
    lab, n = ndimage.label(a); sz = ndimage.sum(a, lab, range(1, n + 1)); order = np.argsort(-sz)
    body_m = lab == order[0] + 1; drop_m = lab == order[1] + 1
    ex, ey, rx, ry = EYE
    yy, xx = np.mgrid[0:im.shape[0], 0:im.shape[1]].astype(np.float32)
    inE = ((xx - ex) / rx) ** 2 + ((yy - ey) / ry) ** 2 <= 1
    rgb = im[..., :3]
    # белок: светлые пиксели внутри эллипса; зрачок и радужка — остальное внутри белка (тёмное и коричневое)
    lum = rgb @ np.array([.3, .5, .2], np.float32)
    whiteish = inE & (lum > 175) & (rgb[..., 1] - rgb[..., 0] < 25)
    core = inE & ~whiteish & ndimage.binary_closing(whiteish | ~inE, iterations=0 or 1)
    # область зрачка — связная тёмная/коричневая область около центра, с бликами внутри (закрываем дыры)
    pup = inE & (lum < 150)
    lab2, n2 = ndimage.label(pup); sz2 = ndimage.sum(pup, lab2, range(1, n2 + 1))
    pupil = lab2 == (1 + int(np.argmax(sz2)))
    pupil = ndimage.binary_fill_holes(ndimage.binary_closing(pupil, iterations=3))
    inner = ndimage.binary_erosion(inE, iterations=5); pupil = pupil & inner
    py_, px_ = np.where(pupil); pc = (float(px_.mean()), float(py_.mean()))
    # картинка зрачка (с бликом), отдельно; в теле — белок, залитый по соседям (inpaint)
    pimg = np.zeros_like(im); pimg[pupil] = im[pupil]; pimg[pupil, 3] = 255
    # белок под зрачком: ровная заливка цветом белка с тенью к правому нижнему краю (как на концепте)
    wc = rgb[whiteish]; wl = lum[whiteish]; hi = np.median(wc[wl > np.percentile(wl, 70)], axis=0); lo = np.median(wc[wl < np.percentile(wl, 20)], axis=0)
    fillm = inner & ~whiteish
    sh = np.clip((((xx - ex) / rx + (yy - ey) / ry) * .5 + .15), 0, 1)[..., None] ** 1.5
    base = im.copy(); base[..., :3] = np.where(fillm[..., None], hi * (1 - sh) + lo * sh, im[..., :3])
    body = base.copy(); body[~body_m] = 0
    drop = im.copy(); drop[~drop_m] = 0
    # рабочее поле с запасом под колыхание
    pad = 90; H0, W0 = im.shape[:2]
    def padit(x): return np.pad(x, ((pad, pad), (pad, pad), (0, 0)))
    body, drop = padit(body), padit(drop)
    ex2, ey2 = ex + pad, ey + pad
    yy, xx = np.mgrid[0:body.shape[0], 0:body.shape[1]].astype(np.float32)
    dx, dy = xx - ex2, yy - ey2; d = np.hypot(dx, dy) + 1e-3; ux, uy = dx / d, dy / d; px, py = -uy, ux
    sm = lambda e0, e1, v: np.clip((v - e0) / (e1 - e0), 0, 1) ** 2 * (3 - 2 * np.clip((v - e0) / (e1 - e0), 0, 1))
    wgt = sm(150, 620, d)                      # у глаза — неподвижно, к кончикам — сильнее
    frames = []
    ys0, xs0 = np.where(drop[..., 3] > 0); dcx, dcy = xs0.mean(), ys0.mean()
    for i in range(N):
        t = 2 * np.pi * i / N
        w1 = np.sin(t - d / 140); w2 = np.sin(2 * t - d / 85 + 1.3); br = .022 * np.sin(t + .4) * sm(120, 300, d)
        A = 30 * wgt ** 1.4
        ox = A * (w1 * px + .45 * w2 * px) + br * dx + 6 * wgt * np.sin(t + 2.1) * ux
        oy = A * (w1 * py + .45 * w2 * py) + br * dy + 6 * wgt * np.sin(t + 2.1) * uy - 10 * wgt * (np.sin(t) + 1)  # кончики тянутся вверх
        mx, my = (xx - ox).astype(np.float32), (yy - oy).astype(np.float32)
        f = cv2.remap(body, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
        # капля: своё плавание (вверх-вниз и немного по кругу), лёгкий поворот
        M = cv2.getRotationMatrix2D((float(dcx), float(dcy)), 8 * np.sin(t + 1), 1.0); M[0, 2] += 10 * np.cos(t + .6); M[1, 2] += -16 * np.sin(t + .6)
        dr = cv2.warpAffine(drop, M, (drop.shape[1], drop.shape[0]), flags=cv2.INTER_LINEAR)
        al = dr[..., 3:4] / 255; f = f * (1 - al) + dr * al; f[..., 3] = np.maximum(f[..., 3], dr[..., 3])
        # в масштаб игры: средние по площади (пиксельный край сохраняется лучше, чем при билинейном)
        fs = cv2.resize(f, (round(f.shape[1] * SC), round(f.shape[0] * SC)), interpolation=cv2.INTER_AREA)
        # премультипликация не нужна: прозрачное поле чёрное — край слегка темнее, как контур
        frames.append(np.clip(fs, 0, 255).astype(np.uint8))
    # кадры обрезаются по общему для всех кадров прямоугольнику (+2 px)
    U = np.zeros(frames[0].shape[:2], bool)
    for f in frames: U |= f[..., 3] > 0
    ys, xs = np.where(U); cx0, cy0 = max(0, xs.min() - 2), max(0, ys.min() - 2); cx1, cy1 = xs.max() + 3, ys.max() + 3
    frames = [f[cy0:cy1, cx0:cx1] for f in frames]
    fh, fw = frames[0].shape[:2]
    rows = (N + COLS - 1) // COLS; sheet = np.zeros((rows * fh, COLS * fw, 4), np.uint8)
    for i, f in enumerate(frames): r, c = divmod(i, COLS); sheet[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] = f
    Image.fromarray(sheet).save(os.path.join(OUT, 'flipbook.png'))
    # зрачок рисуется заново, как на концепте: чёрный круг, снизу коричневая радужка, сверху справа блик;
    # сетка «пикселей» концепта (19 px), чтобы после уменьшения он был того же зерна, что и тело
    G = 19; S = 8 * G; pc_img = np.zeros((S, S, 4), np.float32); c0 = S / 2
    for gy in range(8):
        for gx in range(8):
            x, y = (gx + .5) * G, (gy + .5) * G; r = np.hypot(x - c0, y - c0)
            if r > 3.75 * G: continue
            col = (14, 10, 8) if y < c0 + 1.0 * G else (100, 54, 22) if r < 3.0 * G else (66, 35, 16)
            if (gx, gy) == (5, 2): col = (250, 248, 236)
            pc_img[gy * G:(gy + 1) * G, gx * G:(gx + 1) * G] = (*col, 255)
    ps = cv2.resize(pc_img, (round(S * SC), round(S * SC)), interpolation=cv2.INTER_AREA)
    Image.fromarray(np.clip(ps, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'pupil.png'))
    meta = {'n': N, 'cols': COLS, 'w': fw, 'h': fh, 'fps': 24,
            'eye': [ex2 * SC - cx0, ey2 * SC - cy0, rx * SC, ry * SC], 'pupil': [(pc[0] + pad) * SC - cx0, (pc[1] + pad) * SC - cy0],
            'lid': [int(c) for c in np.median(rgb[body_m & ~inE & (rgb[..., 1] > 200) & (rgb[..., 0] < 140)], axis=0)],
            'line': [int(c) for c in np.median(rgb[body_m & (lum < 70)], axis=0)]}
    json.dump(meta, open(os.path.join(OUT, 'flipbook.json'), 'w'))
    print('кадр', fw, 'x', fh, 'лист', sheet.shape[1], 'x', sheet.shape[0], meta)


if __name__ == '__main__':
    main()
