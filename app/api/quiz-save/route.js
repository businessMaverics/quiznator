import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename') || `imported_quiz_${Date.now()}.json`;
    
    // Security check to prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return NextResponse.json({ error: "Invalid secure filename" }, { status: 400 });
    }

    try {
        const body = await req.json();
        
        const DATA_DIR = path.join(process.cwd(), 'data', 'quizzes');
        const destPath = path.join(DATA_DIR, filename);
        
        // Ensure directory exists
        await fs.mkdir(DATA_DIR, { recursive: true });

        // Validate generic shape
        if (!body.questions || !Array.isArray(body.questions)) {
             return NextResponse.json({ error: "Invalid JSON format: missing questions array." }, { status: 400 });
        }
        
        await fs.writeFile(destPath, JSON.stringify(body, null, 2), 'utf-8');
        
        return NextResponse.json({ success: true, message: `Saved perfectly securely at ${filename}` });
    } catch (error) {
        console.error("Quiz physical file save error:", error);
        return NextResponse.json({ error: "Failed to write quiz object: " + error.message }, { status: 500 });
    }
}
