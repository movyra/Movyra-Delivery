import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, AlertCircle, Loader2, Camera, X } from 'lucide-react';

// Premium Design System Components
import SystemCard from '../../components/UI/SystemCard';
import SystemButton from '../../components/UI/SystemButton';
import LineIconRegistry from '../../components/Icons/LineIconRegistry';

// Real Global Store Integration
import useBookingStore from '../../store/useBookingStore';

// Hardware Features
import SmartScanner from '../Tracking/SmartScanner';

/**
 * PAGE: BOOKING DETAILS & PACKAGE SAFETY (PREMIUM CARD UI)
 * Architecture: Fragmented White SystemCards on #F2F4F7 background.
 * Features (8+): 
 * - Seamless Headerless Navigation
 * - Item Category Selection
 * - Animated Safety Toggles (Fragile / High Value)
 * - Real-time Scheduling Constraints & Mathematics
 * - Driver Instructions / Delivery Notes
 * - FEATURE INJECTION: SmartScanner (Camera Proof of Delivery payload)
 * - DARK MODE: 100% Global compliance wired
 */

const ITEM_CATEGORIES = ['Documents', 'Electronics', 'Clothes', 'Groceries', 'Heavy Goods', 'Other'];

export default function BookingDetails() {
  const navigate = useNavigate();
  
  // Real Global State
  const { packageDetails, scheduling, updatePackageDetails, setScheduling } = useBookingStore();

  // Local Form State
  const [itemType, setItemType] = useState(packageDetails.itemType || '');
  const [isFragile, setIsFragile] = useState(packageDetails.isFragile || false);
  const [isHighValue, setIsHighValue] = useState(packageDetails.isHighValue || false);
  const [driverNotes, setDriverNotes] = useState(packageDetails.driverNotes || '');
  const [packageImage, setPackageImage] = useState(packageDetails.packageImage || null);
  
  const [isScheduledLater, setIsScheduledLater] = useState(scheduling.isScheduledLater || false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Hardware Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Validation State
  const [error, setError] = useState('');

  // Sync dates from store
  useEffect(() => {
    if (scheduling.scheduledDateTime) {
      const dateObj = new Date(scheduling.scheduledDateTime);
      setScheduleDate(dateObj.toISOString().split('T')[0]);
      setScheduleTime(dateObj.toTimeString().slice(0, 5));
    }
  }, [scheduling.scheduledDateTime]);

  const todayISO = new Date().toISOString().split('T')[0];

  const handleContinue = () => {
    setError('');

    if (!itemType) {
      setError('Please select an item category.');
      return;
    }

    let finalDateTime = null;
    if (isScheduledLater) {
      if (!scheduleDate || !scheduleTime) {
        setError('Please provide both date and time for scheduled deliveries.');
        return;
      }
      
      const selectedDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      const now = new Date();
      
      if (selectedDateTime.getTime() < now.getTime() + (30 * 60000)) {
        setError('Scheduled time must be at least 30 minutes from now.');
        return;
      }
      finalDateTime = selectedDateTime.toISOString();
    }

    // Commit strictly to Zustand Store
    updatePackageDetails({
      itemType,
      isFragile,
      isHighValue,
      driverNotes: driverNotes.trim(),
      requiresSecureOTP: isHighValue,
      packageImage // Save the captured base64 hardware payload
    });

    setScheduling({
      isScheduledLater,
      scheduledDateTime: finalDateTime
    });

    // Proceed to Bidding / Pricing Engine
    navigate('/booking/price-selection');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] dark:bg-[#111111] text-[#111111] dark:text-[#F6F6F6] font-sans relative flex flex-col transition-colors duration-300">
      
      {/* SECTION 1: Isolated Navigation (Headerless Paradigm) */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-50 bg-[#F2F4F7]/90 dark:bg-[#111111]/90 backdrop-blur-md transition-colors duration-300">
        <button 
          onClick={() => navigate(-1)} 
          className="w-[46px] h-[46px] bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>
        <h1 className="text-[32px] font-black tracking-tighter text-[#111111] dark:text-white leading-none transition-colors">
          Details
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-5 pt-2 pb-32 space-y-4">
        
        {/* SECTION 2: Category Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5 dark:bg-[#1A1A1A] dark:border-[#333333] transition-colors">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-[#111111] dark:text-white transition-colors">
              <LineIconRegistry name="box" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">Item Category</span>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            {ITEM_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setItemType(cat); setError(''); }}
                className={`px-5 py-3 rounded-full text-[14px] font-bold transition-all border-2 active:scale-95 ${
                  itemType === cat 
                    ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] border-[#111111] dark:border-white shadow-md' 
                    : 'bg-[#F6F6F6] dark:bg-[#2A2A2A] text-[#111111] dark:text-white border-transparent hover:bg-white dark:hover:bg-[#333333] hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </SystemCard>

        {/* SECTION 3: Package Photo Proof (HARDWARE INTEGRATION) */}
        <SystemCard animated variant="white" className="flex flex-col !p-5 dark:bg-[#1A1A1A] dark:border-[#333333] transition-colors">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-[#111111] dark:text-white transition-colors">
              <Camera size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">Package Photo</span>
          </div>

          {packageImage ? (
            <div className="relative rounded-[24px] overflow-hidden border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group shadow-sm">
              <img src={packageImage} alt="Package Proof" className="w-full h-48 object-cover" />
              <button 
                onClick={() => setPackageImage(null)}
                className="absolute top-3 right-3 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 active:scale-95 transition-all"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsScannerOpen(true)}
              className="w-full py-7 rounded-[24px] border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 hover:bg-white dark:hover:bg-[#2A2A2A] hover:border-[#111111] dark:hover:border-white transition-all text-gray-400 dark:text-gray-500 hover:text-[#111111] dark:hover:text-white active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-[#F6F6F6] dark:bg-[#333333] flex items-center justify-center text-inherit transition-colors">
                <Camera size={24} strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-bold">Tap to scan package</span>
            </button>
          )}
        </SystemCard>

        {/* SECTION 4: Safety Mode Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5 dark:bg-[#1A1A1A] dark:border-[#333333] transition-colors">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-[#111111] dark:text-white transition-colors">
              <LineIconRegistry name="shield" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">Safety Protocol</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsFragile(!isFragile)}
              className={`p-5 rounded-[24px] border-2 flex flex-col gap-4 text-left transition-all active:scale-95 ${
                isFragile ? 'border-[#111111] dark:border-white bg-white dark:bg-[#2A2A2A] shadow-[0_4px_15px_rgba(0,0,0,0.04)]' : 'border-transparent bg-[#F6F6F6] dark:bg-[#222222] hover:bg-white dark:hover:bg-[#2A2A2A] hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isFragile ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111]' : 'bg-white dark:bg-[#333333] text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-gray-800'}`}>
                <LineIconRegistry name="shield" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[15px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">Fragile</span>
                <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wide transition-colors">Handle Care</span>
              </div>
            </button>

            <button
              onClick={() => setIsHighValue(!isHighValue)}
              className={`p-5 rounded-[24px] border-2 flex flex-col gap-4 text-left transition-all active:scale-95 ${
                isHighValue ? 'border-[#276EF1] dark:border-[#4dabf7] bg-blue-50/50 dark:bg-[#1A365D]/30 shadow-[0_4px_15px_rgba(0,0,0,0.04)]' : 'border-transparent bg-[#F6F6F6] dark:bg-[#222222] hover:bg-white dark:hover:bg-[#2A2A2A] hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isHighValue ? 'bg-[#276EF1] dark:bg-[#4dabf7] text-white dark:text-[#111111]' : 'bg-white dark:bg-[#333333] text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-gray-800'}`}>
                <LineIconRegistry name="diamond" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[15px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">High Value</span>
                <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wide transition-colors">Secure OTP</span>
              </div>
            </button>
          </div>
        </SystemCard>

        {/* SECTION 5: Schedule Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5 dark:bg-[#1A1A1A] dark:border-[#333333] transition-colors">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-[#111111] dark:text-white transition-colors">
              <LineIconRegistry name="clock" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">Pickup Schedule</span>
          </div>

          <div className="bg-[#F6F6F6] dark:bg-[#222222] p-1.5 rounded-full flex relative mb-2 transition-colors">
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#111111] dark:bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
              style={{ left: isScheduledLater ? 'calc(50% + 3px)' : '6px' }}
            />
            <button 
              onClick={() => setIsScheduledLater(false)}
              className={`flex-1 flex items-center justify-center py-3 rounded-full text-[14px] font-bold transition-colors z-10 ${!isScheduledLater ? 'text-white dark:text-[#111111]' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              Right now
            </button>
            <button 
              onClick={() => setIsScheduledLater(true)}
              className={`flex-1 flex items-center justify-center py-3 rounded-full text-[14px] font-bold transition-colors z-10 ${isScheduledLater ? 'text-white dark:text-[#111111]' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              Later
            </button>
          </div>

          <AnimatePresence>
            {isScheduledLater && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex gap-3 overflow-hidden mt-3"
              >
                <div className="flex-1 flex items-center px-4 py-4 rounded-2xl bg-[#F6F6F6] dark:bg-[#222222] transition-colors">
                  <span className="text-gray-400 dark:text-gray-500 mr-3 shrink-0"><LineIconRegistry name="calendar" size={18} /></span>
                  <input 
                    type="date" min={todayISO} value={scheduleDate}
                    onChange={(e) => { setScheduleDate(e.target.value); setError(''); }}
                    className="w-full bg-transparent font-bold text-[14px] text-[#111111] dark:text-white focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div className="flex-1 flex items-center px-4 py-4 rounded-2xl bg-[#F6F6F6] dark:bg-[#222222] transition-colors">
                  <span className="text-gray-400 dark:text-gray-500 mr-3 shrink-0"><LineIconRegistry name="clock" size={18} /></span>
                  <input 
                    type="time" value={scheduleTime}
                    onChange={(e) => { setScheduleTime(e.target.value); setError(''); }}
                    className="w-full bg-transparent font-bold text-[14px] text-[#111111] dark:text-white focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SystemCard>

        {/* SECTION 6: Notes Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5 dark:bg-[#1A1A1A] dark:border-[#333333] transition-colors">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-[#111111] dark:text-white transition-colors">
              <LineIconRegistry name="message" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">Driver Instructions</span>
          </div>

          <div className="flex items-start px-5 py-5 rounded-[24px] bg-[#F6F6F6] dark:bg-[#222222] transition-colors">
            <textarea
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              placeholder="e.g. Ring the bell twice, beware of the gate..."
              className="w-full text-[15px] font-bold text-[#111111] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none bg-transparent resize-none min-h-[100px]"
            />
          </div>
        </SystemCard>

        {/* Real-time Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-5 py-4 rounded-[24px] font-bold text-[13px] flex items-start gap-2 shadow-sm transition-colors"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SECTION 7: Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 dark:bg-[#111111]/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-40 transition-colors duration-300">
        <SystemButton 
          onClick={handleContinue}
          variant="primary"
          icon={ArrowRight}
          className="flex-row-reverse"
        >
          Review Pricing
        </SystemButton>
      </div>

      {/* HARDWARE OVERLAY: SMART SCANNER */}
      <AnimatePresence>
        {isScannerOpen && (
          <SmartScanner 
            mode="proof" 
            onCapture={(base64) => {
              setPackageImage(base64);
              setIsScannerOpen(false);
            }} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}