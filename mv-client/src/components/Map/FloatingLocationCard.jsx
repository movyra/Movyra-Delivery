import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';

/**
 * UI COMPONENT: FLOATING LOCATION CARD
 * Replicates the light-blue overlapping "JET" pill from the reference image.
 * Sits exactly on the boundary between the map and the lower scrollable area.
 * ENFORCES strict null-safety to prevent undefined crashes during rapid state changes.
 */
export default function FloatingLocationCard({ activeField, isResolving }) {
  const { pickup, dropoffs } = useBookingStore();

  // STRICT FAILSAFES: Prevent undefined array mapping crashes
  const safePickup = pickup || { address: '', lat: null, lng: null };
  const safeDropoffs = Array.isArray(dropoffs) ? dropoffs : [];

  // Dynamically determine the content based on the active field with strict bounds checking
  const getActiveData = () => {
    if (activeField === 'pickup') {
      return { 
        title: 'Pickup Location', 
        address: safePickup?.address || 'Set pickup point...',
        icon: <Navigation size={20} className="text-[#111111] rotate-45" strokeWidth={2.5} />
      };
    }
    
    // Strict boundary check for array index
    const activeIndex = typeof activeField === 'number' ? activeField : 0;
    const safeDrop = safeDropoffs.length > activeIndex ? safeDropoffs[activeIndex] : null;
    
    return { 
      title: `Dropoff Location ${activeIndex + 1}`, 
      address: safeDrop?.address || 'Set dropoff point...',
      icon: <MapPin size={20} className="text-[#111111]" strokeWidth={2.5} />
    };
  };

  const activeData = getActiveData();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full"
    >
      <div className="bg-[#BCE3FF] rounded-[32px] p-5 shadow-[0_10px_30px_rgba(188,227,255,0.4)] flex items-center gap-4 relative overflow-hidden border border-[#A5D5F9]">
        
        {/* Left Icon Badge */}
        <div className="shrink-0 flex items-center justify-center w-[42px] h-[42px] bg-white/40 rounded-full">
          {isResolving ? <Loader2 size={20} className="text-[#111111] animate-spin" strokeWidth={2.5} /> : activeData.icon}
        </div>

        {/* Central Content */}
        <div className="flex-1 overflow-hidden">
          <h3 className="text-[17px] font-black text-[#111111] tracking-tight leading-tight truncate mb-0.5">
            {activeData.title}
          </h3>
          <p className="text-[13px] font-bold text-[#4A6B85] truncate">
            {activeData.address}
          </p>
        </div>

        {/* Right Status Pill */}
        <div className="shrink-0 px-4 py-2 bg-white/40 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm">
          <span className="text-[11px] font-black text-[#111111] uppercase tracking-widest">
            {isResolving ? 'Locating' : 'Active'}
          </span>
        </div>
        
      </div>
    </motion.div>
  );
}