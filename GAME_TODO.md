# Spellstorm: Work to Finish

_Last reviewed: 2026-11-16_

This is a practical backlog for taking the current playable prototype to a finished, shareable game. The code already contains a complete basic campaign loop, mobile controls, progression, boss encounters, and victory/defeat screens. Items below are remaining verification, polish, or explicit design decisions; they are not claims that a specific defect has already been observed.

## Priority 1: Verify the current build end to end

- [ ] Play a full run from the title screen through defeat. Confirm restart returns every run-specific value and overlay to its initial state.
- [ ] Reach the Circle 50 Archon and confirm that defeating it triggers the victory screen; confirm ordinary defeat still shows the defeat screen.
- [ ] Verify each tenth-circle Archon spawn, name, health bar, death, and transition to the next circle.
- [ ] Verify score experience can open an upgrade during combat and that the game resumes correctly after choosing one.
- [ ] Verify the guaranteed fifth-circle upgrade, initial grimoire selection, grimoire-specific upgrades, evolution requirements, and evolved attack behavior for all three grimoires.
- [ ] Verify the keyboard shortcuts for upgrade choices match the three cards currently displayed and ignore unavailable choices safely.
- [ ] Verify collision and protection outcomes: contact damage, hostile projectiles, temporary invulnerability, Aegis, Ward Pulse damage, Ward Pulse shot clearing, Rime slow, and piercing hits.
- [ ] Verify all gift types can spawn, move toward the player, expire, and apply the expected effect. Check heart behavior at maximum lives.
- [ ] Verify score, chain multiplier, best-score display, and `localStorage` save/load, including a browser where storage is unavailable or blocked.
- [ ] Verify pause/resume from keyboard and button, including that simulation and inputs stop while paused and that pause cannot corrupt upgrade or end states.
- [ ] Verify audio starts after a user gesture, behaves when browser audio is unavailable, and does not leave duplicate ambience after restarting.
- [ ] Record any bugs found with concise reproduction steps and fix them before release.

## Priority 2: Device and usability pass

- [ ] Check the title, HUD, boss bar, upgrade cards, pause screen, and end screen at common desktop sizes and narrow phone portrait/landscape sizes.
- [ ] Check mobile virtual-pad range, pointer release/cancel handling, Ward button cooldown feedback, and whether controls obscure the player or important action.
- [ ] Check high-DPI rendering, browser zoom, orientation changes, safe-area insets, and resizing while a run is active.
- [ ] Confirm every button can be activated with keyboard, has a visible focus state, and has useful accessible text. Confirm the canvas-only action information is also conveyed through the HTML HUD.
- [ ] Review color contrast and avoid relying on color alone for health, spell identity, or status.
- [ ] Check performance during dense waves and on a representative mobile device; reduce unnecessary per-frame work if frame rate degrades.

## Priority 3: Balance and campaign tuning

- [ ] Playtest the score-based experience target against actual enemy score and kill rates at early, middle, and late circles. Adjust the formula so upgrades arrive at a deliberate pace.
- [ ] Tune enemy spawn counts, reinforcement cadence/cap, enemy movement, projectile speed, health scaling, and collision radii for fair difficulty progression.
- [ ] Tune Archon health and attack patterns for a distinct, readable boss encounter; ensure later bosses remain challenging without becoming endurance checks.
- [ ] Check whether heart, Surge, and Aegis drop odds produce useful recovery without making survival automatic.
- [ ] Check whether repeated general and grimoire upgrades stack into runaway damage, cooldown, or movement. Add caps where needed and document them in the UI.
- [ ] Confirm the Circle 50 win condition, campaign length, and guaranteed milestone upgrade cadence match the intended run length.
- [ ] Decide whether continuing beyond Circle 50 is intentionally unsupported or whether an endless mode is part of the target release; document that decision.

## Priority 4: Finish presentation and onboarding

- [x] Update the title-screen controls/help text so it accurately explains that spellcasting is automatic and the numbered keys choose upgrade cards when a choice is open.
- [x] Add concise in-game explanations for score-as-experience, first grimoire choice timing, grimoire specialization, and evolution prerequisites. Keep the first run understandable without requiring the README.
- [ ] Review UI terminology for consistency: circle, Archon, grimoire, boon, experience, Ward Pulse, Surge, Aegis, and Vitality.
- [ ] Review visual readability of every enemy, projectile, player hit state, gift, upgrade option, and boss. Add distinct silhouettes or effects where shapes are hard to distinguish.
- [ ] Review synthesized sound levels and feedback for firing, hits, kills, Ward Pulse, pickups, upgrade selection, Archon arrival, victory, and defeat. Add a mute/volume control if needed.
- [ ] Consider a small amount of original music or ambience only if it improves the intended atmosphere and remains compatible with the lightweight, no-install direction.
- [ ] Revisit whether best score alone is enough persistent information. If adding settings or more records, provide reset/clear behavior and keep storage failure safe.

## Priority 5: Release readiness

- [ ] Choose and document the supported browsers and minimum practical screen sizes.
- [ ] Check that a clean copy of the project runs by opening `index.html`, with no missing dependencies or external assets.
- [ ] Add a short credits/license note if any third-party assets, fonts, code, or audio are introduced.
- [ ] Capture a few representative screenshots or a short gameplay clip for sharing.
- [ ] Make the README controls and progression notes agree with the final implementation, including mobile controls and the Circle 50 ending.
- [ ] Do a final human playthrough after the last fixes and record the release version/date.

## Optional future ideas (only after the core campaign is solid)

- [ ] Add more Archon patterns, enemy variants, arenas, or visual motifs if they add meaningful variety.
- [ ] Add a challenge mode or endless mode if replayability beyond the 50-circle campaign is desired.
- [ ] Add alternate mage appearances or unlockable spellbook cosmetics without obscuring combat readability.
- [ ] Add configurable controls or accessibility options if playtesting identifies a need.
