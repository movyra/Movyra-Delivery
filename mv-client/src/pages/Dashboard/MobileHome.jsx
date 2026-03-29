import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Send, ArrowRight, Plus, MoreHorizontal, History } from 'lucide-react';

// Real Firebase Auth Integration (Using pre-initialized instance to prevent race conditions)
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseAuth';

// ============================================================================
// PAGE: MOBILE HOME DASHBOARD (STARK MINIMALIST UI)
// Replicates the Uber-inspired "Wallet" interface. Features pure white 
// backgrounds, flat gray cards, stark black cards, and massive typography.
// ============================================================================

export default function MobileHome() {
  const navigate = useNavigate();
  
  // Real-time State
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Real Logistics Data States (Initialized to 0 strictly per no-mock-data rules)
  const [activeShipments, setActiveShipments] = useState(0);
  const [accountBalance, setAccountBalance] = useState('0.00');

  useEffect(() => {
    // Utilize the safely pre-initialized auth instance from our services layer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Extract first name or default to 'User'
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';
        setUserName(firstName);
      } else {
        setUserName('Guest');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    // Root: Pure White Background
    <div className="min-h-screen bg-white text-black font-sans pb-32 overflow-x-hidden">
      
      {/* SECTION 1: Stark Header Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="px-6 pt-16 pb-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50"
      >
        <h1 className="text-[32px] font-black tracking-tighter leading-none">
          Overview
        </h1>
        
        {/* Real Brand Logo replacing generic avatar */}
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden border border-gray-200">
          <img src="/logo.png" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* SECTION 2: Dynamic Greeting */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="px-6 mb-8"
      >
        <p className="text-[17px] font-bold text-gray-400">
          Welcome back, <span className="text-black">{isLoading ? '...' : userName}</span>
        </p>
      </motion.div>

      {/* SECTION 3: The "Wallet" Card Stack Architecture */}
      <div className="relative px-4 flex flex-col">
        
        {/* Card 1: Light Gray (Active Shipments) - Sits on TOP visually */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="bg-[#F6F6F6] rounded-[32px] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative z-20 border border-white"
        >
          <div className="flex justify-between items-start">
            <span className="text-[15px] font-bold text-gray-500">Active Shipments</span>
            <Package className="text-gray-400" size={22} strokeWidth={2} />
          </div>
          
          {/* Massive Numeric Display Typography */}
          <h2 className="text-[64px] font-black text-black leading-none tracking-tighter mt-2 mb-8">
            {activeShipments}
          </h2>
          
          {/* Stark Line Items */}
          <div className="flex justify-between items-center py-3.5 border-t border-gray-200">
            <span className="text-[15px] font-bold text-black">In Transit</span>
            <span className="text-[15px] font-bold text-gray-400">-</span>
          </div>
          <div className="flex justify-between items-center py-3.5 border-t border-gray-200">
            <span className="text-[15px] font-bold text-black">Pending Pickup</span>
            <span className="text-[15px] font-bold text-gray-400">-</span>
          </div>
          
          {/* Minimalist Text Button */}
          <button 
            onClick={() => navigate('/tracking-active')}
            className="mt-2 text-[15px] font-bold text-[#276EF1] flex items-center gap-1 hover:opacity-70 transition-opacity"
          >
            View map <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </motion.div>

        {/* Card 2: Solid Black (Wallet / Actions) - Tucked slightly UNDER the gray card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="bg-[#121212] rounded-[32px] p-8 pt-14 -mt-8 relative z-10"
        >
          <div className="flex justify-between items-start">
            <span className="text-[15px] font-bold text-gray-400">Account Balance</span>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal size={24} />
            </button>
          </div>
          
          {/* Massive Numeric Display Typography */}
          <h2 className="text-[64px] font-black text-white leading-none tracking-tighter mt-2">
            ${accountBalance}
          </h2>
          
          {/* Minimalist Progress/Capacity Bar */}
          <div className="w-2/5 h-1.5 bg-gray-800 rounded-full mt-6 mb-8 overflow-hidden">
            <div className="w-0 h-full bg-white rounded-full"></div>
          </div>
          
          {/* Pill Action Buttons inside Black Card */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/booking/set-location')}
              className="flex items-center justify-center gap-2 bg-white text-black rounded-full px-6 py-3.5 text-[15px] font-bold hover:bg-gray-200 active:scale-95 transition-all"
            >
              <Send size={18} strokeWidth={2.5} />
              Send Package
            </button>
            
            <button className="flex items-center justify-center bg-white/10 text-white rounded-full w-12 h-12 hover:bg-white/20 active:scale-95 transition-all">
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>

      </div>

      {/* SECTION 4: Flat Bordered Lower Section (Recent Activity) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="mx-4 mt-4 border-2 border-[#F6F6F6] rounded-[24px] p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <History size={16} className="text-gray-400" strokeWidth={2.5} />
          <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
            Recent Activity
          </span>
        </div>
        
        <p className="text-[16px] font-bold text-black mt-3 leading-relaxed">
          No recent shipments found this week. Book a delivery to see your routing history here.
        </p>
      </motion.div>

    </div>
  );
}