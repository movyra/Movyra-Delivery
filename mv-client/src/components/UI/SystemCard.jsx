import React from 'react';
import { motion } from 'framer-motion';

/**
 * UI COMPONENT: SYSTEM CARD
 * The foundational detached card. Enforces the strict 32px border-radius,
 * edge-to-edge padding, and precise drop shadows seen across the design system.
 */
export default function SystemCard({ 
  children, 
  variant = 'white', // 'white' | 'black' | 'outline' | 'blue'
  className = '', 
  onClick,
  animated = false
}) {
  const baseStyle = "rounded-[32px] p-6 transition-all duration-300";
  
  const variants = {
    white: "bg-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50",
    black: "bg-[#111111] text-white shadow-[0_15px_35px_rgba(0,0,0,0.15)]",
    outline: "bg-transparent border-2 border-gray-200",
    blue: "bg-[#BCE3FF] text-[#111111] border border-[#A5D5F9] shadow-[0_10px_30px_rgba(188,227,255,0.4)]"
  };

  const combinedClasses = `${baseStyle} ${variants[variant]} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`;

  if (animated || onClick) {
    return (
      <motion.div 
        layout={animated}
        initial={animated ? { opacity: 0, y: 10 } : false}
        animate={animated ? { opacity: 1, y: 0 } : false}
        exit={animated ? { opacity: 0, scale: 0.95 } : false}
        onClick={onClick}
        className={combinedClasses}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div onClick={onClick} className={combinedClasses}>
      {children}
    </div>
  );
}