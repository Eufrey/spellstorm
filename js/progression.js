function makePlayer() {
  return {
    x: game.w / 2, y: game.h * 0.78,
    grimoire: "basic", grimoireFamily: "basic",
    grimoireDamage: 0, grimoireCooldownMultiplier: 1, grimoireSpeedMultiplier: 1,
    grimoireUpgradeCount: 0, grimoireEvolved: false,
    grimoireAbilityCooldowns: {},
    cool: 0, ward: 0, lives: 3, maxLives: 5, moveSpeed: 340,
    spellDamage: 0, cooldownMultiplier: 1, projectileSpeedMultiplier: 1,
    wardCooldown: 3.8, wardRadius: 168,
    invuln: 0, surge: 0, aegis: false, hurtFlash: 0, touchTarget: null,
  };
}

function resetRun() {
  resetGameplayInput();
  game.player = makePlayer();
  game.bullets = []; game.foes = []; game.shots = []; game.gifts = [];
  game.particles = []; game.floaters = [];
  game.wave = 1; game.reinforcements = 0;
  game.reinforcementCd = BALANCE.reinforcementInterval;
  game.completedLevels = 0;
  game.xp = 0; game.xpTarget = BALANCE.firstXpTarget; game.xpExhausted = false;
  game.pendingRewards = []; game.currentOffer = null;
  game.upgradeCounts = {}; game.score = 0; game.combo = 0; game.comboTimer = 0;
  game.shake = 0; game.dying = 0; game.won = false;
  game.hint = 7; game.queue = buildQueue(1); game.spawnCd = 0.4; game.between = 1.35;
  game.banner = { text: "Circle 1", sub: LINES[0], life: 2.2 };
  upgrades.hidden = true;
  game.state = "play";
}

function regularCount(wave) {
  return Math.min(36, 8 + Math.floor(0.8 * (wave - 1)));
}

function spawnInterval(wave) {
  return Math.max(0.40, 0.82 - 0.012 * wave);
}

function buildQueue(wave) {
  if (wave % 10 === 0) return ["archon"];
  return Array.from({ length: regularCount(wave) }, () => {
    const roll = Math.random();
    if (wave >= 4 && roll > 0.86) return "cultist";
    if (wave >= 3 && roll > 0.66) return "wraith";
    if (wave >= 2 && roll > 0.42) return "imp";
    return "bat";
  });
}

function xpTargetForWave(wave) {
  const count = regularCount(wave % 10 === 0 ? wave - 1 : wave);
  return Math.round(Math.max(2700, BALANCE.xpPerQueuedEnemy * count) * enemyScoreMultiplier(wave));
}

function enemyScoreMultiplier(wave = game.wave) {
  const circleScale = 1 + Math.max(0, wave - 1) * 0.015;
  const tier = Math.min(ENEMY_MAX_STAT_TIER, Math.max(0, Math.floor((wave - 5) / 5)));
  return Math.min(ENEMY_MAX_SCORE_MULTIPLIER, circleScale * (1 + tier * 0.08));
}

function enemyScore(foe) {
  return Math.round(ENEMIES[foe.kind].score * enemyScoreMultiplier());
}

function awardExperience(amount) {
  if (game.xpExhausted) return;
  game.xp += amount;
  while (game.xp >= game.xpTarget) {
    game.xp -= game.xpTarget;
    game.pendingRewards.push("xp");
    game.xpTarget = xpTargetForWave(game.wave);
  }
}

function updateXpBar() {
  const ratio = game.xpExhausted ? 1 : Math.min(1, Math.max(0, game.xp / game.xpTarget));
  xpFill.style.width = `${ratio * 100}%`;
  xpBar.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
  xpBar.setAttribute("aria-valuetext", game.xpExhausted ? "All boons acquired" : `${Math.floor(game.xp)} of ${game.xpTarget} experience`);
}

function isRangedEnemy(foe) {
  return foe.kind === "wraith" || foe.kind === "cultist";
}

function canSpawn(kind) {
  if (kind === "archon") return true;
  const alive = game.foes.filter(foe => foe.hp > 0 && foe.kind !== "archon");
  return alive.length < BALANCE.maxOrdinaryEnemies &&
    (!isRangedEnemy({ kind }) || alive.filter(isRangedEnemy).length < BALANCE.maxRangedEnemies);
}

function queueFodderReinforcement(dt) {
  if (game.wave <= 2 || game.wave % 10 === 0 || game.between > 0 || game.queue.length ||
      !game.foes.some(foe => foe.hp > 0 && isRangedEnemy(foe)) ||
      game.reinforcements >= BALANCE.reinforcementLimit || !canSpawn("bat") ||
      game.foes.filter(foe => foe.hp > 0 && (foe.kind === "bat" || foe.kind === "imp")).length >= BALANCE.reinforcementFodderCap) return;
  game.reinforcementCd -= dt;
  if (game.reinforcementCd > 0) return;
  game.reinforcements += 1;
  spawn(Math.random() < 0.58 ? "bat" : "imp");
  game.reinforcementCd = BALANCE.reinforcementInterval;
}

