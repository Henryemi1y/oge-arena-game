# Инструменты

Скрипты используются Claude для сборки и проверки анимации героя. Пути внутри заточены под рабочую папку
сессии Claude (`/home/claude/...`); при запуске в другом месте поправьте константы в начале файлов.

- `build.py` — подставляет данные спрайтов (`src/hero/hero_side4.json`) в `src/hero/hero_run.html` вместо `__A__`.
- `crit.py` — «критик» походки/бега (метрики из `window.__crit`).
- `atk.py`, `atkdiag.py` — кадры и метрики ударов; `walkstrip.py` — кадры ходьбы; `kv.py`, `diagj2.py` — скорости и рывки суставов.
- `build_game.py` — сборка игры в один файл `src/game/index.html` (ассеты → WebP data URI, модули `src/game/js/` по порядку).
- `qa_game.js` — Playwright-проверка игры: ошибки консоли, снимки сцен, критики анимации (герой — критик из hero_run.html,
  враги и боссы — те же метрики на walker.js), попадание ударов босса в точку прицеливания, «душа не наносит урона», полный цикл.
  `node tools/qa_game.js /tmp/qa critic strikes soul flow shots bossframes enemyframes play`
- `build_walkers.py` — демо походок `src/characters/walkers.html`.
