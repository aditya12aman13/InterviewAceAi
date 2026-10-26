import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import OverviewTab from "./components/dashboard/OverviewTab";
import HistoryTab from "./components/dashboard/HistoryTab";
import ResumeTab from "./components/dashboard/ResumeTab";
import ProfileTab from "./components/dashboard/ProfileTab";
import InterviewDetailModal from "./components/modals/InterviewDetailModal";
import ProfileEditModal from "./components/modals/ProfileEditModal";

import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { useInterviewHistory } from "./hooks/useInterviewHistory";
import { useResumeParser } from "./hooks/useResumeParser";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "history" | "resume" | "profile"
  const [inspectingInterview, setInspectingInterview] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Custom Hooks managing specialized state logic synced with MongoDB
  const { userEmail } = useAuth();
  const { profile, updateProfile, resetToDefault, completeness, isDbSynced: isProfileSynced } = useProfile(userEmail);
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
    isDbSynced: isHistorySynced,
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
    isDbSynced: isResumeSynced,
  } = useResumeParser(userEmail);

  // Tab navigation config
  const navTabs = [
    { id: "overview", label: "📊 Overview", count: null },
    { id: "history", label: "📂 Interview History", count: stats.totalSessions },
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
