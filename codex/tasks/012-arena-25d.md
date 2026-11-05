---
id: 012
title: Арена 2,5D — слои фона, пол, передний план, реквизит
status: done
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
- `assets/environment/arena25d/bg_far.png` — PNG 3840×1080, непрозрачный слой.
- `assets/environment/arena25d/bg_mid.png` — PNG 3840×1080, прозрачный фон.
- `assets/environment/arena25d/floor.png` — PNG 1920×480, непрозрачный слой.
- `assets/environment/arena25d/fg.png` — PNG 3840×420, прозрачный фон.
- `assets/environment/arena25d/props.png` — PNG 2048×2048, прозрачный фон.
- `assets/environment/arena25d/gate_left.png` — PNG 1024×1536, прозрачный фон.
- `assets/environment/arena25d/gate_right.png` — PNG 1024×1536, прозрачный фон.
- У стены нижний видимый ряд на y=699. Ворота справа зеркально повторяют левые. Высота монолита 600 px, панель пуста, пламя отделено от жаровни.
- Экспорт в точный размер выполнен ближайшим соседом. Для горизонтального повтора края дальнего плана, стены и пола сведены через перекрытие; края переднего плана прозрачные.
- В Chromium собраны слои с героем и реквизитом, проверены четыре положения камеры и попарная склейка всех четырёх повторяемых слоёв. Средняя разница RGBA на стыке: дальний план 0,347; стена 0,339; пол 3,409; передний план 0 (шкала 0–255). Это проверка арт-слоёв в отдельном превью.
- Независимый критик сверил материал и раскладку. После замечания выровнена внутренняя плоскость панели монолита.

Прямоугольники `props.png` от левого верхнего угла в пикселях.

| Объект | x | y | w | h |
|---|---:|---:|---:|---:|
| Монолит | 110 | 120 | 445 | 600 |
| Жаровня | 760 | 250 | 297 | 353 |
| Пламя | 1330 | 235 | 181 | 280 |
| Обломок колонны | 120 | 960 | 265 | 512 |
| Куча обломков | 1120 | 955 | 378 | 502 |
| Фрагмент статуи | 1745 | 960 | 55 | 500 |
| Цепь | 585 | 1190 | 340 | 236 |

<details>
<summary>Промпты встроенного imagegen</summary>

**bg_far**

Ancient ruined stone arena of a forgotten dark kingdom at night, a 2.5D side-scrolling game camera approximately 20 degrees above horizontal, nearly orthographic. Match the attached hero reference's crisp square pixel clusters, stepped material shading, charcoal navy shadows, muted cold steel and blue palette, upper-left light. This image is a single environment layer; do not draw the hero, any character, interface, borders, text labels, or watermark. DISTANT BACKGROUND only, extreme ultra-wide 32:9 panorama, opaque to all edges, 3840×1080. Pale moon behind blue-violet wispy clouds well away from the edges, misty distant mountains, very low contrast silhouette of a crumbling citadel distant in the center-left and sparse ruins on the horizon. Dark blue-violet night with an unobtrusive evenly lit backdrop for foreground action, subtler contrast than hero. Sky fills top half. Lower half remains dark mist and distant silhouetted terrain, with no arena walls or foreground. Horizontally seamless repeating panorama: matching blue tones and matching silhouette heights at the two outer edges, with continuous low mist/cloud bands, no moon, tower or distinctive object crossing the repeat seam. Soft clouds drawn in crisp visible pixel clusters.

**bg_mid**

Environment for the same ancient ruined dark-fantasy stone arena at night. Match image 1's blue charcoal granite, chips, cracks and crisp pixel-art clusters, muted moonlit palette, and image 2's high-detail stepped sprite shading, dark outline, light from top-left. Orthographic 2.5D camera roughly 20 degrees above horizontal. No characters, text, labels, border or frame. One single ultra-wide 32:9 middle parallax layer, 3840x1080, actual transparent alpha above the skyline, through open arches, and below the straight wall base. An ancient granite arena back wall with a low continuous straight masonry plinth and broken colonnade, eroded arches, hanging thin iron chains, two dim blue-white flame braziers, and one huge cracked old statue near the middle-left. Silhouette rises irregularly, with mostly empty open air across the upper part; no sky or mountains in this layer. Seamless horizontal tile: at the two outside margins use plain repetitive low flat dark stone base wall of the same height and brick rows; keep pillars, tall structures, braziers and statue away from the seams. Lower edge straight to meet a separate floor layer at y≈700 of final canvas. No stone ground plane, no front rim, no glow behind the skyline.

**floor**

