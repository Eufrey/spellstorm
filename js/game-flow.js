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
    if (game.spawnCd <= 0 && canSpawn(game.queue[0])) {
      const kind = game.queue.shift();
      spawn(kind);
      game.spawnCd = kind === "archon" ? 1 : spawnInterval(game.wave);
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
  tone(660, 0.12, "triangle", 0.04, 990);
  const kind = (gift.kind === "heart" && player.lives >= player.maxLives) ||
    (gift.kind === "aegis" && player.aegis) ? "surge" : gift.kind;
  if (kind === "heart") {
    player.lives = Math.min(player.maxLives, player.lives + 1);
    floatText(player.x, player.y - 30, "Vitality", "#ff8aa0");
  } else if (kind === "surge") {
    player.surge = 4.5;
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
  resetGameplayInput();
  game.pendingRewards = []; game.currentOffer = null;
  upgrades.hidden = true;
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
  circleEl.textContent = game.wave % 10 === 0 ? `Circle ${game.wave} · Archon` : `Circle ${game.wave}`;
  comboEl.textContent = game.combo >= 2 ? `Chain ×${(1 + Math.min(game.combo, 8) * 0.25).toFixed(2)}` : "";
  const lives = Math.max(0, game.player.lives);
  if (livesEl.dataset.value !== String(lives)) {
    livesEl.dataset.value = String(lives);
    livesEl.setAttribute("aria-label", lives + " lives");
    livesEl.replaceChildren(...Array.from({ length: lives }, () => document.createElement("i")));
  }
  spellNameEl.textContent = game.player.surge > 0 ? `${grimoire.name} surge` : grimoire.name;
  spellNameEl.style.color = grimoire.color;
  spellHintEl.textContent = grimoire.hint;
  const ready = game.player.ward <= 0;
  wardFill.style.width = ready ? "100%" : `${(1 - game.player.ward / game.player.wardCooldown) * 100}%`;
  wardButton.classList.toggle("cooling", !ready);
  wardButton.textContent = ready ? "WARD" : `${game.player.ward.toFixed(1)}s`;
  const abilitiesEl = abilities;
  const abilityKit = GRIMOIRE_ABILITY_KITS[grimoireFamily()];
  if (abilitiesEl) {
    abilitiesEl.hidden = !abilityKit || game.state !== "play";
    if (abilityKit) {
      abilityKit.abilities.forEach((ability, index) => {
        const slot = abilitiesEl.children[index];
        if (!slot) return;
        const name = slot.querySelector(".ability-name");
        const fill = slot.querySelector(".ability-fill");
        if (name) name.textContent = ability.name;
        const cooldown = game.player.grimoireAbilityCooldowns[`${grimoireFamily()}:${ability.id}`] || 0;
        if (fill) fill.style.width = cooldown > 0 ? `${Math.max(0, (1 - cooldown / ability.cooldown) * 100)}%` : "100%";
      });
    }
  }
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

