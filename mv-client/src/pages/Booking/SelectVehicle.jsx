import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Clock, Loader2, Info, Crosshair
} from 'lucide-react';

// ============================================================================
// INLINE COMPONENT & STORE DEPENDENCIES (Resolved for Isolated Preview)
// ============================================================================

const MAP_LAYERS = { standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' };

const useBookingStore = () => {
  const [vehicleType, setVehicleType] = useState('bike');
  return {
    pickup: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' },
    dropoffs: [{ lat: 28.5355, lng: 77.3910, address: 'Noida Sector 62' }],
    vehicleType,
    setVehicle: setVehicleType,
    setPricing: () => {}
  };
};

const useMapSettingsStore = () => ({ mapTheme: 'standard' });

const LineIconRegistry = ({ name, size = 24, color = "currentColor", strokeWidth = 2, className = "" }) => {
  const ICONS = {
    car: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 10l1.5-4.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L19 10" /><path d="M22 10v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2z" /><circle cx="7" cy="15" r="1.5" /><circle cx="17" cy="15" r="1.5" /></svg>,
    box: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    scooter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M19 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M11 17H5l2-14h5" /><path d="M19 17h-6l-2-7" /></svg>,
    mapPin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
  };
  return ICONS[name] || ICONS['box'];
};

const SystemCard = ({ children, variant = 'white', className = '', onClick, animated = false }) => {
  const baseStyle = "rounded-[32px] p-6 transition-all duration-300";
  const variants = { white: "bg-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50" };
  const combinedClasses = `${baseStyle} ${variants[variant] || variants.white} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`;
  
  if (animated || onClick) {
    return (
      <motion.div layout={animated} initial={animated ? { opacity: 0, y: 10 } : false} animate={animated ? { opacity: 1, y: 0 } : false} exit={animated ? { opacity: 0, scale: 0.95 } : false} onClick={onClick} className={combinedClasses}>
        {children}
      </motion.div>
    );
  }
  return <div onClick={onClick} className={combinedClasses}>{children}</div>;
};

const SystemButton = ({ children, onClick, disabled = false, loading = false, variant = 'primary', icon: Icon, className = '' }) => {
  const baseStyle = "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[28px] font-black text-[17px] transition-all h-[64px] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100";
  const variants = {
    primary: "bg-[#111111] text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-gray-900",
    secondary: "bg-[#F2F4F7] text-[#111111] border border-gray-200 hover:bg-gray-200",
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}>
      {loading ? <Loader2 size={24} className="animate-spin" strokeWidth={3} /> : <>{Icon && <Icon size={22} strokeWidth={2.5} />}<span className="truncate">{children}</span></>}
    </button>
  );
};

const SystemToggle = ({ tabs, activeTab, onTabChange, className = '' }) => (
  <div className={`bg-white p-1.5 rounded-full flex shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 relative ${className}`}>
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button key={tab.id} onClick={() => onTabChange(tab.id)} className="relative flex-1 py-3 px-4 rounded-full text-[14px] font-bold outline-none transition-colors duration-300 z-10 flex items-center justify-center gap-2" style={{ WebkitTapHighlightColor: 'transparent' }}>
          {isActive && <motion.div layoutId="system-toggle-active" className="absolute inset-0 bg-[#111111] rounded-full z-[-1] shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
          <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-500 hover:text-[#111111]'}`}>{tab.label}</span>
        </button>
      );
    })}
  </div>
);

