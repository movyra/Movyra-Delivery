import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, Users, Package, Clock, 
  Loader2, ArrowRight, Info, Crosshair, Truck 
} from 'lucide-react';

// Real Store Integration
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';

// Services & Overlays
import { MAP_LAYERS } from '../../services/mapLayers';
import FloatingLocationCard from '../../components/Map/FloatingLocationCard';

// ============================================================================
// PAGE: SELECT VEHICLE (SPLIT-SCREEN CARD UI)
// Architecture: 45vh/55vh Strict Split-Screen Layout
// Features: 
// - Headerless Map Canvas (Read-Only Route View)
// - Floating Location Pill Overlap
// - Massively Rounded White Vehicle Cards
// - Real-time OSRM Distance Pricing Engine
// ============================================================================

// Static definitions for vehicle capabilities
const VEHICLE_SPECS = {
  'bike': { name: 'Moto', capacity: '20 kg', volume: 'Backpack', etaOffset: 0, baseFare: 40, perKm: 12, icon: Package },
  '3wheeler': { name: '3-Wheeler', capacity: '500 kg', volume: 'Small Furniture', etaOffset: 15, baseFare: 90, perKm: 25, icon: Truck },
  'minitruck': { name: 'Mini Truck', capacity: '1000 kg', volume: '1 BHK Size', etaOffset: 25, baseFare: 250, perKm: 40, icon: Truck }
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGroupDelivery, setIsGroupDelivery] = useState(false);
  
  // Real-time Pricing State
  const [routeMetrics, setRouteMetrics] = useState({ distanceKm: 0, baseDurationMins: 0 });
  const [livePrices, setLivePrices] = useState({});

  // ============================================================================
  // LOGIC: OPENSTREETMAP ENGINE (LEAFLET READ-ONLY PLOTTING)
  // ============================================================================
  useEffect(() => {
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

    // Plot Dropoff Markers (Solid Red Pin matching image_5acec6)
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

  }, [pickup, safeDropoffs, mapTheme]);

  const handleRecenter = () => {
    if (map.current && routeLayer.current) {
      map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 80], paddingBottomRight: [50, 80] });
    }
  };

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

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="relative w-full h-screen bg-[#F2F4F7] overflow-hidden font-sans flex flex-col">
      
      {/* ========================================================= */}
      {/* TOP HALF: 45vh MAP CANVAS (STRICT HEADER ERADICATION) */}
      {/* ========================================================= */}
      <div className="relative w-full h-[45vh] shrink-0 z-10">
        <div ref={mapContainer} className="absolute inset-0 bg-[#e5e7eb]" />

        {/* Top Left Interaction Button (Isolated Back icon) */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-black shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>

        {/* OVERLAPPING FLOATING CARD */}
        <div className="absolute -bottom-8 left-5 right-5 z-[2000]">
          <FloatingLocationCard 
            activeField="dropoff" // Shows both dots automatically via the timeline
            isResolving={isLoading} 
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM HALF: 55vh SCROLLABLE VEHICLE LIST */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pt-14 pb-32 px-5 space-y-4 z-0 relative">
        
        {/* Group Delivery / Pool Segmented Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="bg-white p-1.5 rounded-full flex shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-gray-100 relative mb-6"
        >
          <div 
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#111111] rounded-full shadow-sm transition-all duration-300 ease-out"
            style={{ left: isGroupDelivery ? 'calc(50% + 3px)' : '6px' }}
          />

          <button 
            onClick={() => setIsGroupDelivery(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-bold transition-colors z-10 ${!isGroupDelivery ? 'text-white' : 'text-gray-500 hover:text-black'}`}
          >
            <Package size={18} strokeWidth={2.5} /> Standard
          </button>
          
          <button 
            onClick={() => setIsGroupDelivery(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-bold transition-colors z-10 ${isGroupDelivery ? 'text-white' : 'text-gray-500 hover:text-black'}`}
          >
            <Users size={18} strokeWidth={2.5} /> Group Save 20%
          </button>
        </motion.div>

        {/* Real-time Error Handling */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-[24px] mb-6 font-bold text-[14px] flex items-start gap-2 shadow-sm">
              <Info size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vehicle Selection Grid (Massive Rounded Cards) */}
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
              const Icon = spec.icon;

              return (
                <motion.div 
                  key={vType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (idx * 0.1) }}
                  onClick={() => setVehicle(vType)}
                  className={`bg-white p-6 rounded-[32px] border-2 transition-all cursor-pointer flex flex-col gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] active:scale-[0.98] ${isSelected ? 'border-[#111111] shadow-[0_8px_20px_rgba(0,0,0,0.06)]' : 'border-transparent hover:border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {/* Vehicle Icon Badge */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#111111] text-white' : 'bg-[#F2F4F7] text-[#111111]'}`}>
                        <Icon size={22} strokeWidth={2.5} />
                      </div>
                      
                      <div>
                        <h3 className="text-[18px] font-black tracking-tight text-[#111111] leading-none mb-1.5">{spec.name}</h3>
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
                    <div className="text-right flex flex-col items-end">
                      <div className="text-[24px] font-black text-[#111111] leading-none tracking-tight flex items-start">
                        <span className="text-[14px] mt-1 mr-0.5">₹</span>{displayPrice}
                      </div>
                      {isGroupDelivery && (
                        <div className="text-[12px] font-bold text-green-500 line-through mt-1">₹{basePrice}</div>
                      )}
                    </div>
                  </div>

                  {/* ETA & Status Row */}
                  <div className="flex items-center gap-4 text-[13px] font-bold pt-3 border-t border-gray-50/80">
                    <span className="flex items-center gap-1.5 text-[#111111]">
                      <Clock size={14} strokeWidth={3} className="text-gray-400" />
                      {displayEta} mins away
                    </span>
                    {isSurging && (
                      <span className="text-[#276EF1] flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-black">
                        High Demand
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 5: Sticky Translucent Footer */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 backdrop-blur-md border-t border-gray-200 z-50">
        <button 
          onClick={handleConfirm}
          disabled={isLoading || !vehicleType || !!error}
          className="w-full flex items-center justify-between px-6 bg-[#111111] text-white py-4 rounded-[28px] font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[64px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:shadow-none"
        >
          <span className="flex-1 text-center pl-6">
            {isLoading ? 'Calculating...' : 'Confirm Vehicle'}
          </span>
          {isLoading ? <Loader2 size={24} className="animate-spin text-white" /> : <ArrowRight size={24} className="text-white" />}
        </button>
      </div>

    </div>
  );
}