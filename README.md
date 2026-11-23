# Spellstorm

A vertical shooter in the shape of a last stand. You are a mage above a collapsing spire, and the things climbing the dark are not ships.

Open `index.html` in a browser. No install step.

## How to play

- **WASD** or **arrow keys** move.
- Spells fire upward on their own.
- **Space** or **right click** casts Ward Pulse. It burns nearby foes and snuffs their magic. It has a short cooldown.
- After Circle 5, choose a grimoire. **Q**, **E** and **R** then cast that family's three abilities on independent cooldowns.
- **1 / 2 / 3** pick a boon when a choice is offered (or tap a choice).
- Grab falling gifts:
  - **Vitality** restores a life (five at most).
  - **Surge** quickens your casting.
  - **Aegis** absorbs the next hit.
- Every fifth circle, an Archon arrives. Clear the circle, then the next one begins.
- **Esc** pauses. **Enter** starts or restarts.

Your best score is kept in this browser.

## Code layout

The game is split into ordered scripts in `js/`. `js/game.js` is the small loader; it loads the files below in dependency order. The game uses classic browser scripts and shared global state, so keep the loader order stable and avoid loading a module twice.

- `assets/styles/` - shared styles, game HUD, landing page, and portal layouts.
- `assets/grimoire/` - grimoire cards, emblems, ability icons, HUD buttons, and effect animation sheets.
- `assets/art/`, `assets/background/`, `assets/sprites/`, `assets/text/` - game and brand artwork.
- `includes/` - PHP account, database, and layout logic.
- `config/` - local connection settings and example configuration.
- `database/` - schema and migration SQL.
- `docs/` - design, progress, balance, and development notes.
- `tests/`, `tools/` - automated checks and development utilities.
- Root HTML and PHP files - public page and API entry points.

- `js/data.js` - grimoires, upgrades, enemies, Archons, and balance constants.
- `js/state.js` - DOM references, input state, constants, and the main game state.
- `js/viewport.js` - canvas sizing, best-score storage, and field setup.
- `js/audio-effects.js` - synthesized audio, particles, and floating text.
- `js/progression.js` - player setup, circles, experience, boon choices, and grimoire evolution.
- `js/combat.js` - enemy spawning and AI, spells, damage, and projectiles.
- `js/game-flow.js` - run updates, touch movement, pickups, HUD, pause, and end states.
- `js/sprites.js` - sprite-sheet loading and nearest-neighbour drawing.
- `js/render.js` - canvas background, mage, enemies, and frame drawing.
- `js/input.js` - animation loop, keyboard/pointer/touch listeners, and startup.

## Static hosting

`index.html` and the game scripts run on any static host, including GitHub Pages. Account, leaderboard, and run-saving features depend on the PHP entry points (`login.php`, `register.php`, `run-api.php`, `rank-preview.php`, `site-nav.php`) plus the database configuration in `config/`. Those features are unavailable on a static host; the game remains playable as a guest with local best-score storage.
