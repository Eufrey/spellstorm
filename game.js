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
    cooldown: 0.16,
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
    damage: 1,
    projectileSpeed: 480,
    evolution: "glacial",
  },
  stormbound: {
    name: "Tome of the Stormbound",
    hint: "Piercing lightning",
    color: "#d2b6ff",
    attack: "tempest",
    cooldown: 0.08,
    damage: 1,
    projectileSpeed: 740,
    evolution: "thunderous",
  },
  infernal: {
    name: "Infernal Testament",
    hint: "A devastating crown of fire",
    color: "#ff9b42",
    attack: "ember",
    cooldown: 0.13,
    damage: 5,
    projectileSpeed: 760,
  },
  glacial: {
    name: "Glacial Sovereign",
    hint: "A blizzard that binds the veil",
    color: "#b7f3ff",
    attack: "rime",
    cooldown: 0.18,
    damage: 3,
    projectileSpeed: 560,
  },
  thunderous: {
    name: "Tempest Ascendant",
    hint: "Lightning that pierces the storm",
    color: "#ead7ff",
    attack: "tempest",
    cooldown: 0.055,
    damage: 2,
    projectileSpeed: 900,
  },
};

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
    { id: "ashen-cinders", name: "Crown of Cinders", description: "+2 fire damage.", maxStacks: 3, apply: (player) => { player.grimoireDamage += 2; } },
    { id: "ashen-furnace", name: "Furnace Heart", description: "Fire attacks recover 12% faster.", maxStacks: 3, apply: (player) => { player.grimoireCooldownMultiplier *= 0.88; } },
    { id: "ashen-flare", name: "Crownflare", description: "Fire lances travel 18% faster.", maxStacks: 3, apply: (player) => { player.grimoireSpeedMultiplier *= 1.18; } },
  ],
  hollowWinter: [
    { id: "winter-rime", name: "Deep Rime", description: "+2 ice damage.", maxStacks: 3, apply: (player) => { player.grimoireDamage += 2; } },
    { id: "winter-thaw", name: "Long Winter", description: "Ice attacks recover 12% faster.", maxStacks: 3, apply: (player) => { player.grimoireCooldownMultiplier *= 0.88; } },
    { id: "winter-bite", name: "Biting Cold", description: "Ice bolts travel 18% faster.", maxStacks: 3, apply: (player) => { player.grimoireSpeedMultiplier *= 1.18; } },
  ],
  stormbound: [
    { id: "storm-voltage", name: "High Voltage", description: "+2 lightning damage.", maxStacks: 3, apply: (player) => { player.grimoireDamage += 2; } },
    { id: "storm-current", name: "Live Current", description: "Lightning attacks recover 12% faster.", maxStacks: 3, apply: (player) => { player.grimoireCooldownMultiplier *= 0.88; } },
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
    name: "Arcane Edge",
    description: "+1 damage from every grimoire attack.",
    apply(player) {
      player.spellDamage += 1;
    },
  },
  {
    id: "quickcast",
    name: "Quickcast",
    description: "Reduce grimoire cooldowns by 10%.",
    apply(player) {
      player.cooldownMultiplier *= 0.9;
    },
  },
  {
    id: "swiftstep",
    name: "Swiftstep",
    description: "Move 15% faster.",
    apply(player) {
      player.moveSpeed *= 1.15;
    },
  },
  {
    id: "ward-resonance",
    name: "Ward Resonance",
    description: "Ward Pulse lasts 0.75 seconds longer.",
    apply(player) {
      player.wardDuration += 0.75;
    },
  },
  {
    id: "expanding-ward",
    name: "Expanding Ward",
    description: "Ward Pulse reaches 24 pixels farther.",
    apply(player) {
      player.wardRadius += 24;
    },
  },
  {
    id: "vitality",
    name: "Vitality",
    description: "Gain a maximum life and restore one life.",
    apply(player) {
      player.maxLives += 1;
      player.lives = Math.min(player.maxLives, player.lives + 1);
    },
  },
  {
    id: "stormshot",
    name: "Stormshot",
    description: "Your grimoire projectiles travel 15% faster.",
    apply(player) {
      player.projectileSpeedMultiplier *= 1.15;
    },
  },
];

