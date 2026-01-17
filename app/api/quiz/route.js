import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'quizzes');

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Basic security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Check if requesting a cumulative COURSE test (e.g. filename="course:ACC101")
    if (filename.startsWith('course:')) {
        const targetCourse = filename.split(':')[1];
        try {
            const files = await fs.readdir(DATA_DIR);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            let allQuestions = [];

            await Promise.all(jsonFiles.map(async (f) => {
                try {
                    const c = await fs.readFile(path.join(DATA_DIR, f), 'utf-8');
                    const d = JSON.parse(c);
                    // Match course code (case insensitive/trimmed)
                    if (d.courseCode?.trim().toUpperCase() === targetCourse.trim().toUpperCase()) {
                        if (d.questions && Array.isArray(d.questions)) {
                            allQuestions = [...allQuestions, ...d.questions];
                        }
                    }
                } catch (e) { console.error("Error reading for course gen:", e); }
            }));

            if (allQuestions.length === 0) {
                return NextResponse.json({ error: `No questions found for course ${targetCourse}` }, { status: 404 });
            }

            const uniqueQuestions = allQuestions.map((q, i) => ({ ...q, id: `course_${targetCourse}_${i}_${Date.now()}` }));

            return NextResponse.json({
                courseCode: targetCourse,
                topic: `Cumulative ${targetCourse} Exam`,
                marks: uniqueQuestions.length,
                timeLimit: Math.min(uniqueQuestions.length * 0.4, 180),
                quizType: "mixed",
                questions: uniqueQuestions
            });

        } catch (error) {
            console.error("Course test error:", error);
            return NextResponse.json({ error: "Failed to generate course test" }, { status: 500 });
        }
    }

    if (filename === 'general') {
        try {
            const files = await fs.readdir(DATA_DIR);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            let allQuestions = [];

            await Promise.all(jsonFiles.map(async (f) => {
                try {
                    const c = await fs.readFile(path.join(DATA_DIR, f), 'utf-8');
                    const d = JSON.parse(c);
                    if (d.questions && Array.isArray(d.questions)) {
                        allQuestions = [...allQuestions, ...d.questions];
                    }
                } catch (e) { console.error("Error reading for general:", e); }
            }));

            // Assign unique IDs to avoid collision if original IDs were just timestamps
            const uniqueQuestions = allQuestions.map((q, i) => ({ ...q, id: `gen_${i}_${Date.now()}` }));

            return NextResponse.json({
                courseCode: "GEN",
                topic: "General Knowledge Test",
                marks: uniqueQuestions.length, // 1 mark each
                timeLimit: 20, // Fixed 20 minutes as requested
                quizType: "mixed",
                questions: uniqueQuestions
            });

        } catch (error) {
            console.error("General test error:", error);
            return NextResponse.json({ error: "Failed to generate test" }, { status: 500 });
        }
    }

    try {
        const filePath = path.join(DATA_DIR, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error reading quiz ${filename}:`, error);
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: "Filename required" }, { status: 400 });
    }

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    try {
        const filePath = path.join(DATA_DIR, filename);
        await fs.unlink(filePath);
        return NextResponse.json({ success: true, message: "Quiz deleted" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
    }
}
