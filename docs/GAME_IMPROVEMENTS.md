# Spellstorm: Mechanics and Balance Instructions

_Review baseline: 2026-11-18. Status: proposals awaiting approval._

## Purpose and use

Use this file as the project-specific instruction guide for the next mechanics, game math, or balance procedure. Read it alongside `GAME_TODO.md`, `GAME_PROGRESS.md`, and the current implementation before proposing changes.

This is a skill-style project guide. It is not an installed or automatically discovered `SKILL.md`; explicitly ask the next agent to follow `GAME_IMPROVEMENTS.md`.

## Authorization boundary

The user requested analysis, recommendations, and permission before gameplay changes. Creating this document does not approve any recommendation below.

- Begin with read-only inspection and calculations.
- Present a concrete design with proposed behavior, numerical targets, tradeoffs, affected files, and validation before requesting approval.
- Wait for explicit approval of that design before changing gameplay, balance constants, or runtime behavior.
- Treat permission to document or plan as permission for that work only.
- Record later approvals and their scope in the decision log. Continue within approved scope without asking for the same permission again.

## Evidence rules

The baseline findings came from source inspection and arithmetic. No full campaign playtest or measured grimoire win-rate comparison was completed for this review.

1. Recheck every formula against the current source; this document is a dated baseline.
2. Separate confirmed code behavior, mathematical estimates, and playtest hypotheses.
3. Do not equate theoretical damage per second with damage actually delivered. Include projectile spread, target size, piercing, travel distance, overkill, and accuracy.
4. Measure frame-rate effects: spell recovery currently resets a timer and emits at most one volley per update, so ideal cooldown calculations can overstate firing rate.
5. Keep proposed numbers provisional until validated. Do not describe an untested build as balanced.

## Priority 1: Preserve earned experience

**Confirmed behavior:** `resetXpCycle()` sets the experience baseline to the current score. It runs when an experience threshold is reached and again after choosing an upgrade, including milestone upgrades. Threshold overflow and partial progress at milestone choices can therefore be discarded.

**Source:** `js/progression.js` — `resetXpCycle`, `checkXpUpgrade`, `chooseUpgrade`; `js/combat.js` — `addScore`.

**Recommended design:** Preserve partial experience through guaranteed milestone choices and carry threshold overflow into the next earned upgrade cycle.

Before implementation, specify:

- When the next experience target is calculated as circles change.
- How multiple earned choices are queued when one reward crosses several thresholds.
- How experience and milestone choices occurring together are ordered, including the Circle 5 grimoire choice.
- How upgrades interact with the final kill, victory, and defeat states.

**Acceptance checks:** A milestone does not erase partial experience; overflow is retained; earned choices appear exactly once; simultaneous rewards do not replace each other or override the ending.

## Priority 2: Balance grimoire damage and upgrade value

**Confirmed behavior:** General and specialization damage boons add one damage to every projectile. Their value varies with base damage, projectile count, firing rate, and piercing.

Ideal base output before upgrades, ignoring frame timing and misses:

- Basic: `1 / 0.30 = 3.33` damage per second.
- Ashen: `2 projectiles * 2 damage / 0.20 = 20` if both lances connect.
- Hollow Winter: `1 / 0.24 = 4.17` for one connecting bolt, up to `12.5` if all three connect.
- Stormbound: `1 / 0.08 = 12.5` against one target, with additional value from piercing other targets.

A +1 damage boon increases Stormbound's damage per projectile by 100% and Ashen's by 50%. These facts do not establish which grimoire wins actual runs.

**Source:** `js/data.js` — `GRIMOIRES`, `GRIMOIRE_UPGRADES`, `UPGRADE_OPTIONS`; `js/combat.js` — `fireSpell`.

**Recommended design:** Evaluate proportional damage upgrades rather than universal flat additions. Preserve distinct proposed roles: fire for focused damage, ice for control and coverage, lightning for piercing.

Compare base, intermediate, evolved, and maximum legal builds. Include stacked cooldown reductions and Surge. Check ice slow against each enemy type, projectile travel range, and hit-count breakpoints against enemy health. Do not compensate for low accuracy using theoretical volley damage alone.

