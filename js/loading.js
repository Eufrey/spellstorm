(() => {
  const root = document.documentElement;
  root.classList.add('spellstorm-loading');
  const started = performance.now();
  let loader, hideTimer, safetyTimer;
  let navigationPending = false;

  function mount() {
    if (loader || !document.body) return;
    loader = document.createElement('div');
    loader.className = 'spellstorm-loader is-active';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-label', 'Loading');
    loader.innerHTML = '<div class="spellstorm-loader-crescent" aria-hidden="true"></div>';
    document.body.prepend(loader);
  }

  function hide() {
    clearTimeout(hideTimer); clearTimeout(safetyTimer);
    navigationPending = false;
    root.classList.remove('spellstorm-loading');
    if (loader) { loader.classList.remove('is-active'); loader.setAttribute('aria-hidden', 'true'); }
  }

  function show() {
    clearTimeout(hideTimer); clearTimeout(safetyTimer);
    navigationPending = true;
    mount();
    root.classList.add('spellstorm-loading');
    if (loader) { loader.classList.add('is-active'); loader.removeAttribute('aria-hidden'); }
    // Recover if navigation is cancelled, blocked, or never completes.
    safetyTimer = setTimeout(hide, 15000);
  }

  const observer = new MutationObserver(() => { if (document.body) { mount(); observer.disconnect(); } });
  if (document.body) mount(); else observer.observe(root, { childList:true, subtree:true });
  function ready() {
    mount();
    if (!navigationPending) hideTimer = setTimeout(hide, Math.max(0, 420 - (performance.now() - started)));
  }
  window.addEventListener('load', ready, { once:true });
  if (document.readyState === 'complete') ready();
  safetyTimer = setTimeout(hide, 15000);
  window.addEventListener('pageshow', event => { if (event.persisted) hide(); });

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    show();
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (event.defaultPrevented || (form.target && form.target !== '_self')) return;
    const url = new URL(event.submitter?.formAction || form.action || location.href, location.href);
    if (url.origin === location.origin) show();
  });
})();
