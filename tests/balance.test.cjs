const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('./game-harness.cjs');

test('Circle 5 kill preserves overflow and presents grimoire before earned boon', () => {
  createGame().run(`
    game.wave = 5; game.completedLevels = 4; game.between = 0; game.queue = [];
    game.xp = 2600; game.xpTarget = 2700; game.score = 2600;
    addScore(320, 0, 0);
    updatePlay(1 / 120);
    assert.equal(game.xp, 300);
    assert.equal(game.state, 'upgrade');
    assert.equal(game.currentOffer.kind, 'grimoire');
    chooseUpgrade('ashen');
    assert.equal(game.xp, 300);
    assert.equal(game.currentOffer.kind, 'xp');
    assert.equal(game.player.grimoireFamily, 'ashen');
  `);
});

test('milestone leaves partial experience and its frozen target intact', () => {
  createGame().run(`
    game.wave = 5; game.between = 0; game.queue = []; game.xp = 2000; game.xpTarget = 2700;
    updatePlay(1 / 120); chooseUpgrade('stormbound');
    assert.equal(game.xp, 2000); assert.equal(game.xpTarget, 2700);
  `);
});

test('large score award queues multiple choices and keeps exact remainder', () => {
  createGame().run(`
    game.xp = 2600; game.xpTarget = 2700;
    addScore(4800, 0, 0);
    assert.equal(game.xp, 700);
    assert.equal(game.pendingRewards.length, 2);
    assert.equal(game.state, 'play');
  `);
});

test('same-step death beats final victory and cannot be healed by a gift', () => {
  createGame().run(`
    game.wave = 50; game.queue = []; game.between = 0;
    game.player.lives = 1;
    game.shots.push({ x: game.player.x, y: game.player.y, vx: 0, vy: 0, r: 9 });
    game.gifts.push({kind:'heart', x:game.player.x, y:game.player.y, vy:0, life:11});
    updatePlay(1 / 120);
    assert.equal(game.state, 'dying'); assert.equal(game.player.lives, 0);
    assert.equal(upgrades.hidden, true);
  `);
});

test('final boss score cannot leave an upgrade overlay or survival gift', () => {
  createGame().run(`
    game.wave = 50; game.queue = []; game.between = 0; game.xp = 2699;
    spawn('archon'); damageFoe(game.foes[0], 10000); updatePlay(1/120);
    assert.equal(game.state, 'over'); assert.equal(game.won, true);
    assert.equal(upgrades.hidden, true); assert.equal(game.pendingRewards.length, 0);
    assert.equal(game.gifts.length, 0); assert.ok(game.score > 0);
  `);
});

test('evolution is always offered and retains uncapped specialization choices', () => {
  createGame().run(`
    game.player.grimoire = 'ashen'; game.player.grimoireFamily = 'ashen';
    game.player.grimoireUpgradeCount = 2; game.upgradeCounts['ashen-cinders'] = 2;
    showUpgradePhase();
    assert.ok(game.currentOffer.ids.includes('evolve-infernal'));
    chooseUpgrade('evolve-infernal');
    assert.equal(game.player.grimoire, 'infernal');
    assert.ok(getAvailableUpgrades().some(u => u.id === 'ashen-cinders'));
    game.upgradeCounts['ashen-cinders'] = 3;
    assert.ok(!getAvailableUpgrades().some(u => u.id === 'ashen-cinders'));
  `);
});

test('choices reject unoffered evolutions and stale offer tokens', () => {
  createGame().run(`
    game.player.grimoire = 'ashen'; game.player.grimoireFamily = 'ashen'; showUpgradePhase();
    chooseUpgrade('evolve-thunderous'); assert.equal(game.player.grimoire, 'ashen');
    const old = game.currentOffer; game.pendingRewards.push('xp');
    chooseUpgrade(old.ids[0], old.token);
    const next = game.currentOffer;
    chooseUpgrade(next.ids[0], old.token);
    assert.equal(game.currentOffer.token, next.token);
  `);
});

test('a fully exhausted pool completes the meter without trapping play', () => {
  createGame().run(`
    game.player.grimoire = 'infernal'; game.player.grimoireFamily = 'ashen'; game.player.grimoireEvolved = true;
    for (const u of [...UPGRADE_OPTIONS, ...GRIMOIRE_UPGRADES.ashen]) game.upgradeCounts[u.id] = u.maxStacks;
    game.pendingRewards = ['xp', 'milestone']; showUpgradePhase();
    assert.equal(game.state, 'play'); assert.equal(game.pendingRewards.length, 0);
    assert.equal(game.xpExhausted, true);
    updateXpBar(); assert.equal(xpFill.style.width, '100%');
  `);
});

test('scaled damage persists through evolution and casting obeys the minimum interval', () => {
  createGame().run(`
    game.player.grimoire = 'thunderous'; game.player.grimoireFamily = 'stormbound';
    for (let i = 0; i < 3; i++) {
      UPGRADE_OPTIONS.find(u => u.id === 'arcane-edge').apply(game.player);
      GRIMOIRE_UPGRADES.stormbound[0].apply(game.player);
      UPGRADE_OPTIONS.find(u => u.id === 'quickcast').apply(game.player);
      GRIMOIRE_UPGRADES.stormbound[1].apply(game.player);
    }
    game.player.surge = 4.5; fireSpell(1/120);
    assert.ok(Math.abs(game.bullets[0].damage - 3.28) < 1e-9);
    assert.equal(spellInterval(), 0.045);
  `);
});

