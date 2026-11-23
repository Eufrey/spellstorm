function ensureAudio() {
  if (!audio.ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio.ctx = new Ctx();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = audio.muted ? 0 : 0.65;
    audio.master.connect(audio.ctx.destination);
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
  gain.connect(audio.master);
  osc.start();
  osc.stop(actx.currentTime + dur);
}

function startDrone() {
  const actx = ensureAudio();
  if (!actx || audio.drone.length) return;
  [55, 82.41, 110].forEach((freq, i) => {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = i === 0 ? 0.015 : 0.008;
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start();
    audio.drone.push(osc);
  });
}

function stopDrone() {
  for (const oscillator of audio.drone) oscillator.stop();
  audio.drone.length = 0;
}

let effectSeed = 173;
function effectRandom() {
  effectSeed = (Math.imul(effectSeed, 1664525) + 1013904223) >>> 0;
  return effectSeed / 4294967296;
}

function burst(x, y, color, count, speed) {
  const available = Math.max(0, 480 - game.particles.length);
  for (let i = 0; i < Math.min(count, available); i++) {
    const a = effectRandom() * Math.PI * 2;
    const v = speed * (0.35 + effectRandom());
    game.particles.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 0.35 + effectRandom() * 0.45,
      max: 0.8,
      color,
      size: 1.5 + effectRandom() * 2.4,
    });
  }
}

function toggleGameAudio() {
  audio.muted = !audio.muted;
  if (audio.master) audio.master.gain.setTargetAtTime(audio.muted ? 0 : 0.65, audio.ctx.currentTime, 0.03);
  const button = document.getElementById('audio-toggle');
  button.textContent = audio.muted ? 'Sound: off' : 'Sound: on';
  button.setAttribute('aria-pressed', String(audio.muted));
}

function floatText(x, y, text, color) {
  game.floaters.push({ x, y, text, color, life: 0.8 });
}

