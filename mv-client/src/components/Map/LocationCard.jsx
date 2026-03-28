import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation2, Clock, Truck, ShieldCheck, Loader2 } from 'lucide-react';

// ============================================================================
// COMPONENT: LOCATION CARD OVERLAY (MOVYRA LIGHT THEME)
// A floating bottom-sheet UI featuring 6 completely functional, real-time sections:
// Haversine Distance Engine, HTML5 Geolocation, Real Reverse Geocoding, 
// Animated Sheet Wrapper, Dynamic Vehicle Tabs, and Live Telemetry Output.
// ============================================================================

const VEHICLE_OPTIONS = [
  { id: 'deal', label: 'Best Deal', basePrice: 12, multiplier: 1.0, timeFactor: 1.5 },
  { id: 'fast', label: 'Fastest', basePrice: 25, multiplier: 1.8, timeFactor: 0.8 },
  { id: 'dist', label: 'Heavy Duty', basePrice: 45, multiplier: 2.5, timeFactor: 1.2 }
];

export default function LocationCard({ 
  selectedCoordinates = [77.2090, 28.6139], // Defaulting to a real coordinate format [lng, lat]
  onConfirm 
}) {
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [realAddress, setRealAddress] = useState('Resolving precise location...');
  const [isGeocoding, setIsGeocoding] = useState(true);
  const [activeTab, setActiveTab] = useState(VEHICLE_OPTIONS[0]);
  const [liveDistanceKm, setLiveDistanceKm] = useState(0);

  // SECTION 1: HTML5 Real-Time Geolocation Engine
  // Fetches the user's actual physical device GPS coordinates
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeviceLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => console.warn("Live GPS denied/unavailable:", error.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // SECTION 2: Real-Time Haversine Distance Algorithm
  // Calculates the true spherical distance between the device and the selected map pin
  useEffect(() => {
    if (!deviceLocation || !selectedCoordinates) return;

    const toRad = (value) => (value * Math.PI) / 180;
    const [lon1, lat1] = deviceLocation;
    const [lon2, lat2] = selectedCoordinates;

    const R = 6371; // Earth radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setLiveDistanceKm(distance);
  }, [deviceLocation, selectedCoordinates]);

  // SECTION 3: Live Reverse Geocoding Engine (OpenStreetMap API)
  // Translates the raw dropped pin coordinates into a real street address
  useEffect(() => {
    const fetchRealAddress = async () => {
      setIsGeocoding(true);
      try {
        const [lng, lat] = selectedCoordinates;
        // Utilizing Nominatim public API for real data extraction
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data && data.display_name) {
          // Format the raw output to be cleaner for the UI
          const parts = data.display_name.split(',');
          setRealAddress(parts.slice(0, 3).join(',').trim());
        } else {
          setRealAddress('Unnamed Road / Uncharted Area');
        }
      } catch (error) {
        setRealAddress('Coordinates Selected (Offline Mode)');
      } finally {
        setIsGeocoding(false);
      }
    };

    // Debounce to prevent API rate limiting while dragging the map
    const timeoutId = setTimeout(fetchRealAddress, 800);
    return () => clearTimeout(timeoutId);
  }, [selectedCoordinates]);

  // Telemetry Calculation (Price & Time based on real distance)
  const estimatedPrice = (activeTab.basePrice + (liveDistanceKm * activeTab.multiplier)).toFixed(2);
  const estimatedMins = Math.max(5, Math.round((liveDistanceKm / 40) * 60 * activeTab.timeFactor)); // Assuming 40km/h avg city speed

  return (
    // SECTION 4: Animated Bottom Sheet Wrapper
    <motion.div 
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
      className="w-full bg-white rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-gray-100 flex flex-col pt-3 pb-safe px-6 pointer-events-auto"
    >
      {/* Draggable Handle Indicator */}
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

      {/* SECTION 5: Context Header & Live Address Output */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-movyra-blue flex items-center justify-center flex-shrink-0 border border-blue-100/50">
          {isGeocoding ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} strokeWidth={2.5} />}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-1">Current Selection</span>
          <AnimatePresence mode="wait">
            <motion.h2 
              key={realAddress}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-gray-900 text-lg font-black leading-snug truncate"
            >
              {realAddress}
            </motion.h2>
          </AnimatePresence>
          <span className="text-movyra-blue text-[12px] font-bold mt-1 tracking-wide">
            {selectedCoordinates[1].toFixed(5)}, {selectedCoordinates[0].toFixed(5)}
          </span>
        </div>
      </div>

      {/* SECTION 6: Interactive Horizontal Vehicle/Deal Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {VEHICLE_OPTIONS.map((option) => {
          const isActive = activeTab.id === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setActiveTab(option)}
              className={`relative flex items-center justify-center px-5 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 outline-none select-none flex-1 border-2 ${
                isActive 
                  ? 'border-movyra-blue text-movyra-blue shadow-lg shadow-movyra-blue/20' 
                  : 'border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-400'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeLocationTab"
                  className="absolute inset-0 bg-blue-50/50 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 font-black tracking-wide text-[13px]">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 7: Live Telemetry Output & Action Button */}
      <div className="bg-gray-50 rounded-[24px] p-5 mb-6 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Navigation2 size={12} strokeWidth={3} className="rotate-45" />
              <span className="text-[10px] font-black uppercase tracking-widest">Distance</span>
            </div>
            <span className="text-gray-900 font-black text-[15px]">
              {liveDistanceKm > 0 ? `${liveDistanceKm.toFixed(1)} km` : 'Calc...'}
            </span>
          </div>
          
          <div className="w-[1px] h-8 bg-gray-200 mx-2"></div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Clock size={12} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-widest">Est. Time</span>
            </div>
            <span className="text-gray-900 font-black text-[15px]">{estimatedMins} min</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
           <span className="text-[10px] font-black text-movyra-blue uppercase tracking-widest mb-1">Est. Total</span>
           <span className="text-2xl font-black text-gray-900 tracking-tighter">${estimatedPrice}</span>
        </div>
      </div>

      <button 
        onClick={() => onConfirm && onConfirm(selectedCoordinates, activeTab)}
        className="w-full bg-movyra-blue text-white py-5 rounded-2xl font-black text-[16px] tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-movyra-blue/30 mb-2 hover:bg-blue-600"
      >
        Confirm Location <ShieldCheck size={20} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}