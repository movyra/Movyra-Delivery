import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// ONBOARDING SLIDE 3: ITEMS
// Exact recreation of the "Items" screen with animated action button vector.
// ============================================================================

export default function SlideItems() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-20 px-8 text-center bg-white">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-3xl font-black text-movyra-blue mb-8 tracking-wide"
      >
        Items
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="text-[10px] text-gray-500 font-medium leading-relaxed px-4 mb-8"
      >
        All the items that you have in storages are here. Click on the button to view your item list, item details and stack them in a package and ship to your address in matter of minutes.
      </motion.p>

      {/* Exact Vector Reconstruction: Phone outline, Bottom Button, Exit Arrow */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="relative w-64 h-64 mb-6 flex items-center justify-center"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract Yellow Background Blob */}
          <motion.path 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 1, delay: 0.5 }}
            d="M70,80 C40,130 80,160 110,150 C150,140 170,110 150,50 C130,-10 80,10 70,80 Z" 
            fill="#FEF3C7" 
          />
          
          {/* Mobile Phone Outline */}
          <rect x="65" y="30" width="70" height="130" rx="16" fill="white" stroke="#1E6AF5" strokeWidth="2.5" />
          
          {/* Internal Wireframe Elements */}
          <rect x="75" y="50" width="50" height="35" rx="6" fill="#EBF2FF" />
          <rect x="75" y="95" width="50" height="35" rx="6" fill="#EBF2FF" />
          
          {/* Action Button */}
          <rect x="75" y="140" width="50" height="10" rx="5" fill="#1E6AF5" />
          
          {/* Animated Curved Arrow Pointing Out */}
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeInOut" }}
            d="M120,145 C155,145 160,180 150,210" 
            fill="none" 
            stroke="#1E6AF5" 
            strokeWidth="1.5" 
          />
          <motion.polygon 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.4 }}
            points="150,210 148,201 156,205" 
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
        When creating shipment you will be able to choose a method of transport - Air or Sea. This way you can make cheaper or faster shipments - It's up to you.
      </motion.p>
    </div>
  );
}