---
id: 005
title: Враг «Гуль» — вид сбоку: риг-поза и лист деталей
status: done
created_by: claude
---

## Цель
Быстрый слабый враг ближнего боя. Двигается суетливо, на полусогнутых, руки-когти вперёд.
Вид — строго сбоку (профиль), персонаж смотрит ВПРАВО; влево Claude получит зеркалом. Сначала цельная фигура
в риг-позе (якорь), затем по этому якорю — лист отдельных целых деталей для скелетной анимации (как у героя в
`assets/characters/hero/parts/hero_side_*.png`).

## Референсы (читать/смотреть)
- `assets/_legacy_refs/ghoul_r.png` — прежний вид гуля (вид спереди, маленький): дизайн, палитра
- `assets/characters/hero/concept/hero_side_rigpose.png` — образец риг-позы и стиля вида сбоку
- `assets/characters/hero/parts/hero_side_head-arm-leg.png`, `hero_side_torso-cape.png`, `hero_side_arms-leg.png` — образец того, как выглядит лист деталей

## Промпт для генерации

### Шаг 1 — якорь (риг-поза)
ONE full-body pixel-art sprite of a GHOUL enemy, transparent PNG 1024x1536: an emaciated, hunched humanoid
with pale grey-white skin stretched over visible ribs and sinews, long thin limbs, pointed ears, a bald head with a
few strands of long dark hair, sunken glowing pale-yellow eyes, sharp teeth, long clawed fingers and long clawed toes,
a ragged brown loincloth hanging from a rope belt, frayed cloth wraps on the wrists — exactly the design of
`_legacy_refs/ghoul_r.png`, redrawn in high detail. About 0.95 of the hero's height (the hero is 1371 px tall in
1024x1536), so the ghoul is about 1300 px tall.
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
7. LOINCLOTH — the hanging cloth on its own, complete.
Every part is complete, including areas normally hidden by other parts (top of the thigh under clothing, shoulder under
armour, the back of the torso under a cape), with rounded ends at the root joints so they can rotate under the body.
Limbs are drawn STRAIGHT and VERTICAL, root joint (shoulder / hip) at the TOP, foot or hand at the bottom.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.
True transparent background.

## Выходные файлы (строго по этим путям)
- `assets/enemies/ghoul/ghoul_side_rigpose_v1.png` — якорь, 1024×1536
- `assets/enemies/ghoul/ghoul_side_parts_v1.png` — лист деталей, 2048×1536

## Требования
- Масштаб как у героя: рост ≈1300 px в кадре 1024×1536, подошвы ≈ y=1445.
- В «Результате» перечисли детали на листе с прямоугольниками x, y, w, h (как в задаче 003).
- Если якорь получился не в профиль или с перекрытиями, переделай и сохрани `_v2`; то же для листа.

## Результат
- `assets/enemies/ghoul/ghoul_side_rigpose_v1.png` — PNG 1024×1536, прозрачный фон. Высота силуэта 1300 px, нижняя подошва на y=1445. Первый вариант.
- `assets/enemies/ghoul/ghoul_side_rigpose_v2.png` — PNG 1024×1536, прозрачный фон. Высота силуэта 1300 px, нижняя подошва на y=1445. Выбранный вариант.
- `assets/enemies/ghoul/ghoul_side_parts_v1.png` — PNG 2048×1536, прозрачный фон. 7 деталей, минимальный зазор по прямоугольникам 88 px. Выбранный вариант.
- Выбран якорь v2: ближняя рука отведена от грудной клетки, обе стопы раздельны. Край набедренной ткани частично заходит на дальнее колено. Лист сохраняет полную дальнюю ногу.
- Размеры деталей откалиброваны по видимым ориентирам якоря. Под одеждой и бронёй длины восстановлены по пропорциям, точное совпадение скрытых участков 1:1 не подтверждено.
- Выбранные PNG открыты и проверены в отдельном превью Chrome. Координаты указаны от левого верхнего угла, в пикселях.

