function spawn(entry) {
  const formation = typeof entry === 'object' ? entry : null;
  const kind = formation ? formation.kind : entry;
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
  if (formation) {
    foe.formation = formation;
    foe.x = Math.max(foe.r+6,Math.min(game.w-foe.r-6,formation.lane*game.w));
    foe.originX=foe.x;
    // Randomized singleton slots select firing stations, not formation offsets.
    const stagger=kind==='bat'&&formation.size>1?(formation.size-1-formation.slot)*.32*spec.speed*enemyPace():0;
    foe.y=-28-(formation.size>1?Math.abs(formation.slot-(formation.size-1)/2)*18:0)-stagger;
    foe.seed=Math.random()*Math.PI*2;
    foe.shot=.45+Math.random()*.85;
  }
  if (archon) { foe.archonIndex = Math.floor(game.wave / 10) - 1; foe.phase = 1; foe.attackIndex = 0; foe.attack = null; foe.shot = .85; }
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
  const ratio = Math.max(0, Math.min(1, boss.hp / boss.maxHp));
  const percent = Math.ceil(ratio * 100);
  const phase = boss.phase || 1;
  bossHud.dataset.phase = String(phase);
  document.getElementById('boss-phase').textContent = `Phase ${phase === 2 ? 'II' : 'I'}`;
  document.getElementById('boss-health-text').textContent = `${percent}%`;
  document.getElementById('boss-health').setAttribute('aria-valuenow', String(percent));
  bossHealthFill.style.width = `${ratio * 100}%`;
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
    game.particles.push({x:player.x,y:player.y,vx:0,vy:0,life:.36,max:.36,size:80,effect:'aegis-break'});
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

function applySlowField(field, foe) {
  if (foe.hp <= 0 || field.hit.has(foe) || Math.hypot(foe.x-field.x,foe.y-field.y) > field.radius+foe.r) return;
  field.hit.add(foe);
  foe.slow = Math.max(foe.slow || 0, field.slow);
  foe.slowColor = field.color;
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
  const art = spellArt(player.grimoire) || spellArt(family);
  const effect = ({'ashen-cinders':'cinders-ring','ashen-infernal':'infernal-pyre-ring','hollow-deeprime':'deep-rime-ring','hollow-hail':'sovereign-hail-ring','storm-static':'static-ring','storm-breaker':'stormbreaker-ring'})[abilityId]
    || `${art.element}-cast-${art.tier}`;
  const duration = ability.type === 'debuff' ? 1.25 : ultimate ? .62 : .48;
  const field = { x: player.x, y: player.y, vx: 0, vy: 0,
    life: duration, max: duration, color, ring: true, radius: ability.radius,
    abilityFamily: family, abilityType: ability.type,
    effect, slow: ability.slow, hit: new Set() };
  game.particles.push(field);
  if (ultimate) game.shake = Math.max(game.shake, 7);
  if (ability.type === "debuff") {
    for (const foe of game.foes) applySlowField(field, foe);
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
        art,
        born: game.time,
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
    effect: 'ward-cast',
    radius,
  });
}

function damageFoe(foe, amount) {
  if (foe.hp <= 0) return;
  if (foe.kind === 'archon' && (foe.phaseLock > 0 || (foe.phase === 1 && foe.hp <= foe.maxHp/2))) return;
  foe.hp -= amount;
  if (foe.kind === 'archon' && foe.phase === 1) foe.hp = Math.max(foe.maxHp/2, foe.hp);
  foe.flash = 0.08;
  if (foe.hp > 0) return;
  if (foe.kind === 'archon') game.shots = [];
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
  const surging = player.surge > 0;
  return Math.max(surging ? BALANCE.surgeMinimumSpellInterval : BALANCE.minimumSpellInterval, GRIMOIRES[player.grimoire].cooldown *
    (surging ? BALANCE.surgeIntervalMultiplier : 1) * player.cooldownMultiplier * player.grimoireCooldownMultiplier);
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
      art: spellArt(player.grimoire),
      born: game.time,
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
  return Math.min(1.65, 1.06 + Math.min(8,game.wave-1)*.025 + Math.max(0,game.wave-9)*.010);
}

function enemyProjectileSpeed() {
  return Math.min(1.12, .76 + Math.max(0, game.wave - 1) * .0075);
}

function enemyStatTier() {
  return Math.min(ENEMY_MAX_STAT_TIER, Math.max(0, Math.floor((game.wave - 5) / 5)));
}