**Acceptance checks:** Each grimoire has a useful role; upgrade value is explainable; no branch consistently dominates comparable encounters; evolved and high-stack builds remain controllable at representative frame rates.

## Priority 3: Control campaign length and enemy density

**Confirmed behavior:** Regular queues contain `6 + 2 * circle` enemies. Archon circles replace the queue with one boss. Across the 45 regular circles, this totals 2,520 queued enemies before reinforcements. Circle 1 queues eight enemies; Circle 49 queues 104.

The nominal regular-circle spawn intervals plus transition allowances sum to roughly 14 minutes. This is an estimate of the spawn schedule, not a measured run duration; bosses, cleanup, overlap, frame timing, upgrades, and player performance affect elapsed time.

**Source:** `js/progression.js` — `buildQueue`, reinforcement functions; `js/game-flow.js` — spawning and circle transition logic.

**Recommended design:** Initially retain the 50-circle endpoint while evaluating reduced late-circle queue growth. Establish the intended run duration with the user before choosing a queue cap or replacement formula.

Measure circle duration, simultaneous enemies and hostile shots, reinforcement count, escaped enemies, damage taken, and score earned. Account for the fact that fewer enemies also means fewer gifts, less score, and fewer experience upgrades.

**Acceptance checks:** Later circles increase challenge without relying mainly on repetition; the measured campaign fits the approved duration target; progression and recovery remain viable after queue changes.

## Priority 4: Make Archon difficulty deliberate

**Confirmed behavior:** Boss health is `round((90 + circle * 12) * enemyHealthMultiplier())`, approximately 245 at Circle 10 and 1,301 at Circle 50. All five identities share the same movement and three-pattern attack logic.

**Source:** `js/combat.js` — `spawn`, `enemyHealthMultiplier`, `updateFoe`; `js/data.js` — `ARCHONS`.

**Risk to validate:** Different builds may produce either short kills or prolonged endurance fights. Shared patterns may make later bosses repetitive; source inspection alone cannot establish fight quality.

**Recommended design:** Measure each boss against representative builds, agree on fight-duration targets, then tune health and attack pacing together. Treat distinct boss patterns as a separate optional scope decision.

**Acceptance checks:** Every boss provides readable dodge opportunities; weak but viable builds can finish within the approved duration range; strong builds gain a meaningful advantage without making all encounters trivial.

## Priority 5: Improve boon and evolution reliability

**Confirmed behavior:** Two specialization selections make evolution eligible, but it still competes with other random offers. Evolution changes the grimoire key; the evolved keys have no specialization pool, so remaining original specialization boons disappear. Already acquired stat bonuses persist.

**Source:** `js/progression.js` — `getAvailableUpgrades`, `showUpgradePhase`, `chooseUpgrade`; `js/data.js` — specialization and evolution definitions.

**Recommended design:** Preserve the original specialization pool after evolution and make the evolution offer more reliable once eligible. Choose the exact offer rule with the user; guaranteed availability and weighted randomness have different effects on build variety.

Review offer sampling fairness, stack limits, weak or redundant choices, and what happens when the available pool is exhausted.

**Acceptance checks:** Evolution does not remove unfinished specialization choices; original stack caps still apply; eligibility is explained accurately; players can reasonably plan an evolution without every run becoming identical.

## Priority 6: Tune recovery using collected rewards

**Confirmed behavior:** Ordinary kills have a 4.5% heart chance when below maximum health, increasing to 10% at one life. Ordinary Surge and Aegis intervals add 6.5% and 4%. At full health, the unused heart interval becomes Surge, giving an 11% ordinary Surge chance. Boss drops use 34% heart, 40% Surge, and 26% Aegis intervals; at full health, Surge becomes 74%.

At Circle 50 a boss gift may spawn just before the game ends, leaving it unusable.

**Source:** `js/combat.js` — `maybeDrop`, `damageFoe`; `js/game-flow.js` — gift collection, `takeGift`, victory transition.

