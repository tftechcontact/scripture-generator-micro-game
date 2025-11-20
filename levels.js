/* File: levels.js
   Purpose: Data model containing 100 levels, each with 5 placeholder questions.
   Editing guidance:
   - Edit LEVELS[levelIndex].questions[qIndex].text to add the question text.
     Keep a <p></p> wrapper around your question text to match your workflow.
   - Use <u>_____</u> inside the <p> to indicate the underlined blank (or the UI will render whatever you paste).
   - Fill .options with 4 strings for choices [a,b,c,d].
   - Set answerIndex to 0..3 (index of correct option) when you know the answer.
*/

/* Utility to create an empty question placeholder. */
function makeEmptyQuestion(id) {
  return {
    id: id,
    text: '<p></p>',         // <-- Edit this with your question text (keep <p></p>)
    options: ['', '', '', ''], // <-- Edit: option strings for a, b, c, d
    answerIndex: null         // <-- Set to 0,1,2 or 3 for correct answer when ready
  };
}

/* Build 100 levels with 5 empty questions each */
const LEVELS = [];
for (let L = 1; L <= 100; L++) {
  const levelObj = { levelNumber: L, questions: [] };
  for (let q = 1; q <= 5; q++) {
    levelObj.questions.push(makeEmptyQuestion(`L${L}Q${q}`));
  }
  LEVELS.push(levelObj);
}

/* Example sample questions for Level 1 (you can remove/replace) */
LEVELS[0].questions[0].text = '<p>1. In the beginning <u>_____</u> created the heavens and the earth.</p>';
LEVELS[0].questions[0].options = ['God', 'The wind', 'The angels', 'A voice'];
LEVELS[0].questions[0].answerIndex = 0;

LEVELS[0].questions[1].text = '<p>2. Blessed are the <u>_____</u>, for they shall inherit the earth.</p>';
LEVELS[0].questions[1].options = ['meek', 'mighty', 'wealthy', 'famous'];
LEVELS[0].questions[1].answerIndex = 0;

/* Leave remaining questions blank so you can fill them in later */
