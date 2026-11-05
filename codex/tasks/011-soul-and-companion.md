---
id: 011
title: Душа героя и спутник-«глаз» — вид сбоку
status: pending
created_by: claude
---

## Цель
Когда у босса разрушена конечность, душа героя выходит из тела и игрок управляет ею (летает, собирает осколки).
Спутник — летающий глаз в пламени, сопровождает героя. Оба летают, ног не нужно; душа анимируется скелетом.

## Референсы (читать/смотреть)
- `assets/characters/hero/concept/hero_side_rigpose.png` и `assets/characters/hero/parts/hero_side_*.png` — герой, из которого выходит душа

## Промпт для генерации

### Файл 1 — душа (лист деталей)
Pixel-art PART SHEET of the hero's SOUL, transparent PNG 2048x1536, strict side view facing RIGHT: the same silhouette
and proportions as the hero (hood, cape, pauldrons readable), but made of translucent glowing pale-cyan spirit light
with soft inner glow, brighter outlines, wispy flame-like edges, no solid colours, the lower body fading into a long
wispy flowing tail instead of legs. Separate complete parts with wide gaps (≥80 px): 1) head with hood, 2) torso
without arms, 3) near arm straight (shoulder at top), 4) far arm (dimmer), 5) the wispy tail as one piece. Plus 6) one
full assembled soul figure for reference at the right side of the sheet. Same pixel scale as the hero (1371 px tall).
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.

### Файл 2 — спутник-глаз
Pixel-art sprite sheet, transparent PNG 1024x512: a single floating EYE companion — a round eyeball with a cold blue
iris inside a crown of living blue-white flame, small floating stone fragments orbiting it. 4 separate pieces with
wide gaps: 1) the eyeball, 2) the eyelid/socket ring (stone), 3) the flame crown (one piece, transparent inside where
the eye sits), 4) a small orbiting stone fragment. The eyeball about 140 px in diameter.
Style (all images): the same high-detail dark-fantasy pixel art as the hero references in
`assets/characters/hero/` — crisp square pixel clusters, dark outlines, stepped shading, muted cold palette, light
from the upper left. Orthographic camera, no perspective distortion. No text, no labels, no frame, no watermark.

## Выходные файлы (строго по этим путям)
- `assets/characters/soul/soul_side_parts_v1.png` — 2048×1536
- `assets/characters/companion-eye/eye_parts_v1.png` — 1024×512

## Требования
- Прозрачный фон, зазоры ≥80 px. В «Результате» — прямоугольники деталей.

## Результат
(заполняет Codex)
