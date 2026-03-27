import React from 'react';
import { Zap } from 'lucide-react';

export default function Slide5() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-movyraMint/10 via-surfaceBlack to-surfaceBlack pointer-events-none"></div>
      
      <div className="w-32 h-32 bg-movyraMint/10 border border-movyraMint/20 rounded-full flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(0,240,181,0.3)] relative z-10">
        <Zap size={48} className="text-movyraMint fill-movyraMint drop-shadow-[0_0_20px_rgba(0,240,181,0.8)] animate-pulse" />
      </div>
      
      <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight relative z-10">
        Let's <br/><span className="text-movyraMint italic">Move.</span>
      </h1>
      <p className="text-textGray text-lg leading-relaxed max-w-sm relative z-10">
        You are now ready to experience the most advanced logistics platform by Bongo.
      </p>
    </div>
  );
}