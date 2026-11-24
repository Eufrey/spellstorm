const { test } = require('node:test');
const { createGame } = require('./game-harness.cjs');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

test('randomized campaign introduces enemy roles in order and increases pressure', () => {
  createGame().run(`
    for(let wave=1;wave<50;wave++){
      if(wave%10===0) continue;
      const queue=buildQueue(wave);
      assert.equal(queue.length,regularCount(wave));
      for(const entry of queue){
        assert.ok(entry.lane>0 && entry.lane<1);
        if(wave===1) assert.equal(entry.kind,'bat');
        if(wave<3) assert.notEqual(entry.kind,'wraith');
        if(wave<4) assert.notEqual(entry.kind,'cultist');
      }
      const duration=queue.slice(0,-1).reduce((sum,entry)=>sum+entry.delay,0);
      assert.ok(wave<10 ? duration>=11.29 && duration<=13.71 : duration>=15.39 && duration<=21.11);
    }
    assert.notEqual(JSON.stringify(buildQueue(25)),JSON.stringify(buildQueue(25)));
    assert.ok(regularCount(49)>regularCount(9));
    assert.ok(enemyLimits(49).ordinary>enemyLimits(9).ordinary);
    game.wave=9;const early=enemyHealthMultiplier();game.wave=49;
    assert.ok(enemyHealthMultiplier()>early);assert.ok(enemyProjectileSpeed()<=1.12);
  `);
});

test('prototype opening steadily increases density, health and movement without speeding up shots excessively', () => {
  createGame().run(`
    let previous=0, previousPace=0, previousHealth=0;
    for(let wave=1;wave<=9;wave++){
      game.wave=wave;
      assert.ok(regularCount(wave)>previous);
      assert.ok(enemyPace()>previousPace && enemyHealthMultiplier()>previousHealth);
      previous=regularCount(wave);previousPace=enemyPace();previousHealth=enemyHealthMultiplier();
      const queue=buildQueue(wave);
      spawn(queue[0]);assert.equal(game.foes.at(-1).y,-28);
      assert.ok(enemyProjectileSpeed()<.85);
    }
    assert.equal(regularCount(1),16);assert.equal(regularCount(9),28);
    assert.ok(regularCount(11)>=regularCount(9));
    assert.ok(enemyLimits(11).ordinary>=enemyLimits(9).ordinary);
  `);
});

test('shot guide toggle updates its accessible state and survives a run restart', () => {
  const storage=new Map(), g=createGame(1,storage);
  g.run(`
    assert.equal(shotGuidesEnabled,true);
    shotGuidesButton.click();
    assert.equal(shotGuidesEnabled,false);
    assert.equal(shotGuidesButton.textContent,'Shot guides: off');
    assert.equal(shotGuidesButton['aria-pressed'],'false');
    resetRun();assert.equal(shotGuidesEnabled,false);
  `);
  assert.equal(storage.get('spellstorm-shot-guides'),'off');
  const reloaded=createGame(1,storage);
  reloaded.run(`assert.equal(shotGuidesEnabled,false);shotGuidesButton.click();assert.equal(shotGuidesEnabled,true);`);
  assert.equal(storage.get('spellstorm-shot-guides'),'on');
});

test('disabling guides hides trajectory lines but retains the warning ring', () => {
  const g=createGame();
  g.context.Image=class {};
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/render.js'),'utf8'),g.context);
  g.run(`
    let lines=0,rings=0;
    Object.assign(ctx,{save(){},restore(){},setLineDash(){},beginPath(){},stroke(){},arc(){rings++},moveTo(){},lineTo(){lines++}});
    spawn('wraith');game.foes[0].warning={type:'shot',tx:200,ty:600,spreads:[0]};
    drawFormationWarnings();assert.equal(lines,1);assert.equal(rings,1);
    shotGuidesButton.click();drawFormationWarnings();assert.equal(lines,1);assert.equal(rings,2);
  `);
});

test('regular enemy volleys respect the projectile cap and speed ceiling', () => {
  createGame().run(`
    game.wave=49;spawn('cultist');const foe=game.foes[0];
    for(let i=0;i<100;i++) shootAt(foe,270,800,800,0);
    assert.equal(game.shots.length,enemyLimits().shots);
    assert.ok(game.shots.every(s=>Math.hypot(s.vx,s.vy)<=275.001));
  `);
});

test('formation ranged attacks warn, lock the aim, and release only after the warning', () => {
  createGame().run(`
    game.wave=22;const entry=buildQueue(22).find(entry=>entry.kind==='wraith');spawn(entry);
    const foe=game.foes[0];foe.y=game.h*.4;foe.shot=0;game.shots=[];
    updateFoe(foe,.01);assert.ok(foe.warning);assert.equal(game.shots.length,0);
    const target=foe.warning.tx;game.player.x+=90;updateFoe(foe,.1);
    assert.equal(foe.warning.tx,target);assert.equal(game.shots.length,0);
    foe.warning.time=.001;updateFoe(foe,.01);assert.equal(game.shots.length,1);
    assert.equal(foe.warning,null);
  `);
});
