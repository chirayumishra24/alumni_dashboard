"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, Users, ShieldAlert, HelpCircle, 
  Menu, X, LogOut, ArrowLeftRight, Award, GraduationCap, UserSquare2
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingCount: number;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, pendingCount, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "OVERVIEW", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "PENDING", label: "Pending Approvals", icon: ShieldAlert, badge: pendingCount },
    { id: "DIRECTORY", label: "Alumni Directory", icon: Users },
    { id: "TESTIMONIALS", label: "Testimonials", icon: Award },
    { id: "MENTORSHIPS", label: "Mentorship Inquiries", icon: HelpCircle },
    { id: "STUDENT_PERSPECTIVE", label: "Student Perspective", icon: GraduationCap },
    { id: "ALUMNI_PERSPECTIVE", label: "Alumni Perspective", icon: UserSquare2 },
  ];

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center font-black text-white text-sm shadow-md">
            CC
          </div>
          <span className="font-bold text-sm text-slate-900">Alumni Admin</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
        >
          {isOpen ? <X size={20} className="text-slate-600" /> : <Menu size={20} className="text-slate-600" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/70 lg:bg-white/35 border-r border-slate-200 lg:border-white/40 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-[calc(100vh-3rem)] lg:sticky lg:top-6 lg:rounded-[2rem] lg:glass-sidebar lg:shadow-xl ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 space-y-8 flex-1 flex flex-col">
          {/* Logo Section */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md shadow-indigo-500/10">
              CCGS
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-wide">CCGS Alumni Hub</h1>
              <p className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase">Coordinator Panel</p>
            </div>
          </div>
 
          {/* Navigation Items */}
          <nav className="space-y-1.5 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive 
                      ? "bg-white/50 border-l-2 border-violet-650 text-violet-755 shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/10 border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-violet-600" : "text-slate-505"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-600 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
 
        {/* Bottom Actions */}
        <div className="p-6 border-t border-slate-200 lg:border-white/40 space-y-3">
          <button 
            onClick={() => window.open('/', '_blank')}
            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all glass-button shadow-sm"
          >
            <ArrowLeftRight size={14} className="text-slate-500" /> Public Showcase
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-rose-250 bg-rose-50/30 hover:bg-rose-100/50 text-rose-700 shadow-sm"
          >
            <LogOut size={14} className="text-rose-550" /> Log Out
          </button>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}
    </>
  );
}
