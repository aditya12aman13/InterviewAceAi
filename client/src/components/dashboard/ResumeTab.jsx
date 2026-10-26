import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function ResumeTab({
  resumeData,
  isScanning,
  scanProgress,
  message,
  onFileUpload,
  onRemoveSkill,
  onAddSkill,
  onGenerateCustomInterview,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [newSkillInput, setNewSkillInput] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddSkillSubmit = (e) => {
    e.preventDefault();
    if (newSkillInput.trim()) {
      onAddSkill(newSkillInput.trim());
      setNewSkillInput("");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">AI Resume Analysis & Skill Extraction</h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload your latest resume to automatically evaluate ATS keyword compatibility and generate targeted interview questions.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-8 text-center transition duration-200 hover:border-blue-500 hover:bg-slate-900"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={(e) => e.target.files && onFileUpload(e.target.files[0])}
          className="hidden"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl text-blue-400 group-hover:scale-110 transition">
          📄
        </div>

        <h3 className="mt-4 text-base font-bold text-white">
          Drop your resume here, or <span className="text-blue-400 underline">browse files</span>
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Supports PDF, DOCX, DOC (Up to 10MB)
        </p>

        {isScanning && (
          <div className="mt-6 max-w-md mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Scanning with Gemini AI...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {message && (
          <div className="mt-4 inline-block rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
            {message}
          </div>
        )}
      </div>

      {/* Active Resume Breakdown Card */}
      {resumeData && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: ATS Score & Metadata */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Resume
              </span>
              <h4 className="text-base font-bold text-white mt-1 break-all">
                {resumeData.fileName}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Size: {resumeData.fileSize} • Uploaded: {resumeData.uploadedDate}
              </p>
            </div>

            {/* ATS Score Card */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
              <span className="text-xs font-semibold text-emerald-400 uppercase">
                ATS Compatibility Index
              </span>
              <div className="font-mono text-4xl font-extrabold text-white mt-1">
                {resumeData.atsScore}%
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                High probability of clearing automated resume screening
              </p>
            </div>

            {/* Target Role match */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <span className="text-xs text-slate-400">Target Role Match:</span>
              <div className="text-sm font-bold text-blue-400 mt-0.5">
                {resumeData.matchRole}
              </div>
            </div>

            <button
              onClick={() => onGenerateCustomInterview(navigate)}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition"
            >
              🎯 Start Interview Based On This Resume
            </button>
          </div>

          {/* Right Column (2 cols): Extracted Skills & Recommendations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 lg:col-span-2 space-y-6">
            {/* Extracted Skills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-white">Extracted Key Skills</h4>
                <span className="text-xs text-slate-400">
                  {resumeData.parsedSkills?.length || 0} skills detected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(resumeData.parsedSkills || []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-200"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => onRemoveSkill(skill)}
                      className="text-slate-400 hover:text-red-400 transition ml-1"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Skill Form */}
              <form onSubmit={handleAddSkillSubmit} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom skill (e.g. Next.js, Redux, Docker)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  + Add
                </button>
              </form>
            </div>

            {/* AI Recommendations */}
            <div className="border-t border-slate-800 pt-6">
              <h4 className="text-base font-bold text-white mb-3">
                AI Optimization Insights & Feedback
              </h4>

              <div className="space-y-2.5">
                {(resumeData.recommendations || []).map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 text-xs text-slate-300"
                  >
                    <span className="text-blue-400 mt-0.5">💡</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
