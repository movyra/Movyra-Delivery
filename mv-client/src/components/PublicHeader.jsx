import React, { useState } from 'react';
import { Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { BongoLogo } from '../assets/Icons';

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  return (
    <header className="bg-black text-white h-16 md:h-20 sticky top-0 z-[100] border-b border-[#1A1A1A]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/"><BongoLogo /></a>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-gray-300 transition-colors">Ride</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Drive</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Business</a>
            <div className="relative group cursor-pointer flex items-center gap-1">
              About <ChevronDown size={14} />
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
             <span className="flex items-center gap-1.5"><Globe size={16}/> EN</span>
             <a href="#" className="hover:text-gray-300">Help</a>
             <a href="#" className="hover:text-gray-300">Log in</a>
          </div>
          <a href="/entry/auth-signup.html" className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-all">Sign up</a>
          
          {/* 2-LINE HAMBURGER (Strictly 2 lines) */}
          <button className="lg:hidden flex flex-col gap-[6px] p-2" onClick={() => setIsOpen(!isOpen)}>
            <div className={`w-6 h-[2px] bg-white transition-all ${isOpen ? 'rotate-45 translate-y-[4px]' : ''}`}></div>
            <div className={`w-6 h-[2px] bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-[4px]' : ''}`}></div>
          </button>
        </div>
      </div>
    </header>
  );
}