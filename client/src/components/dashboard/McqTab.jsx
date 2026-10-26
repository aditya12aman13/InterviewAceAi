import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../cards/StatCard";

export default function McqTab({ mcqTests = [], onReviewTest, onDownloadPdf }) {
  const navigate = useNavigate();
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const totalTests = mcqTests.length;
  const bestScore = totalTests > 0
    ? Math.max(...mcqTests.map((t) => Number(t.score) || 0))
    : 0;
  const avgPercentage = totalTests > 0
    ? Math.round(mcqTests.reduce((acc, t) => acc + (Number(t.percentage) || 0), 0) / totalTests)
    : 0;

  const filteredTests = mcqTests.filter((test) => {
    const matchesRole =
      filterRole === "all" || test.role?.toLowerCase().includes(filterRole.toLowerCase());
    const matchesSearch =
      searchTerm === "" ||
      test.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.testId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🧠</span> Mock MCQ Test Analytics & History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            25-minute time-bound technical assessments stored in MongoDB database <span className="font-mono text-blue-400">'interview'</span>.
          </p>
        </div>

        <button
          onClick={() => navigate("/mcq-test")}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition"
        >
          🚀 Start New 25-Min Test
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Best MCQ Score"
          value={`${bestScore} / 30`}
          subtitle="Highest score recorded"
          icon="🏆"
          badge="High Fit"
          badgeColor="emerald"
        />
        <StatCard
          title="Average Accuracy"
          value={`${avgPercentage}%`}
          subtitle="Across technical assessments"
          icon="🎯"
          badge={avgPercentage >= 80 ? "Top Tier" : "Passing"}
          badgeColor="blue"
        />
        <StatCard
          title="Tests Completed"
          value={totalTests}
          subtitle="Saved in MongoDB"
          icon="📊"
          badge="Time-Bound"
          badgeColor="purple"
        />
        <StatCard
          title="Standard Timer"
          value="25 Mins"
          subtitle="Per 30-question assessment"
          icon="⏱️"
          badge="Auto-Submit"
          badgeColor="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by role or Test ID (e.g. MCQ-7821)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filter Role:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="full stack">Full Stack</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
          </select>
        </div>
      </div>

      {/* Tests List */}
      {filteredTests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-base font-bold text-white">No MCQ assessments found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Take your first 25-minute 30-question mock test to benchmark your technical accuracy!
          </p>
          <button
            onClick={() => navigate("/mcq-test")}
            className="mt-5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
          >
            Take First Mock MCQ Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((test) => {
            const minsSpent = Math.floor((test.timeSpentSeconds || 0) / 60);
            const secsSpent = (test.timeSpentSeconds || 0) % 60;

            const isTop = test.percentage >= 80;
            const statusClass = isTop
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30";

            return (
              <div
                key={test.testId || test.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow transition duration-200 hover:border-slate-700 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Role and Metadata */}
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 text-lg">
                      🧠
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition">
                          {test.role || "Full Stack Developer"}
                        </h4>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}>
                          {test.status || "Completed"}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-400">
                        <span className="font-mono text-slate-500">{test.testId}</span>
                        <span>•</span>
                        <span>{test.date}</span>
                        <span>•</span>
                        <span>{test.experience || "Fresher"}</span>
                        <span>•</span>
                        <span>Time Taken: {minsSpent}m {secsSpent}s</span>
                        <span>•</span>
                        <span>{test.correctAnswers || test.score}/30 Correct</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score and Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Assessment Score</div>
                      <div className="font-mono text-xl font-extrabold text-blue-400">
                        {test.score} <span className="text-xs text-slate-500">/ 30 ({test.percentage}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReviewTest(test)}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                        title="Review questions and explanations"
                      >
                        🔍 Review Test
                      </button>

                      <button
                        onClick={() => onDownloadPdf(test)}
                        className="rounded-lg bg-blue-600/90 px-3.5 py-2 text-xs font-semibold text-white shadow transition hover:bg-blue-500"
                        title="Download official PDF report"
                      >
                        📄 PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