const FloatingLocationCard = ({ activeField, isResolving, pickup, dropoffs }) => {
  const safePickup = pickup || { address: '', lat: null, lng: null };
  const safeDropoffs = Array.isArray(dropoffs) ? dropoffs : [];
  
  const getActiveData = () => {
    if (activeField === 'pickup') {
      return { title: 'Pickup Location', address: safePickup?.address || 'Set pickup point...', icon: <Crosshair size={20} className="text-[#111111] rotate-45" strokeWidth={2.5} /> };
    }
    const activeIndex = typeof activeField === 'number' ? activeField : 0;
    const safeDrop = safeDropoffs.length > activeIndex ? safeDropoffs[activeIndex] : null;
    return { title: `Dropoff Location ${activeIndex + 1}`, address: safeDrop?.address || 'Set dropoff point...', icon: <Crosshair size={20} className="text-[#111111]" strokeWidth={2.5} /> };
  };
  
  const activeData = getActiveData();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="w-full">
      <div className="bg-[#BCE3FF] rounded-[32px] p-5 shadow-[0_10px_30px_rgba(188,227,255,0.4)] flex items-center gap-4 relative overflow-hidden border border-[#A5D5F9]">
        <div className="shrink-0 flex items-center justify-center w-[42px] h-[42px] bg-white/40 rounded-full">
          {isResolving ? <Loader2 size={20} className="text-[#111111] animate-spin" strokeWidth={2.5} /> : activeData.icon}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-[17px] font-black text-[#111111] tracking-tight leading-tight truncate mb-0.5">{activeData.title}</h3>
          <p className="text-[13px] font-bold text-[#4A6B85] truncate">{activeData.address}</p>
        </div>
        <div className="shrink-0 px-4 py-2 bg-white/40 rounded-full backdrop-blur-sm flex items-center justify-center shadow-sm">
          <span className="text-[11px] font-black text-[#111111] uppercase tracking-widest">{isResolving ? 'Locating' : 'Active'}</span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * PAGE: SELECT VEHICLE (SPLIT-SCREEN CARD UI)
 * Architecture: 45vh/55vh Strict Split-Screen Layout
 * Features: 
 * - Headerless Map Canvas (Read-Only Route View)
 * - Floating Location Pill Overlap
 * - SystemCard Integration for Vehicles (Massive Typography)
 * - Real-time OSRM Distance Pricing Engine
 */

const VEHICLE_SPECS = {
  'bike': { name: 'Moto', capacity: '20 kg', volume: 'Backpack', etaOffset: 0, baseFare: 40, perKm: 12, iconName: 'scooter' },
  '3wheeler': { name: '3-Wheeler', capacity: '500 kg', volume: 'Small Furniture', etaOffset: 15, baseFare: 90, perKm: 25, iconName: 'car' },
  'minitruck': { name: 'Mini Truck', capacity: '1000 kg', volume: '1 BHK Size', etaOffset: 25, baseFare: 250, perKm: 40, iconName: 'box' }
};

export default function SelectVehicle() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayer = useRef(null);
  
  // Global States
  const { pickup, dropoffs, vehicleType, setVehicle, setPricing } = useBookingStore();
  const { mapTheme } = useMapSettingsStore();
  
  // Strict Fallback to prevent silent crashes from corrupted/legacy persist storage
  const safeDropoffs = Array.isArray(dropoffs) ? dropoffs : [];
  
  // Local UI State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGroupDelivery, setIsGroupDelivery] = useState(false);
  
  // Real-time Pricing State
  const [routeMetrics, setRouteMetrics] = useState({ distanceKm: 0, baseDurationMins: 0 });
  const [livePrices, setLivePrices] = useState({});

  // ============================================================================
  // DYNAMIC CDN LOADER FOR LEAFLET
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
  // LOGIC: OPENSTREETMAP ENGINE (LEAFLET READ-ONLY PLOTTING)
  // ============================================================================
  useEffect(() => {
    if (!isMapLoaded) return;
    const L = window.L;

    const validDropoffs = safeDropoffs.filter(d => d && d.lat != null && d.lat !== 0);
    if (!pickup?.lat || validDropoffs.length === 0 || !mapContainer.current) return;

    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        center: [pickup.lat, pickup.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        touchZoom: true
      });
      L.tileLayer(MAP_LAYERS[mapTheme] || MAP_LAYERS.standard).addTo(map.current);
    }

    // Clear existing layers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current.removeLayer(layer);
      }
    });

    const points = [];

    // Plot Pickup Marker (Hollow Dot)
    const pickupIcon = L.divIcon({
      className: '',
      html: `<div class="w-4 h-4 bg-white border-[4px] border-[#111111] rounded-full shadow-md"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map.current);
    points.push([pickup.lat, pickup.lng]);

    // Plot Dropoff Markers (Solid Red Pin)
    validDropoffs.forEach((drop) => {
      const dropIcon = L.divIcon({
        className: '',
        html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.5)] border-[3px] border-white"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
      points.push([drop.lat, drop.lng]);
    });

    // Fetch and draw route polyline
    const fetchRoutePolyline = async () => {
      try {
        const coords = [pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
        const data = await res.json();
        
        if (data.code === 'Ok') {
          const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          routeLayer.current = L.polyline(routeCoords, {
            color: ['dark', 'satellite'].includes(mapTheme) ? '#4dabf7' : '#111111',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round'
          }).addTo(map.current);
          
          map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 80], paddingBottomRight: [50, 80] });
        }
      } catch (err) {
        console.error("OSRM Polyline Error:", err);
        map.current.fitBounds(L.latLngBounds(points), { padding: [50, 80] });
      }
    };
    
    fetchRoutePolyline();
    setTimeout(() => map.current?.invalidateSize(), 200);

  }, [pickup, safeDropoffs, mapTheme, isMapLoaded]);

  // ============================================================================
  // LOGIC: REAL-TIME DISTANCE (OSRM) & PRICING ENGINE
  // ============================================================================
  useEffect(() => {
    const fetchRealPricing = async () => {
      const validDropoffs = safeDropoffs.filter(d => d && d.lat != null && d.lat !== 0);
      
      if (!pickup?.lat || validDropoffs.length === 0) {
        setError('Valid pickup and drop-off locations are required. Please go back and set them.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // Fetch Real Distance & ETA via OSRM API
        const coords = [pickup, ...validDropoffs].map(loc => `${loc.lng},${loc.lat}`).join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`);
        const data = await res.json();

        if (data.code !== 'Ok') throw new Error('Failed to compute route.');

        const distanceKm = data.routes[0].distance / 1000;
        const durationMins = Math.round(data.routes[0].duration / 60);

        setRouteMetrics({ distanceKm, baseDurationMins: durationMins });

        // Compute Real Dynamic Pricing (₹ INR)
        const currentHour = new Date().getHours();
        const surgeMultiplier = (currentHour >= 17 && currentHour <= 20) ? 1.25 : 1.0;

        const computedPrices = {};
        for (const [vType, specs] of Object.entries(VEHICLE_SPECS)) {
          const rawFare = specs.baseFare + (distanceKm * specs.perKm);
          computedPrices[vType] = {
            totalFare: Math.round(rawFare * surgeMultiplier),
            surgeMultiplier: surgeMultiplier
          };
        }
        
        setLivePrices(computedPrices);

        // Auto-select first vehicle if none selected globally
        if (!vehicleType) setVehicle('bike');

      } catch (err) {
        console.error("Pricing Engine Error:", err);
        setError('Failed to calculate live route metrics. Please check your network connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealPricing();
  }, [pickup, safeDropoffs, vehicleType, setVehicle]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleConfirm = () => {
    if (vehicleType && livePrices[vehicleType]) {
      const baseFareObj = livePrices[vehicleType];
      
      // Apply Group Pool Discount logic natively
      const finalTotal = isGroupDelivery 
        ? Math.max(Math.round(baseFareObj.totalFare * 0.8), 20) // 20% off for pooling, min ₹20
        : baseFareObj.totalFare;

      // Commit strictly to Zustand Store
      setPricing({
        estimatedPrice: finalTotal,
        surgeMultiplier: baseFareObj.surgeMultiplier,
        isGroupDelivery: isGroupDelivery,
        currency: '₹'
      });
      
      // Navigate to next booking phase
      navigate('/booking/details'); 
    }
  };

  // Toggle Tabs Configuration
  const deliveryTabs = [
    { id: 'standard', label: 'Standard' },
    { id: 'group', label: 'Group Save 20%' }
  ];

  // ============================================================================
  // RENDER UI
  // ============================================================================
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

        {/* OVERLAPPING FLOATING CARD */}
        <div className="absolute -bottom-8 left-5 right-5 z-[2000]">
          <FloatingLocationCard 
            activeField="dropoff" // Shows both dots automatically via the timeline
            isResolving={isLoading} 
            pickup={pickup}
            dropoffs={dropoffs}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM HALF: 55vh SCROLLABLE VEHICLE LIST */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pt-14 pb-32 px-5 space-y-4 z-0 relative">
        
        {/* System Toggle for Pool/Group Delivery */}
        <SystemToggle 
          tabs={deliveryTabs}
          activeTab={isGroupDelivery ? 'group' : 'standard'}
          onTabChange={(id) => setIsGroupDelivery(id === 'group')}
          className="mb-6 w-full"
        />

        {/* Real-time Error Handling */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-[24px] mb-6 font-bold text-[14px] flex items-start gap-2 shadow-sm">
              <Info size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vehicle Selection Grid (SystemCard Integration) */}
        <div className="space-y-4">
          {isLoading ? (
            // Stark Loading Skeletons matching new rounded aesthetic
            [1, 2, 3].map(i => (
              <div key={i} className="h-[130px] bg-white border border-gray-50 rounded-[32px] animate-pulse shadow-[0_4px_15px_rgba(0,0,0,0.02)]" />
            ))
          ) : (
            Object.entries(VEHICLE_SPECS).map(([vType, spec], idx) => {
              const isSelected = vehicleType === vType;
              const basePrice = livePrices[vType]?.totalFare || 0;
              const displayPrice = isGroupDelivery ? Math.max(Math.round(basePrice * 0.8), 20) : basePrice;
              const displayEta = routeMetrics.baseDurationMins + spec.etaOffset + (isGroupDelivery ? 45 : 0);
              const isSurging = livePrices[vType]?.surgeMultiplier > 1.0;

              return (
                <SystemCard 
                  key={vType}
                  animated
                  variant="white"
                  onClick={() => setVehicle(vType)}
                  className={`border-2 flex flex-col gap-4 !p-6 ${isSelected ? 'border-[#111111] shadow-[0_8px_20px_rgba(0,0,0,0.06)] bg-white' : 'border-transparent hover:border-gray-200 bg-white/60 backdrop-blur-sm'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      {/* Vehicle Icon Badge */}
                      <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#111111] text-white' : 'bg-[#F2F4F7] text-[#111111]'}`}>
                        <LineIconRegistry name={spec.iconName} size={28} strokeWidth={1.5} />
                      </div>
                      
                      <div>
                        <h3 className="text-[20px] font-black tracking-tight text-[#111111] leading-none mb-1.5">{spec.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="bg-[#F2F4F7] text-gray-600 text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                            {spec.capacity}
                          </span>
                          <span className="text-gray-400 text-[12px] font-bold">
                            • {spec.volume}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Massive Price Typography */}
                    <div className="text-right flex flex-col items-end pt-1">
                      <div className="text-[28px] font-black text-[#111111] leading-none tracking-tighter flex items-start">
                        <span className="text-[16px] mt-1 mr-0.5 font-bold text-gray-400">₹</span>{displayPrice}
                      </div>
                      {isGroupDelivery && (
                        <div className="text-[13px] font-bold text-green-500 line-through mt-1">₹{basePrice}</div>
                      )}
                    </div>
                  </div>

                  {/* ETA & Status Row */}
                  <div className="flex items-center gap-4 text-[13px] font-bold pt-3 border-t border-gray-50/80">
                    <span className="flex items-center gap-1.5 text-[#111111]">
                      <Clock size={16} strokeWidth={2.5} className="text-gray-400" />
                      {displayEta} mins away
                    </span>
                    {isSurging && (
                      <span className="text-[#276EF1] flex items-center gap-1 bg-[#BCE3FF]/40 px-2.5 py-0.5 rounded uppercase tracking-wider text-[10px] font-black">
                        High Demand
                      </span>
                    )}
                  </div>
                </SystemCard>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 5: Sticky Translucent Footer */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 backdrop-blur-md border-t border-gray-200 z-50">
        <SystemButton 
          onClick={handleConfirm}
          disabled={isLoading || !vehicleType || !!error}
          loading={isLoading}
          variant="primary"
        >
          Confirm Vehicle
        </SystemButton>
      </div>

    </div>
  );
}