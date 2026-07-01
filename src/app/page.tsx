"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, Search, X, Sparkles, PlusCircle, RefreshCw, Users, Mail
} from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase";
import Logo from "@/components/Logo";

// Custom LinkedIn Icon SVG to bypass lucide-react version compatibility issues
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

interface AlumniProfile {
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
  linkedin?: string;
  bio?: string | null;
}

export default function PublicAlumniPage() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // 5 columns * 6 rows

  // Reset pagination to first page when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, schoolFilter, batchFilter]);

  // Registration form modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    batch: "2024",
    program: "Science",
    school: "CCHS",
    company: "",
    role: "",
    skills: "",
    linkedin: "",
    phone: "",
    city: "",
    avatarUrl: "",
    bio: ""
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const path = `avatars/${Date.now()}_${file.name}`;
      const url = await uploadFileToStorage(file, path);
      setRegForm(prev => ({ ...prev, avatarUrl: url }));
      showToast("Profile image uploaded successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Profile image upload failed", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumni");
      const json = await res.json();
      if (res.ok) {
        setAlumni(json);
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch alumni directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
    // Auto-open registration if URL contains ?register=true
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("register") === "true") {
        setShowRegModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelfRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regForm.linkedin) {
      const trimmed = regForm.linkedin.trim();
      const pattern = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;
      if (!pattern.test(trimmed)) {
        showToast("Please enter a valid LinkedIn URL", "error");
        return;
      }
    }

    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });
      const json = await res.json();
      if (res.ok) {
        showToast("Registration request received! Profiles are reviewed by admins.", "success");
        setShowRegModal(false);
        setRegForm({
          name: "",
          email: "",
          batch: "2024",
          program: "Science",
          school: "CCHS",
          company: "",
          role: "",
          skills: "",
          linkedin: "",
          phone: "",
          city: "",
          avatarUrl: "",
          bio: ""
        });
      } else {
        showToast(json.error || "Registration failed", "error");
      }
    } catch {
      showToast("Registration request error", "error");
    }
  };

  // Derived Filtered List
  const filteredAlumni = alumni.filter(a => {
    const matchSchool = schoolFilter === "All" || a.school === schoolFilter;
    const matchBatch = batchFilter === "All" || a.batch.toString() === batchFilter;
    const matchSearch = a.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.skills.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.company && a.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (a.role && a.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        a.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSchool && matchBatch && matchSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredAlumni.length / itemsPerPage);
  const paginatedAlumni = filteredAlumni.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Unique Batch list for filtering dropdown
  const batchYears = Array.from(new Set(alumni.map(a => a.batch.toString()))).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen executive-mesh-bg text-slate-800 font-sans relative overflow-x-hidden selection:bg-maroon-600 selection:text-white grid-bg">
      {/* Dynamic Background Shapes */}
      <div className="absolute top-[-100px] left-[-150px] bg-shape-maroon opacity-90 pointer-events-none" />
      <div className="absolute top-[350px] right-[-250px] bg-shape-navy opacity-80 pointer-events-none" />
      <div className="absolute top-[900px] left-[-200px] bg-shape-navy opacity-60 pointer-events-none" />
      <div className="absolute bottom-[400px] right-[-150px] bg-shape-maroon opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[10%] bg-shape-navy opacity-50 pointer-events-none" />

      {/* Toast alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl glass-card p-4 shadow-xl animate-fade-in text-slate-800">
          <Sparkles size={18} className="text-violet-600" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 glass-header px-8 py-3.5 border-b border-slate-200/25">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size={42} />

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRegModal(true)}
              className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-600 to-navy-700 hover:from-maroon-500 hover:to-navy-600 text-xs font-bold text-white shadow-[0_4px_14px_rgba(107,29,47,0.15)] hover:shadow-[0_6px_20px_rgba(107,29,47,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-white/10"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <PlusCircle size={14} className="group-hover:rotate-90 group-hover:scale-110 transition-all duration-300 text-amber-300" />
              <span>Register Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-12 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon-500/10 border border-maroon-500/15 text-[10px] font-bold text-maroon-700 uppercase tracking-wider">
          <Sparkles size={12} className="text-maroon-600" /> CCHS & CCWS Combined Directories
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Discover Our Professional <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-maroon-600 to-navy-700">Graduate Alumni Network</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Explore and connect with verified graduates from the CCHS and CCWS school networks building modern careers across top global industries.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="px-5 py-2.5 rounded-3xl glass-card text-center min-w-[120px]">
            <span className="block text-xl font-black text-slate-900">{alumni.length}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Verified Alumni</span>
          </div>
          <div className="px-5 py-2.5 rounded-3xl glass-card text-center min-w-[120px]">
            <span className="block text-xl font-black text-slate-900">
              {alumni.filter(a => a.school === "CCHS").length}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CCHS Graduates</span>
          </div>
          <div className="px-5 py-2.5 rounded-3xl glass-card text-center min-w-[120px]">
            <span className="block text-xl font-black text-slate-900">
              {alumni.filter(a => a.school === "CCWS").length}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CCWS Graduates</span>
          </div>
        </div>
      </section>

      {/* Directory Content Workspace */}
      <main className="max-w-7xl mx-auto px-8 pb-20 space-y-8 relative z-10">
        
        {/* Filters and search panel - Refactored to glass-panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-[2rem] glass-panel">
          {/* Search name, company, skills */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
              <Search size={14} />
            </span>
            <input 
              type="text" 
              placeholder="Search name, skills, role, company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
            />
          </div>

          {/* School filter */}
          <div>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full glass-input rounded-2xl px-4 py-3 text-xs text-slate-700 focus:outline-none font-semibold"
            >
              <option value="All">All School Networks</option>
              <option value="CCHS">CCHS Network</option>
              <option value="CCWS">CCWS Network</option>
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full glass-input rounded-2xl px-4 py-3 text-xs text-slate-700 focus:outline-none font-semibold"
            >
              <option value="All">All Graduation Years</option>
              {batchYears.map(year => (
                <option key={year} value={year}>Class of {year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={24} className="animate-spin text-violet-500" />
              <span className="text-xs font-semibold tracking-wider text-slate-500">REFRESHING DIRECTORY GRID...</span>
            </div>
          </div>
        ) : (
          <>
            {filteredAlumni.length === 0 ? (
              <div className="text-center py-20 rounded-[2rem] glass-panel">
                <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">No Alumni Found</span>
                <p className="text-[11px] text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {paginatedAlumni.map((alum) => (
                  <div 
                    key={alum.id} 
                    className="group rounded-[2rem] glass-card glass-card-hover p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Avatar & Header (Stacked Centered Layout) */}
                      <div className="flex flex-col items-center text-center space-y-2.5">
                        <div className={`relative p-0.5 rounded-2xl border-2 ${
                          alum.school === "CCHS" ? "border-maroon-600/30 bg-maroon-50/20" : "border-navy-600/30 bg-navy-50/20"
                        } shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                          <img 
                            src={alum.user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`} 
                            className="h-16 w-16 rounded-xl object-cover" 
                            alt="avatar" 
                          />
                        </div>
                        <div className="min-w-0 w-full space-y-0.5">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-extrabold text-slate-900 truncate max-w-[130px]">{alum.user.name}</h3>
                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-extrabold uppercase tracking-wide ${
                              alum.school === "CCHS" 
                                ? "bg-maroon-50 text-maroon-700 border border-maroon-100/50" 
                                : "bg-navy-50/80 text-navy-700 border border-navy-100/50"
                            }`}>
                              {alum.school}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Class of {alum.batch}</span>
                        </div>
                      </div>

                      {/* Biography Block - Centered Quote */}
                      {alum.bio && (
                        <div className="px-2.5 py-1.5 bg-slate-950/[0.015] rounded-xl border border-black/[0.01] text-center my-1.5">
                          <p className="text-[10px] text-slate-550 leading-normal line-clamp-2 italic">
                            &quot;{alum.bio}&quot;
                          </p>
                        </div>
                      )}

                      {/* Professional Details */}
                      <div className="space-y-0.5 text-center">
                        <p className="text-[11px] text-slate-800 font-extrabold truncate">
                          {alum.role || "Graduate"} 
                        </p>
                        {alum.company && (
                          <p className="text-[9.5px] text-slate-500 font-medium truncate">
                            at <span className="text-slate-900 font-bold">{alum.company}</span>
                          </p>
                        )}
                        <p className="text-[9px] text-slate-400 flex items-center justify-center gap-0.5 mt-1 font-semibold uppercase tracking-wider">
                          <MapPin size={10} className="text-slate-400 shrink-0" /> {alum.city}, {alum.country}
                        </p>
                      </div>

                      {/* Direct Contacts Badges */}
                      <div className="flex flex-wrap items-center justify-center gap-1 pt-2 border-t border-black/[0.04]">
                        <a 
                          href={`mailto:${alum.user.email}`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 hover:bg-white/80 border border-white/60 text-[9px] font-bold text-slate-700 hover:text-maroon-700 transition-all shadow-sm max-w-[105px]"
                          title={`Email ${alum.user.name}`}
                        >
                          <Mail size={10} className="text-maroon-600 shrink-0" />
                          <span className="truncate">{alum.user.email}</span>
                        </a>
                        
                        {alum.linkedin && (
                          <a 
                            href={alum.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/40 hover:bg-white/80 border border-white/60 text-[9px] font-bold text-slate-700 hover:text-navy-700 transition-all shadow-sm"
                            title="LinkedIn Profile"
                          >
                            <LinkedinIcon size={10} className="text-navy-600 shrink-0" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap justify-center gap-1 pt-0.5">
                        {alum.skills.split(",").slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-white/20 border border-white/50 text-[8.5px] font-bold text-slate-500">
                            {skill.trim()}
                          </span>
                        ))}
                        {alum.skills.split(",").length > 2 && (
                          <span className="px-1 py-0.5 rounded bg-white/20 border border-white/50 text-[8.5px] font-bold text-slate-400">
                            +{alum.skills.split(",").length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="pt-3 border-t border-white/40 mt-auto">
                      <button 
                        onClick={() => setSelectedAlumni(alum)}
                        className="w-full py-2 rounded-xl glass-button text-[9px] font-extrabold text-slate-700 hover:bg-maroon-600 hover:text-white hover:border-maroon-600 transition-all shadow-sm flex items-center justify-center gap-1"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                  Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAlumni.length)} of {filteredAlumni.length} alumni
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all bg-white/40 hover:bg-white/80 border border-white/60 text-slate-700 disabled:opacity-40 disabled:hover:bg-white/40 shadow-sm flex items-center gap-1 active:scale-95 disabled:active:scale-100"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isNear = Math.abs(pageNum - currentPage) <= 1;
                      const isFirstOrLast = pageNum === 1 || pageNum === totalPages;
                      
                      if (!isNear && !isFirstOrLast) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="px-1.5 text-xs text-slate-400 font-extrabold select-none">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-[10px] font-extrabold transition-all border shadow-sm active:scale-95 ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-maroon-600 to-navy-700 text-white border-transparent"
                              : "bg-white/40 hover:bg-white/80 border-white/60 text-slate-750"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3.5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all bg-white/40 hover:bg-white/80 border border-white/60 text-slate-700 disabled:opacity-40 disabled:hover:bg-white/40 shadow-sm flex items-center gap-1 active:scale-95 disabled:active:scale-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* ================= DETAIL PROFILE MODAL - Refactored to glass-panel ================= */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-[2rem] glass-panel p-8 shadow-2xl space-y-6 relative animate-fade-in">
            <button 
              onClick={() => setSelectedAlumni(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <img 
                src={selectedAlumni.user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`} 
                className="h-16 w-16 rounded-2xl border border-slate-200" 
                alt="avatar" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{selectedAlumni.user.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    selectedAlumni.school === "CCHS" ? "bg-violet-50 text-violet-600 border border-violet-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {selectedAlumni.school}
                  </span>
                </div>
                <p className="text-xs text-violet-650 font-semibold">{selectedAlumni.role} @ {selectedAlumni.company}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedAlumni.city}, {selectedAlumni.country} | Batch {selectedAlumni.batch}</p>
              </div>
            </div>

            {/* Details Fields */}
            <div className="space-y-4 pt-4 border-t border-white/40">
              {selectedAlumni.bio && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Biography</span>
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white/30 p-3 rounded-xl border border-white/85">
                    &quot;{selectedAlumni.bio}&quot;
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Graduation details</span>
                <span className="text-xs font-semibold text-slate-800">
                  {selectedAlumni.program} stream, batch of {selectedAlumni.batch}
                </span>
              </div>

              {selectedAlumni.industry && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Focus Industry</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedAlumni.industry}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Expertise Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAlumni.skills.split(",").map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg glass-badge text-[10px] font-semibold text-slate-700">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/40">
              {selectedAlumni.linkedin && (
                <a 
                  href={selectedAlumni.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-maroon-600 hover:bg-maroon-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <LinkedinIcon size={14} /> Connect on LinkedIn
                </a>
              )}
              <button 
                onClick={() => setSelectedAlumni(null)}
                className="px-6 py-3 rounded-xl glass-button text-xs font-bold text-slate-700 shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SELF-REGISTRATION - Refactored to glass-panel ================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-[2rem] glass-panel p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button 
              onClick={() => setShowRegModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Alumni Self-Registration Form</h2>
              <p className="text-xs text-slate-505 mt-1">Register to join the school directories. Profiles are reviewed by admins before activation.</p>
            </div>

            <form onSubmit={handleSelfRegistration} className="space-y-4">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-4 bg-white/30 p-4 rounded-2xl border border-white/60">
                <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                  {regForm.avatarUrl ? (
                    <img src={regForm.avatarUrl} className="h-full w-full object-cover" alt="avatar" />
                  ) : (
                    <Users size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Profile Photo (Optional)</span>
                  <label className="inline-flex h-8 items-center justify-center rounded-xl bg-violet-650 hover:bg-violet-700 px-3 text-xs font-bold text-white cursor-pointer transition-all">
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={regForm.name} 
                    onChange={e => setRegForm({...regForm, name: e.target.value})}
                    placeholder="Enter name"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={regForm.email} 
                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                    placeholder="name@email.com"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">School Network</label>
                  <select 
                    value={regForm.school} 
                    onChange={e => setRegForm({...regForm, school: e.target.value})}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                  >
                    <option value="CCHS">CCHS Network</option>
                    <option value="CCWS">CCWS Network</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Graduation Batch</label>
                  <input 
                    type="number" 
                    required
                    value={regForm.batch} 
                    onChange={e => setRegForm({...regForm, batch: e.target.value})}
                    placeholder="e.g. 2018"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Program / Stream</label>
                  <input 
                    type="text" 
                    required
                    value={regForm.program} 
                    onChange={e => setRegForm({...regForm, program: e.target.value})}
                    placeholder="e.g. Science"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Current Company</label>
                  <input 
                    type="text" 
                    value={regForm.company} 
                    onChange={e => setRegForm({...regForm, company: e.target.value})}
                    placeholder="e.g. Microsoft (Optional)"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Designation / Role</label>
                  <input 
                    type="text" 
                    value={regForm.role} 
                    onChange={e => setRegForm({...regForm, role: e.target.value})}
                    placeholder="e.g. Principal Architect (Optional)"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Expertise Skills Tags</label>
                <input 
                  type="text" 
                  required
                  value={regForm.skills} 
                  onChange={e => setRegForm({...regForm, skills: e.target.value})}
                  placeholder="Comma-separated (React, Node, UX Design)"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Location / City</label>
                <input 
                  type="text" 
                  required
                  value={regForm.city} 
                  onChange={e => setRegForm({...regForm, city: e.target.value})}
                  placeholder="e.g. Mumbai"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Contact Number (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.phone} 
                  onChange={e => setRegForm({...regForm, phone: e.target.value})}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">LinkedIn Profile Link (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.linkedin} 
                  onChange={e => setRegForm({...regForm, linkedin: e.target.value})}
                  placeholder="e.g. https://linkedin.com/in/username"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Professional Biography (Bio)</label>
                <textarea 
                  value={regForm.bio} 
                  onChange={e => setRegForm({...regForm, bio: e.target.value})}
                  placeholder="Introduce yourself, your career focus, or guidance you can offer..."
                  rows={3}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-maroon-600 hover:bg-maroon-700 text-xs font-bold text-white transition-all shadow-sm"
              >
                Submit Registration Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer - Refactored to glass-panel style */}
      <footer className="border-t border-slate-200/50 bg-[#eff6ff]/30 py-12 text-center text-xs text-slate-500 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p>© 2026 CCGS Educational Group. CCHS & CCWS Joint Alumni Directories.</p>
          <div className="flex items-center gap-4">
            <span 
              onClick={() => window.open("/admin", "_blank")}
              className="hover:text-maroon-700 cursor-pointer font-bold text-maroon-600 transition-colors"
            >
              Coordinator Portal Access
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
