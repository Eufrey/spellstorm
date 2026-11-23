function spawn(kind) {
  const spec = ENEMIES[kind];
  const archon = kind === "archon" ? ARCHONS[(Math.floor(game.wave / 10) - 1) % ARCHONS.length] : null;
  const health = kind === "archon"
    ? BALANCE.bossHealth[Math.min(4, Math.max(0, Math.floor(game.wave / 10) - 1))]
    : Math.round(spec.hp * enemyHealthMultiplier());
  const margin = kind === "archon" ? 80 : 36;
  const foe = {
    kind,
    archon,
    x: kind === "archon" ? game.w / 2 : margin + Math.random() * (game.w - margin * 2),
    y: kind === "archon" ? -60 : -28,
    hp: health,
    maxHp: health,
    r: spec.radius * ENEMY_SCALE,
    age: 0,
    motionAge: 0,
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
  if (kind === "archon") { tone(82, 0.65, "triangle", 0.05, 55); tone(165, 0.42, "sine", 0.04, 110); }
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
  const heartCut = generous ? 0.34 : (game.player.lives === 1 ? 0.10 : 0.045);
  const surgeCut = heartCut + (generous ? 0.4 : 0.065);
  const aegisCut = surgeCut + (generous ? 0.26 : 0.04);
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
  awardExperience(gained);
  floatText(x, y - 16, `+${gained}`, "#f0c56a");
  if (game.combo === 4 || game.combo === 8) {
    floatText(x, y + 12, `CHAIN x${mult.toFixed(1)}`, "#ffe4a0");
    tone(game.combo === 8 ? 880 : 660, .16, "triangle", .035, 1320);
  }
  updateXpBar();
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

function castGrimoireAbility(abilityId) {
  if (game.state !== "play" || !game.player) return;
  const family = grimoireFamily();
  const kit = GRIMOIRE_ABILITY_KITS[family];
  const ability = kit && kit.abilities.find((candidate) => candidate.id === abilityId);
  if (!ability) return;
  const key = `${family}:${abilityId}`;
  if ((game.player.grimoireAbilityCooldowns[key] || 0) > 0) return;
  game.player.grimoireAbilityCooldowns[key] = ability.cooldown;
  const player = game.player;
  const color = GRIMOIRES[family].color;
  player.castAt = game.time;
  const ultimate = ability.type === 'ultimate';
  game.particles.push({ x: player.x, y: player.y, vx: 0, vy: 0,
    life: 0.48, max: 0.48, color, ring: true, radius: ability.radius,
    abilityFamily: family, abilityType: ability.type });
  if (ultimate) game.shake = Math.max(game.shake, 7);
  if (ability.type === "debuff") {
    for (const foe of game.foes) {
      if (foe.hp <= 0) continue;
      if (Math.hypot(foe.x - player.x, foe.y - player.y) <= ability.radius + foe.r) foe.slow = ability.slow;
    }
  } else {
    const speed = (GRIMOIRES[family].projectileSpeed || 480) * player.projectileSpeedMultiplier * player.grimoireSpeedMultiplier;
    const visible = game.foes.filter(foe => foe.hp > 0 && foe.y >= -foe.r && foe.y <= game.h + foe.r);
    const targets = visible.filter(foe => Math.hypot(foe.x - player.x, foe.y - player.y) <= ability.radius + foe.r);
    // When nobody is in the immediate area, launch a forward volley toward the nearest foe.
    const nearest = visible.reduce((best, foe) => !best || Math.hypot(foe.x - player.x, foe.y - player.y) < Math.hypot(best.x - player.x, best.y - player.y) ? foe : best, null);
    const aim = foe => Math.atan2(foe.x - player.x, player.y - foe.y);
    const angles = targets.length ? targets.map(aim) : (ultimate ? [-0.32, -0.16, 0, 0.16, 0.32] : [-0.16, 0, 0.16]).map(angle => angle + (nearest ? aim(nearest) : 0));
    const hit = new Set();
    for (const angle of angles) {
      game.bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed,
        damage: ability.damage,
        color,
        spell: "ability",
        abilityFamily: family,
        abilityType: ability.type,
        life: 1.6,
        r: ultimate ? 12 : 9,
        hit,
        pierce: ultimate,
      });
    }
  }
  burst(player.x, player.y, color, ability.type === "debuff" ? 30 : 40, ability.type === "ultimate" ? 260 : 200);
  tone(ability.type === "debuff" ? 320 : ability.type === "ultimate" ? 180 : 520, 0.18, "sine", 0.06, ability.type === "debuff" ? 220 : 400);
  floatText(player.x, player.y - 30, ability.name, color);
  return true;
}

