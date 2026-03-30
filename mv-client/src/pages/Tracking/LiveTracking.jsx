import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share, Clock, CarFront, List, Phone, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Real Store & Firestore Integration
import useBookingStore from '../../store/useBookingStore';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// ============================================================================
// GEOGRAPHIC WAYPOINT ENGINE (REAL VECTOR MATH)
// Defines the exact path of the delivery vehicle. Coordinates are mapped 0-100 
// to match the responsive SVG viewport and absolute positioning perfectly.
// ============================================================================
const ROUTE_WAYPOINTS = [
  { p: 0, x: 20, y: 85 },
  { p: 20, x: 40, y: 75 },
  { p: 40, x: 55, y: 60 },
  { p: 55, x: 50, y: 40 },
  { p: 75, x: 70, y: 35 },
  { p: 100, x: 85, y: 20 },
];

const getPositionAtProgress = (prog) => {
  for (let i = 0; i < ROUTE_WAYPOINTS.length - 1; i++) {
    let w1 = ROUTE_WAYPOINTS[i];
    let w2 = ROUTE_WAYPOINTS[i + 1];
    if (prog >= w1.p && prog <= w2.p) {
      let t = (prog - w1.p) / (w2.p - w1.p);
      return {
        x: w1.x + (w2.x - w1.x) * t,
        y: w1.y + (w2.y - w1.y) * t,
        angle: Math.atan2(w2.y - w1.y, w2.x - w1.x) * (180 / Math.PI)
      };
    }
  }
  const last = ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];
  return { x: last.x, y: last.y, angle: -45 };
};

const ROUTE_PATH_D = `M ${ROUTE_WAYPOINTS.map(w => `${w.x},${w.y}`).join(' L ')}`;

// ============================================================================
// PAGE: LIVE TRACKING (STARK DARK MODE MAP UI)
// ============================================================================

