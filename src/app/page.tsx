/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, X, Sparkles, PlusCircle, RefreshCw, Users, Mail, Play, Video, Briefcase, GraduationCap, Landmark
} from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase";
import Logo from "@/components/Logo";

const AlumniMap = dynamic(() => import('@/components/AlumniMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] md:h-[480px] rounded-[3rem] bg-slate-100 flex flex-col items-center justify-center gap-3 border border-slate-200 shadow-2xl">
      <RefreshCw size={24} className="animate-spin text-amber-500" />
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Connections Map...</span>
    </div>
  )
});

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

interface MentorshipRequest {
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

const ALUMNI_VIDEOS_L2R = [
  { id: "jnQe7v8XwrU", title: "IIT Roorkee Testimony", name: "Divisha Khurana", role: "IIT Roorkee (Electrical)", image: "https://img.youtube.com/vi/jnQe7v8XwrU/0.jpg" },
  { id: "6gw7mva7OzU", title: "NLSIU Law Graduation Testimony", name: "Yashashvi Bharadwaj", role: "NLSIU Law Graduate", image: "https://img.youtube.com/vi/6gw7mva7OzU/0.jpg" },
  { id: "VUbI5Y4x0HY", title: "ISB & Innovaccer Director Success Story", name: "Innovaccer Director", role: "ISB Alumnus", image: "https://img.youtube.com/vi/VUbI5Y4x0HY/0.jpg" },
  { id: "_T5xL8ivQdU", title: "Sub Lieutenant commission from NDA", name: "Sub Lieutenant", role: "NDA Officer", image: "https://img.youtube.com/vi/_T5xL8ivQdU/0.jpg" },
  { id: "bXBoBQWwWwg", title: "BITS Pilani & Walmart Journey", name: "Walmart Engineer", role: "BITS Pilani Alumnus", image: "https://img.youtube.com/vi/bXBoBQWwWwg/0.jpg" },
  { id: "qwjOejQpZhA", title: "IIT Bombay & Bain & Co Career Path", name: "Bain Associate", role: "IIT Bombay Alumnus", image: "https://img.youtube.com/vi/qwjOejQpZhA/0.jpg" },
  { id: "GP-bR8yqemQ", title: "IPS Officer UPSC AIR-178 Journey", name: "IPS Officer", role: "UPSC Civil Services", image: "https://img.youtube.com/vi/GP-bR8yqemQ/0.jpg" },
  { id: "Y35-UfpD1C0", title: "Supreme Court Advocate Journey", name: "SC Advocate", role: "Supreme Court & High Court", image: "https://img.youtube.com/vi/Y35-UfpD1C0/0.jpg" },
  { id: "rAMIxtssDzI", title: "Cinematography & Filmmaker Journey", name: "Filmmaker", role: "Cinematography Professional", image: "https://img.youtube.com/vi/rAMIxtssDzI/0.jpg" },
  { id: "80sosZzVmfU", title: "Pierce Sweden Product Developer Journey", name: "Product Developer", role: "Pierce (Sweden)", image: "https://img.youtube.com/vi/80sosZzVmfU/0.jpg" },
  { id: "lJXjTNGkL7A", title: "Atlantis The Palm Chef Journey", name: "Atlantis Chef", role: "Nobu (Dubai)", image: "https://img.youtube.com/vi/lJXjTNGkL7A/0.jpg" },
];

const ALUMNI_VIDEOS_R2L = [
  { id: "LzqOjBV_kjQ", title: "IIT (BHU) Varanasi Testimony", name: "IIT BHU Graduate", role: "IIT Varanasi Alumnus", image: "https://img.youtube.com/vi/LzqOjBV_kjQ/0.jpg" },
  { id: "aQpthkkFHy0", title: "ESCP London & SRM Institute Journey", name: "ESCP Scholar", role: "ESCP London Alumnus", image: "https://img.youtube.com/vi/aQpthkkFHy0/0.jpg" },
  { id: "rQs-dBSU5Ak", title: "Social Media Marketing Executive (Dubai)", name: "Marketing Executive", role: "Social Media (Dubai)", image: "https://img.youtube.com/vi/rQs-dBSU5Ak/0.jpg" },
  { id: "nJK-IDVMXwY", title: "Google Software Engineer Career", name: "Google Engineer", role: "IIIT Hyderabad Alumnus", image: "https://img.youtube.com/vi/nJK-IDVMXwY/0.jpg" },
  { id: "zIZWYBtdUE4", title: "JP Morgan & ISB Hyd Journey", name: "JP Morgan Analyst", role: "ISB Hyderabad Alumnus", image: "https://img.youtube.com/vi/zIZWYBtdUE4/0.jpg" },
  { id: "fTsZKzVFaRk", title: "AIR 2 CLAT / AIR 1 AILET NLU Bangalore", name: "CLAT Ranker", role: "NLU Bangalore Alumnus", image: "https://img.youtube.com/vi/fTsZKzVFaRk/0.jpg" },
  { id: "YA3MSbsQOfA", title: "University of Strathclyde Journey", name: "Strathclyde Scholar", role: "Strathclyde Alumnus", image: "https://img.youtube.com/vi/YA3MSbsQOfA/0.jpg" },
  { id: "uTBAw0Huxn8", title: "MBA NMIMS Mumbai & Jio Creative Labs", name: "NMIMS Graduate", role: "Jio Creative Labs", image: "https://img.youtube.com/vi/uTBAw0Huxn8/0.jpg" },
  { id: "46GZ_dSEo4k", title: "IIT Jodhpur Product Management Journey", name: "Product Manager", role: "IIT Jodhpur Alumnus", image: "https://img.youtube.com/vi/46GZ_dSEo4k/0.jpg" },
  { id: "9aYnr7Nbiyo", title: "Alumni Reunion Highlights Event", name: "Reunion Event", role: "Highlights", image: "https://img.youtube.com/vi/9aYnr7Nbiyo/0.jpg" },
];

export default function PublicAlumniPage() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  
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

