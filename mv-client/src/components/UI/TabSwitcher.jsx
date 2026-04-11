import React from 'react';
import { motion } from 'framer-motion';

// Real Global Integrations
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';
import LineIconRegistry from '../Icons/LineIconRegistry';

/**
 * UI COMPONENT: TAB SWITCHER (UBER-STYLE CONTEXT TOGGLE)
 * Architecture: Top-level navigation toggle between core business contexts.
 * Features:
 * 1. Framer Motion layout animations (Sliding Underline)
 * 2. Controlled State integration (activeTab / onTabChange)
 * 3. Real-time translation sync (i18n)
 * 4. Micro-interaction touch physics (whileTap)
 * 5. WAI-ARIA Accessibility compliance
 * 6. High-fidelity custom SVG injection
 */

export default function TabSwitcher({ activeTab = 'rides', onTabChange }) {
  const { language } = usePreferencesStore();

  // Define the master context channels
  const tabs = [
    { 
      id: 'rides', 
      label: 'Rides', 
      icon: 'car' 
    },
    { 
      id: 'delivery', 
      label: 'Delivery', 
      icon: 'box' 
    }
  ];

  return (
    // FEATURE 5: Accessibility Tablist Role
    <div 
      role="tablist" 
      aria-label={t('Service Context Switcher', language)}
      className="flex items-center gap-8 w-full"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          // FEATURE 4: Touch Physics & Micro-interactions
          <motion.button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            onClick={() => onTabChange(tab.id)}
            whileTap={{ scale: 0.95 }}
            className={`relative py-2 flex items-center gap-2.5 transition-opacity duration-300 focus:outline-none select-none ${
              isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}
          >
            {/* FEATURE 6: High-Fidelity Custom SVG Injection */}
            <LineIconRegistry 
              name={tab.icon} 
              size={24} 
              strokeWidth={isActive ? 2.5 : 1.5} 
              color="currentColor" 
              className="text-[#111111] dark:text-white transition-all duration-300"
            />
            
            {/* FEATURE 3: Real-Time Translations */}
            <span className={`text-[20px] tracking-tight transition-all duration-300 ${isActive ? 'font-black text-[#111111] dark:text-white' : 'font-bold text-gray-800 dark:text-gray-300'}`}>
              {t(tab.label, language)}
            </span>

            {/* FEATURE 1 & 2: Physics-based Sliding Indicator */}
            {isActive && (
              <motion.div 
                layoutId="contextUnderline" 
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute -bottom-4 left-0 right-0 h-1 bg-[#111111] dark:bg-white rounded-full z-10" 
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}