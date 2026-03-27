import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Slide1 from './Slide1';
import Slide2 from './Slide2';
import Slide3 from './Slide3';
import Slide4 from './Slide4';
import Slide5 from './Slide5';

export default function OnboardingFlow({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Securely store the flag so the user never sees onboarding again
      localStorage.setItem('has_seen_onboarding', 'true');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-surfaceBlack text-white overflow-hidden flex flex-col z-[200]">
      {/* Dynamic Background Glow mapped to current slide */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-movyraMint rounded-full blur-[150px] opacity-20 transition-all duration-700 pointer-events-none"
        style={{ transform: `translate(-50%, -50%) scale(${1 + currentSlide * 0.1})` }}
      />

      {/* Native-feeling Horizontal Slider */}
      <div 
        className="flex-1 flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        <div className="w-full h-full flex-shrink-0"><Slide1 /></div>
        <div className="w-full h-full flex-shrink-0"><Slide2 /></div>
        <div className="w-full h-full flex-shrink-0"><Slide3 /></div>
        <div className="w-full h-full flex-shrink-0"><Slide4 /></div>
        <div className="w-full h-full flex-shrink-0"><Slide5 /></div>
      </div>

      {/* Persistent Bottom Controls */}
      <div className="px-8 pb-12 pt-4 bg-gradient-to-t from-surfaceBlack via-surfaceBlack to-transparent relative z-10">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-10">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-8 bg-movyraMint shadow-mintGlow' : 'w-2 bg-surfaceDarker'
              }`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <button 
          onClick={handleNext}
          className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex items-center justify-center gap-2 hover:bg-movyraMintDark active:scale-[0.98] transition-all shadow-mintGlow"
        >
          {currentSlide === totalSlides - 1 ? "Let's Move" : "Continue"}
          <ArrowRight size={20} className={currentSlide === totalSlides - 1 ? "animate-pulse" : ""} />
        </button>
      </div>
    </div>
  );
}