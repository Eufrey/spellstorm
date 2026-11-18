// Diagnostic bots use the real game scripts. They are not human playtests.
const fs = require('node:fs');
const path = require('node:path');
const { createGame } = require('../tests/game-harness.cjs');

function simulate(seed, branch, policy, protectedRun = false, fixture = null) {
  const g = createGame(seed);
  g.context.simConfig = { branch, policy, protectedRun, fixture };
  return JSON.parse(g.run(`(() => {
    const config = simConfig;
    const stats = { seed: ${seed}, branch: config.branch, policy: config.policy,
      protected: config.protectedRun, fixture: config.fixture,
      seconds: 0, circle: 1, won: false, kills: 0, escapes: 0, damageTaken: 0,
      rescues: 0, giftsSpawned: 0, giftsCollected: 0, giftsConverted: 0, giftsExpired: 0,
      boons: 0, xpBoons: 0, evolutionCircle: null, peakEnemies: 0, peakShots: 0,
      damageDelivered: 0, damageCalls: 0, score: 0, circles: [], bosses: [] };
    let active = 0, circleStart = 0, previousCircle = 1, bossStart = 0;
    const originalSpawn = spawn, originalDamage = damageFoe, originalHurt = hurtPlayer,
      originalDrop = maybeDrop, originalGift = takeGift;
    spawn = kind => { originalSpawn(kind); if(kind === 'archon') bossStart = active; };
    damageFoe = (foe, damage) => {
      const hp = foe.hp;
      originalDamage(foe, damage);
      if (hp > 0) {
        stats.damageDelivered += Math.min(hp, damage); stats.damageCalls++;
        if (foe.hp <= 0) { stats.kills++; if(foe.kind === 'archon') stats.bosses.push({circle:game.wave, seconds: +(active-bossStart).toFixed(2)}); }
      }
    };
    hurtPlayer = () => {
      const lives = game.player.lives;
      originalHurt(); stats.damageTaken += Math.max(0, lives - game.player.lives);
      if (config.protectedRun && game.player.lives <= 0) {
        stats.rescues++; game.player.lives = 1; game.state = 'play';
      }
    };
    maybeDrop = (...args) => { const before = game.gifts.length; originalDrop(...args); stats.giftsSpawned += game.gifts.length - before; };
    takeGift = gift => {
      stats.giftsCollected++;
      if ((gift.kind === 'aegis' && game.player.aegis) || (gift.kind === 'heart' && game.player.lives >= game.player.maxLives)) stats.giftsConverted++;
      originalGift(gift);
    };

    function applyFixture() {
      if (!config.fixture) return;
      game.wave = config.fixture.circle; previousCircle = game.wave;
      game.player.grimoire = config.branch; game.player.grimoireFamily = config.branch;
      const tier = config.fixture.tier;
      if (tier !== 'base') {
        game.player.grimoire = GRIMOIRES[config.branch].evolution; game.player.grimoireEvolved = true;
        for(const u of [...GRIMOIRE_UPGRADES[config.branch], ...UPGRADE_OPTIONS]) {
          const stacks = tier === 'maximum' ? u.maxStacks : 1;
          for(let i=0; i<stacks; i++) u.apply(game.player);
          game.upgradeCounts[u.id] = stacks;
        }
      }
      game.queue = buildQueue(game.wave); game.between = 0; game.spawnCd = 0;
      game.xpTarget = 1e12; // Fixtures hold a build constant.
    }

    function selectBoon() {
      const offer = game.currentOffer;
      if(offer.kind === 'grimoire') { chooseUpgrade(config.branch, offer.token); return; }
      let priorities = config.policy === 'defensive'
        ? ['vitality','ward-resonance','expanding-ward','swiftstep','arcane-edge','quickcast','stormshot']
        : ['arcane-edge','quickcast','vitality','ward-resonance','expanding-ward','stormshot','swiftstep'];
      const familyUpgrades = GRIMOIRE_UPGRADES[grimoireFamily()] || [];
      const score = id => {
        if(id.startsWith('evolve-')) return -20;
        if(config.policy === 'mixed' && game.player.lives < 3 && id === 'vitality') return -30;
        const specialty = familyUpgrades.findIndex(u => u.id === id);
        if(specialty >= 0) return (config.policy === 'defensive' ? 3 : -5) + specialty;
        return priorities.indexOf(id);
      };
      const id = [...offer.ids].sort((a,b) => score(a) - score(b))[0];
      stats.boons++; if(offer.kind === 'xp') stats.xpBoons++;
      if(id.startsWith('evolve-')) stats.evolutionCircle = game.wave;
      chooseUpgrade(id, offer.token);
    }

    function steer() {
      const p = game.player;
      const target = game.foes.filter(f => f.hp > 0 && f.y < p.y - 60)
        .sort((a,b) => (isRangedEnemy(b) || b.kind === 'archon') - (isRangedEnemy(a) || a.kind === 'archon') || b.y-a.y)[0];
      let tx = target ? target.x - 18 * PLAYER_SCALE : game.w/2;
      let ty = game.h * .72;
      const gift = game.gifts.filter(g => Math.hypot(g.x-p.x,g.y-p.y) < 200)
        .sort((a,b) => Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
      if(gift && (p.lives < 3 || !target)) { tx = gift.x; ty = gift.y; }
      let best = {x:0,y:0}, bestCost = Infinity;
      for(let dx=-1; dx<=1; dx++) for(let dy=-1; dy<=1; dy++) {
        const norm = Math.hypot(dx,dy) || 1;
        const x = Math.max(PLAYER_BOUND_X,Math.min(game.w-PLAYER_BOUND_X,p.x+dx/norm*p.moveSpeed*.18));
        const y = Math.max(PLAYER_BOUND_TOP,Math.min(game.h-PLAYER_BOUND_X,p.y+dy/norm*p.moveSpeed*.18));
        let cost = Math.abs(x-tx)*.4 + Math.abs(y-ty)*.7;
        for(const s of game.shots) {
          const dist = Math.hypot(x-s.x-s.vx*.18,y-s.y-s.vy*.18);
          cost += Math.max(0,75-dist)*12;
        }
        for(const f of game.foes) cost += Math.max(0,f.r+55-Math.hypot(x-f.x,y-f.y))*10;
        if(cost < bestCost) {bestCost=cost; best={x:dx,y:dy};}
      }
      touchMove = best;
      if(p.ward <= 0 && (game.shots.some(s=>Math.hypot(s.x-p.x,s.y-p.y)<140) || game.foes.some(f=>Math.hypot(f.x-p.x,f.y-p.y)<p.wardRadius+f.r))) pressed.add('Space');
    }

    applyFixture();
    const limit = config.fixture ? 180 : 1800;
    while(active < limit && game.state !== 'over' && game.state !== 'dying') {
      if(game.state === 'upgrade') { selectBoon(); continue; }
      steer();
      const before = new Set(game.foes);
      const oldGifts = new Set(game.gifts);
      const collectedBefore = stats.giftsCollected;
      advanceFrame(1/30); active += 1/30;
      for(const f of before) if(f.hp>0 && !game.foes.includes(f)) stats.escapes++;
      const removedGifts = [...oldGifts].filter(g=>!game.gifts.includes(g)).length;
      stats.giftsExpired += Math.max(0,removedGifts-(stats.giftsCollected-collectedBefore));
      stats.peakEnemies = Math.max(stats.peakEnemies, game.foes.length);
      stats.peakShots = Math.max(stats.peakShots, game.shots.length);
      if(game.wave !== previousCircle || game.state === 'over') {
        stats.circles.push({circle:previousCircle, seconds:+(active-circleStart).toFixed(2)});
        circleStart=active; previousCircle=game.wave;
        if(config.fixture) break;
      }
    }
    stats.seconds = +active.toFixed(2); stats.circle = game.wave; stats.won = game.won;
    stats.score = game.score; stats.xp = game.xp; stats.timedOut = active >= limit;
    stats.damageDelivered = +stats.damageDelivered.toFixed(2);
    return JSON.stringify(stats);
  })()`));
}

