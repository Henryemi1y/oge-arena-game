# OGE Arena — игра для подготовки к ОГЭ по математике

Динамичная «блиц»-арена в стиле dark-fantasy pixel-art. Герой сражается с каменными боссами; когда
отбита конечность босса, она рассыпается на осколки с выгравированными цифрами. Душа героя покидает
тело, игрок собирает осколки и складывает на монолит с уравнением в стиле ОГЭ. Верное решение —
конечность остаётся уничтоженной, неверное — собирается заново с меньшим HP.

Подробнее: [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md), стиль: [docs/ART_STYLE.md](docs/ART_STYLE.md).

## Игра

Собранная игра — один файл [`src/game/index.html`](src/game/index.html) (открывается в браузере без сервера).
Исходники — модули `src/game/js/*.js` + шаблон `src/game/index.tpl.html`, сборка: `python3 tools/build_game.py`
(режет листы Codex, кодирует картинки в WebP и вшивает их в страницу). Проверка: `node tools/qa_game.js <папка> critic strikes soul flow`.

Управление: A/D или ←/→ — шаг, Shift — бег, W/S или ↑/↓ — вглубь/ближе, Space — рывок, ЛКМ — серия из трёх ударов
(J/K/L — по отдельности), E — подобрать/положить осколок, Q — вернуть последний, Enter — старт/пауза, M — звук.

## Как здесь работают Claude и Codex

Репозиторий — общее рабочее место. Claude пишет **задачи-промпты** в `codex/tasks/`, Codex выполняет их
и кладёт результат (картинки и т.п.) в `assets/`, Claude забирает результат и использует в коде.
Полная схема: [docs/WORKFLOW.md](docs/WORKFLOW.md). Инструкция для Codex: [AGENTS.md](AGENTS.md).

## Структура

```
AGENTS.md                      инструкция для Codex (читается автоматически)
docs/                          дизайн, стиль, процесс; docs/ref2game — справочные картинки по скелетной анимации
codex/tasks/                   задачи для Codex (NNN-название.md), TEMPLATE.md — шаблон, INDEX.md — список
assets/characters/hero/        герой: concept/ (референсы), parts/ (детали для скелета), sheets/ (листы), animation/
assets/characters/{companion-eye,soul}/   спутник-«глаз», форма души
assets/enemies/  assets/bosses/            враги и боссы
assets/environment/  assets/ui/            арена, интерфейс
assets/audio/{music,sfx}/                  музыка и звуки
assets/_test/                              проверочные задачи (можно удалять)
src/hero/                      тестовая страница героя (hero_run.html + данные спрайтов hero_side4.json)
src/game/                      игра «Арена осколков»: js/ (модули), index.tpl.html, index.html (сборка)
src/engine/walker.js           походки врагов и боссов (общая механика шага)
src/arena/                     прежняя версия игры (arena.html, банк задач Q)
tools/                         скрипты сборки и «критик» анимации (Playwright)
```

## Именование ассетов

`<категория>_<имя>_<вид>_<вариант>.png`, строчными латинскими буквами и дефисами:
`hero_side_head.png`, `hero_front_sheet_v2.png`, `boss-stone_arm-left_v1.png`.