function castWard() {
  const player = game.player;
  if (player.ward > 0 || game.state !== "play") return;
  player.ward = player.wardCooldown;
  game.shake = 6;
  tone(180, 0.35, "sawtooth", 0.04, 80);
  tone(440, 0.22, "triangle", 0.04, 880);
  tone(660, 0.16, "sine", 0.025, 1320);
  const radius = player.wardRadius;
  burst(player.x, player.y, "#ffe4a0", 24, 280);
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
  const key = foe.kind === 'archon' ? foe.archon.name.split(',')[0].toLowerCase() : foe.kind;
  game.defeatedSprites.push({key,x:foe.x,y:foe.y,started:game.time,duration:foe.kind==='archon'?.72:.28});
  if (game.defeatedSprites.length > 40) game.defeatedSprites.shift();
  burst(foe.x, foe.y, foe.kind === "archon" ? "#f0c56a" : "#e7d4ff", foe.kind === "archon" ? 48 : 14, 160);
  tone(foe.kind === "archon" ? 90 : 320, foe.kind === "archon" ? 0.4 : 0.08, "square", 0.03, 180);
  if (foe.kind === "archon") tone(330, 0.65, "triangle", 0.04, 660);
  addScore(enemyScore(foe), foe.x, foe.y);
  if (foe.kind === "archon") game.shake = 16;
  if (foe.kind !== "archon" || game.wave !== 50) maybeDrop(foe.x, foe.y, foe.kind === "archon");
}

function spellInterval() {
  const player = game.player;
  return Math.max(BALANCE.minimumSpellInterval, GRIMOIRES[player.grimoire].cooldown *
    (player.surge > 0 ? 0.75 : 1) * player.cooldownMultiplier * player.grimoireCooldownMultiplier);
}

function fireSpell(dt) {
  game.player.cool -= dt;
  // Carry fractional recovery time so rendering frequency cannot reduce fire rate.
  for (let due = 0; game.player.cool <= 1e-9 && due < 12; due++) {
    game.player.cool += spellInterval();
    emitSpell();
  }
}

function emitSpell() {
  const player = game.player;
  if (game.time - (player.castAt ?? -10) >= .16) player.castAt = game.time;
  const grimoire = GRIMOIRES[player.grimoire];
  const attack = grimoire.attack;
  const originY = player.y - 36 * PLAYER_SCALE;
  const make = (angle, speed, damage, extra) => {
    const bolt = {
      x: player.x + 18 * PLAYER_SCALE,
      y: originY,
      vx: Math.sin(angle) * speed * player.projectileSpeedMultiplier * player.grimoireSpeedMultiplier,
      vy: -Math.cos(angle) * speed * player.projectileSpeedMultiplier * player.grimoireSpeedMultiplier,
      damage: damage * (1 + player.spellDamage + player.grimoireDamage),
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
    make(-0.18, grimoire.projectileSpeed - 20, grimoire.damage);
    make(0, grimoire.projectileSpeed, grimoire.damage);
    make(0.18, grimoire.projectileSpeed - 20, grimoire.damage);
  } else {
    make((Math.random() - 0.5) * 0.12, grimoire.projectileSpeed, grimoire.damage);
  }
  if (game.time >= (player.nextSpellSound || 0)) {
    player.nextSpellSound = game.time + 0.11;
    const voice = attack === "rime" ? [880, 540, "triangle"] : attack === "ember" ? [220, 100, "sawtooth"] : attack === "tempest" ? [1240, 420, "square"] : [520, 340, "triangle"];
    tone(voice[0], 0.055, voice[2], 0.016, voice[1]);
  }
}

function slowOf(foe) {
  return foe.slow > 0 ? (foe.kind === "archon" ? 0.8 : 0.55) : 1;
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
  return 1 + enemyStatTier() * 0.12 + Math.max(0, game.wave - 5) * 0.009;
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
  if (foe.hp <= 0) return;
  const player = game.player;
  const spec = ENEMIES[foe.kind];
  const slow = slowOf(foe);
  const pace = enemyPace();
  const projectileSpeed = enemyProjectileSpeed();
  foe.age += dt;
  foe.motionAge += dt * pace * slow;
  foe.slow = Math.max(0, foe.slow - dt);
  foe.flash = Math.max(0, foe.flash - dt);
  foe.touch = Math.max(0, foe.touch - dt);
  foe.shot -= dt;

  if (foe.kind === "bat") {
    foe.y += spec.speed * pace * slow * dt;
    foe.x = foe.originX + Math.sin(foe.motionAge * 3.2 + foe.seed) * 78;
  } else if (foe.kind === "imp") {
    if (foe.age < 0.9) {
      foe.y += 50 * pace * slow * dt;
      foe.x += Math.sign(player.x - foe.x) * 110 * pace * slow * dt;
    } else {
      if (foe.castAt == null) foe.castAt = game.time;
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
      if (game.time - (foe.castAt ?? -10) >= .24) foe.castAt = game.time;
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
      if (game.time - (foe.castAt ?? -10) >= .24) foe.castAt = game.time;
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
    roamShooter(foe, dt, bounds, 70 * pace * 1.6 * slow);
    const pattern = Math.floor(foe.age / 3.2) % 3;
    if (foe.shot <= 0) {
      if (game.time - (foe.castAt ?? -10) >= .24) foe.castAt = game.time;
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

