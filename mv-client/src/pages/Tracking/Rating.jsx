import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, Heart, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';

// Real Store & Firestore Integration
import useBookingStore from '../../store/useBookingStore';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../services/firebaseAuth';

// ============================================================================
// PAGE: RATING & FEEDBACK (STARK MINIMALIST UI)
// Captures user feedback, tags, and enables the "Trusted Driver Mode" toggle.
// Writes directly to Firestore and cleans up the global booking state upon exit.
// ============================================================================

const FEEDBACK_TAGS = [
  'Polite & Professional',
  'Fast & Safe',
  'Followed Instructions',
  'Clean Vehicle',
  'Great Communication'
];

export default function Rating() {
  const navigate = useNavigate();
  
  // Global State
  const { activeOrder, pricing, resetBooking } = useBookingStore();
  const driver = pricing?.selectedBid || { driverName: 'Your Driver', driverId: 'unknown' };

  // Local UI State
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [isTrusted, setIsTrusted] = useState(false);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
        orderId: activeOrder || 'unknown_order',
        driverId: driver.driverId || 'unknown_driver',
        userId: user.uid,
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });

      // 2. "Trusted Driver Mode" - Add to user's personal trusted roster
      if (isTrusted && driver.driverId) {
        const trustedRef = doc(db, 'users', user.uid, 'trusted_drivers', driver.driverId);
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
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans p-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 shadow-xl"
        >
          <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <motion.h1 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-[32px] font-black tracking-tighter text-black text-center"
        >
          Thank You!
        </motion.h1>
        <motion.p 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-gray-500 font-bold mt-2"
        >
          Redirecting to home...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative">
      
      {/* SECTION 1: Top Navigation */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <button 
          onClick={() => { resetBooking(); navigate('/dashboard-home', { replace: true }); }} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 pt-6 pb-32">
        
        {/* SECTION 2: Header & Dynamic Star Rating */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-[40px] font-black text-black leading-[1.05] tracking-tighter mb-2">
            Rate your <br/>experience.
          </h1>
          <p className="text-[16px] text-gray-500 font-bold">
            How was your delivery with {driver.driverName.split(' ')[0]}?
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star 
                  size={48} 
                  strokeWidth={1.5}
                  className={`transition-colors duration-200 ${
                    (hoveredRating || rating) >= star 
                      ? 'fill-black text-black drop-shadow-md' 
                      : 'fill-transparent text-gray-200'
                  }`} 
                />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* SECTION 3: Detailed Feedback (Only shown after rating is selected) */}
        <AnimatePresence>
          {rating > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="space-y-8"
            >
              
              {/* Feedback Tag Chips */}
              <div>
                <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">What went well?</h3>
                <div className="flex flex-wrap gap-2.5">
                  {FEEDBACK_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2.5 rounded-full text-[14px] font-bold transition-all border-2 active:scale-95 ${
                        selectedTags.includes(tag)
                          ? 'bg-black text-white border-black' 
                          : 'bg-[#F6F6F6] text-black border-transparent hover:border-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trusted Driver Mode Toggle */}
              <div>
                <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4">Priority Matching</h3>
                <button
                  onClick={() => setIsTrusted(!isTrusted)}
                  className={`w-full p-5 rounded-[24px] border-2 flex items-center justify-between transition-all active:scale-[0.98] ${
                    isTrusted ? 'border-[#FF3B30] bg-[#FF3B30]/5 shadow-sm' : 'border-transparent bg-[#F6F6F6]'
                  }`}
                >
                  <div className="text-left">
                    <span className="block text-[16px] font-black tracking-tight text-black">Trusted Driver Mode</span>
                    <span className="block text-[13px] font-bold text-gray-500 mt-0.5 max-w-[220px]">
                      Add {driver.driverName.split(' ')[0]} to your preferred list for future bookings.
                    </span>
                  </div>
                  <motion.div 
                    animate={{ scale: isTrusted ? [1, 1.2, 1] : 1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      isTrusted ? 'bg-[#FF3B30] text-white shadow-[0_5px_15px_rgba(255,59,48,0.3)]' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Heart size={24} fill={isTrusted ? "currentColor" : "none"} strokeWidth={2.5} />
                  </motion.div>
                </button>
              </div>

              {/* Optional Text Comment */}
              <div>
                <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare size={16} /> Additional Comments
                </h3>
                <div className="flex items-start px-5 py-4 rounded-2xl border-2 border-transparent bg-[#F6F6F6] focus-within:border-black focus-within:bg-white transition-all">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Leave a note for the driver (optional)..."
                    className="w-full text-[15px] font-bold text-black placeholder:text-gray-400 focus:outline-none bg-transparent resize-none min-h-[80px]"
                  />
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SECTION 4: Floating Bottom CTA */}
      <AnimatePresence>
        {rating > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50"
          >
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:shadow-none"
            >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Submit Feedback'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}