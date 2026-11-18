# Spellstorm mechanics and balance design

Status: draft for design approval. Gameplay implementation has not started.

Review: independent builder check reported no important unanswered planning questions. Numerical values still require implementation tests and playtesting.

## Intent and approved direction

The user selected the recommended broader balance pass: retain 50 circles, target 15–20 minutes of active play, and provide moderate difficulty that rewards dodging while allowing recovery. Cover all six priorities in `GAME_IMPROVEMENTS.md`.

Active play includes combat and between-circle transitions. It excludes menus, pause time, and time spent choosing boons. The duration target applies to successful runs after a player has learned the controls; it is not a promise that every beginner wins.

The specific rules and initial tuning values below are proposed by the agent. Approval of the overall direction is recorded separately from approval of this design.

## Approaches considered

- Conservative fairness pass: preserve experience and specialization access. Smaller scope and fewer tuning interactions, but leaves campaign length, unequal offensive scaling, and recovery unresolved.
- Broader balance pass, selected: establish reliable timing and rewards, then tune combat, campaign pacing, bosses, and recovery together. Requires more validation because changing enemy counts also changes score, upgrades, and gifts.

Use the existing browser game and classic-script module structure. Preserve the fantasy shooter identity, automatic upward firing, three grimoire branches, Ward Pulse, five Archons, and the Circle 50 ending. New enemies, new boss patterns, art replacement, endless mode, networking, and persistent progression are outside this pass.

## 1. Reliable timing and state transitions

Rendering must not determine casting strength. Use a fixed simulation step of 1/120 second, accumulating elapsed time between animation frames. Cap catch-up to 0.1 second per frame (12 steps) so a stalled or background tab does not simulate a long unseen fight. Discard excess elapsed time beyond that cap. On pause, upgrade, restart, or return from a non-playing state, clear accumulated gameplay time. Keep rendering once per animation frame.

Keep input requests until a simulation step consumes them; consume a Ward request once. Keyboard, right-click, and touch Ward activation must use the same simulation boundary. Clear held/transient movement and Ward input on pause, upgrade, restart, and focus loss to avoid stale actions. Focus loss pauses an active run.

For spell recovery, carry the timer remainder by adding the next interval instead of replacing the timer with a fresh interval. Emit due volleys through a bounded loop. With a minimum spell interval of 0.045 second and 1/120-second steps, normal play will need at most one volley per step; protect against stale debt after state transitions. Do not bank attacks during menus or choices.

Collect kill rewards and milestone events during the current simulation step. Resolve state transitions once at its end, rather than opening a choice from inside `damageFoe` or `addScore`.

Resolution priority:

1. Defeat if lives reached zero during that step, even if the final boss also died. Later gifts in that step cannot resurrect the player.
2. Victory if the final boss was cleared and the player survived. Preserve earned score; discard pending gameplay choices and omit the final survival gift.
3. Circle transition and pending reward choices for an ongoing run.

Once a choice opens, stop further simulation steps for that frame. Shots and gifts freeze until the player resumes.

## 2. Experience and reward ordering

Continue using awarded score, including the chain multiplier, as experience. Keep score as the best-score metric. Track unspent experience independently from score so selecting a boon never wipes progress.

On each award, add exactly the awarded score to experience. Subtract a threshold only when an earned boon is queued. Preserve the remainder. A large reward can queue multiple boons; process them one at a time. A milestone choice spends zero experience.

Freeze the active experience threshold until it is crossed. On crossing, compute the next threshold from the circle in which the score was earned, before any end-of-step circle advancement. Use that threshold for additional crossings caused by the same award. A later circle change does not move a partially filled target.

Initial tuning:

- First earned boon: 2,700 experience.
- Subsequent threshold: `round(max(2700, 650 * regularCount(c)) * enemyScoreMultiplier(c))`.
- `regularCount(c)` is the queue-count formula in section 4. On an Archon circle, use `regularCount(c - 1)` for the count, with the current circle's score multiplier.
- Retain the current enemy score values and score multiplier cap of 2.1 for the initial tuning round.

The threshold formula deliberately follows the smaller enemy budget. The initial target is 14–18 experience boons plus eight ordinary milestone boons and the dedicated grimoire selection in a typical successful run. Evolution consumes one normal boon selection. This is a measurement target, not a calculated guarantee; chain performance strongly affects it.

For events earned in the same step, present the Circle 5 grimoire choice first, then an ordinary milestone boon if applicable, then experience boons in earned order. Build each offer from the player's state when that offer opens. Completing Circle 50 ends the run instead of offering another milestone.

If every available boon is exhausted, discard remaining pending boon tokens, show the experience meter as complete, and keep scoring. Do not create an empty or repeating upgrade screen. Restart clears experience, rewards, offer state, and thresholds.

Example: a 2,700 target with 2,600 experience receives 400 score on the final Circle 5 kill. Queue the grimoire selection and one earned boon, retaining 300 experience. Selecting either reward leaves those 300 points intact.

## 3. Grimoire roles and offensive scaling

