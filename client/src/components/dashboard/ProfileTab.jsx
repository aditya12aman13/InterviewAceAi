export default function ProfileTab({
  profile,
  completeness,
  onOpenEditProfile,
  onResetDefaults,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Candidate Profile & Career Goals</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile and job preferences used by Gemini AI to customize your mock interviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetDefaults}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Reset Defaults
          </button>
          <button
            onClick={onOpenEditProfile}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500"
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Avatar & Completeness */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-3xl font-black text-white shadow-xl shadow-blue-500/20">
            {profile.name?.charAt(0) || "C"}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{profile.name}</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">{profile.email}</p>
            <div className="mt-2 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              {profile.targetRole}
            </div>
          </div>

          {/* Completeness Bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span>Profile Completeness</span>
              <span className="font-mono text-blue-400">{completeness}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {completeness === 100
                ? "Your profile is fully optimized for AI question generation!"
                : "Fill out all profile fields to maximize personalization."}
            </p>
          </div>

          {/* External links */}
          <div className="flex justify-center gap-3 pt-2">
            {profile.githubUrl && (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                GitHub
              </a>
            )}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): Detailed Attributes */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Target Role
              </span>
              <div className="text-sm font-bold text-white mt-1">
                {profile.targetRole || "Not specified"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Experience Level
              </span>
              <div className="text-sm font-bold text-white mt-1">
                {profile.experience || "Fresher"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dream Target Companies
            </span>
            <div className="text-sm font-semibold text-slate-200 mt-1">
              {profile.targetCompanies || "None specified"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Key Technical Skills
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.skills
                ?.split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Career Objective & Bio
            </span>
            <p className="text-xs leading-5 text-slate-300 mt-2">
              {profile.bio || "No bio added yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
