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
  const touchLayout = viewportW <= 700 || window.matchMedia?.('(pointer: coarse)').matches;
  const controlWidth = touchLayout && playW < 280 ? Math.min(viewportW, 320) : playW;
  mobileControls.style.left = `${(viewportW - controlWidth) / 2}px`;
  mobileControls.style.top = `${game.offsetY}px`;
  mobileControls.style.width = `${controlWidth}px`;
  mobileControls.style.height = `${playH}px`;
  mobileControls.style.setProperty("--control-scale", scale);
  const rail = !touchLayout && game.offsetX >= 204 ? Math.min(260, game.offsetX - 20) : 0;
  const hudWidth = rail ? playW + 2 * (rail + 12) : Math.max(playW, Math.min(320, viewportW));
  hud.style.left = `${(viewportW - hudWidth) / 2}px`;
  hud.style.top = `max(${game.offsetY + (rail ? 12 : 8)}px, env(safe-area-inset-top))`;
  hud.style.width = `${hudWidth}px`;
  hud.style.setProperty("--hud-rail", `${rail}px`);
  hud.dataset.layout = rail ? "rails" : "arena";
  hud.dataset.touch = String(touchLayout);
  const inset = Math.max(12, 18 * scale);
  xpBar.style.left = `${game.offsetX + inset}px`;
  xpBar.style.width = `${Math.max(0, playW - 2 * inset)}px`;
  xpBar.style.right = "auto";
  xpBar.style.bottom = `${viewportH - (game.offsetY + playH - inset)}px`;

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

  // A quiet architectural frame in the letterbox space, outside the combat area.
  if (offsetX > 24) {
    for (const x of [offsetX, viewportW - offsetX]) {
      ctx.fillStyle = "#51415f";
      ctx.fillRect(x - 1, 0, 2, viewportH);
      ctx.fillStyle = "#21182d";
      const side = x < viewportW / 2 ? -1 : 1;
      ctx.fillRect(x + side * 6 - 1, 0, 2, viewportH);
      ctx.strokeStyle = "rgba(213,163,79,0.12)";
      for (let y = 120; y < viewportH; y += 180) {
        const cx = x + side * Math.min(offsetX / 2, 138);
        ctx.beginPath();
        ctx.moveTo(cx, y - 12); ctx.lineTo(cx + 12, y);
        ctx.lineTo(cx, y + 12); ctx.lineTo(cx - 12, y); ctx.closePath(); ctx.stroke();
      }
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
  game.motes = Array.from({ length: 24 }, () => ({
    x: Math.random(),
    y: Math.random(),
    s: 16 + Math.random() * 30,
    phase: Math.random() * Math.PI * 2,
  }));
}