The proposed roles are focused fire damage, ice coverage and slowing, and lightning penetration. Equal maximum volley damage is not the goal: accuracy, piercing, control, and encounter geometry must be measured.

Initial base damage/cooldown candidates (damage is per projectile):

- Basic: 1 damage, 0.30 seconds; retain its current starting behavior.
- Ashen: 2 damage, 0.25 seconds, two lances; ideal full-volley output 16 damage/second.
- Hollow Winter: 1.4 damage, 0.24 seconds, three bolts; ideal output 5.83 per connecting lane, 17.5 across all three.
- Stormbound: 1 damage, 0.10 seconds, one piercing needle; ideal 10 against one target.
- Infernal: 3 damage, 0.20 seconds, two lances; ideal full-volley output 30.
- Glacial: 2.2 damage, 0.22 seconds, three bolts; ideal output 10 per lane, 30 across all three.
- Tempest: 1.6 damage, 0.09 seconds, one piercing needle; ideal 17.78 against one target.

Retain projectile speeds, lifetime, fire spread, lightning spread, and unlimited distinct-target piercing initially. Change the ice fan from +/-0.28 to +/-0.18 radians, improving lane overlap at practical distances while retaining coverage. Repeated hits refresh the 1.6-second slow without stacking it. Ordinary enemies retain 45% slowing; Archons receive 20% movement slowing. Slow affects movement, including bat lateral motion, but does not alter enemy firing timers or existing shots.

Replace flat damage bonuses with additive bonuses relative to the currently equipped grimoire's base damage:

`projectileDamage = baseDamage * (1 + 0.15 * arcaneEdgeStacks + 0.20 * specializationDamageStacks)`

Both damage boons retain three-stack limits. At maximum damage stacks, damage is 2.05 times base; the bonus survives evolution and uses the evolved base damage. Keep fractional health/damage internally and do not round every hit.

Quickcast reduces the interval by 6% per stack (`0.94^stacks`); specialization recovery reduces it by 8% per stack (`0.92^stacks`). Each retains three stacks. Surge retains the 0.75 interval multiplier. Final interval:

`max(0.045, baseCooldown * 0.94^quickcastStacks * 0.92^specializationRecoveryStacks * surgeFactor)`

Keep existing movement, projectile-speed, Ward, and Vitality stack limits initially. Ward remains an instantaneous six-damage pulse with 168 radius and 3.8-second base recharge; Ward Resonance reduces recharge by 0.3 seconds per stack. Correct stale descriptions that call recharge an active duration.

Update boon cards and onboarding to explain percentages, stack limits, and evolution accurately. A grimoire change retains purchased bonuses and clamps any remaining fire timer to the new effective interval without granting a banked burst.

## 4. Campaign pacing and pressure

Regular queue count:

`regularCount(c) = min(36, 8 + floor(0.8 * (c - 1)))`

Regular spawn interval:

`spawnInterval(c) = max(0.40, 0.82 - 0.012 * c)` seconds.

Keep a 1.6-second transition and 0.3-second initial spawn delay after the first circle. Preserve the first-circle start delay. Keep Archons on 10, 20, 30, 40, and 50. The new regular queues total 1,141 enemies, versus 2,520 currently.

The nominal regular spawn schedule is approximately 10.4 minutes. Assuming five 35-second boss encounters and about five seconds of additional cleanup per regular circle gives approximately 17.1 minutes. Those assumptions require playtesting; they do not include additional time from spawn congestion.

Retain initial enemy type probabilities and ordinary health/movement/projectile scaling for the first comparison. Limit simultaneously alive ordinary enemies to 14 and ranged enemies to six. Hold a queued spawn when it would exceed either cap; do not discard or reroll it. When it becomes eligible, spawn at most one and restart its normal interval, avoiding a release burst.

Reinforcements remain limited to circles with surviving ranged enemies after the initial queue is exhausted. Limit each circle to four reinforcement spawns, with at most three live fodder enemies and a 1.2-second reinforcement interval. Apply the same overall enemy cap. No Archon reinforcements.

Record queue congestion and cleanup time. If the run misses its duration target, tune pacing against observed bottlenecks rather than treating the illustrative 17.1 minutes as a result.

## 5. Evolution and offer fairness

Track a stable grimoire family alongside its equipped form. Resolve specialization upgrades from the family both before and after evolution. Preserve their existing IDs and three-stack limits; evolving must not reset counts or grant a second pool of stacks.

Two specialization selections still unlock evolution, including two stacks of the same specialization. Once eligible, reserve one slot in each subsequent normal offer for evolution until chosen. The remaining slots are drawn uniformly without replacement from eligible boons. Players may defer evolution voluntarily.

Use a proper shuffle or equivalent unbiased sampling rather than a random sort comparator. Show up to three unique eligible choices. Validate a selection against the currently displayed offer, then apply it once; repeated input must not spend the next queued reward accidentally. Require a new keypress/click for each selection.

Initial grimoire selection always presents the three branches. Ordinary milestone choices and experience choices use the same offer rules.

## 6. Archon tuning

Use explicit boss health candidates: 240, 420, 650, 900, and 1,200 for Circles 10 through 50. Do not multiply these values by the ordinary enemy health multiplier again.

