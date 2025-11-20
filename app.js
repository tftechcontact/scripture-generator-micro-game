/* File: app.js
   Purpose: Main application logic (routing, rendering, event wiring, scoring).
   Comments:
   - All DOM manipulation is scoped to individual page wrappers to avoid cross-page side effects.
   - Each major function has a descriptive comment above it.
   - State persists grand totals in localStorage under key 'scripture-gen-totals'.
*/

/* -------------------------
   App State
   ------------------------- */
const STATE = {
  currentLevel: 1,
  answers: {}, // per-level temporary answers { questionId: selectedIndex }
  totals: { correct: 0, attempted: 0 }
};

/* Try to restore totals from localStorage (non-fatal) */
try {
  const saved = localStorage.getItem('scripture-gen-totals');
  if (saved) STATE.totals = JSON.parse(saved);
} catch (e) { /* ignore */ }

/* -------------------------
   Show/hide page wrappers (routing)
   Purpose: only the active page wrapper is visible; others hidden.
   ------------------------- */
function showPage(pageId) {
  // Hide all .page wrappers
  document.querySelectorAll('.page').forEach(p => {
    p.hidden = true;
    p.classList.remove('active');
  });
  // Show requested page wrapper (safe because elements exist in DOM)
  const page = document.getElementById(pageId);
  if (page) {
    page.hidden = false;
    page.classList.add('active');
    // scroll to top of main content when page changes
    window.scrollTo(0,0);
  }
}

/* -------------------------
   Populate level selector on Home page
   Purpose: fill <select id="jump-level"> with Level 1..100 options
   ------------------------- */
function populateLevelSelector() {
  const sel = document.getElementById('jump-level');
  if (!sel) return;
  sel.innerHTML = '';
  LEVELS.forEach(lv => {
    const opt = document.createElement('option');
    opt.value = lv.levelNumber;
    opt.textContent = `Level ${lv.levelNumber}`;
    sel.appendChild(opt);
  });
}

/* -------------------------
   Render a level's questions
   Purpose: render only inside #questions-container to keep DOM scoped
   ------------------------- */
