import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'quizzes');

export async function GET() {
    try {
        await fs.access(DATA_DIR);
        const files = await fs.readdir(DATA_DIR);

        // Filter only JSON files
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        const quizzes = await Promise.all(jsonFiles.map(async (fileName) => {
            const filePath = path.join(DATA_DIR, fileName);
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);
                return {
                    fileName,
                    courseCode: data.courseCode,
                    topic: data.topic,
                    marks: data.marks,
                    timeLimit: data.timeLimit,
                    quizType: data.quizType,
                    questionCount: data.questions ? data.questions.length : 0
                };
            } catch (err) {
                console.error(`Error reading ${fileName}:`, err);
                return null;
            }
        }));

        // Filter out any failed reads
        const validQuizzes = quizzes.filter(q => q !== null);

        return NextResponse.json({ quizzes: validQuizzes });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return NextResponse.json({ quizzes: [] });
        }
        console.error("Error fetching quizzes:", error);
        return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
    }
}
