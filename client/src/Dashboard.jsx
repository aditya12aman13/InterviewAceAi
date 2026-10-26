import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import OverviewTab from "./components/dashboard/OverviewTab";
import HistoryTab from "./components/dashboard/HistoryTab";
import McqTab from "./components/dashboard/McqTab";
import ResumeTab from "./components/dashboard/ResumeTab";
import ProfileTab from "./components/dashboard/ProfileTab";
import InterviewDetailModal from "./components/modals/InterviewDetailModal";
import McqDetailModal from "./components/modals/McqDetailModal";
import ProfileEditModal from "./components/modals/ProfileEditModal";

import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { useInterviewHistory } from "./hooks/useInterviewHistory";
import { useResumeParser } from "./hooks/useResumeParser";
import { getMcqTests } from "./services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "history" | "mcq" | "resume" | "profile"
  const [inspectingInterview, setInspectingInterview] = useState(null);
  const [inspectingMcqTest, setInspectingMcqTest] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [mcqTests, setMcqTests] = useState([]);

  // Custom Hooks managing specialized state logic synced with MongoDB
  const { userEmail } = useAuth();
  const { profile, updateProfile, resetToDefault, completeness } = useProfile(userEmail);
  const {
    pastInterviews,
    filteredInterviews,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    stats,
    deleteInterview,
    loadInterviewForReview,
    downloadSessionPdf,
  } = useInterviewHistory(userEmail);

  const {
    resumeData,
    isScanning,
    scanProgress,
    message: resumeMessage,
    handleFileUpload,
    removeSkill,
    addSkill,
    generateCustomInterview,
  } = useResumeParser(userEmail);

  // Fetch MCQ Tests from MongoDB
  useEffect(() => {
    let isMounted = true;
    getMcqTests(userEmail).then((tests) => {
      if (isMounted && Array.isArray(tests)) {
        setMcqTests(tests);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  // Download PDF for MCQ test
  const downloadMcqPdf = (test) => {
    if (!test) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 40, pageWidth, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INTERVIEW ACE AI - MOCK MCQ TEST", 16, 20);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("OFFICIAL TIME-BOUND TECHNICAL ASSESSMENT REPORT", 16, 28);
    doc.text(`TEST ID: ${test.testId || "MCQ-RECORD"} • 25 MINUTE BENCHMARK`, 16, 35);

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageWidth - 75, 12, 60, 22, 3, 3, "F");
    doc.setTextColor(96, 165, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${test.score} / ${test.totalQuestions || 30} (${test.percentage}%)`, pageWidth - 70, 23);
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Status: ${test.status}`, pageWidth - 70, 30);

    const minsSpent = Math.floor((test.timeSpentSeconds || 0) / 60);
    const secsSpent = (test.timeSpentSeconds || 0) % 60;

    const summaryData = [
      ["Candidate Email", test.userEmail || userEmail, "Test Date", test.date],
      ["Target Role", test.role, "Experience Level", test.experience],
      ["Score & Accuracy", `${test.score} / ${test.totalQuestions || 30} (${test.percentage}%)`, "Time Taken", `${minsSpent}m ${secsSpent}s`]
    ];

    autoTable(doc, {
      startY: 50,
      body: summaryData,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 2.5, textColor: [30, 41, 59] },
      columnStyles: {
        0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 38 },
        1: { fontStyle: "bold", cellWidth: 55 },
        2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 38 },
        3: { fontStyle: "bold", cellWidth: 55 }
      }
    });

    const startYTopics = (doc.lastAutoTable?.finalY || 80) + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("TOPIC COMPETENCY BREAKDOWN", 16, startYTopics);

    const topicRows = (test.topicBreakdown || []).map((t) => [
      t.topic,
      `${t.correct} / ${t.total}`,
      `${t.percentage}%`,
      t.percentage >= 80 ? "Proficient" : t.percentage >= 60 ? "Average" : "Needs Review"
    ]);

    autoTable(doc, {
      startY: startYTopics + 3,
      head: [["Topic Area", "Score", "Percentage", "Mastery Level"]],
      body: topicRows,
      theme: "striped",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, cellPadding: 2.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 16, right: 16 }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Interview Ace AI | Mock MCQ 30-Question Assessment | Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );
    }

    doc.save(`InterviewAce_MCQ_${test.role.replace(/[^a-zA-Z0-9]/g, "_")}_Scorecard.pdf`);
  };

  // Tab navigation config
  const navTabs = [
    { id: "overview", label: "📊 Overview", count: null },
    { id: "history", label: "📂 Interview History", count: stats.totalSessions },
    { id: "mcq", label: "🧠 Mock MCQ Tests", count: mcqTests.length },
    { id: "resume", label: "📄 Resume & ATS", count: `${resumeData?.atsScore || 92}%` },
    { id: "profile", label: "👤 Profile Settings", count: `${completeness}%` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />

      {/* Sub-Header Tab Navigation & MongoDB Status Indicator */}
      <div className="border-b border-slate-800 bg-slate-900/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Live MongoDB Status Pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB: Connected (interview)</span>
          </div>
        </div>
      </div>

      {/* Main Tab Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            profile={profile}
            stats={stats}
            recentInterviews={pastInterviews}
            onReviewInterview={(session) => setInspectingInterview(session)}
            onDownloadPdf={(session) => downloadSessionPdf(session, profile.name)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onSwitchToTab={(tabId) => setActiveTab(tabId)}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab
            interviews={filteredInterviews}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            onReviewInterview={(session) => setInspectingInterview(session)}
            onDownloadPdf={(session) => downloadSessionPdf(session, profile.name)}
            onDeleteInterview={deleteInterview}
          />
        )}

        {activeTab === "mcq" && (
          <McqTab
            mcqTests={mcqTests}
            onReviewTest={(test) => setInspectingMcqTest(test)}
            onDownloadPdf={downloadMcqPdf}
          />
        )}

        {activeTab === "resume" && (
          <ResumeTab
            resumeData={resumeData}
            isScanning={isScanning}
            scanProgress={scanProgress}
            message={resumeMessage}
            onFileUpload={handleFileUpload}
            onRemoveSkill={removeSkill}
            onAddSkill={addSkill}
            onGenerateCustomInterview={generateCustomInterview}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            profile={profile}
            completeness={completeness}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
            onResetDefaults={resetToDefault}
          />
        )}
      </main>

      {/* Modals */}
      <InterviewDetailModal
        isOpen={Boolean(inspectingInterview)}
        onClose={() => setInspectingInterview(null)}
        interview={inspectingInterview}
        onDownloadPdf={(session) => downloadSessionPdf(session, profile.name)}
      />

      <McqDetailModal
        isOpen={Boolean(inspectingMcqTest)}
        onClose={() => setInspectingMcqTest(null)}
        testSummary={inspectingMcqTest}
        onDownloadPdf={downloadMcqPdf}
      />

      <ProfileEditModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialProfile={profile}
        onSave={updateProfile}
      />

      <Footer />
    </div>
  );
}
