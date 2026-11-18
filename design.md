# Spellstorm — 16-bit Pixel Art Design Direction

Updated 2026-11-18. Figma art-direction and handoff brief.

## Creative direction

Spellstorm should feel like a dark fantasy arcade game from the 16-bit era, with a mage defending the last spire against an advancing veil. Build on the existing midnight-purple atmosphere, amber magic, distinctive grimoire colors, bold borders, and raised HUD controls. Translate those ideas into deliberate pixel clusters, stepped silhouettes, and limited color ramps.

The earlier arcade HUD established the right hierarchy and tactile controls. Improve it with one consistent pixel scale, stronger enemy and spell silhouettes, and clearer status changes. Use the spire, moon, celestial markings, mist, and floating mage as recurring motifs.

The intended feeling is magical, dangerous, responsive, and rewarding. Keep the playfield spacious enough to read incoming shots. The first deliverable is the HUD, followed by menus, spellbook assets, and gameplay art.

## Source and continuity

- Figma file: [Spellstorm design](https://www.figma.com/design/Wllsyk5seV5fzOrNHfUsxH/Spellstorm-The-vellum-vigil).
- Existing arcade reference: [three mobile combat states](https://www.figma.com/design/Wllsyk5seV5fzOrNHfUsxH/?node-id=20-68).
- Code reference: `index.html`, `hud.css`, `hud-digits.svg`, and `js/`. Actual names, available actions, and statistics come from the game data.
- Retain the visual relationship between dark metal, purple shadows, warm brass, orange fire, blue ice, and violet lightning.
- Treat the Figma drawings as editable source artwork. Review new pixel assets beside the previous HUD states to judge the transition.

## Pixel construction

Here, 16-bit describes the visual language of detailed sprite art, layered backgrounds, and controlled shading. Use a practical project palette rather than a literal hardware color budget.

- Author HUD icons on a 16 × 16 source grid. Use 24 × 24 for spellbook emblems that need more detail.
- Use a single source-pixel unit per component. Build stepped corners and diagonals on that grid, with integer coordinates and dimensions.
- Show source assets at 1×, 2×, and 3× using nearest-neighbor scaling. Choose an integer display scale for pixel assets, while surrounding layout adapts to screen size.
- Keep the existing 540 × 960 logical playfield as the implementation reference. A proposed 180 × 320 art grid maps to it at 3×. Confirm this grid during the first sprite pass before extending it across the game.
- Use two to four shades per material, intentional clusters, and short stepped diagonals. Apply sparse dithering to large environmental surfaces where it adds texture.
- Keep pixel edges crisp. Use discrete highlight bands and offset silhouettes for depth. Reserve softer atmosphere for layers behind the action, with a crisp sprite core in front.
- Use a consistent light source from the upper left. Give raised controls a bright upper edge, midtone face, dark lower edge, and a small offset shadow. Give meters a dark inner well and a lighter lower lip.

## Palette

These values extend the current game and Figma palette. Create named Figma variables for them and bind component fills and strokes.

| Role | Base | Highlight | Shadow |
| --- | --- | --- | --- |
| Night and playfield | `#171120` | `#30243D` | `#0C0914` |
| Metal HUD frame | `#51415F` | `#A18BAD` | `#21182D` |
| Brass and Ward | `#D5A34F` | `#FFE4A0` | `#80502C` |
| Hearts and damage | `#F56872` | `#FFC0AA` | `#A93655` |
| Ashen Crown | `#FF7B39` | `#FFE2A0` | `#92342D` |
| Hollow Winter | `#68CFE5` | `#D1F7FF` | `#326184` |
| Stormbound | `#AB8CE5` | `#E9D9FF` | `#58417D` |
| Primary text | `#F5E7C8` | — | `#171120` outline |
| Secondary text | `#C4B5CF` | — | — |

Give hostile shots a magenta-red core or outline distinct from player spell ramps. Differentiate fire, ice, and lightning through shapes as well as hue. Check the contrast of every final text/background pair at its delivered size.

## Typography

Use a compact bitmap face for combat labels and a custom pixel wordmark for Spellstorm. A local bitmap numeral set already exists for scores. Extend that visual weight and spacing to timers and counters.

- Score and timers need stable-width digits. Show a recognizable decimal point in cooldowns such as `1.4s`.
- Use a bold pixel display treatment for boss names, circle announcements, and short action labels. Let longer names wrap deliberately where needed.
- Use a larger, open pixel alphabet for boon descriptions and help text. Aim for 14–16 display pixels minimum for essential mobile text, then judge it at actual device size.
- Confirm font availability and licensing before selecting the production face. Inspect `0/O`, `1/I`, punctuation, and accented characters in the specimen sheet.
- Germania One and Barlow Condensed were part of the earlier arcade study. Replace their HUD roles with pixel lettering while preserving their strong hierarchy.

## HUD design — first priority

Create mobile and desktop layouts from the same reusable components. Preserve the established relationship between hearts, shield status, score, chain, circle, boss health, equipped grimoire, and Ward readiness.

### Run status

- Put lives and Aegis together so protection is visible beside health. Draw hearts with a clear outline and two or three stepped shades.
- Show score with bitmap digits. Allow the counter to grow beyond its initial digit count.
- Keep circle and chain compact. The chain can use a short warm highlight when it increases.
- Show experience as a segmented amber gauge with an inset border. Make the segment pattern visually distinct from boss health.
- Accommodate the initial three lives and the current maximum of seven after upgrades. Avoid overlapping the score at maximum health.

### Archon encounter

- Use the actual boss name and a broad, recessed red health gauge. Scale the frame to fit the longest supported name.
- Give the arrival a brief stepped frame expansion and restrained color flash, then settle into a quiet combat state.
- Keep the boss gauge outside the projectile approach area as much as the viewport allows.
- Use the existing five Archons: Vaelith, Crown of Dusk; Mordrath, the Ashen Warden; Elyndra, Veil of Winter; Tharos, Storm-Eyed; Aurex, the Last Spire.

### Grimoire and temporary effects

- Use a small spellbook emblem and compact name near the edge of the playfield. Reserve long descriptions for help or upgrade selection.
- Give Ashen Crown a crown/flame silhouette, Hollow Winter a crystal/frost silhouette, and Stormbound a split lightning silhouette.
- Show Surge with a lightning marker and a subtle animated casting accent. Show Aegis with a shield rune and a blue shell around the mage.
- When Aegis breaks, remove its HUD marker and scatter a few crisp shards around the mage. Keep health intact when the shield absorbs the hit.

### Ward and touch controls

- Give Ward a raised, stepped rune housing with a visibly depressed pressed state.
- Charging uses a muted segmented ring and a clear countdown. Ready uses a complete amber ring, a bright rune, and `READY`.
- Match the movement pad's border thickness and lighting to Ward. Show a distinct thumb position and directional marks.
- Keep touch targets at least 48 × 48 CSS-equivalent pixels even if the visible icon is smaller. Allow simultaneous movement and Ward use.
- Leave a gap between the bottom controls and the action. Respect phone safe areas and test both thumbs against the mage's reachable area.

## Required Figma HUD frames

Start with 390 × 844 mobile and 1440 × 900 desktop. Add a 320 × 568 mobile stress frame and a landscape check. The vertical arena retains its aspect ratio inside wider screens.

Create the same encounter in these states so differences are easy to inspect.

- Normal combat with three lives and Ward charging.
- Ward ready with the same enemy arrangement.
- Aegis active, then Aegis breaking with unchanged health.
- Low health with one heart and an unobtrusive warning.
- Surge active and a high chain multiplier.
- Boss encounter with a long name and nearly depleted health.
- Maximum seven lives and a large score.

Use real game strings and plausible current values. Label illustrative values in the design notes so they are distinguishable from balance requirements.

## Menus and upgrades — following the HUD

The title screen should feature a pixel wordmark, the mage, and a layered spire scene. Make `Begin the vigil` the dominant action, with controls and progression accessible through `How to play`.

For boon selection, use three stepped spell seals or book fragments with an emblem, name, and one mechanical effect. A focused or hovered option gains a lit border. Selecting it sends a short color trail toward the mage or spellbook. Use the current game descriptions, including +1 damage specialization upgrades.

Carry the same frame construction into pause, defeat, and victory screens. Keep each screen's primary action obvious through size, placement, and contrast.

## Gameplay art transition

- Mage: readable hat, robe, staff, and bright casting tip. Use a 24 × 32 source sprite as the initial study. Review scale against existing collision radii before implementation.
- Enemies: bats have a wide wing silhouette, imps a pointed compact body, wraiths a trailing shape, and cultists a hood and staff. Keep each identity readable at movement speed.
- Archons: create distinct crown, horn, halo, and wing motifs using larger sprite footprints. Maintain clear space around their projectile origins.
- Projectiles: bright player-spell cores with short, sparse trails. Hostile magic gets consistent warning edges and easy-to-track silhouettes.
- Background: layered pixel spires, moonlight, distant fog, and subdued celestial markings. Reduce contrast behind dense combat.
- Pickups: a heart for Vitality, lightning for Surge, and a shield for Aegis. Keep their shapes recognizable during motion.

## Motion and depth

Show idle, pressed, ready, damage, and activation frames on the same pixel grid. Use short pose changes and controlled highlights. A button press should move its face by one source pixel and shorten its shadow. A meter fill should remain easy to read while changing.

Use brief effects for shield break, Ward cast, boon selection, and boss arrival. Provide reduced-motion examples with stable status changes and minimal flashing. Inspect flashes and particle density against the hostile-shot layer.

## Figma structure and handoff

Create a `16-bit direction` page alongside the existing studies. Organize it into foundations, HUD components, combat-state frames, sprite studies, and export-ready assets.

- Define palette variables, text styles, source pixel scale, spacing, border thickness, and shadow offsets.
- Build reusable components for hearts, shield status, XP meter, boss meter, score, grimoire indicator, movement pad, and Ward.
- Include Ward charging/ready/pressed states, status active/broken states, and meter empty/partial/full states. Use component properties for content and variants for meaningful appearance changes.
- Keep source pixel geometry and text editable. Make repeated HUD objects instances of shared components.
- Export pixel artwork as transparent PNG at its native source size. Include integer-scale previews and document the intended scale. Check for blur and unintended transparent padding.
- Separate scene sprites, effects, and interface assets in the handoff. Provide origin/anchor notes and dimensions for each sprite.
- Use descriptive names such as `hud/ward/ready`, `hud/status/aegis`, and `sprite/mage/cast-01`.

## Required export package for UI and HUD implementation

Deliver individual artwork, complete reference screens, and layout specifications together. Keep the editable Figma components as the source of truth. A flattened screen export is a visual reference, not an implementation asset.

### Asset inventory and states

| Group | Export separately | Required states or notes |
| --- | --- | --- |
| HUD plates | Run-status, score, grimoire, and boss-name frames | Standard appearance; stretch rules for variable content |
| Health | Heart icon | Full and empty; damage frame if animated |
| Experience | Gauge frame, fill segment, segment separator | Empty, partial, and full reference instances |
| Boss health | Gauge frame and red fill | Empty, partial, and full reference instances |
| Ward | Rune, raised housing, charge segments, activation artwork | Charging, ready, pressed, activated; countdown stays live text |
| Movement pad | Base, thumb piece, directional marks | Idle and moving references; thumb remains independently movable |
| Temporary effects | Aegis shield and Surge lightning icons | Active and expiring; broken Aegis effect with unchanged health |
| Starting and base grimoires | Basic Grimoire, Grimoire of the Ashen Crown, Codex of the Hollow Winter, Tome of the Stormbound emblems | Equipped and unselected treatments; reuse base emblem where only the surrounding frame changes |
| Evolved grimoires | Infernal Testament, Glacial Sovereign, Tempest Ascendant emblems | Available and equipped treatments |
| Buttons | Primary and secondary frames | Default, hover/focus, pressed, disabled |
| Boon choices | Stepped seal/book frame, selection border, emblems for every offered upgrade | Default, focused, selected, maximum stacks; use current names and descriptions from `js/data.js` |
| Menu panels | Title, help/progression, pause, upgrade selection, defeat, victory framing | Primary action clearly identified in each reference screen |
| Branding | Spellstorm pixel wordmark | Transparent background |
| Background | Sky, moon, distant spires, foreground spire, fog, celestial details | Separate layers with stacking order and scrolling/repeating behavior specified |
| Effects | Ward cast, Aegis break, boon selection, boss arrival | Numbered frames when animated; include a reduced-motion reference |

Full-opacity sky layers may be opaque. Icons, decorative frames, foreground scenery, and effects should use transparency wherever needed for compositing. Shared frame geometry should be delivered once with documented tint/state rules where that accurately reproduces the design.

### Text and font handoff

Keep scores, circle numbers, chain multipliers, boss names, grimoire names, upgrade descriptions, Ward countdowns, button labels, and results as live text. Export decorative framing separately so values can change without replacing images.

- Supply the selected webfont files, preferably WOFF2, and the license permitting their use and redistribution in the game.
- Document font family, weight, display size, line height, letter spacing, alignment, and outline/shadow settings for each text role.
- If numerals use a custom bitmap strip, include `0123456789`, a decimal point, and the multiplier symbol. Specify glyph order, source rectangles, advance widths, baseline, and spacing. Provide any additional suffix glyphs used in counters, or explicitly assign those to the live font.
- Keep the wordmark's editable pixel construction in Figma alongside its transparent export.

### Screen references

Provide complete PNG references and links to their editable Figma frames. References establish composition; individual assets establish how it is built.

| Reference | Required coverage |
| --- | --- |
| Combat HUD | 390 × 844 mobile and 1440 × 900 desktop using the same components |
| Small-screen stress check | 320 × 568 with readable labels and usable controls |
| Landscape check | Record the exact frame dimensions; preserve the vertical arena aspect ratio |
| Combat states | Three lives/Ward charging, Ward ready, Aegis active, Aegis broken, one heart, Surge/high chain, long boss name/nearly empty health, seven hearts/large score |
| Menus | Title, help/progression, pause, boon selection, defeat, victory; include mobile and desktop layouts |

Use real game strings. Include a long equipped grimoire name and a decimal cooldown such as `1.4s` in the stress references. Mark example scores, timers, and health values as illustrative rather than balance requirements.

### Export settings and manifest

- Export pixel artwork as PNG at native source resolution. Provide 2× and 3× previews using integer scaling and nearest-neighbor rendering. Screen references use their stated display dimensions.
- Preserve consistent source canvas dimensions and anchors across an asset's states or animation frames to prevent visual jumping.
- Record intentional transparent padding; remove accidental padding. Specify whether dimensions include the outline and shadow.
- For stretchable panels, give the fixed corner dimensions, repeatable edge/center regions, minimum size, and nine-slice insets where applicable. Avoid stretching decorative pixels to fractional sizes.
- For each animation, document frame order, duration per frame, loop behavior, trigger, and reduced-motion behavior.
- Document layout margins, spacing, alignment, safe-area offsets, layer order, target bounds, and minimum touch area. Distinguish visible art bounds from the interactive target.
- Include palette values, named Figma variables, typography styles, border thickness, source-pixel unit, and shadow offsets in the handoff.
- Include an asset manifest as Markdown, CSV, or JSON. Each entry needs: filename, purpose, Figma node link, source dimensions, intended display scale, anchor, padding, state, and any slicing or animation rules.
- Use descriptive filenames such as `hud-heart-full.png`, `ward-ready.png`, `grimoire-ashen-crown.png`, and `aegis-break-01.png`. Group exports into `hud/`, `ui/`, `grimoires/`, `backgrounds/`, `effects/`, and `fonts/` folders.

### Delivery order

1. **HUD implementation package:** hearts, HUD plates, XP and boss gauge pieces, Ward states, movement-pad pieces, grimoire/status icons, fonts or bitmap glyphs, mobile/desktop combat references, and their manifest/layout notes.
2. **Menus and world package:** wordmark, button and panel states, boon assets, menu references, layered backgrounds, and effects with animation notes.
3. **Gameplay art package:** mage, enemies, Archons, projectiles, and pickups from the gameplay art transition section, with source dimensions, anchors, and animation notes.

The first package must be complete enough to implement the HUD without guessing sizes, state appearances, or text behavior. These are delivery requirements; do not mark assets complete until they exist and have been inspected.

## Review checklist

- [ ] Score, health, Ward readiness, and boss health are readable in one glance at actual phone size.
- [ ] One pixel scale, border treatment, and lighting direction are used within each component.
- [ ] Ready, cooldown, shield break, and low-health states differ through shape or text as well as color.
- [ ] Long boss and grimoire names, seven hearts, and large scores fit their layouts.
- [ ] Touch controls stay clear of important combat cues and respect safe areas.
- [ ] Pixel exports remain crisp at intended display scales.
- [ ] Text, components, and source artwork are editable and consistently named.
- [ ] Game strings and available actions agree with current code.
- [ ] Mobile and desktop state frames have been inspected for overlap, clipping, and excessive decoration.
- [ ] Individual assets, reference frames, and the export manifest cover the required inventory and states.
- [ ] Dynamic text is separate from artwork; font files/licenses or documented bitmap glyphs are included.
- [ ] Native-size exports, anchors, padding, panel slicing, and animation timing are documented and checked.
- [ ] Background layers and effects have explicit composition and reduced-motion instructions.

## Figma task prompt

> Extend the Spellstorm file with a new 16-bit pixel-art direction page. Use this brief as the visual specification. Begin with reusable HUD components and the mobile combat states, then create their desktop equivalents. Preserve the dark purple fantasy atmosphere, amber Ward, grimoire colors, beveled controls, and the existing mage-versus-spire premise. Render frames, icons, and numerals on deliberate pixel grids with stepped edges and limited shade ramps. Use the game's real labels, meters, and status effects. Show Ward charging, Ward ready, Aegis active/breaking, low health, Surge, and an Archon encounter. Validate readability at actual phone size and keep the source artwork and components editable.

> Prepare the required export package described above: separate native-size artwork, state variants, webfonts or bitmap glyphs, full screen references, and an asset manifest with layout, slicing, anchor, and animation details. Keep changing values and labels as live text. Deliver the HUD implementation package first, followed by menus, backgrounds, effects, and gameplay art.