function enemyHealthMultiplier() {
  return Math.min(2.65, 1 + Math.min(8,game.wave-1)*.045 + Math.max(0,game.wave-9)*.032);
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

// Every encounter uses the same readable warning / release / recovery grammar.
const ARCHON_PATTERNS = [
  ['fan', 'aim', 'rain', 'crossfire', 'spiral'],
  ['emberfall', 'cinder', 'rain', 'spiral', 'crossfire'],
  ['curtain', 'mark', 'crossfire', 'rain', 'spiral'],
  ['lanes', 'sweep', 'spiral', 'crossfire', 'rain'],
  ['ruin', 'shatter', 'breaker', 'crown', 'spiral', 'rain', 'crossfire'],
];
const ARCHON_ATTACK_NAMES = { fan:'Dusk Fan', aim:'Crown Strike', emberfall:'Emberfall', cinder:'Cinder Volley', curtain:'Frost Curtain', mark:'Winter’s Mark', lanes:'Storm Lanes', sweep:'Thunder Sweep', ruin:'Crown of Ruin', shatter:'Shattered Sky', breaker:'Spirebreaker', crown:'Closing Crown' };

Object.assign(ARCHON_ATTACK_NAMES, {rain:'Rune Rain',crossfire:'Twin Crossfire',spiral:'Arcane Spiral'});

function planArchonBatches(foe, attack) {
  const tier=foe.archonIndex, phase=foe.phase === 2 ? 1 : 0;
  const count=2+phase+(tier>=2?1:0);
  const batches=[];
  for(let wave=0;wave<count;wave++) {
    const shots=[];
    if(attack.type==='rain') {
      const gapWidth=Math.max(112,158-tier*8-phase*12);
      const side=attack.tx<game.w/2?1:-1;
      const gapCenter=(.5+side*(wave%2===0?1:-1)*(.23-tier*.018))*game.w;
      const spacing=Math.max(24,34-tier*2-phase*2);
      for(let x=18+(wave%2)*spacing/2;x<game.w;x+=spacing) {
        if(Math.abs(x-gapCenter)<gapWidth/2) continue;
        shots.push({x,y:0,angle:Math.PI/2,speed:255});
      }
    } else if(attack.type==='crossfire') {
      const left=(wave%2===0);
      const gapCenter=Math.max(game.h*.38,Math.min(game.h*.86,attack.ty+(wave%2===0?-105:105)));
      const spacing=Math.max(48,76-tier*5-phase*8);
      for(let y=game.h*.32+(wave%2)*spacing/2;y<game.h;y+=spacing) {
        if(Math.abs(y-gapCenter)<65) continue;
        shots.push({x:left?0:game.w,y,angle:left?0:Math.PI,speed:260});
      }
    } else {
      const rays=9+tier+phase*2;
      const aim=Math.atan2(attack.ty-attack.y,attack.tx-attack.x);
      for(let i=0;i<rays;i++) {
        const angle=aim+(i-(rays-1)/2)*.23+(wave-(count-1)/2)*.18;
        shots.push({x:attack.x,y:attack.y,angle,speed:245});
      }
    }
    batches.push(shots);
  }
  return batches;
}

function prepareArchonAttack(foe, repeat = false) {
  const sequence = ARCHON_PATTERNS[foe.archonIndex];
  const index = repeat ? foe.attackIndex : foe.attackIndex++;
  let type = repeat ? 'breaker' : sequence[index % sequence.length];
  if (type === 'crown' && foe.phase === 1) type = 'ruin';
  const duration = Math.max(.72, 1.02 - foe.archonIndex*.035 - (foe.phase === 2 ? .16 : 0));
  const attack = {type, repeat, stage:'warning', time:duration, duration, x:foe.x, y:foe.y+8, tx:game.player.x, ty:game.player.y, zones:[], lanes:[], rays:[], shots:[]};
  const radius = type === 'shatter' ? 82 : type === 'emberfall' ? 76 : 62;
  if (['rain','crossfire','spiral'].includes(type)) {
    attack.batches=planArchonBatches(foe,attack);
    attack.batchIndex=0;
    attack.batchInterval=Math.max(.24,.43-foe.archonIndex*.035-(foe.phase===2?.05:0));
  } else if (['emberfall','mark','shatter'].includes(type)) {
    attack.zones.push({x:game.player.x,y:game.player.y,r:radius});
    const count = type === 'shatter' ? 9 : 3 + 2*Math.floor(foe.archonIndex/2) + (foe.phase===2?2:0);
    const aim = Math.atan2(attack.ty-attack.y,attack.tx-attack.x);
    for(let i=0;i<count;i++) attack.rays.push(aim+(i-(count-1)/2)*.30);
  } else if (['curtain','crown','lanes','breaker'].includes(type)) {
    const count = 3, width = game.w / count;
    const current = Math.min(count-1,Math.floor(game.player.x/width));
    const safe = type === 'crown' || current !== 1 ? 1 : (Math.floor(index/sequence.length) % 2 ? 0 : 2);
    attack.safe = safe;
    for(let i=0;i<count;i++) if(i!==safe) attack.lanes.push({x:i*width,w:width});
  } else if (type === 'sweep') {
    const fromLeft = Math.floor(index/sequence.length) % 2 === 0;
    for(let y=game.h*.35;y<game.h-24;y+=foe.phase===2?78:90) attack.shots.push({x:fromLeft?0:game.w,y,angle:fromLeft?0:Math.PI,speed:260});
  } else if (type !== 'aim') {
    const count = 7 + 2*Math.floor(foe.archonIndex/2) + (foe.phase===2?2:0);
    const spread = type === 'ruin' ? .21 : .23;
    const aim = Math.atan2(attack.ty-attack.y,attack.tx-attack.x);
    for(let i=0;i<count;i++) attack.rays.push(aim+(i-(count-1)/2)*spread);
  }
  // Preserve ordinary volleys for pressure; explicitly advertised lanes and sweeps get a clean arena.
  if (attack.lanes.length || attack.type === 'sweep') game.shots = [];
  foe.attack = attack;
  tone(190, .12, 'triangle', .025, 280);
}

function archonShot(x,y,angle,speed,r=7) {
  game.shots.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r});
}