  const [showRegModal, setShowRegModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // View modes: 'directory' | 'student' | 'mentor'
  const [viewMode, setViewMode] = useState<'directory' | 'student' | 'mentor'>("directory");

  // Mentorship System States
  const [mentorships, setMentorships] = useState<MentorshipRequest[]>([]);
  const [loadingMentorships, setLoadingMentorships] = useState(false);
  const [selectedMentorForReq, setSelectedMentorForReq] = useState<AlumniProfile | null>(null);
  const [studentReqForm, setStudentReqForm] = useState({ name: "", email: "", notes: "" });
  const [submittingMentorshipReq, setSubmittingMentorshipReq] = useState(false);

  // Simulated Mentor profile (to display received requests)
  const [simulatedMentor, setSimulatedMentor] = useState<AlumniProfile | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Placement stats state
  const [stats, setStats] = useState<{
    iitAiims: number;
    entrepreneurs: number;
    government: number;
    topCompanies: { name: string; count: number }[];
  }>({
    iitAiims: 68,
    entrepreneurs: 35,
    government: 14,
    topCompanies: [
      { name: "Google", count: 4 },
      { name: "Microsoft", count: 3 },
      { name: "Ernst & Young", count: 5 },
      { name: "Amazon", count: 3 },
      { name: "Deloitte", count: 6 },
      { name: "TCS", count: 8 }
    ]
  });

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
  const [submitting, setSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerSync = async () => {
    setIsSyncing(true);
    showToast("Synchronizing with Google Sheets...", "success");
    try {
      const res = await fetch("/api/cron/sync-sheets?secret=ccgs-cron-secret-2026");
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Sync complete! Added: ${json.created}, Updated: ${json.updated}`, "success");
        const alumniRes = await fetch("/api/alumni?nocache=true");
        if (alumniRes.ok) {
          const alumniJson = await alumniRes.json();
          setAlumni(alumniJson);
          if (typeof window !== "undefined") {
            localStorage.setItem("ccgs_alumni_data_cache", JSON.stringify(alumniJson));
          }
        }
        const statsUrl = schoolFilter && schoolFilter !== "All" 
          ? `/api/stats?school=${schoolFilter}&nocache=true` 
          : "/api/stats?nocache=true";
        const statsRes = await fetch(statsUrl);
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson);
        }
      } else {
        showToast(json.error || "Google Sheets sync failed", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Sync error. Please try again.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

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
    // Stale-While-Revalidate: Check if we have cached data first
    let hasCache = false;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ccgs_alumni_data_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAlumni(parsed);
            setLoading(false); // Disable initial loader immediately
            hasCache = true;
          }
        } catch (e) {
          console.error("Failed to parse cached alumni data:", e);
        }
      }
    }

    if (!hasCache) {
      setLoading(true);
    }

    try {
      const res = await fetch("/api/alumni");
      const json = await res.json();
      if (res.ok) {
        setAlumni(json);
        if (typeof window !== "undefined") {
          localStorage.setItem("ccgs_alumni_data_cache", JSON.stringify(json));
        }
      }
    } catch (e) {
      console.error(e);
      if (!hasCache) {
        showToast("Failed to fetch alumni directory", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (school: string = "All") => {
    try {
      const url = school && school !== "All" ? `/api/stats?school=${school}` : "/api/stats";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch (e) {
      console.error("Failed to fetch placement statistics:", e);
    }
  };

  const fetchMentorships = async () => {
    setLoadingMentorships(true);
    try {
      const res = await fetch("/api/data");
      if (res.ok) {
        const json = await res.json();
        setMentorships(json.mentorships || []);
      }
    } catch (e) {
      console.error("Failed to load mentorships:", e);
    } finally {
      setLoadingMentorships(false);
    }
  };

  const handleRequestMentorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForReq) return;
    setSubmittingMentorshipReq(true);

    try {
      // Use clean student email prefix/identifier as studentId
      const studentId = studentReqForm.email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, "_");
      
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createMentorship",
          studentId,
          alumniId: selectedMentorForReq.id,
          notes: studentReqForm.notes
        })
      });

      const json = await res.json();
      if (res.ok) {
        showToast("Mentorship request submitted successfully!", "success");
        setSelectedMentorForReq(null);
        setStudentReqForm({ name: "", email: "", notes: "" });
        fetchMentorships();
      } else {
        showToast(json.error || "Failed to submit request", "error");
      }
    } catch {
      showToast("Error submitting mentorship request", "error");
    } finally {
      setSubmittingMentorshipReq(false);
    }
  };

  const handleUpdateMentorshipStatus = async (connectionId: string, status: 'ACCEPTED' | 'DECLINED') => {
    setActionInProgress(connectionId);
    try {
      const res = await fetch("/api/data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateMentorshipStatus",
          id: connectionId,
          status
        })
      });

      if (res.ok) {
        showToast(`Request ${status.toLowerCase()}!`, "success");
        fetchMentorships();
      } else {
        showToast("Failed to update request", "error");
      }
    } catch {
      showToast("Error updating request", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  useEffect(() => {
    if (viewMode === 'mentor' || viewMode === 'student') {
      fetchMentorships();
    }
  }, [viewMode]);

  useEffect(() => {
    fetchAlumni();
    // Auto-open registration or switch view if URL contains parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("register") === "true") {
        setShowRegModal(true);
      }
      const v = params.get("view");
      if (v === "student" || v === "mentor" || v === "directory") {
        setViewMode(v as 'student' | 'mentor' | 'directory');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStats(schoolFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolFilter]);

  const handleSelfRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (regForm.linkedin) {
      let trimmed = regForm.linkedin.trim();
      if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        trimmed = "https://" + trimmed;
      }
      const pattern = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;
      if (!pattern.test(trimmed)) {
        showToast("Please enter a valid LinkedIn URL (e.g. linkedin.com/in/username)", "error");
        return;
      }
      // Save the normalized URL back to regForm
      regForm.linkedin = trimmed;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm)
      });
      const json = await res.json();
      if (res.ok) {
        showToast("Registration request received! Check your email to verify your address.", "success");
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
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen executive-mesh-bg text-slate-800 font-sans relative selection:bg-maroon-600 selection:text-white grid-bg">
      {/* ================= HERO BACKGROUND IMAGE CAROUSEL (INFINITE MARQUEE) ================= */}
      <div className="absolute top-[73px] left-0 right-0 h-[480px] overflow-hidden pointer-events-none z-0 opacity-100">
        {/* Fading Edge Masks */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FAF8F5]/90 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/25 via-transparent to-[#FAF8F5]/25 z-10" />
        
        {/* Infinite Image Slider */}
        <div className="flex w-max gap-8 pt-10 animate-[marquee-left_90s_linear_infinite]">
          {[
            "/images/cambridge-court-high-school-mansarovar-jaipur-boarding-schools-ywwbk3adb3.avif",
            "/images/cambridge-court-international-school-muhana-mandi-road-jaipur-schools-82wy8zpuup.webp",
            "/images/cambridge-court-world-school-mansarovar-jaipur-schools-858df3yi5y.avif",
            "/images/cambridge-court-high-school-mansarovar-jaipur-boarding-schools-ywwbk3adb3.avif",
            "/images/cambridge-court-international-school-muhana-mandi-road-jaipur-schools-82wy8zpuup.webp",
            "/images/cambridge-court-world-school-mansarovar-jaipur-schools-858df3yi5y.avif"
          ].map((src, idx) => (
            <div 
              key={idx}
              className="w-[450px] md:w-[680px] h-[350px] md:h-[450px] rounded-[2.5rem] overflow-hidden border border-slate-200/40 shadow-xl shrink-0"
            >
              <img 
                src={src} 
                className="w-full h-full object-cover filter saturate-[0.8] contrast-[0.95] blur-[3px]" 
                alt="Cambridge Court Campus Background" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Background Shapes */}
      <div className="absolute top-[-100px] left-[-150px] bg-shape-maroon opacity-90 pointer-events-none" />
      <div className="absolute top-[350px] right-[-250px] bg-shape-navy opacity-80 pointer-events-none" />
      <div className="absolute top-[900px] left-[-200px] bg-shape-navy opacity-60 pointer-events-none" />
      <div className="absolute bottom-[400px] right-[-150px] bg-shape-maroon opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[10%] bg-shape-navy opacity-50 pointer-events-none" />

      {/* Toast alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl glass-card p-4 shadow-xl animate-fade-in text-slate-800">
          <Sparkles size={18} className="text-violet-600" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 glass-header px-8 py-3.5 border-b border-slate-200/25">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo size={42} />

          <div className="flex items-center gap-3">
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 duration-150 ${
                isSyncing
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700"
              }`}
            >
              <RefreshCw size={12} className={`${isSyncing ? "animate-spin text-maroon-600" : "text-slate-500"}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Sheets"}</span>
            </button>

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
      <section className="max-w-7xl mx-auto px-8 pt-24 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading and Description */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-[3.8rem] lg:text-[4.5rem] font-serif font-black text-[#1b2a41] tracking-tight leading-[1.08]">
                Connecting Past <span className="font-serif italic font-extrabold text-maroon-600">Achievers</span>, <br />
                Inspiring Future <span className="font-serif italic font-extrabold text-navy-650">Leaders</span>
              </h2>

              <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans font-medium italic">
                &quot;Our legacy is built in the halls of Cambridge Court; our destiny is reflected in the global achievements of our alumni.&quot;
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button 
                onClick={() => setShowRegModal(true)}
                className="group relative overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-maroon-600 to-navy-700 hover:from-maroon-500 hover:to-navy-600 text-xs font-black text-white uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-white/10"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <span>Join The Network</span>
              </button>
              
              <a 
                href="#directory"
                className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center"
              >
                Browse Alumni
              </a>
            </motion.div>
          </div>

          {/* Right Column: Interactive Leaflet Map */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-5 w-full flex justify-center"
          >
            <AlumniMap alumniData={alumni} />
          </motion.div>
        </div>
      </section>

      {/* ================= NETWORK IMPACT STATS (BLUE CONTAINER - FULL WIDTH) ================= */}
      <section className="w-full bg-[#001f3f] text-white shadow-xl relative overflow-hidden border-y border-white/10 py-10 md:py-12 z-10 mt-16 md:mt-24 mb-12">
        {/* Custom corner triangle decorations to match CCHS style */}
        <div className="absolute top-0 left-0 w-32 h-full bg-[#001326] [clip-path:polygon(0_0,0_100%,100%_100%)] opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-white/5 [clip-path:polygon(0_0,100%_0,100%_100%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 space-y-8">
          
          <div className="relative z-10 space-y-8">
            {/* Header info */}
            <div className="text-center md:text-left space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/90 uppercase tracking-widest">
                <Sparkles size={10} fill="currentColor" /> Network Placements &amp; Impact
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-white">
                Distinguished Academic &amp; Corporate Footprint
              </h3>
              <p className="text-xs text-white/70 max-w-xl">
                A consolidated summary of our verified alumni&apos;s institutional achievements and top international employer mappings.
              </p>
            </div>

            {/* Row 1: 3 Core stats (Founders, IIT/AIIMS, Civil Services) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              
              {/* Stat 1: Founders */}
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white shrink-0">
                  <Briefcase size={20} />
                </div>
                <div>
                  <span className="block text-3xl font-bold font-serif italic text-white tracking-tight">{stats.entrepreneurs}+</span>
                  <span className="block text-[10px] font-black uppercase text-white/90 tracking-wider">Founders &amp; CEOs</span>
                  <p className="text-[10px] text-white/70 leading-normal mt-0.5">Pioneering global ventures and tech startups.</p>
                </div>
              </div>

              {/* Stat 2: IITs & AIIMS */}
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <span className="block text-3xl font-bold font-serif italic text-white tracking-tight">{stats.iitAiims}+</span>
                  <span className="block text-[10px] font-black uppercase text-white/90 tracking-wider">IIT &amp; AIIMS Scholars</span>
                  <p className="text-[10px] text-white/70 leading-normal mt-0.5">Graduates from India&apos;s premier engineering &amp; medical institutes.</p>
                </div>
              </div>

              {/* Stat 3: Civil Services */}
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white shrink-0">
                  <Landmark size={20} />
                </div>
                <div>
                  <span className="block text-3xl font-bold font-serif italic text-white tracking-tight">{stats.government}+</span>
                  <span className="block text-[10px] font-black uppercase text-white/90 tracking-wider">Govt &amp; Civil Services</span>
                  <p className="text-[10px] text-white/70 leading-normal mt-0.5">Serving the nation across IAS, IPS, IFS, and ministries.</p>
                </div>
              </div>

            </div>

            {/* Row 2: Top placements on a new line (Infinite Marquee) */}
            <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center gap-4 overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/70 shrink-0">Top Placements:</span>
              <div className="relative w-full overflow-hidden">
                {/* Gradient masks on sides for smooth fade-in/fade-out */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#001f3f] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#001f3f] to-transparent z-10 pointer-events-none" />
                
                {/* Inline CSS styling block for self-contained marquee animation */}
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes marquee-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                  .animate-marquee-scroll {
                    display: flex;
                    width: max-content;
                    animation: marquee-scroll 35s linear infinite;
                  }
                  .animate-marquee-scroll:hover {
                    animation-play-state: paused;
                  }
                `}} />
                
                <div className="animate-marquee-scroll flex gap-2 select-none">
                  {/* Duplicated list for seamless looping */}
                  {[...stats.topCompanies, ...stats.topCompanies].map((tc, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 shrink-0">
                      <span>{tc.name}</span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span className="text-white font-extrabold">{tc.count} {tc.count === 1 ? 'alumn' : 'alumns'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= ALUMNI SPOTLIGHT VIDEO RIBBONS ================= */}
      <section className="py-6 space-y-6 relative z-10 max-w-[100vw] overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
            <Video size={12} className="text-slate-600 animate-pulse" /> Alumni Success Spotlights
          </div>
          <h3 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            Hear From Our Global Graduates
          </h3>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Muted previews from CCHS & CCWS graduates sharing career pathways, startup journeys, and industry insights. Click to play.
          </p>
        </div>

        {/* Continuous Video marquee tracks with Fading Mask */}
        <div className="marquee-container marquee-mask py-2 space-y-4">
          
          {/* Row 1: Left to Right */}
          <div className="marquee-track-left gap-4">
            {[...ALUMNI_VIDEOS_L2R, ...ALUMNI_VIDEOS_L2R].map((video, idx) => (
              <div 
                key={`l2r-${idx}`}
                onClick={() => setActiveVideoId(video.id)}
                className="group relative w-[280px] aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
              >
                {/* Thumbnail */}
                <img 
                  src={video.image} 
                  alt={video.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                {/* Dark Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 group-hover:via-slate-950/50 transition-all" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-3.5 rounded-full bg-white/90 text-slate-900 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>

                {/* Video Info details */}
                <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                    Watch Story
                  </span>
                  <h4 className="text-xs font-bold text-white leading-snug tracking-tight drop-shadow-sm line-clamp-1 font-display">
                    {video.title}
                  </h4>
                  <p className="text-[10px] text-slate-200 font-semibold truncate drop-shadow-sm">
                    {video.name} · <span className="text-slate-350">{video.role}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Right to Left */}
          <div className="marquee-track-right gap-4">
            {[...ALUMNI_VIDEOS_R2L, ...ALUMNI_VIDEOS_R2L].map((video, idx) => (
              <div 
                key={`r2l-${idx}`}
                onClick={() => setActiveVideoId(video.id)}
                className="group relative w-[280px] aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
              >
                {/* Thumbnail */}
                <img 
                  src={video.image} 
                  alt={video.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                {/* Dark Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 group-hover:via-slate-950/50 transition-all" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-3.5 rounded-full bg-white/90 text-slate-900 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>

                {/* Video Info details */}
                <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                    Watch Story
                  </span>
                  <h4 className="text-xs font-bold text-white leading-snug tracking-tight drop-shadow-sm line-clamp-1 font-display">
                    {video.title}
                  </h4>
                  <p className="text-[10px] text-slate-200 font-semibold truncate drop-shadow-sm">
                    {video.name} · <span className="text-slate-350">{video.role}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Directory Content Workspace */}
      <main className="max-w-7xl mx-auto px-8 pb-20 space-y-8 relative z-10" id="directory">
        
        {/* Sliding Tab Switcher */}
        <div className="flex justify-center p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl max-w-lg mx-auto border border-slate-200/50 shadow-sm">
          <button 
            onClick={() => setViewMode('directory')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
              viewMode === 'directory' 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Explore Directory
          </button>
          <button 
            onClick={() => setViewMode('student')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
              viewMode === 'student' 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Student View
          </button>
          <button 
            onClick={() => setViewMode('mentor')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
              viewMode === 'mentor' 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            Mentor View
          </button>
        </div>

        {/* ── 1. EXPLORE DIRECTORY VIEW ────────────────────────────────────────── */}
        {viewMode === 'directory' && (
          <div className="space-y-8 animate-fade-in">
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
                  <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                  >
                    <AnimatePresence mode="popLayout">
                      {paginatedAlumni.map((alum) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ y: -8, scale: 1.015 }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          key={alum.id} 
                          onClick={() => setSelectedAlumni(alum)}
                          className="group bg-white rounded-3xl border border-slate-100 hover:border-maroon-700/20 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-[370px] cursor-pointer relative"
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
                                <div className="relative w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5">
                                  <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                    <img 
                                      src={alum.user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                      alt={alum.user.name} 
                                    />
                                    <div className="absolute inset-0 bg-[#002147]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center pointer-events-none">
                                      <span className="text-[8px] text-white font-extrabold uppercase tracking-widest text-center px-2 leading-tight">
                                        View Profile
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {alum.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 border border-white shadow-md" title="Verified Alumni">
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
                                  <p className="text-[8px] text-slate-450 font-bold truncate leading-none mt-0.5">
                                    {alum.company}
                                  </p>
                                )}
                              </div>
                            </div>
     
                            <p className="text-slate-500 text-[10.5px] leading-relaxed line-clamp-2 mt-4 text-center italic">
                              &ldquo;{alum.bio || alum.skills || "Proud graduate of Cambridge Court."}&rdquo;
                            </p>
                          </div>
     
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="border-t border-slate-100/60 px-6 py-3 flex items-center justify-center gap-4 bg-slate-50/50"
                          >
                            {alum.user.email ? (
                              <a 
                                href={`mailto:${alum.user.email}`} 
                                className="text-slate-400 hover:text-maroon-700 transition-colors p-1"
                                title="Send Email"
                              >
                                <Mail size={13} className="stroke-[2.5]" />
                              </a>
                            ) : (
                              <Mail size={13} className="text-slate-200" />
                            )}

                            {alum.linkedin ? (
                              <a 
                                href={alum.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-slate-400 hover:text-navy-600 transition-colors p-1"
                                title="LinkedIn Profile"
                              >
                                <LinkedinIcon size={12} />
                              </a>
                            ) : (
                              <LinkedinIcon size={12} className="text-slate-200" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
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
          </div>
        )}

        {/* ── 2. STUDENT VIEW (Mentorship Hub) ─────────────────────────────────── */}
        {viewMode === 'student' && (
          <div className="space-y-8 animate-fade-in">
            <div className="glass-panel p-8 text-center space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
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
                // Determine if they are mapped as a mentor in DB
                const isMentor = alum.isMentor || alum.skills.toLowerCase().includes("mentor") || alum.batch < 2020;
                if (!isMentor) return null;

                return (
                  <motion.div
                    key={alum.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col justify-between h-[340px] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Top metadata */}
                      <div className="flex items-center justify-between text-[8px] font-extrabold uppercase text-slate-450 tracking-wider">
                        <span>Class of {alum.batch || '2016'}</span>
                        <span className={`px-2 py-0.5 rounded-full ${alum.school === 'CCHS' ? 'bg-maroon-50 text-maroon-700' : 'bg-navy-50 text-navy-700'}`}>
                          {alum.school} Network
                        </span>
                      </div>

                      {/* Mentor details */}
                      <div className="flex items-center gap-3.5">
                        <img 
                          src={alum.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(alum.user.name)}`}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
                          alt={alum.user.name} 
                        />
                        <div className="text-left min-w-0">
                          <h4 className="font-serif text-sm font-bold text-[#6b1d2f] truncate">{alum.user.name}</h4>
                          <span className="block text-[9px] text-[#001f3f] font-black uppercase tracking-wider truncate">{alum.role || 'Alumni'}</span>
                          <span className="block text-[8px] text-slate-400 font-bold truncate">{alum.company || 'Global Lead'}</span>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Fields of Guidance:</span>
                        <div className="flex flex-wrap gap-1">
                          {alum.skills.split(',').slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[9px] bg-slate-50 border border-slate-200/50 text-slate-600 font-semibold px-2 py-0.5 rounded-lg">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 italic">
                        &ldquo;{alum.bio || "Available to review CVs and provide interview guidance."}&rdquo;
                      </p>
                    </div>

                    {/* Request CTA Button */}
                    <button
                      onClick={() => setSelectedMentorForReq(alum)}
                      className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-[10px] uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={11} className="text-amber-300 fill-current" />
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
          <div className="space-y-8 animate-fade-in">
            {/* Quick Simulate Login Banner */}
            {!simulatedMentor ? (
              <div className="glass-panel p-12 text-center space-y-6 max-w-xl mx-auto">
                <div className="p-4 bg-maroon-50 rounded-full inline-block text-maroon-700">
                  <Landmark size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-black text-slate-950">Mentor Workstation Portal</h3>
                  <p className="text-xs text-slate-550 leading-relaxed">
                    Select a verified alumni profile from the list below to enter your simulated workstation. Manage student requests and details.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider block text-left">Choose Mentor Profile to Simulate:</label>
                  <select
                    onChange={(e) => {
                      const alum = alumni.find(a => a.id === e.target.value);
                      if (alum) setSimulatedMentor(alum);
                    }}
                    defaultValue=""
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-semibold focus:outline-none focus:border-maroon-700/50"
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
                
                {/* Left Side: Profile HUD details */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-bold text-emerald-700 uppercase tracking-wider">
                      Simulated Workspace Active
                    </span>
                    <button 
                      onClick={() => setSimulatedMentor(null)}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-650 transition-colors uppercase tracking-wider"
                    >
                      Logout
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4">
                    <img 
                      src={simulatedMentor.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(simulatedMentor.user.name)}`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-md"
                      alt={simulatedMentor.user.name} 
                    />
                    <div>
                      <h4 className="font-serif text-lg font-bold text-slate-900">{simulatedMentor.user.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{simulatedMentor.role} at {simulatedMentor.company || 'Global Lead'}</p>
                    </div>
                  </div>

                  {/* Profile completeness meter */}
                  <div className="space-y-1.5 border-t border-b border-slate-100 py-4">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-450 tracking-wider">
                      <span>Profile Completeness</span>
                      <span>{simulatedMentor.profileComplete}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-maroon-600 to-amber-500 h-full rounded-full" style={{ width: `${simulatedMentor.profileComplete}%` }} />
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">E-mail:</span>
                      <span className="font-bold text-slate-700">{simulatedMentor.user.email || '—'}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">School:</span>
                      <span className="font-bold text-slate-700">{simulatedMentor.school} Network Group</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Expertise tags:</span>
                      <span className="font-bold text-slate-700">{simulatedMentor.skills}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Received Mentorship Connections */}
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

                  {/* Filter and display requests */}
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
                          <p className="text-[11px] text-slate-500">You haven&apos;t received any student mentorship requests yet.</p>
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

                              <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 italic leading-relaxed">
                                &ldquo;{req.notes || "No notes provided by student."}&rdquo;
                              </p>

                              <span className="block text-[9px] text-slate-400 font-bold">
                                Received on: {new Date(req.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                              </span>
                            </div>

                            {/* Accept/Decline action buttons */}
                            {req.status === 'PENDING' && (
                              <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                                <button
                                  disabled={actionInProgress === req.id}
                                  onClick={() => handleUpdateMentorshipStatus(req.id, 'ACCEPTED')}
                                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                  {actionInProgress === req.id ? 'Loading...' : 'Accept'}
                                </button>
                                <button
                                  disabled={actionInProgress === req.id}
                                  onClick={() => handleUpdateMentorshipStatus(req.id, 'DECLINED')}
                                  className="flex-1 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 border border-slate-200/50"
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
      </main>
      {/* ================= MODAL: STUDENT REQUEST MENTORSHIP ================= */}
      {selectedMentorForReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" data-lenis-prevent>
          <div className="w-full max-w-md rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-2xl space-y-6 relative animate-scale-in text-left">
            <button 
              onClick={() => setSelectedMentorForReq(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all duration-200 cursor-pointer z-20 hover:scale-105"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={submittingMentorshipReq}
                className={`w-full py-3.5 rounded-xl text-xs font-bold text-white transition-all shadow-md uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-maroon-700/20 active:scale-[0.99] duration-150 flex items-center justify-center gap-2 ${
                  submittingMentorshipReq
                    ? "bg-slate-400 cursor-not-allowed opacity-75"
                    : "bg-[#001f3f] hover:bg-[#00162d]"
                }`}
              >
                {submittingMentorshipReq ? "Submitting Request..." : "Submit Connect Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= DETAIL PROFILE MODAL ================= */}
      {selectedAlumni && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedAlumni(null)}
        >
          <div 
            className="bg-white rounded-[2.5rem] max-w-sm w-full relative border border-slate-100 shadow-2xl overflow-hidden animate-scale-in text-left flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner Background */}
            <div className="relative h-32 w-full bg-gradient-to-r from-[#001f3f] to-[#6b1d2f] overflow-hidden">
              {/* Subtle mesh background grid inside banner */}
              <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:15px_15px]" />
              
              <button
                onClick={() => setSelectedAlumni(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/45 text-white backdrop-blur-xs transition-all duration-200 cursor-pointer z-20 hover:scale-105"
                aria-label="Close details"
              >
                <X size={14} />
              </button>
            </div>

            {/* Profile Content Container */}
            <div className="px-8 pb-8 pt-0 flex flex-col">
              {/* Avatar overlapping the banner */}
              <div className="-mt-16 mb-4 flex justify-center z-10">
                <div className="relative w-28 h-28 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={selectedAlumni.user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=160`} 
                    className="h-full w-full object-cover" 
                    alt={selectedAlumni.user.name} 
                  />
                </div>
              </div>

              {/* Tags: Class & Location & School */}
              <div className="flex items-center justify-center gap-1.5 mb-4 flex-wrap">
                <span className={`px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  selectedAlumni.school === "CCHS" 
                    ? "bg-maroon-50 border border-maroon-100 text-[#6b1d2f]" 
                    : "bg-navy-50 border border-navy-100 text-[#001f3f]"
                }`}>
                  {selectedAlumni.school} Network
                </span>
                <span className="px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[9px] font-bold uppercase tracking-wider">
                  Class of {selectedAlumni.batch}
                </span>
                <span className="px-3.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={9} className="text-amber-600" />
                  <span>{selectedAlumni.city || 'India'}</span>
                </span>
              </div>

              {/* Name and Professional details */}
              <div className="text-center space-y-1.5">
                <h3 className="font-serif text-2xl font-bold text-[#001f3f] tracking-tight leading-none">
                  {selectedAlumni.user.name}
                </h3>
                <p className="text-[10px] text-red-700 font-extrabold uppercase tracking-widest">
                  {selectedAlumni.role || "Alumni"}
                </p>
                {selectedAlumni.company && (
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedAlumni.company}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="w-16 h-[3px] bg-gradient-to-r from-[#6b1d2f] to-[#d4af37] rounded-full mx-auto my-5 opacity-80" />

              {/* Biography / Details */}
              <div className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-center max-h-[165px] overflow-y-auto pr-1 no-scrollbar italic px-2 font-medium">
                {selectedAlumni.bio || selectedAlumni.skills}
              </div>

              {/* Social Links Footer - Premium email call-to-action button */}
              <div className="border-t border-slate-100/80 pt-6 mt-6 flex flex-col gap-3 w-full items-center">
                {selectedAlumni.user.email && (
                  <a 
                    href={`mailto:${selectedAlumni.user.email}`} 
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#fdf5f6] hover:bg-[#fbebee] text-[#6b1d2f] font-extrabold text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border border-[#6b1d2f]/10 shadow-xs hover:scale-[1.01] cursor-pointer"
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

      {/* ================= MODAL: SELF-REGISTRATION ================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay p-4 animate-fade-in" data-lenis-prevent>
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto animate-fade-in no-scrollbar text-left">
            <button 
              onClick={() => setShowRegModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all duration-200 cursor-pointer z-20 hover:scale-105"
              aria-label="Close modal"
            >
              <X size={14} />
            </button>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 font-serif">Alumni Self-Registration Form</h2>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Register to join the school directories. Profiles are reviewed by admins before activation.</p>
            </div>

            <form onSubmit={handleSelfRegistration} className="space-y-4">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                  {regForm.avatarUrl ? (
                    <img src={regForm.avatarUrl} className="h-full w-full object-cover" alt="avatar" />
                  ) : (
                    <Users size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Profile Photo (Optional)</span>
                  <label className="inline-flex h-8 items-center justify-center rounded-xl bg-maroon-700 hover:bg-maroon-800 px-3.5 text-xs font-bold text-white cursor-pointer transition-all duration-200">
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={regForm.name} 
                    onChange={e => setRegForm({...regForm, name: e.target.value})}
                    placeholder="Enter name"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={regForm.email} 
                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                    placeholder="name@email.com"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">School Network</label>
                  <select 
                    value={regForm.school} 
                    onChange={e => setRegForm({...regForm, school: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-850 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none font-semibold"
                  >
                    <option value="CCHS">CCHS Network</option>
                    <option value="CCWS">CCWS Network</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Graduation Batch</label>
                  <input 
                    type="number" 
                    required
                    value={regForm.batch} 
                    onChange={e => setRegForm({...regForm, batch: e.target.value})}
                    placeholder="e.g. 2018"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Program / Stream</label>
                  <input 
                    type="text" 
                    required
                    value={regForm.program} 
                    onChange={e => setRegForm({...regForm, program: e.target.value})}
                    placeholder="e.g. Science"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Company</label>
                  <input 
                    type="text" 
                    value={regForm.company} 
                    onChange={e => setRegForm({...regForm, company: e.target.value})}
                    placeholder="e.g. Microsoft (Optional)"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Designation / Role</label>
                  <input 
                    type="text" 
                    value={regForm.role} 
                    onChange={e => setRegForm({...regForm, role: e.target.value})}
                    placeholder="e.g. Principal Architect (Optional)"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Expertise Skills Tags</label>
                <input 
                  type="text" 
                  required
                  value={regForm.skills} 
                  onChange={e => setRegForm({...regForm, skills: e.target.value})}
                  placeholder="Comma-separated (React, Node, UX Design)"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Location / City</label>
                <input 
                  type="text" 
                  required
                  value={regForm.city} 
                  onChange={e => setRegForm({...regForm, city: e.target.value})}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contact Number (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.phone} 
                  onChange={e => setRegForm({...regForm, phone: e.target.value})}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">LinkedIn Profile Link (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.linkedin} 
                  onChange={e => setRegForm({...regForm, linkedin: e.target.value})}
                  placeholder="e.g. https://linkedin.com/in/username"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Professional Biography (Bio)</label>
                <textarea 
                  value={regForm.bio} 
                  onChange={e => setRegForm({...regForm, bio: e.target.value})}
                  placeholder="Introduce yourself, your career focus, or guidance you can offer..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={submitting || uploadingAvatar}
                className={`w-full py-3.5 rounded-xl text-xs font-bold text-white transition-all shadow-md uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-maroon-700/20 active:scale-[0.99] duration-150 flex items-center justify-center gap-2 ${
                  submitting || uploadingAvatar
                    ? "bg-slate-400 cursor-not-allowed opacity-75"
                    : "bg-maroon-700 hover:bg-maroon-800"
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting Profile...
                  </>
                ) : uploadingAvatar ? (
                  "Uploading Photo..."
                ) : (
                  "Submit Registration Profile"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= REGISTER CTA SECTION ================= */}
      <section className="max-w-7xl mx-auto px-8 mt-24 relative z-10">
        <div className="bg-maroon-700 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl border border-white/10">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-maroon-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-maroon-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex -space-x-2 justify-center mb-2">
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120" alt="alumni" />
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" alt="alumni" />
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120" alt="alumni" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-bold shadow text-slate-200 uppercase">
                +1k
              </div>
            </div>

            <h3 className="text-3xl font-display font-black tracking-tight leading-tight">
              Share Your Journey. Inspire the Next Generation.
            </h3>
            
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              Join verified graduates from CCHS & CCWS. Showcase your professional milestones, connect with peers, and help guide students on their career paths.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setShowRegModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-xl"
              >
                <PlusCircle size={14} className="text-maroon-600" />
                Register Your Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PREMIUM FOOTER ================= */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 mt-20 relative z-10 text-slate-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Column 1: Brand & Legacy */}
          <div className="space-y-4">
            <div className="bg-white/5 inline-block p-1.5 rounded-xl border border-white/10">
              <Logo size={36} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
              A professional joint directories network connecting verified graduates from Cambridge Court High School and Cambridge Court World School globally.
            </p>
          </div>

          {/* Column 2: School Networks */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">School Networks</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <a href="https://cambridgecourtgroup.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Cambridge Court Group
                </a>
              </li>
              <li>
                <a href="https://cambridgecourthighschool.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Cambridge Court High School (CCHS)
                </a>
              </li>
              <li>
                <a href="https://cambridgecourtworldschool.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Cambridge Court World School (CCWS)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Portal</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <span 
                  onClick={() => setShowRegModal(true)} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Register Profile
                </span>
              </li>
              <li>
                <span 
                  onClick={() => window.open("/admin", "_blank")} 
                  className="hover:text-white transition-colors cursor-pointer text-maroon-400 font-bold"
                >
                  Coordinator Portal Access
                </span>
              </li>
              <li>
                <a href="#filters" className="hover:text-white transition-colors">
                  Browse Directory
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Contact Details</h4>
            <p className="text-xs leading-relaxed font-medium">
              Sector 8, Madhyam Marg, Mansarovar,<br />
              Jaipur, Rajasthan 302020<br />
              <a href="mailto:info@cambridgecourtgroup.com" className="text-slate-200 hover:text-white underline transition-colors">
                info@cambridgecourtgroup.com
              </a>
            </p>
          </div>

        </div>

        {/* Bottom Legal Stripe */}
        <div className="max-w-7xl mx-auto px-8 pt-8 mt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© 2026 CCGS Educational Group. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>

      {/* ================= VIDEO LIGHTBOX MODAL ================= */}
      {activeVideoId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setActiveVideoId(null)}
        >
          <div 
            className="w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-white/10 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveVideoId(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <X size={18} />
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
