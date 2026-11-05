---
id: 013
title: Эффекты: осколки с цифрами, трещины от шагов босса, пыль
status: done
created_by: claude
---

## Цель
Разрушенная конечность босса рассыпается на осколки с выгравированными цифрами (их собирает душа и кладёт на монолит).
От тяжёлых шагов босса по полу идут трещины и пыль.

## Референсы (читать/смотреть)
- `assets/environment/arena25d/floor.png` (если готово) — камень и стиль цифр должны совпадать с полом

## Промпт для генерации
1. `shards.png` 2048×512, TRANSPARENT: ten separate irregular granite shards (same stone as the arena floor), each about
   150 px, each with ONE engraved glowing cold-blue digit 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 (in this order left to right),
   clearly readable, wide gaps between shards. Plus two extra plain shards without digits at the end.
2. `cracks.png` 2048×512, TRANSPARENT: three different ground crack decals seen from slightly above (flat on the floor),
   radiating from an impact point, dark cracks with faint inner blue glow and small stone chips; each about 500×200.
3. `dust.png` 1536×256, TRANSPARENT: six frames of a dust/debris puff (left to right: start → dissipate), grey-brown,
   pixel-art, each frame 256×256, for footsteps and landings.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.

## Выходные файлы (строго по этим путям)
- `assets/fx/shards.png`, `assets/fx/cracks.png`, `assets/fx/dust.png`

## Требования
- Цифры на осколках крупные и читаемые даже при уменьшении до 48 px.

## Результат
- `assets/fx/shards.png` — PNG 2048×512. Двенадцать отдельных осколков, `0`–`9` слева направо и два пустых в конце. Все цифры визуально прочитаны на уменьшенных копиях с длинной стороной 48 px.
- `assets/fx/cracks.png` — PNG 2048×512. Три разных декали в порядке слева направо, полупрозрачное голубое свечение сохранено.
- `assets/fx/dust.png` — PNG 1536×256. Шесть кадров 256×256 от первого выброса до затухания, нижняя точка кадров выровнена.
- Фон прозрачный. Для камня и гравировки использован опубликованный `assets/environment/arena25d/floor.png` из 012.

| Объект | x | y | w | h |
|---|---:|---:|---:|---:|
| 0 | 11 | 184 | 148 | 145 |
| 1 | 182 | 179 | 148 | 155 |
| 2 | 354 | 177 | 144 | 158 |
| 3 | 523 | 178 | 148 | 156 |
| 4 | 694 | 179 | 148 | 154 |
| 5 | 864 | 178 | 148 | 156 |
| 6 | 1035 | 180 | 148 | 153 |
| 7 | 1206 | 178 | 148 | 156 |
| 8 | 1376 | 177 | 148 | 158 |
| 9 | 1547 | 178 | 148 | 156 |
| Пустой 1 | 1718 | 184 | 148 | 145 |
| Пустой 2 | 1888 | 184 | 148 | 144 |
| Трещина 1 | 101 | 160 | 480 | 192 |
| Трещина 2 | 754 | 155 | 540 | 202 |
| Трещина 3 | 1469 | 155 | 475 | 201 |

<details>
<summary>Промпты встроенного imagegen</summary>

**shards**

One transparent pixel-art sprite sheet for the same side-scrolling 2.5D dark-fantasy game as attached floor. Match the exact cold charcoal-blue granite, stepwise cyan incised light, crisp square pixel clusters and low contrast upper-left moonlight. Real transparent alpha between all sprites. No scene, ground rectangle, shadow plate, label, frame, numbers other than the requested digit engravings, or watermark. Single very wide horizontal strip, target 2048×512. Exactly TWELVE separate evenly spaced small chunky irregular dark granite collectible pieces on ONE horizontal row. Each silhouette about 150 pixels, clear empty gutters. The first ten pieces each bear ONE large readable bright icy cyan carved angular numeral on their broad upper face. Order left to right is EXACTLY 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, plain, plain. The two rightmost rocks are undecorated, no mark. Do not add number labels below rocks. Each digit fills most of its face so it remains readable at 48×48; no rotation or mirrored numeral, 6 and 9 clearly distinguishable. Use independent recognizable rock shapes but similar size. Very wide composition. Show all twelve completely, no crowding.

**cracks**

One transparent pixel-art sprite sheet for the same side-scrolling 2.5D dark-fantasy game as attached floor. Match the exact cold charcoal-blue granite, stepwise cyan incised light, crisp square pixel clusters and low contrast upper-left moonlight. Real transparent alpha between all sprites. No scene, ground rectangle, shadow plate, label, frame, numbers other than the requested digit engravings, or watermark. Very wide 2048×512 strip of THREE isolated stone impact crack decals arranged left, center, right, 500×200 each with wide alpha gaps. Flat on the floor, perspective seen from a shallow 20-degree elevated side view. Each is a separate thin dark branching fissure network radiating from one impact point, subtle recessed cold-blue glow at a few cracks, a small handful of angular granite chips right beside the impact. Three distinct variations: left compact five branches, center wider long irregular radial fracture, right narrow asymmetric split. TRANSPARENT space between branches, no filled ground tiles or ground island, no raised slabs, no identical repeats.

**dust**

One transparent pixel-art sprite sheet for the same side-scrolling 2.5D dark-fantasy game as attached floor. Match the exact cold charcoal-blue granite, stepwise cyan incised light, crisp square pixel clusters and low contrast upper-left moonlight. Real transparent alpha between all sprites. No scene, ground rectangle, shadow plate, label, frame, numbers other than the requested digit engravings, or watermark. Six-frame game animation sheet 1536×256, one horizontal row of exactly SIX uniformly spaced transparent 256×256 cells, empty alpha gutters, one complete small footstep puff per cell. Same baseline and pivot in every cell. Grey-brown mineral dust with a few grey granite fragments. Clearly a time progression left to right: 1 small sharp ground burst, 2 rising tight puff, 3 largest billowing puff, 4 expanding lighter granular cloud, 5 thinning drifting wisps, 6 final tiny sparse particles fading. Show six distinct frames, the first and last small, center biggest. Pixel art blocky silhouette and stepped shading; no white plume, flame, numbers, frames, outlines around cells or floor.

</details>
