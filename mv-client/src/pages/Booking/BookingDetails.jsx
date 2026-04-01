import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

// Premium Design System Components
import SystemCard from '../../components/UI/SystemCard';
import SystemButton from '../../components/UI/SystemButton';
import LineIconRegistry from '../../components/Icons/LineIconRegistry';

// Real Global Store Integration
import useBookingStore from '../../store/useBookingStore';

/**
 * PAGE: BOOKING DETAILS & PACKAGE SAFETY (PREMIUM CARD UI)
 * Architecture: Fragmented White SystemCards on #F2F4F7 background.
 * Features: 
 * - Seamless Headerless Navigation
 * - Massively Rounded borderless inputs (#F6F6F6 backgrounds)
 * - Animated Safety Toggles using SystemCards
 * - Real-time Scheduling Constraints
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
  
  const [isScheduledLater, setIsScheduledLater] = useState(scheduling.isScheduledLater || false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
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
      requiresSecureOTP: isHighValue
    });

    setScheduling({
      isScheduledLater,
      scheduledDateTime: finalDateTime
    });

    // Proceed to Bidding / Pricing Engine
    navigate('/booking/price-selection');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] text-[#111111] font-sans relative flex flex-col">
      
      {/* SECTION 1: Isolated Navigation (Headerless Paradigm) */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-50 bg-[#F2F4F7]/90 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>
        <h1 className="text-[32px] font-black tracking-tighter text-[#111111] leading-none">
          Details
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-5 pt-2 pb-32 space-y-4">
        
        {/* SECTION 2: Category Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#111111]">
              <LineIconRegistry name="box" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight">Item Category</span>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            {ITEM_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setItemType(cat); setError(''); }}
                className={`px-5 py-3 rounded-full text-[14px] font-bold transition-all border-2 active:scale-95 ${
                  itemType === cat 
                    ? 'bg-[#111111] text-white border-[#111111] shadow-md' 
                    : 'bg-[#F6F6F6] text-[#111111] border-transparent hover:bg-white hover:border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </SystemCard>

        {/* SECTION 3: Safety Mode Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#111111]">
              <LineIconRegistry name="shield" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight">Safety Protocol</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsFragile(!isFragile)}
              className={`p-5 rounded-[24px] border-2 flex flex-col gap-4 text-left transition-all active:scale-95 ${
                isFragile ? 'border-[#111111] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.04)]' : 'border-transparent bg-[#F6F6F6] hover:bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isFragile ? 'bg-[#111111] text-white' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                <LineIconRegistry name="shield" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[15px] font-black tracking-tight text-[#111111]">Fragile</span>
                <span className="block text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">Handle Care</span>
              </div>
            </button>

            <button
              onClick={() => setIsHighValue(!isHighValue)}
              className={`p-5 rounded-[24px] border-2 flex flex-col gap-4 text-left transition-all active:scale-95 ${
                isHighValue ? 'border-[#111111] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.04)]' : 'border-transparent bg-[#F6F6F6] hover:bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isHighValue ? 'bg-[#276EF1] text-white' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                <LineIconRegistry name="diamond" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[15px] font-black tracking-tight text-[#111111]">High Value</span>
                <span className="block text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">Secure OTP</span>
              </div>
            </button>
          </div>
        </SystemCard>

        {/* SECTION 4: Schedule Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#111111]">
              <LineIconRegistry name="clock" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight">Pickup Schedule</span>
          </div>

          <div className="bg-[#F6F6F6] p-1.5 rounded-full flex relative mb-2">
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#111111] rounded-full shadow-sm transition-all duration-300 ease-out"
              style={{ left: isScheduledLater ? 'calc(50% + 3px)' : '6px' }}
            />
            <button 
              onClick={() => setIsScheduledLater(false)}
              className={`flex-1 flex items-center justify-center py-3 rounded-full text-[14px] font-bold transition-colors z-10 ${!isScheduledLater ? 'text-white' : 'text-gray-500 hover:text-black'}`}
            >
              Right now
            </button>
            <button 
              onClick={() => setIsScheduledLater(true)}
              className={`flex-1 flex items-center justify-center py-3 rounded-full text-[14px] font-bold transition-colors z-10 ${isScheduledLater ? 'text-white' : 'text-gray-500 hover:text-black'}`}
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
                <div className="flex-1 flex items-center px-4 py-4 rounded-2xl bg-[#F6F6F6] transition-all">
                  <span className="text-gray-400 mr-3 shrink-0"><LineIconRegistry name="calendar" size={18} /></span>
                  <input 
                    type="date" min={todayISO} value={scheduleDate}
                    onChange={(e) => { setScheduleDate(e.target.value); setError(''); }}
                    className="w-full bg-transparent font-bold text-[14px] text-[#111111] focus:outline-none"
                  />
                </div>
                <div className="flex-1 flex items-center px-4 py-4 rounded-2xl bg-[#F6F6F6] transition-all">
                  <span className="text-gray-400 mr-3 shrink-0"><LineIconRegistry name="clock" size={18} /></span>
                  <input 
                    type="time" value={scheduleTime}
                    onChange={(e) => { setScheduleTime(e.target.value); setError(''); }}
                    className="w-full bg-transparent font-bold text-[14px] text-[#111111] focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SystemCard>

        {/* SECTION 5: Notes Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-11 h-11 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#111111]">
              <LineIconRegistry name="message" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight">Driver Instructions</span>
          </div>

          <div className="flex items-start px-5 py-5 rounded-[24px] bg-[#F6F6F6] transition-all">
            <textarea
              value={driverNotes}
              onChange={(e) => setDriverNotes(e.target.value)}
              placeholder="e.g. Ring the bell twice, beware of the gate..."
              className="w-full text-[15px] font-bold text-[#111111] placeholder:text-gray-400 focus:outline-none bg-transparent resize-none min-h-[100px]"
            />
          </div>
        </SystemCard>

        {/* Real-time Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-[24px] font-bold text-[13px] flex items-start gap-2 shadow-sm"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SECTION 6: Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 backdrop-blur-md border-t border-gray-200 z-50">
        <SystemButton 
          onClick={handleContinue}
          variant="primary"
          icon={ArrowRight}
          className="flex-row-reverse"
        >
          Review Pricing
        </SystemButton>
      </div>

    </div>
  );
}