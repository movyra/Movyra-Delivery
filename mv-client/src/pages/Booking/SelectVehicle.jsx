import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, Clock, Loader2, Info, Crosshair
} from 'lucide-react';

// Premium Design System Components
import LineIconRegistry from '../../components/Icons/LineIconRegistry';
import SystemCard from '../../components/UI/SystemCard';
import SystemButton from '../../components/UI/SystemButton';
import SystemToggle from '../../components/UI/SystemToggle';

// Real Store Integration
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';

// Services & Overlays
import { MAP_LAYERS } from '../../services/mapLayers';
import FloatingLocationCard from '../../components/Map/FloatingLocationCard';

/**
 * PAGE: SELECT VEHICLE (SPLIT-SCREEN CARD UI)
 * Architecture: 45vh/55vh Strict Split-Screen Layout
 * Features: 
 * - Headerless Map Canvas (Read-Only Route View)
 * - Floating Location Pill Overlap
 * - SystemCard Integration for Vehicles (Massive Typography)
 * - STRICT LOCATIONIQ ENGINE: Replaces public OSRM with enterprise LocationIQ API.
 * - STRICT FALLBACK: Haversine Mathematical Engine (Immune to API limits/missing keys)
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
  
  // LocationIQ API Key (Reads from your Vite environment variables)
  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
  
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
  // LOGIC: OPENSTREETMAP ENGINE (LEAFLET READ-ONLY PLOTTING WITH FAILSAFES)
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

    // Fetch and draw route polyline using LocationIQ
    const fetchRoutePolyline = async () => {
      try {
        if (!LOCATIONIQ_API_KEY) throw new Error("LocationIQ API Key missing. Falling back to point-to-point bounds.");
        
        const coords = [pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
        const res = await fetch(`https://us1.locationiq.com/v1/directions/driving/${coords}?key=${LOCATIONIQ_API_KEY}&geometries=geojson&overview=full`);
        
        if (!res.ok) throw new Error(`LocationIQ Polyline HTTP Error: ${res.status}`);
        
        const text = await res.text();
        const data = JSON.parse(text); 
        
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
        console.warn("LocationIQ Polyline failed. Gracefully snapping bounds without polyline.", err.message);
        map.current.fitBounds(L.latLngBounds(points), { padding: [50, 80] });
      }
    };
    
    fetchRoutePolyline();
    setTimeout(() => map.current?.invalidateSize(), 200);

  }, [pickup, safeDropoffs, mapTheme, isMapLoaded, LOCATIONIQ_API_KEY]);

  // ============================================================================
  // LOGIC: ROBUST PRICING ENGINE (LOCATIONIQ WITH HAVERSINE MATHEMATICAL FALLBACK)
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

      let distanceKm = 0;
      let durationMins = 0;

      try {
        if (!LOCATIONIQ_API_KEY) throw new Error("LocationIQ API Key missing. Bypassing fetch.");

        // Attempt Primary LocationIQ Route Calculation
        const coords = [pickup, ...validDropoffs].map(loc => `${loc.lng},${loc.lat}`).join(';');
        const res = await fetch(`https://us1.locationiq.com/v1/directions/driving/${coords}?key=${LOCATIONIQ_API_KEY}&overview=false`);
        
        if (!res.ok) throw new Error(`LocationIQ Pricing API HTTP Error: ${res.status}`);
        
        const text = await res.text();
        const data = JSON.parse(text);

        if (data.code !== 'Ok') throw new Error('Failed to compute route from response.');

        distanceKm = data.routes[0].distance / 1000;
        durationMins = Math.round(data.routes[0].duration / 60);

      } catch (apiErr) {
        console.warn("LocationIQ Pricing Failed. Engaging Permanent Haversine Fallback Engine.", apiErr.message);
        
        // =========================================================
        // MATHEMATICAL FALLBACK (Haversine Formula x 1.3 Curvature)
        // Never crashes, always provides a realistic price estimate.
        // =========================================================
        distanceKm = 0;
        let currentLoc = pickup;
        
        for (const drop of validDropoffs) {
          const R = 6371; // Radius of the Earth in km
          const dLat = (drop.lat - currentLoc.lat) * Math.PI / 180;
          const dLon = (drop.lng - currentLoc.lng) * Math.PI / 180;
          
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(currentLoc.lat * Math.PI / 180) * Math.cos(drop.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
            
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          const straightLineDist = R * c;
          
          distanceKm += straightLineDist;
          currentLoc = drop;
        }

        distanceKm = distanceKm * 1.3; // Multiply by road curvature constant
        durationMins = Math.round((distanceKm / 30) * 60); // Base estimate on 30km/h urban speed
      }

      // Execute Live Pricing Formula regardless of how distance was sourced
      setRouteMetrics({ distanceKm, baseDurationMins: durationMins });

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
      if (!vehicleType) setVehicle('bike');
      setIsLoading(false);
    };

    fetchRealPricing();
  }, [pickup, safeDropoffs, vehicleType, setVehicle, LOCATIONIQ_API_KEY]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleConfirm = () => {
    if (vehicleType && livePrices[vehicleType]) {
      const baseFareObj = livePrices[vehicleType];
      
      // Apply Group Pool Discount logic natively
      const finalTotal = isGroupDelivery 
        ? Math.max(Math.round(baseFareObj.totalFare * 0.8), 20) 
        : baseFareObj.totalFare;

      setPricing({
        estimatedPrice: finalTotal,
        surgeMultiplier: baseFareObj.surgeMultiplier,
        isGroupDelivery: isGroupDelivery,
        currency: '₹'
      });
      
      navigate('/booking/details'); 
    }
  };

  const deliveryTabs = [
    { id: 'standard', label: 'Standard' },
    { id: 'group', label: 'Group Save 20%' }
  ];

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="relative w-full h-[100dvh] bg-[#F2F4F7] overflow-hidden font-sans flex flex-col">
      
      {/* TOP HALF: 45vh MAP CANVAS */}
      <div className="relative w-full h-[45vh] shrink-0 z-10">
        <div ref={mapContainer} className="absolute inset-0 bg-[#e5e7eb]" />

        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>

        <div className="absolute -bottom-8 left-5 right-5 z-[2000]">
          <FloatingLocationCard 
            activeField="dropoff" 
            isResolving={isLoading} 
            pickup={pickup}
            dropoffs={dropoffs}
          />
        </div>
      </div>

      {/* BOTTOM HALF: 55vh SCROLLABLE VEHICLE LIST */}
      <div className="flex-1 overflow-y-auto pt-14 pb-32 px-5 space-y-4 z-0 relative">
        
        <SystemToggle 
          tabs={deliveryTabs}
          activeTab={isGroupDelivery ? 'group' : 'standard'}
          onTabChange={(id) => setIsGroupDelivery(id === 'group')}
          className="mb-6 w-full"
        />

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-[24px] mb-6 font-bold text-[14px] flex items-start gap-2 shadow-sm">
              <Info size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {isLoading ? (
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
                    
                    <div className="text-right flex flex-col items-end pt-1">
                      <div className="text-[28px] font-black text-[#111111] leading-none tracking-tighter flex items-start">
                        <span className="text-[16px] mt-1 mr-0.5 font-bold text-gray-400">₹</span>{displayPrice}
                      </div>
                      {isGroupDelivery && (
                        <div className="text-[13px] font-bold text-green-500 line-through mt-1">₹{basePrice}</div>
                      )}
                    </div>
                  </div>

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