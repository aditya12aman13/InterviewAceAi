/**
 * Data models and seed fixtures for candidate interview sessions
 */

export const INITIAL_PAST_INTERVIEWS = [
  {
    id: "INT-8921",
    date: "2026-10-24",
    role: "Full Stack Developer",
    experience: "Fresher",
    score: 8.8,
    percentage: 88,
    totalQuestions: 5,
    answeredQuestions: 5,
    status: "Strong Hire",
    results: [
      {
        question: "What is the difference between props and state in React?",
        answer: "Props are read-only properties passed from parent to child, while state is component-internal mutable data managed with useState.",
        evaluation: { score: 9, feedback: "Excellent, concise distinction between immutability and internal state." }
      },
      {
        question: "What is a REST API and standard HTTP methods?",
        answer: "A REST API uses standard HTTP verbs like GET to read, POST to create, PUT/PATCH to update, and DELETE to remove resources.",
        evaluation: { score: 9, feedback: "Accurate HTTP verb mapping and architectural understanding." }
      },
      {
        question: "Explain the JavaScript event loop and asynchronous execution.",
        answer: "The event loop continuously checks the call stack and microtask/macrotask queues for non-blocking asynchronous execution.",
        evaluation: { score: 9, feedback: "Great conceptual understanding of concurrency." }
      },
      {
        question: "How does database indexing work to optimize queries?",
        answer: "Indexing builds balanced B-Trees allowing the database engine to find records quickly avoiding slow full table scans.",
        evaluation: { score: 8, feedback: "Good conceptual clarity on lookup efficiency." }
      },
      {
        question: "How do you handle authentication in a MERN stack application?",
        answer: "Using JWT tokens stored securely and verified through Express middleware on protected API endpoints.",
        evaluation: { score: 9, feedback: "Standard enterprise security implementation." }
      }
    ]
  },
  {
    id: "INT-8415",
    date: "2026-10-21",
    role: "Frontend Developer",
    experience: "Fresher",
    score: 7.6,
    percentage: 76,
    totalQuestions: 5,
    answeredQuestions: 5,
    status: "Competent",
    results: [
      {
        question: "Explain CSS Flexbox vs Grid.",
        answer: "Flexbox is one-dimensional for rows or columns, whereas CSS Grid is two-dimensional for complex grid systems.",
        evaluation: { score: 8, feedback: "Accurate dimensional distinction." }
      },
      {
        question: "What is the Virtual DOM in React?",
        answer: "An in-memory representation of the real DOM used to calculate minimal re-renders via reconciliation diffing.",
        evaluation: { score: 8, feedback: "Clear explanation of diffing algorithm." }
      },
      {
        question: "What are React Hooks?",
        answer: "Functions that let you use state and lifecycle features without writing class components.",
        evaluation: { score: 8, feedback: "Solid definition." }
      },
      {
        question: "Difference between let, const, and var in JavaScript.",
        answer: "var is function-scoped and hoisted, while let and const are block-scoped. const variables cannot be reassigned.",
        evaluation: { score: 8, feedback: "Correct scope explanation." }
      },
      {
        question: "What is responsive web design?",
        answer: "Designing pages using media queries and fluid layouts to look great on all device screens.",
        evaluation: { score: 6, feedback: "Basic answer. Could mention mobile-first principles." }
      }
    ]
  },
  {
    id: "INT-7890",
    date: "2026-10-18",
    role: "Backend Developer",
    experience: "Fresher",
    score: 6.8,
    percentage: 68,
    totalQuestions: 5,
    answeredQuestions: 4,
    status: "Competent",
    results: [
      {
        question: "What is middleware in Express?",
        answer: "Functions that have access to req, res, and next objects to execute code, validate tokens, or parse bodies.",
        evaluation: { score: 8, feedback: "Accurate middleware lifecycle description." }
      },
      {
        question: "Difference between SQL and NoSQL databases.",
        answer: "SQL is relational with fixed schemas, while NoSQL is document-based and schema-flexible.",
        evaluation: { score: 7, feedback: "Good basic comparison." }
      },
      {
        question: "How to handle errors in Node.js?",
        answer: "Using centralized error-handling middleware with err, req, res, next parameters.",
        evaluation: { score: 7, feedback: "Correct middleware pattern." }
      },
      {
        question: "What is CORS?",
        answer: "Cross-Origin Resource Sharing security mechanism restricting HTTP requests from foreign origins.",
        evaluation: { score: 7, feedback: "Clear security definition." }
      }
    ]
  }
];
