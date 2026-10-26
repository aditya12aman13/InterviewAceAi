require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, getDBStatus } = require("./db");
const User = require("./models/User");
const InterviewSession = require("./models/InterviewSession");
const ResumeProfile = require("./models/ResumeProfile");
const McqTestResult = require("./models/McqTestResult");
const OtpVerification = require("./models/OtpVerification");
const { FULL_STACK_30_MCQ, getRoleQuestions } = require("./questionBank");
const { seedContributorAccounts } = require("./seedContributors");

const app = express();

const PORT = process.env.PORT || 5001;
const MODEL_NAME = "gemini-3.5-flash-lite";
const REQUEST_TIMEOUT = 90000; // 90 seconds

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Connect to MongoDB
connectDB().then(async () => {
  try {
    // Seed and verify contributor accounts (Suyog, Aditya, Rishav)
    await seedContributorAccounts();
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

    // 2. Seed sample MCQ Test result into MongoDB if collection is empty
    const mcqCount = await McqTestResult.countDocuments();
    if (mcqCount === 0) {
      console.log("🌱 Seeding sample 30-MCQ test result into MongoDB...");
      const sampleMcq = {
        testId: "MCQ-7821",
        userEmail: "suyog@gmail.com",
        role: "Full Stack Developer",
        experience: "Fresher",
        date: "2026-10-25",
        totalQuestions: 30,
        attemptedQuestions: 30,
        correctAnswers: 26,
        wrongAnswers: 4,
        unanswered: 0,
        score: 26,
        percentage: 87,
        status: "Top Performer",
        timeSpentSeconds: 1140, // 19 minutes
        topicBreakdown: [
          { topic: "JavaScript", total: 7, correct: 6, percentage: 86 },
          { topic: "React", total: 6, correct: 5, percentage: 83 },
          { topic: "Node.js & Express", total: 6, correct: 6, percentage: 100 },
          { topic: "MongoDB & Databases", total: 5, correct: 4, percentage: 80 },
          { topic: "System Design & Git", total: 6, correct: 5, percentage: 83 },
        ],
        answers: FULL_STACK_30_MCQ.map((q, idx) => ({
          questionId: q.id,
          question: q.question,
          options: q.options,
          selectedOption: idx === 5 || idx === 11 || idx === 19 || idx === 25 ? (q.correctOption + 1) % 4 : q.correctOption,
          correctOption: q.correctOption,
          isCorrect: !(idx === 5 || idx === 11 || idx === 19 || idx === 25),
          explanation: q.explanation,
          topic: q.topic,
        }))
      };
      await McqTestResult.create(sampleMcq);
      console.log("✅ Seeded default 30-MCQ test result successfully.");
    }
  } catch (err) {
    console.warn("Notice: could not auto-seed sample data:", err.message);
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
// 2. AUTHENTICATION & OTP VERIFICATION API (MONGODB)
// ==========================================

// 1. Generate & Save Random 6-Digit OTP in MongoDB
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate random 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in MongoDB OtpVerification (with 10-minute TTL auto-expiration)
    await OtpVerification.findOneAndUpdate(
      { email: cleanEmail },
      {
        email: cleanEmail,
        otp: generatedOtp,
        purpose: "registration",
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log(`🔐 MongoDB OTP Generated: [${generatedOtp}] for candidate: ${cleanEmail}`);

    res.json({
      success: true,
      message: "Random OTP generated and stored in MongoDB.",
      otp: generatedOtp, // Sent back so frontend pop-up message box displays it immediately for verification
      email: cleanEmail,
      expiresInSeconds: 600,
    });
  } catch (error) {
    console.error("Error generating OTP in MongoDB:", error);
    res.status(500).json({ success: false, message: "Failed to generate OTP in MongoDB." });
  }
});

// 2. Verify OTP & Create New Verified Account in MongoDB
app.post("/api/auth/verify-otp-register", async (req, res) => {
  try {
    const { email, name, password, targetRole, experience, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Look up OTP record in MongoDB
    const otpRecord = await OtpVerification.findOne({ email: cleanEmail });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new verification code.",
      });
    }

    if (otpRecord.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code entered. Please check the pop-up code and try again.",
      });
    }

    // OTP matched! Delete consumed OTP record
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    // Upsert verified User in MongoDB
    const candidateName =
      (name && name.trim()) ||
      cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1);

    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      {
        email: cleanEmail,
        name: candidateName,
        password: password || "password123",
        targetRole: targetRole || "Full Stack Developer",
        experience: experience || "Fresher",
        isVerified: true,
        skills: "React, Node.js, Express, MongoDB, JavaScript, Tailwind CSS, REST APIs, Git",
        targetCompanies: "Google, Microsoft, Amazon, TCS, Infosys",
        bio: `Passionate ${targetRole || "Software"} Engineer preparing with InterviewAce AI.`,
      },
      { upsert: true, new: true }
    );

    // Seed default resume profile for the newly registered user if missing
    const existingResume = await ResumeProfile.findOne({ userEmail: cleanEmail });
    if (!existingResume) {
      await ResumeProfile.create({
        userEmail: cleanEmail,
        fileName: `${candidateName.replace(/\s+/g, "_")}_Resume.pdf`,
        fileSize: "215 KB",
        uploadedDate: new Date().toISOString().split("T")[0],
        parsedSkills: ["JavaScript", "React 19", "Node.js", "Express", "MongoDB", "Git"],
        atsScore: 88,
        matchRole: user.targetRole,
        recommendations: [
          "New candidate account successfully verified via MongoDB OTP.",
          "Profile linked to MongoDB database 'interview'.",
          "Ready to practice verbal mock interviews and take 25-minute 30-MCQ tests!"
        ]
      });
    }

    console.log(`✅ User registered and verified via MongoDB OTP: ${user.name} (${user.email})`);

    res.json({
      success: true,
      message: "Account verified and registered successfully!",
      user: {
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        experience: user.experience,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP and registering:", error);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

// 3. User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Auto-create candidate account if logging in with email
      const candidateName = cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1);
      user = await User.create({
        email: cleanEmail,
        name: candidateName,
        password: password || "password123",
        targetRole: "Full Stack Developer",
        experience: "Fresher",
        isVerified: true,
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        experience: user.experience,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// 4. Contributor Accounts Directory (For 1-Click Login)
app.get("/api/auth/contributors", async (req, res) => {
  res.json({
    success: true,
    contributors: [
      {
        name: "Suyog Shelke",
        email: "suyog@gmail.com",
        role: "Full Stack Developer",
        tag: "Backend & AI Lead",
        avatar: "👨‍💻",
      },
      {
        name: "Aditya Aman",
        email: "aditya@gmail.com",
        role: "Frontend Developer",
        tag: "Frontend & UI/UX Lead",
        avatar: "🎨",
      },
      {
        name: "Rishav Kumar",
        email: "rishav@gmail.com",
        role: "Python / AI Engineer",
        tag: "MCQ & Analytics Lead",
        avatar: "🧠",
      },
    ],
  });
});

// ==========================================
// 3. CANDIDATE PROFILE API (MONGODB)
// ==========================================
app.get("/api/profile", async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Email query param is required." });
    }

    let user = await User.findOne({ email });

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
// 5. DYNAMIC AI MCQ TEST GENERATION
// ==========================================
app.post("/api/generate-questions", async (req, res) => {
  const { role = "Full Stack Developer", experience = "Fresher", count = 30 } = req.body || {};

  console.log("\n======================================");
  console.log(`🤖 GENERATING ${count} DYNAMIC MCQ QUESTIONS`);
  console.log(`Role: ${role} | Experience: ${experience}`);
  console.log("======================================");

  try {
    const ai = await getGeminiClient();

    const prompt = `
You are an expert technical interviewer creating a 30-question multiple-choice technical test for a ${experience} level ${role}.

Generate a rigorous, fair, and diverse set of 30 multiple choice questions.
Topics should cover:
- Core Languages (JavaScript, ES6+, TypeScript if applicable)
- Frontend Frameworks (React, State, Hooks, DOM)
- Backend & APIs (Node.js, Express, REST, HTTP, Auth)
- Database & Storage (MongoDB, Indexing, Transactions)
- System Design, Git, Security & Web Performance

Format: Return ONLY a valid JSON array of objects with this EXACT structure for each question:
[
  {
    "id": 1,
    "topic": "JavaScript",
    "question": "Clear question text?",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctOption": 0,
    "explanation": "Clear 1-2 sentence explanation of why this answer is correct."
  }
]

RULES:
- "correctOption" must be an integer between 0 and 3.
- "options" must contain exactly 4 options.
- No markdown formatting, no code fences. Return valid JSON only.
`;

    console.log("Sending generation prompt to Gemini:", MODEL_NAME);

    // Timeout of 35 seconds for AI generation
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 8000,
        },
      }),
      35000
    );

    if (response && response.text) {
      let rawText = response.text.trim();
      // Remove any markdown fence if present
      if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
      }

      const generated = JSON.parse(rawText);

      if (Array.isArray(generated) && generated.length >= 15) {
        console.log(`✅ Successfully generated ${generated.length} AI MCQ questions from Gemini.`);

        // Normalize ids and ensure exactly 30 questions
        let normalized = generated.map((q, idx) => ({
          id: idx + 1,
          topic: q.topic || "Technical",
          question: q.question,
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["A", "B", "C", "D"],
          correctOption: typeof q.correctOption === "number" && q.correctOption >= 0 && q.correctOption <= 3 ? q.correctOption : 0,
          explanation: q.explanation || "Correct solution based on industry standards."
        }));

        if (normalized.length < 30) {
          // Top up with curated bank if fewer than 30
          const needed = 30 - normalized.length;
          const supplement = FULL_STACK_30_MCQ.slice(0, needed).map((q, i) => ({
            ...q,
            id: normalized.length + i + 1,
          }));
          normalized = [...normalized, ...supplement];
        }

        return res.json({
          success: true,
          isAIGenerated: true,
          role,
          count: normalized.length,
          questions: normalized.slice(0, 30),
        });
      }
    }

    throw new Error("Gemini response did not parse into valid questions array");
  } catch (err) {
    console.warn("⚠️ Dynamic question generation notice:", err.message);
    console.log("👉 Seamlessly providing curated 30-MCQ bank for role:", role);

    const questions = getRoleQuestions(role);

    return res.json({
      success: true,
      isAIGenerated: false,
      fallback: true,
      role,
      count: questions.length,
      questions,
    });
  }
});

