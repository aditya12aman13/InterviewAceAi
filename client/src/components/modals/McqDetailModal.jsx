import { useState, useEffect } from "react";
import { getMcqTestById } from "../../services/api";

export default function McqDetailModal({
  isOpen,
  onClose,
  testSummary,
  onDownloadPdf,
}) {
  const [fullTest, setFullTest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && testSummary?.testId) {
      setLoading(true);
      getMcqTestById(testSummary.testId).then((res) => {
        setFullTest(res || testSummary);
        setLoading(false);
      });
    } else {
      setFullTest(null);
    }
  }, [isOpen, testSummary]);

  if (!isOpen || !testSummary) return null;

  const displayTest = fullTest || testSummary;
  const minsSpent = Math.floor((displayTest.timeSpentSeconds || 0) / 60);
  const secsSpent = (displayTest.timeSpentSeconds || 0) % 60;

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

        {/* Score Ribbon */}
        <div className="flex flex-wrap items-center justify-between bg-slate-950/60 px-6 py-3.5 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-400">Score: </span>
              <span className="font-mono text-base font-bold text-blue-400">
                {displayTest.score} / {displayTest.totalQuestions || 30} ({displayTest.percentage}%)
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Time Taken: </span>
              <span className="text-xs font-semibold text-slate-200">
                {minsSpent}m {secsSpent}s (of 25m)
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Rating: </span>
              <span className="text-xs font-bold text-emerald-400">
                {displayTest.status}
              </span>
            </div>
          </div>

          <button
            onClick={() => onDownloadPdf(displayTest)}
            className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow"
          >
            📄 Download Official Scorecard PDF
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

              {/* Question list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Question Review & Explanations ({displayTest.answers?.length || 0})
                </h4>

                {(displayTest.answers || []).map((q, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4.5 space-y-3 ${
                      q.isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-rose-500/30 bg-rose-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        Q{idx + 1} • {q.topic || "Technical"}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                          q.isCorrect
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/20"
                            : "border-rose-500/40 text-rose-400 bg-rose-500/20"
                        }`}
                      >
                        {q.isCorrect ? "✓ Correct" : "✕ Incorrect"}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100">{q.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-slate-900 p-2.5">
                        <span className="text-slate-400 block text-[11px]">Your Answer:</span>
                        <span className={q.isCorrect ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {q.selectedOption >= 0 ? q.options[q.selectedOption] : "(Unattempted)"}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-900 p-2.5">
                        <span className="text-slate-400 block text-[11px]">Correct Solution:</span>
                        <span className="text-emerald-400 font-bold">
                          {q.options[q.correctOption]}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300 leading-relaxed">
                      <strong className="text-blue-400">Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                ))}
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
