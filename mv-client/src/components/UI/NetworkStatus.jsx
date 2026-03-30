import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, CloudOff, Loader2 } from 'lucide-react';

// ============================================================================
// COMPONENT: NETWORK STATUS & OFFLINE FALLBACK UI
// Persistently monitors navigator.onLine. Provides visual feedback when the 
// device loses connectivity, and reassures the user that Firestore is 
// actively queueing their actions for background sync.
// ============================================================================

export default function NetworkStatus() {
  // Real-time network state initialization
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Handlers for native browser network events
    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      
      // Keep the "Restored" success banner visible for 3.5 seconds to 
      // indicate that queued Firestore actions are currently syncing
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      
      return () => clearTimeout(timer);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <AnimatePresence>
      {/* State 1: Offline Warning & Queue Indicator */}
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-0 left-0 right-0 z-[9999] p-4 pointer-events-none"
        >
          <div className="max-w-md mx-auto bg-[#1C1F26] text-white rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-4 backdrop-blur-xl pointer-events-auto">
            {/* Logo/Icon Area */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden border border-white/5">
                <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover opacity-50 grayscale" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#FF3B30] rounded-full border-2 border-[#1C1F26] flex items-center justify-center">
                <WifiOff size={12} strokeWidth={3} className="text-white" />
              </div>
            </div>

            {/* Typography & Logic Context */}
            <div className="flex-1">
              <h3 className="text-[16px] font-black tracking-tight leading-none mb-1 text-white">Connection Lost</h3>
              <p className="text-[13px] font-bold text-gray-400 leading-snug">
                You are offline. Actions are queued securely and will sync automatically.
              </p>
            </div>
            
            <CloudOff size={24} className="text-gray-500 shrink-0" strokeWidth={1.5} />
          </div>
        </motion.div>
      )}

      {/* State 2: Connection Restored & Sync Indicator */}
      {isOnline && showRestored && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-0 left-0 right-0 z-[9999] p-4 pointer-events-none"
        >
          <div className="max-w-md mx-auto bg-white text-black rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center gap-4 pointer-events-auto">
            {/* Logo/Icon Area */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#34C759] rounded-full border-2 border-white flex items-center justify-center">
                <Wifi size={12} strokeWidth={3} className="text-white" />
              </div>
            </div>

            {/* Typography & Logic Context */}
            <div className="flex-1">
              <h3 className="text-[16px] font-black tracking-tight leading-none mb-1 text-black">Back Online</h3>
              <p className="text-[13px] font-bold text-gray-500 leading-snug">
                Network restored. Pushing queued data to servers...
              </p>
            </div>
            
            <Loader2 size={24} className="text-[#34C759] shrink-0 animate-spin" strokeWidth={2.5} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}