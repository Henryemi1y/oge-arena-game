---
id: 003
title: Герой 3/4 — листы деталей для скелета (лицом к камере и спиной)
status: pending
created_by: claude
depends_on: 002 (запускать после того, как Claude проверит результат 002)
---

## Цель
Получить тот же персонаж из задачи 002, разобранный на отдельные ЦЕЛЫЕ детали, включая места, которые на цельной
фигуре закрыты (верх бедра под туникой, плечо под наплечником, плащ за спиной). Из этих деталей Claude соберёт скелет:
руки и ноги — двухкостные (плечо–локоть, бедро–колено), голова и плащ — отдельно.

## Референсы (читать/смотреть)
- `assets/characters/hero/sheets/hero_34front_rigpose_v1.png` (или `_v2`, если в 002 выбран он) — якорь для листа 1
- `assets/characters/hero/sheets/hero_34back_rigpose_v1.png` (или `_v2`) — якорь для листа 2
- `assets/characters/hero/parts/hero_side_*.png` — пример того, как выглядит готовый лист деталей (вид сбоку)

## Промпт для генерации

### Лист 1 — детали 3/4 лицом к камере
Use case: character PART SHEET for cut-out skeletal animation. Use the attached 3/4 front anchor as the authority: the
EXACT same character, same 3/4 angle, same pixel scale (1 pixel of a part = 1 pixel of the anchor), same palette and
shading. Transparent PNG 2048x1536.
Split the character into these SEPARATE, COMPLETE parts, laid out in a loose grid with WIDE transparent gaps (at least
80 px between any two parts, nothing touching, nothing overlapping):
1. HEAD: hood and face with a short neck stub at the bottom, exactly as on the anchor.
2. TORSO: chest, tunic, belt and pelvis WITHOUT arms, legs, head and cape; the cowl at the shoulders stays on the torso.
   Shoulder sockets and hip area are fully drawn (no holes where the limbs were). Tunic hem as on the anchor.
3. CAPE: the whole cape on its own, complete from the shoulders to the ragged hem, including the parts normally hidden
   behind the body, seen from the same 3/4 angle, hanging straight.
4. NEAR ARM (hero's left): one complete straight arm, hanging vertically, shoulder joint at the TOP: pauldron, bandaged
   upper arm, elbow, bracer, gloved open hand at the bottom. Elbow straight.
5. FAR ARM (hero's right): the same but as the far arm appears in this view (slightly darker, the side we see is the
   inner/back side), straight and vertical, shoulder at the top.
6. NEAR LEG: one complete straight leg, vertical, hip joint at the TOP: the full thigh including the top part normally
   hidden under the tunic, knee guard, shin plate, boot at the bottom, sole flat.
7. FAR LEG: the same for the far leg as it appears in this view (slightly darker), vertical, hip at the top.
Every part must be complete and clean at its ends: no cut-off edges, no fragments of neighbouring parts, rounded ends at
the shoulder and hip so they can rotate under the torso. Keep the exact costume design; no new details.
Style: same crisp high-detail dark-fantasy pixel art, dark outlines, light from the upper left. True transparent
background, no labels, no numbers, no text, no frame, no shadow.

### Лист 2 — детали 3/4 спиной
Same prompt and same parts list, but use the 3/4 BACK anchor: HEAD is the back of the hood (no face); TORSO is the back
(shoulder blades, back of the tunic and belt) without arms, legs, head and cape; CAPE is the full back of the cape;
arms and legs seen from behind (backs of the pauldrons, bracers, backs of the knees and boots).

## Выходные файлы (строго по этим путям)
- `assets/characters/hero/sheets/hero_34front_parts_v1.png` — лист 1, 2048×1536
- `assets/characters/hero/sheets/hero_34back_parts_v1.png` — лист 2, 2048×1536

## Требования
- Ровно 7 деталей на каждом листе, порядок раскладки любой; в «Результате» перечисли, где какая деталь (примерный прямоугольник x,y,w,h).
- Масштаб деталей строго как у якоря (руки и ноги той же длины, что на цельной фигуре).
- Конечности прямые и вертикальные, корневой сустав (плечо, бедро) сверху.
- Прозрачный фон, зазоры ≥80 px, детали не касаются друг друга.
- Если деталь получилась неполной или слипшейся с соседней, переделай лист и сохрани как `_v2`.

## Результат
(заполняет Codex)
