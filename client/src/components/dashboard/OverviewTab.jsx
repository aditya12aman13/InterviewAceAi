import { useNavigate } from "react-router-dom";
import StatCard from "../cards/StatCard";
import CompetencyCard from "../cards/CompetencyCard";
import ActionCard from "../cards/ActionCard";
import InterviewHistoryCard from "../cards/InterviewHistoryCard";

export default function OverviewTab({
  profile,
  stats,
  recentInterviews,
  onReviewInterview,
  onDownloadPdf,
  onOpenEditProfile,
  onSwitchToTab,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-8 shadow-xl md:p-10">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              CANDIDATE DASHBOARD
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Welcome back, {profile.name}! 👋
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Targeting: <span className="font-semibold text-blue-400">{profile.targetRole}</span> • Experience: <span className="font-semibold text-slate-200">{profile.experience}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/setup")}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 hover:scale-[1.02]"
            >
              🚀 Start AI Mock Interview
            </button>
            <button
              onClick={onOpenEditProfile}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Average"
          value={`${stats.averageScore} / 10`}
          subtitle="Across all evaluated sessions"
          icon="⭐"
          badge="Top 15%"
          badgeColor="blue"
        />
        <StatCard
          title="Interview Readiness"
          value={`${stats.readinessIndex}%`}
          subtitle="AI readiness benchmark"
          icon="🎯"
          badge="Interview Ready"
          badgeColor="emerald"
        />
        <StatCard
          title="Interviews Practiced"
          value={stats.totalSessions}
          subtitle="Sessions recorded"
          icon="📊"
          badge="+2 This Month"
          badgeColor="purple"
        />
        <StatCard
          title="Success Hire Rate"
          value={`${stats.passedCount} of ${stats.totalSessions}`}
          subtitle="Scored 7.0 or above"
          icon="🏆"
          badge="High Fit"
          badgeColor="emerald"
        />
      </div>

      {/* Two Column Layout: Competencies + Quick Actions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Competencies Progress (2 cols) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Competency Readiness Breakdown</h3>
              <p className="text-xs text-slate-400 mt-1">
                Real-time evaluation across core technical and behavioral dimensions
              </p>
            </div>
            <span className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-300">
              AI Rubric v2.4
            </span>
          </div>

          <div className="space-y-3.5">
            {stats.competencies.map((comp, idx) => (
              <CompetencyCard
                key={idx}
                name={comp.name}
                score={comp.score}
                level={comp.level}
              />
            ))}
          </div>
        </div>

        {/* Quick Launch Cards (1 col) */}
        <div className="space-y-4">
          <ActionCard
            isPrimary={true}
            icon="⚡"
            title="Launch Full Mock"
            description="Simulate real company hiring rounds with adaptive Gemini AI questions."
            buttonText="Start Session"
            onClick={() => navigate("/setup")}
          />
          <ActionCard
            icon="🧠"
            title="Mock MCQ Test (25 Mins)"
            description="Take 30 dynamic technical MCQs generated by Gemini with a 25-minute timer & auto-submit."
            buttonText="Start 25-Min Test"
            onClick={() => navigate("/mcq-test")}
          />
          <ActionCard
            icon="📄"
            title="Scan Resume & ATS"
            description="Upload your resume to extract skills and match technical question sets."
            buttonText="View ATS Match"
            onClick={() => onSwitchToTab("resume")}
          />
        </div>
      </div>

      {/* Recent Interviews Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Interview Sessions</h3>
            <p className="text-xs text-slate-400">Review detailed answers, scores, and download reports</p>
          </div>
          <button
            onClick={() => onSwitchToTab("history")}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            View All ({stats.totalSessions}) →
          </button>
        </div>

        <div className="space-y-3">
          {recentInterviews.slice(0, 3).map((interview) => (
            <InterviewHistoryCard
              key={interview.id}
              interview={interview}
              onReview={onReviewInterview}
              onDownloadPdf={onDownloadPdf}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
