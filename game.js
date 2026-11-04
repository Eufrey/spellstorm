const SPELLS = {
  ember: {
    name: "Ember",
    hint: "Twin lances",
    color: "#ff6a2a",
    cooldown: 0.16,
    damage: 2,
  },
  rime: {
    name: "Rime",
    hint: "A freezing fan",
    color: "#8eebff",
    cooldown: 0.24,
    damage: 1,
  },
  tempest: {
    name: "Tempest",
    hint: "Piercing needles",
    color: "#d2b6ff",
    cooldown: 0.08,
    damage: 1,
  },
};

const SPELL_ORDER = ["ember", "rime", "tempest"];

const ENEMIES = {
  bat: { hp: 2, speed: 150, score: 70, radius: 14 },
  imp: { hp: 4, speed: 70, score: 120, radius: 16 },
  wraith: { hp: 8, speed: 48, score: 200, radius: 20 },
  cultist: { hp: 10, speed: 36, score: 260, radius: 18 },
  archon: { hp: 120, speed: 28, score: 2800, radius: 46 },
};

const LINES = [
  "The bats stir under the moon",
  "Imps catch the scent of ash",
  "Wraiths slip their graves",
  "Cultists raise black staves",
  "The veil wears thin",
];

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

const keys = new Set();
const pressed = new Set();
let rightClick = false;

const audio = { ctx: null, drone: [] };

const game = {
  w: 960,
  h: 640,
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
  score: 0,
  combo: 0,
  comboTimer: 0,
  shake: 0,
  banner: { text: "", sub: "", life: 0 },
  dying: 0,
  hint: 0,
  best: 0,
};

function loadBest() {
  try {
    game.best = Number(localStorage.getItem("spellstorm-best") || 0);
  } catch {
    game.best = 0;
  }
  bestMenu.textContent = game.best ? `Best vigil: ${game.best}` : "";
}