const ENEMIES = {
  bat: { hp: 2, speed: 150, score: 70, radius: 14 },
  imp: { hp: 4, speed: 70, score: 120, radius: 16 },
  wraith: { hp: 8, speed: 48, score: 200, radius: 20 },
  cultist: { hp: 10, speed: 36, score: 260, radius: 18 },
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

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");
const menu = document.getElementById("menu");
const paused = document.getElementById("paused");
const over = document.getElementById("over");
const scoreEl = document.getElementById("score");
const circleEl = document.getElementById("circle");
const comboEl = document.getElementById("combo");
const livesEl = document.getElementById("lives");
const spellNameEl = document.getElementById("spell-name");
const spellHintEl = document.getElementById("spell-hint");
const wardFill = document.getElementById("ward-fill");
const bestMenu = document.getElementById("best-menu");
const bestOver = document.getElementById("best-over");
const finalScore = document.getElementById("final-score");
const overTitle = document.getElementById("over-title");
const bossHud = document.getElementById("boss-hud");
const bossName = document.getElementById("boss-name");
const bossHealthFill = document.getElementById("boss-health-fill");
const upgrades = document.getElementById("upgrades");
const upgradeChoices = document.getElementById("upgrade-choices");
const touchPad = document.getElementById("touch-pad");
const touchKnob = touchPad.querySelector("span");
const wardButton = document.getElementById("ward-button");
const mobileControls = document.getElementById("mobile-controls");
const xpBar = document.getElementById("xp-bar");
const xpFill = document.getElementById("xp-fill");

const LOGICAL_WIDTH = 540;
const LOGICAL_HEIGHT = 960;
const PLAYER_SCALE = 1.3;
const ENEMY_SCALE = 1.5;
const ENEMY_PROJECTILE_SCALE = 1.5;
const ENEMY_PROJECTILE_SPEED = 0.9;
const ENEMY_MAX_PACE = 1.75;
const ENEMY_MAX_PROJECTILE_SPEED = 1.45;
const ENEMY_MAX_STAT_TIER = 4;
const ENEMY_MAX_SCORE_MULTIPLIER = 2.1;
const PLAYER_BOUND_X = 28 * PLAYER_SCALE;
const PLAYER_BOUND_TOP = 36 * PLAYER_SCALE;
const PLAYER_HIT_RADIUS = 12 * PLAYER_SCALE;
const keys = new Set();
const pressed = new Set();
let rightClick = false;
let touchMove = null;

const audio = { ctx: null, drone: [] };

const game = {
  w: LOGICAL_WIDTH,
  h: LOGICAL_HEIGHT,
  viewportW: 0,
  viewportH: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  dpr: 1,
  state: "menu",
  time: 0,
  scroll: 0,
  stars: [],
  spires: [],
  motes: [],
  player: null,
  bullets: [],
  foes: [],
  shots: [],
  gifts: [],
  particles: [],
  floaters: [],
  queue: [],
  spawnCd: 0,
  between: 0,
  wave: 1,
  completedLevels: 0,
  xpStart: 0,
  xpTarget: 1080,
  upgradeCounts: {},
  score: 0,
  combo: 0,
  comboTimer: 0,
  shake: 0,
  banner: { text: "", sub: "", life: 0 },
  dying: 0,
  hint: 0,
  best: 0,
  won: false,
};

function loadBest() {
  try {
    game.best = Number(localStorage.getItem("spellstorm-best") || 0);
  } catch {
    game.best = 0;
  }
  bestMenu.textContent = game.best ? `Best vigil: ${game.best}` : "";
}

function saveBest() {
  if (game.score <= game.best) return;
  game.best = game.score;
  try {
    localStorage.setItem("spellstorm-best", String(game.best));
  } catch {
    /* private mode */
  }
}

function resize() {
  const viewport = window.visualViewport;
  const viewportW = viewport ? viewport.width : window.innerWidth;
  const viewportH = viewport ? viewport.height : window.innerHeight;
  const scale = Math.min(viewportW / LOGICAL_WIDTH, viewportH / LOGICAL_HEIGHT);
  const playW = LOGICAL_WIDTH * scale;
  const playH = LOGICAL_HEIGHT * scale;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  game.viewportW = viewportW;
  game.viewportH = viewportH;
  game.w = LOGICAL_WIDTH;
  game.h = LOGICAL_HEIGHT;
  game.offsetX = (viewportW - playW) / 2;
  game.offsetY = (viewportH - playH) / 2;
  game.scale = scale;
  game.dpr = dpr;
  canvas.width = Math.floor(viewportW * dpr);
  canvas.height = Math.floor(viewportH * dpr);
  canvas.style.width = `${viewportW}px`;
  canvas.style.height = `${viewportH}px`;
  mobileControls.style.left = `${game.offsetX}px`;
  mobileControls.style.top = `${game.offsetY}px`;
  mobileControls.style.width = `${playW}px`;
  mobileControls.style.height = `${playH}px`;
  mobileControls.style.setProperty("--control-scale", scale);
  xpBar.style.left = `${game.offsetX + 18 * scale}px`;
  xpBar.style.width = `${Math.max(0, playW - 36 * scale)}px`;
  xpBar.style.right = "auto";
  xpBar.style.bottom = `${viewportH - (game.offsetY + playH - 14 * scale)}px`;

  if (game.player) {
    game.player.x = Math.max(PLAYER_BOUND_X, Math.min(game.w - PLAYER_BOUND_X, game.player.x));
    game.player.y = Math.max(PLAYER_BOUND_TOP, Math.min(game.h - PLAYER_BOUND_X, game.player.y));
  }
}

function drawSidePanels() {
  const { viewportW, viewportH, offsetX, offsetY } = game;
  ctx.fillStyle = "#07040f";
  ctx.fillRect(0, 0, viewportW, viewportH);
  if (offsetX < 1 && offsetY < 1) return;

  const panelGradient = ctx.createLinearGradient(0, 0, viewportW, viewportH);
  panelGradient.addColorStop(0, "rgba(36, 18, 66, 0.18)");
  panelGradient.addColorStop(0.5, "rgba(7, 4, 15, 0.8)");
  panelGradient.addColorStop(1, "rgba(58, 26, 56, 0.18)");
  ctx.fillStyle = panelGradient;
  ctx.fillRect(0, 0, viewportW, viewportH);

  const panelWidth = Math.max(offsetX, offsetY);
  const count = Math.ceil(Math.max(viewportW, viewportH) / 90);
  ctx.strokeStyle = "rgba(143, 214, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < count; i++) {
    const progress = (i + 1) / (count + 1);
    if (offsetX > 0) {
      ctx.beginPath();
      ctx.moveTo(progress * panelWidth, 0);
      ctx.lineTo(progress * panelWidth - panelWidth * 0.35, viewportH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(viewportW - progress * panelWidth, 0);
      ctx.lineTo(viewportW - progress * panelWidth + panelWidth * 0.35, viewportH);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, progress * panelWidth);
      ctx.lineTo(viewportW, progress * panelWidth - panelWidth * 0.35);
      ctx.stroke();
    }
  }
}

function seedField() {
  game.stars = Array.from({ length: 90 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.25 + Math.random() * 1.2,
    r: Math.random() * 1.6 + 0.4,
  }));
  game.spires = Array.from({ length: 14 }, () => ({
    x: Math.random(),
    y: Math.random(),
    w: 28 + Math.random() * 50,
    h: 90 + Math.random() * 180,
    speed: 12 + Math.random() * 22,
    shade: 8 + Math.floor(Math.random() * 18),
  }));
  game.motes = Array.from({ length: 24 }, () => ({
    x: Math.random(),
    y: Math.random(),
    s: 16 + Math.random() * 30,
    phase: Math.random() * Math.PI * 2,
  }));
}

function ensureAudio() {
  if (!audio.ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio.ctx = new Ctx();
  }
  if (audio.ctx.state === "suspended") audio.ctx.resume();
  return audio.ctx;
}

function tone(freq, dur, type, vol, slide) {
  const actx = ensureAudio();
  if (!actx) return;
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, actx.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), actx.currentTime + dur);
  gain.gain.setValueAtTime(vol, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.start();
  osc.stop(actx.currentTime + dur);
}

function startDrone() {
  const actx = ensureAudio();
  if (!actx || audio.drone.length) return;
  [110, 164.81, 220].forEach((freq, i) => {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = i === 0 ? 0.015 : 0.008;
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    audio.drone.push(osc);
  });
}

function burst(x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (0.35 + Math.random());
    game.particles.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 0.35 + Math.random() * 0.45,
      max: 0.8,
      color,
      size: 1.5 + Math.random() * 2.4,
    });
  }
}

function floatText(x, y, text, color) {
  game.floaters.push({ x, y, text, color, life: 0.8 });
}

function makePlayer() {
  return {
    x: game.w / 2,
    y: game.h * 0.78,
    grimoire: "basic",
    grimoireDamage: 0,
    grimoireCooldownMultiplier: 1,
    grimoireSpeedMultiplier: 1,
    grimoireUpgradeCount: 0,
    grimoireEvolved: false,
    cool: 0,
    ward: 0,
    lives: 3,
    maxLives: 5,
    moveSpeed: 340,
    spellDamage: 0,
    cooldownMultiplier: 1,
    projectileSpeedMultiplier: 1,
    wardDuration: 3.1,
    wardRadius: 168,
    invuln: 0,
    surge: 0,
    aegis: false,
    hurtFlash: 0,
    touchTarget: null,
  };
}

