"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Save, Plus, Trash2, FileText, List, Grid, Settings, LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuiznatorAdmin() {
  const router = useRouter();

  // Views: 'auth' | 'menu' | 'upload' | 'manage'
  const [view, setView] = useState('auth');
  const [isEditing, setIsEditing] = useState(false);

  // Auth State
  const [securityCode, setSecurityCode] = useState("");
  const [authError, setAuthError] = useState("");

  // Upload/Manage State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    securityCode: "112233", // Hidden / Pre-filled after auth
    courseCode: "",
    topic: "",
    marks: "",
    timeLimit: "",
    quizType: "theory",
    questions: [],
  });

  // --- Auth Logic ---
  const handleLogin = () => {
    if (securityCode === "112233") {
      setView('menu');
      setAuthError("");
    } else {
      setAuthError("Access Denied: Invalid Code");
    }
  };

  // --- Data Fetching ---
  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (e) { setError("Failed to load quizzes"); }
  };

  useEffect(() => {
    if (view === 'manage') fetchQuizzes();
  }, [view]);

  // --- Manage Logic ---
  const loadQuizForEdit = async (filename) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz?filename=${filename}`);
      if (!res.ok) throw new Error("Failed to load quiz");
      const data = await res.json();
      setFormData({
        securityCode: "112233",
        courseCode: data.courseCode,
        topic: data.topic,
        marks: data.marks,
        timeLimit: data.timeLimit,
        quizType: data.quizType,
        questions: data.questions || [],
      });
      setIsEditing(true);
      setView('upload');
      setStep(1); // Metadata is step 1 now effectively
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (filename) => {
    if (!confirm("Are you sure you want to delete this quiz? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/quiz?filename=${filename}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuizzes(); // Refresh list
      } else {
        alert("Failed to delete");
      }
    } catch (e) { console.error(e); }
  };

  // --- Form Logic ---
  const nextStep = () => {
    setError("");
    if (step === 1 && (!formData.courseCode || !formData.topic || !formData.marks || !formData.timeLimit)) {
      setError("Please fill in all fields including Time Limit");
      return;
    }
    if (step === 3 && formData.questions.length === 0) {
      setError("Please add at least one question.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quiznator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setSuccess(`Quiz saved: ${data.filename}`);

      setTimeout(() => {
        setSuccess("");
        resetForm();
        setView('manage'); // Go to list after save
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      securityCode: "112233",
      courseCode: "",
      topic: "",
      marks: "",
      timeLimit: "",
      questions: [],
    });
  };

  // --- RENDERERS ---

  if (view === 'auth') {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
        <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[120px]"></div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <Lock size={48} className="mx-auto text-purple-500 mb-4" />
            <h1 className="font-cinzel text-2xl font-bold tracking-widest text-white">ADMIN ACCESS</h1>
            <p className="text-gray-500 text-sm">Enter security code to proceed</p>
          </div>

          <input
            type="password"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            placeholder="Security Code"
            className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-center text-white text-xl tracking-[0.5em] focus:border-purple-500 focus:outline-none mb-4"
          />

          {authError && <p className="text-red-500 text-center mb-4 text-sm">{authError}</p>}

          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Unlock System
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 text-gray-500 hover:text-white text-sm"
          >
            Back to Home
          </button>
        </motion.div>
      </main>
    );
  }

  if (view === 'menu') {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gold-600/10 blur-[100px]"></div>

        <div className="w-full max-w-4xl z-10">
          <header className="flex justify-between items-center mb-12">
            <h1 className="font-cinzel text-3xl font-bold tracking-widest text-white">
              D'MAVERICS <span className="text-purple-500 text-xs align-top">ADMIN // MENU</span>
            </h1>
            <button onClick={() => setView('auth')} className="text-gray-500 hover:text-white flex items-center text-sm">
              <LogOut size={16} className="mr-2" /> Logout
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { resetForm(); setIsEditing(false); setView('upload'); }}
              className="h-64 bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-8 flex flex-col items-center justify-center group hover:border-purple-500 transition-colors"
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:text-black transition-colors text-purple-500">
                <Plus size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Create New Quiz</h2>
              <p className="text-gray-400 text-center max-w-xs">Start from scratch and upload a new quiz to the platform.</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('manage')}
              className="h-64 bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/30 rounded-2xl p-8 flex flex-col items-center justify-center group hover:border-blue-500 transition-colors"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-black transition-colors text-blue-500">
                <Settings size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Manage Quizzes</h2>
              <p className="text-gray-400 text-center max-w-xs">Edit existing quizzes or delete them from the database.</p>
            </motion.button>
          </div>
        </div>
      </main>
    );
  }

  if (view === 'manage') {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <button onClick={() => setView('menu')} className="mr-4 p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-blue-500">Manage Database</h1>
            </div>
          </header>

          <div className="grid gap-4">
            {quizzes.map((q) => (
              <div key={q.fileName} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center hover:bg-white/10 transition-colors">
                <div>
                  <span className="text-xs font-mono bg-blue-900/50 px-2 py-1 rounded text-blue-300 mr-3">{q.courseCode}</span>
                  <span className="font-bold">{q.topic}</span>
                  <span className="text-xs text-gray-500 ml-4">({q.questionCount} Qs)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => loadQuizForEdit(q.fileName)}
                    className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors border border-blue-600/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteQuiz(q.fileName)}
                    className="bg-red-600/20 text-red-500 p-2 rounded hover:bg-red-600 hover:text-white transition-colors border border-red-600/20"
                    title="Delete Quiz"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && <div className="text-center py-20 text-gray-500">No quizzes found.</div>}
          </div>
        </div>
      </main>
    );
  }

  // --- Upload View (The Form) ---
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button onClick={() => setView('menu')} className="mr-4 text-gray-500 hover:text-white"><ArrowLeft size={20} /></button>
            <h1 className="font-cinzel text-xl font-bold tracking-widest text-white">
              {isEditing ? 'EDIT QUIZ' : 'NEW QUIZ'}
            </h1>
          </div>

          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${step >= i ? 'bg-purple-500' : 'bg-gray-800'}`}
              />
            ))}
          </div>
        </div>

        {success ? (
          <div className="text-center py-10">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500"
            >
              <Save size={40} />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2 text-white">Success!</h3>
            <p className="text-gray-400">{success}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Metadata (Formerly Step 2) */}
              {step === 1 && <Step2Metadata formData={formData} setFormData={setFormData} />}
              {step === 2 && <Step3Type formData={formData} setFormData={setFormData} />}
              {step === 3 && <Step4Questions formData={formData} setFormData={setFormData} />}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer Actions */}
        {!success && (
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/5">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                Back
              </button>
            )}

            <div className="ml-auto flex items-center space-x-4">
              {error && <span className="text-red-500 text-sm font-bold animate-pulse">{error}</span>}

              <button
                onClick={step === 3 ? handleSubmit : nextStep}
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center shadow-lg shadow-purple-500/20"
              >
                {loading ? "Processing..." : (step === 3 ? "Save Quiz" : "Next Step")}
                {!loading && step !== 3 && <ArrowRight size={16} className="ml-2" />}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}

