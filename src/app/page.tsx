"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, Search, X, Sparkles, PlusCircle, RefreshCw, Users
} from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase";

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
}

export default function PublicAlumniPage() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

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
    avatarUrl: ""
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
          avatarUrl: ""
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

  // Unique Batch list for filtering dropdown
  const batchYears = Array.from(new Set(alumni.map(a => a.batch.toString()))).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans relative overflow-x-hidden selection:bg-violet-600 selection:text-white grid-bg">
      {/* Liquid 3D Spheres placed behind everything */}
      <div className="absolute top-[15%] left-[5%] w-36 h-36 rounded-full sphere-3d pointer-events-none animate-float" />
      <div className="absolute top-[35%] right-[10%] w-48 h-48 rounded-full sphere-3d pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[20%] left-[8%] w-44 h-44 rounded-full sphere-3d pointer-events-none animate-float" />
      <div className="absolute bottom-[5%] right-[25%] w-32 h-32 rounded-full sphere-3d pointer-events-none animate-float-slow" />
      <div className="absolute top-[75%] left-[45%] w-24 h-24 rounded-full sphere-3d pointer-events-none animate-float" />

      {/* Toast alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/60 p-4 shadow-xl backdrop-blur-xl bg-white/70 animate-fade-in text-slate-800">
          <Sparkles size={18} className="text-violet-600" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/40 backdrop-blur-lg px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md shadow-indigo-500/10">
              CCGS
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-wide">CCGS Alumni Directory</h1>
              <p className="text-[9px] text-slate-500 tracking-wider font-semibold uppercase">Connecting Future Leaders</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRegModal(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.01]"
            >
              <PlusCircle size={14} /> Register Profile
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-12 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/15 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
          <Sparkles size={12} className="text-violet-600" /> CCHS & CCWS Combined Directories
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Discover Our Professional <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">Graduate Alumni Network</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Explore and connect with verified graduates from the CCHS and CCWS school networks building modern careers across top global industries.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="px-5 py-2.5 rounded-3xl liquid-glass text-center min-w-[120px]">
            <span className="block text-xl font-black text-slate-900">{alumni.length}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Verified Alumni</span>
          </div>
          <div className="px-5 py-2.5 rounded-3xl liquid-glass text-center min-w-[120px]">
            <span className="block text-xl font-black text-slate-900">
              {alumni.filter(a => a.school === "CCHS").length}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CCHS Graduates</span>
          </div>
          <div className="px-5 py-2.5 rounded-3xl liquid-glass text-center min-w-[120px]">
            <span className="block text-xl font-black text-slate-900">
              {alumni.filter(a => a.school === "CCWS").length}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CCWS Graduates</span>
          </div>
        </div>
      </section>

      {/* Directory Content Workspace */}
      <main className="max-w-7xl mx-auto px-8 pb-20 space-y-8 relative z-10">
        
        {/* Filters and search panel - Refactored to liquid-glass */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-[2rem] liquid-glass">
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
              className="w-full bg-white/50 border border-white/80 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500/60 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* School filter */}
          <div>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="w-full bg-white/50 border border-white/80 rounded-2xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-violet-500/60 focus:bg-white transition-all font-semibold"
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
              className="w-full bg-white/50 border border-white/80 rounded-2xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-violet-500/60 focus:bg-white transition-all font-semibold"
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
              <div className="text-center py-20 rounded-[2rem] liquid-glass">
                <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">No Alumni Found</span>
                <p className="text-[11px] text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((alum) => (
                  <div 
                    key={alum.id} 
                    className="group rounded-[2rem] liquid-glass liquid-glass-hover p-6 space-y-5 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Avatar & Header */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={alum.user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`} 
                          className="h-12 w-12 rounded-xl border border-slate-200 shadow-sm" 
                          alt="avatar" 
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">{alum.user.name}</h3>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              alum.school === "CCHS" ? "bg-violet-50 text-violet-650 border border-violet-100/50" : "bg-emerald-50 text-emerald-650 border border-emerald-100/50"
                            }`}>
                              {alum.school}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-550 font-semibold uppercase block mt-0.5">Class of {alum.batch}</span>
                        </div>
                      </div>

                      {/* Professional details */}
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-700 font-semibold truncate">
                          {alum.role || "Graduate"} 
                          {alum.company && (
                            <span> @ <span className="text-slate-950 font-bold">{alum.company}</span></span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400 shrink-0" /> {alum.city}, {alum.country}
                        </p>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {alum.skills.split(",").slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-white/40 border border-white/60 text-[9px] font-semibold text-slate-600">
                            {skill.trim()}
                          </span>
                        ))}
                        {alum.skills.split(",").length > 3 && (
                          <span className="px-2 py-0.5 rounded-lg bg-white/40 border border-white/60 text-[9px] font-semibold text-slate-500">
                            +{alum.skills.split(",").length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/40 mt-auto">
                      <button 
                        onClick={() => setSelectedAlumni(alum)}
                        className="flex-1 py-2 rounded-xl bg-white/60 hover:bg-white/90 text-[10px] font-bold text-slate-750 transition-all border border-white/80 shadow-sm"
                      >
                        View Profile Details
                      </button>

                      {alum.linkedin && (
                        <a 
                          href={alum.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="h-8 w-8 rounded-xl bg-[#0a66c2]/10 hover:bg-[#0a66c2]/15 text-[#0a66c2] border border-[#0a66c2]/20 flex items-center justify-center transition-all"
                        >
                          <LinkedinIcon size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* ================= DETAIL PROFILE MODAL - Refactored to liquid-glass ================= */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/15 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[2rem] liquid-glass p-8 shadow-2xl space-y-6 relative animate-fade-in">
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
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Graduation details</span>
                <span className="text-xs font-semibold text-slate-800">
                  {selectedAlumni.program} stream, batch of {selectedAlumni.batch}
                </span>
              </div>

              {selectedAlumni.industry && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Focus Industry</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {selectedAlumni.industry}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Expertise Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAlumni.skills.split(",").map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/60 border border-white/80 text-[10px] font-semibold text-slate-700">
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
                  className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-755 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <LinkedinIcon size={14} /> Connect on LinkedIn
                </a>
              )}
              <button 
                onClick={() => setSelectedAlumni(null)}
                className="px-6 py-3 rounded-xl bg-white/60 border border-white/80 text-xs font-bold text-slate-700 hover:bg-white/80 transition-all shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SELF-REGISTRATION - Refactored to liquid-glass ================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/15 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-[2rem] liquid-glass p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto animate-fade-in">
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
              <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-white/60">
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
                    className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
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
                    className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">School Network</label>
                  <select 
                    value={regForm.school} 
                    onChange={e => setRegForm({...regForm, school: e.target.value})}
                    className="w-full bg-white/50 border border-white/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all font-semibold"
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
                    className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
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
                    className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
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
                    className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Designation / Role</label>
                  <input 
                    type="text" 
                    value={regForm.role} 
                    onChange={e => setRegForm({...regForm, role: e.target.value})}
                    placeholder="e.g. Principal Architect (Optional)"
                    className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
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
                  className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
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
                  className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">Contact Number (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.phone} 
                  onChange={e => setRegForm({...regForm, phone: e.target.value})}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wider block">LinkedIn Profile Link (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.linkedin} 
                  onChange={e => setRegForm({...regForm, linkedin: e.target.value})}
                  placeholder="e.g. https://linkedin.com/in/username"
                  className="w-full bg-white/50 border border-white/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 focus:bg-white transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white transition-all shadow-sm"
              >
                Submit Registration Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer - Refactored to liquid-glass style */}
      <footer className="border-t border-slate-200/50 bg-[#eff6ff]/30 py-12 text-center text-xs text-slate-500 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p>© 2026 CCGS Educational Group. CCHS & CCWS Joint Alumni Directories.</p>
          <div className="flex items-center gap-4">
            <span 
              onClick={() => window.open("/admin", "_blank")}
              className="hover:text-slate-700 cursor-pointer font-bold text-violet-650 transition-colors"
            >
              Coordinator Portal Access
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
