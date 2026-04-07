import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, Crosshair, Loader2, AlertCircle, 
  MapPin, Navigation, Truck, Settings2, Phone, MessageSquare, CheckCircle2
} from 'lucide-react';

// Real Store & Database Integration
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc } from 'firebase/firestore';
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';

// Services & Modular UI Components
import { MAP_LAYERS } from '../../services/mapLayers';
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';

/**
 * PAGE: GLOBAL LIVE TRACKING DASHBOARD
 * Architecture: 100vh Immersive Map with 8 Advanced Sections & Features
 * 1. Strict Pathing & In-Memory Filtering
 * 2. Leaflet Auto-Fitter Engine
 * 3. Driver Auto-Rotation
 * 4. Live Telemetry HUD (ETA & Distance)
 * 5. Multi-Stop Route Support
 * 6. Live Status Timeline
 * 7. Interactive Action Grid
 * 8. Overlapping Status Card & Empty States
 */

export default function LiveTracking() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayer = useRef(null);
  const driverMarker = useRef(null);

  // Global UI Preferences
  const { mapTheme } = useMapSettingsStore();

  // State Management
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [telemetry, setTelemetry] = useState(null);

  // SECTION 1: STRICT PATHING & IN-MEMORY FILTERING
  useEffect(() => {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    let unsubscribeOrders;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError("Authentication required.");
        setIsLoading(false);
        return;
      }

      // Feature 1: Strict Nested Path Enforcement
      const ordersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'orders');
      const ordersQuery = query(ordersRef);

      unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const fetched = snapshot.docs.map(d => ({ 
          id: d.id, 
          label: `ID: ${d.id.slice(-4).toUpperCase()}`,
          ...d.data() 
        }));
        
        // Feature 2: In-Memory Filtering (Prevents Index Crashes)
        const active = fetched.filter(o => ['searching', 'assigned', 'picked_up'].includes(o.status));
        
        setActiveOrders(active);
        
        if (active.length > 0 && !selectedOrderId) {
          setSelectedOrderId(active[0].id);
        } else if (active.length === 0) {
          setSelectedOrderId(null);
          setCurrentOrderData(null);
          setTelemetry(null);
        }
        setIsLoading(false);
      }, (err) => {
        console.error("Orders Stream Error:", err);
        setError("Failed to stream active shipments.");
        setIsLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [auth, db]);

  // Document Listener for specifically selected order
  useEffect(() => {
    if (!selectedOrderId) return;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'orders', selectedOrderId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentOrderData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, [selectedOrderId, auth]);

  // SECTION 2: IMMERSIVE LEAFLET CANVAS & TELEMETRY
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        center: [28.6139, 77.2090],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });
      L.tileLayer(MAP_LAYERS[mapTheme] || MAP_LAYERS.standard).addTo(map.current);
    }

    const redrawLiveMap = async () => {
      if (!currentOrderData || !map.current) return;

      map.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.current.removeLayer(layer);
        }
      });

      const pickup = currentOrderData.pickup;
      const dropoffs = currentOrderData.dropoffs || (currentOrderData.dropoff ? [currentOrderData.dropoff] : []);
      const driverLoc = currentOrderData.driverLocation;

      const points = [];

      // Pickup (Hollow Dot)
      if (pickup?.lat) {
        const pickupIcon = L.divIcon({
          className: '',
          html: `<div class="w-4 h-4 bg-white border-[4px] border-[#111111] rounded-full shadow-md"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map.current);
        points.push([pickup.lat, pickup.lng]);
      }

      // Feature 6: Multi-Stop Support (Solid Red Dots)
      dropoffs.forEach((drop) => {
        if (drop?.lat) {
          const dropIcon = L.divIcon({
            className: '',
            html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.5)] border-[3px] border-white"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
          points.push([drop.lat, drop.lng]);
        }
      });

      // Feature 4: Driver Auto-Rotation
      if (driverLoc?.lat) {
        const driverIcon = L.divIcon({
          className: '',
          html: `<div class="w-10 h-10 bg-[#111111] rounded-full flex items-center justify-center text-white border-2 border-white shadow-xl transition-transform duration-500" style="transform: rotate(${driverLoc.heading || 0}deg);">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                 </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        driverMarker.current = L.marker([driverLoc.lat, driverLoc.lng], { icon: driverIcon }).addTo(map.current);
        points.push([driverLoc.lat, driverLoc.lng]);
      }

      // Draw active route path and calculate Telemetry
      const routePoints = [driverLoc?.lat ? driverLoc : pickup, ...dropoffs].filter(p => p?.lat);
      if (routePoints.length >= 2) {
        try {
          const coords = routePoints.map(s => `${s.lng},${s.lat}`).join(';');
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
          const data = await res.json();
          
          if (data.code === 'Ok' && map.current) {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            routeLayer.current = L.polyline(routeCoords, {
              color: '#111111', weight: 4, opacity: 0.7, dashArray: '8, 8'
            }).addTo(map.current);
            
            // Feature 3: Live Telemetry Calculations
            const dist = data.routes[0].distance;
            const dur = data.routes[0].duration;
            setTelemetry({
              distance: dist > 1000 ? `${(dist/1000).toFixed(1)} km` : `${Math.round(dist)} m`,
              time: dur > 3600 ? `${Math.floor(dur/3600)}h ${Math.round((dur%3600)/60)}m` : `${Math.ceil(dur/60)} min`
            });
            
            // Feature 5: Auto-Fitter Engine
            const bounds = L.latLngBounds(points);
            if (bounds.isValid()) {
              map.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
            }
          }
        } catch (err) {
          console.error("Route drawing failed:", err);
          const bounds = L.latLngBounds(points);
          if (bounds.isValid() && map.current) map.current.fitBounds(bounds, { padding: [80, 80] });
        }
      } else if (points.length > 0 && map.current) {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) map.current.fitBounds(bounds, { padding: [80, 80] });
      }
    };

    redrawLiveMap();
    setTimeout(() => map.current?.invalidateSize(), 200);

  }, [currentOrderData, mapTheme]);

  const handleRecenter = () => {
    if (map.current && currentOrderData) {
      const p = currentOrderData.driverLocation || currentOrderData.pickup;
      const d = currentOrderData.dropoffs?.[0] || currentOrderData.dropoff;
      if (p && d) map.current.fitBounds(L.latLngBounds([[p.lat, p.lng], [d.lat, d.lng]]), { padding: [100, 100] });
    }
  };

  // Helper for Timeline State
  const getTimelineStep = () => {
    if (!currentOrderData) return 0;
    const s = currentOrderData.status;
    if (s === 'searching') return 1;
    if (s === 'assigned') return 2;
    if (s === 'picked_up') return 3;
    return 4;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#F2F4F7] flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[#111111] mb-4" />
        <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">Waking Telemetry</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#F2F4F7] font-sans relative overflow-hidden flex flex-col">
      
      {/* SECTION 1: 100vh FULLSCREEN MAP CANVAS */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-[#e5e7eb]" />

      {/* SECTION 2: FLOATING TOP UI (SEGMENTED SWITCHER) */}
      <div className="absolute top-12 left-6 right-6 z-20 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
          >
            <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
          </button>
          
          <div className="flex-1">
            {activeOrders.length > 0 ? (
              <OrderSegmentedToggle 
                tabs={activeOrders.map(o => ({ id: o.id, label: o.label }))}
                activeTab={selectedOrderId}
                onTabChange={setSelectedOrderId}
              />
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-full px-5 py-2.5 border border-gray-100 shadow-sm text-center">
                <span className="text-[14px] font-bold text-gray-400">No active shipments</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: LIVE TELEMETRY HUD */}
      <AnimatePresence>
        {telemetry && currentOrderData && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-[104px] left-1/2 -translate-x-1/2 z-20 bg-black/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center gap-4 border border-white/10"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[14px] font-black">{telemetry.time}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-[14px] font-bold text-gray-300">{telemetry.distance}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 4: AUTO-CENTER CONTROLS */}
      {currentOrderData && (
        <button 
          onClick={handleRecenter}
          className="absolute top-[104px] right-6 z-20 w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#111111] shadow-lg active:scale-95 transition-all border border-gray-100"
        >
          <Crosshair size={20} strokeWidth={2.5} />
        </button>
      )}

      {/* BOTTOM SHEET CONTAINER (Sections 5, 6, 7) */}
      <div className="mt-auto px-5 pb-8 z-20 flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {currentOrderData ? (
            <motion.div 
              key={selectedOrderId} 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="w-full flex flex-col gap-3"
            >
              {/* SECTION 5 & 6: Timeline and Action Grid Card */}
              <div className="bg-white rounded-[28px] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100">
                
                {/* Feature 7: Live Status Timeline */}
                <div className="flex items-center justify-between mb-5 relative px-2">
                  <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded-full z-0 overflow-hidden">
                    <div className="h-full bg-[#111111] transition-all duration-700 ease-out" style={{ width: `${(getTimelineStep() - 1) * 50}%` }} />
                  </div>
                  
                  {['Searching', 'En Route', 'In Transit'].map((label, i) => (
                    <div key={label} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-1">
                      <div className={`w-5 h-5 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${getTimelineStep() > i ? 'bg-[#111111] border-[#111111]' : 'bg-white border-gray-200'}`}>
                        {getTimelineStep() > i && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${getTimelineStep() > i ? 'text-[#111111]' : 'text-gray-300'}`}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Feature 8: Interactive Action Grid */}
                <div className="flex gap-3">
                  <button 
                    disabled={currentOrderData.status === 'searching'}
                    className="flex-1 bg-[#F2F4F7] text-[#111111] py-3.5 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    <Phone size={16} strokeWidth={2.5} /> Call Driver
                  </button>
                  <button 
                    disabled={currentOrderData.status === 'searching'}
                    className="w-14 bg-[#F2F4F7] text-[#111111] rounded-2xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 shrink-0"
                  >
                    <MessageSquare size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* SECTION 7: Floating Status Card */}
              <OrderFloatingStatusCard 
                pickupAddress={currentOrderData.pickup?.address}
                dropoffAddress={(currentOrderData.dropoffs?.[0] || currentOrderData.dropoff)?.address}
                statusText={currentOrderData.status === 'searching' ? 'Assigning Best Driver' : 'Driver En Route'}
                subText={currentOrderData.vehicleType ? `${currentOrderData.vehicleType} Tracker Active` : 'Telemetry Sync'}
                onActionClick={() => navigate(`/tracking/detail/${selectedOrderId}`)}
                actionIcon={Settings2}
              />
            </motion.div>
          ) : (
            /* SECTION 8: Empty State Fallback */
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#BCE3FF] rounded-[32px] p-8 shadow-xl border border-[#A5D5F9] text-center"
            >
              <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-[#111111]" strokeWidth={2.5} />
              </div>
              <h2 className="text-[20px] font-black text-[#111111] mb-2">No Active Shipments</h2>
              <p className="text-[14px] font-medium text-[#4A6B85] mb-6">You don't have any orders in transit right now.</p>
              <button 
                onClick={() => navigate('/booking/set-location')}
                className="w-full bg-[#111111] text-white py-4 rounded-[20px] font-bold active:scale-95 transition-transform"
              >
                Send a Package
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}