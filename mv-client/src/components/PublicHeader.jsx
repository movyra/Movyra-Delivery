import React, { useState } from 'react';
import { Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { BongoLogo } from '../assets/Icons';

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-16 md:h-20 bg-deepMidnight/80 backdrop-blur-xl border-b border-white/10 text-white font-sans transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/" className="hover:opacity-80 transition-opacity"><BongoLogo /></a>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="#" className="hover:text-neonCloud transition-colors">Ride</a>
            <a href="#" className="hover:text-neonCloud transition-colors">Drive</a>
            <a href="#" className="hover:text-neonCloud transition-colors">Business</a>
            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-neonCloud transition-colors">
              About <ChevronDown size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium tracking-wide">
             <span className="flex items-center gap-1.5 cursor-pointer hover:text-neonCloud transition-colors">
               <Globe size={16} className="opacity-70"/> EN
             </span>
             <a href="#" className="hover:text-neonCloud transition-colors">Help</a>
             <a href="#" className="hover:text-neonCloud transition-colors">Log in</a>
          </div>
          
          <a href="/entry/auth-signup.html" className="bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Sign up
          </a>
          
          {/* 2-LINE HAMBURGER (Strictly 2 lines) */}
          <button className="lg:hidden flex flex-col gap-[6px] p-2 z-50 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className={`w-6 h-[2px] bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[4px]' : ''}`}></div>
            <div className={`w-6 h-[2px] bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[4px]' : ''}`}></div>
          </button>
        </div>
      </div>
    </header>
  );
}