import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Crosshair, X, 
  Briefcase, Loader2, Search, AlertCircle, 
  MapPin, Train, Star, Clock, Mic, Wand2, User, Phone, FileText, Check
} from 'lucide-react';

// Real Store Integrations
import useBookingStore from '../../store/useBookingStore';
import useLocationStore from '../../store/useLocationStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';

// Services & Overlays
import { MAP_LAYERS } from '../../services/mapLayers';
import { reverseGeocodeWithCache } from '../../services/geocodeCache';
import MapActionFAB from '../../components/Map/MapActionFAB';
import DraggableWaypointList from '../../components/Map/DraggableWaypointList';
import MiniRouteSummary from '../../components/Map/MiniRouteSummary';
import TimelineInputList from '../../components/Map/TimelineInputList';

/**
 * PAGE: SET LOCATION (ADVANCED OPENSTREETMAP ARCHITECTURE)
 * Features: 
 * - Fullscreen Immersive Mode & Header Removal
 * - Map Bounds Auto-Fitting (Camera locks onto active route)
 * - Geocoding Cache Optimization (Session Storage intercepts)
 * - Vertical Timeline Input Engine
 * - Floating Mini Route Summary
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
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Listen to Native Browser Fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => map.current?.invalidateSize(), 300);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
        // Optimized Geocoding Cache Intercept
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
        html: `<div class="w-4 h-4 bg-white rounded-full border-4 border-black shadow-md ring-2 ring-white hover:scale-125 transition-transform cursor-pointer"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      const m = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(markersGroup.current);
      m.on('click', () => setSelectedPin('pickup'));
    }

    dropoffs.forEach((drop, idx) => {
      if (drop.lat && activeField !== idx) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-6 h-6 bg-black text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer">${idx + 1}</div>`,
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
      const validDropoffs = dropoffs.filter(d => d.lat !== null && d.lat !== 0);

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
            
            routeLayer.current = L.polyline(routeCoords, {
              color: ['dark', 'satellite'].includes(mapTheme) ? '#4dabf7' : '#276EF1',
              weight: 5,
              opacity: 0.9,
              lineJoin: 'round',
              interactive: true
            }).addTo(map.current);

            // FEATURE: Map Auto-Fitting (Zoom out to see the entire route cleanly above the bottom sheet)
            if (!programmaticMoveRef.current) {
              programmaticMoveRef.current = true;
              map.current.fitBounds(routeLayer.current.getBounds(), {
                paddingTopLeft: [50, 100], 
                paddingBottomRight: [50, 450] // Generous bottom padding for the timeline sheet
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
    const validDropoffs = dropoffs.filter(d => d.lat !== null && d.lat !== 0);
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
    <div className="relative w-full h-screen bg-[#1a1a1a] overflow-hidden font-sans flex flex-col">
      
      {/* ========================================================= */}
      {/* FLOATING CONTROLS & OVERLAYS (STRICT HEADER ERADICATION) */}
      {/* ========================================================= */}
      
      {/* Floating Standalone Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 z-[2000] w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-md border border-gray-100 active:scale-95 transition-all"
      >
        <ChevronLeft size={28} strokeWidth={2.5} />
      </button>

      <MapActionFAB />
      <DraggableWaypointList />
      <MiniRouteSummary distance={routeDistance} duration={routeDuration} />

      {/* OPENSTREETMAP VIEWPORT */}
      <div className="flex-1 relative z-0">
        <div ref={mapContainer} className="absolute inset-0 bg-[#f8f8f8]" />
        
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

      {/* BOTTOM SHEET UI (TIMELINE ENGINE INJECTION) */}
      <motion.div 
        initial={{ y: 0 }} 
        animate={{ 
          y: isFullscreen ? '120%' : 0, 
          opacity: isFullscreen ? 0 : 1 
        }} 
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ pointerEvents: isFullscreen ? 'none' : 'auto' }}
        className="bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] relative z-[1001] flex flex-col max-h-[70vh] absolute bottom-0 left-0 right-0"
      >
        <div className="p-6 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[36px] font-black tracking-tighter text-black leading-none">Where to?</h1>
            <div className="flex items-center gap-2">
              {dropoffs.length > 1 && dropoffs.filter(d => d.lat).length > 1 && (
                <button onClick={handleOptimizeRoute} disabled={isOptimizing} className="h-10 px-4 rounded-full bg-blue-50 text-blue-600 flex items-center gap-2 hover:bg-blue-100 active:scale-95 transition-all font-bold text-[13px]">
                  {isOptimizing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} strokeWidth={2.5} />}
                  Auto-Sort
                </button>
              )}
              <button onClick={() => { fetchCurrentLocation(); }} disabled={isLocating} className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black hover:bg-gray-200 active:scale-95 disabled:opacity-50 transition-all">
                {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-2">
            {CATEGORY_CHIPS.map(chip => (
              <button key={chip.id} onClick={() => { setSearchQuery(chip.query); setIsSearchOpen(true); }} className="shrink-0 px-4 py-2.5 bg-[#F6F6F6] rounded-2xl text-[14px] font-bold text-black flex items-center gap-2 border-2 border-transparent hover:border-black active:scale-95 transition-all">
                <chip.icon size={16} className="text-gray-500" strokeWidth={2.5} /> {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* MODULAR TIMELINE INPUT LIST */}
        <div className="px-6 overflow-y-auto no-scrollbar pb-6 shrink min-h-[150px]">
          <TimelineInputList 
            activeField={activeField} 
            onFocusField={focusField} 
            onOpenSearch={() => setIsSearchOpen(true)} 
          />
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
            Confirm Route
          </button>
        </div>
      </motion.div>

      {/* SEARCH OVERLAY WITH VOICE SEARCH */}
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
                  className="w-full bg-[#F6F6F6] py-3.5 pl-12 pr-12 rounded-2xl font-bold text-[16px] text-black border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none" 
                />
                <button onClick={startVoiceSearch} className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:text-black hover:bg-gray-100'}`}>
                  <Mic size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
              {isListening && (
                <div className="text-center py-8 text-gray-500 font-bold animate-pulse">
                  Listening for address...
                </div>
              )}
              {!isListening && (
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[11000] flex items-end justify-center p-4"
          >
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg rounded-[32px] p-6 shadow-2xl relative"
            >
              <button onClick={() => setSelectedPin(null)} className="absolute right-6 top-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-95 transition-all">
                <X size={20} strokeWidth={2.5} />
              </button>
              
              <h2 className="text-[24px] font-black text-black mb-1">
                {selectedPin === 'pickup' ? 'Pickup Details' : `Dropoff ${selectedPin + 1} Details`}
              </h2>
              <p className="text-[14px] font-medium text-gray-500 mb-6 truncate pr-12">
                {selectedPin === 'pickup' ? pickup?.address : dropoffs[selectedPin]?.address}
              </p>

              <div className="space-y-4 mb-8">
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Contact Name (e.g., John Doe)" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-[#F6F6F6] py-4 pl-12 pr-4 rounded-2xl font-bold text-[15px] text-black outline-none border-2 border-transparent focus:border-black transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full bg-[#F6F6F6] py-4 pl-12 pr-4 rounded-2xl font-bold text-[15px] text-black outline-none border-2 border-transparent focus:border-black transition-all"
                  />
                </div>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-4 text-gray-400" />
                  <textarea 
                    placeholder="Delivery Instructions (Gate code, etc.)" 
                    rows={3}
                    value={contactForm.notes}
                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                    className="w-full bg-[#F6F6F6] py-4 pl-12 pr-4 rounded-2xl font-bold text-[15px] text-black outline-none border-2 border-transparent focus:border-black transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveContactInfo}
                className="w-full bg-black text-white py-4 rounded-full font-bold text-[17px] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Check size={20} strokeWidth={3} /> Save Location Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}