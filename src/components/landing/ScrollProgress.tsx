"use client";

import React, { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3.5px] bg-slate-100/50 z-[9999] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-maroon-600 via-maroon-500 to-navy-700 transition-all duration-75 ease-out rounded-r-full"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
