import { setJson } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { securityCode, courseCode, topic, marks, timeLimit, quizType, questions, tableData, additionalData } = body;

        // 0. Environment Check - Removed for local JSON storage
        // if (!process.env.BLOB_READ_WRITE_TOKEN) { ... }


        // 1. Security Check
        if (securityCode !== "112233") {
            return NextResponse.json({ error: "Invalid Security Code" }, { status: 401 });
        }

        if (!courseCode || !topic) {
            return NextResponse.json({ error: "Course Code and Topic are required" }, { status: 400 });
        }

        // 2. Construct Filename
        // Sanitize to avoid filesystem issues if strictly local, though Vercel Blob handles most chars.
        // We'll keep it clean: COURSE_TOPIC.json
        const safeCourse = courseCode.replace(/[^a-zA-Z0-9-_]/g, "").toUpperCase();
        const safeTopic = topic.replace(/[^a-zA-Z0-9-_]/g, "_");
        const filename = `${safeCourse}_${safeTopic}.json`;

        const quizData = {
            courseCode,
            topic,
            marks,
            timeLimit,
            quizType,
            questions, // Array of question objects
            tableData, // If accounting table was drawn
            additionalData, // Any other questions or content
            createdAt: new Date().toISOString(),
        };

        // 3. Save to Storage
        const url = await setJson(filename, quizData);

        return NextResponse.json({ success: true, url, filename });
    } catch (error) {
        console.error("[Quiznator] Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
