import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export default function Slide4() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
      <div className="relative mb-12">
        <div className="w-32 h-32 bg-surfaceDark border border-white/5 rounded-3xl flex items-center justify-center rotate-12 relative z-10 shadow-2xl">
          <ShieldCheck size={56} className="text-movyraMint drop-shadow-[0_0_15px_rgba(0,240,181,0.5)]" />
        </div>
        <div className="w-24 h-24 bg-surfaceDarker border border-white/5 rounded-2xl flex items-center justify-center absolute -bottom-4 -left-6 -rotate-6 z-0">
          <Lock size={32} className="text-textGray" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
        Zero-Trust <br/>Security
      </h1>
      <p className="text-textGray text-lg leading-relaxed max-w-sm">
        Your cargo is protected. Mandatory OTP verification guarantees your items are handed only to the authorized recipient.
      </p>
    </div>
  );
}