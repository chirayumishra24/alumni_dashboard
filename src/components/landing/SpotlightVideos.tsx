/* eslint-disable */
"use client";

import React from "react";
import { Play, Video } from "lucide-react";

// Video lists declared locally to keep the main orchestrator file clean
const ALUMNI_VIDEOS_L2R = [
  { id: "jnQe7v8XwrU", title: "IIT Roorkee Testimony", name: "Divisha Khurana", role: "IIT Roorkee (Electrical)", image: "https://img.youtube.com/vi/jnQe7v8XwrU/0.jpg" },
  { id: "6gw7mva7OzU", title: "NLSIU Law Graduation Testimony", name: "Yashashvi Bharadwaj", role: "NLSIU Law Graduate", image: "https://img.youtube.com/vi/6gw7mva7OzU/0.jpg" },
  { id: "VUbI5Y4x0HY", title: "ISB & Innovaccer Director Success Story", name: "Innovaccer Director", role: "ISB Alumnus", image: "https://img.youtube.com/vi/VUbI5Y4x0HY/0.jpg" },
  { id: "_T5xL8ivQdU", title: "Sub Lieutenant commission from NDA", name: "Sub Lieutenant", role: "NDA Officer", image: "https://img.youtube.com/vi/_T5xL8ivQdU/0.jpg" },
  { id: "bXBoBQWwWwg", title: "BITS Pilani & Walmart Journey", name: "Walmart Engineer", role: "BITS Pilani Alumnus", image: "https://img.youtube.com/vi/bXBoBQWwWwg/0.jpg" },
  { id: "qwjOejQpZhA", title: "IIT Bombay & Bain & Co Career Path", name: "Bain Associate", role: "IIT Bombay Alumnus", image: "https://img.youtube.com/vi/qwjOejQpZhA/0.jpg" },
  { id: "GP-bR8yqemQ", title: "IPS Officer UPSC AIR-178 Journey", name: "IPS Officer", role: "UPSC Civil Services", image: "https://img.youtube.com/vi/GP-bR8yqemQ/0.jpg" },
  { id: "Y35-UfpD1C0", title: "Supreme Court Advocate Journey", name: "SC Advocate", role: "Supreme Court & High Court", image: "https://img.youtube.com/vi/Y35-UfpD1C0/0.jpg" },
  { id: "rAMIxtssDzI", title: "Cinematography & Filmmaker Journey", name: "Filmmaker", role: "Cinematography Professional", image: "https://img.youtube.com/vi/rAMIxtssDzI/0.jpg" },
  { id: "80sosZzVmfU", title: "Pierce Sweden Product Developer Journey", name: "Product Developer", role: "Pierce (Sweden)", image: "https://img.youtube.com/vi/80sosZzVmfU/0.jpg" },
  { id: "lJXjTNGkL7A", title: "Atlantis The Palm Chef Journey", name: "Atlantis Chef", role: "Nobu (Dubai)", image: "https://img.youtube.com/vi/lJXjTNGkL7A/0.jpg" },
];

const ALUMNI_VIDEOS_R2L = [
  { id: "VUbI5Y4x0HY", title: "ISB & Innovaccer Director Success Story", name: "Innovaccer Director", role: "ISB Alumnus", image: "https://img.youtube.com/vi/VUbI5Y4x0HY/0.jpg" },
  { id: "jnQe7v8XwrU", title: "IIT Roorkee Testimony", name: "Divisha Khurana", role: "IIT Roorkee (Electrical)", image: "https://img.youtube.com/vi/jnQe7v8XwrU/0.jpg" },
  { id: "6gw7mva7OzU", title: "NLSIU Law Graduation Testimony", name: "Yashashvi Bharadwaj", role: "NLSIU Law Graduate", image: "https://img.youtube.com/vi/6gw7mva7OzU/0.jpg" },
  { id: "bXBoBQWwWwg", title: "BITS Pilani & Walmart Journey", name: "Walmart Engineer", role: "BITS Pilani Alumnus", image: "https://img.youtube.com/vi/bXBoBQWwWwg/0.jpg" },
  { id: "_T5xL8ivQdU", title: "Sub Lieutenant commission from NDA", name: "Sub Lieutenant", role: "NDA Officer", image: "https://img.youtube.com/vi/_T5xL8ivQdU/0.jpg" },
  { id: "qwjOejQpZhA", title: "IIT Bombay & Bain & Co Career Path", name: "Bain Associate", role: "IIT Bombay Alumnus", image: "https://img.youtube.com/vi/qwjOejQpZhA/0.jpg" },
  { id: "GP-bR8yqemQ", title: "IPS Officer UPSC AIR-178 Journey", name: "IPS Officer", role: "UPSC Civil Services", image: "https://img.youtube.com/vi/GP-bR8yqemQ/0.jpg" },
  { id: "Y35-UfpD1C0", title: "Supreme Court Advocate Journey", name: "SC Advocate", role: "Supreme Court & High Court", image: "https://img.youtube.com/vi/Y35-UfpD1C0/0.jpg" },
  { id: "rAMIxtssDzI", title: "Cinematography & Filmmaker Journey", name: "Filmmaker", role: "Cinematography Professional", image: "https://img.youtube.com/vi/rAMIxtssDzI/0.jpg" },
  { id: "lJXjTNGkL7A", title: "Atlantis The Palm Chef Journey", name: "Atlantis Chef", role: "Nobu (Dubai)", image: "https://img.youtube.com/vi/lJXjTNGkL7A/0.jpg" },
  { id: "80sosZzVmfU", title: "Pierce Sweden Product Developer Journey", name: "Product Developer", role: "Pierce (Sweden)", image: "https://img.youtube.com/vi/80sosZzVmfU/0.jpg" },
];

