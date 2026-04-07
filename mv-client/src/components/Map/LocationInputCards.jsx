import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, ArrowDownUp, Plus, X, Camera } from 'lucide-react';

// Real Store, Prefs & Services Integration
import useBookingStore from '../../store/useBookingStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';

// Hardware Features (PATH CORRECTED WITH EXTENSION FOR BUILD SUCCESS)
import SmartScanner from '../Tracking/SmartScanner.jsx';

/**
 * UI COMPONENT: LOCATION INPUT CARDS
 * Replicates the detached, highly-rounded white cards from the lower half of the reference image.
 * Architecture: Floating action blocks on backdrop-blur.
 * Features: 
 * 1. Hardware OCR Address Capture: Integrated Camera button inside inputs.
 * 2. Multi-stop Support: Dynamic dropoff array management.
 * 3. Atomic Route Swapping: Inverts pickup and first dropoff.
 * 4. Dual-Mode UX: Keyboard search + Hardware Lens scanning.
 * 5. DARK MODE: 100% compliance with theme-aware borders and backgrounds.
 */
export default function LocationInputCards({ activeField, onFocusField, onOpenSearch }) {
  const { pickup, dropoffs, setPickup, updateDropoff, removeDropoff, addDropoff } = useBookingStore();
  const { language } = usePreferencesStore();

  // Hardware Scanner State
  const [scannerTarget, setScannerTarget] = useState(null); // 'pickup' | number (dropoff index)

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

  // OCR Auto-fill Callback (Hardware Pipe)
  const handleScanCapture = (text) => {
    if (!text) return;
    if (scannerTarget === 'pickup') {
      setPickup({ ...safePickup, address: text });
      onFocusField('pickup');
    } else if (typeof scannerTarget === 'number') {
      updateDropoff(scannerTarget, { ...safeDropoffs[scannerTarget], address: text });
      onFocusField(scannerTarget);
    }
    setScannerTarget(null);
  };

  return (
    <div className="w-full flex flex-col gap-3 font-sans relative">
      
      {/* CARD 1: PICKUP */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => onFocusField('pickup')}
        className={`bg-white dark:bg-[#1A1A1A] rounded-[32px] p-5 flex items-center gap-4 cursor-pointer transition-all border-2 ${activeField === 'pickup' ? 'border-[#111111] dark:border-white shadow-[0_8px_20px_rgba(0,0,0,0.06)]' : 'border-transparent shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:border-[#333333]'}`}
      >
        <div className="w-[46px] h-[46px] rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center shrink-0 transition-colors">
          <Navigation size={20} className="text-[#111111] dark:text-white rotate-45 transition-colors" strokeWidth={2.5} />
        </div>
        <div className="flex-1 overflow-hidden">
          <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors">{t('Pickup', language)}</span>
          <span className="block text-[16px] font-black text-[#111111] dark:text-white truncate leading-none transition-colors">
            {safePickup?.address || t('Where from?', language)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); setScannerTarget('pickup'); }}
            className="w-10 h-10 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#111111] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
          >
            <Camera size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onFocusField('pickup'); onOpenSearch(); }}
            className="w-10 h-10 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#111111] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>

      {/* DETACHED SWAP BUTTON */}
      <div className="relative h-2 flex items-center justify-center -my-1 z-10">
        <button 
          onClick={handleSwapRoute}
          className="w-[36px] h-[36px] bg-white dark:bg-[#222222] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#111111] dark:hover:text-white active:scale-95 transition-all border border-gray-100 dark:border-gray-800"
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
              className={`bg-white dark:bg-[#1A1A1A] rounded-[32px] p-5 flex items-center gap-4 cursor-pointer transition-all border-2 ${activeField === idx ? 'border-[#111111] dark:border-white shadow-[0_8px_20px_rgba(0,0,0,0.06)]' : 'border-transparent shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:border-[#333333]'}`}
            >
              <div className="w-[46px] h-[46px] rounded-full bg-[#111111] dark:bg-white flex items-center justify-center shrink-0 shadow-md transition-colors">
                <span className="text-white dark:text-[#111111] text-[15px] font-black">{idx + 1}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors">{t('Dropoff', language)}</span>
                <span className="block text-[16px] font-black text-[#111111] dark:text-white truncate leading-none transition-colors">
                  {safeDrop?.address || t('Where to?', language)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {safeDropoffs.length > 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeDropoff(idx); onFocusField('pickup'); }}
                    className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setScannerTarget(idx); }}
                  className="w-10 h-10 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#111111] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
                >
                  <Camera size={18} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onFocusField(idx); onOpenSearch(); }}
                  className="w-10 h-10 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#111111] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
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
          className="bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[32px] p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-white dark:hover:bg-[#222222] hover:border-gray-400 dark:hover:border-gray-500 transition-all text-gray-500 dark:text-gray-400 hover:text-[#111111] dark:hover:text-white mt-2"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#333333] shadow-sm flex items-center justify-center shrink-0 transition-colors">
            <Plus size={16} strokeWidth={3} className="text-[#111111] dark:text-white transition-colors" />
          </div>
          <span className="text-[15px] font-bold">{t('Add another stop', language)}</span>
        </motion.div>
      )}

      {/* HARDWARE OVERLAY: SMART SCANNER */}
      <AnimatePresence>
        {scannerTarget !== null && (
          <SmartScanner 
            mode="address" 
            onCapture={handleScanCapture} 
            onClose={() => setScannerTarget(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}