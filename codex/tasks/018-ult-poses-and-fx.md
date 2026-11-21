---
id: 018
title: Ульта «Разлом» — позы Лены и листы эффектов (по концепту 014)
status: pending
created_by: claude
---

## Цель
По концепту из задачи 014 собираем ульту в игре из частей. Выбрано:
- замах и прыжок — как в `ult_rift_storyboard_v1.png` (кадры 1 и 2);
- удар — героиня с колена вонзает меч в пол, сверху падает огромный призрачный клинок (как `ult_rift_v1.png`),
  а от точки удара в обе стороны по полу бежит разлом со вздыбленными плитами и светом из щелей (как `ult_rift_v3.png`).
Нужны отдельные позы Лены (их игра показывает вместо скелетной анимации на время ульты) и отдельные эффекты.

## Референсы (читать/смотреть)
- `assets/fx/ult/concept/ult_rift_storyboard_v1.png`, `ult_rift_v1.png`, `ult_rift_v3.png` — что повторяем
- `assets/characters/hero/concept/hero_side_rigpose.png` — облик Лены (лицо, капюшон, плащ, доспех, меч)
- `assets/environment/arena25d/floor.png` — пол: камера (вид сбоку, чуть сверху ≈ 20°) и камень плит
- `docs/ART_STYLE.md`

## Часть 1 — позы Лены (прозрачный фон)
Same heroine as hero_side_rigpose.png (same face, hood, blue cape, armor, sword, proportions), same pixel-art style,
side view facing RIGHT, light from the upper left. No effects baked in (no glow, no light, no particles) — clean
character only. Every pose on its own 1280×1280 canvas, the heroine at the same scale in all of them (standing height
would be about 1000 px), the ground line at y = 1180 (feet or knee touch it; in the jump the body is in the air above it,
horizontally centered).
1. `lena_ult_1_windup.png` — deep crouch, one knee almost on the ground, sword raised high above with one hand,
   cape spread behind (storyboard frame 1).
2. `lena_ult_2_leap.png` — in the air at the top of the jump, both hands on the hilt above the head, sword pointing
   up and back, legs bent, cape flying (storyboard frame 2).
3. `lena_ult_3_dive.png` — falling down, sword now held point DOWN in both hands under her, body leaning forward,
   cape streaming up.
4. `lena_ult_4_impact.png` — kneeling on one knee, both hands on the hilt, sword driven vertically into the floor in
   front of her (ult_rift_v1), cape blown back.
5. `lena_ult_5_rise.png` — getting up from the knee, sword pulled out and lowered, half-standing.

## Часть 2 — эффекты (фон — чистый чёрный #000000, игра накладывает их режимом «свет»)
Violet-white light like in the concept (core almost white, edges violet #8a4dff…#c9a6ff), pixel-art style.
6. `fx_spectral_sword.png` 1024×2048 — the giant spectral sword pointing straight DOWN, as in ult_rift_v1: glowing
   blade with a fuller and runes inside the blade, crossguard, grip, pommel with a gem, all made of light.
7. `fx_sword_flares.png` 2048×2048 — the violet energy streaks/wings flaring around the sword (ult_rift_v1), without
   the sword itself.
8. `fx_impact_burst_sheet.png` 2048×1024 — 8 frames (4×2 grid, 512×512 each) of the burst of light at the impact
   point: flash → expanding burst with streaks → fading embers.
9. `fx_shockwave_ring.png` 2048×512 — a glowing ring lying on the floor in the floor's perspective (flat ellipse),
   thin bright edge, soft inside.
10. `fx_ground_cracks.png` 2048×768 — radial glowing cracks spreading on the floor from one point, in the floor's
    perspective (as in ult_rift_v1), the point at the center of the image.
11. `fx_charge_glow_sheet.png` 2048×512 — 8 frames (512×512 each) of light gathering on a raised sword tip for the
    windup: small spark → growing orb with converging streaks.

## Часть 3 — разлом с плитами (прозрачный фон)
12. `fx_rift_slabs.png` 2048×1024 — 8 separate broken floor slabs (2 rows × 4, each in a 512×512 cell, centered),
    the same stone as floor.png, seen in the floor's perspective, tilted/lifted out of the floor at different angles,
    with violet light glowing from the cracked edges underneath (as in ult_rift_v3).
13. `fx_rift_gap.png` 1024×256 — a short straight segment of the glowing rift in the floor (dark gap with violet light
    inside, broken edges), in the floor's perspective, tileable left-to-right.
14. `fx_debris.png` 1024×256 — 8 small rocks and stone chips (each in a 128×128 cell), transparent background.

## Выходные файлы (строго по этим путям)
- `assets/fx/ult/lena_ult_1_windup.png` … `lena_ult_5_rise.png` — 1280×1280 каждый
- `assets/fx/ult/fx_spectral_sword.png` — 1024×2048
- `assets/fx/ult/fx_sword_flares.png` — 2048×2048
- `assets/fx/ult/fx_impact_burst_sheet.png` — 2048×1024
- `assets/fx/ult/fx_shockwave_ring.png` — 2048×512
- `assets/fx/ult/fx_ground_cracks.png` — 2048×768
- `assets/fx/ult/fx_charge_glow_sheet.png` — 2048×512
- `assets/fx/ult/fx_rift_slabs.png` — 2048×1024
- `assets/fx/ult/fx_rift_gap.png` — 1024×256
- `assets/fx/ult/fx_debris.png` — 1024×256

## Требования
- Позы: один и тот же масштаб и линия земли во всех пяти; Лена должна быть узнаваема как на референсе.
- Эффекты части 2 — строго на чёрном фоне; части 1 и 3 — прозрачный фон (если не получается — ровный белый #FFFFFF,
  и написать об этом).
- Без текста, рамок и подписей.

## Результат
(заполняет Codex)
