---
id: 000
title: Проверка связки Claude ⇄ Codex
status: done
created_by: claude
---

## Цель
Убедиться, что Codex читает задачу из репозитория, умеет создавать картинку и кладёт её в нужную папку.

## Референсы (читать/смотреть)
- `assets/characters/hero/concept/hero_side_rigpose.png` — герой, образец стиля

## Промпт для генерации
Pixel-art icon, 256x256, a single steel longsword with a cross-shaped guard and brown leather grip,
pointing upward, dark-fantasy style, clean outlines, muted cold palette, transparent background,
no text, no frame.

## Выходные файлы (строго по этим путям)
- `assets/_test/sword_icon_test.png` — иконка меча 256×256

## Требования
- Если прозрачный фон невозможен — ровный белый фон, и напиши об этом в `## Результат`.
- Если у тебя нет инструмента генерации картинок, так и напиши в `## Результат` (это тоже полезный ответ).

## Результат
- Создан `assets/_test/sword_icon_test.png`. Размер 256×256 px, формат PNG, фон прозрачный.
- Иконка создана встроенным imagegen с референсом из задачи. Экспорт выполнен методом ближайшего соседа с чётким альфа-каналом без сглаживания.

<details>
<summary>Промпт imagegen</summary>

Use case: stylized-concept. Asset type: single 256×256 transparent PNG pixel-art inventory icon for OGE Arena. Draw exactly one straight medieval steel longsword pointing vertically upward, shown face-on in orthographic profile, centered, entire tip and pommel visible. Long straight double-edged blade with a sharp point, simple cross-shaped straight steel guard, brown leather wrapped grip, modest simple steel pommel. The attached reference is ONLY for the game’s material palette, pixel shading and outlines. Render the sword alone. Match the reference's dark-fantasy pixel art, muted cold steel with charcoal shadows, muted brown leather, clean dark contours, upper-left highlights. Deliberate square pixel clusters, crisp stair-step edges, minimal antialiasing; readable even at 256×256 final dimensions. Blade tip near top and grip at bottom, roughly 84% of the square canvas height with generous transparent margins on all sides. Actual fully transparent alpha background outside the sword silhouette, no checkerboard drawn, no shadow, no glow, no decorations, no text, no frame. Output a square 256×256 sprite if available.

</details>