// Reuse Subcomponents (Slightly modified to remove Step 1 Security since we did it upfront)

const Step2Metadata = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-purple-500 mb-6">Course & Quiz Details</h2>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Course Code</label>
        <input
          type="text"
          value={formData.courseCode}
          onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="e.g. ACC101"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Time (Mins)</label>
        <input
          type="number"
          value={formData.timeLimit}
          onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="30"
        />
      </div>
    </div>

    <div>
      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Topic / Quiz Name</label>
      <input
        type="text"
        value={formData.topic}
        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
        placeholder="e.g. Balance Sheet Basics"
      />
    </div>

    <div>
      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Total Marks</label>
      <input
        type="number"
        value={formData.marks}
        onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
        placeholder="100"
      />
    </div>
  </div>
);

const Step3Type = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-purple-500 mb-6">Quiz Format</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {['mcq', 'fill_blanks', 'theory'].map((type) => (
        <button
          key={type}
          onClick={() => setFormData({ ...formData, quizType: type })}
          className={`p-4 rounded-xl border transition-all ${formData.quizType === type
            ? "bg-purple-500/20 border-purple-500 text-white"
            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
            }`}
        >
          <div className="mb-2 flex justify-center">
            {type === 'mcq' && <List size={24} />}
            {type === 'fill_blanks' && <FileText size={24} />}
            {type === 'theory' && <FileText size={24} />}
          </div>
          <span className="uppercase text-xs font-bold tracking-wider">{type.replace('_', ' ')}</span>
        </button>
      ))}
    </div>
  </div>
);

