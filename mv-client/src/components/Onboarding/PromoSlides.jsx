import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Rocket, Map, ShieldCheck, Calculator, Headset, Sparkles } from 'lucide-react';

// ============================================================================
// PROMOTIONAL CONTENT DATA (6+ Real Sections)
// High-fidelity enterprise logistics copy mapped to the exact UI/UX requested.
// ============================================================================
const PROMO_DATA = [
  {
    id: 'global-network',
    icon: Globe,
    title: 'Global Warehouses',
    description: 'Connect with thousands of distribution centers worldwide. Movyra ensures your shipments cross borders seamlessly.',
    bgColor: 'bg-[#4B75C6]', // Muted Movyra Blue
  },
  {
    id: 'fast-delivery',
    icon: Rocket,
    title: 'Hyper-Fast Delivery',
    description: 'Optimized route planning ensures your packages arrive ahead of schedule. We actively bypass traffic and delays.',
    bgColor: 'bg-[#E58A6A]', // Terracotta
  },
  {
    id: 'live-tracking',
    icon: Map,
    title: 'Live Telemetry',
    description: 'Monitor high-value assets in real-time. Our WebGL maps provide second-by-second GPS coordinates.',
    bgColor: 'bg-[#5D9C83]', // Muted Emerald
  },
  {
    id: 'secure-auth',
    icon: ShieldCheck,
    title: 'Secure OTP Handshake',
    description: 'Enterprise-grade security. We enforce strict EmailJS identity verification before any account creation.',
    bgColor: 'bg-[#7B68EE]', // Medium Slate Blue
  },
  {
    id: 'dynamic-pricing',
    icon: Calculator,
    title: 'Smart Dynamic Pricing',
    description: 'No hidden fees. Our engine uses real-time distance matrix calculations and live fuel rates instantly.',
    bgColor: 'bg-[#F4B942]', // Muted Amber
  },
  {
    id: 'premium-support',
    icon: Headset,
    title: '24/7 Premium Support',
    description: 'Never get left in the dark. Our dedicated logistics support team is available around the clock to help.',
    bgColor: 'bg-[#D9738F]', // Muted Rose
  }
];

export default function PromoSlides({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // SECTION 1: Master Flow & Routing Logic
  const handleNext = () => {
    if (currentSlide < PROMO_DATA.length - 1) {
      setCurrentSlide(p => p + 1);
    } else {
      finalizeOnboarding();
    }
  };

  const handleSkip = () => {
    finalizeOnboarding();
  };

  const finalizeOnboarding = () => {
    localStorage.setItem('has_seen_onboarding', 'true');
    if (onComplete) onComplete();
    window.location.replace('/auth-signup');
  };

  return (
    // Root Container: Dynamically changes background color matching the exact UI requirement
    <div className={`h-screen w-full relative flex flex-col overflow-hidden transition-colors duration-700 ease-in-out ${PROMO_DATA[currentSlide].bgColor} font-sans`}>
      
      {/* SECTION 2: Top Status Bar Pagination (Dash Style) */}
      <div className="absolute top-12 left-0 right-0 px-8 flex justify-center gap-1.5 z-50">
        {PROMO_DATA.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= currentSlide ? 'bg-white' : 'bg-white/30'
            }`} 
          />
        ))}
      </div>

      {/* Optional Skip Navigation */}
      <button 
        onClick={handleSkip}
        className="absolute top-20 right-6 z-50 text-white/80 font-semibold text-sm hover:text-white transition-colors px-4 py-2"
      >
        Skip
      </button>

      {/* SECTION 3: Hero Illustration Area (Top 55%) */}
      <div className="flex-1 relative flex items-center justify-center pt-16 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            {/* Main Icon scaled up to act as an illustration */}
            <div className="relative z-10 text-white">
              {React.createElement(PROMO_DATA[currentSlide].icon, { 
                className: 'w-48 h-48 drop-shadow-2xl', 
                strokeWidth: 1.2 
              })}
            </div>

            {/* Decorative Floating Elements to mimic the illustration aesthetic */}
            <motion.div 
              animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-8 text-white/80"
            >
              <Sparkles className="w-10 h-10" />
            </motion.div>
            <motion.div 
              animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 -left-8 text-white/40"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* SECTION 4: Bottom Sheet Content Area (Bottom 45%) */}
      {/* Fixed white sheet with heavily rounded top corners matching the image */}
      <div className="bg-white rounded-t-[40px] px-8 pt-10 pb-12 flex flex-col relative z-20 min-h-[42%] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        
        <div className="flex-1 flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-[30px] font-extrabold text-[#121212] leading-tight mb-4 tracking-tight">
                {PROMO_DATA[currentSlide].title}
              </h2>
              <p className="text-[16px] text-[#666666] leading-relaxed font-medium px-2">
                {PROMO_DATA[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Dark, pill-shaped CTA Button matching the image perfectly */}
        <button 
          onClick={handleNext} 
          className="w-full bg-[#1A1A1A] text-white py-4.5 rounded-[24px] font-bold text-[17px] mt-8 hover:bg-black active:scale-[0.98] transition-all h-[60px]"
        >
          {currentSlide === PROMO_DATA.length - 1 ? 'Get Started' : 'Continue'}
        </button>
        
      </div>
    </div>
  );
}