// ==========================================
// 6. MCQ TEST RESULTS API (MONGODB)
// ==========================================
// GET past MCQ tests
app.get("/api/mcq-tests", async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    const query = email ? { userEmail: email } : {};

    const tests = await McqTestResult.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tests.length,
      tests: tests.map((t) => ({
        id: t.testId,
        testId: t.testId,
        userEmail: t.userEmail,
        role: t.role,
        experience: t.experience,
        date: t.date,
        totalQuestions: t.totalQuestions,
        attemptedQuestions: t.attemptedQuestions,
        correctAnswers: t.correctAnswers,
        wrongAnswers: t.wrongAnswers,
        unanswered: t.unanswered,
        score: t.score,
        percentage: t.percentage,
        status: t.status,
        timeSpentSeconds: t.timeSpentSeconds,
        topicBreakdown: t.topicBreakdown,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching MCQ tests from MongoDB:", error);
    res.status(500).json({ success: false, message: "Failed to fetch MCQ tests from database." });
  }
});

// GET single MCQ test by testId
app.get("/api/mcq-tests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const test = await McqTestResult.findOne({ testId: id });

    if (!test) {
      return res.status(404).json({ success: false, message: "MCQ test not found." });
    }

    res.json({ success: true, test });
  } catch (error) {
    console.error("Error fetching single MCQ test:", error);
    res.status(500).json({ success: false, message: "Failed to fetch test details." });
  }
});

