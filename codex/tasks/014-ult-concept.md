---
id: 014
title: Концепт-арт ульты «Разлом» — героиня против каменного стража
status: done
created_by: claude
---

## Цель
Нужна картинка того, как должна выглядеть ульта героини «Разлом» в игре: удар, после которого по арене расходится разлом
света и все враги получают урон. По этому концепту Claude разберёт удар на части (поза героини, призрачный клинок,
волна, трещины, частицы, свет) и затем закажет у тебя отдельные спрайты и листы анимации эффектов.
Важно: это кадр из игры, а не постер. Камера и масштаб — как в игре (вид сбоку, мир чуть-чуть сверху, 2,5D).

## Референсы (читать/смотреть)
- `assets/characters/hero/concept/hero_side_rigpose.png` — героиня (Лена): капюшон, синий плащ, меч. Брать ровно её, тот же облик и пропорции.
- `assets/bosses/stone-guardian/guardian_side_rigpose_v2.png` — каменный страж (босс), противник на кадре.
- `assets/enemies/` — рядовые враги (упыри), можно 2–3 на заднем плане.
- `assets/environment/arena25d/bg_far.png`, `bg_mid.png`, `floor.png` — арена, на которой всё происходит.
- `docs/ART_STYLE.md` — общий стиль.

## Промпт для генерации
Use the attached references: the hooded heroine with the blue cape and sword (hero_side_rigpose.png), the stone guardian
boss (guardian_side_rigpose_v2.png), the arena (bg_far / bg_mid / floor). Keep their exact look, proportions and the
high-detail dark-fantasy pixel-art style of the references (crisp pixel clusters, dark outlines, stepped shading, muted
cold palette).

An in-game screenshot of a 2.5D side-view arena brawler, 16:9, camera exactly like a side-scroller with the floor seen
slightly from above. The heroine performs her ultimate attack "The Rift": she has leapt up and is driving her sword
straight down into the stone floor in front of the stone guardian boss. From the point of impact a huge rift of
violet-white light tears across the floor in perspective (cracks running along the ground, glowing from inside, the
floor slabs lifting and breaking), a vertical column of light erupts from the impact, a giant translucent spectral
blade made of light descends behind the heroine and pierces the ground together with her sword, a shockwave ring
spreads along the floor, rock debris and glowing embers fly up, the boss staggers with light bursting from cracks in its
stone body, ghouls in the background are thrown off their feet. The whole arena is darker and the light of the attack
is the main light source: strong rim light on the heroine and the boss from the impact point, long shadows thrown
away from it. Epic, heavy, majestic, but readable as a game frame: the heroine and the boss stay clearly readable
silhouettes, the effect does not cover them. No UI, no text, no letters, no frame, no watermark.

Сделай три варианта с разными решениями эффекта (цвет света — фиолетово-белый во всех):
- v1 — как в промпте;
- v2 — вместо призрачного клинка над героиней раскрывается круг из рун на полу, удар вскрывает его, из трещин бьют столбы света;
- v3 — твой вариант: самое эффектное, что придумаешь, но в той же камере и стиле.

Отдельно — раскадровка той же ульты из трёх кадров слева направо (тот же стиль и камера):
1) замах: героиня приседает, меч вскинут, к клинку стягивается свет, арена темнеет;
2) вершина прыжка: героиня в воздухе над точкой удара, клинок над головой, свет собран;
3) удар: как в v1.

## Выходные файлы (строго по этим путям)
- `assets/fx/ult/concept/ult_rift_v1.png` — 1920×1080, вариант 1
- `assets/fx/ult/concept/ult_rift_v2.png` — 1920×1080, вариант 2
- `assets/fx/ult/concept/ult_rift_v3.png` — 1920×1080, вариант 3
- `assets/fx/ult/concept/ult_rift_storyboard_v1.png` — 2880×1080, три кадра по 960×1080

## Требования
- Непрозрачный фон (это концепт кадра целиком), 16:9.
- Героиня и босс — те же, что на референсах; если генератор сильно меняет героиню, лучше перегенерировать.
- Никакого текста и интерфейса на картинках.

## Результат

- `assets/fx/ult/concept/ult_rift_v1.png` — PNG 1920×1080.
- `assets/fx/ult/concept/ult_rift_v2.png` — PNG 1920×1080.
- `assets/fx/ult/concept/ult_rift_v3.png` — PNG 1920×1080.
- `assets/fx/ult/concept/ult_rift_storyboard_v1.png` — PNG 2880×1080.

В первом варианте удар сопровождает призрачный клинок, во втором — рунический круг и столбы света. Для третьего варианта выбран каскад приподнятых плит с подсветкой вдоль разломов. В раскадровке три ячейки 960×1080: замах, прыжок, удар. Страж и упыри реагируют на удар в третьей фазе.
