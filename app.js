/* app.js
   Purpose: main application logic and routing.
   - Handles showing/hiding page wrappers to avoid editing conflicts.
   - Renders questions for a level from LEVELS array (levels.js).
   - Tracks per-level and total scores in localStorage so progress persists.
   - All DOM elements are selected within each page wrapper to reduce cross-page coupling.
*/

/* -------------------------
   Utility & state
   ------------------------- */
const STATE = {
  currentLevel: 1,
  answers: {}, // temporary per-level answers { questionId: selectedIndex }
  totals: { correct: 0, attempted: 0 } // grand totals across levels
};

// Try to restore saved totals from localStorage
try {
  const saved = localStorage.getItem('scripture-gen-totals');
  if (saved) STATE.totals = JSON.parse(saved);
} catch (e) { console.warn('Could not load saved totals', e); }

/* -------------------------
   Simple client-side routing by showing/hiding sections
   ------------------------- */
function showPage(pageId) {
  // Purpose: show one page wrapper and hide others to keep DOM modular
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
}

/* -------------------------
   Populate level jump selector on Home page
   ------------------------- */
function populateLevelSelector() {
  const sel = document.getElementById('jump-level');
  LEVELS.forEach(lv => {
    const opt = document.createElement('option');
    opt.value = lv.levelNumber;
    opt.textContent = `Level ${lv.levelNumber}`;
    sel.appendChild(opt);
  });
}

/* -------------------------
   Render a level's questions into #questions-container
   Each question is wrapped in its own <article> to avoid cross-impact.
   ------------------------- */
