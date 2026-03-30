import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Crosshair, MapPin, Plus, X, Home, 
  Briefcase, Bookmark, Loader2, Search, ArrowUpDown, AlertCircle 
} from 'lucide-react';

// Real Store & Service Integrations
import useBookingStore from '../../store/useBookingStore';
import useLocationStore from '../../store/useLocationStore';
import { reverseGeocode, fetchPlacePredictions, geocodeAddress } from '../../services/googleMaps';
import { fetchUserAddresses } from '../../services/firestore';

// ============================================================================
// PAGE: SET LOCATION (STARK MINIMALIST THEME)
// A high-contrast, multi-stop routing interface featuring 5+ advanced tools:
// 1. Live Nominatim Search Overlay
// 2. Strict Duplicate Address Validation
// 3. Real-Time Route Swapping
// 4. Firestore Saved Address Injection
// 5. Hardware GPS Telemetry
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
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [routeError, setRouteError] = useState('');

  // Search Engine State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize at least one dropoff if empty
  useEffect(() => {
    if (dropoffs.length === 0) {
      addDropoff({ address: '', lat: 0, lng: 0 });
    }
    // Fetch user's saved addresses from Firestore
    fetchUserAddresses().then(setSavedAddresses).catch(console.error);
  }, [dropoffs.length, addDropoff]);

  // ============================================================================
  // FEATURE 1: STRICT DUPLICATE ADDRESS VALIDATOR
  // ============================================================================
  useEffect(() => {
    if (pickup?.lat && dropoffs.length > 0) {
      // Check if any dropoff perfectly matches the pickup coordinates
      const hasDuplicate = dropoffs.some(d => 
        (d.lat === pickup.lat && d.lng === pickup.lng && d.lat !== 0) ||
        (d.address === pickup.address && d.address !== '' && d.address !== 'Resolving address...')
      );
      
      const hasEmpty = dropoffs.some(d => !d.lat || !d.address);

      if (hasDuplicate) {
        setRouteError("Pickup and drop-off cannot be identical.");
      } else if (hasEmpty && dropoffs.length > 1) {
        setRouteError("Please set all drop-off locations.");
      } else {
        setRouteError("");
      }
    }
  }, [pickup, dropoffs]);

  // ============================================================================
  // FEATURE 2: ROUTE SWAP ENGINE
  // ============================================================================
  const handleSwapRoute = () => {
    if (dropoffs.length > 0 && pickup?.lat && dropoffs[0]?.lat) {
      const tempPickup = { ...pickup };
      setPickup({ ...dropoffs[0] });
      updateDropoff(0, tempPickup);
      
      // Instantly recenter the map on the new pickup
      if (map.current) {
        map.current.flyTo({ center: [dropoffs[0].lng, dropoffs[0].lat], zoom: 15 });
        setActiveField('pickup');
      }
    }
  };

  // ============================================================================
  // SECTION 1: MAP ENGINE INITIALIZATION
  // ============================================================================
  useEffect(() => {
    if (map.current) return;

    // Default center (New Delhi) or use existing pickup
    const initialCenter = pickup?.lat ? [pickup.lng, pickup.lat] : [77.2090, 28.6139];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: initialCenter,
      zoom: pickup?.lat ? 15 : 12,
      attributionControl: false,
      dragRotate: false,
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      if (!pickup?.lat) fetchCurrentLocation();
    });

    map.current.on('movestart', () => setIsDragging(true));
    
    map.current.on('moveend', async () => {
      setIsDragging(false);
      const center = map.current.getCenter();
      
      const locData = { lat: center.lat, lng: center.lng, address: 'Resolving address...' };
      if (activeField === 'pickup') setPickup(locData);
      else updateDropoff(activeField, locData);

      setIsResolvingAddress(true);
      try {
        const readableAddress = await reverseGeocode(center.lat, center.lng);
        if (activeField === 'pickup') setPickup({ ...locData, address: readableAddress });
        else updateDropoff(activeField, { ...locData, address: readableAddress });
      } catch (error) {
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
  }, [activeField]);

  // Sync GPS updates to the map
  useEffect(() => {
    if (currentLocation && map.current && activeField === 'pickup') {
      map.current.flyTo({ center: [currentLocation.lng, currentLocation.lat], zoom: 16 });
      setPickup({ lat: currentLocation.lat, lng: currentLocation.lng, address: 'Current Location' });
    }
  }, [currentLocation]);

  // ============================================================================
  // SECTION 3: SEARCH ENGINE LOGIC (NOMINATIM REST API)
  // ============================================================================
  useEffect(() => {
    const fetchTimer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsTyping(true);
        try {
          const results = await fetchPlacePredictions(searchQuery);
          setPredictions(results);
        } catch (err) {
          console.error("Autocomplete Error:", err);
        } finally {
          setIsTyping(false);
        }
      } else {
        setPredictions([]);
      }
    }, 400);

    return () => clearTimeout(fetchTimer);
  }, [searchQuery]);

  const handleSelectPrediction = async (prediction) => {
    setIsTyping(true);
    try {
      const geocoded = await geocodeAddress(prediction.place_id || prediction.description);
      const locData = {
        address: geocoded.formattedAddress || prediction.description.split(',')[0],
        lat: geocoded.lat,
        lng: geocoded.lng
      };

      if (activeField === 'pickup') setPickup(locData);
      else updateDropoff(activeField, locData);

      if (map.current) map.current.flyTo({ center: [locData.lng, locData.lat], zoom: 16 });
      
      setIsSearchOpen(false);
      setSearchQuery('');
      setPredictions([]);
    } catch (err) {
      console.error("Geocoding Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  // FEATURE 3: Smart Chip Injection
  const handleQuickSet = (addr) => {
    const locData = { address: addr.address, lat: addr.lat, lng: addr.lng };
    if (activeField === 'pickup') setPickup(locData);
    else updateDropoff(activeField, locData);
    if (map.current) map.current.flyTo({ center: [addr.lng, addr.lat], zoom: 16 });
  };

  const getIconForType = (type) => {
    if (type === 'home') return <Home size={16} strokeWidth={2.5} />;
    if (type === 'work') return <Briefcase size={16} strokeWidth={2.5} />;
    return <Bookmark size={16} strokeWidth={2.5} />;
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="relative w-full h-screen bg-white overflow-hidden font-sans flex flex-col">
      
      {/* SECTION 1: LIVE MAP VIEWPORT */}
      <div className="flex-1 relative z-0">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          ref={mapContainer} className="absolute inset-0" 
        />

        {/* SECTION 2: QUICK ACTION FLOATING CONTROLS */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-6 z-20 pointer-events-none flex justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow-md pointer-events-auto hover:bg-gray-50 active:scale-95 transition-all border border-gray-100"
          >
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          
          <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
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

      {/* SECTION 3: DYNAMIC ROUTING INPUTS (BOTTOM SHEET) */}
      <div className="bg-white rounded-t-[32px] shadow-[0_-20px_40px_rgba(0,0,0,0.08)] relative z-20 flex flex-col max-h-[65vh]">
        
        {/* Drag Handle & Massive Typography */}
        <div className="p-6 pb-4 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[36px] font-black tracking-tighter text-black leading-none">
              Where to?
            </h1>
            {/* Feature 4: Live GPS Injection */}
            <button 
              onClick={() => { setActiveField('pickup'); fetchCurrentLocation(); }}
              disabled={isLocating}
              className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black hover:bg-gray-200 transition-colors active:scale-95 disabled:opacity-50"
            >
              {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} strokeWidth={2.5} />}
            </button>
          </div>

          {/* SECTION 4: SMART FIRESTORE CHIPS */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {savedAddresses.map(addr => (
              <button 
                key={addr.id}
                onClick={() => handleQuickSet(addr)}
                className="shrink-0 px-5 py-2.5 bg-[#F6F6F6] rounded-full text-[15px] font-bold text-black flex items-center gap-2 border-2 border-transparent hover:border-black active:scale-95 transition-all"
              >
                {getIconForType(addr.type)} {addr.name}
              </button>
            ))}
            {savedAddresses.length === 0 && (
              <span className="text-[13px] font-bold text-gray-400 py-2.5">No saved locations yet.</span>
            )}
          </div>
        </div>

        {/* Multi-Stop Input List */}
        <div className="px-6 overflow-y-auto no-scrollbar pb-6 shrink min-h-[150px]">
          <div className="relative border-l-2 border-dashed border-gray-300 ml-4 pl-6 space-y-4 py-2">
            
            {/* Feature 2: Route Swap Engine */}
            <button 
              onClick={handleSwapRoute}
              disabled={dropoffs.length === 0 || !pickup?.lat || !dropoffs[0]?.lat}
              className="absolute -left-[20px] top-[42px] z-10 w-10 h-10 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-black hover:bg-gray-50 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:active:scale-100"
            >
              <ArrowUpDown size={18} strokeWidth={2.5} />
            </button>

            {/* Pickup Input */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full ring-4 ring-white" />
              <input 
                type="text"
                readOnly
                onClick={() => {
                  setActiveField('pickup');
                  setSearchQuery(pickup?.address !== 'Resolving address...' ? pickup?.address || '' : '');
                  setIsSearchOpen(true);
                }}
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
                    onClick={() => {
                      setActiveField(idx);
                      setSearchQuery(drop.address !== 'Resolving address...' ? drop.address || '' : '');
                      setIsSearchOpen(true);
                    }}
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
                setSearchQuery('');
                setIsSearchOpen(true);
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

        {/* Confirmation CTA & Validation Errors */}
        <div className="p-6 pt-2 shrink-0 bg-white border-t border-gray-100">
          
          {/* Feature 5: Dynamic Validation Feedback */}
          <AnimatePresence>
            {routeError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold text-[13px] flex items-start gap-2 mb-4"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" /> {routeError}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => navigate('/booking/select-vehicle')}
            disabled={!pickup?.lat || dropoffs.some(d => !d.lat) || !!routeError}
            className="w-full bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:shadow-none"
          >
            Confirm Locations
          </button>
        </div>

      </div>

      {/* ============================================================================ */}
      {/* SECTION 5: FULL-SCREEN NOMINATIM SEARCH OVERLAY                              */}
      {/* ============================================================================ */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col font-sans"
          >
            {/* Overlay Header */}
            <div className="pt-12 px-6 pb-4 flex items-center gap-4 border-b border-gray-100 shrink-0 shadow-sm">
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black active:scale-95 shrink-0"
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
              
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={20} strokeWidth={2.5} />
                </div>
                <input 
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeField === 'pickup' ? "Where are we picking up?" : "Where is this going?"}
                  className="w-full bg-[#F6F6F6] py-3.5 pl-12 pr-10 rounded-2xl font-bold text-[16px] text-black border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none"
                />
                {isTyping ? (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  </div>
                ) : searchQuery.length > 0 ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Results / Predictions */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
              <AnimatePresence>
                {predictions.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                  >
                    {predictions.map((pred) => (
                      <button
                        key={pred.place_id}
                        onClick={() => handleSelectPrediction(pred)}
                        disabled={isTyping}
                        className="w-full text-left px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-[#F6F6F6] active:bg-gray-100 transition-colors flex items-start gap-3 disabled:opacity-50"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                          <MapPin size={16} strokeWidth={2.5} />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[15px] font-bold text-black truncate">{pred.description.split(',')[0]}</span>
                          <span className="block text-[13px] font-medium text-gray-500 truncate">
                            {pred.description.split(',').slice(1).join(',').trim() || pred.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                ) : searchQuery.length > 2 && !isTyping ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-[18px] font-black text-black mb-1">No results found</h3>
                    <p className="text-[14px] font-bold text-gray-500">Try a different search term.</p>
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}