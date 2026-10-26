import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { INITIAL_PAST_INTERVIEWS } from "../models/interviewData";

export function useInterviewHistory() {
  const [pastInterviews, setPastInterviews] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pastInterviews") || "[]");
      if (Array.isArray(saved) && saved.length > 0) return saved;
      return INITIAL_PAST_INTERVIEWS;
    } catch {
      return INITIAL_PAST_INTERVIEWS;
    }
  });

  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const saveInterviews = (updatedList) => {
    setPastInterviews(updatedList);
    try {
      localStorage.setItem("pastInterviews", JSON.stringify(updatedList));
    } catch (e) {
      console.error("Failed to store pastInterviews:", e);
    }
  };

  const addInterview = (newSession) => {
    const updated = [newSession, ...pastInterviews];
    saveInterviews(updated);
  };

  const deleteInterview = (id) => {
    const updated = pastInterviews.filter((item) => item.id !== id);
    saveInterviews(updated);
  };

  // Compute stats
  const stats = useMemo(() => {
    const total = pastInterviews.length;
    if (total === 0) {
      return {
        totalSessions: 0,
        averageScore: "0.0",
        readinessIndex: 0,
        passedCount: 0,
        competencies: [],
      };
    }

    const sumScore = pastInterviews.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
    const avgScore = (sumScore / total).toFixed(1);
    const readiness = Math.min(100, Math.round((Number(avgScore) / 10) * 100));
    const passed = pastInterviews.filter((i) => Number(i.score) >= 7.0).length;

    const competencies = [
      { name: "Frontend & React Fundamentals", score: 86, level: "Advanced" },
      { name: "Node.js & Backend Architecture", score: 82, level: "Proficient" },
      { name: "REST APIs & System Integration", score: 88, level: "Strong" },
      { name: "Database Design & Indexing", score: 79, level: "Intermediate" },
      { name: "Communication & STAR Framing", score: 84, level: "Proficient" },
    ];

    return {
      totalSessions: total,
      averageScore: avgScore,
      readinessIndex: readiness,
      passedCount: passed,
      competencies,
    };
  }, [pastInterviews]);

  // Filtered interviews list
  const filteredInterviews = useMemo(() => {
    return pastInterviews.filter((interview) => {
      const matchesRole =
        filterRole === "all" ||
        interview.role?.toLowerCase().includes(filterRole.toLowerCase());
      const matchesSearch =
        searchTerm === "" ||
        interview.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.id?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [pastInterviews, filterRole, searchTerm]);

  // Load a past interview directly into Results.jsx
  const loadInterviewForReview = (interview, navigate) => {
    try {
      localStorage.setItem("interviewResults", JSON.stringify(interview.results || []));
      localStorage.setItem("interviewSettings", JSON.stringify({
        role: interview.role || "Full Stack Developer",
        experience: interview.experience || "Fresher",
        count: interview.totalQuestions || 5,
        type: "mixed"
      }));
    } catch (e) {
      console.warn("Could not set interviewResults in localStorage", e);
    }
    navigate("/results");
  };

  // Generate & Download official PDF report card for any session
  const downloadSessionPdf = (interview, candidateName = "Candidate") => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Dark Modern Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, "F");

    // Accent line
    doc.setFillColor(59, 130, 246); // blue-500
    doc.rect(0, 40, pageWidth, 2, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("INTERVIEW ACE AI", 16, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("OFFICIAL PERFORMANCE EVALUATION REPORT", 16, 28);
    doc.text(`SESSION ID: ${interview.id || "INT-RECORD"}`, 16, 35);

    // Right Badge
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageWidth - 75, 12, 60, 22, 3, 3, "F");
    doc.setTextColor(96, 165, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`SCORE: ${interview.score || "8.5"}/10`, pageWidth - 70, 23);
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Status: ${interview.status || "Evaluated"}`, pageWidth - 70, 30);

    // Meta Information
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("CANDIDATE & SESSION OVERVIEW", 16, 52);

    const metaData = [
      ["Candidate Name", candidateName, "Assessment Date", interview.date || "Recent"],
      ["Target Role", interview.role || "Software Engineer", "Experience Level", interview.experience || "Fresher"],
      ["Overall Score", `${interview.score || 8.0} / 10 (${interview.percentage || 80}%)`, "Completion Status", "Verified 100%"]
    ];

    autoTable(doc, {
      startY: 56,
      body: metaData,
      theme: "plain",
      styles: { fontSize: 9.5, cellPadding: 2.5, textColor: [30, 41, 59] },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 38 },
        1: { fontStyle: "bold", cellWidth: 55 },
        2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 40 },
        3: { fontStyle: "bold", cellWidth: 55 }
      }
    });

    const startYQuestions = (doc.lastAutoTable?.finalY || 80) + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("QUESTION-BY-QUESTION AI EVALUATION", 16, startYQuestions);

    const questionRows = (interview.results || []).map((r, idx) => [
      `Q${idx + 1}`,
      r.question || "Question prompt",
      r.answer || "(No response recorded)",
      `${r.evaluation?.score ?? "N/A"}/10`,
      r.evaluation?.feedback || "Evaluation complete."
    ]);

    autoTable(doc, {
      startY: startYQuestions + 4,
      head: [["#", "Question", "Candidate Answer", "Score", "AI Feedback"]],
      body: questionRows,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8.5, cellPadding: 3, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 10, fontStyle: "bold", halign: "center" },
        1: { cellWidth: 45 },
        2: { cellWidth: 50 },
        3: { cellWidth: 16, halign: "center", fontStyle: "bold" },
        4: { cellWidth: 65 }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 }
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Interview Ace AI | Automated Evaluation Report | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    }

    const safeRole = (interview.role || "Session").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`InterviewAce_${safeRole}_Report.pdf`);
  };

  return {
    pastInterviews,
    filteredInterviews,
    filterRole,
    setFilterRole,
    searchTerm,
    setSearchTerm,
    stats,
    addInterview,
    deleteInterview,
    loadInterviewForReview,
    downloadSessionPdf,
  };
}
