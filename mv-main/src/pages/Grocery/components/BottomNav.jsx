import React from 'react';
import { motion } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: GROCERY BOTTOM NAVIGATION (mv-main)
 * Purpose: Global tab bar for switching between Home, Cart, and Profile roots.
 * Behavior: Fixed to bottom. Intelligently maps sub-views to root active states.
 * ============================================================================
 */

export default function BottomNav({ currentView, onViewChange }) {
  
  // Deterministic mapping of sub-views to root navigation tabs
  const getActiveTab = () => {
    if (['cart', 'checkout', 'payment', 'order'].includes(currentView)) return 'cart';
    if (['profile'].includes(currentView)) return 'profile';
    return 'home'; // Default catches 'home', 'store', 'product'
  };

  const activeTab = getActiveTab();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (isActive) => (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: (isActive) => (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (isActive) => (
        <svg viewBox="0 0 24 24" width="24" height="24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-t border-[#111111] z-[100] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[600px] mx-auto flex items-center justify-around h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="relative flex flex-col items-center justify-center w-[80px] h-full"
            >
              {/* Animated Background Indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-[#00ff88]/10 rounded-2xl my-2"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-[#00ff88]' : 'text-[#666666]'}`}>
                {item.icon(isActive)}
              </div>
              
              <span className={`relative z-10 text-[0.65rem] font-bold tracking-wide mt-1 transition-colors duration-300 ${isActive ? 'text-[#00ff88]' : 'text-[#666666]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}