"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Calendar, Star, MapPin, Check, X, Sparkles, Send, 
  RefreshCw, UserCheck, Filter, Mail, Copy, PlusCircle, ShieldCheck
} from "lucide-react";
import { uploadFileToStorage } from "@/lib/firebase";

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

export default function Home() {
  const [data, setData] = useState<{
    alumni: AlumniProfile[];
    students: StudentProfile[];
    mentorships: Mentorship[];
    events: Event[];
    widgets: WidgetSpeak[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<"ADMIN" | "ALUMNI" | "STUDENT">("ADMIN");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Filtering states
  const [adminSchoolFilter, setAdminSchoolFilter] = useState<string>("All");
  const [studentSchoolFilter, setStudentSchoolFilter] = useState<string>("All");

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
    linkedin: ""
  });

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
    
    // Auto-open registration modal if ?register=true is present in query parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('register') === 'true') {
        setShowRegModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
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

  // Submit Alumni Self-Registration
  const handleSelfRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate optional LinkedIn URL
    if (regForm.linkedin) {
      const trimmed = regForm.linkedin.trim();
      const pattern = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;
      if (!pattern.test(trimmed)) {
        showToast("Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)", "error");
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
        showToast("Thanks for registering! We will contact you soon to verify your email.", "success");
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
          linkedin: ""
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="animate-spin text-violet-600" />
          <span className="text-xs font-bold tracking-wider text-slate-500">LOADING DATABASE RELATIONSHIPS...</span>
        </div>
      </div>
    );
  }

  // Filtered Alumni for Admin View (Only displays verified list in regular directory)
  const verifiedAlumniList = data?.alumni.filter(a => a.isVerified) || [];
  const filteredAlumniForAdmin = verifiedAlumniList.filter(a => {
    if (adminSchoolFilter === "All") return true;
    return a.school === adminSchoolFilter;
  });

  // Pending (Unverified) Alumni Queue for Admin Approval
  const pendingAlumniList = data?.alumni.filter(a => !a.isVerified) || [];
  const filteredPendingAlumni = pendingAlumniList.filter(a => {
    if (adminSchoolFilter === "All") return true;
    return a.school === adminSchoolFilter;
  });

  // Compute Onboarding statistics based on filter
  const totalAlumni = filteredAlumniForAdmin.length;
  const completedProfiles = filteredAlumniForAdmin.filter(a => a.profileComplete >= 75).length || 0;
  const partialProfiles = filteredAlumniForAdmin.filter(a => a.profileComplete >= 50 && a.profileComplete < 75).length || 0;
  const incompleteProfiles = filteredAlumniForAdmin.filter(a => a.profileComplete < 50).length || 0;

  // Selected entities for conditional views
  const activeAlumni = data?.alumni.find(a => a.id === selectedUser);
  const activeStudent = data?.students.find(s => s.id === selectedUser);

  // Email Draft Content
  const getEmailSubject = (profile: AlumniProfile) => `Verify your CCGS Alumni Hub Account - ${profile.user.name}`;
  const getEmailBody = (profile: AlumniProfile) => 
`Dear ${profile.user.name},

Thank you for registering on the CCGS Alumni Hub portal for ${profile.school}!

In order to complete your profile verification and publish your details to the school website directory, we need to quickly verify your email and credentials.

Please reply directly to this email or contact our support team at support@skillizee.io to confirm your graduation details. Once verified, your profile and company/role information will go live immediately on the school platform.

Warm regards,
CCGS Alumni Coordinator Team
support@skillizee.io`;

  // Copy text helper
  const handleCopyEmail = (profile: AlumniProfile) => {
    const text = `Subject: ${getEmailSubject(profile)}\n\n${getEmailBody(profile)}`;
    navigator.clipboard.writeText(text);
    showToast("Email draft copied to clipboard!", "success");
  };

  // Recommendations logic for current student preference (only maps verified mentors)
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-violet-600 selection:text-white">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/5 blur-[100px] pointer-events-none" />

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-lg animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" 
            ? "border-emerald-200 bg-emerald-50 text-emerald-800" 
            : "border-rose-200 bg-rose-50 text-rose-800"
        }`}>
          <Sparkles size={18} className={toast.type === "success" ? "text-emerald-600" : "text-rose-600"} />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header & Role Switcher */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 px-8 py-4 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-lg tracking-wider shadow-md shadow-indigo-500/25">
              CCGS
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                CCGS Alumni Hub
              </h1>
              <p className="text-[10px] text-slate-500 tracking-wider font-semibold">Central Admin & School Network Tool</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Registration Trigger Button */}
            <button 
              onClick={() => setShowRegModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.02]"
            >
              <PlusCircle size={14} /> Register as Alumni
            </button>

            {/* Perspective Swapping Interface */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 p-1">
              <button
                onClick={() => handleRoleChange("ADMIN")}
                className={`rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all ${
                  activeRole === "ADMIN" 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Group Admin
              </button>
              <button
                onClick={() => handleRoleChange("ALUMNI")}
                className={`rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all ${
                  activeRole === "ALUMNI" 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Alumnus View
              </button>
              <button
                onClick={() => handleRoleChange("STUDENT")}
                className={`rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all ${
                  activeRole === "STUDENT" 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Student View
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Role Context Selectors */}
      <div className="bg-slate-100/50 border-b border-slate-200 py-3 px-8 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Simulation User:</span>
            {activeRole === "ADMIN" && (
              <span className="font-bold text-violet-700 flex items-center gap-1.5 bg-violet-100 px-2.5 py-0.5 rounded border border-violet-200">
                <UserCheck size={12} /> CCGS Admin (pa2@skillizee.io)
              </span>
            )}
            {activeRole === "ALUMNI" && (
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-violet-500"
              >
                {data?.alumni.filter(a => a.isVerified).map(a => (
                  <option key={a.id} value={a.id}>{a.user.name} ({a.school} Alumni - {a.company || "No Company"})</option>
                ))}
              </select>
            )}
            {activeRole === "STUDENT" && (
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-violet-500"
              >
                {data?.students.map(s => (
                  <option key={s.id} value={s.id}>{s.user.name} (Expected {s.batch})</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Simulated Sandbox</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-8 py-10">
        
        {/* ================= ADMIN PERSPECTIVE ================= */}
        {activeRole === "ADMIN" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* School Filter Toggles for Group Admin */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Group School Filter:</span>
              </div>
              <div className="flex gap-2">
                {["All", "CCHS", "CCWS"].map((sch) => (
                  <button
                    key={sch}
                    onClick={() => setAdminSchoolFilter(sch)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      adminSchoolFilter === sch
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {sch === "All" ? "CCIS Combined (All)" : `${sch} Network`}
                  </button>
                ))}
              </div>
            </div>

            {/* Top row metrics cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 border border-violet-200">
                  <Users size={20} />
                </div>
                <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{totalAlumni}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Directory Count ({adminSchoolFilter === "All" ? "Group" : adminSchoolFilter})</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="mt-4 text-3xl font-extrabold text-slate-900">
                  {filteredPendingAlumni.length}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Pending Approval</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
                  <Star size={20} />
                </div>
                <h3 className="mt-4 text-3xl font-extrabold text-slate-900">
                  {data?.mentorships.filter(m => m.status === "ACCEPTED" && (adminSchoolFilter === "All" || m.alumni.school === adminSchoolFilter)).length || 0}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Active Mentorship Matches</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 border border-indigo-200">
                  <Calendar size={20} />
                </div>
                <h3 className="mt-4 text-3xl font-extrabold text-slate-900">{data?.events.length || 0}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Upcoming Events</p>
              </div>
            </div>

            {/* Split row: Verification Queue + Onboarding Funnel */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Verification Queue (Replacing Earth 3D Globe) */}
              <div className="lg:col-span-2 relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="text-violet-600" /> Pending Registrations Queue
                      </h2>
                      <p className="text-xs text-slate-500">Profiles requiring administrative check before landing on public portals.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800">
                      {filteredPendingAlumni.length} Requests
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                    {filteredPendingAlumni.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <Check size={28} className="mx-auto mb-2 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-wider block">Verification Queue is Empty</span>
                        <p className="text-[10px] text-slate-400 mt-1">All registered alumni are currently verified.</p>
                      </div>
                    ) : (
                      filteredPendingAlumni.map((alum) => (
                        <div key={alum.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <img src={alum.user.avatarUrl || ""} className="h-10 w-10 rounded-xl border border-slate-200" alt="avatar" />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900">{alum.user.name}</h4>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  alum.school === "CCHS" ? "bg-violet-100 text-violet-800" : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {alum.school}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 font-semibold">{alum.role || "Graduate"} @ {alum.company || "No Company"}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{alum.user.email} | Batch {alum.batch} ({alum.program})</p>
                              <p className="text-[10px] text-slate-500 mt-1 italic">&quot;Skills: {alum.skills}&quot;</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Manual Email Draft Action */}
                            <button
                              onClick={() => setDraftEmailTarget(alum)}
                              className="px-3 py-1.5 rounded-lg border border-slate-250 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 transition-all"
                            >
                              <Mail size={12} /> Draft
                            </button>
                            
                            {/* Verify Action */}
                            <button
                              onClick={() => handleVerifyAlumni(alum.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white flex items-center gap-1 transition-all shadow-sm"
                            >
                              <Check size={12} /> Verify Profile
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Onboarding Funnel */}
              <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Profile Completion Funnel</h2>
                  <p className="text-xs text-slate-500 mb-6">Completeness rates for the directory database.</p>
                  
                  <div className="space-y-4">
                    {/* Funnel segments */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                        <span className="text-emerald-600">Complete Profiles (&ge;75%)</span>
                        <span>{completedProfiles} ({totalAlumni ? Math.round((completedProfiles/totalAlumni)*100) : 0}%)</span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${totalAlumni ? (completedProfiles/totalAlumni)*100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                        <span className="text-indigo-600">Semi-Complete (50-74%)</span>
                        <span>{partialProfiles} ({totalAlumni ? Math.round((partialProfiles/totalAlumni)*100) : 0}%)</span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full" style={{ width: `${totalAlumni ? (partialProfiles/totalAlumni)*100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                        <span className="text-slate-600">Incomplete (&lt;50%)</span>
                        <span>{incompleteProfiles} ({totalAlumni ? Math.round((incompleteProfiles/totalAlumni)*100) : 0}%)</span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full" style={{ width: `${totalAlumni ? (incompleteProfiles/totalAlumni)*100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => showToast("Profile completion alerts pushed to target emails!", "success")}
                    className="w-full py-2.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-xs font-bold text-violet-700 transition-all"
                  >
                    Send Completion Reminders
                  </button>
                </div>
              </div>
            </div>

            {/* List Row: Directory Table & Widget Builder */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Directory */}
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Alumni Directory (Verified)</h2>
                    <p className="text-xs text-slate-500">Verified database records displayed on landing pages.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">School</th>
                        <th className="pb-3">Program & Batch</th>
                        <th className="pb-3">Company & Role</th>
                        <th className="pb-3 text-center">Mentor Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAlumniForAdmin.map((alum) => (
                        <tr key={alum.id} className="text-slate-600 hover:bg-slate-50/50">
                          <td className="py-4 font-bold text-slate-900">{alum.user.name}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              alum.school === "CCHS" 
                                ? "bg-violet-100 text-violet-800" 
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {alum.school}
                            </span>
                          </td>
                          <td className="py-4">{alum.program} ({alum.batch})</td>
                          <td className="py-4">{alum.company} — <span className="font-semibold text-slate-500">{alum.role}</span></td>
                          <td className="py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              alum.isMentor 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}>
                              {alum.isMentor ? "Mentor" : "Alumni"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Public testimonial widget manager */}
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Website Widget Testimonials</h2>
                  <p className="text-xs text-slate-500 mb-6">Manage embeddable widgets for school landing pages.</p>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {data?.widgets
                      .filter(w => adminSchoolFilter === "All" || w.alumni.school === adminSchoolFilter)
                      .map((widget) => (
                        <div key={widget.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                          <div className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                              <img src={widget.alumni.user.avatarUrl || ""} className="h-6 w-6 rounded-full border border-slate-200" alt="avatar" />
                              <div>
                                <span className="text-xs font-bold block text-slate-800">{widget.alumni.user.name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{widget.alumni.school}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleWidgetApproval(widget.id, !widget.isApproved)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide transition-all border ${
                                widget.isApproved 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                  : "bg-amber-50 border-amber-200 text-amber-700"
                              }`}
                            >
                               {widget.isApproved ? "Approved" : "Pending"}
                            </button>
                          </div>
                          <p className="text-[11px] italic text-slate-500">&quot;{widget.quote}&quot;</p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="rounded-xl bg-slate-900 border border-slate-850 p-3 text-[10px] font-mono text-slate-300 select-all cursor-pointer">
                    {`{"<iframe src=\"http://localhost:3000/api/alumni?school=${adminSchoolFilter === "All" ? "CCIS" : adminSchoolFilter}\" width=\"100%\" height=\"250\"></iframe>"}`}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 text-center">Copy dynamic iframe source snippet</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ALUMNI PERSPECTIVE ================= */}
        {activeRole === "ALUMNI" && activeAlumni && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
            
            {/* Header profile metrics banner */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <img src={activeAlumni.user.avatarUrl || ""} className="h-16 w-16 rounded-2xl border border-slate-200 shadow-md" alt="avatar" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{activeAlumni.user.name}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-violet-100 text-violet-700">
                        {activeAlumni.school} Alumni
                      </span>
                    </div>
                    <p className="text-sm text-violet-600 font-semibold">{activeAlumni.role} @ {activeAlumni.company}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{activeAlumni.city}, {activeAlumni.country} | Batch {activeAlumni.batch}</p>
                  </div>
                </div>

                {/* Verification/Mentorship Toggle */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
                    <span className="block text-xs font-semibold text-slate-500">Profile Complete</span>
                    <span className="text-lg font-extrabold text-emerald-600">{activeAlumni.profileComplete}%</span>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center gap-3">
                    <div>
                      <span className="block text-xs font-semibold text-slate-500">Open to Mentoring</span>
                      <span className="text-[10px] text-slate-400 font-medium">Guide current students</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={activeAlumni.isMentor} 
                      onChange={async () => {
                        showToast(`Mentorship availability ${activeAlumni.isMentor ? "disabled" : "enabled"}`, "success");
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

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Mentorship Requests Incoming */}
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2">Student Mentorship Inquiries</h3>
                <p className="text-xs text-slate-500 mb-6">Manage incoming chat and informational interview requests from students.</p>

                <div className="space-y-4">
                  {data?.mentorships.filter(m => m.alumniId === activeAlumni.id).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-semibold text-xs">
                      No incoming mentorship inquiries at this time.
                    </div>
                  ) : (
                    data?.mentorships.filter(m => m.alumniId === activeAlumni.id).map((req) => (
                      <div key={req.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={req.student.user.avatarUrl || ""} className="h-10 w-10 rounded-full border border-slate-250" alt="avatar" />
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{req.student.user.name}</h4>
                              <p className="text-xs text-slate-400">{req.student.program} (Expected {req.student.batch})</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {req.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => handleMentorshipAction(req.id, "ACCEPTED")}
                                  className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition-all"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => handleMentorshipAction(req.id, "DECLINED")}
                                  className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-all"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                req.status === "ACCEPTED" 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-255" 
                                  : "bg-rose-50 text-rose-700 border-rose-255"
                              }`}>
                                {req.status}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl bg-white p-4 border border-slate-200/60 text-xs text-slate-600 italic leading-relaxed">
                          &quot;{req.notes}&quot;
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Profile Details & Skills */}
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">Your Expertise tags</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Highlighted skills visible to students.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeAlumni.skills.split(",").map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-100 text-xs font-bold">
                      {skill.trim()}
                    </span>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Submit Website Testimonial</h4>
                  <textarea 
                    placeholder="Provide a short review of your career journey..." 
                    className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500"
                  />
                  <button 
                    onClick={() => showToast("Testimonial submitted for CCGS review!", "success")}
                    className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-md text-xs font-bold text-white transition-all"
                  >
                    Submit Testimonial
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STUDENT PERSPECTIVE ================= */}
        {activeRole === "STUDENT" && activeStudent && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
            
            {/* Header Profile */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <img src={activeStudent.user.avatarUrl || ""} className="h-16 w-16 rounded-2xl border border-slate-200 shadow-md" alt="avatar" />
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome, {activeStudent.user.name}</h2>
                    <p className="text-sm text-violet-600 font-semibold">{activeStudent.program} | Grad Batch {activeStudent.batch}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Configure goals to generate matching network contacts.</p>
                  </div>
                </div>

                {/* Firebase upload simulation widget */}
                <div className="flex flex-col gap-2 rounded-xl bg-slate-50 border border-slate-200 p-4 max-w-sm">
                  <span className="text-xs font-semibold text-slate-600">Firebase Storage Resume Upload</span>
                  <p className="text-[10px] text-slate-400 leading-normal">Upload PDF resume directly into your Firebase storage bucket</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <label className="flex h-9 items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-750 px-4 text-xs font-bold text-white cursor-pointer transition-all shadow-sm">
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
                        <Check size={12} /> Uploaded!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Split layout: Preferences + Recommendations */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Preferences Configuration Form */}
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">Career Preferences</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Specify job choices to trigger recommendation scores.</p>
                </div>

                <div className="space-y-4">
                  {/* Goal 1 */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-violet-600 flex items-center gap-1.5">
                      <Sparkles size={14} /> Primary Choice
                    </span>
                    <input 
                      type="text" 
                      value={pref1Role} 
                      onChange={(e) => setPref1Role(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500"
                    />
                    <input 
                      type="text" 
                      value={pref1Country} 
                      onChange={(e) => setPref1Country(e.target.value)}
                      placeholder="Preferred Country (e.g. United Kingdom)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Goal 2 */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      Secondary Choice
                    </span>
                    <input 
                      type="text" 
                      value={pref2Role} 
                      onChange={(e) => setPref2Role(e.target.value)}
                      placeholder="e.g. Product Strategy"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500"
                    />
                    <input 
                      type="text" 
                      value={pref2Country} 
                      onChange={(e) => setPref2Country(e.target.value)}
                      placeholder="Preferred Country (e.g. India)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleUpdatePreferences}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg text-xs font-bold text-white transition-all"
                >
                  Save Preferences
                </button>
              </div>

              {/* Recommendations list */}
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900">Recommended Mentors</h3>
                    <p className="text-xs text-slate-500">Real-time matching scores across verified CCHS and CCWS networks.</p>
                  </div>
                  {/* School Filter within recommended list */}
                  <div className="flex gap-1.5 rounded-lg bg-slate-100 p-1 border border-slate-200 self-start">
                    {["All", "CCHS", "CCWS"].map(sch => (
                      <button
                        key={sch}
                        onClick={() => setStudentSchoolFilter(sch)}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                          studentSchoolFilter === sch
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {sch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {data?.alumni
                    .filter(a => a.isVerified) // Only recommend verified mentors
                    .filter(a => studentSchoolFilter === "All" || a.school === studentSchoolFilter)
                    .map((alum) => ({
                      alum,
                      score: getMatchingScore(alum, activeStudent)
                    }))
                    .sort((a, b) => b.score - a.score)
                    .map(({ alum, score }) => (
                      <div key={alum.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 flex flex-col justify-between md:flex-row md:items-center gap-4 hover:border-violet-200 hover:bg-violet-50/10 transition-all duration-300">
                        <div className="flex gap-4">
                          <img src={alum.user.avatarUrl || ""} className="h-12 w-12 rounded-xl border border-slate-200" alt="avatar" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{alum.user.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                alum.school === "CCHS" 
                                  ? "bg-violet-100 text-violet-700" 
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {alum.school} Network
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                score >= 75 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                  : score >= 40 
                                  ? "bg-violet-50 text-violet-700 border-violet-100" 
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                {score >= 75 ? "Highly Recommended Match" : score >= 40 ? "Topic Match" : "Graduate"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-semibold">{alum.role} @ <span className="text-slate-950 font-bold">{alum.company}</span></p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
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
                                placeholder="Write a short message..."
                                className="w-full md:w-64 h-16 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRequestMentorship(alum.id)}
                                  className="h-8 px-3 rounded-lg bg-violet-650 hover:bg-violet-700 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
                                >
                                  <Send size={12} /> Send Inquiry
                                </button>
                                <button
                                  onClick={() => setRequestingMentorId(null)}
                                  className="h-8 px-3 rounded-lg bg-slate-200 text-xs text-slate-600 hover:text-slate-800"
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
                              className="w-full md:w-auto h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-500/10 hover:scale-[1.02]"
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
        )}

      </main>

      {/* ================= SELF-REGISTRATION MODAL ================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowRegModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Alumni Registration Form</h2>
              <p className="text-xs text-slate-500 mt-1">Register to join the school directories. Profiles are reviewed by admins before activation.</p>
            </div>

            <form onSubmit={handleSelfRegistration} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={regForm.name} 
                    onChange={e => setRegForm({...regForm, name: e.target.value})}
                    placeholder="Enter name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={regForm.email} 
                    onChange={e => setRegForm({...regForm, email: e.target.value})}
                    placeholder="name@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">School Network</label>
                  <select 
                    value={regForm.school} 
                    onChange={e => setRegForm({...regForm, school: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                  >
                    <option value="CCHS">CCHS Network</option>
                    <option value="CCWS">CCWS Network</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Graduation Batch</label>
                  <input 
                    type="number" 
                    required
                    value={regForm.batch} 
                    onChange={e => setRegForm({...regForm, batch: e.target.value})}
                    placeholder="e.g. 2018"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Program / Stream</label>
                  <input 
                    type="text" 
                    required
                    value={regForm.program} 
                    onChange={e => setRegForm({...regForm, program: e.target.value})}
                    placeholder="e.g. Science"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Company</label>
                  <input 
                    type="text" 
                    value={regForm.company} 
                    onChange={e => setRegForm({...regForm, company: e.target.value})}
                    placeholder="e.g. Microsoft (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Designation / Role</label>
                  <input 
                    type="text" 
                    value={regForm.role} 
                    onChange={e => setRegForm({...regForm, role: e.target.value})}
                    placeholder="e.g. Principal Designer (Optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Skills / Expertise Tags</label>
                <input 
                  type="text" 
                  required
                  value={regForm.skills} 
                  onChange={e => setRegForm({...regForm, skills: e.target.value})}
                  placeholder="Comma-separated (e.g. React, UX Design, Product Management)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LinkedIn Profile Link (Optional)</label>
                <input 
                  type="text" 
                  value={regForm.linkedin} 
                  onChange={e => setRegForm({...regForm, linkedin: e.target.value})}
                  placeholder="e.g. https://linkedin.com/in/username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white transition-all shadow-md shadow-violet-500/10"
              >
                Submit Registration Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MANUAL EMAIL DRAFT MODAL ================= */}
      {draftEmailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setDraftEmailTarget(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Mail className="text-violet-600" /> Manual Verification Email Draft
              </h2>
              <p className="text-xs text-slate-500 mt-1">Copy and share this pre-drafted email manually to verify credentials.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Recipient</span>
                <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-md block border border-slate-200">
                  {draftEmailTarget.user.name} ({draftEmailTarget.user.email})
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Subject</span>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-2 rounded-md block border border-slate-200">
                  {getEmailSubject(draftEmailTarget)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Email Message Body</span>
                <textarea 
                  readOnly
                  value={getEmailBody(draftEmailTarget)}
                  className="w-full h-48 bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => handleCopyEmail(draftEmailTarget)}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-500/10"
              >
                <Copy size={14} /> Copy Subject & Body
              </button>
              <button 
                onClick={() => setDraftEmailTarget(null)}
                className="px-6 py-3 rounded-xl bg-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-350 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-500 shadow-sm mt-12">
        <div className="mx-auto max-w-7xl px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p>© 2026 CCGS Educational Group. CCHS & CCWS Joint Alumni Networks. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 cursor-pointer transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors">Group Administrator Helpdesk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
