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
  if (typeof spellstormStartRun === 'function') spellstormStartRun();
  resetGameplayInput();
  game.player = makePlayer();
  game.bullets = []; game.foes = []; game.shots = []; game.gifts = [];
  game.particles = []; game.floaters = [];
  game.defeatedSprites = [];
  game.wave = 1; game.reinforcements = 0;
  game.reinforcementCd = BALANCE.reinforcementInterval;
  game.completedLevels = 0;
  game.xp = 0; game.xpTarget = BALANCE.firstXpTarget; game.xpExhausted = false;
  game.pendingRewards = []; game.currentOffer = null;
  game.rewardGather = game.rewardGatherDuration = 0;
  game.upgradeCounts = {}; game.score = 0; game.combo = 0; game.comboTimer = 0;
  game.shake = 0; game.dying = 0; game.won = false;
  game.hint = 7; game.queue = buildQueue(1); game.spawnCd = 0.4; game.between = 1.35;
  game.banner = { text: "Circle 1", sub: formationChapterName(1), life: 2.2 };
  upgrades.hidden = true;
  game.state = "play";
}

function formationChapterName(wave) {
  return ['The Gathering','The Burning Siege','The Frozen Veil','The Stormfront','The Final Ascent'][Math.min(4,Math.floor((wave-1)/10))];
}

function regularCount(wave) {
  return Math.min(50, 16 + Math.floor(Math.min(8,wave-1)*1.5 + Math.max(0,wave-9)*.58));
}

function spawnInterval(wave) {
  return Math.max(.38, 1.05 - .013 * (wave-1));
}

function enemyLimits(wave=game.wave) {
  const chapter=Math.min(4,Math.floor((wave-1)/10));
  return {ordinary:chapter===0?9+Math.floor((wave-1)/3):[0,13,15,18,20][chapter],ranged:chapter===0?2+Math.floor((wave-1)/4):[0,5,5,6,7][chapter],shots:chapter===0?12+Math.floor((wave-1)*1.25):[0,24,29,36,44][chapter]};
}

function buildQueue(wave) {
  if (wave % 10 === 0) return ["archon"];
  const chapter = Math.floor((wave-1)/10);
  const count = regularCount(wave);
  const intro=Math.min(1,(wave-1)/8);
  const weights=[[.67-.25*intro,.23+.13*intro,.07+.08*intro,.03+.04*intro],[.40,.36,.16,.08],[.31,.36,.21,.12],[.27,.34,.23,.16],[.23,.35,.24,.18]][chapter];
  const queue=[];
  const kinds=['bat','imp','wraith','cultist'];
  const unlocked=Math.min(4,wave);
  const total=weights.slice(0,unlocked).reduce((a,b)=>a+b,0);
  let rangedRun=0;
  for(let i=0;i<count;i++){
    let roll=Math.random()*total, k=0;
    while(k<unlocked-1 && (roll-=weights[k])>=0) k++;
    if(k>=2 && rangedRun>=2) k=Math.random()<.5?0:1;
    rangedRun=k>=2?rangedRun+1:0;
    queue.push({kind:kinds[k],formation:'random',lane:.12+Math.random()*.76,slot:Math.floor(Math.random()*4),group:i,size:1,chapter,delay:Math.random()<.35?.32+Math.random()*.25:.8+Math.random()*.65});
  }
  // Guaranteed introductions alongside randomized composition.
  if(wave>=2&&!queue.some(e=>e.kind==='imp')) queue[1].kind='imp';
  if(wave>=3&&!queue.some(e=>e.kind==='wraith')) queue[3].kind='wraith';
  if(wave>=4&&!queue.some(e=>e.kind==='cultist')) queue[5].kind='cultist';
  const duration=queue.slice(0,-1).reduce((sum,e)=>sum+e.delay,0);
  const target=chapter===0?12.5-(wave-1)*.15+Math.random()*1.2:14+chapter*1.4+Math.random()*1.5;
  for(const entry of queue) entry.delay*=target/duration;
  return queue;
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
  kind = typeof kind === 'string' ? kind : kind.kind;
  if (kind === "archon") return true;
  const alive = game.foes.filter(foe => foe.hp > 0 && foe.kind !== "archon");
  const limits=enemyLimits();
  return alive.length < limits.ordinary &&
    (!isRangedEnemy({ kind }) || alive.filter(isRangedEnemy).length < limits.ranged);
}