function resetRun() {
  game.player = makePlayer();
  game.bullets = [];
  game.foes = [];
  game.shots = [];
  game.gifts = [];
  game.particles = [];
  game.floaters = [];
  game.wave = 1;
  game.completedLevels = 0;
  game.xpStart = 0;
  game.xpTarget = xpTargetForWave(1);
  game.upgradeCounts = {};
  game.score = 0;
  game.combo = 0;
  game.comboTimer = 0;
  game.shake = 0;
  game.dying = 0;
  game.hint = 7;
  game.queue = buildQueue(1);
  game.spawnCd = 0.4;
  game.between = 1.35;
  game.banner = { text: "Circle 1", sub: LINES[0], life: 2.2 };
  game.state = "play";
}

function buildQueue(wave) {
  if (wave % 10 === 0) return ["archon"];
  const count = 6 + wave * 2;
  const queue = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    if (wave >= 4 && roll > 0.86) queue.push("cultist");
    else if (wave >= 3 && roll > 0.66) queue.push("wraith");
    else if (wave >= 2 && roll > 0.42) queue.push("imp");
    else queue.push("bat");
  }
  return queue;
}

function xpTargetForWave(wave) {
  return Math.round((2400 + wave * 300) * enemyScoreMultiplier(wave));
}

function enemyScoreMultiplier(wave = game.wave) {
  const circleScale = 1 + Math.max(0, wave - 1) * 0.015;
  const tier = Math.min(ENEMY_MAX_STAT_TIER, Math.max(0, Math.floor((wave - 5) / 5)));
  const tierScale = 1 + tier * 0.08;
  return Math.min(ENEMY_MAX_SCORE_MULTIPLIER, circleScale * tierScale);
}

function enemyScore(foe) {
  return Math.round(ENEMIES[foe.kind].score * enemyScoreMultiplier());
}

function resetXpCycle() {
  game.xpStart = game.score;
  game.xpTarget = xpTargetForWave(game.wave);
}

function updateXpBar() {
  const progress = Math.max(0, game.score - game.xpStart);
  const ratio = Math.min(1, progress / game.xpTarget);
  xpFill.style.width = `${ratio * 100}%`;
  xpBar.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
}

function checkXpUpgrade() {
  if (game.state !== "play") return;
  if (game.score - game.xpStart < game.xpTarget) return;
  resetXpCycle();
  showUpgradePhase();
}

function hasActiveProjectileEnemies() {
  return game.foes.some((foe) => foe.kind === "wraith" || foe.kind === "cultist");
}

function activeFodderCount() {
  return game.foes.filter((foe) => foe.kind === "bat" || foe.kind === "imp").length;
}

function reinforcementCap() {
  return Math.min(6, 3 + Math.floor(Math.max(0, game.wave - 3) / 5));
}

function queueFodderReinforcement(dt) {
  if (
    game.wave <= 2 ||
    game.wave % 10 === 0 ||
    game.between > 0 ||
    game.queue.length ||
    !hasActiveProjectileEnemies() ||
    activeFodderCount() >= reinforcementCap()
  ) {
    return;
  }

  game.spawnCd -= dt;
  if (game.spawnCd > 0) return;

  spawn(Math.random() < 0.58 ? "bat" : "imp");
  game.spawnCd = Math.max(0.72, 1.15 - game.wave * 0.012);
}

function getAvailableUpgrades() {
  const player = game.player;
  const options = [
    ...(GRIMOIRE_UPGRADES[player.grimoire] || []).filter(
      (upgrade) => (game.upgradeCounts[upgrade.id] || 0) < upgrade.maxStacks
    ),
    ...UPGRADE_OPTIONS,
  ];
  if (!player.grimoireEvolved && GRIMOIRES[player.grimoire].evolution && player.grimoireUpgradeCount >= 2) {
    options.push(GRIMOIRE_EVOLUTIONS[GRIMOIRES[player.grimoire].evolution]);
  }
  return options;
}

function showUpgradePhase(grimoireChoice = false) {
  const available = grimoireChoice ? GRIMOIRE_OPTIONS : getAvailableUpgrades();
  const choices = [...available].sort(() => Math.random() - 0.5).slice(0, 3);
  upgradeChoices.replaceChildren(
    ...choices.map((upgrade, index) => {
      const button = document.createElement("button");
      button.className = "upgrade-choice";
      button.type = "button";
      button.dataset.upgradeId = upgrade.id;
      button.innerHTML = `<strong>${index + 1}. ${upgrade.name}</strong><small>${upgrade.description}</small>`;
      return button;
    })
  );
  upgrades.hidden = false;
  hud.hidden = true;
  mobileControls.hidden = true;
  xpBar.hidden = true;
  game.state = "upgrade";
}

function chooseUpgrade(id) {
  if (game.state !== "upgrade") return;
  if (game.player.grimoire === "basic") {
    const grimoireChoice = GRIMOIRE_OPTIONS.find((option) => option.id === id);
    if (grimoireChoice) {
      game.player.grimoire = grimoireChoice.id;
      game.player.grimoireUpgradeCount = 0;
    } else {
      const upgrade = UPGRADE_OPTIONS.find((option) => option.id === id);
      if (!upgrade) return;
      upgrade.apply(game.player);
    }
  } else {
    const upgrade = [...getAvailableUpgrades(), ...Object.values(GRIMOIRE_EVOLUTIONS)].find(
      (option) => option.id === id
    );
    if (!upgrade) return;
    if (upgrade.grimoire) {
      game.player.grimoire = upgrade.grimoire;
      game.player.grimoireEvolved = true;
    } else {
      upgrade.apply(game.player);
      if (GRIMOIRE_UPGRADES[game.player.grimoire]?.some((option) => option.id === id)) {
        game.player.grimoireUpgradeCount += 1;
      }
    }
  }
  game.upgradeCounts[id] = (game.upgradeCounts[id] || 0) + 1;
  upgrades.hidden = true;
  hud.hidden = false;
  mobileControls.hidden = false;
  xpBar.hidden = false;
  resetXpCycle();
  game.state = "play";
  syncHud();
}

function spawn(kind) {
  const spec = ENEMIES[kind];
  const archon = kind === "archon" ? ARCHONS[(Math.floor(game.wave / 10) - 1) % ARCHONS.length] : null;
  const healthMultiplier = enemyHealthMultiplier();
  const baseHealth = kind === "archon" ? 90 + game.wave * 12 : spec.hp;
  const margin = kind === "archon" ? 80 : 36;
  const foe = {
    kind,
    archon,
    x: kind === "archon" ? game.w / 2 : margin + Math.random() * (game.w - margin * 2),
    y: kind === "archon" ? -60 : -28,
    hp: Math.round(baseHealth * healthMultiplier),
    maxHp: Math.round(baseHealth * healthMultiplier),
    r: spec.radius * ENEMY_SCALE,
    age: 0,
    seed: Math.random() * 10,
    originX: 0,
    slow: 0,
    flash: 0,
    touch: 0,
    shot: 0.6 + Math.random() * 0.6,
    dive: 0,
    wanderX: null,
    wanderY: null,
    wanderTimer: 0,
  };
  foe.originX = foe.x;
  game.foes.push(foe);
}

