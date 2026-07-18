/* eslint-disable */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, RefreshCw, MapPin, Sparkles, Check, X,
  Briefcase, GraduationCap, Landmark, Mail, Calendar, Play
} from "lucide-react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface AlumniProfile {
  id: string;
  userId: string;
  batch: number;
  program: string;
  company: string | null;
  role: string | null;
  industry: string | null;
  country: string;
  city: string;
  skills: string;
  isMentor: boolean;
  profileComplete: number;
  school: string;
  isVerified: boolean;
  user: User;
  phone?: string;
  linkedin?: string;
  bio?: string | null;
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  alumniId: string;
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  student?: {
    id: string;
    user: {
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  };
  alumni?: AlumniProfile;
}

const LinkedinIcon = ({ size = 14, className = "" }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface PerspectiveSimulatorProps {
  viewMode: 'directory' | 'student' | 'mentor';
  setViewMode: (mode: 'directory' | 'student' | 'mentor') => void;
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

  // Student view props
  selectedMentorForReq: AlumniProfile | null;
  setSelectedMentorForReq: (mentor: AlumniProfile | null) => void;
  studentReqForm: { name: string; email: string; notes: string };
  setStudentReqForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; notes: string }>>;
  submittingMentorshipReq: boolean;
  handleRequestMentorship: (e: React.FormEvent) => Promise<void>;

  // Mentor view props
  simulatedMentor: AlumniProfile | null;
  setSimulatedMentor: (mentor: AlumniProfile | null) => void;
  mentorships: MentorshipRequest[];
  loadingMentorships: boolean;
  actionInProgress: string | null;
  handleUpdateMentorshipStatus: (connectionId: string, status: 'ACCEPTED' | 'DECLINED') => Promise<void>;
}