// POST save completed MCQ test result
app.post("/api/mcq-tests", async (req, res) => {
  try {
    const {
      testId,
      userEmail,
      role,
      experience,
      date,
      totalQuestions = 30,
      attemptedQuestions = 0,
      correctAnswers = 0,
      wrongAnswers = 0,
      unanswered = 0,
      score = 0,
      percentage = 0,
      status,
      timeSpentSeconds = 0,
      topicBreakdown = [],
      answers = [],
    } = req.body || {};

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "userEmail is required to save test." });
    }

    const generatedId = testId || `MCQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const calcPercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const calcStatus =
      status ||
      (calcPercentage >= 80 ? "Top Performer" : calcPercentage >= 60 ? "Passed" : "Needs Review");

    const savedTest = await McqTestResult.findOneAndUpdate(
      { testId: generatedId },
      {
        testId: generatedId,
        userEmail: userEmail.toLowerCase().trim(),
        role: role || "Full Stack Developer",
        experience: experience || "Fresher",
        date: date || new Date().toISOString().split("T")[0],
        totalQuestions,
        attemptedQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score: correctAnswers,
        percentage: calcPercentage,
        status: calcStatus,
        timeSpentSeconds,
        topicBreakdown,
        answers,
      },
      { new: true, upsert: true }
    );

    console.log(`💾 Stored 30-MCQ Test ${savedTest.testId} in MongoDB for ${savedTest.userEmail}`);

    res.json({
      success: true,
      message: "MCQ Test result stored successfully in MongoDB.",
      test: savedTest,
    });
  } catch (error) {
    console.error("Error saving MCQ test to MongoDB:", error);
    res.status(500).json({ success: false, message: "Failed to save MCQ test." });
  }
});

// ==========================================
// 7. EVALUATE INTERVIEW ANSWER (GEMINI AI)
// ==========================================
app.post("/api/evaluate", async (req, res) => {
  const requestStarted = Date.now();

  console.log("\n======================================");
  console.log("NEW INTERVIEW EVALUATION REQUEST");
  console.log("Time:", new Date().toISOString());

  try {
    const { question, answer } = req.body || {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid interview question.",
      });
    }

    if (typeof answer !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please provide the candidate's answer.",
      });
    }

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

    console.log("Question received successfully. Initializing Gemini...");
    const ai = await getGeminiClient();

    const prompt = `