function saveBest() {
  if (game.score <= game.best) return;
  game.best = game.score;
  try {
    localStorage.setItem("spellstorm-best", String(game.best));
  } catch {
    /* private mode */
  }
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  game.w = window.innerWidth;
  game.h = window.innerHeight;
  canvas.width = Math.floor(game.w * dpr);
  canvas.height = Math.floor(game.h * dpr);
  canvas.style.width = `${game.w}px`;
  canvas.style.height = `${game.h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function seedField() {
  game.stars = Array.from({ length: 90 }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.25 + Math.random() * 1.2,
    r: Math.random() * 1.6 + 0.4,
  }));
  game.spires = Array.from({ length: 14 }, () => ({
    x: Math.random(),
    y: Math.random(),
    w: 28 + Math.random() * 50,
    h: 90 + Math.random() * 180,
    speed: 12 + Math.random() * 22,
    shade: 8 + Math.floor(Math.random() * 18),
  }));
  game.motes = Array.from({ length: 24 }, () => ({
    x: Math.random(),
    y: Math.random(),
    s: 16 + Math.random() * 30,
    phase: Math.random() * Math.PI * 2,
  }));
}

function ensureAudio() {
  if (!audio.ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio.ctx = new Ctx();
  }
  if (audio.ctx.state === "suspended") audio.ctx.resume();
  return audio.ctx;
}

function tone(freq, dur, type, vol, slide) {
  const actx = ensureAudio();
  if (!actx) return;
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, actx.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), actx.currentTime + dur);
  gain.gain.setValueAtTime(vol, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.start();
  osc.stop(actx.currentTime + dur);
}

function startDrone() {
  const actx = ensureAudio();
  if (!actx || audio.drone.length) return;
  [110, 164.81, 220].forEach((freq, i) => {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = i === 0 ? 0.015 : 0.008;
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    audio.drone.push(osc);
  });
}

function burst(x, y, color, count, speed) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (0.35 + Math.random());
    game.particles.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 0.35 + Math.random() * 0.45,
      max: 0.8,
      color,
      size: 1.5 + Math.random() * 2.4,
    });
  }
}

function floatText(x, y, text, color) {
  game.floaters.push({ x, y, text, color, life: 0.8 });
}

function makePlayer() {
  return {
    x: game.w / 2,
    y: game.h * 0.78,
    spell: "ember",
    cool: 0,
    ward: 0,
    lives: 3,
    invuln: 0,
    surge: 0,
    aegis: false,
    hurtFlash: 0,
  };
}

function resetRun() {
  game.player = makePlayer();
  game.bullets = [];
  game.foes = [];
  game.shots = [];
  game.gifts = [];
  game.particles = [];
  game.floaters = [];
  game.wave = 1;
  game.score = 0;
  game.combo = 0;
  game.comboTimer = 0;
  game.shake = 0;
  game.dying = 0;
  game.hint = 7;
  game.queue = buildQueue(1);
  game.spawnCd = 0.4;
  game.between = 1.35;
  game.banner = { text: "Circle 1", sub: LINES[0], life: 2.2 };
  game.state = "play";
}

function buildQueue(wave) {
  if (wave % 5 === 0) return ["archon"];
  const count = 6 + wave * 2;
  const queue = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    if (wave >= 4 && roll > 0.86) queue.push("cultist");
    else if (wave >= 3 && roll > 0.66) queue.push("wraith");
    else if (wave >= 2 && roll > 0.42) queue.push("imp");
    else queue.push("bat");
  }
  return queue;
}

function spawn(kind) {
  const spec = ENEMIES[kind];
  const margin = kind === "archon" ? 80 : 36;
  const foe = {
    kind,
    x: kind === "archon" ? game.w / 2 : margin + Math.random() * (game.w - margin * 2),
    y: kind === "archon" ? -60 : -28,
    hp: kind === "archon" ? 90 + game.wave * 12 : spec.hp,
    maxHp: kind === "archon" ? 90 + game.wave * 12 : spec.hp,
    r: spec.radius,
    age: 0,
    seed: Math.random() * 10,
    originX: 0,
    slow: 0,
    flash: 0,
    touch: 0,
    shot: 0.6 + Math.random() * 0.6,
    dive: 0,
  };
  foe.originX = foe.x;
  game.foes.push(foe);
}

function maybeDrop(x, y, generous) {
  const roll = Math.random();
  const heartCut = generous ? 0.34 : 0.08;
  const surgeCut = heartCut + (generous ? 0.4 : 0.12);
  const aegisCut = surgeCut + (generous ? 0.26 : 0.1);
  let kind = null;
  if (roll < heartCut && game.player.lives < 5) kind = "heart";
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
  floatText(x, y - 16, `+${gained}`, "#f0c56a");
}

function hurtPlayer() {
  const player = game.player;
  if (player.invuln > 0 || game.state !== "play") return;
  game.combo = 0;
  game.shake = 12;
  player.hurtFlash = 0.2;
  if (player.aegis) {
    player.aegis = false;
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

function castWard() {
  const player = game.player;
  if (player.ward > 0 || game.state !== "play") return;
  player.ward = 3.1;
  game.shake = 6;
  tone(180, 0.35, "sawtooth", 0.04, 80);
  tone(440, 0.22, "triangle", 0.04, 880);
  const radius = 168;
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
    radius,
  });
}

function damageFoe(foe, amount) {
  if (foe.hp <= 0) return;
  foe.hp -= amount;
  foe.flash = 0.08;
  if (foe.hp > 0) return;
  const spec = ENEMIES[foe.kind];
  burst(foe.x, foe.y, foe.kind === "archon" ? "#f0c56a" : "#e7d4ff", foe.kind === "archon" ? 48 : 14, 160);
  tone(foe.kind === "archon" ? 90 : 320, foe.kind === "archon" ? 0.4 : 0.08, "square", 0.03, 180);
  addScore(spec.score, foe.x, foe.y);
  if (foe.kind === "archon") game.shake = 16;
  maybeDrop(foe.x, foe.y, foe.kind === "archon" || foe.kind === "cultist");
}

function fireSpell(dt) {
  const player = game.player;
  player.cool -= dt;
  if (player.cool > 0) return;
  const spell = SPELLS[player.spell];
  const rate = player.surge > 0 ? 0.62 : 1;
  player.cool = spell.cooldown * rate;
  const originY = player.y - 36;
  const make = (angle, speed, damage, extra) => {
    const bolt = {
      x: player.x + 18,
      y: originY,
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      damage,
      color: spell.color,
      spell: player.spell,
      life: 1.3,
      r: player.spell === "tempest" ? 4 : 6,
      hit: new Set(),
      pierce: player.spell === "tempest",
    };
    Object.assign(bolt, extra);
    game.bullets.push(bolt);
  };
  if (player.spell === "ember") {
    make(-0.08, 620, spell.damage);
    make(0.08, 620, spell.damage);
  } else if (player.spell === "rime") {
    make(-0.28, 460, spell.damage);
    make(0, 480, spell.damage);
    make(0.28, 460, spell.damage);
  } else {
    make((Math.random() - 0.5) * 0.12, 740, spell.damage);
  }
  if (game.time % 0.16 < dt) tone(player.spell === "rime" ? 680 : 520, 0.04, "square", 0.012);
}

function slowOf(foe) {
  return foe.slow > 0 ? 0.42 : 1;
}

function updateFoe(foe, dt) {
  const player = game.player;
  const spec = ENEMIES[foe.kind];
  const slow = slowOf(foe);
  foe.age += dt;
  foe.slow = Math.max(0, foe.slow - dt);
  foe.flash = Math.max(0, foe.flash - dt);
  foe.touch = Math.max(0, foe.touch - dt);
  foe.shot -= dt;

  if (foe.kind === "bat") {
    foe.y += spec.speed * slow * dt;
    foe.x = foe.originX + Math.sin(foe.age * 3.2 + foe.seed) * 78;
  } else if (foe.kind === "imp") {
    if (foe.age < 0.9) {
      foe.y += 50 * slow * dt;
      foe.x += Math.sign(player.x - foe.x) * 110 * slow * dt;
    } else {
      if (!foe.dive) foe.dive = Math.max(-220, Math.min(220, (player.x - foe.x) * 1.4));
      foe.y += 280 * slow * dt;
      foe.x += foe.dive * slow * dt;
    }
  } else if (foe.kind === "wraith") {
    const hover = game.h * 0.42;
    foe.y += (foe.y < hover ? spec.speed : 8) * slow * dt;
    foe.x += Math.sin(foe.age * 1.3 + foe.seed) * 40 * dt;
    if (foe.shot <= 0 && foe.y > 20) {
      foe.shot = 1.55;
      shootAt(foe, player.x, player.y, 230, 0);
    }
  } else if (foe.kind === "cultist") {
    const station = 120 + (foe.seed % 1) * 70;
    if (foe.y < station) foe.y += spec.speed * slow * dt;
    foe.x += Math.sin(foe.age * 0.9 + foe.seed) * 70 * dt;
    if (foe.shot <= 0 && foe.y >= station - 4) {
      foe.shot = 1.35;
      shootAt(foe, player.x, player.y, 250, -0.22);
      shootAt(foe, player.x, player.y, 250, 0);
      shootAt(foe, player.x, player.y, 250, 0.22);
    }
  } else {
    const top = 118;
    if (foe.y < top) foe.y += 70 * dt;
    else foe.x += Math.sin(foe.age * 0.7) * 120 * dt;
    foe.x = Math.max(70, Math.min(game.w - 70, foe.x));
    const pattern = Math.floor(foe.age / 3.2) % 3;
    if (foe.y >= top - 2 && foe.shot <= 0) {
      if (pattern === 0) {
        foe.shot = 0.32;
        shootAt(foe, player.x, player.y, 260, 0);
      } else if (pattern === 1) {
        foe.shot = 0.9;
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12 + foe.age;
          game.shots.push({
            x: foe.x,
            y: foe.y,
            vx: Math.cos(angle) * 150,
            vy: Math.sin(angle) * 150,
            r: 6,
          });
        }
      } else {
        foe.shot = 0.09;
        const angle = foe.age * 5;
        game.shots.push({
          x: foe.x,
          y: foe.y,
          vx: Math.cos(angle) * 190,
          vy: Math.sin(angle) * 190,
          r: 5,
        });
      }
    }
  }

  if (foe.hp > 0 && foe.touch <= 0 && Math.hypot(foe.x - player.x, foe.y - player.y) < foe.r + 12) {
    foe.touch = 0.8;
    hurtPlayer();
    if (foe.kind === "bat" || foe.kind === "imp") damageFoe(foe, foe.hp);
  }
}

function shootAt(foe, tx, ty, speed, spread) {
  const angle = Math.atan2(ty - foe.y, tx - foe.x) + spread;
  game.shots.push({
    x: foe.x,
    y: foe.y + 8,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r: 6,
  });
}

function updatePlay(dt) {
  const player = game.player;
  game.banner.life -= dt;
  game.hint = Math.max(0, game.hint - dt);
  game.comboTimer -= dt;
  if (game.comboTimer <= 0) game.combo = 0;
  if (game.between > 0) game.between -= dt;

  let dx = 0;
  let dy = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) dx -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) dx += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) dy -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) dy += 1;
  if (dx || dy) {
    const len = Math.hypot(dx, dy) || 1;
    player.x += (dx / len) * 340 * dt;
    player.y += (dy / len) * 340 * dt;
  }
  player.x = Math.max(28, Math.min(game.w - 28, player.x));
  player.y = Math.max(36, Math.min(game.h - 28, player.y));
  player.invuln = Math.max(0, player.invuln - dt);
  player.ward = Math.max(0, player.ward - dt);
  player.surge = Math.max(0, player.surge - dt);
  player.hurtFlash = Math.max(0, player.hurtFlash - dt);

  if (pressed.has("Digit1")) player.spell = "ember";
  if (pressed.has("Digit2")) player.spell = "rime";
  if (pressed.has("Digit3")) player.spell = "tempest";
  if (pressed.has("KeyQ")) {
    const index = SPELL_ORDER.indexOf(player.spell);
    player.spell = SPELL_ORDER[(index + SPELL_ORDER.length - 1) % SPELL_ORDER.length];
  }
  if (pressed.has("KeyE")) {
    const index = SPELL_ORDER.indexOf(player.spell);
    player.spell = SPELL_ORDER[(index + 1) % SPELL_ORDER.length];
  }
  if (pressed.has("Space") || rightClick) castWard();

  fireSpell(dt);

  if (game.between <= 0 && game.queue.length) {
    game.spawnCd -= dt;
    if (game.spawnCd <= 0) {
      const kind = game.queue.shift();
      spawn(kind);
      game.spawnCd = kind === "archon" ? 1 : Math.max(0.28, 0.82 - game.wave * 0.03);
    }
  }

  for (const bolt of game.bullets) {
    bolt.x += bolt.vx * dt;
    bolt.y += bolt.vy * dt;
    bolt.life -= dt;
  }
  game.bullets = game.bullets.filter(
    (bolt) => bolt.life > 0 && bolt.y > -40 && bolt.x > -40 && bolt.x < game.w + 40
  );

  for (const foe of game.foes) updateFoe(foe, dt);

  for (const bolt of game.bullets) {
    for (const foe of game.foes) {
      if (foe.hp <= 0 || bolt.hit.has(foe)) continue;
      if (Math.hypot(bolt.x - foe.x, bolt.y - foe.y) < foe.r + bolt.r) {
        bolt.hit.add(foe);
        if (bolt.spell === "rime") foe.slow = 1.6;
        damageFoe(foe, bolt.damage);
        burst(bolt.x, bolt.y, bolt.color, 5, 80);
        if (!bolt.pierce) bolt.life = 0;
      }
    }
  }
  game.bullets = game.bullets.filter((bolt) => bolt.life > 0);
  game.foes = game.foes.filter((foe) => foe.hp > 0 && foe.y < game.h + 80);

  for (const shot of game.shots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    if (Math.hypot(shot.x - player.x, shot.y - player.y) < shot.r + 12) {
      shot.dead = true;
      hurtPlayer();
    }
  }
  game.shots = game.shots.filter(
    (shot) => !shot.dead && shot.x > -30 && shot.x < game.w + 30 && shot.y > -30 && shot.y < game.h + 30
  );

  for (const gift of game.gifts) {
    const dist = Math.hypot(gift.x - player.x, gift.y - player.y);
    if (dist < 90 && dist > 1) {
      gift.x += ((player.x - gift.x) / dist) * 220 * dt;
      gift.y += ((player.y - gift.y) / dist) * 220 * dt;
    } else if (dist >= 90) {
      gift.y += gift.vy * dt;
    }
    gift.life -= dt;
    if (dist < 22) {
      gift.life = 0;
      takeGift(gift);
    }
  }
  game.gifts = game.gifts.filter((gift) => gift.life > 0 && gift.y < game.h + 40);

  if (game.queue.length === 0 && game.foes.length === 0 && game.between <= 0) {
    game.wave += 1;
    game.queue = buildQueue(game.wave);
    game.between = 1.6;
    game.spawnCd = 0.3;
    const boss = game.wave % 5 === 0;
    game.banner = {
      text: boss ? "An Archon descends" : `Circle ${game.wave}`,
      sub: boss ? "Break the crown" : LINES[(game.wave - 1) % LINES.length],
      life: 2.3,
    };
  }
}

function takeGift(gift) {
  const player = game.player;
  tone(660, 0.12, "triangle", 0.04, 990);
  if (gift.kind === "heart") {
    player.lives = Math.min(5, player.lives + 1);
    floatText(player.x, player.y - 30, "Vitality", "#ff8aa0");
  } else if (gift.kind === "surge") {
    player.surge = 6.5;
    floatText(player.x, player.y - 30, "Surge", "#ffb15a");
  } else {
    player.aegis = true;
    floatText(player.x, player.y - 30, "Aegis", "#b7f3ff");
  }
}

function updateParticles(dt) {
  for (const bit of game.particles) {
    bit.life -= dt;
    bit.x += bit.vx * dt;
    bit.y += bit.vy * dt;
  }
  game.particles = game.particles.filter((bit) => bit.life > 0);
  for (const text of game.floaters) {
    text.life -= dt;
    text.y -= 28 * dt;
  }
  game.floaters = game.floaters.filter((text) => text.life > 0);
}

function update(dt) {
  game.time += dt;
  game.scroll += dt;
  game.shake = Math.max(0, game.shake - dt * 22);
  if (game.state === "menu" || game.state === "pause" || game.state === "over") return;
  if (game.state === "dying") {
    game.dying -= dt;
    updateParticles(dt);
    if (game.dying <= 0) finish();
    return;
  }
  updatePlay(dt);
  updateParticles(dt);
}

function finish() {
  game.state = "over";
  saveBest();
  finalScore.textContent = String(game.score);
  bestOver.textContent = `Best vigil: ${game.best}`;
  over.hidden = false;
  hud.hidden = true;
}

function syncHud() {
  if (game.state === "menu" || game.state === "over") return;
  const spell = SPELLS[game.player.spell];
  scoreEl.textContent = String(game.score);
  circleEl.textContent = game.wave % 5 === 0 ? `Circle ${game.wave} · Archon` : `Circle ${game.wave}`;
  comboEl.textContent = game.combo >= 2 ? `Chain ×${(1 + Math.min(game.combo, 8) * 0.25).toFixed(2)}` : "";
  livesEl.textContent = "♥ ".repeat(Math.max(0, game.player.lives)).trim();
  spellNameEl.textContent = game.player.surge > 0 ? `${spell.name} surge` : spell.name;
  spellNameEl.style.color = spell.color;
  spellHintEl.textContent = spell.hint;
  const ready = game.player.ward <= 0;
  wardFill.style.width = ready ? "100%" : `${(1 - game.player.ward / 3.1) * 100}%`;
}

function showPause(on) {
  paused.hidden = !on;
  hud.hidden = on || game.state === "menu" || game.state === "over";
}

function startGame() {
  ensureAudio();
  startDrone();
  resetRun();
  menu.hidden = true;
  over.hidden = true;
  paused.hidden = true;
  hud.hidden = false;
}

function togglePause() {
  if (game.state === "play") {
    game.state = "pause";
    showPause(true);
  } else if (game.state === "pause") {
    game.state = "play";
    showPause(false);
  }
}

function drawBackground() {
  const { w, h } = game;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#140824");
  sky.addColorStop(0.55, "#241242");
  sky.addColorStop(1, "#3a1a38");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const moonX = w * 0.78;
  const moonY = h * 0.16;
  const glow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 140);
  glow.addColorStop(0, "rgba(255, 236, 196, 0.35)");
  glow.addColorStop(1, "rgba(255, 236, 196, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 140, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6e7c1";
  ctx.beginPath();
  ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241242";
  ctx.beginPath();
  ctx.arc(moonX + 12, moonY - 4, 22, 0, Math.PI * 2);
  ctx.fill();

  for (const star of game.stars) {
    const y = (star.y * h + game.scroll * 18 * star.z) % h;
    const twinkle = 0.35 + Math.sin(game.time * 2 + star.x * 20) * 0.25;
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = "#f4e7c8";
    ctx.fillRect(star.x * w, y, star.r, star.r);
  }
  ctx.globalAlpha = 1;

  for (const spire of game.spires) {
    const y = ((spire.y * (h + 240) + game.scroll * spire.speed) % (h + 240)) - 120;
    const x = spire.x * w;
    ctx.fillStyle = `rgb(${spire.shade}, ${spire.shade - 4}, ${spire.shade + 16})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + spire.w * 0.5, y - spire.h);
    ctx.lineTo(x + spire.w, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(240, 197, 106, 0.35)";
    for (let i = 0; i < 3; i++) {
      const wy = y - 24 - i * (spire.h / 5);
      if (wy < y - spire.h + 16) continue;
      ctx.fillRect(x + spire.w * 0.42, wy, 4, 10);
    }
  }

  for (const mote of game.motes) {
    const y = (mote.y * h + game.scroll * mote.s) % h;
    const x = mote.x * w + Math.sin(game.time + mote.phase) * 16;
    ctx.fillStyle = "rgba(180, 140, 255, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 8, mote.phase, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMage(x, y, color, hidden) {
  if (hidden) return;
  ctx.save();
  ctx.translate(x, y);
  if (game.player.invuln > 0) ctx.globalAlpha = 0.45 + Math.sin(game.time * 28) * 0.25;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (game.player.aegis) {
    ctx.strokeStyle = "rgba(183, 243, 255, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 30 + Math.sin(game.time * 4) * 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#2a1a4a";
  ctx.beginPath();
  ctx.moveTo(-14, -2);
  ctx.quadraticCurveTo(0, 10, 16, 6);
  ctx.lineTo(20, 22);
  ctx.lineTo(-18, 22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#f0d2b4";
  ctx.beginPath();
  ctx.arc(0, -10, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1b1230";
  ctx.beginPath();
  ctx.moveTo(-16, -12);
  ctx.lineTo(16, -12);
  ctx.lineTo(11, -16);
  ctx.lineTo(-11, -16);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -16);
  ctx.lineTo(0, -36);
  ctx.lineTo(8, -16);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillRect(-4, -21, 8, 3);

  ctx.strokeStyle = "#d9c39a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(12, 18);
  ctx.lineTo(20, -16);
  ctx.stroke();
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(21, -20, 5.2 + Math.sin(game.time * 6) * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFoe(foe) {
  ctx.save();
  ctx.translate(foe.x, foe.y);
  ctx.fillStyle = "rgba(255, 196, 140, 0.16)";
  ctx.beginPath();
  ctx.arc(0, 0, foe.r + 10, 0, Math.PI * 2);
  ctx.fill();
  if (foe.flash > 0) ctx.filter = "brightness(2.4)";
  if (foe.kind === "bat") {
    const flap = Math.sin(game.time * 18 + foe.seed) * 8;
    ctx.fillStyle = "#8d74c4";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-16, flap, -22, 6);
    ctx.quadraticCurveTo(-8, 4, 0, 0);
    ctx.quadraticCurveTo(8, 4, 22, 6);
    ctx.quadraticCurveTo(16, flap, 0, 0);
    ctx.fill();
    ctx.fillStyle = "#6a3a86";
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (foe.kind === "imp") {
    ctx.fillStyle = "#c4472f";
    ctx.beginPath();
    ctx.arc(0, 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-12, -14);
    ctx.lineTo(-2, -6);
    ctx.moveTo(8, -4);
    ctx.lineTo(12, -14);
    ctx.lineTo(2, -6);
    ctx.fill();
    ctx.fillStyle = "#ffd7a1";
    ctx.fillRect(-3, 0, 2, 2);
    ctx.fillRect(2, 0, 2, 2);
  } else if (foe.kind === "wraith") {
    const tatter = Math.sin(game.time * 3 + foe.seed) * 4;
    ctx.fillStyle = "rgba(196, 214, 255, 0.82)";
    ctx.beginPath();
    ctx.moveTo(-14, 16 + tatter);
    ctx.lineTo(-12, -8);
    ctx.quadraticCurveTo(0, -22, 12, -8);
    ctx.lineTo(14, 16 - tatter);
    ctx.quadraticCurveTo(0, 8, -14, 16 + tatter);
    ctx.fill();
    ctx.fillStyle = "#1a1430";
    ctx.beginPath();
    ctx.ellipse(0, -6, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (foe.kind === "cultist") {
    ctx.fillStyle = "#3a1848";
    ctx.beginPath();
    ctx.moveTo(-12, 16);
    ctx.lineTo(-8, -12);
    ctx.lineTo(8, -12);
    ctx.lineTo(12, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f0c56a";
    ctx.beginPath();
    ctx.arc(0, -14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1a1020";
    ctx.beginPath();
    ctx.moveTo(-3, -14);
    ctx.lineTo(3, -14);
    ctx.moveTo(0, -17);
    ctx.lineTo(0, -11);
    ctx.stroke();
  } else {
    ctx.strokeStyle = "rgba(240, 197, 106, 0.7)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 34 + i * 8, game.time * (0.6 + i * 0.2), game.time * (0.6 + i * 0.2) + 1.4);
      ctx.stroke();
    }
    ctx.fillStyle = "#241030";
    ctx.beginPath();
    ctx.moveTo(-26, 20);
    ctx.lineTo(-16, -16);
    ctx.lineTo(0, -28);
    ctx.lineTo(16, -16);
    ctx.lineTo(26, 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f0c56a";
    ctx.beginPath();
    ctx.moveTo(-10, -26);
    ctx.lineTo(0, -44);
    ctx.lineTo(10, -26);
    ctx.fill();
    const ratio = foe.hp / foe.maxHp;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(-24, 28, 48, 5);
    ctx.fillStyle = "#f0c56a";
    ctx.fillRect(-24, 28, 48 * Math.max(0, ratio), 5);
  }
  ctx.restore();
}

function draw() {
  const { w, h } = game;
  const mag = game.shake;
  const sx = mag ? (Math.random() - 0.5) * mag : 0;
  const sy = mag ? (Math.random() - 0.5) * mag : 0;
  ctx.save();
  ctx.translate(sx, sy);
  drawBackground();

  for (const gift of game.gifts) {
    const color = gift.kind === "heart" ? "#ff8aa0" : gift.kind === "surge" ? "#ffb15a" : "#9aefff";
    ctx.save();
    ctx.translate(gift.x, gift.y);
    ctx.rotate(game.time * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 9);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const shot of game.shots) {
    ctx.fillStyle = "rgba(196, 120, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const bolt of game.bullets) {
    ctx.strokeStyle = bolt.color;
    ctx.lineWidth = bolt.spell === "tempest" ? 2 : 4;
    ctx.beginPath();
    ctx.moveTo(bolt.x, bolt.y);
    ctx.lineTo(bolt.x - bolt.vx * 0.03, bolt.y - bolt.vy * 0.03);
    ctx.stroke();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath();
    ctx.arc(bolt.x, bolt.y, bolt.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const foe of game.foes) drawFoe(foe);

  for (const bit of game.particles) {
    ctx.globalAlpha = Math.max(0, bit.life / bit.max);
    if (bit.ring) {
      const grown = bit.radius * (1 - bit.life / bit.max);
      ctx.strokeStyle = bit.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bit.x, bit.y, grown, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = bit.color;
      ctx.beginPath();
      ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  if (game.player && game.state !== "menu") {
    const hidden = game.state === "dying" || game.state === "over";
    drawMage(game.player.x, game.player.y, SPELLS[game.player.spell].color, hidden && game.dying < 0.8);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4e7c8";
  ctx.font = "22px Palatino, Palatino Linotype, Georgia, serif";
  for (const text of game.floaters) {
    ctx.globalAlpha = Math.max(0, text.life / 0.8);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
  }
  ctx.globalAlpha = 1;

  if (game.banner.life > 0 && game.state !== "menu") {
    ctx.globalAlpha = Math.min(1, game.banner.life);
    ctx.fillStyle = "#f0c56a";
    ctx.font = "42px Palatino, Palatino Linotype, Georgia, serif";
    ctx.fillText(game.banner.text, w / 2, h * 0.34);
    ctx.fillStyle = "#f4e7c8";
    ctx.font = "16px Segoe UI, sans-serif";
    ctx.fillText(game.banner.sub, w / 2, h * 0.34 + 28);
    ctx.globalAlpha = 1;
  }

  if (game.hint > 0 && game.state === "play") {
    ctx.globalAlpha = Math.min(1, game.hint);
    ctx.fillStyle = "rgba(244, 231, 200, 0.8)";
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText("Spells loose themselves   ·   Space casts a ward", w / 2, h - 28);
    ctx.globalAlpha = 1;
  }

  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  draw();
  if (game.state === "play" || game.state === "pause" || game.state === "dying") syncHud();
  pressed.clear();
  rightClick = false;
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  const block = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (game.state === "play" && block.includes(event.code)) event.preventDefault();
  if (!keys.has(event.code)) pressed.add(event.code);
  keys.add(event.code);
  if (event.code === "Enter" && (game.state === "menu" || game.state === "over")) startGame();
  if (event.code === "Escape") togglePause();
  if (event.code === "Enter" && game.state === "pause") togglePause();
});

window.addEventListener("keyup", (event) => keys.delete(event.code));

window.addEventListener("mousedown", (event) => {
  if (event.button === 2) rightClick = true;
});

window.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("blur", () => keys.clear());
window.addEventListener("resize", resize);
document.getElementById("start").addEventListener("click", startGame);
document.getElementById("again").addEventListener("click", startGame);
document.getElementById("resume").addEventListener("click", togglePause);

loadBest();
seedField();
resize();
requestAnimationFrame(frame);
