const fs = require('fs');
const path = require('path');

const rawText = fs.readFileSync(path.join(__dirname, 'raw_mcq.txt'), 'utf8');

const courses = {
    'Financial Accounting': {
        code: 'FA ATS II',
        prefix: 'FA'
    },
    'Public Sector Accounting': {
        code: 'PSA ATS II',
        prefix: 'PSA'
    },
    'Quantitative Analysis': {
        code: 'QA ATS II',
        prefix: 'QA'
    },
    'Information Technology': {
        code: 'IT ATS II',
        prefix: 'IT'
    }
};

let currentCourse = null;
let currentQuestions = [];
let allParsedData = {};

const lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');

let idCounter = 1740000000100;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
        const title = line.replace('## ', '').split(' (')[0].trim();
        if (courses[title]) {
            if (currentCourse) {
                allParsedData[currentCourse] = currentQuestions;
            }
            currentCourse = title;
            currentQuestions = [];
        }
    } else if (line.match(/^\d+\./)) {
        // Question text
        const qText = line.replace(/^\d+\.\s*/, '').trim();

        // Next line is options
        i++;
        const optionsLine = lines[i];
        // Split by A., B., C., D., E.
        const optMatch = optionsLine.match(/A\.(.*?)(?=B\.)B\.(.*?)(?=C\.)C\.(.*?)(?=D\.)D\.(.*?)(?=E\.)E\.(.*)/);
        let options = ["", "", "", "", ""];
        if (optMatch) {
            options = [
                optMatch[1].trim(),
                optMatch[2].trim(),
                optMatch[3].trim(),
                optMatch[4].trim(),
                optMatch[5].trim()
            ];
        } else {
            console.log("Failed to match options for:", qText, optionsLine);
        }

        // Next line is answer
        i++;
        let ansLine = lines[i];
        const correctLetterMatch = ansLine.match(/\*\*(A|B|C|D|E)\*\*/);
        let correctLetter = 'A';
        if (correctLetterMatch) {
            correctLetter = correctLetterMatch[1];
        }

        const letterMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
        const correctOptionIdx = letterMap[correctLetter];

        currentQuestions.push({
            id: idCounter++,
            text: qText,
            type: "mcq",
            options: options,
            correctOption: correctOptionIdx,
            answer: options[correctOptionIdx],
            explanation: "",
            includeTable: false,
            isTableAnswer: false
        });
    }
}
if (currentCourse) {
    allParsedData[currentCourse] = currentQuestions;
}

const outDir = path.join(__dirname, '..', 'data', 'quizzes');

for (const courseName in allParsedData) {
    const qs = allParsedData[courseName];
    const info = courses[courseName];

    const jsonObj = {
        courseCode: info.code,
        topic: "MCQ POSSIBLE 2025",
        timeLimit: 45,
        marks: 30,
        quizType: "mcq",
        questions: qs
    };

    const fileName = `${info.prefix}_MCQ_POSSIBLE_2025.json`;
    const outPath = path.join(outDir, fileName);

    fs.writeFileSync(outPath, JSON.stringify(jsonObj, null, 2), 'utf8');
    console.log(`Saved ${fileName} with ${qs.length} questions.`);
}
