import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Crosshair, MapPin, Plus, X, Home, Briefcase, Bookmark, Loader2 } from 'lucide-react';

// Real Store & Service Integrations
import useBookingStore from '../../store/useBookingStore';
import useLocationStore from '../../store/useLocationStore';
import { reverseGeocode } from '../../services/googleMaps';

// ============================================================================
// PAGE: SET LOCATION (STARK MINIMALIST THEME)
// A high-contrast, multi-stop routing interface. Features flat gray inputs,
// massive geometric typography, and an interactive real-time map engine.
// ============================================================================

export default function SetLocation() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Real State Management via Zustand
  const { pickup, dropoffs, setPickup, addDropoff, updateDropoff, removeDropoff } = useBookingStore();
  const { fetchCurrentLocation, currentLocation, isLocating } = useLocationStore();

  // Local UI State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeField, setActiveField] = useState('pickup'); // 'pickup' | number (index of dropoff)
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Initialize at least one dropoff if empty
  useEffect(() => {
    if (dropoffs.length === 0) {
      addDropoff({ address: '', lat: 0, lng: 0 });
    }
  }, [dropoffs.length, addDropoff]);

  // ============================================================================
  // SECTION 1: MAP ENGINE INITIALIZATION
  // ============================================================================
  useEffect(() => {
    if (map.current) return;

    // Default center (New Delhi) or use existing pickup
    const initialCenter = pickup?.lat ? [pickup.lng, pickup.lat] : [77.2090, 28.6139];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // Premium light-theme
      center: initialCenter,
      zoom: pickup?.lat ? 15 : 12,
      attributionControl: false,
      dragRotate: false,
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      // Auto-trigger GPS if no pickup is set yet
      if (!pickup) fetchCurrentLocation();
    });

    // ============================================================================
    // SECTION 2: MAP TELEMETRY & REVERSE GEOCODING
    // ============================================================================
    map.current.on('movestart', () => setIsDragging(true));
    
    map.current.on('moveend', async () => {
      setIsDragging(false);
      const center = map.current.getCenter();
      
      // Optimistically update coordinates
      const locData = { lat: center.lat, lng: center.lng, address: 'Resolving address...' };
      
      if (activeField === 'pickup') {
        setPickup(locData);
      } else {
        updateDropoff(activeField, locData);
      }

      // Real Reverse Geocoding via Google Maps Service
      setIsResolvingAddress(true);
      try {
        const readableAddress = await reverseGeocode(center.lat, center.lng);
        if (activeField === 'pickup') {
          setPickup({ ...locData, address: readableAddress });
        } else {
          updateDropoff(activeField, { ...locData, address: readableAddress });
        }
      } catch (error) {
        console.warn("Geocoding failed, keeping coordinate view.", error);
        const fallbackAddress = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
        if (activeField === 'pickup') setPickup({ ...locData, address: fallbackAddress });
        else updateDropoff(activeField, { ...locData, address: fallbackAddress });
      } finally {
        setIsResolvingAddress(false);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Sync GPS hardware updates to the map
  useEffect(() => {
    if (currentLocation && map.current && activeField === 'pickup') {
      map.current.flyTo({ center: [currentLocation.lng, currentLocation.lat], zoom: 16 });
    }
  }, [currentLocation]);

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="relative w-full h-screen bg-white overflow-hidden font-sans flex flex-col">
      
      {/* MAP VIEWPORT (Upper Half) */}
      <div className="flex-1 relative z-0">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          ref={mapContainer} className="absolute inset-0" 
        />

        {/* Floating Header */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-6 z-20 pointer-events-none flex justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow-md pointer-events-auto hover:bg-gray-50 active:scale-95 transition-all border border-gray-100"
          >
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          
          <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center shadow-md pointer-events-auto overflow-hidden">
            <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Dynamic Center Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center justify-center">
          <motion.div
            animate={{ y: isDragging ? -15 : 0, scale: isDragging ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="relative drop-shadow-xl"
          >
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white border-4 border-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
               {isResolvingAddress ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={22} strokeWidth={2.5} fill="currentColor" />}
            </div>
            <div className="w-1 h-3 bg-black mx-auto -mt-1 rounded-b-full"></div>
          </motion.div>
          <motion.div 
            animate={{ scale: isDragging ? 0.5 : 1, opacity: isDragging ? 0.3 : 0.8 }}
            className="w-4 h-1.5 bg-black/20 rounded-[100%] blur-[1px] mt-1"
          />
        </div>
      </div>

      {/* STARK BOTTOM SHEET (Input & Multi-Stop Engine) */}
      <div className="bg-white rounded-t-[32px] shadow-[0_-20px_40px_rgba(0,0,0,0.08)] relative z-20 flex flex-col max-h-[60vh]">
        
        {/* Drag Handle & Massive Typography */}
        <div className="p-6 pb-4 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[36px] font-black tracking-tighter text-black leading-none">
              Where to?
            </h1>
            <button 
              onClick={fetchCurrentLocation}
              disabled={isLocating}
              className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black hover:bg-gray-200 transition-colors active:scale-95 disabled:opacity-50"
            >
              {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} strokeWidth={2.5} />}
            </button>
          </div>

          {/* Smart Location Chips */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button className="shrink-0 px-5 py-2.5 bg-[#F6F6F6] rounded-full text-[15px] font-bold text-black flex items-center gap-2 border-2 border-transparent hover:border-black active:scale-95 transition-all">
              <Home size={18} /> Home
            </button>
            <button className="shrink-0 px-5 py-2.5 bg-[#F6F6F6] rounded-full text-[15px] font-bold text-black flex items-center gap-2 border-2 border-transparent hover:border-black active:scale-95 transition-all">
              <Briefcase size={18} /> Work
            </button>
            <button className="shrink-0 px-5 py-2.5 bg-[#F6F6F6] rounded-full text-[15px] font-bold text-black flex items-center gap-2 border-2 border-transparent hover:border-black active:scale-95 transition-all">
              <Bookmark size={18} /> Saved
            </button>
          </div>
        </div>

        {/* Dynamic Multi-Stop Input List */}
        <div className="px-6 overflow-y-auto no-scrollbar pb-6 shrink min-h-[150px]">
          <div className="relative border-l-2 border-dashed border-gray-300 ml-4 pl-6 space-y-4 py-2">
            
            {/* Pickup Input */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full ring-4 ring-white" />
              <input 
                type="text"
                readOnly
                onClick={() => setActiveField('pickup')}
                value={pickup?.address || ''}
                placeholder="Set Pickup Location"
                className={`w-full bg-[#F6F6F6] p-4 rounded-2xl font-bold text-[16px] text-black border-2 transition-all cursor-pointer outline-none ${activeField === 'pickup' ? 'border-black bg-white shadow-sm' : 'border-transparent hover:border-gray-300'}`}
              />
            </div>

            {/* Dropoff Inputs (Dynamic Array) */}
            <AnimatePresence>
              {dropoffs.map((drop, idx) => (
                <motion.div 
                  key={`dropoff-${idx}`}
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="relative flex items-center gap-3"
                >
                  <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-black rounded-sm ring-4 ring-white" />
                  <input 
                    type="text"
                    readOnly
                    onClick={() => setActiveField(idx)}
                    value={drop.address || ''}
                    placeholder={`Dropoff ${idx + 1}`}
                    className={`flex-1 bg-[#F6F6F6] p-4 rounded-2xl font-bold text-[16px] text-black border-2 transition-all cursor-pointer outline-none ${activeField === idx ? 'border-black bg-white shadow-sm' : 'border-transparent hover:border-gray-300'}`}
                  />
                  {dropoffs.length > 1 && (
                    <button 
                      onClick={() => {
                        removeDropoff(idx);
                        if (activeField === idx) setActiveField('pickup');
                      }}
                      className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:text-black hover:bg-gray-200 transition-all shrink-0 active:scale-95"
                    >
                      <X size={20} strokeWidth={2.5} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add Stop Button */}
          {dropoffs.length < 5 && (
            <button 
              onClick={() => {
                const newIdx = dropoffs.length;
                addDropoff({ address: '', lat: 0, lng: 0 });
                setActiveField(newIdx);
              }}
              className="mt-4 ml-2 text-[15px] font-bold text-black flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <div className="w-6 h-6 rounded-full bg-[#F6F6F6] flex items-center justify-center">
                <Plus size={16} strokeWidth={3} />
              </div>
              Add another stop
            </button>
          )}
        </div>

        {/* Confirmation CTA */}
        <div className="p-6 pt-2 shrink-0 bg-white border-t border-gray-100">
          <button 
            onClick={() => navigate('/booking/select-vehicle')}
            disabled={!pickup?.lat || dropoffs.some(d => !d.lat)}
            className="w-full bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:shadow-none"
          >
            Confirm Locations
          </button>
        </div>

      </div>
    </div>
  );
}