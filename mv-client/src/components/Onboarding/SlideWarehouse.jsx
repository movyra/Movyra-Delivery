import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// ONBOARDING SLIDE 1: WAREHOUSE
// Exact recreation of the "Warehouse" screen with SVG path animations.
// ============================================================================

export default function SlideWarehouse() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-20 px-8 text-center bg-white">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-3xl font-black text-movyra-blue mb-16 tracking-wide"
      >
        Warehouse
      </motion.h1>
      
      {/* Exact Vector Reconstruction: Yellow blob, Phone outline, Blue top section, Arrow */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="relative w-64 h-64 mb-16 flex items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract Yellow Background Blob */}
          <motion.path 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 1, delay: 0.4 }}
            d="M50,90 C30,140 70,170 100,160 C140,150 170,130 150,70 C130,10 70,20 50,90 Z" 
            fill="#FEF3C7" 
          />
          
          {/* Mobile Phone Outline */}
          <rect x="65" y="30" width="70" height="130" rx="16" fill="white" stroke="#1E6AF5" strokeWidth="2.5" />
          
          {/* Internal Wireframe Elements */}
          <rect x="75" y="45" width="50" height="25" rx="6" fill="#1E6AF5" />
          <rect x="75" y="80" width="50" height="25" rx="6" fill="#EBF2FF" />
          <rect x="75" y="115" width="50" height="25" rx="6" fill="#EBF2FF" />
          
          {/* Animated Curved Arrow Pointing Out */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
            d="M75,57 C30,57 20,120 40,160" 
            fill="none" 
            stroke="#1E6AF5" 
            strokeWidth="1.5" 
          />
          <motion.polygon 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.3 }}
            points="40,160 34,154 44,152" 
            fill="#1E6AF5" 
          />
        </svg>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="text-xs text-gray-500 font-medium leading-relaxed px-4"
      >
        Select the warehouse where you want your packages stored before shipping them to your address. You can view all WH details here.
      </motion.p>
    </div>
  );
}