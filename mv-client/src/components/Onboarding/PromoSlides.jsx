import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Rocket, Map, ShieldCheck, Calculator, Headset, ArrowRight } from 'lucide-react';

// ============================================================================
// CUSTOM SVG BACKGROUND PATTERNS
// Matches the topographic and circular grid patterns from the reference images.
// ============================================================================
const TopographicPattern = ({ strokeColor }) => (
  <svg className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke={strokeColor} strokeWidth="1.5">
      <path d="M-50,200 Q150,250 250,100 T550,50 T850,200" />
      <path d="M-50,300 Q150,350 250,200 T550,150 T850,300" />
      <path d="M-50,400 Q150,450 250,300 T550,250 T850,400" />
      <path d="M-50,500 Q150,550 250,400 T550,350 T850,500" />
      <path d="M-50,600 Q150,650 250,500 T550,450 T850,600" />
      <path d="M-50,700 Q150,750 250,600 T550,550 T850,700" />
      {/* Concentric Elevation Rings */}
      <circle cx="600" cy="200" r="40" />
      <circle cx="600" cy="200" r="80" strokeDasharray="4 4" />
      <circle cx="600" cy="200" r="120" />
      <circle cx="200" cy="600" r="50" />
      <circle cx="200" cy="600" r="100" />
      <circle cx="200" cy="600" r="150" strokeDasharray="8 8" />
    </g>
  </svg>
);

const ConcentricGridPattern = ({ strokeColor }) => (
  <svg className="absolute inset-0 w-full h-full flex items-center justify-center opacity-10 pointer-events-none" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="6 12">
      <circle cx="400" cy="400" r="100" />
      <circle cx="400" cy="400" r="200" />
      <circle cx="400" cy="400" r="300" />
      <circle cx="400" cy="400" r="400" />
      <circle cx="400" cy="400" r="500" />
    </g>
  </svg>
);

// ============================================================================
// PROMOTIONAL CONTENT DATA
// Configured with stark full-bleed backgrounds and high-contrast logic.
// ============================================================================
const PROMO_DATA = [
  {
    id: 'global-network',
    icon: Globe,
    title: 'Global Warehouses',
    description: 'Connect with thousands of distribution centers worldwide. Movyra ensures your shipments cross borders seamlessly.',
    bgClass: 'bg-white',
    textClass: 'text-black',
    btnClass: 'bg-black text-white hover:bg-gray-900',
    pattern: 'topo',
    stroke: '#000000'
  },
  {
    id: 'live-tracking',
    icon: Map,
    title: 'Live Telemetry',
    description: 'Monitor high-value assets in real-time. Our WebGL maps provide second-by-second GPS coordinates.',
    bgClass: 'bg-black',
    textClass: 'text-white',
    btnClass: 'bg-white text-black hover:bg-gray-100',
    pattern: 'grid',
    stroke: '#FFFFFF'
  },
  {
    id: 'fast-delivery',
    icon: Rocket,
    title: 'Hyper-Fast Delivery',
    description: 'Optimized route planning ensures your packages arrive ahead of schedule. We actively bypass traffic and delays.',
    bgClass: 'bg-[#276EF1]', // Stark Accent Blue
    textClass: 'text-white',
    btnClass: 'bg-black text-white hover:bg-gray-900',
    pattern: 'topo',
    stroke: '#FFFFFF'
  },
  {
    id: 'secure-auth',
    icon: ShieldCheck,
    title: 'Secure OTP Handshake',
    description: 'Enterprise-grade security. We enforce strict EmailJS identity verification before any account creation.',
    bgClass: 'bg-white',
    textClass: 'text-black',
    btnClass: 'bg-[#276EF1] text-white hover:bg-blue-700',
    pattern: 'grid',
    stroke: '#000000'
  },
  {
    id: 'dynamic-pricing',
    icon: Calculator,
    title: 'Smart Dynamic Pricing',
    description: 'No hidden fees. Our engine uses real-time distance matrix calculations and live fuel rates instantly.',
    bgClass: 'bg-black',
    textClass: 'text-white',
    btnClass: 'bg-[#276EF1] text-white hover:bg-blue-700',
    pattern: 'topo',
    stroke: '#FFFFFF'
  },
  {
    id: 'premium-support',
    icon: Headset,
    title: '24/7 Premium Support',
    description: 'Never get left in the dark. Our dedicated logistics support team is available around the clock to help.',
    bgClass: 'bg-[#276EF1]',
    textClass: 'text-white',
    btnClass: 'bg-white text-black hover:bg-gray-100',
    pattern: 'grid',
    stroke: '#FFFFFF'
  }
];

export default function PromoSlides({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < PROMO_DATA.length - 1) {
      setCurrentSlide(p => p + 1);
    } else {
      finalizeOnboarding();
    }
  };

  const finalizeOnboarding = () => {
    localStorage.setItem('has_seen_onboarding', 'true');
    if (onComplete) onComplete();
    window.location.replace('/auth-signup');
  };

  const slide = PROMO_DATA[currentSlide];

  return (
    // Root Container: Full bleed stark background block
    <div className={`h-screen w-full relative flex flex-col overflow-hidden transition-colors duration-500 ease-in-out ${slide.bgClass} ${slide.textClass} font-sans`}>
      
      {/* Dynamic Background Patterns */}
      {slide.pattern === 'topo' && <TopographicPattern strokeColor={slide.stroke} />}
      {slide.pattern === 'grid' && <ConcentricGridPattern strokeColor={slide.stroke} />}

      {/* SECTION 1: Top Navigation & Dash Pagination */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between z-50 relative">
        
        {/* Real Brand Logo */}
        <div className={`w-10 h-10 rounded-md overflow-hidden flex items-center justify-center ${slide.bgClass === 'bg-black' ? 'bg-white' : 'bg-black'}`}>
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>

        {/* Skip Button */}
        <button 
          onClick={finalizeOnboarding}
          className={`font-bold text-[15px] hover:opacity-70 transition-opacity ${slide.textClass}`}
        >
          Skip
        </button>
      </div>

      {/* Dash Pagination Indicator (Uber Style) */}
      <div className="px-6 flex gap-1.5 z-50 relative">
        {PROMO_DATA.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i === currentSlide 
                ? (slide.bgClass === 'bg-white' ? 'bg-black' : 'bg-white') 
                : (slide.bgClass === 'bg-white' ? 'bg-gray-200' : 'bg-white/20')
            }`} 
          />
        ))}
      </div>

      {/* SECTION 2: Main Content Block */}
      <div className="flex-1 relative flex flex-col justify-end px-8 pb-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col w-full"
          >
            {/* Minimalist Tech Icon */}
            <div className="mb-10">
              {React.createElement(slide.icon, { 
                className: 'w-20 h-20', 
                strokeWidth: 1.5 
              })}
            </div>
            
            {/* Massive Display Typography */}
            <h2 className="text-[42px] font-black leading-[1.05] tracking-tighter mb-5">
              {slide.title}
            </h2>
            <p className="text-[17px] opacity-80 leading-relaxed font-medium mb-12 max-w-[90%]">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* SECTION 3: Stark Action Area */}
      <div className="px-8 pb-12 z-20 relative">
        <button 
          onClick={handleNext} 
          className={`w-full flex items-center justify-between px-6 py-4 rounded-full font-bold text-[17px] active:scale-[0.98] transition-all h-[60px] ${slide.btnClass}`}
        >
          <span className="flex-1 text-center pl-6">
            {currentSlide === PROMO_DATA.length - 1 ? 'Create Account' : 'Continue'}
          </span>
          <ArrowRight size={24} />
        </button>
      </div>
      
    </div>
  );
}