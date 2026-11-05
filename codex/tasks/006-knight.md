---
id: 006
title: Враг «Падший рыцарь» — вид сбоку: риг-поза и лист деталей
status: done
created_by: claude
---

## Цель
Тяжёлый бронированный враг ближнего боя с мечом. Шаг медленный и весомый.
Вид — строго сбоку (профиль), персонаж смотрит ВПРАВО; влево Claude получит зеркалом. Сначала цельная фигура
в риг-позе (якорь), затем по этому якорю — лист отдельных целых деталей для скелетной анимации (как у героя в
`assets/characters/hero/parts/hero_side_*.png`).

## Референсы (читать/смотреть)
- `assets/_legacy_refs/knight_r.png` — прежний вид рыцаря: дизайн, палитра
- `assets/characters/hero/concept/hero_side_rigpose.png` — образец риг-позы и стиля вида сбоку
- `assets/characters/hero/parts/hero_side_head-arm-leg.png`, `hero_side_torso-cape.png`, `hero_side_arms-leg.png` — образец того, как выглядит лист деталей

## Промпт для генерации

### Шаг 1 — якорь (риг-поза)
ONE full-body pixel-art sprite of a FALLEN KNIGHT enemy, transparent PNG 1024x1536: dark steel plate armour
(pauldrons with ridges, breastplate, gauntlets, faceted knee guards, sabatons), a closed great helm under a deep
crimson hood with two narrow glowing orange eye slits, a long tattered crimson tabard and skirt panels hanging front
and back, a leather belt with a steel buckle — exactly the design of `_legacy_refs/knight_r.png`, in high detail.
Empty hands (the weapon is a separate part). About 1.05 of the hero's height (≈1440 px is too tall for the canvas, so
keep him ≈1400 px tall with soles at y≈1500).
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
7. FRONT TABARD PANEL and BACK TABARD PANEL — the two hanging crimson cloth panels, each complete.
8. WEAPON — a long straight black-steel sword with a heavy cross-guard, drawn vertical, tip up, on its own.
Every part is complete, including areas normally hidden by other parts (top of the thigh under clothing, shoulder under
armour, the back of the torso under a cape), with rounded ends at the root joints so they can rotate under the body.
Limbs are drawn STRAIGHT and VERTICAL, root joint (shoulder / hip) at the TOP, foot or hand at the bottom.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.
True transparent background.

## Выходные файлы (строго по этим путям)
- `assets/enemies/knight/knight_side_rigpose_v1.png` — якорь, 1024×1536
- `assets/enemies/knight/knight_side_parts_v1.png` — лист деталей, 2048×1536

## Требования
- Оружие — отдельной деталью, в руках у якоря оружия нет.
- В «Результате» перечисли детали на листе с прямоугольниками x, y, w, h (как в задаче 003).
- Если якорь получился не в профиль или с перекрытиями, переделай и сохрани `_v2`; то же для листа.

## Результат
- `assets/enemies/knight/knight_side_rigpose_v1.png` — PNG 1024×1536, прозрачный фон. Высота силуэта 1400 px, нижняя подошва на y=1500. Первый вариант.
- `assets/enemies/knight/knight_side_rigpose_v2.png` — PNG 1024×1536, прозрачный фон. Высота силуэта 1400 px, нижняя подошва на y=1500. Выбранный вариант.
- `assets/enemies/knight/knight_side_parts_v1.png` — PNG 2048×1536, прозрачный фон. 9 деталей, минимальный зазор по прямоугольникам 88 px. Первый вариант.
- `assets/enemies/knight/knight_side_parts_v2.png` — PNG 2048×1536, прозрачный фон. 9 деталей, минимальный зазор по прямоугольникам 88 px. Выбранный вариант.
- Выбраны якорь и лист v2. Восстановлен дальний локоть, разнесены сабатоны, на листе две отдельные красные полы и меч без дополнительных креплений. Полы на якоре частично закрывают контуры коленей.
- Размеры деталей откалиброваны по видимым ориентирам якоря. Под одеждой и бронёй длины восстановлены по пропорциям, точное совпадение скрытых участков 1:1 не подтверждено.
- Выбранные PNG открыты и проверены в отдельном превью Chrome. Координаты указаны от левого верхнего угла, в пикселях.

`knight_side_parts_v1.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 40 | 908 | 257 | 265 |
| Торс | 641 | 738 | 230 | 480 |
| Ближняя рука | 992 | 40 | 172 | 575 |
| Дальняя рука | 1252 | 688 | 136 | 545 |
| Ближняя нога | 40 | 40 | 225 | 780 |
| Дальняя нога | 353 | 40 | 200 | 770 |
| Передняя пола | 1252 | 40 | 285 | 560 |
| Задняя пола | 641 | 40 | 263 | 610 |
| Меч | 1748 | 40 | 260 | 1150 |

`knight_side_parts_v2.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 641 | 738 | 258 | 265 |
| Торс | 1253 | 688 | 234 | 480 |
| Ближняя рука | 993 | 40 | 172 | 575 |
| Дальняя рука | 1461 | 40 | 136 | 545 |
| Ближняя нога | 40 | 40 | 225 | 780 |
| Дальняя нога | 353 | 40 | 200 | 770 |
| Передняя пола | 1253 | 40 | 120 | 560 |
| Задняя пола | 641 | 40 | 264 | 610 |
| Меч | 1745 | 40 | 263 | 1150 |

