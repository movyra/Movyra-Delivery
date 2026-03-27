import React from 'react';
import { Network } from 'lucide-react';

export default function Slide1() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center relative">
      <div className="relative mb-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-movyraMint opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="w-40 h-40 border border-white/5 bg-surfaceDark rounded-full flex items-center justify-center shadow-2xl relative z-10">
           <Network size={80} strokeWidth={1} className="text-movyraMint drop-shadow-[0_0_15px_rgba(0,240,181,0.6)]" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
        The Movyra <br/><span className="text-movyraMint">Network</span>
      </h1>
      <p className="text-textGray text-lg leading-relaxed max-w-sm">
        Connect to your city's fastest, most intelligent logistics engine. Built for absolute precision.
      </p>
    </div>
  );
}