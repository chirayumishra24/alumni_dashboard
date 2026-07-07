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
    <section id="stats" className="w-full bg-[#001f3f] text-white shadow-xl relative overflow-hidden border-y border-white/10 py-12 md:py-16 z-10 my-16">
      {/* Corner triangle decorations */}
      <div className="absolute top-0 left-0 w-32 h-full bg-[#001326] [clip-path:polygon(0_0,0_100%,100%_100%)] opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-full bg-white/5 [clip-path:polygon(0_0,100%_0,100%_100%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 space-y-8">
        
        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="text-center md:text-left space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/90 uppercase tracking-widest">
              <Sparkles size={10} fill="currentColor" /> Network Placements & Impact
            </span>
            <h3 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-white">
              Distinguished Academic & Corporate Footprint
            </h3>
            <p className="text-xs text-white/70 max-w-xl">
              A consolidated summary of our verified alumni's institutional achievements and top international employer mappings.
            </p>
          </div>
 
          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-white/10">
            {/* Stat 1: Outside India */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white shrink-0">
                <Globe size={20} className="text-amber-300" />
              </div>
              <div>
                <span className="block text-3xl font-bold font-serif italic text-white tracking-tight">{stats.outsideIndia}+</span>
                <span className="block text-[10px] font-black uppercase text-white/95 tracking-wider">Settled Outside India</span>
                <p className="text-[9px] text-white/70 leading-normal mt-0.5">Pursuing global careers and international education.</p>
              </div>
            </div>

            {/* Stat 2: IITs & AIIMS */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white shrink-0">
                <GraduationCap size={20} className="text-amber-300" />
              </div>
              <div>
                <span className="block text-3xl font-bold font-serif italic text-white tracking-tight">{stats.iitAiims}+</span>
                <span className="block text-[10px] font-black uppercase text-white/95 tracking-wider">IIT &amp; AIIMS Scholars</span>
                <p className="text-[9px] text-white/70 leading-normal mt-0.5">Graduates from India's premier engineering &amp; medical institutes.</p>
              </div>
            </div>

            {/* Stat 3: Civil Services */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white shrink-0">
                <Landmark size={20} className="text-amber-300" />
              </div>
              <div>
                <span className="block text-3xl font-bold font-serif italic text-white tracking-tight">{stats.government}+</span>
                <span className="block text-[10px] font-black uppercase text-white/95 tracking-wider">Govt &amp; Civil Services</span>
                <p className="text-[9px] text-white/70 leading-normal mt-0.5">Serving the nation across IAS, IPS, IFS, and ministries.</p>
              </div>
            </div>
          </div>

          {/* Marquee Placements */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center gap-4 overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/70 shrink-0">Top Placements:</span>
            <div className="relative w-full overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#001f3f] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#001f3f] to-transparent z-10 pointer-events-none" />
              
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
                {[...stats.topCompanies, ...stats.topCompanies].map((tc, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 shrink-0">
                    <span>{tc.name}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="text-white font-extrabold">{tc.count} {tc.count === 1 ? 'alumn' : 'alumni'}</span>
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
