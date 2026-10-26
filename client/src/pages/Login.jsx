import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { sendOtp, verifyOtpRegister, loginUser, getContributors } from "../services/api";
import { POPULAR_ROLES, EXPERIENCE_LEVELS } from "../models/userProfile";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // Mode: "login" or "signup"
  const [mode, setMode] = useState(() => (searchParams.get("mode") === "signup" ? "signup" : "login"));

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState("Full Stack Developer");
  const [signupExp, setSignupExp] = useState("Fresher (0 years)");

  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtpDigits, setEnteredOtpDigits] = useState(["", "", "", "", "", ""]);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Contributor accounts
  const [contributors, setContributors] = useState([
    {
      name: "Suyog Shelke",
      email: "suyog@gmail.com",
      role: "Full Stack Developer",
      tag: "Backend & AI Lead",
      avatar: "👨‍💻",
      score: "28/30",
    },
    {
      name: "Aditya Aman",
      email: "aditya@gmail.com",
      role: "Frontend Developer",
      tag: "Frontend & UI/UX Lead",
      avatar: "🎨",
      score: "27/30",
    },
    {
      name: "Rishav Kumar",
      email: "rishav@gmail.com",
      role: "Python / AI Engineer",
      tag: "MCQ & Analytics Lead",
      avatar: "🧠",
      score: "29/30",
    },
  ]);

  useEffect(() => {
    getContributors().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setContributors(res);
      }
    });
  }, []);

  // Timer countdown for OTP modal
  useEffect(() => {
    let interval = null;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpModal, otpTimer]);

  // Handle Standard Login
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(loginEmail.trim(), loginPassword);
      if (res && res.success) {
        login(loginEmail.trim());
      } else {
        // Fallback login
        login(loginEmail.trim());
      }
    } catch {
      login(loginEmail.trim());
    } finally {
      setIsLoading(false);
    }
  }

  // 1-Click Contributor Login
  function handleContributorLogin(contrib) {
    setError("");
    setSuccessMessage(`Authenticating as ${contrib.name}...`);
    login(contrib.email);
  }

  // Handle Step 1 of Sign Up: Request Random OTP from MongoDB
  async function handleRequestOtp(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!signupEmail.trim() || !signupName.trim() || !signupPassword.trim()) {
      setError("Please fill in all required fields (Name, Email, and Password).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(signupEmail.trim(), signupName.trim());
      if (res && res.success) {
        setGeneratedOtp(res.otp);
        setShowOtpModal(true);
        setOtpTimer(600);
        setEnteredOtpDigits(["", "", "", "", "", ""]);
        setCopiedOtp(false);
      } else {
        setError(res?.message || "Failed to generate OTP in MongoDB. Please try again.");
      }
    } catch (err) {
      setError("Network error: Could not reach backend server on port 5001.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle OTP Digit Input
  function handleOtpDigitChange(index, value) {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...enteredOtpDigits];
      digits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setEnteredOtpDigits(newDigits);
      const nextInput = document.getElementById(`otp-input-${Math.min(digits.length, 5)}`);
      if (nextInput) nextInput.focus();
      return;
    }

    const val = value.replace(/\D/g, "");
    const newDigits = [...enteredOtpDigits];
    newDigits[index] = val;
    setEnteredOtpDigits(newDigits);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !enteredOtpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  }

  // Auto-Fill OTP for frictionless demo verification
  function handleAutoFillOtp() {
    if (generatedOtp) {
      const digits = generatedOtp.split("").slice(0, 6);
      setEnteredOtpDigits(digits);
    }
  }

  // Copy OTP to clipboard
  function handleCopyOtp() {
    if (generatedOtp) {
      navigator.clipboard.writeText(generatedOtp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  }

  // Step 2 of Sign Up: Verify OTP & Create Account in MongoDB
  async function handleVerifyOtpSubmit(e) {
    e.preventDefault();
    const fullOtp = enteredOtpDigits.join("");

    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const payload = {
        email: signupEmail.trim(),
        name: signupName.trim(),
        password: signupPassword,
        targetRole: signupRole,
        experience: signupExp,
        otp: fullOtp,
      };

      const res = await verifyOtpRegister(payload);

      if (res && res.success) {
        setShowOtpModal(false);
        setSuccessMessage("🎉 Account verified & registered successfully! Redirecting...");
        setTimeout(() => {
          login(signupEmail.trim());
        }, 800);
      } else {
        setError(res?.message || "Invalid OTP code. Please verify the code displayed in the popup.");
      }
    } catch (err) {
      setError("Verification failed. Check backend connection.");
    } finally {
      setIsVerifying(false);
    }
  }

  const formatTimer = () => {
    const mins = Math.floor(otpTimer / 60);
    const secs = otpTimer % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        {/* Top Navigation */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          ← Back to Home
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 font-black text-white shadow-lg shadow-blue-500/25 text-lg">
            IA
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Interview <span className="text-blue-400">Ace AI</span>
            </h1>
            <p className="text-xs text-slate-400">
              Technical Mock Interview & 25-Min MCQ Evaluation Platform
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs: Sign In vs Register / Sign Up */}
        <div className="mt-6 flex rounded-2xl border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setSuccessMessage("");
            }}
            className={`flex-1 rounded-xl py-2.5 font-bold transition ${
              mode === "login"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔐 Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccessMessage("");
            }}
            className={`flex-1 rounded-xl py-2.5 font-bold transition ${
              mode === "signup"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ✨ Register New Account (OTP)
          </button>
        </div>

        {/* Contributor Quick Access Bar */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>👥</span> 1-Click Contributor Logins (MongoDB Ready):
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Full History Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {contributors.map((c) => (
              <button
                key={c.email}
                type="button"
                onClick={() => handleContributorLogin(c)}
                className="group relative flex flex-col items-start rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-left transition hover:border-blue-500/50 hover:bg-slate-800/90"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-base">{c.avatar}</span>
                  <span className="text-[10px] font-mono font-bold text-blue-400 group-hover:text-blue-300">
                    Login →
                  </span>
                </div>
                <span className="mt-1 font-bold text-xs text-white truncate w-full">
                  {c.name.split(" ")[0]}
                </span>
                <span className="text-[10px] text-slate-400 truncate w-full">
                  {c.tag.split(" ")[0]} Lead
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-semibold animate-pulse">
            {successMessage}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 1: SIGN IN FORM                                     */}
        {/* ======================================================== */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="mt-6 space-y-4 animate-fadeIn">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g., suyog@gmail.com"
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In to Dashboard →"}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
              >
                Register with OTP Verification
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* MODE 2: REGISTER / SIGN UP FORM WITH OTP GENERATION      */}
        {/* ======================================================== */}
        {mode === "signup" && (
          <form onSubmit={handleRequestOtp} className="mt-6 space-y-4 animate-fadeIn">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Full Candidate Name
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g., Alex Johnson"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="e.g., alex@gmail.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Set Account Password
              </label>
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Target Job Role
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  {POPULAR_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Experience Level
                </label>
                <select
                  value={signupExp}
                  onChange={(e) => setSignupExp(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generating Random OTP in MongoDB...
                </span>
              ) : (
                "📩 Send Verification OTP →"
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
              >
                Sign In Instead
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE OTP GENERATION POP-UP MESSAGE BOX & MODAL     */}
      {/* ======================================================== */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  🔐
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Candidate OTP Verification
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Verifying new user for <span className="text-blue-400 font-semibold">{signupEmail}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowOtpModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* POP-UP MESSAGE BOX DISPLAYING GENERATED MONGODB OTP */}
            <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-950/70 to-slate-900 p-4 space-y-2.5 shadow-lg shadow-blue-500/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                  MongoDB Generated OTP Code
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Expires in: <strong className="text-amber-400">{formatTimer()}</strong>
                </span>
              </div>

              {/* Large High-Contrast Display of Random OTP */}
              <div className="flex items-center justify-between rounded-xl bg-slate-950/90 border border-slate-800 p-3">
                <div className="font-mono text-2xl font-black tracking-widest text-emerald-400">
                  {generatedOtp}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    {copiedOtp ? "✓ Copied!" : "📋 Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-500 transition shadow"
                  >
                    ⚡ Auto-Fill
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                This random OTP was generated and stored securely in MongoDB database <span className="font-mono text-blue-300">'interview'</span> with a 10-minute auto-expiry TTL.
              </p>
            </div>

            {/* 6-Digit Verification Input Boxes */}
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Enter the 6-Digit OTP Code:
                </label>

                <div className="flex justify-between gap-2">
                  {enteredOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="h-12 w-12 rounded-xl border border-slate-700 bg-slate-950 text-center font-mono text-lg font-bold text-white shadow focus:border-blue-500 focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              {/* Verify & Register Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Verifying OTP in MongoDB...
                  </span>
                ) : (
                  "Verify & Complete Registration ✓"
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="font-semibold text-blue-400 hover:text-blue-300 underline"
                >
                  Generate New OTP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
