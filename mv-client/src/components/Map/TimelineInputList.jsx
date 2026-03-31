import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, Plus, X } from 'lucide-react';

// Store Integration
import useBookingStore from '../../store/useBookingStore';

/**
 * UI COMPONENT: TIMELINE INPUT LIST
 * An exact replication of the vertical dashed-line input engine from the design.
 * Maps the pickup and dropoff data arrays while perfectly aligning the swap button 
 * inside the continuous vertical axis.
 */
export default function TimelineInputList({ activeField, onFocusField, onOpenSearch }) {
  const { pickup, dropoffs, setPickup, updateDropoff, removeDropoff, addDropoff } = useBookingStore();

  // Secure array mutation to swap the pickup and first dropoff
  const handleSwapRoute = () => {
    if (dropoffs[0]?.lat && pickup?.lat) {
      const tempPickup = { ...pickup };
      setPickup({ ...dropoffs[0] });
      updateDropoff(0, tempPickup);
      onFocusField('pickup'); // Auto-focus map on new pickup
    }
  };

  return (
    <div className="relative pl-8 pr-2 mt-2">
      
      {/* THE CONTINUOUS VERTICAL DASHED TIMELINE AXIS */}
      <div className="absolute left-[19px] top-6 bottom-16 w-[2px] border-l-[2px] border-dotted border-gray-300 z-0" />

      {/* FLOATING SWAP BUTTON (Intercepts the dotted line) */}
      <button 
        onClick={handleSwapRoute} 
        className="absolute left-[7px] top-[46px] w-[26px] h-[26px] bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-black shadow-sm z-20 active:scale-95 hover:bg-gray-50 transition-all"
        title="Swap Locations"
      >
        <ArrowUpDown size={12} strokeWidth={3} />
      </button>

      {/* ----------------------------------------------------------------- */}
      {/* INPUT NODE 1: PICKUP */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative mb-4 z-10">
        {/* Hollow Circle Indicator on the timeline axis */}
        <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-white border-[3px] border-gray-300 ring-4 ring-white z-10" />
        
        <div className="relative w-full">
          <input 
            type="text" 
            readOnly 
            onClick={() => onFocusField('pickup')} 
            value={pickup?.address || ''} 
            placeholder="Search Pickup Location" 
            className={`w-full bg-[#F6F6F6] p-4 pr-12 rounded-[16px] font-bold text-[14px] text-black border-2 transition-all outline-none cursor-pointer truncate ${activeField === 'pickup' ? 'border-black bg-white shadow-sm' : 'border-transparent hover:border-gray-200'}`} 
          />
          <button 
            onClick={() => { onFocusField('pickup'); onOpenSearch(); }} 
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* INPUT NODES: DROPOFFS */}
      {/* ----------------------------------------------------------------- */}
      <AnimatePresence>
        {dropoffs.map((drop, idx) => (
          <motion.div 
            key={`drop-${idx}`} 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="relative mb-4 z-10 flex items-center gap-2"
          >
            {/* Solid Circle Indicator on the timeline axis */}
            <div className={`absolute -left-[30px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full ring-4 ring-white z-10 transition-colors ${activeField === idx ? 'bg-black' : 'bg-gray-300'}`} />
            
            <div className="relative flex-1">
              <input 
                type="text" 
                readOnly 
                onClick={() => onFocusField(idx)} 
                value={drop.address || ''} 
                placeholder={`Search Dropoff ${idx + 1}`} 
                className={`w-full bg-[#F6F6F6] p-4 pr-12 rounded-[16px] font-bold text-[14px] text-black border-2 transition-all outline-none cursor-pointer truncate ${activeField === idx ? 'border-black bg-white shadow-sm' : 'border-transparent hover:border-gray-200'}`} 
              />
              <button 
                onClick={() => { onFocusField(idx); onOpenSearch(); }} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Remove Dropoff Button (Only show if multiple dropoffs exist) */}
            {dropoffs.length > 1 && (
              <button 
                onClick={() => { removeDropoff(idx); onFocusField('pickup'); }} 
                className="w-[52px] h-[52px] flex items-center justify-center rounded-[16px] bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shrink-0 active:scale-95"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* ----------------------------------------------------------------- */}
      {/* ADD STOP BUTTON */}
      {/* ----------------------------------------------------------------- */}
      {dropoffs.length < 5 && (
        <button 
          onClick={() => { 
            const newIndex = dropoffs.length;
            addDropoff({ address: '', lat: null, lng: null }); 
            onFocusField(newIndex);
          }} 
          className="mt-2 mb-2 flex items-center gap-3 text-[14px] font-bold text-black hover:opacity-70 transition-opacity z-10 relative"
        >
          <div className="w-[14px] h-[14px] absolute -left-[30px] flex items-center justify-center bg-white z-10 ring-4 ring-white">
             <Plus size={16} strokeWidth={4} className="text-black" />
          </div>
          Add another stop
        </button>
      )}

    </div>
  );
}