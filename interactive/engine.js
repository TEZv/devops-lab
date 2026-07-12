/* Prep Levels Engine — fill blanks (drag), flip cards, pipeline build, scenario, … */
(function initPrepLevelsEngine(global) {
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const ARCHETYPE_THEMES = {
    product: { color: '#5b8def', glyph: '📱', sigil: 'LTV' },
    market: { color: '#e8a84b', glyph: '🛒', sigil: 'JOIN' },
    media: { color: '#c77dff', glyph: '📺', sigil: 'CLEAN' },
    consult: { color: '#4ecdc4', glyph: '🔬', sigil: 'LIVE' },
    fintech: { color: '#ff6b6b', glyph: '💳', sigil: 'DEDUP' },
  };

  const ORBIT_SLOTS = [
    { x: 50, y: 16 },
    { x: 88, y: 38 },
    { x: 74, y: 84 },
    { x: 26, y: 84 },
    { x: 12, y: 38 },
  ];

  function archetypeTheme(themeId) {
    return ARCHETYPE_THEMES[themeId] || { color: '#8b9cb3', glyph: '◇', sigil: '?' };
  }

  /** Перше слово з малої → з великої (карта → Карта, cohort у рядку — у JSON). */
  function labelCap(value) {
    const s = String(value ?? '').trim();
    if (!s || /^[A-ZА-ЯІЇЄҐ0-9"«]/.test(s)) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function ui(key, ...args) {
    return (global.DeLabI18n && DeLabI18n.t(key, ...args)) || key;
  }

  function formatCode(code, lang) {
    if (!code) return '';
    if (global.DeLabCodeFormat) {
      return DeLabCodeFormat.formatForDisplay(code, lang || DeLabCodeFormat.detectLang(code));
    }
    return String(code).replace(/\r\n/g, '\n');
  }

  function toast(root, text, ok = true) {
    const el = document.createElement('div');
    el.className = `pl-toast ${ok ? 'ok' : 'bad'}`;
    el.textContent = text;
    root.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  function mountTheory(root, level, onComplete) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-theory';

    if (level.story) {
      const story = document.createElement('div');
      story.className = 'pl-story';
      story.innerHTML = `<span class="pl-story-emoji">${escapeHtml(level.storyEmoji || '🎭')}</span><p>${escapeHtml(level.story)}</p>`;
      wrap.appendChild(story);
    }

    const vizSpecs = [
      ...(level.viz ? [level.viz] : []),
      ...(level.vizs || []),
    ];
    if (vizSpecs.length && global.TheoryViz) {
      vizSpecs.forEach((vizSpec) => {
        const vizBox = document.createElement('div');
        vizBox.className = 'pl-viz-mount';
        TheoryViz.mount(vizBox, vizSpec);
        wrap.appendChild(vizBox);
      });
    }

    if (level.flow?.length) {
      if (global.TheoryViz) {
        const flowBox = document.createElement('div');
        flowBox.className = 'pl-viz-mount';
        TheoryViz.mountFlow(flowBox, level.flow);
        wrap.appendChild(flowBox);
      } else {
        const flow = document.createElement('div');
        flow.className = 'pl-flow';
        level.flow.forEach((step, i) => {
          const chip = document.createElement('div');
          chip.className = 'pl-flow-step';
          chip.innerHTML = `<strong>${escapeHtml(step.title)}</strong><span>${escapeHtml(step.desc || '')}</span>`;
          flow.appendChild(chip);
          if (i < level.flow.length - 1) {
            const arrow = document.createElement('div');
            arrow.className = 'pl-flow-arrow';
            arrow.textContent = '→';
            flow.appendChild(arrow);
          }
        });
        wrap.appendChild(flow);
      }
    }

    if (level.diagram) {
      if (level.viz && global.TheoryViz) {
        TheoryViz.mountDiagramFallback(wrap, level);
      } else {
        const pre = document.createElement('pre');
        pre.className = 'pl-diagram pl-diagram-alive';
        pre.textContent = level.diagram;
        wrap.appendChild(pre);
      }
    }

    if (level.bullets?.length) {
      const ul = document.createElement('ul');
      level.bullets.forEach((b) => {
        const li = document.createElement('li');
        li.textContent = b;
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    }

    if (level.pairs?.length) {
      level.pairs.forEach((pair) => {
        const [a, b] = Array.isArray(pair) ? pair : [pair.left, pair.right];
        const row = document.createElement('p');
        row.className = 'pl-pair';
        row.innerHTML = `<strong>${escapeHtml(a)}</strong> ↔ ${escapeHtml(b)}`;
        wrap.appendChild(row);
      });
    }

    if (level.note) {
      const note = document.createElement('p');
      note.className = 'pl-note';
      note.textContent = level.note;
      wrap.appendChild(note);
    }

    appendRecallPanel(wrap, level);

    const actions = document.createElement('div');
    actions.className = 'pl-actions';
    const mark = document.createElement('button');
    mark.type = 'button';
    mark.textContent = ui('theoryMark');
    mark.addEventListener('click', () => {
      mark.disabled = true;
      mark.textContent = ui('theoryMarked');
      mark.classList.add('marked');
      toast(root, ui('theorySaved'), true);
      if (onComplete) onComplete(level.id);
    });
    actions.appendChild(mark);
    wrap.appendChild(actions);
    root.appendChild(wrap);
  }

  function mountFlipCards(root, level, onComplete) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-flip-grid';
    let opened = 0;
    const need = (level.cards || []).length;
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    feedback.textContent = ui('flipHint');

    (level.cards || []).forEach((card) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'pl-flip-card';
      el.innerHTML = `<span class="front">${escapeHtml(card.front)}</span><span class="back">${escapeHtml(card.back)}</span>`;
      el.addEventListener('click', () => {
        if (el.classList.contains('flipped')) return;
        el.classList.add('flipped');
        opened += 1;
        feedback.textContent = `Відкрито ${opened}/${need}`;
        if (opened === need) {
          feedback.textContent = ui('flipDone');
          toast(root, 'Картки пройдено', true);
          if (onComplete) onComplete(level.id);
        }
      });
      wrap.appendChild(el);
    });
    root.append(wrap, feedback);
  }

  function mountPipelineBuild(root, level, onComplete) {
    const stages = level.stages || [];
    const pool = shuffle([...(level.pool || stages.map((s) => s.label))]);
    const placed = stages.map(() => '');

    const board = document.createElement('div');
    board.className = 'pl-pipeline';
    const bank = document.createElement('div');
    bank.className = 'pl-word-bank';
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    const tip = document.createElement('p');
    tip.className = 'pl-tip';
    tip.textContent = level.instruction || 'Перетягни етапи на конвеєр зліва → направо.';

    function renderBoard() {
      board.innerHTML = '';
      stages.forEach((stage, i) => {
        const slot = document.createElement('div');
        slot.className = `pl-pipe-slot ${placed[i] ? 'filled' : ''}`;
        slot.dataset.i = String(i);
        slot.innerHTML = `<small>${escapeHtml(stage.hint || `Крок ${i + 1}`)}</small><strong>${escapeHtml(placed[i] || '____')}</strong>`;
        slot.addEventListener('dragover', (e) => e.preventDefault());
        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          const word = e.dataTransfer.getData('text/plain');
          if (word) {
            placed[i] = word;
            renderBoard();
          }
        });
        slot.addEventListener('click', () => {
          if (placed[i]) {
            placed[i] = '';
            renderBoard();
          }
        });
        board.appendChild(slot);
        if (i < stages.length - 1) {
          const a = document.createElement('div');
          a.className = 'pl-flow-arrow';
          a.textContent = '→';
          board.appendChild(a);
        }
      });
    }

    bank.innerHTML = '';
    pool.forEach((word) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pl-chip';
      chip.draggable = true;
      chip.textContent = word;
      chip.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', word));
      chip.addEventListener('click', () => {
        const idx = placed.findIndex((p) => !p);
        if (idx >= 0) {
          placed[idx] = word;
          renderBoard();
        }
      });
      bank.appendChild(chip);
    });

    const check = document.createElement('button');
    check.type = 'button';
    check.textContent = ui('btnCheckPipeline');
    check.addEventListener('click', () => {
      const ok = stages.every((s, i) => placed[i] === s.label);
      feedback.textContent = ok
        ? `✅ ${level.success || 'Конвеєр зібрано правильно!'}`
        : '❌ Ще не той порядок / етап. Клік по слоту — очистити.';
      if (ok) {
        toast(root, 'Пайплайн ОК', true);
        if (onComplete) onComplete(level.id);
      }
    });

    renderBoard();
    root.append(tip, board, bank, check, feedback);
  }

  function mountScenario(root, level, onComplete) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-scenario';
    const scene = document.createElement('div');
    scene.className = 'pl-story';
    scene.innerHTML = `<span class="pl-story-emoji">${escapeHtml(level.emoji || '🧭')}</span><p>${escapeHtml(level.scene)}</p>`;
    const opts = document.createElement('div');
    opts.className = 'pl-options';
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';

    (level.choices || []).forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pl-option-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => {
        opts.querySelectorAll('.pl-option-btn').forEach((b) => { b.disabled = true; });
        const best = idx === level.bestIndex;
        btn.classList.add(best ? 'ok' : 'bad');
        feedback.textContent = `${best ? '✅' : '⚠️'} ${choice.feedback}`;
        if (best) {
          toast(root, 'Сильне рішення', true);
          if (onComplete) onComplete(level.id);
        } else if (choice.stillPass) {
          toast(root, 'Можна краще, але зараховано', true);
          if (onComplete) onComplete(level.id);
        }
      });
      opts.appendChild(btn);
    });

    wrap.append(scene, opts, feedback);
    root.appendChild(wrap);
  }

  function appendColumnGlossary(parent, glossary, headerOrder) {
    if (!glossary || typeof glossary !== 'object') return;
    const keys = (headerOrder && headerOrder.length)
      ? headerOrder.filter((h) => glossary[h])
      : Object.keys(glossary);
    if (!keys.length) return;
    const box = document.createElement('div');
    box.className = 'pl-col-glossary';
    const title = document.createElement('p');
    title.className = 'pl-col-glossary-title';
    title.textContent = ui('colGlossaryTitle');
    box.appendChild(title);
    const dl = document.createElement('dl');
    dl.className = 'pl-col-glossary-list';
    keys.forEach((key) => {
      const dt = document.createElement('dt');
      dt.textContent = key;
      const dd = document.createElement('dd');
      dd.textContent = glossary[key];
      dl.append(dt, dd);
    });
    box.appendChild(dl);
    parent.appendChild(box);
  }

  function appendMiniTable(parent, spec) {
    if (!spec?.headers?.length) return;
    const table = document.createElement('table');
    table.className = 'pl-mini-table';
    if (spec.title) {
      const cap = document.createElement('caption');
      cap.textContent = spec.title;
      table.appendChild(cap);
    }
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>${spec.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
    const tbody = document.createElement('tbody');
    (spec.rows || []).forEach((row, ri) => {
      const tr = document.createElement('tr');
      if ((spec.highlight || []).includes(ri)) tr.classList.add('hl');
      tr.innerHTML = row.map((c) => `<td>${escapeHtml(c)}</td>`).join('');
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
    parent.appendChild(table);
    appendColumnGlossary(parent, spec.columnGlossary, spec.headers);
    if (spec.caption) {
      const note = document.createElement('p');
      note.className = 'pl-tip';
      note.textContent = spec.caption;
      parent.appendChild(note);
    }
  }

  function mountMissionBrief(root, level) {
    if (!level.mission && !level.sampleTable && !level.why && !level.joinTables && !level.columnGlossary) return;
    const brief = document.createElement('div');
    brief.className = 'pl-mission';
    if (level.mission) {
      brief.innerHTML = `
        <div class="pl-mission-head">
          <span>${escapeHtml(level.mission.emoji || '🎯')}</span>
          <div>
            <strong>${escapeHtml(level.mission.title || ui('missionDefault'))}</strong>
            <p>${escapeHtml(level.mission.brief || '')}</p>
          </div>
        </div>`;
      if (level.mission.ask) {
        const ask = document.createElement('p');
        ask.className = 'pl-mission-ask';
        ask.textContent = level.mission.ask;
        brief.appendChild(ask);
      }
    }
    if (level.why) {
      const why = document.createElement('p');
      why.className = 'pl-tip';
      why.textContent = level.why;
      brief.appendChild(why);
    }
    if (level.sampleTable) {
      appendMiniTable(brief, level.sampleTable);
    }
    if (level.joinTables?.length) {
      const joinWrap = document.createElement('div');
      joinWrap.className = 'pl-join-tables';
      level.joinTables.forEach((jt) => appendMiniTable(joinWrap, jt));
      brief.appendChild(joinWrap);
      if (level.joinCaption) {
        const jc = document.createElement('p');
        jc.className = 'pl-tip';
        jc.textContent = level.joinCaption;
        brief.appendChild(jc);
      }
    }
    if (!level.sampleTable && level.columnGlossary) {
      appendColumnGlossary(brief, level.columnGlossary, level.headers);
    }
    root.appendChild(brief);
  }

  /** Cheat-sheet panel before checks: map, viz, numbered tips (Пригадати). */
  function appendRecallPanel(parent, level) {
    const hasViz = level.studyViz || (level.studyVizs && level.studyVizs.length);
    const tips = level.recallTips;
    const intro = level.recallIntro || level.studyIntro;
    if (!intro && !hasViz && !tips?.length && !level.recallMnemonic && !level.recallMapRef) return;

    const box = document.createElement('div');
    box.className = 'pl-recall-panel';
    const title = document.createElement('p');
    title.className = 'pl-recall-title';
    title.textContent = ui('recallTitle');
    box.appendChild(title);
    if (intro) {
      const h = document.createElement('p');
      h.className = 'pl-tip pl-recall-intro';
      h.innerHTML = intro;
      box.appendChild(h);
    }
    if (hasViz && global.TheoryViz) {
      const specs = level.studyVizs || (level.studyViz ? [level.studyViz] : []);
      specs.forEach((vizSpec) => {
        const vizBox = document.createElement('div');
        vizBox.className = 'pl-viz-mount pl-viz-mount-recall';
        TheoryViz.mount(vizBox, vizSpec);
        box.appendChild(vizBox);
      });
    }
    if (tips?.length) {
      const ul = document.createElement('ul');
      ul.className = 'pl-recall-tips';
      tips.forEach((t, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="pl-recall-num">${i + 1}</span><span>${escapeHtml(t)}</span>`;
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    if (level.recallMnemonic) {
      const m = document.createElement('p');
      m.className = 'pl-recall-mnemonic';
      m.textContent = level.recallMnemonic;
      box.appendChild(m);
    }
    if (level.recallMapRef) {
      const r = document.createElement('p');
      r.className = 'pl-recall-mapref';
      r.textContent = level.recallMapRef;
      box.appendChild(r);
    }
    parent.appendChild(box);
  }

  function mountPickRows(root, level, onComplete) {
    mountMissionBrief(root, level);
    appendRecallPanel(root, level);
    const selected = new Set();
    const need = (level.rows || []).filter((r) => r.correct).map((r) => String(r.id));
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    feedback.textContent = level.pickHint || 'Клікай рядки, які мають лишитися у відповіді. Злі/дорожчі — не чіпай.';

    const table = document.createElement('table');
    table.className = 'pl-mini-table pl-pick-table';
    const headers = level.headers || Object.keys(level.rows[0] || {}).filter((k) => k !== 'correct');
    table.innerHTML = `<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}<th>pick</th></tr></thead>`;
    if (level.columnGlossary && !level.sampleTable) {
      appendColumnGlossary(root, level.columnGlossary, headers);
    }
    const tbody = document.createElement('tbody');

    (level.rows || []).forEach((row) => {
      const tr = document.createElement('tr');
      tr.dataset.id = String(row.id);
      tr.innerHTML = `${headers.map((h) => `<td>${escapeHtml(row[h])}</td>`).join('')}<td class="pick-mark">○</td>`;
      tr.addEventListener('click', () => {
        if (selected.has(tr.dataset.id)) {
          selected.delete(tr.dataset.id);
          tr.classList.remove('picked');
          tr.querySelector('.pick-mark').textContent = '○';
        } else {
          selected.add(tr.dataset.id);
          tr.classList.add('picked');
          tr.querySelector('.pick-mark').textContent = '●';
        }
        feedback.textContent = `Обрано ${selected.size} · треба ${need.length}`;
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const check = document.createElement('button');
    check.type = 'button';
    check.textContent = ui('btnCheckPick');
    check.addEventListener('click', () => {
      const ok = need.length === selected.size && need.every((id) => selected.has(id));
      if (ok) {
        feedback.textContent = `✅ ${level.success || 'Саме ці рядки = rn = 1 після PARTITION!'}`;
        toast(root, 'Місія: дані обрані', true);
        tbody.querySelectorAll('tr').forEach((tr) => {
          const id = tr.dataset.id;
          if (need.includes(id)) tr.classList.add('hl');
          else if (selected.has(id)) tr.classList.add('bad-pick');
        });
        if (onComplete) onComplete(level.id);
      } else {
        feedback.textContent = '❌ Не той набір. Підказка: спочатку відкинь evil, потім найдешевшу в кожній парі (power, age).';
        toast(root, ui('pickRowsMiss') || 'Wrong set', false);
      }
    });

    root.append(table, check, feedback);
  }

  function mountFillBlanks(root, level, onComplete) {
    mountMissionBrief(root, level);
    appendRecallPanel(root, level);
    const answers = level.answers || [];
    const filled = answers.map(() => '');
    let activeSlot = 0;
    const bank = shuffle([...(level.wordBank || answers)]);

    const templateEl = document.createElement('div');
    templateEl.className = 'pl-blank-template';
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    const tip = document.createElement('p');
    tip.className = 'pl-tip';
    tip.textContent = level.controlTip || ui('fillTipDefault');

    function nextEmpty(from = 0) {
      for (let i = from; i < answers.length; i += 1) if (!filled[i]) return i;
      for (let i = 0; i < from; i += 1) if (!filled[i]) return i;
      return -1;
    }

    function placeWord(word, slotIndex) {
      const target = slotIndex >= 0 ? slotIndex : nextEmpty(activeSlot);
      if (target < 0) return;
      filled[target] = word;
      activeSlot = nextEmpty(target + 1);
      if (activeSlot < 0) activeSlot = target;
      renderTemplate();
    }

    const templateFormatted = formatCode(level.template, level.codeLang);

    function renderTemplate() {
      const parts = templateFormatted.split('____');
      templateEl.innerHTML = parts.map((part, i) => {
        if (i >= answers.length) return escapeHtml(part);
        const val = filled[i];
        const cls = [
          'pl-slot',
          val ? 'filled' : 'empty',
          i === activeSlot ? 'active' : '',
        ].filter(Boolean).join(' ');
        return `${escapeHtml(part)}<span class="${cls}" data-i="${i}" tabindex="0">${escapeHtml(val || '____')}</span>`;
      }).join('');

      templateEl.querySelectorAll('.pl-slot').forEach((el) => {
        const i = Number(el.dataset.i);
        el.addEventListener('click', () => {
          if (filled[i]) {
            filled[i] = '';
            activeSlot = i;
          } else {
            activeSlot = i;
          }
          renderTemplate();
        });
        el.addEventListener('dragover', (e) => {
          e.preventDefault();
          el.classList.add('drop-target');
        });
        el.addEventListener('dragleave', () => el.classList.remove('drop-target'));
        el.addEventListener('drop', (e) => {
          e.preventDefault();
          el.classList.remove('drop-target');
          const word = e.dataTransfer.getData('text/plain');
          if (word) placeWord(word, i);
        });
      });
    }

    const bankEl = document.createElement('div');
    bankEl.className = 'pl-word-bank';
    bank.forEach((word) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'pl-chip';
      chip.textContent = word;
      chip.draggable = true;
      chip.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', word);
        chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
      chip.addEventListener('click', () => placeWord(word, activeSlot));
      bankEl.appendChild(chip);
    });

    const actions = document.createElement('div');
    actions.className = 'pl-actions';
    const check = document.createElement('button');
    check.type = 'button';
    check.textContent = ui('btnCheck');
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'ghost';
    reset.textContent = ui('btnReset');
    const hint = document.createElement('button');
    hint.type = 'button';
    hint.className = 'ghost';
    hint.textContent = ui('btnHint');
    let hintsUsed = 0;
    const hints = level.hints || [];

    check.addEventListener('click', () => {
      const ok = answers.every((a, i) => filled[i] === a);
      feedback.textContent = ok
        ? ui('fillOk')
        : (level.revealOnFail === false
          ? ui('fillMiss')
          : ui('fillMissReveal', answers.join(', ')));
      if (ok) {
        toast(root, ui('fillCredited'), true);
        if (onComplete) onComplete(level.id);
      }
    });
    reset.addEventListener('click', () => {
      filled.fill('');
      activeSlot = 0;
      renderTemplate();
      feedback.textContent = '';
    });
    hint.addEventListener('click', () => {
      if (hints[hintsUsed]) {
        feedback.textContent = `💡 ${hints[hintsUsed]}`;
        hintsUsed += 1;
      } else {
        feedback.textContent = ui('hintsDone');
      }
    });

    actions.append(check, reset, hint);
    renderTemplate();
    root.append(tip, templateEl, bankEl, actions, feedback);
  }

  function mountDragOrder(root, level, onComplete) {
    mountMissionBrief(root, level);
    appendRecallPanel(root, level);
    const order = shuffle(level.items);
    const list = document.createElement('div');
    list.className = 'pl-drag-list';
    order.forEach((text) => {
      const item = document.createElement('div');
      item.className = 'pl-drag-item';
      item.draggable = true;
      item.textContent = text;
      item.dataset.value = text;
      item.addEventListener('dragstart', () => item.classList.add('dragging'));
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
      item.addEventListener('dragover', (e) => e.preventDefault());
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragging = list.querySelector('.dragging');
        if (!dragging || dragging === item) return;
        const nodes = [...list.children];
        if (nodes.indexOf(dragging) < nodes.indexOf(item)) item.after(dragging);
        else item.before(dragging);
      });
      list.appendChild(item);
    });
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    const check = document.createElement('button');
    check.type = 'button';
    check.textContent = ui('btnCheckOrder');
    check.addEventListener('click', () => {
      const current = [...list.children].map((n) => n.dataset.value);
      const ok = current.every((v, i) => v === level.items[i]);
      feedback.textContent = ok ? ui('dragOrderOk') : ui('dragOrderFail');
      if (ok) {
        toast(root, ui('dragOrderToast'), true);
        if (onComplete) onComplete(level.id);
      }
    });
    root.append(list, check, feedback);
  }

  function mountMatch(root, level, onComplete) {
    const PAIR_COLORS = ['#3d9a6a', '#e8a84b', '#5b8def', '#c77dff', '#4ecdc4', '#ff6b6b'];
    const wrap = document.createElement('div');
    wrap.className = 'pl-match-wrap';

    const startMatch = () => {
      wrap.innerHTML = '';
      const tip = document.createElement('p');
      tip.className = 'pl-tip';
      tip.textContent = level.matchTip || ui('matchTipDefault');
      wrap.appendChild(tip);

      const arena = document.createElement('div');
      arena.className = 'pl-match-arena';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('pl-match-svg');
      svg.setAttribute('aria-hidden', 'true');

      const grid = document.createElement('div');
      grid.className = 'pl-match-grid';
      const leftCol = document.createElement('div');
      leftCol.className = 'pl-match-col';
      const rightCol = document.createElement('div');
      rightCol.className = 'pl-match-col';

      const leftItems = level.pairs.map((p) => p.left);
      const rightItems = shuffle(level.pairs.map((p) => p.right));
      let selectedLeft = null;
      let matched = 0;
      const links = []; // { leftBtn, rightBtn, color }

      const feedback = document.createElement('p');
      feedback.className = 'pl-feedback';

      function paintLines() {
        const ar = arena.getBoundingClientRect();
        svg.setAttribute('width', String(ar.width));
        svg.setAttribute('height', String(ar.height));
        svg.style.width = `${ar.width}px`;
        svg.style.height = `${ar.height}px`;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        links.forEach(({ leftBtn, rightBtn, color }) => {
          const a = leftBtn.getBoundingClientRect();
          const b = rightBtn.getBoundingClientRect();
          const x1 = a.right - ar.left;
          const y1 = a.top + a.height / 2 - ar.top;
          const x2 = b.left - ar.left;
          const y2 = b.top + b.height / 2 - ar.top;
          const mid = (x1 + x2) / 2;
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`);
          path.setAttribute('stroke', color);
          path.setAttribute('stroke-width', '3');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('opacity', '0.9');
          svg.appendChild(path);
          const dotL = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dotL.setAttribute('cx', String(x1));
          dotL.setAttribute('cy', String(y1));
          dotL.setAttribute('r', '4');
          dotL.setAttribute('fill', color);
          svg.appendChild(dotL);
          const dotR = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dotR.setAttribute('cx', String(x2));
          dotR.setAttribute('cy', String(y2));
          dotR.setAttribute('r', '4');
          dotR.setAttribute('fill', color);
          svg.appendChild(dotR);
        });
      }

      const pairByLeft = {};
      (level.pairs || []).forEach((p) => { pairByLeft[p.left] = p; });

      leftItems.forEach((text) => {
        const p = pairByLeft[text];
        const th = archetypeTheme(p?.themeId);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pl-match-btn pl-match-themed';
        btn.dataset.side = 'left';
        btn.dataset.value = text;
        btn.style.setProperty('--match', th.color);
        btn.innerHTML = `<span class="pl-match-sigil">${escapeHtml(th.sigil)}</span><span>${escapeHtml(text)}</span>`;
        btn.addEventListener('click', () => {
          if (btn.classList.contains('done')) return;
          leftCol.querySelectorAll('.pl-match-btn:not(.done)').forEach((b) => b.classList.remove('sel'));
          btn.classList.add('sel');
          selectedLeft = text;
          feedback.textContent = ui('matchPickRight');
        });
        leftCol.appendChild(btn);
      });

      rightItems.forEach((text) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pl-match-btn';
        btn.dataset.side = 'right';
        btn.dataset.value = text;
        btn.textContent = text;
        btn.addEventListener('click', () => {
          if (btn.classList.contains('done')) return;
          if (!selectedLeft) {
            feedback.textContent = ui('matchPickLeftFirst');
            return;
          }
          const pair = level.pairs.find((p) => p.left === selectedLeft && p.right === text);
          const leftBtn = [...leftCol.querySelectorAll('.pl-match-btn')].find((b) => b.dataset.value === selectedLeft);
          if (pair && leftBtn) {
            const color = archetypeTheme(pair.themeId).color || PAIR_COLORS[matched % PAIR_COLORS.length];
            btn.classList.add('done');
            leftBtn.classList.add('done');
            leftBtn.classList.remove('sel');
            btn.style.borderColor = color;
            leftBtn.style.borderColor = color;
            btn.style.boxShadow = `inset 0 0 0 2px ${color}`;
            leftBtn.style.boxShadow = `inset 0 0 0 2px ${color}`;
            links.push({ leftBtn, rightBtn: btn, color });
            selectedLeft = null;
            matched += 1;
            paintLines();
            feedback.textContent = matched === level.pairs.length
              ? ui('matchAllDone')
              : ui('matchPairOk', matched, level.pairs.length);
            if (matched === level.pairs.length) {
              toast(root, ui('matchCompleteToast'), true);
              if (onComplete) onComplete(level.id);
            }
          } else {
            feedback.textContent = ui('matchWrong');
            btn.classList.add('miss');
            setTimeout(() => btn.classList.remove('miss'), 450);
          }
        });
        rightCol.appendChild(btn);
      });

      grid.append(leftCol, rightCol);
      arena.append(svg, grid);
      wrap.append(arena, feedback);
      requestAnimationFrame(paintLines);
      window.addEventListener('resize', paintLines, { passive: true });
    };

    const studyFirst = level.studyFirst !== false;
    if (studyFirst) {
      const study = document.createElement('div');
      study.className = 'pl-match-study';
      const h = document.createElement('p');
      h.className = 'pl-tip';
      h.innerHTML = level.studyIntro || ui('matchStudyIntroDefault');
      study.appendChild(h);
      const vizSpecs = level.studyVizs || (level.studyViz ? [level.studyViz] : []);
      if (vizSpecs.length && global.TheoryViz) {
        vizSpecs.forEach((vizSpec) => {
          const vizBox = document.createElement('div');
          vizBox.className = 'pl-viz-mount pl-viz-mount-study';
          TheoryViz.mount(vizBox, vizSpec);
          study.appendChild(vizBox);
        });
      }
      const list = document.createElement('div');
      list.className = 'pl-study-list';
      (level.pairs || []).forEach((p) => {
        const th = archetypeTheme(p.themeId);
        const row = document.createElement('div');
        row.className = 'pl-study-row';
        row.style.setProperty('--pair', th.color);
        const hint = p.studyHint ? `<span class="pl-study-hint">${escapeHtml(p.studyHint)}</span>` : '';
        row.innerHTML = `
          <span class="pl-study-sigil" style="--sigil:${th.color}">${escapeHtml(p.sigil || th.sigil)}</span>
          <span class="pl-study-left">${escapeHtml(p.left)}</span>
          <span class="pl-study-arrow" aria-hidden="true">⟶</span>
          <span class="pl-study-right">${escapeHtml(p.right)}${hint}</span>`;
        list.appendChild(row);
      });
      study.appendChild(list);
      const go = document.createElement('button');
      go.type = 'button';
      go.textContent = level.studyCta || ui('matchStudyCtaDefault');
      go.addEventListener('click', startMatch);
      study.appendChild(go);
      const skipHint = document.createElement('p');
      skipHint.className = 'pl-feedback';
      skipHint.textContent = ui('matchStudySkip');
      study.appendChild(skipHint);
      wrap.appendChild(study);
    } else {
      startMatch();
    }

    root.appendChild(wrap);
  }

  function mountWhatsWrong(root, level, onComplete) {
    mountMissionBrief(root, level);
    appendRecallPanel(root, level);
    const wrap = document.createElement('div');
    wrap.className = 'pl-whats-wrong';
    if (level.viz && global.TheoryViz) {
      const vizBox = document.createElement('div');
      vizBox.className = 'pl-viz-mount';
      TheoryViz.mount(vizBox, level.viz);
      wrap.appendChild(vizBox);
    } else if (level.diagram) {
      const pre = document.createElement('pre');
      pre.className = 'pl-diagram';
      pre.textContent = level.diagram;
      wrap.appendChild(pre);
    }
    const code = document.createElement('pre');
    code.className = 'pl-code-buggy';
    code.textContent = formatCode(level.buggyCode, level.codeLang || 'sql');
    wrap.appendChild(code);
    const prompt = document.createElement('p');
    prompt.className = 'pl-tip';
    prompt.textContent = level.prompt || ui('whatsWrongPrompt');
    wrap.appendChild(prompt);
    const opts = document.createElement('div');
    opts.className = 'pl-options';
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';

    (level.options || []).forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pl-option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        const ok = idx === level.correctIndex;
        opts.querySelectorAll('.pl-option-btn').forEach((b) => { b.disabled = true; });
        btn.classList.add(ok ? 'ok' : 'bad');
        feedback.textContent = ok
          ? `✅ ${level.explainOk || ui('explainOkDefault')}`
          : `❌ ${level.explainFail || ui('explainFailDefault')} ${level.explanation || ''}`;
        if (ok) {
          toast(root, ui('toastDiagOk'), true);
          if (onComplete) onComplete(level.id);
        }
      });
      opts.appendChild(btn);
    });

    wrap.append(opts, feedback);
    root.appendChild(wrap);
  }

  function mountMultiChoice(root, level, onComplete) {
    mountMissionBrief(root, level);
    appendRecallPanel(root, level);
    const wrap = document.createElement('div');
    wrap.className = 'pl-mc';
    if (level.viz && global.TheoryViz) {
      const vizBox = document.createElement('div');
      vizBox.className = 'pl-viz-mount';
      TheoryViz.mount(vizBox, level.viz);
      wrap.appendChild(vizBox);
    } else if (level.diagram) {
      const pre = document.createElement('pre');
      pre.className = 'pl-diagram';
      pre.textContent = level.diagram;
      wrap.appendChild(pre);
    }
    const q = document.createElement('p');
    q.textContent = level.question || '';
    const opts = document.createElement('div');
    opts.className = 'pl-options';
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    (level.options || []).forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pl-option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        const ok = idx === level.correctIndex;
        opts.querySelectorAll('.pl-option-btn').forEach((b) => { b.disabled = true; });
        btn.classList.add(ok ? 'ok' : 'bad');
        feedback.textContent = ok
          ? `✅ ${level.explanation || ui('mcOkDefault')}`
          : `❌ ${level.explanation || ui('mcFailDefault')}`;
        if (ok) {
          toast(root, 'OK', true);
          if (onComplete) onComplete(level.id);
        }
      });
      opts.appendChild(btn);
    });
    wrap.append(q, opts, feedback);
    root.appendChild(wrap);
  }

  function renderLevel(container, level, onComplete) {
    const head = document.createElement('div');
    head.className = 'pl-level-head';
    const tag = level.tag ? `<span class="pl-tag">${escapeHtml(labelCap(level.tag))}</span>` : '';
    head.innerHTML = `${tag}<h3>${escapeHtml(level.title)}</h3><p>${escapeHtml(level.instruction || '')}</p>`;
    const body = document.createElement('div');
    container.append(head, body);

    switch (level.type) {
      case 'theory':
        mountTheory(body, level, onComplete);
        break;
      case 'flip_cards':
        mountFlipCards(body, level, onComplete);
        break;
      case 'pipeline_build':
        mountPipelineBuild(body, level, onComplete);
        break;
      case 'scenario':
        mountScenario(body, level, onComplete);
        break;
      case 'pick_rows':
        mountPickRows(body, level, onComplete);
        break;
      case 'fill_blanks':
        mountFillBlanks(body, level, onComplete);
        break;
      case 'drag_order':
        mountDragOrder(body, level, onComplete);
        break;
      case 'match_pairs':
        mountMatch(body, level, onComplete);
        break;
      case 'whats_wrong':
        mountWhatsWrong(body, level, onComplete);
        break;
      case 'multi_choice':
        mountMultiChoice(body, level, onComplete);
        break;
      case 'csv_lab':
        mountCsvLab(body, level, onComplete);
        break;
      case 'company_map':
        mountCompanyMap(body, level, onComplete);
        break;
      case 'aim_range':
        mountAimRange(body, level, onComplete);
        break;
      case 'fog_probe':
        mountFogProbe(body, level, onComplete);
        break;
      case 'constellation':
        mountConstellation(body, level, onComplete);
        break;
      default:
        body.textContent = 'Невідомий тип рівня.';
    }
  }

  function mountAimRange(root, level, onComplete) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-aim';
    const story = document.createElement('p');
    story.className = 'pl-tip';
    story.textContent = level.brief || 'Наведи кут і вистріли в правильний сектор.';
    const arena = document.createElement('div');
    arena.className = 'pl-aim-arena';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 320 320');
    svg.classList.add('pl-aim-svg');

    const cx = 160;
    const cy = 160;
    const sectors = level.sectors || [];
    const n = Math.max(sectors.length, 1);
    const slice = 360 / n;

    sectors.forEach((s, i) => {
      const a0 = ((i * slice - 90) * Math.PI) / 180;
      const a1 = (((i + 1) * slice - 90) * Math.PI) / 180;
      const r = 130;
      const d = [
        `M ${cx} ${cy}`,
        `L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)}`,
        `A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`,
        'Z',
      ].join(' ');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'pl-aim-sector');
      path.dataset.i = String(i);
      svg.appendChild(path);
      const mid = ((i + 0.5) * slice - 90) * Math.PI / 180;
      const tx = cx + 88 * Math.cos(mid);
      const ty = cy + 88 * Math.sin(mid);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(tx));
      text.setAttribute('y', String(ty));
      text.setAttribute('class', 'pl-aim-label');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = s.label;
      svg.appendChild(text);
    });

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrow.setAttribute('x1', String(cx));
    arrow.setAttribute('y1', String(cy));
    arrow.setAttribute('x2', String(cx));
    arrow.setAttribute('y2', String(cy - 118));
    arrow.setAttribute('class', 'pl-aim-arrow');
    svg.appendChild(arrow);
    const tip = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    tip.setAttribute('points', `${cx - 6},${cy - 108} ${cx + 6},${cy - 108} ${cx},${cy - 124}`);
    tip.setAttribute('class', 'pl-aim-head');
    svg.appendChild(tip);

    arena.appendChild(svg);
    const dial = document.createElement('input');
    dial.type = 'range';
    dial.min = '0';
    dial.max = '359';
    dial.value = '0';
    dial.className = 'pl-aim-dial';
    const angleRead = document.createElement('p');
    angleRead.className = 'pl-feedback';
    angleRead.textContent = 'Кут: 0° · сектор: —';

    function setAngle(deg) {
      const rad = ((deg - 90) * Math.PI) / 180;
      const x2 = cx + 118 * Math.cos(rad);
      const y2 = cy + 118 * Math.sin(rad);
      arrow.setAttribute('x2', String(x2));
      arrow.setAttribute('y2', String(y2));
      const hx = cx + 124 * Math.cos(rad);
      const hy = cy + 124 * Math.sin(rad);
      const px = 6 * Math.cos(rad + Math.PI / 2);
      const py = 6 * Math.sin(rad + Math.PI / 2);
      tip.setAttribute('points', `${hx},${hy} ${x2 - px},${y2 - py} ${x2 + px},${y2 + py}`);
      const idx = Math.floor((((deg % 360) + 360) % 360) / slice) % n;
      angleRead.textContent = `Кут: ${deg}° · сектор: ${sectors[idx]?.label || '—'}`;
      return idx;
    }

    dial.addEventListener('input', () => setAngle(Number(dial.value)));
    setAngle(0);

    const fire = document.createElement('button');
    fire.type = 'button';
    fire.textContent = '🏹 Вистріл';
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    let shots = 0;

    fire.addEventListener('click', () => {
      shots += 1;
      const idx = setAngle(Number(dial.value));
      svg.querySelectorAll('.pl-aim-sector').forEach((p) => p.classList.remove('hit', 'miss'));
      const path = svg.querySelector(`.pl-aim-sector[data-i="${idx}"]`);
      const ok = idx === level.correctIndex;
      if (path) path.classList.add(ok ? 'hit' : 'miss');
      arena.classList.add('shake');
      setTimeout(() => arena.classList.remove('shake'), 280);
      if (ok) {
        feedback.textContent = `✅ ${level.hitText || sectors[idx]?.meaning || 'Влучання!'}`;
        toast(root, 'Влучний постріл', true);
        if (onComplete) onComplete(level.id);
      } else {
        feedback.textContent = `❌ ${level.missText || sectors[idx]?.meaning || 'Не той сектор.'} Спроба ${shots}.`;
        toast(root, 'Мимо', false);
      }
    });

    wrap.append(story, arena, dial, angleRead, fire, feedback);
    if (level.legend) {
      const leg = document.createElement('ul');
      leg.className = 'pl-aim-legend';
      sectors.forEach((s) => {
        const li = document.createElement('li');
        li.textContent = `${s.label}: ${s.meaning || ''}`;
        leg.appendChild(li);
      });
      wrap.appendChild(leg);
    }
    root.appendChild(wrap);
  }

  function mountFogProbe(root, level, onComplete) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-fog';
    const tip = document.createElement('p');
    tip.className = 'pl-tip';
    tip.textContent = level.brief || 'Веди «ліхтарик» мишкою. Знайди й клацни підозрілі клітинки.';
    const stage = document.createElement('div');
    stage.className = 'pl-fog-stage';
    const table = document.createElement('table');
    table.className = 'pl-mini-table pl-fog-table';
    const headers = level.headers || [];
    table.innerHTML = `<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>`;
    const tbody = document.createElement('tbody');
    const need = new Set((level.anomalies || []).map(String));
    const found = new Set();

    (level.rows || []).forEach((row, ri) => {
      const tr = document.createElement('tr');
      headers.forEach((h, ci) => {
        const td = document.createElement('td');
        td.textContent = row[h];
        td.dataset.key = `${ri}:${ci}`;
        if (need.has(`${ri}:${ci}`) || need.has(`${ri},${h}`)) {
          td.dataset.anom = '1';
          td.dataset.key = need.has(`${ri},${h}`) ? `${ri},${h}` : `${ri}:${ci}`;
        }
        td.addEventListener('click', () => {
          if (td.dataset.anom === '1') {
            td.classList.add('found');
            found.add(td.dataset.key);
            feedback.textContent = `Знайдено ${found.size}/${need.size}`;
            if (found.size >= need.size) {
              feedback.textContent = `✅ ${level.success || 'Усі аномалії спіймано ліхтариком!'}`;
              toast(root, 'Fog cleared', true);
              if (onComplete) onComplete(level.id);
            }
          } else {
            td.classList.add('false-hit');
            feedback.textContent = 'Це чиста клітинка — шукай outlier / NULL / bot.';
          }
        });
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    const fog = document.createElement('div');
    fog.className = 'pl-fog-mask';
    stage.append(table, fog);
    stage.addEventListener('pointermove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      fog.style.setProperty('--mx', `${x}px`);
      fog.style.setProperty('--my', `${y}px`);
    });

    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    feedback.textContent = `Знайдено 0/${need.size}`;
    wrap.append(tip, stage, feedback);
    root.appendChild(wrap);
  }

  function mountConstellation(root, level, onComplete) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-constellation';
    const tip = document.createElement('p');
    tip.className = 'pl-tip';
    tip.textContent = level.brief || 'Зʼєднай зірки в правильному порядку — як потік даних.';
    const canvas = document.createElement('canvas');
    canvas.width = 560;
    canvas.height = 320;
    canvas.className = 'pl-const-canvas';
    const ctx = canvas.getContext('2d');
    const nodes = level.nodes || [];
    const order = level.order || nodes.map((n) => n.id);
    const picked = [];
    let hover = null;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 40; i += 1) {
        ctx.fillStyle = 'rgba(255,255,255,.15)';
        ctx.beginPath();
        ctx.arc((i * 97) % canvas.width, (i * 53) % canvas.height, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (picked.length > 1) {
        ctx.strokeStyle = '#3d9a6a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        picked.forEach((id, i) => {
          const n = nodes.find((x) => x.id === id);
          if (!n) return;
          if (i === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        });
        ctx.stroke();
      }
      nodes.forEach((n) => {
        const active = picked.includes(n.id);
        const isHover = hover === n.id;
        ctx.beginPath();
        ctx.arc(n.x, n.y, active ? 11 : 8, 0, Math.PI * 2);
        ctx.fillStyle = active ? '#3d9a6a' : (isHover ? '#e8a84b' : '#8b9cb3');
        ctx.fill();
        ctx.fillStyle = '#e8eef5';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.fillText(n.label, n.x + 12, n.y + 4);
      });
    }

    function nearest(x, y) {
      let best = null;
      let dist = 22;
      nodes.forEach((n) => {
        const d = Math.hypot(n.x - x, n.y - y);
        if (d < dist) {
          dist = d;
          best = n.id;
        }
      });
      return best;
    }

    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      hover = nearest(x, y);
      draw();
    });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      const id = nearest(x, y);
      if (!id) return;
      const expect = order[picked.length];
      if (id === expect) {
        picked.push(id);
        feedback.textContent = `Шлях: ${picked.map((p) => nodes.find((n) => n.id === p)?.label).join(' → ')}`;
        draw();
        if (picked.length === order.length) {
          feedback.textContent = `✅ ${level.success || 'Сузірʼя зібрано — потік даних правильний!'}`;
          toast(root, 'Constellation lock', true);
          if (onComplete) onComplete(level.id);
        }
      } else {
        picked.length = 0;
        feedback.textContent = 'Потік зірвався — почни знову з першої зірки.';
        toast(root, 'Reset path', false);
        draw();
      }
    });

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'ghost';
    reset.textContent = 'Скинути шлях';
    reset.addEventListener('click', () => {
      picked.length = 0;
      feedback.textContent = '';
      draw();
    });
    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';
    draw();
    wrap.append(tip, canvas, reset, feedback);
    root.appendChild(wrap);
  }

  function parseCsv(text) {
    const lines = String(text || '').trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(',').map((c) => c.trim());
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cells[i]; });
      return obj;
    });
    return { headers, rows };
  }

  function mountCsvLab(root, level, onComplete) {
    mountMissionBrief(root, level);
    const { headers, rows } = parseCsv(level.csv);
    const wrap = document.createElement('div');
    wrap.className = 'pl-csv-lab';

    if (level.columnGlossary) {
      appendColumnGlossary(wrap, level.columnGlossary, headers);
    }

    const frame = document.createElement('div');
    frame.className = 'pl-csv-frame';
    frame.innerHTML = `<div class="pl-csv-bar">📄 ${escapeHtml(level.fileName || 'sample.csv')} · ${rows.length} rows</div>`;
    const table = document.createElement('table');
    table.className = 'pl-mini-table';
    table.innerHTML = `<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>`;
    const tbody = document.createElement('tbody');
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = headers.map((h) => `<td>${escapeHtml(r[h])}</td>`).join('');
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    frame.appendChild(table);
    wrap.appendChild(frame);

    const q = document.createElement('p');
    q.className = 'pl-mission-ask';
    q.textContent = level.question || 'Порахуй за таблицею.';
    wrap.appendChild(q);

    const feedback = document.createElement('p');
    feedback.className = 'pl-feedback';

    if (level.mode === 'sql' && global.alasql) {
      const tip = document.createElement('p');
      tip.className = 'pl-tip';
      tip.textContent = 'Напиши SQL до таблиці data (як у DataCamp-лабі). Приклад: SELECT COUNT(*) FROM data';
      const ta = document.createElement('textarea');
      ta.className = 'pl-sql-input';
      ta.rows = 5;
      ta.placeholder = level.sqlPlaceholder || 'SELECT ... FROM data';
      const run = document.createElement('button');
      run.type = 'button';
      run.textContent = 'Run SQL';
      const out = document.createElement('pre');
      out.className = 'pl-sql-out';
      run.addEventListener('click', () => {
        try {
          global.alasql('DROP TABLE IF EXISTS data');
          global.alasql(`CREATE TABLE data (${headers.map((h) => `[${h}] STRING`).join(',')})`);
          rows.forEach((r) => {
            global.alasql('INSERT INTO data VALUES (' + headers.map((h) => JSON.stringify(r[h] ?? '')).join(',') + ')');
          });
          const res = global.alasql(ta.value);
          out.textContent = JSON.stringify(res, null, 2);
          const expected = level.expectedJson ? JSON.parse(level.expectedJson) : level.expected;
          let ok = false;
          if (typeof expected === 'number' || typeof expected === 'string') {
            const first = Array.isArray(res) && res[0] ? Object.values(res[0])[0] : null;
            ok = String(first) === String(expected);
          } else if (Array.isArray(expected)) {
            ok = JSON.stringify(res) === JSON.stringify(expected);
          }
          if (level.check === 'rowcount') {
            ok = Array.isArray(res) && res.length === Number(level.expected);
          }
          feedback.textContent = ok ? `✅ ${level.success || 'Вибірка вірна!'}` : '❌ Результат ще не той — порівняй з питанням.';
          if (ok) {
            toast(root, 'CSV lab passed', true);
            if (onComplete) onComplete(level.id);
          }
        } catch (err) {
          out.textContent = String(err.message || err);
          feedback.textContent = '⚠️ SQL error — прав синтаксис.';
        }
      });
      wrap.append(tip, ta, run, out, feedback);
    } else {
      const input = document.createElement('input');
      input.className = 'pl-answer-input';
      input.placeholder = level.answerPlaceholder || 'Твоя відповідь';
      const check = document.createElement('button');
      check.type = 'button';
      check.textContent = ui('btnCheck');
      check.addEventListener('click', () => {
        const val = input.value.trim();
        const ok = String(val) === String(level.expected);
        feedback.textContent = ok
          ? `✅ ${level.success || 'Так!'}`
          : `❌ Немає. ${level.hintOnFail || 'Перерахуй по таблиці ще раз.'}`;
        if (ok) {
          toast(root, 'OK', true);
          if (onComplete) onComplete(level.id);
        }
      });
      wrap.append(input, check, feedback);
    }
    root.appendChild(wrap);
  }

  function mountCompanyMap(root, level, onComplete) {
    const wrap = document.createElement('div');
    wrap.className = 'pl-company-map pl-sigil-atlas-wrap';
    if (level.intro) {
      const p = document.createElement('p');
      p.className = 'pl-tip pl-atlas-intro';
      p.textContent = level.intro;
      wrap.appendChild(p);
    }

    const cards = [...(level.types || [])].sort((a, b) => (a.orbit ?? 0) - (b.orbit ?? 0));
    let opened = 0;

    const arena = document.createElement('div');
    arena.className = 'pl-sigil-atlas';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.className = 'pl-atlas-svg';
    svg.setAttribute('aria-hidden', 'true');

    const core = document.createElement('div');
    core.className = 'pl-atlas-core';
    const coreCount = document.createElement('span');
    coreCount.className = 'pl-atlas-count';
    coreCount.textContent = `0 / ${cards.length}`;
    core.innerHTML = '<span class="pl-atlas-gem" aria-hidden="true">◆</span>';
    core.appendChild(coreCount);
    const coreLabel = document.createElement('span');
    coreLabel.className = 'pl-atlas-core-label';
    coreLabel.textContent = ui('atlasSigils');
    core.appendChild(coreLabel);
    arena.append(svg, core);

    const detailDock = document.createElement('div');
    detailDock.className = 'pl-atlas-dock hidden';

    function paintAtlasLines() {
      const ar = arena.getBoundingClientRect();
      svg.setAttribute('width', String(ar.width));
      svg.setAttribute('height', String(ar.height));
      svg.style.width = `${ar.width}px`;
      svg.style.height = `${ar.height}px`;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const cx = ar.width / 2;
      const cy = ar.height / 2;
      arena.querySelectorAll('.pl-atlas-node.seen').forEach((node) => {
        const nr = node.getBoundingClientRect();
        const x2 = nr.left + nr.width / 2 - ar.left;
        const y2 = nr.top + nr.height / 2 - ar.top;
        const color = node.style.getPropertyValue('--node') || '#8b9cb3';
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const mid = (cx + x2) / 2;
        path.setAttribute('d', `M ${cx} ${cy} Q ${mid} ${cy} ${x2} ${y2}`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('opacity', '0.55');
        svg.appendChild(path);
      });
    }

    function showDock(t, th) {
      detailDock.classList.remove('hidden');
      detailDock.style.setProperty('--node', th.color);
      detailDock.innerHTML = `
        <div class="pl-atlas-dock-head">
          <span class="pl-sigil-badge">${escapeHtml(t.sigil || th.sigil)}</span>
          <strong>${escapeHtml(th.glyph)} ${escapeHtml(t.name)}</strong>
          <span class="pl-atlas-hook">${escapeHtml(t.hook || '')}</span>
        </div>
        <div class="pl-atlas-dock-body">
          <p><span class="pl-dock-ico">🎯</span> <b>${escapeHtml(ui('atlasAnchorLabel'))}</b> ${escapeHtml(t.focusChip || '')}</p>
          <p><span class="pl-dock-ico">☀</span> <b>${escapeHtml(ui('atlasDayLabel'))}</b> ${escapeHtml(t.day || '')}</p>
          <p><span class="pl-dock-ico">🎤</span> <b>${escapeHtml(ui('atlasScreenLabel'))}</b> ${escapeHtml(t.interview || '')}</p>
          <p><span class="pl-dock-ico">🧰</span> <b>${escapeHtml(ui('atlasStackLabel'))}</b> ${escapeHtml(t.stack || '')}</p>
        </div>`;
    }

    cards.forEach((t, idx) => {
      const th = archetypeTheme(t.themeId);
      const slot = ORBIT_SLOTS[t.orbit ?? idx] || ORBIT_SLOTS[idx] || { x: 50, y: 50 };
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'pl-atlas-node';
      node.style.setProperty('--node', th.color);
      node.style.left = `${slot.x}%`;
      node.style.top = `${slot.y}%`;
      node.innerHTML = `
        <span class="pl-sigil-badge">${escapeHtml(t.sigil || th.sigil)}</span>
        <span class="pl-node-glyph">${th.glyph}</span>
        <span class="pl-node-name">${escapeHtml(t.name)}</span>
        <span class="pl-node-hook">${escapeHtml(t.hook || t.oneLiner || '')}</span>`;
      node.addEventListener('click', () => {
        arena.querySelectorAll('.pl-atlas-node').forEach((n) => n.classList.remove('active'));
        node.classList.add('active');
        showDock(t, th);
        if (!node.dataset.seen) {
          node.dataset.seen = '1';
          node.classList.add('seen');
          opened += 1;
          coreCount.textContent = `${opened} / ${cards.length}`;
          paintAtlasLines();
          if (opened >= cards.length) {
            core.classList.add('lit');
            toast(root, ui('atlasLitToast'), true);
            if (onComplete) onComplete(level.id);
          }
        }
      });
      arena.appendChild(node);
    });

    wrap.append(arena, detailDock);
    const tip = document.createElement('p');
    tip.className = 'pl-feedback';
    tip.textContent = level.completeHint || ui('atlasCompleteHint');
    wrap.appendChild(tip);
    root.appendChild(wrap);
    requestAnimationFrame(paintAtlasLines);
    window.addEventListener('resize', paintAtlasLines, { passive: true });
  }

  global.PrepLevelsEngine = { renderLevel, escapeHtml };
})(window);