Ancient ruined stone arena of a forgotten dark kingdom at night, a 2.5D side-scrolling game camera approximately 20 degrees above horizontal, nearly orthographic. Match the attached hero reference's crisp square pixel clusters, stepped material shading, charcoal navy shadows, muted cold steel and blue palette, upper-left light. This image is a single environment layer; do not draw the hero, any character, interface, borders, text labels, or watermark. FLOOR TEXTURE ONLY. Very wide shallow horizontal strip, target aspect ratio 4:1, 1920×480. Opaque entire canvas. Camera sees a walkable band of large weathered dark cool-gray granite tiles, orderly horizontal rows, tiles subtly smaller in the top rows, parallel side-scroller alignment, no converging perspective. Empty walkable center, some fine cracks, small moss and tiny puddles reflecting blue moonlight. A few large recessed cold-cyan glowing engraved SINGLE numerals such as 2, 3, 5, 7, 8 on individual tiles in a unified angular stonecut design, plus faint geometric rune marks. No characters, walls, horizon or foreground objects. Top edge is the far floor boundary; the bottom edge has a low dark rough stone curb. The tile and its mortar rows are horizontally periodic; the far LEFT and RIGHT borders have precisely the same floor row elevations, tile material tone and pattern continuation. Put the brighter numeral tiles safely away from left/right seams. Full bleed opaque stone.

**fg**

Ancient ruined stone arena of a forgotten dark kingdom at night, a 2.5D side-scrolling game camera approximately 20 degrees above horizontal, nearly orthographic. Match the attached hero reference's crisp square pixel clusters, stepped material shading, charcoal navy shadows, muted cold steel and blue palette, upper-left light. This image is a single environment layer; do not draw the hero, any character, interface, borders, text labels, or watermark. FOREGROUND OVERLAY ONLY, extreme 9:1 panoramic horizontal game overlay strip, 3840×420 target. Actual alpha transparent above and between isolated sparse low dark silhouettes: just two broken short pillar stumps of different heights, a few small fallen weathered granite stones, tough roots and tiny grass tufts rooted along the bottom line. Use charcoal-blue low contrast, silhouettes stay short and broadly separated, over 70% empty transparent, no continuous opaque wall, no floor or sky, no fog painted in empty pixels. Make both outer edges empty alpha across the full height so the horizontal repeats meet invisibly. All objects rest near the very bottom and stay well within the central 88% of the width, with generous transparent padding on both ends. No tall obstruction to gameplay. One foreground layer.

**props**

Environment for the same ancient ruined dark-fantasy stone arena at night. Match image 1's blue charcoal granite, chips, cracks and crisp pixel-art clusters, muted moonlit palette, and image 2's high-detail stepped sprite shading, dark outline, light from top-left. Orthographic 2.5D camera roughly 20 degrees above horizontal. No characters, text, labels, border or frame. An isolated props sprite sheet on true transparent alpha, square 2048×2048 target. EXACTLY seven separate complete components, in a loose two-row grid with over 100px transparent gutters and no contacts. Top row left to right: (1) MONOLITH, one tall broad dark stone obelisk (about 600px tall), middle contains a large plain empty rectangular slate panel, totally blank for runtime equation, exactly four small empty round stone sockets around it, no symbols or digits on panel; (2) a standalone dark wrought iron brazier on legs, bowl EMPTY with no fire; (3) a single standalone blue-white flame sprite sized for the brazier bowl, no base and no detached sparks. Bottom row left to right: (4) an upright broken fluted column segment with stone base; (5) a low compact pile of broken stone rubble; (6) a broken colossal human stone statue fragment, head and part of shoulders as ONE stone object; (7) a thin hanging vertical iron chain with connected links. Distinct silhouettes and generous empty space. All items entirely visible. No baked shadows on background, no stand or floor under objects, no eighth object.

**props_revision**

Precise edit of only the top-left monolith in this seven-object transparent pixel-art props sheet. Keep the other six sprites pixel-identical and isolated. Make the monolith's central inset a truly blank smooth matte slate rectangle for code to render an equation: remove cracks and busy mottling INSIDE the panel only. Keep the bevel, all four existing empty sockets around it, granite body, color palette, size and whole pedestal. Restore the very tip of the irregular crown and provide a small transparent margin above the monolith so the entire crown is visible. Same crisp pixels, no markings or text. Exactly seven independent objects and transparent background.

**gate_left**

Environment for the same ancient ruined dark-fantasy stone arena at night. Match image 1's blue charcoal granite, chips, cracks and crisp pixel-art clusters, muted moonlit palette, and image 2's high-detail stepped sprite shading, dark outline, light from top-left. Orthographic 2.5D camera roughly 20 degrees above horizontal. No characters, text, labels, border or frame. One complete standalone MASSIVE CLOSED STONE ARENA GATE, vertical transparent 1024×1536 sprite. It is the left boundary gate. A heavy tall closed cracked granite double door under a deep broad old stone arch, layered masonry lintel and squat buttresses, iron fittings, restrained cold-blue recessed geometric runes around the arch, no text and no numbers on the door. Slight inward angle so right inner jamb faces into the arena; use a largely flat side-on orthographic projection with a little visible depth, not perspective. Bottom straight at stone floor level, fully visible with margins. Only the gate assembly, no surrounding wall beyond the narrow buttresses, no floor or backdrop, no free-standing objects or shadow. True transparent outside the silhouette.

</details>
