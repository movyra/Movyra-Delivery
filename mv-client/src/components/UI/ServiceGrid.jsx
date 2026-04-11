import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Real Global Integrations
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';
import LineIconRegistry from '../Icons/LineIconRegistry';

/**
 * UI COMPONENT: SERVICE GRID (UBER-STYLE SUGGESTIONS)
 * High-fidelity, horizontally scrolling service registry.
 * * FEATURES CONFIGURED:
 * 1. Context-Aware Payload: Switches between transit and delivery ecosystems.
 * 2. Active Routing: Real paths (no dead links or #).
 * 3. i18n Sync: Fully translated text nodes.
 * 4. Micro-Interactions: Framer Motion spring physics on tap.
 * 5. Scroll Physics: Hardware-accelerated snap points for native feel.
 */

export default function ServiceGrid({ activeContext = 'rides' }) {
  const navigate = useNavigate();
  const { language } = usePreferencesStore();

  // FEATURE 1 & 2: Contextual Configuration & Real Routing Payload
  const RIDE_SERVICES = [
    { id: 'ride', label: 'Ride', icon: 'car', route: '/booking/set-location', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' },
    { id: 'package', label: 'Package', icon: 'box', route: '/booking/package', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' },
    { id: 'reserve', label: 'Reserve', icon: 'calendar', route: '/booking/reserve', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' },
    { id: 'rent', label: 'Rent', icon: 'key', route: '/booking/rentals', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' },
    { id: 'travel', label: 'Travel', icon: 'plane', route: '/booking/travel', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' }
  ];

  const DELIVERY_SERVICES = [
    { id: 'food', label: 'Food', icon: 'food', route: '/delivery/food', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' },
    { id: 'grocery', label: 'Grocery', icon: 'box', route: '/delivery/grocery', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' },
    { id: 'alcohol', label: 'Alcohol', icon: 'wallet', route: '/delivery/alcohol', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' },
    { id: 'pharmacy', label: 'Pharmacy', icon: 'search', route: '/delivery/pharmacy', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' },
    { id: 'deals', label: 'Deals', icon: 'calendar', route: '/delivery/deals', color: 'bg-[#EEEEEE] dark:bg-[#1A1A1A]' }
  ];

  // Dynamically resolve payload
  const currentServices = activeContext === 'rides' ? RIDE_SERVICES : DELIVERY_SERVICES;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between px-5">
        <h3 className="text-[20px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">
          {t('Suggestions', language)}
        </h3>
        <button 
          onClick={() => navigate('/services')}
          className="text-[14px] font-bold text-gray-500 dark:text-gray-400 hover:text-[#111111] dark:hover:text-white transition-colors active:scale-95"
        >
          {t('See all', language)}
        </button>
      </div>
      
      {/* FEATURE 3 & 5: Scroll Container with Snap Physics */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-5 snap-x snap-mandatory">
        {currentServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
            className="flex flex-col items-center gap-2.5 shrink-0 snap-start"
          >
            {/* FEATURE 4: Framer Motion Micro-Interactions */}
            <motion.button
              onClick={() => navigate(service.route)}
              whileTap={{ scale: 0.92 }}
              className={`w-[84px] h-[84px] rounded-[22px] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors duration-300 ${service.color}`}
              aria-label={t(service.label, language)}
            >
              {/* External High-Fidelity SVG Injection */}
              <LineIconRegistry 
                name={service.icon} 
                size={38} 
                strokeWidth={1.5} 
                color="currentColor" 
                className="text-[#111111] dark:text-white transition-colors"
              />
            </motion.button>
            
            {/* Feature 3: Live Translations */}
            <span className="text-[13px] font-black tracking-tight text-[#111111] dark:text-white transition-colors">
              {t(service.label, language)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}