function grimoireFamily() {
  return game.player.grimoireFamily;
}

function getAvailableUpgrades() {
  const player = game.player;
  const options = [...(GRIMOIRE_UPGRADES[grimoireFamily()] || []), ...UPGRADE_OPTIONS]
    .filter(upgrade => (game.upgradeCounts[upgrade.id] || 0) < upgrade.maxStacks);
  const evolution = GRIMOIRES[grimoireFamily()].evolution;
  if (!player.grimoireEvolved && evolution && player.grimoireUpgradeCount >= 2) {
    options.push(GRIMOIRE_EVOLUTIONS[evolution]);
  }
  return options;
}

function shuffled(options) {
  const result = [...options];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function showUpgradePhase(grimoireChoice = false, kind = "milestone") {
  const available = grimoireChoice ? GRIMOIRE_OPTIONS : getAvailableUpgrades();
  if (!available.length) {
    game.xpExhausted = true;
    game.pendingRewards = []; game.currentOffer = null;
    upgrades.hidden = true;
    return;
  }
  const evolution = available.find(upgrade => upgrade.grimoire);
  const choices = grimoireChoice ? [...available] : evolution
    ? [evolution, ...shuffled(available.filter(upgrade => upgrade !== evolution)).slice(0, 2)]
    : shuffled(available).slice(0, 3);
  const token = ++game.offerSerial;
  game.currentOffer = { kind: grimoireChoice ? "grimoire" : kind, ids: choices.map(u => u.id), token };
  upgradeChoices.replaceChildren(...choices.map((upgrade, index) => {
    const button = document.createElement("button");
    button.className = "upgrade-choice"; button.type = "button";
    button.dataset.upgradeId = upgrade.id; button.dataset.offerToken = String(token);
    const stacks = upgrade.maxStacks ? ` (${game.upgradeCounts[upgrade.id] || 0}/${upgrade.maxStacks})` : "";
    button.innerHTML = `<strong>${index + 1}. ${upgrade.name}${stacks}</strong><small>${upgrade.description}</small>`;
    return button;
  }));
  resetGameplayInput();
  upgrades.hidden = false; hud.hidden = true; mobileControls.hidden = true; xpBar.hidden = true;
  bossHud.hidden = true;
  game.state = "upgrade";
}

function openNextReward() {
  if (game.state !== "play" || game.currentOffer || !game.pendingRewards.length) return;
  const kind = game.pendingRewards.shift();
  showUpgradePhase(kind === "grimoire", kind);
}

function chooseUpgrade(id, token = game.currentOffer?.token) {
  const offer = game.currentOffer;
  if (game.state !== "upgrade" || !offer || offer.token !== token || !offer.ids.includes(id)) return;
  const player = game.player;
  const available = offer.kind === "grimoire" ? GRIMOIRE_OPTIONS : getAvailableUpgrades();
  const upgrade = available.find(option => option.id === id);
  if (!upgrade) return;
  if (offer.kind === "grimoire") {
    player.grimoire = id; player.grimoireFamily = id;
    player.grimoireUpgradeCount = 0;
  } else if (upgrade.grimoire) {
    player.grimoire = upgrade.grimoire; player.grimoireEvolved = true;
  } else {
    upgrade.apply(player);
    if (GRIMOIRE_UPGRADES[grimoireFamily()]?.some(option => option.id === id)) player.grimoireUpgradeCount += 1;
  }
  game.upgradeCounts[id] = (game.upgradeCounts[id] || 0) + 1;
  player.cool = Math.max(0, Math.min(player.cool, spellInterval()));
  game.currentOffer = null;
  resetGameplayInput();
  upgrades.hidden = true; hud.hidden = false; mobileControls.hidden = false; xpBar.hidden = false;
  game.state = "play";
  openNextReward();
  syncHud();
}

function resolvePlayStep() {
  if (game.player.lives <= 0 || game.state === "dying") {
    game.pendingRewards = []; game.currentOffer = null; upgrades.hidden = true;
    resetGameplayInput();
    return;
  }
  if (!game.queue.length && !game.foes.length && game.between <= 0) {
    if (game.wave >= 50) { finish(true); return; }
    game.completedLevels = game.wave;
    if (game.completedLevels % 5 === 0) game.pendingRewards.unshift(game.completedLevels === 5 ? "grimoire" : "milestone");
    game.wave += 1; game.reinforcements = 0;
    game.reinforcementCd = BALANCE.reinforcementInterval;
    game.queue = buildQueue(game.wave); game.between = 1.6; game.spawnCd = 0.3;
    const boss = game.wave % 10 === 0;
    game.banner = { text: boss ? "An Archon descends" : `Circle ${game.wave}`,
      sub: boss ? "Break the crown" : LINES[(game.wave - 1) % LINES.length], life: 2.3 };
  }
  openNextReward();
}
