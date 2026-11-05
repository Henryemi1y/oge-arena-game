---
id: 002
title: Герой в ракурсе 3/4 — две риг-позы (лицом к камере и спиной)
status: done
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
- `assets/characters/hero/sheets/hero_34front_rigpose_v1.png` — передний первый вариант, PNG 1024×1536. Дальний край плаща отсутствует.
- `assets/characters/hero/sheets/hero_34front_rigpose_v2.png` — выбранный передний ракурс, PNG 1024×1536. Цельное полотно плаща видно по обеим сторонам и между бёдрами, до зубчатого подола. Использовать в 003.
- `assets/characters/hero/sheets/hero_34back_rigpose_v1.png` — выбранный задний ракурс, PNG 1024×1536. Использовать в 003.
- У выбранных силуэтов высота 1371 px (89,3% кадра), капюшон начинается на y=74, нижняя подошва на y=1444. Дальняя подошва остаётся выше ближней.
- Независимая проверка сверила пропорции тела и одежды с 001, профильным якорем и листами деталей. На выбранном переднем виде видны оба края и середина цельного плаща за бёдрами. Внутренние просветы у рук и просвет между ногами ниже подола прозрачные. Ближняя рука по внешнему контуру частично видна на фоне плаща. На заднем виде дальний рукав примыкает к плащу у плеча. Есть небольшая разница в развороте носков между ближней и дальней ногой.
- Встроенный imagegen. При экспорте выровнены высота и нижняя подошва, применён ближайший сосед и бинарный альфа-канал 0/255.

<details>
<summary>Промпты imagegen</summary>

**Передний v1**

Use case: game character anchor for cut-out skeletal animation. Create ONE 1024x1536 full-body transparent pixel-art sprite. Image 1 is the exact hero to rotate, image 2 is the side rig pose and side construction, images 3 and 4 show the existing cape, costume and equipment. Preserve exactly the blue hood, young adult face, black fringe and blue eyes, layered cobalt cowl, split blue tunic, leather belt and plain rectangular steel buckle, rounded steel pauldrons, cream bandage sleeves, leather straps, steel bracers, open dark fingerless gloves, charcoal trousers, steel diamond knee guards, greaves, steel-capped leather boots. Same muted cool pixel clusters and dark contour with upper-left light.
VIEW is 3/4 FRONT, facing SCREEN RIGHT, down-right toward the camera. The visible nose and both boot toes point toward the right side of the frame. Turn the entire standing body about 45 degrees right from frontal, orthographic camera about 30 degrees above level. Hero's near left side (left side of image) is wider and brighter, far right side (right side of image) slightly foreshortened/darker. Show face and chest clearly. Full sprite centered; hood y=74, near sole y=1444, height about 89% of canvas.
RIG POSE: neutral straight spine, straight legs apart with both feet planted and the far sole about 40px higher in the projection. Clearly separate the two leg silhouettes below the crotch. Arms straight, elbows unbent, lowered and about 20 degrees away from the body in screen space; fingers open and relaxed, palms empty. Critical silhouette rule: below each shoulder joint leave a continuous genuine alpha gap between arm and torso all the way through the hand. Include 25–45px clear gaps between the lower arm and hip on BOTH sides. No occlusion of upper arms by cowl or cape. The original long blue pointed ragged cape falls behind the torso, folds into a narrow drop along the back on screen left, and stays outside the clear negative spaces between arms and trunk and between legs. It shows behind one outer leg with its longest tip near the upper shin. Do not spread the cape across the gaps. The tunic is belted with the same angular split and its tails end high enough to read the hip area and knees. No new armor or jewelry, no props, no weapon. Clean opaque character edge and genuine alpha in every gap; absolutely no glow, ground, shadow, text or backdrop.

**Задний v1**