const Step4Questions = ({ formData, setFormData }) => {
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: Date.now(),
          text: "",
          type: formData.quizType,
          options: ["", "", "", ""],
          correctOption: 0,
          answer: "",
          explanation: "",
          includeTable: false,
          tableData: { headers: ["", ""], rows: [["", ""]] },
          isTableAnswer: false,
          answerTable: { headers: ["", ""], rows: [["", ""]] }
        }
      ]
    });
  };

  const removeQuestion = (id) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== id)
    });
  };

  const updateQuestion = (id, field, value) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
    });
  };

  const updateOption = (qId, optIndex, value) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q => {
        if (q.id === qId) {
          const newOpts = [...q.options];
          newOpts[optIndex] = value;
          return { ...q, options: newOpts };
        }
        return q;
      })
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-500">Questions ({formData.questions.length})</h2>
        <button onClick={addQuestion} className="text-sm bg-purple-500/20 text-purple-500 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors">
          + Add Question
        </button>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {formData.questions.map((q, index) => (
          <div key={q.id} className="bg-white/5 p-4 rounded-xl border border-white/10 relative group">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-xs font-bold uppercase">Question {index + 1}</span>
              <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>

            <textarea
              value={q.text}
              onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm focus:border-purple-500 focus:outline-none mb-3"
              placeholder="Enter question text..."
              rows={2}
            />

            {formData.quizType === 'mcq' && (
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctOption === oIdx}
                      onChange={() => updateQuestion(q.id, 'correctOption', oIdx)}
                      className="accent-purple-500"
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateOption(q.id, oIdx, e.target.value)}
                      className={`w-full bg-black/20 border ${q.correctOption === oIdx ? 'border-purple-500/50' : 'border-white/10'} rounded p-2 text-xs text-white focus:outline-none`}
                      placeholder={`Option ${oIdx + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {(formData.quizType === 'theory' || formData.quizType === 'fill_blanks') && !q.isTableAnswer && (
              <input
                value={q.answer}
                onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-white focus:outline-none"
                placeholder={formData.quizType === 'theory' ? "Model Answer / Key Points (Optional)" : "Correct Answer"}
              />
            )}

            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-purple-400">Explanation / AI Context</label>
                <button
                  onClick={() => {
                    const aiSuggestion = `Based on the question "${q.text.slice(0, 30)}...", the correct answer relates to ${q.type === 'mcq' ? q.options[q.correctOption] : (q.answer || 'the topic')}. [AI verified]`;
                    updateQuestion(q.id, 'explanation', aiSuggestion);
                  }}
                  className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-colors"
                >
                  Verify with AI
                </button>
              </div>
              <textarea
                value={q.explanation || ""}
                onChange={(e) => updateQuestion(q.id, 'explanation', e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded p-2 text-xs text-gray-300 focus:border-purple-500 focus:outline-none"
                placeholder="Explain why this answer is correct..."
                rows={2}
              />
            </div>

            {/* Per-Question Accounting Table Toggle */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id={`includeTable-${q.id}`}
                  checked={q.includeTable}
                  onChange={(e) => updateQuestion(q.id, 'includeTable', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-700"
                />
                <label htmlFor={`includeTable-${q.id}`} className="text-xs font-medium text-gray-400 cursor-pointer select-none flex items-center">
                  Include Reference Table? <Grid size={14} className="ml-2" />
                </label>
              </div>

              {q.includeTable && (
                <div className="bg-black/20 p-4 rounded-lg border border-white/5 mb-4">
                  <QuestionTableEditor question={q} tableKey="tableData" updateTable={(newData) => updateQuestion(q.id, 'tableData', newData)} />
                </div>
              )}

              {/* Theory Table Answer Toggle */}
              {formData.quizType === 'theory' && (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id={`isTableAnswer-${q.id}`}
                      checked={q.isTableAnswer}
                      onChange={(e) => updateQuestion(q.id, 'isTableAnswer', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                    />
                    <label htmlFor={`isTableAnswer-${q.id}`} className="text-xs font-medium text-gray-400 cursor-pointer select-none flex items-center">
                      User must provide a Table Answer? <FileText size={14} className="ml-2" />
                    </label>
                  </div>

                  {q.isTableAnswer && (
                    <div className="bg-blue-900/10 p-4 rounded-lg border border-blue-500/20">
                      <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Model Answer Table</p>
                      <QuestionTableEditor question={q} tableKey="answerTable" updateTable={(newData) => updateQuestion(q.id, 'answerTable', newData)} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {formData.questions.length === 0 && (
          <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-xl">
            No questions added yet. Click "+ Add Question" to start.
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionTableEditor = ({ question, tableKey, updateTable }) => {
  const tableData = question[tableKey];

  const updateHeader = (colIndex, val) => {
    const newHeaders = [...tableData.headers];
    newHeaders[colIndex] = val;
    updateTable({ ...tableData, headers: newHeaders });
  };

  const updateRow = (rowIndex, colIndex, val) => {
    const newRows = [...tableData.rows];
    newRows[rowIndex][colIndex] = val;
    updateTable({ ...tableData, rows: newRows });
  };

  const addCol = () => {
    updateTable({
      headers: [...tableData.headers, ""],
      rows: tableData.rows.map(r => [...r, ""])
    });
  };

  const addRow = () => {
    updateTable({
      ...tableData,
      rows: [...tableData.rows, new Array(tableData.headers.length).fill("")]
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              {tableData.headers.map((h, i) => (
                <th key={i} className="p-1 min-w-[80px]">
                  <input
                    value={h}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    placeholder={`Header ${i + 1}`}
                    className="w-full bg-black/30 border border-purple-500/20 text-purple-400 p-1 rounded text-center font-bold focus:outline-none focus:border-purple-500"
                  />
                </th>
              ))}
              <th className="p-1 w-8">
                <button onClick={addCol} className="p-1 bg-white/5 rounded hover:bg-purple-500/20 text-purple-500"><Plus size={12} /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rI) => (
              <tr key={rI}>
                {row.map((cell, cI) => (
                  <td key={cI} className="p-1">
                    <input
                      value={cell}
                      onChange={(e) => updateRow(rI, cI, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-1 rounded text-white focus:outline-none focus:border-blue-500"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} className="text-[10px] flex items-center text-purple-500 hover:text-white transition-colors">
        <Plus size={12} className="mr-1" /> Add Row
      </button>
    </div>
  );
};
