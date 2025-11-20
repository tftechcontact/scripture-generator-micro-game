/* levels.js
   Purpose: holds the data model for all 100 levels.
   Structure: array `LEVELS` of 100 items, each with { levelNumber, questions: [5 question objects] }.
   Each question object: { id, text, options: [a,b,c,d], answerIndex }.
   - text should contain an underlined blank spot (we'll render <u>_____</u> when inserting or you can include <u>____</u> in the text).
   - For convenience, I generate scaffolding with empty placeholders you can edit.
   Edit this file to add actual question text and correct answers.
*/

/* Utility to create empty questions for a level */
function createEmptyQuestion(id) {
  return {
    id: id,
    // Put the question inside <p></p> or plain text; underline blank is inserted by UI if not present.
    text: '<p></p>', // <-- Edit this manually later with your question (keep <p></p> if you'd like)
    options: ['', '', '', ''], // <-- Fill with strings for options: a, b, c, d
    answerIndex: null // <-- set to 0/1/2/3 for correct option when you edit
  };
}

/* Build 100 levels with 5 empty questions each. */
const LEVELS = [];
for (let L = 1; L <= 100; L++) {
  const levelObj = { levelNumber: L, questions: [] };
  for (let q = 1; q <= 5; q++) {
    levelObj.questions.push(createEmptyQuestion(`L${L}Q${q}`));
  }
  LEVELS.push(levelObj);
}

/* Example: fill Level 1 with sample content so you see the behavior.
   Edit or remove when you have your questions ready.
*/
LEVELS[0].questions[0].text = '<p>1. In the beginning <u>_____</u> created the heavens and the earth.</p>';
LEVELS[0].questions[0].options = ['God', 'The wind', 'The angels', 'A voice'];
LEVELS[0].questions[0].answerIndex = 0;

LEVELS[0].questions[1].text = '<p>2. Blessed are the <u>_____</u>, for they shall inherit the earth.</p>';
LEVELS[0].questions[1].options = ['meek', 'mighty', 'wealthy', 'famous'];
LEVELS[0].questions[1].answerIndex = 0;

/* Remaining 3 questions of level 1 are left as placeholders for you. */

