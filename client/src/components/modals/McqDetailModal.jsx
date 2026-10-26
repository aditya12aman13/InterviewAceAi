import { useState, useEffect } from "react";
import { getMcqTestById } from "../../services/api";
import { generateMcqPdfReport } from "../../utils/mcqPdfGenerator";

export default function McqDetailModal({
  isOpen,
  onClose,
  testSummary,
  onDownloadPdf,
}) {
  const [fullTest, setFullTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterReview, setFilterReview] = useState("all"); // "all" | "correct" | "incorrect" | "unattempted"

  useEffect(() => {
    if (isOpen && testSummary?.testId) {
      setLoading(true);
      getMcqTestById(testSummary.testId).then((res) => {
        setFullTest(res || testSummary);
        setLoading(false);
      });
    } else {
      setFullTest(null);
      setFilterReview("all");
    }
  }, [isOpen, testSummary]);

  if (!isOpen || !testSummary) return null;

  const displayTest = fullTest || testSummary;
  const minsSpent = Math.floor((displayTest.timeSpentSeconds || 0) / 60);
  const secsSpent = (displayTest.timeSpentSeconds || 0) % 60;

  const unattemptedCount =
    displayTest.unanswered ??
    displayTest.unattempted ??
    Math.max(
      0,
      (displayTest.totalQuestions || 30) -
        ((displayTest.correctAnswers || 0) + (displayTest.wrongAnswers || 0))
    );

  const handleDownload = () => {
    if (onDownloadPdf) {
      onDownloadPdf(displayTest);
    } else {
      generateMcqPdfReport(displayTest, displayTest.userEmail);
    }
  };

  const filteredAnswers = (displayTest.answers || []).filter((q) => {
    const isUnattempted = q.selectedOption === undefined || q.selectedOption === -1;
    const isRight = !isUnattempted && q.isCorrect;
    const isWrong = !isUnattempted && !q.isCorrect;

    if (filterReview === "correct") return isRight;
    if (filterReview === "incorrect") return isWrong;
    if (filterReview === "unattempted") return isUnattempted;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-blue-400 font-bold">{displayTest.testId}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{displayTest.date}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-semibold">{displayTest.experience || "Fresher"}</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {displayTest.role} - 30 MCQ Technical Assessment
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Color-Coded Score Ribbon */}
        <div className="flex flex-wrap items-center justify-between bg-slate-950/70 px-6 py-3.5 border-b border-slate-800 gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400">Score: </span>
              <span className="font-mono text-sm font-bold text-blue-400">
                {displayTest.score} / {displayTest.totalQuestions || 30} ({displayTest.percentage}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-400 font-semibold">
              <span>✓ Right:</span>
              <span className="font-bold">{displayTest.correctAnswers || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-rose-400 font-semibold">
              <span>✕ Wrong:</span>
              <span className="font-bold">{displayTest.wrongAnswers || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-amber-400 font-semibold">
              <span>⚠ Not Attempted:</span>
              <span className="font-bold">{unattemptedCount}</span>
            </div>

            <div>
              <span className="text-slate-400">Time: </span>
              <span className="font-semibold text-slate-200">
                {minsSpent}m {secsSpent}s
              </span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition"
          >
            📄 Download Color-Coded PDF
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <div className="mx-auto mb-2 h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              Loading complete question history from MongoDB...
            </div>
          ) : (
            <>
              {/* Topic Breakdown */}
              {displayTest.topicBreakdown && displayTest.topicBreakdown.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Competency Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {displayTest.topicBreakdown.map((t, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-900 p-2.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-300 truncate">{t.topic}</span>
                          <span className="font-mono text-blue-400">{t.correct}/{t.total} ({t.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Question list & Filter Bar */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Question Review & Explanations ({displayTest.answers?.length || 0})
                  </h4>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1 text-[11px]">
                    <button
                      onClick={() => setFilterReview("all")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        filterReview === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      All ({displayTest.answers?.length || 30})
                    </button>
                    <button
                      onClick={() => setFilterReview("correct")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        filterReview === "correct" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-emerald-400"
                      }`}
                    >
                      ✓ Right ({displayTest.correctAnswers || 0})
                    </button>
                    <button
                      onClick={() => setFilterReview("incorrect")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        filterReview === "incorrect" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-rose-400"
                      }`}
                    >
                      ✕ Wrong ({displayTest.wrongAnswers || 0})
                    </button>
                    <button
                      onClick={() => setFilterReview("unattempted")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        filterReview === "unattempted" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-amber-400"
                      }`}
                    >
                      ⚠ Not Attempted ({unattemptedCount})
                    </button>
                  </div>
                </div>

                {filteredAnswers.map((q, idx) => {
                  const isUnattempted = q.selectedOption === undefined || q.selectedOption === -1;
                  const isRight = !isUnattempted && q.isCorrect;
                  const isWrong = !isUnattempted && !q.isCorrect;

                  let cardClass = "border-rose-500/30 bg-rose-500/5";
                  let badgeClass = "border-rose-500/40 text-rose-400 bg-rose-500/20";
                  let badgeLabel = "✕ Wrong Answer";

                  if (isRight) {
                    cardClass = "border-emerald-500/30 bg-emerald-500/5";
                    badgeClass = "border-emerald-500/40 text-emerald-400 bg-emerald-500/20";
                    badgeLabel = "✓ Right Answer";
                  } else if (isUnattempted) {
                    cardClass = "border-amber-500/40 bg-amber-500/5";
                    badgeClass = "border-amber-500/40 text-amber-300 bg-amber-500/20";
                    badgeLabel = "⚠ Not Attempted";
                  }

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4.5 space-y-3 transition ${cardClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-400">
                          Q{q.questionId || idx + 1} • {q.topic || "Technical"}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeClass}`}
                        >
                          {badgeLabel}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-100">{q.question}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-slate-900 p-2.5">
                          <span className="text-slate-400 block text-[11px]">Your Answer:</span>
                          <span
                            className={
                              isRight
                                ? "text-emerald-400 font-bold"
                                : isWrong
                                ? "text-rose-400 font-bold"
                                : "text-amber-400 font-bold italic"
                            }
                          >
                            {isUnattempted
                              ? "(Not Attempted)"
                              : q.options[q.selectedOption] || `Option ${q.selectedOption + 1}`}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-900 p-2.5">
                          <span className="text-slate-400 block text-[11px]">Correct Solution:</span>
                          <span className="text-emerald-400 font-bold">
                            {q.options[q.correctOption] || `Option ${q.correctOption + 1}`}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300 leading-relaxed">
                        <strong className="text-blue-400">Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-6 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
