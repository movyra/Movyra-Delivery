import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Clock, User, PieChart, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// Real Auth Store & Global Prefs Integration
import useAuthStore from '../../store/useAuthStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { useGenderMode } from '../../contexts/GenderModeContext';
import { t } from '../../utils/translations';

/**
 * COMPONENT: BOTTOM NAV BAR (PREMIUM SUPER-APP PARADIGM)
 * Replicates the Uber-inspired tab system, upgraded to 5 tabs.
 * Features:
 * - Dedicated Safety/SOS tab strictly built for the 2026 India context.
 * - Dynamic path matching for high-fidelity active states.
 * - Role-aware routing for Business users (B2B).
 * - Gender-aware UI coloring for the SOS shield.
 * - Spring-based micro-interactions on tab switch.
 * - DARK MODE: High-contrast stroke/fill transitions.
 */

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Real Global State
  const { user } = useAuthStore();
  const { language } = usePreferencesStore();
  const { gender } = useGenderMode();

  // Determine if the authenticated user has a Business profile for role-based tabs
  const isB2B = user?.isB2B === true || user?.accountType === 'business';

  // SECTION 1: Super-App Tab Configuration
  // Paradigms: Home (Overview), Services (Grid), Safety (SOS), Activity (Logistics), Account (User)
  const tabs = [
    { 
      id: 'home', 
      path: '/dashboard-home', 
      icon: Home, 
      label: 'Home' 
    },
    { 
      id: 'services', 
      path: '/services', // Dedicated services catalog
      icon: LayoutGrid, 
      label: 'Services' 
    },
    {
      id: 'safety',
      path: '/safety/guardian', // Directly opens the Safety/SOS matrix
      icon: ShieldAlert,
      label: 'Safety',
      // The SOS icon gets special styling (Red for Male/Default, Purple for Female mode)
      isSpecial: true 
    },
    { 
      id: 'activity', 
      path: isB2B ? '/expense-tracker' : '/order-history', 
      icon: isB2B ? PieChart : Clock, 
      label: isB2B ? 'Expenses' : 'Activity' 
    },
    { 
      id: 'profile', 
      path: '/profile-settings', 
      icon: User, 
      label: 'Account' 
    }
  ];

  // SECTION 2: Intelligent Active State Resolver
  const isActive = (path) => {
    if (path === '/dashboard-home' && location.pathname === '/') return true;
    if (location.pathname === path) return true;
    // Catch sub-routes (e.g. /order-history/detail/123)
    if (location.pathname.startsWith(path + '/')) return true;
    return false;
  };

  return (
    // SECTION 3: Edge-to-Edge Navigation Dock
    // Uses a flat design without radius, strictly following the reference image dock.
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#000000] pb-safe pt-2 px-2 flex justify-between items-center z-[100] border-t border-gray-100 dark:border-gray-900 h-[84px] transition-colors duration-300">
      
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        const Icon = tab.icon;
        
        // Determine coloring logic based on standard vs. special Safety Tab
        let colorClass = active ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600';
        if (tab.isSpecial) {
          colorClass = gender === 'female' ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-500';
          // Dim the special tab slightly if not active, but keep the color hue visible
          if (!active) colorClass += ' opacity-50';
        }

        return (
          <button 
            key={tab.id} 
            onClick={() => navigate(tab.path)} 
            className="relative flex flex-col items-center justify-center w-full h-full select-none focus:outline-none group transition-all"
            aria-label={t(tab.label, language)}
          >
            <motion.div
              initial={false}
              animate={{ 
                y: active ? -2 : 0,
                scale: active ? 1.05 : 1
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${colorClass}`}
            >
              {/* Premium Icon Logic: 
                  - Active: Thick stroke (2.5) + Solid Fill (Uber Standard)
                  - Inactive: Light stroke (1.5) + No Fill
              */}
              <div className="relative">
                <Icon 
                  size={24} 
                  strokeWidth={active ? 2.5 : 1.5} 
                  fill={active ? 'currentColor' : 'none'}
                  className="transition-all duration-300"
                />
                {active && !tab.isSpecial && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
                {/* Special pinging indicator for Safety Tab when active */}
                {active && tab.isSpecial && (
                   <motion.div 
                     className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                     animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                     transition={{ repeat: Infinity, duration: 1.5 }}
                   />
                )}
              </div>
              
              {/* High-Fidelity Labels */}
              <span className={`text-[10px] tracking-tight uppercase transition-colors duration-300 ${active ? 'font-black' : 'font-bold'}`}>
                {t(tab.label, language)}
              </span>
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}