"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Lock, BookOpen } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  // PWA Install State
  const [installPrompt, setInstallPrompt] = React.useState(null);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gold-600/10 blur-[100px]"></div>

      {/* PWA Install Button */}
      {installPrompt && (
        <button
          onClick={handleInstall}
          className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all flex items-center"
        >
          <span className="mr-2">⚡</span> Install App
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl z-10 text-center"
      >
        <h1 className="font-cinzel text-6xl font-bold tracking-widest text-white mb-4">
          D'MAVERICS <span className="text-purple-500">QUIznator</span>
        </h1>
        <p className="text-gray-400 mb-12 text-lg tracking-wide">
          MASTER YOUR CRAFT. CONQUER EXAMS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Study Option */}
          <Link href="/dashboard" className="group block h-full">
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-gold-500/10 hover:border-gold-500/50 transition-all cursor-pointer h-full flex flex-col items-center justify-center space-y-4"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-black shadow-lg shadow-gold-500/20 group-hover:scale-110 transition-transform">
                <BookOpen size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-gold-400 transition-colors">
                Study for Exams
              </h2>
              <p className="text-sm text-gray-500 group-hover:text-gray-300">
                Access quizzes, mock tests, and study materials.
              </p>
            </motion.div>
          </Link>

          {/* Admin Option */}
          <Link href="/admin" className="group block h-full">
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-purple-500/10 hover:border-purple-500/50 transition-all cursor-pointer h-full flex flex-col items-center justify-center space-y-4"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                Admin Access
              </h2>
              <p className="text-sm text-gray-500 group-hover:text-gray-300">
                Upload new quizzes and manage content.
              </p>
            </motion.div>
          </Link>
        </div>

        {/* Motivation & Privacy Section */}
        <div className="mt-20 max-w-3xl mx-auto space-y-8 pb-10">
          <div className="bg-gradient-to-r from-purple-500/10 to-gold-500/10 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
            <p className="text-white font-medium text-lg italic">
              "Did you know? There are over <span className="text-gold-400 font-bold">1,000</span> questions on Quiznator! Keep practicing, who knows! 🚀📚✨"
            </p>
          </div>

          <div className="text-gray-500 text-xs px-4 leading-relaxed max-w-xl mx-auto border-t border-white/5 pt-6">
            <p className="mb-2 uppercase tracking-widest text-[10px] text-gray-400 font-bold">Privacy & Objective</p>
            Quiznator is built with one goal: helping you pass. We value your privacy—none of your data is collected, and that's why your scores aren't saved online. Your journey is yours alone.
          </div>
        </div>
      </motion.div>
    </main>
  );
}
