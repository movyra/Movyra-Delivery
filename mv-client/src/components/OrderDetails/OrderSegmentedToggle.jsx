import React from 'react';
import { motion } from 'framer-motion';

/**
 * UI COMPONENT: SEGMENTED TOGGLE PILLS
 * Replicates the black/grey pill toggles (Price, Distance, Best Deal).
 * Uses Framer Motion's layoutId for the fluid sliding active background effect.
 * Purely functional: accepts a dynamic array of tabs and an active state via props.
 */
export default function OrderSegmentedToggle({ tabs, activeTab, onTabChange }) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="flex items-center justify-between bg-white rounded-full p-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex-1 py-3 px-4 rounded-full text-[14px] font-bold outline-none transition-colors duration-300 z-10"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill-background"
                className="absolute inset-0 bg-[#111111] rounded-full z-[-1]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-500 hover:text-black'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}