import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Maximize, Minimize, Crosshair, Loader2 } from 'lucide-react';

// Real Store Integrations
import useMapSettingsStore from '../../store/useMapSettingsStore';
import useLocationStore from '../../store/useLocationStore';

/**
 * UI COMPONENT: MAP ACTION FAB (FLOATING ACTION BUTTON)
 * An animated radial menu that handles Dark Mode, Fullscreen API, and GPS sync.
 * Keeps the map viewport entirely clean of bulky headers.
 */
export default function MapActionFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Global States
  const { mapTheme, setMapTheme } = useMapSettingsStore();
  const { fetchCurrentLocation, isLocating } = useLocationStore();

  // Handle Native Browser Fullscreen API
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen API Error:", err);
    }
    setIsOpen(false);
  };

  // Handle Dark/Light Mode Swap
  const toggleTheme = () => {
    const newTheme = mapTheme === 'dark' ? 'standard' : 'dark';
    setMapTheme(newTheme);
    setIsOpen(false);
  };

  // Handle GPS Sync
  const handleGPS = () => {
    fetchCurrentLocation();
    setIsOpen(false);
  };

  const actionButtons = [
    { id: 'theme', icon: mapTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />, onClick: toggleTheme, label: 'Theme' },
    { id: 'fullscreen', icon: isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />, onClick: toggleFullscreen, label: 'Fullscreen' },
    { id: 'gps', icon: isLocating ? <Loader2 className="animate-spin" size={20} /> : <Crosshair size={20} />, onClick: handleGPS, label: 'Locate' }
  ];

  return (
    <div className="absolute top-6 right-6 z-[2000] flex flex-col items-end">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ staggerChildren: 0.1, duration: 0.2 }}
            className="flex flex-col gap-3 mb-4"
          >
            {actionButtons.map((btn, idx) => (
              <motion.button
                key={btn.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={btn.onClick}
                className="w-12 h-12 bg-white text-black rounded-full shadow-lg flex items-center justify-center border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all"
                title={btn.label}
              >
                {btn.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.15)] flex items-center justify-center border border-gray-100 active:scale-95 transition-transform z-10"
      >
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="w-full h-full p-2">
          {/* Strictly circular logo with no background block */}
          <img src="/logo.png" alt="Menu" className="w-full h-full object-contain rounded-full drop-shadow-sm" />
        </motion.div>
      </button>
    </div>
  );
}