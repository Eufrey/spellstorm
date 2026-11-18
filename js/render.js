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
  ctx.scale(PLAYER_SCALE, PLAYER_SCALE);
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
  ctx.scale(ENEMY_SCALE, ENEMY_SCALE);
  ctx.fillStyle = "rgba(255, 196, 140, 0.16)";
  ctx.beginPath();
  ctx.arc(0, 0, foe.r / ENEMY_SCALE + 10, 0, Math.PI * 2);
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
    const archon = foe.archon;
    ctx.strokeStyle = archon.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 34 + i * 8, game.time * (0.6 + i * 0.2), game.time * (0.6 + i * 0.2) + 1.4);
      ctx.stroke();
    }
    ctx.fillStyle = archon.accent;
    ctx.beginPath();
    if (archon.model === "wings") {
      ctx.moveTo(-38, 22);
      ctx.lineTo(-18, -16);
      ctx.lineTo(0, -28);
      ctx.lineTo(18, -16);
      ctx.lineTo(38, 22);
    } else if (archon.model === "horns") {
      ctx.moveTo(-27, 20);
      ctx.lineTo(-25, -24);
      ctx.lineTo(-12, -14);
      ctx.lineTo(0, -30);
      ctx.lineTo(12, -14);
      ctx.lineTo(25, -24);
      ctx.lineTo(27, 20);
    } else {
      ctx.moveTo(-26, 20);
      ctx.lineTo(-16, -16);
      ctx.lineTo(0, -28);
      ctx.lineTo(16, -16);
      ctx.lineTo(26, 20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = archon.color;
    ctx.beginPath();
    if (archon.model === "halo") {
      ctx.arc(0, -22, 14 + Math.sin(game.time * 2) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = archon.color;
      ctx.stroke();
    } else {
      ctx.moveTo(-10, -26);
      ctx.lineTo(0, -44);
      ctx.lineTo(10, -26);
    }
    ctx.fill();
  }
  if (foe.kind !== "archon" && foe.kind !== "bat" && foe.kind !== "imp") {
    const ratio = foe.hp / foe.maxHp;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(-18, 24, 36, 3);
    ctx.fillStyle = "rgba(217, 106, 106, 0.8)";
    ctx.fillRect(-18, 24, 36 * Math.max(0, ratio), 3);
  }
  ctx.restore();
}

function fitText(text, maxWidth, size) {
  const family = "'Press Start 2P', monospace";
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
    drawMage(game.player.x, game.player.y, GRIMOIRES[game.player.grimoire].color, hidden && game.dying < 0.8);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4e7c8";
  ctx.font = "18px 'Press Start 2P', monospace";
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
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.globalAlpha = 1;
  }

  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

