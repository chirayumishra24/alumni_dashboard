"use client";

import React, { useId } from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showText = true, className = "" }: LogoProps) {
  const id = useId();
  const maroonGradId = `maroon-grad-${id}`;
  const navyGradId = `navy-grad-${id}`;
  const goldGradId = `gold-grad-${id}`;
  const shadowId = `shadow-${id}`;

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* SVG Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-500 hover:rotate-3 active:scale-95 filter drop-shadow-sm"
      >
        <defs>
          <linearGradient id={maroonGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b2238" />
            <stop offset="100%" stopColor="#4a0e1a" />
          </linearGradient>
          <linearGradient id={navyGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#324a70" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Shield with Drop Shadow */}
        <g filter={`url(#${shadowId})`}>
          {/* Left Shield Segment (Maroon) */}
          <path d="M256,40 L96,100 L96,280 C96,380 256,472 256,472 Z" fill={`url(#${maroonGradId})`} />

          {/* Right Shield Segment (Navy) */}
          <path d="M256,40 L416,100 L416,280 C416,380 256,472 256,472 Z" fill={`url(#${navyGradId})`} />

          {/* Golden Vertical Divider line */}
          <line x1="256" y1="40" x2="256" y2="472" stroke={`url(#${goldGradId})`} strokeWidth="4" opacity="0.4" />

          {/* Shield Border (Gold) */}
          <path
            d="M256,40 L416,100 L416,280 C416,380 256,472 256,472 C256,472 96,380 96,280 L96,100 Z"
            fill="none"
            stroke={`url(#${goldGradId})`}
            strokeWidth="14"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>

        {/* Center Emblem: Laurel Wreath & Star & Monogram */}
        <g>
          {/* Star of leadership */}
          <polygon points="256,110 264,130 286,130 268,143 275,164 256,151 237,164 244,143 226,130 248,130" fill={`url(#${goldGradId})`} />

          {/* Laurel Wreath Leaves (Left and Right sides) */}
          {/* Left side leaves */}
          <path d="M190,230 Q170,255 165,290" fill="none" stroke={`url(#${goldGradId})`} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
          <path d="M190,230 C185,220 170,220 170,230 C170,240 185,240 190,230 Z" fill={`url(#${goldGradId})`} />
          <path d="M178,255 C170,245 158,248 158,258 C158,268 170,265 178,255 Z" fill={`url(#${goldGradId})`} />
          <path d="M168,285 C160,275 148,280 148,290 C148,300 160,295 168,285 Z" fill={`url(#${goldGradId})`} />
          
          {/* Right side leaves */}
          <path d="M322,230 Q342,255 347,290" fill="none" stroke={`url(#${goldGradId})`} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
          <path d="M322,230 C327,220 342,220 342,230 C342,240 327,240 322,230 Z" fill={`url(#${goldGradId})`} />
          <path d="M334,255 C342,245 354,248 354,258 C354,268 342,265 334,255 Z" fill={`url(#${goldGradId})`} />
          <path d="M344,285 C352,275 364,280 364,290 C364,300 352,295 344,285 Z" fill={`url(#${goldGradId})`} />

          {/* Monogram CCGS */}
          <text
            x="256"
            y="325"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="82"
            fontWeight="900"
            fill="#ffffff"
            textAnchor="middle"
            letterSpacing="1"
          >
            CCGS
          </text>
          
          {/* Elegant gold horizontal line */}
          <path d="M190,345 L322,345" stroke={`url(#${goldGradId})`} strokeWidth="4" strokeLinecap="round" />
          
          {/* Mini diamond indicator */}
          <path d="M256,365 L271,375 L256,385 L241,375 Z" fill={`url(#${goldGradId})`} />
        </g>
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-slate-900 tracking-wide leading-tight">
            CCGS <span className="font-medium text-slate-500">Alumni Directory</span>
          </span>
          <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 leading-none">
            Connecting Future Leaders
          </span>
        </div>
      )}
    </div>
  );
}
