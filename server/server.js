require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, getDBStatus } = require("./db");
const User = require("./models/User");
const InterviewSession = require("./models/InterviewSession");
const ResumeProfile = require("./models/ResumeProfile");

const app = express();

const PORT = process.env.PORT || 5001;
const MODEL_NAME = "gemini-3.5-flash-lite";
const REQUEST_TIMEOUT = 90000; // 90 seconds

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Connect to MongoDB
connectDB().then(async () => {
  // Seed sample past interviews into MongoDB if collection is empty
  try {
    const count = await InterviewSession.countDocuments();
    if (count === 0) {
      console.log("🌱 Seeding default interview sessions into MongoDB database 'interview'...");
      const sampleSessions = [
        {
          sessionId: "INT-8921",
          userEmail: "suyog@gmail.com",
          date: "2026-10-24",
          role: "Full Stack Developer",
          experience: "Fresher",
          score: 8.8,
          percentage: 88,
          status: "Strong Hire",
          totalQuestions: 5,
          answeredQuestions: 5,
          results: [
            { question: "What is the difference between props and state in React?", answer: "Props are read-only properties passed from parents, while state is component-internal mutable data.", evaluation: { score: 9, feedback: "Excellent and concise explanation." } },
            { question: "What is a REST API and standard HTTP methods?", answer: "REST APIs use GET to read, POST to create, PUT to update, and DELETE to remove resources.", evaluation: { score: 9, feedback: "Accurate HTTP verb mapping." } },
            { question: "Explain the JavaScript event loop.", answer: "The event loop continuously checks the call stack and microtask/macrotask queues for non-blocking execution.", evaluation: { score: 9, feedback: "Great understanding of concurrency." } },
            { question: "How does database indexing work?", answer: "Indexing builds B-Trees for fast key lookups avoiding slow full table scans.", evaluation: { score: 8, feedback: "Good conceptual clarity." } },
            { question: "How do you handle authentication in MERN stack?", answer: "Using JWT tokens stored securely and verified via Express auth middleware.", evaluation: { score: 9, feedback: "Standard enterprise security pattern." } }
          ]
        },
        {
          sessionId: "INT-8415",
          userEmail: "suyog@gmail.com",
          date: "2026-10-21",
          role: "Frontend Developer",
          experience: "Fresher",
          score: 7.6,
          percentage: 76,
          status: "Competent",
          totalQuestions: 5,
          answeredQuestions: 5,
          results: [
            { question: "Explain CSS Flexbox vs Grid.", answer: "Flexbox is one-dimensional for rows or columns, whereas CSS Grid is two-dimensional for complex layouts.", evaluation: { score: 8, feedback: "Accurate dimensional distinction." } },
            { question: "What is the Virtual DOM in React?", answer: "An in-memory representation of the real DOM used to calculate minimal re-renders via reconciliation.", evaluation: { score: 8, feedback: "Clear explanation of diffing algorithm." } },
            { question: "What are React Hooks?", answer: "Functions that let you use state and lifecycle features without writing class components.", evaluation: { score: 8, feedback: "Good definition." } },
            { question: "Difference between let, const, and var.", answer: "var is function-scoped and hoisted, whereas let and const are block-scoped.", evaluation: { score: 8, feedback: "Correct scope explanation." } },
            { question: "What is responsive web design?", answer: "Designing pages using media queries and fluid layouts to look great on all device screens.", evaluation: { score: 6, feedback: "Basic answer. Could mention mobile-first principles." } }
          ]
        }
      ];
      await InterviewSession.insertMany(sampleSessions);
      console.log("✅ Seeded default interview sessions successfully.");
    }
  } catch (err) {
    console.warn("Notice: could not auto-seed sample interviews:", err.message);
  }
});

let geminiClientPromise = null;

