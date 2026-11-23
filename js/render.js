// The city is far below the mage; only the weather moves through the sky.
const aerialScenery = Object.fromEntries(['distant-city', 'distant-clouds', 'near-clouds'].map(name => {
  const image = new Image();
  image.src = `assets/background/${name}.png`;
  return [name, image];
}));

function drawAerialClouds(name, time, speed, spacing, phase, opacity) {
  const image = aerialScenery[name];
  if (!image.complete || !image.naturalWidth) return;
  const { w, h } = game;
  // Both cloud exports occupy the upper 110 rows of their 180 x 320 frames.
  const height = h * 110 / 320;
  const period = h * spacing;
  const offset = (time * speed + phase * period) % period;
  ctx.save();
  ctx.globalAlpha *= opacity;
  for (let y = offset - period; y < h; y += period) {
    if (y + height > 0) ctx.drawImage(image, 0, 0, 180, 110, 0, y, w, height);
  }
  ctx.restore();
}

function drawBackground() {
  const { w, h } = game;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const time = reducedMotion ? 0 : game.scroll;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#100b1c");
  sky.addColorStop(0.55, "#1e142f");
  sky.addColorStop(1, "#342036");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const moonX = w * 0.81;
  const moonY = h * 0.22;
  const glow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 140);
  glow.addColorStop(0, "rgba(213, 163, 79, 0.14)");
  glow.addColorStop(1, "rgba(255, 236, 196, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 140, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9e8a78";
  ctx.beginPath();
  ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e142f";
  ctx.beginPath();
  ctx.arc(moonX + 12, moonY - 4, 22, 0, Math.PI * 2);
  ctx.fill();

  for (const star of game.stars) {
    const y = (star.y * h + time * 2 * star.z) % h;
    const twinkle = 0.13 + Math.sin(time * 1.2 + star.x * 20) * 0.07;
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = "#f4e7c8";
    ctx.fillRect(star.x * w, y, star.r, star.r);
  }
  ctx.globalAlpha = 1;

  drawAerialClouds('distant-clouds', time, h * 0.012, 0.65, 0.1, 0.65);
  drawAerialClouds('near-clouds', time, h * 0.025, 0.76, 0.45, 0.78);

  // Crop the city to its authored silhouette and anchor its base to the horizon.
  const city = aerialScenery['distant-city'];
  if (city.complete && city.naturalWidth) {
    const height = h * 37 / 320;
    ctx.drawImage(city, 0, 183, 180, 37, 0, h - height, w, height);
  }

  for (const [i, mote] of game.motes.entries()) {
    const y = (mote.y * h + time * mote.s) % h;
    const edge = mote.x < 0.5 ? mote.x * 0.45 : 1 - (1 - mote.x) * 0.45;
    const x = edge * w + Math.sin(time * 0.6 + mote.phase) * 10;
    const px = Math.round(x / 3) * 3, py = Math.round(y / 3) * 3;
    // Dim ash and broken magic flecks are smaller and quieter than hostile shots.
    ctx.fillStyle = i % 4 === 0 ? 'rgba(213,163,79,0.23)' : 'rgba(161,139,173,0.16)';
    ctx.fillRect(px, py, 3, 3);
    if (i % 4 === 0) ctx.fillRect(px + 3, py + 3, 3, 3);
  }
  ctx.restore();
}

