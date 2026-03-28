import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Box, Ticket, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================================
// COMPONENT: BOTTOM NAV BAR (MOVYRA LIGHT THEME)
// Replicates the persistent blue bottom dock with 4 functional sections:
// Route Matching, Spring Animations, Layout Injection, and Dynamic States.
// ============================================================================

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // SECTION 1: Tab Configuration Engine
  // Defines the 4 required core routes and their corresponding icons
  const tabs = [
    { id: 'home', path: '/dashboard-home', icon: Home, label: 'Home' },
    { id: 'tracking', path: '/tracking-active', icon: Box, label: 'Track' },
    { id: 'history', path: '/order-history', icon: Ticket, label: 'History' },
    { id: 'profile', path: '/profile-settings', icon: Settings, label: 'Profile' }
  ];

  // SECTION 2: Active Route Matching Logic
  // Dynamically determines if a tab is active based on the current URL
  const isActive = (path) => {
    // Special case fallback for the root directory matching dashboard
    if (path === '/dashboard-home' && location.pathname === '/') return true;
    return location.pathname.includes(path);
  };

  return (
    // SECTION 3: Persistent Bottom Dock Layout
    // Matches the rounded, floating white dock aesthetic with safe-area padding
    <div className="fixed bottom-0 left-0 right-0 bg-white pb-safe pt-2 px-8 flex justify-between items-center z-50 rounded-t-[32px] border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] h-24">
      
      {/* SECTION 4: Dynamic Tab Mapping & Animations */}
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        const Icon = tab.icon;

        return (
          <button 
            key={tab.id} 
            onClick={() => navigate(tab.path)} 
            className="relative flex flex-col items-center justify-center w-16 h-full select-none focus:outline-none"
            aria-label={tab.label}
          >
            {/* Animated Icon Container (Spring Physics) */}
            <motion.div
              initial={false}
              animate={{ 
                y: active ? -6 : 0,
                scale: active ? 1.1 : 1,
                color: active ? '#1E6AF5' : '#9CA3AF' // movyra-blue vs gray-400
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative z-10 p-2 rounded-2xl flex items-center justify-center"
            >
              <Icon size={26} strokeWidth={active ? 2.5 : 2} />
              
              {/* Subtle Blue Highlight Bubble (Only visible when active) */}
              {active && (
                <motion.div 
                  layoutId="nav-bubble"
                  className="absolute inset-0 bg-blue-50 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </motion.div>

            {/* Animated Bottom Dot Indicator */}
            <motion.div
              initial={false}
              animate={{ 
                scale: active ? 1 : 0,
                opacity: active ? 1 : 0,
                y: active ? -4 : 10
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-movyra-blue"
            />
          </button>
        );
      })}
    </div>
  );
}