// Initialize Gemini
async function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error("GEMINI_API_KEY is missing from server/.env");
  }

  if (!geminiClientPromise) {
    geminiClientPromise = import("@google/genai")
      .then(({ GoogleGenAI }) => {
        return new GoogleGenAI({ apiKey });
      })
      .catch((error) => {
        geminiClientPromise = null;
        throw error;
      });
  }

  return geminiClientPromise;
}

// Timeout handler
function withTimeout(promise, milliseconds) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("GEMINI_REQUEST_TIMEOUT"));
    }, milliseconds);
  });

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId)
  );
}

// ==========================================
// 1. HEALTH CHECK & DATABASE STATUS
// ==========================================
app.get("/", (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    success: true,
    message: "Interview Ace AI API is running",
    database: {
      status: dbStatus.connected ? "connected" : "disconnected",
      name: dbStatus.database,
      host: dbStatus.host,
      readyState: dbStatus.state,
    },
    aiProvider: "Google Gemini",
    model: MODEL_NAME,
    timeout: REQUEST_TIMEOUT,
    port: PORT,
  });
});

// ==========================================
// 2. CANDIDATE PROFILE API (MONGODB)
// ==========================================
// GET profile by email
app.get("/api/profile", async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email query param is required." });
    }

    let user = await User.findOne({ email });

    // Auto-create initial profile document if first time
    if (!user) {
      const derivedName = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
      user = await User.create({
        email,
        name: derivedName || "Candidate",
        targetRole: "Full Stack Developer",
        experience: "Fresher (0 years)",
        targetCompanies: "Google, Microsoft, Amazon, TCS, Infosys",
        skills: "React.js, Node.js, Express, MongoDB, JavaScript, Tailwind CSS, REST APIs, Git",
        bio: "Passionate software engineer focused on building robust full-stack web applications with generative AI capabilities.",
      });
    }

    res.json({ success: true, profile: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile from MongoDB." });
  }
});

// POST/PUT update profile
app.post("/api/profile", async (req, res) => {
  try {
    const { email, ...updates } = req.body || {};
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required to update profile." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const updatedUser = await User.findOneAndUpdate(
      { email: cleanEmail },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, message: "Profile saved to MongoDB", profile: updatedUser });
  } catch (error) {
    console.error("Error updating profile in MongoDB:", error);
    res.status(500).json({ success: false, message: "Failed to save profile to MongoDB." });
  }
});

// ==========================================
// 3. INTERVIEW SESSIONS API (MONGODB)
// ==========================================
// GET all interview sessions for candidate
app.get("/api/interviews", async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    const query = email ? { userEmail: email } : {};

    const interviews = await InterviewSession.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: interviews.length,
      interviews: interviews.map((item) => ({
        id: item.sessionId,
        sessionId: item.sessionId,
        userEmail: item.userEmail,
        date: item.date,
        role: item.role,
        experience: item.experience,
        score: item.score,
        percentage: item.percentage,
        status: item.status,
        totalQuestions: item.totalQuestions,
        answeredQuestions: item.answeredQuestions,
        results: item.results,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching interviews from MongoDB:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve interviews from MongoDB." });
  }
});

// POST save completed interview session
app.post("/api/interviews", async (req, res) => {
  try {
    const {
      sessionId,
      userEmail,
      date,
      role,
      experience,
      score,
      percentage,
      status,
      totalQuestions,
      answeredQuestions,
      results,
    } = req.body || {};

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "userEmail is required." });
    }

    const generatedId = sessionId || `INT-${Math.floor(1000 + Math.random() * 9000)}`;

    const session = await InterviewSession.findOneAndUpdate(
      { sessionId: generatedId },
      {
        sessionId: generatedId,
        userEmail: userEmail.toLowerCase().trim(),
        date: date || new Date().toISOString().split("T")[0],
        role: role || "Software Engineer",
        experience: experience || "Fresher",
        score: Number(score) || 0,
        percentage: Number(percentage) || Math.round((Number(score) / 10) * 100),
        status: status || (Number(score) >= 8.5 ? "Strong Hire" : Number(score) >= 7 ? "Competent" : "Needs Practice"),
        totalQuestions: Number(totalQuestions) || results?.length || 5,
        answeredQuestions: Number(answeredQuestions) || results?.length || 5,
        results: Array.isArray(results) ? results : [],
      },
      { new: true, upsert: true }
    );

    console.log(` Saved interview session ${session.sessionId} to MongoDB for ${session.userEmail}`);

    res.json({
      success: true,
      message: "Interview session stored in MongoDB database 'interview'.",
      interview: session,
    });
  } catch (error) {
    console.error("Error saving interview session to MongoDB:", error);
    res.status(500).json({ success: false, message: "Failed to save session to MongoDB." });
  }
});

