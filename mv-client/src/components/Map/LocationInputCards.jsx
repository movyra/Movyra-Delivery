import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, ArrowDownUp, Plus, X } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';

/**
 * UI COMPONENT: LOCATION INPUT CARDS
 * Replicates the detached, highly-rounded white cards from the lower half of the reference image.
 * Replaces the old continuous timeline with distinct, premium floating blocks.
 * Implements strict null-safety arrays to prevent undefined 'address' crashes.
 */
export default function LocationInputCards({ activeField, onFocusField, onOpenSearch }) {
  const { pickup, dropoffs, setPickup, updateDropoff, removeDropoff, addDropoff } = useBookingStore();

  // STRICT FAILSAFES: Prevent undefined array mapping crashes
  const safePickup = pickup || { address: '', lat: null, lng: null };
  const safeDropoffs = Array.isArray(dropoffs) ? dropoffs : [];

  const handleSwapRoute = (e) => {
    e.stopPropagation();
    if (safeDropoffs[0]?.lat && safePickup?.lat) {
      const tempPickup = { ...safePickup };
      setPickup({ ...safeDropoffs[0] });
      updateDropoff(0, tempPickup);
      onFocusField('pickup');
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 font-sans relative">
      
      {/* CARD 1: PICKUP */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => onFocusField('pickup')}
        className={`bg-white rounded-[32px] p-5 flex items-center gap-4 cursor-pointer transition-all border-2 ${activeField === 'pickup' ? 'border-[#111111] shadow-[0_8px_20px_rgba(0,0,0,0.06)]' : 'border-transparent shadow-[0_4px_15px_rgba(0,0,0,0.03)]'}`}
      >
        <div className="w-[46px] h-[46px] rounded-full bg-[#F2F4F7] flex items-center justify-center shrink-0">
          <Navigation size={20} className="text-black rotate-45" strokeWidth={2.5} />
        </div>
        <div className="flex-1 overflow-hidden">
          <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</span>
          <span className="block text-[16px] font-black text-black truncate leading-none">
            {safePickup?.address || 'Where from?'}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onFocusField('pickup'); onOpenSearch(); }}
          className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors shrink-0"
        >
          <Search size={18} strokeWidth={2.5} />
        </button>
      </motion.div>

      {/* DETACHED SWAP BUTTON */}
      <div className="relative h-2 flex items-center justify-center -my-1 z-10">
        <button 
          onClick={handleSwapRoute}
          className="w-[36px] h-[36px] bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-500 hover:text-black active:scale-95 transition-all border border-gray-100"
        >
          <ArrowDownUp size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* CARDS 2+: DROPOFFS */}
      <AnimatePresence>
        {safeDropoffs.map((drop, idx) => {
          const safeDrop = drop || { address: '' };

          return (
            <motion.div 
              key={`drop-${idx}`}
              initial={{ opacity: 0, scale: 0.95, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: 'auto' }}
              exit={{ opacity: 0, scale: 0.95, height: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFocusField(idx)}
              className={`bg-white rounded-[32px] p-5 flex items-center gap-4 cursor-pointer transition-all border-2 ${activeField === idx ? 'border-[#111111] shadow-[0_8px_20px_rgba(0,0,0,0.06)]' : 'border-transparent shadow-[0_4px_15px_rgba(0,0,0,0.03)]'}`}
            >
              <div className="w-[46px] h-[46px] rounded-full bg-[#111111] flex items-center justify-center shrink-0 shadow-md">
                <span className="text-white text-[15px] font-black">{idx + 1}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dropoff</span>
                <span className="block text-[16px] font-black text-black truncate leading-none">
                  {safeDrop?.address || 'Where to?'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {safeDropoffs.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeDropoff(idx); onFocusField('pickup'); }}
                    className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onFocusField(idx); onOpenSearch(); }}
                  className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ADD STOP CARD */}
      {safeDropoffs.length < 5 && (
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const newIndex = safeDropoffs.length;
            addDropoff({ address: '', lat: null, lng: null });
            onFocusField(newIndex);
          }}
          className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-[32px] p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-gray-400 transition-all text-gray-500 hover:text-black mt-2"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
            <Plus size={16} strokeWidth={3} className="text-black" />
          </div>
          <span className="text-[15px] font-bold">Add another stop</span>
        </motion.div>
      )}

    </div>
  );
}