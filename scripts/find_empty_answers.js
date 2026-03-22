const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../data/quizzes');
let emptyCount = 0;

fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    d.questions.forEach((q, i) => {
        if (!q.answer || String(q.answer).trim() === '') {
            console.log(`${f} -> Q${q.id}: ${q.text.substring(0, 60)}...`);
            emptyCount++;
        }
    });
});

console.log('Total questions missing answers:', emptyCount);
