/**
 * fix_quiz_json.js
 * Migrates all quiz JSON files to the correct Quiznator format.
 *
 * Correct format:
 * {
 *   "courseCode": "FA ATS II",
 *   "topic": "SAQ - March 2022",
 *   "marks": "20",
 *   "timeLimit": "30",
 *   "quizType": "fill_blanks",
 *   "questions": [
 *     {
 *       "id": <number>,
 *       "text": "...",
 *       "type": "fill_blanks",
 *       "options": ["","","",""],
 *       "correctOption": 0,
 *       "answer": "...",
 *       "explanation": "...",
 *       "includeTable": false,
 *       "tableData": { "headers": ["",""], "rows": [["",""]] },
 *       "isTableAnswer": false,
 *       "answerTable": { "headers": ["",""], "rows": [["",""]] }
 *     }
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');

const QUIZ_DIR = path.join(__dirname, '..', 'data', 'quizzes');

// Map filename prefix → courseCode
const COURSE_CODE_MAP = {
    'FA_': 'FA ATS II',
    'PSA_': 'PSA ATS II',
    'QA_': 'QA ATS II',
    'IT_': 'IT ATS II',
    'FAATSII_': 'FA ATS II',
    'FAI_': 'FA ATS I',
};

// Map filename diet part → human readable topic
function topicFromFilename(filename) {
    const base = path.basename(filename, '.json');
    // e.g. FA_SAQ_MARCH2022 → "SAQ - March 2022"
    const match = base.match(/^[A-Z]+_([A-Z_]+)_((?:MARCH|SEP|SEPT|DECEMBER|JUNE)\d{4})$/i);
    if (match) {
        const section = match[1].replace(/_/g, ' ');
        const diet = match[2]
            .replace(/MARCH/i, 'March')
            .replace(/SEP(T)?/i, 'September')
            .replace(/JUNE/i, 'June')
            .replace(/DECEMBER/i, 'December')
            .replace(/(\d{4})/, ' $1');
        return `${section} - ${diet}`;
    }
    return base;
}

function courseCodeFromFilename(filename) {
    const base = path.basename(filename);
    for (const [prefix, code] of Object.entries(COURSE_CODE_MAP)) {
        if (base.startsWith(prefix)) return code;
    }
    return 'UNKNOWN';
}

function emptyTableData() {
    return { headers: ['', ''], rows: [['', '']] };
}

function cleanAnswer(answer) {
    if (!answer) return '';
    // Strip citation artifacts like "[cite: 117]"
    return answer.replace(/\s*\[cite:[^\]]*\]/gi, '').trim();
}

function makeQuestion(raw, index) {
    // Handle both 'text' and 'question' field names
    const text = raw.text || raw.question || '';
    const answer = cleanAnswer(raw.answer || '');
    const id = typeof raw.id === 'number' && raw.id > 1000000
        ? raw.id  // already a good timestamp-style id
        : Date.now() + index;

    return {
        id,
        text,
        type: 'fill_blanks',
        options: ['', '', '', ''],
        correctOption: 0,
        answer,
        explanation: raw.explanation || '',
        includeTable: false,
        tableData: emptyTableData(),
        isTableAnswer: false,
        answerTable: emptyTableData(),
    };
}

function fixFile(filePath) {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Detect questions array from various possible locations
    let rawQuestions =
        raw.questions ||
        raw.data ||
        raw[Object.keys(raw).find(k => Array.isArray(raw[k]))] ||
        [];

    const filename = path.basename(filePath);
    const courseCode = courseCodeFromFilename(filename);
    const topic = topicFromFilename(filename);

    // If the file already has the correct top-level keys AND all questions are properly formed, skip
    const alreadyCorrect =
        raw.courseCode &&
        raw.questions &&
        Array.isArray(raw.questions) &&
        raw.questions.length > 0 &&
        raw.questions[0].type === 'fill_blanks' &&
        'includeTable' in raw.questions[0];

    if (alreadyCorrect) {
        console.log(`  [SKIP] ${filename} — already correct`);
        return;
    }

    const fixed = {
        courseCode,
        topic,
        marks: '20',
        timeLimit: '30',
        quizType: 'fill_blanks',
        questions: rawQuestions.map((q, i) => makeQuestion(q, i)),
    };

    fs.writeFileSync(filePath, JSON.stringify(fixed, null, 2), 'utf-8');
    console.log(`  [FIXED] ${filename} — ${fixed.questions.length} questions`);
}

// Run
const files = fs.readdirSync(QUIZ_DIR).filter(f => f.endsWith('.json'));
console.log(`\nFixing ${files.length} quiz files in ${QUIZ_DIR}\n`);

let fixed = 0, skipped = 0;
for (const file of files) {
    try {
        const before = fixed;
        fixFile(path.join(QUIZ_DIR, file));
        if (fixed === before) skipped++; else fixed++;
    } catch (e) {
        console.error(`  [ERROR] ${file}: ${e.message}`);
    }
}

console.log(`\nDone. Fixed: ${fixed}, Skipped (already correct): ${skipped}`);
