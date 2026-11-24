const BALANCE = {
  simulationStep: 1 / 120, maxFrameTime: 0.1, minimumSpellInterval: 0.045,
  surgeIntervalMultiplier: 0.55, surgeMinimumSpellInterval: 0.035, surgeDuration: 4.5,
  firstXpTarget: 2700, xpPerQueuedEnemy: 650,
  maxOrdinaryEnemies: 14, maxRangedEnemies: 6,
  reinforcementLimit: 4, reinforcementFodderCap: 3, reinforcementInterval: 1.2,
  bossHealth: [620, 1150, 1900, 2900, 4200],
};

const GRIMOIRES = {
  basic: {
    name: "Basic Grimoire",
    hint: "A blank spellbook",
    color: "#b9a7ce",
    attack: "basic",
    cooldown: 0.3,
    damage: 1,
    projectileSpeed: 480,
  },
  ashen: {
    name: "Grimoire of the Ashen Crown",
    hint: "Twin lances of fire",
    color: "#ff6a2a",
    attack: "ember",
    cooldown: 0.25,
    damage: 2,
    projectileSpeed: 620,
    evolution: "infernal",
  },
  hollowWinter: {
    name: "Codex of the Hollow Winter",
    hint: "A freezing fan",
    color: "#8eebff",
    attack: "rime",
    cooldown: 0.24,
    damage: 1.4,
    projectileSpeed: 480,
    evolution: "glacial",
  },
  stormbound: {
    name: "Tome of the Stormbound",
    hint: "Piercing lightning",
    color: "#d2b6ff",
    attack: "tempest",
    cooldown: 0.10,
    damage: 1,
    projectileSpeed: 740,
    evolution: "thunderous",
  },
  infernal: {
    name: "Infernal Testament",
    hint: "A devastating crown of fire",
    color: "#ff9b42",
    attack: "ember",
    cooldown: 0.20,
    damage: 3,
    projectileSpeed: 760,
  },
  glacial: {
    name: "Glacial Sovereign",
    hint: "A blizzard that binds the veil",
    color: "#b7f3ff",
    attack: "rime",
    cooldown: 0.22,
    damage: 2.2,
    projectileSpeed: 560,
  },
  thunderous: {
    name: "Tempest Ascendant",
    hint: "Lightning that pierces the storm",
    color: "#ead7ff",
    attack: "tempest",
    cooldown: 0.09,
    damage: 1.6,
    projectileSpeed: 900,
  },
};

const GRIMOIRE_ART = { basic: '', ashen: '-1', hollowWinter: '-2', stormbound: '-3', infernal: '-4', glacial: '-5', thunderous: '-6' };
function grimoireEmblem(id) {
  const names = { basic: 'basic-grimoire', ashen: 'ashen-crown', hollowWinter: 'hollow-winter', stormbound: 'stormbound', infernal: 'infernal-testament', glacial: 'glacial-sovereign', thunderous: 'tempest-ascendant' };
  return `assets/grimoire/ss-emblem-${names[id] || names.basic}.png`;
}
const ABILITY_ART = {
  'ashen-nova': 'ember-nova', 'ashen-cinders': 'cinders', 'ashen-infernal': 'infernal-pyre',
  'hollow-frostbite': 'frostbite', 'hollow-deeprime': 'deep-rime', 'hollow-hail': 'sovereign-hail',
  'storm-thunderclap': 'thunderclap', 'storm-static': 'static', 'storm-breaker': 'stormbreaker',
};
function bookArt(id, state) {
  return `assets/grimoire/State=${state}${GRIMOIRE_ART[id]}.png`;
}
function spellArt(id) {
  const element = { ashen: 'fire', infernal: 'fire', hollowWinter: 'ice', glacial: 'ice', stormbound: 'lightning', thunderous: 'lightning' }[id];
  return element ? { element, tier: ['infernal', 'glacial', 'thunderous'].includes(id) ? 'evolved' : 'base' } : null;
}
function abilityArt(id, platform, state) {
  const label = platform[0].toUpperCase() + platform.slice(1);
  const status = state[0].toUpperCase() + state.slice(1);
  return `assets/grimoire/Platform=${label}, State=${status}-${ABILITY_ART[id]}-${platform}-${state}.png`;
}

