import React, { useState, useEffect } from 'react';
import { Globe, Menu } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black py-4 shadow-xl' : 'bg-black py-5'}`}>
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Brand & Primary Links */}
        <div className="flex items-center gap-10">
          <a href="/" className="text-[28px] font-black tracking-tighter text-white cursor-pointer hover:text-gray-300 transition-colors">
            Movyra.
          </a>
          <div className="hidden lg:flex items-center gap-6 font-bold text-[15px] text-white">
            <a href="/ride" className="hover:bg-white/10 px-3 py-2 rounded-full transition-all">Ride</a>
            <a href="/drive" className="hover:bg-white/10 px-3 py-2 rounded-full transition-all">Drive</a>
            <a href="/business" className="hover:bg-white/10 px-3 py-2 rounded-full transition-all">Business</a>
            <a href="/about" className="hover:bg-white/10 px-3 py-2 rounded-full transition-all flex items-center gap-1">About <ChevronDownIcon /></a>
          </div>
        </div>

        {/* Right: Secondary Links & Actions */}
        <div className="hidden lg:flex items-center gap-4 font-bold text-[15px] text-white">
          <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-full transition-all">
            <Globe size={16} /> EN
          </button>
          <button className="hover:bg-white/10 px-3 py-2 rounded-full transition-all">Help</button>
          <button className="hover:bg-white/10 px-3 py-2 rounded-full transition-all">Log in</button>
          <button className="bg-white text-black px-5 py-2.5 rounded-full font-black hover:bg-gray-200 transition-colors shadow-sm ml-2">
            Sign up
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden text-white hover:bg-white/10 p-2 rounded-full transition-colors">
          <Menu size={28} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);