function syncBossHud() {
  const boss = game.foes.find((foe) => foe.kind === "archon" && foe.hp > 0);
  if (!boss || game.state !== "play") {
    bossHud.hidden = true;
    return;
  }
  bossHud.hidden = false;
  bossName.textContent = boss.archon.name;
  bossName.style.color = boss.archon.color;
  bossHealthFill.style.width = `${Math.max(0, boss.hp / boss.maxHp) * 100}%`;
  bossHealthFill.style.background = `linear-gradient(90deg, ${boss.archon.accent}, ${boss.archon.color})`;
}

function maybeDrop(x, y, generous) {
  const roll = Math.random();
  const heartCut = generous ? 0.34 : 0.08;
  const surgeCut = heartCut + (generous ? 0.4 : 0.12);
  const aegisCut = surgeCut + (generous ? 0.26 : 0.1);
  let kind = null;
  if (roll < heartCut && game.player.lives < game.player.maxLives) kind = "heart";
  else if (roll < surgeCut) kind = "surge";
  else if (roll < aegisCut) kind = "aegis";
  if (!kind) return;
  game.gifts.push({ kind, x, y, vy: 40, life: 11 });
}

function addScore(base, x, y) {
  game.combo += 1;
  game.comboTimer = 2.4;
  const mult = 1 + Math.min(game.combo, 8) * 0.25;
  const gained = Math.round(base * mult);
  game.score += gained;
  floatText(x, y - 16, `+${gained}`, "#f0c56a");
  updateXpBar();
  checkXpUpgrade();
}

function hurtPlayer() {
  const player = game.player;
  if (player.invuln > 0 || game.state !== "play") return;
  game.combo = 0;
  game.shake = 12;
  player.hurtFlash = 0.2;
  if (player.aegis) {
    player.aegis = false;
    player.invuln = 0.7;
    burst(player.x, player.y, "#b7f3ff", 20, 160);
    tone(520, 0.18, "triangle", 0.05, 220);
    floatText(player.x, player.y - 28, "Aegis breaks", "#b7f3ff");
    return;
  }
  player.lives -= 1;
  player.invuln = 1.35;
  burst(player.x, player.y, "#ff6a8a", 26, 180);
  tone(140, 0.28, "sawtooth", 0.05, 60);
  if (player.lives <= 0) {
    game.state = "dying";
    game.dying = 1.15;
    burst(player.x, player.y, "#f0c56a", 40, 240);
    burst(player.x, player.y, "#ff6a2a", 30, 200);
  }
}

function castWard() {
  const player = game.player;
  if (player.ward > 0 || game.state !== "play") return;
  player.ward = player.wardDuration;
  game.shake = 6;
  tone(180, 0.35, "sawtooth", 0.04, 80);
  tone(440, 0.22, "triangle", 0.04, 880);
  const radius = player.wardRadius;
  game.shots = game.shots.filter((shot) => Math.hypot(shot.x - player.x, shot.y - player.y) > radius);
  for (const foe of game.foes) {
    if (Math.hypot(foe.x - player.x, foe.y - player.y) <= radius + foe.r) {
      damageFoe(foe, 6);
    }
  }
  game.particles.push({
    x: player.x,
    y: player.y,
    vx: 0,
    vy: 0,
    life: 0.38,
    max: 0.38,
    color: "#f0c56a",
    size: 16,
    ring: true,
    radius,
  });
}

function damageFoe(foe, amount) {
  if (foe.hp <= 0) return;
  foe.hp -= amount;
  foe.flash = 0.08;
  if (foe.hp > 0) return;
  burst(foe.x, foe.y, foe.kind === "archon" ? "#f0c56a" : "#e7d4ff", foe.kind === "archon" ? 48 : 14, 160);
  tone(foe.kind === "archon" ? 90 : 320, foe.kind === "archon" ? 0.4 : 0.08, "square", 0.03, 180);
  addScore(enemyScore(foe), foe.x, foe.y);
  if (foe.kind === "archon") game.shake = 16;
  maybeDrop(foe.x, foe.y, foe.kind === "archon" || foe.kind === "cultist");
}

function fireSpell(dt) {
  const player = game.player;
  const grimoire = GRIMOIRES[player.grimoire];
  player.cool -= dt;
  if (player.cool > 0) return;
  const attack = grimoire.attack;
  const rate = player.surge > 0 ? 0.62 : 1;
  player.cool = grimoire.cooldown * rate * player.cooldownMultiplier * player.grimoireCooldownMultiplier;
  const originY = player.y - 36 * PLAYER_SCALE;
  const make = (angle, speed, damage, extra) => {
    const bolt = {
      x: player.x + 18 * PLAYER_SCALE,
      y: originY,
      vx: Math.sin(angle) * speed * player.projectileSpeedMultiplier * player.grimoireSpeedMultiplier,
      vy: -Math.cos(angle) * speed * player.projectileSpeedMultiplier * player.grimoireSpeedMultiplier,
      damage: damage + player.spellDamage + player.grimoireDamage,
      color: grimoire.color,
      spell: attack,
      life: 1.3,
      r: attack === "tempest" ? 4 : 6,
      hit: new Set(),
      pierce: attack === "tempest",
    };
    Object.assign(bolt, extra);
    game.bullets.push(bolt);
  };
  if (attack === "basic") {
    make(0, grimoire.projectileSpeed, grimoire.damage);
  } else if (attack === "ember") {
    make(-0.08, grimoire.projectileSpeed, grimoire.damage);
    make(0.08, grimoire.projectileSpeed, grimoire.damage);
  } else if (attack === "rime") {
    make(-0.28, grimoire.projectileSpeed - 20, grimoire.damage);
    make(0, grimoire.projectileSpeed, grimoire.damage);
    make(0.28, grimoire.projectileSpeed - 20, grimoire.damage);
  } else {
    make((Math.random() - 0.5) * 0.12, grimoire.projectileSpeed, grimoire.damage);
  }
  if (game.time % 0.16 < dt) tone(attack === "rime" ? 680 : 520, 0.04, "square", 0.012);
}

function slowOf(foe) {
  return foe.slow > 0 ? 0.42 : 1;
}

function enemyPace() {
  return Math.min(ENEMY_MAX_PACE, (1.08 + Math.max(0, game.wave - 1) * 0.035) * enemyMoveMultiplier());
}

function enemyProjectileSpeed() {
  return Math.min(
    ENEMY_MAX_PROJECTILE_SPEED,
    (ENEMY_PROJECTILE_SPEED + Math.max(0, game.wave - 1) * 0.02) * enemyProjectileMultiplier()
  );
}

