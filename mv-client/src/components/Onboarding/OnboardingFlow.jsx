import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Slide1 from './Slide1'; import Slide2 from './Slide2'; import Slide3 from './Slide3'; import Slide4 from './Slide4'; import Slide5 from './Slide5';
export default function OnboardingFlow({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNext = () => { if (currentSlide < 4) setCurrentSlide(p => p + 1); else { localStorage.setItem('has_seen_onboarding', 'true'); onComplete(); } };
  return (
    <div className="fixed inset-0 bg-surfaceBlack text-white overflow-hidden flex flex-col z-[200]">
      <div className="flex-1 flex transition-transform duration-500" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        <div className="w-full h-full shrink-0"><Slide1 /></div><div className="w-full h-full shrink-0"><Slide2 /></div><div className="w-full h-full shrink-0"><Slide3 /></div><div className="w-full h-full shrink-0"><Slide4 /></div><div className="w-full h-full shrink-0"><Slide5 /></div>
      </div>
      <div className="px-8 pb-12 pt-4 bg-surfaceBlack relative z-10">
        <div className="flex justify-center gap-2 mb-10">{[0,1,2,3,4].map(i => <div key={i} className={`h-1.5 rounded-full ${i === currentSlide ? 'w-8 bg-movyraMint' : 'w-2 bg-surfaceDarker'}`}/>)}</div>
        <button onClick={handleNext} className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex justify-center items-center gap-2">
          {currentSlide === 4 ? "Let's Move" : "Next"} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
