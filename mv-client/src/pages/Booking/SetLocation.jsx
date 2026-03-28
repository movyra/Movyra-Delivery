import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'framer-motion';
import { ChevronLeft, Crosshair, MapPin, Search } from 'lucide-react';
import AddressInputSheet from '../../components/Booking/AddressInputSheet';
import useBookingStore from '../../store/useBookingStore';

// ============================================================================
// PAGE: SET LOCATION (MOVYRA LIGHT THEME)
// A full-screen interactive map view for precise pickup/dropoff selection.
// Contains 6 Functional Sections: Real Geolocation API, MapLibre Engine, 
// Map Telemetry Tracking, Floating Top Bar, Dynamic Center Pin, and Bottom Overlay.
// ============================================================================

export default function SetLocation() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Zustand Store Integration
  const { pickup, dropoff, setPickup } = useBookingStore();

  // Local State Management
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentCenter, setCurrentCenter] = useState([0, 0]);

  // SECTION 1: Real Geolocation API Engine
  // Fetches the user's actual GPS coordinates instead of mocking data
  const requestUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          if (map.current) {
            map.current.flyTo({ center: [longitude, latitude], zoom: 15, essential: true });
            setCurrentCenter([longitude, latitude]);
          }
        },
        (error) => console.warn("Geolocation denied or unavailable:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  // SECTION 2: MapLibre GL Premium Light Theme Initialization
  useEffect(() => {
    if (map.current) return; // Prevent double initialization in Strict Mode

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Premium light-theme basemap perfectly matching Movyra's aesthetic
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', 
      center: pickup ? [pickup.lng, pickup.lat] : [77.2090, 28.6139], // Default to Delhi if no GPS/Store
      zoom: pickup ? 15 : 12,
      attributionControl: false,
      dragRotate: false,
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      if (!pickup && !dropoff) {
        requestUserLocation(); // Auto-locate if no addresses are set yet
      }
    });

    // SECTION 3: Map Telemetry Tracking
    // Real-time detection of map movement to power the center pin logic
    map.current.on('movestart', () => setIsDragging(true));
    
    map.current.on('moveend', () => {
      setIsDragging(false);
      const center = map.current.getCenter();
      setCurrentCenter([center.lng, center.lat]);
      
      // Update global store logic implicitly (to be confirmed by bottom sheet)
      if (!pickup) {
         setPickup({ lat: center.lat, lng: center.lng, address: "Selected Location" });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Sync external store updates (e.g., from the bottom sheet search)
  useEffect(() => {
    if (!map.current || (!pickup && !dropoff) || isDragging) return;
    if (pickup && pickup.lng && pickup.lat) {
      map.current.flyTo({ center: [pickup.lng, pickup.lat], zoom: 15 });
    }
  }, [pickup, dropoff]);

  return (
    <div className="relative w-full h-screen bg-[#F3F4F6] overflow-hidden font-sans">
      
      {/* SECTION 4: The Map Viewport */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.8 }}
        ref={mapContainer} 
        className="absolute inset-0 z-0" 
      />

      {/* SECTION 5: Floating Top Search/Menu Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute top-0 left-0 right-0 pt-14 px-6 z-20 pointer-events-none"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-[24px] p-3 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white/50 flex items-center justify-between pointer-events-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          
          <div className="flex-1 px-4 flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Set Location</span>
             <span className="font-bold text-sm text-gray-900 truncate max-w-[150px]">
               {currentCenter[1].toFixed(4)}, {currentCenter[0].toFixed(4)}
             </span>
          </div>

          <button 
            onClick={requestUserLocation}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-movyra-blue active:scale-95 transition-all shadow-sm"
          >
            <Crosshair size={22} strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>

      {/* SECTION 6: Dynamic Center Map Pin (Bounces when dragging) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center justify-center">
        <motion.div
          animate={{ 
            y: isDragging ? -15 : 0, 
            scale: isDragging ? 1.1 : 1,
            color: isDragging ? '#1E6AF5' : '#0F172A' // Blue when lifting, dark when set
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative drop-shadow-xl"
        >
          {/* Custom Modern Map Pin Vector */}
          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
             <MapPin size={20} strokeWidth={3} fill="currentColor" />
          </div>
          {/* Pin shadow needle */}
          <div className="w-1 h-3 bg-gray-900 mx-auto -mt-1 rounded-b-full"></div>
        </motion.div>
        
        {/* Ground drop shadow pulsing indicator */}
        <motion.div 
          animate={{ 
            scale: isDragging ? 0.5 : 1, 
            opacity: isDragging ? 0.3 : 0.8 
          }}
          className="w-3 h-1.5 bg-black/30 rounded-[100%] blur-[2px] mt-1"
        />
      </div>

      {/* SECTION 7: Bottom Action Overlay Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto">
        <AddressInputSheet onAddressesSet={() => navigate('/booking/select-vehicle')} />
      </div>

    </div>
  );
}