// Authored pixel grids share a 3-unit source pixel. Transparent cells use dots.
const PIXEL_ART = {
  mage: [
    "........K.......",".......KKK......","......KVVKK.....",".....KKVVVKK....",
    "....KKVVVVVKK...","..KKKKKKKKKKKK..","...GGGGGGGGG....",".....KSSSK......",
    ".....KSKSK....G.","....KKKKKK...GLG","...KVVVVVVK...G.","...KHVHVVVK...G.",
    "..KVHGVHVVKK..G.","..KVVVHVVVVK..G.",".KKVHHVVHVVKK.G.",".KHVVVVVVVHVK.G.",
    ".KKKKGGGKKKKK.G.","...KK.....KK...."
  ],
  bat: [
    "K.............K","KK...........KK","KPKK.......KKPK","KPPPK..K..KPPPK",
    ".KPPPKKKKKPPPK.",".KHHPPKPKPPHHK.","..KPPPKPKPPPK..","...KKKLLLKKK...",
    ".....KPKPK.....","......KKK......"
  ],
  imp: [
    ".K.......K.","KHK.....KHK","KHHK...KHHK",".KHHKKKHHK.","..KRRRRRK..",
    ".KRRHRRRRK.",".KLRRRLRRK.",".KRRKRRRRK.","..KRRRRRK..",".KKRRRRRKK.",
    "KK.KRRRK.KK","...KKKKK..."
  ],
  wraith: [
    ".....KKK.....","...KKCCCKK...","..KCCCCCCHK..",".KCHKKKCHCCK.",
    ".KCKLKLKCCCK.",".KCKKKKKCCCK.","KCHCCCCCCCHCK","KCCCCCCCCCCCK",
    "KCCCHCCCCCCCK","KCCCKCCCKCCCK",".KCK.KCK.KCK.","..K...K...K.."
  ],
  cultist: [
    ".....K.....","....KVK....","...KVHVK...","..KVKKVVK..","..KVLLKVK.G",
    "..KGVVVVKGL","..KVHVVVK.G",".KVHVGVVVKG",".KVVVGVVVKG",
    "KVHVVGVHVKG","KVVVVVVVVKG","KKKKGGKKKKG"
  ],
  archon: [
    "....G..G..G....","....GGGGGGG....",".....GGGGG.....","...KKKKKKKKK...",
    "..KAVVVVVVAK..",".KAAKKKKKAAK.",".KAVKLKLKAVK.","KAAKKKKKKKAAK",
    "KAAAVGVAVAAAK","KAVVVLVVVVAK.","KAVVGGGVVVAK.","KAVVVLVVVVAK.",
    ".KAVVGVVAK..","..KAAAAAK...","...KKKKK...."
  ]
};
const PIXEL_COLORS = { K:"#100b1c", V:"#51415f", H:"#a18bad", S:"#f5d4b0", G:"#d5a34f", L:"#ffe4a0", P:"#79569d", R:"#b83d50", C:"#78b9cf", A:"#80502c" };
function drawPixelGrid(rows, unit, palette, offsetY = 0) {
  const width = Math.max(...rows.map(row => row.length));
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const cell = rows[y][x];
      if (cell === ".") continue;
      ctx.fillStyle = palette[cell] || PIXEL_COLORS[cell];
      ctx.fillRect(Math.round((x - width / 2) * unit), Math.round((y - rows.length / 2) * unit + offsetY), unit, unit);
    }
  }
}
function drawMage(x, y, color, hidden) {
  if (hidden) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(PLAYER_SCALE, PLAYER_SCALE);
  const bob = Math.round(Math.sin(game.time * 5)) * 2;
  ctx.fillStyle = "#0c091455";
  ctx.fillRect(-17, 26, 34, 4);
  if (game.player.aegis) {
    ctx.strokeStyle = "#b7f3ff";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 31, 0, Math.PI * 2); ctx.stroke();
  }
  if (game.player.invuln > 0) ctx.globalAlpha = 0.65 + Math.sin(game.time * 20) * 0.2;
  const castAge = game.time - (game.player.castAt ?? -10);
  const hurtAge = Math.max(0, .2-game.player.hurtFlash);
  const mageState = game.player.hurtFlash > 0 ? 'hurt' : castAge < .16 ? 'cast' : 'idle';
  if (!drawSprite('mage',mageState,mageState==='hurt'?hurtAge:mageState==='cast'?castAge:game.time,mageState==='hurt'?.2:mageState==='cast'?.16:0)) {
    drawPixelGrid(PIXEL_ART.mage, 3, { G:color, L:"#ffe4a0" }, -4 + bob);
  }
  if (castAge < .12) {
    ctx.fillStyle = color;
    ctx.fillRect(16,-32,4,4); ctx.fillRect(19,-38,2,2);
    ctx.fillStyle = '#fff6e8'; ctx.fillRect(17,-33,2,2);
  }
  if (game.player.surge > 0) {
    ctx.fillStyle = "#ffe4a0";
    ctx.fillRect(-19, 13, 3, 3); ctx.fillRect(18, -12, 3, 3);
  }
  ctx.restore();
}
function drawFoe(foe) {
  ctx.save();
  ctx.translate(foe.x, foe.y);
  if (foe.kind !== 'archon') {
    ctx.beginPath();
    ctx.arc(0, 0, foe.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245,104,114,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,138,135,0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.scale(ENEMY_SCALE, ENEMY_SCALE);
  const key = foeSpriteKey(foe);
  const castAge = game.time-(foe.castAt ?? -10);
  const state = foe.flash > 0 && SPRITE_SETS[key]?.hurt ? 'hurt' : castAge < .24 && SPRITE_SETS[key]?.cast ? 'cast' : 'idle';
  if (foe.flash > 0 && state !== 'hurt') ctx.filter = "brightness(1.65)";
  const loaded = drawSprite(key,state,state==='hurt'? .08-foe.flash : state==='cast'?castAge:foe.motionAge,state==='hurt'?.08:state==='cast'?.24:0,true);
  if (!loaded && foe.kind === "archon") {
    const { color, accent, model } = foe.archon;
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.arc(0, 0, 34 + i * 8, game.time * (0.6 + i * 0.2), game.time * (0.6 + i * 0.2) + 1.4); ctx.stroke();
    }
    ctx.fillStyle = accent;
    if (model === "wings") {
      for (let i = 0; i < 5; i++) { ctx.fillRect(-36+i*4,-13+i*4,5,32-i*4); ctx.fillRect(31-i*4,-13+i*4,5,32-i*4); }
    } else if (model === "horns") {
      for (let i = 0; i < 4; i++) { ctx.fillRect(-26+i*4,-34+i*4,5,18); ctx.fillRect(21-i*4,-34+i*4,5,18); }
    } else if (model === "halo") {
      ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(0,-29,17,0,Math.PI*2); ctx.stroke();
    }
    drawPixelGrid(PIXEL_ART.archon, 4, { A:accent, V:accent, G:color, L:"#fff0c0" }, -3);
  } else if (!loaded) {
    const rows = PIXEL_ART[foe.kind];
    if (rows) drawPixelGrid(rows, foe.kind === "bat" ? 3 : 2.5, {}, Math.round(Math.sin(game.time * 7 + foe.seed)) * 2);
  }
  ctx.filter = 'none';
  if ((foe.kind === 'wraith' || foe.kind === 'cultist') && foe.hp < foe.maxHp) {
    ctx.fillStyle = "#100b1c"; ctx.fillRect(-18,27,36,3);
    ctx.fillStyle = "#f56872"; ctx.fillRect(-18,27,36*Math.max(0,foe.hp/foe.maxHp),3);
  }
  ctx.restore();
}

function fitText(text, maxWidth, size) {
  const family = "'MedievalSharp', 'Pixelify Sans', monospace";
  ctx.font = `${size}px ${family}`;
  const width = ctx.measureText(text).width;
  if (width > maxWidth) {
    const fitted = Math.max(9, Math.floor((size * maxWidth) / width));
    ctx.font = `${fitted}px ${family}`;
  }
}

function draw() {
  const { w, h } = game;
  const mag = game.shake;
  const sx = mag ? (Math.random() - 0.5) * mag : 0;
  const sy = mag ? (Math.random() - 0.5) * mag : 0;
  ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);
  ctx.clearRect(0, 0, game.viewportW, game.viewportH);
  drawSidePanels();
  ctx.save();
  ctx.translate(game.offsetX, game.offsetY);
  ctx.scale(game.scale, game.scale);
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  drawBackground();
  ctx.translate(sx, sy);

  for (const gift of game.gifts) {
    const color = gift.kind === "heart" ? "#ff8aa0" : gift.kind === "surge" ? "#ffb15a" : "#9aefff";
    ctx.save();
    ctx.translate(gift.x, gift.y);
    const icon = gift.kind === "heart" ? [".LL.LL.","LLLLLLL","LLLLLLL",".LLLLL.","..LLL..","...L..."] : gift.kind === "surge" ? ["...LL","..LL.",".LL..","LLLL.","..LL.",".LL.."] : ["LLLLLLL","LCCKCCL","LCCKCCL",".LCCCL.","..LLL..","...L..."];
    ctx.fillStyle = "#100b1c"; ctx.fillRect(-12,-12,24,24);
    ctx.strokeStyle = color; ctx.strokeRect(-12,-12,24,24);
    drawPixelGrid(icon, 2.5, { L:color });
    ctx.restore();
  }

  drawDefeatedSprites();
  for (const foe of game.foes) drawFoe(foe);
  ctx.save();
  for (const shot of game.shots) {
    const r = shot.r;
    ctx.fillStyle = "#a93655"; ctx.fillRect(shot.x-r,shot.y-r/2,r*2,r);
    ctx.fillRect(shot.x-r/2,shot.y-r,r,r*2);
    ctx.fillStyle = "#ffc0aa"; ctx.fillRect(shot.x-r/3,shot.y-r/3,r*2/3,r*2/3);
  }
  for (const bolt of game.bullets) {
    const special = bolt.spell === 'ability';
    ctx.fillStyle = bolt.color;
    for (let i = 1; i <= (special ? 7 : 4); i++) {
      ctx.globalAlpha = special ? (8-i)*0.09 : (5-i)*0.13;
      const px=bolt.x-bolt.vx*i*.009, py=bolt.y-bolt.vy*i*.009;
      const size = special ? Math.max(3, bolt.r - i) : 4;
      ctx.fillRect(px-size/2,py-size/2,size,size);
    }
    ctx.globalAlpha=1;
    if (special) {
      const shape = bolt.abilityFamily === 'ashen' ? ['..L..','.LLL.','LLLLL','LHLHL','.LLL.','..L..'] : bolt.abilityFamily === 'hollowWinter' ? ['..L..','.LLL.','LLHLL','.LHL.','..L..'] : ['...LL','..LL.','.LL..','LLHL.','..LL.','.LL..','LL...'];
      ctx.save(); ctx.translate(bolt.x, bolt.y);
      ctx.rotate(Math.atan2(bolt.vx, -bolt.vy));
      drawPixelGrid(shape, bolt.abilityType === 'ultimate' ? 5 : 4, { L:bolt.color, H:'#fff6e8' });
      ctx.restore();
      continue;
    }
    const shape = bolt.spell === "ember" ? [".L.","LLL","LLL",".L.",".L."] : bolt.spell === "rime" ? [".L.","LLL",".L."] : bolt.spell === "tempest" ? ["..L",".L.","LL.",".L.","L.."] : ["L","L","L"];
    ctx.save(); ctx.translate(bolt.x,bolt.y); drawPixelGrid(shape,3,{L:bolt.color});ctx.fillStyle="#fff6e8";ctx.fillRect(-1,-3,2,4);ctx.restore();
  }
  ctx.restore();

  for (const bit of game.particles) {
    ctx.globalAlpha = Math.max(0, bit.life / bit.max);
    if (bit.ring) {
      const grown = bit.radius * (1 - bit.life / bit.max);
      ctx.strokeStyle = bit.color;
      ctx.lineWidth = bit.abilityType === 'ultimate' ? 5 : 3;
      ctx.setLineDash(bit.abilityFamily === 'hollowWinter' ? [3, 6] : bit.abilityFamily === 'stormbound' ? [13, 5, 3, 5] : [8, 5]);
      ctx.beginPath();
      ctx.arc(bit.x, bit.y, grown, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha *= 0.48;
      ctx.beginPath(); ctx.arc(bit.x,bit.y,grown*0.8,0,Math.PI*2);ctx.stroke();
      if (bit.abilityFamily) {
        ctx.fillStyle = bit.color;
        for (let i = 0; i < 12; i++) {
          const angle = i * Math.PI / 6 + (1 - bit.life / bit.max) * 0.4;
          const x = bit.x + Math.cos(angle) * grown, y = bit.y + Math.sin(angle) * grown;
          ctx.fillRect(Math.round(x / 3) * 3, Math.round(y / 3) * 3, 6, 6);
        }
      }
    } else {
      ctx.fillStyle = bit.color;
      const size = Math.max(2, Math.round(bit.size));
      ctx.fillRect(Math.round(bit.x),Math.round(bit.y),size,size);
    }
  }
  ctx.globalAlpha = 1;

  if (game.player && game.state !== "menu") {
    const hidden = game.state === "dying" || game.state === "over";
    drawMage(game.player.x, game.player.y, GRIMOIRES[game.player.grimoire].color, hidden && game.dying < 0.8);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4e7c8";
  ctx.font = "18px 'Pixelify Sans', monospace";
  for (const text of game.floaters) {
    ctx.globalAlpha = Math.max(0, text.life / 0.8);
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
  }
  ctx.globalAlpha = 1;

  if (game.banner.life > 0 && game.state !== "menu") {
    ctx.globalAlpha = Math.min(1, game.banner.life);
    ctx.fillStyle = "#f0c56a";
    fitText(game.banner.text, w - 48, 34);
    ctx.fillText(game.banner.text, w / 2, h * 0.34);
    ctx.fillStyle = "#f4e7c8";
    fitText(game.banner.sub, w - 48, 13);
    ctx.fillText(game.banner.sub, w / 2, h * 0.34 + 26);
    ctx.globalAlpha = 1;
  }

  if (game.hint > 0 && game.state === "play") {
    ctx.globalAlpha = Math.min(1, game.hint);
    ctx.fillStyle = "rgba(244, 231, 200, 0.8)";
    ctx.font = "12px 'Pixelify Sans', monospace";
    ctx.globalAlpha = 1;
  }

  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

