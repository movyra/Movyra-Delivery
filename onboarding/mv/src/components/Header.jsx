import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Car, Utensils, Briefcase, Store } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isJoinHovered, setIsJoinHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black shadow-md' : 'bg-black'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        
        {/* Left Section: Logo & Main Navigation */}
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <img src="logo.png" alt="Movyra" className="h-8 w-auto rounded-md object-contain" />
          </a>
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-white">
            <a href="#ride" className="hover:text-gray-300 transition-colors">Ride</a>
            <a href="#drive" className="hover:text-gray-300 transition-colors">Drive</a>
            <a href="#business" className="hover:text-gray-300 transition-colors">Business</a>
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition-colors group">
              About <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200"/>
            </div>
          </nav>
        </div>

        {/* Right Section: Utilities & Sign Up Dropdown */}
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <button className="hidden md:flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded-full transition-colors">
            <Globe size={16} /> EN
          </button>
          <a href="#help" className="hidden md:block hover:bg-gray-800 px-3 py-2 rounded-full transition-colors">Help</a>
          <a href="#login" className="hover:bg-gray-800 px-3 py-2 rounded-full transition-colors">Log in</a>
          
          {/* Dropdown Wrapper */}
          <div 
            className="relative ml-2"
            onMouseEnter={() => setIsJoinHovered(true)}
            onMouseLeave={() => setIsJoinHovered(false)}
          >
            <button className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">
              Sign up
            </button>

            {/* High-End Hover Dropdown Menu */}
            <AnimatePresence>
              {isJoinHovered && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 mt-2 w-72 bg-white text-black rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-gray-100 py-3"
                >
                  <a href="/customer" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <span className="font-bold text-lg">Ride</span>
                    <Car size={24} className="text-gray-400 group-hover:text-black transition-colors"/>
                  </a>
                  <a href="/partner" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <span className="font-bold text-lg">Drive</span>
                    {/* Steering Wheel Icon Equivalent */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-black transition-colors"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="19.07" y1="4.93" x2="14.12" y2="9.88"/><line x1="22" y1="12" x2="15" y2="12"/><line x1="19.07" y1="19.07" x2="14.12" y2="14.12"/><line x1="12" y1="22" x2="12" y2="15"/><line x1="4.93" y1="19.07" x2="9.88" y2="14.12"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="4.93" y1="4.93" x2="9.88" y2="9.88"/></svg>
                  </a>
                  <a href="/AAT-eats" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <span className="font-bold text-lg">AAT Eats</span>
                    <Utensils size={24} className="text-gray-400 group-hover:text-black transition-colors"/>
                  </a>
                  <a href="/vendor" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <span className="font-bold text-lg">Business</span>
                    <Store size={24} className="text-gray-400 group-hover:text-black transition-colors"/>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;