**Recommended design:** Measure spawned and collected rewards before adjusting probabilities. Evaluate recovery against enemy count, pickup reachability, damage frequency, and existing Aegis or Surge. Decide whether the final boss needs a different reward or no survival gift.

**Acceptance checks:** Recovery is useful without making damage inconsequential; duplicate protection and refreshed buffs have deliberate value; final rewards fit the ending; tuning remains valid after enemy-count changes.

## Procedure for the next session

1. Re-read current source and project instructions. Report changes that invalidate this baseline.
2. Use `superpowers:brainstorming` to clarify intended difficulty, campaign duration, and build identities.
3. Follow the selected approach in the decision log. The broader pass covering all six priorities has been selected; the conservative experience-and-evolution pass remains the considered alternative. Do not reopen that choice unless the user changes scope.
4. Prepare a reviewable design for the selected approach, including formulas or candidate values, affected systems, tradeoffs, and acceptance criteria. Ask for approval and stop before implementation.
5. After design approval, invoke `superpowers:writing-plans`. Record ordered tasks and suitable verification. Begin implementation only within the user's authorized scope.
6. Validate progression correctness before tuning combat numbers. Use controlled comparisons and repeatable scenarios; record assumptions and sample sizes.
7. Playtest early, middle, and late circles, every Archon, all three branches, evolution timing, pickups, Ward Pulse, death, restart, and victory. Include desktop and touch play where available.
8. Report measured results and remaining uncertainty. Update this file, `GAME_TODO.md`, and `GAME_PROGRESS.md` to distinguish completed work from pending proposals.

## Decision log

- Approved: save the analysis and future procedure in this Markdown file.
- Started: source recheck and balance planning, following the user's request to start this guide.
- Approved: broader balance pass covering all six priorities, retaining 50 circles, targeting 15–20 minutes of active play and moderate difficulty with room to recover. The user accepted the recommended direction.
- Draft: detailed rules, numerical candidates, evolution offer rule, and validation in [the mechanics balance design](superpowers/specs/2026-11-18-mechanics-balance-design.md).
- Reviewed: an independent builder check found no important unanswered questions in the draft. This is design review, not gameplay validation.
- Pending: gameplay design and implementation authorization.

## Planning progress

The source recheck confirmed that the six baseline behaviors remain present. The regular queues still total 2,520 enemies, experience still resets on boon selection, and evolved grimoires still lose access to the original specialization pool.

A 60-second arithmetic model of the current firing timer, using the same delta-time clamp, illustrates why timing must be addressed before comparing cooldown upgrades. Base Stormbound produces about 10 volleys per wall-clock second at 30 FPS and 12 at 60 FPS, versus the ideal 12.5. Fully cooldown-upgraded Tempest Ascendant with Surge has a nominal 0.02608-second cooldown (38.34 ideal volleys per second), but the modeled timer produces 30 at 30, 60, and 120 FPS. These are timer-model results, not browser measurements or damage delivered.

The progress document also contains stale Ward descriptions: the implementation uses an instantaneous pulse with a 3.8-second base recharge, not a 3.1-second active duration. Ward Resonance reduces recharge. Use the implementation as the planning baseline and correct the descriptive documentation during the approved pass.

The run length and difficulty targets have been selected. The next step is review and approval of the concrete design linked in the decision log, followed by the Superpowers implementation plan.

## Completion checklist for a future approved balance pass

- [x] Current baseline and formulas rechecked.
- [ ] Approach and design approved; approval scope recorded.
- [ ] Implementation plan prepared through Superpowers.
- [ ] Experience preservation and reward ordering verified.
- [ ] Grimoire comparisons cover practical accuracy and legal stacked builds.
- [ ] Campaign length, density, and reinforcement effects measured.
- [ ] Boss durations and dodge opportunities checked.
- [ ] Evolution availability and specialization continuity verified.
- [ ] Reward collection and recovery measured.
- [ ] Relevant regression checks and full playtests completed, with gaps disclosed.
- [ ] Results and remaining proposals documented.
