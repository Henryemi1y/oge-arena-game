---
id: 009
title: Босс «Каменный страж» — вид сбоку: риг-поза и лист деталей
status: done
created_by: claude
---

## Цель
Первый босс: огромный каменный голем. Конечности (руки, ноги) разрушаются по одной и рассыпаются на осколки с цифрами, поэтому каждая конечность — отдельная деталь, а на торсе нужны «культи» на месте рук и ног. Шаг очень тяжёлый, медленный, земля трясётся.
Вид — строго сбоку (профиль), персонаж смотрит ВПРАВО; влево Claude получит зеркалом. Сначала цельная фигура
в риг-позе (якорь), затем по этому якорю — лист отдельных целых деталей для скелетной анимации (как у героя в
`assets/characters/hero/parts/hero_side_*.png`).

## Референсы (читать/смотреть)
- `assets/characters/hero/concept/hero_side_rigpose.png` — масштаб героя (босс в 2,5 раза выше)
- `docs/GAME_DESIGN.md` — механика конечностей и осколков
- `assets/characters/hero/concept/hero_side_rigpose.png` — образец риг-позы и стиля вида сбоку
- `assets/characters/hero/parts/hero_side_head-arm-leg.png`, `hero_side_torso-cape.png`, `hero_side_arms-leg.png` — образец того, как выглядит лист деталей

## Промпт для генерации

### Шаг 1 — якорь (риг-поза)
ONE full-body pixel-art sprite of the STONE GUARDIAN boss, transparent PNG 2048x2048: a colossal golem built from
massive weathered dark-grey granite blocks with mossy cracks, bound by rusted iron bands and chains, glowing cold-blue
runes and digits carved into the stone (the same stone as the arena floor tiles), a small head sunk between huge
shoulders with two glowing blue eye slits, enormous blocky arms with stone fists, thick pillar legs with flat stone
feet. Heavy, ancient, monolithic. About 2.5 times the hero's height: ≈1850 px tall in the 2048 canvas, soles at y≈1980.
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
7. STUMPS — four broken stump caps (shoulder stump near, shoulder stump far, hip stump near, hip stump far): jagged
   broken stone surfaces with cracks and a faint blue glow inside, each shaped to sit exactly where the limb meets the
   torso, so the torso looks natural when a limb is destroyed.
Every part is complete, including areas normally hidden by other parts (top of the thigh under clothing, shoulder under
armour, the back of the torso under a cape), with rounded ends at the root joints so they can rotate under the body.
Limbs are drawn STRAIGHT and VERTICAL, root joint (shoulder / hip) at the TOP, foot or hand at the bottom.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.
True transparent background.

## Выходные файлы (строго по этим путям)
- `assets/bosses/stone-guardian/guardian_side_rigpose_v1.png` — якорь, 2048×2048
- `assets/bosses/stone-guardian/guardian_side_parts_v1.png` — лист деталей, 3072×2048

## Требования
- Камень и руны в той же манере, что пол арены (задача 012) — Codex, если 012 уже сделана, используй её пол как референс.
- В «Результате» перечисли детали на листе с прямоугольниками x, y, w, h (как в задаче 003).
- Если якорь получился не в профиль или с перекрытиями, переделай и сохрани `_v2`; то же для листа.

## Результат
- `assets/bosses/stone-guardian/guardian_side_rigpose_v1.png` — PNG 2048×2048, прозрачный фон. Высота силуэта 1850 px, нижняя подошва на y=1980. Первый вариант.
- `assets/bosses/stone-guardian/guardian_side_rigpose_v2.png` — PNG 2048×2048, прозрачный фон. Высота силуэта 1850 px, нижняя подошва на y=1980. Выбранный вариант.
- `assets/bosses/stone-guardian/guardian_side_parts_v1.png` — PNG 3072×2048, прозрачный фон. 10 деталей, минимальный зазор по прямоугольникам 88 px. Первый вариант.
- `assets/bosses/stone-guardian/guardian_side_parts_v2.png` — PNG 3072×2048, прозрачный фон. 10 деталей, минимальный зазор по прямоугольникам 88 px. Выбранный вариант.
- Выбраны якорь и лист v2. Голубая гравировка и гранит сверены с `assets/environment/arena25d/floor.png`. Ближнее предплечье отделено от корпуса, пояс и цепь читаются. Наплечник с цифрой 7 находится на отдельной руке. В листе четыре самостоятельные культевые накладки. Критик измерил зазор у ближней руки 49–113 px на проверенных строках. Дальняя кисть местами примыкает к боковой пластине бедра.
- Размеры деталей откалиброваны по видимым ориентирам якоря. Под одеждой и бронёй длины восстановлены по пропорциям, точное совпадение скрытых участков 1:1 не подтверждено.
- Выбранные PNG открыты и проверены в отдельном превью Chrome. Координаты указаны от левого верхнего угла, в пикселях.

