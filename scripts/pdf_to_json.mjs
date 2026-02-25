import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const QUIZ_DATA_DIR = path.join(process.cwd(), 'data', 'quizzes');

async function convertPdfToJson(pdfPath, courseCode, topic) {
    try {
        const dataBuffer = await fs.readFile(pdfPath);
        const data = await pdf(dataBuffer);
        const text = data.text;

        const questions = parseQuestions(text);

        const quizJson = {
            courseCode: courseCode || "UNKNOWN",
            topic: topic || path.basename(pdfPath, '.pdf'),
            marks: "100",
            timeLimit: "30",
            quizType: "mcq",
            questions: questions,
            createdAt: new Date().toISOString()
        };

        const fileName = `${quizJson.courseCode}_${quizJson.topic.replace(/\s+/g, '_')}.json`;
        const outputPath = path.join(QUIZ_DATA_DIR, fileName);

        await fs.writeFile(outputPath, JSON.stringify(quizJson, null, 2));
        console.log(`Successfully converted ${pdfPath} to ${outputPath}`);
        console.log(`Extracted ${questions.length} questions.`);

    } catch (error) {
        console.error('Error converting PDF:', error);
        if (error.stack) console.error(error.stack);
    }
}

function parseQuestions(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const questions = [];
    let currentQuestion = null;

    // Regex for questions (starts with number followed by . or ))
    const questionRegex = /^(\d+)[\.\)]\s*(.*)/;
    // Regex for options (starts with A, B, C, D or a, b, c, d followed by . or ))
    const optionRegex = /^([a-eA-E])[\.\)]\s*(.*)/;
    // Regex for Answer: X
    const answerRegex = /Answer:\s*([a-eA-E])/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const questionMatch = line.match(questionRegex);
        const optionMatch = line.match(optionRegex);
        const answerMatch = line.match(answerRegex);

        if (questionMatch) {
            if (currentQuestion) {
                finalizeQuestion(currentQuestion);
                questions.push(currentQuestion);
            }
            currentQuestion = {
                id: Date.now() + questions.length,
                text: questionMatch[2],
                type: "mcq",
                options: [],
                correctOption: 0,
                answer: "",
                explanation: "",
                includeTable: false,
                tableData: { headers: ["", ""], rows: [["", ""]] },
                isTableAnswer: false,
                answerTable: { headers: ["", ""], rows: [["", ""]] }
            };
        } else if (optionMatch && currentQuestion) {
            let optionText = optionMatch[2];
            // Check for Answer: X at the end of option text
            const optAnswerMatch = optionText.match(answerRegex);
            if (optAnswerMatch) {
                currentQuestion._tempAnswer = optAnswerMatch[1].toUpperCase();
                optionText = optionText.replace(answerRegex, '').trim();
            }
            currentQuestion.options.push(optionText);
        } else if (answerMatch && currentQuestion) {
            currentQuestion._tempAnswer = answerMatch[1].toUpperCase();
            // If the answer is in the line, don't append it to text
        } else if (currentQuestion && !optionMatch) {
            // Append line to current question text if it's not an option and we're in a question
            if (!line.match(/^[a-eA-E][\.\)]/)) {
                // Check if this line contains the answer
                const lineAnswerMatch = line.match(answerRegex);
                if (lineAnswerMatch) {
                    currentQuestion._tempAnswer = lineAnswerMatch[1].toUpperCase();
                    let cleanedLine = line.replace(answerRegex, '').trim();
                    if (cleanedLine) currentQuestion.text += " " + cleanedLine;
                } else {
                    currentQuestion.text += " " + line;
                }
            }
        }
    }

    if (currentQuestion) {
        finalizeQuestion(currentQuestion);
        questions.push(currentQuestion);
    }

    function finalizeQuestion(q) {
        // Clean up text (remove potential trailing "Answer: X")
        q.text = q.text.replace(answerRegex, '').trim();

        // Map _tempAnswer (A, B, C, D) to correctOption index (0, 1, 2, 3)
        if (q._tempAnswer) {
            const index = q._tempAnswer.charCodeAt(0) - 65; // A=0, B=1, ...
            if (index >= 0 && index < q.options.length) {
                q.correctOption = index;
            }
            delete q._tempAnswer;
        }
    }

    return questions;
}

// Get arguments from command line
const args = process.argv.slice(2);
if (args.length < 1) {
    console.log("Usage: node scripts/pdf_to_json.mjs <pdfPath> [courseCode] [topic]");
    process.exit(1);
}

const [pdfPath, courseCode, topic] = args;
convertPdfToJson(pdfPath, courseCode, topic);
