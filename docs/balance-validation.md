# Balance Validation Record

_Status: diagnostics for the approved balance pass are complete. Human and touch playtest sign-off is still pending._

## Method

- Diagnostics load the real production scripts through the dependency-free Node harness in `tests/game-harness.cjs` and drive them with bots implemented in `tools/balance-sim.cjs`.
- Full-run diagnostics: 10 fixed seeds per grimoire branch with choice policies `defensive`, `mixed`, and `offensive` — 30 runs total in `docs/balance-runs.json`.
- Smoke diagnostics: one seed, all policies, per branch in `docs/balance-runs-smoke.json`.
- Fixture diagnostics: circles 1, 5, 9, 19, 29, 39, 49, 10, 20, 30, 40, 50 x tiers `base`, `evolved`, `maximum` x branches — 108 runs in `docs/balance-fixtures.json`.
- Fixtures hold the build constant via an experience target of 1e12 and stop at the configured circle; full runs measure a complete campaign through Circle 50 or a timeout.

## Measured results (approved pass, initial candidate baseline)

- Full-run sweep: 26 of 30 bot runs won per branch; no runs timed out.
- Average final circle reached: ~44 of 50.
- Average active play duration: ~12.0 minutes (defensive ~11.7, mixed/offensive ~12.1).
- Average boon selections per successful run: ~24.4 (defensive ~22.6, mixed/offensive ~25.3).
- Boss encounter durations observed in smoke runs (ashen, defensive): Circle 10 ~18.9 s, Circle 20 ~10.1 s, Circle 30 ~12.7 s, Circle 40 ~9.6 s, Circle 50 ~14.8 s.

## Open items

- Bot survival is not a human difficulty rating. Human playtests remain required: one full successful run per branch, a defeat/restart run, and representative touch combat. Balance sign-off must not be claimed from source inspection, timer models, or bot runs alone.
- Tuning authority: approved numerical candidates may be adjusted within 20% of proposed values; drop probabilities within 2 percentage points per reward interval; larger shifts require re-approval.

## Next steps

- Record final measured values after human playtests.
- Complete documentation sync (`README.md`, onboarding text, `GAME_PROGRESS.md`, `GAME_TODO.md`, `GAME_IMPROVEMENTS.md`).
