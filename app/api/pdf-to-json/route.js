import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req) {
    try {
        const body = await req.json();
        const { pdfBase64, rawText } = body;

        if (!pdfBase64 && !rawText) {
            return NextResponse.json({ error: "No PDF file or text provided." }, { status: 400 });
        }

        let text = "";

        if (pdfBase64) {
            const buffer = Buffer.from(pdfBase64, 'base64');
            try {
                const data = await pdf(buffer);
                text = data.text;
            } catch (err) {
                console.error("PDF-Parse library threw:", err);
                return NextResponse.json({ error: "pdf-parse threw an exception: " + err.message + ". Are you sure this is a valid PDF?" }, { status: 500 });
            }
        } else {
            text = rawText;
        }

        // Custom Extractor Logic
        const lines = text.split('\n');
        const questions = [];
        let currentQ = null;

        // Regex to find numbering: "1.", "1)", "Q1.", etc.
        const questionRegex = /^(?:Q|Question)?\s*(\d+)[\.\)]\s*(.*)/i;
        // Regex to find MCQ options: "A.", "A)", "(A)", etc.
        const optionRegex = /^(?:\()?([A-E])[\.\)]\s*(.*)/i;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            const qMatch = line.match(questionRegex);
            if (qMatch) {
                // Determine if line has a massive gap (which might be the answer key on the same line if it's a badly formatted PDF)
                // Just use the simple text for now.
                if (currentQ) {
                    questions.push(currentQ);
                }

                // Initialize new typical quiznator question structure
                currentQ = {
                    id: Date.now() + i,
                    text: qMatch[2] || "",
                    type: 'fill_blanks',
                    options: ["", "", "", "", ""],
                    correctOption: 0,
                    answer: "",
                    explanation: "",
                    includeTable: false,
                    isTableAnswer: false,
                };
            } else if (currentQ) {
                // Check if it's an MCQ option
                const optMatch = line.match(optionRegex);
                if (optMatch) {
                    currentQ.type = 'mcq';
                    // Convert 'A' to 0, 'B' to 1, etc.
                    const charCode = optMatch[1].toUpperCase().charCodeAt(0);
                    const optIndex = charCode - 65;
                    if (optIndex >= 0 && optIndex < 5) {
                        currentQ.options[optIndex] = optMatch[2] || "";
                    }
                } else {
                    // It's just a text continuation line
                    // Filter out likely page numbers or headers
                    if (!line.match(/^\d+$/) && line.length > 3) {
                        // Append to question text
                        currentQ.text += " " + line;
                    }
                }
            }
        }

        // Push the final question if exists
        if (currentQ) {
            questions.push(currentQ);
        }

        return NextResponse.json({
            success: true,
            questions,
            textLength: text.length
        });

    } catch (error) {
        console.error("PDF Parsing Error:", error);
        return NextResponse.json({ error: "Failed to parse PDF document: " + error.message }, { status: 500 });
    }
}