Use case: full-body 3/4 BACK-view cut-out rig-pose anchor for OGE Arena. ONE pixel-art hero on transparent 1024x1536 portrait PNG. Image 1 is the exact 3/4 front anchor and scale, image 2 the exact rear costume, image 3 the side rig, image 4 cape construction.
Redraw the same hero in the opposite-facing quarter-turn view: a clear three-quarter REAR angle, back toward the viewer, heading UP-RIGHT toward screen right away from camera. View his back and right side, not a straight rear view; the left/far arm and leg project farther away and are slightly smaller/darker. The torso and toe directions point screen right with a clear 45-degree yaw away from the camera; face completely concealed by the hood. Orthographic slightly elevated camera about 30 degrees. Use image 1's hood-to-lowest-sole height and overall scale, centered in the frame.
Stand upright in a neutral rig pose, both straight legs separated, both boots planted with near right sole lower and far left sole higher by about 60–100 px. Leave a clearly transparent leg gap from where the cape parts through the shins and heels. Both arms are lowered, elbows straight, angled outward about 20 degrees, open relaxed empty hands. Below the shoulders BOTH arms are separated from the body and cape by two distinct continuous empty alpha gaps, particularly from below elbows past hands. Keep the upper cape held close to the back rather than flaring into those gaps. The complete long navy cape hangs from the shoulders, drapes rearward along the screen-left/back side, with original folds and angular ragged hem around upper shins. A pointed split in the ragged hem opens toward the space between the legs. Cape shows full rear cloth but never overlaps or touches either hand or forearm.
Maintain identical existing blue hood and cowl, dark navy cape, rounded steel pauldrons with brown leather, cream bandage wraps, steel bracers and greaves, open dark fingerless gloves, charcoal pants and brown-strapped steel-toed boots as viewed from behind, no new equipment. High-detail dark-fantasy pixel art, crisp square pixel clusters and contours, same cold blue/steel/brown palette, upper-left light. No face, weapon, shadow, text, floor, frame, or additional character. Transparent alpha outside the figure and through the three anatomical gaps.

**Передний v2. Дальний край плаща**

Precise local edit of image 1, a transparent front three-quarter pixel-art game sprite. There is exactly ONE missing garment area. Add the dark blue far-side cape fold on the SCREEN RIGHT side just behind the far leg. Start the visible cloth as a narrow strip behind the right edge of the tunic near y=775, taper into a recognizable jagged pointed cape tail along the outside of the far thigh and upper shin (approximately x=650–714 at y=920–1130). Connect it naturally under the visible tunic/leg edge, the rest of the cape stays hidden behind the body. Image 2 shows how the original cobalt cape hangs on both sides; match its color, silhouette and dark blue folds.
All other pixels and shapes of image 1 are locked: do not edit the screen left, the existing large cape tail, the limbs or pose, face, costume, lighting, canvas or cropping. In particular keep the large transparent window between the legs completely clear from crotch to floor, no blue cloth IN that window. Keep both transparent arm-to-torso wedges clear, the right hand stays separated from the new cloth by a large transparent gap. Do not expand the cape to fill any other gap or cover arms. Do not add a second character, sword, shadows, background, or change the proportions. One native 1024×1536 transparent PNG in the same sharp dark fantasy pixel art.

**Передний v2. Цельное полотно плаща (итоговая правка)**

Very small masked-style edit to the single sprite in image 1. ONLY edit the transparent space between the inner edges of the two thighs within the small rectangle x=456 to 552, y=850 to 1115, in this 1024x1536 image. In the UPPER portion of that window paint the dark navy-blue hanging inner face of the existing cloak, behind both legs. It is an occluded continuation of the same cloth already visible along both outer thighs. The strip of cloth in this window is blue with a subtle vertical fold and a short ragged edge around y=1065–1115, then a completely transparent open gap between the lower legs all the way to the ground. Match the existing color, outline and pixel grid. This visible center fabric makes the cape read as one coherent garment in depth.
Every pixel OUTSIDE that small rectangle is locked, particularly around both arms and gloves. DO NOT change ANY part of the upper cape, its side outlines, the arms, the negative-space openings around the arms, any limb or piece of armor, the hood, body, crop, or pose. Leave the large existing transparent wedges between each arm and torso exactly as in image 1. Only fill the requested upper part of the narrow central window between the thighs. Native same 1024x1536 transparent PNG.

</details>
