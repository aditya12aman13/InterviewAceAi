export default function InterviewDetailModal({
  isOpen,
  onClose,
  interview,
  onDownloadPdf,
}) {
  if (!isOpen || !interview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-blue-400 font-bold">{interview.id}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{interview.date}</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              {interview.role} Evaluation Summary
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
        <div className="flex items-center justify-between bg-slate-950/60 px-6 py-3 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-slate-400">Score: </span>
              <span className="font-mono text-sm font-bold text-blue-400">
                {interview.score}/10 ({interview.percentage}%)
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Status: </span>
              <span className="text-xs font-semibold text-emerald-400">
                {interview.status}
              </span>
            </div>
          </div>

          <button
            onClick={() => onDownloadPdf(interview)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow"
          >
            📄 Download Official PDF
          </button>
        </div>

        {/* Content Q&A list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(interview.results || []).map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-400">
                  Question {idx + 1}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {item.evaluation?.score ?? 0} / 10
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-200">
                {item.question}
              </p>

              <div className="mt-3 rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
                <span className="font-bold text-slate-400">Candidate Answer: </span>
                {item.answer || "No response provided."}
              </div>

              <div className="mt-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300">
                <span className="font-bold text-blue-400">AI Feedback: </span>
                {item.evaluation?.feedback || "Evaluation complete."}
              </div>
            </div>
          ))}
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
