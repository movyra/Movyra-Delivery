import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldAlert, Share2, Copy, PhoneCall, 
  AlertTriangle, CheckCircle2, Siren, UserCircle2, Loader2 
} from 'lucide-react';

// Real Database Integration
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * COMPONENT: EMERGENCY SOS & SAFETY TOOLKIT
 * Features (7+):
 * 1. Native Web Share API (navigator.share)
 * 2. Fallback Clipboard API (navigator.clipboard)
 * 3. Firestore Emergency Dispatch (Flags order in DB)
 * 4. Hardware Haptics (navigator.vibrate)
 * 5. Native Emergency Dialer (tel:112)
 * 6. Live Trip Context Display
 * 7. Framer Motion Spring Animations & Backdrop Blur
 */
export default function SafetyToolkit({ 
  isOpen, 
  onClose, 
  orderId, 
  driverName = 'Assigned Partner',
  vehicleType = 'Vehicle'
}) {
  const db = getFirestore();
  
  // Local States
  const [isCopied, setIsCopied] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // ============================================================================
  // FEATURE 1 & 2: NATIVE SHARE & CLIPBOARD FALLBACK
  // ============================================================================
  const handleShareTrip = async () => {
    const trackingUrl = `${window.location.origin}/tracking/detail/${orderId}`;
    const shareData = {
      title: 'Track My Ride',
      text: `I'm on my way! Track my live location and delivery partner details here:`,
      url: trackingUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn("Native share cancelled or failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${trackingUrl}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      } catch (err) {
        console.error("Clipboard copy failed:", err);
      }
    }
  };

  // ============================================================================
  // FEATURE 3, 4 & 5: FIRESTORE DISPATCH & EMERGENCY DIALER WITH HAPTICS
  // ============================================================================
  const handleEmergencySOS = async () => {
    // Hardware Haptics: Vibrate pattern (SOS)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    setIsDispatching(true);

    try {
      // Feature 3: Flag the order in Firestore to alert the backend/admins immediately
      if (orderId) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
          emergencyState: true,
          emergencyTriggeredAt: serverTimestamp(),
          status: 'emergency_hold'
        });
      }
      
      setSosActive(true);

      // Feature 5: Trigger native phone dialer to national emergency number (e.g., 112 in India/EU)
      setTimeout(() => {
        window.location.href = "tel:112";
        setIsDispatching(false);
      }, 800);

    } catch (error) {
      console.error("Failed to dispatch emergency signal to backend:", error);
      setIsDispatching(false);
      // Fallback: Still attempt to dial even if DB fails
      window.location.href = "tel:112"; 
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[11000] bg-black/70 backdrop-blur-md flex flex-col justify-end font-sans p-4 pb-8"
        >
          {/* Close Overlay Click Area */}
          <div className="flex-1 w-full" onClick={onClose} />

          <motion.div 
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full rounded-[40px] p-6 shadow-2xl relative overflow-hidden"
          >
            
            {/* Feature 7: Background Alert Gradient if SOS Active */}
            <AnimatePresence>
              {sosActive && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-red-600 z-0" 
                />
              )}
            </AnimatePresence>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={`text-[28px] font-black tracking-tighter mb-1 ${sosActive ? 'text-white' : 'text-[#111111]'}`}>
                    {sosActive ? 'SOS ENGAGED' : 'Safety Toolkit'}
                  </h2>
                  <p className={`text-[14px] font-bold ${sosActive ? 'text-red-200' : 'text-gray-400'}`}>
                    {sosActive ? 'Help is on the way.' : 'Access emergency and sharing tools.'}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className={`w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-all ${sosActive ? 'bg-red-700 text-white' : 'bg-[#F6F6F6] text-[#111111] hover:bg-gray-200'}`}
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Feature 6: Live Trip Context */}
              <div className={`p-4 rounded-[24px] mb-6 flex items-center gap-4 border-2 ${sosActive ? 'bg-red-700 border-red-500 text-white' : 'bg-[#F6F6F6] border-transparent text-[#111111]'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${sosActive ? 'bg-red-600' : 'bg-white shadow-sm'}`}>
                  <UserCircle2 size={24} strokeWidth={2.5} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-black text-[16px] truncate">{driverName}</h4>
                  <p className={`text-[12px] font-bold uppercase tracking-widest ${sosActive ? 'text-red-200' : 'text-gray-500'}`}>
                    {vehicleType} • ID: {orderId?.slice(-6).toUpperCase() || 'UNKNOWN'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* SHARE LINK BUTTON */}
                <button 
                  onClick={handleShareTrip}
                  disabled={sosActive}
                  className={`w-full py-4 rounded-[24px] font-black text-[16px] flex items-center gap-3 px-6 transition-all active:scale-95 ${sosActive ? 'hidden' : 'bg-[#F2F4F7] text-[#111111] hover:bg-gray-200'}`}
                >
                  {isCopied ? <CheckCircle2 size={22} className="text-green-500" strokeWidth={2.5} /> : <Share2 size={22} strokeWidth={2.5} />}
                  <div className="flex flex-col text-left flex-1">
                    <span>{isCopied ? 'Link Copied!' : 'Share Live Tracking'}</span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Send route to trusted contacts</span>
                  </div>
                  {!isCopied && <Copy size={18} className="text-gray-400 shrink-0" strokeWidth={2.5} />}
                </button>

                {/* 24/7 SUPPORT LINE */}
                <button 
                  onClick={() => { window.location.href = "tel:18001234567"; }}
                  disabled={sosActive}
                  className={`w-full py-4 rounded-[24px] font-black text-[16px] flex items-center gap-3 px-6 transition-all active:scale-95 ${sosActive ? 'hidden' : 'bg-[#F2F4F7] text-[#111111] hover:bg-gray-200'}`}
                >
                  <PhoneCall size={22} strokeWidth={2.5} className="text-blue-500" />
                  <div className="flex flex-col text-left flex-1">
                    <span>24/7 Safety Helpline</span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Call Movyra Support</span>
                  </div>
                </button>

                {/* EMERGENCY SOS TRIGGER */}
                <button 
                  onClick={handleEmergencySOS}
                  disabled={isDispatching || sosActive}
                  className={`w-full py-5 rounded-[24px] font-black text-[18px] flex items-center justify-center gap-3 transition-all ${sosActive ? 'bg-white text-red-600 scale-100 shadow-[0_0_40px_rgba(255,255,255,0.3)]' : 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 shadow-sm border border-red-100'}`}
                >
                  {isDispatching ? (
                    <Loader2 size={28} className="animate-spin" strokeWidth={3} />
                  ) : sosActive ? (
                    <><Siren size={28} className="animate-pulse" strokeWidth={2.5} /> POLICE DISPATCHED</>
                  ) : (
                    <><AlertTriangle size={24} strokeWidth={2.5} /> EMERGENCY 112</>
                  )}
                </button>

                {!sosActive && (
                  <p className="text-center text-[12px] font-bold text-gray-400 mt-4 px-4 leading-snug">
                    Use the emergency button only if you are in immediate physical danger. This will alert local authorities and our response team.
                  </p>
                )}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}