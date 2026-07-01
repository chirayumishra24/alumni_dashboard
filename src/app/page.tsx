"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, Search, X, Sparkles, PlusCircle, RefreshCw, Users, Mail, Play, Video, Briefcase, GraduationCap, Landmark
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

const ALUMNI_VIDEOS_L2R = [
  { id: "EngW7tLk6rM", title: "Building Green Energy Solutions", name: "Neha Gupta", role: "CEO at EcoTech Solutions", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=360" },
  { id: "k3vBZs812-Y", title: "AI Research at Google DeepMind", name: "Rahul Sharma", role: "AI Research Scientist", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=360" },
  { id: "9h-xV31X3_o", title: "Designing for the Next Billion Users", name: "Sarah Al-Fatah", role: "Lead Product Designer", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=360" },
  { id: "EngW7tLk6rM", title: "Scale-up Strategy at Unicorns", name: "Marcus Chen", role: "VP Growth", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=360" },
  { id: "k3vBZs812-Y", title: "From Campus to VC Funding", name: "Emily Watson", role: "Managing Partner", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=360" },
];

const ALUMNI_VIDEOS_R2L = [
  { id: "9h-xV31X3_o", title: "Launching Space Tech Ventures", name: "Elena Rostova", role: "Aerospace Systems Lead", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=360" },
  { id: "EngW7tLk6rM", title: "Fintech Revolution & Web3", name: "Aarav Mehta", role: "Co-Founder @ PaySphere", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=360" },
  { id: "k3vBZs812-Y", title: "Non-Profit Impact in Africa", name: "Zola Dlamini", role: "Executive Director", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=360" },
  { id: "9h-xV31X3_o", title: "Surgical Robotics Innovation", name: "Kenji Sato", role: "Robotics Architect", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=360" },
  { id: "EngW7tLk6rM", title: "E-Commerce Logistics Scaling", name: "Clara Dupont", role: "Global Operations Lead", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=360" },
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

  // Registration form modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
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

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch (e) {
      console.error("Failed to fetch placement statistics:", e);
    }
  };

  useEffect(() => {
    fetchAlumni();
    fetchStats();
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
      {/* ================= HERO BACKGROUND IMAGE CAROUSEL (INFINITE MARQUEE) ================= */}
      <div className="absolute top-0 left-0 right-0 h-[750px] overflow-hidden pointer-events-none z-0 opacity-100">
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
                className="w-full h-full object-cover filter saturate-[0.8] contrast-[0.95]" 
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
      <section className="max-w-7xl mx-auto px-8 pt-32 pb-24 text-center space-y-6 relative z-10">
        
        <h2 className="text-4xl md:text-[4.5rem] font-serif font-bold text-[#1b2a41] tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Connecting Past <span className="font-serif italic font-extrabold text-maroon-600">Achievers</span>, <br className="hidden md:inline" />
          Inspiring Future <span className="font-serif italic font-extrabold text-navy-650">Leaders</span>
        </h2>

        <p className="text-base md:text-lg text-slate-650 max-w-2xl mx-auto leading-relaxed font-sans font-medium italic">
          &quot;Our legacy is built in the halls of Cambridge Court; our destiny is reflected in the global achievements of our alumni.&quot;
        </p>
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
                      <span className="text-white font-extrabold">{tc.count}</span>
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
                    onClick={() => setSelectedAlumni(alum)}
                    className="group bg-white rounded-3xl border border-slate-100 hover:border-maroon-700/20 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-[360px] cursor-pointer"
                  >
                    
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Header: Class batch & City */}
                        <div className="flex items-center justify-between text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-5">
                          <span>Class of {alum.batch}</span>
                          <div className="flex items-center gap-1">
                            <MapPin size={9} className="text-slate-350" />
                            <span>{alum.city || 'India'}</span>
                          </div>
                        </div>

                        {/* Centered Image with Background Circle */}
                        <div className="flex justify-center mb-4">
                          <div className="relative w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5">
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                              <img 
                                src={alum.user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120`} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                alt={alum.user.name} 
                              />
                              {/* Hover "Click to zoom" Overlay */}
                              <div className="absolute inset-0 bg-[#002147]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[8px] text-white font-extrabold uppercase tracking-widest text-center px-2 leading-tight">
                                  Click To Zoom
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content centered below circle */}
                        <div className="text-center space-y-1">
                          <h3 className="font-serif text-sm font-bold text-[#6b1d2f] truncate transition-colors">
                            {alum.user.name}
                          </h3>
                          <p className="text-[9px] text-red-700 font-extrabold uppercase tracking-wide truncate mt-0.5">
                            {alum.role || "Alumni"}
                          </p>
                          {alum.company && (
                            <p className="text-[8px] text-slate-400 font-medium truncate leading-none mt-0.5">
                              {alum.company}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Biography / Details */}
                      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 mt-4 text-center">
                        {alum.bio || alum.skills}
                      </p>
                    </div>

                    {/* Footer Links (Centered Envelope) */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="border-t border-slate-100/60 px-6 py-3.5 flex items-center justify-center bg-slate-50/50"
                    >
                      {alum.user.email ? (
                        <a 
                          href={`mailto:${alum.user.email}`} 
                          className="text-slate-400 hover:text-maroon-700 transition-colors"
                          title="Send Email"
                        >
                          <Mail size={13} className="stroke-[2.5]" />
                        </a>
                      ) : (
                        <Mail size={13} className="text-slate-200" />
                      )}
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
