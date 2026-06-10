import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: DELIVERY ONBOARDING
 * Purpose: Sequential introductory carousel for first-time user initialization.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), Stark (#111111).
 * Layout: Adheres strictly to the provided reference architecture featuring
 * fluid bottom-right navigation mechanics and custom SVG iconography.
 * ============================================================================
 */

export default function DeliveryOnboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingData = [
    {
      id: 1,
      title: "Sending parcels made simple",
      description: "Fast, secure, and reliable enterprise delivery.",
      visual: (
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
           <rect x="50" y="70" width="100" height="80" rx="8" fill="#111111" stroke="#FFFFFF" strokeWidth="4"/>
           <path d="M50 100 L100 120 L150 100" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M100 120 V150" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
           <path d="M50 70 L100 90 L150 70 L100 50 Z" fill="#F2F4F7" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Real-time fleet tracking",
      description: "Monitor geographic dispatch coordinates continuously.",
      visual: (
         <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
           <path d="M40 160 Q 80 120 120 160 T 180 100" stroke="#333333" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round"/>
           <circle cx="40" cy="160" r="8" fill="#FFFFFF"/>
           <path d="M180 100 C 180 100 180 60 150 60 C 120 60 120 100 120 100 C 120 100 150 140 150 140 C 150 140 180 100 180 100 Z" fill="#111111" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round"/>
           <circle cx="150" cy="90" r="8" fill="#FFFFFF"/>
         </svg>
      )
    },
    {
      id: 3,
      title: "Safe delivery, every time",
      description: "Secure logistics framework you can trust.",
      visual: (
         <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
           <path d="M100 30 L40 60 V100 C 40 150 100 180 100 180 C 100 180 160 150 160 100 V60 Z" fill="#111111" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round"/>
           <path d="M75 105 L95 125 L130 85" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] flex flex-col relative overflow-hidden">
      
      {/* Top Header Controls */}
      <div className="w-full p-8 flex justify-end absolute top-0 z-50">
        <button 
          onClick={onComplete}
          className={`font-bold text-[0.95rem] tracking-wide transition-opacity duration-300 ${currentStep === onboardingData.length - 1 ? 'opacity-0 pointer-events-none' : 'text-[#888888] hover:text-[#FFFFFF]'}`}
        >
          Skip
        </button>
      </div>

      {/* Main Content Integration */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12 relative z-10">
         <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full max-w-md flex flex-col items-center text-center"
            >
              {/* Scaled Monochrome Vector Illustration */}
              <div className="w-64 h-64 mb-12">
                 {onboardingData[currentStep].visual}
              </div>
              <h1 className="text-[#FFFFFF] font-black text-[2rem] leading-tight mb-4 tracking-tighter">
                 {onboardingData[currentStep].title}
              </h1>
              <p className="text-[#888888] font-bold text-[1rem] leading-relaxed">
                 {onboardingData[currentStep].description}
              </p>
            </motion.div>
         </AnimatePresence>
      </div>

      {/* Footer Controls & Navigation Area */}
      <div className="w-full h-32 relative z-20 flex items-center justify-between pl-8">
         
         {/* Dynamic Progress Indicators */}
         <div className="flex items-center gap-2">
            {onboardingData.map((_, idx) => (
               <div 
                 key={idx} 
                 className={`h-2 rounded-full transition-all duration-300 ${currentStep === idx ? 'w-6 bg-[#FFFFFF]' : 'w-2 bg-[#333333]'}`}
               ></div>
            ))}
         </div>

         {/* Reference Architecture: Fluid Navigation Action Button */}
         <div className="relative w-32 h-32">
            {/* Fluid Background Shape rendering the stark corner effect */}
            <svg className="absolute bottom-0 right-0 w-full h-full" viewBox="0 0 100 100" fill="none">
               <path d="M100 0 C 100 50 50 100 0 100 L 100 100 Z" fill="#111111" />
            </svg>
            {/* Execution Button */}
            <button 
              onClick={handleNext}
              className="absolute bottom-6 right-6 w-16 h-16 bg-[#FFFFFF] text-[#000000] rounded-full flex items-center justify-center font-black text-[1.2rem] shadow-lg hover:scale-105 transition-transform"
            >
              {currentStep < onboardingData.length - 1 ? (
                onboardingData[currentStep].id
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              )}
            </button>
         </div>
      </div>
    </div>
  );
}