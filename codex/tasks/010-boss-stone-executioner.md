---
id: 010
title: Босс «Каменный палач» — вид сбоку: риг-поза и лист деталей
status: done
created_by: claude
---

## Цель
Второй босс: каменный палач с огромным оружием. Быстрее стража, но тоже тяжёлый. Конечности разрушаются, как у стража.
Вид — строго сбоку (профиль), персонаж смотрит ВПРАВО; влево Claude получит зеркалом. Сначала цельная фигура
в риг-позе (якорь), затем по этому якорю — лист отдельных целых деталей для скелетной анимации (как у героя в
`assets/characters/hero/parts/hero_side_*.png`).

## Референсы (читать/смотреть)
- `assets/characters/hero/concept/hero_side_rigpose.png` — масштаб героя
- `docs/GAME_DESIGN.md` — механика
- `assets/characters/hero/concept/hero_side_rigpose.png` — образец риг-позы и стиля вида сбоку
- `assets/characters/hero/parts/hero_side_head-arm-leg.png`, `hero_side_torso-cape.png`, `hero_side_arms-leg.png` — образец того, как выглядит лист деталей

## Промпт для генерации

### Шаг 1 — якорь (риг-поза)
ONE full-body pixel-art sprite of the STONE EXECUTIONER boss, transparent PNG 2048x2048: a tall hulking figure
carved from black basalt with veins of dull red-orange glow in its cracks, wearing the shape of an executioner: a
pointed stone hood with two ember eye holes, a heavy stone apron with iron rivets and chains, broad sloped shoulders,
long arms with huge hands, thick legs. Clearly different in silhouette from the round blocky Stone Guardian: taller,
leaner, hunched forward. About 2.3 times the hero's height: ≈1800 px tall in 2048, soles at y≈1980. Empty hands.
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
7. WEAPON — a gigantic two-handed executioner's axe: a long dark iron haft wrapped in chains and a huge crescent
   stone-and-iron blade with an orange-glowing rune, drawn vertical, blade at the top, on its own.
8. STUMPS — four broken stump caps (near/far shoulder, near/far hip) in black basalt with an orange glow inside.
Every part is complete, including areas normally hidden by other parts (top of the thigh under clothing, shoulder under
armour, the back of the torso under a cape), with rounded ends at the root joints so they can rotate under the body.
Limbs are drawn STRAIGHT and VERTICAL, root joint (shoulder / hip) at the TOP, foot or hand at the bottom.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.
True transparent background.

## Выходные файлы (строго по этим путям)
- `assets/bosses/stone-executioner/executioner_side_rigpose_v1.png` — якорь, 2048×2048
- `assets/bosses/stone-executioner/executioner_side_parts_v1.png` — лист деталей, 3072×2048

## Требования
- Оружие — отдельной деталью; длина топора ≈ рост босса.
- В «Результате» перечисли детали на листе с прямоугольниками x, y, w, h (как в задаче 003).
- Если якорь получился не в профиль или с перекрытиями, переделай и сохрани `_v2`; то же для листа.

## Результат
- `assets/bosses/stone-executioner/executioner_side_rigpose_v1.png` — PNG 2048×2048, прозрачный фон. Высота силуэта 1800 px, нижняя подошва на y=1980. Выбранный вариант.
- `assets/bosses/stone-executioner/executioner_side_parts_v1.png` — PNG 3072×2048, прозрачный фон. 11 деталей, минимальный зазор по прямоугольникам 88 px. Выбранный вариант.
- Базальт и оранжевые трещины отличают палача от стража. Топор расположен отдельным объектом, его высота 1800 px совпадает с высотой фигуры на якоре. На листе четыре самостоятельные культевые накладки.
- Размеры деталей откалиброваны по видимым ориентирам якоря. Под одеждой и бронёй длины восстановлены по пропорциям, точное совпадение скрытых участков 1:1 не подтверждено.
- Выбранные PNG открыты и проверены в отдельном превью Chrome. Координаты указаны от левого верхнего угла, в пикселях.

