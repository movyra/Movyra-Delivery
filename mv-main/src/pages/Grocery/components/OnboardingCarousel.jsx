import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: GROCERY ONBOARDING CAROUSEL (mv-main)
 * Purpose: 3-step feature introduction (Cart, Box, Price).
 * Behavior: Horizontal swipe/click navigation routing to Auth phase.
 * ============================================================================
 */

export default function OnboardingCarousel({ onNext }) {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      id: 0,
      title: "Lightning Delivery",
      subtitle: "Your daily needs delivered from local dark stores in under 15 minutes. Zero delays.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-32 h-32 text-white">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          <path d="M13 5l2 2-2 2M18 5h-5" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 1,
      title: "Protected Packaging",
      subtitle: "Temperature-controlled and tamper-proof boxes ensure your groceries arrive fresh and secure.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-32 h-32 text-white">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" stroke="#00ff88" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Lowest Grid Prices",
      subtitle: "Direct-from-manufacturer sourcing means you pay exactly what you should. No hidden markups.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-32 h-32 text-white">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" stroke="#00ff88" strokeWidth="2" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      )
    }
  ];

  const handleNext = () => {
    if (slide === slides.length - 1) {
      onNext(); // Trigger transition to EmailAuth
    } else {
      setSlide(prev => prev + 1);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white flex flex-col justify-between px-6 py-12 pb-20 overflow-hidden relative">
      
      {/* Top Status Bar Placeholder */}
      <div className="w-full flex justify-end z-20">
        <button onClick={onNext} className="text-[#666666] font-bold text-[0.8rem] uppercase tracking-widest hover:text-white transition-colors">
          Skip
        </button>
      </div>

      {/* Main Carousel Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-[400px] mx-auto">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={slide}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            className="w-full flex flex-col items-center text-center absolute"
          >
            {/* Ambient Icon Container */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-10">
              <div className="absolute inset-0 bg-[#00ff88] rounded-full blur-[80px] opacity-[0.05]"></div>
              {slides[slide].icon}
            </div>

            <h2 className="text-[2rem] font-black tracking-tight mb-4">{slides[slide].title}</h2>
            <p className="text-[#888888] text-[0.95rem] leading-relaxed max-w-[300px]">
              {slides[slide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="w-full max-w-[400px] mx-auto flex flex-col items-center gap-10 z-20">
        
        {/* Progress Dots */}
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === slide ? 'w-8 bg-white' : 'w-2 bg-[#333333]'
              }`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <button 
          onClick={handleNext}
          className="w-full bg-white text-black font-black text-[1.1rem] py-4 rounded-[16px] hover:bg-[#e0e0e0] transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-[0.98]"
        >
          {slide === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>

    </div>
  );
}