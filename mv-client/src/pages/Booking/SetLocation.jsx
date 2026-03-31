import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Crosshair, Plus, X, Home, 
  Briefcase, Bookmark, Loader2, Search, ArrowUpDown, AlertCircle, 
  Maximize, Minimize, MapPin, Train, Star, Clock
} from 'lucide-react';

// Real Store Integrations
import useBookingStore from '../../store/useBookingStore';
import useLocationStore from '../../store/useLocationStore';

/**
 * PAGE: SET LOCATION (STRICT OPENSTREETMAP ARCHITECTURE)
 * Features: 
 * - Dual & Multi-stop location selection with strict state separation.
 * - Map Panning Lock (Programmatic move ref prevents search overwrites).
 * - Same-Coordinate Validation.
 * - Leaflet Engine with CDN Fallback.
 * - Real Nominatim/OSM Search & Reverse Geocoding.
 * - OSRM Routing Engine for visual paths.
 */

const CATEGORY_CHIPS = [
  { id: 'saved', label: 'Saved', icon: Star, query: '' },
  { id: 'transit', label: 'Transit Hubs', icon: Train, query: 'Station' },
  { id: 'workspaces', label: 'Offices', icon: Briefcase, query: 'Business Park' },
  { id: 'recent', label: 'Recent', icon: Clock, query: '' }
];