function releaseArchonBatch(foe, attack) {
  const fast=1+foe.archonIndex*.07+(foe.phase===2?.14:0);
  const batch=attack.batches[attack.batchIndex++];
  for(const shot of batch) archonShot(shot.x,shot.y,shot.angle,shot.speed*fast,7);
  attack.time=attack.batchIndex<attack.batches.length?attack.batchInterval:.28;
  foe.castAt=game.time;
}

function releaseArchonAttack(foe, attack) {
  const fast = 1 + foe.archonIndex*.07 + (foe.phase === 2 ? .14 : 0);
  foe.castAt = game.time;
  attack.stage = 'release'; attack.time = .28;
  if(attack.batches){releaseArchonBatch(foe,attack);return;}
  const player = game.player;
  if (attack.type === 'aim') {
    const aim = Math.atan2(attack.ty-attack.y,attack.tx-attack.x);
    const count = foe.phase === 2 ? 5 : 3;
    for(let i=0;i<count;i++) archonShot(attack.x,attack.y,aim+(i-(count-1)/2)*.16,300*fast,9);
  }
  for(const angle of attack.rays) archonShot(attack.x,attack.y,angle,(attack.type==='cinder'?250:attack.type==='shatter'?210:225)*fast,8);
  for(const shot of attack.shots) archonShot(shot.x,shot.y,shot.angle,shot.speed*fast);
  if (attack.type === 'curtain' || attack.type === 'crown') {
    for(const lane of attack.lanes) for(let x=lane.x+16;x<lane.x+lane.w-8;x+=28) archonShot(x,attack.y,Math.PI/2,245*fast,9);
  } else if (attack.lanes.some(lane => player.x+PLAYER_HIT_RADIUS>lane.x && player.x-PLAYER_HIT_RADIUS<lane.x+lane.w)) {
    hurtPlayer();
  }
  if(attack.zones.some(zone=>Math.hypot(zone.x-player.x,zone.y-player.y)<zone.r+PLAYER_HIT_RADIUS)) hurtPlayer();
  tone(foe.archonIndex===4?110:170,.24,'triangle',.045,65);
}

function updateArchon(foe,dt,pace,slow) {
  if(foe.hp<=foe.maxHp/2 && foe.phase===1) {
    foe.phase=2; foe.attack=null; foe.attackIndex=0; foe.shot=1.15; foe.phaseLock=.65; game.shots=[];
    game.banner={text:'Phase II',sub:foe.archonIndex===4?'The last crown fractures':'The Archon awakens',life:1.2};
    return;
  }
  foe.phaseLock = Math.max(0,(foe.phaseLock || 0)-dt);
  if (!foe.attack) {
    roamShooter(foe,dt,{left:foe.r+24,right:game.w-foe.r-24,top:game.h*.18,bottom:game.h*.32},70*pace*1.6*slow);
    if(foe.shot<=0) prepareArchonAttack(foe);
    return;
  }
  const attack=foe.attack;
  attack.time-=dt;
  if(attack.stage==='warning') {
    // Target follows during the first portion, then visibly locks before firing.
    if(attack.type==='aim' && attack.time>attack.duration*.52) {attack.tx=game.player.x;attack.ty=game.player.y;}
    if(attack.time<=0) releaseArchonAttack(foe,attack);
  } else if(attack.time<=0) {
    if(attack.batches && attack.batchIndex<attack.batches.length){releaseArchonBatch(foe,attack);return;}
    if (attack.type==='breaker' && foe.phase===2 && !attack.repeat) { prepareArchonAttack(foe,true); return; }
    foe.attack=null;
    const recovery=Math.max(.32,1.0-foe.archonIndex*.10-(foe.phase===2?.28:0));
    // Allow a curtain to cross the arena before another pattern begins.
    foe.shot=['curtain','crown'].includes(attack.type) ? Math.max(recovery,(game.h-attack.y+24)/(245*(1+foe.archonIndex*.07+(foe.phase===2?.14:0)))-.28) : recovery;
  }
}

