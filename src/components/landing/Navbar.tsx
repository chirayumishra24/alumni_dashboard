/* eslint-disable */
"use client";

import React from "react";
import { RefreshCw, PlusCircle } from "lucide-react";
import Logo from "../Logo";

interface NavbarProps {
  isSyncing: boolean;
  triggerSync: () => Promise<void>;
  setShowRegModal: (show: boolean) => void;
  context?: "dashboard" | "CCHS" | "CCWS" | "CCIS";
}

export default function Navbar({ isSyncing, triggerSync, setShowRegModal, context = "dashboard" }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md px-6 md:px-8 py-2.5 border-b border-slate-200/25">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3.5 select-none">
          <Logo size={42} showText={false} />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-900 tracking-wide leading-tight">
              {context === "CCHS" && "CCHS Alumni Website"}
              {context === "CCWS" && "CCWS Alumni Website"}
              {context === "CCIS" && "CCIS Top 30 Alumni"}
              {context === "dashboard" && <>CCGS <span className="font-medium text-slate-500">Alumni Directory</span></>}
            </span>
            <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 leading-none">
              {context === "CCHS" && "Cambridge Court High School"}
              {context === "CCWS" && "Cambridge Court World School"}
              {context === "CCIS" && "Cambridge Court International School"}
              {context === "dashboard" && "Connecting Future Leaders"}
            </span>
          </div>
        </div>

        {/* Quick Links for Landing Page */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-widest text-slate-500">
          <a href="#explore" className="hover:text-slate-900 transition-colors">Explore</a>
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
        </nav>

        <div className="flex items-center gap-3">
          {context === "dashboard" && (
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all border shadow-sm active:scale-95 duration-150 ${
                isSyncing
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700"
              }`}
            >
              <RefreshCw size={12} className={`${isSyncing ? "animate-spin text-maroon-600" : "text-slate-500"}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Sheets"}</span>
            </button>
          )}

          <button
            onClick={() => setShowRegModal(true)}
            className="group relative overflow-hidden flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-600 to-navy-700 hover:from-maroon-500 hover:to-navy-600 text-[10px] md:text-xs font-bold text-white shadow-[0_4px_14px_rgba(107,29,47,0.15)] hover:shadow-[0_6px_20px_rgba(107,29,47,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-white/10"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <PlusCircle size={14} className="group-hover:rotate-90 group-hover:scale-110 transition-all duration-300 text-amber-350 shrink-0" />
            <span className="hidden sm:inline">Register Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
}
