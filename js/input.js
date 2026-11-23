let last = performance.now();
function resetGameplayInput() {
  keys.clear(); pressed.clear(); rightClick = false;
  clearTouchMove();
  game.accumulator = 0;
  last = performance.now();
}

function advanceFrame(elapsed) {
  if (game.state !== "play" && game.state !== "dying") {
    game.accumulator = 0;
    return;
  }
  game.accumulator += Math.max(0, Math.min(BALANCE.maxFrameTime, elapsed));
  for (let steps = 0; game.accumulator + 1e-10 >= BALANCE.simulationStep && steps < 12; steps++) {
    game.accumulator = Math.max(0, game.accumulator - BALANCE.simulationStep);
    update(BALANCE.simulationStep);
    pressed.clear(); rightClick = false;
    if (game.state !== "play" && game.state !== "dying") { game.accumulator = 0; break; }
  }
}

function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  advanceFrame(dt);
  draw();
  if (game.state === "play" || game.state === "pause" || game.state === "dying") syncHud();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (event.target && typeof event.target.closest === 'function' && event.target.closest('#play-site-nav')) return;
  if (event.code === 'Enter' && event.target && typeof event.target.closest === 'function' && event.target.closest('button, a, summary, input')) return;
  const block = ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (game.state === "play" && block.includes(event.code)) event.preventDefault();
  if (game.state === "upgrade" && ["Digit1", "Digit2", "Digit3"].includes(event.code)) {
    if (event.repeat) return;
    const choice = upgradeChoices.children[Number(event.code.slice(-1)) - 1];
    if (choice) chooseUpgrade(choice.dataset.upgradeId, Number(choice.dataset.offerToken));
    return;
  }
  if (event.repeat) return;
  if (game.state === "play") {
    if (!keys.has(event.code)) pressed.add(event.code);
    keys.add(event.code);
  }
  if (event.code === "Enter" && (game.state === "menu" || game.state === "over")) startGame();
  if (event.code === "Escape") togglePause();
  if (event.code === "Enter" && game.state === "pause") togglePause();
});

window.addEventListener("keyup", (event) => keys.delete(event.code));

window.addEventListener("mousedown", (event) => {
  if (event.button === 2 && game.state === "play") rightClick = true;
});

window.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("blur", () => {
  if (game.state === "play") togglePause();
  else resetGameplayInput();
});
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
document.addEventListener("fullscreenchange", resize);
if (window.visualViewport) window.visualViewport.addEventListener("resize", resize);
touchPad.addEventListener("pointerdown", (event) => {
  if (game.state !== "play") return;
  touchPad.setPointerCapture(event.pointerId);
  updateTouchMove(event);
  event.preventDefault();
});
touchPad.addEventListener("pointermove", (event) => {
  if (game.state === "play" && touchPad.hasPointerCapture(event.pointerId)) updateTouchMove(event);
});
touchPad.addEventListener("pointerup", clearTouchMove);
touchPad.addEventListener("pointercancel", clearTouchMove);
touchPad.addEventListener("lostpointercapture", clearTouchMove);
wardButton.addEventListener("pointerdown", (event) => {
  if (game.state === "play") {
    pressed.add("Space");
    event.preventDefault();
  }
});
touchAbilityButtons.forEach((button, index) => {
  const code = ['KeyQ', 'KeyE', 'KeyR'][index];
  button.addEventListener('pointerdown', event => {
    if (game.state === 'play') pressed.add(code);
    event.preventDefault();
  });
  button.addEventListener('click', event => {
    if (event.detail === 0 && game.state === 'play') pressed.add(code);
  });
});
upgradeChoices.addEventListener("click", (event) => {
  if (event.detail > 1) return;
  const button = event.target.closest("[data-upgrade-id]");
  if (button) chooseUpgrade(button.dataset.upgradeId, Number(button.dataset.offerToken));
});
document.getElementById("start").addEventListener("click", startGame);
document.getElementById("again").addEventListener("click", startGame);
document.getElementById("resume").addEventListener("click", togglePause);
document.getElementById("audio-toggle").addEventListener("click", () => { if (typeof toggleGameAudio === 'function') toggleGameAudio(); });
document.getElementById("back-menu").addEventListener("click", returnToMenu);
document.getElementById("quit-menu").addEventListener("click", () => { if (game.state === "pause" && window.confirm("Abandon this vigil? Your unfinished run will not be saved.")) returnToMenu(); });

loadBest();
seedField();
resize();
requestAnimationFrame(frame);
