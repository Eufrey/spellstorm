const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame } = require('./game-harness.cjs');
test('finish then return to menu clears the run and hides combat panels', () => {
  const {run,elements} = createGame();
  run('game.score=100; game.wave=5; finish(false); returnToMenu()');
  assert.equal(run('game.state'),'menu'); assert.equal(run('game.player'),null);
  assert.equal(elements.get('menu').hidden,false); assert.equal(elements.get('over').hidden,true); assert.equal(elements.get('hud').hidden,true);
  run('startGame()'); assert.equal(run('game.state'),'play'); assert.equal(run('game.score'),0);
});
