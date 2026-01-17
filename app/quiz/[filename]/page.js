"use client";

import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, RefreshCw, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
                    setTimeLeft(parseInt(quiz.timeLimit) * 60);
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
        questions.forEach(q => {
            const uAns = userAnswers[q.id];
            if (q.type === 'mcq') {
                if (uAns === q.correctOption) newScore++;
            } else {
                // Fuzzy/AI Logic
                const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '') || "";
                const uVal = normalize(uAns);
                const cVal = normalize(q.answer);

                if (!uVal) return; // empty

                // 1. Direct
                if (uVal === cVal) { newScore++; return; }

                // 2. Levenshtein
                const dist = levenshtein(uVal, cVal);
                const maxLen = Math.max(uVal.length, cVal.length);
                if (maxLen > 0 && (1 - dist / maxLen) >= 0.75) { newScore++; return; }

                // 3. Keyword
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

    if (loading) return <div className="min-h-screen bg-royal-900 text-white flex items-center justify-center">Loading...</div>;
    if (!quizData) return <div className="min-h-screen bg-royal-900 text-white flex items-center justify-center">Quiz not found.</div>;

    // Royal Blue Theme Constants
    const THEME = {
        bg: "bg-[#4169E1]", // Light Royal Blue
        card: "bg-white text-black",
        accent: "text-royal-800",
        button: "bg-black text-white hover:bg-gray-900"
    };

    if (showResult) {
        return (
            <main className={`min-h-screen ${THEME.bg} text-white p-8 flex flex-col items-center justify-center`}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white text-black p-10 rounded-2xl shadow-2xl max-w-2xl w-full text-center"
                >
                    <h1 className="text-4xl font-bold mb-4 text-[#4169E1]">Quiz Completed!</h1>
                    <div className="text-6xl font-black mb-6">
                        {score} / {questions.length}
                    </div>
                    <p className="text-gray-500 mb-8">
                        {score === questions.length ? "Perfect Score! 🌟" :
                            score > questions.length / 2 ? "Great Job! 👍" : "Keep Practicing! 💪"}
                    </p>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => setShowSolution(true)}
                            className="px-6 py-3 border-2 border-[#4169E1] text-[#4169E1] font-bold rounded-xl hover:bg-[#4169E1] hover:text-white transition-colors flex items-center"
                        >
                            <BookOpen size={20} className="mr-2" /> Show Solution
                        </button>
                        <button
                            onClick={retakeQuiz}
                            className="px-6 py-3 bg-[#4169E1] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-500/30"
                        >
                            <RefreshCw size={20} className="mr-2" /> Retake Quiz
                        </button>
                    </div>

                    {showSolution && (
                        <div className="mt-10 text-left space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                            {questions.map((q, i) => (
                                <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="font-bold mb-2">Q{i + 1}: {q.text}</p>
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
                                            <p className="text-xs text-gray-500">Your Answer: <span className={userAnswers[q.id]?.toLowerCase() === q.answer?.toLowerCase() ? "text-green-600" : "text-red-500"}>{userAnswers[q.id] || "No Answer"}</span></p>
                                            <p className="text-xs text-green-600 font-bold">Correct Answer: {q.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </main>
        )
    }

    const currentQ = questions[currentQIndex];

    return (
        <main className={`min-h-screen ${THEME.bg} text-white flex items-center justify-center p-4`}>
            <motion.div
                key={currentQIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-3xl bg-white text-black rounded-3xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col"
            >
                {/* Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <span className="text-xs font-bold text-[#4169E1] tracking-wider uppercase">{quizData.courseCode}</span>
                        <h2 className="text-xl font-bold">{quizData.topic}</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className={`px-4 py-2 rounded-full font-mono font-bold flex items-center ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-200 text-gray-700'}`}>
                            <Clock size={16} className="mr-2" />
                            {formatTime(timeLeft)}
                        </div>
                        <div className="bg-[#4169E1] text-white px-4 py-2 rounded-full font-mono font-bold">
                            {currentQIndex + 1} / {questions.length}
                        </div>
                    </div>
                </div>

                {/* Question Body */}
                <div className="p-8 flex-1">
                    <h3 className="text-2xl font-medium mb-8 leading-relaxed">
                        {currentQ.text}
                    </h3>

                    {currentQ.type === 'mcq' && (
                        <div className="space-y-3">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all group flex items-center justify-between ${userAnswers[currentQ.id] === idx
                                        ? "border-[#4169E1] bg-blue-50 text-[#4169E1]"
                                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <span className="font-medium">{opt}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${userAnswers[currentQ.id] === idx ? "border-[#4169E1]" : "border-gray-300"
                                        }`}>
                                        {userAnswers[currentQ.id] === idx && <div className="w-2.5 h-2.5 bg-[#4169E1] rounded-full" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {(currentQ.type === 'theory' || currentQ.type === 'fill_blanks') && (
                        <textarea
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#4169E1] focus:outline-none min-h-[150px] text-lg"
                            placeholder="Type your answer here..."
                            value={userAnswers[currentQ.id] || ""}
                            onChange={(e) => handleAnswer(e.target.value)}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
                    <button
                        onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQIndex === 0}
                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center ${currentQIndex === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <ArrowLeft className="mr-2" size={20} /> Previous
                    </button>

                    <button
                        onClick={nextQuestion}
                        className="bg-[#4169E1] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center shadow-lg shadow-blue-500/30"
                    >
                        {currentQIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                        <ArrowRight className="ml-2" />
                    </button>
                </div>
            </motion.div>
        </main>
    );
}
