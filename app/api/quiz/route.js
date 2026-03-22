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

            const uniqueQuestions = allQuestions.map((q, i) => ({ ...q, id: `course_${targetCourse}_${i}_${Date.now()} ` }));

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
            const uniqueQuestions = allQuestions.map((q, i) => ({ ...q, id: `gen_${i}_${Date.now()} ` }));

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
        console.error(`Error reading quiz ${filename}: `, error);
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');
    const questionId = searchParams.get('questionId');

    if (!filename) {
        return NextResponse.json({ error: "Filename required" }, { status: 400 });
    }

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = path.join(DATA_DIR, filename);

    if (questionId) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            if (!data.questions || !Array.isArray(data.questions)) {
                return NextResponse.json({ error: "Quiz does not contain a questions array" }, { status: 404 });
            }

            const initialLength = data.questions.length;
            data.questions = data.questions.filter(q => String(q.id) !== String(questionId));

            if (data.questions.length === initialLength) {
                return NextResponse.json({ error: `Question with ID ${questionId} not found in ${filename} ` }, { status: 404 });
            }

            // Update marks if it's tied to question count
            if (typeof data.marks === 'number') {
                data.marks = data.questions.length;
            }
            // Optionally update timeLimit if it's derived from question count
            if (typeof data.timeLimit === 'number' && data.questions.length > 0) {
                data.timeLimit = Math.min(data.questions.length * 0.4, 180); // Re-calculate based on GET logic
            } else if (data.questions.length === 0) {
                data.timeLimit = 0;
            }


            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            return NextResponse.json({ success: true, message: `Question ${questionId} deleted from ${filename} ` });

        } catch (error) {
            console.error(`Error deleting question ${questionId} from ${filename}: `, error);
            if (error.code === 'ENOENT') {
                return NextResponse.json({ error: "Quiz file not found" }, { status: 404 });
            }
            return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
        }
    } else {
        // Original logic: delete the entire file
        try {
            await fs.unlink(filePath);
            return NextResponse.json({ success: true, message: "Quiz deleted" });
        } catch (error) {
            console.error("Delete error:", error);
            if (error.code === 'ENOENT') {
                return NextResponse.json({ error: "Quiz file not found" }, { status: 404 });
            }
            return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
        }
    }
}

export async function PATCH(req) {
    try {
        const files = await fs.readdir(DATA_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        let updatedFilesCount = 0;
        let totalQuestionsDuplicated = 0;

        await Promise.all(jsonFiles.map(async (f) => {
            const filePath = path.join(DATA_DIR, f);
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);

                if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
                    const duplicatedQuestions = data.questions.map(q => ({
                        ...q,
                        id: `${q.id || 'new'}_copy_${Date.now()}_${Math.random().toString(36).substring(2, 8)} ` // Generate new unique ID
                    }));

                    data.questions = [...data.questions, ...duplicatedQuestions];
                    totalQuestionsDuplicated += duplicatedQuestions.length;

                    // Update marks and timeLimit if they are derived from question count
                    if (typeof data.marks === 'number') {
                        data.marks = data.questions.length;
                    }
                    if (typeof data.timeLimit === 'number') {
                        data.timeLimit = Math.min(data.questions.length * 0.4, 180); // Re-calculate based on GET logic
                    }

                    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
                    updatedFilesCount++;
                }
            } catch (e) {
                console.error(`Error processing file ${f} for duplication: `, e);
            }
        }));

        if (updatedFilesCount === 0) {
            return NextResponse.json({ message: "No quiz files found or no questions to duplicate." }, { status: 200 });
        }

        return NextResponse.json({
            success: true,
            message: `Successfully duplicated questions in ${updatedFilesCount} files.Total questions duplicated: ${totalQuestionsDuplicated}.`,
            updatedFilesCount,
            totalQuestionsDuplicated
        });

    } catch (error) {
        console.error("Error during PATCH operation (duplicating questions):", error);
        return NextResponse.json({ error: "Failed to duplicate questions in quiz files" }, { status: 500 });
    }
}