const GRIMOIRE_OPTIONS = [
  {
    id: "ashen",
    name: GRIMOIRES.ashen.name,
    description: "Bursting twin fire lances with heavy damage.",
  },
  {
    id: "hollowWinter",
    name: GRIMOIRES.hollowWinter.name,
    description: "A slowing fan of ice bolts.",
  },
  {
    id: "stormbound",
    name: GRIMOIRES.stormbound.name,
    description: "Rapid lightning needles that pierce enemies.",
  },
];

const GRIMOIRE_UPGRADES = {
  ashen: [
    { id: "ashen-cinders", name: "Crown of Cinders", description: "+20% of base fire damage.", maxStacks: 3, apply: (player) => { player.grimoireDamage += 0.20; } },
    { id: "ashen-furnace", name: "Furnace Heart", description: "Reduce fire cooldown by 8%.", maxStacks: 3, apply: (player) => { player.grimoireCooldownMultiplier *= 0.92; } },
    { id: "ashen-flare", name: "Crownflare", description: "Fire lances travel 18% faster.", maxStacks: 3, apply: (player) => { player.grimoireSpeedMultiplier *= 1.18; } },
  ],
  hollowWinter: [
    { id: "winter-rime", name: "Deep Rime", description: "+20% of base ice damage.", maxStacks: 3, apply: (player) => { player.grimoireDamage += 0.20; } },
    { id: "winter-thaw", name: "Long Winter", description: "Reduce ice cooldown by 8%.", maxStacks: 3, apply: (player) => { player.grimoireCooldownMultiplier *= 0.92; } },
    { id: "winter-bite", name: "Biting Cold", description: "Ice bolts travel 18% faster.", maxStacks: 3, apply: (player) => { player.grimoireSpeedMultiplier *= 1.18; } },
  ],
  stormbound: [
    { id: "storm-voltage", name: "High Voltage", description: "+20% of base lightning damage.", maxStacks: 3, apply: (player) => { player.grimoireDamage += 0.20; } },
    { id: "storm-current", name: "Live Current", description: "Reduce lightning cooldown by 8%.", maxStacks: 3, apply: (player) => { player.grimoireCooldownMultiplier *= 0.92; } },
    { id: "storm-conduit", name: "Storm Conduit", description: "Lightning needles travel 18% faster.", maxStacks: 3, apply: (player) => { player.grimoireSpeedMultiplier *= 1.18; } },
  ],
};

const GRIMOIRE_EVOLUTIONS = {
  infernal: {
    id: "evolve-infernal",
    name: GRIMOIRES.infernal.name,
    description: "Evolve the Ashen Crown into a devastating fire grimoire.",
    grimoire: "infernal",
  },
  glacial: {
    id: "evolve-glacial",
    name: GRIMOIRES.glacial.name,
    description: "Evolve Hollow Winter into a powerful freezing codex.",
    grimoire: "glacial",
  },
  thunderous: {
    id: "evolve-thunderous",
    name: GRIMOIRES.thunderous.name,
    description: "Evolve Stormbound into a faster, stronger lightning tome.",
    grimoire: "thunderous",
  },
};

const UPGRADE_OPTIONS = [
  {
    id: "arcane-edge",
    maxStacks: 3,
    name: "Arcane Edge",
    description: "+15% of base grimoire damage.",
    apply(player) {
      player.spellDamage += 0.15;
    },
  },
  {
    id: "quickcast",
    maxStacks: 3,
    name: "Quickcast",
    description: "Reduce grimoire cooldowns by 6%.",
    apply(player) {
      player.cooldownMultiplier *= 0.94;
    },
  },
  {
    id: "swiftstep",
    maxStacks: 2,
    name: "Swiftstep",
    description: "Move 10% faster.",
    apply(player) {
      player.moveSpeed *= 1.10;
    },
  },
  {
    id: "ward-resonance",
    maxStacks: 3,
    name: "Ward Resonance",
    description: "Ward Pulse recharges 0.3 seconds sooner.",
    apply(player) {
      player.wardCooldown -= 0.3;
    },
  },
  {
    id: "expanding-ward",
    maxStacks: 2,
    name: "Expanding Ward",
    description: "Ward Pulse reaches 24 pixels farther.",
    apply(player) {
      player.wardRadius += 24;
    },
  },
  {
    id: "vitality",
    maxStacks: 2,
    name: "Vitality",
    description: "Gain a maximum life and restore one life.",
    apply(player) {
      player.maxLives += 1;
      player.lives = Math.min(player.maxLives, player.lives + 1);
    },
  },
  {
    id: "stormshot",
    maxStacks: 3,
    name: "Stormshot",
    description: "Your grimoire projectiles travel 15% faster.",
    apply(player) {
      player.projectileSpeedMultiplier *= 1.15;
    },
  },
];

