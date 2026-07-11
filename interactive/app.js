const STORAGE_KEY = 'devops-lab-interactive-v1';
const BUILD = '20260711h';
const GYM_URL = 'https://devops-lab-gym.web.app';
const DE_LAB_URL = 'https://de-lab-interview-gym.web.app';
const OPS_QUEST_MD = 'https://github.com/TEZv/devops-lab/blob/main/CHALLENGES.md';
const MENTORSHIP = 'https://sphere-mentorship-hub.vercel.app';

/** Block registry for skill orbs (from staircase layers). */
const BLOCK_REGISTRY = [
  { id: '01-linux-shell-devops', ready: true, skill: 'linux' },
  { id: '02-git-ci-devops', ready: true, skill: 'git' },
  { id: '03-docker-devops', ready: true, skill: 'docker' },
  { id: '04-terraform-devops', ready: true, skill: 'iac' },
  { id: '05-k8s-devops', ready: true, skill: 'k8s' },
  { id: '06-prod-devops', ready: true, skill: 'prod' },
];

const ROADS = [];

function t(key, ...args) {
  return (window.DeLabI18n && DeLabI18n.t(key, ...args)) || key;
}
function labelCap(value) {
  const s = String(value ?? '').trim();
  if (!s || /^[A-ZА-ЯІЇЄҐ0-9"«]/.test(s)) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function withLang(url) {
  return (window.DeLabI18n && DeLabI18n.withLang(url)) || url;
}
function blockTitle(id) {
  return (window.DeLabI18n && DeLabI18n.blockTitle(id)) || id;
}

const SKILLS = [
  { id: 'linux', label: 'Linux', color: '#4ecdc4' },
  { id: 'git', label: 'Git/CI', color: '#5b8def' },
  { id: 'docker', label: 'Docker', color: '#3d9a6a' },
  { id: 'iac', label: 'IaC', color: '#e8a84b' },
  { id: 'k8s', label: 'K8s', color: '#c77dff' },
  { id: 'prod', label: 'Prod', color: '#ff6b6b' },
];

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let p = raw ? JSON.parse(raw) : {};
    const legacy = localStorage.getItem('de-lab-interactive-v2');
    if (!raw && legacy) {
      p = JSON.parse(legacy);
      localStorage.setItem(STORAGE_KEY, legacy);
    }
    if (p['01-window'] && !p['01-window-functions']) {
      p['01-window-functions'] = p['01-window'];
      delete p['01-window'];
      saveProgress(p);
    }
    return p;
  } catch { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* */ }
}