function renderLevel(levelNumber) {
  const level = LEVELS[levelNumber - 1];
  const container = document.getElementById('questions-container');
  if (!level || !container) return;

  // Update header for level
  const titleEl = document.getElementById('level-title');
  if (titleEl) titleEl.textContent = `Level ${levelNumber}`;

  // Clear only this container (safe edit locality)
  container.innerHTML = '';

  level.questions.forEach((q, idx) => {
    // Create wrapper article per question (isolated)
    const article = document.createElement('article');
    article.className = 'question-item';

    // Question text: use provided HTML or placeholder <p></p>
    const p = document.createElement('div');
    p.className = 'question-text';
    p.innerHTML = q.text && q.text.trim() ? q.text : '<p></p>';
    article.appendChild(p);

    // Options container
    const opts = document.createElement('div');
    opts.className = 'options';

    q.options.forEach((optText, optIndex) => {
      const label = document.createElement('label');
      label.className = 'option-label';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q-${levelNumber}-${idx}`;
      input.value = optIndex;
      input.dataset.questionId = q.id;

      // Restore selection from STATE.answers if present
      if (STATE.answers[q.id] !== undefined && STATE.answers[q.id] === optIndex) {
        input.checked = true;
      }

      const span = document.createElement('span');
      span.textContent = optText || `Option ${String.fromCharCode(97 + optIndex)}`;

      label.appendChild(input);
      label.appendChild(span);
      opts.appendChild(label);
    });

    article.appendChild(opts);
    container.appendChild(article);
  });
}

/* -------------------------
   Collect answers for current level
   Purpose: read radio inputs for current level and return a mapping
   ------------------------- */
function collectAnswers(levelNumber) {
  const level = LEVELS[levelNumber - 1];
  const result = {};
  if (!level) return result;

  level.questions.forEach((q, idx) => {
    const radios = document.getElementsByName(`q-${levelNumber}-${idx}`);
    let selected = null;
    radios.forEach(r => { if (r.checked) selected = Number(r.value); });
    result[q.id] = selected;
  });
  return result;
}

/* -------------------------
   Evaluate level answers and update totals
   Purpose: compares collected answers with LEVELS answerIndex, updates STATE.totals
   ------------------------- */
function evaluateLevel(levelNumber, answers) {
  const level = LEVELS[levelNumber - 1];
  if (!level) return 0;
  let correct = 0;
  level.questions.forEach(q => {
    const sel = answers[q.id];
    if (sel !== null && q.answerIndex !== null && sel === q.answerIndex) correct++;
  });

  // Update grand totals and persist
  STATE.totals.correct += correct;
  STATE.totals.attempted += level.questions.length;
  try { localStorage.setItem('scripture-gen-totals', JSON.stringify(STATE.totals)); } catch(e){}

  return correct;
}

/* -------------------------
   Wire up UI events
   Purpose: attach event listeners scoped to page wrappers; keep isolated to avoid side effects
   ------------------------- */
function wireUpEvents() {
  // Home: Start Level 1
  const btnStart = document.getElementById('btn-start');
  if (btnStart) btnStart.addEventListener('click', () => {
    STATE.currentLevel = 1;
    STATE.answers = {};
    renderLevel(STATE.currentLevel);
    showPage('page-level');
  });

  // Home: Jump to selected level
  const btnJump = document.getElementById('btn-jump');
  if (btnJump) btnJump.addEventListener('click', () => {
    const sel = document.getElementById('jump-level');
    const lvl = Number(sel.value) || 1;
    STATE.currentLevel = lvl;
    STATE.answers = {};
    renderLevel(lvl);
    showPage('page-level');
  });

  // Back to home from level page
  const btnBackHome = document.getElementById('btn-back-home');
  if (btnBackHome) btnBackHome.addEventListener('click', () => showPage('page-home'));

  // Submit level: collect answers, evaluate, show result page
  const btnSubmit = document.getElementById('btn-submit-level');
  if (btnSubmit) btnSubmit.addEventListener('click', () => {
    const answers = collectAnswers(STATE.currentLevel);
    STATE.answers = answers;
    const correct = evaluateLevel(STATE.currentLevel, answers);

    const summary = document.getElementById('level-result-summary');
    if (summary) summary.textContent = `You answered ${correct} out of 5 correctly.`;

    // Show redo area or fun-fact area
    const redo = document.getElementById('redo-area');
    const ff = document.getElementById('fun-fact-area');
    if (correct === 5) {
      if (redo) redo.classList.add('hidden');
      if (ff) ff.classList.remove('hidden');
    } else {
      if (redo) redo.classList.remove('hidden');
      if (ff) ff.classList.add('hidden');
    }

    showPage('page-level-result');
  });

  // Redo level (resets only current level's answers in the UI)
  const btnRedo = document.getElementById('btn-redo-level');
  if (btnRedo) btnRedo.addEventListener('click', () => {
    STATE.answers = {};
    renderLevel(STATE.currentLevel);
    showPage('page-level');
  });

  // Next level from result page
  const btnNext = document.getElementById('btn-next-level');
  if (btnNext) btnNext.addEventListener('click', () => {
    if (STATE.currentLevel < LEVELS.length) {
      STATE.currentLevel++;
      renderLevel(STATE.currentLevel);
      showPage('page-level');
    } else {
      // Completed all levels: show grand totals
      const final = document.getElementById('final-total');
      if (final) final.textContent = `You answered ${STATE.totals.correct} out of ${LEVELS.length * 5} questions correctly.`;
      showPage('page-complete');
    }
  });

  // Home from result page
  const btnHomeFromResult = document.getElementById('btn-home-from-result');
  if (btnHomeFromResult) btnHomeFromResult.addEventListener('click', () => showPage('page-home'));

  // Restart all: resets totals
  const btnRestartAll = document.getElementById('btn-restart-all');
  if (btnRestartAll) btnRestartAll.addEventListener('click', () => {
    STATE.totals = { correct: 0, attempted: 0 };
    try { localStorage.removeItem('scripture-gen-totals'); } catch(e){}
    showPage('page-home');
  });

  // Home from completion page
  const btnHomeFromComplete = document.getElementById('btn-home-from-complete');
  if (btnHomeFromComplete) btnHomeFromComplete.addEventListener('click', () => showPage('page-home'));

  // Settings button (floating)
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) settingsBtn.addEventListener('click', () => showPage('page-settings'));

  // Close settings -> return home
  const btnCloseSettings = document.getElementById('btn-close-settings');
  if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => showPage('page-home'));

  // Save settings (persist the textarea value locally)
  const btnSaveSettings = document.getElementById('btn-save-settings');
  if (btnSaveSettings) btnSaveSettings.addEventListener('click', () => {
    const txt = document.getElementById('setting-text-1').value;
    try { localStorage.setItem('scripture-gen-settings', JSON.stringify({ about: txt })); } catch(e){}
    alert('Settings saved locally.');
  });
}

/* -------------------------
   Initialization on DOMContentLoaded
   Purpose: wire events, populate selectors, restore settings, and show home page
   ------------------------- */
function init() {
  populateLevelSelector();
  wireUpEvents();
  showPage('page-home');

  // Load settings textarea if present
  try {
    const s = localStorage.getItem('scripture-gen-settings');
    if (s) {
      const parsed = JSON.parse(s);
      const ta = document.getElementById('setting-text-1');
      if (ta) ta.value = parsed.about || '';
    }
  } catch(e){}
}

/* Attach init after DOM is ready */
document.addEventListener('DOMContentLoaded', init);
