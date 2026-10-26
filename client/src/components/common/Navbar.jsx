import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, userEmail, logout } = useAuth();

  const isCurrent = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-black text-white shadow-lg shadow-blue-500/20">
            IA
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Interview <span className="text-blue-400">Ace AI</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden items-center gap-6 md:flex">
          <button
            onClick={() => navigate("/")}
            className={`text-sm font-medium transition ${
              isCurrent("/") ? "text-blue-400" : "text-slate-300 hover:text-white"
            }`}
          >
            Home
          </button>

          {isLoggedIn && (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className={`text-sm font-medium transition ${
                  isCurrent("/dashboard") ? "text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/setup")}
                className={`text-sm font-medium transition ${
                  isCurrent("/setup") ? "text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                Mock Setup
              </button>
              <button
                onClick={() => navigate("/mcq-test")}
                className={`text-sm font-medium transition ${
                  isCurrent("/mcq-test") ? "text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                🧠 Mock MCQ Test
              </button>
              <button
                onClick={() => navigate("/results")}
                className={`text-sm font-medium transition ${
                  isCurrent("/results") ? "text-blue-400" : "text-slate-300 hover:text-white"
                }`}
              >
                Results & Report
              </button>
            </>
          )}

          {!isLoggedIn && (
            <>
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition">
                How It Works
              </a>
            </>
          )}
        </div>

        {/* Right CTA / Auth Controls */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-slate-700/60 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300 sm:flex sm:items-center sm:gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="max-w-[140px] truncate">{userEmail || "Candidate"}</span>
              </div>
              <button
                onClick={logout}
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 hover:border-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
              >
                Sign Up (OTP)
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