export default function PerspectiveSimulator({
  viewMode,
  setViewMode,
  alumni,
  loading,
  searchQuery,
  setSearchQuery,
  schoolFilter,
  setSchoolFilter,
  batchFilter,
  setBatchFilter,
  batchYears,
  filteredAlumni,
  paginatedAlumni,
  selectedAlumni,
  setSelectedAlumni,
  currentPage,
  setCurrentPage,
  totalPages,
  selectedMentorForReq,
  setSelectedMentorForReq,
  studentReqForm,
  setStudentReqForm,
  submittingMentorshipReq,
  handleRequestMentorship,
  simulatedMentor,
  setSimulatedMentor,
  mentorships,
  loadingMentorships,
  actionInProgress,
  handleUpdateMentorshipStatus,
  context = "dashboard"
}: PerspectiveSimulatorProps) {

  return (
    <main className="max-w-[1550px] mx-auto px-6 md:px-12 pb-20 space-y-8 relative z-10" id="directory">
      
      {/* Sliding Tab Switcher */}
      <div className="flex justify-center p-1.5 bg-white/40 backdrop-blur-xl rounded-2xl max-w-lg mx-auto border border-white/60 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
        <button 
          onClick={() => setViewMode('directory')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.01] ${
            viewMode === 'directory' 
              ? "bg-gradient-to-r from-maroon-600 to-navy-700 text-white shadow-lg shadow-maroon-900/10 border border-white/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
          }`}
        >
          Explore Directory
        </button>
        <button 
          onClick={() => setViewMode('student')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.01] ${
            viewMode === 'student' 
              ? "bg-gradient-to-r from-maroon-600 to-navy-700 text-white shadow-lg shadow-maroon-900/10 border border-white/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
          }`}
        >
          Student View
        </button>
        <button 
          onClick={() => setViewMode('mentor')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.01] ${
            viewMode === 'mentor' 
              ? "bg-gradient-to-r from-maroon-600 to-navy-700 text-white shadow-lg shadow-maroon-900/10 border border-white/10" 
              : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
          }`}
        >
          Mentor View
        </button>
      </div>

      {/* ── 1. EXPLORE DIRECTORY VIEW ────────────────────────────────────────── */}
      {viewMode === 'directory' && (
        <div className="space-y-8 animate-fade-in text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_rgba(15,23,42,0.03)]">
            <div className={`relative ${context !== "dashboard" ? "md:col-span-3" : "md:col-span-2"}`}>
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Search name, skills, role, company..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl pl-10 pr-4 py-3.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none font-semibold bg-white/70 border border-slate-200/50 shadow-inner focus:bg-white focus:border-maroon-600/50 focus:ring-4 focus:ring-maroon-650/5 transition-all duration-300"
              />
            </div>

            {context === "dashboard" && (
              <div>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="w-full rounded-2xl px-4 py-3.5 text-xs text-slate-700 focus:outline-none font-bold bg-white/70 border border-slate-200/50 shadow-inner focus:bg-white focus:border-maroon-600/50 focus:ring-4 focus:ring-maroon-650/5 transition-all duration-300"
                >
                  <option value="All">All School Networks</option>
                  <option value="CCHS">CCHS Network</option>
                  <option value="CCWS">CCWS Network</option>
                </select>
              </div>
            )}

            <div>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full rounded-2xl px-4 py-3.5 text-xs text-slate-700 focus:outline-none font-bold bg-white/70 border border-slate-200/50 shadow-inner focus:bg-white focus:border-maroon-600/50 focus:ring-4 focus:ring-maroon-650/5 transition-all duration-300"
              >
                <option value="All">All Graduation Years</option>
                {batchYears.map(year => (
                  <option key={year} value={year}>Class of {year}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-maroon-600" />
                <span className="text-xs font-semibold tracking-wider text-slate-500">REFRESHING DIRECTORY GRID...</span>
              </div>
            </div>
          ) : (
            <>
              {filteredAlumni.length === 0 ? (
                <div className="text-center py-20 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm">
                  <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">No Alumni Found</span>
                  <p className="text-[11px] text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    const rowsCount = 6;
                    const rows: AlumniProfile[][] = Array.from({ length: rowsCount }, () => []);
                    filteredAlumni.forEach((alum, index) => {
                      rows[index % rowsCount].push(alum);
                    });

                    return (
                      <div className="marquee-container marquee-mask py-4 space-y-6 overflow-hidden">
                        {rows.map((rowItems, rowIndex) => {
                          if (rowItems.length === 0) return null;

                          // Duplicate items to ensure continuity in marquee track
                          const repeatedItems = [];
                          const repeatMultiplier = Math.max(3, Math.ceil(15 / rowItems.length));
                          for (let i = 0; i < repeatMultiplier; i++) {
                            repeatedItems.push(...rowItems);
                          }

                          const directionClass = rowIndex % 2 === 0 ? "marquee-track-right" : "marquee-track-left";

                          return (
                            <div key={rowIndex} className={`${directionClass} gap-6`}>
                              {repeatedItems.map((alum, itemIndex) => (
                                <div 
                                  key={`${alum.id}-${rowIndex}-${itemIndex}`} 
                                  onClick={() => setSelectedAlumni(alum)}
                                  className="group bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 hover:border-maroon-500/30 shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_50px_rgba(107,29,47,0.07)] hover:bg-white/95 transition-all duration-500 overflow-hidden flex flex-col justify-between h-[385px] w-[265px] shrink-0 cursor-pointer relative"
                                >
                                  <div className={`h-1.5 w-full ${alum.school === 'CCHS' ? 'bg-maroon-600' : 'bg-navy-600'}`} />

                                  <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between text-[8px] md:text-[9px] text-slate-450 font-bold uppercase tracking-wider mb-4">
                                        <span className="flex items-center gap-1">
                                          <span className={`w-1.5 h-1.5 rounded-full ${alum.school === 'CCHS' ? 'bg-maroon-500' : 'bg-navy-500'}`} />
                                          {alum.school} Network
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <MapPin size={9} className="text-slate-350" />
                                          <span>{alum.city || 'India'}</span>
                                        </div>
                                      </div>
              
                                      <div className="flex justify-center mb-4">
                                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-maroon-500/10 to-navy-500/10 border border-white/80 shadow-md flex items-center justify-center p-1 z-10">
                                          <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                            <img 
                                              src={alum.user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`} 
                                              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" 
                                              alt={alum.user.name} 
                                            />
                                            <div className="absolute inset-0 bg-[#002147]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center pointer-events-none">
                                              <span className="text-[8px] text-white font-extrabold uppercase tracking-widest text-center px-2 leading-tight">
                                                View Profile
                                              </span>
                                            </div>
                                          </div>
                                          
                                          {alum.isVerified && (
                                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border border-white shadow-md z-20" title="Verified Alumni">
                                              <Sparkles size={8} className="fill-current" />
                                            </div>
                                          )}
                                        </div>
                                      </div>
              
                                      <div className="text-center space-y-1">
                                        <h3 className="font-serif text-sm font-extrabold text-[#6b1d2f] truncate transition-colors group-hover:text-maroon-700">
                                          {alum.user.name}
                                        </h3>
                                        <p className="text-[9px] text-[#001f3f] font-black uppercase tracking-wider truncate mt-0.5">
                                          {alum.role || "Alumni"}
                                        </p>
                                        {alum.company && (
                                          <div className="flex items-center gap-1.5 justify-center mt-1">
                                            <div className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[8px] font-black uppercase text-slate-500 overflow-hidden border border-slate-200 shrink-0">
                                              <img
                                                src={`https://logo.clearbit.com/${alum.company.toLowerCase().replace(/\s+/g, '')}.com`}
                                                onError={(e) => {
                                                  (e.target as HTMLElement).style.display = 'none';
                                                }}
                                                className="w-full h-full object-contain"
                                                alt=""
                                              />
                                              <span className="text-[7.5px]">{alum.company.charAt(0)}</span>
                                            </div>
                                            <p className="text-[8px] text-slate-450 font-bold truncate leading-none">
                                              {alum.company}
                                            </p>
                                          </div>
                                        )}
 
                                        {alum.skills && (
                                          <div className="flex flex-wrap gap-1 justify-center pt-2.5">
                                            {alum.skills.split(',').slice(0, 2).map((skill: string, i: number) => (
                                              <span key={i} className="text-[8px] font-black bg-maroon-500/5 border border-maroon-500/10 text-maroon-700 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                                                {skill.trim()}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
              
                                    <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2 mt-4 text-center italic font-medium">
                                      &ldquo;{alum.bio || "Proud graduate of Cambridge Court."}&rdquo;
                                    </p>
                                  </div>
              
                                  <div 
                                    onClick={(e) => e.stopPropagation()}
                                    className="border-t border-slate-100 px-6 py-4 flex items-center justify-center gap-5 bg-slate-50/40"
                                  >
                                    {alum.user.email && (
                                      <a href={`mailto:${alum.user.email}`} className="text-slate-400 hover:text-[#6b1d2f] transition-colors" title="Email Address">
                                        <Mail size={13} className="stroke-[2.5]" />
                                      </a>
                                    )}
                                    {alum.linkedin && (
                                      <a href={alum.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#6b1d2f] transition-colors" title="LinkedIn Profile">
                                        <LinkedinIcon size={12} className="stroke-[2.5]" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && viewMode !== 'directory' && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button 
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button 
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition-all duration-200 ${
                        currentPage === idx + 1 
                          ? "bg-gradient-to-r from-maroon-600 to-navy-700 text-white shadow-md scale-105 border border-white/15" 
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── 2. STUDENT VIEW (Mentorship Hub) ─────────────────────────────────── */}
      {viewMode === 'student' && (
        <div className="space-y-8 animate-fade-in text-left">
          <div className="glass-panel p-8 text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-705 uppercase tracking-wider">
              <Sparkles size={11} className="fill-current animate-pulse" /> Find a Mentor
            </span>
            <h3 className="text-2xl font-serif font-black text-slate-900">Academic &amp; Career Mentorship Hub</h3>
            <p className="text-xs text-slate-550 max-w-xl mx-auto leading-relaxed">
              Connect directly with CCHS &amp; CCWS alumni placed at elite institutions and corporations. Request 1-on-1 career guidance, portfolio reviews, and university planning.
            </p>
          </div>

          {/* List Mentors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {alumni.map((alum) => {
              const isMentor = alum.isMentor || alum.skills.toLowerCase().includes("mentor") || alum.batch < 2020;
              if (!isMentor) return null;

              return (
                <motion.div
                  key={alum.id}
                  whileHover={{ y: -5 }}
                  className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 hover:border-maroon-500/30 p-6 flex flex-col justify-between h-[355px] shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_50px_rgba(107,29,47,0.07)] hover:bg-white/95 transition-all duration-500 relative overflow-hidden text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[8px] font-extrabold uppercase text-slate-450 tracking-wider">
                      <span>Class of {alum.batch || '2016'}</span>
                      <span className={`px-2 py-0.5 rounded-full ${alum.school === 'CCHS' ? 'bg-maroon-50 text-maroon-700' : 'bg-navy-50 text-navy-700'}`}>
                        {alum.school} Network
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <img 
                        src={alum.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.user.name)}`}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                        alt={alum.user.name} 
                      />
                      <div className="text-left min-w-0">
                        <h4 className="font-serif text-sm font-bold text-[#6b1d2f] truncate">{alum.user.name}</h4>
                        <span className="block text-[9px] text-[#001f3f] font-black uppercase tracking-wider truncate">{alum.role || 'Alumni'}</span>
                        <span className="block text-[8px] text-slate-400 font-bold truncate">{alum.company || 'Global Lead'}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Fields of Guidance:</span>
                      <div className="flex flex-wrap gap-1">
                        {alum.skills.split(',').slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[9px] bg-maroon-500/5 border border-maroon-500/10 text-maroon-700 font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 italic font-medium">
                      &ldquo;{alum.bio || "Available to review CVs and provide interview guidance."}&rdquo;
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedMentorForReq(alum)}
                    className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-maroon-600 to-navy-700 hover:from-maroon-500 hover:to-navy-600 text-white font-extrabold text-[10px] uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Sparkles size={11} className="text-amber-350 fill-current" />
                    <span>Request Mentorship</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. MENTOR PORTAL VIEW ───────────────────────────────────────────── */}
      {viewMode === 'mentor' && (
        <div className="space-y-8 animate-fade-in text-left">
          {!simulatedMentor ? (
            <div className="p-12 text-center space-y-6 max-w-xl mx-auto rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_15px_45px_rgba(15,23,42,0.04)]">
              <div className="p-4.5 bg-maroon-50 rounded-full inline-block text-maroon-700 border border-maroon-100/50">
                <Landmark size={28} />
              </div>
              <div className="space-y-2.5">
                <h3 className="text-xl font-serif font-black text-slate-950">Mentor Workstation Portal</h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                  Select a verified alumni profile from the list below to enter your simulated workstation. Manage student requests and details.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider block text-left">Choose Mentor Profile to Simulate:</label>
                <select
                  onChange={(e) => {
                    const alum = alumni.find(a => a.id === e.target.value);
                    if (alum) setSimulatedMentor(alum);
                  }}
                  defaultValue=""
                  className="w-full bg-white/70 border border-slate-200/50 rounded-xl px-4 py-3.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-maroon-700/50 shadow-inner focus:ring-4 focus:ring-maroon-650/5 transition-all"
                >
                  <option value="" disabled>-- Select Profile --</option>
                  {alumni.map(a => (
                    <option key={a.id} value={a.id}>{a.user.name} ({a.company || 'Alumni'})</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side: Profile details */}
              <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 space-y-6 shadow-[0_10px_30px_rgba(15,23,42,0.02)]">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-bold text-emerald-700 uppercase tracking-wider">
                    Simulated Workspace Active
                  </span>
                  <button 
                    onClick={() => setSimulatedMentor(null)}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-655 transition-colors uppercase tracking-wider"
                  >
                    Logout
                  </button>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                  <img 
                    src={simulatedMentor.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(simulatedMentor.user.name)}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 shadow-md animate-fade-in"
                    alt={simulatedMentor.user.name} 
                  />
                  <div>
                    <h4 className="font-serif text-lg font-bold text-slate-900">{simulatedMentor.user.name}</h4>
                    <p className="text-xs text-slate-550 font-medium">{simulatedMentor.role} at {simulatedMentor.company || 'Global Lead'}</p>
                  </div>
                </div>

                {/* completeness bar */}
                <div className="space-y-1.5 border-t border-b border-slate-100/60 py-4">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-450 tracking-wider">
                    <span>Profile Completeness</span>
                    <span>{simulatedMentor.profileComplete}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-maroon-600 to-navy-750 h-full rounded-full animate-pulse-glow" style={{ width: `${simulatedMentor.profileComplete}%` }} />
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-0.5">
                    <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">E-mail:</span>
                    <span className="font-bold text-slate-700">{simulatedMentor.user.email || '—'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Campus network:</span>
                    <span className="font-bold text-slate-700">{simulatedMentor.school === 'CCHS' ? 'Cambridge Court High School' : 'Cambridge Court World School'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Batch graduation:</span>
                    <span className="font-bold text-slate-700">Class of {simulatedMentor.batch}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Received Mentorship Connections */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow flex justify-between items-center">
                  <div>
                    <h4 className="font-serif text-md font-bold">Received Requests Dashboard</h4>
                    <p className="text-[10px] text-slate-400">Manage pending 1-on-1 mentorship connects received from current students.</p>
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold">
                    Total: {mentorships.filter(m => m.alumniId === simulatedMentor.id).length}
                  </div>
                </div>

                {loadingMentorships ? (
                  <div className="text-center py-12 bg-white rounded-[2rem] border border-slate-100">
                    <RefreshCw className="animate-spin text-maroon-700 mx-auto" size={20} />
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-2 block">Loading pending connects...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mentorships.filter(m => m.alumniId === simulatedMentor.id).length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 space-y-2">
                        <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">No Connect Requests</span>
                        <p className="text-[11px] text-slate-500">You haven't received any student mentorship requests yet.</p>
                      </div>
                    ) : (
                      mentorships.filter(m => m.alumniId === simulatedMentor.id).map((req) => (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                        >
                          <div className="space-y-2 flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <h5 className="font-serif text-sm font-bold text-[#001f3f]">{req.student?.user?.name || req.studentId}</h5>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                req.status === 'PENDING' 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : req.status === 'ACCEPTED'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {req.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-605 bg-slate-50 p-3.5 rounded-xl border border-slate-100 italic leading-relaxed">
                              &ldquo;{req.notes || "No notes provided by student."}&rdquo;
                            </p>

                            <span className="block text-[9px] text-slate-400 font-bold font-sans">
                              Received on: {new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                          </div>

                          {req.status === 'PENDING' && (
                            <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                              <button
                                disabled={actionInProgress === req.id}
                                onClick={() => handleUpdateMentorshipStatus(req.id, 'ACCEPTED')}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-605 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98] border border-transparent shadow-sm"
                              >
                                {actionInProgress === req.id ? 'Loading...' : 'Accept'}
                              </button>
                              <button
                                disabled={actionInProgress === req.id}
                                onClick={() => handleUpdateMentorshipStatus(req.id, 'DECLINED')}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 border border-slate-200"
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {req.status === 'ACCEPTED' && (
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Connection Active</span>
                              <a href={`mailto:${req.student?.user?.email}`} className="text-[9px] text-slate-500 hover:text-slate-700 underline font-semibold mt-1 block">Email Mentee</a>
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: ALUMNI INDIVIDUAL DETAIL CARD ================= */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl p-4 animate-fade-in" data-lenis-prevent>
          <div className="w-full max-w-sm rounded-[3rem] bg-white/90 border border-white p-8 shadow-2xl space-y-6 relative animate-scale-in text-slate-800 text-left">
            <button 
              onClick={() => setSelectedAlumni(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all duration-200 cursor-pointer hover:scale-108 active:scale-95"
              aria-label="Close details"
            >
              <X size={14} />
            </button>

            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-maroon-500/10 to-navy-500/10 border border-white shadow-md flex items-center justify-center p-1.5 mb-4 z-10">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img 
                    src={selectedAlumni.user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`} 
                    className="w-full h-full object-cover" 
                    alt={selectedAlumni.user.name} 
                  />
                </div>
                {selectedAlumni.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border border-white shadow-md z-20">
                    <Sparkles size={8} className="fill-current" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-1.5 w-full">
                <h3 className="font-serif text-lg font-black text-slate-900 leading-tight">
                  {selectedAlumni.user.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                  selectedAlumni.school === 'CCHS' ? 'bg-violet-50 text-violet-750 border-violet-100/50' : 'bg-emerald-50 text-emerald-750 border-emerald-100/50'
                }`}>
                  {selectedAlumni.school} Alumni Network
                </span>
                
                <div className="space-y-1 pt-4 text-xs font-semibold text-slate-650">
                  <div className="flex items-center justify-center gap-1.5">
                    <Briefcase size={12} className="text-slate-400 shrink-0" />
                    <span>{selectedAlumni.role || "Graduate"}</span>
                    {selectedAlumni.company && (
                      <>
                        <span className="text-slate-300">at</span>
                        <span className="text-slate-800 font-extrabold">{selectedAlumni.company}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>Located in {selectedAlumni.city || "Jaipur, India"}</span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5">
                    <GraduationCap size={12} className="text-slate-400 shrink-0" />
                    <span>Class of {selectedAlumni.batch} ({selectedAlumni.program})</span>
                  </div>
                </div>
              </div>

              <div className="w-16 h-[3px] bg-gradient-to-r from-[#6b1d2f] to-[#d4af37] rounded-full mx-auto my-5 opacity-80" />

              <div className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-center max-h-[165px] overflow-y-auto pr-1 no-scrollbar italic px-2 font-medium">
                {selectedAlumni.bio || selectedAlumni.skills}
              </div>

              <div className="border-t border-slate-100/80 pt-6 mt-6 flex flex-col gap-3 w-full items-center">
                {selectedAlumni.user.email && (
                  <a 
                    href={`mailto:${selectedAlumni.user.email}`} 
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-maroon-600 to-navy-700 hover:from-maroon-500 hover:to-navy-600 text-white font-extrabold text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer"
                    title="Send Email"
                  >
                    <Mail size={13} className="stroke-[2.5]" />
                    <span>Email</span>
                  </a>
                )}
                
                {selectedAlumni.linkedin && (
                  <a 
                    href={selectedAlumni.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-slate-450 hover:text-[#6b1d2f] font-bold uppercase tracking-wider transition-colors mt-1 flex items-center gap-1.5"
                    title="LinkedIn Profile"
                  >
                    <LinkedinIcon size={11} className="stroke-[2.5]" />
                    <span>View LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: STUDENT REQUEST MENTORSHIP ================= */}
      {selectedMentorForReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl p-4 animate-fade-in" data-lenis-prevent>
          <div className="w-full max-w-sm rounded-[3rem] bg-white/90 border border-white p-8 shadow-2xl space-y-6 relative animate-scale-in text-left">
            <button 
              onClick={() => setSelectedMentorForReq(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all duration-200 cursor-pointer z-20 hover:scale-108 active:scale-95"
            >
              <X size={14} />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-maroon-50 text-[9px] font-black text-maroon-700 uppercase tracking-widest border border-maroon-100/50">
                1-on-1 Connect
              </span>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 font-serif">Request Career Guidance</h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">You are requesting mentorship from <span className="text-[#6b1d2f] font-bold">{selectedMentorForReq.user.name}</span>.</p>
            </div>

            <form onSubmit={handleRequestMentorship} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Your Full Name</label>
                <input 
                  type="text" 
                  required
                  value={studentReqForm.name} 
                  onChange={e => setStudentReqForm({...studentReqForm, name: e.target.value})}
                  placeholder="Enter your name"
                  className="w-full bg-white/70 border border-slate-200/50 rounded-xl px-4 py-3.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-4 focus:ring-maroon-650/5 transition-all duration-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Your Email Address</label>
                <input 
                  type="email" 
                  required
                  value={studentReqForm.email} 
                  onChange={e => setStudentReqForm({...studentReqForm, email: e.target.value})}
                  placeholder="Enter your email"
                  className="w-full bg-white/70 border border-slate-200/50 rounded-xl px-4 py-3.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-4 focus:ring-maroon-650/5 transition-all duration-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Describe what guidance you need</label>
                <textarea 
                  required
                  value={studentReqForm.notes} 
                  onChange={e => setStudentReqForm({...studentReqForm, notes: e.target.value})}
                  placeholder="What questions do you have? e.g. college applications, prep strategies, role guidance..."
                  rows={4}
                  className="w-full bg-white/70 border border-slate-200/50 rounded-xl px-4 py-3.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-4 focus:ring-maroon-650/5 transition-all duration-200 focus:outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={submittingMentorshipReq}
                className={`w-full py-3.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-md uppercase tracking-widest focus:outline-none active:scale-[0.98] duration-150 flex items-center justify-center gap-2 ${
                  submittingMentorshipReq
                    ? "bg-slate-400 cursor-not-allowed opacity-75"
                    : "bg-gradient-to-r from-maroon-600 to-navy-700 hover:from-maroon-500 hover:to-navy-600"
                }`}
              >
                {submittingMentorshipReq ? "Submitting Request..." : "Submit Connect Request"}
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
