const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: "Candidate",
      trim: true,
    },
    targetRole: {
      type: String,
      default: "Full Stack Developer",
      trim: true,
    },
    experience: {
      type: String,
      default: "Fresher (0 years)",
    },
    targetCompanies: {
      type: String,
      default: "Google, Microsoft, Amazon, TCS, Infosys",
    },
    skills: {
      type: String,
      default: "React.js, Node.js, Express, MongoDB, JavaScript, Tailwind CSS, REST APIs, Git",
    },
    bio: {
      type: String,
      default: "Passionate software engineer focused on building robust full-stack web applications with generative AI capabilities.",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    linkedinUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
