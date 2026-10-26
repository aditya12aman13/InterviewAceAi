/**
 * High-quality 30-MCQ question banks categorized by role
 * Used as fallback or instant seed when generating tests
 */

const FULL_STACK_30_MCQ = [
  {
    id: 1,
    topic: "JavaScript",
    question: "What will be the output of `console.log(typeof NaN)` in JavaScript?",
    options: ["'number'", "'NaN'", "'undefined'", "'object'"],
    correctOption: 0,
    explanation: "In JavaScript, NaN (Not-a-Number) is a special numeric value defined by the IEEE 754 floating-point standard, so typeof NaN returns 'number'."
  },
  {
    id: 2,
    topic: "React",
    question: "Which hook should be used to perform side effects such as data fetching or subscriptions in a functional component?",
    options: ["useState", "useEffect", "useMemo", "useCallback"],
    correctOption: 1,
    explanation: "useEffect is designed specifically for managing side effects like API requests, DOM mutations, and subscriptions after rendering."
  },
  {
    id: 3,
    topic: "Node.js",
    question: "What is the primary architectural purpose of the Node.js Event Loop?",
    options: [
      "To execute JavaScript code in multiple parallel OS threads",
      "To coordinate non-blocking asynchronous I/O operations on a single main thread",
      "To compile JavaScript code directly into binary assembly",
      "To handle HTTP request routing automatically without Express"
    ],
    correctOption: 1,
    explanation: "The Node.js event loop enables single-threaded non-blocking I/O by offloading operations to libuv and the system kernel, checking task queues continuously."
  },
  {
    id: 4,
    topic: "MongoDB",
    question: "Which MongoDB index type is most effective for speeding up equality queries on a single field?",
    options: ["Text Index", "Single Field B-Tree Index", "Geospatial Index", "Hashed Wildcard Index"],
    correctOption: 1,
    explanation: "A standard Single Field B-Tree index organizes keys in sorted order, providing O(log N) lookup time for equality and range queries."
  },
  {
    id: 5,
    topic: "Express",
    question: "In Express.js middleware, what happens if neither `next()` is called nor a response (`res.send()`) is sent?",
    options: [
      "The server restarts automatically",
      "The client request hangs indefinitely until a timeout occurs",
      "Express throws an unhandled middleware exception",
      "The request is passed to the next route handler automatically"
    ],
    correctOption: 1,
    explanation: "If middleware does not call next() or terminate the request-response cycle by sending a response, the client HTTP connection remains open and hangs."
  },
  {
    id: 6,
    topic: "JavaScript",
    question: "What is the difference between `==` and `===` in JavaScript?",
    options: [
      "`==` compares value without type coercion, while `===` coerces types",
      "`===` checks both value and type equality without coercion, while `==` allows type coercion",
      "There is no difference in ES6+",
      "`===` is only used for comparing Objects and Arrays"
    ],
    correctOption: 1,
    explanation: "The strict equality operator `===` checks both the data type and value without performing implicit type conversion."
  },
  {
    id: 7,
    topic: "React",
    question: "Why should `key` props be unique among sibling elements when rendering lists in React?",
    options: [
      "To allow CSS selectors to style list items easily",
      "To help React's reconciliation diffing algorithm identify which items changed, added, or removed",
      "To enable automatic indexing in state variables",
      "Keys are optional and provide no reconciliation benefit"
    ],
    correctOption: 1,
    explanation: "Keys provide persistent identity across re-renders, enabling React to reuse existing DOM nodes efficiently during reconciliation."
  },
  {
    id: 8,
    topic: "REST APIs",
    question: "Which HTTP status code should be returned when a resource is successfully created via a POST request?",
    options: ["200 OK", "201 Created", "204 No Content", "202 Accepted"],
    correctOption: 1,
    explanation: "HTTP 201 Created signifies that the request succeeded and led to the creation of a new resource, often returning the URI in the Location header."
  },
  {
    id: 9,
    topic: "Security",
    question: "Where is the most secure place to store JWT tokens in a web application to prevent XSS attacks?",
    options: [
      "localStorage",
      "sessionStorage",
      "HttpOnly, Secure, SameSite Cookie",
      "Global JavaScript window object"
    ],
    correctOption: 2,
    explanation: "HttpOnly cookies cannot be accessed by client-side JavaScript (`document.cookie`), effectively protecting the token from Cross-Site Scripting (XSS) theft."
  },
  {
    id: 10,
    topic: "JavaScript",
    question: "What is a JavaScript Closure?",
    options: [
      "A function combined with references to its surrounding lexical environment",
      "A method used to close a database connection",
      "A syntax error caused by missing closing curly braces",
      "A technique to convert synchronous functions into Promises"
    ],
    correctOption: 0,
    explanation: "A closure gives an inner function access to an outer function's scope even after the outer function has returned."
  },
  {
    id: 11,
    topic: "CSS",
    question: "In CSS Flexbox, which property defines how a flex container distributes space along the main axis?",
    options: ["align-items", "justify-content", "flex-direction", "align-content"],
    correctOption: 1,
    explanation: "justify-content aligns flex items along the main axis (horizontal by default for row layout)."
  },
  {
    id: 12,
    topic: "React",
    question: "What does the `useMemo` hook do?",
    options: [
      "Caches the memoized return value of a calculation between renders",
      "Memoizes a callback function definition",
      "Saves state into browser localStorage",
      "Creates a mutable reference that does not cause re-renders"
    ],
    correctOption: 0,
    explanation: "useMemo caches the result of an expensive calculation and only recalculates it when one of its specified dependencies changes."
  },
  {
    id: 13,
    topic: "Node.js",
    question: "Which core Node.js module handles streaming file reading and writing?",
    options: ["http", "fs", "path", "stream"],
    correctOption: 1,
    explanation: "The `fs` module (fs.createReadStream / fs.createWriteStream) combined with stream primitives handles file I/O efficiently."
  },
  {
    id: 14,
    topic: "Git",
    question: "What does `git pull` actually do behind the scenes?",
    options: [
      "`git fetch` followed by `git merge`",
      "`git clone` followed by `git checkout`",
      "`git commit` followed by `git push`",
      "`git add` followed by `git rebase`"
    ],
    correctOption: 0,
    explanation: "git pull fetches commits from the remote repository and immediately merges them into the current active branch."
  },
  {
    id: 15,
    topic: "MongoDB",
    question: "Which MongoDB aggregation pipeline stage is used to filter documents similar to a `WHERE` clause in SQL?",
    options: ["$group", "$project", "$match", "$lookup"],
    correctOption: 2,
    explanation: "The `$match` pipeline stage filters documents to allow only those matching the specified condition(s) to pass to the next stage."
  },
  {
    id: 16,
    topic: "System Design",
    question: "What is the primary benefit of deploying a Reverse Proxy like Nginx in front of a Node.js web server?",
    options: [
      "To compile JavaScript into faster machine code",
      "To handle SSL termination, load balancing, gzip compression, and static asset caching",
      "To automatically write database schema migrations",
      "To replace the need for Express routing"
    ],
    correctOption: 1,
    explanation: "Nginx acts as a high-performance reverse proxy that handles TLS/SSL offloading, static files, and distributes traffic across multiple Node.js worker processes."
  },
  {
    id: 17,
    topic: "JavaScript",
    question: "What does `Promise.all([p1, p2, p3])` do if `p2` rejects?",
    options: [
      "It waits for p1 and p3 to complete and returns only their results",
      "It immediately rejects with the reason of p2",
      "It retries p2 three times before failing",
      "It resolves with undefined for p2"
    ],
    correctOption: 1,
    explanation: "Promise.all has fail-fast behavior: if any promise in the array rejects, the entire returned promise immediately rejects with that error."
  },
  {
    id: 18,
    topic: "React",
    question: "What is the key advantage of React 19 Actions and the `useActionState` hook?",
    options: [
      "Eliminates the need for CSS",
      "Simplifies handling pending states, errors, optimistic updates, and form submissions automatically",
      "Replaces all Redux stores with browser cookies",
      "Allows running backend Node.js code inside client components"
    ],
    correctOption: 1,
    explanation: "React 19 Actions manage async transitions, auto-resetting form fields and handling pending indicators and optimistic states natively."
  },
  {
    id: 19,
    topic: "HTTP",
    question: "Which HTTP request method is intended to be idempotent according to RFC standards?",
    options: ["POST", "PATCH", "PUT", "CONNECT"],
    correctOption: 2,
    explanation: "PUT is idempotent: sending the same PUT request multiple times produces the exact same resource state as making it once."
  },
  {
    id: 20,
    topic: "Database",
    question: "What does the 'A' in ACID database transactions stand for?",
    options: ["Availability", "Atomicity", "Asynchronous", "Authentication"],
    correctOption: 1,
    explanation: "Atomicity ensures that all operations in a transaction succeed completely or all fail and are rolled back ('all or nothing')."
  },
  {
    id: 21,
    topic: "JavaScript",
    question: "What is Event Bubbling in the browser DOM?",
    options: [
      "When events are dispatched from window down to target element",
      "When an event triggers on the deepest target element and bubbles upwards through ancestors",
      "When an event crashes the browser rendering thread",
      "When memory leaks cause multiple event listeners to duplicate"
    ],
    correctOption: 1,
    explanation: "During bubbling, the event first executes on the inner target element, then triggers handlers on parent and ancestor elements up to document."
  },
  {
    id: 22,
    topic: "Node.js",
    question: "What does the `cluster` module in Node.js allow you to do?",
    options: [
      "Connect multiple separate MongoDB clusters together",
      "Fork multiple worker processes sharing the same server port to utilize multi-core CPUs",
      "Bundle client frontend code using Webpack",
      "Group multiple git commits into one release tag"
    ],
    correctOption: 1,
    explanation: "Because Node is single-threaded, cluster.fork() spawns worker processes per CPU core that share incoming connection sockets."
  },
  {
    id: 23,
    topic: "React",
    question: "What is the Virtual DOM and why does React use it?",
    options: [
      "A copy of the actual DOM in browser memory used to minimize slow direct real DOM manipulations",
      "A 3D graphics rendering canvas for React applications",
      "A database stored in indexedDB",
      "A headless browser used only for automated testing"
    ],
    correctOption: 0,
    explanation: "The Virtual DOM is a lightweight JavaScript representation of UI; React calculates minimal diffs before updating the real DOM efficiently."
  },
  {
    id: 24,
    topic: "Security",
    question: "What is CORS (Cross-Origin Resource Sharing)?",
    options: [
      "A browser security mechanism that restricts cross-origin HTTP requests unless permitted by server headers",
      "A database encryption algorithm",
      "A JavaScript compression tool",
      "A CSS styling framework"
    ],
    correctOption: 0,
    explanation: "CORS uses HTTP headers (such as Access-Control-Allow-Origin) to tell browsers whether a web app running at one origin has permission to access resources from a different origin."
  },
  {
    id: 25,
    topic: "MongoDB",
    question: "What is a replica set in MongoDB primarily used for?",
    options: [
      "High availability, automatic failover, and data redundancy",
      "Distributing queries across sharded clusters",
      "Generating mock test data",
      "Running machine learning models"
    ],
    correctOption: 0,
    explanation: "A MongoDB replica set is a group of mongod instances that maintain the same data set, providing redundancy and high availability with automatic failover."
  },
  {
    id: 26,
    topic: "JavaScript",
    question: "What is the result of `0.1 + 0.2 === 0.3` in JavaScript?",
    options: ["true", "false", "undefined", "TypeError"],
    correctOption: 1,
    explanation: "Due to binary IEEE 754 floating-point representation, 0.1 + 0.2 results in 0.30000000000000004, so strict equality returns false."
  },
  {
    id: 27,
    topic: "Express",
    question: "Which middleware is typically used to parse JSON bodies in Express 4.16+ / Express 5?",
    options: ["express.bodyParser()", "express.json()", "express.multipart()", "express.text()"],
    correctOption: 1,
    explanation: "express.json() is built directly into Express to parse incoming requests with JSON payloads based on body-parser."
  },
  {
    id: 28,
    topic: "System Design",
    question: "What is horizontal scaling vs vertical scaling?",
    options: [
      "Horizontal is adding more machines/nodes; Vertical is adding more RAM/CPU to an existing machine",
      "Horizontal is adding RAM; Vertical is adding disk space",
      "Horizontal is frontend development; Vertical is backend development",
      "There is no difference in cloud computing"
    ],
    correctOption: 0,
    explanation: "Horizontal scaling ('scale out') adds more instances or containers, whereas vertical scaling ('scale up') increases horsepower on a single server."
  },
  {
    id: 29,
    topic: "Web Performance",
    question: "What is Debouncing in JavaScript?",
    options: [
      "Limiting the rate at which a function executes by delaying execution until a period of inactivity passes",
      "Executing a function immediately on every single keystroke",
      "Removing duplicate records from an array",
      "Clearing the browser local storage automatically"
    ],
    correctOption: 0,
    explanation: "Debouncing ensures that a function (like search input autocomplete) is only called after a specified delay since the user stopped typing."
  },
  {
    id: 30,
    topic: "Git",
    question: "What is the command to create and immediately switch to a new branch named `feature-auth`?",
    options: [
      "git branch -c feature-auth",
      "git checkout -b feature-auth (or git switch -c feature-auth)",
      "git new feature-auth",
      "git push origin feature-auth"
    ],
    correctOption: 1,
    explanation: "`git checkout -b <name>` or modern `git switch -c <name>` creates the branch and switches your HEAD to it in one command."
  }
];

function getRoleQuestions(role = "Full Stack Developer") {
  // Can filter or adapt based on role
  return FULL_STACK_30_MCQ;
}

module.exports = { FULL_STACK_30_MCQ, getRoleQuestions };
