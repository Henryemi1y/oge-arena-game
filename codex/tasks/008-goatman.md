---
id: 008
title: Враг «Козлорог» — вид сбоку: риг-поза и лист деталей
status: done
created_by: claude
---

## Цель
Крупный враг-таран: тяжёлый, бросается в разбег. Ноги козлиные (колено назад — пальцеходящая нога с копытом/когтями).
Вид — строго сбоку (профиль), персонаж смотрит ВПРАВО; влево Claude получит зеркалом. Сначала цельная фигура
в риг-позе (якорь), затем по этому якорю — лист отдельных целых деталей для скелетной анимации (как у героя в
`assets/characters/hero/parts/hero_side_*.png`).

## Референсы (читать/смотреть)
- `assets/_legacy_refs/goat_r.png` — прежний вид: дизайн, палитра
- `assets/characters/hero/concept/hero_side_rigpose.png` — образец риг-позы и стиля вида сбоку
- `assets/characters/hero/parts/hero_side_head-arm-leg.png`, `hero_side_torso-cape.png`, `hero_side_arms-leg.png` — образец того, как выглядит лист деталей

## Промпт для генерации

### Шаг 1 — якорь (риг-поза)
ONE full-body pixel-art sprite of a GOAT-MAN brute, transparent PNG 1024x1536: a huge muscular humanoid covered in
shaggy dark grey fur, a goat head with large curled ram horns, amber eyes, a pale furred chest, thick arms with clawed
hands, digitigrade goat legs (backward-bending ankle) ending in clawed hooves, a wide leather belt with a ring buckle and
a ragged rust-brown loincloth — exactly the design of `_legacy_refs/goat_r.png`, in high detail. About 1.15 of the
hero's height; fill the canvas: ≈1450 px tall with soles at y≈1500.
Pose: strict neutral RIG POSE for cut-out animation, strict SIDE VIEW (profile) facing screen RIGHT. Standing upright,
legs straight and slightly apart front-to-back so there is a clear transparent gap between them, both feet flat on
one ground line. Arms hang down a little away from the body with clear gaps between the arms and the torso, elbows
nearly straight. Nothing overlaps the torso; hems, sleeves and tails stay clear of the knees and elbows.
The far arm and far leg are visible behind and slightly darker.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.
Transparent background, the whole figure visible, centered, feet near the bottom with a small margin.

### Шаг 2 — лист деталей (по якорю из шага 1)
Use the step-1 anchor as the authority: the EXACT same character, same side view, same pixel scale (1 px of a part =
1 px of the anchor). Split it into SEPARATE, COMPLETE parts on a transparent sheet with WIDE gaps (at least 80 px
between any two parts, nothing touching):
1. HEAD with a short neck stub (and anything attached to the head: hood, horns, mask, hair).
2. TORSO with pelvis, WITHOUT arms, legs and head; shoulder and hip areas fully drawn.
3. NEAR ARM — one complete straight arm, shoulder at the top, hand at the bottom.
4. FAR ARM — the same arm as seen on the far side (slightly darker).
5. NEAR LEG — one complete digitigrade leg, hip at the top, hoof at the bottom pointing RIGHT, drawn as straight as the anatomy allows.
6. FAR LEG — the same for the far leg (slightly darker).
7. LOINCLOTH — complete.
Every part is complete, including areas normally hidden by other parts (top of the thigh under clothing, shoulder under
armour, the back of the torso under a cape), with rounded ends at the root joints so they can rotate under the body.
Limbs are drawn STRAIGHT and VERTICAL, root joint (shoulder / hip) at the TOP, foot or hand at the bottom.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.
True transparent background.

## Выходные файлы (строго по этим путям)
- `assets/enemies/goatman/goatman_side_rigpose_v1.png` — якорь, 1024×1536
- `assets/enemies/goatman/goatman_side_parts_v1.png` — лист деталей, 2048×1536

## Требования
- Рога целиком на голове, не обрезаны краем кадра.
- В «Результате» перечисли детали на листе с прямоугольниками x, y, w, h (как в задаче 003).
- Если якорь получился не в профиль или с перекрытиями, переделай и сохрани `_v2`; то же для листа.

