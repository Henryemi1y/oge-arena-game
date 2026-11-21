---
id: 017
title: Каменный страж — детали по швам кладки, с запасом под суставами
status: done
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

- `assets/bosses/stone-guardian/guardian_side_parts_v2.png` — PNG 3072×2048.
- `assets/bosses/stone-guardian/guardian_side_parts_v2_map.png` — PNG 3072×2048.

Оба листа имеют одинаковый силуэт до пикселя. На цветовой карте 13 одноцветных деталей, минимальное расстояние между их прямоугольниками 126 px. Правосторонние руны 7 и 2 расположены на ближнем плече и голени соответственно. Границы для нарезки заданы от верхнего левого угла. При сборке наплечник закрывает верхний край торса. Прежний `tools/slice_chars.py` для этого пути использует таблицу целых конечностей из 009; для нового листа используется карта 017. Проверка выполнена для статического листа и карты, анимация суставов в движке не проверялась.

| Деталь | x | y | w | h | RGB |
|---|---:|---:|---:|---:|---|
| голова | 349 | 54 | 326 | 353 | `#FF4030` |
| грудь | 1320 | 54 | 433 | 508 | `#25BF54` |
| таз | 2353 | 54 | 415 | 458 | `#396FFF` |
| ближнее плечо | 196 | 688 | 376 | 495 | `#FDBB24` |
| дальнее плечо | 1012 | 688 | 280 | 481 | `#CF42EF` |
| ближнее предплечье с кистью | 1743 | 688 | 354 | 463 | `#27C5CA` |
| дальнее предплечье с кистью | 2547 | 688 | 282 | 471 | `#FF80AA` |
| ближнее бедро | 120 | 1340 | 272 | 537 | `#9182ED` |
| дальнее бедро | 640 | 1340 | 257 | 539 | `#B5D143` |
| ближняя голень | 1157 | 1340 | 247 | 537 | `#A96A36` |
| дальняя голень | 1690 | 1340 | 204 | 537 | `#FF7633` |
| ближняя стопа | 2122 | 1340 | 364 | 245 | `#427884` |
| дальняя стопа | 2628 | 1340 | 377 | 247 | `#EFF1ED` |