function enemyStatTier() {
  return Math.min(ENEMY_MAX_STAT_TIER, Math.max(0, Math.floor((game.wave - 5) / 5)));
}

function enemyHealthMultiplier() {
  return 1 + enemyStatTier() * 0.12;
}

function enemyMoveMultiplier() {
  return 1 + enemyStatTier() * 0.045;
}

function enemyProjectileMultiplier() {
  return 1 + enemyStatTier() * 0.06;
}

function roamShooter(foe, dt, bounds, speed) {
  foe.wanderTimer -= dt;
  if (
    foe.wanderTimer <= 0 ||
    foe.wanderX === null ||
    Math.hypot(foe.wanderX - foe.x, foe.wanderY - foe.y) < 12
  ) {
    foe.wanderX = bounds.left + Math.random() * (bounds.right - bounds.left);
    foe.wanderY = bounds.top + Math.random() * (bounds.bottom - bounds.top);
    foe.wanderTimer = 1.4 + Math.random() * 1.8;
  }
  const dx = foe.wanderX - foe.x;
  const dy = foe.wanderY - foe.y;
  const distance = Math.hypot(dx, dy) || 1;
  foe.x += (dx / distance) * speed * dt;
  foe.y += (dy / distance) * speed * dt;
  foe.x = Math.max(bounds.left, Math.min(bounds.right, foe.x));
  foe.y = Math.max(bounds.top, Math.min(bounds.bottom, foe.y));
}

function updateFoe(foe, dt) {
  const player = game.player;
  const spec = ENEMIES[foe.kind];
  const slow = slowOf(foe);
  const pace = enemyPace();
  const projectileSpeed = enemyProjectileSpeed();
  foe.age += dt;
  foe.slow = Math.max(0, foe.slow - dt);
  foe.flash = Math.max(0, foe.flash - dt);
  foe.touch = Math.max(0, foe.touch - dt);
  foe.shot -= dt;

  if (foe.kind === "bat") {
    foe.y += spec.speed * pace * slow * dt;
    foe.x = foe.originX + Math.sin(foe.age * 3.2 * pace + foe.seed) * 78;
  } else if (foe.kind === "imp") {
    if (foe.age < 0.9) {
      foe.y += 50 * pace * slow * dt;
      foe.x += Math.sign(player.x - foe.x) * 110 * pace * slow * dt;
    } else {
      if (!foe.dive) foe.dive = Math.max(-220, Math.min(220, (player.x - foe.x) * 1.4));
      foe.y += 280 * pace * slow * dt;
      foe.x += foe.dive * pace * slow * dt;
    }
  } else if (foe.kind === "wraith") {
    const bounds = {
      left: foe.r + 24,
      right: game.w - foe.r - 24,
      top: game.h * 0.16,
      bottom: game.h * 0.43,
    };
    roamShooter(foe, dt, bounds, spec.speed * pace * 1.8 * slow);
    if (foe.shot <= 0) {
      foe.shot = 1.55;
      shootAt(foe, player.x, player.y, 230 * projectileSpeed, 0);
    }
  } else if (foe.kind === "cultist") {
    const bounds = {
      left: foe.r + 24,
      right: game.w - foe.r - 24,
      top: game.h * 0.18,
      bottom: game.h * 0.48,
    };
    roamShooter(foe, dt, bounds, spec.speed * pace * 1.8 * slow);
    if (foe.shot <= 0) {
      foe.shot = 1.35;
      shootAt(foe, player.x, player.y, 250 * projectileSpeed, -0.22);
      shootAt(foe, player.x, player.y, 250 * projectileSpeed, 0);
      shootAt(foe, player.x, player.y, 250 * projectileSpeed, 0.22);
    }
  } else {
    const bounds = {
      left: foe.r + 24,
      right: game.w - foe.r - 24,
      top: game.h * 0.18,
      bottom: game.h * 0.7,
    };
    roamShooter(foe, dt, bounds, 70 * pace * 1.6);
    const pattern = Math.floor(foe.age / 3.2) % 3;
    if (foe.shot <= 0) {
      if (pattern === 0) {
        foe.shot = 0.32;
        shootAt(foe, player.x, player.y, 260 * projectileSpeed, 0);
      } else if (pattern === 1) {
        foe.shot = 0.9;
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12 + foe.age;
          game.shots.push({
            x: foe.x,
            y: foe.y,
            vx: Math.cos(angle) * 150 * projectileSpeed,
            vy: Math.sin(angle) * 150 * projectileSpeed,
            r: 6 * ENEMY_PROJECTILE_SCALE,
          });
        }
      } else {
        foe.shot = 0.09;
        const angle = foe.age * 5;
        game.shots.push({
          x: foe.x,
          y: foe.y,
          vx: Math.cos(angle) * 190 * projectileSpeed,
          vy: Math.sin(angle) * 190 * projectileSpeed,
          r: 5 * ENEMY_PROJECTILE_SCALE,
        });
      }
    }
  }

  if (foe.hp > 0 && foe.touch <= 0 && Math.hypot(foe.x - player.x, foe.y - player.y) < foe.r + PLAYER_HIT_RADIUS) {
    foe.touch = 0.8;
    hurtPlayer();
    if (foe.kind === "bat" || foe.kind === "imp") damageFoe(foe, foe.hp);
  }
}

function shootAt(foe, tx, ty, speed, spread) {
  const angle = Math.atan2(ty - foe.y, tx - foe.x) + spread;
  game.shots.push({
    x: foe.x,
    y: foe.y + 8,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 6 * ENEMY_PROJECTILE_SCALE,
  });
}

