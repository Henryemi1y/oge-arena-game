---
id: 003
title: Герой 3/4 — листы деталей для скелета (лицом к камере и спиной)
status: done
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
- Якоря из завершённой 002 — `hero_34front_rigpose_v2.png` и `hero_34back_rigpose_v1.png`. Перед началом 003 их проверил независимый критик Codex.
- `assets/characters/hero/sheets/hero_34front_parts_v1.png` — PNG 2048×1536, 7 отдельных деталей, прозрачный фон. Минимальный промежуток по ограничивающим прямоугольникам 101 px. Первый вариант.
- `assets/characters/hero/sheets/hero_34back_parts_v1.png` — PNG 2048×1536, 7 отдельных деталей, прозрачный фон. Минимальный промежуток по ограничивающим прямоугольникам 96 px. Первый вариант.
- `assets/characters/hero/sheets/hero_34front_parts_v2.png` — PNG 2048×1536, 7 отдельных деталей, прозрачный фон. Минимальный промежуток по ограничивающим прямоугольникам 101 px. Выбран для сборки.
- `assets/characters/hero/sheets/hero_34back_parts_v2.png` — PNG 2048×1536, 7 отдельных деталей, прозрачный фон. Минимальный промежуток по ограничивающим прямоугольникам 101 px. Выбран для сборки.
- Передний v2 сохраняет цельное полотно шириной 552 px, убирает с торса дубли наплечников и оставляет ворот на торсе. Задний v2 убирает крупные пряжки дальней руки и добавляет скругление краёв бедра.
- Независимый критик сверил тело, одежду и броню с якорями. У задних бёдер остаются короткие плоские участки сверху, ткань для нахлёста под туникой сохранена. Нижние складки заднего капюшона при сборке заходят под ворот.
- Размеры откалиброваны по видимым ориентирам якорей и оценке закрытых участков, затем детали разложены методом ближайшего соседа. Попиксельное совпадение масштаба скрытых частей не подтверждено. Все листы проверены по альфа-каналу, фон имеет альфу 0, детали — 255.

Координаты прямоугольников в пикселях указаны в порядке `x, y, w, h` от левого верхнего угла.

| Деталь | Передний v1 | Задний v1 | Передний v2 | Задний v2 |
|---|---|---|---|---|
| Голова | 170, 1036, 215, 255 | 170, 1036, 233, 246 | 170, 1036, 246, 255 | 170, 1036, 245, 246 |
| Торс | 706, 64, 328, 540 | 706, 64, 280, 530 | 706, 64, 300, 540 | 706, 64, 282, 530 |
| Цельный плащ | 48, 56, 350, 875 | 48, 56, 385, 836 | 48, 56, 552, 875 | 48, 56, 407, 836 |
| Ближняя рука | 706, 720, 149, 588 | 706, 720, 139, 568 | 706, 720, 149, 588 | 706, 720, 146, 568 |
| Дальняя рука | 956, 720, 126, 546 | 956, 720, 144, 510 | 956, 720, 125, 546 | 956, 720, 139, 510 |
| Ближняя нога | 1196, 116, 207, 744 | 1196, 116, 232, 748 | 1196, 116, 183, 744 | 1196, 116, 219, 748 |
| Дальняя нога | 1535, 116, 233, 665 | 1535, 116, 148, 650 | 1535, 116, 213, 665 | 1535, 116, 147, 650 |

<details>
<summary>Промпты встроенного imagegen для выбранных вариантов</summary>

**Передний лист v2**

Perform a precise revision of image 1, an existing transparent 7-piece 3/4 FRONT pixel-art parts sheet. Image 2 is the exact front anchor. Preserve the seven-sprite layout, exact face/hood, two independent open-handed vertical arms, and both complete booted legs. Change ONLY the specified attachment areas and cape width:
1. TOP MIDDLE TORSO: remove BOTH steel shoulder pauldrons and BOTH brown tubular upper-arm cuffs from this piece. They already belong to the detached arms below and must be visible ONLY on those arms. Reconstruct the upper torso as filled plain blue cloth with rounded shoulder roots; keep its original blue folded shoulder cowl, chest, belt buckle and split tunic. No arm, metal, cuff or empty armhole on the torso.
2. FAR LEFT CAPE: one single broad continuous full cloth behind both legs, with inner folds and the same ragged pointed hem. Remove the thick rolled collar from its top because the cowl is already on the torso. Simple covered shoulder attachment edge only. Widen this cape at its lower drape to about 57% of its height, as on the hero in image 2; keep the same height, same inner blue color, wide connected middle. It is a full cape, not a narrow strip. Keep it isolated from other pieces.
3. BOTTOM LEFT HEAD: keep exact hood and face and finish it with only a short dark cloth neck overlap; omit any separate thick cowl duplicating the one on the torso.
Keep both separate arm sprites entirely intact, with the rounded silver caps and matching leather beneath. Preserve authentic 3/4 orientation, scale, straight limbs and top-left light. Exactly seven complete nonoverlapping parts on a transparent 2048x1536 landscape sheet, ample empty gutters. No text or shadow.

**Задний лист v2**

Precisely edit image 1's existing seven-sprite 3/4 BACK pixel-art parts sheet. Image 2 is the exact rear hero anchor. Retain the image 1 layout, single broad one-piece exterior cape and its same ragged lower edge, back hood, rear belt/tunic, all limbs and original styles. Only correct the following rig attachment details:
- Both right-hand legs have improperly flat chopped thigh tops. Redraw just the top 65px of EACH thigh into a complete rounded fabric hip overlap that rotates under the tunic, thick charcoal fabric, no skin and no open hole. Preserve the total height, kneecap edge, greave, straps and original rear-facing boots, straight leg axes.
- On the left isolated cape, remove the thick separate rolled shoulder collar. End the cape at a plain shoulder attachment edge with blue fabric continuity; keep the same length, width and its full unbroken ragged hem. The layered cowl stays exclusively on the isolated middle torso.
- Fill the torso's circular shoulder socket with plain dark blue cloth, maintaining the blue cowl and back of the tunic and belt. No separate attached arm or pauldron on the torso. Keep the isolated rear head at bottom left, with the hood and a short covered neck stub instead of a duplicate cowl.
- The middle FAR arm from behind has exaggerated silver rectangular buckles and stud in image 1. Use the quieter leather straps and darkened visible rim of the same rear armor in image 2; keep its same length, thickness, rounded pauldron and relaxed OPEN glove. Keep the complete near arm intact.
Seven fully isolated sprites, real alpha background, crisp original high-detail square-pixel treatment, no shadow, text or extra detail. Landscape 2048x1536.

</details>
