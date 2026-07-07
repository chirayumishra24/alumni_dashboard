/* eslint-disable */
"use client";

import React from "react";
import { X, Users } from "lucide-react";

interface RegistrationModalProps {
  showRegModal: boolean;
  setShowRegModal: (show: boolean) => void;
  regForm: {
    name: string;
    email: string;
    batch: string;
    program: string;
    school: string;
    company: string;
    role: string;
    skills: string;
    phone: string;
    linkedin: string;
    city: string;
    avatarUrl: string;
    bio: string;
  };
  setRegForm: React.Dispatch<React.SetStateAction<any>>;
  uploadingAvatar: boolean;
  submitting: boolean;
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSelfRegistration: (event: React.FormEvent) => Promise<void>;
}

export default function RegistrationModal({
  showRegModal,
  setShowRegModal,
  regForm,
  setRegForm,
  uploadingAvatar,
  submitting,
  handleAvatarUpload,
  handleSelfRegistration
}: RegistrationModalProps) {
  if (!showRegModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" data-lenis-prevent>
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
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-855 focus:bg-white focus:border-maroon-700/50 focus:ring-1 focus:ring-maroon-700/20 transition-all duration-200 focus:outline-none font-semibold"
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
  );
}
