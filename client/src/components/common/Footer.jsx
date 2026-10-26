export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-10 text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm md:flex-row">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Interview Ace AI</span>
          <span>•</span>
          <span>Empowering candidates with Gemini AI-driven mock interviews</span>
        </div>
        <div>
          © {new Date().getFullYear()} Interview Ace AI. Built with React & Google GenAI.
        </div>
      </div>
    </footer>
  );
}
