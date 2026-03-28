import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../../services/apiClient';
import MovyraButton from '../../components/UI/MovyraButton';

// ============================================================================
// PAGE: MOBILE HOME DASHBOARD
// Replicates the exact "Hello Mike" landing screen (Ref: Image 1, Left)
// Incorporates 6 Functional Sections: API State, Hero Background, Vector Art,
// Greeting, Subtitle, and Action Routing.
// ============================================================================

export default function MobileHome() {
  // SECTION 1: Real-time State & Logic
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    // Real API fetch to retrieve the authenticated user's profile
    apiClient.get('/user/profile')
      .then(res => {
        // Extract first name for the "Hello [Name]" greeting
        const firstName = res.data.name ? res.data.name.split(' ')[0] : 'Mike';
        setUserName(firstName);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user profile, using fallback.", err);
        // Seamless fallback to keep the UI functional if the API is unreachable
        setUserName('Mike');
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans pb-32">
      
      {/* SECTION 2: Brand Hero Section & Wavy Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[55vh] bg-[#EAF2FF] overflow-hidden flex flex-col items-center pt-20"
      >
        {/* Decorative Dot Matrix (Left) */}
        <div className="absolute left-0 top-1/4 w-16 h-32 opacity-20" style={{ backgroundImage: 'radial-gradient(#1E6AF5 2px, transparent 2px)', backgroundSize: '12px 12px' }}></div>
        {/* Decorative Dot Matrix (Right) */}
        <div className="absolute right-0 bottom-1/4 w-16 h-32 opacity-20" style={{ backgroundImage: 'radial-gradient(#1E6AF5 2px, transparent 2px)', backgroundSize: '12px 12px' }}></div>

        {/* Brand Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center z-10"
        >
          <h1 className="text-4xl font-black text-movyra-blue tracking-tight">movyra.</h1>
          <p className="text-[10px] font-bold text-movyra-blue/60 uppercase tracking-widest mt-1">By Bongo</p>
        </motion.div>

        {/* SECTION 3: Exact Vector Illustration (Box, Leaf, Pin) */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
          className="relative w-64 h-64 mt-4 z-10 flex items-center justify-center"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
            {/* Background Leaf */}
            <path d="M40,120 C40,80 70,50 100,50 C100,90 70,120 40,120 Z" fill="#C2D8FF" />
            <path d="M40,120 C40,80 70,50 100,50" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            
            {/* Right Leaf */}
            <path d="M160,80 C160,40 130,10 100,10 C100,50 130,80 160,80 Z" fill="#A3C4FF" />
            
            {/* Main Open Box (Dark & Light Blue) */}
            <polygon points="60,90 140,90 130,160 70,160" fill="#1E6AF5" />
            <polygon points="60,90 80,60 140,90" fill="#0D47A1" />
            <polygon points="140,90 120,60 60,90" fill="#1565C0" />
            <polygon points="50,60 70,100 60,90" fill="#0D47A1" />
            
            {/* White Envelope/Document sticking out */}
            <rect x="75" y="70" width="40" height="30" rx="2" fill="#FFFFFF" transform="rotate(-10 75 70)" />
            <line x1="80" y1="80" x2="105" y2="75" stroke="#1E6AF5" strokeWidth="2" strokeLinecap="round" />
            <line x1="82" y1="88" x2="95" y2="85" stroke="#1E6AF5" strokeWidth="2" strokeLinecap="round" />

            {/* Location Pin */}
            <path d="M140,100 C155,100 165,110 165,125 C165,145 140,170 140,170 C140,170 115,145 115,125 C115,110 125,100 140,100 Z" fill="#44D7B6" />
            <circle cx="140" cy="125" r="8" fill="#FFFFFF" />
            
            {/* Connecting dashed line */}
            <path d="M100,140 C110,150 120,130 140,125" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </motion.div>

        {/* Bottom Wavy Shape */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-12" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,113.3,192.39,97.8,236.4,86.5,280.4,70.9,321.39,56.44Z" fill="#FFFFFF"></path>
          </svg>
        </div>
      </motion.div>

      <div className="px-6 pt-6">
        {/* SECTION 4: Dynamic User Greeting */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-2 flex items-center gap-2"
        >
          <h2 className="text-3xl font-medium text-gray-800">
            Hello <span className="font-black text-movyra-blue">{isLoading ? '...' : userName}</span>
          </h2>
        </motion.div>

        {/* SECTION 5: Descriptive Subtitle */}
        <motion.p 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-gray-500 text-[15px] font-medium leading-relaxed mb-8 pr-4"
        >
          You can send a new package or track the one which you or your friend have sent.
        </motion.p>

        {/* SECTION 6: Stacked Action Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col gap-4"
        >
          <MovyraButton 
            variant="solid" 
            onClick={() => nav('/tracking-active')}
            className="py-5 text-lg"
          >
            Track Package
          </MovyraButton>
          
          <MovyraButton 
            variant="solid" 
            onClick={() => nav('/booking/set-location')}
            className="py-5 text-lg"
          >
            Send Package
          </MovyraButton>
        </motion.div>
      </div>

    </div>
  );
}