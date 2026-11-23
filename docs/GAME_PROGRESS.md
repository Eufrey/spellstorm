# Spellstorm: Current Progress and Game Direction

_Last reviewed: 2026-11-16_

## Project snapshot

Spellstorm is a single-player fantasy vertical shooter that runs directly in a modern browser. The player is a mage defending the last spire while hostile creatures rise through a night sky. It borrows the readable movement, projectile dodging, enemy waves, and boss cadence of a space shooter, but expresses them through spellbooks, magic, a dark fantasy setting, and a campaign of escalating circles.

- **Current implementation:** playable browser-game prototype with a complete run loop, responsive desktop and touch input, upgrade choices, and a defined ending.
- **Project structure:** `index.html` provides the canvas and interface, `assets/styles/style.css` styles the interface and responsive controls, and `js/game.js` contains game data, simulation, rendering, input, sound, and persistence. `README.md` gives launch and play instructions.
- **Runtime:** open `index.html` directly in a modern browser. There is no package install or build step.
- **Current repository snapshot:** branch `test-edit`, HEAD `ffe2fda` (`Add score-based experience progression`). Git history also includes the original game and responsive-systems commits. Repository status could not be read successfully at the time of review, so this document describes the checked-out files rather than claiming a clean working tree.

## Game direction

### High concept

A last-stand mage shooter: hold position in a vertical playfield, weave through enemies and hostile magic, and let the equipped grimoire automatically attack upward. Survive the campaign, strengthen the mage with between-circle boons, and defeat the Archons guarding the way to the final circle.

### Design pillars

1. **Familiar arcade readability:** movement, waves, shots, health, score, and boss health should be legible at a glance.
2. **Fantasy first:** the player, enemies, spells, setting, names, and interface should feel like an enchanted siege rather than a reskinned spacecraft.
3. **A growing build:** score-earned and milestone-earned choices should make the mage visibly and mechanically stronger over a run.
4. **Short decision breaks:** pause between combat moments to select a boon, then return to the action.
5. **Play across screen sizes:** support keyboard and mouse on desktop and touch controls on small or coarse-pointer devices.
6. **A clear endpoint:** a 50-circle campaign culminates in an Archon encounter and explicit victory or defeat feedback.

## Current player experience

1. Start from the title card with **Begin the vigil** or Enter.
2. Move around the bounded vertical arena while the equipped grimoire fires upward automatically.
3. Dodge enemies and their projectiles; use Ward Pulse to damage nearby enemies and clear hostile shots.
4. Defeat enemies to score, build chains, gain score-based experience, and occasionally receive a falling gift.
5. Select one of three offered boons when an experience threshold or five-circle milestone opens the upgrade screen.
6. Clear the circle, meet its Archon at every tenth circle, and continue toward the Circle 50 finale.
7. Win after the final encounter or lose when the mage's lives are exhausted. The best score is stored in this browser.

## Controls

- **Move:** WASD or arrow keys.
- **Ward Pulse:** Space or right click. The mobile interface has a Ward button.
- **Touch movement:** drag the on-screen virtual pad.
- **Choose an upgrade:** click/tap a card or press 1, 2, or 3.
- **Pause/resume:** Escape; Enter resumes while paused.
- **Start/restart:** click the title/end-screen button or press Enter from the title or end screen.
- Spells attack automatically; there is no separate firing control.

## Implemented mechanics

### Player and combat

- The player begins with three lives and a maximum of five, moves at a base speed of 340 in the 540 × 960 logical playfield, and is kept within arena bounds.
- Enemy contact and hostile projectiles can hurt the mage. Damage handling includes invulnerability timing and a hit flash; the player also has an Aegis state that absorbs a hit.
- Ward Pulse starts with a 3.1-second duration and 168-pixel radius. It has a cooldown, damages nearby foes, and clears nearby enemy shots. Boons can extend the duration or radius.
- Grimoire attacks fire automatically. Projectile/enemy collisions apply damage; Rime applies a 1.6-second slow, while piercing attacks can hit multiple enemies.
- Score chains are displayed as a multiplier. Best score is read and written using browser `localStorage` under `spellstorm-best`.

### Grimoires and evolutions

