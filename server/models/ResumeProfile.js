const mongoose = require("mongoose");

const resumeProfileSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fileName: {
      type: String,
      default: "Resume.pdf",
    },
    fileSize: {
      type: String,
      default: "250 KB",
    },
    uploadedDate: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    parsedSkills: {
      type: [String],
      default: [],
    },
    atsScore: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    matchRole: {
      type: String,
      default: "Full Stack Developer",
    },
    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ResumeProfile", resumeProfileSchema);
