import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

/**
 * ============================================================================
 * MODULE: GROCERY ORCHESTRATOR (mv-main)
 * Architecture: State Machine & Auth Router
 * Features: Live Firebase Auth, Firestore Profile Resolution, Framer Transitions.
 * ============================================================================
 */

import Splash from './components/Splash';
import OnboardingCarousel from './components/OnboardingCarousel';
import EmailAuth from './components/EmailAuth';
import CategoryPreferences from './components/CategoryPreferences';
import LocationSetup from './components/LocationSetup';
import NotificationSetup from './components/NotificationSetup';
import GroceryDashboard from './components/GroceryDashboard';

export default function GroceryOrchestrator() {
  // STATE MACHINE: 
  // 0: Splash, 1: Carousel, 2: Auth, 3: Preferences, 4: Location, 5: Notifications, 6: Dashboard
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Phase 1: Splash Screen Timer (Simulating boot sequence for visual weight)
    const splashTimer = setTimeout(() => {
      if (step === 0) setStep(1);
    }, 2500);

    // Phase 2: Real-time Authentication & Profile Resolution
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const profileRef = doc(db, 'grocery_profiles', currentUser.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists() && profileSnap.data().hasCompletedGroceryOnboarding) {
            setUserProfile(profileSnap.data());
            setStep(6); // Bypass directly to Dashboard
          } else {
            // User is authenticated but hasn't completed onboarding.
            // Move them past Auth to the Preferences stage.
            if (step < 3) setStep(3); 
          }
        } catch (error) {
          console.error("Firestore Resolution Error:", error);
          // Fallback to Auth step on network failure
          setStep(2); 
        }
      } else {
        // User is not authenticated. They must proceed through normal onboarding.
        if (step > 2) setStep(2);
      }
      setIsLoading(false);
    });

    return () => {
      clearTimeout(splashTimer);
      unsubscribe();
    };
  }, [step]);

  // Framer Motion Variants for strict, minimal transitions
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.4
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Fallback loading state during deep auth resolution
  if (isLoading && step > 0) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#333333] border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="w-full h-full min-h-screen"
        >
          {step === 0 && <Splash />}
          {step === 1 && <OnboardingCarousel onNext={nextStep} />}
          {step === 2 && <EmailAuth onNext={nextStep} />}
          {step === 3 && <CategoryPreferences onNext={nextStep} onBack={prevStep} />}
          {step === 4 && <LocationSetup onNext={nextStep} onBack={prevStep} />}
          {step === 5 && <NotificationSetup onComplete={() => setStep(6)} onBack={prevStep} />}
          {step === 6 && <GroceryDashboard userProfile={userProfile} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}