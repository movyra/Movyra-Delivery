import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// COMPONENT: SHIPMENT TABS (MOVYRA LIGHT THEME)
// A horizontally scrollable tab interface featuring 6 functional sections:
// Props/Data Engine, Scroll Management, Container Layout, Animation Wrapping,
// Active Accent (Orange/Yellow), and Contextual Typography.
// ============================================================================

// Standardized tabs matching the exact design requirement
const DEFAULT_TABS = ['All', 'Preparing', 'Pending', 'On its way'];

export default function ShipmentTabs({ 
  tabs = DEFAULT_TABS, 
  activeTab = 'All', 
  onTabChange,
  counts = {} // Optional data payload for item counts (e.g., { 'All': 12 })
}) {
  // SECTION 1: Scroll Management & DOM Referencing
  const scrollContainerRef = useRef(null);

  // SECTION 2: Interactive Logic Engine
  const handleTabClick = (tab, event) => {
    if (onTabChange) onTabChange(tab);
    
    // Smoothly center the clicked tab within the scrollable container
    if (event.currentTarget) {
      event.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  // SECTION 3: Edge Fade Effect & Layout Mount
  // Ensures the container starts at the correct scroll position
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Small logic to ensure the first render doesn't snap awkwardly
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, []);

  return (
    // SECTION 4: Scrollable Container Wrapper
    // Hides the native scrollbar while keeping horizontal touch-scrolling active
    <div className="w-full relative mb-6">
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto px-6 pb-2 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
      >
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab;

          return (
            <motion.button
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
              onClick={(e) => handleTabClick(tab, e)}
              className={`relative flex items-center justify-center px-5 py-2.5 rounded-full whitespace-nowrap transition-colors duration-300 z-10 snap-center outline-none select-none ${
                isActive 
                  ? 'text-amber-950 font-black' 
                  : 'text-gray-500 font-bold hover:text-gray-800 bg-white border border-gray-100 shadow-sm'
              }`}
            >
              {/* SECTION 5: Active Accent Animation (Orange/Yellow) */}
              {/* Uses Framer Motion layoutId to fluidly move the background pill between tabs */}
              {isActive && (
                <motion.div
                  layoutId="activeShipmentTabAccent"
                  className="absolute inset-0 bg-amber-400 rounded-full shadow-md shadow-amber-400/20 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* SECTION 6: Typography & Optional Payload (Counts) */}
              <span className="relative z-10 tracking-wide">{tab}</span>
              
              {/* Renders a small contextual badge if data is passed via the 'counts' prop */}
              {counts[tab] !== undefined && (
                <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-md font-black ${
                  isActive ? 'bg-amber-950/15 text-amber-950' : 'bg-gray-100 text-gray-400'
                }`}>
                  {counts[tab]}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}