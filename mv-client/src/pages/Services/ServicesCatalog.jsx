import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, XCircle } from 'lucide-react';

// Real Global State & Integrations
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';
import LineIconRegistry from '../../components/Icons/LineIconRegistry';

/**
 * UI COMPONENT: SERVICES CATALOG (UBER-STYLE DIRECTORY)
 * Architecture: Full-screen vertical list of all available application modes.
 * Enforces the "Stark" typography engine and heavy border-bottom separators.
 */

export default function ServicesCatalog() {
  const navigate = useNavigate();
  const { language } = usePreferencesStore();
  
  // FEATURE 1: Search State Management
  const [searchQuery, setSearchQuery] = useState('');

  // FEATURE 2 & 3: Master Service Payload with Real Routes
  const CATALOG_DATA = [
    {
      id: 'transit',
      title: 'Go anywhere',
      services: [
        { id: 'ride', label: 'Ride', desc: 'Request a car, SUV, or premium ride', icon: 'car', route: '/booking/set-location' },
        { id: 'reserve', label: 'Reserve', desc: 'Book a ride up to 90 days in advance', icon: 'calendar', route: '/booking/reserve' },
        { id: 'travel', label: 'Travel', desc: 'Airport transfers and intercity travel', icon: 'plane', route: '/booking/travel' },
        { id: 'rent', label: 'Rent', desc: 'Rent a car for hours or days at a time', icon: 'key', route: '/booking/rentals' }
      ]
    },
    {
      id: 'delivery',
      title: 'Get anything',
      services: [
        { id: 'food', label: 'Food', desc: 'Order from your favorite local restaurants', icon: 'food', route: '/delivery/food' },
        { id: 'grocery', label: 'Grocery', desc: 'Fresh groceries delivered to your door', icon: 'box', route: '/delivery/grocery' },
        { id: 'package', label: 'Package', desc: 'Send or receive items across the city', icon: 'box', route: '/booking/package' },
        { id: 'pharmacy', label: 'Pharmacy', desc: 'Everyday essentials and health needs', icon: 'search', route: '/delivery/pharmacy' }
      ]
    }
  ];

  // FEATURE 1: Real-time Search Filtering Engine
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return CATALOG_DATA;

    const lowerQuery = searchQuery.toLowerCase();
    
    return CATALOG_DATA.map(category => {
      // Filter services within the category
      const filteredServices = category.services.filter(service => 
        t(service.label, language).toLowerCase().includes(lowerQuery) || 
        t(service.desc, language).toLowerCase().includes(lowerQuery)
      );
      return { ...category, services: filteredServices };
    }).filter(category => category.services.length > 0); // Remove empty categories
  }, [searchQuery, language]);

  // FEATURE 4: Staggered Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  return (
    // Base layout with safe area padding and room for the bottom dock
    <div className="min-h-screen bg-white dark:bg-[#000000] text-[#111111] dark:text-white pt-safe pb-[120px] transition-colors duration-300">
      
      {/* Sticky Header with Backdrop Blur */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#000000]/90 backdrop-blur-md px-5 pt-8 pb-4 border-b border-gray-100 dark:border-gray-900">
        <h1 className="text-uber-title mb-4">
          {t('Services', language)}
        </h1>
        
        {/* FEATURE 1: Global Search Input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-[#111111] dark:text-white stroke-[2.5]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search for a service', language)}
            className="w-full bg-[#EEEEEE] dark:bg-[#1A1A1A] text-[#111111] dark:text-white font-bold placeholder:text-gray-500 placeholder:font-medium rounded-[14px] py-3.5 pl-12 pr-10 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center active:scale-90 transition-transform"
            >
              <XCircle size={18} className="text-gray-500 dark:text-gray-400 fill-current" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pt-6">
        <AnimatePresence mode="wait">
          {filteredCatalog.length > 0 ? (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              {filteredCatalog.map((category) => (
                <div key={category.id} className="flex flex-col">
                  {/* Category Header */}
                  <h2 className="text-[18px] font-black tracking-tight mb-3 pl-1">
                    {t(category.title, language)}
                  </h2>
                  
                  {/* Services List */}
                  <div className="flex flex-col bg-white dark:bg-[#000000]">
                    {category.services.map((service, index) => (
                      <motion.button
                        variants={itemVariants}
                        key={service.id}
                        onClick={() => navigate(service.route)}
                        whileTap={{ scale: 0.97, backgroundColor: "rgba(0,0,0,0.03)" }}
                        className={`flex items-center gap-4 py-4 w-full text-left focus:outline-none ${
                          index !== category.services.length - 1 ? 'border-b border-gray-100 dark:border-gray-900' : ''
                        }`}
                      >
                        {/* FEATURE 5: High-Fidelity Icon Injection */}
                        <div className="w-[60px] h-[60px] shrink-0 bg-[#EEEEEE] dark:bg-[#1A1A1A] rounded-[16px] flex items-center justify-center transition-colors">
                          <LineIconRegistry 
                            name={service.icon} 
                            size={28} 
                            strokeWidth={1.5} 
                            color="currentColor" 
                            className="text-[#111111] dark:text-white"
                          />
                        </div>
                        
                        {/* Service Metadata */}
                        <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                          <span className="text-[16px] font-bold text-[#111111] dark:text-white truncate">
                            {t(service.label, language)}
                          </span>
                          <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2">
                            {t(service.desc, language)}
                          </span>
                        </div>
                        
                        {/* Action Indicator */}
                        <ChevronRight size={20} className="text-gray-300 dark:text-gray-700 shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            // FEATURE 8: Empty State Handling
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center pt-20 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-[18px] font-black text-[#111111] dark:text-white mb-2">
                {t('No services found', language)}
              </h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium max-w-[250px]">
                {t('Try adjusting your search terms to find what you are looking for.', language)}
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 px-6 py-2.5 bg-[#EEEEEE] dark:bg-[#1A1A1A] text-[#111111] dark:text-white font-bold rounded-full active:scale-95 transition-transform"
              >
                {t('Clear search', language)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}