import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * UI COMPONENT: SYSTEM CARD
 * The foundational detached card. Enforces the strict 32px border-radius,
 * edge-to-edge padding, and precise drop shadows seen across the design system.
 * STRICT FIX: Uses forwardRef to support Framer Motion AnimatePresence exit animations.
 * DARK MODE: Injects dark: variant classes for global theme compliance.
 */
const SystemCard = forwardRef(({ 
  children, 
  variant = 'white', // 'white' | 'black' | 'outline' | 'blue'
  className = '', 
  onClick,
  animated = false,
  ...props
}, ref) => {
  // Changed transition-all to transition-colors for smoother dark mode switching
  const baseStyle = "rounded-[32px] p-6 transition-colors duration-300";
  
  const variants = {
    white: "bg-white dark:bg-[#1A1A1A] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 dark:border-[#333333] dark:text-white",
    black: "bg-[#111111] dark:bg-[#000000] text-white shadow-[0_15px_35px_rgba(0,0,0,0.15)] dark:border dark:border-[#333333]",
    outline: "bg-transparent border-2 border-gray-200 dark:border-[#333333] dark:text-white",
    blue: "bg-[#BCE3FF] dark:bg-[#1A365D] text-[#111111] dark:text-[#E2F1FF] border border-[#A5D5F9] dark:border-[#2A4365] shadow-[0_10px_30px_rgba(188,227,255,0.4)] dark:shadow-none"
  };

  const combinedClasses = `${baseStyle} ${variants[variant]} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`;

  if (animated || onClick) {
    return (
      <motion.div 
        ref={ref}
        layout={animated}
        initial={animated ? { opacity: 0, y: 10 } : false}
        animate={animated ? { opacity: 1, y: 0 } : false}
        exit={animated ? { opacity: 0, scale: 0.95 } : false}
        onClick={onClick}
        className={combinedClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={ref} onClick={onClick} className={combinedClasses} {...props}>
      {children}
    </div>
  );
});

// Explicitly setting displayName prevents "Anonymous" component names in React DevTools
SystemCard.displayName = 'SystemCard';

export default SystemCard;