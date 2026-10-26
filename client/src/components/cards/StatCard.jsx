export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgeColor = "emerald",
}) {
  const badgeClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  }[badgeColor] || "bg-blue-500/10 text-blue-400 border-blue-500/30";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-lg transition duration-200 hover:border-slate-700 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-xl text-blue-400 shadow-inner group-hover:scale-110 transition">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-extrabold tracking-tight text-white">
          {value}
        </span>
        {badge && (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
