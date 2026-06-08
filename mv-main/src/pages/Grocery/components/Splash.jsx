import React from 'react';
import { motion } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: GROCERY SPLASH SCREEN (mv-main)
 * Purpose: Initial load masking and brand reinforcement.
 * Behavior: Synchronized to unmount after exactly 2.5s via parent Orchestrator.
 * ============================================================================
 */

export default function Splash() {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#000000] text-white overflow-hidden">
      
      {/* Background Ambient Glow (Movyra Accent) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] bg-[#00ff88] rounded-full blur-[150px] opacity-10 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center z-10"
      >
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="/logo.png" 
            alt="Movyra" 
            className="h-12 w-auto" 
            onError={(e) => e.target.style.display = 'none'} 
          />
          <span className="font-black text-[2.5rem] tracking-tighter ml-[-8px]">ovyra</span>
        </div>

        {/* Module Sub-brand */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-[#00ff88] font-mono text-[0.8rem] tracking-[0.3em] uppercase font-bold mb-16"
        >
          Grocery & Daily Needs
        </motion.div>

        {/* Precision Progress Bar (Matches 2.5s Orchestrator Timer) */}
        <div className="w-[240px] h-[2px] bg-[#222222] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.3, ease: "easeInOut" }}
            className="h-full bg-white"
          />
        </div>
        
        {/* Loading Meta Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 text-[#444444] font-mono text-[0.65rem] uppercase tracking-widest"
        >
          Loading...
        </motion.div>

      </motion.div>
    </div>
  );
}