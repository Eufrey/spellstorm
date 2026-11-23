# Spellstorm

A vertical shooter in the shape of a last stand. You are a mage above a collapsing spire, and the things climbing the dark are not ships.

Open `index.html` in a browser. No install step.

## How to play

- **WASD** or **arrow keys** move.
- Spells fire upward on their own.
- **1 / 2 / 3** or **Q / E** switch spells.
- **Space** or **right click** casts Ward Pulse. It burns nearby foes and snuffs their magic. It has a short cooldown.
- Grab falling gifts:
  - **Vitality** restores a life (five at most).
  - **Surge** quickens your casting.
  - **Aegis** absorbs the next hit.
- Every fifth circle, an Archon arrives. Clear the circle, then the next one begins.
- **Esc** pauses. **Enter** starts or restarts.

Your best score is kept in this browser.
<<<<<<< Updated upstream
=======

## Code layout

The game is split into ordered scripts in `js/`. `js/game.js` is the small loader; it loads the files below in dependency order. The game uses classic browser scripts and shared global state, so keep the loader order stable and avoid loading a module twice.

- `assets/styles/` - shared styles, game HUD, landing page, and portal layouts.
- `assets/art/`, `assets/background/`, `assets/sprites/`, `assets/text/` - game and brand artwork.
- `includes/` - PHP account, database, and layout logic.
- `config/` - local connection settings and example configuration.
- `database/` - schema and migration SQL.
- `docs/` - design, progress, balance, and development notes.
- `tests/`, `tools/` - automated checks and development utilities.
- Root HTML and PHP files - public page and API entry points.

- `js/data.js` — grimoires, upgrades, enemies, Archons, and balance constants.
- `js/state.js` — DOM references, input state, constants, and the main game state.
- `js/viewport.js` — canvas sizing, best-score storage, and field setup.
- `js/audio-effects.js` — synthesized audio, particles, and floating text.
- `js/progression.js` — player setup, circles, experience, boon choices, and grimoire evolution.
- `js/combat.js` — enemy spawning and AI, spells, damage, and projectiles.
- `js/game-flow.js` — run updates, touch movement, pickups, HUD, pause, and end states.
- `js/render.js` — canvas background, mage, enemies, and frame drawing.
- `js/input.js` — animation loop, keyboard/pointer/touch listeners, and startup.
>>>>>>> Stashed changes
