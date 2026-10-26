import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAuth } from "../hooks/useAuth";
import { useMcqTest } from "../hooks/useMcqTest";
import { POPULAR_ROLES, EXPERIENCE_LEVELS } from "../models/userProfile";

export default function McqTest() {
  const navigate = useNavigate();
  const { userEmail } = useAuth();

  const [selectedRole, setSelectedRole] = useState("Full Stack Developer");
  const [selectedExp, setSelectedExp] = useState("Fresher");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [filterReview, setFilterReview] = useState("all"); // "all" | "incorrect" | "correct"

  const {
    role,
    experience,
    questions,
    currentIdx,
    currentQuestion,
    answers,
    flagged,
    timeRemaining,
    formattedTime,
    isTestActive,
    isLoading,
    isSubmitting,
    isSubmitted,
    autoSubmitted,
    testResult,
    startTest,
    selectOption,
    clearOption,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitTest,
  } = useMcqTest(userEmail);

  // Stats calculation
  const totalQuestions = questions.length || 30;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  // Timer color indicator
  const getTimerClass = () => {
    if (timeRemaining <= 180) {
      return "border-rose-500/50 bg-rose-500/10 text-rose-400 animate-pulse";
    }
    if (timeRemaining <= 600) {
      return "border-amber-500/50 bg-amber-500/10 text-amber-400";
    }
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  };

  // Generate & Download PDF Report Card for MCQ Test
  const downloadMcqPdf = () => {
    if (!testResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Dark Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, "F");

    // Blue accent line
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 40, pageWidth, 2, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INTERVIEW ACE AI - MOCK MCQ TEST", 16, 20);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("OFFICIAL TIME-BOUND TECHNICAL ASSESSMENT REPORT", 16, 28);
    doc.text(`TEST ID: ${testResult.testId || "MCQ-RESULT"} • 25 MINUTE BENCHMARK`, 16, 35);

    // Score Badge
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageWidth - 75, 12, 60, 22, 3, 3, "F");
    doc.setTextColor(96, 165, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${testResult.score} / ${testResult.totalQuestions} (${testResult.percentage}%)`, pageWidth - 70, 23);
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Status: ${testResult.status}`, pageWidth - 70, 30);

    // Summary Table
    const minsSpent = Math.floor(testResult.timeSpentSeconds / 60);
    const secsSpent = testResult.timeSpentSeconds % 60;
    const timeFormatted = `${minsSpent}m ${secsSpent}s (of 25m)`;

    const summaryData = [
      ["Candidate Email", testResult.userEmail || "Candidate", "Test Date", testResult.date],
      ["Target Role", testResult.role, "Experience Level", testResult.experience],
      ["Correct Answers", `${testResult.correctAnswers} / ${testResult.totalQuestions}`, "Wrong Answers", `${testResult.wrongAnswers}`],
      ["Unanswered", `${testResult.unanswered}`, "Time Spent", timeFormatted]
    ];

    autoTable(doc, {
      startY: 50,
      body: summaryData,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 2.5, textColor: [30, 41, 59] },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 38 },
        1: { fontStyle: "bold", cellWidth: 55 },
        2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 38 },
        3: { fontStyle: "bold", cellWidth: 55 }
      }
    });

    // Topic Breakdown Table
    const startYTopics = (doc.lastAutoTable?.finalY || 80) + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("COMPETENCY & TOPIC BREAKDOWN", 16, startYTopics);

    const topicRows = (testResult.topicBreakdown || []).map((t) => [
      t.topic,
      `${t.correct} / ${t.total}`,
      `${t.percentage}%`,
      t.percentage >= 80 ? "Proficient" : t.percentage >= 60 ? "Average" : "Needs Improvement"
    ]);

    autoTable(doc, {
      startY: startYTopics + 3,
      head: [["Topic Area", "Score", "Percentage", "Mastery Level"]],
      body: topicRows,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, cellPadding: 2.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 16, right: 16 }
    });

    // Question Review Table
    const startYQuestions = (doc.lastAutoTable?.finalY || 130) + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("30-QUESTION DETAILED EVALUATION & ANSWERS", 16, startYQuestions);

    const questionRows = (testResult.answers || []).map((a, idx) => {
      const selectedText = a.selectedOption >= 0 ? a.options[a.selectedOption] : "(Unattempted)";
      const correctText = a.options[a.correctOption] || "";
      return [
        `Q${idx + 1}`,
        a.question,
        selectedText,
        correctText,
        a.isCorrect ? "CORRECT" : "WRONG",
        a.explanation || ""
      ];
    });

    autoTable(doc, {
      startY: startYQuestions + 3,
      head: [["#", "Question", "Your Choice", "Correct Answer", "Result", "Explanation"]],
      body: questionRows,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 9, fontStyle: "bold", halign: "center" },
        1: { cellWidth: 46 },
        2: { cellWidth: 32 },
        3: { cellWidth: 32 },
        4: { cellWidth: 16, fontStyle: "bold", halign: "center" },
        5: { cellWidth: 50 }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 12, right: 12 }
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Interview Ace AI | Mock MCQ 30-Question Assessment | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );
    }

    doc.save(`InterviewAce_MCQ_${testResult.role.replace(/[^a-zA-Z0-9]/g, "_")}_Scorecard.pdf`);
  };

  // ==========================================
  // STATE 1: PRE-TEST SETUP SCREEN
  // ==========================================
  if (!isTestActive && !isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <Navbar />

        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 animate-pulse">
              <span>🧠</span>
              <span>Dynamic AI Technical Assessment</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Mock <span className="text-blue-400">MCQ Test</span>
            </h1>

            <p className="mx-auto max-w-xl text-sm text-slate-400">
              Test your technical knowledge with 30 dynamically generated multiple-choice questions tailored to your exact role, under a strict 25-minute timer.
            </p>
          </div>

          {/* Configuration Card */}
          <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Target Job Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {POPULAR_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Experience Difficulty Level
                </label>
                <select
                  value={selectedExp}
                  onChange={(e) => setSelectedExp(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Rules Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📋</span> Test Format & Evaluation Rules
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">⏱️</span>
                  <span><strong>25 Minutes Timer:</strong> Begins immediately when you click start.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">❓</span>
                  <span><strong>30 Technical MCQs:</strong> Single best answer from 4 options.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">⚡</span>
                  <span><strong>Auto-Submit:</strong> Automatically submits when the timer hits 00:00.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">💾</span>
                  <span><strong>MongoDB Persistence:</strong> Results permanently stored in database.</span>
                </div>
              </div>
            </div>

            {/* Launch CTA Button */}
            <button
              onClick={() => startTest(selectedRole, selectedExp)}
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-extrabold text-white shadow-xl shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.01] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generating 30 Dynamic Questions with Gemini AI...
                </span>
              ) : (
                "🚀 Start Mock MCQ Test (25 Mins) →"
              )}
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================
  // STATE 2: ACTIVE 30-MCQ TEST ENVIRONMENT
  // ==========================================
  if (isTestActive && !isSubmitted && currentQuestion) {
    const selectedOptionIndex = answers[currentQuestion.id];
    const isCurrentFlagged = Boolean(flagged[currentQuestion.id]);

    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white select-none">
        {/* Top Active Test Header */}
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            {/* Role & Question Progress */}
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-3 py-1 font-mono text-xs font-bold text-blue-400">
                MCQ TEST
              </span>
              <span className="hidden sm:inline font-bold text-sm text-slate-200">
                {role} ({experience})
              </span>
            </div>

            {/* Center: Live 25-Minute Countdown Timer */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden md:inline">Time Remaining:</span>
              <div className={`flex items-center gap-2 rounded-xl border px-4 py-1.5 font-mono text-sm font-bold shadow-lg ${getTimerClass()}`}>
                <span className="h-2 w-2 rounded-full bg-current animate-ping" />
                <span>{formattedTime}</span>
              </div>
            </div>

            {/* Right: Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-500 transition"
            >
              Submit Test ✓
            </button>
          </div>
        </header>

        {/* Main Test Grid */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 cols): Question Canvas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-blue-400">
                    Question {currentIdx + 1} of {totalQuestions}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                    {currentQuestion.topic || "Technical"}
                  </span>
                </div>

                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    isCurrentFlagged
                      ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>🚩</span>
                  <span>{isCurrentFlagged ? "Flagged" : "Flag"}</span>
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-lg md:text-xl font-bold leading-relaxed text-white">
                {currentQuestion.question}
              </h2>

              {/* 4 Option Cards */}
              <div className="mt-8 space-y-3.5">
                {(currentQuestion.options || []).map((option, optIdx) => {
                  const isSelected = selectedOptionIndex === optIdx;
                  const optionLetters = ["A", "B", "C", "D"];

                  return (
                    <div
                      key={optIdx}
                      onClick={() => selectOption(currentQuestion.id, optIdx)}
                      className={`group flex items-center gap-4 cursor-pointer rounded-2xl border p-4.5 transition duration-150 ${
                        isSelected
                          ? "border-blue-500 bg-blue-600/15 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                          : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </div>

                      <span className={`text-sm ${isSelected ? "font-semibold text-white" : "text-slate-300"}`}>
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Question Controls */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => clearOption(currentQuestion.id)}
                  disabled={selectedOptionIndex === undefined}
                  className="text-xs font-semibold text-slate-400 hover:text-red-400 transition disabled:opacity-30 disabled:pointer-events-none"
                >
                  ✕ Clear Choice
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={prevQuestion}
                    disabled={currentIdx === 0}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    ← Previous
                  </button>

                  {currentIdx < totalQuestions - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-500 transition"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                    >
                      Review & Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 col): 30-Question Matrix Palette */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Question Navigator</h3>
                <span className="font-mono text-xs text-blue-400">
                  {answeredCount}/{totalQuestions} Answered
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>

              {/* 30-Button Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = typeof answers[q.id] === "number";
                  const isFlag = Boolean(flagged[q.id]);
                  const isCurrent = idx === currentIdx;

                  let btnStyle = "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700";
                  if (isAnswered) {
                    btnStyle = "bg-blue-600 text-white border-blue-500 font-bold";
                  }
                  if (isFlag) {
                    btnStyle = "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold";
                  }
                  if (isCurrent) {
                    btnStyle += " ring-2 ring-white ring-offset-2 ring-offset-slate-900";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(idx)}
                      className={`relative flex h-10 items-center justify-center rounded-xl border text-xs font-mono transition ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlag && <span className="absolute top-1 right-1 text-[8px]">🚩</span>}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-800 border border-slate-700" />
                  <span>Unvisited ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span>Flagged ({flaggedCount})</span>
                </div>
              </div>

              {/* Early Submit button */}
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full rounded-xl bg-emerald-600/90 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
              >
                Submit Assessment
              </button>
            </div>
          </div>
        </main>

        {/* Early Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-5">
              <h3 className="text-xl font-bold text-white">Ready to Submit Test?</h3>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Total Questions:</span>
                  <span className="font-bold text-white">{totalQuestions}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Questions Answered:</span>
                  <span className="font-bold">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Unanswered Questions:</span>
                  <span className="font-bold">{unansweredCount}</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>Time Remaining:</span>
                  <span className="font-mono font-bold">{formattedTime}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Once submitted, your answers will be permanently scored and saved to the MongoDB database.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Keep Testing
                </button>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    submitTest();
                  }}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // STATE 3: SUBMITTED SCORECARD & REVIEW
  // ==========================================
  if (isSubmitted && testResult) {
    const minsTaken = Math.floor(testResult.timeSpentSeconds / 60);
    const secsTaken = testResult.timeSpentSeconds % 60;

    const filteredAnswers = (testResult.answers || []).filter((a) => {
      if (filterReview === "correct") return a.isCorrect;
      if (filterReview === "incorrect") return !a.isCorrect;
      return true;
    });

    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <Navbar />

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 space-y-8 animate-fadeIn">
          {/* Top Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-8 md:p-10 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
                  <span>✓</span>
                  <span>Assessment Successfully Evaluated & Stored in MongoDB</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-white">
                  Mock MCQ Performance Scorecard
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Test ID: <span className="font-mono text-blue-400">{testResult.testId}</span> • Role: <span className="text-white font-semibold">{testResult.role}</span> • Time Taken: <span className="text-white font-semibold">{minsTaken}m {secsTaken}s</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={downloadMcqPdf}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition"
                >
                  📄 Download Official PDF Report
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                >
                  Back to Dashboard →
                </button>
              </div>
            </div>

            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase">Overall Score</span>
              <div className="mt-1 font-mono text-3xl font-extrabold text-blue-400">
                {testResult.score} <span className="text-xs text-slate-500">/ 30</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 mt-1 inline-block">
                {testResult.percentage}% Accuracy
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase">Correct Answers</span>
              <div className="mt-1 font-mono text-3xl font-extrabold text-emerald-400">
                {testResult.correctAnswers}
              </div>
              <span className="text-xs text-slate-400 mt-1 inline-block">
                Questions Answered Right
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase">Wrong Answers</span>
              <div className="mt-1 font-mono text-3xl font-extrabold text-rose-400">
                {testResult.wrongAnswers}
              </div>
              <span className="text-xs text-slate-400 mt-1 inline-block">
                Incorrect Selections
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase">Performance Status</span>
              <div className="mt-1 text-2xl font-black text-white">
                {testResult.status}
              </div>
              <span className="text-xs text-slate-400 mt-1 inline-block">
                Benchmark Rating
              </span>
            </div>
          </div>

          {/* Topic Competency Breakdown */}
          {testResult.topicBreakdown && testResult.topicBreakdown.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Topic Competency Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testResult.topicBreakdown.map((t, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{t.topic}</span>
                      <span className="font-mono text-blue-400">{t.correct} / {t.total} ({t.percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                        style={{ width: `${t.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 30 Question Review Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-white">Question-by-Question Review</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Examine your answers against correct solutions and detailed AI explanations.
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1 text-xs">
                <button
                  onClick={() => setFilterReview("all")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    filterReview === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All (30)
                </button>
                <button
                  onClick={() => setFilterReview("incorrect")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    filterReview === "incorrect" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Incorrect ({testResult.wrongAnswers})
                </button>
                <button
                  onClick={() => setFilterReview("correct")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    filterReview === "correct" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Correct ({testResult.correctAnswers})
                </button>
              </div>
            </div>

            {/* Answer Review Cards */}
            <div className="space-y-4">
              {filteredAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-5 space-y-3.5 ${
                    item.isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-rose-500/30 bg-rose-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        Q{item.questionId}
                      </span>
                      <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300">
                        {item.topic}
                      </span>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                        item.isCorrect
                          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                          : "border-rose-500/40 bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {item.isCorrect ? "✓ Correct" : "✕ Incorrect"}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-100">
                    {item.question}
                  </p>

                  {/* Options Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-900/90 p-3">
                      <span className="text-slate-400 font-semibold block mb-1">Your Selection:</span>
                      <span className={item.isCorrect ? "font-bold text-emerald-400" : "font-bold text-rose-400"}>
                        {item.selectedOption >= 0 ? item.options[item.selectedOption] : "(Unanswered)"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-900/90 p-3">
                      <span className="text-slate-400 font-semibold block mb-1">Correct Answer:</span>
                      <span className="font-bold text-emerald-400">
                        {item.options[item.correctOption]}
                      </span>
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300 leading-relaxed">
                    <strong className="text-blue-400">AI Explanation: </strong>
                    {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return null;
}