// DELETE interview session by ID
app.delete("/api/interviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await InterviewSession.findOneAndDelete({ sessionId: id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }

    res.json({ success: true, message: `Session ${id} removed from MongoDB.` });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ success: false, message: "Failed to delete session." });
  }
});

// ==========================================
// 4. RESUME PROFILE & ATS API (MONGODB)
// ==========================================
// GET resume data
app.get("/api/resume", async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const resume = await ResumeProfile.findOne({ userEmail: email }).sort({ updatedAt: -1 });

    if (!resume) {
      return res.json({
        success: true,
        resume: {
          userEmail: email,
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
            "Git",
          ],
          atsScore: 92,
          matchRole: "Full Stack Developer",
          recommendations: [
            "High ATS compatibility (92%) for modern Full Stack software engineering roles.",
            "Strong evidence of full-stack MERN + Gemini GenAI integration.",
            "Recommendation: Highlight measurable system performance metrics in your project descriptions.",
          ],
        },
      });
    }

    res.json({ success: true, resume });
  } catch (error) {
    console.error("Error fetching resume from MongoDB:", error);
    res.status(500).json({ success: false, message: "Failed to fetch resume." });
  }
});

// POST save/update resume data
app.post("/api/resume", async (req, res) => {
  try {
    const { userEmail, fileName, fileSize, parsedSkills, atsScore, matchRole, recommendations } = req.body || {};
    if (!userEmail) {
      return res.status(400).json({ success: false, message: "userEmail is required." });
    }

    const cleanEmail = userEmail.trim().toLowerCase();

    const resume = await ResumeProfile.findOneAndUpdate(
      { userEmail: cleanEmail },
      {
        userEmail: cleanEmail,
        fileName: fileName || "Resume.pdf",
        fileSize: fileSize || "250 KB",
        uploadedDate: new Date().toISOString().split("T")[0],
        parsedSkills: Array.isArray(parsedSkills) ? parsedSkills : [],
        atsScore: Number(atsScore) || 90,
        matchRole: matchRole || "Full Stack Developer",
        recommendations: Array.isArray(recommendations) ? recommendations : [],
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Resume profile saved to MongoDB", resume });
  } catch (error) {
    console.error("Error saving resume to MongoDB:", error);
    res.status(500).json({ success: false, message: "Failed to save resume." });
  }
});

// ==========================================
// 5. EVALUATE INTERVIEW ANSWER (GEMINI AI)
// ==========================================
app.post("/api/evaluate", async (req, res) => {
  const requestStarted = Date.now();

  console.log("\n======================================");
  console.log("NEW INTERVIEW EVALUATION REQUEST");
  console.log("Time:", new Date().toISOString());

  try {
    const { question, answer } = req.body || {};

    // Validate question
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid interview question.",
      });
    }

    // Validate answer
    if (typeof answer !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide the candidate's answer.",
      });
    }

    // Handle empty answer
    if (!answer.trim()) {
      return res.json({
        success: true,
        score: 0,
        feedback: "No answer was provided.",
        strengths: [],
        improvements: [
          "Attempt the interview question.",
          "Explain your answer using relevant concepts and examples.",
        ],
      });
    }

    console.log("Question received successfully.");
    console.log("Initializing Gemini...");

    const ai = await getGeminiClient();

    const prompt = `
You are an experienced technical interview evaluator.

Evaluate the candidate's answer fairly and objectively.

QUESTION:
${question.trim()}

CANDIDATE ANSWER:
${answer.trim()}

Evaluate the answer based on:
1. Technical correctness
2. Relevance to the question
3. Clarity of explanation
4. Completeness of the answer

Return ONLY valid JSON in this exact format:

{
  "score": 0,
  "feedback": "A concise explanation of the evaluation.",
  "strengths": [
    "Positive observation about the answer."
  ],
  "improvements": [
    "Specific suggestion for improvement."
  ]
}

IMPORTANT RULES:
- Score must be an integer between 0 and 10.
- Give 0 for an irrelevant or completely incorrect answer.
- Give partial marks for partially correct answers.
- Do not give 10/10 unless the answer is genuinely excellent.
- Do not reward unnecessarily long answers.
- Do not invent statements the candidate did not make.
- Be encouraging but honest.
- Include up to 3 strengths.
- Include up to 3 improvements.
- Return JSON only.
- Do not use Markdown code fences.
`;

    console.log("Sending request to Gemini:", MODEL_NAME);
    console.log("Timeout:", REQUEST_TIMEOUT / 1000, "seconds");

    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 600,
        },
      }),
      REQUEST_TIMEOUT
    );

    console.log("Gemini response received.");

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    // Parse AI response
    const evaluation = JSON.parse(response.text);
    const score = Number(evaluation.score);

    // Validate AI output
    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score > 10 ||
      typeof evaluation.feedback !== "string"
    ) {
      throw new Error("Gemini returned an invalid evaluation format.");
    }

    const result = {
      success: true,
      score,
      feedback: evaluation.feedback,
      strengths: Array.isArray(evaluation.strengths)
        ? evaluation.strengths
            .filter((item) => typeof item === "string")
            .slice(0, 3)
        : [],
      improvements: Array.isArray(evaluation.improvements)
        ? evaluation.improvements
            .filter((item) => typeof item === "string")
            .slice(0, 3)
        : [],
    };

    console.log("Evaluation completed successfully.");
    console.log("Score:", score + "/10");
    console.log("Time taken:", Date.now() - requestStarted, "ms");
    console.log("======================================\n");

    return res.json(result);
  } catch (error) {
    const details = String(error.message || error.status || error.code || "");
    console.error("Evaluation error:", details);

    const normalized = details.toLowerCase();

    if (details === "GEMINI_REQUEST_TIMEOUT") {
      return res.status(504).json({
        success: false,
        message: "Gemini took too long to respond. Please try again.",
      });
    }

    if (normalized.includes("gemini_api_key is missing")) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is missing. Check server/.env.",
      });
    }

    if (
      normalized.includes("429") ||
      normalized.includes("quota") ||
      normalized.includes("resource_exhausted")
    ) {
      return res.status(429).json({
        success: false,
        message: "Gemini API quota or rate limit reached. Please try again later.",
      });
    }

    if (
      normalized.includes("401") ||
      normalized.includes("403") ||
      normalized.includes("api key") ||
      normalized.includes("permission_denied") ||
      normalized.includes("unauthorized")
    ) {
      return res.status(401).json({
        success: false,
        message: "Gemini authentication failed. Check your API key.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Evaluation failed. Check the backend Terminal.",
    });
  }
});

// Invalid JSON handler
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  console.error("Server error:", error.message);
  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

// Start server
app.listen(PORT, () => {
  console.log("======================================");
  console.log(`Interview Ace AI server running on http://localhost:${PORT}`);
  console.log("AI Provider: Google Gemini");
  console.log("Database: MongoDB ('interview')");
  console.log("Gemini Model:", MODEL_NAME);
  console.log("Request Timeout: 90 seconds");
  console.log("======================================");
});
