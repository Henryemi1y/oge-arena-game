---
id: 017
title: Каменный страж — детали по швам кладки, с запасом под суставами
status: pending
created_by: claude
---

## Цель
Сейчас конечности стража режутся программой из цельной картинки, и на сгибах видно, что часть тела «отрезана».
Нужен новый лист деталей, где страж уже собран из отдельных каменных блоков, как настоящий голем: каждая деталь —
отдельный блок, граница проходит по шву или трещине, а на конце, который уходит под соседнюю деталь, есть запас камня
(закруглённый «шарнирный» край), чтобы при повороте не открывалась пустота.

## Референсы (читать/смотреть)
- `assets/bosses/stone-guardian/guardian_side_rigpose_v2.png` — страж, облик и пропорции брать отсюда
- `assets/bosses/stone-guardian/guardian_side_parts_v1.png` — старый лист деталей (как раскладывать)
- `docs/ART_STYLE.md`

## Промпт для генерации
The same stone guardian as the attached reference, same pixel-art style and lighting, side view facing right.
A parts sheet for cut-out animation: every body part is a separate stone block drawn on its own with transparent space
around it, nothing overlapping. Each part is bounded by natural seams of the masonry or cracks in the stone, not by a
straight cut. Where a part goes under its neighbour at a joint (shoulder, elbow, hip, knee, ankle, neck, waist) it has
an extra rounded stone end, like a ball joint, which will be hidden under the neighbour when assembled. Glowing runes
stay on the parts they belong to and are not mirrored. No text, no labels, no frame.

Parts (one each unless noted): head; chest/torso; pelvis block; upper arm ×2 (near and far, far one slightly darker);
forearm with fist ×2; thigh ×2; shin ×2; foot ×2.

## Выходные файлы (строго по этим путям)
- `assets/bosses/stone-guardian/guardian_side_parts_v2.png` — лист деталей, 3072×2048, прозрачный фон
- `assets/bosses/stone-guardian/guardian_side_parts_v2_map.png` — тот же лист, где каждая деталь залита своим
  чистым цветом (для автоматической нарезки), фон прозрачный

## Требования
- Прозрачный фон; если не получается — ровный белый #FFFFFF, и написать об этом.
- Детали не касаются друг друга (между ними хотя бы 24 px пустоты).
- В «Результат» — список деталей и где на листе каждая.

## Результат
(заполняет Codex)
