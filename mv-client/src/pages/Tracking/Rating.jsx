import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, Heart, MessageSquare, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

// Premium Design System Components
import SystemCard from '../../components/UI/SystemCard';
import SystemButton from '../../components/UI/SystemButton';

// Real Store & Firestore Integration
import useBookingStore from '../../store/useBookingStore';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../services/firebaseAuth';

/**
 * PAGE: RATING & FEEDBACK (STARK MINIMALIST UI)
 * Features:
 * 1. 5-Star Interactive Rating System
 * 2. Dynamic Issue/Praise Tag Chips (Late, Rude, Damaged)
 * 3. Trusted Driver Priority Matching Toggle
 * 4. Text Feedback Area
 * 5. Direct Firestore Integration & State Cleanup
 */

const POSITIVE_TAGS = [
  'Polite & Professional',
  'Fast & Safe',
  'Followed Instructions',
  'Clean Vehicle',
  'Great Communication'
];

const ISSUE_TAGS = [
  'Late Delivery',
  'Rude Behavior',
  'Damaged Item',
  'Unsafe Driving',
  'Poor Communication'
];

export default function Rating() {
  const navigate = useNavigate();
  const { id: routeOrderId } = useParams();
  
  // Global State
  const { activeOrder, pricing, resetBooking } = useBookingStore();
  const driver = pricing?.selectedBid || { driverName: 'Your Driver', driverId: 'unknown' };
  const targetOrderId = routeOrderId || activeOrder || 'unknown_order';

  // Local UI State
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [isTrusted, setIsTrusted] = useState(false);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic tags based on rating score
  const currentTags = rating >= 4 ? POSITIVE_TAGS : ISSUE_TAGS;

  // Clear tags if rating category changes
  useEffect(() => {
    setSelectedTags([]);
    if (rating < 4) setIsTrusted(false);
  }, [rating]);

  // ============================================================================
  // LOGIC: FIRESTORE SUBMISSION & STATE CLEANUP
  // ============================================================================
  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      const db = getFirestore();
      const user = auth.currentUser;
      
      if (!user) throw new Error("User must be authenticated to submit a rating.");

      // 1. Submit the core rating to the global ratings collection
      await addDoc(collection(db, 'ratings'), {
        orderId: targetOrderId,
        driverId: driver.driverId || 'unknown_driver',
        userId: user.uid,
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });

      // 2. "Trusted Driver Mode" - Add to user's personal trusted roster
      if (isTrusted && driver.driverId && rating >= 4) {
        const trustedRef = doc(db, 'artifacts', typeof window.__app_id !== 'undefined' ? window.__app_id : 'default', 'users', user.uid, 'trusted_drivers', driver.driverId);
        await setDoc(trustedRef, {
          driverId: driver.driverId,
          driverName: driver.driverName,
          addedAt: serverTimestamp()
        });
      }

      setIsSuccess(true);
      
      // Cleanup & Redirect after showing success animation
      setTimeout(() => {
        resetBooking();
        navigate('/dashboard-home', { replace: true });
      }, 2000);

    } catch (error) {
      console.error("Failed to submit rating:", error);
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] bg-[#F2F4F7] flex flex-col items-center justify-center font-sans p-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-[#111111] rounded-full flex items-center justify-center mb-6 shadow-xl"
        >
          <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <motion.h1 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-[32px] font-black tracking-tighter text-[#111111] text-center"
        >
          Thank You!
        </motion.h1>
        <motion.p 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-gray-500 font-bold mt-2"
        >
          Feedback submitted. Redirecting...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] text-[#111111] flex flex-col font-sans relative">
      
      {/* SECTION 1: Top Navigation */}
      <div className="pt-14 px-6 pb-2 flex items-center justify-between sticky top-0 z-50">
        <button 
          onClick={() => { resetBooking(); navigate('/dashboard-home', { replace: true }); }} 
          className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-5 pt-6 pb-32 space-y-4">
        
        {/* SECTION 2: Header & Dynamic Star Rating */}
        <SystemCard variant="white" className="!p-8 text-center flex flex-col items-center">
          <h1 className="text-[36px] font-black text-[#111111] leading-[1.05] tracking-tighter mb-2">
            Rate your <br/>experience.
          </h1>
          <p className="text-[15px] text-gray-500 font-bold">
            How was your delivery with {driver.driverName.split(' ')[0]}?
          </p>
          
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none p-1"
              >
                <Star 
                  size={42} 
                  strokeWidth={1.5}
                  className={`transition-colors duration-200 ${
                    (hoveredRating || rating) >= star 
                      ? 'fill-[#111111] text-[#111111] drop-shadow-md' 
                      : 'fill-transparent text-gray-300'
                  }`} 
                />
              </motion.button>
            ))}
          </div>
        </SystemCard>

        {/* SECTION 3: Detailed Feedback (Only shown after rating is selected) */}
        <AnimatePresence>
          {rating > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="space-y-4"
            >
              
              {/* Feedback Tag Chips */}
              <SystemCard animated variant="white" className="!p-6">
                <h3 className={`text-[13px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${rating >= 4 ? 'text-gray-400' : 'text-red-500'}`}>
                  {rating >= 4 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {rating >= 4 ? 'What went well?' : 'What went wrong?'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2.5 rounded-[16px] text-[13px] font-bold transition-all border-2 active:scale-95 ${
                        selectedTags.includes(tag)
                          ? rating >= 4 
                            ? 'bg-[#111111] text-white border-[#111111]' 
                            : 'bg-red-500 text-white border-red-500'
                          : 'bg-[#F6F6F6] text-[#111111] border-transparent hover:border-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </SystemCard>

              {/* Trusted Driver Mode Toggle (Only visible for positive ratings) */}
              <AnimatePresence>
                {rating >= 4 && (
                  <SystemCard animated variant="white" className="!p-5 border-2 border-transparent">
                    <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3">Priority Matching</h3>
                    <button
                      onClick={() => setIsTrusted(!isTrusted)}
                      className={`w-full p-5 rounded-[24px] border-2 flex items-center justify-between transition-all active:scale-[0.98] ${
                        isTrusted ? 'border-[#FF3B30] bg-[#FF3B30]/5 shadow-sm' : 'border-transparent bg-[#F6F6F6]'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block text-[15px] font-black tracking-tight text-[#111111]">Trusted Driver Mode</span>
                        <span className="block text-[12px] font-bold text-gray-500 mt-0.5 max-w-[200px]">
                          Add {driver.driverName.split(' ')[0]} to your preferred list for future bookings.
                        </span>
                      </div>
                      <motion.div 
                        animate={{ scale: isTrusted ? [1, 1.2, 1] : 1 }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isTrusted ? 'bg-[#FF3B30] text-white shadow-[0_5px_15px_rgba(255,59,48,0.3)]' : 'bg-white text-gray-300 border border-gray-200'
                        }`}
                      >
                        <Heart size={20} fill={isTrusted ? "currentColor" : "none"} strokeWidth={2.5} />
                      </motion.div>
                    </button>
                  </SystemCard>
                )}
              </AnimatePresence>

              {/* Optional Text Comment */}
              <SystemCard animated variant="white" className="!p-5">
                <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare size={16} /> Additional Comments
                </h3>
                <div className="flex items-start px-5 py-4 rounded-[24px] border-2 border-transparent bg-[#F6F6F6] focus-within:border-[#111111] focus-within:bg-white transition-all">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Leave a note about your experience (optional)..."
                    className="w-full text-[14px] font-bold text-[#111111] placeholder:text-gray-400 focus:outline-none bg-transparent resize-none min-h-[80px]"
                  />
                </div>
              </SystemCard>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SECTION 4: Floating Bottom CTA */}
      <AnimatePresence>
        {rating > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 backdrop-blur-md border-t border-gray-200 z-50"
          >
            <SystemButton 
              onClick={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
              variant="primary"
            >
              Submit Feedback
            </SystemButton>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}