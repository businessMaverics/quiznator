"use client";

import React, { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Save, BrainCircuit, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, Trash2, Plus, Edit3, CheckSquare, Square, UploadCloud, Type } from "lucide-react";
import Link from "next/link";

const QuestionEditorItem = memo(({ q, idx, updateQuestion, updateOption, toggleSelect, isSelected }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`border rounded-xl p-5 shadow-sm transition-colors group relative ${isSelected ? 'bg-emerald-900/10 border-emerald-500/50' : 'bg-[#1a1a1a] border-neutral-700 hover:border-emerald-500/30'}`}
        >
            <div className="flex items-start gap-4 mr-2">
                
                {/* Checkbox for group select */}
                <button 
                    onClick={() => toggleSelect(q.id)} 
                    className={`mt-1 flex-shrink-0 transition-colors ${isSelected ? 'text-emerald-500' : 'text-neutral-600 hover:text-emerald-400'}`}
                >
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>

                <span className="bg-gradient-to-br from-neutral-600 to-neutral-700 text-white w-7 h-7 rounded-sm flex items-center justify-center text-xs font-black shrink-0 shadow-md">
                    {idx + 1}
                </span>

                <div className="flex-1 space-y-4">
                    {/* Question Text */}
                    <div>
                        <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1.5 block">Question Prompt</label>
                        <textarea 
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none resize-none text-neutral-200"
                            value={q.text}
                            onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                            rows={2}
                            placeholder="Enter the question text here..."
                        />
                    </div>
                    
                    {/* Options for MCQ */}
                    {q.type === 'mcq' && (
                        <div>
                            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1.5 block">Options</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 p-2 rounded-lg focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                                        <span className="text-xs font-bold text-neutral-500 w-5 text-center">{String.fromCharCode(65 + oIdx)}.</span>
                                        <input 
                                            className="flex-1 bg-transparent text-sm outline-none text-neutral-300"
                                            value={opt}
                                            onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                        />
                                        <input 
                                            type="radio" 
                                            name={`correct-${q.id}`} 
                                            checked={q.correctOption === oIdx}
                                            onChange={() => updateQuestion(q.id, 'correctOption', oIdx)}
                                            className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                            title="Mark as correct option"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Expected Answer for SAQ */}
                    {q.type === 'fill_blanks' && (
                        <div>
                            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1.5 block flex justify-between">
                                <span>Expected Answer Key</span>
                                <span className="text-emerald-500/70 font-normal normal-case">Hidden from students</span>
                            </label>
                            <input 
                                className="w-full bg-emerald-900/20 border border-emerald-900 rounded-lg p-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none text-emerald-400 placeholder-emerald-900/50"
                                value={q.answer}
                                onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)}
                                placeholder="e.g. Value Added Tax"
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

QuestionEditorItem.displayName = "QuestionEditorItem";


export default function PdfToQuizPage() {
    const [file, setFile] = useState(null);
    const [courseCode, setCourseCode] = useState("");
    const [topic, setTopic] = useState("");
    const [timeLimit, setTimeLimit] = useState(30);
    const [quizType, setQuizType] = useState("fill_blanks");
    const [marks, setMarks] = useState(20);

    const [extractedQuestions, setExtractedQuestions] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [statusData, setStatusData] = useState({ error: "", success: "" });

    // Drag-drop and Mode state
    const [inputType, setInputType] = useState('pdf');
    const [rawText, setRawText] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleExtract = async () => {
        if (inputType === 'pdf' && !file) return setStatusData({ error: "Please drop or select a PDF file.", success: "" });
        if (inputType === 'text' && !rawText.trim()) return setStatusData({ error: "Please paste text into the box to extract.", success: "" });

        setIsLoading(true);
        setStatusData({ error: "", success: "" });

        try {
            const processRequest = async (payload) => {
                const res = await fetch("/api/pdf-to-json", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to extract");
                
                setExtractedQuestions(data.questions);
                setSelectedIds(new Set()); // Reset selections
                setStatusData({ error: "", success: `Extracted ${data.questions.length} questions instantly!` });
            };

            if (inputType === 'text') {
                await processRequest({ rawText });
                setIsLoading(false);
            } else {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    const base64Data = reader.result.split(',')[1];
                    try {
                        await processRequest({ pdfBase64: base64Data });
                    } catch (err) {
                        setStatusData({ error: err.message, success: "" });
                    } finally {
                        setIsLoading(false);
                    }
                };
            }
        } catch (error) {
            setStatusData({ error: error.message, success: "" });
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (extractedQuestions.length === 0) return setStatusData({ error: "No extracted questions to save.", success: "" });
        if (!courseCode || !topic) return setStatusData({ error: "Please provide a Course Code and Topic to save.", success: "" });

        setIsLoading(true);
        setStatusData({ error: "", success: "" });

        try {
            const payload = {
                courseCode,
                topic,
                timeLimit: Number(timeLimit),
                quizType,
                marks: Number(marks),
                questions: extractedQuestions,
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
            setStatusData({ error: "Failed to save: " + error.message, success: "" });
        } finally {
            setIsLoading(false);
        }
    };

    // Stable Edit functions for optimized rendering
    const updateQuestion = useCallback((id, field, value) => {
        setExtractedQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    }, []);

    const updateOption = useCallback((id, oIdx, value) => {
        setExtractedQuestions(prev => prev.map(q => {
            if (q.id === id) {
                const newOpts = [...q.options];
                newOpts[oIdx] = value;
                return { ...q, options: newOpts };
            }
            return q;
        }));
    }, []);

    // Selection functions
    const toggleSelect = useCallback((id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = () => {
        if (selectedIds.size === extractedQuestions.length) {
            setSelectedIds(new Set()); // Deselect all
        } else {
            setSelectedIds(new Set(extractedQuestions.map(q => q.id))); // Select all
        }
    };

    const deleteSelected = () => {
        if (selectedIds.size === 0) return;
        setExtractedQuestions(prev => prev.filter(q => !selectedIds.has(q.id)));
        setSelectedIds(new Set());
    };

    const addQuestion = () => {
        setExtractedQuestions([...extractedQuestions, {
            id: Date.now(),
            text: "New Question...",
            type: quizType, // Inherit current setting
            options: ["", "", "", "", ""],
            correctOption: 0,
            answer: "",
            explanation: "",
            includeTable: false,
            isTableAnswer: false
        }]);
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Panel: Settings & Upload */}
                    <div className="lg:col-span-4 space-y-6 sticky top-6">
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

                        {/* Updated Source Input UI */}
                        <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <FileUp className="text-emerald-400" /> Source Input
                                </h2>
                            </div>

                            <div className="flex bg-neutral-900 rounded-lg p-1.5 border border-neutral-700">
                                <button
                                    onClick={() => setInputType('pdf')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${inputType === 'pdf' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    <UploadCloud size={16} /> PDF Drop
                                </button>
                                <button
                                    onClick={() => setInputType('text')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${inputType === 'text' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    <Type size={16} /> Paste Text
                                </button>
                            </div>

                            {inputType === 'pdf' ? (
                                <div 
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-neutral-600 hover:border-emerald-500/50 bg-neutral-900/50'}`}
                                >
                                    <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-emerald-500' : 'text-neutral-500'}`} />
                                    <div className="text-center space-y-1 z-10">
                                        <p className="text-sm font-bold text-neutral-300 relative pointer-events-none">
                                            {file ? file.name : "Drag & drop your PDF here"}
                                        </p>
                                        {!file && <p className="text-xs text-neutral-500 pointer-events-none">or click anywhere to browse</p>}
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <textarea
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        placeholder="Paste your raw questions text here. Make sure it follows the standard numbered format (e.g., '1. Question...')."
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none resize-none text-neutral-300 h-32 custom-scrollbar"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleExtract}
                                disabled={isLoading || (inputType === 'pdf' ? !file : !rawText.trim())}
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-900/50"
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

                    {/* Right Panel: Interactive Editor View */}
                    <div className="lg:col-span-8 bg-neutral-800 p-6 rounded-2xl border border-neutral-700 shadow-xl flex flex-col h-[85vh]">
                        <div className="flex justify-between items-center pb-4 border-b border-neutral-700">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                                    <Edit3 className="text-teal-400" /> Interactive Editor
                                </h2>
                                <p className="text-xs text-neutral-400 mt-1">Review and modify the extracted questions exactly as they will appear.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={addQuestion}
                                    className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-neutral-600"
                                >
                                    <Plus size={16} /> Add Blank
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || extractedQuestions.length === 0}
                                    className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/50"
                                >
                                    <Save size={16} /> Save Dataset
                                </button>
                            </div>
                        </div>

                        {/* Bulk Actions Bar */}
                        {extractedQuestions.length > 0 && (
                            <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg mt-4 mb-2">
                                <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors pl-1">
                                    {selectedIds.size === extractedQuestions.length && extractedQuestions.length > 0 
                                        ? <CheckSquare size={18} className="text-emerald-500" /> 
                                        : <Square size={18} />}
                                    Select All
                                </button>
                                
                                {selectedIds.size > 0 && (
                                    <button 
                                        onClick={deleteSelected}
                                        className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-full font-bold transition-all"
                                    >
                                        <Trash2 size={14} /> Delete Selected ({selectedIds.size})
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-y-auto mt-2 pr-3 custom-scrollbar flex flex-col gap-4 pb-10">
                            {extractedQuestions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-3 opacity-50">
                                    <BrainCircuit size={48} />
                                    <p>Upload a PDF or Paste Text and click Extract to see the questions here</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {extractedQuestions.map((q, idx) => (
                                        <QuestionEditorItem 
                                            key={q.id}
                                            q={q}
                                            idx={idx}
                                            updateQuestion={updateQuestion}
                                            updateOption={updateOption}
                                            toggleSelect={toggleSelect}
                                            isSelected={selectedIds.has(q.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Minimal Inline CSS for custom scrollbar */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
            `}</style>
        </div>
    );
}
