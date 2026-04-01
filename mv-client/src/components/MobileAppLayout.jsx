import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * COMPONENT: MOBILE APP LAYOUT (PREMIUM IMMERSIVE UI)
 * Acts as the master wrapper for all protected routes.
 * CRITICAL: Eradicated legacy headers and padding constraints to allow 
 * true 100vh immersive Leaflet maps and edge-to-edge floating cards.
 */

export default function MobileAppLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#F2F4F7] text-[#111111] font-sans relative overflow-hidden">
      {/* CRITICAL FIX: 
        - Removed legacy hardcoded <header> to enforce per-page native navigation.
        - Removed pb-[100px] bottom padding to allow edge-to-edge map rendering.
        - Framer Motion AnimatePresence manages smooth transitions without horizontal scrolling.
      */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 w-full h-full relative z-0 overflow-y-auto no-scrollbar"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}