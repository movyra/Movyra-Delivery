import React from 'react';
import { motion } from 'framer-motion';

/**
 * UI COMPONENT: SYSTEM TOGGLE
 * Segmented pill switcher with animated solid black active background.
 * Perfectly matches the Price/Distance/Best Deal toggle from the analytics reference.
 */
export default function SystemToggle({ tabs, activeTab, onTabChange, className = '' }) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className={`bg-white p-1.5 rounded-full flex shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 relative ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex-1 py-3 px-4 rounded-full text-[14px] font-bold outline-none transition-colors duration-300 z-10 flex items-center justify-center gap-2"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="system-toggle-active"
                className="absolute inset-0 bg-[#111111] rounded-full z-[-1] shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            
            {tab.icon && (
              <span className={isActive ? 'text-white' : 'text-gray-400'}>
                {tab.icon}
              </span>
            )}
            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-500 hover:text-[#111111]'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}