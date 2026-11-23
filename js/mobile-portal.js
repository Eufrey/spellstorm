(() => {
  function menu(container, anchor, label) {
    if (!anchor || container.classList.contains('mobile-menu-ready')) return;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-menu-toggle';
    toggle.textContent = label;
    toggle.setAttribute('aria-expanded', 'false');
    anchor.after(toggle);
    container.classList.add('mobile-menu-ready');
    toggle.addEventListener('click', () => {
      const open = container.classList.toggle('mobile-menu-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close menu' : label;
    });
  }
  function enhanceNavigation() {
    document.querySelectorAll('.site-nav').forEach(nav => {
      if (nav.querySelector('.site-primary')) menu(nav, nav.querySelector('.site-brand'), 'Menu');
    });
    document.querySelectorAll('.admin-side').forEach(side => menu(side, side.querySelector('.admin-brand'), 'Control menu'));
  }
  function enhanceTables() {
    document.querySelectorAll('.table-responsive > table').forEach(table => {
      const headings = Array.from(table.querySelectorAll('thead th'), th => th.textContent.trim());
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      if (!headings.length || !rows.length || rows.some(row => row.cells.length !== headings.length || Array.from(row.cells).some(cell => cell.colSpan !== 1))) return;
      table.classList.add('mobile-records');
      table.setAttribute('role', 'table');
      table.querySelectorAll('thead,tbody').forEach(group => group.setAttribute('role', 'rowgroup'));
      table.querySelectorAll('tr').forEach(row => row.setAttribute('role', 'row'));
      table.querySelectorAll('th').forEach(th => { th.setAttribute('role', 'columnheader'); th.scope = 'col'; });
      rows.forEach(row => Array.from(row.cells).forEach((cell, index) => {
        cell.setAttribute('role', 'cell');
        const label = document.createElement('span');
        label.className = 'mobile-cell-label';
        label.setAttribute('aria-hidden', 'true');
        label.textContent = headings[index];
        const value = document.createElement('div');
        value.className = 'mobile-cell-value';
        while (cell.firstChild) value.append(cell.firstChild);
        cell.append(label, value);
      }));
      table.parentElement.classList.add('mobile-record-list');
    });
  }
  enhanceNavigation();
  enhanceTables();
  const slot = document.getElementById('play-site-nav');
  if (slot && typeof MutationObserver === 'function') new MutationObserver(enhanceNavigation).observe(slot, { childList:true, subtree:true });
})();
