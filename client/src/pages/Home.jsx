import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import FeatureCard from "../components/cards/FeatureCard";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const features = [
    {
      icon: "🤖",
      title: "Adaptive AI Mock Interviews",
      description: "Practice real-time technical, system design, and behavioral questions powered by Google Gemini AI, adapted to your target job role.",
      tag: "Gemini 2.5",
    },
    {
      icon: "📊",
      title: "Objective AI Scoring & Feedback",
      description: "Receive instant rubric-based scores (0-10) and structured feedback on clarity, technical accuracy, and improvement roadmaps.",
      tag: "Instant Evaluation",
    },
    {
      icon: "📄",
      title: "Official Downloadable PDF Reports",
      description: "Export professional, branded candidate evaluation report cards with your score, competency breakdown, and answer history.",
      tag: "Verified Report",
    },
    {
      icon: "🎯",
      title: "ATS Resume Skill Matcher",
      description: "Scan your resume against real tech industry standards, calculate ATS compatibility, and auto-generate tailored mock rounds.",
      tag: "ATS Scanner",
    },
    {
      icon: "📈",
      title: "Performance Analytics Radar",
      description: "Track your competency readiness index across frontend, backend, databases, and communication to identify exact growth areas.",
      tag: "Progress Radar",
    },
    {
      icon: "💼",
      title: "Custom Company Tracks",
      description: "Target top product and service companies like Google, Microsoft, TCS, and Infosys with company-specific question sets.",
      tag: "Role Targeted",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-6 pt-20 pb-28 text-center md:pt-28 md:pb-36">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-8 animate-pulse">
              <span>✨</span>
              <span>Next-Gen AI Interview Intelligence Platform</span>
            </div>

            <h1 className="text-5xl font-black tracking-tight leading-tight md:text-7xl">
              Ace Your Next Tech
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-300 bg-clip-text text-transparent">
                Interview With Gemini AI
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-slate-400 leading-relaxed">
              Practice realistic mock interviews tailored to your exact tech stack, receive instant AI evaluations with comprehensive feedback, and download branded performance report cards.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-500 hover:scale-[1.02]"
              >
                {isLoggedIn ? "Go to Candidate Dashboard →" : "Start Free Mock Interview →"}
              </button>

              <button
                onClick={() =>
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-900/80 px-8 py-4 font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                Explore Features ↓
              </button>
            </div>
          </div>

          {/* Ambient Glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-blue-600/15 blur-[120px]" />
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Enterprise Preparation Architecture
            </span>
            <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
              Engineered for Candidate Success
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-sm text-slate-400">
              Everything you need to transform interview anxiety into confident, offer-winning technical delivery.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((item, idx) => (
              <FeatureCard
                key={idx}
                icon={item.icon}
                title={item.title}
                description={item.description}
                tag={item.tag}
              />
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-y border-slate-800/80 bg-slate-900/30 px-6 py-24">
          <div className="mx-auto max-w-5xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              3-Step Workflow
            </span>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              How Interview Ace AI Works
            </h2>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Target Your Role",
                  desc: "Select role, experience level, question count, or upload your resume for automatic skill extraction.",
                },
                {
                  step: "02",
                  title: "Answer Real-Time",
                  desc: "Respond to adaptive technical and behavioral prompts in a live simulated interview environment.",
                },
                {
                  step: "03",
                  title: "Get Scored & Download",
                  desc: "Review your detailed AI scoring rubric and download an official PDF report card for mentors.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 font-mono text-lg font-black text-white shadow-lg shadow-blue-500/20">
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/80 to-slate-900 p-10 md:p-14 shadow-2xl">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-300">
              Join students and software engineers practicing with AI. Start your first session in under 60 seconds.
            </p>
            <button
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
              className="mt-8 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-500 hover:scale-105"
            >
              {isLoggedIn ? "Open Dashboard →" : "Get Started Now →"}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
