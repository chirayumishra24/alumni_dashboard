"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Calendar, Star, MapPin, Check, X, Sparkles, Send, 
  RefreshCw, UserCheck, Filter, Mail, Copy, PlusCircle, ShieldCheck, Search, Trash2
} from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase";
import LoginGate from "@/components/LoginGate";
import Sidebar from "@/components/Sidebar";

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
  phone?: string;
  linkedin?: string;
  bio?: string | null;
}

interface CareerPreference {
  id: string;
  careerChoice: string;
  country: string;
  preferenceOrder: number;
}

interface StudentProfile {
  id: string;
  userId: string;
  batch: number;
  program: string;
  user: User;
  preferences: CareerPreference[];
}

interface Mentorship {
  id: string;
  studentId: string;
  alumniId: string;
  status: string;
  notes: string | null;
  createdAt: string;
  student: StudentProfile;
  alumni: AlumniProfile;
}

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  meetingUrl: string | null;
  bannerUrl: string | null;
}

interface WidgetSpeak {
  id: string;
  alumniProfileId: string;
  quote: string;
  isApproved: boolean;
  alumni: AlumniProfile;
}

export default function AdminPage() {
  return (
    <LoginGate>
      <AdminDashboardContent />
    </LoginGate>
  );
}

function AdminDashboardContent() {
  const [data, setData] = useState<{
    alumni: AlumniProfile[];
    students: StudentProfile[];
    mentorships: Mentorship[];
    events: Event[];
    widgets: WidgetSpeak[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("OVERVIEW");
  const [activeRole, setActiveRole] = useState<"ADMIN" | "ALUMNI" | "STUDENT">("ADMIN");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Filtering states
  const [adminSchoolFilter, setAdminSchoolFilter] = useState<string>("All");
  const [studentSchoolFilter, setStudentSchoolFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Email Draft Modal State
  const [draftEmailTarget, setDraftEmailTarget] = useState<AlumniProfile | null>(null);
  
  // Self-Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
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

  // Student inputs
  const [pref1Role, setPref1Role] = useState("Software Engineer");
  const [pref1Country, setPref1Country] = useState("United Kingdom");
  const [pref2Role, setPref2Role] = useState("IAS Officer");
  const [pref2Country, setPref2Country] = useState("India");
  const [mentorshipNote, setMentorshipNote] = useState("");
  const [requestingMentorId, setRequestingMentorId] = useState<string | null>(null);

  // File upload state for Firebase Storage
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Fetch all dashboard data from local database
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data");
      const json = await res.json();
      if (res.ok) {
        setData(json);
        // Set default selected users for testing perspectives
        const verifiedAlumniList = json.alumni.filter((a: AlumniProfile) => a.isVerified);
        if (verifiedAlumniList.length > 0 && selectedUser === "") {
          setSelectedUser(verifiedAlumniList[0].id); // Default Alumni user id
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Error connecting to database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    window.location.reload();
  };

  // Switch role and update perspective user defaults
  const handleRoleChange = (role: "ADMIN" | "ALUMNI" | "STUDENT") => {
    setActiveRole(role);
    if (!data) return;
    const verifiedAlumni = data.alumni.filter(a => a.isVerified);
    if (role === "ALUMNI" && verifiedAlumni.length > 0) {
      setSelectedUser(verifiedAlumni[0].id);
    } else if (role === "STUDENT" && data.students.length > 0) {
      setSelectedUser(data.students[0].id);
      // Load current student preferences into fields
      const student = data.students[0];
      if (student.preferences.length > 0) {
        setPref1Role(student.preferences[0].careerChoice);
        setPref1Country(student.preferences[0].country);
      }
      if (student.preferences.length > 1) {
        setPref2Role(student.preferences[1].careerChoice);
        setPref2Country(student.preferences[1].country);
      }
    }
  };

  // Perform mentorship response action (Accept / Decline)
  const handleMentorshipAction = async (id: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch("/api/data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateMentorshipStatus", id, status }),
      });
      if (res.ok) {
        showToast(`Request ${status.toLowerCase()} successfully`, "success");
        fetchData();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch {
      showToast("Action error", "error");
    }
  };

  // Approve / Disapprove testimonial quote
  const handleWidgetApproval = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch("/api/data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateWidgetApproval", id, isApproved }),
      });
      if (res.ok) {
        showToast(isApproved ? "Testimonial approved" : "Testimonial removed from widget", "success");
        fetchData();
      }
    } catch {
      showToast("Approval error", "error");
    }
  };

  // Verify a pending alumnus profile
  const handleVerifyAlumni = async (id: string) => {
    try {
      const res = await fetch("/api/data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verifyAlumni", id }),
      });
      if (res.ok) {
        showToast("Alumni profile successfully verified and activated!", "success");
        fetchData();
      } else {
        showToast("Verification failed", "error");
      }
    } catch {
      showToast("Verification action error", "error");
    }
  };

  // Delete an alumnus profile permanently
  const handleDeleteAlumni = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this alumni profile? This action cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch("/api/data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteAlumni", id }),
      });
      if (res.ok) {
        showToast("Alumni profile permanently deleted", "success");
        fetchData();
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to delete alumni profile", "error");
      }
    } catch {
      showToast("Delete action error", "error");
    }
  };

  // Submit Alumni Self-Registration
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
        showToast("Thanks for registering! Profile submitted for review.", "success");
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
        fetchData();
      } else {
        showToast(json.error || "Registration failed", "error");
      }
    } catch {
      showToast("Registration request error", "error");
    }
  };

  // Update student career goals
  const handleUpdatePreferences = async () => {
    const student = data?.students.find(s => s.id === selectedUser);
    if (!student) return;

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePreferences",
          studentProfileId: student.id,
          preferences: [
            { careerChoice: pref1Role, country: pref1Country },
            { careerChoice: pref2Role, country: pref2Country }
          ]
        }),
      });

      if (res.ok) {
        showToast("Career goals updated successfully", "success");
        fetchData();
      } else {
        showToast("Update failed", "error");
      }
    } catch {
      showToast("Goal update error", "error");
    }
  };

  // Submit mentorship request
  const handleRequestMentorship = async (alumniId: string) => {
    const student = data?.students.find(s => s.id === selectedUser);
    if (!student) return;

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createMentorship",
          studentId: student.id,
          alumniId,
          notes: mentorshipNote || "I would appreciate your mentorship and guidance!"
        }),
      });

      if (res.ok) {
        showToast("Mentorship request sent successfully!", "success");
        setMentorshipNote("");
        setRequestingMentorId(null);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || "Request failed", "error");
      }
    } catch {
      showToast("Request error", "error");
    }
  };

  // File upload to Firebase Storage demo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const path = `resumes/${Date.now()}_${file.name}`;
      const url = await uploadFileToStorage(file, path);
      setUploadedUrl(url);
      showToast("File uploaded to Firebase Storage!", "success");
    } catch (e) {
      console.error(e);
      showToast("Upload failed", "error");
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="animate-spin text-violet-600" />
          <span className="text-xs font-bold tracking-wider text-slate-500">LOADING DATABASE RELATIONSHIPS...</span>
        </div>
      </div>
    );
  }

  // Filtered lists
  const verifiedAlumniList = data?.alumni.filter(a => a.isVerified) || [];
  const filteredAlumniForAdmin = verifiedAlumniList.filter(a => {
    const matchSchool = adminSchoolFilter === "All" || a.school === adminSchoolFilter;
    const matchSearch = a.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.company && a.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (a.role && a.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        a.skills.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSchool && matchSearch;
  });

  const pendingAlumniList = data?.alumni.filter(a => !a.isVerified) || [];
  const filteredPendingAlumni = pendingAlumniList.filter(a => {
    if (adminSchoolFilter === "All") return true;
    return a.school === adminSchoolFilter;
  });

  // Metrics
  const totalAlumni = filteredAlumniForAdmin.length;
  const completedProfiles = filteredAlumniForAdmin.filter(a => a.profileComplete >= 75).length || 0;
  const partialProfiles = filteredAlumniForAdmin.filter(a => a.profileComplete >= 50 && a.profileComplete < 75).length || 0;
  const incompleteProfiles = filteredAlumniForAdmin.filter(a => a.profileComplete < 50).length || 0;

  const activeAlumni = data?.alumni.find(a => a.id === selectedUser);
  const activeStudent = data?.students.find(s => s.id === selectedUser);

  // Email Draft content helpers
  const getEmailSubject = (profile: AlumniProfile) => `Verify your CCGS Alumni Hub Account - ${profile.user.name}`;
  const getEmailBody = (profile: AlumniProfile) => 
`Dear ${profile.user.name},

Thank you for registering on the CCGS Alumni Hub portal for ${profile.school}!

In order to complete your profile verification and publish your details to the school website directory, we need to quickly verify your email and credentials.

Please reply directly to this email or contact our support team at support@skillizee.io to confirm your graduation details. Once verified, your profile and company/role information will go live immediately on the school platform.

Warm regards,
CCGS Alumni Coordinator Team
support@skillizee.io`;

  const handleCopyEmail = (profile: AlumniProfile) => {
    const text = `Subject: ${getEmailSubject(profile)}\n\n${getEmailBody(profile)}`;
    navigator.clipboard.writeText(text);
    showToast("Email draft copied to clipboard!", "success");
  };

  const getMatchingScore = (alumni: AlumniProfile, student: StudentProfile) => {
    let score = 0;
    const pref1 = student.preferences[0];
    const pref2 = student.preferences[1];

    if (pref1) {
      if (alumni.role?.toLowerCase().includes(pref1.careerChoice.toLowerCase()) || 
          alumni.skills?.toLowerCase().includes(pref1.careerChoice.toLowerCase())) {
        score += 50;
      }
      if (alumni.country.toLowerCase() === pref1.country.toLowerCase()) {
        score += 30;
      }
    }
    if (pref2) {
      if (alumni.role?.toLowerCase().includes(pref2.careerChoice.toLowerCase())) {
        score += 15;
      }
      if (alumni.country.toLowerCase() === pref2.country.toLowerCase()) {
        score += 5;
      }
    }
    return score;
  };

  return (
    <div className="min-h-screen executive-mesh-bg text-slate-800 font-sans flex flex-col lg:flex-row lg:p-6 lg:gap-6 overflow-x-hidden selection:bg-maroon-600 selection:text-white grid-bg relative">

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border p-4 shadow-xl glass-card animate-fade-in ${
          toast.type === "success" 
            ? "border-emerald-200/50 bg-emerald-50/70 text-emerald-805" 
            : "border-rose-200/50 bg-rose-50/70 text-rose-805"
        }`}>
          <Sparkles size={18} className={toast.type === "success" ? "text-emerald-600" : "text-rose-600"} />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        pendingCount={pendingAlumniList.length} 
        onLogout={handleLogout} 
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Top Navbar */}
        <header className="mb-6 p-5 rounded-[2rem] glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-6 z-30 shadow-lg">
          <div>
            <span className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">Dashboard</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
              Coordinator Workspace
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRegModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white shadow-sm transition-all"
            >
              <PlusCircle size={14} /> Register Alumni
            </button>

            {/* Quick perspective swapping for testing */}
            <div className="flex items-center gap-1.5 rounded-xl bg-white/30 border border-white/60 p-1">
              {(["ADMIN", "ALUMNI", "STUDENT"] as const).map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all ${
                    activeRole === role 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/40" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {role} View
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Simulation Selector Bar */}
        <div className="mb-6 p-4 rounded-2xl glass-card text-xs text-slate-550 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Perspective Identity:</span>
            {activeRole === "ADMIN" && (
              <span className="font-bold text-violet-755 flex items-center gap-1.5 bg-violet-50/50 px-2.5 py-0.5 rounded border border-violet-100/50">
                <UserCheck size={12} /> Coordinator Session (Admin Access)
              </span>
            )}
            {activeRole === "ALUMNI" && (
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="glass-input rounded px-2 py-0.5 text-xs text-slate-800 font-semibold focus:outline-none"
              >
                {data?.alumni.filter(a => a.isVerified).map(a => (
                  <option key={a.id} value={a.id}>{a.user.name} ({a.school} Alumni)</option>
                ))}
              </select>
            )}
            {activeRole === "STUDENT" && (
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="glass-input rounded px-2 py-0.5 text-xs text-slate-800 font-semibold focus:outline-none"
              >
                {data?.students.map(s => (
                  <option key={s.id} value={s.id}>{s.user.name} (Grad Batch {s.batch})</option>
                ))}
              </select>
            )}
          </div>
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Admin Sandbox</span>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 overflow-y-auto pr-2">

          {/* School filter toggle (shown on Overview & Directory & Testimonials) */}
          {(currentTab === "OVERVIEW" || currentTab === "DIRECTORY" || currentTab === "TESTIMONIALS" || currentTab === "PENDING") && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter School Network:</span>
              </div>
              <div className="flex gap-2">
                {["All", "CCHS", "CCWS"].map((sch) => (
                  <button
                     key={sch}
                     onClick={() => setAdminSchoolFilter(sch)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                       adminSchoolFilter === sch
                         ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                         : "glass-button"
                    }`}
                  >
                    {sch === "All" ? "CCIS Combined" : `${sch} Network`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB: OVERVIEW ================= */}
          {currentTab === "OVERVIEW" && (
            <div className="space-y-8 animate-fade-in">
              {/* Metrics cards grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card p-6 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50/50 text-violet-600 border border-violet-100">
                    <Users size={20} />
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{totalAlumni}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Directory Count ({adminSchoolFilter === "All" ? "Group" : adminSchoolFilter})</p>
                </div>

                <div className="glass-card p-6 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50/50 text-amber-600 border border-amber-100">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{filteredPendingAlumni.length}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Pending Approval Queue</p>
                </div>

                <div className="glass-card p-6 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50/50 text-emerald-600 border border-emerald-100">
                    <Star size={20} />
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">
                    {data?.mentorships.filter(m => m.status === "ACCEPTED" && (adminSchoolFilter === "All" || m.alumni.school === adminSchoolFilter)).length || 0}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Active Mentorship Matches</p>
                </div>

                <div className="glass-card p-6 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50/50 text-indigo-600 border border-indigo-100">
                    <Calendar size={20} />
                  </div>
                  <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{data?.events.length || 0}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Upcoming Events Scheduled</p>
                </div>
              </div>

              {/* Completion funnel and widget manager */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Onboarding Complete Funnel */}
                <div className="rounded-3xl glass-panel p-8 flex flex-col justify-between shadow-lg">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Profile Completeness Funnel</h2>
                    <p className="text-xs text-slate-500 mb-6">Database fields filled index percentages.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                          <span className="text-emerald-600">Complete Profiles (&ge;75%)</span>
                          <span>{completedProfiles} ({totalAlumni ? Math.round((completedProfiles/totalAlumni)*100) : 0}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/65">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${totalAlumni ? (completedProfiles/totalAlumni)*100 : 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                          <span className="text-violet-600">Semi-Complete (50-74%)</span>
                          <span>{partialProfiles} ({totalAlumni ? Math.round((partialProfiles/totalAlumni)*100) : 0}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/65">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${totalAlumni ? (partialProfiles/totalAlumni)*100 : 0}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                          <span className="text-slate-605">Incomplete (&lt;50%)</span>
                          <span>{incompleteProfiles} ({totalAlumni ? Math.round((incompleteProfiles/totalAlumni)*100) : 0}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/65">
                          <div className="h-full bg-slate-400 rounded-full" style={{ width: `${totalAlumni ? (incompleteProfiles/totalAlumni)*100 : 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200/60">
                    <button 
                      onClick={() => showToast("Profile completion alerts pushed to target emails!", "success")}
                      className="w-full py-2.5 rounded-xl glass-button text-xs font-bold text-violet-755 transition-all"
                    >
                      Send Completion Reminders
                    </button>
                  </div>
                </div>

                {/* Testimonials iframe manager */}
                <div className="lg:col-span-2 rounded-3xl glass-panel p-8 flex flex-col justify-between shadow-lg">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Embeddable Testimonials Widget</h2>
                    <p className="text-xs text-slate-500 mb-4">Export approved testimonials quote widgets directly into CCHS or CCWS school CMS systems.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white/20 border border-white/60 p-4 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-violet-650 tracking-wider block">Widget Preview Frame (Active Filters)</span>
                      <div className="border border-white/60 bg-white/30 rounded-xl p-4 text-xs italic text-slate-500 leading-relaxed min-h-[80px] flex items-center justify-center shadow-sm">
                        {data?.widgets.filter(w => w.isApproved && (adminSchoolFilter === "All" || w.alumni.school === adminSchoolFilter)).length === 0 ? (
                          <span>No approved testimonials for this school network selection.</span>
                        ) : (
                          <span>&quot;{data?.widgets.filter(w => w.isApproved && (adminSchoolFilter === "All" || w.alumni.school === adminSchoolFilter))[0]?.quote}&quot;</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 text-[10.5px] font-mono text-slate-300 select-all cursor-pointer">
                      {`<iframe src="https://alumni-dashboard-39zq.vercel.app/api/alumni?school=${adminSchoolFilter === "All" ? "CCIS" : adminSchoolFilter}" width="100%" height="250"></iframe>`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: PENDING ================= */}
          {currentTab === "PENDING" && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-3xl glass-panel p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Pending Registrations Review Queue</h2>
                    <p className="text-xs text-slate-500">Validate graduates self-registration data before activating live profiles.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/30 text-slate-655 border border-white/60">
                    {filteredPendingAlumni.length} Requests
                  </span>
                </div>

                <div className="space-y-4">
                  {filteredPendingAlumni.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200/80 rounded-2xl bg-white/10">
                      <Check size={28} className="mx-auto mb-2 text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider block text-slate-500">Queue is Clear</span>
                      <p className="text-[10px] text-slate-400 mt-1">All self-registrations currently verified.</p>
                    </div>
                  ) : (
                    filteredPendingAlumni.map((alum) => (
                      <div key={alum.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/50 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <img src={alum.user.avatarUrl || ""} className="h-11 w-11 rounded-xl border border-slate-200" alt="avatar" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900">{alum.user.name}</h4>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                alum.school === "CCHS" ? "bg-violet-50 text-violet-650 border border-violet-100/50" : "bg-emerald-50 text-emerald-650 border border-emerald-100/50"
                              }`}>
                                {alum.school}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-semibold">{alum.role || "Graduate"} @ {alum.company || "No Company"}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {alum.user.email} {alum.phone && `| Phone: ${alum.phone}`} | Batch {alum.batch} ({alum.program}) | City: {alum.city}
                            </p>
                            {alum.linkedin && (
                              <p className="text-[10px] text-maroon-700 font-semibold mt-1">LinkedIn: {alum.linkedin}</p>
                            )}
                            {alum.bio && (
                              <p className="text-[11px] text-slate-650 font-medium italic mt-2 p-3 bg-black/[0.015] border border-black/5 rounded-xl">
                                Biography: &quot;{alum.bio}&quot;
                              </p>
                            )}
                            <p className="text-[10px] text-slate-500 mt-1 italic">&quot;Skills: {alum.skills}&quot;</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => setDraftEmailTarget(alum)}
                            className="px-3.5 py-2 rounded-xl border border-white/80 bg-white/60 hover:bg-white/95 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Mail size={12} /> Draft
                          </button>
                          
                          <button
                            onClick={() => handleVerifyAlumni(alum.id)}
                            className="px-4 py-2 rounded-xl bg-maroon-600 hover:bg-maroon-700 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <Check size={12} /> Verify & Activate
                          </button>

                          <button
                            onClick={() => handleDeleteAlumni(alum.id)}
                            className="p-2 rounded-xl border border-slate-200 hover:border-rose-250 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all active:scale-95 shadow-sm"
                            title="Delete Registration Request"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: DIRECTORY ================= */}
          {currentTab === "DIRECTORY" && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-3xl glass-panel p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Alumni Directory</h2>
                    <p className="text-xs text-slate-500">Total verified graduates live on school sites.</p>
                  </div>
                  
                  {/* Search bar inside directory tab */}
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Search size={14} />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Search name, role, company..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Name & Phone (Coordinator Only)</th>
                        <th className="pb-3">School</th>
                        <th className="pb-3">Program & Batch</th>
                        <th className="pb-3">Company & Role</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3 text-center">Mentor Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAlumniForAdmin.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            No matching alumni profiles found in the database.
                          </td>
                        </tr>
                      ) : (
                        filteredAlumniForAdmin.map((alum) => (
                          <tr key={alum.id} className="text-slate-655 hover:bg-slate-50/50">
                            <td className="py-4 font-bold text-slate-900">
                              <div>{alum.user.name}</div>
                              {alum.phone ? (
                                <div className="text-[10px] font-semibold text-violet-650 mt-0.5">Phone: {alum.phone}</div>
                              ) : (
                                <div className="text-[10px] font-normal text-slate-400 mt-0.5">No contact added</div>
                              )}
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                alum.school === "CCHS" 
                                  ? "bg-violet-50 text-violet-600 border border-violet-100" 
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              } border`}>
                                {alum.school}
                              </span>
                            </td>
                            <td className="py-4">{alum.program} ({alum.batch})</td>
                            <td className="py-4">
                              {alum.company ? (
                                <span>{alum.company} — <span className="font-semibold text-slate-500">{alum.role}</span></span>
                              ) : (
                                <span className="text-slate-400">Not specified</span>
                              )}
                            </td>
                            <td className="py-4 text-slate-500">{alum.city || "Mumbai"}, {alum.country || "India"}</td>
                            <td className="py-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                alum.isMentor 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                {alum.isMentor ? "Mentor" : "Alumnus"}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleDeleteAlumni(alum.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                                title="Delete Profile"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: TESTIMONIALS ================= */}
          {currentTab === "TESTIMONIALS" && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-3xl glass-panel p-8 shadow-lg">
                <h2 className="text-sm font-bold text-slate-900 mb-2">Alumni Testimonials</h2>
                <p className="text-xs text-slate-500 mb-6">Review, approve, or hide testimonials submitted by verified graduates.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data?.widgets
                    .filter(w => adminSchoolFilter === "All" || w.alumni.school === adminSchoolFilter)
                    .map((widget) => (
                      <div key={widget.id} className="glass-card p-5 space-y-4 flex flex-col justify-between shadow-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-2">
                              <img src={widget.alumni.user.avatarUrl || ""} className="h-7 w-7 rounded-lg border border-slate-200" alt="avatar" />
                              <div>
                                <span className="text-xs font-bold block text-slate-800">{widget.alumni.user.name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{widget.alumni.school} Network</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleWidgetApproval(widget.id, !widget.isApproved)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wide transition-all border ${
                                widget.isApproved 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                  : "bg-amber-50 border-amber-200 text-amber-700"
                              }`}
                            >
                              {widget.isApproved ? "Approved & Live" : "Pending Approval"}
                            </button>
                          </div>
                          
                          <p className="text-xs italic text-slate-600 font-medium leading-relaxed">&quot;{widget.quote}&quot;</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: MENTORSHIPS ================= */}
          {currentTab === "MENTORSHIPS" && (
            <div className="space-y-6 animate-fade-in">
              <div className="rounded-3xl glass-panel p-8 shadow-lg">
                <h2 className="text-sm font-bold text-slate-900 mb-2">Mentorship Connections & Inquiries</h2>
                <p className="text-xs text-slate-500 mb-6">Overview of student-to-alumni mentor matchmaking and request status.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Student Mentee</th>
                        <th className="pb-3">Target Mentor</th>
                        <th className="pb-3">Initial Inquiry Note</th>
                        <th className="pb-3">Date Requested</th>
                        <th className="pb-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data?.mentorships.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">No mentorship connections initiated yet.</td>
                        </tr>
                      ) : (
                        data?.mentorships.map((req) => (
                          <tr key={req.id} className="text-slate-700 hover:bg-slate-50/50">
                            <td className="py-4 font-bold text-slate-900">
                              <div>{req.student.user.name}</div>
                              <div className="text-[10px] font-normal text-slate-400 mt-0.5">{req.student.program} (Expected {req.student.batch})</div>
                            </td>
                            <td className="py-4 font-bold text-slate-900">
                              <div>{req.alumni.user.name}</div>
                              <div className="text-[10px] font-normal text-slate-400 mt-0.5">{req.alumni.school} ({req.alumni.role})</div>
                            </td>
                            <td className="py-4 max-w-xs truncate italic text-slate-500">&quot;{req.notes}&quot;</td>
                            <td className="py-4 text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                            <td className="py-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                                req.status === "ACCEPTED" 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                  : req.status === "DECLINED" 
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-705 border-amber-200"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: STUDENT_PERSPECTIVE ================= */}
          {currentTab === "STUDENT_PERSPECTIVE" && activeStudent && (
            <div className="space-y-8 animate-fade-in">
              <div className="rounded-3xl glass-panel p-8 flex flex-col md:flex-row justify-between gap-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <img src={activeStudent.user.avatarUrl || ""} className="h-14 w-14 rounded-xl border border-slate-200 shadow-sm" alt="avatar" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Welcome, {activeStudent.user.name}</h2>
                    <p className="text-xs text-violet-650 font-semibold">{activeStudent.program} | Grad Batch {activeStudent.batch}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Define your career fields to find matching graduates.</p>
                  </div>
                </div>

                {/* Resume upload widget */}
                <div className="flex flex-col gap-2 rounded-2xl glass-card p-4 max-w-sm w-full shadow-sm">
                  <span className="text-xs font-bold text-slate-800">Resume Vault (Firebase Storage)</span>
                  <p className="text-[10px] text-slate-400">Store your PDF CV directly inside the Firebase Storage project bucket.</p>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <label className="flex h-9 items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 px-4 text-xs font-bold text-white cursor-pointer transition-all">
                      {uploadingFile ? "Uploading..." : "Upload Resume PDF"}
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        disabled={uploadingFile}
                      />
                    </label>
                    {uploadedUrl && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check size={12} /> Upload Complete!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences Configuration & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration form */}
                <div className="rounded-3xl glass-panel p-8 space-y-6 shadow-lg">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Configure Goals</h3>
                    <p className="text-xs text-slate-500">Trigger recommendation matchmaking index calculations.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block font-semibold">Primary Path Choice</span>
                      <input 
                        type="text" 
                        value={pref1Role} 
                        onChange={(e) => setPref1Role(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={pref1Country} 
                        onChange={(e) => setPref1Country(e.target.value)}
                        placeholder="Target Location (e.g. United Kingdom)"
                        className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Secondary Choice</span>
                      <input 
                        type="text" 
                        value={pref2Role} 
                        onChange={(e) => setPref2Role(e.target.value)}
                        placeholder="e.g. IAS Officer"
                        className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={pref2Country} 
                        onChange={(e) => setPref2Country(e.target.value)}
                        placeholder="Target Location (e.g. India)"
                        className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdatePreferences}
                    className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white transition-all"
                  >
                    Save Preferences
                  </button>
                </div>                {/* Matchmaking directory */}
                <div className="lg:col-span-2 rounded-3xl glass-panel p-8 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Target Matchmaking Index</h3>
                      <p className="text-xs text-slate-400">Match score based on your specified target fields.</p>
                    </div>

                    <div className="flex gap-1.5 rounded-lg bg-white/20 p-1 border border-white/60 self-start">
                      {["All", "CCHS", "CCWS"].map(sch => (
                        <button
                          key={sch}
                          onClick={() => setStudentSchoolFilter(sch)}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                            studentSchoolFilter === sch
                              ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                              : "text-slate-500 hover:text-slate-805"
                          }`}
                        >
                          {sch}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data?.alumni
                      .filter(a => a.isVerified)
                      .filter(a => studentSchoolFilter === "All" || a.school === studentSchoolFilter)
                      .map((alum) => ({
                        alum,
                        score: getMatchingScore(alum, activeStudent)
                      }))
                      .sort((a, b) => b.score - a.score)
                      .map(({ alum, score }) => (
                        <div key={alum.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:scale-[1.005] transition-all">
                          <div className="flex gap-4">
                            <img src={alum.user.avatarUrl || ""} className="h-11 w-11 rounded-xl border border-slate-200" alt="avatar" />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900">{alum.user.name}</h4>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  alum.school === "CCHS" ? "bg-violet-50 text-violet-600 border border-violet-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                } border`}>
                                  {alum.school} Network
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  score >= 75 
                                    ? "bg-emerald-55 text-emerald-700 border-emerald-200" 
                                    : score >= 40 
                                    ? "bg-violet-50 text-violet-600 border-violet-100" 
                                    : "bg-slate-100 text-slate-550 border-slate-200"
                                }`}>
                                  Match index: {score}%
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 font-semibold">{alum.role} @ <span className="text-slate-900 font-bold">{alum.company}</span></p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin size={12} className="text-slate-400" /> {alum.city}, {alum.country} | Batch {alum.batch}
                              </p>
                            </div>
                          </div>

                          <div>
                            {requestingMentorId === alum.id ? (
                              <div className="space-y-2 mt-3 md:mt-0">
                                <textarea 
                                  value={mentorshipNote} 
                                  onChange={(e) => setMentorshipNote(e.target.value)}
                                  placeholder="Type note to send..."
                                  className="w-full md:w-64 h-16 glass-input rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleRequestMentorship(alum.id)}
                                    className="h-8 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
                                  >
                                    <Send size={12} /> Send Inquiry
                                  </button>
                                  <button
                                    onClick={() => setRequestingMentorId(null)}
                                    className="h-8 px-3 rounded-lg bg-slate-100 text-xs text-slate-500 hover:text-slate-700 border border-slate-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setRequestingMentorId(alum.id);
                                  setMentorshipNote(`Hi ${alum.user.name.split(" ")[0]}, I am current student focusing on ${pref1Role}. I would love to ask you a couple of questions about working in ${alum.company}!`);
                                }}
                                className="w-full md:w-auto h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
                              >
                                Request Mentoring
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}          {/* ================= TAB: ALUMNI_PERSPECTIVE ================= */}
          {currentTab === "ALUMNI_PERSPECTIVE" && activeAlumni && (
            <div className="space-y-8 animate-fade-in">
              <div className="rounded-3xl glass-panel p-8 shadow-lg">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={activeAlumni.user.avatarUrl || ""} className="h-16 w-16 rounded-xl border border-slate-200 shadow-sm" alt="avatar" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">{activeAlumni.user.name}</h2>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          activeAlumni.school === "CCHS" 
                            ? "bg-maroon-50 text-maroon-700 border-maroon-100" 
                            : "bg-navy-50 text-navy-700 border-navy-100"
                        }`}>
                          {activeAlumni.school} Alumni
                        </span>
                      </div>
                      <p className="text-xs text-maroon-700 font-semibold">{activeAlumni.role} @ {activeAlumni.company}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{activeAlumni.city}, {activeAlumni.country} | Batch {activeAlumni.batch}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="rounded-xl glass-card px-4 py-3 text-center shadow-sm">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Completeness</span>
                      <span className="text-lg font-extrabold text-emerald-600">{activeAlumni.profileComplete}%</span>
                    </div>

                    <div className="rounded-xl glass-card px-4 py-3 flex items-center gap-4 shadow-sm">
                      <div>
                        <span className="block text-xs font-bold text-slate-805">Mentoring Status</span>
                        <span className="text-[10px] text-slate-400 leading-normal">Open to guide students</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={activeAlumni.isMentor} 
                        onChange={async () => {
                          showToast(`Mentorship availability toggled!`, "success");
                          await fetch("/api/data", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "updateMentorshipStatus", id: "dummy", status: "PENDING" })
                          });
                          fetchData();
                        }}
                        className="h-5 w-10 rounded-full bg-slate-200 accent-violet-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Requests Inbound List */}
                <div className="lg:col-span-2 rounded-3xl glass-panel p-8 shadow-lg">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Student Mentorship Inquiries</h3>
                  <p className="text-xs text-slate-400 mb-6">Manage incoming guidance request inquiries from current students.</p>

                  <div className="space-y-4">
                    {data?.mentorships.filter(m => m.alumniId === activeAlumni.id).length === 0 ? (
                      <div className="text-center py-12 text-slate-405 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        No mentorship requests received at this time.
                      </div>
                    ) : (
                      data?.mentorships.filter(m => m.alumniId === activeAlumni.id).map((req) => (
                        <div key={req.id} className="glass-card p-5 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={req.student.user.avatarUrl || ""} className="h-9 w-9 rounded-xl border border-slate-200" alt="avatar" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{req.student.user.name}</h4>
                                <p className="text-[10px] text-slate-400">{req.student.program} (Expected {req.student.batch})</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {req.status === "PENDING" ? (
                                <>
                                  <button
                                    onClick={() => handleMentorshipAction(req.id, "ACCEPTED")}
                                    className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-650 border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 transition-all"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleMentorshipAction(req.id, "DECLINED")}
                                    className="h-8 w-8 rounded-lg bg-rose-50 text-rose-650 border border-rose-100 flex items-center justify-center hover:bg-rose-100 transition-all"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border ${
                                  req.status === "ACCEPTED" 
                                    ? "bg-emerald-50 text-emerald-650 border-emerald-100" 
                                    : "bg-rose-50 text-rose-600 border-rose-100"
                                }`}>
                                  {req.status}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="rounded-xl bg-white/20 p-3.5 border border-white/40 text-xs text-slate-600 italic leading-relaxed shadow-sm">
                            &quot;{req.notes}&quot;
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bio & Skills Column */}
                <div className="space-y-8">
                  {activeAlumni.bio && (
                    <div className="rounded-3xl glass-panel p-8 space-y-4 shadow-lg">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Alumni Biography</h3>
                        <p className="text-xs text-slate-400">Brief summary displayed to public users.</p>
                      </div>
                      <p className="text-xs text-slate-750 leading-relaxed italic bg-white/30 p-4 rounded-2xl border border-white/80">
                        &quot;{activeAlumni.bio}&quot;
                      </p>
                    </div>
                  )}

                  {/* Skills & Testimonial quote submit */}
                  <div className="rounded-3xl glass-panel p-8 space-y-6 shadow-lg">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Highlight Skills</h3>
                      <p className="text-xs text-slate-400">Expertise fields currently searchable by students.</p>
                    </div>

                  <div className="flex flex-wrap gap-1.5">
                    {activeAlumni.skills.split(",").map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg glass-badge text-[10px] font-bold">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-3">Submit Website Testimonial</h4>
                    <textarea 
                      placeholder="Write a quick quote about your career growth after graduating..." 
                      className="w-full h-24 glass-input rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    <button 
                      onClick={() => showToast("Testimonial submitted for coordinator review!", "success")}
                      className="mt-3 w-full py-2.5 rounded-xl bg-maroon-600 hover:bg-maroon-700 text-xs font-bold text-white transition-all shadow-sm"
                    >
                      Submit Testimonial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        </main>
      </div>

      {/* ================= MODAL: SELF-REGISTRATION ================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-[2rem] glass-panel p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowRegModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-655 transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Alumni Self-Registration Profile</h2>
              <p className="text-xs text-slate-500 mt-1">Submit your graduation records. Profiles are checked by admins before going live.</p>
            </div>

            <form onSubmit={handleSelfRegistration} className="space-y-4">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-4 bg-white/30 p-4 rounded-2xl border border-white/60">
                <div className="h-14 w-14 rounded-full overflow-hidden border border-slate-250 bg-slate-100 flex items-center justify-center shrink-0">
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">School Network</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Graduation Batch</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Program / Stream</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Company</label>
                  <input 
                    type="text" 
                    value={regForm.company} 
                    onChange={e => setRegForm({...regForm, company: e.target.value})}
                    placeholder="e.g. Microsoft (Optional)"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Designation / Role</label>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expertise Skills Tags</label>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location / City</label>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Number (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.phone} 
                  onChange={e => setRegForm({...regForm, phone: e.target.value})}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LinkedIn Profile Link (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.linkedin} 
                  onChange={e => setRegForm({...regForm, linkedin: e.target.value})}
                  placeholder="e.g. https://linkedin.com/in/username"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white transition-all shadow-md shadow-violet-500/10"
              >
                Submit Registration Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EMAIL DRAFT ================= */}
      {draftEmailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass-modal-overlay p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-[2rem] glass-panel p-8 shadow-2xl space-y-6 relative">
            <button 
              onClick={() => setDraftEmailTarget(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-655 transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Mail className="text-violet-600" /> Coordinator Verification Email Draft
              </h2>
              <p className="text-xs text-slate-500 mt-1">Copy this template text manually to verify credentials.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Recipient Email</span>
                <span className="text-xs font-semibold text-slate-800 glass-card px-3.5 py-2.5 block border border-white/40">
                  {draftEmailTarget.user.name} ({draftEmailTarget.user.email})
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Subject</span>
                <span className="text-xs font-bold text-slate-800 glass-card px-3.5 py-2.5 block border border-white/40">
                  {getEmailSubject(draftEmailTarget)}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Message Body</span>
                <textarea 
                  readOnly
                  value={getEmailBody(draftEmailTarget)}
                  className="w-full h-40 glass-input rounded-xl p-4 text-xs font-mono text-slate-700 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => handleCopyEmail(draftEmailTarget)}
                className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-550/10"
              >
                <Copy size={14} /> Copy Subject & Body
              </button>
              <button 
                onClick={() => setDraftEmailTarget(null)}
                className="px-6 py-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