<details>
<summary>Промпты встроенного imagegen</summary>

**Якорь**

Game character reference for cutout rigging. ONE 1024×1536 transparent PNG. The exact fallen knight in image 1, massive dark steel plate armor, ridged steel pauldrons, breastplate, closed charcoal great helm with a narrow amber eye slit under a deep crimson hood, steel gauntlets and faceted knee guards, sabatons, brown leather belt and plain steel buckle. Original long pointed crimson front AND rear tabard flaps, drape narrowly beside the thighs so knees and lower forearms are readable. No sword or scabbard, hands empty. Image 2 is only profile rig and pixel-art style. Strict 90-degree RIGHT-FACING SIDE PROFILE, no three-quarter or front view. Nose/beak and BOTH toes point SCREEN RIGHT, only the near eye visible. Neutral upright cutout rig pose with both feet planted on exactly one baseline, straight legs gently staggered horizontally so each leg and foot has a visible transparent gap below the hips. Keep the near arm lowered slightly forward of the body toward screen right and the far arm lowered slightly behind toward screen left, open empty hands, elbows almost straight. Distinct transparent gaps between forearms and trunk; both arms visible below shoulder attachments, far side somewhat darker. Only one full figure, entire head to toes with margins, no action pose. Approximate visible height 1400 px, lowest sole near y=1500, centered. Crisp high-detail dark-fantasy pixel art matching the hero, square pixel clusters, dark outlines and restrained stepped upper-left lighting. True transparent background, no cast shadow, backdrop, floor, text, label, or frame.

**Правка якоря**

Tiny local repair to image 1 only. Its far arm on SCREEN LEFT has a broken elbow joint: the sleeve cuff near x≈355,y≈520 is separated from the start of the dark-steel forearm. Draw the missing SHORT elbow connector at x≈330–365,y≈510–548, in the same charcoal fabric and steel and same crisp pixel clusters. Image 2 shows the original intact elbow. Far arm must be attached continuously from shoulder to fingertips. Every other pixel and shape, including BOTH separate steel boots on a shared line, position and spacing of legs, both red panels, right-facing profile and near arm, remains exactly as image 1. Keep alpha in all gaps outside the arm. Transparent 1024×1536.

**Лист деталей**

Rigging parts sheet for the EXACT same figure in image 1, still pure side profile facing screen RIGHT. Transparent PNG 2048×1536, same pixel scale as the anchor, same side orientation and lighting. EXACTLY 9 parts: 1 HEAD with short neck stub; 2 TORSO with fully drawn pelvis, neck and shoulders but NO separate limb pieces attached; 3 complete NEAR ARM vertical with rounded shoulder at top, whole hand at bottom; 4 complete darker FAR ARM vertical with whole hand; 5 complete NEAR LEG vertical from rounded full hip (including the hidden part under clothing) to right-facing flat sole; 6 complete darker FAR LEG likewise; extras: one FRONT red tabard flap and one distinct REAR red tabard flap, individually separate, plus one long straight black-steel sword with heavy cross-guard, tip up at far right. Closed hooded steel helm on head, crimson cowl on torso, intact dark breastplate and belt on torso, ridged pauldrons on the detached arms ONLY, no duplicate armor on chest. Whole armor legs with thigh, angular knee plates, greaves, dark sabatons. Separate empty gauntlets, no weapon attached. Lay out in two loose rows with each object isolated: top left-to-right head, torso and garment/accessory parts; bottom left-to-right near arm, far arm, near leg, far leg. Place the sword, if requested, isolated and complete at far right. Four stump caps, if requested, form a clear row to the right of the torso. Transparent gutters at least 80px. No other pieces, no overlapping. Arms and legs straight and vertical, all root joints rounded and whole. No backdrop, text, numbers as labels, frame, shadow or pose diagram. Retain high-detail crisp pixel clusters and dark fantasy shading from the anchor; image 2 only sets general game art style.

**Правка листа**

Precise edit of the same exact side-profile fallen knight parts sheet. Image 2 is the selected anchor, authoritative for cloth shapes. Keep the existing four complete vertical limbs, exact head, torso and separate black-steel sword, all in exactly their places. Fix only the cloth and extra objects in the top row: the first crimson panel must be one single narrow forward-hanging pointed flap (NOT a forked two-tail garment); the second crimson panel remains a distinct single rear flap, taper like the rear flap in image 2. Each is whole on its own and has one complete top attachment. Remove the four unrequested tiny metal cap objects between the cloth and sword. Exactly nine separate parts: head, torso, two full arms, two full legs, two individual cloth flaps, sword. True transparent alpha, unchanged crisp pixel-art style and geometry otherwise. No text.

</details>
