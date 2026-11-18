const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");
const menu = document.getElementById("menu");
const paused = document.getElementById("paused");
const over = document.getElementById("over");
const scoreEl = document.getElementById("score");
const circleEl = document.getElementById("circle");
const comboEl = document.getElementById("combo");
const livesEl = document.getElementById("lives");
const spellNameEl = document.getElementById("spell-name");
const spellHintEl = document.getElementById("spell-hint");
const wardFill = document.getElementById("ward-fill");
const bestMenu = document.getElementById("best-menu");
const bestOver = document.getElementById("best-over");
const finalScore = document.getElementById("final-score");
const overTitle = document.getElementById("over-title");
const bossHud = document.getElementById("boss-hud");
const bossName = document.getElementById("boss-name");
const bossHealthFill = document.getElementById("boss-health-fill");
const upgrades = document.getElementById("upgrades");
const upgradeChoices = document.getElementById("upgrade-choices");
const touchPad = document.getElementById("touch-pad");
const touchKnob = touchPad.querySelector("span");
const wardButton = document.getElementById("ward-button");
const abilities = document.getElementById("abilities");
const mobileControls = document.getElementById("mobile-controls");
const xpBar = document.getElementById("xp-bar");
const xpFill = document.getElementById("xp-fill");

const LOGICAL_WIDTH = 540;
const LOGICAL_HEIGHT = 960;
const PLAYER_SCALE = 1.3;
const ENEMY_SCALE = 1.5;
const ENEMY_PROJECTILE_SCALE = 1.5;
const ENEMY_PROJECTILE_SPEED = 0.9;
const ENEMY_MAX_PACE = 1.75;
const ENEMY_MAX_PROJECTILE_SPEED = 1.45;
const ENEMY_MAX_STAT_TIER = 4;
const ENEMY_MAX_SCORE_MULTIPLIER = 2.1;
const PLAYER_BOUND_X = 28 * PLAYER_SCALE;
const PLAYER_BOUND_TOP = 36 * PLAYER_SCALE;
const PLAYER_HIT_RADIUS = 12 * PLAYER_SCALE;
const keys = new Set();
const pressed = new Set();
let rightClick = false;
let touchMove = null;

const audio = { ctx: null, drone: [] };

const game = {
  w: LOGICAL_WIDTH,
  h: LOGICAL_HEIGHT,
  viewportW: 0,
  viewportH: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  dpr: 1,
  state: "menu",
  time: 0,
  scroll: 0,
  stars: [],
  spires: [],
  motes: [],
  player: null,
  bullets: [],
  foes: [],
  shots: [],
  gifts: [],
  particles: [],
  floaters: [],
  queue: [],
  spawnCd: 0,
  between: 0,
  wave: 1,
  reinforcements: 0,
  reinforcementCd: BALANCE.reinforcementInterval,
  completedLevels: 0,
  xp: 0,
  xpTarget: BALANCE.firstXpTarget,
  xpExhausted: false,
  pendingRewards: [],
  currentOffer: null,
  offerSerial: 0,
  accumulator: 0,
  upgradeCounts: {},
  score: 0,
  combo: 0,
  comboTimer: 0,
  shake: 0,
  banner: { text: "", sub: "", life: 0 },
  dying: 0,
  hint: 0,
  best: 0,
  won: false,
};

