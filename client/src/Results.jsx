import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import { generateMcqPdfReport } from "./utils/mcqPdfGenerator";
import { getMcqTests } from "./services/api";

export default function Results() {
  // View mode switcher: "interview" (Verbal AI Mock) | "mcq" (30-MCQ 25-Min Test)
  const [activeTab, setActiveTab] = useState("interview");
  const [showAnswers, setShowAnswers] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [filterMcqReview, setFilterMcqReview] = useState("all"); // "all" | "right" | "wrong" | "unattempted"

  const candidateEmail = localStorage.getItem("userEmail") || "candidate@interviewace.ai";

  // ==========================================
  // PART 1: VERBAL AI INTERVIEW DATA & STATE
  // ==========================================
  const interviewData = (() => {
    try {
      return JSON.parse(localStorage.getItem("interviewData") || "{}");
    } catch {
      return {};
    }
  })();

  const jobRole = interviewData.jobRole || "Full Stack Developer";
  const experience = interviewData.experience || "Fresher";

  const [results, setResults] = useState(() => {
    try {
      const savedResults = JSON.parse(localStorage.getItem("interviewResults") || "[]");
      if (Array.isArray(savedResults) && savedResults.length > 0) return savedResults;

      const savedQuestions = JSON.parse(localStorage.getItem("interviewQuestions") || "[]");
      const savedAnswers = JSON.parse(localStorage.getItem("interviewAnswers") || "[]");
      const savedEvals = JSON.parse(localStorage.getItem("interviewEvaluations") || "[]");

      if (Array.isArray(savedQuestions) && savedQuestions.length > 0) {
        return savedQuestions
          .map((q, idx) => ({
            question: q,
            answer: savedAnswers[idx] || "",
            evaluation: savedEvals[idx] || null,
          }))
          .filter((item) => item.evaluation || item.answer);
      }
      return [];
    } catch {
      return [];
    }
  });

  const totalQuestions = Number(interviewData.questions) || (results.length > 0 ? results.length : 5);
  const answeredQuestions = results.filter(
    (item) => item && typeof item.answer === "string" && item.answer.trim() !== ""
  ).length;

  const totalScore = results.reduce((sum, item) => {
    const score = Number(item?.evaluation?.score);
    return sum + (Number.isFinite(score) ? Math.min(10, Math.max(0, score)) : 0);
  }, 0);

  const averageScore = answeredQuestions > 0 ? totalScore / answeredQuestions : 0;
  const percentage = answeredQuestions > 0 ? Math.round((averageScore / 10) * 100) : 0;

  const strengths = [
    ...new Set(
      results.flatMap((item) =>
        Array.isArray(item?.evaluation?.strengths) ? item.evaluation.strengths : []
      )
    ),
  ];

  const improvements = [
    ...new Set(
      results.flatMap((item) =>
        Array.isArray(item?.evaluation?.improvements) ? item.evaluation.improvements : []
      )
    ),
  ];

  // Helper to load sample verbal interview evaluation
  const loadSampleInterviewData = () => {
    const sampleQuestions = [
      "What is the difference between props and state in React?",
      "What is a REST API and what are the standard HTTP methods?",
      "Explain the difference between synchronous and asynchronous JavaScript.",
      "How does database indexing improve query performance?",
      "What are the best practices for handling errors in a full-stack application?",
    ];

    const sampleAnswers = [
      "Props are read-only properties passed from parent to child components, whereas state is component-internal and mutable using useState.",
      "A REST API uses HTTP methods like GET to read data, POST to create records, PUT/PATCH to update, and DELETE to remove resources with standard status codes.",
      "Synchronous execution blocks subsequent tasks until completion, while asynchronous execution uses the event loop, Promises, and async/await for non-blocking I/O.",
      "Database indexing creates lookup data structures (like B-Trees) allowing the database engine to find records quickly without executing full table scans.",
      "Best practices include using try-catch blocks, centralized Express error middleware, meaningful HTTP status codes, and user-friendly error responses.",
    ];

    const sampleEvals = [
      {
        score: 9,
        feedback: "Clear, accurate, and concise distinction between props and state in React.",
        strengths: ["Accurately identified props as read-only.", "Correctly stated state is mutable."],
        improvements: ["Could mention state changes trigger component re-renders."],
      },
      {
        score: 8,
        feedback: "Solid understanding of REST architecture and standard HTTP verb mapping.",
        strengths: ["Correct HTTP method mapping.", "Good conceptual clarity."],
        improvements: ["Could mention status codes like 200, 201, and 404."],
      },
      {
        score: 9,
        feedback: "Accurate distinction highlighting non-blocking execution and the JavaScript event loop.",
        strengths: ["Mentioned async/await and Promises.", "Clear explanation of blocking vs non-blocking."],
        improvements: ["Could explain microtask vs macrotask execution."],
      },
      {
        score: 9,
        feedback: "Precise definition of indexing mechanisms and avoiding full table scans.",
        strengths: ["Mentioned B-tree lookup structures.", "Highlighted query performance improvements."],
        improvements: ["Could mention the write overhead of indexes on inserts."],
      },
      {
        score: 8,
        feedback: "Comprehensive coverage of client and server error handling architectures.",
        strengths: ["Mentioned centralized Express middleware.", "Emphasized standard HTTP status codes."],
        improvements: ["Could mention logging libraries like Winston or Morgan."],
      },
    ];

    const sampleResults = sampleQuestions.map((q, idx) => ({
      question: q,
      answer: sampleAnswers[idx],
      evaluation: sampleEvals[idx],
    }));

    localStorage.setItem("interviewResults", JSON.stringify(sampleResults));
    setResults(sampleResults);
  };

  // Generate PDF for verbal AI interview
  const generateVerbalPDF = () => {
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 42, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(56, 189, 248);
      doc.text("INTERVIEW ACE AI", 15, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(226, 232, 240);
      doc.text("Official Technical Performance Evaluation Report", 15, 26);
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}`,
        15,
        34
      );

      const ratingLabel =
        answeredQuestions === 0
          ? "INCOMPLETE"
          : percentage >= 80
          ? "STRONG HIRE"
          : percentage >= 60
          ? "COMPETENT"
          : "FOUNDATIONAL";

      doc.setFillColor(30, 41, 59);
      doc.roundedRect(pageWidth - 65, 12, 50, 20, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(56, 189, 248);
      doc.text(ratingLabel, pageWidth - 40, 21, { align: "center" });

      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `SCORE: ${averageScore.toFixed(1)} / 10`,
        pageWidth - 40,
        28,
        { align: "center" }
      );

      const metaRows = [
        ["Candidate Email", candidateEmail, "Assessment Date", new Date().toLocaleDateString()],
        ["Target Job Role", jobRole, "Experience Level", experience],
        ["Questions Answered", `${answeredQuestions} of ${totalQuestions}`, "Overall Score", `${averageScore.toFixed(1)} / 10 (${percentage}%)`],
      ];

      autoTable(doc, {
        startY: 48,
        body: metaRows,
        theme: "plain",
        styles: { fontSize: 8.5, cellPadding: 2, textColor: [30, 41, 59] },
        columnStyles: {
          0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 35 },
          1: { fontStyle: "bold", cellWidth: 55 },
          2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 35 },
          3: { fontStyle: "bold", cellWidth: 55 },
        },
      });

      const tableData = results.map((item, idx) => [
        String(idx + 1),
        item.question || "N/A",
        item.answer || "(No response recorded)",
        `${Number(item?.evaluation?.score) || 0} / 10`,
        item?.evaluation?.feedback || "No feedback recorded.",
      ]);

      autoTable(doc, {
        startY: (doc.lastAutoTable?.finalY || 70) + 6,
        head: [["#", "Interview Question", "Candidate Answer", "Score", "AI Feedback"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
        bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85], cellPadding: 2.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 45 },
          2: { cellWidth: 45 },
          3: { cellWidth: 16, halign: "center", fontStyle: "bold" },
          4: { cellWidth: "auto" },
        },
      });

      doc.save(`InterviewAce_Verbal_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ==========================================
  // PART 2: MOCK MCQ TEST RESULTS & STATE
  // ==========================================
  const [mcqHistory, setMcqHistory] = useState([]);
  const [activeMcqTest, setActiveMcqTest] = useState(null);

  useEffect(() => {
    // 1. Check localStorage for latest test
    try {
      const local = JSON.parse(localStorage.getItem("latestMcqResult") || "null");
      if (local) {
        setActiveMcqTest(local);
      }
    } catch (e) {
      console.warn("Could not parse latestMcqResult from localStorage", e);
    }

    // 2. Fetch all completed tests from MongoDB database
    getMcqTests(candidateEmail).then((tests) => {
      if (Array.isArray(tests) && tests.length > 0) {
        setMcqHistory(tests);
        // If no active test is set yet, default to the most recent from MongoDB
        setActiveMcqTest((prev) => prev || tests[0]);
      }
    });
  }, [candidateEmail]);

  // Sample seed fallback for quick demonstration if database is fresh
  const loadSampleMcqData = () => {
    const sample = {
      testId: "MCQ-7821",
      userEmail: candidateEmail,
      role: "Full Stack Developer",
      experience: "Fresher",
      date: new Date().toISOString().split("T")[0],
      totalQuestions: 30,
      attemptedQuestions: 29,
      correctAnswers: 25,
      wrongAnswers: 4,
      unanswered: 1,
      score: 25,
      percentage: 83,
      status: "Top Performer",
      timeSpentSeconds: 1140, // 19 minutes
      topicBreakdown: [
        { topic: "JavaScript", total: 8, correct: 7, percentage: 88 },
        { topic: "React", total: 7, correct: 6, percentage: 86 },
        { topic: "Node.js & Express", total: 8, correct: 7, percentage: 88 },
        { topic: "MongoDB & SQL", total: 7, correct: 5, percentage: 71 },
      ],
      answers: Array.from({ length: 30 }, (_, i) => {
        const isUnanswered = i === 29;
        const isWrong = i === 4 || i === 11 || i === 18 || i === 24;
        const isRight = !isUnanswered && !isWrong;

        return {
          questionId: i + 1,
          topic: i < 8 ? "JavaScript" : i < 15 ? "React" : i < 23 ? "Node.js" : "MongoDB",
          question: `Sample Technical Question #${i + 1} evaluating core programming concepts and system design fundamentals?`,
          options: [
            "Option A: Architectural design pattern with non-blocking I/O",
            "Option B: Synchronous memory allocation without heap fragmentation",
            "Option C: Immutable functional state handler",
            "Option D: Relational table index optimization"
          ],
          selectedOption: isUnanswered ? -1 : isWrong ? 1 : 0,
          correctOption: 0,
          isCorrect: isRight,
          explanation: "Option A is the correct answer based on industry standard enterprise development benchmarks."
        };
      })
    };

    setActiveMcqTest(sample);
    localStorage.setItem("latestMcqResult", JSON.stringify(sample));
  };

  const mcqUnattemptedCount =
    activeMcqTest?.unanswered ??
    activeMcqTest?.unattempted ??
    Math.max(
      0,
      (activeMcqTest?.totalQuestions || 30) -
        ((activeMcqTest?.correctAnswers || 0) + (activeMcqTest?.wrongAnswers || 0))
    );

  // Filter questions for review
  const filteredMcqAnswers = (activeMcqTest?.answers || []).filter((item) => {
    const isUnattempted = item.selectedOption === undefined || item.selectedOption === -1;
    const isRight = !isUnattempted && item.isCorrect;
    const isWrong = !isUnattempted && !item.isCorrect;

    if (filterMcqReview === "right") return isRight;
    if (filterMcqReview === "wrong") return isWrong;
    if (filterMcqReview === "unattempted") return isUnattempted;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 space-y-8 animate-fadeIn">
        {/* Results Page Header & Tab Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Performance <span className="text-blue-400">Results & Reviews</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Comprehensive AI evaluations for Verbal Mock Interviews and 25-Minute MCQ Technical Tests.
            </p>
          </div>

          {/* Section Toggle Pill */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5 shadow-lg">
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "interview"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🎙️</span>
              <span>Verbal AI Interview</span>
            </button>

            <button
              onClick={() => setActiveTab("mcq")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "mcq"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🧠</span>
              <span>Mock MCQ Test (30 Qs)</span>
              {activeMcqTest && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.2 text-[10px] text-emerald-400">
                  {activeMcqTest.score}/30
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: VERBAL AI INTERVIEW RESULTS                   */}
        {/* ======================================================== */}
        {activeTab === "interview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Executive Summary Card */}
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  AI EVALUATION SUMMARY
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
                  {jobRole} ({experience})
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Overall Score: <span className="font-mono text-blue-400 font-bold">{averageScore.toFixed(1)} / 10</span> ({percentage}%) • {answeredQuestions} of {totalQuestions} Questions Evaluated
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={generateVerbalPDF}
                  disabled={isGeneratingPDF}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {isGeneratingPDF ? "Generating PDF..." : "📄 Download Verbal Report (PDF)"}
                </button>
                <button
                  onClick={loadSampleInterviewData}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                >
                  ✨ Load Demo Evaluation
                </button>
              </div>
            </div>

            {/* Questions List */}
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
                <div className="text-4xl">🎙️</div>
                <h3 className="text-base font-bold text-white">No verbal interview answers found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Complete an AI mock interview or click "Load Demo Evaluation" to inspect feedback.
                </p>
                <button
                  onClick={loadSampleInterviewData}
                  className="mt-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500"
                >
                  Load Sample Data
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Question-by-Question Evaluation</h3>
                {results.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-400">Question {idx + 1}</span>
                      <span className="font-mono text-sm font-extrabold text-emerald-400">
                        {item.evaluation?.score ?? 0} / 10
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{item.question}</h4>

                    <div className="rounded-xl bg-slate-950/70 p-3.5 text-xs text-slate-300">
                      <span className="font-bold text-slate-400">Your Answer: </span>
                      {item.answer || "No answer recorded."}
                    </div>

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-blue-300">
                      <span className="font-bold text-blue-400">Gemini Feedback: </span>
                      {item.evaluation?.feedback || "Evaluation complete."}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: MOCK MCQ TEST RESULTS & COLOR-CODED PDF       */}
        {/* ======================================================== */}
        {activeTab === "mcq" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Scorecard & PDF Export Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-8 shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-2">
                    <span>✓</span>
                    <span>30-Question Time-Bound Assessment (25 Mins)</span>
                  </div>

                  <h2 className="text-3xl font-black text-white">
                    {activeMcqTest?.role || "Full Stack Developer"} MCQ Scorecard
                  </h2>

                  <p className="text-xs text-slate-300 mt-1">
                    Test ID: <span className="font-mono text-blue-400">{activeMcqTest?.testId || "MCQ-7821"}</span> • Experience: <span className="text-white font-semibold">{activeMcqTest?.experience || "Fresher"}</span> • Date: <span className="text-slate-300">{activeMcqTest?.date || "Recent"}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Download PDF button with explicit color-coding */}
                  <button
                    onClick={() => generateMcqPdfReport(activeMcqTest, candidateEmail)}
                    disabled={!activeMcqTest}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50"
                  >
                    📄 Download Full MCQ Test Report (PDF)
                  </button>

                  <button
                    onClick={loadSampleMcqData}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                  >
                    ✨ Load Demo MCQ Result
                  </button>
                </div>
              </div>
            </div>

            {/* THREE COLOR-CODED KPI CARDS (GREEN, RED, YELLOW) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* 1. GREEN - Right Questions Answered */}
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-lg shadow-emerald-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    RIGHT QUESTIONS (GREEN)
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 text-lg">
                    ✓
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-extrabold text-white">
                    {activeMcqTest?.correctAnswers || 0}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    / {activeMcqTest?.totalQuestions || 30} Correct
                  </span>
                </div>
                <p className="mt-2 text-xs text-emerald-300/80">
                  Displayed in vibrant green in both report and PDF.
                </p>
              </div>

              {/* 2. RED - Wrong Questions Answered */}
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 shadow-lg shadow-rose-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    WRONG QUESTIONS (RED)
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 text-lg">
                    ✕
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-extrabold text-white">
                    {activeMcqTest?.wrongAnswers || 0}
                  </span>
                  <span className="text-xs font-semibold text-rose-400">
                    Incorrect Choices
                  </span>
                </div>
                <p className="mt-2 text-xs text-rose-300/80">
                  Displayed in clear red in both report and PDF.
                </p>
              </div>

              {/* 3. YELLOW - Not Attempted Questions */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 shadow-lg shadow-amber-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    NOT ATTEMPTED (YELLOW)
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 text-lg">
                    ⚠
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-extrabold text-white">
                    {mcqUnattemptedCount}
                  </span>
                  <span className="text-xs font-semibold text-amber-400">
                    Skipped / Timed Out
                  </span>
                </div>
                <p className="mt-2 text-xs text-amber-300/80">
                  Displayed in distinct yellow/amber in both report and PDF.
                </p>
              </div>
            </div>

            {/* Past Tests Dropdown Selector (if multiple tests exist in MongoDB) */}
            {mcqHistory.length > 1 && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
                <span className="text-slate-400 font-semibold">Select Past Test from Database:</span>
                <select
                  value={activeMcqTest?.testId || ""}
                  onChange={(e) => {
                    const found = mcqHistory.find((t) => t.testId === e.target.value);
                    if (found) setActiveMcqTest(found);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  {mcqHistory.map((t) => (
                    <option key={t.testId} value={t.testId}>
                      {t.testId} - {t.role} ({t.score}/30) • {t.date}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter review buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <div>
                <h3 className="text-xl font-bold text-white">Question-by-Question Detailed Review</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click through answers with full technical Gemini explanations and solution rationales.
                </p>
              </div>

              {/* Review Filter Tabs */}
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
                <button
                  onClick={() => setFilterMcqReview("all")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    filterMcqReview === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({activeMcqTest?.totalQuestions || 30})
                </button>
                <button
                  onClick={() => setFilterMcqReview("right")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    filterMcqReview === "right" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-emerald-400"
                  }`}
                >
                  Right ({activeMcqTest?.correctAnswers || 0})
                </button>
                <button
                  onClick={() => setFilterMcqReview("wrong")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    filterMcqReview === "wrong" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-rose-400"
                  }`}
                >
                  Wrong ({activeMcqTest?.wrongAnswers || 0})
                </button>
                <button
                  onClick={() => setFilterMcqReview("unattempted")}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    filterMcqReview === "unattempted" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-amber-400"
                  }`}
                >
                  Not Attempted ({mcqUnattemptedCount})
                </button>
              </div>
            </div>

            {/* 30-Question List with Color-Coding */}
            <div className="space-y-4">
              {filteredMcqAnswers.map((item, idx) => {
                const isUnattempted = item.selectedOption === undefined || item.selectedOption === -1;
                const isRight = !isUnattempted && item.isCorrect;
                const isWrong = !isUnattempted && !item.isCorrect;

                let cardBorder = "border-slate-800 bg-slate-900";
                let badgeClass = "border-slate-700 bg-slate-800 text-slate-300";
                let badgeText = "Status";

                if (isRight) {
                  cardBorder = "border-emerald-500/40 bg-emerald-500/5 shadow-md shadow-emerald-500/5";
                  badgeClass = "border-emerald-500/50 bg-emerald-500/20 text-emerald-400";
                  badgeText = "✓ Right Answer (Green)";
                } else if (isWrong) {
                  cardBorder = "border-rose-500/40 bg-rose-500/5 shadow-md shadow-rose-500/5";
                  badgeClass = "border-rose-500/50 bg-rose-500/20 text-rose-400";
                  badgeText = "✕ Wrong Answer (Red)";
                } else if (isUnattempted) {
                  cardBorder = "border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-500/5";
                  badgeClass = "border-amber-500/50 bg-amber-500/20 text-amber-400";
                  badgeText = "⚠ Not Attempted (Yellow)";
                }

                return (
                  <div key={idx} className={`rounded-2xl border p-5.5 space-y-4 transition ${cardBorder}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          Q{item.questionId || idx + 1}
                        </span>
                        <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300">
                          {item.topic || "Technical"}
                        </span>
                      </div>

                      <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-relaxed">
                      {item.question}
                    </h4>

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
                        <span className="text-slate-400 font-semibold block mb-1">Your Selection:</span>
                        <span
                          className={`font-bold ${
                            isRight
                              ? "text-emerald-400"
                              : isWrong
                              ? "text-rose-400"
                              : "text-amber-400"
                          }`}
                        >
                          {isUnattempted ? "(Not Attempted)" : item.options[item.selectedOption]}
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
                        <span className="text-slate-400 font-semibold block mb-1">Correct Answer:</span>
                        <span className="font-bold text-emerald-400">
                          {item.options[item.correctOption]}
                        </span>
                      </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-blue-300 leading-relaxed">
                      <strong className="text-blue-400">AI Explanation: </strong>
                      {item.explanation || "Correct technical principle verified against industry standards."}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
