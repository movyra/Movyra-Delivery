import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Crosshair, X, 
  Briefcase, Loader2, AlertCircle, 
  Train, Star, Clock, Mic, Wand2, User, Phone, FileText, Check
} from 'lucide-react';

// Premium Design System Components
import LineIconRegistry from '../../components/Icons/LineIconRegistry';
import SystemButton from '../../components/UI/SystemButton';

// Real Store Integrations
import useBookingStore from '../../store/useBookingStore';
import useLocationStore from '../../store/useLocationStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';

// Services & Overlays
import { MAP_LAYERS } from '../../services/mapLayers';
import { reverseGeocodeWithCache } from '../../services/geocodeCache';

// New Split-Screen Components (Target UI Image Match)
import FloatingLocationCard from '../../components/Map/FloatingLocationCard';
import LocationInputCards from '../../components/Map/LocationInputCards';

/**
 * PAGE: SET LOCATION (SPLIT-SCREEN CARD UI)
 * Features: 
 * - 45vh/55vh Strict Split-Screen Layout
 * - Absolute Header & Logo Eradication
 * - Overlapping Floating Location Blue Card
 * - Isolated Circular Map Controls using LineIconRegistry
 * - Auto-Fitting Bounds & Polyline Snapping
 * - Strict Null-Safety for Array Iterations
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
  const tileLayerRef = useRef(null);
  const markersGroup = useRef(null);
  const routeLayer = useRef(null);
  const programmaticMoveRef = useRef(false);
  
  // Global States
  const { pickup, dropoffs, setPickup, updateDropoff } = useBookingStore();
  const { fetchCurrentLocation, currentLocation, isLocating } = useLocationStore();
  const { mapTheme } = useMapSettingsStore();

  // Local UI State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeField, setActiveField] = useState('pickup'); 
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [routeError, setRouteError] = useState('');
  
  // Advanced Feature States
  const [isListening, setIsListening] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null); 
  const [contactForm, setContactForm] = useState({ name: '', phone: '', notes: '' });
  
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize dropoff array if empty
  useEffect(() => {
    if (dropoffs.length === 0) {
      useBookingStore.getState().addDropoff({ address: '', lat: null, lng: null });
    }
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

    tileLayerRef.current = L.tileLayer(MAP_LAYERS[mapTheme] || MAP_LAYERS.standard).addTo(map.current);
    markersGroup.current = L.layerGroup().addTo(map.current);

    map.current.on('movestart', () => {
      if (!programmaticMoveRef.current) setIsDragging(true);
    });
    
    map.current.on('moveend', async () => {
      if (programmaticMoveRef.current) {
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
        const readableAddress = await reverseGeocodeWithCache(center.lat, center.lng);
        if (activeField === 'pickup') setPickup({ ...locData, address: readableAddress });
        else updateDropoff(activeField, { ...locData, address: readableAddress });
      } catch (error) {
        const fallback = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
        if (activeField === 'pickup') setPickup({ ...locData, address: fallback });
        else updateDropoff(activeField, { ...locData, address: fallback });
      } finally {
        setIsResolvingAddress(false);
      }
    });

    setTimeout(() => map.current?.invalidateSize(), 100);
  }, [isMapLoaded, activeField]);

  // Handle Dynamic Map Layer (Theme) Changes
  useEffect(() => {
    if (map.current && tileLayerRef.current) {
      tileLayerRef.current.setUrl(MAP_LAYERS[mapTheme] || MAP_LAYERS.standard);
    }
  }, [mapTheme]);

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
  // CUSTOM INTERACTIVE MARKERS
  // ============================================================================
  useEffect(() => {
    if (!map.current || !markersGroup.current || !window.L) return;
    const L = window.L;
    markersGroup.current.clearLayers();

    if (pickup?.lat && activeField !== 'pickup') {
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div class="w-4 h-4 bg-white rounded-full border-[4px] border-[#111111] shadow-md hover:scale-125 transition-transform cursor-pointer"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      const m = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(markersGroup.current);
      m.on('click', () => setSelectedPin('pickup'));
    }

    dropoffs.forEach((drop, idx) => {
      // STRICT NULL CHECK ADDED
      if (drop && drop.lat && activeField !== idx) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-6 h-6 bg-[#FF3B30] text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-[0_4px_12px_rgba(255,59,48,0.5)] hover:scale-110 transition-transform cursor-pointer">${idx + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const m = L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(markersGroup.current);
        m.on('click', () => setSelectedPin(idx));
      }
    });
  }, [pickup, dropoffs, activeField, isDragging]);

  useEffect(() => {
    if (selectedPin === 'pickup' && pickup) {
      setContactForm({ name: pickup.contactName || '', phone: pickup.contactPhone || '', notes: pickup.notes || '' });
    } else if (typeof selectedPin === 'number' && dropoffs[selectedPin]) {
      const d = dropoffs[selectedPin];
      setContactForm({ name: d.contactName || '', phone: d.contactPhone || '', notes: d.notes || '' });
    }
  }, [selectedPin]);

  const handleSaveContactInfo = () => {
    if (selectedPin === 'pickup') {
      setPickup({ ...pickup, contactName: contactForm.name, contactPhone: contactForm.phone, notes: contactForm.notes });
    } else if (typeof selectedPin === 'number') {
      updateDropoff(selectedPin, { ...dropoffs[selectedPin], contactName: contactForm.name, contactPhone: contactForm.phone, notes: contactForm.notes });
    }
    setSelectedPin(null);
  };

  // ============================================================================
  // OSRM LINEAR ROUTING, VALIDATION, POLYLINE SNAPPING & AUTO-FITTING
  // ============================================================================
  useEffect(() => {
    const fetchRoute = async () => {
      if (!map.current || !window.L) return;
      const L = window.L;
      // STRICT NULL CHECK ALREADY PRESENT HERE
      const validDropoffs = dropoffs.filter(d => d && d.lat !== null && d.lat !== 0);

      if (pickup?.lat && validDropoffs.length > 0) {
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
            
            // Highly visible polyline responsive to theme
            routeLayer.current = L.polyline(routeCoords, {
              color: ['dark', 'satellite'].includes(mapTheme) ? '#4dabf7' : '#111111',
              weight: 5,
              opacity: 0.9,
              lineJoin: 'round',
              interactive: true
            }).addTo(map.current);

            // FEATURE: Map Auto-Fitting
            if (!programmaticMoveRef.current) {
              programmaticMoveRef.current = true;
              map.current.fitBounds(routeLayer.current.getBounds(), {
                paddingTopLeft: [50, 80], 
                paddingBottomRight: [50, 80] 
              });
            }

            // FEATURE: Route Snapping
            routeLayer.current.on('click', async (e) => {
              const { lat, lng } = e.latlng;
              const storeState = useBookingStore.getState();
              
              if (storeState.dropoffs.length >= 5) {
                setRouteError("Maximum of 5 drop-offs allowed.");
                return;
              }
              
              const newIndex = storeState.dropoffs.length;
              storeState.addDropoff({ address: 'Snapping to route...', lat, lng });
              
              try {
                const address = await reverseGeocodeWithCache(lat, lng);
                storeState.updateDropoff(newIndex, { address, lat, lng });
              } catch (error) {
                storeState.updateDropoff(newIndex, { address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
              }
            });
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
  }, [pickup, dropoffs, mapTheme]);

  // ============================================================================
  // AUTO-ROUTE OPTIMIZATION (OSRM Trip API)
  // ============================================================================
  const handleOptimizeRoute = async () => {
    // STRICT NULL CHECK ALREADY PRESENT HERE
    const validDropoffs = dropoffs.filter(d => d && d.lat !== null && d.lat !== 0);
    if (validDropoffs.length < 2 || !pickup?.lat) return;

    setIsOptimizing(true);
    try {
      const coords = [pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
      const res = await fetch(`https://router.project-osrm.org/trip/v1/driving/${coords}?roundtrip=false&source=first`);
      const data = await res.json();

      if (data.code === 'Ok') {
        const sortedWaypoints = data.waypoints.sort((a, b) => a.waypoint_index - b.waypoint_index);
        const optimizedDropoffs = [];
        
        sortedWaypoints.forEach(wp => {
          if (wp.original_index !== 0) {
            optimizedDropoffs.push(validDropoffs[wp.original_index - 1]);
          }
        });

        useBookingStore.setState({ dropoffs: optimizedDropoffs });
      }
    } catch (err) {
      console.error("Optimization failed", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // ============================================================================
  // VOICE SEARCH & NOMINATIM
  // ============================================================================
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Voice search is not supported in your browser.');
    
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setSearchQuery(event.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

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
      programmaticMoveRef.current = true;
      map.current.setView([lat, lng], 16);
    }
    
    setIsSearchOpen(false);
    setSearchQuery('');
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
    <div className="relative w-full h-[100dvh] bg-[#F2F4F7] overflow-hidden font-sans flex flex-col">
      
      {/* ========================================================= */}
      {/* TOP HALF: 45vh MAP CANVAS (STRICT HEADER ERADICATION) */}
      {/* ========================================================= */}
      <div className="relative w-full h-[45vh] shrink-0 z-10">
        <div ref={mapContainer} className="absolute inset-0 bg-[#e5e7eb]" />

        {/* Top Left Interaction Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>

        {/* Top Right Interaction Button (Custom Line Art Search) */}
        <button 
          onClick={() => setIsSearchOpen(true)} 
          className="absolute top-12 right-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
        >
          <LineIconRegistry name="search" size={20} strokeWidth={2.5} />
        </button>

        {/* Current Location Quick Action */}
        <button 
          onClick={() => fetchCurrentLocation()} 
          disabled={isLocating} 
          className="absolute top-28 right-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all disabled:opacity-50"
        >
          {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} strokeWidth={2.5} />}
        </button>

        {/* DRAGGABLE CENTER TARGET PIN */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {activeField === 'pickup' ? (
              <div className="w-5 h-5 bg-white border-[4px] border-[#111111] rounded-full shadow-md relative z-10" />
            ) : (
              <div className="w-6 h-6 bg-[#FF3B30] text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-[0_4px_12px_rgba(255,59,48,0.5)] relative z-10">
                {activeField + 1}
              </div>
            )}
            {(isDragging || isResolvingAddress) && <div className="absolute w-12 h-12 bg-[#111111]/10 rounded-full animate-ping" />}
          </div>
        </div>

        {/* OVERLAPPING FLOATING CARD */}
        <div className="absolute -bottom-8 left-5 right-5 z-[2000]">
          <FloatingLocationCard activeField={activeField} isResolving={isResolvingAddress} />
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM HALF: 55vh SCROLLABLE LIST OF CARDS */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pt-14 pb-8 px-5 space-y-4 z-0 relative">
        
        {/* Render Modular Input Cards */}
        <LocationInputCards 
          activeField={activeField} 
          onFocusField={focusField} 
          onOpenSearch={() => setIsSearchOpen(true)} 
        />

        {/* Action Controls */}
        <div className="pt-2 space-y-3">
          {routeError && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-[24px] font-bold text-[13px] flex items-start gap-2 shadow-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {routeError}
            </div>
          )}

          {/* STRICT NULL CHECK ADDED HERE TO PREVENT CRASH */}
          {dropoffs.length > 1 && dropoffs.filter(d => d && d.lat).length > 1 && (
            <SystemButton 
              onClick={handleOptimizeRoute} 
              disabled={isOptimizing} 
              loading={isOptimizing}
              variant="secondary"
              icon={Wand2}
            >
              Optimize Sequence
            </SystemButton>
          )}

          {/* STRICT NULL CHECK ADDED HERE TO PREVENT CRASH */}
          <SystemButton 
            onClick={() => navigate('/booking/select-vehicle')} 
            disabled={!pickup?.lat || dropoffs.some(d => !d || !d.lat) || !!routeError} 
            variant="primary"
          >
            Confirm Route {routeDistance && !routeError && <span className="text-gray-400 font-medium ml-1">• {routeDistance}</span>}
          </SystemButton>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEARCH MODAL WITH VOICE SUPPORT */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed inset-0 bg-[#F2F4F7] z-[10000] flex flex-col font-sans">
            <div className="pt-12 px-6 pb-4 flex items-center gap-4 bg-white border-b border-gray-100 shrink-0 shadow-sm">
              <button onClick={() => setIsSearchOpen(false)} className="w-[46px] h-[46px] rounded-full bg-[#F6F6F6] flex items-center justify-center text-[#111111] active:scale-95 shrink-0 transition-transform">
                <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
              </button>
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LineIconRegistry name="search" size={20} strokeWidth={2.5} />
                </div>
                <input 
                  type="text" 
                  autoFocus 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={activeField === 'pickup' ? "Search pickup location..." : "Where to drop off?"} 
                  className="w-full bg-[#F6F6F6] py-3.5 pl-12 pr-12 rounded-[24px] font-bold text-[15px] text-[#111111] outline-none focus:bg-gray-100 transition-colors" 
                />
                <button onClick={startVoiceSearch} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-400 hover:text-[#111111] hover:bg-gray-200'}`}>
                  <Mic size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-[#F2F4F7]">
              {isListening && (
                <div className="text-center py-8 text-gray-500 font-bold animate-pulse">Listening for address...</div>
              )}
              
              {!isListening && predictions.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm overflow-hidden p-2">
                  {predictions.map((pred, i) => (
                    <button key={i} onClick={() => handleSelectPrediction(pred)} className="w-full text-left px-4 py-4 rounded-[24px] hover:bg-[#F6F6F6] flex items-start gap-4 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#F2F4F7] flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                        <LineIconRegistry name="mapPin" size={18} strokeWidth={2.5} />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <span className="block text-[16px] font-black text-[#111111] truncate mb-0.5">{pred.description.split(',')[0]}</span>
                        <span className="block text-[13px] font-bold text-gray-400 truncate">{pred.description.split(',').slice(1).join(',').trim()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isListening && predictions.length === 0 && searchQuery.length < 3 && (
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_CHIPS.map(chip => (
                    <button key={chip.id} onClick={() => setSearchQuery(chip.query)} className="px-5 py-3 bg-white shadow-sm border border-gray-100 rounded-full text-[14px] font-bold text-[#111111] flex items-center gap-2 active:scale-95 transition-all">
                      <chip.icon size={16} className="text-gray-500" strokeWidth={2.5} /> {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MARKER CONTACT MODAL (Clicking a pin) */}
      <AnimatePresence>
        {selectedPin !== null && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[11000] flex items-end justify-center p-4 pb-8"
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative"
            >
              <button onClick={() => setSelectedPin(null)} className="absolute right-6 top-6 w-[46px] h-[46px] bg-[#F6F6F6] rounded-full flex items-center justify-center text-[#111111] hover:bg-gray-200 active:scale-95 transition-all">
                <X size={24} strokeWidth={2.5} />
              </button>
              
              <h2 className="text-[28px] font-black text-[#111111] mb-1 tracking-tighter">
                {selectedPin === 'pickup' ? 'Pickup Details' : `Dropoff ${selectedPin + 1} Details`}
              </h2>
              <p className="text-[14px] font-bold text-gray-400 mb-8 truncate pr-16">
                {selectedPin === 'pickup' ? pickup?.address : dropoffs[selectedPin]?.address}
              </p>

              <div className="space-y-4 mb-8">
                <div className="relative">
                  <User size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Contact Name" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-[#F6F6F6] py-4 pl-14 pr-4 rounded-[24px] font-bold text-[16px] text-[#111111] outline-none border-2 border-transparent focus:border-[#111111] transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone size={20} strokeWidth={2.5} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full bg-[#F6F6F6] py-4 pl-14 pr-4 rounded-[24px] font-bold text-[16px] text-[#111111] outline-none border-2 border-transparent focus:border-[#111111] transition-all"
                  />
                </div>
                <div className="relative">
                  <FileText size={20} strokeWidth={2.5} className="absolute left-5 top-5 text-gray-400" />
                  <textarea 
                    placeholder="Delivery Instructions" 
                    rows={3}
                    value={contactForm.notes}
                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                    className="w-full bg-[#F6F6F6] py-4 pl-14 pr-4 rounded-[24px] font-bold text-[16px] text-[#111111] outline-none border-2 border-transparent focus:border-[#111111] transition-all resize-none"
                  />
                </div>
              </div>

              <SystemButton 
                onClick={handleSaveContactInfo}
                variant="primary"
                icon={Check}
              >
                Save Details
              </SystemButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}