`executioner_side_parts_v1.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 1704 | 40 | 266 | 325 |
| Торс | 40 | 40 | 394 | 940 |
| Ближняя рука | 1192 | 40 | 177 | 800 |
| Дальняя рука | 1457 | 40 | 159 | 775 |
| Ближняя нога | 522 | 40 | 278 | 830 |
| Дальняя нога | 888 | 40 | 216 | 820 |
| Культя ближнего плеча | 2058 | 40 | 251 | 235 |
| Культя дальнего плеча | 2058 | 363 | 214 | 220 |
| Культя ближнего бедра | 1704 | 453 | 185 | 205 |
| Культя дальнего бедра | 1977 | 671 | 179 | 195 |
| Топор | 2479 | 40 | 553 | 1800 |

<details>
<summary>Промпты встроенного imagegen</summary>

**Якорь**

Game character reference for cutout rigging. ONE 2048×2048 transparent PNG. STONE EXECUTIONER. Hulking leaner dark BASALT golem than a blocky guardian: tall pointed stone executioner's hood with ember-red eye slit, a long upper back slightly hunched forward, sloping shoulders, long heavy basalt arms and big stone hands, thick legs. Charcoal black basalt with thin dull red-orange luminous veins, a heavy stone apron with iron rivets and short chains. Apron part hangs to thighs, leave knees readable. Hands EMPTY, no axe attached, no weapon. Floor image 1 is material/pixel texture reference but all executioner light stays ember orange. Image 2 controls profile pose. Strict 90-degree RIGHT-FACING SIDE PROFILE, no three-quarter or front view. Nose/beak and BOTH toes point SCREEN RIGHT, only the near eye visible. Neutral upright cutout rig pose with both feet planted on exactly one baseline, straight legs gently staggered horizontally so each leg and foot has a visible transparent gap below the hips. Keep the near arm lowered slightly forward of the body toward screen right and the far arm lowered slightly behind toward screen left, open empty hands, elbows almost straight. Distinct transparent gaps between forearms and trunk; both arms visible below shoulder attachments, far side somewhat darker. Only one full figure, entire head to toes with margins, no action pose. Approximate visible height 1800 px, lowest sole near y=1980, centered. Crisp high-detail dark-fantasy pixel art matching the hero, square pixel clusters, dark outlines and restrained stepped upper-left lighting. True transparent background, no cast shadow, backdrop, floor, text, label, or frame.

**Лист деталей**

Rigging parts sheet for the EXACT same figure in image 1, still pure side profile facing screen RIGHT. Transparent PNG 3072×2048, same pixel scale as the anchor, same side orientation and lighting. EXACTLY 11 parts: 1 HEAD with short neck stub; 2 TORSO with fully drawn pelvis, neck and shoulders but NO separate limb pieces attached; 3 complete NEAR ARM vertical with rounded shoulder at top, whole hand at bottom; 4 complete darker FAR ARM vertical with whole hand; 5 complete NEAR LEG vertical from rounded full hip (including the hidden part under clothing) to right-facing flat sole; 6 complete darker FAR LEG likewise; extras: one separate ENORMOUS executioner's axe at far RIGHT, vertical from chained black iron haft up to crescent basalt-and-iron axe blade with an orange glowing rune, full length the height of the anchor; plus EXACTLY FOUR jagged basalt STUMP CAPS with orange inner cracks: near and far shoulder and near and far hip. Keep caps all separate and together at upper right, left of the axe. Exact pointed basalt hood and orange eye slit, leaner dark basalt sloping shoulders. Torso contains the original riveted chained stone apron at pelvis, but NO arms or head. Both full basalt arms have bands and hands, both full legs have sculpted stone knees, foot and bands. No cyan or blue glow on this boss. Lay out as two loose rows: top has HEAD, TORSO, extra garment/accessories, bottom has NEAR ARM, FAR ARM, NEAR LEG, FAR LEG in that left-to-right order. Reserve the far right edge for a long weapon if present. Exactly the listed parts, transparent gaps of at least 80px. Do not merge or duplicate pieces. Arms and legs straight and vertical, all root joints rounded and whole. No backdrop, text, numbers as labels, frame, shadow or pose diagram. Retain high-detail crisp pixel clusters and dark fantasy shading from the anchor; image 2 only sets general game art style.

</details>
