/* eslint-disable */
"use client";

import React from "react";
import { UserPlus, Shield, Key, Check } from "lucide-react";

export default function VerificationProcess() {
  const steps = [
    {
      num: "01",
      icon: <UserPlus size={24} className="text-maroon-700" />,
      title: "Submit Profile",
      desc: "Fill the registration form with your batch year, school campus, professional expertise, and optional profile photo."
    },
    {
      num: "02",
      icon: <Shield size={24} className="text-maroon-700" />,
      title: "Vetting & Validation",
      desc: "Our board reviews all incoming self-registrations to match database details and maintain directory authenticity."
    },
    {
      num: "03",
      icon: <Key size={24} className="text-maroon-700" />,
      title: "Unlock Dashboard",
      desc: "Once verified, your profile goes live. You can instantly search connections, contact mentors, or post testimonials."
    }
  ];

  return (
    <section id="process" className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-10 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-maroon-50 border border-maroon-100 text-[10px] font-black text-maroon-700 uppercase tracking-widest">
          Join Flow
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          How to Join Our Verified Network
        </h2>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
          Follow these three simple onboarding phases to activate your secure account profile.
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Horizontal Line connecting steps on desktop */}
        <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-slate-200 -z-10" />

        {steps.map((step, idx) => (
          <div key={idx} className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative text-left">
            {/* Step Number Badge */}
            <span className="absolute top-6 right-8 font-serif italic text-3xl font-black text-slate-100 select-none">
              {step.num}
            </span>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                {step.icon}
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-[10px] font-black text-[#6b1d2f] uppercase tracking-wider">
              <Check size={12} />
              <span>Phase {idx + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
