export default function ActionCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
  isPrimary = false,
}) {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition duration-200 hover:-translate-y-1 ${
        isPrimary
          ? "border-blue-500/40 bg-gradient-to-b from-blue-950/40 to-slate-900/90 shadow-lg shadow-blue-500/10 hover:border-blue-400"
          : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
      }`}
    >
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 text-2xl text-blue-400">
          {icon}
        </div>
        <h4 className="mt-4 text-lg font-bold text-white group-hover:text-blue-400 transition">
          {title}
        </h4>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <button
        onClick={onClick}
        className={`mt-6 w-full rounded-xl py-2.5 text-xs font-semibold transition ${
          isPrimary
            ? "bg-blue-600 text-white shadow hover:bg-blue-500"
            : "border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
        }`}
      >
        {buttonText} →
      </button>
    </div>
  );
}
