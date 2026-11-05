---
id: 007
title: Враг «Чумной доктор» — вид сбоку: риг-поза и лист деталей
status: done
created_by: claude
---

## Цель
Враг дальнего боя: держит дистанцию, бросает склянки. Шаг лёгкий, крадущийся, полы одежды развеваются.
Вид — строго сбоку (профиль), персонаж смотрит ВПРАВО; влево Claude получит зеркалом. Сначала цельная фигура
в риг-позе (якорь), затем по этому якорю — лист отдельных целых деталей для скелетной анимации (как у героя в
`assets/characters/hero/parts/hero_side_*.png`).

## Референсы (читать/смотреть)
- `assets/_legacy_refs/doctor_r.png` — прежний вид доктора: дизайн, палитра
- `assets/characters/hero/concept/hero_side_rigpose.png` — образец риг-позы и стиля вида сбоку
- `assets/characters/hero/parts/hero_side_head-arm-leg.png`, `hero_side_torso-cape.png`, `hero_side_arms-leg.png` — образец того, как выглядит лист деталей

## Промпт для генерации

### Шаг 1 — якорь (риг-поза)
ONE full-body pixel-art sprite of a PLAGUE DOCTOR enemy, transparent PNG 1024x1536: a bone-white long-beaked
plague mask with dark round eye lenses, a black hood and a ragged black shoulder cape, a long dark wine-red coat
with ragged split tails, a rope belt with a knot, black trousers, tall brown leather boots, pale bony hands — exactly
the design of `_legacy_refs/doctor_r.png`, in high detail. Same height as the hero (≈1370 px, soles at y≈1445).
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
5. NEAR LEG — one complete straight leg, hip at the top, foot flat at the bottom pointing RIGHT.
6. FAR LEG — the same for the far leg (slightly darker).
7. COAT TAILS — the lower part of the coat below the belt as one complete piece (front and back flaps together).
8. FLASK — a small glass flask with a glowing green liquid and a cork, on its own.
Every part is complete, including areas normally hidden by other parts (top of the thigh under clothing, shoulder under
armour, the back of the torso under a cape), with rounded ends at the root joints so they can rotate under the body.
Limbs are drawn STRAIGHT and VERTICAL, root joint (shoulder / hip) at the TOP, foot or hand at the bottom.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.
True transparent background.

## Выходные файлы (строго по этим путям)
- `assets/enemies/plague-doctor/doctor_side_rigpose_v1.png` — якорь, 1024×1536
- `assets/enemies/plague-doctor/doctor_side_parts_v1.png` — лист деталей, 2048×1536

## Требования
- Полы пальто не должны закрывать колени у якоря (это важно для нарезки).
- В «Результате» перечисли детали на листе с прямоугольниками x, y, w, h (как в задаче 003).
- Если якорь получился не в профиль или с перекрытиями, переделай и сохрани `_v2`; то же для листа.

## Результат
- `assets/enemies/plague-doctor/doctor_side_rigpose_v1.png` — PNG 1024×1536, прозрачный фон. Высота силуэта 1370 px, нижняя подошва на y=1445. Выбранный вариант.
- `assets/enemies/plague-doctor/doctor_side_parts_v1.png` — PNG 2048×1536, прозрачный фон. 8 деталей, минимальный зазор по прямоугольникам 88 px. Выбранный вариант.
- Оба колена различимы, длинная задняя пола проходит у внешнего края дальнего колена. Нижняя часть пальто на листе представляет собой одну цельную деталь. Склянка отделена.
- Размеры деталей откалиброваны по видимым ориентирам якоря. Под одеждой и бронёй длины восстановлены по пропорциям, точное совпадение скрытых участков 1:1 не подтверждено.
- Выбранные PNG открыты и проверены в отдельном превью Chrome. Координаты указаны от левого верхнего угла, в пикселях.

`doctor_side_parts_v1.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 1728 | 40 | 270 | 265 |
| Торс | 1436 | 40 | 204 | 445 |
| Ближняя рука | 985 | 40 | 143 | 560 |
| Дальняя рука | 1216 | 40 | 132 | 548 |
| Ближняя нога | 40 | 40 | 190 | 770 |
| Дальняя нога | 318 | 40 | 150 | 760 |
| Цельные нижние полы пальто | 556 | 40 | 341 | 610 |
| Склянка | 1728 | 393 | 71 | 97 |

<details>
<summary>Промпты встроенного imagegen</summary>

**Якорь**

Game character reference for cutout rigging. ONE 1024×1536 transparent PNG. The exact plague doctor in image 1, one long bone-white beaked mask with a dark round lens, black hood and torn black shoulder mantle, dark wine-red long split coat with its two ragged tails attached to one waist, tan knotted rope belt, black trousers, high brown wrapped leather boots and pale bony hands. Coattails narrow and behind the sides of thighs; BOTH knee joints visibly clear. No flask held. Image 2 is only the profile pose and pixel detail. Strict 90-degree RIGHT-FACING SIDE PROFILE, no three-quarter or front view. Nose/beak and BOTH toes point SCREEN RIGHT, only the near eye visible. Neutral upright cutout rig pose with both feet planted on exactly one baseline, straight legs gently staggered horizontally so each leg and foot has a visible transparent gap below the hips. Keep the near arm lowered slightly forward of the body toward screen right and the far arm lowered slightly behind toward screen left, open empty hands, elbows almost straight. Distinct transparent gaps between forearms and trunk; both arms visible below shoulder attachments, far side somewhat darker. Only one full figure, entire head to toes with margins, no action pose. Approximate visible height 1370 px, lowest sole near y=1445, centered. Crisp high-detail dark-fantasy pixel art matching the hero, square pixel clusters, dark outlines and restrained stepped upper-left lighting. True transparent background, no cast shadow, backdrop, floor, text, label, or frame.

**Лист деталей**

Rigging parts sheet for the EXACT same figure in image 1, still pure side profile facing screen RIGHT. Transparent PNG 2048×1536, same pixel scale as the anchor, same side orientation and lighting. EXACTLY 8 parts: 1 HEAD with short neck stub; 2 TORSO with fully drawn pelvis, neck and shoulders but NO separate limb pieces attached; 3 complete NEAR ARM vertical with rounded shoulder at top, whole hand at bottom; 4 complete darker FAR ARM vertical with whole hand; 5 complete NEAR LEG vertical from rounded full hip (including the hidden part under clothing) to right-facing flat sole; 6 complete darker FAR LEG likewise; extras: ONE complete wine-red lower coat with the front and back ragged tails joined by a continuous waistband; one tiny green glass corked flask, separate. Keep the head's exact black hood and long white bone beak with dark round lens. Torso contains the black shoulder mantle and knotted rope belt, filled neck, shoulder and pelvis connections, NO lower tails or sleeves. Red sleeves and pale bony hands on both arms. Long wrapped brown boots and whole charcoal trousers. Lay out as two loose rows: top has HEAD, TORSO, extra garment/accessories, bottom has NEAR ARM, FAR ARM, NEAR LEG, FAR LEG in that left-to-right order. Reserve the far right edge for a long weapon if present. Exactly the listed parts, transparent gaps of at least 80px. Do not merge or duplicate pieces. Arms and legs straight and vertical, all root joints rounded and whole. No backdrop, text, numbers as labels, frame, shadow or pose diagram. Retain high-detail crisp pixel clusters and dark fantasy shading from the anchor; image 2 only sets general game art style.

</details>
