/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, ArrowRight, BellRing } from "lucide-react";
import { motion } from "framer-motion";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownBanner({ embedded = false }: { embedded?: boolean }) {
  const [eventData, setEventData] = useState({
    title: "Grand Alumni Reunion & Networking Dinner 2026",
    date: new Date("2026-12-25T18:00:00+05:30").toISOString(),
    location: "Grand Ball Room, Jaipur Marriott",
    meetingUrl: "#register"
  });

  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasFinished, setHasFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Attempt to load events from the API
    const loadEvents = async () => {
      try {
        const res = await fetch("/api/data");
        if (res.ok) {
          const json = await res.json();
          const upcoming = (json.events || []).find((e: any) => new Date(e.eventDate).getTime() > Date.now());
          if (upcoming) {
            setEventData({
              title: upcoming.title,
              date: upcoming.eventDate,
              location: upcoming.location,
              meetingUrl: upcoming.meetingUrl || "#register"
            });
          }
        }
      } catch (e) {
        console.error("Failed to load countdown event:", e);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const target = new Date(eventData.date).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setHasFinished(true);
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eventData.date]);

  if (!isMounted || hasFinished) return null;

  if (embedded) {
    return (
      <div className="bg-gradient-to-r from-maroon-700 via-maroon-600 to-navy-700 text-white rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-xl border border-white/10">
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.06),transparent)] pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left info column */}
          <div className="space-y-3.5 max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-300 uppercase tracking-widest">
              <BellRing size={10} className="animate-bounce" /> Live Event Alert
            </span>
            <h4 className="text-lg md:text-xl font-serif font-black tracking-tight leading-tight">
              {eventData.title}
            </h4>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-[10px] md:text-xs text-slate-200 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-amber-400" />
                {new Date(eventData.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-amber-400" />
                {new Date(eventData.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-amber-400" />
                {eventData.location}
              </span>
            </div>
          </div>

          {/* Right countdown timer */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto justify-center">
            <div className="flex items-center gap-3">
              {[
                { label: "Days", val: timeLeft.days },
                { label: "Hrs", val: timeLeft.hours },
                { label: "Mins", val: timeLeft.minutes },
                { label: "Secs", val: timeLeft.seconds }
              ].map((slot, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="min-w-[56px] h-14 bg-white/10 rounded-2xl flex items-center justify-center font-serif text-lg font-black border border-white/5 shadow-inner">
                      {String(slot.val).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mt-1">{slot.label}</span>
                  </div>
                  {idx < 3 && <span className="text-lg font-black text-white/50 ml-3">:</span>}
                </div>
              ))}
            </div>

            <a
              href={eventData.meetingUrl}
              className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-[10px] uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md shrink-0 w-full sm:w-auto justify-center"
            >
              <span>RSVP Now</span>
              <ArrowRight size={12} className="text-maroon-700" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-6 md:px-8 mt-10 relative z-10 text-left"
    >
      <div className="bg-gradient-to-r from-maroon-700 via-maroon-600 to-navy-700 text-white rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden shadow-xl border border-white/10">
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.06),transparent)] pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Left info column */}
          <div className="space-y-3.5 max-w-xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-300 uppercase tracking-widest">
              <BellRing size={10} className="animate-bounce" /> Live Event Alert
            </span>
            <h4 className="text-lg md:text-xl font-serif font-black tracking-tight leading-tight">
              {eventData.title}
            </h4>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-[10px] md:text-xs text-slate-200 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-amber-400" />
                {new Date(eventData.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-amber-400" />
                {new Date(eventData.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-amber-400" />
                {eventData.location}
              </span>
            </div>
          </div>

          {/* Right countdown timer */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto justify-center">
            
            {/* Clock slots */}
            <div className="flex items-center gap-3">
              {[
                { label: "Days", val: timeLeft.days },
                { label: "Hrs", val: timeLeft.hours },
                { label: "Mins", val: timeLeft.minutes },
                { label: "Secs", val: timeLeft.seconds }
              ].map((slot, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="min-w-[56px] h-14 bg-white/10 rounded-2xl flex items-center justify-center font-serif text-lg font-black border border-white/5 shadow-inner">
                      {String(slot.val).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mt-1">{slot.label}</span>
                  </div>
                  {idx < 3 && <span className="text-lg font-black text-white/50 ml-3">:</span>}
                </div>
              ))}
            </div>

            {/* RSVP CTA */}
            <a
              href={eventData.meetingUrl}
              className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-[10px] uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md shrink-0 w-full sm:w-auto justify-center"
            >
              <span>RSVP Now</span>
              <ArrowRight size={12} className="text-maroon-700" />
            </a>

          </div>
        </div>

      </div>
    </motion.section>
  );
}
