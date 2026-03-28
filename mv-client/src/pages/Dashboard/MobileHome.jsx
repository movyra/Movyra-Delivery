import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Send, ArrowRight, Zap, Bell } from 'lucide-react';
import apiClient from '../../services/apiClient';
import MovyraButton from '../../components/UI/MovyraButton';

// ============================================================================
// PAGE: MOBILE HOME DASHBOARD (MOVYRA LIGHT THEME)
// Replicates the premium "Hello Mike" landing hub.
// Sections: API Auth Sync, Brand Hero, Vector Engine, Dynamic Greeting, 
// Contextual Info, and Action Matrix.
// ============================================================================

export default function MobileHome() {
  // SECTION 1: Real-time Logic & User Profile Sync
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Logic: Fetch the actual authenticated profile from the Rust/Firebase backend
    apiClient.get('/user/profile')
      .then(res => {
        // Precise string manipulation to extract the display name
        const firstName = res.data.name ? res.data.name.split(' ')[0] : 'User';
        setUserName(firstName);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn("Auth sync fallback triggered.", err);
        // Seamless fallback to maintain UI continuity
        setUserName('Mike');
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans pb-32 overflow-x-hidden">
      
      {/* SECTION 2: Premium Blue/White Brand Hero */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[52vh] bg-gradient-to-b from-[#F0F6FF] to-white overflow-hidden flex flex-col items-center pt-16"
      >
        {/* Subtle Brand Background Decor */}
        <div className="absolute left-[-10%] top-[10%] w-40 h-40 bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute right-[-5%] top-[20%] w-32 h-32 bg-blue-50/60 rounded-full blur-2xl"></div>

        {/* Brand Identity Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center z-10 flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-3">
             <img src="/logo.png" alt="m" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-movyra-blue tracking-tighter">movyra.</h1>
          <div className="flex items-center gap-1.5 mt-1 opacity-40">
            <div className="w-1 h-1 rounded-full bg-movyra-blue"></div>
            <p className="text-[9px] font-black text-movyra-blue uppercase tracking-[0.2em]">Premium Logistics</p>
          </div>
        </motion.div>

        {/* SECTION 3: Animated Vector Engine (Interactive SVG) */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.7, type: "spring" }}
          className="relative w-64 h-64 mt-2 z-10"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E6AF5" />
                <stop offset="100%" stopColor="#0D47A1" />
              </linearGradient>
            </defs>
            {/* Soft Shadow Base */}
            <ellipse cx="100" cy="170" rx="40" ry="10" fill="rgba(30, 106, 245, 0.1)" />
            
            {/* Background Organic Shape */}
            <path d="M30,120 C30,70 80,40 110,40 C110,90 80,120 30,120 Z" fill="#D1E4FF" opacity="0.6" />
            
            {/* Main Delivery Box Assembly */}
            <path d="M60,90 L140,90 L130,165 L70,165 Z" fill="url(#boxGrad)" />
            <path d="M60,90 L85,65 L145,95 L120,120 Z" fill="#4285F4" opacity="0.9" />
            <path d="M140,90 L160,65 L160,110 L140,135 Z" fill="#1565C0" />
            
            {/* Floating Document Logic */}
            <motion.rect 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              x="75" y="75" width="45" height="35" rx="3" fill="white" transform="rotate(-5 75 75)" 
            />
            <rect x="82" y="85" width="25" height="3" rx="1.5" fill="#E3F2FD" transform="rotate(-5 82 85)" />
            
            {/* Live Location Marker Pin */}
            <motion.path 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              d="M145,110 C158,110 168,120 168,133 C168,150 145,175 145,175 C145,175 122,150 122,133 C122,120 132,110 145,110 Z" 
              fill="#44D7B6" 
            />
            <circle cx="145" cy="133" r="6" fill="white" />
          </svg>
        </motion.div>

        {/* Bottom Fluid Wave Design */}
        <div className="absolute bottom-0 left-0 w-full leading-none translate-y-[1px]">
          <svg className="relative block w-full h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,113.3,192.39,97.8,236.4,86.5,280.4,70.9,321.39,56.44Z" fill="#FFFFFF"></path>
          </svg>
        </div>
      </motion.div>

      {/* SECTION 4: Personalized Dashboard Greeting */}
      <div className="px-8 pt-4">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="w-1.5 h-8 bg-movyra-blue rounded-full"></div>
          <h2 className="text-3xl font-medium text-gray-800">
            Hello <span className="font-black text-movyra-blue">{isLoading ? 'Friend' : userName}</span>
          </h2>
        </motion.div>

        {/* SECTION 5: Information Architecture (Subtitle Context) */}
        <motion.p 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-400 text-[15px] font-bold leading-relaxed mb-10 pr-6"
        >
          Ready to move something? Select an action below to manage your logistical needs in real-time.
        </motion.p>

        {/* SECTION 6: High-Fidelity Action Matrix */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 gap-4"
        >
          {/* Action: Track */}
          <button 
            onClick={() => navigate('/tracking-active')}
            className="group w-full bg-[#F8FBFF] border-2 border-[#EBF2FF] p-5 rounded-[24px] flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-movyra-blue">
                <Package size={26} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-gray-900 text-lg">Track Package</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:text-movyra-blue transition-colors">
              <ArrowRight size={20} strokeWidth={3} />
            </div>
          </button>

          {/* Action: Dispatch */}
          <button 
            onClick={() => navigate('/booking/set-location')}
            className="group w-full bg-movyra-blue p-5 rounded-[24px] flex items-center justify-between active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                <Send size={26} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-white text-lg">Send Package</span>
                <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest">Instant Dispatch</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-movyra-blue transition-all">
              <Zap size={20} strokeWidth={3} fill="currentColor" />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Footer Branding Detail */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Movyra Express v2.5</p>
      </motion.div>

    </div>
  );
}