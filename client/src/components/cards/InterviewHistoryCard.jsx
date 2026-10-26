export default function InterviewHistoryCard({
  interview,
  onReview,
  onDownloadPdf,
  onDelete,
}) {
  const getStatusBadge = (status = "") => {
    switch (status.toLowerCase()) {
      case "strong hire":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "competent":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "needs practice":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-500/30";
    }
  };

  const score = Number(interview.score || 0).toFixed(1);

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow transition duration-200 hover:border-slate-700 hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Role and Meta */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
            💼
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition">
                {interview.role || "Software Engineer"}
              </h4>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(interview.status)}`}>
                {interview.status || "Completed"}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
              <span className="font-mono text-slate-500">{interview.id}</span>
              <span>•</span>
              <span>{interview.date}</span>
              <span>•</span>
              <span>{interview.experience || "Fresher"}</span>
              <span>•</span>
              <span>{interview.answeredQuestions || interview.results?.length || 5} Questions</span>
            </div>
          </div>
        </div>

        {/* Right: Score and Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="text-right">
            <div className="text-xs text-slate-400">Overall Score</div>
            <div className="font-mono text-xl font-extrabold text-blue-400">
              {score} <span className="text-xs text-slate-500">/ 10</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReview(interview)}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
              title="Review questions and feedback"
            >
              🔍 Review
            </button>

            <button
              onClick={() => onDownloadPdf(interview)}
              className="rounded-lg bg-blue-600/90 px-3.5 py-2 text-xs font-semibold text-white shadow transition hover:bg-blue-500"
              title="Download official PDF report"
            >
              📄 PDF
            </button>

            {onDelete && (
              <button
                onClick={() => onDelete(interview.id)}
                className="rounded-lg border border-red-500/20 p-2 text-xs text-red-400 transition hover:bg-red-500/10 hover:border-red-500/40"
                title="Delete session record"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
