import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY LOCATION SETUP (mv-main)
 * Purpose: Secure delivery coordinates via HTML5 Geolocation or Manual Entry.
 * Behavior: Writes spatial data to grocery_profiles/{uid}. Passes control to Notifications.
 * ============================================================================
 */

export default function LocationSetup({ onNext, onBack }) {
  const [mode, setMode] = useState('select'); // 'select', 'manual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Manual Form State
  const [address, setAddress] = useState({
    street: '',
    city: '',
    pincode: ''
  });

  // ==========================================================================
  // REAL-TIME AUTO-DETECTION LOGIC (HTML5 GEOLOCATION API)
  // ==========================================================================
  const handleAutoDetect = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            type: 'auto-detected',
            timestamp: new Date().toISOString()
          };

          if (auth.currentUser) {
            const docRef = doc(db, 'grocery_profiles', auth.currentUser.uid);
            await setDoc(docRef, { deliveryLocation: coords }, { merge: true });
          }
          onNext();
        } catch (err) {
          console.error("Firestore Write Error:", err);
          setError('Failed to save coordinates to the grid. Please try again.');
          setLoading(false);
        }
      },
      (geoError) => {
        console.error("Geolocation Error:", geoError);
        setError('Location access denied or unavailable. Please enter manually.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ==========================================================================
  // MANUAL ENTRY LOGIC
  // ==========================================================================
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (auth.currentUser) {
        const docRef = doc(db, 'grocery_profiles', auth.currentUser.uid);
        await setDoc(docRef, { 
          deliveryLocation: {
            ...address,
            type: 'manual-entry',
            timestamp: new Date().toISOString()
          } 
        }, { merge: true });
      }
      onNext();
    } catch (err) {
      console.error("Firestore Write Error:", err);
      setError('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // UI VARIANTS
  // ==========================================================================
  const viewVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white flex flex-col px-6 py-10 relative overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="w-full max-w-[500px] mx-auto flex items-center justify-between mb-8 z-20">
        <button onClick={() => mode === 'manual' ? setMode('select') : onBack()} className="w-10 h-10 rounded-full bg-[#111111] border border-[#333333] flex items-center justify-center hover:bg-[#222222] transition-colors">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <span className="text-[#666666] font-mono text-[0.7rem] uppercase tracking-widest font-bold">Step 2 of 3</span>
        <div className="w-10"></div>
      </div>

      <div className="w-full max-w-[500px] mx-auto flex-1 flex flex-col z-20">
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#111111] border border-[#ff4444]/30 text-[#ff4444] text-[0.8rem] p-3 rounded-lg mb-6 text-center font-bold">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div key="select" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
              
              {/* Abstract Map Illustration */}
              <div className="w-full aspect-square max-h-[300px] bg-[#050505] border border-[#222222] rounded-[32px] mb-10 relative overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.02)]">
                {/* Radar Ripple Effect */}
                <div className="absolute w-[80%] h-[80%] rounded-full border border-[#00ff88]/20 animate-[ping_3s_ease-out_infinite]"></div>
                <div className="absolute w-[40%] h-[40%] rounded-full border border-[#00ff88]/40 animate-[ping_3s_ease-out_infinite_1s]"></div>
                
                {/* Location Pin */}
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#00ff88" strokeWidth="1.5" className="relative z-10 drop-shadow-[0_0_15px_rgba(0,255,136,0.5)]">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <h1 className="text-[2.2rem] font-black tracking-tight leading-tight mb-3 text-center">
                Set Delivery Location
              </h1>
              <p className="text-[#888888] text-[0.95rem] leading-relaxed text-center mb-10">
                Allow location access to map your coordinates directly to the Movyra routing engine for sub-15 minute delivery accuracy.
              </p>

              <div className="mt-auto flex flex-col gap-4">
                <button onClick={handleAutoDetect} disabled={loading} className="w-full bg-[#00ff88] text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl hover:bg-[#00cc6a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? 'Connecting to Grid...' : 'Allow Auto-Detect'}
                </button>
                <button onClick={() => setMode('manual')} disabled={loading} className="w-full bg-transparent border border-[#333333] text-white font-bold text-[1.1rem] py-4 rounded-xl hover:bg-[#111111] transition-colors disabled:opacity-50">
                  Enter Address Manually
                </button>
              </div>

            </motion.div>
          )}

          {mode === 'manual' && (
            <motion.div key="manual" variants={viewVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col flex-1">
              
              <h1 className="text-[2.2rem] font-black tracking-tight leading-tight mb-3">
                Manual Entry
              </h1>
              <p className="text-[#888888] text-[0.95rem] leading-relaxed mb-10">
                Please provide your precise delivery address to ensure routing accuracy.
              </p>

              <form onSubmit={handleManualSubmit} className="flex flex-col gap-5 flex-1">
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Street Address / Building</label>
                  <input type="text" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]" placeholder="e.g. 104, Cyber Tower, Sector 5" />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-[2]">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">City</label>
                    <input type="text" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]" placeholder="City Name" />
                  </div>
                  <div className="flex-[1]">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Pincode</label>
                    <input type="text" required pattern="[0-9]{6}" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]" placeholder="6 digits" />
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-[#111111]">
                  <button type="submit" disabled={loading} className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl hover:bg-[#e0e0e0] transition-colors disabled:opacity-50">
                    {loading ? 'Saving Profile...' : 'Confirm Location'}
                  </button>
                </div>
              </form>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}