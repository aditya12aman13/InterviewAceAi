const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
      default: "",
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const qaResultSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      default: "",
    },
    evaluation: {
      type: evaluationSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    sessionId: {
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
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    role: {
      type: String,
      default: "Full Stack Developer",
    },
    experience: {
      type: String,
      default: "Fresher",
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Strong Hire", "Competent", "Needs Practice", "Completed"],
      default: "Competent",
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    answeredQuestions: {
      type: Number,
      default: 5,
    },
    results: {
      type: [qaResultSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
