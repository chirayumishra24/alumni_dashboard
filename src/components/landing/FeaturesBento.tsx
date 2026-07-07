/* eslint-disable */
"use client";

import React from "react";
import { Search, Sparkles, Calendar, Award, FileText, ArrowUpRight, ShieldCheck, Check } from "lucide-react";

export default function FeaturesBento() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-10 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-navy-50 border border-navy-100 text-[10px] font-black text-navy-700 uppercase tracking-widest">
          Platform Blueprint
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Everything You Need to Bridge the Connections
        </h2>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
          Explore the core modular capabilities built inside the dashboard designed to connect generations of graduates.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: Interactive Directory (Col Span 7) */}
        <div className="md:col-span-7 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 p-8 flex flex-col justify-between shadow-md group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-400/5 rounded-full blur-3xl" />
          
          <div className="space-y-4">
            <div className="p-3 bg-violet-50 text-violet-650 rounded-2xl w-fit border border-violet-100/50">
              <Search size={20} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-serif">Interactive Alumni Directory</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-650 border border-emerald-100/50 text-[8px] font-extrabold uppercase">Live</span>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed max-w-md">
                Search, filter, and discover graduates by graduation batch, school campus, professional expertise, city location, or industry domain.
              </p>
            </div>
          </div>

          {/* Graphical Mockup inside card */}
          <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3 transform group-hover:scale-[1.01] transition-transform duration-300 relative z-10">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
              <Search size={12} className="text-slate-400" />
              <div className="text-[10px] text-slate-400 font-semibold">Search "Software Engineer in Seattle"...</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-maroon-50 text-maroon-700 border border-maroon-100 text-[8px] font-bold">CCHS Network</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[8px] font-bold">Batch 2018</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[8px] font-bold">United States</span>
            </div>
          </div>
        </div>

        {/* Card 2: Smart Mentorship (Col Span 5) */}
        <div className="md:col-span-5 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 p-8 flex flex-col justify-between shadow-md group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl" />
          
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 text-amber-650 rounded-2xl w-fit border border-amber-100/50">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Smart Mentorship Hub</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Connect directly for guidance. Request one-on-one sessions, receive meeting schedules, and matching score indicators.
              </p>
            </div>
          </div>

          {/* Graphical Mockup inside card */}
          <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3 transform group-hover:scale-[1.01] transition-transform duration-300 relative z-10 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-slate-150 border border-slate-200" />
                <span className="text-[10px] font-bold text-slate-800">Yashashvi B.</span>
              </div>
              <span className="text-[9px] font-black text-emerald-650 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">96% Match</span>
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-slate-450 font-semibold">Mentorship Session</span>
              <span className="text-slate-500 font-bold bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">Upcoming · Sat</span>
            </div>
          </div>
        </div>

        {/* Card 3: Resume Vault (Col Span 5) */}
        <div className="md:col-span-5 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 p-8 flex flex-col justify-between shadow-md group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/5 rounded-full blur-3xl" />
          
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 text-emerald-650 rounded-2xl w-fit border border-emerald-100/50">
              <FileText size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Resume Vault</h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                Securely store and share PDF resumes directly inside Firebase Storage for instant review and professional referrals.
              </p>
            </div>
          </div>

          {/* Graphical Mockup inside card */}
          <div className="mt-8 bg-slate-50 border border-dashed border-slate-200/80 rounded-2xl p-5 text-center space-y-1.5 transform group-hover:scale-[1.01] transition-transform duration-300">
            <FileText size={18} className="mx-auto text-slate-400" />
            <span className="block text-[10px] font-bold text-slate-700">Drag &amp; Drop Resume</span>
            <span className="block text-[8px] text-slate-400 font-semibold">Supports PDF format · Max 5MB</span>
          </div>
        </div>

        {/* Card 4: Administrative Dashboard (Col Span 7) */}
        <div className="md:col-span-7 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/60 p-8 flex flex-col justify-between shadow-md group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#001f3f]/5 rounded-full blur-3xl" />
          
          <div className="space-y-4">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl w-fit border border-slate-200/55">
              <Award size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Admin Vetting &amp; Sheets Sync</h3>
              <p className="text-xs text-slate-550 leading-relaxed max-w-md">
                Keep directories secure. Our admin gate reviews all self-registrations, with automated synchronization to your school's master spreadsheet.
              </p>
            </div>
          </div>

          {/* Graphical Mockup inside card */}
          <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3 transform group-hover:scale-[1.01] transition-transform duration-300 relative z-10">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="font-bold text-slate-800">Pending Approvals</span>
              </div>
              <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-black text-[8px]">3 Queue Clear</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500 bg-slate-50 rounded-xl p-2 border border-slate-100">
              <span className="font-bold">Google Sheets Data Feed</span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <Check size={10} /> Active
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
