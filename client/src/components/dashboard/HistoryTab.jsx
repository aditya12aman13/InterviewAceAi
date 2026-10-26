import { useNavigate } from "react-router-dom";
import InterviewHistoryCard from "../cards/InterviewHistoryCard";

export default function HistoryTab({
  interviews,
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  onReviewInterview,
  onDownloadPdf,
  onDeleteInterview,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Interview History & Reports</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse through your completed mock rounds, analyze AI feedback, and download branded PDF report cards.
          </p>
        </div>

        <button
          onClick={() => navigate("/setup")}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500"
        >
          + New Interview
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by role or Session ID (e.g., INT-8921)..."
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

      {/* List */}
      {interviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <div className="text-4xl mb-3">📂</div>
          <h3 className="text-base font-bold text-white">No interview sessions found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || filterRole !== "all"
              ? "No interviews matched your current filter criteria."
              : "You haven't completed any interview sessions yet. Start your first mock to generate reports!"}
          </p>
          <button
            onClick={() => navigate("/setup")}
            className="mt-5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
          >
            Start First Mock Interview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <InterviewHistoryCard
              key={interview.id}
              interview={interview}
              onReview={onReviewInterview}
              onDownloadPdf={onDownloadPdf}
              onDelete={onDeleteInterview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
