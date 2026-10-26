/**
 * User Profile model and helpers
 */

export const EXPERIENCE_LEVELS = [
  "Fresher (0 years)",
  "Junior (1-2 years)",
  "Mid-Level (3-5 years)",
  "Senior (5+ years)"
];

export const POPULAR_ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "React / Node.js Engineer",
  "Software Engineer",
  "DevOps Engineer",
  "AI / ML Engineer",
  "Data Engineer"
];

export function getDefaultProfile(email = "user@interviewace.ai") {
  const derivedName = email.includes("@")
    ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
    : "Candidate";

  return {
    name: derivedName || "Suyog Shelke",
    email: email,
    targetRole: "Full Stack Developer",
    experience: "Fresher (0 years)",
    targetCompanies: "Google, Microsoft, Amazon, TCS, Infosys",
    skills: "React.js, Node.js, Express, MongoDB, JavaScript, Tailwind CSS, REST APIs, Git",
    bio: "Passionate software engineer focused on building robust full-stack web applications with generative AI capabilities.",
    githubUrl: "https://github.com/suyogshelke",
    linkedinUrl: "https://linkedin.com/in/suyogshelke"
  };
}

export function loadProfileFromStorage(defaultEmail = "suyog@gmail.com") {
  try {
    const raw = localStorage.getItem("userProfile");
    if (!raw) return getDefaultProfile(defaultEmail);
    const parsed = JSON.parse(raw);
    return { ...getDefaultProfile(defaultEmail), ...parsed };
  } catch (err) {
    console.warn("Failed to parse userProfile from localStorage:", err);
    return getDefaultProfile(defaultEmail);
  }
}

export function saveProfileToStorage(profile) {
  try {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    return true;
  } catch (err) {
    console.error("Failed to save profile to localStorage:", err);
    return false;
  }
}
