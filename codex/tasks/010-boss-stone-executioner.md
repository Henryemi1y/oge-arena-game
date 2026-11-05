---
id: 010
title: Босс «Каменный палач» — вид сбоку: риг-поза и лист деталей
status: pending
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
(заполняет Codex)