function parseRoute() {
  const h = (location.hash || '#/').replace(/^#\/?/, '');
  const [pathPart, queryPart] = h.split('?');
  const parts = pathPart.split('/').filter(Boolean);
  const q = queryPart ? new URLSearchParams(queryPart).get('q') : null;
  if (!parts.length) return { view: 'home' };
  if (parts[0] === 'block') return { view: 'block', blockId: parts[1], levelId: parts[2] || null };
  if (parts[0] === 'share') return { view: 'share' };
  if (parts[0] === 'interview') {
    if (parts[1] === 'task') return { view: 'interview', taskId: parts[2] || null, q };
    const arch = parts[1];
    const known = ['universal', 'platform', 'sre', 'cicd', 'security', 'startup'];
    return {
      view: 'interview',
      archetype: known.includes(arch) ? arch : null,
      q,
    };
  }
  return { view: 'home' };
}

async function loadBlock(id) {
  const fileId = resolveBlockFile(id);
  const lang = (window.DeLabI18n && DeLabI18n.getLang()) || 'ua';
  if (lang === 'en') {
    try {
      const enRes = await fetch(`blocks/${fileId}.en.json`);
      if (enRes.ok) return enRes.json();
    } catch { /* fallback to UA */ }
  }
  const res = await fetch(`blocks/${fileId}.json`);
  if (!res.ok) throw new Error(`block not found: ${fileId}`);
  return res.json();
}

function resolveBlockFile(id) {
  const aliases = { '01-window': '01-window-functions' };
  return aliases[id] || id;
}

function countDone(prog) {
  return Object.keys(prog || {}).filter((k) => prog[k]).length;
}

function allBlocks() {
  const fromLayers = (window.LabLadder && LabLadder.DEVOPS_SKILL_LAYERS) || [];
  const ids = fromLayers.flatMap((l) => l.blocks || []);
  return ids.map((id) => BLOCK_REGISTRY.find((b) => b.id === id) || { id, ready: true, skill: 'linux' });
}

function skillScores() {
  const all = loadProgress();
  const scores = {};
  SKILLS.forEach((s) => { scores[s.id] = { done: 0, total: 0 }; });
  allBlocks().forEach((b) => {
    const skill = b.skill || 'sql';
    if (!scores[skill]) scores[skill] = { done: 0, total: 0 };
    scores[skill].total += 1;
    const n = countDone(all[b.id] || {});
    if (n > 0) scores[skill].done += 1;
  });
  return scores;
}

function archerRank() {
  const scores = skillScores();
  const lit = SKILLS.filter((s) => scores[s.id].done > 0).length;
  let tier = 0;
  if (lit >= 6) tier = 3;
  else if (lit >= 4) tier = 2;
  else if (lit >= 2) tier = 1;
  const ranks = t('ranks');
  const title = Array.isArray(ranks) ? ranks[tier] : ranks;
  return { title, tier };
}

function archerGlow(tier) {
  return ['#4a5568', '#4ecdc4', '#e8a84b', '#c77dff'][tier] || '#4a5568';
}

function archerSvg(tier) {
  const glow = archerGlow(tier);
  const uid = `a${tier}-${Math.random().toString(36).slice(2, 7)}`;
  return `
  <svg class="hero-svg hero-archer" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="aura-${uid}" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="${glow}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="95" r="88" fill="url(#aura-${uid})"/>
    <ellipse cx="100" cy="175" rx="46" ry="14" fill="#0a1018" opacity=".55"/>
    <path d="M58 115 Q100 200 142 115 L138 190 Q100 208 62 190 Z" fill="#1a2838" stroke="${glow}" stroke-width="2"/>
    <circle cx="100" cy="78" r="26" fill="#d4b896"/>
    <path d="M74 68 Q100 42 126 68 L118 76 Q100 56 82 76 Z" fill="#2a3545"/>
    <circle cx="92" cy="76" r="2.5" fill="#1a1525"/>
    <circle cx="108" cy="76" r="2.5" fill="#1a1525"/>
    <path d="M40 120 Q55 90 75 100" fill="none" stroke="#8b6914" stroke-width="4" stroke-linecap="round"/>
    <line x1="75" y1="100" x2="130" y2="85" stroke="#8b6914" stroke-width="3"/>
    <path d="M130 85 Q155 80 165 95" fill="none" stroke="${glow}" stroke-width="2"/>
    <line x1="165" y1="95" x2="175" y2="70" stroke="${glow}" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="175,70 182,68 178,76" fill="${glow}"/>
    <text x="100" y="214" text-anchor="middle" fill="#8b9cb3" font-size="11" font-family="Segoe UI,sans-serif">DevOps Archer</text>
  </svg>`;
}

function mageGlow(tier) {
  return archerGlow(tier);
}

function mageSvg(tier) {
  return archerSvg(tier);
}

/** Draw the same mage onto share canvas (right side). Coordinates in mage local space 0..200. */
function drawMageOnCanvas(ctx, ox, oy, scale, tier) {
  const glow = mageGlow(tier);
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  const aura = ctx.createRadialGradient(100, 95, 10, 100, 95, 88);
  aura.addColorStop(0, glow + '8c');
  aura.addColorStop(1, glow + '00');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(100, 95, 88, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(10,16,24,.55)';
  ctx.beginPath();
  ctx.ellipse(100, 175, 46, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  const robe = ctx.createLinearGradient(55, 110, 145, 200);
  robe.addColorStop(0, '#1a2332');
  robe.addColorStop(1, '#0d1520');
  ctx.fillStyle = robe;
  ctx.strokeStyle = glow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(55, 110);
  ctx.quadraticCurveTo(100, 200, 145, 110);
  ctx.lineTo(145, 190);
  ctx.quadraticCurveTo(100, 210, 55, 190);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#d4b896';
  ctx.beginPath();
  ctx.arc(100, 78, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1525';
  ctx.strokeStyle = glow;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(72, 70);
  ctx.quadraticCurveTo(100, 40, 128, 70);
  ctx.lineTo(120, 78);
  ctx.quadraticCurveTo(100, 58, 80, 78);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#2a2030';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(88, 82);
  ctx.quadraticCurveTo(100, 90, 112, 82);
  ctx.stroke();

  ctx.fillStyle = '#1a1525';
  ctx.beginPath();
  ctx.arc(90, 76, 3, 0, Math.PI * 2);
  ctx.arc(110, 76, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = glow;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(148, 50);
  ctx.lineTo(148, 170);
  ctx.stroke();
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(148, 42, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#8b9cb3';
  ctx.font = '11px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DE Mage', 100, 214);
  ctx.restore();
}

function shareCaption(rank, scores) {
  const skills = SKILLS.map((s) => `${s.label} ${scores[s.id].done}/${scores[s.id].total}`).join(' · ');
  return t('shareCap', rank.title, skills, GYM_URL, OPS_QUEST_MD);
}

function paintChrome() {
  document.title = t('pageTitle');
  const h1 = document.getElementById('hdr-title');
  const lede = document.getElementById('hdr-lede');
  if (h1) h1.textContent = t('headerTitle');
  if (lede) lede.textContent = t('headerLede');
  let build = document.getElementById('build-tag');
  if (!build) {
    build = document.createElement('span');
    build.id = 'build-tag';
    build.className = 'build-tag';
    document.querySelector('header')?.appendChild(build);
  }
  build.textContent = `build ${BUILD}`;
  const map = [
    ['nav-de-lab', 'navDeLab'],
    ['nav-ops-md', 'navOpsMd'],
    ['nav-mentorship', 'navMentorship'],
    ['nav-repo', 'navRepo'],
  ];
  map.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });
  const m = document.getElementById('nav-mentorship');
  if (m) m.href = withLang(MENTORSHIP);
  if (window.DeLabI18n) DeLabI18n.mountToggle(document.getElementById('lang-slot'));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      prompt('Скопіюй вручну:', text);
      return true;
    } catch {
      return false;
    }
  }
}

function downloadCanvasPng(canvas, filename) {
  const a = document.createElement('a');
  a.download = filename;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function careerTier() {
  return (window.LabLadder && LabLadder.getCareerTier('devops')) || [];
}
function currentCareer() {
  const tier = (window.LabLadder && LabLadder.loadCareerTier()) || { id: 'intern', devopsLabel: 'Intern', recommendLayers: [1, 2] };
  return { ...tier, label: tier.devopsLabel || tier.label };
}
function langIsEn() {
  return window.DeLabI18n && DeLabI18n.getLang() === 'en';
}
function careerBlurb(tier) {
  if (!tier) return '';
  return langIsEn() ? (tier.blurbEn || '') : (tier.blurbUa || '');
}
function layerTitle(layer) {
  if (!layer) return '';
  return langIsEn() ? (layer.titleEn || layer.title) : (layer.titleUa || layer.title);
}
function layerProgress(layer) {
  const all = loadProgress();
  let doneLevels = 0;
  let totalLevels = 0;
  let blocksTouched = 0;
  (layer.blocks || []).forEach((id) => {
    const p = all[id] || {};
    const n = countDone(p);
    if (n > 0) blocksTouched += 1;
    doneLevels += n;
    totalLevels += Math.max(n, 1);
  });
  const pct = layer.blocks.length
    ? Math.round((blocksTouched / layer.blocks.length) * 100)
    : 0;
  return { pct, blocksTouched, total: layer.blocks.length, doneLevels };
}

function renderHeroCabin() {
  const rank = archerRank();
  const career = currentCareer();
  const scores = skillScores();
  const orbs = SKILLS.map((s) => {
    const sc = scores[s.id];
    const pct = sc.total ? Math.round((sc.done / sc.total) * 100) : 0;
    const on = sc.done > 0;
    return `
      <button type="button" class="skill-orb ${on ? 'on' : ''}" data-skill="${s.id}" title="${s.label}: ${sc.done}/${sc.total}" style="--orb:${s.color}">
        <span class="orb-glow"></span>
        <span class="orb-label">${s.label}</span>
        <span class="orb-pct">${pct}%</span>
      </button>`;
  }).join('');

  return `
    <aside class="hero-cabin" id="hero-cabin">
      <div class="hero-visual">${mageSvg(rank.tier)}</div>
      <div class="hero-meta">
        <p class="hero-eyebrow">${t('heroEyebrow')}</p>
        <h2 class="hero-rank">${rank.title}</h2>
        <p class="hero-aim">${t('aimingAt', career.label || career.devopsLabel || '')}</p>
        <p class="hero-tip">${t('heroTip')}</p>
        <div class="skill-orb-row">${orbs}</div>
        <div class="hero-actions">
          <a class="nav-pill hub-cta" href="#/interview">${t('btnInterviewHub')}</a>
          <a class="nav-pill" href="${DE_LAB_URL}" target="_blank" rel="noopener">${t('btnDeLab')}</a>
          <button type="button" class="ghost" id="btn-share">${t('btnShare')}</button>
        </div>
      </div>
    </aside>`;
}

function renderCareerPicker() {
  const tiers = careerTier();
  const cur = currentCareer();
  return `
    <section class="pl-card career-card">
      <h2>${t('careerTitle')}</h2>
      <p style="color:var(--muted)">${t('careerLede')}</p>
      <div class="career-tier-row" role="listbox" aria-label="${t('careerTitle')}">
        ${tiers.map((c) => `
          <button type="button" class="career-tier-btn ${c.id === cur.id ? 'active' : ''}" data-career="${c.id}" title="${careerBlurb(c)}">
            <span class="career-tier-label">${c.label || c.devopsLabel}</span>
          </button>`).join('')}
      </div>
      <p class="career-blurb" id="career-blurb">${careerBlurb(cur)}</p>
    </section>`;
}

function renderStaircase() {
  const layers = (window.LabLadder && LabLadder.DEVOPS_SKILL_LAYERS) || [];
  const career = currentCareer();
  const steps = layers.slice().reverse().map((layer) => {
    const prog = layerProgress(layer);
    const rec = LabLadder.isLayerRecommended(layer.n, career);
    const accent = LabLadder.isLayerAccent(layer.n, career);
    const cls = [
      'stair-step',
      rec ? 'recommended' : '',
      accent ? 'accent' : '',
      prog.pct >= 100 ? 'complete' : prog.pct > 0 ? 'started' : '',
    ].filter(Boolean).join(' ');
    return `
      <div class="${cls}" data-layer="${layer.id}" style="--step:${layer.n}">
        <button type="button" class="stair-platform" data-expand="${layer.id}" aria-expanded="false">
          <span class="stair-icon">${layer.icon}</span>
          <span class="stair-meta">
            <strong>${layer.n}. ${layerTitle(layer)}</strong>
            <span class="stair-pct">${prog.pct}% · ${prog.blocksTouched}/${prog.total}</span>
          </span>
          ${rec ? `<span class="stair-badge">${t('recommended')}</span>` : ''}
        </button>
        <div class="stair-missions" id="missions-${layer.id}" hidden>
          <p class="stair-mode">${t('layerMode', layer.mode)}</p>
          <div class="stair-mission-grid">
            ${(layer.blocks || []).length
              ? (layer.blocks || []).map((id) => {
                const done = countDone(loadProgress()[id] || {});
                return `
                <button type="button" class="pl-block-btn" data-block="${id}">
                  <span class="pl-track-label">${layer.skill || ''}</span>
                  <strong>${blockTitle(id)}</strong><br>
                  <span style="color:var(--muted);font-size:13px">${t('progress', done)}</span>
                </button>`;
              }).join('')
              : `<p class="pl-tip">${t('layerSoon')}</p>`}
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <section class="pl-card stair-card">
      <div class="stair-header">
        <div>
          <h2>${t('stairTitle')}</h2>
          <p style="color:var(--muted)">${t('stairLede')}</p>
        </div>
        <div class="stair-trophy" aria-hidden="true">🏆</div>
      </div>
      <div class="stair-layout">
        <div class="stair-mage-dock">${archerSvg(archerRank().tier)}</div>
        <div class="stair-column">
          ${steps}
          <div class="stair-base">${t('stairBase')}</div>
        </div>
      </div>
    </section>`;
}

function wireHero(root) {
  root.querySelector('#btn-share')?.addEventListener('click', () => {
    location.hash = '#/share';
  });
}

function renderHome(root) {
  const homeBody = t('homeBody')
    .replace('{opsQuest}', OPS_QUEST_MD)
    .replace('{deLab}', DE_LAB_URL);
  root.innerHTML = `
    ${renderHeroCabin()}
    ${renderCareerPicker()}
    ${renderStaircase()}
    <section class="pl-card">
      <h2>${t('homeTitle')}</h2>
      <p style="color:var(--muted)">${homeBody}</p>
    </section>`;

  wireHero(root);
  root.querySelectorAll('[data-career]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.LabLadder) LabLadder.saveCareerTier(btn.dataset.career);
      render();
    });
  });
  root.querySelectorAll('[data-expand]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.expand;
      const panel = root.querySelector(`#missions-${id}`);
      if (!panel) return;
      const open = panel.hasAttribute('hidden');
      panel.toggleAttribute('hidden', !open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  // Auto-open first recommended unfinished layer
  const career = currentCareer();
  const layers = (window.LabLadder && LabLadder.DEVOPS_SKILL_LAYERS) || [];
  const firstRec = layers.find((l) => LabLadder.isLayerRecommended(l.n, career) && layerProgress(l).pct < 100)
    || layers.find((l) => LabLadder.isLayerRecommended(l.n, career))
    || layers[0];
  if (firstRec) {
    const panel = root.querySelector(`#missions-${firstRec.id}`);
    const btn = root.querySelector(`[data-expand="${firstRec.id}"]`);
    if (panel && btn) {
      panel.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', 'true');
    }
  }
  root.querySelectorAll('[data-block]').forEach((btn) => {
    btn.addEventListener('click', () => { location.hash = `#/block/${btn.dataset.block}`; });
  });
}

async function renderBlock(root, blockId, levelId) {
  let block;
  try {
    block = await loadBlock(blockId);
  } catch {
    root.innerHTML = `<p class="pl-card">${t('blockBroken')}</p>`;
    return;
  }
  const prog = loadProgress()[blockId] || {};
  const currentId = levelId || block.levels[0]?.id;
  const meta = allBlocks().find((b) => b.id === blockId);
  const displayTitle = blockTitle(blockId) !== blockId ? blockTitle(blockId) : block.title;

  root.innerHTML = `
    <div class="hero-mini" id="hero-mini">
      ${archerSvg(archerRank().tier)}
      <div class="skill-orb-row compact">${SKILLS.map((s) => {
        const sc = skillScores()[s.id];
        const on = sc.done > 0;
        return `<span class="skill-orb ${on ? 'on' : ''}" style="--orb:${s.color}" title="${s.label}"></span>`;
      }).join('')}</div>
    </div>
    <section class="pl-card">
      <button type="button" class="ghost" id="pl-back">${t('backCabin')}</button>
      <h2>${PrepLevelsEngine.escapeHtml(displayTitle)}</h2>
      <p style="color:var(--muted)">${PrepLevelsEngine.escapeHtml(block.subtitle || '')}
        ${meta?.skill ? ` · ${t('orb')}: <strong>${meta.skill}</strong>` : ''}</p>
      <p class="pl-progress-line" id="pl-prog">${t('saved', countDone(prog), block.levels.length)}</p>
      <div class="pl-level-tabs" id="pl-tabs"></div>
      <div id="pl-level-body"></div>
    </section>`;

  root.querySelector('#pl-back').addEventListener('click', () => { location.hash = '#/'; });
  root.querySelector('#hero-mini')?.addEventListener('click', () => { location.hash = '#/'; });

  const tabs = root.querySelector('#pl-tabs');
  const body = root.querySelector('#pl-level-body');
  const progLine = root.querySelector('#pl-prog');

  function paintTabs(allProg) {
    const p = allProg[blockId] || {};
    tabs.querySelectorAll('.pl-level-tab').forEach((tab) => {
      tab.classList.toggle('done', !!p[tab.dataset.lid]);
    });
    progLine.textContent = t('saved', countDone(p), block.levels.length);
    const mini = root.querySelector('#hero-mini .skill-orb-row');
    if (mini) {
      mini.innerHTML = SKILLS.map((s) => {
        const sc = skillScores()[s.id];
        const on = sc.done > 0;
        return `<span class="skill-orb ${on ? 'on' : ''}" style="--orb:${s.color}" title="${s.label}"></span>`;
      }).join('');
    }
  }

  block.levels.forEach((level) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.dataset.lid = level.id;
    tab.className = `pl-level-tab ${level.id === currentId ? 'active' : ''} ${prog[level.id] ? 'done' : ''}`;
    tab.textContent = labelCap(level.tag || level.id);
    tab.title = level.title;
    tab.addEventListener('click', () => { location.hash = `#/block/${blockId}/${level.id}`; });
    tabs.appendChild(tab);
  });

  const level = block.levels.find((l) => l.id === currentId) || block.levels[0];
  body.innerHTML = '';
  PrepLevelsEngine.renderLevel(body, level, (lid) => {
    const all = loadProgress();
    all[blockId] = { ...(all[blockId] || {}), [lid]: true };
    saveProgress(all);
    paintTabs(all);
  });
}

function paintShareCard(canvas, rank, scores) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, '#0f1419');
  grd.addColorStop(0.55, '#1a2332');
  grd.addColorStop(1, '#152018');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // soft divider
  ctx.fillStyle = 'rgba(45,58,79,.45)';
  ctx.fillRect(W * 0.58, 24, 1, H - 48);

  ctx.fillStyle = '#e8a84b';
  ctx.font = 'bold 26px Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(t('claimTitle'), 40, 52);
  ctx.fillStyle = '#e8eef5';
  ctx.font = 'bold 34px Segoe UI, sans-serif';
  ctx.fillText(rank.title, 40, 100);
  ctx.fillStyle = '#8b9cb3';
  ctx.font = '15px Segoe UI, sans-serif';
  ctx.fillText(t('skillsLit'), 40, 138);

  let y = 172;
  SKILLS.forEach((s) => {
    const sc = scores[s.id];
    ctx.fillStyle = sc.done > 0 ? s.color : '#2d3a4f';
    ctx.beginPath();
    ctx.arc(54, y - 5, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8eef5';
    ctx.font = '17px Segoe UI, sans-serif';
    ctx.fillText(`${s.label}  ${sc.done}/${sc.total}`, 76, y);
    y += 34;
  });

  ctx.fillStyle = '#8b9cb3';
  ctx.font = '13px Segoe UI, sans-serif';
  ctx.fillText('devops-lab-gym.web.app', 40, H - 28);

  // Hero on the right
  drawMageOnCanvas(ctx, W - 250, 48, 1.05, rank.tier);
}

function renderShare(root) {
  const rank = archerRank();
  const scores = skillScores();
  const caption = shareCaption(rank, scores);
  root.innerHTML = `
    ${renderHeroCabin()}
    <section class="pl-card">
      <button type="button" class="ghost" id="pl-back">${t('backCabin')}</button>
      <h2>${t('shareTitle')}</h2>
      <p style="color:var(--muted)">${t('shareLede')}</p>
      <canvas id="share-canvas" width="720" height="420"></canvas>
      <label class="share-caption-label" for="share-caption">${t('shareCaptionLabel')}</label>
      <textarea id="share-caption" class="share-caption" rows="5"></textarea>
      <div class="hero-actions share-bar" style="margin-top:12px">
        <button type="button" id="btn-dl">${t('btnDl')}</button>
        <button type="button" class="share-li" id="btn-li">${t('btnLi')}</button>
        <button type="button" class="share-ig" id="btn-ig">${t('btnIg')}</button>
        <button type="button" class="share-x" id="btn-x">${t('btnX')}</button>
        <button type="button" class="share-th" id="btn-th">${t('btnThreads')}</button>
        <button type="button" class="ghost" id="btn-copy">${t('btnCopy')}</button>
        <button type="button" class="ghost" id="btn-native" hidden>${t('btnNative')}</button>
      </div>
      <p class="share-hint" id="share-hint" style="color:var(--muted);font-size:13px;margin:10px 0 0"></p>
    </section>`;
  wireHero(root);
  root.querySelector('#pl-back').addEventListener('click', () => { location.hash = '#/'; });

  const canvas = root.querySelector('#share-canvas');
  paintShareCard(canvas, rank, scores);
  const ta = root.querySelector('#share-caption');
  ta.value = caption;
  const hint = root.querySelector('#share-hint');
  const getCaption = () => ta.value.trim();
  const setHint = (msg) => { hint.textContent = msg; };

  root.querySelector('#btn-dl').addEventListener('click', () => {
    downloadCanvasPng(canvas, `de-mage-${rank.tier}.png`);
    setHint(t('hintDl'));
  });

  root.querySelector('#btn-copy').addEventListener('click', async () => {
    const ok = await copyText(getCaption());
    setHint(ok ? t('hintCopyOk') : t('hintCopyFail'));
  });

  root.querySelector('#btn-li').addEventListener('click', async () => {
    await copyText(getCaption());
    // LinkedIn feed share only accepts URL; body text must be pasted (API restriction).
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(GYM_URL)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setHint(t('hintLi'));
  });

  root.querySelector('#btn-ig').addEventListener('click', async () => {
    await copyText(getCaption());
    downloadCanvasPng(canvas, `de-mage-${rank.tier}.png`);
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    setHint(t('hintIg'));
  });

  root.querySelector('#btn-x').addEventListener('click', async () => {
    const text = getCaption();
    await copyText(text);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setHint(t('hintX'));
  });

  root.querySelector('#btn-th').addEventListener('click', async () => {
    const text = getCaption();
    await copyText(text);
    // Threads has no stable compose autofill URL from web; open + paste.
    window.open('https://www.threads.net/', '_blank', 'noopener,noreferrer');
    setHint(t('hintThreads'));
  });

  const nativeBtn = root.querySelector('#btn-native');
  if (navigator.share) {
    nativeBtn.hidden = false;
    nativeBtn.addEventListener('click', async () => {
      try {
        const blob = await (await fetch(canvas.toDataURL('image/png'))).blob();
        const file = new File([blob], `devops-archer-${rank.tier}.png`, { type: 'image/png' });
        const data = { title: `DevOps Lab · ${rank.title}`, text: getCaption(), url: GYM_URL };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ ...data, files: [file] });
        } else {
          await navigator.share(data);
        }
        setHint(t('hintShareOk'));
      } catch (e) {
        if (e && e.name === 'AbortError') setHint(t('hintShareAbort'));
        else setHint(t('hintShareFail'));
      }
    });
  }
}

async function render() {
  paintChrome();
  const root = document.getElementById('app');
  const route = parseRoute();
  if (route.view === 'home') renderHome(root);
  else if (route.view === 'share') renderShare(root);
  else if (route.view === 'interview' && window.InterviewHub) {
    await InterviewHub.render(root, route);
  } else await renderBlock(root, route.blockId, route.levelId);
}

window.loadProgress = loadProgress;

window.addEventListener('hashchange', render);
window.addEventListener('site:langchange', () => {
  if (window.InterviewHub) InterviewHub.clearCache();
  render();
});
render();
