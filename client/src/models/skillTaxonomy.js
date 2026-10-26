/**
 * Skills taxonomy and role benchmark profiles for AI resume parsing
 */

export const SKILL_CATEGORIES = {
  frontend: ["React.js", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS", "Redux", "TypeScript", "Vite", "Next.js"],
  backend: ["Node.js", "Express.js", "RESTful APIs", "GraphQL", "JWT Authentication", "Microservices", "Python", "Java"],
  database: ["MongoDB", "Mongoose", "PostgreSQL", "MySQL", "Redis", "Database Indexing", "ORM"],
  devops: ["Git", "GitHub", "Docker", "CI/CD", "AWS", "Vercel", "Linux", "Nginx"],
  ai: ["Google Gemini GenAI", "Prompt Engineering", "LLM Integration", "OpenAI APIs"]
};

export const DEFAULT_RESUME_DATA = {
  fileName: "Suyog_Shelke_FullStack_Resume.pdf",
  fileSize: "248 KB",
  uploadedDate: "2026-10-25",
  parsedSkills: [
    "React 19",
    "JavaScript",
    "Node.js",
    "Express 5",
    "MongoDB",
    "Google Gemini AI",
    "Tailwind CSS",
    "RESTful APIs",
    "Git"
  ],
  atsScore: 92,
  matchRole: "Full Stack Developer",
  recommendations: [
    "High ATS compatibility (92%) for modern Full Stack software engineering roles.",
    "Strong evidence of full-stack MERN + Gemini GenAI integration.",
    "Recommendation: Highlight measurable system performance metrics in your project descriptions."
  ]
};
