/* eslint-disable */
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PlusCircle, Map, Globe, RefreshCw, GraduationCap, Landmark } from "lucide-react";

// Dynamic imports to prevent SSR crashes for Leaflet/Three.js
const AlumniMap = dynamic(() => import("../AlumniMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[380px] rounded-[2.5rem] bg-slate-100/50 backdrop-blur-md flex flex-col items-center justify-center gap-3 border border-slate-200/50 shadow-2xl">
      <RefreshCw size={24} className="animate-spin text-maroon-600" />
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Connections Map...</span>
    </div>
  )
});

const AlumniGlobe = dynamic(() => import("../AlumniGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[380px] rounded-[2.5rem] bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-center gap-3 border border-white/10 shadow-2xl">
      <RefreshCw size={24} className="animate-spin text-amber-500" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Globe...</span>
    </div>
  )
});

interface HeroSectionProps {
  alumni: any[];
  setShowRegModal: (show: boolean) => void;
  context?: "dashboard" | "CCHS" | "CCWS" | "CCIS";
  stats?: {
    iitAiims: number;
    outsideIndia: number;
    government: number;
  };
}

export default function HeroSection({ alumni, setShowRegModal, context = "dashboard", stats }: HeroSectionProps) {
  const [visualMode, setVisualMode] = useState<"map" | "globe">("map");

  return (
    <section className="relative max-w-7xl mx-auto px-6 md:px-8 pt-8 md:pt-12 pb-6 z-10">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Column: Headline and Description */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-5"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-maroon-50 border border-maroon-100 text-[10px] font-black text-maroon-700 uppercase tracking-widest">
              {context === "dashboard" ? "Connecting Legacies" : `${context} Alumni Hub`}
            </span>
            <h1 className="text-3xl md:text-[2.75rem] lg:text-[3.25rem] font-serif font-black text-slate-900 tracking-tight leading-[1.1]">
              {context === "CCHS" && (
                <>
                  Connecting CCHS <span className="font-serif italic font-extrabold text-maroon-600">Alumni</span>, <br />
                  Inspiring Tomorrow's <span className="font-serif italic font-extrabold text-navy-650">Leaders</span>
                </>
              )}
              {context === "CCWS" && (
                <>
                  Connecting CCWS <span className="font-serif italic font-extrabold text-maroon-600">Alumni</span>, <br />
                  Inspiring Tomorrow's <span className="font-serif italic font-extrabold text-navy-650">Leaders</span>
                </>
              )}
              {context === "CCIS" && (
                <>
                  CCIS Distinguished <span className="font-serif italic font-extrabold text-maroon-600">Top 30</span>, <br />
                  Global Alumni <span className="font-serif italic font-extrabold text-navy-650">Showcase</span>
                </>
              )}
              {context === "dashboard" && (
                <>
                  Connecting Past <span className="font-serif italic font-extrabold text-maroon-600">Achievers</span>, <br />
                  Inspiring Future <span className="font-serif italic font-extrabold text-navy-650">Leaders</span>
                </>
              )}
            </h1>

            <p className="text-sm md:text-base text-slate-655 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-medium italic">
              &quot;Our legacy is built in the halls of Cambridge Court; our destiny is reflected in the global achievements of our alumni.&quot;
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
          >
            <button 
              onClick={() => setShowRegModal(true)}
              className="group relative overflow-hidden px-7 py-3.5 rounded-2xl bg-gradient-to-r from-maroon-600 to-navy-700 hover:from-maroon-500 hover:to-navy-600 text-xs font-black text-white uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-white/10"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>Join The Network</span>
            </button>
            
            <a 
              href="#explore"
              className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center"
            >
              Browse Directory
            </a>
          </motion.div>

          {/* Inline Stat Pills */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start pt-1"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm">
                <GraduationCap size={14} className="text-maroon-600" />
                <span className="text-xs font-extrabold text-slate-800">{stats.iitAiims}+</span>
                <span className="text-[10px] text-slate-500 font-semibold">IIT & AIIMS</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm">
                <Globe size={14} className="text-navy-600" />
                <span className="text-xs font-extrabold text-slate-800">{stats.outsideIndia}+</span>
                <span className="text-[10px] text-slate-500 font-semibold">Global Alumni</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm">
                <Landmark size={14} className="text-amber-600" />
                <span className="text-xs font-extrabold text-slate-800">{stats.government}+</span>
                <span className="text-[10px] text-slate-500 font-semibold">Civil Services</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Interactive Map/Globe with Mode Selector */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="lg:col-span-6 w-full flex flex-col items-center gap-3"
        >
          {/* Visual Mode Toggle Switch */}
          <div className="flex p-1 bg-slate-100 border border-slate-200/50 rounded-2xl shadow-sm z-20">
            <button
              onClick={() => setVisualMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                visualMode === "map"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Map size={12} />
              <span>2D Map</span>
            </button>
            <button
              onClick={() => setVisualMode("globe")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                visualMode === "globe"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              <Globe size={12} />
              <span>3D Globe</span>
            </button>
          </div>

          {/* Map / Globe Rendering Container */}
          <div className="w-full relative min-h-[300px] md:min-h-[380px] p-3 rounded-[2.5rem] bg-white/45 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(107,29,47,0.1)] hover:border-white/80">
            <div className="absolute inset-0 bg-gradient-to-tr from-maroon-500/5 to-navy-500/5 pointer-events-none rounded-[2.5rem] z-10 border border-white/10" />
            <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
              {visualMode === "map" ? (
                <AlumniMap alumniData={alumni} />
              ) : (
                <AlumniGlobe alumniData={alumni} />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
