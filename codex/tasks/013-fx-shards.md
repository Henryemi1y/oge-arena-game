---
id: 013
title: Эффекты: осколки с цифрами, трещины от шагов босса, пыль
status: pending
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
(заполняет Codex)
