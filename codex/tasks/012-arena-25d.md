---
id: 012
title: Арена 2,5D — слои фона, пол, передний план, реквизит
status: pending
created_by: claude
---

## Цель
Игра — сайд-скроллер с лёгкой глубиной (2,5D): бой идёт влево-вправо, но по полу можно немного пройти вверх-вниз
(полоса пола видна чуть сверху). Нужна новая арена под этот вид: несколько слоёв для параллакса, полоса пола и
реквизит. Камера смотрит сбоку и немного сверху (около 20°), ортографично.

## Референсы (читать/смотреть)
- `assets/characters/hero/concept/hero_side_rigpose.png` — герой, масштаб: рост героя ≈ 1/3 высоты экрана 1080
- `docs/ART_STYLE.md`, `docs/GAME_DESIGN.md`

## Промпт для генерации
Setting for all layers: an ancient ruined stone arena of a forgotten dark kingdom at night — a circular sunken plaza of
huge weathered granite tiles with faintly glowing cold-blue engraved digits and runes, broken colonnades, arches and
statues around it, chains, iron braziers with blue-white fire, a pale moon behind drifting clouds and mist.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.

1. `bg_far.png` 3840×1080, OPAQUE: sky with moon and clouds, distant silhouettes of a ruined citadel and mountains,
   very low contrast, cold blue-violet. Must tile seamlessly horizontally (left edge continues the right edge).
2. `bg_mid.png` 3840×1080, TRANSPARENT above the skyline: the arena's back wall — broken colonnade, arches, a giant
   cracked statue, hanging chains and braziers. Its bottom edge ends at about y=700 where the floor begins. Tiles
   seamlessly horizontally.
3. `floor.png` 1920×480, OPAQUE: the walkable floor band seen from slightly above: rows of large granite tiles getting
   very slightly smaller toward the top edge (far side), engraved glowing digits on some tiles, cracks, moss, a few
   puddles reflecting blue light. Seamless horizontally. The top edge meets the back wall, the bottom edge is the
   near rim of the arena.
4. `fg.png` 3840×420, TRANSPARENT: sparse foreground silhouettes in front of the floor (broken pillar stumps, roots,
   fallen stones, grass tufts), dark, slightly blurred-looking by low contrast, mostly empty so the action stays visible.
   Tiles seamlessly horizontally.
5. `props.png` 2048×2048, TRANSPARENT sheet with wide gaps (≥80 px), separate objects:
   a) THE MONOLITH — a tall dark obelisk with an empty smooth rectangular panel in its middle (the equation will be
      written there by code) and sockets around the panel where digit shards are placed; 600 px tall;
   b) an iron brazier with blue-white fire (fire as a separate piece next to it);
   c) a broken column piece; d) a pile of rubble; e) a stone statue fragment; f) a hanging chain segment.
6. `gate_left.png` and `gate_right.png` 1024×1536, TRANSPARENT: massive closed stone gates that end the arena on the
   left and on the right (mirror images are fine).

## Выходные файлы (строго по этим путям)
- `assets/environment/arena25d/bg_far.png`, `bg_mid.png`, `floor.png`, `fg.png`, `props.png`, `gate_left.png`, `gate_right.png`

## Требования
- Бесшовность по горизонтали для bg_far, bg_mid, floor, fg — проверь, склеив картинку саму с собой.
- Пол и камень — та же порода и те же светящиеся цифры, что потом будут на осколках (задача 013).
- В «Результате» — прямоугольники объектов листа props.

## Результат
(заполняет Codex)
