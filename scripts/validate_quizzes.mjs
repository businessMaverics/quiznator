
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'quizzes');

async function validate() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            console.log("No data directory found.");
            return;
        }
        const files = fs.readdirSync(DATA_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        console.log(`Found ${jsonFiles.length} JSON files.`);

        let errors = 0;

        for (const file of jsonFiles) {
            try {
                const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
                const data = JSON.parse(content);

                // Basic Schema Check
                if (!data.courseCode) throw new Error("Missing courseCode");
                if (!data.topic) throw new Error("Missing topic");
                if (!Array.isArray(data.questions)) throw new Error("Missing questions array");

                console.log(`[PASS] ${file} (${data.questions.length} questions)`);
            } catch (e) {
                console.error(`[FAIL] ${file}: ${e.message}`);
                errors++;
            }
        }

        if (errors === 0) console.log("\nAll files valid!");
        else console.log(`\nFound ${errors} errors.`);

    } catch (e) {
        console.error("Script error:", e);
    }
}

validate();
