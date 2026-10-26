import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    login(email);
  }

  const fillQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          ← Back to Home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-lg shadow-blue-500/20">
            IA
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Welcome <span className="text-blue-400">Back!</span>
            </h1>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Login to access your Interview Ace AI candidate dashboard.
        </p>

        {/* Quick Demo Credentials Pill */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
          <span className="text-slate-400 font-semibold block mb-1.5">⚡ Quick Contributor Logins:</span>
          <div className="flex flex-wrap gap-1.5">
            {["suyog@gmail.com", "aditya@gmail.com", "rishav@gmail.com"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => fillQuickDemo(m)}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] text-blue-300 hover:bg-slate-700 transition"
              >
                {m.split("@")[0]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., candidate@gmail.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="flex rounded-xl border border-slate-700 bg-slate-950 focus-within:border-blue-500">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-transparent px-4 py-2.5 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
          >
            Sign In to Dashboard →
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Demo version: Enter any password to authenticate.
        </p>
      </div>
    </div>
  );
}
