const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createGame} = require('./game-harness.cjs');
const root = path.join(__dirname,'..');

test('all exported sprite animation frames load from the manifest and render without smoothing', () => {
  const images = [], draws = [];
  class Image {
    set src(url) {
      this.url=url;
      const bytes=fs.readFileSync(path.join(root,url));
      this.naturalWidth=bytes.readUInt32BE(16);
      this.naturalHeight=bytes.readUInt32BE(20);
      this.complete=true;
      images.push(this);
    }
  }
  const ctx={drawImage:(...args)=>draws.push(args),imageSmoothingEnabled:true};
  const context=vm.createContext({Image,ctx});
  vm.runInContext(fs.readFileSync(path.join(root,'js/sprites.js'),'utf8'),context);
  assert.equal(images.length,108);
  for(const [key, state] of [['mage','cast'],['bat','idle'],['imp','cast'],['wraith','defeat'],['cultist','cast'],['vaelith','hurt'],['mordrath','idle'],['elyndra','defeat'],['tharos','cast'],['aurex','defeat']]) {
    assert.equal(vm.runInContext(`drawSprite('${key}','${state}',.15,.3)`,context),true);
  }
  assert.equal(ctx.imageSmoothingEnabled,false);
  assert.equal(draws.length,10);
  assert.match(draws.at(-1)[0].url,/aurex_defeat_04/);
});

test('defeat animation is recorded once and does not leave a live enemy', () => {
  const {run}=createGame();
  run('spawn("bat"); damageFoe(game.foes[0], 100); damageFoe(game.foes[0], 100)');
  assert.equal(run('game.defeatedSprites.length'),1);
  assert.equal(run('game.foes[0].hp <= 0'),true);
  run('game.time += 1; updateParticles(0.016)');
  assert.equal(run('game.defeatedSprites.length'),0);
});
