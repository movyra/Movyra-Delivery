import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Crown, Loader2, ArrowRight } from 'lucide-react';

// ============================================================================
// COMPONENT: PREMIUM SUBSCRIPTION CARD (MOVYRA LIGHT THEME)
// A deeply interactive billing and feature card featuring 6 functional sections:
// Real-Time Billing Engine, Animated Wrapper, Pricing Header, 
// Staggered Feature Matrix, Upgrade Action Engine, and Management Engine.
// ============================================================================

export default function PremiumCard({ 
  initialPremiumStatus = false,
  onUpgrade,
  onManage 
}) {
  const [isPremium, setIsPremium] = useState(initialPremiumStatus);
  const [isProcessing, setIsProcessing] = useState(false);

  // SECTION 1: Real-Time Billing & Temporal Engine
  // Calculates the exact billing cycle renewal date dynamically based on the current system time
  const billingContext = useMemo(() => {
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
    
    return {
      renewalDate: nextMonth.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      currentStatus: isPremium ? 'Active' : 'Basic',
      price: 50
    };
  }, [isPremium]);

  const features = [
    "Enhanced routing speed",
    "100% no ads",
    "Priority 24/7 customer support",
    "Free extended warehouse storage",
    "Exclusive delivery discounts"
  ];

  // SECTION 5/6 Logic Engine: Processing Upgrades seamlessly
  const handleUpgradeProcess = async () => {
    setIsProcessing(true);
    try {
      // Execute passed external logic if available (e.g., Stripe/Razorpay trigger)
      if (onUpgrade) await onUpgrade();
      
      // Real functional state transition
      setTimeout(() => {
        setIsPremium(true);
        setIsProcessing(false);
      }, 1200); // Functional artificial delay for transaction processing UX
    } catch (error) {
      console.error("Upgrade failed:", error);
      setIsProcessing(false);
    }
  };

  return (
    // SECTION 2: Animated Layout Wrapper
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full bg-white rounded-[32px] p-6 mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden flex flex-col"
    >
      {/* Decorative ambient background elements */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/10 rounded-full blur-[40px] pointer-events-none"></div>
      
      {/* SECTION 3: Premium Header & Pricing Engine */}
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPremium ? 'bg-amber-400 text-amber-950' : 'bg-gray-900 text-white'}`}>
              <Crown size={16} strokeWidth={3} />
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-gray-400">Movyra Pro</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{billingContext.price}</span>
            <span className="text-sm font-bold text-gray-400">/ Month</span>
          </div>
        </div>
        
        {/* Dynamic Status Badge */}
        <div className={`px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${
          isPremium ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'
        }`}>
          {billingContext.currentStatus}
        </div>
      </div>

      {/* SECTION 4: Staggered Feature List Matrix */}
      <div className="flex flex-col gap-4 mb-8 relative z-10">
        {features.map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + (idx * 0.05), type: 'spring' }}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-movyra-blue flex-shrink-0">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-[14px] font-bold text-gray-700 leading-snug">{feature}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-auto relative z-10">
        <AnimatePresence mode="popLayout">
          
          {/* SECTION 5: Primary Upgrade Action Engine */}
          {!isPremium && (
            <motion.button 
              key="upgrade-btn"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0 }}
              onClick={handleUpgradeProcess}
              disabled={isProcessing}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[15px] tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20 disabled:opacity-70 disabled:scale-100"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin text-white" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} strokeWidth={2.5} className="text-amber-400" />
                  Upgrade Now
                </>
              )}
            </motion.button>
          )}

          {/* SECTION 6: Secondary Management Action Engine */}
          {(isPremium || !isProcessing) && (
            <motion.button 
              key="manage-btn"
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onManage}
              className="w-full bg-amber-400 text-amber-950 py-4 rounded-2xl font-black text-[15px] tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-amber-400/20 hover:bg-amber-500"
            >
              Manage Subscription
              <ArrowRight size={18} strokeWidth={2.5} />
            </motion.button>
          )}

        </AnimatePresence>
        
        {/* Dynamic Billing Context Disclaimer */}
        <motion.p layout className="text-center text-[11px] font-bold text-gray-400 mt-2">
          {isPremium 
            ? `Your next billing date is ${billingContext.renewalDate}.` 
            : `Auto-renews every month. Cancel anytime.`
          }
        </motion.p>
      </div>

    </motion.div>
  );
}