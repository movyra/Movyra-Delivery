import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Crosshair, Plus, X, Home, 
  Briefcase, Bookmark, Loader2, Search, ArrowUpDown, AlertCircle, 
  Maximize, Minimize, MapPin, Train, Star, Clock
} from 'lucide-react';

// Real Store & Service Integrations
import useBookingStore from '../../store/useBookingStore';
import useLocationStore from '../../store/useLocationStore';
import { reverseGeocode, fetchPlacePredictions, geocodeAddress } from '../../services/googleMaps';
import { fetchUserAddresses } from '../../services/firestore';

// ============================================================================
// PAGE: SET LOCATION (STRICT OPENSTREETMAP ARCHITECTURE)
// A high-stability, multi-stop routing interface powered by Leaflet Raster Tiles.
// Features: 100% Free OSM Engine, Real OSRM Routing, Category POI Search,
// Custom DOM Markers, Draggable Pin Logic, and Algorithmic Auto-Bounds.
// ============================================================================

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
  const markersGroup = useRef(L.layerGroup()); // Group for dynamic cleanup
  const routeLayer = useRef(null); // Reference for the OSRM line
  
  // Global State
  const { pickup, dropoffs, setPickup, addDropoff, updateDropoff, removeDropoff } = useBookingStore();
  const { fetchCurrentLocation, currentLocation, isLocating } = useLocationStore();

  // Local UI State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeField, setActiveField] = useState('pickup');
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
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

  useEffect(() => {
    if (dropoffs.length === 0) addDropoff({ address: '', lat: 0, lng: 0 });
    fetchUserAddresses().then(setSavedAddresses).catch(console.error);
  }, [dropoffs.length, addDropoff]);

  // ============================================================================
  // LOGIC: OPENSTREETMAP INITIALIZATION (LEAFLET ENGINE)
  // ============================================================================
  useEffect(() => {
    if (map.current) return;

    const initialCenter = pickup?.lat ? [pickup.lat, pickup.lng] : [28.6139, 77.2090];

    // Initialize Leaflet Map
    map.current = L.map(mapContainer.current, {
      center: initialCenter,
      zoom: pickup?.lat ? 15 : 12,
      zoomControl: false,
      attributionControl: false
    });

    // Inject Official OpenStreetMap Raster Tiles (Fixes blank WebGL canvas)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map.current);

    markersGroup.current.addTo(map.current);

    map.current.on('load', () => setIsMapLoaded(true));
    // Leaflet specific fix: some browsers need a tiny delay to register container size
    setTimeout(() => map.current?.invalidateSize(), 100);

    map.current.on('movestart', () => setIsDragging(true));
    
    // Feature: Draggable Reverse-Geocoding Pin logic
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
        const fallback = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
        if (activeField === 'pickup') setPickup({ ...locData, address: fallback });
        else updateDropoff(activeField, { ...locData, address: fallback });
      } finally {
        setIsResolvingAddress(false);
      }
    });

    setIsMapLoaded(true);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [activeField]);

  // GPS Sync
  useEffect(() => {
    if (currentLocation && map.current && activeField === 'pickup') {
      map.current.setView([currentLocation.lat, currentLocation.lng], 16);
      setPickup({ lat: currentLocation.lat, lng: currentLocation.lng, address: 'Current Location' });
    }
  }, [currentLocation]);

  // ============================================================================
  // FEATURE: CUSTOM DYNAMIC DOM MARKERS (LEAFLET PORT)
  // ============================================================================
  useEffect(() => {
    if (!map.current) return;
    markersGroup.current.clearLayers();

    if (!isDragging && pickup?.lat && dropoffs.some(d => d.lat !== 0)) {
      // Pickup Marker
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div class="w-4 h-4 bg-white rounded-full border-4 border-black shadow-md ring-2 ring-white"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(markersGroup.current);

      // Numbered Dropoff Markers
      dropoffs.forEach((drop, idx) => {
        if (drop.lat !== 0) {
          const dropIcon = L.divIcon({
            className: '',
            html: `<div class="w-6 h-6 bg-black text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md">${idx + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(markersGroup.current);
        }
      });
    }
  }, [pickup, dropoffs, isDragging]);

  // ============================================================================
  // FEATURE: PERFECT OSRM LINEAR ROUTING (LEAFLET POLYLINE PORT)
  // ============================================================================
  useEffect(() => {
    const fetchRoute = async () => {
      if (!map.current) return;
      const validDropoffs = dropoffs.filter(d => d.lat !== 0);

      if (pickup?.lat && validDropoffs.length > 0) {
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
            
            // Create a high-contrast dark blue polyline for OSM
            routeLayer.current = L.polyline(routeCoords, {
              color: '#000000',
              weight: 5,
              opacity: 0.9,
              lineJoin: 'round'
            }).addTo(map.current);

            // Algorithmic Auto-Bounds
            if (!isDragging && !isSearchOpen) {
              map.current.fitBounds(routeLayer.current.getBounds(), {
                padding: [60, 60],
                maxZoom: 16
              });
            }
          }
        } catch (err) { console.error(err); }
      } else {
        if (routeLayer.current) {
          map.current.removeLayer(routeLayer.current);
          routeLayer.current = null;
        }
        setRouteDistance('');
        setRouteDuration('');
      }
    };
    fetchRoute();
  }, [pickup, dropoffs, isDragging, isSearchOpen]);

  // Search prediction logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsTyping(true);
        try {
          const center = map.current ? map.current.getCenter() : { lat: 20, lng: 79 };
          const results = await fetchPlacePredictions(searchQuery, center.lat, center.lng);
          setPredictions(results);
        } catch (err) { console.error(err); }
        finally { setIsTyping(false); }
      } else setPredictions([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPrediction = async (prediction) => {
    setIsTyping(true);
    try {
      const geo = await geocodeAddress(prediction.place_id || prediction.description);
      const locData = { address: geo.formattedAddress, lat: geo.lat, lng: geo.lng };
      if (activeField === 'pickup') setPickup(locData);
      else updateDropoff(activeField, locData);
      if (map.current) map.current.setView([geo.lat, geo.lng], 16);
      setIsSearchOpen(false);
      setSearchQuery('');
    } catch (err) { console.error(err); }
    finally { setIsTyping(false); }
  };

  const handleCategoryClick = (cat) => {
    if (cat.query) { setSearchQuery(cat.query); setIsSearchOpen(true); }
    else setIsSearchOpen(true);
  };

  const handleSwapRoute = () => {
    if (dropoffs[0]?.lat && pickup?.lat) {
      const temp = { ...pickup };
      setPickup({ ...dropoffs[0] });
      updateDropoff(0, temp);
      map.current?.setView([dropoffs[0].lat, dropoffs[0].lng], 15);
    }
  };

  const handleQuickSet = (addr) => {
    const data = { address: addr.address, lat: addr.lat, lng: addr.lng };
    if (activeField === 'pickup') setPickup(data);
    else updateDropoff(activeField, data);
    map.current?.setView([addr.lat, addr.lng], 16);
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden font-sans flex flex-col">
      {/* FLOATING HEADER */}
      <div className="absolute top-0 left-0 right-0 pt-12 px-6 z-[1000] pointer-events-none flex justify-between">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow-md pointer-events-auto border border-gray-100 active:scale-95 transition-all">
          <ChevronLeft size={26} strokeWidth={2.5} />
        </button>
        <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center shadow-lg pointer-events-auto overflow-hidden p-2.5">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-contain" />
        </div>
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
            {routeDistance && !isFullscreen && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-black text-white px-4 py-3 rounded-2xl shadow-xl pointer-events-auto flex flex-col items-end gap-0.5">
                <span className="font-black text-[16px] leading-none">{routeDistance}</span>
                <span className="font-bold text-[11px] text-gray-400 uppercase tracking-widest">{routeDuration} ETA</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DRAGGABLE CENTER TARGET PIN */}
        {(!pickup?.lat || dropoffs.every(d => d.lat === 0) || isDragging) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-black rounded-full shadow-md relative z-10 ring-4 ring-white" />
              {(isDragging || isResolvingAddress) && <div className="absolute w-12 h-12 bg-black/10 rounded-full animate-ping" />}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SHEET UI */}
      <motion.div initial={{ y: 0 }} animate={{ y: isFullscreen ? '100%' : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] relative z-[1001] flex flex-col max-h-[70vh] absolute bottom-0 left-0 right-0">
        <div className="p-6 pb-4 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => { setIsFullscreen(!isFullscreen); setTimeout(() => map.current?.invalidateSize(), 300); }}></div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[36px] font-black tracking-tighter text-black leading-none">Where to?</h1>
            <button onClick={() => { setActiveField('pickup'); fetchCurrentLocation(); }} disabled={isLocating} className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black hover:bg-gray-200 active:scale-95 disabled:opacity-50">
              {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={20} strokeWidth={2.5} />}
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-2">
            {CATEGORY_CHIPS.map(chip => (
              <button key={chip.id} onClick={() => handleCategoryClick(chip)} className="shrink-0 px-4 py-2.5 bg-[#F6F6F6] rounded-2xl text-[14px] font-bold text-black flex items-center gap-2 border-2 border-transparent hover:border-black active:scale-95 transition-all">
                <chip.icon size={16} className="text-gray-500" strokeWidth={2.5} /> {chip.label}
              </button>
            ))}
          </div>

          {savedAddresses.length > 0 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {savedAddresses.map(addr => (
                <button key={addr.id} onClick={() => handleQuickSet(addr)} className="shrink-0 px-5 py-2.5 bg-gray-50 text-black rounded-full text-[14px] font-bold flex items-center gap-2 hover:bg-gray-100">
                  <Bookmark size={16} strokeWidth={2.5} /> {addr.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 overflow-y-auto no-scrollbar pb-6 shrink min-h-[150px]">
          <div className="relative border-l-2 border-dashed border-gray-300 ml-4 pl-6 space-y-4 py-2">
            <button onClick={handleSwapRoute} className="absolute -left-[20px] top-[42px] z-10 w-10 h-10 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-black shadow-sm active:scale-95">
              <ArrowUpDown size={18} strokeWidth={2.5} />
            </button>
            <div className="relative">
              <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full ring-4 ring-white" />
              <input type="text" readOnly onClick={() => { setActiveField('pickup'); setIsSearchOpen(true); }} value={pickup?.address || ''} placeholder="Set Pickup Location" className={`w-full bg-[#F6F6F6] p-4 rounded-2xl font-bold text-[16px] text-black border-2 transition-all outline-none ${activeField === 'pickup' ? 'border-black bg-white shadow-sm' : 'border-transparent'}`} />
            </div>
            {dropoffs.map((drop, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative flex items-center gap-3">
                <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-black rounded-full ring-4 ring-white" />
                <input type="text" readOnly onClick={() => { setActiveField(idx); setIsSearchOpen(true); }} value={drop.address || ''} placeholder={`Dropoff ${idx + 1}`} className={`flex-1 bg-[#F6F6F6] p-4 rounded-2xl font-bold text-[16px] text-black border-2 transition-all outline-none ${activeField === idx ? 'border-black bg-white shadow-sm' : 'border-transparent'}`} />
                {dropoffs.length > 1 && <button onClick={() => removeDropoff(idx)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:text-black transition-all shrink-0 active:scale-95"><X size={20} strokeWidth={2.5} /></button>}
              </motion.div>
            ))}
          </div>
          {dropoffs.length < 5 && (
            <button onClick={() => { addDropoff({ address: '', lat: 0, lng: 0 }); setActiveField(dropoffs.length); setIsSearchOpen(true); }} className="mt-4 ml-2 text-[15px] font-bold text-black flex items-center gap-2 hover:opacity-70">
              <div className="w-6 h-6 rounded-full bg-[#F6F6F6] flex items-center justify-center"><Plus size={16} strokeWidth={3} /></div>
              Add another stop
            </button>
          )}
        </div>

        <div className="p-6 pt-2 bg-white border-t border-gray-100">
          {routeError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold text-[13px] flex items-start gap-2 mb-4"><AlertCircle size={16} className="shrink-0 mt-0.5" /> {routeError}</div>}
          <button onClick={() => navigate('/booking/select-vehicle')} disabled={!pickup?.lat || dropoffs.some(d => !d.lat)} className="w-full bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
            Confirm Route {routeDistance && <span className="text-gray-400 font-medium">• {routeDistance}</span>}
          </button>
        </div>
      </motion.div>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed inset-0 bg-white z-[10000] flex flex-col font-sans">
            <div className="pt-12 px-6 pb-4 flex items-center gap-4 border-b border-gray-100 shrink-0 shadow-sm">
              <button onClick={() => setIsSearchOpen(false)} className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-black active:scale-95 shrink-0"><ChevronLeft size={24} strokeWidth={2.5} /></button>
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Search size={20} strokeWidth={2.5} /></div>
                <input type="text" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={activeField === 'pickup' ? "Where from?" : "Where to?"} className="w-full bg-[#F6F6F6] py-3.5 pl-12 pr-10 rounded-2xl font-bold text-[16px] text-black border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none" />
                {isTyping && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={18} className="animate-spin text-black" /></div>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {predictions.map((pred) => (
                  <button key={pred.place_id} onClick={() => handleSelectPrediction(pred)} className="w-full text-left px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-[#F6F6F6] flex items-start gap-3 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 mt-0.5"><MapPin size={16} strokeWidth={2.5} /></div>
                    <div className="overflow-hidden">
                      <span className="block text-[15px] font-bold text-black truncate">{pred.description.split(',')[0]}</span>
                      <span className="block text-[13px] font-medium text-gray-500 truncate">{pred.description.split(',').slice(1).join(',').trim()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}