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
  const viewport = window.visualViewport;
  const viewportW = viewport ? viewport.width : window.innerWidth;
  const viewportH = viewport ? viewport.height : window.innerHeight;
  const scale = Math.min(viewportW / LOGICAL_WIDTH, viewportH / LOGICAL_HEIGHT);
  const playW = LOGICAL_WIDTH * scale;
  const playH = LOGICAL_HEIGHT * scale;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  game.viewportW = viewportW;
  game.viewportH = viewportH;
  game.w = LOGICAL_WIDTH;
  game.h = LOGICAL_HEIGHT;
  game.offsetX = (viewportW - playW) / 2;
  game.offsetY = (viewportH - playH) / 2;
  game.scale = scale;
  game.dpr = dpr;
  canvas.width = Math.floor(viewportW * dpr);
  canvas.height = Math.floor(viewportH * dpr);
  canvas.style.width = `${viewportW}px`;
  canvas.style.height = `${viewportH}px`;
  mobileControls.style.left = `${game.offsetX}px`;
  mobileControls.style.top = `${game.offsetY}px`;
  mobileControls.style.width = `${playW}px`;
  mobileControls.style.height = `${playH}px`;
  mobileControls.style.setProperty("--control-scale", scale);
  xpBar.style.left = `${game.offsetX + 18 * scale}px`;
  xpBar.style.width = `${Math.max(0, playW - 36 * scale)}px`;
  xpBar.style.right = "auto";
  xpBar.style.bottom = `${viewportH - (game.offsetY + playH - 14 * scale)}px`;

  if (game.player) {
    game.player.x = Math.max(PLAYER_BOUND_X, Math.min(game.w - PLAYER_BOUND_X, game.player.x));
    game.player.y = Math.max(PLAYER_BOUND_TOP, Math.min(game.h - PLAYER_BOUND_X, game.player.y));
  }
}

function drawSidePanels() {
  const { viewportW, viewportH, offsetX, offsetY } = game;
  ctx.fillStyle = "#07040f";
  ctx.fillRect(0, 0, viewportW, viewportH);
  if (offsetX < 1 && offsetY < 1) return;

  const panelGradient = ctx.createLinearGradient(0, 0, viewportW, viewportH);
  panelGradient.addColorStop(0, "rgba(36, 18, 66, 0.18)");
  panelGradient.addColorStop(0.5, "rgba(7, 4, 15, 0.8)");
  panelGradient.addColorStop(1, "rgba(58, 26, 56, 0.18)");
  ctx.fillStyle = panelGradient;
  ctx.fillRect(0, 0, viewportW, viewportH);

  const panelWidth = Math.max(offsetX, offsetY);
  const count = Math.ceil(Math.max(viewportW, viewportH) / 90);
  ctx.strokeStyle = "rgba(143, 214, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < count; i++) {
    const progress = (i + 1) / (count + 1);
    if (offsetX > 0) {
      ctx.beginPath();
      ctx.moveTo(progress * panelWidth, 0);
      ctx.lineTo(progress * panelWidth - panelWidth * 0.35, viewportH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(viewportW - progress * panelWidth, 0);
      ctx.lineTo(viewportW - progress * panelWidth + panelWidth * 0.35, viewportH);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, progress * panelWidth);
      ctx.lineTo(viewportW, progress * panelWidth - panelWidth * 0.35);
      ctx.stroke();
    }
  }
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

