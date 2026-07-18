/* eslint-disable */
"use client";

import React from "react";
import { Globe, GraduationCap, Landmark, Sparkles } from "lucide-react";

interface StatCompany {
  name: string;
  count: number;
}

interface NetworkStatsProps {
  stats: {
    iitAiims: number;
    outsideIndia: number;
    government: number;
    topCompanies: StatCompany[];
  };
}

export default function NetworkStats({ stats }: NetworkStatsProps) {
  return (
    <section id="stats" className="w-full bg-gradient-to-br from-navy-900 via-navy-950 to-slate-950 text-white shadow-2xl relative overflow-hidden border-y border-white/5 py-16 md:py-20 z-10 my-16">
      {/* Corner triangle decorations */}
      <div className="absolute top-0 left-0 w-44 h-full bg-maroon-500/5 [clip-path:polygon(0_0,0_100%,100%_100%)] opacity-30 pointer-events-none blur-sm" />
      <div className="absolute top-0 right-0 w-44 h-full bg-navy-500/5 [clip-path:polygon(0_0,100%_0,100%_100%)] pointer-events-none blur-sm" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-maroon-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 space-y-10">
        
        <div className="relative z-10 space-y-10">
          {/* Header */}
          <div className="text-center md:text-left space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-amber-300 uppercase tracking-widest">
              <Sparkles size={10} fill="currentColor" className="animate-pulse" /> Network Placements & Impact
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white leading-tight">
              Distinguished Academic &amp; Corporate Footprint
            </h3>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl font-medium">
              A consolidated summary of our verified alumni's institutional achievements and top international employer mappings.
            </p>
          </div>
 
          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
            {/* Stat 1: Outside India */}
            <div className="flex items-center gap-5 bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-lg hover:bg-white/10 hover:scale-[1.03] hover:border-white/20 transition-all duration-300 group">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-maroon-500/20 to-navy-500/20 border border-white/15 text-white shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Globe size={22} className="text-amber-300" />
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-black font-serif italic text-white tracking-tight">{stats.outsideIndia}+</span>
                <span className="block text-[10px] font-black uppercase text-white/95 tracking-wider">Settled Outside India</span>
                <p className="text-[9px] text-slate-400 leading-normal mt-0.5 font-medium">Pursuing global careers and international education.</p>
              </div>
            </div>

            {/* Stat 2: IITs & AIIMS */}
            <div className="flex items-center gap-5 bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-lg hover:bg-white/10 hover:scale-[1.03] hover:border-white/20 transition-all duration-300 group">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-maroon-500/20 to-navy-500/20 border border-white/15 text-white shrink-0 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap size={22} className="text-amber-300" />
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-black font-serif italic text-white tracking-tight">{stats.iitAiims}+</span>
                <span className="block text-[10px] font-black uppercase text-white/95 tracking-wider">IIT &amp; AIIMS Scholars</span>
                <p className="text-[9px] text-slate-400 leading-normal mt-0.5 font-medium">Graduates from India's premier engineering &amp; medical institutes.</p>
              </div>
            </div>

            {/* Stat 3: Civil Services */}
            <div className="flex items-center gap-5 bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-lg hover:bg-white/10 hover:scale-[1.03] hover:border-white/20 transition-all duration-300 group">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-maroon-500/20 to-navy-500/20 border border-white/15 text-white shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Landmark size={22} className="text-amber-300" />
              </div>
              <div className="space-y-1">
                <span className="block text-3xl font-black font-serif italic text-white tracking-tight">{stats.government}+</span>
                <span className="block text-[10px] font-black uppercase text-white/95 tracking-wider">Govt &amp; Civil Services</span>
                <p className="text-[9px] text-slate-400 leading-normal mt-0.5 font-medium">Serving the nation across IAS, IPS, IFS, and ministries.</p>
              </div>
            </div>
          </div>

          {/* Marquee Placements */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center gap-5 overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Top Placements:</span>
            <div className="relative w-full overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-navy-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-navy-950 to-transparent z-10 pointer-events-none" />
              
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee-scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-marquee-scroll {
                  display: flex;
                  width: max-content;
                  animation: marquee-scroll 45s linear infinite;
                }
                .animate-marquee-scroll:hover {
                  animation-play-state: paused;
                }
              `}} />
              
              <div className="animate-marquee-scroll flex gap-3 select-none">
                {[...stats.topCompanies, ...stats.topCompanies].map((tc, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4.5 py-2 rounded-2xl bg-white/5 border border-white/5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:border-white/15 hover:scale-102 transition-all duration-200 shrink-0 cursor-pointer">
                    <span className="font-bold">{tc.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                    <span className="text-amber-300 font-extrabold text-[9px] uppercase tracking-wider">{tc.count} {tc.count === 1 ? 'placed' : 'placed'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