You are an experienced technical interview evaluator.
Evaluate the candidate's answer fairly and objectively.

QUESTION:
${question.trim()}

CANDIDATE ANSWER:
${answer.trim()}

Evaluate based on:
1. Technical correctness
2. Relevance to the question
3. Clarity of explanation
4. Completeness of the answer

Return ONLY valid JSON in this exact format:
{
  "score": 0,
  "feedback": "A concise explanation of the evaluation.",
  "strengths": ["Positive observation about the answer."],
  "improvements": ["Specific suggestion for improvement."]
}

IMPORTANT RULES:
- Score must be an integer between 0 and 10.
- Return JSON only without Markdown fences.
`;

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

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const evaluation = JSON.parse(response.text);
    const score = Number(evaluation.score);

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
        ? evaluation.strengths.filter((i) => typeof i === "string").slice(0, 3)
        : [],
      improvements: Array.isArray(evaluation.improvements)
        ? evaluation.improvements.filter((i) => typeof i === "string").slice(0, 3)
        : [],
    };

    console.log("Evaluation completed. Score:", score + "/10");
    console.log("Time taken:", Date.now() - requestStarted, "ms");
    console.log("======================================\n");

    return res.json(result);
  } catch (error) {
    const details = String(error.message || error.status || error.code || "");
    console.error("Evaluation error:", details);

    return res.status(500).json({
      success: false,
      message: "Evaluation failed. Check backend console.",
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
  console.log("MCQ Generation Endpoint: POST /api/generate-questions");
  console.log("MCQ Tests Endpoint: POST/GET /api/mcq-tests");
  console.log("======================================");
});
