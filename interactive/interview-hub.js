/* Interview Arena — DevOps/SRE prep (archetypes, no employer brands). */
(function initInterviewHub(global) {
  const ARCHETYPE_ORDER = ['universal', 'platform', 'sre', 'cicd', 'security', 'startup'];
  const HUB_STUB_KEY = 'devops-lab-hub-stubs';
  const ATLAS_HREF = '#/block/01-linux-shell-devops/L0';
  const DE_GYM = 'https://de-lab-interview-gym.web.app';
  const DE_BRIDGE_LINKS = [
    { href: `${DE_GYM}/#/interview`, labelKey: 'hubBridgeDeArena' },
    { href: `${DE_GYM}/#/block/17-governance-ops-de/E6`, labelKey: 'hubBridgeDeGov' },
    { href: `${DE_GYM}/#/block/14-orchestration-de/O2`, labelKey: 'hubBridgeDeOrch' },
    { href: `${DE_GYM}/#/block/13-cloud-storage-de/A0`, labelKey: 'hubBridgeDeCloud' },
  ];

  function lang() {
    return (global.DeLabI18n && DeLabI18n.getLang()) || 'ua';
  }

  function L(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang()] || obj.ua || obj.en || '';
  }

  function ui(key, ...args) {
    return (global.DeLabI18n && DeLabI18n.t(key, ...args)) || key;
  }

  function escapeHtml(v) {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  let bankCache = null;

  async function loadBank() {
    if (bankCache) return bankCache;
    const res = await fetch('data/interview-bank.json');
    if (!res.ok) throw new Error('interview bank missing');
    bankCache = await res.json();
    return bankCache;
  }

  function archetypeMeta(bank, id) {
    return (bank.archetypes || []).find((a) => a.id === id) || { id, color: '#8b9cb3', glyph: '◇', sigil: '?', label: { ua: id, en: id } };
  }

  function taskProgress(task) {
    if (task.kind !== 'gym' || !global.loadProgress) return false;
    try {
      const prog = global.loadProgress();
      return !!(prog[task.blockId] && prog[task.blockId][task.levelId]);
    } catch {
      return false;
    }
  }

  function renderTaskCard(task, bank) {
    const th = archetypeMeta(bank, task.archetype);
    const done = taskProgress(task);
    const kindLabel = task.kind === 'gym' ? ui('hubKindGym') : ui('hubKindStub');
    const href = task.kind === 'gym'
      ? `#/block/${task.blockId}/${task.levelId}`
      : `#/interview/task/${task.id}`;
    return `
      <a class="hub-task ${done ? 'done' : ''}" href="${href}" style="--hub:${th.color}">
        <span class="hub-task-sigil">${escapeHtml(th.sigil)}</span>
        <span class="hub-task-body">
          <strong>${escapeHtml(L(task.title))}</strong>
          <span class="hub-task-meta">${escapeHtml(kindLabel)} · ${task.minutes || 15}m · ${escapeHtml(task.skill || '')} · ${escapeHtml(task.difficulty || '')}</span>
          ${L(task.prompt) ? `<span class="hub-task-hint">${escapeHtml(L(task.prompt).slice(0, 120))}${L(task.prompt).length > 120 ? '…' : ''}</span>` : ''}
        </span>
        ${done ? '<span class="hub-done">✓</span>' : ''}
      </a>`;
  }

  async function render(root, route) {
    let bank;
    try {
      bank = await loadBank();
    } catch {
      root.innerHTML = `<p class="pl-card">${escapeHtml(ui('hubLoadFail'))}</p>`;
      return;
    }

    if (route.taskId) {
      renderTaskDetail(root, bank, route.taskId);
      return;
    }

    const filter = route.archetype || 'all';
    const q = (route.q || '').toLowerCase();
    let tasks = bank.tasks || [];
    if (filter !== 'all') tasks = tasks.filter((t) => t.archetype === filter);
    if (q) {
      tasks = tasks.filter((t) => {
        const hay = `${L(t.title)} ${L(t.prompt)} ${t.skill} ${t.tag || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    const tabs = ARCHETYPE_ORDER.map((id) => {
      const th = archetypeMeta(bank, id);
      const count = (bank.tasks || []).filter((t) => t.archetype === id).length;
      if (!count) return '';
      const active = filter === id ? ' active' : '';
      return `<a class="hub-arch-tab${active}" href="#/interview/${id}" style="--hub:${th.color}">${th.glyph} ${escapeHtml(L(th.label))} <small>${count}</small></a>`;
    }).join('');

    const gymCount = tasks.filter((t) => t.kind === 'gym').length;
    const stubCount = tasks.filter((t) => t.kind === 'stub').length;

    root.innerHTML = `
      <section class="pl-card hub-arena">
        <button type="button" class="ghost" id="hub-back">${escapeHtml(ui('backCabin'))}</button>
        <p class="hub-eyebrow">${escapeHtml(ui('hubEyebrow'))}</p>
        <h2>${escapeHtml(ui('hubTitle'))}</h2>
        <p class="hub-lede">${escapeHtml(ui('hubLede'))}</p>
        <p class="hub-ethics">${escapeHtml(L(bank.ethics))}</p>
        <div class="hub-stats">
          <span>${tasks.length} ${escapeHtml(ui('hubTasks'))}</span>
          <span>${gymCount} ${escapeHtml(ui('hubKindGym'))}</span>
          <span>${stubCount} ${escapeHtml(ui('hubKindStub'))}</span>
        </div>
        <div class="hub-search-row">
          <input type="search" id="hub-search" class="hub-search" placeholder="${escapeHtml(ui('hubSearch'))}" value="${escapeHtml(route.q || '')}" />
          <a class="ghost nav-pill" href="${ATLAS_HREF}">${escapeHtml(ui('hubAtlasLink'))}</a>
        </div>
        <div class="hub-bridge-row">
          <span class="hub-bridge-label">${escapeHtml(ui('hubBridgeTitle'))}</span>
          ${DE_BRIDGE_LINKS.map((b) => `<a class="ghost nav-pill hub-bridge-link" href="${escapeHtml(b.href)}" target="_blank" rel="noopener">${escapeHtml(ui(b.labelKey))}</a>`).join('')}
        </div>
        <div class="hub-arch-tabs">
          <a class="hub-arch-tab ${filter === 'all' ? 'active' : ''}" href="#/interview">${escapeHtml(ui('hubAll'))} <small>${(bank.tasks || []).length}</small></a>
          ${tabs}
        </div>
        <div class="hub-task-list">${tasks.map((t) => renderTaskCard(t, bank)).join('')}</div>
        <p class="pl-feedback">${escapeHtml(ui('hubFooter'))}</p>
      </section>`;

    root.querySelector('#hub-back')?.addEventListener('click', () => { location.hash = '#/'; });
    root.querySelector('#hub-search')?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const val = e.target.value.trim();
      const base = filter === 'all' ? '#/interview' : `#/interview/${filter}`;
      location.hash = val ? `${base}?q=${encodeURIComponent(val)}` : base;
    });
  }

  function renderTaskDetail(root, bank, taskId) {
    const task = (bank.tasks || []).find((t) => t.id === taskId);
    if (!task) {
      root.innerHTML = `<p class="pl-card">${escapeHtml(ui('hubTaskMissing'))}</p>`;
      return;
    }
    const th = archetypeMeta(bank, task.archetype);
    const resources = (task.resources || []).map((r) =>
      `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.label)}</a>`).join(' · ');

    root.innerHTML = `
      <section class="pl-card hub-detail" style="--hub:${th.color}">
        <button type="button" class="ghost" id="hub-back">${escapeHtml(ui('hubBackList'))}</button>
        <span class="hub-task-sigil large">${escapeHtml(th.sigil)}</span>
        <h2>${escapeHtml(L(task.title))}</h2>
        <p class="hub-task-meta">${th.glyph} ${escapeHtml(L(th.label))} · ${task.minutes || 15} min · ${escapeHtml(task.difficulty || '')}</p>
        <div class="hub-prompt-box">
          <h3>${escapeHtml(ui('hubPrompt'))}</h3>
          <p>${escapeHtml(L(task.prompt))}</p>
        </div>
        ${task.source ? `<p class="hub-source"><b>${escapeHtml(ui('hubSource'))}:</b> ${escapeHtml(task.source)}</p>` : ''}
        ${resources ? `<p class="hub-resources"><b>${escapeHtml(ui('hubResources'))}:</b> ${resources}</p>` : ''}
        <div class="hub-detail-actions">
          ${task.kind === 'gym'
    ? `<a class="nav-pill" href="#/block/${task.blockId}/${task.levelId}">${escapeHtml(ui('hubOpenGym'))}</a>`
    : `<button type="button" class="nav-pill" id="hub-mark">${escapeHtml(ui('hubMarkDone'))}</button>`}
        </div>
      </section>`;

    root.querySelector('#hub-back')?.addEventListener('click', () => {
      location.hash = task.archetype ? `#/interview/${task.archetype}` : '#/interview';
    });
    root.querySelector('#hub-mark')?.addEventListener('click', () => {
      try {
        const raw = localStorage.getItem(HUB_STUB_KEY);
        const done = raw ? JSON.parse(raw) : {};
        done[taskId] = true;
        localStorage.setItem(HUB_STUB_KEY, JSON.stringify(done));
      } catch { /* */ }
      root.querySelector('#hub-mark').textContent = ui('hubMarked');
    });
  }

  global.InterviewHub = { render, loadBank, clearCache: () => { bankCache = null; } };
})(window);
