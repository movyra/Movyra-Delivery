import React, { useState } from 'react';
import SlideWarehouse from './SlideWarehouse';
import SlideShipments from './SlideShipments';
import SlideItems from './SlideItems';

// New Real-Time Integration Slides
import SlideLocation from './SlideLocation';
import SlideOTP from './SlideOTP';
import SlideRealPricing from './SlideRealPricing';
import SlideNetwork from './SlideNetwork';
import SlideSystemPermissions from './SlideSystemPermissions';

// Global Store for Real-Time State Management
import { useOnboardingStore } from '../../store/useOnboardingStore';

// ============================================================================
// ONBOARDING MASTER CONTROLLER
// Manages the 8-step premium flow with strict hardware and API logic gates.
// ============================================================================

export default function OnboardingFlow({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Pull real-time validation states from the store
  const userLocation = useOnboardingStore(state => state.userLocation);
  const verificationSuccess = useOnboardingStore(state => state.verificationSuccess);
  const networkStats = useOnboardingStore(state => state.networkStats);
  const permissions = useOnboardingStore(state => state.permissions);

  // Logic Gate Engine: Prevents the "Next" button from working until real API/Hardware tasks succeed
  const isNextDisabled = () => {
    if (currentSlide === 3 && !userLocation) return true; // Location Gate: Needs GPS coordinates
    if (currentSlide === 4 && !verificationSuccess) return true; // OTP Gate: Needs EmailJS verification
    if (currentSlide === 6 && (!networkStats || networkStats.effectiveType === 'unknown')) return true; // Telemetry Gate: Needs network check
    if (currentSlide === 7 && permissions.camera !== 'granted' && permissions.notifications !== 'granted') return true; // Permissions Gate: Needs system access
    return false;
  };

  const handleNext = () => {
    if (isNextDisabled()) return; // Strict failsafe
    
    if (currentSlide < 7) {
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
        <div className="w-full h-full shrink-0 overflow-y-auto"><SlideWarehouse /></div>
        <div className="w-full h-full shrink-0 overflow-y-auto"><SlideShipments /></div>
        <div className="w-full h-full shrink-0 overflow-y-auto"><SlideItems /></div>
        
        {/* Real-Time Integration Slides (Passing handleNext for internal success triggers) */}
        <div className="w-full h-full shrink-0 overflow-y-auto flex items-center"><SlideLocation onNext={handleNext} /></div>
        <div className="w-full h-full shrink-0 overflow-y-auto flex items-center"><SlideOTP onNext={handleNext} /></div>
        <div className="w-full h-full shrink-0 overflow-y-auto flex items-center"><SlideRealPricing onNext={handleNext} /></div>
        <div className="w-full h-full shrink-0 overflow-y-auto flex items-center"><SlideNetwork onNext={handleNext} /></div>
        <div className="w-full h-full shrink-0 overflow-y-auto flex items-center"><SlideSystemPermissions onNext={handleNext} /></div>
      </div>
      
      {/* Persistent Bottom Controls */}
      <div className="px-8 pb-12 pt-4 bg-white relative z-10 border-t border-slate-50">
        
        {/* Pagination Dots Engine */}
        <div className="flex justify-center gap-2 mb-10">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 bg-movyra-blue' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        {/* Sticky Action Button with Logic Gate Classes */}
        <button 
          onClick={handleNext} 
          disabled={isNextDisabled()}
          className={`w-full py-4 rounded-full font-bold text-lg shadow-lg transition-all ${
            isNextDisabled() 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-movyra-blue text-white shadow-movyra-blue/20 active:scale-95'
          }`}
        >
          {currentSlide === 7 ? 'COMPLETE SETUP' : 'CONTINUE'}
        </button>
        
      </div>
    </div>
  );
}