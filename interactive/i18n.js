/* Shared with Mentorship / Trainer: localStorage mt_lang = ua | en
   Cross-origin sync: pass ?lang=ua|en on links between labs. */
(function (global) {
  const STR = {
    ua: {
      pageTitle: 'DevOps Lab · Archer Gym',
      headerTitle: '🏹 DevOps Lab · Archer Gym',
      headerLede: 'Сходинка 6/6 · shell · Git/CI · Docker · Terraform · K8s · prod. Пара з DE Mage Gym.',
      navDeLab: 'DE Mage Gym',
      navOpsMd: 'Ops Quest · MD',
      navMentorship: 'Mentorship',
      navRepo: 'Repo',
      langLabel: 'Мова',
      heroEyebrow: 'Твій аватар у DevOps Lab',
      heroTip: 'Після блоків запалюються орби. Забери лучника → share-картка.',
      aimingAt: (role) => `Ціль карʼєри: ${role}`,
      careerTitle: 'Поточний карʼєрний рівень',
      careerLede: 'Обери, де ти зараз. Підсвічуємо рекомендовані шари сходинки — інші можна відкрити.',
      stairTitle: 'Сходинка навичок DevOps',
      stairLede: 'Кроки знизу вгору. Клікни платформу → місії шару.',
      layerSoon: 'Скоро · CHALLENGES.md hands-on',
      stairBase: '↑ Фундамент · один крок за раз',
      recommended: 'для тебе',
      layerMode: (mode) => (mode === 'theory' ? '📚 переважно теорія' : mode === 'practice' ? '⚔️ переважно практика' : '📚⚔️ теорія + практика'),
      archiveRoads: 'Архів: Theory / Practice списком',
      btnDeLab: '🧙 DE Mage Gym',
      btnShare: '🪪 Забери лучника · share',
      homeTitle: 'DevOps Lab · кабінет лучника',
      homeBody: 'Той самий ritual що DE Lab: <strong>місія → таблиця/діаграма → drill</strong>. Hands-on: <a href="{opsQuest}" target="_blank" rel="noopener">CHALLENGES.md</a>. DE трек: <a href="{deLab}" target="_blank" rel="noopener">Mage Gym</a>.',
      roadTheory: '📚 Теорія мага',
      roadTheoryBlurb: 'Карти типів компаній, шари DWH, A/B, день-1 — з інтерактивом, не сухим PDF.',
      roadPractice: '⚔️ Практика · місії',
      roadPracticeBlurb: 'SQL із заглушками + таблиці/CSV, Python, work-sim, жестові рівні.',
      progress: (n) => `Прогрес: ${n} ✓`,
      soon: 'скоро',
      backCabin: '← Кабінет',
      saved: (a, b) => `Збережено: ${a} / ${b}`,
      orb: 'орб',
      blockBroken: 'Блок ще не готовий або JSON зламаний.',
      shareTitle: 'Забери DevOps-лучника',
      shareLede: 'Картка з героєм справа. Текст готовий у полі. Жодна мережа не дає справжнього autofill фото+тексту з браузера: ми копіюємо підпис / відкриваємо інтент; PNG — Download або системний Share.',
      shareCaptionLabel: 'Текст для шеру (можна правити)',
      btnDl: '⬇️ Download PNG',
      btnLi: 'in LinkedIn',
      btnIg: 'Instagram',
      btnX: '𝕏 X',
      btnThreads: 'Threads',
      btnCopy: 'Copy text',
      btnNative: 'Share…',
      hintDl: 'PNG завантажено.',
      hintCopyOk: 'Текст скопійовано.',
      hintCopyFail: 'Не вдалось скопіювати — виділи поле вручну.',
      hintLi: 'LinkedIn: текст у буфері — встав у пост (Ctrl+V). Превʼю сайту береться з og:image (може кешуватись). PNG з Download можна додати як медіа.',
      hintIg: 'Instagram: з браузера лише фото+підпис вручну. PNG завантажено, текст у буфері → New post → фото → Ctrl+V.',
      hintX: 'X: вікно з готовим текстом відкрито. Картинку додай через Download, якщо треба.',
      hintThreads: 'Threads: текст у буфері · вкладка відкрита. Встав Ctrl+V. PNG — Download → додай як фото.',
      hintShareOk: 'Системний Share відкрито (можна з фото).',
      hintShareAbort: 'Share скасовано.',
      hintShareFail: 'Share недоступний — скористайся кнопками мереж.',
      ranks: ['Scout', 'Archer Apprentice', 'DevOps Archer', 'Platform Ranger'],
      claimTitle: 'DevOps Lab · Archer Claim',
      skillsLit: 'Skills lit:',
      loading: 'Завантаження…',
      blocks: {
        '01-linux-shell-devops': 'Linux & shell',
        '02-git-ci-devops': 'Git / CI',
        '03-docker-devops': 'Docker',
        '04-terraform-devops': 'IaC · Terraform',
        '05-k8s-devops': 'K8s-lite',
        '06-prod-devops': 'Production habits',
      },
      shareCap: (rank, skills, gym, md) =>
        `Я закріпила ранг ${rank} у DevOps Lab Archer Gym 🏹\n${skills}\n\nГрати: ${gym}\nOps quest: ${md}`,
      atlasSigils: 'Сигіли',
      atlasAnchorLabel: 'Якір матчу:',
      atlasDayLabel: 'День DE:',
      atlasScreenLabel: 'Скрінінг:',
      atlasStackLabel: 'Стек:',
      atlasLitToast: 'Атлас запалений — іди на Матч',
      atlasCompleteHint: 'Відкрий усі портали. Гачок + Сигіл = те, що Матч перевірить.',
      matchTipDefault: 'Спочатку клікни ЛІВОРУЧ (тип), потім ПРАВОРУЧ (фокус). Вірна пара — лінія + колір.',
      matchPickRight: 'Тепер обери фокус скрінінгу праворуч →',
      matchPickLeftFirst: 'Спочатку обери тип компанії зліва.',
      matchAllDone: '✅ Усі пари зібрано — лінії показують звʼязки.',
      matchPairOk: (m, total) => `✅ Пара закріплена (${m}/${total}).`,
      matchWrong: '❌ Не та пара. Згадай study / Карту типів — лівий вибір лишається.',
      matchCompleteToast: 'Матч завершено',
      matchStudyIntroDefault: '<strong>Крок 1 · закріпи.</strong> Прочитай кожну пару вголос (тип → фокус). Потім Матч без вгадування.',
      matchStudyCtaDefault: 'Закарбувала · почати Матч зі стрілами',
      matchStudySkip: 'Порада: повернись на вкладку «Карта», якщо рядок не чіпляється.',
      hubEyebrow: 'Підготовка до DevOps / SRE співбесід',
      hubTitle: 'Ops Interview Arena',
      hubLede: 'Усі DevOps drills тут + заглушки з interview-sprint. DE data/SQL — окремо в Mage Gym.',
      hubTasks: 'завдань',
      hubKindGym: 'інтерактив',
      hubKindStub: 'заглушка',
      hubAll: 'Усі',
      hubSearch: 'Пошук (Enter)…',
      hubAtlasLink: '→ Shell карта (L0)',
      hubBridgeTitle: '↔ DE Mage Gym',
      hubBridgeDeArena: 'Interview Arena',
      hubBridgeDeGov: 'Governance · E6 runbook',
      hubBridgeDeOrch: 'Orchestration · O2 DAG',
      hubBridgeDeCloud: 'Cloud lake · A0 map',
      hubFooter: 'Заглушки = таймер + вголос + блокнот. Інтерактив = клік і одразу в Gym.',
      hubLoadFail: 'Не вдалось завантажити банк завдань.',
      hubTaskMissing: 'Завдання не знайдено.',
      hubBackList: '← Список Arena',
      hubPrompt: 'Умова / фокус',
      hubSource: 'Джерело',
      hubResources: 'Публічні ресурси',
      hubSprintTip: (day) => `Sprint SQL · день ${day}: таймер, без LLM, 3 речення після.`,
      hubOpenGym: 'Відкрити в Gym →',
      hubMarkDone: 'Позначила (локально)',
      hubMarked: '✓ Позначено',
      btnInterviewHub: '⚔️ Interview Arena',
      btnCheck: 'Перевірити',
      btnReset: 'Скинути',
      btnHint: 'Підказка',
      btnCheckOrder: 'Перевірити порядок',
      btnCheckPipeline: 'Перевірити конвеєр',
      btnCheckPick: 'Перевірити вибір',
      btnRunSql: 'Run SQL',
      fillTipDefault: 'Спочатку зрозумій місію вище ↑ потім заповни SQL. Перетягни чіп у ____.',
      fillOk: '✅ Збірка правильна!',
      fillMiss: '❌ Ще не так — спробуй ще або візьми підказку.',
      fillMissReveal: (ans) => `❌ Перевір порядок. Орієнтир: ${ans}`,
      fillCredited: 'Зараховано',
      hintsDone: '💡 Підказки закінчились.',
      missionDefault: 'Місія',
      theoryMark: 'Зрозуміло — далі ✓',
      theoryMarked: '✓ Зафіксовано в прогресі',
      theorySaved: 'Прогрес збережено',
      textDiagramSummary: 'Текстова схема',
      dragOrderOk: '✅ Порядок вірний!',
      dragOrderFail: '❌ Ще не так — подумай про логіку кроків.',
      dragOrderToast: 'Порядок OK',
      flipHint: 'Клікай картки — відкрий усі сторони.',
      pickRowsMiss: 'Не той набір рядків',
      flipDone: '✅ Усі картки відкриті — блок зараховано!',
      whatsWrongPrompt: 'Що тут не так?',
      explainOkDefault: 'Так!',
      explainFailDefault: 'Не той діагноз.',
      toastDiagOk: 'Діагноз вірний',
      mcOkDefault: 'Вірно!',
      mcFailDefault: 'Невірно.',
      colGlossaryTitle: 'Що означають колонки',
      recallTitle: '📌 Пригадати (перед перевіркою)',
    },
    en: {
      pageTitle: 'DevOps Lab · Archer Gym',
      headerTitle: '🏹 DevOps Lab · Archer Gym',
      headerLede: 'Staircase 6/6 · shell · Git/CI · Docker · Terraform · K8s · prod. Sibling of DE Mage Gym.',
      navDeLab: 'DE Mage Gym',
      navOpsMd: 'Ops Quest · MD',
      navMentorship: 'Mentorship',
      navRepo: 'Repo',
      langLabel: 'Language',
      heroEyebrow: 'Your avatar in DevOps Lab',
      heroTip: 'Light orbs by finishing blocks. Claim the archer → share card.',
      aimingAt: (role) => `Career aim: ${role}`,
      careerTitle: 'Current career level',
      careerLede: 'Pick where you are now. We highlight recommended staircase layers.',
      stairTitle: 'DevOps skill staircase',
      stairLede: 'Steps bottom → top. Tap a platform → layer missions.',
      layerSoon: 'Soon · CHALLENGES.md hands-on',
      stairBase: '↑ Foundations · one step at a time',
      recommended: 'for you',
      layerMode: (mode) => (mode === 'theory' ? '📚 mostly theory' : mode === 'practice' ? '⚔️ mostly practice' : '📚⚔️ theory + practice'),
      btnDeLab: '🧙 DE Mage Gym',
      btnShare: '🪪 Claim archer · share',
      homeTitle: 'DevOps Lab · archer cabin',
      homeBody: 'Same ritual as DE Lab: <strong>mission → table/diagram → drill</strong>. Hands-on: <a href="{opsQuest}" target="_blank" rel="noopener">CHALLENGES.md</a>. DE track: <a href="{deLab}" target="_blank" rel="noopener">Mage Gym</a>.',
      roadTheory: '📚 Mage theory',
      roadTheoryBlurb: 'Company-type maps, DWH layers, A/B, day-1 — interactive, not a dry PDF.',
      roadPractice: '⚔️ Practice · missions',
      roadPracticeBlurb: 'SQL with blanks + tables/CSV, Python, work-sim, gesture levels.',
      progress: (n) => `Progress: ${n} ✓`,
      soon: 'soon',
      backCabin: '← Cabin',
      saved: (a, b) => `Saved: ${a} / ${b}`,
      orb: 'orb',
      blockBroken: 'Block not ready or JSON is broken.',
      shareTitle: 'Claim your DevOps archer',
      shareLede: 'Card with the hero on the right. Text is ready in the box. Networks block full photo+text autofill from the web: we copy caption / open an intent; PNG via Download or system Share.',
      shareCaptionLabel: 'Share text (editable)',
      btnDl: '⬇️ Download PNG',
      btnLi: 'in LinkedIn',
      btnIg: 'Instagram',
      btnX: '𝕏 X',
      btnThreads: 'Threads',
      btnCopy: 'Copy text',
      btnNative: 'Share…',
      hintDl: 'PNG downloaded.',
      hintCopyOk: 'Text copied.',
      hintCopyFail: 'Copy failed — select the field manually.',
      hintLi: 'LinkedIn: text in clipboard — paste (Ctrl+V). Site preview uses og:image (may be cached). Attach PNG from Download if you want the mage card.',
      hintIg: 'Instagram: browser only supports photo+caption manually. PNG downloaded, caption copied → New post → photo → Ctrl+V.',
      hintX: 'X: compose window opened with text. Attach PNG via Download if needed.',
      hintThreads: 'Threads: caption copied · tab opened. Paste Ctrl+V. PNG via Download → add as photo.',
      hintShareOk: 'System Share opened (can include photo).',
      hintShareAbort: 'Share cancelled.',
      hintShareFail: 'Share unavailable — use the network buttons.',
      ranks: ['Scout', 'Archer Apprentice', 'DevOps Archer', 'Platform Ranger'],
      claimTitle: 'DevOps Lab · Archer Claim',
      skillsLit: 'Skills lit:',
      loading: 'Loading…',
      blocks: {
        '01-linux-shell-devops': 'Linux & shell',
        '02-git-ci-devops': 'Git / CI',
        '03-docker-devops': 'Docker',
        '04-terraform-devops': 'IaC · Terraform',
        '05-k8s-devops': 'K8s-lite',
        '06-prod-devops': 'Production habits',
      },
      shareCap: (rank, skills, gym, md) =>
        `I claimed ${rank} in DevOps Lab Archer Gym 🏹\n${skills}\n\nPlay: ${gym}\nOps quest: ${md}`,
      atlasSigils: 'Sigils',
      atlasAnchorLabel: 'Match anchor:',
      atlasDayLabel: 'Typical DE day:',
      atlasScreenLabel: 'Screening:',
      atlasStackLabel: 'Stack signals:',
      atlasLitToast: 'Atlas lit — go to Match',
      atlasCompleteHint: 'Open all portals. Hook + Sigil = what Match will test.',
      matchTipDefault: 'Click LEFT (type), then RIGHT (focus). A correct pair draws a colored line.',
      matchPickRight: 'Now pick screening focus on the right →',
      matchPickLeftFirst: 'Pick company type on the left first.',
      matchAllDone: '✅ All pairs locked — lines show the links.',
      matchPairOk: (m, total) => `✅ Pair locked (${m}/${total}).`,
      matchWrong: '❌ Wrong pair. Recall study / type Map — left pick stays.',
      matchCompleteToast: 'Match complete',
      matchStudyIntroDefault: '<strong>Step 1 · lock in.</strong> Read each pair aloud (type → focus). Then Match — no guessing.',
      matchStudyCtaDefault: 'Locked in · start Match with lines',
      matchStudySkip: 'Tip: go back to the Map tab if a row does not stick.',
      hubEyebrow: 'DevOps / SRE interview prep',
      hubTitle: 'Ops Interview Arena',
      hubLede: 'All DevOps drills here + interview-sprint stubs. DE data/SQL — separate Mage Gym.',
      hubTasks: 'tasks',
      hubKindGym: 'interactive',
      hubKindStub: 'stub',
      hubAll: 'All',
      hubSearch: 'Search (Enter)…',
      hubAtlasLink: '→ Shell map (L0)',
      hubBridgeTitle: '↔ DE Mage Gym',
      hubBridgeDeArena: 'Interview Arena',
      hubBridgeDeGov: 'Governance · E6 runbook',
      hubBridgeDeOrch: 'Orchestration · O2 DAG',
      hubBridgeDeCloud: 'Cloud lake · A0 map',
      hubFooter: 'Stubs = timer + out loud + notebook. Interactive = click straight into Gym.',
      hubLoadFail: 'Could not load task bank.',
      hubTaskMissing: 'Task not found.',
      hubBackList: '← Arena list',
      hubPrompt: 'Prompt / focus',
      hubSource: 'Source',
      hubResources: 'Public resources',
      hubSprintTip: (day) => `Sprint SQL · day ${day}: timer, no LLM, 3 sentences after.`,
      hubOpenGym: 'Open in Gym →',
      hubMarkDone: 'Mark done (local)',
      hubMarked: '✓ Marked',
      btnInterviewHub: '⚔️ Interview Arena',
      btnCheck: 'Check',
      btnReset: 'Reset',
      btnHint: 'Hint',
      btnCheckOrder: 'Check order',
      btnCheckPipeline: 'Check pipeline',
      btnCheckPick: 'Check selection',
      btnRunSql: 'Run SQL',
      fillTipDefault: 'Understand the mission above ↑ then fill SQL. Drag a chip into ____.',
      fillOk: '✅ Correct build!',
      fillMiss: '❌ Not yet — try again or take a hint.',
      fillMissReveal: (ans) => `❌ Check order. Guide: ${ans}`,
      fillCredited: 'Completed',
      hintsDone: '💡 No hints left.',
      missionDefault: 'Mission',
      theoryMark: 'Got it — next ✓',
      theoryMarked: '✓ Saved to progress',
      theorySaved: 'Progress saved',
      textDiagramSummary: 'Text diagram',
      dragOrderOk: '✅ Correct order!',
      dragOrderFail: '❌ Not yet — think through the logic.',
      dragOrderToast: 'Order OK',
      flipHint: 'Click cards — open every side.',
      pickRowsMiss: 'Wrong row set',
      flipDone: '✅ All cards open — level complete!',
      whatsWrongPrompt: 'What is wrong here?',
      explainOkDefault: 'Correct!',
      explainFailDefault: 'Wrong diagnosis.',
      toastDiagOk: 'Correct diagnosis',
      mcOkDefault: 'Correct!',
      mcFailDefault: 'Incorrect.',
      colGlossaryTitle: 'Column meanings',
      recallTitle: '📌 Recall (before you check)',
    },
  };

  function norm(lang) {
    return lang === 'en' ? 'en' : 'ua';
  }

  function readQueryLang() {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (q === 'en' || q === 'ua' || q === 'uk') return q === 'uk' ? 'ua' : q;
    } catch { /* */ }
    return null;
  }

  function getLang() {
    const fromQ = readQueryLang();
    if (fromQ) {
      localStorage.setItem('mt_lang', fromQ);
      return fromQ;
    }
    return norm(localStorage.getItem('mt_lang') || 'ua');
  }

  function setLang(lang) {
    const l = norm(lang);
    localStorage.setItem('mt_lang', l);
    document.documentElement.lang = l === 'en' ? 'en' : 'uk';
    return l;
  }

  function t(key, ...args) {
    const pack = STR[getLang()] || STR.ua;
    const val = pack[key];
    if (typeof val === 'function') return val(...args);
    return val ?? STR.ua[key] ?? key;
  }

  function blockTitle(id) {
    const pack = STR[getLang()] || STR.ua;
    return (pack.blocks && pack.blocks[id]) || id;
  }

  function withLang(url) {
    if (!url) return url;
    try {
      const u = new URL(url, location.href);
      u.searchParams.set('lang', getLang());
      return u.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}lang=${getLang()}`;
    }
  }

  function mountToggle(container) {
    if (!container) return;
    let el = container.querySelector('.lang-toggle');
    if (!el) {
      el = document.createElement('div');
      el.className = 'lang-toggle';
      el.setAttribute('role', 'group');
      el.innerHTML = `
        <span class="lang-label"></span>
        <button type="button" data-lang="ua">UA</button>
        <button type="button" data-lang="en">EN</button>`;
      container.appendChild(el);
      el.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-lang]');
        if (!btn) return;
        setLang(btn.dataset.lang);
        paintToggle(el);
        global.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: getLang() } }));
      });
    }
    paintToggle(el);
  }

  function paintToggle(el) {
    const lang = getLang();
    const label = el.querySelector('.lang-label');
    if (label) label.textContent = t('langLabel');
    el.querySelectorAll('[data-lang]').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  setLang(getLang());

  global.DeLabI18n = { t, getLang, setLang, blockTitle, withLang, mountToggle, STR };
})(window);