const GRIMOIRE_ABILITY_KITS = {
  ashen: {
    name: GRIMOIRES.ashen.name,
    icon: "🔥",
    abilities: [
      { id: "ashen-nova", name: "Ember Nova", icon: "🔥", type: "damage", description: "Nova of flame burns through nearby foes.", cooldown: 8, radius: 70, damage: 5 },
      { id: "ashen-cinders", name: "Cinders", icon: "🕯️", type: "debuff", description: "Create a cinder field that slows enemies.", cooldown: 10, radius: 150, slow: 1.6 },
      { id: "ashen-infernal", name: "Infernal Pyre", icon: "☄️", type: "ultimate", description: "Devastating infernal pyre.", cooldown: 15, radius: 110, damage: 12 },
    ],
  },
  hollowWinter: {
    name: GRIMOIRES.hollowWinter.name,
    icon: "❄️",
    abilities: [
      { id: "hollow-frostbite", name: "Frostbite", icon: "❄️", type: "damage", description: "Frost shard burst.", cooldown: 8, radius: 70, damage: 4.5 },
      { id: "hollow-deeprime", name: "Deep Rime", icon: "🧊", type: "debuff", description: "Create a freezing field that slows enemies.", cooldown: 10, radius: 150, slow: 2.0 },
      { id: "hollow-hail", name: "Sovereign Hail", icon: "🌨️", type: "ultimate", description: "Sovereign hail of ice.", cooldown: 15, radius: 110, damage: 11 },
    ],
  },
  stormbound: {
    name: GRIMOIRES.stormbound.name,
    icon: "⚡",
    abilities: [
      { id: "storm-thunderclap", name: "Thunderclap", icon: "⚡", type: "damage", description: "Thunderous clap of lightning.", cooldown: 8, radius: 70, damage: 4.5 },
      { id: "storm-static", name: "Static", icon: "🌩️", type: "debuff", description: "Create a static field that slows enemies.", cooldown: 10, radius: 150, slow: 1.8 },
      { id: "storm-breaker", name: "Stormbreaker", icon: "🌩️", type: "ultimate", description: "Stormbreaker unleashes lightning.", cooldown: 15, radius: 110, damage: 11 },
    ],
  },
};

const ENEMIES = {
  bat: { hp: 2, speed: 150, score: 70, radius: 18 },
  imp: { hp: 4, speed: 70, score: 120, radius: 20 },
  wraith: { hp: 9, speed: 48, score: 200, radius: 24 },
  cultist: { hp: 12, speed: 36, score: 260, radius: 22 },
  archon: { hp: 120, speed: 28, score: 2800, radius: 46 },
};

const ARCHONS = [
  { name: "Vaelith, Crown of Dusk", color: "#f0c56a", accent: "#8f4e9c", model: "crown" },
  { name: "Mordrath, the Ashen Warden", color: "#ff8a4c", accent: "#7d2c2c", model: "horns" },
  { name: "Elyndra, Veil of Winter", color: "#b7f3ff", accent: "#477ea0", model: "halo" },
  { name: "Tharos, Storm-Eyed", color: "#d2b6ff", accent: "#4b3b91", model: "wings" },
  { name: "Aurex, the Last Spire", color: "#ffe6a1", accent: "#9b6b32", model: "crown" },
];

const LINES = [
  "The bats stir under the moon",
  "Imps catch the scent of ash",
  "Wraiths slip their graves",
  "Cultists raise black staves",
  "The veil wears thin",
];

