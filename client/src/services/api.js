/**
 * API service for communicating with the Node.js/Express + MongoDB backend
 */

const API_BASE_URL = "http://localhost:5001/api";

// Health & DB Connection Check
export async function checkBackendHealth() {
  try {
    const res = await fetch("http://localhost:5001/");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Backend health check failed:", err.message);
    return { success: false, database: { status: "disconnected" } };
  }
}

// 1. Profile APIs
export async function getProfile(email) {
  try {
    const res = await fetch(`${API_BASE_URL}/profile?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.success && data.profile) {
      return data.profile;
    }
    return null;
  } catch (err) {
    console.warn("getProfile API error, falling back to local storage:", err.message);
    return null;
  }
}

export async function saveProfile(profileData) {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("saveProfile API error:", err.message);
    return { success: false, error: err.message };
  }
}

// 2. Interview Sessions APIs
export async function getInterviews(email) {
  try {
    const url = email
      ? `${API_BASE_URL}/interviews?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/interviews`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && Array.isArray(data.interviews)) {
      return data.interviews;
    }
    return null;
  } catch (err) {
    console.warn("getInterviews API error, falling back to local cache:", err.message);
    return null;
  }
}

export async function saveInterviewSession(sessionData) {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("saveInterviewSession API error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteInterviewSession(sessionId) {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("deleteInterviewSession API error:", err.message);
    return { success: false, error: err.message };
  }
}

// 3. Resume & ATS APIs
export async function getResumeData(email) {
  try {
    const res = await fetch(`${API_BASE_URL}/resume?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.success && data.resume) {
      return data.resume;
    }
    return null;
  } catch (err) {
    console.warn("getResumeData API error:", err.message);
    return null;
  }
}

export async function saveResumeData(resumeData) {
  try {
    const res = await fetch(`${API_BASE_URL}/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resumeData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("saveResumeData API error:", err.message);
    return { success: false, error: err.message };
  }
}

// 4. Dynamic MCQ Test APIs (Gemini + MongoDB)
export async function generateMcqQuestions({ role = "Full Stack Developer", experience = "Fresher", count = 30 }) {
  try {
    const res = await fetch(`${API_BASE_URL}/generate-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, experience, count }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("generateMcqQuestions API error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function saveMcqTestResult(testData) {
  try {
    const res = await fetch(`${API_BASE_URL}/mcq-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("saveMcqTestResult API error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function getMcqTests(email) {
  try {
    const url = email
      ? `${API_BASE_URL}/mcq-tests?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/mcq-tests`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && Array.isArray(data.tests)) {
      return data.tests;
    }
    return [];
  } catch (err) {
    console.warn("getMcqTests API error:", err.message);
    return [];
  }
}

export async function getMcqTestById(testId) {
  try {
    const res = await fetch(`${API_BASE_URL}/mcq-tests/${encodeURIComponent(testId)}`);
    const data = await res.json();
    if (data.success && data.test) {
      return data.test;
    }
    return null;
  } catch (err) {
    console.error("getMcqTestById API error:", err.message);
    return null;
  }
}
