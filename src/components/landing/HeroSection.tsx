/* eslint-disable */
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { PlusCircle, Map, Globe, RefreshCw } from "lucide-react";

// Dynamic imports to prevent SSR crashes for Leaflet/Three.js
const AlumniMap = dynamic(() => import("../AlumniMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] md:h-[480px] rounded-[3rem] bg-slate-100/50 backdrop-blur-md flex flex-col items-center justify-center gap-3 border border-slate-200/50 shadow-2xl">
      <RefreshCw size={24} className="animate-spin text-maroon-600" />
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Connections Map...</span>
    </div>
  )
});

const AlumniGlobe = dynamic(() => import("../AlumniGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] md:h-[480px] rounded-[3rem] bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-center gap-3 border border-white/10 shadow-2xl">
      <RefreshCw size={24} className="animate-spin text-amber-500" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Globe...</span>
    </div>
  )
});

interface HeroSectionProps {
  alumni: any[];
  setShowRegModal: (show: boolean) => void;
  context?: "dashboard" | "CCHS" | "CCWS" | "CCIS";
}

export default function HeroSection({ alumni, setShowRegModal, context = "dashboard" }: HeroSectionProps) {
  const [visualMode, setVisualMode] = useState<"map" | "globe">("map");

  return (
    <section className="relative max-w-7xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-20 z-10">
      
      {/* Infinite Image Slider Background (Faded marquee) */}
      <div className="absolute inset-0 -top-12 left-0 right-0 overflow-hidden pointer-events-none select-none opacity-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FAF8F5]/95 z-10" />
        <div className="flex w-max gap-8 pt-10 animate-[marquee-left_120s_linear_infinite]">
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
              className="w-[450px] md:w-[680px] h-[350px] md:h-[450px] rounded-[2.5rem] overflow-hidden border border-slate-200/35 shadow-xl shrink-0"
            >
              <img 
                src={src} 
                className="w-full h-full object-cover filter saturate-[0.8] contrast-[0.95] blur-[2px]" 
                alt="Campus Background" 
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Headline and Description */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-maroon-50 border border-maroon-100 text-[10px] font-black text-maroon-700 uppercase tracking-widest">
              {context === "dashboard" ? "Connecting Legacies" : `${context} Alumni Hub`}
            </span>
            <h1 className="text-4xl md:text-[3.5rem] lg:text-[4rem] font-serif font-black text-slate-900 tracking-tight leading-[1.1]">
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
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <button 
              onClick={() => setShowRegModal(true)}
              className="group relative overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-maroon-600 to-navy-700 hover:from-maroon-500 hover:to-navy-600 text-xs font-black text-white uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-white/10"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>Join The Network</span>
            </button>
            
            <a 
              href="#directory"
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest shadow-md transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center"
            >
              Browse Directory
            </a>
          </motion.div>
        </div>

        {/* Right Column: Interactive Map/Globe with Mode Selector */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="lg:col-span-6 w-full flex flex-col items-center gap-4"
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
          <div className="w-full relative min-h-[380px] md:min-h-[480px] p-3 rounded-[3rem] bg-white/45 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(107,29,47,0.1)] hover:border-white/80">
            <div className="absolute inset-0 bg-gradient-to-tr from-maroon-500/5 to-navy-500/5 pointer-events-none rounded-[3rem] z-10 border border-white/10" />
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
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
