import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, History, User, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

// Real Auth Store & Global Prefs Integration
import useAuthStore from '../../store/useAuthStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';

// ============================================================================
// COMPONENT: BOTTOM NAV BAR (STARK MINIMALIST UI)
// Replicates the Uber-inspired ultra-flat, high-contrast bottom dock.
// Dynamically toggles Activity/Expenses routing based on B2B User Role.
// DARK MODE & i18n: Wired with Tailwind dark: variants and translation engine.
// ============================================================================

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Real Global State
  const { user } = useAuthStore();
  const { language } = usePreferencesStore();

  // Determine if the authenticated user has a Business/B2B account profile
  const isB2B = user?.isB2B === true || user?.accountType === 'business';

  // SECTION 1: Dynamic Tab Configuration Engine
  // Defines the 4 required core routes and their corresponding minimalist icons
  const tabs = [
    { id: 'home', path: '/dashboard-home', icon: Home, label: 'Home' },
    { id: 'tracking', path: '/tracking-active', icon: Package, label: 'Track' },
    { 
      id: 'history', 
      path: isB2B ? '/expense-tracker' : '/order-history', 
      icon: isB2B ? PieChart : History, 
      label: isB2B ? 'Expenses' : 'Activity' 
    },
    { id: 'profile', path: '/profile-settings', icon: User, label: 'Account' }
  ];

  // SECTION 2: Active Route Matching Logic
  // Dynamically determines if a tab is active based on the current URL
  const isActive = (path) => {
    // Special case fallback for the root directory matching dashboard
    if (path === '/dashboard-home' && location.pathname === '/') return true;
    
    // Exact match handling to prevent overlaps
    if (location.pathname === path) return true;
    
    // Detail route matching (e.g., /order-history/detail/123 -> matches /order-history)
    if (location.pathname.startsWith(path + '/')) return true;

    return false;
  };

  return (
    // SECTION 3: Persistent Bottom Dock Layout (Flat & Stark)
    // Completely removes shadows and border-radius in favor of a flat, edge-to-edge design
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111111] pb-safe pt-1 px-4 flex justify-between items-center z-[100] border-t border-[#EAEAEA] dark:border-gray-800 h-[88px] transition-colors duration-300">
      
      {/* SECTION 4: Dynamic Tab Mapping & Transitions */}
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        const Icon = tab.icon;

        return (
          <button 
            key={tab.id} 
            onClick={() => navigate(tab.path)} 
            className="relative flex flex-col items-center justify-center w-full h-full select-none focus:outline-none transition-transform active:scale-95"
            aria-label={t(tab.label, language)}
          >
            <motion.div
              initial={false}
              animate={{ 
                y: active ? -2 : 0
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 ${active ? 'text-[#111111] dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
            >
              {/* Icon state logic strictly follows high-contrast rules:
                Active: Stroke width 2.5 + filled background via currentColor
                Inactive: Stroke width 1.5 + no fill
              */}
              <Icon 
                size={24} 
                strokeWidth={active ? 2.5 : 1.5} 
                fill={active ? 'currentColor' : 'none'}
                className="transition-colors duration-200"
              />
              
              <span className={`text-[10px] tracking-wide transition-colors duration-200 ${active ? 'font-bold text-[#111111] dark:text-white' : 'font-medium text-gray-400 dark:text-gray-500'}`}>
                {t(tab.label, language)}
              </span>
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}