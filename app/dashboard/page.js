"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Folder, Clock, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        async function fetchQuizzes() {
            try {
                const res = await fetch("/api/quizzes");
                const data = await res.json();
                setQuizzes(data.quizzes || []);
            } catch (error) {
                console.error("Failed to load quizzes", error);
            } finally {
                setLoading(false);
            }
        }
        fetchQuizzes();
    }, []);

    // Group Quizzes by Course Code
    const courses = Object.entries(
        quizzes.reduce((groups, quiz) => {
            const code = quiz.courseCode || "Uncategorized";
            if (!groups[code]) groups[code] = [];
            groups[code].push(quiz);
            return groups;
        }, {})
    ).sort(([codeA], [codeB]) => codeA.localeCompare(codeB));

    return (
        <main className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gold-600/10 blur-[120px]"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="font-cinzel text-4xl font-bold tracking-widest text-white mb-2">
                            MY STUDY SPACE
                        </h1>
                        <p className="text-gray-400">
                            {selectedCourse ? `Viewing ${selectedCourse} Quizzes` : "Select a Course Folder to begin."}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        {selectedCourse && (
                            <button
                                onClick={() => setSelectedCourse(null)}
                                className="text-xs text-gold-500 hover:text-white transition-colors uppercase tracking-widest flex items-center"
                            >
                                <ArrowRight className="rotate-180 mr-2" size={14} /> Back to Folders
                            </button>
                        )}
                        <Link href="/" className="text-xs text-gold-500 hover:text-white transition-colors uppercase tracking-widest">
                            Back to Home
                        </Link>
                    </div>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5">
                        <Folder size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No quizzes available yet. Ask your admin to upload some!</p>
                    </div>
                ) : (
                    <div>
                        {!selectedCourse ? (
                            // Level 1: Folders
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {/* General Test Special Card */}
                                <div className="col-span-full md:col-span-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 p-8 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">General Knowledge Test</h2>
                                        <p className="text-gray-300 text-sm">Combine all topics into one ultimate exam.</p>
                                    </div>
                                    <Link
                                        href="/quiz/general"
                                        className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform whitespace-nowrap"
                                    >
                                        Take General Test
                                    </Link>
                                </div>

                                {courses.map(([code, list]) => (
                                    <motion.div
                                        key={code}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedCourse(code)}
                                        className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl hover:bg-gold-500/10 hover:border-gold-500/50 transition-all cursor-pointer flex flex-col items-center justify-center h-48 group"
                                    >
                                        <Folder size={48} className="text-gold-500 mb-4 group-hover:text-gold-400" />
                                        <h3 className="text-xl font-bold text-white">{code}</h3>
                                        <span className="text-xs text-gray-400 mt-2">{list.length} Quizzes</span>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            // Level 2: Quizzes in Course
                            <div>
                                <div className="mb-8 p-6 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gold-500">Cumulative {selectedCourse} Test</h3>
                                        <p className="text-sm text-gray-400">Take a test combining all {selectedCourse} quizzes.</p>
                                    </div>
                                    <Link
                                        // Pass course code as filename with prefix "course:" which API will handle
                                        href={`/quiz/course:${selectedCourse}`}
                                        className="bg-gold-500 text-black px-6 py-2 rounded font-bold hover:bg-gold-400 transition-colors"
                                    >
                                        Start Course Exam
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courses.find(c => c[0] === selectedCourse)?.[1]
                                        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                                        .map((quiz, index) => (
                                            <Link key={index} href={`/quiz/${quiz.fileName}`}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.02, translateY: -5 }}
                                                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl hover:bg-white/10 hover:border-gold-500/30 transition-all cursor-pointer group h-full flex flex-col"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="p-3 bg-white/5 rounded-lg text-gray-400 group-hover:text-white transition-colors">
                                                            <FileText size={24} />
                                                        </div>
                                                        <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">
                                                            {quiz.courseCode}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                                                        {quiz.topic}
                                                    </h3>

                                                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400 border-t border-white/5">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="flex items-center"><Clock size={12} className="mr-1" /> {quiz.timeLimit}m</span>
                                                            <span className="flex items-center"><FileText size={12} className="mr-1" /> {quiz.questionCount} Qs</span>
                                                        </div>
                                                        <ArrowRight size={16} className="text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
