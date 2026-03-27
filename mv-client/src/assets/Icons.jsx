import React from 'react';

export const BongoLogo = ({ color = "white" }) => (
  <div className="flex items-center gap-2">
    <div className="w-9 h-9 bg-[#1A1A1A] rounded-lg flex items-center justify-center border border-[#2A2A2A]">
      <span className="text-[#00A3FF] font-black text-xl">B</span>
    </div>
    <span style={{ color }} className="font-extrabold text-[22px] tracking-tighter">BONGO</span>
  </div>
);

export const SuitcaseIllustration = () => (
  <svg viewBox="0 0 550 550" fill="none" className="w-full h-full drop-shadow-2xl">
    <rect x="50" y="50" width="450" height="450" rx="40" fill="#FFC043" />
    <rect x="80" y="100" width="390" height="340" rx="20" fill="black" fillOpacity="0.05" />
    <g transform="translate(100, 130)">
       <rect width="120" height="180" rx="10" fill="white" />
       {[20, 40, 60, 80].map(y => <rect key={y} y={y} width="120" height="10" fill="#00A3FF" opacity="0.4" />)}
    </g>
    <circle cx="300" cy="180" r="25" fill="#1A1A1A" />
    <circle cx="360" cy="180" r="25" fill="#1A1A1A" />
  </svg>
);

export const Truck3DIcon = () => (
  <svg viewBox="0 0 200 200" fill="none" className="w-32 h-32 rotate-[-15deg]">
    <path d="M40 140L160 140L180 120L60 120L40 140Z" fill="black" fillOpacity="0.1" />
    <rect x="60" y="60" width="100" height="60" fill="#FF3B30" />
    <rect x="20" y="90" width="40" height="30" fill="#FF3B30" />
    <circle cx="45" cy="130" r="12" fill="#1A1A1A" />
    <circle cx="130" cy="130" r="12" fill="#1A1A1A" />
  </svg>
);