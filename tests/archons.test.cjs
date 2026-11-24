const { test } = require('node:test');
const { createGame } = require('./game-harness.cjs');

test('each Archon advertises its own attacks before releasing them', () => {
  createGame().run(`
    for (const [index, expected] of [['fan','aim'],['emberfall','cinder'],['curtain','mark'],['lanes','sweep'],['ruin','shatter','breaker','ruin']].entries()) {
      game.wave=(index+1)*10; game.foes=[]; game.shots=[]; spawn('archon');
      const boss=game.foes[0]; boss.x=270; boss.y=200;
      for(const type of expected){
        prepareArchonAttack(boss);
        assert.equal(boss.attack.type,type); assert.equal(boss.attack.stage,'warning');
        assert.ok(boss.attack.duration>=.72);
        boss.attack.time=.001; updateArchon(boss,.01,1,1);
        assert.equal(boss.attack.stage,'release');
      }
    }
  `);
});

test('half-health transition clears hazards and final boss unlocks repeated lanes and closing crown', () => {
  createGame().run(`
    game.wave=50; spawn('archon'); const boss=game.foes[0]; boss.x=270; boss.y=200;
    prepareArchonAttack(boss); game.shots.push({x:20,y:20}); boss.hp=boss.maxHp/2;
    updateArchon(boss,.01,1,1);
    assert.equal(boss.phase,2); assert.equal(boss.attack,null); assert.equal(game.shots.length,0); assert.ok(boss.shot>1);
    boss.attackIndex=2; prepareArchonAttack(boss); assert.equal(boss.attack.type,'breaker');
    const safe=boss.attack.safe; game.player.x=(safe+.5)*game.w/3;
    const lives=game.player.lives; releaseArchonAttack(boss,boss.attack); assert.equal(game.player.lives,lives);
    boss.attack.time=0; updateArchon(boss,.01,1,1); assert.equal(boss.attack.stage,'warning'); assert.equal(boss.attack.repeat,true);
    boss.attack=null; prepareArchonAttack(boss); assert.equal(boss.attack.type,'crown'); assert.equal(boss.attack.safe,1);
  `);
});

test('marked danger deals damage at release only; leaving the zone avoids damage', () => {
  createGame().run(`
    game.wave=20; spawn('archon'); const boss=game.foes[0]; boss.x=270; boss.y=200;
    prepareArchonAttack(boss); const a=boss.attack; const lives=game.player.lives;
    updateArchon(boss,.1,1,1); assert.equal(game.player.lives,lives);
    game.player.x=a.zones[0].x-120; releaseArchonAttack(boss,a); assert.equal(game.player.lives,lives);
    boss.attackIndex=0; prepareArchonAttack(boss); releaseArchonAttack(boss,boss.attack); assert.equal(game.player.lives,lives-1);
  `);
});

test('all Archons have escalating health, cannot skip phase two, and report accurate HUD health', () => {
  createGame().run(`
    let previous=0;
    for(let circle=10;circle<=50;circle+=10){
      game.wave=circle;game.foes=[];spawn('archon');const boss=game.foes[0];
      assert.ok(boss.maxHp>previous);previous=boss.maxHp;
      syncBossHud();assert.equal(bossHud.hidden,false);assert.equal(bossHealthFill.style.width,'100%');
      damageFoe(boss,boss.maxHp*2);assert.equal(boss.hp,boss.maxHp/2);
      damageFoe(boss,boss.maxHp);assert.equal(boss.hp,boss.maxHp/2);
      updateArchon(boss,.01,1,1);syncBossHud();
      assert.equal(bossHud.dataset.phase,'2');assert.equal(bossHealthFill.style.width,'50%');
      assert.equal(document.getElementById('boss-health-text').textContent,'50%');
      damageFoe(boss,boss.maxHp);assert.equal(boss.hp,boss.maxHp/2);
      updateArchon(boss,.66,1,1);damageFoe(boss,boss.maxHp/4);syncBossHud();
      assert.equal(bossHealthFill.style.width,'25%');
      damageFoe(boss,boss.maxHp);syncBossHud();assert.equal(bossHud.hidden,true);
    }
  `);
});

test('Vaelith retains prior projectiles during ordinary warnings and phase two increases volley density', () => {
  createGame().run(`
    game.wave=10;spawn('archon');const boss=game.foes[0];boss.y=200;
    prepareArchonAttack(boss);const first=boss.attack.rays.length;releaseArchonAttack(boss,boss.attack);
    const shots=game.shots.length;prepareArchonAttack(boss);assert.equal(game.shots.length,shots);
    boss.phase=2;boss.attackIndex=0;prepareArchonAttack(boss);assert.ok(boss.attack.rays.length>first);
  `);
});

test('every Archon has staggered projectile patterns, with increasing phase-two pressure', () => {
  createGame().run(`
    for(let circle=10;circle<=50;circle+=10){
      game.wave=circle;game.foes=[];game.shots=[];spawn('archon');const boss=game.foes[0];boss.y=200;
      for(const type of ['rain','crossfire','spiral']){
        boss.phase=1;boss.attackIndex=ARCHON_PATTERNS[boss.archonIndex].indexOf(type);prepareArchonAttack(boss);
        const a=boss.attack;assert.equal(a.type,type);assert.ok(a.batches.length>=2);
        assert.ok(a.batches.every(batch=>batch.length>=5));
        game.shots=[];releaseArchonAttack(boss,a);assert.equal(game.shots.length,a.batches[0].length);
        a.time=.001;updateArchon(boss,.01,1,1);assert.equal(a.batchIndex,2);
        assert.equal(game.shots.length,a.batches[0].length+a.batches[1].length);
        boss.phase=2;boss.attackIndex=ARCHON_PATTERNS[boss.archonIndex].indexOf(type);prepareArchonAttack(boss);
        assert.ok(boss.attack.batches.length>a.batches.length);
        assert.ok(boss.attack.batchInterval<a.batchInterval);
      }
    }
  `);
});

test('Ward clears nearby Archon projectiles but later batches still release', () => {
  createGame().run(`
    game.wave=10; spawn('archon');const boss=game.foes[0];boss.y=200;
    boss.attackIndex=ARCHON_PATTERNS[0].indexOf('rain');prepareArchonAttack(boss);releaseArchonAttack(boss,boss.attack);
    const a=boss.attack;game.shots.forEach(s=>{s.x=game.player.x;s.y=game.player.y-60;});
    castWard();assert.equal(game.shots.length,0);assert.ok(game.player.ward>0);
    a.time=.001;updateArchon(boss,.01,1,1);assert.ok(game.shots.length>0);
  `);
});
