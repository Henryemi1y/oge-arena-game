---
id: 004
title: Герой 3/4 — ближняя рука, сжимающая рукоять меча (кулак)
status: cancelled
created_by: claude
---

## Цель
В листах деталей 3/4 (задача 003) кисти открытые. Чтобы герой держал меч, нужна ближняя (правая, с мечом) рука
с кулаком, сжатым вокруг рукояти. Сам меч рисовать НЕ надо: Claude подставит спрайт меча в кулак кодом.

## Референсы (читать/смотреть)
- `assets/characters/hero/parts/34front/armN.png` — ближняя рука 3/4 лицом к камере (образец дизайна, масштаба, длины)
- `assets/characters/hero/parts/34back/armN.png` — ближняя рука 3/4 спиной
- `assets/characters/hero/parts/sword.png` — меч героя (толщина рукояти: кулак должен быть под неё)
- `assets/characters/hero/sheets/hero_34front_parts_v2.png`, `hero_34back_parts_v2.png` — листы деталей

## Промпт для генерации
Use case: replacement limb part for cut-out skeletal animation. Use the attached arm part as the authority: the EXACT
same arm (same pauldron, bandaged upper arm, brown leather cuffs, steel bracer, dark fingerless glove, same length, same
pixel scale and shading, same 3/4 angle), hanging straight and vertical with the shoulder joint at the TOP — but the
hand at the bottom is now a CLOSED FIST firmly gripping a sword handle. The handle itself is NOT drawn: draw the fist as
if wrapped around an invisible cylindrical grip about 26 px thick that runs horizontally through the fist, roughly
perpendicular to the forearm (thumb wrapped over the fingers, knuckles visible, fingers curled tightly). The ends of the
invisible grip on both sides of the fist are empty transparent space. Elbow straight. Transparent background, no
weapon, no text, no frame, no shadow. Dark-fantasy pixel art identical to the reference, light from the upper left.
Make two pieces on one transparent 1024x1024 sheet, side by side with a wide gap (at least 120 px):
LEFT piece — the near arm of the 3/4 FRONT view (reference `34front/armN.png`), the fist seen from its outer/back side
with the knuckles toward the viewer-right;
RIGHT piece — the near arm of the 3/4 BACK view (reference `34back/armN.png`), the fist seen from behind.

## Выходные файлы (строго по этим путям)
- `assets/characters/hero/sheets/hero_34_swordarm_v1.png` — лист 1024×1024 с двумя руками

## Требования
- Длина руки от верха наплечника до низа кулака — как у референса минус ~40 px (кулак короче открытой кисти).
- Прозрачный фон, зазор между деталями ≥120 px, детали не касаются краёв листа.
- Если кулак получился не сжатым или рука отличается от референса, переделай и сохрани `_v2`.

## Результат
(заполняет Codex)