function updatePlay(dt) {
  const player = game.player;
  game.banner.life -= dt;
  game.hint = Math.max(0, game.hint - dt);
  game.comboTimer -= dt;
  if (game.comboTimer <= 0) game.combo = 0;
  if (game.between > 0) game.between -= dt;

  let dx = 0;
  let dy = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) dx -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) dx += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) dy -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) dy += 1;
  if (touchMove) {
    dx += touchMove.x;
    dy += touchMove.y;
  }
  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    player.x += (dx / len) * player.moveSpeed * dt;
    player.y += (dy / len) * player.moveSpeed * dt;
  }
  player.x = Math.max(PLAYER_BOUND_X, Math.min(game.w - PLAYER_BOUND_X, player.x));
  player.y = Math.max(PLAYER_BOUND_TOP, Math.min(game.h - PLAYER_BOUND_X, player.y));
  player.invuln = Math.max(0, player.invuln - dt);
  player.ward = Math.max(0, player.ward - dt);
  player.surge = Math.max(0, player.surge - dt);
  player.hurtFlash = Math.max(0, player.hurtFlash - dt);

  if (pressed.has("Space") || rightClick) castWard();

  fireSpell(dt);

  if (game.between <= 0 && game.queue.length) {
    game.spawnCd -= dt;
    if (game.spawnCd <= 0) {
      const kind = game.queue.shift();
      spawn(kind);
      game.spawnCd = kind === "archon" ? 1 : Math.max(0.28, 0.82 - game.wave * 0.03);
    }
  }
  queueFodderReinforcement(dt);

  for (const bolt of game.bullets) {
    bolt.x += bolt.vx * dt;
    bolt.y += bolt.vy * dt;
    bolt.life -= dt;
  }
  game.bullets = game.bullets.filter(
    (bolt) => bolt.life > 0 && bolt.y > -40 && bolt.x > -40 && bolt.x < game.w + 40
  );

  for (const foe of game.foes) {
    updateFoe(foe, dt);
    const margin = foe.r + 4;
    foe.x = Math.max(margin, Math.min(game.w - margin, foe.x));
  }

  for (const bolt of game.bullets) {
    for (const foe of game.foes) {
      if (foe.hp <= 0 || bolt.hit.has(foe)) continue;
      if (Math.hypot(bolt.x - foe.x, bolt.y - foe.y) < foe.r + bolt.r) {
        bolt.hit.add(foe);
        if (bolt.spell === "rime") foe.slow = 1.6;
        damageFoe(foe, bolt.damage);
        burst(bolt.x, bolt.y, bolt.color, 5, 80);
        if (!bolt.pierce) bolt.life = 0;
      }
    }
  }
  game.bullets = game.bullets.filter((bolt) => bolt.life > 0);
  game.foes = game.foes.filter((foe) => foe.hp > 0 && foe.y < game.h + 80);

  for (const shot of game.shots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    if (Math.hypot(shot.x - player.x, shot.y - player.y) < shot.r + PLAYER_HIT_RADIUS) {
      shot.dead = true;
      hurtPlayer();
    }
  }
  game.shots = game.shots.filter(
    (shot) => !shot.dead && shot.x > -30 && shot.x < game.w + 30 && shot.y > -30 && shot.y < game.h + 30
  );

  for (const gift of game.gifts) {
    const dist = Math.hypot(gift.x - player.x, gift.y - player.y);
    if (dist < 90 && dist > 1) {
      gift.x += ((player.x - gift.x) / dist) * 220 * dt;
      gift.y += ((player.y - gift.y) / dist) * 220 * dt;
    } else if (dist >= 90) {
      gift.y += gift.vy * dt;
    }
    gift.life -= dt;
    if (dist < 22) {
      gift.life = 0;
      takeGift(gift);
    }
  }
  game.gifts = game.gifts.filter((gift) => gift.life > 0 && gift.y < game.h + 40);

  if (game.queue.length === 0 && game.foes.length === 0 && game.between <= 0) {
    if (game.wave >= 50) {
      finish(true);
      return;
    }
    game.wave += 1;
    game.completedLevels += 1;
    game.queue = buildQueue(game.wave);
    game.between = 1.6;
    game.spawnCd = 0.3;
    const boss = game.wave % 10 === 0;
    game.banner = {
      text: boss ? "An Archon descends" : `Circle ${game.wave}`,
      sub: boss ? "Break the crown" : LINES[(game.wave - 1) % LINES.length],
      life: 2.3,
    };
    if (game.completedLevels % 5 === 0) showUpgradePhase(game.completedLevels === 5);
  }
}

function updateTouchMove(event) {
  const rect = touchPad.getBoundingClientRect();
  const radius = rect.width * 0.5;
  const x = event.clientX - (rect.left + radius);
  const y = event.clientY - (rect.top + radius);
  const distance = Math.min(radius, Math.hypot(x, y));
  const length = Math.hypot(x, y) || 1;
  const strength = distance / radius;
  touchMove = { x: (x / length) * strength, y: (y / length) * strength };
  touchKnob.style.transform = `translate(calc(-50% + ${(x / length) * distance}px), calc(-50% + ${(y / length) * distance}px))`;
}

function clearTouchMove() {
  touchMove = null;
  touchKnob.style.transform = "translate(-50%, -50%)";
}

function takeGift(gift) {
  const player = game.player;
  tone(660, 0.12, "triangle", 0.04, 990);
  if (gift.kind === "heart") {
    player.lives = Math.min(player.maxLives, player.lives + 1);
    floatText(player.x, player.y - 30, "Vitality", "#ff8aa0");
  } else if (gift.kind === "surge") {
    player.surge = 6.5;
    floatText(player.x, player.y - 30, "Surge", "#ffb15a");
  } else {
    player.aegis = true;
    floatText(player.x, player.y - 30, "Aegis", "#b7f3ff");
  }
}

function updateParticles(dt) {
  for (const bit of game.particles) {
    bit.life -= dt;
    bit.x += bit.vx * dt;
    bit.y += bit.vy * dt;
  }
  game.particles = game.particles.filter((bit) => bit.life > 0);
  for (const text of game.floaters) {
    text.life -= dt;
    text.y -= 28 * dt;
  }
  game.floaters = game.floaters.filter((text) => text.life > 0);
}

function update(dt) {
  game.time += dt;
  game.scroll += dt;
  game.shake = Math.max(0, game.shake - dt * 22);
  if (game.state === "menu" || game.state === "pause" || game.state === "upgrade" || game.state === "over") return;
  if (game.state === "dying") {
    game.dying -= dt;
    updateParticles(dt);
    if (game.dying <= 0) finish();
    return;
  }
  updatePlay(dt);
  updateParticles(dt);
}

function finish(won = false) {
  game.state = "over";
  game.won = won;
  saveBest();
  overTitle.textContent = won ? "The storm is broken" : "The spire falls";
  finalScore.textContent = won ? `Level 50 · ${game.score}` : String(game.score);
  bestOver.textContent = `Best vigil: ${game.best}`;
  over.hidden = false;
  hud.hidden = true;
  mobileControls.hidden = true;
  xpBar.hidden = true;
  bossHud.hidden = true;
}

function syncHud() {
  if (game.state === "menu" || game.state === "over") return;
  const grimoire = GRIMOIRES[game.player.grimoire];
  syncBossHud();
  scoreEl.textContent = String(game.score);
  circleEl.textContent = game.wave % 10 === 0 ? `Circle ${game.wave} · Archon` : `Circle ${game.wave}`;
  comboEl.textContent = game.combo >= 2 ? `Chain ×${(1 + Math.min(game.combo, 8) * 0.25).toFixed(2)}` : "";
  livesEl.textContent = "♥ ".repeat(Math.max(0, game.player.lives)).trim();
  spellNameEl.textContent = game.player.surge > 0 ? `${grimoire.name} surge` : grimoire.name;
  spellNameEl.style.color = grimoire.color;
  spellHintEl.textContent = grimoire.hint;
  const ready = game.player.ward <= 0;
  wardFill.style.width = ready ? "100%" : `${(1 - game.player.ward / game.player.wardDuration) * 100}%`;
  wardButton.classList.toggle("cooling", !ready);
  wardButton.textContent = ready ? "WARD" : `${game.player.ward.toFixed(1)}s`;
  updateXpBar();
}

