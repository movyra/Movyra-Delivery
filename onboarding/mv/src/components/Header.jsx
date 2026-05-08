import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="20" fill="#0DB2FF"/>
            <path d="M25 75 L35 25 L50 60 L65 25 L75 75" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="text-2xl font-extrabold tracking-tight text-movyra-dark">Movyra</span>
        </div>
        <nav className="hidden md:flex gap-8 font-medium text-gray-600">
          <a href="#services" className="hover:text-movyra-blue transition-colors">Services</a>
          <a href="#safety" className="hover:text-movyra-blue transition-colors">Safety OS</a>
          <a href="#fashion" className="hover:text-movyra-blue transition-colors">Fashion Hub</a>
        </nav>
        <button className="bg-movyra-dark text-white px-6 py-2.5 rounded-full font-semibold hover:bg-black transition-all shadow-lg hover:-translate-y-0.5">
          Join Early Access
        </button>
      </div>
    </header>
  );
};

export default Header;