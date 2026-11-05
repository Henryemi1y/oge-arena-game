---
id: 000
title: Проверка связки Claude ⇄ Codex
status: pending
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
(заполняет Codex)
