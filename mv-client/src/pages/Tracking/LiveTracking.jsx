import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Crosshair, Loader2, AlertCircle, 
  MapPin, Navigation, Truck, Settings2, Phone, MessageSquare, CheckCircle2
} from 'lucide-react';

// Real Store & Database Integration
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc } from 'firebase/firestore';
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';

// Services & Modular UI Components
import { MAP_LAYERS } from '../../services/mapLayers';
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';

/**
 * PAGE: GLOBAL LIVE TRACKING DASHBOARD (STABILIZED & PERFECTED)
 * Architecture: 100vh Immersive Map with Interactive Scrollable Overlay
 * Features:
 * 1. Multi-Order Real-time Sync (Segmented Toggle to switch between active rides)
 * 2. CDN-Based Leaflet Engine (Zero local imports to prevent SyntaxErrors)
 * 3. OSRM Telemetry Engine (Live distance/duration calculation)
 * 4. Physics-based Scrollable Bottom Sheet (Fixes cut-off issues)
 * 5. High-Fidelity Timeline Tracker (Progress-bar logic)
 * 6. Dynamic Map Theming (Syncs with system Dark Mode)
 */

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

export default function LiveTracking() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const routeLayer = useRef(null);
  const driverMarker = useRef(null);

  // Global UI Preferences
  const { mapTheme } = useMapSettingsStore();
  const { language } = usePreferencesStore();

  // State Management
  const [activeOrders, setActiveOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [telemetry, setTelemetry] = useState(null);

  // FEATURE 1: SECURE MULTI-ORDER SHIPMENT STREAM
  useEffect(() => {
    const appId = getAppId();
    let unsubscribeOrders;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError(t('Authentication required.', language));
        setIsLoading(false);
        return;
      }

      // STRICT SECURE PATHING
      const ordersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'orders');
      const ordersQuery = query(ordersRef);

      unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const fetched = snapshot.docs.map(d => ({ 
          id: d.id, 
          label: `${t('ID', language)}: ${d.id.slice(-4).toUpperCase()}`,
          ...d.data() 
        }));
        
        // Filter for active logistics pipeline only
        const active = fetched.filter(o => ['searching', 'assigned', 'picked_up'].includes(o.status));
        setActiveOrders(active);
        
        // Auto-select first order if none currently locked in
        if (active.length > 0 && !selectedOrderId) {
          setSelectedOrderId(active[0].id);
        } else if (active.length === 0) {
          setSelectedOrderId(null);
          setCurrentOrderData(null);
          setTelemetry(null);
        }
        setIsLoading(false);
      }, (err) => {
        console.error("Live Stream Error:", err);
        setError(t('Failed to stream active shipments.', language));
        setIsLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [auth, db, language]);

  // Sync details for the currently toggled order
  useEffect(() => {
    if (!selectedOrderId) return;
    const appId = getAppId();
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'orders', selectedOrderId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentOrderData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, [selectedOrderId, auth, db]);

  // FEATURE 2 & 4: CDN-BASED LEAFLET RENDERING
  useEffect(() => {
    // RELY EXCLUSIVELY ON GLOBAL CDN INSTANCE
    if (!window.L || !mapContainer.current) return;
    const L = window.L;

    const isDark = document.documentElement.classList.contains('dark');
    const activeMapTheme = isDark && mapTheme === 'standard' ? 'dark' : mapTheme;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current, {
        center: [28.6139, 77.2090],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });
    }

    // Dynamic Map Theme Switcher
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) mapInstance.current.removeLayer(layer);
    });
    L.tileLayer(MAP_LAYERS[activeMapTheme] || MAP_LAYERS.standard).addTo(mapInstance.current);

    const redrawLiveMap = async () => {
      if (!currentOrderData || !mapInstance.current) return;

      // Clear Canvas
      mapInstance.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapInstance.current.removeLayer(layer);
        }
      });

      const pickup = currentOrderData.pickup;
      const dropoffs = currentOrderData.dropoffs || (currentOrderData.dropoff ? [currentOrderData.dropoff] : []);
      const driverLoc = currentOrderData.driverLocation;
      const points = [];

      // Render Pickup
      if (pickup?.lat) {
        const pIcon = L.divIcon({
          className: '',
          html: `<div class="w-4 h-4 bg-white dark:bg-[#111111] border-[4px] border-[#111111] dark:border-white rounded-full shadow-md"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        L.marker([pickup.lat, pickup.lng], { icon: pIcon }).addTo(mapInstance.current);
        points.push([pickup.lat, pickup.lng]);
      }

      // Render Dropoffs
      dropoffs.forEach((drop) => {
        if (drop?.lat) {
          const dIcon = L.divIcon({
            className: '',
            html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-lg border-[3px] border-white dark:border-[#111111]"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([drop.lat, drop.lng], { icon: dIcon }).addTo(mapInstance.current);
          points.push([drop.lat, drop.lng]);
        }
      });

      // Render Active Driver with Orientation
      if (driverLoc?.lat) {
        const drIcon = L.divIcon({
          className: '',
          html: `<div class="w-10 h-10 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center text-white dark:text-[#111111] border-2 border-white dark:border-[#111111] shadow-xl transition-all duration-500" style="transform: rotate(${driverLoc.heading || 0}deg);">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                 </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        driverMarker.current = L.marker([driverLoc.lat, driverLoc.lng], { icon: drIcon }).addTo(mapInstance.current);
        points.push([driverLoc.lat, driverLoc.lng]);
      }

      // FEATURE 3: OSRM TELEMETRY SYNC
      const routePoints = [driverLoc?.lat ? driverLoc : pickup, ...dropoffs].filter(p => p?.lat);
      if (routePoints.length >= 2) {
        try {
          const coords = routePoints.map(s => `${s.lng},${s.lat}`).join(';');
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
          const data = await res.json();
          if (data.code === 'Ok' && mapInstance.current) {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            routeLayer.current = L.polyline(routeCoords, {
              color: isDark ? '#4dabf7' : '#111111', weight: 5, opacity: 0.8, dashArray: '8, 8'
            }).addTo(mapInstance.current);
            
            setTelemetry({
              distance: data.routes[0].distance > 1000 ? `${(data.routes[0].distance/1000).toFixed(1)} km` : `${Math.round(data.routes[0].distance)} m`,
              time: `${Math.ceil(data.routes[0].duration/60)} min`
            });
            
            const bounds = L.latLngBounds(points);
            if (bounds.isValid()) mapInstance.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 });
          }
        } catch (err) {
          const bounds = L.latLngBounds(points);
          if (bounds.isValid() && mapInstance.current) mapInstance.current.fitBounds(bounds, { padding: [100, 100] });
        }
      }
    };

    redrawLiveMap();
    setTimeout(() => mapInstance.current?.invalidateSize(), 300);

  }, [currentOrderData, mapTheme, language]);

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
      <div className="h-screen bg-[#F2F4F7] dark:bg-[#111111] flex flex-col items-center justify-center transition-colors">
        <Loader2 size={40} className="animate-spin text-[#111111] dark:text-white mb-4" />
        <p className="text-[14px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('Connecting to Feed', language)}</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#F2F4F7] dark:bg-[#111111] font-sans relative overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* IMMERSIVE MAP CANVAS */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-gray-200 dark:bg-gray-900" />

      {/* TOP FLOATING OVERLAY: NAVIGATION & ORDER SWITCHER */}
      <div className="absolute top-12 left-6 right-6 z-20 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard-home')} 
            className="w-12 h-12 bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-xl active:scale-90 transition-all shrink-0"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          
          <div className="flex-1">
            {activeOrders.length > 0 ? (
              <OrderSegmentedToggle 
                tabs={activeOrders.map(o => ({ id: o.id, label: o.label }))}
                activeTab={selectedOrderId}
                onTabChange={setSelectedOrderId}
              />
            ) : (
              <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-full px-5 py-3 border border-white/20 text-center shadow-lg">
                <span className="text-[14px] font-black text-gray-400">{t('Scanning for Shipments', language)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HUD TELEMETRY PILL */}
      <AnimatePresence>
        {telemetry && currentOrderData && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-[108px] left-1/2 -translate-x-1/2 z-20 bg-black/95 dark:bg-white/95 text-white dark:text-black px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-5 border border-white/10 dark:border-black/10"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[15px] font-black">{telemetry.time}</span>
            </div>
            <div className="w-px h-4 bg-white/20 dark:bg-black/20" />
            <span className="text-[14px] font-bold opacity-70">{telemetry.distance}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => {
          if (mapInstance.current && routeLayer.current) {
            mapInstance.current.fitBounds(routeLayer.current.getBounds(), { padding: [100, 100] });
          }
        }}
        className="absolute top-[108px] right-6 z-20 w-12 h-12 bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-black dark:text-white shadow-xl active:scale-90 border border-gray-100 dark:border-gray-800"
      >
        <Crosshair size={22} strokeWidth={2.5} />
      </button>

      {/* FEATURE 4: VERTICAL SCROLLABLE BOTTOM OVERLAY */}
      <div className="mt-auto h-[50vh] overflow-y-auto no-scrollbar z-30 pointer-events-auto">
        <div className="px-5 pb-40 space-y-5 pt-4">
          <AnimatePresence mode="wait">
            {currentOrderData ? (
              <motion.div 
                key={selectedOrderId} 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex flex-col gap-4"
              >
                {/* TIMELINE DASHBOARD */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-[36px] p-7 shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors">
                  
                  {/* FEATURE 5: HIGH-FIDELITY TIMELINE TRACKER */}
                  <div className="flex items-center justify-between mb-8 relative px-1">
                    <div className="absolute left-6 right-6 top-[11px] -translate-y-1/2 h-1 bg-gray-100 dark:bg-gray-800 rounded-full z-0">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(getTimelineStep() - 1) * 50}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="h-full bg-black dark:bg-white rounded-full" 
                      />
                    </div>
                    
                    {[t('Scanning', language), t('Assigned', language), t('Moving', language)].map((label, i) => (
                      <div key={label} className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-[#1A1A1A] px-2">
                        <div className={`w-5 h-5 rounded-full border-4 transition-all duration-500 ${getTimelineStep() > i ? 'bg-black dark:bg-white border-black dark:border-white' : 'bg-white dark:bg-[#1A1A1A] border-gray-100 dark:border-gray-800'}`}>
                          {getTimelineStep() > i && <CheckCircle2 size={10} className="text-white dark:text-black" strokeWidth={4} />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${getTimelineStep() > i ? 'text-black dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="flex gap-3">
                    <button 
                      disabled={currentOrderData.status === 'searching'}
                      onClick={() => window.location.href = `tel:${currentOrderData.selectedBid?.driverPhone || '000'}`}
                      className="flex-1 bg-[#F2F4F7] dark:bg-[#2A2A2A] text-black dark:text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 transition-all"
                    >
                      <Phone size={18} strokeWidth={2.5} /> {t('Call Driver', language)}
                    </button>
                    <button 
                      disabled={currentOrderData.status === 'searching'}
                      className="w-[64px] bg-[#F2F4F7] dark:bg-[#2A2A2A] text-black dark:text-white rounded-2xl flex items-center justify-center active:scale-95 disabled:opacity-30 transition-all shrink-0"
                    >
                      <MessageSquare size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* SECURE STATUS CARD */}
                <div className="relative pt-3">
                  <div className="absolute -top-1 left-8 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter z-10 shadow-xl">
                    {t('Live Tracking', language)}: {selectedOrderId?.slice(-6).toUpperCase()}
                  </div>
                  <OrderFloatingStatusCard 
                    pickupAddress={currentOrderData.pickup?.address}
                    dropoffAddress={(currentOrderData.dropoffs?.[0] || currentOrderData.dropoff)?.address}
                    statusText={getTimelineStep() === 1 ? t('Matching Driver', language) : t('Dispatch Active', language)}
                    subText={currentOrderData.vehicleType ? `${t(currentOrderData.vehicleType.toUpperCase(), language)} Tracking` : t('Secure Telemetry', language)}
                    onActionClick={() => navigate(`/tracking/detail/${selectedOrderId}`)}
                    actionIcon={Settings2}
                  />
                </div>
              </motion.div>
            ) : (
              /* EMPTY LOGISTICS PIPELINE */
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1A1A1A] rounded-[48px] p-12 shadow-2xl border border-gray-100 dark:border-gray-800 text-center transition-colors"
              >
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck size={32} className="text-gray-300 dark:text-gray-600" />
                </div>
                <h2 className="text-[22px] font-black text-black dark:text-white mb-2 tracking-tight">{t('Pipeline Empty', language)}</h2>
                <p className="text-[14px] font-bold text-gray-400 dark:text-gray-500 mb-8 leading-relaxed">{t("No active shipments found. Start a new delivery to track it in real-time.", language)}</p>
                <button 
                  onClick={() => navigate('/booking/set-location')}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-4.5 rounded-[22px] font-black active:scale-95 transition-all shadow-lg"
                >
                  {t('Send a Package', language)}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}