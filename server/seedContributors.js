const User = require("./models/User");
const InterviewSession = require("./models/InterviewSession");
const ResumeProfile = require("./models/ResumeProfile");
const McqTestResult = require("./models/McqTestResult");
const { FULL_STACK_30_MCQ, getRoleQuestions } = require("./questionBank");

/**
 * Seeds and ensures rich data exists for all 3 contributors in MongoDB:
 * 1. Suyog Shelke (Backend Architecture & AI Core)
 * 2. Aditya Aman (Frontend Architecture & UI/UX Design)
 * 3. Rishav Kumar (Interactive Engine & Analytics)
 */
async function seedContributorAccounts() {
  console.log("🌱 Verifying and seeding 3 contributor accounts in MongoDB...");

  const contributors = [
    {
      email: "suyog@gmail.com",
      name: "Suyog Shelke",
      targetRole: "Full Stack Developer",
      experience: "Intermediate (2-3 years)",
      targetCompanies: "Google, Microsoft, Amazon, Uber",
      skills: "Node.js, Express, MongoDB, Google Gemini GenAI, React, REST APIs, System Design, Git",
      bio: "Lead Backend & AI Engineer. Architected InterviewAce AI Express server, Gemini evaluation pipelines, MongoDB persistence, and official PDF generation.",
      githubUrl: "https://github.com/suyogshelke",
      linkedinUrl: "https://linkedin.com/in/suyogshelke",
      isVerified: true,
      resume: {
        fileName: "Suyog_Shelke_FullStack_Resume.pdf",
        fileSize: "248 KB",
        uploadedDate: "2026-10-25",
        parsedSkills: [
          "Node.js",
          "Express 5",
          "MongoDB",
          "Mongoose",
          "Google Gemini GenAI",
          "React 19",
          "REST APIs",
          "System Design",
          "Git"
        ],
        atsScore: 94,
        matchRole: "Full Stack Developer",
        recommendations: [
          "Exceptional ATS compatibility (94%) for Full Stack and Backend positions.",
          "Clear demonstration of generative AI architecture and database schema design.",
          "Tip: Highlight high-concurrency stress benchmarks in system summaries."
        ]
      },
      interviews: [
        {
          sessionId: "INT-8921",
          date: "2026-10-24",
          role: "Full Stack Developer",
          experience: "Intermediate",
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
          date: "2026-10-21",
          role: "Backend Engineer",
          experience: "Intermediate",
          score: 9.1,
          percentage: 91,
          status: "Strong Hire",
          totalQuestions: 4,
          answeredQuestions: 4,
          results: [
            { question: "How do transactions work in MongoDB?", answer: "Multi-document ACID transactions use session objects across replica sets.", evaluation: { score: 9, feedback: "Spot on." } },
            { question: "Explain caching strategies with Redis.", answer: "Cache-aside and write-through patterns minimize DB read bottlenecks.", evaluation: { score: 9, feedback: "Solid architectural pattern." } },
            { question: "How do you prevent SQL/NoSQL injection?", answer: "Use parameterized queries, Mongoose schemas, and sanitize user input.", evaluation: { score: 9, feedback: "Secure defensive practice." } },
            { question: "Explain horizontal vs vertical scaling.", answer: "Vertical adds resources to a single node; horizontal distributes load across a cluster.", evaluation: { score: 9.5, feedback: "Very clear." } }
          ]
        }
      ],
      mcqs: [
        {
          testId: "MCQ-7821",
          role: "Full Stack Developer",
          experience: "Intermediate",
          date: "2026-10-25",
          totalQuestions: 30,
          attemptedQuestions: 30,
          correctAnswers: 26,
          wrongAnswers: 4,
          unanswered: 0,
          score: 26,
          percentage: 87,
          status: "Top Performer",
          timeSpentSeconds: 1140,
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
        },
        {
          testId: "MCQ-9104",
          role: "Backend Developer",
          experience: "Intermediate",
          date: "2026-10-26",
          totalQuestions: 30,
          attemptedQuestions: 29,
          correctAnswers: 27,
          wrongAnswers: 2,
          unanswered: 1,
          score: 27,
          percentage: 90,
          status: "Top Performer",
          timeSpentSeconds: 1020,
          topicBreakdown: [
            { topic: "Node.js Architecture", total: 8, correct: 8, percentage: 100 },
            { topic: "REST & HTTP Protocols", total: 8, correct: 7, percentage: 88 },
            { topic: "MongoDB Operations", total: 7, correct: 6, percentage: 86 },
            { topic: "API Security & Auth", total: 7, correct: 6, percentage: 86 },
          ],
          answers: getRoleQuestions("Backend Developer").map((q, idx) => ({
            questionId: q.id,
            question: q.question,
            options: q.options,
            selectedOption: idx === 29 ? -1 : idx === 3 || idx === 14 ? (q.correctOption + 1) % 4 : q.correctOption,
            correctOption: q.correctOption,
            isCorrect: idx !== 29 && idx !== 3 && idx !== 14,
            explanation: q.explanation,
            topic: q.topic,
          }))
        }
      ]
    },
    {
      email: "aditya@gmail.com",
      name: "Aditya Aman",
      targetRole: "Frontend Developer",
      experience: "Intermediate (2-3 years)",
      targetCompanies: "Meta, Stripe, Airbnb, Flipkart, Atlassian",
      skills: "React 19, Vite, Tailwind CSS, JavaScript ES6+, HTML5/CSS3, UI/UX Design, Responsive Layouts, Chart.js",
      bio: "Frontend Architect & UI/UX Designer. Crafted InterviewAce AI design tokens, multi-tab candidate dashboard, radar chart analytics, and responsive interfaces.",
      githubUrl: "https://github.com/aditya12aman13",
      linkedinUrl: "https://linkedin.com/in/aditya12aman13",
      isVerified: true,
      resume: {
        fileName: "Aditya_Aman_Frontend_Resume.pdf",
        fileSize: "235 KB",
        uploadedDate: "2026-10-24",
        parsedSkills: [
          "React 19",
          "Vite",
          "Tailwind CSS",
          "JavaScript ES6+",
          "HTML5 / CSS3",
          "UI/UX Prototyping",
          "Responsive Layouts",
          "Git"
        ],
        atsScore: 91,
        matchRole: "Frontend Developer",
        recommendations: [
          "Strong 91% ATS score for Frontend and Design Engineering roles.",
          "Solid demonstration of component modularity and responsive UI design.",
          "Tip: Mention Core Web Vitals optimization and bundle-size audits."
        ]
      },
      interviews: [
        {
          sessionId: "INT-7731",
          date: "2026-10-23",
          role: "Frontend Developer",
          experience: "Intermediate",
          score: 9.0,
          percentage: 90,
          status: "Strong Hire",
          totalQuestions: 5,
          answeredQuestions: 5,
          results: [
            { question: "Explain CSS Flexbox vs Grid.", answer: "Flexbox manages one-dimensional layouts, while Grid handles complex two-dimensional layouts with rows and columns.", evaluation: { score: 9, feedback: "Precise distinction." } },
            { question: "What is the Virtual DOM in React?", answer: "An efficient in-memory tree representation that enables batch reconciliation and minimal real DOM mutations.", evaluation: { score: 9, feedback: "Excellent architectural breakdown." } },
            { question: "Explain useMemo vs useCallback.", answer: "useMemo caches computation results, while useCallback caches function instance references between re-renders.", evaluation: { score: 9, feedback: "Exact and clear definition." } },
            { question: "How do you achieve responsive design across devices?", answer: "Using fluid containers, Tailwind breakpoints, media queries, and mobile-first methodologies.", evaluation: { score: 9, feedback: "Great practical approach." } },
            { question: "What are CSS variables and how do they benefit themes?", answer: "Custom properties defined on :root that allow dynamic runtime theme switching without rebuilding CSS.", evaluation: { score: 9, feedback: "Well stated." } }
          ]
        },
        {
          sessionId: "INT-6619",
          date: "2026-10-20",
          role: "UI/UX Engineer",
          experience: "Intermediate",
          score: 8.5,
          percentage: 85,
          status: "Strong Hire",
          totalQuestions: 4,
          answeredQuestions: 4,
          results: [
            { question: "Explain web accessibility (WCAG) guidelines.", answer: "Ensures contrast ratios, ARIA landmarks, keyboard navigation, and semantic HTML for screen readers.", evaluation: { score: 9, feedback: "Strong a11y awareness." } },
            { question: "How do micro-animations improve user retention?", answer: "They provide tactile feedback, reduce perceived wait times, and guide visual attention.", evaluation: { score: 8.5, feedback: "Thoughtful UX insights." } },
            { question: "How to prevent layout shifts (CLS)?", answer: "Reserve aspect-ratio boxes for images and avoid inserting dynamic content above existing text.", evaluation: { score: 8.5, feedback: "Accurate CWV advice." } },
            { question: "How do you design an effective dashboard?", answer: "Prioritize hierarchy with KPI summary cards at the top, clear tabs, and interactive drill-down modals.", evaluation: { score: 8.5, feedback: "Practical design sense." } }
          ]
        }
      ],
      mcqs: [
        {
          testId: "MCQ-6240",
          role: "Frontend Developer",
          experience: "Intermediate",
          date: "2026-10-25",
          totalQuestions: 30,
          attemptedQuestions: 30,
          correctAnswers: 27,
          wrongAnswers: 3,
          unanswered: 0,
          score: 27,
          percentage: 90,
          status: "Top Performer",
          timeSpentSeconds: 1260,
          topicBreakdown: [
            { topic: "HTML5 & Web APIs", total: 8, correct: 7, percentage: 88 },
            { topic: "CSS3 & Modern Layouts", total: 8, correct: 8, percentage: 100 },
            { topic: "JavaScript & DOM", total: 7, correct: 6, percentage: 86 },
            { topic: "React Components & State", total: 7, correct: 6, percentage: 86 },
          ],
          answers: getRoleQuestions("Frontend Developer").map((q, idx) => ({
            questionId: q.id,
            question: q.question,
            options: q.options,
            selectedOption: idx === 7 || idx === 18 || idx === 26 ? (q.correctOption + 1) % 4 : q.correctOption,
            correctOption: q.correctOption,
            isCorrect: idx !== 7 && idx !== 18 && idx !== 26,
            explanation: q.explanation,
            topic: q.topic,
          }))
        },
        {
          testId: "MCQ-5112",
          role: "Full Stack Developer",
          experience: "Intermediate",
          date: "2026-10-24",
          totalQuestions: 30,
          attemptedQuestions: 28,
          correctAnswers: 25,
          wrongAnswers: 3,
          unanswered: 2,
          score: 25,
          percentage: 83,
          status: "Top Performer",
          timeSpentSeconds: 1320,
          topicBreakdown: [
            { topic: "JavaScript", total: 7, correct: 6, percentage: 86 },
            { topic: "React", total: 6, correct: 5, percentage: 83 },
            { topic: "Node.js & Express", total: 6, correct: 5, percentage: 83 },
            { topic: "MongoDB & Databases", total: 5, correct: 4, percentage: 80 },
            { topic: "System Design & Git", total: 6, correct: 5, percentage: 83 },
          ],
          answers: FULL_STACK_30_MCQ.map((q, idx) => ({
            questionId: q.id,
            question: q.question,
            options: q.options,
            selectedOption: idx >= 28 ? -1 : idx === 4 || idx === 12 || idx === 20 ? (q.correctOption + 1) % 4 : q.correctOption,
            correctOption: q.correctOption,
            isCorrect: idx < 28 && idx !== 4 && idx !== 12 && idx !== 20,
            explanation: q.explanation,
            topic: q.topic,
          }))
        }
      ]
    },
    {
      email: "rishav@gmail.com",
      name: "Rishav Kumar",
      targetRole: "Python / AI Engineer",
      experience: "Intermediate (2-3 years)",
      targetCompanies: "NVIDIA, Adobe, Goldman Sachs, Cisco, Oracle",
      skills: "Python, Java, Speech Recognition API, Timer Engines, State Management, Data Analytics, React Hooks, Algorithms",
      bio: "Interactive Engine & Analytics Engineer. Engineered Web Speech recognition, 25-minute test timer with auto-submit, results review drawers, and custom React hooks.",
      githubUrl: "https://github.com/rishavkr2002",
      linkedinUrl: "https://linkedin.com/in/rishavkr2002",
      isVerified: true,
      resume: {
        fileName: "Rishav_Kumar_Python_AI_Resume.pdf",
        fileSize: "242 KB",
        uploadedDate: "2026-10-25",
        parsedSkills: [
          "Python",
          "Java",
          "Speech APIs",
          "JavaScript",
          "React Hooks",
          "Data Structures",
          "Analytics",
          "Git"
        ],
        atsScore: 92,
        matchRole: "Python / AI Engineer",
        recommendations: [
          "Strong 92% ATS score for Python, AI, and Analytics roles.",
          "Good cross-domain integration between Speech recognition and browser timer architectures.",
          "Tip: Highlight cloud deployment and concurrency metrics."
        ]
      },
      interviews: [
        {
          sessionId: "INT-9012",
          date: "2026-10-25",
          role: "Python Developer",
          experience: "Intermediate",
          score: 8.7,
          percentage: 87,
          status: "Strong Hire",
          totalQuestions: 5,
          answeredQuestions: 5,
          results: [
            { question: "Explain Python GIL (Global Interpreter Lock).", answer: "The GIL allows only one native thread to execute Python bytecode at a time, protecting memory management.", evaluation: { score: 9, feedback: "Precise understanding of CPython runtime." } },
            { question: "Difference between list vs tuple in Python.", answer: "Lists are mutable arrays with dynamic sizing; tuples are immutable and memory-efficient.", evaluation: { score: 9, feedback: "Clear mutability explanation." } },
            { question: "What are Python generators and yield?", answer: "Generators produce values lazily on-demand using yield, saving memory on large data streams.", evaluation: { score: 9, feedback: "Good memory optimization concept." } },
            { question: "Explain decorators in Python.", answer: "Functions that take another function as an argument and extend its behavior without modifying the source code.", evaluation: { score: 8.5, feedback: "Accurate higher-order function concept." } },
            { question: "How do you handle exceptions in Python?", answer: "Using try, except, else, and finally blocks to catch specific exception classes.", evaluation: { score: 8, feedback: "Standard error handling." } }
          ]
        },
        {
          sessionId: "INT-5524",
          date: "2026-10-22",
          role: "Data Structures & Systems",
          experience: "Intermediate",
          score: 8.4,
          percentage: 84,
          status: "Strong Hire",
          totalQuestions: 4,
          answeredQuestions: 4,
          results: [
            { question: "Explain time complexity of quicksort.", answer: "Average is O(n log n); worst case is O(n^2) when poor pivots are chosen.", evaluation: { score: 8.5, feedback: "Correct algorithmic bounds." } },
            { question: "How does a hash table resolve collisions?", answer: "Using chaining with linked lists or open addressing (linear/quadratic probing).", evaluation: { score: 8.5, feedback: "Good collision resolution grasp." } },
            { question: "Explain Breadth-First Search (BFS) vs DFS.", answer: "BFS explores level by level using a queue; DFS explores branch depth using recursion or a stack.", evaluation: { score: 8.5, feedback: "Clear traversal comparison." } },
            { question: "What is dynamic programming?", answer: "Breaking down complex problems into overlapping subproblems and memoizing results.", evaluation: { score: 8.5, feedback: "Solid explanation." } }
          ]
        }
      ],
      mcqs: [
        {
          testId: "MCQ-8832",
          role: "Python Developer",
          experience: "Intermediate",
          date: "2026-10-25",
          totalQuestions: 30,
          attemptedQuestions: 30,
          correctAnswers: 29,
          wrongAnswers: 1,
          unanswered: 0,
          score: 29,
          percentage: 97,
          status: "Top Performer",
          timeSpentSeconds: 1080,
          topicBreakdown: [
            { topic: "Python Core & OOP", total: 8, correct: 8, percentage: 100 },
            { topic: "Data Structures & Algorithms", total: 8, correct: 8, percentage: 100 },
            { topic: "Concurrency & GIL", total: 7, correct: 6, percentage: 86 },
            { topic: "Standard Libraries & Tools", total: 7, correct: 7, percentage: 100 },
          ],
          answers: getRoleQuestions("Python Developer").map((q, idx) => ({
            questionId: q.id,
            question: q.question,
            options: q.options,
            selectedOption: idx === 17 ? (q.correctOption + 1) % 4 : q.correctOption,
            correctOption: q.correctOption,
            isCorrect: idx !== 17,
            explanation: q.explanation,
            topic: q.topic,
          }))
        },
        {
          testId: "MCQ-4491",
          role: "Java Developer",
          experience: "Intermediate",
          date: "2026-10-23",
          totalQuestions: 30,
          attemptedQuestions: 29,
          correctAnswers: 24,
          wrongAnswers: 5,
          unanswered: 1,
          score: 24,
          percentage: 80,
          status: "Top Performer",
          timeSpentSeconds: 1440,
          topicBreakdown: [
            { topic: "Java OOP & Memory", total: 8, correct: 7, percentage: 88 },
            { topic: "Collections Framework", total: 8, correct: 6, percentage: 75 },
            { topic: "JVM & Garbage Collection", total: 7, correct: 6, percentage: 86 },
            { topic: "Multithreading & Concurrency", total: 7, correct: 5, percentage: 71 },
          ],
          answers: getRoleQuestions("Java Developer").map((q, idx) => ({
            questionId: q.id,
            question: q.question,
            options: q.options,
            selectedOption: idx === 29 ? -1 : idx === 3 || idx === 10 || idx === 17 || idx === 22 || idx === 27 ? (q.correctOption + 1) % 4 : q.correctOption,
            correctOption: q.correctOption,
            isCorrect: idx !== 29 && idx !== 3 && idx !== 10 && idx !== 17 && idx !== 22 && idx !== 27,
            explanation: q.explanation,
            topic: q.topic,
          }))
        }
      ]
    }
  ];

  for (const c of contributors) {
    try {
      // 1. Upsert User Profile
      await User.findOneAndUpdate(
        { email: c.email },
        {
          email: c.email,
          name: c.name,
          password: "password123",
          targetRole: c.targetRole,
          experience: c.experience,
          targetCompanies: c.targetCompanies,
          skills: c.skills,
          bio: c.bio,
          githubUrl: c.githubUrl,
          linkedinUrl: c.linkedinUrl,
          isVerified: true
        },
        { upsert: true, new: true }
      );

      // 2. Upsert Resume Profile
      await ResumeProfile.findOneAndUpdate(
        { userEmail: c.email },
        {
          userEmail: c.email,
          ...c.resume
        },
        { upsert: true, new: true }
      );

      // 3. Upsert Interview Sessions
      for (const session of c.interviews) {
        await InterviewSession.findOneAndUpdate(
          { sessionId: session.sessionId },
          {
            userEmail: c.email,
            ...session
          },
          { upsert: true, new: true }
        );
      }

      // 4. Upsert MCQ Tests
      for (const mcq of c.mcqs) {
        await McqTestResult.findOneAndUpdate(
          { testId: mcq.testId },
          {
            userEmail: c.email,
            ...mcq
          },
          { upsert: true, new: true }
        );
      }

      console.log(`✅ Contributor account verified & seeded: ${c.name} (${c.email})`);
    } catch (err) {
      console.warn(`Warning: Could not seed contributor ${c.email}:`, err.message);
    }
  }
}

module.exports = { seedContributorAccounts };