test('casting counts match across render frame rates', () => {
  const counts = [30, 60, 120].map(fps => {
    const g = createGame();
    return g.run(`
      game.player.grimoire = 'stormbound'; game.queue = ['bat']; game.between = 1000;
      let volleys = 0; const original = fireSpell;
      fireSpell = dt => { const n = game.bullets.length; original(dt); volleys += game.bullets.length - n; };
      for (let i = 0; i < ${fps * 10}; i++) advanceFrame(1 / ${fps});
      volleys;
    `);
  });
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, counts.join(','));
  assert.ok(counts.every(n => n >= 100 && n <= 101), counts.join(','));
});

test('stalls are capped and pause clears movement and queued Ward', () => {
  createGame().run(`
    game.between = 1000; const before = game.time;
    advanceFrame(10); assert.ok(game.time - before <= 0.100001);
    keys.add('KeyA'); pressed.add('Space'); rightClick = true;
    togglePause(); assert.equal(keys.size, 0); assert.equal(pressed.size, 0); assert.equal(rightClick, false);
    const pausedAt = game.time; advanceFrame(30); assert.equal(game.time, pausedAt);
    togglePause(); advanceFrame(1/120); assert.equal(game.player.ward, 0);
  `);
});

test('short render frames retain pending Ward until a simulation step', () => {
  createGame().run(`
    pressed.add('Space'); advanceFrame(1/240); assert.equal(game.player.ward, 0);
    advanceFrame(1/240); assert.ok(game.player.ward > 3.7);
    assert.equal(pressed.size, 0);
  `);
});

test('focus loss pauses play and digit auto-repeat cannot select another boon', () => {
  const g = createGame();
  g.listeners.blur(); assert.equal(g.run('game.state'), 'pause');
  g.run("togglePause(); showUpgradePhase(); game.pendingRewards.push('xp')");
  const event = { code: 'Digit1', repeat: false, preventDefault() {} };
  g.listeners.keydown(event);
  const token = g.run('game.currentOffer.token');
  g.listeners.keydown({ ...event, repeat: true });
  assert.equal(g.run('game.currentOffer.token'), token);
});

test('spawn caps hold a queued ranged enemy without discarding it', () => {
  createGame().run(`
    game.wave = 20; game.between = 0; game.spawnCd = 0; game.queue = ['cultist'];
    for (let i = 0; i < 6; i++) spawn('wraith');
    updatePlay(1/120); assert.equal(game.queue.length, 1); assert.equal(game.foes.length, 6);
    game.foes.pop(); updatePlay(1/120);
    assert.equal(game.queue.length, 0); assert.equal(game.foes.length, 6);
  `);
});

test('campaign queues retain bosses and total the approved regular budget', () => {
  createGame().run(`
    let count = 0;
    for(let c = 1; c <= 50; c++) {
      const queue = buildQueue(c);
      if(c % 10 === 0) assert.equal(queue.join(), 'archon'); else count += queue.length;
    }
    assert.equal(count, 1141);
    game.wave = 50; spawn('archon'); assert.equal(game.foes[0].hp, 1200);
  `);
});

test('duplicate protection and full-health hearts refresh Surge', () => {
  createGame().run(`
    game.player.aegis = true; takeGift({kind:'aegis'});
    assert.equal(game.player.aegis, true); assert.equal(game.player.surge, 4.5);
    game.player.surge = 1; game.player.lives = game.player.maxLives;
    takeGift({kind:'heart'}); assert.equal(game.player.surge, 4.5);
  `);
});

test('ice slows boss movement but does not alter its firing timer', () => {
  const positions = [false,true].map(slow => createGame().run(`
    game.wave = 10; spawn('archon'); const foe = game.foes[0];
    foe.x = 200; foe.y = 300; foe.wanderX = 400; foe.wanderY = 300; foe.wanderTimer = 10; foe.shot = 1;
    foe.slow = ${slow ? 1.6 : 0}; updateFoe(foe, 0.1);
    JSON.stringify([foe.x - 200, foe.shot]);
  `)).map(JSON.parse);
  assert.ok(Math.abs(positions[1][0] / positions[0][0] - .8) < 1e-9);
  assert.equal(positions[0][1], positions[1][1]);
});

test('grimoire abilities cast with cooldown and apply damage or debuff', () => {
  createGame().run(`
    game.player.grimoireFamily = 'ashen';
    game.player.grimoireAbilityCooldowns['ashen:ashen-nova'] = 8;
    castGrimoireAbility('ashen-nova');
    assert.equal(game.player.grimoireAbilityCooldowns['ashen:ashen-nova'], 8);
    game.player.grimoireAbilityCooldowns['ashen:ashen-nova'] = 0;
    game.foes.push({ kind: 'bat', hp: 2, maxHp: 2, x: game.player.x + 23.4, y: game.player.y - 60, originX: game.player.x + 23.4, r: 14, slow: 0, age: 0, motionAge: 0, seed: 3, dive: 0, wanderX: null, wanderY: null, wanderTimer: 0 });
    const target = game.foes[0];
    castGrimoireAbility('ashen-nova');
    for (let i = 0; i < 12; i++) updatePlay(1/120);
    assert.ok(target.hp < 0);
    game.foes.push({ kind: 'bat', hp: 2, maxHp: 2, x: game.player.x + 23.4, y: game.player.y - 60, originX: game.player.x + 23.4, r: 14, slow: 0, age: 0, motionAge: 0, seed: 3, dive: 0, wanderX: null, wanderY: null, wanderTimer: 0 });
    castGrimoireAbility('ashen-cinders');
    assert.equal(game.foes[0].slow, 1.6);
    castGrimoireAbility('ashen-cinders');
    assert.ok((game.player.grimoireAbilityCooldowns['ashen:ashen-cinders'] || 0) > 0);
  `);
});
