// The city is far below the mage; only the weather moves through the sky.
const aerialScenery = Object.fromEntries(['distant-city', 'distant-clouds', 'near-clouds'].map(name => {
  const image = new Image();
  image.src = `assets/background/${name}.png`;
  return [name, image];
}));

const spellSheets = new Map();
function loadSpellSheet(name) {
  if (!spellSheets.has(name)) {
    const image = new Image();
    image.src = `assets/grimoire/ss-${name}-sheet.png`;
    spellSheets.set(name, image);
  }
  return spellSheets.get(name);
}
// Decode the small effects before the first cast instead of waiting for combat.
for (const element of ['fire', 'ice', 'lightning']) {
  for (const tier of ['base', 'evolved']) {
    for (const effect of ['projectile', 'trail', 'cast', 'impact']) loadSpellSheet(`${element}-${effect}-${tier}`);
  }
}
for (const effect of ['cinders-ring', 'infernal-pyre-ring', 'deep-rime-ring', 'sovereign-hail-ring', 'static-ring', 'stormbreaker-ring', 'ward-cast', 'aegis-activate', 'aegis-break', 'surge-activate', 'archon-arrival', 'boon-select']) loadSpellSheet(effect);

function drawSpellArt(name, x, y, size, progress, angle = 0, anchorX = 32) {
  const image = loadSpellSheet(name);
  if (!image.complete || !image.naturalWidth) return false;
  const frame = Math.max(0, Math.min(5, Math.floor(progress * 6)));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, frame * 64, 0, 64, 64, -size * anchorX / 64, -size/2, size, size);
  ctx.restore();
  return true;
}

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
  if (castAge < .16) {
    const art = spellArt(game.player.grimoire);
    if (!art || !drawSpellArt(`${art.element}-cast-${art.tier}`, 18, -36, 36, castAge / .16)) {
      ctx.fillStyle = color;
      ctx.fillRect(16,-36,4,4); ctx.fillRect(19,-42,2,2);
      ctx.fillStyle = '#fff6e8'; ctx.fillRect(17,-37,2,2);
    }
  }
  if (game.player.surge > 0) {
    const remaining = game.player.surge / BALANCE.surgeDuration;
    ctx.globalAlpha = 1;
    const phase = game.time * 3;
    for(let i=0;i<6;i++) {
      const angle = phase + i*Math.PI/3;
      ctx.fillStyle = i%2 ? '#ffb15a' : '#ffe4a0';
      ctx.fillRect(Math.round(Math.cos(angle)*35),Math.round(Math.sin(angle)*35),3,3);
    }
    // A small gold resource strip follows the mage on both control layouts.
    ctx.fillStyle = '#100b1c'; ctx.fillRect(-20,34,40,5);
    ctx.fillStyle = '#ffb15a'; ctx.fillRect(-19,35,38*Math.min(1,remaining),3);
    ctx.strokeStyle = '#e8be72'; ctx.lineWidth = 1; ctx.strokeRect(-20,34,40,5);
  }
  ctx.restore();
}
function drawFoe(foe) {
  if (foe.kind === 'archon' && foe.age < .9 && foe.y >= 0) {
    drawSpellArt('archon-arrival', foe.x, foe.y, 160, foe.age / .9);
  }
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
  if (foe.slow > 0) {
    const radius = foe.r / ENEMY_SCALE + 5;
    ctx.strokeStyle = foe.slowColor || '#8eebff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = foe.slowColor || '#8eebff';
    // Small downward chevrons indicate movement is reduced.
    for (const offset of [-5, 5]) {
      ctx.fillRect(offset-3, radius+2, 2, 2);
      ctx.fillRect(offset+1, radius+2, 2, 2);
      ctx.fillRect(offset-1, radius+4, 2, 2);
    }
  }
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

function drawArchonWarnings() {
  for (const foe of game.foes) {
    const a = foe.kind === 'archon' && foe.hp > 0 && foe.attack;
    if (!a) continue;
    const warning = a.stage === 'warning';
    const progress = warning ? 1 - Math.max(0,a.time/a.duration) : 1;
    ctx.save();
    ctx.strokeStyle = warning ? '#ffb56c' : '#ff8c79';
    ctx.fillStyle = warning ? `rgba(255,115,90,${.065+progress*.09})` : 'rgba(255,115,90,.22)';
    ctx.lineWidth = warning ? 2 : 3;
    ctx.setLineDash(warning ? [8,6] : []);
    for(const z of a.zones){ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();ctx.stroke();}
    for(const lane of a.lanes){ctx.fillRect(lane.x,0,lane.w,game.h);ctx.strokeRect(lane.x+1,0,lane.w-2,game.h);}
    if(warning){
      if(a.type==='aim'){
        const angle=Math.atan2(a.ty-a.y,a.tx-a.x);
        const count=foe.phase===2?5:3;
        for(let i=0;i<count;i++){const ray=angle+(i-(count-1)/2)*.16;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+Math.cos(ray)*game.h*1.5,a.y+Math.sin(ray)*game.h*1.5);ctx.stroke();}
        ctx.beginPath();ctx.arc(a.tx,a.ty,16,0,Math.PI*2);ctx.stroke();
      }
      for(const angle of a.rays){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+Math.cos(angle)*game.h,a.y+Math.sin(angle)*game.h);ctx.stroke();}
      for(const shot of a.shots){ctx.beginPath();ctx.moveTo(0,shot.y);ctx.lineTo(game.w,shot.y);ctx.stroke();}
      if(a.batches){
        for(const [index,batch] of a.batches.slice(0,2).entries()){
          ctx.globalAlpha=index===0?.85:.24;
          for(const shot of batch){ctx.beginPath();ctx.moveTo(shot.x,shot.y);ctx.lineTo(shot.x+Math.cos(shot.angle)*game.h,shot.y+Math.sin(shot.angle)*game.h);ctx.stroke();}
        }
        ctx.globalAlpha=1;
      }
    }
    if(!warning && a.batches && a.batchIndex<a.batches.length){
      ctx.globalAlpha=.35;ctx.setLineDash([8,6]);
      for(const shot of a.batches[a.batchIndex]){ctx.beginPath();ctx.moveTo(shot.x,shot.y);ctx.lineTo(shot.x+Math.cos(shot.angle)*game.h,shot.y+Math.sin(shot.angle)*game.h);ctx.stroke();}
      ctx.globalAlpha=1;
    }
    ctx.setLineDash([]);
    if(warning){
      const label=ARCHON_ATTACK_NAMES[a.type];
      ctx.font="600 22px 'Pixelify Sans', monospace";ctx.textAlign='center';ctx.textBaseline='middle';
      const width=ctx.measureText(label).width+32;
      const y=Math.max(110,foe.y-foe.r-24);
      ctx.fillStyle='#130d1dec';ctx.fillRect(game.w/2-width/2,y-17,width,34);
      ctx.fillStyle='#ffd39a';ctx.fillText(label,game.w/2,y);
      ctx.fillStyle='#f0b56b';ctx.fillRect(game.w/2-width/2,y+17,width*progress,2);
    }
    ctx.restore();
  }
}