function updateFormationEnemy(foe,dt,pace,slow,projectileSpeed) {
  const f=foe.formation, player=game.player, spec=ENEMIES[foe.kind];
  if (foe.kind==='bat') {
    const amplitude=28+foe.seed*5;
    foe.y+=spec.speed*pace*slow*dt;
    foe.x=foe.originX+Math.sin(foe.motionAge*2.4+foe.seed)*amplitude;
    return;
  }
  if (foe.kind==='imp') {
    if(foe.diveActive){foe.y+=255*pace*slow*dt;foe.x+=foe.dive*pace*slow*dt;return;}
    if(foe.y<game.h*.15){foe.y+=125*pace*slow*dt;return;}
    if(!foe.warning) foe.warning={time:.72-f.chapter*.035,tx:player.x,ty:Math.max(player.y,foe.y+180),type:'dive'};
    foe.warning.time-=dt;
    if(foe.warning.time<=0){const target=foe.warning;foe.dive=Math.max(-210,Math.min(210,(target.tx-foe.x)*255/Math.max(180,target.ty-foe.y)));foe.warning=null;foe.diveActive=true;foe.castAt=game.time;}
    return;
  }
  // Ranged enemies establish a readable firing position rather than roaming
  // randomly. They leave after a finite encounter window to prevent stalls.
  if(foe.age>13+f.chapter*.6){foe.warning=null;foe.y+=180*pace*slow*dt;return;}
  const station=game.h*(.20+(f.slot%2)*.07);
  if(foe.y<station){foe.y=Math.min(station,foe.y+115*pace*slow*dt);return;}
  foe.x=foe.originX+Math.sin(foe.motionAge*1.3+foe.seed)*12;
  if(foe.warning){
    foe.warning.time-=dt;
    if(foe.warning.time<=0){
      const a=foe.warning;
      for(const spread of a.spreads) shootAt(foe,a.tx,a.ty,(foe.kind==='cultist'?235:215)*projectileSpeed,spread);
      foe.warning=null;foe.castAt=game.time;foe.shot=Math.max(1.15,1.95-Math.min(8,game.wave-1)*.04-f.chapter*.12)+Math.random()*.45;
    }
  } else if(foe.shot<=0){
    const spreads=foe.kind==='wraith'?[0]:[-.24,0,.24];
    // Later cultists cover a fixed downward lane; wraiths retain aimed shots.
    const laneShot=foe.kind==='cultist'&&f.chapter>=2&&Math.random()<.5;
    foe.warning={time:Math.max(.58,.88-f.chapter*.065),tx:laneShot?foe.x:player.x,ty:laneShot?game.h:player.y,type:'shot',spreads};
  }
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

  if (foe.formation) {
    updateFormationEnemy(foe,dt,pace,slow,projectileSpeed);
  } else if (foe.kind === "bat") {
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
    updateArchon(foe,dt,pace,slow);
  }

  if (foe.hp > 0 && foe.touch <= 0 && Math.hypot(foe.x - player.x, foe.y - player.y) < foe.r + PLAYER_HIT_RADIUS) {
    foe.touch = 0.8;
    hurtPlayer();
    if (foe.kind === "bat" || foe.kind === "imp") damageFoe(foe, foe.hp);
  }
}

function shootAt(foe, tx, ty, speed, spread) {
  if(foe.kind!=='archon' && game.shots.length>=enemyLimits().shots) return;
  if(foe.kind!=='archon') speed=Math.min(275,speed);
  const angle = Math.atan2(ty - foe.y, tx - foe.x) + spread;
  game.shots.push({
    x: foe.x,
    y: foe.y + 8,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 6 * ENEMY_PROJECTILE_SCALE,
  });
}

