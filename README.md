# Spellstorm

A vertical shooter in the shape of a last stand. You are a mage above a collapsing spire, and the things climbing the dark are not ships.

Open `index.html` in a browser. No install step.

## How to play

- **WASD** or **arrow keys** move.
- You begin with the Basic Grimoire, which fires upward automatically. Choose a boon with **1 / 2 / 3** when an upgrade is offered.
- **Space** or **right click** casts Ward Pulse. It burns nearby foes and snuffs their magic. It has a short cooldown.
- On touch screens, drag the movement pad and tap the Ward button.
- Grab falling gifts:
  - **Vitality** restores a life (five at most).
  - **Surge** quickens your casting.
  - **Aegis** absorbs the next hit.
- Every tenth circle from Circle 10 through Circle 50, an Archon arrives. Clear the circle, then the next one begins.
- From Circle 3 onward, bats and imps can reinforce while wraiths or cultists remain alive. Reinforcements are rate-limited and capped per circle.
- Enemy score also fills the experience meter; reaching its target offers a boon. Enemy score scales by circle and difficulty tier, up to 2.1x, and the meter target rises with progression.
- A guaranteed boon choice follows every fifth completed circle. The first grimoire choice arrives after Circle 5. Choose two grimoire-specific upgrades to make its evolution eligible for later random boon offers.
- **Esc** pauses. **Enter** starts or restarts.

Your best score is kept in this browser.

## Code layout

The game is split into ordered scripts in `js/`. `game.js` is the small loader; it loads the files below in dependency order. The game uses classic browser scripts and shared global state, so keep the loader order stable and avoid loading a module twice.

- `js/data.js` — grimoires, upgrades, enemies, Archons, and balance constants.
- `js/state.js` — DOM references, input state, constants, and the main game state.
- `js/viewport.js` — canvas sizing, best-score storage, and field setup.
- `js/audio-effects.js` — synthesized audio, particles, and floating text.
- `js/progression.js` — player setup, circles, experience, boon choices, and grimoire evolution.
- `js/combat.js` — enemy spawning and AI, spells, damage, and projectiles.
- `js/game-flow.js` — run updates, touch movement, pickups, HUD, pause, and end states.
- `js/render.js` — canvas background, mage, enemies, and frame drawing.
- `js/input.js` — animation loop, keyboard/pointer/touch listeners, and startup.