if (require.main === module) {
  const smoke = process.argv.includes('--smoke');
  const protectedRun = process.argv.includes('--protected');
  const fixtureMode = process.argv.includes('--fixtures');
  const seeds = smoke ? 1 : 10;
  const results = [];
  for(const branch of ['ashen','hollowWinter','stormbound']) {
    if(fixtureMode) {
      for(const circle of [1,5,9,19,29,39,49,10,20,30,40,50])
        for(const tier of ['base','evolved','maximum']) results.push(simulate(1, branch, 'mixed', true, {circle,tier}));
    } else for(const policy of (protectedRun ? ['mixed'] : ['defensive','mixed','offensive'])) {
      for(let seed=1; seed<=seeds; seed++) results.push(simulate(seed,branch,policy,protectedRun));
    }
  }
  const output = path.join(__dirname,'..','docs',`balance-${fixtureMode?'fixtures':protectedRun?'protected':'runs'}${smoke?'-smoke':''}.json`);
  fs.writeFileSync(output, JSON.stringify(results,null,2)+'\n');
  for(const branch of ['ashen','hollowWinter','stormbound']) {
    const rows=results.filter(r=>r.branch===branch);
    const mean=key=>+(rows.reduce((s,r)=>s+r[key],0)/rows.length).toFixed(2);
    console.log(JSON.stringify({branch,runs:rows.length,wins:rows.filter(r=>r.won).length,
      averageCircle:mean('circle'),averageMinutes:+(mean('seconds')/60).toFixed(2),
      averageBoons:mean('boons'),averageRescues:mean('rescues'),timeouts:rows.filter(r=>r.timedOut).length}));
  }
  console.log(`Saved ${output}`);
}
module.exports={simulate};