function drawFormationWarnings() {
  ctx.save();
  ctx.strokeStyle='#ffae77'; ctx.lineWidth=1.5;ctx.setLineDash([6,7]);
  for(const foe of game.foes){
    const a=foe.warning;
    if(!a||foe.hp<=0) continue;
    const y=foe.y+8;
    ctx.globalAlpha=.65;
    ctx.beginPath();ctx.arc(foe.x,foe.y,foe.r+5,0,Math.PI*2);ctx.stroke();
    if(!shotGuidesEnabled) continue;
    if(a.type==='dive'){
      const slope=Math.max(-210,Math.min(210,(a.tx-foe.x)*255/Math.max(180,a.ty-foe.y)))/255;
      ctx.beginPath();ctx.moveTo(foe.x,foe.y);ctx.lineTo(foe.x+slope*game.h,foe.y+game.h);ctx.stroke();
    } else {
      for(const spread of a.spreads){const angle=Math.atan2(a.ty-foe.y,a.tx-foe.x)+spread;ctx.beginPath();ctx.moveTo(foe.x,y);ctx.lineTo(foe.x+Math.cos(angle)*game.h,y+Math.sin(angle)*game.h);ctx.stroke();}
    }
  }
  ctx.restore();
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
  drawArchonWarnings();
  drawFormationWarnings();

  for (const gift of game.gifts) {
    const color = gift.kind === "heart" ? "#ff8aa0" : gift.kind === "surge" ? "#ffb15a" : "#9aefff";
    ctx.save();
    ctx.translate(gift.x, gift.y);
    const icon = gift.kind === "heart" ? [".LL.LL.","LLLLLLL","LLLLLLL",".LLLLL.","..LLL..","...L..."] : gift.kind === "surge" ? ["...LL","..LL.",".LL..","LLLL.","..LL.",".LL.."] : ["LLLLLLL","LCCKCCL","LCCKCCL",".LCCCL.","..LLL..","...L..."];
    const pulse = .5 + .5*Math.sin(game.time*5 + gift.x*.03);
    ctx.globalAlpha = .16 + pulse*.09;
    ctx.fillStyle = color; ctx.fillRect(-17,-17,34,34);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#100b1c'; ctx.fillRect(-13,-13,26,26);
    ctx.strokeStyle = color; ctx.lineWidth=1.5; ctx.strokeRect(-13,-13,26,26);
    ctx.fillStyle = color;
    for(const [x,y] of [[-15,-15],[12,-15],[-15,12],[12,12]]) ctx.fillRect(x,y,3,3);
    drawPixelGrid(icon, 2.5, { L:color });
    ctx.restore();
  }

  drawDefeatedSprites();
  for (const foe of game.foes) drawFoe(foe);
  ctx.save();
  for (const bolt of game.bullets) {
    const special = bolt.spell === 'ability';
    if (bolt.art) {
      const { element, tier } = bolt.art;
      const phase = (Math.max(0, game.time - bolt.born) * 5) % 1;
      const angle = Math.atan2(bolt.vy, bolt.vx);
      const size = special ? (bolt.abilityType === 'ultimate' ? 64 : 52) : (tier === 'evolved' ? 46 : 40);
      const projectile = `${element}-projectile-${tier}`;
      const sprite = loadSpellSheet(projectile);
      if (sprite.complete && sprite.naturalWidth) {
        // The exported art faces right. Anchor the luminous fire core to the hitbox;
        // ice and lightning are centered, and all trails sit behind the projectile.
        const anchor = element === 'fire' ? 38 : 32;
        const trailDistance = size * .48;
        ctx.globalAlpha = .55;
        drawSpellArt(`${element}-trail-${tier}`, bolt.x-Math.cos(angle)*trailDistance, bolt.y-Math.sin(angle)*trailDistance, size, phase, angle);
        ctx.globalAlpha = 1;
        if (drawSpellArt(projectile, bolt.x, bolt.y, size, phase, angle, anchor)) continue;
      }
    }
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
    const remaining = Math.max(0, bit.life / bit.max);
    if (bit.abilityType === 'debuff') {
      const elapsed = bit.max - bit.life;
      const alpha = Math.min(1, remaining * 4);
      ctx.save();
      ctx.globalAlpha = .10 * alpha;
      ctx.fillStyle = bit.color;
      ctx.beginPath();ctx.arc(bit.x,bit.y,bit.radius,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha = .9 * alpha;
      ctx.strokeStyle = bit.color;ctx.lineWidth = 2.5;
      ctx.setLineDash([10,6]);
      ctx.beginPath();ctx.arc(bit.x,bit.y,bit.radius,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = .65 * alpha;
      ctx.beginPath();ctx.arc(bit.x,bit.y,bit.radius * (.35 + .65 * ((elapsed * 1.6) % 1)),0,Math.PI*2);ctx.stroke();
      if(elapsed < .52) drawSpellArt(bit.effect,bit.x,bit.y,bit.radius*64/28,elapsed/.52);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = bit.color;
      for(let i=0;i<12;i++) {
        const angle = i*Math.PI/6 + elapsed*.7;
        ctx.fillRect(Math.round(bit.x+Math.cos(angle)*bit.radius)-2,Math.round(bit.y+Math.sin(angle)*bit.radius)-2,4,4);
      }
      ctx.restore();
      continue;
    }
    ctx.globalAlpha = bit.effect ? Math.min(1, remaining / .32) : remaining;
    // Final ring artwork occupies roughly 56 of 64 source pixels. Scale to the
    // gameplay radius, so the visible perimeter matches the actual ability reach.
    if (bit.effect && drawSpellArt(bit.effect, bit.x, bit.y, bit.ring ? bit.radius * 64 / 28 : bit.size, 1 - remaining)) continue;
    if (bit.effect && !bit.ring) continue;
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

  // Enemy hazards always remain visible over spell effects and impact flashes.
  for (const shot of game.shots) {
    const r = shot.r;
    ctx.fillStyle = "#a93655"; ctx.fillRect(shot.x-r,shot.y-r/2,r*2,r);
    ctx.fillRect(shot.x-r/2,shot.y-r,r,r*2);
    ctx.fillStyle = "#ffc0aa"; ctx.fillRect(shot.x-r/3,shot.y-r/3,r*2/3,r*2/3);
  }

  if (game.player && game.state !== "menu") {
    const hidden = game.state === "dying" || game.state === "over";
    drawMage(game.player.x, game.player.y, GRIMOIRES[game.player.grimoire].color, hidden && game.dying < 0.8);
  }

  if (game.state === 'upgrade' && game.rewardGather > 0 && game.player) {
    const p = 1 - game.rewardGather / game.rewardGatherDuration;
    const {x, y} = game.player;
    ctx.save();
    ctx.fillStyle = `rgba(12,8,24,${p * .35})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = Math.min(1, p * 5) * (1 - p * .3);
    drawSpellArt('boon-select', x, y, game.currentOffer?.kind === 'grimoire' ? 150 : 112, p);
    for (let i = 0; i < 14; i++) {
      const angle = i * Math.PI * 2 / 14 + p * .7;
      const radius = (1 - p) * (88 + (i % 3) * 24) + 12;
      ctx.fillStyle = i % 3 ? '#e5bb73' : '#fff2c4';
      ctx.fillRect(Math.round(x + Math.cos(angle) * radius), Math.round(y + Math.sin(angle) * radius), 3, 3);
    }
    ctx.restore();
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

  if (game.banner.life > 0 && game.state === "play") {
    ctx.save();
    const y = h * .27;
    const fade = Math.min(1, game.banner.life / .45);
    ctx.globalAlpha = fade;
    const shade = ctx.createLinearGradient(0, 0, w, 0);
    shade.addColorStop(0, 'rgba(10,6,18,0)');
    shade.addColorStop(.22, 'rgba(16,10,25,.91)');
    shade.addColorStop(.78, 'rgba(16,10,25,.91)');
    shade.addColorStop(1, 'rgba(10,6,18,0)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, y - 45, w, 102);
    ctx.fillStyle = '#d9ab655e';
    ctx.fillRect(w * .19, y - 45, w * .62, 1);
    ctx.fillRect(w * .19, y + 56, w * .62, 1);
    ctx.fillStyle = '#f5d495';
    const title = /^Circle \d+$/.test(game.banner.text) ? `Circle ${String(game.wave).padStart(2, '0')}` : game.banner.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fitText(title, w - 80, 42);
    ctx.fillText(title, w / 2, y - 5);
    ctx.fillStyle = '#dfcddd';
    fitText(game.banner.sub, w - 88, 18);
    ctx.fillText(game.banner.sub, w / 2, y + 30);
    ctx.restore();
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

