---
id: 007
title: Враг «Чумной доктор» — вид сбоку: риг-поза и лист деталей
status: pending
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
(заполняет Codex)
