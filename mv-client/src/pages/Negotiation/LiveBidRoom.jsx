import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, ShieldAlert, ArrowLeft, Clock, 
  Star, DollarSign, Activity, CheckCircle, 
  X, MessageSquare, ShieldCheck, Zap
} from 'lucide-react';

// Real Super-App Context Integrations
import { useNegotiationContext } from '../../contexts/NegotiationContext';
import { useSafetyContext } from '../../contexts/SafetyContext';
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';

/**
 * ============================================================================
 * MODULE: LIVE BID ROOM (NEGOTIATION ENGINE UI)
 * 11 Real Features: Live Socket Hook, Radar Pulse, Dynamic Array Sorting, 
 * Inline Counter-Offers, Deal-Locking Overlay, Auto-Rejection Visualizer, 
 * Hardware SOS, Verified Badges, Negotiation Timer, Driver Count HUD.
 * ============================================================================
 */

export default function LiveBidRoom() {
  const navigate = useNavigate();
  const { language } = usePreferencesStore();
  
  // REAL TIME ARCHITECTURE HOOKS
  const { triggerSilentSOS } = useSafetyContext();
  const { 
    isConnected, bids, maxAcceptablePrice, activeRequestId,
    acceptBid, sendCounterOffer, isDealLocked, terminateNegotiation,
    connectedDriversCount
  } = useNegotiationContext();

  // LOCAL UI STATES
  const [sortBy, setSortBy] = useState('price_asc'); // 'price_asc' | 'eta_asc' | 'rating_desc'
  const [counterOfferTarget, setCounterOfferTarget] = useState(null); // driverId
  const [counterPrice, setCounterPrice] = useState('');
  const [negotiationTimeElapsed, setNegotiationTimeElapsed] = useState(0);

  // ======================================================================
  // LOGIC 1: Live Negotiation Timer
  // ======================================================================
  useEffect(() => {
    if (activeRequestId && !isDealLocked) {
      const timer = setInterval(() => {
        setNegotiationTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeRequestId, isDealLocked]);

  // ======================================================================
  // LOGIC 2: Dynamic Live Array Sorting
  // ======================================================================
  const sortedBids = [...bids].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'eta_asc') return a.eta - b.eta;
    if (sortBy === 'rating_desc') return b.trustScore - a.trustScore;
    return 0;
  });

  // ======================================================================
  // LOGIC 3: Form Handlers (Zero Mock Data)
  // ======================================================================
  const handleCancelNegotiation = () => {
    terminateNegotiation();
    navigate(-1); // Go back to the module they came from
  };

  const executeCounterOffer = (e, driverId) => {
    e.preventDefault();
    if (!counterPrice || isNaN(counterPrice)) return;
    sendCounterOffer(driverId, parseFloat(counterPrice));
    setCounterOfferTarget(null);
    setCounterPrice('');
  };

  const handleGoToTracking = () => {
    // In production, activeRequestId binds to tracking ID
    navigate('/tracking-active'); 
  };

  // Fallback UI if accessed directly without triggering a broadcast
  if (!activeRequestId && !isDealLocked) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#000000] flex flex-col items-center justify-center p-6 text-center">
        <Activity size={48} className="text-gray-400 mb-4" />
        <h2 className="text-[20px] font-black tracking-tight mb-2">No Active Negotiation</h2>
        <p className="text-[14px] font-bold text-gray-500 mb-6">Return to a service module to request a partner.</p>
        <button onClick={() => navigate('/dashboard-home')} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-black">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#000000] text-black dark:text-white font-sans relative overflow-x-hidden">
      
      {/* ================================================================ */}
      {/* HEADER & GLOBAL SAFETY/SOCKET STATE */}
      {/* ================================================================ */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md px-5 py-4 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={handleCancelNegotiation} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-[18px] font-black tracking-tight flex items-center gap-2">
              <Zap className="text-blue-600" fill="currentColor" size={18} />
              {t('Live Negotiation', language)}
            </h1>
            <p className="text-[11px] font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              {isConnected ? 'Socket Tuned' : 'Reconnecting...'} • {negotiationTimeElapsed}s
            </p>
          </div>
        </div>
        <button onClick={triggerSilentSOS} className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center active:scale-95">
          <ShieldAlert size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* ================================================================ */}
      {/* DEAL LOCKED OVERLAY (Absolute Takeover) */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isDealLocked && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-[100] bg-green-600 text-white flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }} className="mb-6">
              <CheckCircle size={100} strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-[32px] font-black tracking-tighter mb-2">Deal Locked!</h1>
            <p className="text-[16px] font-bold opacity-90 mb-10 max-w-[280px]">
              The smart contract has been executed. Your partner is on the way.
            </p>
            <button 
              onClick={handleGoToTracking}
              className="w-full max-w-[300px] bg-white text-green-700 py-4 rounded-full text-[18px] font-black active:scale-95 transition-transform shadow-2xl"
            >
              Track Partner Live
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-5 pt-6 pb-32 space-y-6">
        
        {/* ================================================================ */}
        {/* RADAR PULSE & HUD */}
        {/* ================================================================ */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-900 text-center relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-20 pointer-events-none">
             <div className="w-32 h-32 bg-blue-500 rounded-full animate-ping" />
          </div>
          <div className="relative z-10">
            <h2 className="text-[28px] font-black tracking-tighter mb-1">
              {bids.length} {bids.length === 1 ? 'Offer' : 'Offers'} Received
            </h2>
            <p className="text-[13px] font-bold text-gray-500">
              Broadcasting to {connectedDriversCount} partners in your radius
            </p>
            {maxAcceptablePrice && (
              <div className="mt-4 inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-[12px] font-black border border-blue-100 dark:border-blue-800">
                Auto-rejecting bids above ₹{maxAcceptablePrice}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* SORTING CONTROLS */}
        {/* ================================================================ */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'price_asc', label: 'Lowest Price', icon: DollarSign },
            { id: 'eta_asc', label: 'Fastest ETA', icon: Clock },
            { id: 'rating_desc', label: 'Highest Trust', icon: Star }
          ].map(sort => {
            const Icon = sort.icon;
            const isActive = sortBy === sort.id;
            return (
              <button 
                key={sort.id} onClick={() => setSortBy(sort.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-black transition-colors ${
                  isActive ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 text-gray-500'
                }`}
              >
                <Icon size={14} strokeWidth={isActive ? 3 : 2} /> {sort.label}
              </button>
            )
          })}
        </div>

        {/* ================================================================ */}
        {/* LIVE BID FEED */}
        {/* ================================================================ */}
        <div className="space-y-4">
          <AnimatePresence>
            {sortedBids.map((bid) => (
              <motion.div 
                key={bid.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#111111] p-5 rounded-[20px] shadow-sm border border-gray-100 dark:border-gray-900 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-[18px] font-black flex items-center gap-2">
                      {bid.driverName || 'Verified Partner'}
                      {(bid.trustScore >= 4.8 || bid.isVerified) && <ShieldCheck size={16} className="text-blue-500" />}
                    </h3>
                    <p className="text-[13px] font-bold text-gray-500 mt-0.5">{bid.vehicleType || 'Standard Vehicle'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[24px] font-black tracking-tighter">₹{bid.price}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <span className="bg-gray-100 dark:bg-[#1A1A1A] px-3 py-1.5 rounded-lg text-[13px] font-black flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-500" /> {bid.eta} min away
                  </span>
                  <span className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 px-3 py-1.5 rounded-lg text-[13px] font-black flex items-center gap-1.5">
                    <Star size={14} fill="currentColor" /> {bid.trustScore}
                  </span>
                </div>

                {/* Inline Counter Offer Engine */}
                <AnimatePresence>
                  {counterOfferTarget === bid.driverId ? (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      onSubmit={(e) => executeCounterOffer(e, bid.driverId)}
                      className="flex gap-2 mb-4 overflow-hidden"
                    >
                      <input 
                        type="number" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)}
                        placeholder="Your offer (₹)" autoFocus
                        className="flex-1 bg-[#EEEEEE] dark:bg-[#1A1A1A] rounded-xl px-4 text-[14px] font-bold outline-none"
                      />
                      <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-[13px] font-black">
                        Send
                      </button>
                      <button type="button" onClick={() => setCounterOfferTarget(null)} className="bg-red-100 text-red-600 px-3 rounded-xl flex items-center justify-center">
                        <X size={18} />
                      </button>
                    </motion.form>
                  ) : null}
                </AnimatePresence>

                <div className="flex gap-2">
                  <button 
                    onClick={() => acceptBid(bid.id)}
                    className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl text-[15px] font-black active:scale-95 transition-transform"
                  >
                    Accept Deal
                  </button>
                  <button 
                    onClick={() => setCounterOfferTarget(bid.driverId)}
                    className="flex-1 bg-gray-100 dark:bg-[#1A1A1A] text-black dark:text-white py-3.5 rounded-xl text-[15px] font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <MessageSquare size={16} /> Counter
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {bids.length === 0 && (
            <div className="text-center py-12">
               <div className="w-10 h-10 border-4 border-gray-300 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
               <p className="text-[15px] font-bold text-gray-500">Awaiting local partners...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}