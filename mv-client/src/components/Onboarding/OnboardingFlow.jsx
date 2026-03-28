import React, { useState } from 'react';
import SlideWarehouse from './SlideWarehouse';
import SlideShipments from './SlideShipments';
import SlideItems from './SlideItems';

// ============================================================================
// ONBOARDING MASTER CONTROLLER
// Manages the 3-step introductory flow (Warehouse -> Shipments -> Items)
// Reference: Image 4 (White background, Blue CTA, Pagination dots)
// ============================================================================

export default function OnboardingFlow({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < 2) {
      setCurrentSlide(p => p + 1);
    } else {
      // Real logic to bypass this screen permanently on future visits
      localStorage.setItem('has_seen_onboarding', 'true');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-white text-gray-800 overflow-hidden flex flex-col z-[200]">
      
      {/* Horizontal Swipe Track */}
      <div 
        className="flex-1 flex transition-transform duration-500 ease-in-out" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        <div className="w-full h-full shrink-0"><SlideWarehouse /></div>
        <div className="w-full h-full shrink-0"><SlideShipments /></div>
        <div className="w-full h-full shrink-0"><SlideItems /></div>
      </div>
      
      {/* Persistent Bottom Controls */}
      <div className="px-8 pb-12 pt-4 bg-white relative z-10">
        
        {/* Pagination Dots Engine */}
        <div className="flex justify-center gap-2 mb-10">
          {[0, 1, 2].map(i => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 bg-movyra-blue' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        {/* Sticky Action Button */}
        <button 
          onClick={handleNext} 
          className="w-full bg-movyra-blue text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-movyra-blue/20 active:scale-95 transition-transform"
        >
          CONTINUE
        </button>
        
      </div>
    </div>
  );
}