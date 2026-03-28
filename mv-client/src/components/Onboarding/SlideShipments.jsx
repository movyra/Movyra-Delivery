import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// ONBOARDING SLIDE 2: SHIPMENTS
// Exact recreation of the "Shipments" screen with dual arrow animations.
// ============================================================================

export default function SlideShipments() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-20 px-8 text-center bg-white">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-3xl font-black text-movyra-blue mb-8 tracking-wide"
      >
        Shipments
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="text-[10px] text-gray-500 font-medium leading-relaxed px-4 mb-8"
      >
        When a shipment is on it's way, you will get a latest update in real time so you can always know where your shipment is in a glance of an eye.
      </motion.p>

      {/* Exact Vector Reconstruction: Yellow blob, Phone outline, Blue bottom section, Dual Arrows */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="relative w-64 h-64 mb-8 flex items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract Yellow Background Blob */}
          <motion.path 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 1, delay: 0.5 }}
            d="M140,110 C160,160 110,180 80,170 C40,160 10,140 30,80 C50,20 120,30 140,110 Z" 
            fill="#FEF3C7" 
          />
          
          {/* Mobile Phone Outline */}
          <rect x="65" y="30" width="70" height="130" rx="16" fill="white" stroke="#1E6AF5" strokeWidth="2.5" />
          
          {/* Internal Wireframe Elements */}
          <rect x="75" y="45" width="50" height="25" rx="6" fill="#EBF2FF" />
          <rect x="75" y="80" width="50" height="25" rx="6" fill="#EBF2FF" />
          <rect x="75" y="115" width="50" height="25" rx="6" fill="#1E6AF5" />
          
          {/* Animated Curved Arrow Pointing In */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeInOut" }}
            d="M40,30 C60,30 55,60 70,57" 
            fill="none" 
            stroke="#1E6AF5" 
            strokeWidth="1.5" 
          />
          <motion.polygon 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.4 }}
            points="70,57 62,54 64,62" 
            fill="#1E6AF5" 
          />

          {/* Animated Curved Arrow Pointing Out */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeInOut" }}
            d="M125,127 C155,127 160,160 140,190" 
            fill="none" 
            stroke="#1E6AF5" 
            strokeWidth="1.5" 
          />
          <motion.polygon 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.6 }}
            points="140,190 142,182 148,188" 
            fill="#1E6AF5" 
          />
        </svg>
      </motion.div>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="text-[10px] text-gray-400 font-medium leading-relaxed px-6"
      >
        By clicking on the card you get an overview of all of the shipments you've created or create new ones.
      </motion.p>
    </div>
  );
}