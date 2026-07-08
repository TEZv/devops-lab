/** Mirror of de-lab LabLadder contract — CareerTier × SkillLayer × Archer theme */
const CAREER_KEY = 'devops-lab-career-tier';
const CAREER_TIERS = [
  { id: 'intern', label: 'Intern / Apprentice', layers: [1, 2], blurb: 'Follow steps, learn vocabulary, complete with hints.' },
  { id: 'junior', label: 'Junior', layers: [1, 2], blurb: 'Do it hands-on; explain what you did.' },
  { id: 'middle', label: 'Middle', layers: [1, 2, 3, 4], blurb: 'Design trade-offs; debug without hints.' },
  { id: 'senior', label: 'Senior', layers: [1, 2, 3, 4, 5, 6], accent: [5, 6], blurb: 'Own architecture, SRE mindset, production incidents.' },
  { id: 'lead', label: 'Team Lead', layers: [1, 2, 3, 4, 5, 6], blurb: 'Mentor the team; set delivery bars and day-1 culture.' },
  { id: 'head', label: 'Head of Platform', layers: [1, 2, 3, 4, 5, 6], blurb: 'Platform strategy, reliability roadmap, hiring bar.' },
];
const LAYERS = [
  { n: 1, icon: '🐧', title: 'Linux & shell', href: '../CHALLENGES.md' },
  { n: 2, icon: '🔀', title: 'Git / CI', href: '../ci-cd/' },
  { n: 3, icon: '🐳', title: 'Docker', href: '../docker/' },
  { n: 4, icon: '🏗️', title: 'IaC (Terraform)', href: '../terraform/' },
  { n: 5, icon: '☸️', title: 'K8s-lite', href: '../k8s/' },
  { n: 6, icon: '🛡️', title: 'Production habits', href: '../SPOT-CHECK.md' },
];

function loadCareer() {
  try {
    const id = localStorage.getItem(CAREER_KEY) || 'intern';
    return CAREER_TIERS.find((c) => c.id === id) || CAREER_TIERS[0];
  } catch { return CAREER_TIERS[0]; }
}
function saveCareer(id) {
  try { localStorage.setItem(CAREER_KEY, id); } catch { /* */ }
}

function archerSvg() {
  return `<svg class="hero-svg" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="auraA" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#4ecdc4" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#4ecdc4" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="95" r="88" fill="url(#auraA)"/>
    <ellipse cx="100" cy="175" rx="46" ry="14" fill="#0a1018" opacity=".55"/>
    <path d="M60 115 Q100 195 140 115 L140 188 Q100 205 60 188 Z" fill="#1a2332" stroke="#4ecdc4" stroke-width="2"/>
    <circle cx="100" cy="78" r="26" fill="#d4b896"/>
    <path d="M78 68 Q100 48 122 68 L116 76 Q100 60 84 76 Z" fill="#1a1525" stroke="#4ecdc4" stroke-width="1.5"/>
    <circle cx="92" cy="76" r="2.5" fill="#1a1525"/>
    <circle cx="108" cy="76" r="2.5" fill="#1a1525"/>
    <path d="M48 70 Q28 110 48 150" fill="none" stroke="#e8a84b" stroke-width="3"/>
    <line x1="48" y1="70" x2="48" y2="150" stroke="#e8a84b" stroke-width="2"/>
    <line x1="52" y1="110" x2="130" y2="95" stroke="#8b9cb3" stroke-width="2"/>
    <polygon points="130,95 118,90 118,100" fill="#ff6b6b"/>
    <text x="100" y="214" text-anchor="middle" fill="#8b9cb3" font-size="11" font-family="Segoe UI,sans-serif">DevOps Archer</text>
  </svg>`;
}

function render() {
  const career = loadCareer();
  const root = document.getElementById('app');
  root.innerHTML = `
    <aside class="hero-cabin">
      <div>${archerSvg()}</div>
      <div>
        <p class="eyebrow">Your avatar in DevOps Lab</p>
        <h2 class="rank">Archer · ${career.label}</h2>
        <p class="muted">${career.blurb}</p>
        <p class="muted">Interactive drills come later — same engine family as DE Lab Mage. For now: staircase → markdown.</p>
      </div>
    </aside>
    <section class="card">
      <h2>Current career level</h2>
      <p class="muted">Synced model with DE Lab (Intern → Head). Highlights recommended layers.</p>
      <div class="tier-row">
        ${CAREER_TIERS.map((c) => `
          <button type="button" class="tier ${c.id === career.id ? 'active' : ''}" data-career="${c.id}">${c.label}</button>
        `).join('')}
      </div>
    </section>
    <section class="card">
      <div class="stair-head">
        <div>
          <h2>DevOps skill staircase</h2>
          <p class="muted">Blocks bottom → top. Bow theme; Mage lives in DE Lab.</p>
        </div>
        <span class="trophy">🏆</span>
      </div>
      <div class="stair-layout">
        <div class="dock">${archerSvg()}</div>
        <div class="steps">
          ${LAYERS.slice().reverse().map((l) => {
            const rec = career.layers.includes(l.n);
            const acc = (career.accent || []).includes(l.n);
            return `
              <a class="step ${rec ? 'rec' : ''} ${acc ? 'acc' : ''}" style="--step:${l.n}" href="${l.href}">
                <span class="ico">${l.icon}</span>
                <strong>${l.n}. ${l.title}</strong>
                ${rec ? '<span class="badge">for you</span>' : ''}
              </a>`;
          }).join('')}
          <div class="base">↑ Foundations · one step at a time</div>
        </div>
      </div>
    </section>`;

  root.querySelectorAll('[data-career]').forEach((btn) => {
    btn.addEventListener('click', () => {
      saveCareer(btn.dataset.career);
      render();
    });
  });
}

render();
