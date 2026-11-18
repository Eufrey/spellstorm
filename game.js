// Load the classic-script modules in dependency order. Shared game state remains
// in the global lexical scope; load each script only once and in this sequence.
const gameModules = [
  "data.js",
  "state.js",
  "viewport.js",
  "audio-effects.js",
  "progression.js",
  "combat.js",
  "game-flow.js",
  "render.js",
  "input.js",
];
const gameModuleBase = new URL("./js/", document.currentScript.src);
let gameModuleIndex = 0;

function loadNextGameModule() {
  if (gameModuleIndex >= gameModules.length) return;
  const moduleScript = document.createElement("script");
  moduleScript.src = new URL(gameModules[gameModuleIndex++], gameModuleBase);
  moduleScript.async = false;
  moduleScript.onload = loadNextGameModule;
  moduleScript.onerror = () => console.error(`Unable to load Spellstorm module: ${moduleScript.src}`);
  document.body.appendChild(moduleScript);
}

loadNextGameModule();
