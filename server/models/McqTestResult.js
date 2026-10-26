const mongoose = require("mongoose");

const mcqAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: Number, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    selectedOption: { type: Number, default: -1 }, // 0, 1, 2, 3 or -1 for unattempted
    correctOption: { type: Number, required: true }, // 0, 1, 2, 3
    isCorrect: { type: Boolean, default: false },
    explanation: { type: String, default: "" },
    topic: { type: String, default: "General" },
  },
  { _id: false }
);

const topicBreakdownSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    total: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
  },
  { _id: false }
);

const mcqTestResultSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      default: "Full Stack Developer",
    },
    experience: {
      type: String,
      default: "Fresher",
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    totalQuestions: {
      type: Number,
      default: 30,
    },
    attemptedQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    unanswered: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Top Performer", "Passed", "Needs Review", "Completed"],
      default: "Completed",
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    topicBreakdown: {
      type: [topicBreakdownSchema],
      default: [],
    },
    answers: {
      type: [mcqAnswerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("McqTestResult", mcqTestResultSchema);