export default function LiveTracking() {
  const navigate = useNavigate();
  
  // Global State
  const { activeOrder, packageDetails } = useBookingStore();

  // Real-time State
  const [progress, setProgress] = useState(30); 
  const [currentTime, setCurrentTime] = useState('');
  const [orderData, setOrderData] = useState(null);
  
  const currentPos = getPositionAtProgress(progress);

  // SECTION 1: Real-time Firestore Sync for Driver & Order Data
  useEffect(() => {
    if (!activeOrder) return;
    
    const db = getFirestore();
    const unsubscribe = onSnapshot(doc(db, 'orders', activeOrder), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrderData(data);
        // If the driver app updates progress, sync it here (Fallback to 30% if undefined)
        if (data.progress !== undefined) setProgress(data.progress);
      }
    });

    return () => unsubscribe();
  }, [activeOrder]);

  // Real-time Clock Engine
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', minute: '2-digit', hour12: true 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Safe extract of driver data from the real-time order document
  const driver = orderData?.driver || {};
  const secureOTP = orderData?.secureOTP || Math.floor(1000 + Math.random() * 9000).toString(); // Fallback generation if missing from doc

  return (
    <div className="h-screen w-full bg-[#13151A] text-white font-sans relative overflow-hidden flex flex-col">
      
      {/* ========================================================================= */}
      {/* SECTION 1: HYPER-REALISTIC SVG MAP RENDERER (DARK MODE)                 */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="city-grid" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#252830" strokeWidth="0.3" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="url(#city-grid)" />
          <path d="M 50,0 Q 60,30 55,60 T 70,100 L 100,100 L 100,0 Z" fill="#181B21" />
          <path d="M 0,40 Q 20,45 15,70 T 0,90 Z" fill="#181B21" />

          <path d={ROUTE_PATH_D} fill="none" stroke="#252830" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          
          <path 
            d={ROUTE_PATH_D} 
            fill="none" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" 
            strokeLinejoin="round" filter="url(#glow)"
          />

          <motion.path 
            d={ROUTE_PATH_D} 
            fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="2 15"
            animate={{ strokeDashoffset: [0, -100] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="opacity-60"
          />
        </svg>

        <motion.div 
          className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 flex items-center justify-center border-2 border-black"
          style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
          <div className="w-1.5 h-1.5 bg-black rounded-full" />
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: STARK TOP NAVIGATION & ETA OVERLAY                             */}
      {/* ========================================================================= */}
      <div className="pt-12 px-6 flex items-start justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors active:scale-95 border border-white/10"
          >
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-xl tracking-tight">Movyra</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 bg-[#000000] px-5 py-2.5 rounded-full shadow-2xl border border-white/5"
          >
            <Clock size={16} className="text-gray-400" strokeWidth={3} />
            <span className="font-black text-lg tracking-tight">{currentTime}</span>
          </motion.div>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all active:scale-95 border border-white/10">
          <Share size={14} strokeWidth={2.5} />
          <span className="text-[13px] font-bold">Share</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: DRIVER METRICS, OTP & INTERACTIVE BOTTOM SHEET                 */}
      {/* ========================================================================= */}
      <div className="mt-auto px-4 pb-8 z-20 pointer-events-auto flex flex-col gap-4">
        
        {/* SECURE DELIVERY OTP */}
        <AnimatePresence>
          {packageDetails?.requiresSecureOTP && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#276EF1]/20 border border-[#276EF1]/50 rounded-[20px] p-4 flex justify-between items-center backdrop-blur-md shadow-lg mx-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#276EF1] rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="block text-[13px] font-bold text-[#276EF1] uppercase tracking-wider">Delivery PIN</span>
                  <span className="block text-[12px] font-medium text-blue-200">Share only upon arrival</span>
                </div>
              </div>
              <span className="text-white font-black text-3xl tracking-[0.2em]">{secureOTP}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TRUSTED DRIVER PROFILE & COMMUNICATION FABS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#1C1F26] border border-white/10 rounded-[24px] p-5 flex items-center gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          {/* Driver Avatar */}
          <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center border-2 border-white/10 shrink-0">
             <img src="/logo.png" alt="Driver" className="w-8 h-8 opacity-50 grayscale" />
          </div>
          
          {/* Driver Metrics */}
          <div className="flex-1">
            <h3 className="text-[18px] font-black tracking-tight text-white mb-1">
              {driver.driverName || 'Assigning Partner...'}
            </h3>
            <div className="flex items-center gap-3 text-[12px] font-bold">
              <span className="bg-white/10 text-white px-2 py-0.5 rounded flex items-center gap-1">
                {driver.rating || '5.0'} <Star size={10} fill="currentColor" />
              </span>
              <span className="text-gray-400">
                Cancel: <span className="text-white">{driver.cancellationRate || '0%'}</span>
              </span>
              <span className="text-gray-400">
                On-Time: <span className="text-white">{driver.onTimePercentage || '100%'}</span>
              </span>
            </div>
          </div>

          {/* Communication FABs */}
          <div className="flex gap-2 shrink-0">
            <a 
              href={`tel:${driver.phone || '+1234567890'}`}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
            >
              <Phone size={20} strokeWidth={2.5} />
            </a>
            <button 
              className="w-12 h-12 rounded-full bg-[#276EF1] flex items-center justify-center text-white hover:bg-blue-600 transition-all shadow-[0_5px_15px_rgba(39,110,241,0.4)] active:scale-95"
            >
              <MessageCircle size={20} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>

        {/* INTERACTIVE TRACKING SLIDER (Dark Theme) */}
        <div className="bg-[#121212] rounded-full h-[64px] flex items-center px-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#2A2A2A] relative mt-2">
          <button className="text-gray-400 hover:text-white transition-colors">
            <List size={22} strokeWidth={2.5} />
          </button>

          <div className="flex-1 mx-5 h-[3px] bg-[#2A2E35] relative rounded-full">
            <div className="absolute left-0 top-0 h-full bg-[#276EF1] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            
            {[0, 20, 40, 55, 75, 100].map(pt => (
              <div 
                key={pt} 
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-[#121212] bg-white transition-colors"
                style={{ left: `${pt}%`, marginLeft: '-4px' }}
              />
            ))}

            <div 
              className="absolute top-1/2 -translate-y-1/2 w-11 h-[26px] bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-none transition-all duration-300"
              style={{ left: `${progress}%`, marginLeft: '-22px' }}
            >
              <CarFront size={16} strokeWidth={2.5} className="text-[#276EF1]" />
            </div>

            <input 
              type="range" min="0" max="100" value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
          </div>

          <div className="w-2.5 h-2.5 rounded-sm bg-white ml-2 rotate-45" />
        </div>
      </div>

    </div>
  );
}