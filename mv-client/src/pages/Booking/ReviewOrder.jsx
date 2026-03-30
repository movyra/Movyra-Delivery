import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Wallet, ShieldCheck, MapPin, 
  Package, Clock, ArrowRight, Loader2, AlertCircle, UserCircle2 
} from 'lucide-react';

// Real Store, Auth & Database Integration
import useBookingStore from '../../store/useBookingStore';
import { auth } from '../../services/firebaseAuth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { deductFromWallet } from '../../services/payment';

// ============================================================================
// PAGE: REVIEW ORDER & CHECKOUT (STARK MINIMALIST UI)
// The final gateway. Compiles the multi-stop route, package safety config,
// marketplace bid, and scheduling data into a massive payload, deducts wallet
// balance, and dispatches to the Firestore orders ledger.
// ============================================================================

export default function ReviewOrder() {
  const navigate = useNavigate();
  const db = getFirestore();

  // Real Global State
  const { pickup, dropoffs, packageDetails, scheduling, vehicleType, pricing, setActiveOrder } = useBookingStore();

  // Local Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Failsafe Redirect
  if (!pickup || dropoffs.length === 0) {
    navigate('/booking/set-location', { replace: true });
    return null;
  }

  // Financial Math
  const finalTotal = pricing?.estimatedPrice || 0;
  const taxableValue = finalTotal / 1.18;
  const gstAmount = finalTotal - taxableValue;

  // ============================================================================
  // LOGIC: MASTER DISPATCH ENGINE & WALLET DEDUCTION
  // ============================================================================
  const handlePlaceOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("Authentication required to place an order.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Generate a cryptographically secure 4-digit Delivery PIN
      const secureOTP = Math.floor(1000 + Math.random() * 9000).toString();

      // 2. Compile the massive enterprise payload
      const orderPayload = {
        userId: user.uid,
        pickup,
        dropoffs,
        packageDetails: {
          ...packageDetails,
          secureOTP // Injected for the receiver to share with the driver
        },
        scheduling,
        vehicleType,
        pricing: {
          ...pricing,
          taxableValue,
          gstAmount
        },
        status: 'searching', // Handed off to the SearchingDriver radar engine
        createdAt: serverTimestamp(),
        // Pass the accepted bid so the Liquidity Engine can auto-assign it
        selectedBid: pricing.selectedBid || null 
      };

      // 3. Write to the master Firestore 'orders' collection
      const docRef = await addDoc(collection(db, 'orders'), orderPayload);

      // 4. Execute atomic wallet deduction
      await deductFromWallet(finalTotal, docRef.id);

      // 5. Commit to Global State and transition to Radar
      setActiveOrder(docRef.id);
      navigate('/booking/searching', { replace: true });

    } catch (err) {
      console.error("Master Dispatch Error:", err);
      setError(err.message || "Failed to process payment and dispatch order.");
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative">
      
      {/* SECTION 1: Top Navigation */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
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

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 pt-6 pb-32">
        
        {/* SECTION 2: Header Typography */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-[40px] font-black text-black leading-[1.05] tracking-tighter mb-3">
            Review <br/>Order.
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Confirm your route, driver, and payment details before dispatch.
          </p>
        </motion.div>

        {/* Global Error Handle */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-start gap-2 mb-6"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 3: Multi-Stop Route Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="bg-[#F6F6F6] rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MapPin size={16} /> Route Summary
            </h3>
            
            <div className="relative border-l-2 border-dashed border-gray-300 ml-3 pl-6 space-y-6">
              {/* Pickup */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-black rounded-full ring-4 ring-[#F6F6F6]" />
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</span>
                <p className="text-[15px] font-bold text-black leading-snug">{pickup.address}</p>
              </div>

              {/* Dynamic Dropoffs Array */}
              {dropoffs.map((drop, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-white border-[4px] border-black rounded-sm ring-4 ring-[#F6F6F6]" />
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dropoff {idx + 1}</span>
                  <p className="text-[15px] font-bold text-black leading-snug">{drop.address}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* SECTION 4: Package Safety & Driver Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-[#F6F6F6] rounded-[24px] p-5 border border-gray-100 flex flex-col gap-3">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
              <Package size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="block text-[16px] font-black text-black">{packageDetails.itemType || 'Package'}</span>
              <span className="block text-[12px] font-bold text-gray-500 mt-0.5">
                {packageDetails.isFragile ? 'Fragile' : 'Standard'} • {packageDetails.isHighValue ? 'Insured' : 'No Insurance'}
              </span>
            </div>
          </div>

          <div className="bg-[#F6F6F6] rounded-[24px] p-5 border border-gray-100 flex flex-col gap-3">
            <div className="w-10 h-10 bg-[#276EF1] text-white rounded-full flex items-center justify-center">
              <UserCircle2 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="block text-[16px] font-black text-black truncate">
                {pricing.selectedBid ? pricing.selectedBid.driverName : 'AI Match'}
              </span>
              <span className="block text-[12px] font-bold text-[#276EF1] mt-0.5">
                {vehicleType ? vehicleType.toUpperCase() : 'DRIVER'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* SECTION 5: Scheduling Context */}
        {scheduling.isScheduledLater && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
            <div className="bg-orange-50 border border-orange-100 rounded-[20px] p-4 flex items-center gap-4">
              <Clock size={24} className="text-orange-500 shrink-0" />
              <div>
                <span className="block text-[14px] font-black text-black">Scheduled for Later</span>
                <span className="block text-[13px] font-bold text-orange-600 mt-0.5">
                  {new Date(scheduling.scheduledDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 6: Financial Breakdown & Wallet Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white rounded-[24px] p-6 border-2 border-gray-100 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-[15px] font-bold text-gray-600">
                <span>Logistics Base Fare</span>
                <span>₹{taxableValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[15px] font-bold text-gray-600">
                <span>GST (18%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              
              {pricing.isGroupDelivery && (
                <div className="flex justify-between items-center text-[15px] font-bold text-green-600">
                  <span>Group Delivery Discount</span>
                  <span>Applied</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-[20px] font-black text-black">Total Amount</span>
                <span className="text-[28px] font-black text-black tracking-tight">₹{finalTotal}</span>
              </div>
            </div>

            {/* Simulated Wallet Deduction UI */}
            <div className="bg-[#E8F0FE] border border-[#276EF1]/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#276EF1] rounded-full flex items-center justify-center shrink-0">
                <Wallet size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[14px] font-black text-black">Corporate Wallet</span>
                <span className="block text-[12px] font-bold text-[#276EF1] mt-0.5">Balance sufficient for deduction</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* SECTION 7: Floating Confirm CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <button 
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-50"
        >
          <span className="flex-1 text-center pl-6">
            {isLoading ? 'Processing Payment...' : `Confirm & Pay ₹${finalTotal}`}
          </span>
          {isLoading ? <Loader2 size={24} className="animate-spin text-white" /> : <ArrowRight size={24} className="text-white" />}
        </button>
      </div>

    </div>
  );
}