export default function FeatureCard({ icon, title, description, tag }) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-8 transition duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl text-blue-400 group-hover:scale-110 transition">
          {icon}
        </div>
        {tag && (
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
            {tag}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-xl font-bold text-white group-hover:text-blue-400 transition">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}
