/* SVG / chart visuals for theory levels — less wall-of-text. */
(function initTheoryViz(global) {
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function layerStack(spec) {
    const wrap = el('div', 'pl-viz pl-viz-layers');
    if (spec.title) wrap.appendChild(el('p', 'pl-viz-caption', esc(spec.title)));
    const stack = el('div', 'pl-viz-layer-stack');
    (spec.layers || []).forEach((L, i) => {
      const row = el('div', 'pl-viz-layer');
      row.style.setProperty('--layer', L.color || '#5b8def');
      row.innerHTML = `<span class="pl-viz-ico">${esc(L.icon || '▣')}</span><div class="pl-viz-layer-text"><strong>${esc(L.label)}</strong><span>${esc(L.sublabel || '')}</span></div>`;
      stack.appendChild(row);
      if (i < spec.layers.length - 1) stack.appendChild(el('div', 'pl-viz-layer-arrow', '▼'));
    });
    wrap.appendChild(stack);
    if (spec.side?.length) {
      const side = el('div', 'pl-viz-side-tags');
      spec.side.forEach((s) => {
        side.innerHTML += `<div class="pl-viz-side-chip"><b>${esc(s.label)}</b> ${esc((s.items || []).join(' · '))}</div>`;
      });
      wrap.appendChild(side);
    }
    return wrap;
  }

  function pipelineH(spec) {
    const wrap = el('div', 'pl-viz pl-viz-pipe-h');
    const row = el('div', 'pl-viz-pipe-row');
    (spec.nodes || []).forEach((n, i) => {
      const node = el('div', 'pl-viz-pipe-node');
      node.style.setProperty('--node', n.color || '#3d9a6a');
      node.innerHTML = `<span>${esc(n.label)}</span><small>${esc(n.hint || '')}</small>`;
      row.appendChild(node);
      if (i < spec.nodes.length - 1) row.appendChild(el('span', 'pl-viz-pipe-arr', '→'));
    });
    wrap.appendChild(row);
    return wrap;
  }

  function starCompare() {
    const wrap = el('div', 'pl-viz pl-viz-star-compare');
    wrap.innerHTML = `
      <div class="pl-viz-compare-col" style="--hub:#3d9a6a">
        <h4>⭐ Star</h4>
        <svg viewBox="0 0 200 140" class="pl-viz-svg" aria-hidden="true">
          <rect x="70" y="50" width="60" height="40" rx="6" fill="#3d9a6a" opacity=".85"/>
          <text x="100" y="75" text-anchor="middle" fill="#fff" font-size="11">FACT</text>
          <rect x="10" y="20" width="50" height="28" rx="5" fill="#5b8def" opacity=".9"/>
          <text x="35" y="38" text-anchor="middle" fill="#fff" font-size="9">dim</text>
          <rect x="140" y="20" width="50" height="28" rx="5" fill="#5b8def" opacity=".9"/>
          <text x="165" y="38" text-anchor="middle" fill="#fff" font-size="9">dim</text>
          <line x1="60" y1="34" x2="70" y2="60" stroke="#8b9cb3" stroke-width="2"/>
          <line x1="140" y1="34" x2="130" y2="60" stroke="#8b9cb3" stroke-width="2"/>
          <text x="100" y="125" text-anchor="middle" fill="#8b9cb3" font-size="10">1 JOIN → dim</text>
        </svg>
        <p>Менше JOIN · BigQuery ❤️</p>
      </div>
      <div class="pl-viz-compare-col" style="--hub:#c77dff">
        <h4>❄️ Snowflake schema</h4>
        <svg viewBox="0 0 200 140" class="pl-viz-svg" aria-hidden="true">
          <rect x="75" y="55" width="50" height="35" rx="6" fill="#3d9a6a" opacity=".85"/>
          <text x="100" y="77" text-anchor="middle" fill="#fff" font-size="10">FACT</text>
          <rect x="20" y="15" width="45" height="24" rx="5" fill="#c77dff" opacity=".9"/>
          <text x="42" y="30" text-anchor="middle" fill="#fff" font-size="8">dim_prod</text>
          <rect x="5" y="55" width="40" height="22" rx="5" fill="#5b8def" opacity=".8"/>
          <text x="25" y="70" text-anchor="middle" fill="#fff" font-size="7">country</text>
          <line x1="65" y1="27" x2="75" y2="65" stroke="#8b9cb3" stroke-width="1.5"/>
          <line x1="45" y1="66" x2="75" y2="72" stroke="#8b9cb3" stroke-width="1.5"/>
          <text x="100" y="125" text-anchor="middle" fill="#8b9cb3" font-size="10">2+ JOIN → дорого</text>
        </svg>
        <p>Нормалізація · більше JOIN</p>
      </div>`;
    return wrap;
  }

  function sqlOrder(spec) {
    const steps = spec.steps || [
      { label: 'FROM', color: '#5b8def', note: 'таблиці' },
      { label: 'WHERE', color: '#4ecdc4', note: 'фільтр сирих рядків' },
      { label: 'GROUP BY', color: '#e8a84b', note: 'стискання' },
      { label: 'HAVING', color: '#ff6b6b', note: 'фільтр агрегатів' },
      { label: 'SELECT', color: '#3d9a6a', note: 'проєкція' },
      { label: 'ORDER BY', color: '#c77dff', note: 'сортування' },
    ];
    const wrap = el('div', 'pl-viz pl-viz-sql-order');
    const list = el('div', 'pl-viz-order-list');
    steps.forEach((s, i) => {
      const row = el('div', 'pl-viz-order-step');
      row.style.setProperty('--step', s.color || '#3d9a6a');
      row.innerHTML = `<span class="pl-viz-order-num">${i + 1}</span><strong>${esc(s.label)}</strong><span>${esc(s.note || '')}</span>`;
      list.appendChild(row);
    });
    wrap.appendChild(list);
    if (spec.over) {
      wrap.appendChild(el('div', 'pl-viz-over-window', `<span>⊕ OVER()</span> ${esc(spec.over)}`));
    }
    return wrap;
  }

  function miniTableHtml(spec, extraClass) {
    if (!spec?.headers?.length) return '';
    const cls = ['pl-mini-table', extraClass].filter(Boolean).join(' ');
    const cap = spec.title ? `<caption>${esc(spec.title)}</caption>` : '';
    const head = `<thead><tr>${spec.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>`;
    const body = (spec.rows || [])
      .map((row, ri) => {
        const hl = (spec.highlight || []).includes(ri) ? ' class="hl"' : '';
        return `<tr${hl}>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`;
      })
      .join('');
    return `<table class="${cls}">${cap}${head}<tbody>${body}</tbody></table>`;
  }

  function sqlGroupVsWindow(spec) {
    const wrap = el('div', 'pl-viz pl-viz-sql-compare');
    if (spec.title) wrap.appendChild(el('p', 'pl-viz-caption', esc(spec.title)));
    if (spec.source) {
      const src = el('div', 'pl-viz-sql-source');
      src.innerHTML = miniTableHtml(spec.source);
      wrap.appendChild(src);
    }
    const cols = el('div', 'pl-viz-sql-result-cols');
    (spec.columns || [spec.left, spec.right].filter(Boolean)).forEach((col) => {
      const c = el('div', 'pl-viz-sql-result-col');
      c.style.setProperty('--hub', col.color || '#5b8def');
      c.innerHTML = `
        <h4>${esc(col.title || '')}</h4>
        ${col.subtitle ? `<p class="pl-viz-sql-sub">${esc(col.subtitle)}</p>` : ''}
        ${miniTableHtml(col)}
        ${col.badge ? `<span class="pl-viz-sql-badge">${esc(col.badge)}</span>` : ''}`;
      cols.appendChild(c);
    });
    wrap.appendChild(cols);
    if (spec.footnote) wrap.appendChild(el('p', 'pl-viz-footnote', esc(spec.footnote)));
    return wrap;
  }

  function rankCompare(spec) {
    const wrap = el('div', 'pl-viz pl-viz-rank-compare');
    if (spec.title) wrap.appendChild(el('p', 'pl-viz-caption', esc(spec.title)));
    const tableWrap = el('div', 'pl-viz-rank-table-wrap');
    tableWrap.innerHTML = miniTableHtml({
      headers: spec.headers || ['name', 'score', 'RANK()', 'DENSE_RANK()', 'ROW_NUMBER()'],
      rows: spec.rows || [
        ['Ana', '90', '1', '1', '1'],
        ['Bob', '90', '1', '1', '2'],
        ['Cal', '80', '3', '2', '3'],
        ['Dan', '80', '3', '2', '4'],
      ],
      highlight: spec.highlight || [0, 1, 2, 3],
    });
    wrap.appendChild(tableWrap);
    const legend = el('div', 'pl-viz-rank-legend');
    (spec.notes || [
      { fn: 'RANK()', note: 'tie → однаковий ранг; наступний стрибає (1,1,3,3 — немає 2)' },
      { fn: 'DENSE_RANK()', note: 'tie → однаковий ранг; без пропуску (1,1,2,2)' },
      { fn: 'ROW_NUMBER()', note: 'завжди 1,2,3,4 — tie не ділить номер рядка' },
    ]).forEach((n) => {
      legend.innerHTML += `<div class="pl-viz-rank-note"><strong>${esc(n.fn)}</strong><span>${esc(n.note)}</span></div>`;
    });
    wrap.appendChild(legend);
    if (spec.footnote) wrap.appendChild(el('p', 'pl-viz-footnote', esc(spec.footnote)));
    return wrap;
  }

  function splitCompare(spec) {
    const wrap = el('div', 'pl-viz pl-viz-split');
    (spec.columns || []).forEach((col) => {
      const c = el('div', 'pl-viz-split-col');
      c.style.setProperty('--hub', col.color || '#5b8def');
      c.innerHTML = `<h4>${esc(col.title)}</h4><ul>${(col.items || []).map((it) => `<li>${esc(it)}</li>`).join('')}</ul>`;
      wrap.appendChild(c);
    });
    return wrap;
  }

  function barCompare(spec) {
    const wrap = el('div', 'pl-viz pl-viz-bars');
    const max = Math.max(...(spec.bars || []).map((b) => b.value), 1);
    const chart = el('div', 'pl-viz-bar-chart');
    (spec.bars || []).forEach((b) => {
      const pct = Math.round((b.value / max) * 100);
      chart.innerHTML += `
        <div class="pl-viz-bar-row">
          <span class="pl-viz-bar-label">${esc(b.label)}</span>
          <div class="pl-viz-bar-track"><div class="pl-viz-bar-fill" style="width:${pct}%;background:${esc(b.color || '#ff6b6b')}"></div></div>
          <span class="pl-viz-bar-val">${esc(b.caption || '')}</span>
        </div>`;
    });
    wrap.appendChild(chart);
    if (spec.footnote) wrap.appendChild(el('p', 'pl-viz-footnote', esc(spec.footnote)));
    return wrap;
  }

  function skillOrbit(spec) {
    const wrap = el('div', 'pl-viz pl-viz-orbit-skills');
    const center = el('div', 'pl-viz-orbit-core');
    center.textContent = spec.center || '🎒';
    wrap.appendChild(center);
    const slots = [
      { x: 50, y: 8 }, { x: 88, y: 38 }, { x: 78, y: 82 }, { x: 22, y: 82 }, { x: 12, y: 38 },
    ];
    (spec.items || []).forEach((it, i) => {
      const slot = slots[i % slots.length];
      const node = el('div', 'pl-viz-orbit-node');
      node.style.setProperty('--hub', it.color || '#3d9a6a');
      node.style.left = `${slot.x}%`;
      node.style.top = `${slot.y}%`;
      node.innerHTML = `<strong>${esc(it.title)}</strong><span>${esc(it.desc || '')}</span>`;
      wrap.appendChild(node);
    });
    return wrap;
  }

  function coverageSplit(spec) {
    const wrap = el('div', 'pl-viz pl-viz-coverage');
    wrap.innerHTML = `
      <div class="pl-viz-cov-yes">
        <h4>✅ ${esc(spec.yesTitle || 'Покриває')}</h4>
        <ul>${(spec.yes || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <div class="pl-viz-cov-no">
        <h4>⛔ ${esc(spec.noTitle || 'Не покриває')}</h4>
        <ul>${(spec.no || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>`;
    return wrap;
  }

  function dqGrid(spec) {
    const wrap = el('div', 'pl-viz pl-viz-dq-grid');
    (spec.checks || []).forEach((c) => {
      wrap.innerHTML += `
        <div class="pl-viz-dq-card" style="--hub:${esc(c.color || '#3d9a6a')}">
          <span class="pl-viz-dq-ico">${esc(c.icon || '✓')}</span>
          <strong>${esc(c.label)}</strong>
          <span>${esc(c.desc || '')}</span>
        </div>`;
    });
    return wrap;
  }

  function flowVisual(flow) {
    const wrap = el('div', 'pl-viz pl-viz-flow-visual');
    const row = el('div', 'pl-viz-flow-row');
    const colors = ['#5b8def', '#3d9a6a', '#e8a84b', '#c77dff', '#4ecdc4', '#ff6b6b'];
    flow.forEach((step, i) => {
      const chip = el('div', 'pl-viz-flow-chip');
      chip.style.setProperty('--hub', colors[i % colors.length]);
      chip.innerHTML = `<strong>${esc(step.title)}</strong><span>${esc(step.desc || '')}</span>`;
      row.appendChild(chip);
      if (i < flow.length - 1) row.appendChild(el('span', 'pl-viz-flow-link', '→'));
    });
    wrap.appendChild(row);
    return wrap;
  }

  function conceptCards(spec) {
    const wrap = el('div', 'pl-viz pl-viz-concept-cards');
    if (spec.title) wrap.appendChild(el('p', 'pl-viz-caption', esc(spec.title)));
    const grid = el('div', 'pl-viz-concept-grid');
    (spec.cards || []).forEach((card) => {
      const c = el('div', 'pl-viz-concept-card');
      c.style.setProperty('--hub', card.color || '#5b8def');
      const rows = (card.rows || []).map((r) => {
        const mark = r.ok === false ? '❌' : r.ok === true ? '✅' : '·';
        const cls = r.ok === false ? 'bad' : r.ok === true ? 'ok' : '';
        return `<li class="${cls}"><span class="pl-viz-mark">${mark}</span><code>${esc(r.text || r)}</code></li>`;
      }).join('');
      c.innerHTML = `
        <div class="pl-viz-concept-head">
          <span class="pl-viz-concept-ico">${esc(card.icon || '◇')}</span>
          <div>
            <strong>${esc(card.title || '')}</strong>
            ${card.badge ? `<span class="pl-viz-concept-badge">${esc(card.badge)}</span>` : ''}
          </div>
        </div>
        ${card.hint ? `<p class="pl-viz-concept-hint">${esc(card.hint)}</p>` : ''}
        <ul>${rows}</ul>`;
      grid.appendChild(c);
    });
    wrap.appendChild(grid);
    if (spec.footnote) wrap.appendChild(el('p', 'pl-viz-footnote', esc(spec.footnote)));
    return wrap;
  }

  function typeFamily(spec) {
    const wrap = el('div', 'pl-viz pl-viz-type-family');
    if (spec.title) wrap.appendChild(el('p', 'pl-viz-caption', esc(spec.title)));
    const grid = el('div', 'pl-viz-type-grid');
    (spec.families || []).forEach((fam) => {
      const col = el('div', 'pl-viz-type-col');
      col.style.setProperty('--hub', fam.color || '#5b8def');
      const traits = (fam.traits || []).map((t) => {
        const icon = t.yes === false ? '⛔' : t.yes === true ? '✅' : '→';
        return `<li><span>${icon}</span><span><b>${esc(t.label)}</b> ${esc(t.value || '')}</span></li>`;
      }).join('');
      const nest = (fam.canHold || []).map((h) => `<span class="pl-viz-type-chip">${esc(h)}</span>`).join('');
      const notHold = (fam.cannotHold || []).map((h) => `<span class="pl-viz-type-chip no">${esc(h)}</span>`).join('');
      col.innerHTML = `
        <div class="pl-viz-type-head">
          <span class="pl-viz-type-ico">${esc(fam.icon || '◇')}</span>
          <div>
            <strong>${esc(fam.title)}</strong>
            <small>${esc(fam.types || '')}</small>
          </div>
        </div>
        <ul class="pl-viz-type-traits">${traits}</ul>
        ${nest ? `<div class="pl-viz-type-hold"><span class="pl-viz-type-hold-label">${esc(fam.holdLabel || 'всередині ✅')}</span><div>${nest}</div></div>` : ''}
        ${notHold ? `<div class="pl-viz-type-hold"><span class="pl-viz-type-hold-label">${esc(fam.noHoldLabel || 'не можна ⛔')}</span><div>${notHold}</div></div>` : ''}`;
      grid.appendChild(col);
    });
    wrap.appendChild(grid);
    if (spec.footnote) wrap.appendChild(el('p', 'pl-viz-footnote', esc(spec.footnote)));
    return wrap;
  }

  function accessRules(spec) {
    const wrap = el('div', 'pl-viz pl-viz-access-rules');
    if (spec.title) wrap.appendChild(el('p', 'pl-viz-caption', esc(spec.title)));
    const table = el('div', 'pl-viz-access-table');
    table.innerHTML = `
      <div class="pl-viz-access-head">
        <span>${esc(spec.colA || 'доступ')}</span>
        <span>${esc(spec.colB || 'що треба')}</span>
        <span>${esc(spec.colC || 'приклад')}</span>
      </div>`;
    (spec.rows || []).forEach((r) => {
      table.innerHTML += `
        <div class="pl-viz-access-row" style="--hub:${esc(r.color || '#5b8def')}">
          <span class="pl-viz-access-who"><b>${esc(r.icon || '')} ${esc(r.who)}</b></span>
          <span>${esc(r.need)}</span>
          <code>${esc(r.example)}</code>
        </div>`;
    });
    wrap.appendChild(table);
    if (spec.footnote) wrap.appendChild(el('p', 'pl-viz-footnote', esc(spec.footnote)));
    return wrap;
  }

  const renderers = {
    layerStack,
    pipelineH,
    starCompare,
    sqlOrder,
    splitCompare,
    barCompare,
    skillOrbit,
    coverageSplit,
    dqGrid,
    sqlGroupVsWindow,
    rankCompare,
    conceptCards,
    typeFamily,
    accessRules,
  };

  function mount(parent, spec) {
    if (!parent || !spec?.type) return;
    const fn = renderers[spec.type];
    if (fn) parent.appendChild(fn(spec));
  }

  function mountFlow(parent, flow) {
    if (!parent || !flow?.length) return;
    parent.appendChild(flowVisual(flow));
  }

  function mountDiagramFallback(parent, level) {
    if (!level?.diagram) return;
    const det = document.createElement('details');
    det.className = 'pl-viz-text-fallback';
    det.innerHTML = `<summary>${esc(level.diagramSummary || 'Текстова схема')}</summary>`;
    const pre = document.createElement('pre');
    pre.className = 'pl-diagram';
    pre.textContent = level.diagram;
    det.appendChild(pre);
    parent.appendChild(det);
  }

  global.TheoryViz = { mount, mountFlow, mountDiagramFallback, renderers };
})(window);
