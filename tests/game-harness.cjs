const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');

function createGame(seed = 1, storage = new Map()) {
  const elements = new Map();
  const listeners = {};
  function element() {
    return {
      hidden: false, children: [], dataset: {}, style: { setProperty() {} },
      classList: { toggle() {} }, textContent: '',
      replaceChildren(...children) { this.children = children; },
      setAttribute(name, value) { this[name] = value; },
      addEventListener(name, fn) { this[name] = fn; },
      querySelector() { return element(); },
      getBoundingClientRect() { return { left: 0, top: 0, width: 100 }; },
      setPointerCapture() {}, hasPointerCapture() { return true; },
      getContext() { return {}; },
    };
  }
  const math = Object.create(Math);
  math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const context = vm.createContext({
    assert, console, Math: math, Set, performance: { now: () => 0 },
    localStorage: { getItem(key) { return storage.get(key) ?? null; }, setItem(key, value) { storage.set(key, value); } },
    document: {
      getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
      createElement: element, addEventListener() {},
    },
    window: { addEventListener(name, fn) { listeners[name] = fn; } },
    requestAnimationFrame() {},
    burst() {}, tone() {}, floatText() {}, draw() {},
    ensureAudio() {}, startDrone() {}, saveBest() {}, loadBest() {}, seedField() {}, resize() {},
  });
  for (const file of ['data', 'state', 'progression', 'combat', 'game-flow', 'input']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', `${file}.js`), 'utf8'), context, { filename: `js/${file}.js` });
  }
  const run = (code) => vm.runInContext(code, context);
  run('resetRun()');
  return { run, listeners, elements, context };
}
module.exports = { createGame };