The mage starts with the **Basic Grimoire**. The first dedicated grimoire-choice screen occurs after five completed circles. Three initial grimoires are available:

- **Grimoire of the Ashen Crown:** twin fire lances; heavy damage.
- **Codex of the Hollow Winter:** a fan of ice bolts that slows enemies.
- **Tome of the Stormbound:** rapid, piercing lightning needles.

Each grimoire has three stackable specialization boons (damage, recovery/cooldown, and projectile speed), each capped at three stacks. After at least two grimoire specialization upgrades, its evolution can appear among later choices:

- Ashen Crown → **Infernal Testament**.
- Hollow Winter → **Glacial Sovereign**.
- Stormbound → **Tempest Ascendant**.

Evolutions replace the current grimoire with a stronger form. General boons are also available: Arcane Edge (damage), Quickcast (cooldown), Swiftstep (movement), Ward Resonance (duration), Expanding Ward (radius), Vitality (maximum life plus a restored life), and Stormshot (projectile speed).

### Progression and circles

- The run begins at Circle 1 and ends after Circle 50 is cleared.
- Circles 10, 20, 30, 40, and 50 each replace the ordinary spawn queue with an Archon.
- Five distinct Archon identities cycle through the campaign: Vaelith, Mordrath, Elyndra, Tharos, and Aurex. The boss interface displays its name and health bar.
- Ordinary circle queues grow with circle number and add imps from Circle 2, wraiths from Circle 3, and cultists from Circle 4.
- From Circle 3 onward, bats and imps can reinforce while ranged enemies remain alive. Reinforcements are rate-limited and capped per circle; Archon circles do not use them.
- Enemy base score scales with circle and difficulty tier, capped at a 2.1× multiplier. Enemy statistics also scale with progression, with caps in the code.
- Score doubles as experience. A progress meter fills toward a circle-scaled target, starting from the formula `(2400 + circle × 300) × score multiplier`. Reaching the target opens an upgrade choice and resets the experience cycle.
- A guaranteed upgrade choice also follows every fifth completed circle. The fifth completed circle is a special case that presents the initial grimoire options.
- Regular enemy defeats may drop Vitality (heart), Surge (temporary faster casting), or Aegis (next-hit protection); drop odds are higher for generous/boss rewards. Gifts drift down and are drawn toward a nearby player.

### Enemies and bosses

- **Bats:** fast, low-health pressure.
- **Imps:** sturdier, slower melee pressure.
- **Wraiths:** tougher ranged threats.
- **Cultists:** ranged enemies with higher base durability.
- **Archons:** large bosses with circle-scaled health, distinct names, colors, and visual motifs.

### Interface, art, and sound

- The playfield is drawn with the Canvas 2D API, including the mage, enemies, projectiles, spires, stars, gifts, hit effects, particles, and scrolling background.
- HTML overlays provide title, pause, upgrade, boss, HUD, and end screens; CSS provides the dark, gold-accented fantasy style.
- The title screen includes an expandable progression primer explaining automatic casting, score-based boon choices, the first grimoire choice after Circle 5, and grimoire evolution requirements.
- The canvas uses a fixed logical aspect and scales to the viewport. CSS accounts for dynamic mobile viewport size and safe-area insets.
- Touch controls use pointer events, pointer capture, and a virtual movement pad. The game also listens for resize/orientation/fullscreen/visual-viewport changes.
- Audio is synthesized in the browser with Web Audio; no external art or audio asset pipeline is currently required.

## Technical shape

- No framework, bundler, server, or dependency manifest is currently required.
- `js/game.js` is a small ordered loader for the scripts in `js/`. The modules share classic-script global bindings and retain one central game-state object.
- Core states include menu, play, pause, upgrade, dying, and over.
- Game content and balance live in `js/data.js`; progression, combat, game flow, rendering, and input are separated into focused files under `js/`.
- `assets/styles/style.css` contains desktop and coarse-pointer responsive layouts; `index.html` binds the DOM elements used by the script.

## Current scope boundary

The intended near-term direction is a polished, dependable solo arcade campaign. The current implementation is asset-light and self-contained. New content should reinforce the mage-versus-encroaching-darkness premise and the build progression. Multiplayer, online services, account systems, and a large external asset pipeline are not established requirements in the current project.

