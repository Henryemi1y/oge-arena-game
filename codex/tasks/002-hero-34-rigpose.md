---
id: 002
title: Герой в ракурсе 3/4 — две риг-позы (лицом к камере и спиной)
status: pending
created_by: claude
---

## Цель
Перейти с видов «строго спереди/сзади» на ракурс 3/4, как в играх с камерой сверху-сбоку: герой повёрнут на ~45°,
камера смотрит немного сверху. Нужны два полноростовых «якоря» в нейтральной риг-позе: 3/4 лицом к камере и 3/4 спиной.
Из них потом будет сделан лист деталей (задача 003) и скелетная анимация ходьбы во все стороны.
Оба вида смотрят ВПРАВО (влево получим зеркалом).

## Референсы (читать/смотреть)
- `assets/characters/hero/sheets/hero_front_rigpose_v1.png` — вид спереди: главный образец дизайна, лица, масштаба и пиксельной подачи
- `assets/characters/hero/sheets/hero_back_rigpose_v1.png` — вид со спины: капюшон и плащ сзади
- `assets/characters/hero/concept/hero_side_rigpose.png` — вид сбоку: профиль, глубина плаща, форма сапог
- `assets/characters/hero/parts/hero_side_*.png` — детали костюма крупно

## Промпт для генерации

### Файл 1 — 3/4 лицом к камере
Use case: game character anchor for skeletal (cut-out) animation. ONE full-body pixel-art sprite of the EXACT same hero
as in the references, transparent PNG, 1024x1536.
View: three-quarter FRONT view. The body is turned 45 degrees to the viewer's RIGHT (the hero faces down-right toward
the camera), camera slightly above (about 30 degrees elevation), orthographic, no perspective distortion. The near side
of the body is the hero's left side; the far shoulder, arm and leg are partly visible behind and are slightly darker.
Pose: strict neutral rig pose for animation. Standing straight, knees straight, feet a little wider than the hips, both
soles on the ground, the far foot slightly higher on screen than the near foot (because of the 3/4 angle). Both arms
hang down but are held clearly AWAY from the body at about 20 degrees, elbows straight, hands open and relaxed, empty
hands, no weapon. There must be clear transparent gaps between each arm and the torso/cape, and between the two legs.
The cape hangs behind the body: it must NOT cover the arms or the front of the legs; it may show at the sides behind.
The tunic hem ends above the hips' joint area and does not hide the knees.
Design: 100% identical to the references — deep cobalt-blue hood up, face visible under it (same calm young adult face,
black hair fringe, blue eyes), layered blue cowl at the shoulders, long blue cape with pointed ragged hem, blue tunic,
brown leather belt with a plain rectangular steel buckle, rounded steel pauldrons with brown leather straps, off-white
bandage wraps on the upper arms, steel bracers with brown straps, dark fingerless gloves, charcoal trousers, faceted
steel knee guards, steel shin plates, boots with brown straps and rounded steel toe caps. No new details, no symbols.
Style: same high-detail dark-fantasy pixel art as the references, crisp square pixel clusters, dark outlines, stepped
shading, muted cold palette, light from the upper left. Same character height as the reference front view: from hood top
to soles about 89% of the canvas height, soles at about y=1445, character centered horizontally.
Background fully transparent. No ground, no cast shadow, no glow, no text, no frame, no second character.

### Файл 2 — 3/4 спиной
Same prompt and same rules, but: three-quarter BACK view. The body is turned so the hero faces UP-RIGHT, AWAY from the
camera, 45 degrees off the back view. We see the back of the hood (no face; at most the edge of the cheek is hidden by the
hood), the full back of the cape hanging from the shoulders, the back of the near (right) arm and the far (left) arm
partly. Same rig pose: arms 20 degrees away from the body with gaps, elbows straight, open empty hands, legs straight and
apart with a clear gap, far foot slightly higher on screen. The cape covers the back and buttocks and hangs to the upper
shins as in the back reference, but the arms stay outside it, not under it. Use file 1 as the authority for height,
scale, crop and proportions (same soles line, same hood height).

## Выходные файлы (строго по этим путям)
- `assets/characters/hero/sheets/hero_34front_rigpose_v1.png` — 3/4 лицом к камере, 1024×1536
- `assets/characters/hero/sheets/hero_34back_rigpose_v1.png` — 3/4 спиной, 1024×1536

## Требования
- PNG 1024×1536, настоящий прозрачный фон.
- Оба файла в одном масштабе: одинаковый рост и линия подошв (как у `hero_front_rigpose_v1.png`).
- Обязательно зазоры между руками и телом и между ногами — это главное условие, без них анимацию не сделать.
- Если с первого раза вышло непохоже на референсы или поза не нейтральная, сделай ещё попытку и сохрани как `_v2`, в «Результате» укажи лучшую.

## Результат
(заполняет Codex)
