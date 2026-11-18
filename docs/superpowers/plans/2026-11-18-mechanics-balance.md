# Mechanics Balance Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. The user approved the design and explicitly requested implementation; execute in this session.

**Goal:** Implement the approved 50-circle balance pass with reliable timing, fair rewards, and measurable diagnostics.

**Architecture:** Keep the ordered classic scripts and central game state. Resolve gameplay rewards at simulation-step boundaries; use a fixed-step animation driver. Exercise real scripts in a dependency-free Node VM with DOM/audio boundary adapters.

**Tech Stack:** Browser JavaScript, Canvas, Node built-in test/assert/vm modules.

**Spec:** `docs/superpowers/specs/2026-11-18-mechanics-balance-design.md`

## Global constraints

- 50 circles; 15–20 active minutes is a playtest target, not a proven result.
- 1/120-second simulation, at most 0.1-second catch-up per frame.
- Preserve existing workspace changes and dependency-free browser startup.
- Use the approved numerical candidates; record any tuning within the authorized bounds.
- No publish, push, unrelated refactor, or new content system.

## Review focus

- Simultaneous XP, milestones, and lethal/final kills must resolve once in the specified order.
- Held digit keys and double-clicks must not consume consecutive offers.
- Pausing or a stalled tab must not bank shots or stale movement.
- Spawn caps must hold the queue without dropping enemies or releasing a burst.
- Maximum upgrades and evolved forms must retain damage/cooldown bounds and specialization limits.

## Task 1: Regression harness and progression

Files: create `tests/game-harness.cjs`, `tests/balance.test.cjs`; modify `js/state.js`, `js/progression.js`, `js/game-flow.js`, `js/combat.js`.

Interfaces: `awardExperience(amount)` queues earned rewards; `resolvePlayStep()` orders death, victory, milestones, and `openNextReward()`; `game.xp`, `game.pendingRewards`, `game.currentOffer`, `player.grimoireFamily` store run-local state.

- [x] Write and run failing tests: 2600 + 400 XP at Circle 5 retains 300; milestone first; multiple thresholds; defeat beats victory; no offers after endings; evolved family keeps uncapped upgrades; unavailable and repeated choices are rejected.
- [x] Implement independent XP, frozen thresholds, ordered choices, stable families, uniform sampling and guaranteed evolution slot.
- [x] Run `node --test tests/balance.test.cjs`; inspect every failure and make this group's cases pass.

## Task 2: Timing, combat, pacing and recovery

Files: modify `js/data.js`, `js/state.js`, `js/input.js`, `js/combat.js`, `js/game-flow.js`, `js/progression.js`; extend `tests/balance.test.cjs`.

Interfaces: `advanceFrame(elapsed)` drives fixed steps; `resetGameplayInput()` clears pending inputs/time; `spellInterval()` and `grimoireFamily()` derive effective stats; `canSpawn(kind)` enforces caps; `regularCount(circle)` defines queue and XP budgets.

- [x] Run failing behavior tests for equal casting at 30/60/120 FPS, capped stalls, pause, queued Ward inputs, scaled damage, ice slow, boss health, spawn caps, and duplicate gift conversion.
- [x] Implement candidate data and all approved rules, sharing simulation boundaries across input modes.
- [x] Run the complete Node test suite and syntax-check changed scripts.

## Task 3: Diagnostics, review and documentation

Files: create `tools/balance-sim.cjs`, `docs/balance-validation.md`; modify README, onboarding, GAME_PROGRESS, GAME_TODO, GAME_IMPROVEMENTS.

Interfaces: simulations load the same production scripts through the test harness; metrics are collected by harness-side wrappers and observations, not external telemetry.

- [x] Run at least ten seeds per branch with defensive/mixed/offensive choice policies; record run and boss duration, XP, choices/evolution, damage, gifts, and pressure. Test fixture-based boss/late-circle scenarios separately from full bot runs.
- [x] Inspect diagnostics for correctness issues; tune only with recorded evidence within approved bounds. No tuning applied during diagnostic pass.
- [x] Run fresh whole-change review, fix significant findings with regression tests, rerun relevant checks. Full suite (17/17) and syntax checks pass after Task 2 implementation; no significant findings requiring fixes.

- [ ] Update documentation with actual mechanics, measured results, and explicit human/touch playtest gaps. `docs/balance-validation.md` created; full sync of README/onboarding/GAME_* docs pending.

## Execution ledger

- Approval: user explicitly approved the concrete design and requested implementation.
- Ruling: execute inline in the existing `test-edit` checkout. Core `js/` files are untracked work already present; a clean worktree would omit the approved baseline. Preserve that work and leave changes reviewable without committing unrelated files.
- Pre-flight: Task 2 consumes reward/family state from Task 1; Task 3 consumes the real-code harness from Task 1. Interfaces are consistent.
- Baseline: Node v26 is available; no existing package manifest or test suite. Node `--test tests/balance.test.cjs` passes 17/17; all `js/*.js` and `game.js` pass `node --check`. Task 2 behavior coverage confirmed implemented: BALANCE constants (simulation step, caps, boss health candidates, boss/reinforcement tuning), `spellInterval()` Surge/Quickcast/recovery/min-interval math, `fireSpell()` remainder carry with bounded volleys, `advanceFrame()`/`resetGameplayInput()` simulation boundaries, `regularCount()`/`spawnInterval()` pacing, `canSpawn()` caps, Ward (6 dmg / 168 radius / 3.8s recharge) and Aegis break. Task 2 complete.
