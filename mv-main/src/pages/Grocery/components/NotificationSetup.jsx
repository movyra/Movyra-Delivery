import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY NOTIFICATION SETUP (mv-main)
 * Purpose: Secure push notification opt-in via browser API.
 * Behavior: Writes final onboarding flag to grocery_profiles/{uid}. 
 * Passes control to the Main Dashboard upon completion.
 * ============================================================================
 */

export default function NotificationSetup({ onComplete, onBack }) {
  const [loading, setLoading] = useState(false);

  // ==========================================================================
  // PROFILE FINALIZATION ENGINE
  // ==========================================================================
  const finalizeOnboarding = async (notificationsEnabled) => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        const docRef = doc(db, 'grocery_profiles', auth.currentUser.uid);
        // Merge strategy ensures we preserve dietary and location data
        await setDoc(docRef, { 
          notificationsEnabled: notificationsEnabled,
          hasCompletedGroceryOnboarding: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      onComplete(); // Triggers Orchestrator to mount Dashboard
    } catch (err) {
      console.error("Firestore Finalization Error:", err);
      alert("Failed to finalize profile. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // NATIVE BROWSER NOTIFICATION HANDLER
  // ==========================================================================
  const handleEnableNotifications = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop/mobile notifications.");
      finalizeOnboarding(false);
      return;
    }

    if (Notification.permission === "granted") {
      finalizeOnboarding(true);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        finalizeOnboarding(permission === "granted");
      });
    } else {
      // Permission was already strictly denied by the user previously
      alert("Notifications are blocked by your browser settings. Proceeding without them.");
      finalizeOnboarding(false);
    }
  };

  const handleSkip = () => {
    finalizeOnboarding(false);
  };

  // ==========================================================================
  // UI VARIANTS
  // ==========================================================================
  const viewVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white flex flex-col px-6 py-10 relative overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="w-full max-w-[500px] mx-auto flex items-center justify-between mb-8 z-20">
        <button onClick={onBack} disabled={loading} className="w-10 h-10 rounded-full bg-[#111111] border border-[#333333] flex items-center justify-center hover:bg-[#222222] transition-colors disabled:opacity-50">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <span className="text-[#666666] font-mono text-[0.7rem] uppercase tracking-widest font-bold">Step 3 of 3</span>
        <div className="w-10"></div>
      </div>

      <div className="w-full max-w-[500px] mx-auto flex-1 flex flex-col z-20 items-center justify-center">
        
        <motion.div variants={viewVariants} initial="hidden" animate="visible" className="flex flex-col items-center w-full">
          
          {/* Abstract Notification Bell Illustration */}
          <div className="w-32 h-32 bg-[#050505] border border-[#222222] rounded-full mb-8 relative flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            {/* Pinging ring */}
            <div className="absolute w-[120%] h-[120%] rounded-full border border-[#00ff88]/20 animate-[ping_2s_ease-out_infinite]"></div>
            
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#00ff88" strokeWidth="1.5" className="relative z-10">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>

          <h1 className="text-[2.2rem] font-black tracking-tight leading-tight mb-4 text-center">
            Never Miss <br/> an Update
          </h1>
          
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 mb-8 w-full">
            <ul className="flex flex-col gap-3 text-[#888888] text-[0.9rem] font-medium">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div>
                Live tracking of your delivery executive
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div>
                Out-of-stock alerts and replacements
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div>
                Exclusive grid-only flash pricing
              </li>
            </ul>
          </div>

          <div className="w-full flex flex-col gap-4 mt-4">
            <button 
              onClick={handleEnableNotifications} 
              disabled={loading} 
              className="w-full bg-[#00ff88] text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl hover:bg-[#00cc6a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Finalizing Profile...' : 'Enable Notifications'}
            </button>
            <button 
              onClick={handleSkip} 
              disabled={loading} 
              className="w-full bg-transparent border border-[#333333] text-white font-bold text-[1.1rem] py-4 rounded-xl hover:bg-[#111111] transition-colors disabled:opacity-50"
            >
              Not Now
            </button>
          </div>

        </motion.div>

      </div>
    </div>
  );
}