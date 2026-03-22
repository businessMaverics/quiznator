"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Save, BrainCircuit, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PdfToQuizPage() {
    const [file, setFile] = useState(null);
    const [courseCode, setCourseCode] = useState("");
    const [topic, setTopic] = useState("");
    const [timeLimit, setTimeLimit] = useState(30);
    const [quizType, setQuizType] = useState("fill_blanks");
    const [marks, setMarks] = useState(20);

    const [extractedJSON, setExtractedJSON] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [statusData, setStatusData] = useState({ error: "", success: "" });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleExtract = async () => {
        if (!file) return setStatusData({ error: "Please select a PDF file first.", success: "" });

        setIsLoading(true);
        setStatusData({ error: "", success: "" });

        const formData = new FormData();
        formData.append("pdf", file);

        try {
            const res = await fetch("/api/pdf-to-json", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to extract text");

            setExtractedJSON(JSON.stringify(data.questions, null, 2));
            setStatusData({ error: "", success: `Successfully extracted ${data.questions.length} questions!` });
        } catch (error) {
            setStatusData({ error: error.message, success: "" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!extractedJSON) return setStatusData({ error: "No extracted questions to save.", success: "" });
        if (!courseCode || !topic) return setStatusData({ error: "Please provide a Course Code and Topic to save.", success: "" });

        setIsLoading(true);
        setStatusData({ error: "", success: "" });

        try {
            const questions = JSON.parse(extractedJSON);

            const payload = {
                courseCode,
                topic,
                timeLimit: Number(timeLimit),
                quizType,
                marks: Number(marks),
                questions,
            };

            const cleanCourse = courseCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
            const cleanTopic = topic.toUpperCase().replace(/[^A-Z0-9]/g, "");
            const filename = `${cleanCourse}_${cleanTopic}.json`;
            const endpoint = `/api/quiz-save?filename=${encodeURIComponent(filename)}`;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");

            setStatusData({ error: "", success: `Quiz saved perfectly as ${filename}!` });
        } catch (error) {
            setStatusData({ error: "Failed to save or invalid JSON formatting: " + error.message, success: "" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 font-cinzel">
                            PDF Quiz Generator
                        </h1>
                        <p className="text-neutral-400 text-sm">Turn any past paper PDF into a playable dataset instantly.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Settings & Upload */}
                    <div className="space-y-6">
                        <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl space-y-4">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <BrainCircuit className="text-emerald-400" /> Quiz Details
                            </h2>
                            
                            <div>
                                <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-1">Course Code</label>
                                <input
                                    type="text"
                                    value={courseCode}
                                    onChange={(e) => setCourseCode(e.target.value)}
                                    placeholder="e.g. FA ATS II"
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-1">Topic / Exam Date</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. SAQ March 2024"
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-1">Time Limit (mins)</label>
                                    <input
                                        type="number"
                                        value={timeLimit}
                                        onChange={(e) => setTimeLimit(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-1">Total Marks</label>
                                    <input
                                        type="number"
                                        value={marks}
                                        onChange={(e) => setMarks(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-neutral-400 uppercase tracking-widest mb-1">Quiz Type</label>
                                <select 
                                    value={quizType}
                                    onChange={(e) => setQuizType(e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                                >
                                    <option value="fill_blanks">Fill in the Blanks (SAQ)</option>
                                    <option value="mcq">Multiple Choice Questions (MCQ)</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl space-y-4">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FileUp className="text-emerald-400" /> Upload File
                            </h2>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 transition-all cursor-pointer"
                            />
                            <button
                                onClick={handleExtract}
                                disabled={isLoading || !file}
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? <RefreshCw className="animate-spin" /> : <BrainCircuit />}
                                Extract Questions
                            </button>
                        </div>

                        {statusData.error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-200">{statusData.error}</p>
                            </motion.div>
                        )}
                        {statusData.success && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-start gap-3">
                                <CheckCircle2 className="text-emerald-500 flex-shrink-0" />
                                <p className="text-sm text-emerald-200">{statusData.success}</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Panel: JSON Editor View */}
                    <div className="lg:col-span-2 bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl flex flex-col h-[700px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                Live Data Editor
                            </h2>
                            <button
                                onClick={handleSave}
                                disabled={isLoading || !extractedJSON}
                                className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
                            >
                                <Save size={16} /> Save to Quizzes
                            </button>
                        </div>
                        <p className="text-xs text-neutral-400 mb-2">Review and edit the extracted questions below before saving. Ensure the JSON remains valid.</p>
                        <textarea
                            value={extractedJSON}
                            onChange={(e) => setExtractedJSON(e.target.value)}
                            placeholder="Upload a PDF to see extracted questions here..."
                            className="flex-1 w-full bg-[#1e1e1e] border border-neutral-700 rounded-xl p-4 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none custom-scrollbar"
                            spellCheck="false"
                        ></textarea>
                    </div>
                </div>
            </div>
            {/* Minimal Inline CSS for custom scrollbar */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1e1e1e; border-radius: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #404040; border-radius: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #505050; }
            `}</style>
        </div>
    );
}
