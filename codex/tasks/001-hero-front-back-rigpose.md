---
id: 001
title: Герой — вид спереди и сзади (риг-поза)
status: done
created_by: claude
---

## Цель
Получить два полноростовых изображения героя в той же «риг-позе» и том же стиле, что и вид сбоку:
спереди и со спины. Они нужны как основа для нарезки на детали скелета и для разворотов героя.

## Референсы (читать/смотреть)
- `assets/characters/hero/concept/hero_side_rigpose.png` — вид сбоку в риг-позе (1024×1536): образец позы, пропорций, палитры и пиксельной подачи
- `assets/characters/hero/parts/hero_side_head-arm-leg.png`, `hero_side_torso-cape.png`, `hero_side_arms-leg.png` — детали героя по отдельности: точный дизайн капюшона, плаща, наплечников, наручей, наколенника, сапог

## Промпт для генерации
(использовать для обоих видов, подставив VIEW)

Full-body pixel-art character sprite of the SAME hero as in the attached references, VIEW, standing in a neutral
rig pose: feet shoulder-width apart, arms slightly lowered and held a little away from the body, palms relaxed,
no weapon in hands. Keep the design 100% identical to the references: blue hooded cloak with the hood up and a long
cape with ragged hem, steel pauldrons and bracers with brown leather straps and white bandage wraps on the forearms,
fingerless dark gloves, brown leather belt with a steel buckle, dark trousers, steel knee guards, dark boots with
steel toe caps. Same proportions, same muted cold dark-fantasy palette, same pixel shading, clean dark contours,
light from the upper left. Whole character fully visible, centered, with generous margins. Plain flat background
(transparent if possible), no ground, no shadow, no text, no frame.

VIEW для файла 1: "front view, facing the viewer, face visible under the hood with the same calm expression"
VIEW для файла 2: "back view, facing away from the viewer, showing the back of the hood and the full cape hanging down"

## Выходные файлы (строго по этим путям)
- `assets/characters/hero/sheets/hero_front_rigpose_v1.png` — вид спереди, 1024×1536
- `assets/characters/hero/sheets/hero_back_rigpose_v1.png` — вид со спины, 1024×1536

## Требования
- Размер каждого файла 1024×1536 PNG; прозрачный фон, а если невозможно — ровный белый, и напиши об этом.
- Дизайн строго как у референсов: ничего не добавлять и не менять (ни оружия, ни новых деталей).
- Оба вида в одном масштабе: персонаж занимает одинаковую долю высоты кадра (около 85–90%), ступни на одной линии.
- Если получилось слишком не похоже на референс, сделай ещё одну попытку и сохрани как `_v2` рядом, в «Результате» укажи, какую считаешь лучшей.

## Результат
- `assets/characters/hero/sheets/hero_front_rigpose_v1.png` — вид спереди, PNG 1024×1536, прозрачный фон.
- `assets/characters/hero/sheets/hero_back_rigpose_v1.png` — вид со спины, PNG 1024×1536, прозрачный фон.
- Высота обоих силуэтов 1371 px (89,3% кадра). Нижний пиксель обеих подошв в каждом файле находится на строке y=1444 при отсчёте с нуля.
- Виды созданы встроенным imagegen по указанным референсам. При экспорте силуэты выровнены по росту и подошвам методом ближайшего соседа, альфа-канал приведён к значениям 0 и 255.

<details>
<summary>Промпты imagegen</summary>

**Вид спереди**

Use case: stylized-concept. Asset: ONE full-body front-view rig-pose pixel-art sprite for the OGE Arena hero, a transparent portrait PNG, target canvas 1024×1536.
Input roles: image 1 is the authoritative side-view rig for the exact same character, height proportions, camera, palette and lighting. Images 2–4 are the exact costume construction references for the hood and face, torso, cape, shoulder armor, wrapped sleeves, bracers, gloves, knees, shin guards and boots. The references show design pieces, not a layout to reproduce.
Render an exact orthographic FRONT view with the hero facing the viewer squarely, head level, calm adult face visible beneath the deep cobalt-blue hood with a black hair fringe. Neutral upright stance with straight knees, feet about shoulder width apart, both soles on the same baseline, both empty relaxed hands open. Straight arms angle only about 15 degrees outward from vertical, leaving a small transparent gap between the hands and thighs, with no fighting action or props. Use the reference's mature adult height and body proportions.
Match the same cobalt/navy hood, shoulder cowl, layered blue tunic and long heavy cape with its pointed ragged hem, rounded steel pauldrons with brown leather underneath, off-white gathered bandage sleeves, steel bracers with brown leather straps, dark fingerless gloves, brown leather belt with plain rectangular silver buckle, dark charcoal trousers, faceted steel knee guards, greaves and brown-strapped boots with rounded steel toe caps. The cape hangs straight behind the legs and reads at both sides, with its longest points around the knees or upper shins. Preserve material shapes, colors and costume seams; no weapon, jewelry, insignia, extra armor, or decorative details.
High-detail dark-fantasy pixel art matching reference with crisp square pixel clusters, sharp dark contour and softly stepped material shading, from upper left. One complete character, centered, with usable empty margins. Target foreground height 87.5% of the canvas, from the hood at roughly y=92 through both soles at y=1435. Maintain transparent alpha outside the entire silhouette and in the negative spaces. No background fill, floor, shadow, glow, text, frame or additional character.

**Вид со спины**

Use case: stylized-concept. Asset: ONE full-body BACK-view rig-pose pixel-art sprite of the exact OGE Arena hero, transparent portrait PNG, 1024×1536. Image 1 is the finished front view and is authoritative for the pose, geometry, proportions, crop, scale and costume. Image 2 is the side rig for identity and cape depth; images 3 and 4 provide the actual ragged cape and armor construction.
Turn that exact front sprite exactly 180 degrees around its vertical axis while keeping the same upright rig pose. Pure orthographic BACK VIEW, facing directly away, hood completely up with only its rear fabric visible. Match image 1's total character height and proportions, the shoulder line, straight leg stance, both boots shoulder-width apart on a single flat sole baseline, and both arms slightly away from the body at approximately 15 degrees from vertical with open relaxed gloved hands. Match the 1024×1536 crop, hood tip near y=75, shoulder line near y=330, hanging fingertips near y=875, and soles near y=1445, centered at x=512. Full character visible. No tilted camera or angled stance.
The same dark cobalt-blue hood and layered collar folds at the shoulders continue to the same long navy cape seen in the references; show the full back of the heavy cloth hanging vertically from the shoulders with the original long angular ragged hem near the knees and upper shins, consistent with its length in image 1. On either side show the backs of the same rounded steel pauldrons with brown leather bases, off-white wraps, leather straps, steel bracers and fingerless gloves. The cape naturally covers the middle of the torso and belt. Under the cape show the same charcoal trousers and the back and sides of the same strapped greaves and boots. From this exact back angle the toe caps and front-facing knee guard facets are occluded by the legs; show the correct edges where visible. Same silhouette thickness and adult proportions as image 1. Preserve design, colors and scale, with no new details, no symbols, no exposed face, no weapon and no objects in the hands.
Match the exact crisp high-detail pixel-art treatment, dark pixel contours, stepped shading, muted cool palette and light from upper left. One sprite only. True transparent alpha surrounding the entire silhouette and between arms and body where visible; no glow, ground, cast shadow, gradient backdrop, text, or frame.

</details>