function renderLevel(levelNumber) {
  const level = LEVELS[levelNumber - 1];
  const container = document.getElementById('questions-container');
  container.innerHTML = ''; // clear only this wrapper (won't affect other pages)

  // Fill page header
  document.getElementById('level-title').textContent = `Level ${levelNumber}`;

  level.questions.forEach((q, idx) => {
    /* Create a wrapper article for each question.
       Purpose: editing one question DOM won't affect others. */
    const article = document.createElement('article');
    article.className = 'question-item';

    // Question text: if q.text is empty, provide <p></p> placeholder
    const p = document.createElement('p');
    p.className = 'question-text';
    p.innerHTML = q.text && q.text.trim() ? q.text : '<p></p>';
    article.appendChild(p);

    // Options container
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'options';

    q.options.forEach((optText, optIndex) => {
      // Each option is a label + radio input (so clicking text selects input).
      const label = document.createElement('label');
      label.className = 'option-label';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q-${levelNumber}-${idx}`; // unique per question per level
      input.value = optIndex;
      // store value attributes for later evaluation
      input.dataset.questionId = q.id;

      // If user previously answered in this session, restore selection
      const key = `${q.id}`;
      if (STATE.answers[key] !== undefined && STATE.answers[key] === optIndex) {
        input.checked = true;
      }

      const span = document.createElement('span');
      span.textContent = optText || 'Option';

      label.appendChild(input);
      label.appendChild(span);
      optionsDiv.appendChild(label);
    });

    article.appendChild(optionsDiv);
    container.appendChild(article);
  });
}

/* -------------------------
   Collect answers from DOM for the current level
   ------------------------- */
function collectAnswers(levelNumber) {
  const level = LEVELS[levelNumber - 1];
  const answers = {};
  level.questions.forEach((q, idx) => {
    const radios = document.getElementsByName(`q-${levelNumber}-${idx}`);
    let selected = null;
    radios.forEach(r => {
      if (r.checked) selected = Number(r.value);
    });
    answers[q.id] = selected; // null if unanswered
  });
  return answers;
}

/* -------------------------
   Evaluate answers for a level and update totals
   ------------------------- */
function evaluateLevel(levelNumber, answers) {
  const level = LEVELS[levelNumber - 1];
  let correct = 0;
  level.questions.forEach(q => {
    const sel = answers[q.id];
    if (sel !== null && q.answerIndex !== null && sel === q.answerIndex) {
      correct++;
    }
  });
  // Update grand totals
  STATE.totals.correct += correct;
  STATE.totals.attempted += level.questions.length;
  // Persist totals
  try { localStorage.setItem('scripture-gen-totals', JSON.stringify(STATE.totals)); } catch(e){}

  return correct;
}

/* -------------------------
   UI event wiring (keeps DOM selection localized to pages)
   ------------------------- */
function wireUpEvents() {
  /* Home page buttons */
  document.getElementById('btn-start').addEventListener('click', () => {
    STATE.currentLevel = 1;
    STATE.answers = {};
    renderLevel(STATE.currentLevel);
    showPage('page-level');
  });

  document.getElementById('btn-jump').addEventListener('click', () => {
    const sel = document.getElementById('jump-level');
    const lvl = Number(sel.value) || 1;
    STATE.currentLevel = lvl;
    STATE.answers = {};
    renderLevel(lvl);
    showPage('page-level');
  });

  document.getElementById('btn-back-home').addEventListener('click', () => {
    showPage('page-home');
  });

  /* Submit level */
  document.getElementById('btn-submit-level').addEventListener('click', () => {
    // collect answers and evaluate
    const answers = collectAnswers(STATE.currentLevel);
    STATE.answers = answers; // temp
    const correct = evaluateLevel(STATE.currentLevel, answers);

    // Show result page
    document.getElementById('level-result-summary').textContent =
      `You answered ${correct} out of 5 correctly.`;

    // Show redo if not perfect
    if (correct === 5) {
      document.getElementById('redo-area').classList.add('hidden');
      document.getElementById('fun-fact-area').classList.remove('hidden');
    } else {
      document.getElementById('redo-area').classList.remove('hidden');
      document.getElementById('fun-fact-area').classList.add('hidden');
    }

    showPage('page-level-result');
  });

  /* Redo level */
  document.getElementById('btn-redo-level').addEventListener('click', () => {
    // Reset only this level's answers in STATE (not grand totals)
    STATE.answers = {};
    renderLevel(STATE.currentLevel);
    showPage('page-level');
  });

  document.getElementById('btn-next-level').addEventListener('click', () => {
    if (STATE.currentLevel < LEVELS.length) {
      STATE.currentLevel++;
      renderLevel(STATE.currentLevel);
      showPage('page-level');
    } else {
      // Completed all levels
      document.getElementById('final-total').textContent =
        `You answered ${STATE.totals.correct} out of ${LEVELS.length * 5} questions correctly.`;
      showPage('page-complete');
    }
  });

  document.getElementById('btn-home-from-result').addEventListener('click', () => showPage('page-home'));

  document.getElementById('btn-restart-all').addEventListener('click', () => {
    // Reset totals and progress
    STATE.totals = { correct: 0, attempted: 0 };
    try { localStorage.removeItem('scripture-gen-totals'); } catch(e){}
    showPage('page-home');
  });

  document.getElementById('btn-home-from-complete').addEventListener('click', () => showPage('page-home'));

  /* Settings button always visible - opens settings page */
  document.getElementById('settings-btn').addEventListener('click', () => {
    showPage('page-settings');
  });

  /* Settings close/save */
  document.getElementById('btn-close-settings').addEventListener('click', () => showPage('page-home'));
  document.getElementById('btn-save-settings').addEventListener('click', () => {
    // Purpose: persist settings (simple example)
    const txt = document.getElementById('setting-text-1').value;
    try { localStorage.setItem('scripture-gen-settings', JSON.stringify({ about: txt })); } catch(e){}
    alert('Settings saved locally.');
  });
}

/* -------------------------
   Initialization on page load
   ------------------------- */
function init() {
  // Populate jump selector and set handlers
  populateLevelSelector();

  // Hook up events
  wireUpEvents();

  // Render initial page
  showPage('page-home');

  // If you want to auto-load settings into the settings textarea:
  try {
    const s = localStorage.getItem('scripture-gen-settings');
    if (s) {
      const parsed = JSON.parse(s);
      document.getElementById('setting-text-1').value = parsed.about || '';
    }
  } catch(e){}
}

/* Run init after DOM loaded */
document.addEventListener('DOMContentLoaded', init);
