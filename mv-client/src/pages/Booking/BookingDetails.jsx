import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, ShieldAlert, Diamond, Clock, Calendar, MessageSquare, PackageOpen } from 'lucide-react';

// Real Global Store Integration
import useBookingStore from '../../store/useBookingStore';

// ============================================================================
// PAGE: BOOKING DETAILS & PACKAGE SAFETY
// Stark minimalist form capturing item type, driver instructions, 
// advanced package safety modes, and real-time scheduling logic.
// ============================================================================

const ITEM_CATEGORIES = ['Documents', 'Electronics', 'Clothes', 'Groceries', 'Heavy Goods', 'Other'];

export default function BookingDetails() {
  const navigate = useNavigate();
  
  // Real Global State
  const { packageDetails, scheduling, updatePackageDetails, setScheduling } = useBookingStore();

  // Local Form State (Initialized with existing store data if user went back)
  const [itemType, setItemType] = useState(packageDetails.itemType || '');
  const [isFragile, setIsFragile] = useState(packageDetails.isFragile || false);
  const [isHighValue, setIsHighValue] = useState(packageDetails.isHighValue || false);
  const [driverNotes, setDriverNotes] = useState(packageDetails.driverNotes || '');
  
  const [isScheduledLater, setIsScheduledLater] = useState(scheduling.isScheduledLater || false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Validation State
  const [error, setError] = useState('');

  // Extract date/time strings if previously set in store
  useEffect(() => {
    if (scheduling.scheduledDateTime) {
      const dateObj = new Date(scheduling.scheduledDateTime);
      setScheduleDate(dateObj.toISOString().split('T')[0]);
      setScheduleTime(dateObj.toTimeString().slice(0, 5));
    }
  }, [scheduling.scheduledDateTime]);

  // Real-time minimum date constraint (Today)
  const todayISO = new Date().toISOString().split('T')[0];

  // ============================================================================
  // LOGIC: FORM VALIDATION & STATE COMMIT
  // ============================================================================
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
      
      // Strict real-time constraint: Must be at least 30 mins in the future
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
      requiresSecureOTP: isHighValue // Automatically enforce OTP for high value
    });

    setScheduling({
      isScheduledLater,
      scheduledDateTime: finalDateTime
    });

    // Proceed to Bidding / Pricing Engine
    navigate('/booking/price-selection');
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative">
      
      {/* SECTION 1: Top Navigation */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 pt-6 pb-32 space-y-8">
        
        {/* SECTION 2: Massive Typography Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[40px] font-black text-black leading-[1.05] tracking-tighter mb-3">
            Package <br/>Details.
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Help us ensure a safe and accurate delivery.
          </p>
        </motion.div>

        {/* SECTION 3: Item Category (Horizontal Chips) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-[15px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <PackageOpen size={16} strokeWidth={2.5} /> What are you sending?
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {ITEM_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setItemType(cat)}
                className={`px-5 py-3 rounded-full text-[15px] font-bold transition-all border-2 active:scale-95 ${
                  itemType === cat 
                    ? 'bg-black text-white border-black shadow-md' 
                    : 'bg-[#F6F6F6] text-black border-transparent hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* SECTION 4: Package Safety Mode (High Contrast Toggles) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-[15px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            Safety Mode
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Fragile Toggle */}
            <button
              onClick={() => setIsFragile(!isFragile)}
              className={`p-5 rounded-[24px] border-2 flex flex-col gap-3 text-left transition-all ${
                isFragile ? 'border-black bg-white shadow-md' : 'border-transparent bg-[#F6F6F6]'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFragile ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                <ShieldAlert size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[16px] font-black tracking-tight text-black">Fragile</span>
                <span className="block text-[13px] font-bold text-gray-500 mt-0.5">Handle with care</span>
              </div>
            </button>

            {/* High Value Toggle */}
            <button
              onClick={() => setIsHighValue(!isHighValue)}
              className={`p-5 rounded-[24px] border-2 flex flex-col gap-3 text-left transition-all ${
                isHighValue ? 'border-black bg-white shadow-md' : 'border-transparent bg-[#F6F6F6]'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHighValue ? 'bg-[#276EF1] text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Diamond size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[16px] font-black tracking-tight text-black">High Value</span>
                <span className="block text-[13px] font-bold text-gray-500 mt-0.5">Enforces strict OTP</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* SECTION 5: Scheduling Engine */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-[15px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock size={16} strokeWidth={2.5} /> When to pickup?
          </h3>
          
          <div className="bg-[#F6F6F6] p-1.5 rounded-full flex mb-4 relative border-2 border-transparent focus-within:border-black transition-all">
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
              style={{ left: isScheduledLater ? 'calc(50% + 3px)' : '6px' }}
            />
            <button 
              onClick={() => setIsScheduledLater(false)}
              className={`flex-1 flex items-center justify-center py-3 rounded-full text-[15px] font-bold transition-colors z-10 ${!isScheduledLater ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Right Now
            </button>
            <button 
              onClick={() => setIsScheduledLater(true)}
              className={`flex-1 flex items-center justify-center py-3 rounded-full text-[15px] font-bold transition-colors z-10 ${isScheduledLater ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Book for Later
            </button>
          </div>

          <AnimatePresence>
            {isScheduledLater && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 overflow-hidden"
              >
                <div className="flex-1 flex items-center px-4 py-4 rounded-2xl border-2 border-transparent bg-[#F6F6F6] focus-within:border-black focus-within:bg-white transition-all">
                  <Calendar size={18} className="text-gray-400 mr-2 shrink-0" />
                  <input 
                    type="date" 
                    min={todayISO}
                    value={scheduleDate}
                    onChange={(e) => { setScheduleDate(e.target.value); setError(''); }}
                    className="w-full bg-transparent font-bold text-[15px] text-black focus:outline-none"
                  />
                </div>
                <div className="flex-1 flex items-center px-4 py-4 rounded-2xl border-2 border-transparent bg-[#F6F6F6] focus-within:border-black focus-within:bg-white transition-all">
                  <Clock size={18} className="text-gray-400 mr-2 shrink-0" />
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => { setScheduleTime(e.target.value); setError(''); }}
                    className="w-full bg-transparent font-bold text-[15px] text-black focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* SECTION 6: Driver Notes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-[15px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MessageSquare size={16} strokeWidth={2.5} /> Driver Notes (Optional)
          </h3>
          <div className="flex items-start px-5 py-4 rounded-2xl border-2 border-transparent bg-[#F6F6F6] focus-within:border-black focus-within:bg-white transition-all">
            <textarea
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              placeholder="e.g. Ring the bell twice, beware of dog..."
              className="w-full text-[16px] font-bold text-black placeholder:text-gray-400 focus:outline-none bg-transparent resize-none min-h-[80px]"
            />
          </div>
        </motion.div>

        {/* Real-time Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SECTION 7: Floating Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <button 
          onClick={handleContinue}
          className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        >
          <span className="flex-1 text-center pl-6">Review Pricing</span>
          <ArrowRight size={24} className="text-white" />
        </button>
      </div>

    </div>
  );
}