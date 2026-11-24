(() => {
  let run = null;
  let finished = null;
  window.spellstormResultSave = () => finished;
  window.spellstormRunDuration = () => run ? Math.floor((performance.now() - run.started) / 1000) : 0;
  const session = async () => {
    if (location.protocol === 'file:') return { guest: true };
    try { const auth = await fetch('run-api.php', { credentials: 'same-origin', cache: 'no-store' });
      if (auth.status === 401) return { guest: true };
      if (auth.status === 404 || auth.status === 405) return { offline: true };
      if (!auth.ok) return { unavailable: true };
      return { ...(await auth.json()), guest: false };
    } catch (_) { return { unavailable: true }; }
  };
  window.spellstormStartRun = () => {
    const status = document.getElementById('run-sync-status');
    if (status) status.textContent = '';
    finished = null;
    run = { id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : null, started: performance.now(), sent: false, session: session() };
  };
  window.spellstormFinishRun = (data) => {
    if (!run || run.sent) return;
    const current=run; current.sent = true;
    const status = document.getElementById('run-sync-status');
    const payload = { ...data, id: current.id, duration: Math.floor((performance.now() - current.started) / 1000) };
    finished = (async () => {
    if(status) status.textContent='Checking run...';
    try {
      const auth = await current.session;
      if (auth.offline) { if(status && run===current) status.textContent='Guest run · online saving is unavailable on this host.'; return { offline: true }; }
      if (auth.guest) { if(status && run===current) status.textContent='Guest run · not saved online.'; return {guest:true}; }
      if (auth.unavailable || !current.id) throw Error('Session unavailable');
      const response = await fetch('run-api.php', { method: 'POST', credentials: 'same-origin', keepalive:true, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': auth.csrf }, body: JSON.stringify(payload) });
      if (!response.ok) throw Error('Save failed');
      const result = await response.json();
      if (status && run===current) status.textContent = `Run saved.${result.newBest?' New personal best!':''}${result.awards?` ${result.awards} new achievement(s)!`:''}`;
      return result;
    } catch (_) { if (status && run===current) status.textContent = 'Could not save this run.'; return {error:true}; }
    })();
  };
})();
