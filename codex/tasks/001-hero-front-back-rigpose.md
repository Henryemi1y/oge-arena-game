---
id: 001
title: Герой — вид спереди и сзади (риг-поза)
status: pending
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
(заполняет Codex)
