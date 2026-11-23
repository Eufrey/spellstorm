// Figma exports: native-size PNG frames, kept aligned at a constant anchor.
const SPRITE_SETS = {
  mage: { prefix:'last_mage', scale:2, idle:['idle',4], cast:['cast',3], hurt:['damage',2] },
  bat: { prefix:'bat', scale:1.5, idle:['flap',4], defeat:['defeat',2] },
  imp: { prefix:'ember_imp', scale:1.5, idle:['move',4], cast:['attack',2], defeat:['defeat',2] },
  wraith: { prefix:'veil_wraith', scale:1.5, idle:['float',4], cast:['attack',2], defeat:['dissolve',3] },
  cultist: { prefix:'cultist', scale:1.5, idle:['float',4], cast:['cast',3], defeat:['defeat',2] },
  vaelith: { prefix:'vaelith', scale:1.3, idle:['idle',4], cast:['attack',3], hurt:['damage',2], defeat:['defeat',4] },
  mordrath: { prefix:'mordrath', scale:1.3, idle:['idle',4], cast:['attack',3], hurt:['damage',2], defeat:['defeat',4] },
  elyndra: { prefix:'elyndra', scale:1.3, idle:['idle',4], cast:['attack',3], hurt:['damage',2], defeat:['dissolve',4] },
  tharos: { prefix:'tharos', scale:1.3, idle:['idle',4], cast:['attack',3], hurt:['damage',2], defeat:['defeat',4] },
  aurex: { prefix:'aurex', scale:1.3, idle:['idle',4], cast:['attack',3], hurt:['damage',2], defeat:['defeat',6] },
};
const spriteImages = new Map();
const enemyOutlines = new WeakMap();
function enemyOutline(image) {
  if (enemyOutlines.has(image)) return enemyOutlines.get(image);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth + 2;
  canvas.height = image.naturalHeight + 2;
  const mask = canvas.getContext('2d');
  mask.imageSmoothingEnabled = false;
  for (const [x,y] of [[0,1],[2,1],[1,0],[1,2]]) mask.drawImage(image,x,y);
  mask.globalCompositeOperation = 'source-in';
  mask.fillStyle = '#ff8a87';
  mask.fillRect(0,0,canvas.width,canvas.height);
  enemyOutlines.set(image,canvas);
  return canvas;
}
for (const set of Object.values(SPRITE_SETS)) {
  for (const state of ['idle','cast','hurt','defeat']) {
    if (!set[state]) continue;
    const [sequence,count] = set[state];
    for (let i=1;i<=count;i++) {
      const name = `spellstorm_${set.prefix}_${sequence}_${String(i).padStart(2,'0')}.png`;
      const img = new Image();
      spriteImages.set(name,img);
      img.src = `assets/sprites/${name}`;
    }
  }
}
function foeSpriteKey(foe) {
  return foe.kind === 'archon' ? foe.archon.name.split(',')[0].toLowerCase() : foe.kind;
}
function drawSprite(key,state,age,duration,outline=false) {
  const set = SPRITE_SETS[key];
  if (!set) return false;
  if (!set[state]) state = 'idle';
  const [sequence,count] = set[state];
  const index = duration ? Math.min(count-1,Math.floor(Math.max(0,age)/duration*count)) : Math.floor(Math.max(0,age)*(key==='bat'?12:6))%count;
  const image = spriteImages.get(`spellstorm_${set.prefix}_${sequence}_${String(index+1).padStart(2,'0')}.png`);
  if (!image || !image.complete || !image.naturalWidth) return false;
  const width = image.naturalWidth*set.scale, height = image.naturalHeight*set.scale;
  ctx.imageSmoothingEnabled = false;
  if (outline) {
    const mask = enemyOutline(image);
    ctx.save();
    ctx.globalAlpha *= 0.55;
    const edge = set.scale * 0.6;
    ctx.drawImage(mask,-width/2-edge,-height/2-edge,width+2*edge,height+2*edge);
    ctx.restore();
  }
  ctx.drawImage(image, -width/2, -height/2, width, height);
  return true;
}
function drawDefeatedSprites() {
  for (const corpse of game.defeatedSprites) {
    const resultElapsed = game.state==='over' ? Math.max(0,(performance.now()-(game.resultVisualStart ?? performance.now()))/1000) : 0;
    const age = game.time-corpse.started+resultElapsed;
    if (age >= corpse.duration) continue;
    ctx.save();ctx.translate(corpse.x,corpse.y);ctx.scale(ENEMY_SCALE,ENEMY_SCALE);
    drawSprite(corpse.key,'defeat',age,corpse.duration);ctx.restore();
  }
}
