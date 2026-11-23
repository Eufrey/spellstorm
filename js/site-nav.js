(() => {
  const slot = document.getElementById('play-site-nav');
  if (!slot) return;
  if (location.protocol === 'file:') { slot.hidden = true; return; }
  const measure = () => { if (slot.offsetHeight) document.documentElement.style.setProperty('--portal-nav-height', `${slot.offsetHeight}px`); };
  if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(slot);
  window.addEventListener('resize', measure);
  measure();
  fetch('site-nav.php', { credentials: 'same-origin', cache: 'no-store' })
    .then(response => response.ok ? response.text() : '')
    .then(markup => { if (markup.includes('class="site-nav"')) { slot.innerHTML = markup; measure(); } })
    .catch(() => {});
})();
