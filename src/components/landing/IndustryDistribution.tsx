/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, BarChart3, Briefcase, GraduationCap, Scale, HeartPulse, Landmark, Coins } from "lucide-react";
import { motion } from "framer-motion";

interface IndustryItem {
  name: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

const DEFAULT_INDUSTRIES: IndustryItem[] = [
  { name: "Software & Technology", count: 48, percentage: 35, icon: <Briefcase size={16} />, color: "from-blue-500 to-indigo-600" },
  { name: "Civil Services & Government", count: 28, percentage: 20, icon: <Landmark size={16} />, color: "from-amber-500 to-orange-600" },
  { name: "Medicine & Health Sciences", count: 22, percentage: 16, icon: <HeartPulse size={16} />, color: "from-emerald-500 to-teal-600" },
  { name: "Law & Judicial Services", count: 18, percentage: 13, icon: <Scale size={16} />, color: "from-violet-500 to-purple-600" },
  { name: "Consulting & Finance", count: 15, percentage: 11, icon: <Coins size={16} />, color: "from-rose-500 to-pink-600" },
  { name: "Research & Higher Ed", count: 8, percentage: 5, icon: <GraduationCap size={16} />, color: "from-cyan-500 to-sky-600" }
];

interface IndustryDistributionProps {
  embedded?: boolean;
}

export default function IndustryDistribution({ embedded = false }: IndustryDistributionProps) {
  const [industries, setIndustries] = useState<IndustryItem[]>(DEFAULT_INDUSTRIES);

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const res = await fetch("/api/alumni");
        if (res.ok) {
          const alumni = await res.json();
          if (Array.isArray(alumni) && alumni.length > 0) {
            const counts: { [key: string]: number } = {
              "Software & Technology": 0,
              "Civil Services & Government": 0,
              "Medicine & Health Sciences": 0,
              "Law & Judicial Services": 0,
              "Consulting & Finance": 0,
              "Research & Higher Ed": 0
            };

            const techRegex = /\b(tech|software|developer|engineer|amazon|google|microsoft|meta|tcs|infosys|accenture|product|manager|analyst|design)\b/i;
            const govRegex = /\b(diplomat|ifs|ias|ips|upsc|government|ministry|civil|defense|army|navy|air force|police|tax|commissioner|officer|advocate|court|lieutenant)\b/i;
            const medRegex = /\b(doctor|physician|surgeon|medical|health|hospital|aiims|dental|clinical|dentist|mbbs|md)\b/i;
            const lawRegex = /\b(law|advocate|court|legal|lawyer|nlsiu|judiciary|attorney|practice)\b/i;
            const finRegex = /\b(consultant|finance|deloitte|ey|kpmg|pwc|mckinsey|bain|advisory|analyst|investment|bank|business)\b/i;

            alumni.forEach((a: any) => {
              const fullText = `${a.company || ''} ${a.role || ''} ${a.bio || ''} ${a.skills || ''}`.toLowerCase();
              if (techRegex.test(fullText)) {
                counts["Software & Technology"]++;
              } else if (govRegex.test(fullText)) {
                counts["Civil Services & Government"]++;
              } else if (medRegex.test(fullText)) {
                counts["Medicine & Health Sciences"]++;
              } else if (lawRegex.test(fullText)) {
                counts["Law & Judicial Services"]++;
              } else if (finRegex.test(fullText)) {
                counts["Consulting & Finance"]++;
              } else {
                counts["Research & Higher Ed"]++;
              }
            });

            const total = Object.values(counts).reduce((acc, curr) => acc + curr, 0);
            if (total > 0) {
              const updated = DEFAULT_INDUSTRIES.map(item => {
                const count = counts[item.name] || 0;
                return {
                  ...item,
                  count,
                  percentage: Math.round((count / total) * 100)
                };
              }).sort((a, b) => b.count - a.count);
              setIndustries(updated);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch industry metrics:", e);
      }
    };
    calculateStats();
  }, []);

  if (embedded) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-6">
          {industries.map((ind, idx) => (
            <div key={idx} className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
                    {ind.icon}
                  </div>
                  <span>{ind.name}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-slate-400 font-semibold text-[10px]">{ind.count} profiles</span>
                  <span className="text-sm font-black text-slate-900">{ind.percentage}%</span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${ind.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                  className={`h-full bg-gradient-to-r ${ind.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-10 text-left">
      <div className="bg-white border border-slate-200/60 rounded-[3rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Header left */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 border border-navy-100 text-[10px] font-black text-navy-700 uppercase tracking-widest w-fit">
                <BarChart3 size={11} /> Career Sectors
              </span>
              <h3 className="text-3xl font-serif font-black tracking-tight text-slate-900 leading-tight">
                Alumni Industry Mappings
              </h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Our network footprint spans major industrial and academic verticals. This live distribution highlights the diversity of career paths taken by verified graduates.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4.5 rounded-2xl border border-slate-100/50">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b2238] shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold text-slate-800 block">Verified Alumni Base</span>
                <span className="text-slate-500 font-semibold">Updated in real-time from our linked secure Google Sheets database.</span>
              </div>
            </div>
          </div>

          {/* Bar Chart list */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
            {industries.map((ind, idx) => (
              <div key={idx} className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
                      {ind.icon}
                    </div>
                    <span>{ind.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-slate-400 font-semibold text-[10px]">{ind.count} profiles</span>
                    <span className="text-sm font-black text-slate-900">{ind.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${ind.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                    className={`h-full bg-gradient-to-r ${ind.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
