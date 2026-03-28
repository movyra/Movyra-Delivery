import React from 'react';
export default function MovyraLogo({ size = 40, showText = true }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="32" height="32" rx="10" stroke="#00F0B5" strokeWidth="6" className="drop-shadow-[0_0_8px_rgba(0,240,181,0.5)]"/>
      </svg>
      {showText && <span className="font-sans font-bold text-white text-2xl tracking-tight">Movyra</span>}
    </div>
  );
}