function queueFodderReinforcement(dt) {
  if (game.wave <= 2 || game.wave % 10 === 0 || game.between > 0 || game.queue.length ||
      !game.foes.some(foe => foe.hp > 0 && isRangedEnemy(foe)) ||
      game.reinforcements >= BALANCE.reinforcementLimit || !canSpawn("bat") ||
      game.foes.filter(foe => foe.hp > 0 && (foe.kind === "bat" || foe.kind === "imp")).length >= BALANCE.reinforcementFodderCap) return;
  game.reinforcementCd -= dt;
  if (game.reinforcementCd > 0) return;
  game.reinforcements += 1;
  const chapter=Math.floor((game.wave-1)/10);
  spawn({kind:Math.random()<.55?'bat':'imp',formation:'random',lane:.12+Math.random()*.76,slot:0,size:1,group:game.reinforcements,chapter,delay:0});
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
  document.getElementById('upgrade-title').textContent = grimoireChoice ? 'Choose a grimoire' : 'Choose a boon';
  document.getElementById('upgrade-description').textContent = grimoireChoice ? 'Choose one school of magic for this vigil.' : 'Choose one upgrade for this vigil.';
  upgradeChoices.replaceChildren(...choices.map((upgrade, index) => {
    const button = document.createElement("button");
    button.className = "upgrade-choice"; button.type = "button";
    button.dataset.upgradeId = upgrade.id; button.dataset.offerToken = String(token);
    const stacks = upgrade.maxStacks ? `<span class="upgrade-stack">${game.upgradeCounts[upgrade.id] || 0}/${upgrade.maxStacks} acquired</span>` : '';
    const book = grimoireChoice ? upgrade.id : upgrade.grimoire;
    const artPath = book ? bookArt(book, 'unselected') : 'assets/grimoire/ss-boon-select-f03.png';
    button.innerHTML = `<span class="upgrade-choice-visual"><img class="grimoire-choice-art" src="${artPath}" alt=""><kbd class="upgrade-key" aria-hidden="true">${index + 1}</kbd></span><span class="upgrade-choice-copy"><strong>${upgrade.name}</strong><small>${upgrade.description}</small>${stacks}</span>`;
    return button;
  }));
  resetGameplayInput();
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  game.rewardGatherDuration = reducedMotion ? 0 : grimoireChoice ? .55 : .42;
  game.rewardGather = game.rewardGatherDuration;
  upgrades.hidden = game.rewardGather > 0; hud.hidden = true; mobileControls.hidden = true; xpBar.hidden = true;
  bossHud.hidden = true;
  game.state = "upgrade";
  tone(grimoireChoice ? 440 : 330, .28, 'sine', .035, grimoireChoice ? 880 : 660);
}

function openNextReward() {
  if (game.state !== "play" || game.currentOffer || !game.pendingRewards.length) return;
  const kind = game.pendingRewards.shift();
  showUpgradePhase(kind === "grimoire", kind);
}

function chooseUpgrade(id, token = game.currentOffer?.token) {
  const offer = game.currentOffer;
  if (game.state !== "upgrade" || game.rewardGather > 0 || !offer || offer.token !== token || !offer.ids.includes(id)) return;
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
  game.particles.push({ x: player.x, y: player.y, vx: 0, vy: 0, life: .48, max: .48, size: 96, effect: 'boon-select', color: '#f1d394' });
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
    game.shots = [];
    game.reinforcementCd = BALANCE.reinforcementInterval;
    game.queue = buildQueue(game.wave); game.between = 1.6; game.spawnCd = 0.3;
    const boss = game.wave % 10 === 0;
    game.banner = { text: boss ? "An Archon descends" : `Circle ${game.wave}`,
      sub: boss ? "Break the crown" : formationChapterName(game.wave), life: 2.3 };
  }
  openNextReward();
}
