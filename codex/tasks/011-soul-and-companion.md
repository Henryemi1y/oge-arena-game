---
id: 011
title: Душа героя и спутник-«глаз» — вид сбоку
status: done
created_by: claude
---

## Цель
Когда у босса разрушена конечность, душа героя выходит из тела и игрок управляет ею (летает, собирает осколки).
Спутник — летающий глаз в пламени, сопровождает героя. Оба летают, ног не нужно; душа анимируется скелетом.

## Референсы (читать/смотреть)
- `assets/characters/hero/concept/hero_side_rigpose.png` и `assets/characters/hero/parts/hero_side_*.png` — герой, из которого выходит душа

## Промпт для генерации

### Файл 1 — душа (лист деталей)
Pixel-art PART SHEET of the hero's SOUL, transparent PNG 2048x1536, strict side view facing RIGHT: the same silhouette
and proportions as the hero (hood, cape, pauldrons readable), but made of translucent glowing pale-cyan spirit light
with soft inner glow, brighter outlines, wispy flame-like edges, no solid colours, the lower body fading into a long
wispy flowing tail instead of legs. Separate complete parts with wide gaps (≥80 px): 1) head with hood, 2) torso
without arms, 3) near arm straight (shoulder at top), 4) far arm (dimmer), 5) the wispy tail as one piece. Plus 6) one
full assembled soul figure for reference at the right side of the sheet. Same pixel scale as the hero (1371 px tall).
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.

### Файл 2 — спутник-глаз
Pixel-art sprite sheet, transparent PNG 1024x512: a single floating EYE companion — a round eyeball with a cold blue
iris inside a crown of living blue-white flame, small floating stone fragments orbiting it. 4 separate pieces with
wide gaps: 1) the eyeball, 2) the eyelid/socket ring (stone), 3) the flame crown (one piece, transparent inside where
the eye sits), 4) a small orbiting stone fragment. The eyeball about 140 px in diameter.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.

## Выходные файлы (строго по этим путям)
- `assets/characters/soul/soul_side_parts_v1.png` — 2048×1536
- `assets/characters/companion-eye/eye_parts_v1.png` — 1024×512

## Требования
- Прозрачный фон, зазоры ≥80 px. В «Результате» — прямоугольники деталей.

## Результат
- `assets/characters/soul/soul_side_parts_v1.png` — PNG 2048×1536, прозрачный фон. 6 деталей, минимальный зазор по прямоугольникам 84 px. Выбранный вариант.
- `assets/characters/companion-eye/eye_parts_v1.png` — PNG 1024×512, прозрачный фон. 4 деталей, минимальный зазор по прямоугольникам 89 px. Выбранный вариант.
- Душа сохранена полупрозрачной, цельная собранная фигура справа имеет высоту 1371 px. У каменной оправы и короны пламени открытые прозрачные центры, глаз высотой 140 px. Ног и оружия у души нет.
- Выбранные PNG открыты и проверены в отдельном превью Chrome. Координаты указаны от левого верхнего угла, в пикселях.

`soul_side_parts_v1.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 492 | 80 | 252 | 250 |
| Торс | 45 | 80 | 363 | 828 |
| Ближняя рука | 495 | 440 | 134 | 560 |
| Дальняя рука | 719 | 440 | 121 | 530 |
| Хвост души | 960 | 575 | 295 | 865 |
| Собранная душа | 1445 | 75 | 477 | 1371 |

`eye_parts_v1.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Глаз | 40 | 186 | 136 | 140 |
| Каменная оправа | 266 | 141 | 230 | 230 |
| Корона пламени | 585 | 118 | 240 | 276 |
| Осколок-спутник | 918 | 211 | 57 | 90 |

<details>
<summary>Промпты встроенного imagegen</summary>

**Душа**

Transparent 2048×1536 cutout sprite sheet. Re-create exactly the attached cobalt-hooded hero as a luminous translucent pale cyan SOUL, same right-facing pure side-profile hood, cowl and pauldron silhouette, dark-fantasy pixel clusters and inner light. His lower body dissolves into one long fluid wispy ghost tail, no legs or boots, no weapon. Exactly six complete separated groups with big empty gaps. FAR RIGHT one full assembled ghost at same height scale as hero (1371px) from hood to tail. On LEFT and MIDDLE five detached parts: (1) head with hood at top left, (2) body with cape/cowl/pauldron sockets, WITHOUT head/arms/tail beside head, (3) near straight vertical complete translucent arm below head, (4) dimmer far straight vertical complete arm next to near arm, (5) long tapered wispy tail below torso, distinct joined shape from waist to wispy end. Body has no duplicated armor on disconnected arms. One soft cyan interior glow, crisper stepped bright outlines, no solid opaque colors or background haze. Do not add sparks outside the six groups, no label, borders, or text. All six inside the canvas.

**Спутник**

1024x512 transparent pixel-art cutout sheet for the same dark fantasy game as image 1, FOUR complete independent components in one wide horizontal row with at least 80 px gaps: (1) spherical eyeball with very cold blue iris, around 140px diameter, iris looks slightly screen right, (2) empty dark granite socket ring with its circular center truly transparent, (3) one connected halo crown of blue-white flame with a large clear TRANSPARENT HOLE for the eyeball, no eye or rock attached to flame, (4) one small angular orbiting charcoal stone shard. Same luminous cyan spirit color, crisp pixel clusters and upper-left light. Wide gutters, real alpha background and inside both rings, no other rocks or sparks, no duplicate eye, no shadow, labels or outline around sheet.

</details>