## Результат
- `assets/enemies/goatman/goatman_side_rigpose_v1.png` — PNG 1024×1536, прозрачный фон. Высота силуэта 1450 px, нижняя подошва на y=1500. Выбранный вариант.
- `assets/enemies/goatman/goatman_side_parts_v1.png` — PNG 2048×1536, прозрачный фон. 7 деталей, минимальный зазор по прямоугольникам 88 px. Выбранный вариант.
- Рога целы, ноги сохраняют пальцеходящие суставы и копыта. Верх дальней руки в профиль частично скрыт туловищем, закрытая область восстановлена на листе.
- Размеры деталей откалиброваны по видимым ориентирам якоря. Под одеждой и бронёй длины восстановлены по пропорциям, точное совпадение скрытых участков 1:1 не подтверждено.
- Выбранные PNG открыты и проверены в отдельном превью Chrome. Координаты указаны от левого верхнего угла, в пикселях.

`goatman_side_parts_v1.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 1520 | 548 | 337 | 325 |
| Торс | 1213 | 40 | 219 | 450 |
| Ближняя рука | 660 | 40 | 200 | 672 |
| Дальняя рука | 948 | 40 | 177 | 640 |
| Ближняя нога | 40 | 40 | 225 | 788 |
| Дальняя нога | 353 | 40 | 219 | 780 |
| Набедренная ткань с поясом | 1520 | 40 | 280 | 420 |

<details>
<summary>Промпты встроенного imagegen</summary>

**Якорь**

Game character reference for cutout rigging. ONE 1024×1536 transparent PNG. The exact goat-man brute in image 1. Thick muscular humanoid, shaggy dark ash-grey fur, pale heavy furred chest, goat muzzle with amber eye and two complete large curling ram horns, no crop. Thick clawed arms, wide dark leather belt with bronze ring buckle, rust-brown ragged loincloth. Strong digitigrade goat legs with backward ankle/hock and right-facing cloven clawed hooves, straight neutral load-bearing stance as anatomy permits. Image 2 controls profile rig and pixel density. Strict 90-degree RIGHT-FACING SIDE PROFILE, no three-quarter or front view. Nose/beak and BOTH toes point SCREEN RIGHT, only the near eye visible. Neutral upright cutout rig pose with both feet planted on exactly one baseline, straight legs gently staggered horizontally so each leg and foot has a visible transparent gap below the hips. Keep the near arm lowered slightly forward of the body toward screen right and the far arm lowered slightly behind toward screen left, open empty hands, elbows almost straight. Distinct transparent gaps between forearms and trunk; both arms visible below shoulder attachments, far side somewhat darker. Only one full figure, entire head to toes with margins, no action pose. Approximate visible height 1450 px, lowest sole near y=1500, centered. Crisp high-detail dark-fantasy pixel art matching the hero, square pixel clusters, dark outlines and restrained stepped upper-left lighting. True transparent background, no cast shadow, backdrop, floor, text, label, or frame.

**Лист деталей**

Rigging parts sheet for the EXACT same figure in image 1, still pure side profile facing screen RIGHT. Transparent PNG 2048×1536, same pixel scale as the anchor, same side orientation and lighting. EXACTLY 7 parts: 1 HEAD with short neck stub; 2 TORSO with fully drawn pelvis, neck and shoulders but NO separate limb pieces attached; 3 complete NEAR ARM vertical with rounded shoulder at top, whole hand at bottom; 4 complete darker FAR ARM vertical with whole hand; 5 complete NEAR LEG vertical from rounded full hip (including the hidden part under clothing) to right-facing flat sole; 6 complete darker FAR LEG likewise; extras: one complete rust-brown ragged loincloth with the wide ring-buckle belt on its own. Head has BOTH complete original spiral horns and the same goat muzzle, neck mane and amber eye. Torso shows massive ash-grey fur chest with paler front pelt, strong shoulder roots and hips. Arms thick and long with the same fur and curved claws. Legs are two anatomically complete digitigrade goat legs with backward hocks and whole cloven hooves facing right. Lay out as two loose rows: top has HEAD, TORSO, extra garment/accessories, bottom has NEAR ARM, FAR ARM, NEAR LEG, FAR LEG in that left-to-right order. Reserve the far right edge for a long weapon if present. Exactly the listed parts, transparent gaps of at least 80px. Do not merge or duplicate pieces. Arms and legs straight and vertical, all root joints rounded and whole. No backdrop, text, numbers as labels, frame, shadow or pose diagram. Retain high-detail crisp pixel clusters and dark fantasy shading from the anchor; image 2 only sets general game art style.

</details>
