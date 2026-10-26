import { useState, useEffect, useRef } from "react";
import { generateMcqQuestions, saveMcqTestResult } from "../services/api";

const TEST_DURATION_SECONDS = 25 * 60; // 25 minutes = 1500 seconds

export function useMcqTest(userEmail) {
  const [role, setRole] = useState("Full Stack Developer");
  const [experience, setExperience] = useState("Fresher");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex (0-3) }
  const [flagged, setFlagged] = useState({}); // { [questionId]: boolean }
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION_SECONDS);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const timerRef = useRef(null);

  // 25-minute Countdown Timer
  useEffect(() => {
    if (isTestActive && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit when time runs out
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, isSubmitted, questions, answers]);

  const handleAutoSubmit = () => {
    setAutoSubmitted(true);
    finalizeSubmission(true);
  };

  // Start a new test
  const startTest = async (selectedRole = "Full Stack Developer", selectedExp = "Fresher") => {
    setIsLoading(true);
    setRole(selectedRole);
    setExperience(selectedExp);
    setAnswers({});
    setFlagged({});
    setTimeRemaining(TEST_DURATION_SECONDS);
    setCurrentIdx(0);
    setIsSubmitted(false);
    setAutoSubmitted(false);
    setTestResult(null);

    try {
      const response = await generateMcqQuestions({
        role: selectedRole,
        experience: selectedExp,
        count: 30,
      });

      if (response && response.success && Array.isArray(response.questions)) {
        setQuestions(response.questions);
        setIsTestActive(true);
      } else {
        throw new Error(response.error || "Failed to load questions");
      }
    } catch (err) {
      console.warn("Could not generate questions, checking fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectOption = (questionId, optionIndex) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const clearOption = (questionId) => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const goToQuestion = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIdx(idx);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Evaluate answers and save to MongoDB
  const finalizeSubmission = async (isAuto = false) => {
    if (isSubmitted) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    const totalQuestions = questions.length || 30;
    let correctCount = 0;
    let wrongCount = 0;
    let attemptedCount = 0;

    const topicStats = {};

    const detailedAnswers = questions.map((q) => {
      const selected = answers[q.id];
      const isAttempted = typeof selected === "number";
      const isCorrect = isAttempted && selected === q.correctOption;

      if (isAttempted) {
        attemptedCount++;
        if (isCorrect) correctCount++;
        else wrongCount++;
      }

      // Track by topic
      const topic = q.topic || "General";
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0 };
      }
      topicStats[topic].total++;
      if (isCorrect) topicStats[topic].correct++;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedOption: isAttempted ? selected : -1,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
        topic,
      };
    });

    const unansweredCount = totalQuestions - attemptedCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const status =
      percentage >= 80 ? "Top Performer" : percentage >= 60 ? "Passed" : "Needs Review";

    const topicBreakdown = Object.keys(topicStats).map((topic) => ({
      topic,
      total: topicStats[topic].total,
      correct: topicStats[topic].correct,
      percentage: Math.round((topicStats[topic].correct / topicStats[topic].total) * 100),
    }));

    const timeSpent = TEST_DURATION_SECONDS - timeRemaining;

    const resultPayload = {
      testId: `MCQ-${Math.floor(1000 + Math.random() * 9000)}`,
      userEmail: userEmail || localStorage.getItem("userEmail") || "candidate@gmail.com",
      role,
      experience,
      date: new Date().toISOString().split("T")[0],
      totalQuestions,
      attemptedQuestions: attemptedCount,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      score: correctCount,
      percentage,
      status,
      timeSpentSeconds: timeSpent,
      topicBreakdown,
      answers: detailedAnswers,
    };

    setTestResult(resultPayload);
    setIsSubmitted(true);
    setIsTestActive(false);

    // Save to MongoDB
    try {
      await saveMcqTestResult(resultPayload);
    } catch (e) {
      console.warn("Could not save MCQ test to MongoDB:", e);
    }

    // Cache locally
    try {
      localStorage.setItem("latestMcqResult", JSON.stringify(resultPayload));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    setIsSubmitting(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return {
    role,
    experience,
    questions,
    currentIdx,
    currentQuestion: questions[currentIdx] || null,
    answers,
    flagged,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isTestActive,
    isLoading,
    isSubmitting,
    isSubmitted,
    autoSubmitted,
    testResult,
    startTest,
    selectOption,
    clearOption,
    toggleFlag,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitTest: () => finalizeSubmission(false),
  };
}
