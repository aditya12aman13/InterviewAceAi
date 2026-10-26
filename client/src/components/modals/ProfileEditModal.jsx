import { useState, useEffect } from "react";
import { EXPERIENCE_LEVELS, POPULAR_ROLES } from "../../models/userProfile";

export default function ProfileEditModal({
  isOpen,
  onClose,
  initialProfile,
  onSave,
}) {
  const [formData, setFormData] = useState(initialProfile);

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h3 className="text-xl font-bold text-white">Edit Candidate Profile</h3>
            <p className="text-xs text-slate-400 mt-1">
              Keep your profile updated so AI mock interviews tailor questions to your target job.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                disabled
                className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Role
              </label>
              <input
                type="text"
                name="targetRole"
                list="roles-list"
                value={formData.targetRole || ""}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
              <datalist id="roles-list">
                {POPULAR_ROLES.map((role) => (
                  <option key={role} value={role} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Experience Level
              </label>
              <select
                name="experience"
                value={formData.experience || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Companies (comma separated)
            </label>
            <input
              type="text"
              name="targetCompanies"
              value={formData.targetCompanies || ""}
              onChange={handleChange}
              placeholder="Google, Microsoft, TCS, Infosys, Amazon"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Core Technical Skills (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills || ""}
              onChange={handleChange}
              placeholder="React.js, Node.js, Express, MongoDB, Tailwind CSS"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Professional Bio & Career Objective
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio || ""}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub Profile URL
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl || ""}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl || ""}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
