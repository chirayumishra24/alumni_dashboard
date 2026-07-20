/* eslint-disable */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BarChart3, Star, MessageCircle } from "lucide-react";

import NetworkStats from "./NetworkStats";
import IndustryDistribution from "./IndustryDistribution";
import AlumniOfTheMonth from "./AlumniOfTheMonth";
import SpotlightVideos from "./SpotlightVideos";
import AlumniTestimonials from "./AlumniTestimonials";
import CountdownBanner from "./CountdownBanner";
import PerspectiveSimulator, { AlumniProfile, MentorshipRequest } from "./PerspectiveSimulator";

const TABS = [
  { id: "directory", label: "Directory", icon: <Search size={14} /> },
  { id: "insights", label: "Insights", icon: <BarChart3 size={14} /> },
  { id: "spotlight", label: "Spotlight", icon: <Star size={14} /> },
  { id: "community", label: "Community", icon: <MessageCircle size={14} /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ExploreHubProps {
  // Stats
  stats: {
    iitAiims: number;
    outsideIndia: number;
    government: number;
    topCompanies: { name: string; count: number }[];
  };

  // Directory / PerspectiveSimulator props
  viewMode: "directory" | "student" | "mentor";
  setViewMode: (mode: "directory" | "student" | "mentor") => void;
  alumni: AlumniProfile[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  schoolFilter: string;
  setSchoolFilter: (filter: string) => void;
  batchFilter: string;
  setBatchFilter: (filter: string) => void;
  batchYears: string[];
  filteredAlumni: AlumniProfile[];
  paginatedAlumni: AlumniProfile[];
  selectedAlumni: AlumniProfile | null;
  setSelectedAlumni: (alum: AlumniProfile | null) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  context?: "dashboard" | "CCHS" | "CCWS" | "CCIS";

  // Mentorship
  selectedMentorForReq: AlumniProfile | null;
  setSelectedMentorForReq: (mentor: AlumniProfile | null) => void;
  studentReqForm: { name: string; email: string; notes: string };
  setStudentReqForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; notes: string }>>;
  submittingMentorshipReq: boolean;
  handleRequestMentorship: (e: React.FormEvent) => Promise<void>;
  simulatedMentor: AlumniProfile | null;
  setSimulatedMentor: (mentor: AlumniProfile | null) => void;
  mentorships: MentorshipRequest[];
  loadingMentorships: boolean;
  actionInProgress: string | null;
  handleUpdateMentorshipStatus: (connectionId: string, status: "ACCEPTED" | "DECLINED") => Promise<void>;

  // Videos
  setActiveVideoId: (id: string | null) => void;
}

export default function ExploreHub(props: ExploreHubProps) {
  const [activeTab, setActiveTab] = useState<TabId>("directory");

  return (
    <section id="explore" className="max-w-7xl mx-auto px-6 md:px-8 pt-8 pb-12 relative z-10">
      {/* Tab Bar */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex p-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-maroon-600 to-navy-700 rounded-xl shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {activeTab === "directory" && (
            <PerspectiveSimulator
              viewMode={props.viewMode}
              setViewMode={props.setViewMode}
              alumni={props.alumni}
              loading={props.loading}
              searchQuery={props.searchQuery}
              setSearchQuery={props.setSearchQuery}
              schoolFilter={props.schoolFilter}
              setSchoolFilter={props.setSchoolFilter}
              batchFilter={props.batchFilter}
              setBatchFilter={props.setBatchFilter}
              batchYears={props.batchYears}
              filteredAlumni={props.filteredAlumni}
              paginatedAlumni={props.paginatedAlumni}
              selectedAlumni={props.selectedAlumni}
              setSelectedAlumni={props.setSelectedAlumni}
              currentPage={props.currentPage}
              setCurrentPage={props.setCurrentPage}
              totalPages={props.totalPages}
              selectedMentorForReq={props.selectedMentorForReq}
              setSelectedMentorForReq={props.setSelectedMentorForReq}
              studentReqForm={props.studentReqForm}
              setStudentReqForm={props.setStudentReqForm}
              submittingMentorshipReq={props.submittingMentorshipReq}
              handleRequestMentorship={props.handleRequestMentorship}
              simulatedMentor={props.simulatedMentor}
              setSimulatedMentor={props.setSimulatedMentor}
              mentorships={props.mentorships}
              loadingMentorships={props.loadingMentorships}
              actionInProgress={props.actionInProgress}
              handleUpdateMentorshipStatus={props.handleUpdateMentorshipStatus}
              context={props.context}
            />
          )}

          {activeTab === "insights" && (
            <div className="space-y-8">
              <NetworkStats stats={props.stats} embedded />
              <IndustryDistribution embedded />
            </div>
          )}

          {activeTab === "spotlight" && (
            <div className="space-y-8">
              <AlumniOfTheMonth embedded />
              <SpotlightVideos setActiveVideoId={props.setActiveVideoId} embedded />
            </div>
          )}

          {activeTab === "community" && (
            <div className="space-y-8">
              <CountdownBanner embedded />
              <AlumniTestimonials embedded />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
