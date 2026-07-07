/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { Quote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  batch: number;
  school: "CCHS" | "CCWS";
  quote: string;
  avatar: string;
}

const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Yashashvi Bharadwaj",
    role: "NLSIU Law Graduate",
    company: "Supreme Court of India",
    batch: 2017,
    school: "CCHS",
    quote: "Cambridge Court gave me the foundation to think critically and pursue law at India's premier institute. The support of teachers was unmatched.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "t2",
    name: "Divisha Khurana",
    role: "Electrical Engineer",
    company: "IIT Roorkee",
    batch: 2019,
    school: "CCHS",
    quote: "Cracking JEE was a rigorous journey, and the mentorship I received during my high school days kept me motivated. Now, I hope to guide future aspirants.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "t3",
    name: "Arpit Sharma",
    role: "Software Development Lead",
    company: "Amazon (Seattle)",
    batch: 2015,
    school: "CCWS",
    quote: "Being part of the CCWS international curriculum opened up global avenues for me. Connecting back through this dashboard is a fantastic step.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "t4",
    name: "Sub Lieutenant Rahul",
    role: "NDA Commissioned Officer",
    company: "Indian Navy",
    batch: 2018,
    school: "CCHS",
    quote: "The discipline, physical training, and values instilled in me at school prepared me for the NDA. Honored to represent our nation.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
  },
  {
    id: "t5",
    name: "Nikhil Gupta",
    role: "Senior Consultant",
    company: "Deloitte (Jaipur)",
    batch: 2016,
    school: "CCWS",
    quote: "The business case competitions and school group discussions built my confidence early on. A proud alumnus of Cambridge Court.",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120"
  }
];

export default function AlumniTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(SEED_TESTIMONIALS);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const json = await res.json();
          const approvedWidgets = (json.widgets || [])
            .filter((w: any) => w.isApproved && w.alumni)
            .map((w: any) => ({
              id: w.id,
              name: w.alumni.user?.name || "Verified Alumnus",
              role: w.alumni.role || "Alumni",
              company: w.alumni.company || "",
              batch: w.alumni.batch,
              school: w.alumni.school,
              quote: w.quote,
              avatar: w.alumni.user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
            }));
          if (approvedWidgets.length > 0) {
            setTestimonials([...approvedWidgets, ...SEED_TESTIMONIALS]);
          }
        }
      } catch (e) {
        console.error("Failed to load testimonials:", e);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-maroon-50 border border-maroon-100 text-[10px] font-black text-maroon-700 uppercase tracking-widest">
          <Sparkles size={11} className="fill-current animate-pulse" /> Alumni Voices
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-tight">
          What Our Legacy Achievers Say
        </h2>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
          Read direct feedback and stories shared by verified graduates from our global alumni directory network.
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {testimonials.map((test, idx) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: idx * 0.05, duration: 0.5 }}
            className="break-inside-avoid bg-white border border-slate-200/60 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between"
          >
            {/* Top quote icon & badge */}
            <div className="flex items-center justify-between mb-6">
              <Quote className="text-maroon-100 fill-current" size={32} />
              <span className={`text-[8.5px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                test.school === "CCHS" 
                  ? "bg-maroon-50 text-maroon-700 border border-maroon-100" 
                  : "bg-navy-50 text-navy-700 border border-navy-100"
              }`}>
                {test.school} Network
              </span>
            </div>

            {/* Testimonial Quote */}
            <p className="text-xs text-slate-655 font-medium leading-relaxed italic mb-6">
              &ldquo;{test.quote}&rdquo;
            </p>

            {/* User Info footer */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <img
                src={test.avatar}
                alt={test.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-xs"
              />
              <div className="min-w-0 text-left">
                <h4 className="text-xs font-bold text-slate-900 truncate">{test.name}</h4>
                <p className="text-[10px] font-semibold text-slate-450 truncate">
                  {test.role} {test.company ? `@ ${test.company}` : ""}
                </p>
                <span className="text-[9px] text-[#6b1d2f] font-black uppercase tracking-wider block mt-0.5">
                  Class of {test.batch}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
