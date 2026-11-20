---
id: 015
title: Арена в правильной перспективе — средний план и реквизит с тенями
status: pending
created_by: claude
---

## Цель
Сейчас объекты на арене (голова статуи, кучи камней, колонна, жаровни) нарисованы почти «в лоб», а пол виден сверху.
Из-за этого кажется, что они не стоят на полу, а лежат или наклеены. Нужно перерисовать средний план и реквизит
в той же камере, что и пол: вид сбоку и чуть сверху (около 20°), у каждого предмета видна верхняя грань, основание
лежит на плоскости пола, есть контактная тень. Свет на всех слоях один: луна сверху слева (холодный), плюс тёплый
отсвет от жаровен снизу.

## Референсы (читать/смотреть)
- `assets/environment/arena25d/floor.png` — пол; его угол обзора и есть камера, под которую рисуем всё остальное
- `assets/environment/arena25d/bg_mid.png`, `bg_far.png`, `props.png` — текущие слои (что не так: см. «Цель»)
- `assets/characters/hero/concept/hero_side_rigpose.png` — масштаб: рост героини ≈ 1/3 высоты кадра 1080
- `docs/ART_STYLE.md`

## Промпт для генерации
Same world, same high-detail dark-fantasy pixel art as the references (crisp pixel clusters, dark outlines, stepped
shading, muted cold palette). Camera: side view from slightly above, about 20 degrees, matching the attached floor
texture exactly — horizontal lines stay horizontal, objects on the floor show their top surfaces and sit on the floor
plane with grounded, slightly elliptical bases. Main light: cold moonlight from the upper left; secondary: warm low
light from braziers. Every object casts a soft contact shadow on the floor toward the lower right. No text, no frame,
no watermark.

1. `bg_mid_v2.png` 3840×1080, transparent above the colonnade: the back wall of the arena — broken colonnade, arches,
   a huge hooded statue, all in the same camera; their bases end exactly at the far edge of the floor (y ≈ 650 of 1080)
   and are slightly hidden by floor debris, so the wall stands ON the floor instead of floating behind it.
2. Props, each a separate PNG with transparent background, centered, bottom of the base at 92 % of the image height:
   - `prop_column_broken.png` 512×1024 — broken column on a square plinth, top of the plinth visible;
   - `prop_rubble.png` 768×384 — pile of fallen blocks and gravel, spread on the floor plane, some blocks half-sunk;
   - `prop_statue_head.png` 768×512 — fallen statue head LYING ON ITS SIDE on the floor (cheek on the ground), cracked,
     with its broken neck toward the viewer; it must clearly rest on the floor in perspective;
   - `prop_brazier.png` 384×512 — iron brazier on three legs with EMPTY bowl (fire is a separate animation), bowl
     opening seen from slightly above as an ellipse;
   - `prop_chain_post.png` 384×768 — stone post with a hanging broken chain.
3. For each prop the same-size shadow image `<name>_shadow.png`: only the soft dark contact shadow on the floor
   (black, alpha up to 60 %), same placement as the prop, so the game can draw the shadow under the characters.

## Выходные файлы (строго по этим путям)
- `assets/environment/arena25d/v2/bg_mid_v2.png` — 3840×1080
- `assets/environment/arena25d/v2/prop_column_broken.png`, `prop_column_broken_shadow.png` — 512×1024
- `assets/environment/arena25d/v2/prop_rubble.png`, `prop_rubble_shadow.png` — 768×384
- `assets/environment/arena25d/v2/prop_statue_head.png`, `prop_statue_head_shadow.png` — 768×512
- `assets/environment/arena25d/v2/prop_brazier.png`, `prop_brazier_shadow.png` — 384×512
- `assets/environment/arena25d/v2/prop_chain_post.png`, `prop_chain_post_shadow.png` — 384×768

## Требования
- Прозрачный фон у реквизита и теней; если прозрачность не получается — ровный белый #FFFFFF, и написать об этом.
- Камера и свет одинаковые на всех картинках, это главное требование задачи.
- Без текста, рамок и подписей.

## Результат
(заполняет Codex)