Retain the current aimed, radial, and spiral pattern sequence for this pass. Keep the existing projectile speed cap and movement bounds initially, with the ice movement-slow rule above. Distinct patterns for each identity require separate scope approval.

Target 20–45 seconds for typical builds, approximately 12–25 seconds for strong offensive builds, and at most 70 seconds for weaker but viable builds under competent aiming. These are tuning bands across representative builds; do not dynamically change boss health based on a player's selected boons. Check the first boss separately because many runs will not yet have evolved.

If duration is acceptable but hits are unreadable, adjust attack spacing or movement rather than inflating health. Validate dodging on the 540-by-960 playfield with both keyboard and touch controls.

## 7. Recovery and gift behavior

Begin with the current ordinary probabilities: heart 4.5% when injured, 10% at one life; Surge 6.5%; Aegis 4%. Retain the full-health conversion of the heart interval to Surge. Keep 11-second lifetime, 40 downward speed, 90 magnet radius, and existing pickup motion initially.

Keep one random boss gift on Circles 10–40 using the current 34/40/26 heart/Surge/Aegis intervals and full-health conversion. Circle 50 gives its score and victory without spawning a survival gift.

Surge refreshes to 4.5 seconds without stacking duration. A duplicate Aegis pickup converts to Surge using that same refresh rule, so it has a defined benefit. A heart collected at maximum health converts to Surge as well, covering gifts spawned before health was restored.

Record gifts spawned, collected, expired, and converted; track damage taken and recovery collected separately. Changing enemy count already changes recovery supply substantially, so do not lower drop probabilities simply because the previous campaign had many enemies.

## Validation and tuning authority requested

Design approval would authorize implementation of these rules, lightweight local test/simulation support, and bounded tuning to meet the agreed targets. It would not approve a publish, push, unrelated refactor, or new content system.

After establishing the initial candidate baseline, allow numerical adjustments within 20% of each proposed damage, cooldown, boss-health, queue-growth, spawn-interval, and experience coefficient. Round counts sensibly and preserve hard safety caps and stack limits. Ordinary/boss drop probabilities may differ from the initial baseline by at most two percentage points per reward interval, with total probability remaining valid. These bounds are relative to this design's initial candidates, not cumulative allowances for repeated rounds. Measure before and after. Larger shifts or changes to the specified rules return for approval. Record final values, reasons, and evidence.

Required correctness checks:

- Experience overflow, multiple thresholds, milestone coexistence, Circle 5 ordering, empty pools, and restart.
- Same-step final victory/death, ordinary lethal damage, and absence of interactive upgrade overlays after an ending.
- Evolution eligibility, guaranteed offer slot, preserved specialization counts, unbiased sampling, and rejecting stale or unavailable choices.
- Casting counts over equal active simulation time at 30, 60, and 120 rendering FPS differ by at most one volley per interval being measured. Check pause/resume, catch-up limits, Surge transitions, and all maximum legal builds.
- Damage/slow/piercing, Ward clearing, gifts, Aegis absorption and duplicates, and spawn/reinforcement caps.

Balance evidence:

- Use at least ten fixed seeds per grimoire for repeatable diagnostic runs, comparing defensive, mixed, and offensive selection policies. Record bot movement/aiming assumptions. Bot survival is not a human difficulty rating.
- Compare Circles 1, 5, 9, 19, 29, 39, and 49; all five bosses; base, evolved, and maximum legal stats. Include actual connecting projectiles and multiple-target damage, not only ideal volley output.
- Record active duration, circle duration, peak enemies/shots, kills/escapes, score/experience, choices earned, evolution circle, boss duration, damage taken, and gifts collected.
- Aim for 22–26 non-grimoire boon selections in typical successful runs, with legal variation for chain skill and build choices. Verify that all branches can reach the finale with viable mixed builds.
- Human playtests should cover one complete successful run per branch, a defeat/restart run, and representative touch combat. Report any unavailable human/device checks explicitly and leave balance sign-off pending them. Never claim a full playtest from source inspection or a timer model.

## Affected files and implementation boundaries

- `js/data.js`: centralized candidate values, boon descriptions, family/evolution metadata, explicit boss health.
- `js/state.js`, `js/progression.js`: experience balance, pending rewards, offer state, stable family, pacing functions, reset behavior.
- `js/combat.js`, `js/game-flow.js`: spell timing/damage, movement slow, drop rules, rewards, caps, and end-of-step transitions.
- `js/input.js`: fixed-step driver and consistent input consumption/focus handling.
- `index.html` and HUD text only as needed to make mechanics accurate; preserve the current visual design.
- `README.md`, `GAME_PROGRESS.md`, `GAME_TODO.md`, and `GAME_IMPROVEMENTS.md`: final rules, validation results, and unresolved playtest work.
- Local test/simulation files: choose minimal tooling compatible with the existing dependency-free runtime; no production telemetry or external services.

The builder may choose internal helper names, test organization, and metric export format. Keep existing unrelated workspace changes intact. After design approval, use Superpowers writing-plans to turn this design into ordered, verifiable implementation tasks.