function showPause(on) {
  paused.hidden = !on;
  hud.hidden = on || game.state === "menu" || game.state === "over";
}

function startGame() {
  ensureAudio();
  startDrone();
  resetRun();
  menu.hidden = true;
  over.hidden = true;
  paused.hidden = true;
  upgrades.hidden = true;
  hud.hidden = false;
  mobileControls.hidden = false;
  xpBar.hidden = false;
}

function togglePause() {
  if (game.state === "play") {
    game.state = "pause";
    showPause(true);
    mobileControls.hidden = true;
  } else if (game.state === "pause") {
    game.state = "play";
    showPause(false);
    mobileControls.hidden = false;
  }
}

function drawBackground() {
  const { w, h } = game;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#140824");
  sky.addColorStop(0.55, "#241242");
  sky.addColorStop(1, "#3a1a38");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const moonX = w * 0.78;
  const moonY = h * 0.16;
  const glow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 140);
  glow.addColorStop(0, "rgba(255, 236, 196, 0.35)");
  glow.addColorStop(1, "rgba(255, 236, 196, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 140, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6e7c1";
  ctx.beginPath();
  ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241242";
  ctx.beginPath();
  ctx.arc(moonX + 12, moonY - 4, 22, 0, Math.PI * 2);
  ctx.fill();

  for (const star of game.stars) {
    const y = (star.y * h + game.scroll * 18 * star.z) % h;
    const twinkle = 0.35 + Math.sin(game.time * 2 + star.x * 20) * 0.25;
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = "#f4e7c8";
    ctx.fillRect(star.x * w, y, star.r, star.r);
  }
  ctx.globalAlpha = 1;

  for (const spire of game.spires) {
    const y = ((spire.y * (h + 240) + game.scroll * spire.speed) % (h + 240)) - 120;
    const x = spire.x * w;
    ctx.fillStyle = `rgb(${spire.shade}, ${spire.shade - 4}, ${spire.shade + 16})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + spire.w * 0.5, y - spire.h);
    ctx.lineTo(x + spire.w, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(240, 197, 106, 0.35)";
    for (let i = 0; i < 3; i++) {
      const wy = y - 24 - i * (spire.h / 5);
      if (wy < y - spire.h + 16) continue;
      ctx.fillRect(x + spire.w * 0.42, wy, 4, 10);
    }
  }

  for (const mote of game.motes) {
    const y = (mote.y * h + game.scroll * mote.s) % h;
    const x = mote.x * w + Math.sin(game.time + mote.phase) * 16;
    ctx.fillStyle = "rgba(180, 140, 255, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 8, mote.phase, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMage(x, y, color, hidden) {
  if (hidden) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(PLAYER_SCALE, PLAYER_SCALE);
  if (game.player.invuln > 0) ctx.globalAlpha = 0.45 + Math.sin(game.time * 28) * 0.25;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (game.player.aegis) {
    ctx.strokeStyle = "rgba(183, 243, 255, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30 + Math.sin(game.time * 4) * 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#2a1a4a";
  ctx.beginPath();
  ctx.moveTo(-14, -2);
  ctx.quadraticCurveTo(0, 10, 16, 6);
  ctx.lineTo(20, 22);
  ctx.lineTo(-18, 22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#f0d2b4";
  ctx.beginPath();
  ctx.arc(0, -10, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1b1230";
  ctx.beginPath();
  ctx.moveTo(-16, -12);
  ctx.lineTo(16, -12);
  ctx.lineTo(11, -16);
  ctx.lineTo(-11, -16);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -16);
  ctx.lineTo(0, -36);
  ctx.lineTo(8, -16);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(-4, -21, 8, 3);

  ctx.strokeStyle = "#d9c39a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(12, 18);
  ctx.lineTo(20, -16);
  ctx.stroke();
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(21, -20, 5.2 + Math.sin(game.time * 6) * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFoe(foe) {
  ctx.save();
  ctx.translate(foe.x, foe.y);
  ctx.scale(ENEMY_SCALE, ENEMY_SCALE);
  ctx.fillStyle = "rgba(255, 196, 140, 0.16)";
  ctx.beginPath();
  ctx.arc(0, 0, foe.r / ENEMY_SCALE + 10, 0, Math.PI * 2);
  ctx.fill();
  if (foe.flash > 0) ctx.filter = "brightness(2.4)";
  if (foe.kind === "bat") {
    const flap = Math.sin(game.time * 18 + foe.seed) * 8;
    ctx.fillStyle = "#8d74c4";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-16, flap, -22, 6);
    ctx.quadraticCurveTo(-8, 4, 0, 0);
    ctx.quadraticCurveTo(8, 4, 22, 6);
    ctx.quadraticCurveTo(16, flap, 0, 0);
    ctx.fill();
    ctx.fillStyle = "#6a3a86";
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (foe.kind === "imp") {
    ctx.fillStyle = "#c4472f";
    ctx.beginPath();
    ctx.arc(0, 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-12, -14);
    ctx.lineTo(-2, -6);
    ctx.moveTo(8, -4);
    ctx.lineTo(12, -14);
    ctx.lineTo(2, -6);
    ctx.fill();
    ctx.fillStyle = "#ffd7a1";
    ctx.fillRect(-3, 0, 2, 2);
    ctx.fillRect(2, 0, 2, 2);
  } else if (foe.kind === "wraith") {
    const tatter = Math.sin(game.time * 3 + foe.seed) * 4;
    ctx.fillStyle = "rgba(196, 214, 255, 0.82)";
    ctx.beginPath();
    ctx.moveTo(-14, 16 + tatter);
    ctx.lineTo(-12, -8);
    ctx.quadraticCurveTo(0, -22, 12, -8);
    ctx.lineTo(14, 16 - tatter);
    ctx.quadraticCurveTo(0, 8, -14, 16 + tatter);
    ctx.fill();
    ctx.fillStyle = "#1a1430";
    ctx.beginPath();
    ctx.ellipse(0, -6, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (foe.kind === "cultist") {
    ctx.fillStyle = "#3a1848";
    ctx.beginPath();
    ctx.moveTo(-12, 16);
    ctx.lineTo(-8, -12);
    ctx.lineTo(8, -12);
    ctx.lineTo(12, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f0c56a";
    ctx.beginPath();
    ctx.arc(0, -14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1a1020";
    ctx.beginPath();
    ctx.moveTo(-3, -14);
    ctx.lineTo(3, -14);
    ctx.moveTo(0, -17);
    ctx.lineTo(0, -11);
    ctx.stroke();
  } else {
    const archon = foe.archon;
    ctx.strokeStyle = archon.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 34 + i * 8, game.time * (0.6 + i * 0.2), game.time * (0.6 + i * 0.2) + 1.4);
      ctx.stroke();
    }
    ctx.fillStyle = archon.accent;
    ctx.beginPath();
    if (archon.model === "wings") {
      ctx.moveTo(-38, 22);
      ctx.lineTo(-18, -16);
      ctx.lineTo(0, -28);
      ctx.lineTo(18, -16);
      ctx.lineTo(38, 22);
    } else if (archon.model === "horns") {
      ctx.moveTo(-27, 20);
      ctx.lineTo(-25, -24);
      ctx.lineTo(-12, -14);
      ctx.lineTo(0, -30);
      ctx.lineTo(12, -14);
      ctx.lineTo(25, -24);
      ctx.lineTo(27, 20);
    } else {
      ctx.moveTo(-26, 20);
      ctx.lineTo(-16, -16);
      ctx.lineTo(0, -28);
      ctx.lineTo(16, -16);
      ctx.lineTo(26, 20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = archon.color;
    ctx.beginPath();
    if (archon.model === "halo") {
      ctx.arc(0, -22, 14 + Math.sin(game.time * 2) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = archon.color;
      ctx.stroke();
    } else {
      ctx.moveTo(-10, -26);
      ctx.lineTo(0, -44);
      ctx.lineTo(10, -26);
    }
    ctx.fill();
  }
  if (foe.kind !== "archon") {
    const ratio = foe.hp / foe.maxHp;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(-18, 24, 36, 3);
    ctx.fillStyle = "rgba(217, 106, 106, 0.8)";
    ctx.fillRect(-18, 24, 36 * Math.max(0, ratio), 3);
  }
  ctx.restore();
}

function draw() {
  const { w, h } = game;
  const mag = game.shake;
  const sx = mag ? (Math.random() - 0.5) * mag : 0;
  const sy = mag ? (Math.random() - 0.5) * mag : 0;
  ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
  ctx.clearRect(0, 0, game.viewportW, game.viewportH);
  drawSidePanels();
  ctx.save();
  ctx.translate(game.offsetX, game.offsetY);
  ctx.scale(game.scale, game.scale);
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  ctx.translate(sx, sy);
  drawBackground();

  for (const gift of game.gifts) {
    const color = gift.kind === "heart" ? "#ff8aa0" : gift.kind === "surge" ? "#ffb15a" : "#9aefff";
    ctx.save();
    ctx.translate(gift.x, gift.y);
    ctx.rotate(game.time * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 9);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const shot of game.shots) {
    ctx.fillStyle = "rgba(196, 120, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const bolt of game.bullets) {
    ctx.strokeStyle = bolt.color;
    ctx.lineWidth = bolt.spell === "tempest" ? 2 : 4;
    ctx.beginPath();
    ctx.moveTo(bolt.x, bolt.y);
    ctx.lineTo(bolt.x - bolt.vx * 0.03, bolt.y - bolt.vy * 0.03);
    ctx.stroke();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath();
    ctx.arc(bolt.x, bolt.y, bolt.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const foe of game.foes) drawFoe(foe);

  for (const bit of game.particles) {
    ctx.globalAlpha = Math.max(0, bit.life / bit.max);
    if (bit.ring) {
      const grown = bit.radius * (1 - bit.life / bit.max);
      ctx.strokeStyle = bit.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bit.x, bit.y, grown, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = bit.color;
      ctx.beginPath();
      ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  if (game.player && game.state !== "menu") {
    const hidden = game.state === "dying" || game.state === "over";
    drawMage(game.player.x, game.player.y, GRIMOIRES[game.player.grimoire].color, hidden && game.dying < 0.8);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4e7c8";
  ctx.font = "22px Palatino, Palatino Linotype, Georgia, serif";
  for (const text of game.floaters) {
    ctx.globalAlpha = Math.max(0, text.life / 0.8);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
  }
  ctx.globalAlpha = 1;

  if (game.banner.life > 0 && game.state !== "menu") {
    ctx.globalAlpha = Math.min(1, game.banner.life);
    ctx.fillStyle = "#f0c56a";
    ctx.font = "42px Palatino, Palatino Linotype, Georgia, serif";
    ctx.fillText(game.banner.text, w / 2, h * 0.34);
    ctx.fillStyle = "#f4e7c8";
    ctx.font = "16px Segoe UI, sans-serif";
    ctx.fillText(game.banner.sub, w / 2, h * 0.34 + 28);
    ctx.globalAlpha = 1;
  }

  if (game.hint > 0 && game.state === "play") {
    ctx.globalAlpha = Math.min(1, game.hint);
    ctx.fillStyle = "rgba(244, 231, 200, 0.8)";
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.globalAlpha = 1;
  }

  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  if (game.state === "play" || game.state === "pause" || game.state === "dying") syncHud();
  pressed.clear();
  rightClick = false;
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  const block = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (game.state === "play" && block.includes(event.code)) event.preventDefault();
  if (game.state === "upgrade" && ["Digit1", "Digit2", "Digit3"].includes(event.code)) {
    const choice = upgradeChoices.children[Number(event.code.slice(-1)) - 1];
    if (choice) chooseUpgrade(choice.dataset.upgradeId);
    return;
  }
  if (!keys.has(event.code)) pressed.add(event.code);
  keys.add(event.code);
  if (event.code === "Enter" && (game.state === "menu" || game.state === "over")) startGame();
  if (event.code === "Escape") togglePause();
  if (event.code === "Enter" && game.state === "pause") togglePause();
});

window.addEventListener("keyup", (event) => keys.delete(event.code));

window.addEventListener("mousedown", (event) => {
  if (event.button === 2) rightClick = true;
});

window.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("blur", () => keys.clear());
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
document.addEventListener("fullscreenchange", resize);
if (window.visualViewport) window.visualViewport.addEventListener("resize", resize);
touchPad.addEventListener("pointerdown", (event) => {
  if (game.state !== "play") return;
  touchPad.setPointerCapture(event.pointerId);
  updateTouchMove(event);
  event.preventDefault();
});
touchPad.addEventListener("pointermove", (event) => {
  if (touchPad.hasPointerCapture(event.pointerId)) updateTouchMove(event);
});
touchPad.addEventListener("pointerup", clearTouchMove);
touchPad.addEventListener("pointercancel", clearTouchMove);
touchPad.addEventListener("lostpointercapture", clearTouchMove);
wardButton.addEventListener("pointerdown", (event) => {
  if (game.state === "play") {
    castWard();
    event.preventDefault();
  }
});
upgradeChoices.addEventListener("click", (event) => {
  const button = event.target.closest("[data-upgrade-id]");
  if (button) chooseUpgrade(button.dataset.upgradeId);
});
document.getElementById("start").addEventListener("click", startGame);
document.getElementById("again").addEventListener("click", startGame);
document.getElementById("resume").addEventListener("click", togglePause);

loadBest();
seedField();
resize();
requestAnimationFrame(frame);
