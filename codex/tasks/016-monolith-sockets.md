---
id: 016
title: Монолит со слепками под камни и камни-осколки, которые в них входят
status: pending
created_by: claude
---

## Цель
Сейчас на монолите — тёмный «экран» и квадратные ячейки для цифр, это выглядит по-детски. Нужен каменный монолит,
в лицевой грани которого вырезаны углубления-слепки ровно по форме выпадающих камней-осколков. Игрок приносит камень
с цифрой и вставляет его в слепок. Пример (уравнение) и слова игра будет «гравировать» по камню сама, поэтому на
монолите нужна гладкая отёсанная полоса камня под надпись — без рамки-экрана.

## Референсы (читать/смотреть)
- `assets/environment/arena25d/props.png` — текущий монолит (верхний левый) — что не так: экран и квадратные ячейки
- `assets/fx/shards.png` — текущие осколки (форма камней)
- `assets/environment/arena25d/floor.png` — камера (вид сбоку, чуть сверху ≈ 20°) и камень пола
- `docs/ART_STYLE.md`

## Промпт для генерации
Same high-detail dark-fantasy pixel art as the references, same camera as the floor (side view, about 20 degrees from
above), cold moonlight from the upper left, soft contact shadow on the floor to the lower right. No text, no letters,
no digits, no frame, no watermark.

1. `monolith_v2.png` 1024×1536, transparent background: an ancient weathered granite monolith standing on a stepped
   plinth on the floor (base on the floor plane, top of the plinth visible). Its front face has: a smooth dressed
   horizontal band in the upper half (empty, for an engraved inscription), and below it a row of FOUR empty sockets —
   rough recessed hollows cut into the stone, each shaped exactly like one of the stones below (irregular faceted
   pentagon/hexagon outlines), with inner shadow and chipped edges, faint cold-blue glow at the bottom of each hollow.
   Moss in cracks, chips on the corners. Bottom of the plinth at 95 % of the image height.
2. `shard_stones.png` 1024×256, transparent: four loose stones in a row (each in a 256×256 cell, centered), the exact
   shapes of the four sockets, faceted granite with a flat polished front face (the game draws the digit on it),
   slightly lighter than the monolith.
3. `socket_mask.png` 1024×1536: the same canvas as the monolith; the four socket hollows filled solid white, everything
   else transparent — so the game knows where each socket is.

## Выходные файлы (строго по этим путям)
- `assets/environment/arena25d/v2/monolith_v2.png` — 1024×1536
- `assets/environment/arena25d/v2/shard_stones.png` — 1024×256
- `assets/environment/arena25d/v2/socket_mask.png` — 1024×1536

## Требования
- Формы слепков и камней совпадают (камень входит в слепок).
- Прозрачный фон; если не получается — ровный белый #FFFFFF, и написать об этом.
- Никакого текста и цифр на картинках.

## Результат
(заполняет Codex)
