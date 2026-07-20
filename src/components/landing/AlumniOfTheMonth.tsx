/* eslint-disable */
"use client";

import React from "react";
import { Star, Award, Briefcase, GraduationCap, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AlumniOfTheMonth({ embedded = false }: { embedded?: boolean }) {
  const card = (
    <div className={`bg-gradient-to-br from-slate-900 via-navy-800 to-slate-950 text-white ${embedded ? 'rounded-[2rem]' : 'rounded-[3rem]'} p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/5`}>
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-maroon-500/15 to-transparent rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-br from-navy-500/15 to-transparent rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Image & Spotlight Badge */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-maroon-500 to-amber-500 rounded-[2.5rem] blur opacity-40 group-hover:opacity-75 transition duration-500" />
            <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350"
                alt="Alumni of the Month"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-102 group-hover:scale-105"
              />
            </div>
          </div>
          
          {/* Tag Overlay */}
          <span className="absolute -top-4 -right-4 md:right-4 inline-flex items-center gap-1.5 px-4.5 py-2 rounded-2xl bg-amber-500 text-[10px] font-black text-slate-950 uppercase tracking-widest shadow-xl border border-amber-400/20">
            <Star size={11} fill="currentColor" /> Spotlight
          </span>
        </div>

        {/* Text content & Career Journey */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-amber-300 uppercase tracking-widest">
              <Award size={10} /> Alumni of the Month
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white leading-tight">
              Yashashvi Bharadwaj
            </h3>
            <p className="text-xs md:text-sm font-semibold text-slate-400">
              NLSIU Graduate • Advocate, Supreme Court of India • CCHS Class of 2017
            </p>
          </div>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium italic">
            &ldquo;My journey from the classrooms of Mansarovar to the chambers of the Supreme Court was fueled by the rigorous academic foundation and debating skills I built during my school years. The confidence to advocate for justice began right here.&rdquo;
          </p>

          {/* Micro timeline inside card */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Milestones &amp; Journey:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 hover:border-white/15 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <GraduationCap size={14} className="group-hover:animate-bounce" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">Education</span>
                </div>
                <span className="block text-xs font-bold text-white">NLSIU Bangalore</span>
                <span className="block text-[9px] text-slate-400 leading-none">B.A. LL.B (Hons.)</span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 hover:border-white/15 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Briefcase size={14} className="group-hover:animate-bounce" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">Practice</span>
                </div>
                <span className="block text-xs font-bold text-white">Supreme Court</span>
                <span className="block text-[9px] text-slate-400 leading-none">Constitutional Law</span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 hover:border-white/15 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Award size={14} className="group-hover:animate-bounce" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wide">Achievement</span>
                </div>
                <span className="block text-xs font-bold text-white">UPSC Rank 178</span>
                <span className="block text-[9px] text-slate-400 leading-none">Civil Services (Law)</span>
              </div>

            </div>
          </div>

          <div className="pt-2">
            <a
              href="#directory?search=Yashashvi"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-[10px] tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              <span>View Full Profile</span>
              <ArrowUpRight size={13} className="text-maroon-700" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );

  if (embedded) return card;

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-10">
      {card}
    </section>
  );
}
