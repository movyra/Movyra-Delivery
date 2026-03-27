import React from 'react';
import { Navigation } from 'lucide-react';

export default function Slide3() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
      <div className="relative w-full max-w-[280px] h-48 mb-12 bg-surfaceDark border border-white/5 rounded-[32px] overflow-hidden flex items-center justify-center">
        {/* Mock Glowing Route Line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 192" fill="none">
          <path d="M40 150 C 100 150, 150 100, 200 40" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />
          <path d="M40 150 C 100 150, 150 100, 200 40" stroke="#00F0B5" strokeWidth="4" strokeLinecap="round" className="animate-[dash_3s_linear_infinite]" strokeDasharray="200" strokeDashoffset="200" style={{ filter: 'drop-shadow(0 0 8px rgba(0,240,181,0.8))' }} />
        </svg>
        <div className="absolute top-8 right-16 w-10 h-10 bg-movyraMint/20 rounded-full flex items-center justify-center shadow-mintGlow animate-bounce">
          <Navigation size={20} className="text-movyraMint fill-current rotate-45" />
        </div>
        <div className="absolute bottom-10 left-8 w-4 h-4 bg-white rounded-full border-4 border-surfaceDark"></div>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
        Live Map <br/>Tracking
      </h1>
      <p className="text-textGray text-lg leading-relaxed max-w-sm">
        Never guess where your items are. Watch your delivery move across the city with second-by-second telemetry.
      </p>
    </div>
  );
}