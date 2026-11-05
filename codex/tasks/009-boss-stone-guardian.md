---
id: 009
title: Босс «Каменный страж» — вид сбоку: риг-поза и лист деталей
status: pending
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
(заполняет Codex)