`guardian_side_parts_v1.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 2168 | 40 | 300 | 300 |
| Торс | 933 | 40 | 461 | 920 |
| Ближняя рука | 1482 | 40 | 275 | 900 |
| Дальняя рука | 1845 | 40 | 235 | 875 |
| Ближняя нога | 40 | 40 | 375 | 970 |
| Дальняя нога | 503 | 40 | 342 | 945 |
| Культя ближнего плеча | 2556 | 40 | 215 | 235 |
| Культя дальнего плеча | 2859 | 40 | 173 | 210 |
| Культя ближнего бедра | 2556 | 363 | 200 | 205 |
| Культя дальнего бедра | 2844 | 363 | 175 | 190 |

`guardian_side_parts_v2.png`

| Деталь | x | y | w | h |
|---|---:|---:|---:|---:|
| Голова | 2179 | 40 | 303 | 300 |
| Торс | 933 | 40 | 472 | 920 |
| Ближняя рука | 1493 | 40 | 275 | 900 |
| Дальняя рука | 1856 | 40 | 235 | 875 |
| Ближняя нога | 40 | 40 | 375 | 970 |
| Дальняя нога | 503 | 40 | 342 | 945 |
| Культя ближнего плеча | 2570 | 40 | 209 | 235 |
| Культя дальнего плеча | 2570 | 363 | 173 | 210 |
| Культя ближнего бедра | 2831 | 363 | 198 | 205 |
| Культя дальнего бедра | 2179 | 428 | 171 | 190 |

<details>
<summary>Промпты встроенного imagegen</summary>

**Якорь**

Game character reference for cutout rigging. ONE 2048×2048 transparent PNG. STONE GUARDIAN. Colossal stocky ancient golem formed from huge cracked dark blue-grey granite blocks. Use image 1 as exact stone, moss and luminous cold cyan incised numeral/rune material reference. Huge blocky shoulders and thick arms with square stone hands, small embedded granite head with cold blue eye slit, thick pillar legs and flat stone feet. Rusted iron bands and occasional chains. Heavy and monolithic, broad low chest, never humanoid metal armor. The head must be visibly complete enough to separate later. Image 2 controls pixel style, scale and profile angle. Strict 90-degree RIGHT-FACING SIDE PROFILE, no three-quarter or front view. Nose/beak and BOTH toes point SCREEN RIGHT, only the near eye visible. Neutral upright cutout rig pose with both feet planted on exactly one baseline, straight legs gently staggered horizontally so each leg and foot has a visible transparent gap below the hips. Keep the near arm lowered slightly forward of the body toward screen right and the far arm lowered slightly behind toward screen left, open empty hands, elbows almost straight. Distinct transparent gaps between forearms and trunk; both arms visible below shoulder attachments, far side somewhat darker. Only one full figure, entire head to toes with margins, no action pose. Approximate visible height 1850 px, lowest sole near y=1980, centered. Crisp high-detail dark-fantasy pixel art matching the hero, square pixel clusters, dark outlines and restrained stepped upper-left lighting. True transparent background, no cast shadow, backdrop, floor, text, label, or frame.

**Правка якоря**

Edit ONLY the position of the four limbs of the Stone Guardian in image 1. Lock the head, torso, narrow true SIDE PROFILE facing RIGHT, bulky granite construction, cyan etched 7 and 2, moss, iron bands and chains, lighting and material. Image 2 demonstrates the needed slight limb spread in a strict side rig stance; image 3 granite. Open a modest wide stance: shift the rear leg and rear foot to SCREEN LEFT and the near leg and near foot to SCREEN RIGHT, both upright, toes pointing right, both soles on the exact same horizontal line, full clear transparent space between legs AND boots. Bring the full near arm a little forward so its wrist and hand hang outside the belt and torso with an open transparent wedge from below shoulder. Far arm stays behind toward left. Keep all joints physically connected. No torso overlap below shoulders. Same truly side-on camera with chest front occluded. One complete centered sprite, same size and design, transparent square PNG.

**Зазор у руки**

Precise pose correction to the exact image 1 Stone Guardian. Lock the right-facing 90-degree SIDE camera, head, torso and both feet and their present gap. Adjust only the near arm on screen right. Its etched 7 shoulder must stay attached, but place it at the forward contour of the shoulder/chest, slightly further right; lower the arm from there so a continuous EMPTY transparent wedge separates the full elbow, forearm, and hand from the breast, belt and hanging chain. Leave the chain itself visible against the torso. Keep the arm the same heavy granite length, iron bands and same neutral downward direction, with joints physically connected. Do not move or change the far arm, body, legs, head, runes, pose orientation or profile. Same centered transparent square sprite, no haze, no background.

**Лист деталей**

Rigging parts sheet for the EXACT same figure in image 1, still pure side profile facing screen RIGHT. Transparent PNG 3072×2048, same pixel scale as the anchor, same side orientation and lighting. EXACTLY 10 parts: 1 HEAD with short neck stub; 2 TORSO with fully drawn pelvis, neck and shoulders but NO separate limb pieces attached; 3 complete NEAR ARM vertical with rounded shoulder at top, whole hand at bottom; 4 complete darker FAR ARM vertical with whole hand; 5 complete NEAR LEG vertical from rounded full hip (including the hidden part under clothing) to right-facing flat sole; 6 complete darker FAR LEG likewise; extras: EXACTLY FOUR distinct jagged broken STUMP CAPS with dim cold blue interior cracks: near shoulder, far shoulder, near hip, far hip. Arrange these FOUR small isolated pieces across the upper-right with extra space. Granite head with blue eye slit. Torso is complete massive blocky granite breast and pelvis with no arms attached. Arm & leg colors, glowing cyan incised digits and geometric runes, moss, iron bands and chains match selected anchor and arena stone. Each leg and forearm is one whole part. The caps are only fractured root interface surfaces, not extra limbs. Lay out in two loose rows with each object isolated: top left-to-right head, torso and garment/accessory parts; bottom left-to-right near arm, far arm, near leg, far leg. Place the sword, if requested, isolated and complete at far right. Four stump caps, if requested, form a clear row to the right of the torso. Transparent gutters at least 80px. No other pieces, no overlapping. Arms and legs straight and vertical, all root joints rounded and whole. No backdrop, text, numbers as labels, frame, shadow or pose diagram. Retain high-detail crisp pixel clusters and dark fantasy shading from the anchor; image 2 only sets general game art style.

**Правка листа**

Precise local revision of this exact ten-part transparent side-view granite guardian sheet. Image 2 is the selected profile anchor. The cyan '7' granite pauldron is wrongly attached to the isolated torso in image 1. Transfer that EXACT big cyan '7' shoulder cap to the top of the existing NEAR ARM (leftmost complete arm, bottom row), replacing its generic spherical shoulder top and keeping the hand and lower arm intact. On the torso erase only the upper-arm parts and rebuild a continuous rounded plain granite shoulder attachment surface, so it is torso only; keep its exact neck, stone breast, belt, chains, skirt and pelvis. Four separate broken blue-veined stump caps stay unchanged in the top row. Keep the original seven other parts unchanged, notably both intact booted legs, head and far arm. Exactly ten separate components, side profile, no background or labels, same crisp pixels and teal granite. Keep all parts isolated.

</details>
