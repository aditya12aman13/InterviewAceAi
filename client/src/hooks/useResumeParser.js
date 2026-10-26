import { useState } from "react";
import { DEFAULT_RESUME_DATA } from "../models/skillTaxonomy";

export function useResumeParser() {
  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("resumeData") || "null");
      return saved || DEFAULT_RESUME_DATA;
    } catch {
      return DEFAULT_RESUME_DATA;
    }
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [message, setMessage] = useState("");

  const saveResumeData = (data) => {
    setResumeData(data);
    try {
      localStorage.setItem("resumeData", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to persist resumeData", e);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;

    setIsScanning(true);
    setScanProgress(15);
    setMessage(`Uploading & scanning ${file.name}...`);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setIsScanning(false);

      const parsedSkills = [
        "React.js",
        "JavaScript (ES6+)",
        "Node.js",
        "Express.js",
        "MongoDB",
        "Tailwind CSS",
        "REST APIs",
        "Git & GitHub",
        "System Design",
      ];

      const newResume = {
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        uploadedDate: new Date().toISOString().split("T")[0],
        parsedSkills,
        atsScore: 94,
        matchRole: "Full Stack Engineer",
        recommendations: [
          "Resume passed 94% ATS benchmark for Modern Full-Stack Developer profiles.",
          "Strong keyword density detected for MERN ecosystem and API integration.",
          "High alignment with Junior & Mid-level engineering criteria."
        ]
      };

      saveResumeData(newResume);
      setMessage("Resume parsed successfully!");
      setTimeout(() => setMessage(""), 3500);
    }, 1200);
  };

  const removeSkill = (skillToRemove) => {
    const updated = {
      ...resumeData,
      parsedSkills: resumeData.parsedSkills.filter((s) => s !== skillToRemove),
    };
    saveResumeData(updated);
  };

  const addSkill = (newSkill) => {
    if (!newSkill || !newSkill.trim()) return;
    const clean = newSkill.trim();
    if (resumeData.parsedSkills.includes(clean)) return;

    const updated = {
      ...resumeData,
      parsedSkills: [...resumeData.parsedSkills, clean],
    };
    saveResumeData(updated);
  };

  const generateCustomInterview = (navigate) => {
    const customConfig = {
      role: resumeData.matchRole || "Full Stack Developer",
      experience: "Fresher",
      count: 5,
      type: "technical",
      extractedSkills: resumeData.parsedSkills || [],
    };

    localStorage.setItem("interviewSettings", JSON.stringify(customConfig));
    navigate("/interview");
  };

  return {
    resumeData,
    isScanning,
    scanProgress,
    message,
    handleFileUpload,
    removeSkill,
    addSkill,
    generateCustomInterview,
  };
}
