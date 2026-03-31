import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';

/**
 * UI COMPONENT: FLOATING LOCATION CARD
 * Replicates the light-blue overlapping "JET" pill from the reference image.
 * Sits exactly on the boundary between the map and the lower scrollable area.
 */
export default function FloatingLocationCard({ activeField, isResolving }) {
  const { pickup, dropoffs } = useBookingStore();

  // Dynamically determine the content based on the active field
  const getActiveData = () => {
    if (activeField === 'pickup') {
      return { 
        title: 'Pickup Location', 
        address: pickup?.address || 'Set pickup point...',
        icon: <Navigation size={20} className="text-black rotate-45" strokeWidth={2.5} />
      };
    }
    
    const drop = dropoffs[activeField];
    return { 
      title: `Dropoff Location ${activeField + 1}`, 
      address: drop?.address || 'Set dropoff point...',
      icon: <MapPin size={20} className="text-black" strokeWidth={2.5} />
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
          {isResolving ? <Loader2 size={20} className="text-black animate-spin" strokeWidth={2.5} /> : activeData.icon}
        </div>

        {/* Central Content */}
        <div className="flex-1 overflow-hidden">
          <h3 className="text-[17px] font-black text-black tracking-tight leading-tight truncate">
            {activeData.title}
          </h3>
          <p className="text-[13px] font-medium text-[#4A6B85] truncate mt-0.5">
            {activeData.address}
          </p>
        </div>

        {/* Right Status Pill */}
        <div className="shrink-0 px-3 py-1.5 bg-white/30 rounded-full backdrop-blur-sm flex items-center justify-center">
          <span className="text-[11px] font-bold text-[#2C4861] uppercase tracking-widest">
            {isResolving ? 'Locating' : 'Active'}
          </span>
        </div>
        
      </div>
    </motion.div>
  );
}