export default function SetLocation() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersGroup = useRef(null);
  const routeLayer = useRef(null);
  
  // Programmatic move lock to prevent map dragging logic from overwriting search text
  const programmaticMoveRef = useRef(false);
  
  // Global State
  const { pickup, dropoffs, setPickup, addDropoff, updateDropoff, removeDropoff } = useBookingStore();
  const { fetchCurrentLocation, currentLocation, isLocating } = useLocationStore();

  // Local UI State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeField, setActiveField] = useState('pickup'); // 'pickup' or index (e.g., 0)
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [routeError, setRouteError] = useState('');
  
  // Layout & Routing States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');

  // Search Engine State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize dropoff array if empty
  useEffect(() => {
    if (dropoffs.length === 0) addDropoff({ address: '', lat: null, lng: null });
  }, []);

  // ============================================================================
  // LEAFLET CDN LOADER
  // ============================================================================
  useEffect(() => {
    const loadLeafletAssets = () => {
      if (window.L) {
        setIsMapLoaded(true);
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setIsMapLoaded(true);
      document.body.appendChild(script);
    };
    loadLeafletAssets();
  }, []);

  // ============================================================================
  // OPENSTREETMAP INITIALIZATION & LOCKED PANNING LOGIC
  // ============================================================================
  useEffect(() => {
    if (!isMapLoaded || !mapContainer.current || map.current) return;

    const L = window.L;
    const initialCenter = pickup?.lat ? [pickup.lat, pickup.lng] : [28.6139, 77.2090];

    map.current = L.map(mapContainer.current, {
      center: initialCenter,
      zoom: pickup?.lat ? 15 : 12,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.current);
    markersGroup.current = L.layerGroup().addTo(map.current);

    map.current.on('movestart', () => {
      if (!programmaticMoveRef.current) setIsDragging(true);
    });
    
    map.current.on('moveend', async () => {
      if (programmaticMoveRef.current) {
        // Unlock map for future drags after programmatic pan completes
        programmaticMoveRef.current = false;
        setIsDragging(false);
        return; 
      }
      
      setIsDragging(false);
      const center = map.current.getCenter();
      
      const locData = { lat: center.lat, lng: center.lng, address: 'Resolving address...' };
      if (activeField === 'pickup') setPickup(locData);
      else updateDropoff(activeField, locData);

      setIsResolvingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${center.lat}&lon=${center.lng}`);
        const data = await res.json();
        const readableAddress = data.display_name || `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
        
        if (activeField === 'pickup') setPickup({ ...locData, address: readableAddress });
        else updateDropoff(activeField, { ...locData, address: readableAddress });
      } catch (error) {
        console.error("OSM Reverse Geocode Error", error);
        const fallback = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
        if (activeField === 'pickup') setPickup({ ...locData, address: fallback });
        else updateDropoff(activeField, { ...locData, address: fallback });
      } finally {
        setIsResolvingAddress(false);
      }
    });

    setTimeout(() => map.current?.invalidateSize(), 100);
  }, [isMapLoaded, activeField]);

  // GPS Sync
  useEffect(() => {
    if (currentLocation && map.current) {
      programmaticMoveRef.current = true;
      map.current.setView([currentLocation.lat, currentLocation.lng], 16);
      
      const locData = { lat: currentLocation.lat, lng: currentLocation.lng, address: 'Current Location' };
      if (activeField === 'pickup') setPickup(locData);
      else updateDropoff(activeField, locData);
    }
  }, [currentLocation]);

  // ============================================================================
  // FEATURE: CUSTOM DYNAMIC MARKERS (ISOLATES ACTIVE FIELD)
  // ============================================================================
  useEffect(() => {
    if (!map.current || !markersGroup.current || !window.L) return;
    const L = window.L;
    markersGroup.current.clearLayers();

    // Draw non-active markers. The active field is represented by the center crosshair.
    if (pickup?.lat && activeField !== 'pickup') {
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div class="w-4 h-4 bg-white rounded-full border-4 border-black shadow-md ring-2 ring-white"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(markersGroup.current);
    }

    dropoffs.forEach((drop, idx) => {
      if (drop.lat && activeField !== idx) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-6 h-6 bg-black text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">${idx + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(markersGroup.current);
      }
    });
  }, [pickup, dropoffs, activeField, isDragging]);

  // ============================================================================
  // FEATURE: OSRM LINEAR ROUTING & VALIDATION
  // ============================================================================
  useEffect(() => {
    const fetchRoute = async () => {
      if (!map.current || !window.L) return;
      const L = window.L;
      const validDropoffs = dropoffs.filter(d => d.lat !== null && d.lat !== 0);

      if (pickup?.lat && validDropoffs.length > 0) {
        // STRICT VALIDATION: Prevent exact same coordinates
        const isSameLocation = validDropoffs.some(d => 
          Math.abs(d.lat - pickup.lat) < 0.0001 && Math.abs(d.lng - pickup.lng) < 0.0001
        );

        if (isSameLocation) {
          setRouteError("Pickup and drop-off cannot be the exact same location.");
          if (routeLayer.current) map.current.removeLayer(routeLayer.current);
          setRouteDistance('');
          setRouteDuration('');
          return;
        } else {
          setRouteError('');
        }

        const coords = [pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
          const data = await res.json();
          
          if (data.code === 'Ok') {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            const dist = data.routes[0].distance;
            const dur = data.routes[0].duration;

            setRouteDistance(dist > 1000 ? `${(dist / 1000).toFixed(1)} km` : `${Math.round(dist)} m`);
            setRouteDuration(`${Math.ceil(dur / 60)} min`);

            if (routeLayer.current) map.current.removeLayer(routeLayer.current);
            
            routeLayer.current = L.polyline(routeCoords, {
              color: '#000000',
              weight: 5,
              opacity: 0.9,
              lineJoin: 'round'
            }).addTo(map.current);
          }
        } catch (err) { console.error("OSRM Route Error", err); }
      } else {
        if (routeLayer.current) {
          map.current.removeLayer(routeLayer.current);
          routeLayer.current = null;
        }
        setRouteDistance('');
        setRouteDuration('');
        setRouteError('');
      }
    };
    fetchRoute();
  }, [pickup, dropoffs]);

  // ============================================================================
  // NOMINATIM SEARCH (DUAL OVERLAY LOGIC)
  // ============================================================================
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsTyping(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
          const data = await res.json();
          setPredictions(data.map(item => ({
            description: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon)
          })));
        } catch (err) { console.error(err); }
        finally { setIsTyping(false); }
      } else setPredictions([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPrediction = (prediction) => {
    const lat = prediction.lat;
    const lng = prediction.lon;
    const locData = { address: prediction.description, lat, lng };
    
    if (activeField === 'pickup') setPickup(locData);
    else updateDropoff(activeField, locData);
    
    if (map.current) {
      programmaticMoveRef.current = true; // Lock pan overwrites
      map.current.setView([lat, lng], 16);
    }
    
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSwapRoute = () => {
    if (dropoffs[0]?.lat && pickup?.lat) {
      const temp = { ...pickup };
      setPickup({ ...dropoffs[0] });
      updateDropoff(0, temp);
      
      if (map.current) {
        programmaticMoveRef.current = true;
        map.current.setView([dropoffs[0].lat, dropoffs[0].lng], 15);
      }
    }
  };

  const focusField = (field) => {
    setActiveField(field);
    const targetLoc = field === 'pickup' ? pickup : dropoffs[field];
    
    if (targetLoc?.lat && map.current) {
      programmaticMoveRef.current = true;
      map.current.setView([targetLoc.lat, targetLoc.lng], 16);
    }
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden font-sans flex flex-col">
      {/* HEADER WITH LOGO (No background container) */}
      <div className="absolute top-0 left-0 right-0 pt-12 px-6 z-[1000] pointer-events-none flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow-md pointer-events-auto border border-gray-100 active:scale-95 transition-all">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
        <img src="/logo.png" alt="Movyra" className="w-12 h-12 object-contain pointer-events-auto" />
      </div>

      {/* OPENSTREETMAP VIEWPORT */}
      <div className="flex-1 relative z-0">
        <div ref={mapContainer} className="absolute inset-0 bg-[#f8f8f8]" />
        
        {/* Fullscreen Toggle & Distance Badge */}
        <div className="absolute right-6 top-28 z-[1000] pointer-events-none flex flex-col items-end gap-3">
          <button onClick={() => { setIsFullscreen(!isFullscreen); setTimeout(() => map.current?.invalidateSize(), 300); }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-black pointer-events-auto border border-gray-100 active:scale-95 transition-all">
            {isFullscreen ? <Minimize size={20} strokeWidth={2.5} /> : <Maximize size={20} strokeWidth={2.5} />}
          </button>
          <AnimatePresence>
            {routeDistance && !isFullscreen && !routeError && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-black text-white px-4 py-3 rounded-2xl shadow-xl pointer-events-auto flex flex-col items-end gap-0.5">
                <span className="font-black text-[16px] leading-none">{routeDistance}</span>
                <span className="font-bold text-[11px] text-gray-400 uppercase tracking-widest">{routeDuration} ETA</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DRAGGABLE CENTER TARGET PIN (Reflects Active Field) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {activeField === 'pickup' ? (
              <div className="w-4 h-4 bg-white rounded-full border-4 border-black shadow-md relative z-10 ring-4 ring-white" />
            ) : (
              <div className="w-8 h-8 bg-black text-white text-[12px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xl relative z-10">
                {activeField + 1}
              </div>
            )}
            {(isDragging || isResolvingAddress) && <div className="absolute w-12 h-12 bg-black/10 rounded-full animate-ping" />}
          </div>
        </div>
      </div>

      {/* BOTTOM SHEET UI */}
      <motion.div 
        initial={{ y: 0 }} 
        animate={{ y: isFullscreen ? '100%' : 0 }} 
        transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
        className="bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] relative z-[1001] flex flex-col max-h-[70vh] absolute bottom-0 left-0 right-0"
      >
        <div className="p-6 pb-4 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => { setIsFullscreen(!isFullscreen); setTimeout(() => map.current?.invalidateSize(), 300); }}></div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[36px] font-black tracking-tighter text-black leading-none">Where to?</h1>
            <button onClick={() => { fetchCurrentLocation(); }} disabled={isLocating} className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black hover:bg-gray-200 active:scale-95 disabled:opacity-50 transition-all">
              {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} strokeWidth={2.5} />}
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-2">
            {CATEGORY_CHIPS.map(chip => (
              <button key={chip.id} onClick={() => { setSearchQuery(chip.query); setIsSearchOpen(true); }} className="shrink-0 px-4 py-2.5 bg-[#F6F6F6] rounded-2xl text-[14px] font-bold text-black flex items-center gap-2 border-2 border-transparent hover:border-black active:scale-95 transition-all">
                <chip.icon size={16} className="text-gray-500" strokeWidth={2.5} /> {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 overflow-y-auto no-scrollbar pb-6 shrink min-h-[150px]">
          <div className="relative border-l-2 border-dashed border-gray-300 ml-4 pl-6 space-y-4 py-2">
            
            <button onClick={handleSwapRoute} className="absolute -left-[20px] top-[42px] z-10 w-10 h-10 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-black shadow-sm active:scale-95 hover:bg-gray-50 transition-all">
              <ArrowUpDown size={18} strokeWidth={2.5} />
            </button>

            {/* PICKUP FIELD */}
            <div className="relative">
              <div className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ring-4 ring-white ${activeField === 'pickup' ? 'bg-black' : 'bg-gray-300'}`} />
              <div className="relative w-full">
                <input 
                  type="text" 
                  readOnly 
                  onClick={() => focusField('pickup')} 
                  value={pickup?.address || ''} 
                  placeholder="Set Pickup Location" 
                  className={`w-full bg-[#F6F6F6] p-4 pr-12 rounded-2xl font-bold text-[15px] text-black border-2 transition-all outline-none cursor-pointer truncate ${activeField === 'pickup' ? 'border-black bg-white shadow-sm' : 'border-transparent'}`} 
                />
                <button onClick={() => { focusField('pickup'); setIsSearchOpen(true); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black">
                  <Search size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* DROPOFF FIELDS */}
            {dropoffs.map((drop, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative flex items-center gap-3">
                <div className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 border-4 rounded-full ring-4 ring-white ${activeField === idx ? 'bg-white border-black' : 'bg-white border-gray-300'}`} />
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    readOnly 
                    onClick={() => focusField(idx)} 
                    value={drop.address || ''} 
                    placeholder={`Dropoff location ${idx + 1}`} 
                    className={`w-full bg-[#F6F6F6] p-4 pr-12 rounded-2xl font-bold text-[15px] text-black border-2 transition-all outline-none cursor-pointer truncate ${activeField === idx ? 'border-black bg-white shadow-sm' : 'border-transparent'}`} 
                  />
                  <button onClick={() => { focusField(idx); setIsSearchOpen(true); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black">
                    <Search size={18} strokeWidth={2.5} />
                  </button>
                </div>
                {dropoffs.length > 1 && (
                  <button onClick={() => { removeDropoff(idx); setActiveField('pickup'); }} className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all shrink-0 active:scale-95">
                    <X size={20} strokeWidth={2.5} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          
          {dropoffs.length < 5 && (
            <button onClick={() => { 
              const newIndex = dropoffs.length;
              addDropoff({ address: '', lat: null, lng: null }); 
              focusField(newIndex);
            }} className="mt-4 ml-2 text-[15px] font-bold text-black flex items-center gap-2 hover:opacity-70 transition-opacity">
              <div className="w-6 h-6 rounded-full bg-[#F6F6F6] flex items-center justify-center">
                <Plus size={16} strokeWidth={3} />
              </div>
              Add another stop
            </button>
          )}
        </div>

        <div className="p-6 pt-2 bg-white border-t border-gray-100">
          {routeError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl font-bold text-[13px] flex items-start gap-2 mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {routeError}
            </div>
          )}
          <button 
            onClick={() => navigate('/booking/select-vehicle')} 
            disabled={!pickup?.lat || dropoffs.some(d => !d.lat) || !!routeError} 
            className="w-full bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Confirm Route {routeDistance && !routeError && <span className="text-gray-400 font-medium">• {routeDistance}</span>}
          </button>
        </div>
      </motion.div>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed inset-0 bg-white z-[10000] flex flex-col font-sans">
            <div className="pt-12 px-6 pb-4 flex items-center gap-4 border-b border-gray-100 shrink-0 shadow-sm">
              <button onClick={() => setIsSearchOpen(false)} className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black active:scale-95 shrink-0 transition-transform">
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
                  placeholder={activeField === 'pickup' ? "Where are we picking up?" : "Where to drop off?"} 
                  className="w-full bg-[#F6F6F6] py-3.5 pl-12 pr-10 rounded-2xl font-bold text-[16px] text-black border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none" 
                />
                {isTyping && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={18} className="animate-spin text-black" /></div>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {predictions.map((pred, i) => (
                  <button key={i} onClick={() => handleSelectPrediction(pred)} className="w-full text-left px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-[#F6F6F6] flex items-start gap-3 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                      <MapPin size={16} strokeWidth={2.5} />
                    </div>
                    <div className="overflow-hidden">
                      <span className="block text-[15px] font-bold text-black truncate">{pred.description.split(',')[0]}</span>
                      <span className="block text-[13px] font-medium text-gray-500 truncate">{pred.description.split(',').slice(1).join(',').trim()}</span>
                    </div>
                  </button>
                ))}
                {predictions.length === 0 && !isTyping && searchQuery.length > 2 && (
                  <div className="p-6 text-center text-gray-500 font-medium">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}