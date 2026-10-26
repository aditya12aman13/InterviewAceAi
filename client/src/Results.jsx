import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Results() {
  const [showAnswers, setShowAnswers] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Read Gemini evaluation results and interview settings from localStorage
  const candidateEmail = localStorage.getItem("userEmail") || "candidate@interviewace.ai";
  
  const interviewData = (() => {
    try {
      return JSON.parse(localStorage.getItem("interviewData") || "{}");
    } catch {
      return {};
    }
  })();

  const jobRole = interviewData.jobRole || "Full Stack Developer";
  const experience = interviewData.experience || "Fresher";
  const interviewType = interviewData.interviewType || "Technical";

  // Resilient Results state: reads interviewResults OR reconstructs from raw questions/answers/evaluations
  const [results, setResults] = useState(() => {
    try {
      // 1. Check interviewResults directly
      const savedResults = JSON.parse(
        localStorage.getItem("interviewResults") || "[]"
      );

      if (Array.isArray(savedResults) && savedResults.length > 0) {
        return savedResults;
      }

      // 2. Fallback: Reconstruct from interviewQuestions, interviewAnswers, and interviewEvaluations
      const savedQuestions = JSON.parse(
        localStorage.getItem("interviewQuestions") || "[]"
      );
      const savedAnswers = JSON.parse(
        localStorage.getItem("interviewAnswers") || "[]"
      );
      const savedEvals = JSON.parse(
        localStorage.getItem("interviewEvaluations") || "[]"
      );

      if (Array.isArray(savedQuestions) && savedQuestions.length > 0) {
        const reconstructed = savedQuestions
          .map((q, idx) => ({
            question: q,
            answer: savedAnswers[idx] || "",
            evaluation: savedEvals[idx] || null,
          }))
          .filter((item) => item.evaluation || item.answer);

        if (reconstructed.length > 0) {
          localStorage.setItem("interviewResults", JSON.stringify(reconstructed));
          return reconstructed;
        }
      }

      return [];
    } catch (error) {
      console.error("Unable to read interview results:", error);
      return [];
    }
  });

  const totalQuestions = Number(interviewData.questions) || (results.length > 0 ? results.length : 5);

  const answeredQuestions = results.filter(
    (item) =>
      item &&
      typeof item.answer === "string" &&
      item.answer.trim() !== ""
  ).length;

  // Calculate average Gemini score out of 10
  const totalScore = results.reduce((sum, item) => {
    const score = Number(item?.evaluation?.score);

    return sum + (
      Number.isFinite(score)
        ? Math.min(10, Math.max(0, score))
        : 0
    );
  }, 0);

  const averageScore =
    answeredQuestions > 0
      ? totalScore / answeredQuestions
      : 0;

  const percentage =
    answeredQuestions > 0
      ? Math.round((averageScore / 10) * 100)
      : 0;

  const completionPercentage = Math.round(
    (answeredQuestions / totalQuestions) * 100
  );

  // Collect feedback from all evaluated answers
  const strengths = [
    ...new Set(
      results.flatMap((item) =>
        Array.isArray(item?.evaluation?.strengths)
          ? item.evaluation.strengths
          : []
      )
    )
  ];

  const improvements = [
    ...new Set(
      results.flatMap((item) =>
        Array.isArray(item?.evaluation?.improvements)
          ? item.evaluation.improvements
          : []
      )
    )
  ];

  const recommendations = answeredQuestions === 0
    ? ["Complete an interview to receive personalized recommendations."]
    : percentage >= 80
      ? ["Excellent performance! Continue practising advanced system design and architecture questions."]
      : percentage >= 60
        ? ["Good effort! Practise explaining core concepts with concrete code examples and time complexities."]
        : ["Revise technical fundamentals and practise articulating thoughts clearly under time constraints."];

  const startNewInterview = () => {
    localStorage.removeItem("interviewResults");
    localStorage.removeItem("interviewCompleted");
    localStorage.removeItem("interviewAnswers");
    localStorage.removeItem("interviewQuestions");

    window.location.href = "/setup";
  };

  // Helper to load sample evaluated data for quick testing & demonstration
  const loadSampleData = () => {
    const sampleQuestions = [
      "What is the difference between props and state in React?",
      "What is a REST API and what are the standard HTTP methods?",
      "Explain the difference between synchronous and asynchronous JavaScript.",
      "How does database indexing improve query performance?",
      "What are the best practices for handling errors in a full-stack application?"
    ];

    const sampleAnswers = [
      "Props are read-only properties passed from parent to child components, whereas state is component-internal and mutable using useState.",
      "A REST API uses HTTP methods like GET to read data, POST to create records, PUT/PATCH to update, and DELETE to remove resources with standard status codes.",
      "Synchronous execution blocks subsequent tasks until completion, while asynchronous execution uses the event loop, Promises, and async/await for non-blocking I/O.",
      "Database indexing creates lookup data structures (like B-Trees) allowing the database engine to find records quickly without executing full table scans.",
      "Best practices include using try-catch blocks, centralized Express error middleware, meaningful HTTP status codes, and user-friendly error responses."
    ];

    const sampleEvals = [
      {
        score: 9,
        feedback: "Clear, accurate, and concise distinction between props and state in React.",
        strengths: ["Accurately identified props as read-only.", "Correctly stated state is mutable."],
        improvements: ["Could mention state changes trigger component re-renders."]
      },
      {
        score: 8,
        feedback: "Solid understanding of REST architecture and standard HTTP verb mapping.",
        strengths: ["Correct HTTP method mapping.", "Good conceptual clarity."],
        improvements: ["Could mention status codes like 200, 201, and 404."]
      },
      {
        score: 9,
        feedback: "Accurate distinction highlighting non-blocking execution and the JavaScript event loop.",
        strengths: ["Mentioned async/await and Promises.", "Clear explanation of blocking vs non-blocking."],
        improvements: ["Could explain microtask vs macrotask execution."]
      },
      {
        score: 9,
        feedback: "Precise definition of indexing mechanisms and avoiding full table scans.",
        strengths: ["Mentioned B-tree lookup structures.", "Highlighted query performance improvements."],
        improvements: ["Could mention the write overhead of indexes on inserts."]
      },
      {
        score: 8,
        feedback: "Comprehensive coverage of client and server error handling architectures.",
        strengths: ["Mentioned centralized Express middleware.", "Emphasized standard HTTP status codes."],
        improvements: ["Could mention logging libraries like Winston or Morgan."]
      }
    ];

    const sampleResults = sampleQuestions.map((q, idx) => ({
      question: q,
      answer: sampleAnswers[idx],
      evaluation: sampleEvals[idx],
    }));

    localStorage.setItem("interviewResults", JSON.stringify(sampleResults));
    setResults(sampleResults);
  };

  // Official PDF Report Generator using jsPDF + autoTable
  const generatePDF = () => {
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Dark Slate Header Banner
      doc.setFillColor(15, 23, 42); // #0f172a
      doc.rect(0, 0, pageWidth, 42, "F");

      // Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(56, 189, 248); // #38bdf8 (Sky Blue)
      doc.text("INTERVIEW ACE AI", 15, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(226, 232, 240); // #e2e8f0
      doc.text("Official Technical Performance Evaluation Report", 15, 26);
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        15,
        34
      );

      // Rating Status Badge in Header
      const ratingLabel = answeredQuestions === 0 
        ? "INCOMPLETE" 
        : percentage >= 80 
          ? "STRONG HIRE" 
          : percentage >= 60 
            ? "COMPETENT" 
            : "FOUNDATIONAL";

      const ratingColor = answeredQuestions === 0
        ? [100, 116, 139] // slate
        : percentage >= 80 
          ? [16, 185, 129] // green
          : percentage >= 60 
            ? [59, 130, 246] // blue
            : [245, 158, 11]; // amber

      doc.setFillColor(ratingColor[0], ratingColor[1], ratingColor[2]);
      doc.roundedRect(pageWidth - 65, 14, 50, 14, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(ratingLabel, pageWidth - 40, 23, { align: "center" });

      // Candidate Profile Section
      let y = 50;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, pageWidth - 30, 32, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("CANDIDATE INFORMATION", 20, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);

      doc.text(`Candidate: ${candidateEmail}`, 20, y + 16);
      doc.text(`Target Role: ${jobRole}`, 20, y + 23);
      doc.text(`Experience Level: ${experience}`, pageWidth / 2 + 10, y + 16);
      doc.text(`Evaluation Engine: Google Gemini (gemini-3.5-flash-lite)`, pageWidth / 2 + 10, y + 23);

      // Score Metrics Cards
      y += 40;
      const cardWidth = (pageWidth - 30 - 10) / 3;

      // Card 1: Overall Score
      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(186, 230, 253);
      doc.roundedRect(15, y, cardWidth, 26, 2, 2, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(14, 116, 144);
      doc.text("OVERALL SCORE", 15 + cardWidth / 2, y + 7, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(2, 132, 199);
      doc.text(`${averageScore.toFixed(1)} / 10 (${percentage}%)`, 15 + cardWidth / 2, y + 18, { align: "center" });

      // Card 2: Questions Answered
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(15 + cardWidth + 5, y, cardWidth, 26, 2, 2, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(21, 128, 61);
      doc.text("QUESTIONS ANSWERED", 15 + cardWidth + 5 + cardWidth / 2, y + 7, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text(`${answeredQuestions} / ${totalQuestions}`, 15 + cardWidth + 5 + cardWidth / 2, y + 18, { align: "center" });

      // Card 3: Completion Rate
      doc.setFillColor(254, 252, 232);
      doc.setDrawColor(254, 240, 138);
      doc.roundedRect(15 + (cardWidth + 5) * 2, y, cardWidth, 26, 2, 2, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(161, 98, 7);
      doc.text("COMPLETION RATE", 15 + (cardWidth + 5) * 2 + cardWidth / 2, y + 7, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(202, 138, 4);
      doc.text(`${completionPercentage}%`, 15 + (cardWidth + 5) * 2 + cardWidth / 2, y + 18, { align: "center" });

      y += 34;

      // Strengths Box
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      const strengthsList = strengths.length > 0 ? strengths.slice(0, 3) : ["Session registered. Complete questions to receive AI strengths."];
      const strengthsHeight = 12 + strengthsList.length * 6;
      doc.roundedRect(15, y, pageWidth - 30, strengthsHeight, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(22, 101, 52);
      doc.text("IDENTIFIED STRENGTHS", 20, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      strengthsList.forEach((s, idx) => {
        doc.text(`* ${s}`, 22, y + 13 + idx * 6, { maxWidth: pageWidth - 45 });
      });

      y += strengthsHeight + 6;

      // Priority Improvements Box
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      const improvementsList = improvements.length > 0 ? improvements.slice(0, 3) : ["Continue revising advanced concepts and answering mock questions."];
      const improvementsHeight = 12 + improvementsList.length * 6;
      doc.roundedRect(15, y, pageWidth - 30, improvementsHeight, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(153, 27, 27);
      doc.text("PRIORITY IMPROVEMENT ROADMAP", 20, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      improvementsList.forEach((imp, idx) => {
        doc.text(`* ${imp}`, 22, y + 13 + idx * 6, { maxWidth: pageWidth - 45 });
      });

      y += improvementsHeight + 8;

      // Detailed Questions Table using autoTable
      const tableData = results.length > 0
        ? results.map((item, idx) => [
            String(idx + 1),
            item.question || "N/A",
            `${Number(item?.evaluation?.score) || 0} / 10`,
            item?.evaluation?.feedback || "No feedback recorded."
          ])
        : [["-", "No questions were evaluated in this session.", "0 / 10", "Candidate did not submit answers."]];

      autoTable(doc, {
        startY: y,
        margin: { left: 15, right: 15, bottom: 20 },
        head: [["#", "Interview Question", "Score", "Gemini AI Evaluation & Feedback"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          halign: "left"
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 55 },
          2: { cellWidth: 18, halign: "center", fontStyle: "bold" },
          3: { cellWidth: "auto" }
        },
        didDrawPage: () => {
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `InterviewAce AI - Verified Performance Evaluation | Page ${doc.internal.getNumberOfPages()}`,
            15,
            pageHeight - 10
          );
          doc.text(
            "AI Provider: Google Gemini (gemini-3.5-flash-lite)",
            pageWidth - 15,
            pageHeight - 10,
            { align: "right" }
          );
        }
      });

      const sanitizedRole = (jobRole || "Interview").toLowerCase().replace(/[^a-z0-9]/g, "_");
      doc.save(`InterviewAce_Report_${sanitizedRole}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Error generating PDF report. Please check the console.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            Interview{" "}
            <span className="text-blue-400">
              Results
            </span>
          </h1>

          <p className="text-slate-400 mt-3">
            Here is your interview performance evaluated by Google Gemini AI.
          </p>
        </div>

        {/* Candidate & Role Info Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {interviewType}
            </span>
            <h2 className="text-2xl font-bold mt-2">
              {jobRole} <span className="text-slate-400 font-normal text-lg">({experience})</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Candidate: <span className="text-slate-200 font-medium">{candidateEmail}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {results.length === 0 && (
              <button
                onClick={loadSampleData}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm shadow transition"
                title="Populate realistic Gemini evaluation sample data for demonstration"
              >
                ✨ Load Demo Evaluation
              </button>
            )}

            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition"
              title="Download Official PDF Report"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Performance Report (PDF)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center mb-8">
          <p className="text-slate-400 text-lg">
            Your Average Score
          </p>

          <div className="text-7xl font-bold text-blue-400 mt-3">
            {percentage}%
          </div>

          <p className="text-slate-400 mt-4">
            Average: {averageScore.toFixed(1)} / 10
          </p>

          <p className="text-slate-400 mt-2">
            You answered {answeredQuestions} out of {totalQuestions} questions.
          </p>
        </div>

        {/* Performance Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">Total Questions</p>
            <p className="text-3xl font-bold mt-2">{totalQuestions}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">Answered</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{answeredQuestions}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400">Completion</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{completionPercentage}%</p>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">
              🤖 Gemini AI Feedback
            </h2>

            {results.length === 0 && (
              <button
                onClick={loadSampleData}
                className="text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/30 transition"
              >
                ✨ Click to Load Demo Sample Feedback
              </button>
            )}
          </div>

          {answeredQuestions === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400">
                No interview answers were evaluated in this session yet.
              </p>
              <button
                onClick={loadSampleData}
                className="mt-4 bg-blue-500 hover:bg-blue-600 px-5 py-2.5 rounded-xl font-semibold text-sm transition"
              >
                ✨ Load Demo Evaluation to Test Features
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Strengths */}
              <div>
                <h3 className="font-semibold text-green-400 text-lg">Strengths</h3>
                {strengths.length > 0 ? (
                  <ul className="list-disc pl-6 text-slate-400 mt-2 space-y-2">
                    {strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 mt-2">
                    Keep practising to identify your strengths.
                  </p>
                )}
              </div>

              {/* Improvements */}
              <div>
                <h3 className="font-semibold text-yellow-400 text-lg">Areas to Improve</h3>
                {improvements.length > 0 ? (
                  <ul className="list-disc pl-6 text-slate-400 mt-2 space-y-2">
                    {improvements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 mt-2">
                    Continue improving your technical knowledge and communication.
                  </p>
                )}
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-blue-400 text-lg">Recommendation</h3>
                <ul className="list-disc pl-6 text-slate-400 mt-2 space-y-2">
                  {recommendations.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Individual Answer Evaluations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-2xl font-bold">
              Your Answers & Evaluations
            </h2>

            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-semibold"
            >
              {showAnswers ? "Hide Answers" : "View Answers"}
            </button>
          </div>

          {showAnswers && (
            <div className="mt-8 space-y-6">
              {results.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <p>No answers evaluated yet.</p>
                  <button
                    onClick={loadSampleData}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    Load demo questions and evaluations
                  </button>
                </div>
              ) : (
                results.map((item, index) => (
                  <div key={index} className="border border-slate-800 rounded-xl p-5">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-semibold text-lg">
                        {index + 1}. {item.question}
                      </p>

                      <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg font-bold whitespace-nowrap">
                        {Number(item?.evaluation?.score) || 0}/10
                      </span>
                    </div>

                    {/* Candidate Answer */}
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-slate-300">Your Answer</h3>
                      <p className="text-slate-400 mt-2 whitespace-pre-wrap">
                        {item.answer || "No answer provided."}
                      </p>
                    </div>

                    {/* Gemini Feedback */}
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-green-400">Gemini Feedback</h3>
                      <p className="text-slate-400 mt-2">
                        {item?.evaluation?.feedback || "No feedback available."}
                      </p>
                    </div>

                    {/* Individual Improvements */}
                    {Array.isArray(item?.evaluation?.improvements) &&
                      item.evaluation.improvements.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold text-yellow-400">
                            Suggested Improvements
                          </h3>
                          <ul className="list-disc pl-6 text-slate-400 mt-2 space-y-1">
                            {item.evaluation.improvements.map((improvement, improvementIndex) => (
                              <li key={improvementIndex}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isGeneratingPDF ? "Generating PDF..." : "Download Report (PDF)"}
          </button>

          <button
            onClick={startNewInterview}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold"
          >
            Start New Interview
          </button>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="border border-slate-700 hover:bg-slate-800 px-6 py-3 rounded-lg font-semibold"
          >
            Back Home
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-10">
          Interview Ace AI · Powered by Google Gemini
        </p>
      </div>
    </div>
  );
}

export default Results;
