"use client";

import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, RefreshCw, BookOpen, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MathJaxContext, MathJax } from "better-react-mathjax";

export default function QuizRoom({ params }) {
    // Use React.use() to unwrap params in Next.js 15+ (if applicable), or just access directly if older.
    // Assuming Next.js 13/14 pattern, but safe to await if async component.
    // Standard client component receiving params prop:
    const resolvedParams = use(params);
    const fileName = resolvedParams.filename;

    const [quizData, setQuizData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [showSolution, setShowSolution] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(0);

    // Royal Blue Theme Constants
    const THEME = {
        bg: "bg-[#4169E1]",
        card: "bg-white text-black",
    };

    const mathJaxConfig = {
        loader: { load: ["input/tex", "output/chtml"] },
        tex: {
            inlineMath: [["$", "$"], ["\\(", "\\)"]],
            displayMath: [["$$", "$$"], ["\\[", "\\]"]],
        },
    };

    useEffect(() => {
        async function fetchQuiz() {
            try {
                // ... (loading logic)
                const quizRes = await fetch(`/api/quiz?filename=${fileName}`);
                if (!quizRes.ok) throw new Error("Failed to load quiz");

                const quiz = await quizRes.json();
                setQuizData(quiz);

                // 1. Shuffle & Constraint Logic
                let qList = shuffleArray([...(quiz.questions || [])]);
                if (qList.length > 40) {
                    qList = qList.slice(0, 40);
                }
                setQuestions(qList);

                // 2. Timer Setup (minutes -> seconds)
                if (quiz.timeLimit) {
                    let totalSeconds = parseInt(quiz.timeLimit) * 60;
                    // Auto-expand timer for table questions (Add 5 min per table)
                    const tableCount = qList.filter(q => q.isTableAnswer || q.includeTable).length;
                    totalSeconds += (tableCount * 5 * 60);
                    setTimeLeft(totalSeconds);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error loading quiz:", error);
                setLoading(false);
            }
        }
        fetchQuiz();
    }, [fileName]);

    // Timer Logic
    useEffect(() => {
        if (!loading && !showResult && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        calculateScore();
                        setShowResult(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, showResult, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Fisher-Yates Shuffle
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleAnswer = (answer) => {
        setUserAnswers({ ...userAnswers, [questions[currentQIndex].id]: answer });
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        } else {
            calculateScore();
            setShowResult(true);
        }
    };

    // Levenshtein Distance for "AI" Grading
    const levenshtein = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1) // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const calculateScore = () => {
        let newScore = 0;
        let totalPossible = 0;

        questions.forEach(q => {
            const uAns = userAnswers[q.id];

            if (q.isTableAnswer) {
                totalPossible += 100;
                if (typeof uAns === 'object' && uAns !== null) {
                    // Gradual grading for table: 
                    // Give points based on percentage of rows that have at least one cell filled
                    const filledRows = uAns.rows?.filter(r => r.some(c => c && c.trim())).length || 0;
                    const totalRows = uAns.rows?.length || 1;
                    newScore += Math.floor((filledRows / totalRows) * 100);
                }
                return;
            }

            totalPossible += 1;
            if (q.type === 'mcq') {
                if (uAns === q.correctOption) newScore++;
            } else {
                // Fuzzy/AI Logic for regular text answers
                const normalize = (str) => {
                    if (typeof str !== 'string') return "";
                    return str.toLowerCase().replace(/[^a-z0-9]/g, '') || "";
                };
                const uVal = normalize(uAns);
                const cVal = normalize(q.answer);

                if (!uVal) return; // empty
                if (uVal === cVal) { newScore++; return; }
                const dist = levenshtein(uVal, cVal);
                const maxLen = Math.max(uVal.length, cVal.length);
                if (maxLen > 0 && (1 - dist / maxLen) >= 0.75) { newScore++; return; }
                if (cVal.length > 10) {
                    const words = q.answer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                    const uRaw = (uAns || "").toLowerCase();
                    if (words.length > 0) {
                        const matches = words.filter(k => uRaw.includes(k));
                        if (matches.length / words.length >= 0.6) newScore++;
                    }
                }
            }
        });
        setScore(newScore);
        // We'll store the total possible in the state if we want to show it easily
        setQuizData(prev => ({ ...prev, totalPossiblePoints: totalPossible }));
    };

    const retakeQuiz = () => {
        let qList = shuffleArray([...(quizData.questions || [])]);
        if (qList.length > 40) qList = qList.slice(0, 40);
        setQuestions(qList);

        setCurrentQIndex(0);
        setUserAnswers({});
        setShowResult(false);
        setShowSolution(false);
        setScore(0);
        if (quizData.timeLimit) setTimeLeft(parseInt(quizData.timeLimit) * 60);
    };

    // --- UI COMPONENTS ---
    const QuestionNavigator = () => (
        <div className="bg-blue-50/50 border-b border-gray-100 px-6 py-3 overflow-x-auto custom-scrollbar flex space-x-2">
            {questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined && userAnswers[q.id] !== "";
                const isCurrent = currentQIndex === idx;

                return (
                    <button
                        key={q.id}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`min-w-[40px] h-10 rounded-lg font-bold text-sm transition-all flex items-center justify-center shrink-0 ${isCurrent
                            ? "bg-[#4169E1] text-white shadow-md scale-110"
                            : isAnswered
                                ? "bg-blue-100 text-[#4169E1] hover:bg-blue-200"
                                : "bg-white border border-gray-200 text-gray-400 hover:border-[#4169E1] hover:text-[#4169E1]"
                            }`}
                    >
                        {idx + 1}
                    </button>
                );
            })}
        </div>
    );

    const TabularText = ({ text }) => {
        if (!text || typeof text !== 'string') return null;
        // Detect if text contains a "table-like" structure (lines with multiple columns)
        // Usually, these look like: Header Header\n1 2\n3 4
        const lines = text.split('\n');
        const potentialTable = lines.filter(l => l.trim().length > 0 && l.split(/\s{2,}/).length > 1);

        if (potentialTable.length >= 2) {
            // Very basic heuristic: if multiple lines have multiple spaces as separators
            const nonTablePrefix = [];
            let tableLines = [];
            let inTable = false;

            lines.forEach(line => {
                const cols = line.trim().split(/\s{2,}/);
                if (cols.length > 1) {
                    inTable = true;
                    tableLines.push(cols);
                } else if (!inTable) {
                    nonTablePrefix.push(line);
                }
            });

            return (
                <MathJax>
                    <div className="space-y-4">
                        {nonTablePrefix.map((l, i) => <p key={i}>{l}</p>)}
                        <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-sm">
                            <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-gray-100">
                                    {tableLines.map((row, rIdx) => (
                                        <tr key={rIdx} className={rIdx === 0 ? "bg-blue-50/50 font-bold" : "hover:bg-gray-50/50 transition-colors"}>
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="px-4 py-3 border-r last:border-0 border-gray-100">
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </MathJax>
            );
        }

        return <MathJax><p className="whitespace-pre-line">{text}</p></MathJax>;
    };

    if (showResult) {
        return (
            <MathJaxContext config={mathJaxConfig}>
                <main className={`min-h-screen ${THEME.bg} text-white p-4 flex flex-col items-center justify-center`}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white text-black p-6 md:p-10 rounded-2xl shadow-2xl max-w-2xl w-full text-center"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#4169E1]">Quiz Completed!</h1>
                        <div className="text-5xl md:text-6xl font-black mb-6">
                            {score} / {quizData.totalPossiblePoints || questions.length}
                        </div>
                        <p className="text-gray-500 mb-4">
                            {score === questions.length ? "Perfect Score! 🌟" :
                                score > questions.length / 2 ? "Great Job! 👍" : "Keep Practicing! 💪"}
                        </p>
                        <div className="mb-8 p-3 bg-purple-50 rounded-xl border border-purple-100 italic transition-all animate-pulse">
                            <p className="text-[11px] text-purple-600 font-medium">
                                Keep practicing, who knows! 🚀✨ There are over 1,000 questions on Quiznator to master!
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => setShowSolution(true)}
                                className="px-6 py-3 border-2 border-[#4169E1] text-[#4169E1] font-bold rounded-xl hover:bg-[#4169E1] hover:text-white transition-colors flex items-center justify-center"
                            >
                                <BookOpen size={20} className="mr-2" /> Show Solution
                            </button>
                            <button
                                onClick={retakeQuiz}
                                className="px-6 py-3 bg-[#4169E1] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-500/30"
                            >
                                <RefreshCw size={20} className="mr-2" /> Retake Quiz
                            </button>
                        </div>

                        {showSolution && (
                            <div className="mt-10 text-left space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                {questions.map((q, i) => (
                                    <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="font-bold mb-2">
                                            Q{i + 1}: <TabularText text={q.text} />
                                        </div>
                                        {q.type === 'mcq' ? (
                                            <div className="space-y-1">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className={`px-3 py-2 rounded text-sm ${oIdx === q.correctOption ? "bg-green-100 text-green-800 font-bold border border-green-200" :
                                                        userAnswers[q.id] === oIdx ? "bg-red-100 text-red-800 border border-red-200" : "text-gray-600"
                                                        }`}>
                                                        {opt} {oIdx === q.correctOption && <CheckCircle size={14} className="inline ml-1" />}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Your Answer:{" "}
                                                    <span className={
                                                        (typeof userAnswers[q.id] === 'string' && typeof q.answer === 'string' && userAnswers[q.id]?.toLowerCase() === q.answer?.toLowerCase())
                                                            ? "text-green-600"
                                                            : q.isTableAnswer ? "text-blue-600" : "text-red-500"
                                                    }>
                                                        {q.isTableAnswer ? "(Table Submitted)" : (userAnswers[q.id] || "No Answer")}
                                                    </span>
                                                </p>
                                                {!q.isTableAnswer && <p className="text-xs text-green-600 font-bold">Correct Answer: {q.answer}</p>}
                                                {q.isTableAnswer && <p className="text-xs text-blue-600 font-bold">Points Earned: {
                                                    userAnswers[q.id] && typeof userAnswers[q.id] === 'object'
                                                        ? Math.floor((userAnswers[q.id].rows?.filter(r => r.some(c => c && c.trim())).length / userAnswers[q.id].rows?.length) * 100)
                                                        : 0
                                                } / 100</p>}
                                            </div>
                                        )}

                                        {/* Explanation Section */}
                                        {q.explanation && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-[#4169E1]">
                                                <p className="text-[11px] uppercase font-bold text-[#4169E1] mb-1">Explanation</p>
                                                <p className="text-xs text-gray-700 leading-relaxed">{q.explanation}</p>
                                            </div>
                                        )}

                                        {/* Review Section - Correction View */}
                                        {q.isTableAnswer && userAnswers[q.id] && (
                                            <div className="mt-4 space-y-4">
                                                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                    <p className="text-[10px] uppercase font-bold text-[#4169E1] mb-2 flex items-center gap-2">
                                                        <Sparkles size={12} /> Pedagogical Correction View
                                                    </p>
                                                    <CorrectionTable userTable={userAnswers[q.id]} modelTable={q.answerTable} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Review Section - Reference Table */}
                                        {q.includeTable && q.tableData && q.tableData.headers.some(h => h.trim()) && (
                                            <div className="mt-4">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Reference Table</p>
                                                <DisplayTable tableData={q.tableData} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </main>
            </MathJaxContext>
        )
    }

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-[#4169E1] border-t-transparent rounded-full animate-spin mb-4"></div>
                <h1 className="text-white font-cinzel tracking-widest text-xl animate-pulse">LOADING QUIZ...</h1>
            </div>
        </div>
    );

    if (!quizData) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Quiz not found.</div>;

    if (questions.length === 0) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col">
            <h1 className="text-2xl font-bold mb-4 text-[#4169E1]">No Questions Available</h1>
            <p className="text-gray-400 mb-8">This quiz seems to be empty. Please contact your administrator.</p>
            <Link href="/dashboard" className="px-6 py-3 bg-[#4169E1] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                Return to Dashboard
            </Link>
        </div>
    );


    const currentQ = questions[currentQIndex];

    return (
        <MathJaxContext config={mathJaxConfig}>
            <main className={`min-h-screen ${THEME.bg} text-white flex items-center justify-center p-4`}>
                <motion.div
                    key={currentQIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl bg-white text-black rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                        <div>
                            <span className="text-xs font-bold text-[#4169E1] tracking-wider uppercase">{quizData.courseCode}</span>
                            <h2 className="text-xl font-bold truncate max-w-[200px] md:max-w-md">{quizData.topic}</h2>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <div className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-mono font-bold flex items-center text-sm md:text-base ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                                <Clock size={16} className="mr-2" />
                                {formatTime(timeLeft)}
                            </div>
                            <div className="bg-[#4169E1] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-mono font-bold text-sm md:text-base">
                                {currentQIndex + 1} / {questions.length}
                            </div>
                        </div>
                    </div>

                    {/* Responsive Paginator */}
                    <QuestionNavigator />

                    {/* Question Body */}
                    <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">

                        {/* Per-Question Reference Table */}
                        {currentQ.includeTable && currentQ.tableData && currentQ.tableData.headers.some(h => h.trim()) && (
                            <div className="mb-8">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Reference Data</p>
                                <DisplayTable tableData={currentQ.tableData} />
                            </div>
                        )}

                        <div className="text-xl md:text-2xl font-medium mb-8 leading-relaxed text-gray-800">
                            <TabularText text={currentQ.text} />
                        </div>

                        {currentQ.type === 'mcq' && (
                            <div className="grid grid-cols-1 gap-3">
                                {currentQ.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${userAnswers[currentQ.id] === idx
                                            ? "border-[#4169E1] bg-blue-50 text-[#4169E1]"
                                            : "border-gray-50 hover:border-gray-200 hover:bg-gray-50 text-gray-600"
                                            }`}
                                    >
                                        <span className="font-medium pr-4"><MathJax inline>{opt}</MathJax></span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${userAnswers[currentQ.id] === idx ? "border-[#4169E1]" : "border-gray-300"
                                            }`}>
                                            {userAnswers[currentQ.id] === idx && <div className="w-3 h-3 bg-[#4169E1] rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {(currentQ.type === 'theory' || currentQ.type === 'fill_blanks') && (
                            <div className="relative">
                                {currentQ.isTableAnswer ? (
                                    <UserTableAnswer
                                        template={currentQ.answerTable}
                                        value={userAnswers[currentQ.id]}
                                        onChange={(val) => handleAnswer(val)}
                                    />
                                ) : (
                                    <textarea
                                        className="w-full p-5 border-2 border-gray-100 rounded-2xl focus:border-[#4169E1] focus:ring-4 focus:ring-blue-50 focus:outline-none min-h-[180px] text-lg transition-all"
                                        placeholder="Type your answer here..."
                                        value={userAnswers[currentQ.id] || ""}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                        <button
                            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQIndex === 0}
                            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center ${currentQIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <ArrowLeft className="mr-2" size={20} /> <span className="hidden sm:inline">Previous</span>
                        </button>

                        <button
                            onClick={nextQuestion}
                            className="bg-[#4169E1] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center shadow-lg shadow-blue-500/30 active:scale-95"
                        >
                            {currentQIndex === questions.length - 1 ? "Finish Quiz" : <><span className="hidden sm:inline">Next Question</span><span className="sm:hidden">Next</span></>}
                            <ArrowRight className="ml-2" />
                        </button>
                    </div>
                </motion.div>
            </main>
        </MathJaxContext>
    );
}

const CorrectionTable = ({ userTable, modelTable }) => {
    if (!modelTable || !modelTable.headers) return <p className="text-xs text-gray-400">Model answer missing.</p>;

    const userRows = userTable?.rows || [];
    const modelRows = modelTable.rows || [];

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#4169E1] text-white">
                    <tr>
                        {modelTable.headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 font-bold uppercase tracking-wider border-r border-blue-400 last:border-0">{h}</th>
                        ))}
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {/* 1. Show Model Rows and compare with User */}
                    {modelRows.map((mRow, mIdx) => {
                        const accountName = mRow[0];
                        const uRow = userRows.find(r => r[0] === accountName);

                        return (
                            <tr key={`model-${mIdx}`} className={uRow ? "bg-white" : "bg-orange-50/30"}>
                                {mRow.map((mCell, cIdx) => {
                                    const uCell = uRow ? uRow[cIdx] : null;
                                    const isCorrect = uCell?.toString().toLowerCase().trim() === mCell?.toString().toLowerCase().trim();

                                    return (
                                        <td key={cIdx} className="px-4 py-3 border-r border-gray-100 last:border-0">
                                            <div className="flex flex-col">
                                                <span className={uRow ? (isCorrect ? "text-green-600 font-bold" : "text-red-500 line-through") : "text-gray-300 italic"}>
                                                    {uCell || (uRow ? "(Empty)" : "(Missing)")}
                                                </span>
                                                {(!isCorrect || !uRow) && (
                                                    <span className="text-[10px] text-green-700 font-bold mt-1 bg-green-50 px-1 rounded w-fit">
                                                        {mCell}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                                <td className="px-4 py-3">
                                    {uRow ? (
                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Matched</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter">Missing Entry</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}

                    {/* 2. Show Extra User Rows (that don't exist in model) */}
                    {userRows.filter(uRow => !modelRows.some(mRow => mRow[0] === uRow[0]) && uRow.some(c => c?.toString().trim())).map((uRow, uIdx) => (
                        <tr key={`extra-${uIdx}`} className="bg-red-50/30">
                            {uRow.map((uCell, cIdx) => (
                                <td key={cIdx} className="px-4 py-3 border-r border-gray-100 last:border-0 text-red-400 line-through">
                                    {uCell}
                                </td>
                            ))}
                            <td className="px-4 py-3">
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Extra / Incorrect</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const DisplayTable = ({ tableData }) => {
    if (!tableData || !tableData.headers) return null;
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#4169E1] text-white">
                    <tr>
                        {tableData.headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 font-bold uppercase tracking-wider border-r border-blue-400 last:border-0">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {tableData.rows.map((row, rI) => (
                        <tr key={rI} className="hover:bg-gray-50/50 transition-colors">
                            {row.map((cell, cI) => (
                                <td key={cI} className="px-4 py-3 border-r border-gray-100 last:border-0">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const UserTableAnswer = ({ template, value, onChange }) => {
    // Extract available accounts from the template (model answer)
    // Assuming first column (0) contains the account names
    const accountPool = Array.from(new Set(template?.rows?.map(r => r[0]).filter(a => a && a.trim()) || []));

    const [table, setTable] = useState(value || {
        headers: template?.headers || ["", ""],
        rows: template?.rows?.map(r => r.map(() => "")) || [["", ""]]
    });

    useEffect(() => {
        if (value) setTable(value);
    }, [value]);

    const updateRow = (rI, cI, val) => {
        const newTable = { ...table, rows: [...table.rows] };
        newTable.rows[rI] = [...newTable.rows[rI]];
        newTable.rows[rI][cI] = val;
        setTable(newTable);
        onChange(newTable);
    };

    const addRow = () => {
        const newTable = { ...table, rows: [...table.rows, new Array(table.headers.length).fill("")] };
        setTable(newTable);
        onChange(newTable);
    };

    // Get accounts already selected in other rows (to filter the pool)
    const getSelectedAccounts = (currentRowIndex) => {
        return table.rows
            .map((r, i) => i !== currentRowIndex ? r[0] : null)
            .filter(a => a);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border-2 border-gray-100 shadow-inner bg-gray-50/50 p-4">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr>
                            {table.headers.map((h, i) => (
                                <th key={i} className="px-4 py-3 font-bold text-gray-700 uppercase tracking-widest text-[10px] text-center bg-gray-100 rounded-t-lg mx-1">{h || `Col ${i + 1}`}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {table.rows.map((row, rI) => (
                            <tr key={rI}>
                                {row.map((cell, cI) => (
                                    <td key={cI} className="p-1">
                                        {cI === 0 ? (
                                            <select
                                                value={cell}
                                                onChange={(e) => updateRow(rI, cI, e.target.value)}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#4169E1] focus:outline-none transition-colors font-medium shadow-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Account...</option>
                                                {accountPool
                                                    .filter(acc => !getSelectedAccounts(rI).includes(acc) || acc === cell)
                                                    .map((acc, index) => (
                                                        <option key={index} value={acc}>{acc}</option>
                                                    ))}
                                            </select>
                                        ) : (
                                            <input
                                                value={cell}
                                                onChange={(e) => updateRow(rI, cI, e.target.value)}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-[#4169E1] focus:outline-none transition-colors text-center font-medium shadow-sm"
                                                placeholder="..."
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={addRow}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#4169E1] hover:border-blue-200 transition-all shadow-sm"
            >
                Add Row
            </button>
        </div>
    );
};
