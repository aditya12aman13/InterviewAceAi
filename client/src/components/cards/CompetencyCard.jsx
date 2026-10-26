export default function CompetencyCard({ name, score, level }) {
  const getScoreColor = (val) => {
    if (val >= 85) return "bg-gradient-to-r from-blue-500 to-indigo-500";
    if (val >= 75) return "bg-gradient-to-r from-emerald-500 to-teal-500";
    if (val >= 60) return "bg-gradient-to-r from-amber-500 to-yellow-500";
    return "bg-gradient-to-r from-rose-500 to-red-500";
  };

  const getBadgeColor = (val) => {
    if (val >= 85) return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    if (val >= 75) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-200">{name}</span>
        <div className="flex items-center gap-2">
          <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${getBadgeColor(score)}`}>
            {level || `${score}%`}
          </span>
          <span className="text-xs font-mono font-bold text-slate-300">{score}%</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full transition-all duration-700 ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
