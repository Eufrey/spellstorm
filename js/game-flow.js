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
  const kit = GRIMOIRE_ABILITY_KITS[grimoireFamily()];
  if (kit) ['KeyQ', 'KeyE', 'KeyR'].forEach((key, index) => {
    if (pressed.has(key)) castGrimoireAbility(kit.abilities[index].id);
  });

  fireSpell(dt);

  if (game.between <= 0 && game.queue.length) {
    game.spawnCd -= dt;
    if (game.spawnCd <= 0) {
      const index=game.queue.findIndex(canSpawn);
      if(index>=0){
        const [entry] = game.queue.splice(index,1);
        spawn(entry);
        game.spawnCd = entry === "archon" ? 1 : typeof entry === 'string' ? spawnInterval(game.wave) : entry.delay;
      }
    }
  }
  queueFodderReinforcement(dt);

  for (const bolt of game.bullets) {
    bolt.x += bolt.vx * dt;
    bolt.y += bolt.vy * dt;
    bolt.life -= dt;
  }
  game.bullets = game.bullets.filter(
    (bolt) => bolt.life > 0 && bolt.y > -40 && bolt.y < game.h + 40 && bolt.x > -40 && bolt.x < game.w + 40
  );

  const slowFields = game.particles.filter(field => field.abilityType === 'debuff' && field.life > 0);
  for (const foe of game.foes) {
    for (const field of slowFields) applySlowField(field, foe);
    updateFoe(foe, dt);
    const margin = foe.r + 4;
    foe.x = Math.max(margin, Math.min(game.w - margin, foe.x));
  }

  for (const bolt of game.bullets) {
    for (const foe of game.foes) {
      if (foe.hp <= 0 || bolt.hit.has(foe)) continue;
      if (Math.hypot(bolt.x - foe.x, bolt.y - foe.y) < foe.r + bolt.r) {
        bolt.hit.add(foe);
        if (bolt.spell === "rime" && (foe.slow || 0) < 1.6) { foe.slow = 1.6; foe.slowColor = '#8eebff'; }
        damageFoe(foe, bolt.damage);
        if (bolt.art) {
          const duration = bolt.abilityType === 'ultimate' ? .38 : .25;
          game.particles.push({ x: bolt.x, y: bolt.y, vx: 0, vy: 0, life: duration, max: duration, size: bolt.spell === 'ability' ? 48 : 32, effect: `${bolt.art.element}-impact-${bolt.art.tier}`, color: bolt.color });
        }
        burst(bolt.x, bolt.y, bolt.color, 5, 80);
        if (!bolt.pierce) {
          bolt.life = 0;
          break;
        }
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
    if (dist < 22 && player.lives > 0) {
      gift.life = 0;
      takeGift(gift);
    }
  }
  game.gifts = game.gifts.filter((gift) => gift.life > 0 && gift.y < game.h + 40);

  resolvePlayStep();
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
  if (player.lives <= 0) return;
  const kind = (gift.kind === "heart" && player.lives >= player.maxLives) ||
    (gift.kind === "aegis" && player.aegis) ? "surge" : gift.kind;
  const color = kind === 'heart' ? '#ff8aa0' : kind === 'surge' ? '#ffb15a' : '#b7f3ff';
  const pitch = kind === 'heart' ? 660 : kind === 'surge' ? 880 : 440;
  tone(pitch, .12, 'triangle', .04, pitch * 1.5);
  tone(pitch * 1.5, .18, 'sine', .025, pitch * 2);
  burst(player.x, player.y, color, kind === 'surge' ? 28 : 18, 120);
  game.particles.push({x:player.x,y:player.y,vx:0,vy:0,life:.38,max:.38,ring:true,radius:57,color});
  if (kind === "heart") {
    player.lives = Math.min(player.maxLives, player.lives + 1);
    floatText(player.x, player.y - 30, "+1 Vitality", "#ff8aa0");
  } else if (kind === "surge") {
    player.surge = BALANCE.surgeDuration;
    player.cool = Math.min(player.cool, spellInterval());
    game.particles.push({x:player.x,y:player.y,vx:0,vy:0,life:.4,max:.4,size:85,effect:'surge-activate'});
    floatText(player.x, player.y - 30, "Surge", "#ffb15a");
  } else {
    player.aegis = true;
    game.particles.push({x:player.x,y:player.y,vx:0,vy:0,life:.4,max:.4,size:85,effect:'aegis-activate'});
    floatText(player.x, player.y - 30, "Aegis", "#b7f3ff");
  }
}

function updateParticles(dt) {
  game.defeatedSprites = game.defeatedSprites.filter(item => game.time-item.started < item.duration);
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
  if (game.state === "menu" || game.state === "pause" || game.state === "upgrade" || game.state === "over") return;
  game.time += dt;
  if (game.state === "play") {
    const cooldowns = game.player.grimoireAbilityCooldowns;
    for (const key in cooldowns) cooldowns[key] = Math.max(0, cooldowns[key] - dt);
  }
  game.scroll += dt;
  game.shake = Math.max(0, game.shake - dt * 22);
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
  if (game.state === "over") return;
  if (typeof spellstormFinishRun === 'function') spellstormFinishRun({ score: game.score, circle: game.wave, grimoire: game.player.grimoire, result: won ? 'won' : 'lost' });
  resetGameplayInput();
  game.pendingRewards = []; game.currentOffer = null;
  upgrades.hidden = true;
  game.state = "over";
  game.resultVisualStart = performance.now();
  game.won = won;
  if (typeof stopDrone === 'function') stopDrone();
  tone(won ? 392 : 196, 0.6, "triangle", 0.045, won ? 784 : 82);
  tone(won ? 523 : 147, 0.8, "sine", 0.035, won ? 1046 : 55);
  saveBest();
  overTitle.textContent = won ? "The storm is broken" : "The spire falls";
  finalScore.textContent = won ? `Level 50 · ${game.score}` : String(game.score);
  bestOver.textContent = `Best vigil: ${game.best}`;
  over.hidden = false;
  hud.hidden = true;
  mobileControls.hidden = true;
  xpBar.hidden = true;
  bossHud.hidden = true;
  if (typeof spellstormShowResult === 'function') spellstormShowResult(won, game.score, game.wave, game.best);
}

function syncHud() {
  if (game.state === "menu" || game.state === "over") return;
  const grimoire = GRIMOIRES[game.player.grimoire];
  syncBossHud();
  const score = String(game.score).padStart(5, "0");
  if (scoreEl.dataset.value !== score) {
    scoreEl.dataset.value = score;
    scoreEl.setAttribute("aria-label", "Score " + game.score);
    scoreEl.replaceChildren(...Array.from(score, digit => {
      const tile = document.createElement("i");
      tile.setAttribute("aria-hidden", "true");
      tile.style.setProperty("--digit", digit);
      return tile;
    }));
  }
  circleEl.textContent = String(game.wave).padStart(2, '0');
  const chain = 1 + Math.min(game.combo, 8) * 0.25;
  comboEl.textContent = `×${chain.toFixed(2)}`;
  comboEl.dataset.active = String(game.combo > 0);
  document.getElementById('chain-fill').style.width = `${Math.max(0, Math.min(1, game.comboTimer / 2.4)) * 100}%`;
  const lives = Math.max(0, game.player.lives);
  circleEl.dataset.short = `Circle ${game.wave}`;
  if (livesEl.dataset.value !== String(lives)) {
    livesEl.dataset.value = String(lives);
    livesEl.setAttribute("aria-label", lives + " lives");
    livesEl.replaceChildren(...Array.from({ length: lives }, () => document.createElement("i")));
  }
  spellNameEl.textContent = grimoire.name;
  const shortGrimoire = { basic: 'Basic Grimoire', ashen: 'Ashen Crown', hollowWinter: 'Hollow Winter', stormbound: 'Stormbound', infernal: 'Infernal Testament', glacial: 'Glacial Sovereign', thunderous: 'Tempest Ascendant' }[game.player.grimoire] || grimoire.name;
  spellNameEl.dataset.short = shortGrimoire;
  spellNameEl.style.color = grimoire.color;
  const bookImage = document.getElementById('equipped-book-art');
  const bookPath = bookArt(game.player.grimoire, game.player.surge > 0 ? 'activated' : 'equipped');
  if (bookImage.dataset.path !== bookPath) {
    bookImage.dataset.path = bookPath;
    bookImage.src = bookPath;
  }
  spellHintEl.textContent = grimoire.hint;
  const profile = document.getElementById('mage-profile');
  const player = game.player;
  const emblem = document.getElementById('equipped-emblem');
  const emblemPath = grimoireEmblem(player.grimoire);
  if (emblem.dataset.path !== emblemPath) {
    emblem.dataset.path = emblemPath;
    emblem.src = emblemPath;
  }
  profile.style.setProperty('--mage-accent', player.grimoire === 'basic' ? '#e8be72' : grimoire.color);
  document.getElementById('compact-vitality').textContent = `♥ ${lives}/${player.maxLives}`;
  document.getElementById('mage-condition').textContent = [player.aegis && 'Aegis', player.surge > 0 && 'Surge'].filter(Boolean).join(' · ') || 'Vigil in progress';
  document.getElementById('mage-power').textContent = Number((grimoire.damage * (1 + player.spellDamage + player.grimoireDamage)).toFixed(1));
  const condition = document.getElementById('mage-condition');
  condition.dataset.surge = String(player.surge > 0);
  if (player.surge > 0) condition.textContent = `${player.aegis ? 'Aegis · ' : ''}Surge ${player.surge.toFixed(1)}s`;
  document.getElementById('mage-rate').textContent = (1 / spellInterval()).toFixed(1);
  const boonEntries = Object.entries(game.upgradeCounts).filter(([id]) => !GRIMOIRES[id]);
  document.getElementById('mage-boons').textContent = boonEntries.reduce((sum, [, count]) => sum + count, 0);
  const list = document.getElementById('mage-upgrade-list');
  const signature = JSON.stringify(boonEntries);
  if (list.dataset.signature !== signature) {
    list.dataset.signature = signature;
    const options = [...UPGRADE_OPTIONS, ...Object.values(GRIMOIRE_UPGRADES).flat(), ...Object.values(GRIMOIRE_EVOLUTIONS)];
    list.textContent = boonEntries.length ? '' : 'No boons yet';
    if (boonEntries.length) list.replaceChildren(...boonEntries.map(([id, count]) => {
      const item = document.createElement('span');
      item.textContent = `${options.find(option => option.id === id)?.name || id}${count > 1 ? ` ×${count}` : ''}`;
      return item;
    }));
  }
  const ready = game.player.ward <= 0;
  wardFill.style.width = ready ? "100%" : `${(1 - game.player.ward / game.player.wardCooldown) * 100}%`;
  wardButton.classList.toggle("cooling", !ready);
  wardButton.textContent = ready ? "WARD" : `${game.player.ward.toFixed(1)}s`;
  const wardStatus = document.getElementById("ward-status");
  if (wardStatus) wardStatus.textContent = ready ? "Ready" : `${game.player.ward.toFixed(1)}s`;
  const abilitiesEl = abilities;
  const abilityKit = GRIMOIRE_ABILITY_KITS[grimoireFamily()];
  touchAbilities.hidden = !abilityKit || game.state !== "play";
  if (abilitiesEl) {
    abilitiesEl.hidden = !abilityKit;
    if (abilityKit) {
      abilityKit.abilities.forEach((ability, index) => {
        const slot = abilitiesEl.children[index];
        const name = slot?.querySelector(".ability-name");
        const fill = slot?.querySelector(".ability-fill");
        const status = slot?.querySelector(".ability-status");
        if (name) name.textContent = ability.name;
        const cooldown = game.player.grimoireAbilityCooldowns[`${grimoireFamily()}:${ability.id}`] || 0;
        const ready = cooldown <= 0;
        const artState = ready ? 'ready' : cooldown >= ability.cooldown - .25 ? 'activated' : 'cooldown';
        const desktopArtState = !ready && cooldown >= ability.cooldown - .10 ? 'pressed' : artState;
        if (slot) slot.style.setProperty('--skill-art', `url("${abilityArt(ability.id, 'desktop', desktopArtState)}")`);
        if (fill) fill.style.width = cooldown > 0 ? `${Math.max(0, (1 - cooldown / ability.cooldown) * 100)}%` : "100%";
        if (fill) fill.style.background = grimoire.color;
        if (status) status.textContent = ready ? 'Ready' : `${Math.ceil(cooldown)}s`;
        if (slot) slot.classList.toggle('cooling', !ready);
        const button = touchAbilityButtons[index];
        const image = document.getElementById(`ability-art-${['q','e','r'][index]}`);
        const mobileArtState = !ready && cooldown >= ability.cooldown - .10 ? 'pressed' : artState;
        const imagePath = abilityArt(ability.id, 'mobile', mobileArtState);
        if (image.dataset.path !== imagePath) {
          image.dataset.path = imagePath;
          image.onerror = () => { image.onerror = null; image.src = `assets/grimoire/ss-ability-icon-${ABILITY_ART[ability.id]}.png`; };
          image.src = imagePath;
        }
        const shortNames = { 'ashen-nova':'Nova', 'ashen-cinders':'Cinders', 'ashen-infernal':'Pyre', 'hollow-frostbite':'Frost', 'hollow-deeprime':'Rime', 'hollow-hail':'Hail', 'storm-thunderclap':'Clap', 'storm-static':'Static', 'storm-breaker':'Breaker' };
        button.querySelector('.ability-touch-name').textContent = shortNames[ability.id] || ability.name;
        button.querySelector('.ability-touch-status').textContent = ready ? '' : `${Math.ceil(cooldown)}s`;
        button.title = ability.name;
        button.style.setProperty('--recharge', `${Math.max(0, 1 - cooldown / ability.cooldown) * 100}%`);
        button.style.setProperty('--ability-color', grimoire.color);
        button.classList.toggle('cooling', !ready);
        button.disabled = !ready;
        button.setAttribute('aria-label', `${ability.name}, ${ready ? 'ready' : `${Math.ceil(cooldown)} seconds remaining`}`);
      });
    }
  }
  updateXpBar();
}

function showPause(on) {
  const profile = document.getElementById('mage-profile');
  if (on) document.getElementById('pause-profile-slot').appendChild?.(profile);
  else hud.insertBefore?.(profile, bossHud);
  paused.hidden = !on;
  hud.hidden = on || game.state === "menu" || game.state === "over";
  xpBar.hidden = hud.hidden;
}

function startGame() {
  hud.insertBefore?.(document.getElementById('mage-profile'), bossHud);
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

function returnToMenu() {
  hud.insertBefore?.(document.getElementById('mage-profile'), bossHud);
  if (typeof stopDrone === 'function') stopDrone();
  resetGameplayInput();
  game.state = "menu";
  game.player = null;
  game.bullets = []; game.foes = []; game.shots = []; game.gifts = [];
  game.particles = []; game.floaters = []; game.queue = [];
  game.defeatedSprites = [];
  game.pendingRewards = []; game.currentOffer = null;
  game.won = false;
  menu.hidden = false;
  menu.scrollTop = 0;
  over.hidden = paused.hidden = upgrades.hidden = hud.hidden = mobileControls.hidden = xpBar.hidden = bossHud.hidden = true;
  bestMenu.textContent = `Best vigil: ${game.best}`;
  if (typeof spellstormClearResult === 'function') spellstormClearResult();
}

function togglePause() {
  if (game.state === "play") {
    resetGameplayInput();
    game.state = "pause";
    showPause(true);
    mobileControls.hidden = true;
  } else if (game.state === "pause") {
    resetGameplayInput();
    game.state = "play";
    showPause(false);
    mobileControls.hidden = false;
  }
}