`ghoul_side_parts_v1.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 1630 | 40 | 281 | 370 |
| Торс | 1057 | 40 | 172 | 424 |
| Ближняя рука | 657 | 40 | 122 | 600 |
| Дальняя рука | 867 | 40 | 102 | 580 |
| Ближняя нога | 40 | 40 | 230 | 750 |
| Дальняя нога | 358 | 40 | 211 | 730 |
| Набедренная ткань с поясом | 1317 | 40 | 225 | 415 |

<details>
<summary>Промпты встроенного imagegen</summary>

**Якорь**

Game character reference for cutout rigging. ONE 1024×1536 transparent PNG. The exact emaciated grey-white ghoul in image 1, with visible ribs and sinews, subtle hunched upper back as a body trait while standing neutral, large pointed ears, bald crown with a few long dark strands, one pale-yellow sunken glowing eye in profile, sharp teeth, long thin sinewy clawed limbs and splayed clawed toes. Worn frayed tan wrist wraps, plain brown ragged loincloth with rope belt. Image 2 controls pixel detail and camera only. Loincloth hangs from the hip and keeps both knees readable. Strict 90-degree RIGHT-FACING SIDE PROFILE, no three-quarter or front view. Nose/beak and BOTH toes point SCREEN RIGHT, only the near eye visible. Neutral upright cutout rig pose with both feet planted on exactly one baseline, straight legs gently staggered horizontally so each leg and foot has a visible transparent gap below the hips. Keep the near arm lowered slightly forward of the body toward screen right and the far arm lowered slightly behind toward screen left, open empty hands, elbows almost straight. Distinct transparent gaps between forearms and trunk; both arms visible below shoulder attachments, far side somewhat darker. Only one full figure, entire head to toes with margins, no action pose. Approximate visible height 1300 px, lowest sole near y=1445, centered. Crisp high-detail dark-fantasy pixel art matching the hero, square pixel clusters, dark outlines and restrained stepped upper-left lighting. True transparent background, no cast shadow, backdrop, floor, text, label, or frame.

**Правка якоря**

Edit only the ghoul arm placement in this right-facing profile sprite. Lock EVERYTHING below y=680 including both nonoverlapping feet and both leg shapes. Keep existing head, visible ribs, style and loincloth. At shoulder height attach the near arm on the right/forward outline of the ribcage instead of across its middle. Re-pose that complete arm so a distinct gap starts directly below the shoulder cap and continues between torso and inner elbow and forearm. Straight relaxed elbows and claws down. Never detach the elbow or hand. Keep far arm and all other parts untouched. One transparent 1024×1536 sprite, same pose and scale.

**Лист деталей**

Rigging parts sheet for the EXACT same figure in image 1, still pure side profile facing screen RIGHT. Transparent PNG 2048×1536, same pixel scale as the anchor, same side orientation and lighting. EXACTLY 7 parts: 1 HEAD with short neck stub; 2 TORSO with fully drawn pelvis, neck and shoulders but NO separate limb pieces attached; 3 complete NEAR ARM vertical with rounded shoulder at top, whole hand at bottom; 4 complete darker FAR ARM vertical with whole hand; 5 complete NEAR LEG vertical from rounded full hip (including the hidden part under clothing) to right-facing flat sole; 6 complete darker FAR LEG likewise; extras: one complete ragged brown loincloth WITH rope belt, only on its own. Put the original pointed ear and all dark trailing hair on the head with a short neck. Torso is pale grey skin, emaciated ribs, slender pelvis and rounded joints. Both sinewy clawed arms have the original wrist wraps and all fingers. Both feet are elongated clawed bare feet. Lay out as two loose rows: top has HEAD, TORSO, extra garment/accessories, bottom has NEAR ARM, FAR ARM, NEAR LEG, FAR LEG in that left-to-right order. Reserve the far right edge for a long weapon if present. Exactly the listed parts, transparent gaps of at least 80px. Do not merge or duplicate pieces. Arms and legs straight and vertical, all root joints rounded and whole. No backdrop, text, numbers as labels, frame, shadow or pose diagram. Retain high-detail crisp pixel clusters and dark fantasy shading from the anchor; image 2 only sets general game art style.

</details>