interface SpotlightVideosProps {
  setActiveVideoId: (id: string | null) => void;
  embedded?: boolean;
}

export default function SpotlightVideos({ setActiveVideoId, embedded = false }: SpotlightVideosProps) {
  return (
    <section className={`${embedded ? 'py-2' : 'py-6'} space-y-6 relative z-10 max-w-[100vw] overflow-hidden`}>
      {!embedded && (
      <div className="max-w-7xl mx-auto px-6 md:px-8 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
          <Video size={12} className="text-slate-655 animate-pulse" /> Alumni Success Spotlights
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          Hear From Our Global Graduates
        </h3>
        <p className="text-xs text-slate-500 max-w-xl mt-1">
          Muted previews from CCHS &amp; CCWS graduates sharing career pathways, startup journeys, and industry insights. Click to play.
        </p>
      </div>
      )}

      {/* Continuous Video marquee tracks with Fading Mask */}
      <div className="marquee-container marquee-mask py-2 space-y-4">
        
        {/* Row 1: Left to Right */}
        <div className="marquee-track-left gap-4">
          {[...ALUMNI_VIDEOS_L2R, ...ALUMNI_VIDEOS_L2R].map((video, idx) => (
            <div 
              key={`l2r-${idx}`}
              onClick={() => setActiveVideoId(video.id)}
              className="group relative w-[280px] aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
            >
              {/* Thumbnail */}
              <img 
                src={video.image} 
                alt={video.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              {/* Dark Vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 group-hover:via-slate-950/50 transition-all" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-3.5 rounded-full bg-white/90 text-slate-900 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                </div>
              </div>

              {/* Video Info details */}
              <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                  Watch Story
                </span>
                <h4 className="text-xs font-bold text-white leading-snug tracking-tight drop-shadow-sm line-clamp-1">
                  {video.title}
                </h4>
                <p className="text-[10px] text-slate-200 font-semibold truncate drop-shadow-sm">
                  {video.name} · <span className="text-slate-350">{video.role}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Right to Left — hidden in embedded mode */}
        {!embedded && (
        <div className="marquee-track-right gap-4">
          {[...ALUMNI_VIDEOS_R2L, ...ALUMNI_VIDEOS_R2L].map((video, idx) => (
            <div 
              key={`r2l-${idx}`}
              onClick={() => setActiveVideoId(video.id)}
              className="group relative w-[280px] aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
            >
              {/* Thumbnail */}
              <img 
                src={video.image} 
                alt={video.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              {/* Dark Vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 group-hover:via-slate-950/50 transition-all" />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-3.5 rounded-full bg-white/90 text-slate-900 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Play size={18} fill="currentColor" className="ml-0.5" />
                </div>
              </div>

              {/* Video Info details */}
              <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                  Watch Story
                </span>
                <h4 className="text-xs font-bold text-white leading-snug tracking-tight drop-shadow-sm line-clamp-1">
                  {video.title}
                </h4>
                <p className="text-[10px] text-slate-200 font-semibold truncate drop-shadow-sm">
                  {video.name} · <span className="text-slate-350">{video.role}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>
    </section>
  );
}
