/* eslint-disable */
"use client";

import React from "react";
import { GraduationCap, Briefcase, CheckCircle2 } from "lucide-react";

export default function AudienceBenefits() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card A: For Alumni (Maroon accented) */}
        <div className="rounded-[3rem] bg-gradient-to-br from-white to-maroon-50/5 border border-slate-200/50 p-8 md:p-12 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-maroon-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3.5 bg-maroon-50 text-maroon-700 rounded-2xl border border-maroon-100">
                <Briefcase size={24} />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-maroon-700">Givers &amp; Guides</span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900">For Our Distinguished Alumni</h3>
              </div>
            </div>
            
            <p className="text-xs md:text-sm text-slate-550 leading-relaxed">
              Stay connected to your roots. The Alumni Dashboard makes it easy to support the next generation of leaders while networking with peers.
            </p>

            <ul className="space-y-3.5 text-xs text-slate-650 font-semibold">
              {[
                "Mentor students based on your industry focus and location.",
                "Review student resumes and offer direct corporate referrals.",
                "Network with other graduates through a secure global directory.",
                "Recruit talented scholars directly from Cambridge Court campuses."
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-maroon-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card B: For Students (Navy accented) */}
        <div className="rounded-[3rem] bg-gradient-to-br from-white to-navy-50/5 border border-slate-200/50 p-8 md:p-12 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#001f3f]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3.5 bg-navy-50 text-navy-750 rounded-2xl border border-navy-100">
                <GraduationCap size={24} />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-navy-750">Achievers &amp; Seekers</span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900">For Our Current Students</h3>
              </div>
            </div>
            
            <p className="text-xs md:text-sm text-slate-550 leading-relaxed">
              Accelerate your professional path. Unlock guidance, career maps, and warm introductions from those who succeeded before you.
            </p>

            <ul className="space-y-3.5 text-xs text-slate-650 font-semibold">
              {[
                "Search and connect with alumni at top companies globally.",
                "Get resume reviews and advice directly from industry experts.",
                "Book formal virtual mentorship sessions via dashboard queues.",
                "Explore career path spotlights and academic growth maps."
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-navy-700 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
