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

## Full deployment on Vercel

The GitHub production branch is `spellstorm-prototype`. Import the repository with the **Other** preset and root directory `./`. Keep the build and output settings at their repository defaults (`node tools/build-static.cjs`, `public-build`). Select Node.js 22.x where the project offers a runtime setting. `vercel.json` uses the community PHP runtime `vercel-php@0.9.0`; only the game's static assets are publicly copied by the build. The PHP router handles the named application endpoints.

In Supabase, open the Spellstorm project, click **Connect**, and select the **Session pooler** connection (port 5432). For an existing database, apply `database/sessions.sql` if the session table has not already been created. For a new database, apply `database/database.sql`, `database/challenges.sql`, `database/achievement-tiers.sql`, then `database/sessions.sql` in that order.

Set these server-only Vercel environment variables for Production (and a separate database for Preview if needed):

| Variable | Value from Supabase Session pooler |
| --- | --- |
| `SPELLSTORM_DB_HOST` | Exact pooler host from Connect |
| `SPELLSTORM_DB_PORT` | `5432` |
| `SPELLSTORM_DB_DATABASE` | `postgres` |
| `SPELLSTORM_DB_USERNAME` | Pooler username, usually `postgres.<project-ref>` |
| `SPELLSTORM_DB_PASSWORD` | Database password (Secret) |

Use the database password, not the Supabase API key. Never commit it. Database-backed PHP sessions are automatically enabled on Vercel; local PHP continues to use normal file sessions unless `SPELLSTORM_DB_SESSIONS=1` is set. Session pooler mode is required for the PostgreSQL session locks. After deployment, verify login, logout, direct access permissions, profile image upload, game run saving and the leaderboard over HTTPS.

The planned full application deployment is Vercel. Profile pictures can be uploaded from the mage profile or administrator settings (PNG, JPEG or WebP, up to 512 KB and 2048 × 2048 pixels). Images are validated by PHP and stored in the existing database profile field, rather than on a temporary hosting filesystem. They appear on the leaderboard and navigation.

`index.html` and the game scripts run on any static host, including GitHub Pages. Account, leaderboard, and run-saving features depend on the PHP entry points (`login.php`, `register.php`, `run-api.php`, `rank-preview.php`, `site-nav.php`) plus the database configuration in `config/`. Those features are unavailable on a static host; the game remains playable as a guest with local best-score storage.
