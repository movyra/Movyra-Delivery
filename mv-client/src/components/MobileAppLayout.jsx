import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

// ============================================================================
// COMPONENT: MOBILE APP LAYOUT (STARK MINIMALIST UI)
// Acts as the master wrapper for all protected routes.
// CRITICAL: Uses <Outlet /> to seamlessly inject matched child routes.
// Note: Global Auth routing and Bottom Navigation are handled centrally in App.jsx.
// ============================================================================

export default function MobileAppLayout({ title = "Movyra" }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col min-h-screen bg-white text-black font-sans relative w-full overflow-hidden"
    >
      {/* Stark Minimalist Top Header with Custom SVG Logo */}
      <header className="pt-12 pb-4 px-6 bg-white flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Custom Scalable Brand Logo */}
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white p-1.5 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h1 className="text-xl font-black text-black tracking-tight">{title}</h1>
        </div>

        {/* Profile / Context Indicator */}
        <div className="w-9 h-9 rounded-full bg-[#F6F6F6] flex items-center justify-center border border-gray-100 cursor-pointer active:scale-95 transition-transform">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </header>
      
      {/* CRITICAL FIX: <Outlet /> injects the matched child routes here (MobileHome, etc.)
        Without this, the screen remains a blank white void because nested routes are dropped. 
        We also include bottom padding so content isn't hidden by the global BottomNavBar.
      */}
      <main className="flex-1 w-full overflow-y-auto no-scrollbar pb-[100px] relative z-0">
        <Outlet />
      </main>
    </motion.div>
  );
}