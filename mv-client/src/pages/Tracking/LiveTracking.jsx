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
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';

// Services & Modular UI Components
import { MAP_LAYERS } from '../../services/mapLayers';
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';

/**
 * PAGE: GLOBAL LIVE TRACKING DASHBOARD (STABILIZED & PERFECTED)
 * Architecture: 100vh Immersive Map with Interactive Scrollable Overlay
 * Improvements: 
 * - CRASH FIX: Null-safe ID slicing at runtime to prevent undefined property errors.
 * - UI PERFECTION: Vertical scrolling enabled for the bottom sheet to prevent text cut-off.
 * - SPACING: Increased gutters between status checkpoints and action grid per image_6afd4c.jpg.
 * - DEPTH: pb-40 padding added to clear the Bottom Navigation Bar.
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
  const map = useRef(null);
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

  // SECTION 1: SECURE PATH LISTENING & SYNC
  useEffect(() => {
    const appId = getAppId();
    let unsubscribeOrders;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError(t('Authentication required.', language));
        setIsLoading(false);
        return;
      }

      const ordersRef = collection(db, 'artifacts', appId, 'users', user.uid, 'orders');
      const ordersQuery = query(ordersRef);

      unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const fetched = snapshot.docs.map(d => ({ 
          id: d.id, 
          label: `ID: ${d.id.slice(-4).toUpperCase()}`,
          ...d.data() 
        }));
        
        // Filter for active logistics pipeline
        const active = fetched.filter(o => ['searching', 'assigned', 'picked_up'].includes(o.status));
        setActiveOrders(active);
        
        // Auto-select first order if none selected
        if (active.length > 0 && !selectedOrderId) {
          setSelectedOrderId(active[0].id);
        } else if (active.length === 0) {
          setSelectedOrderId(null);
          setCurrentOrderData(null);
          setTelemetry(null);
        }
        setIsLoading(false);
      }, (err) => {
        setError(t('Failed to stream active shipments.', language));
        setIsLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [auth, db, language]);

  // Sync details for the specific active tab
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

  // SECTION 2: LEAFLET RENDERING ENGINE
  useEffect(() => {
    if (!mapContainer.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const activeMapTheme = isDark && mapTheme === 'standard' ? 'dark' : mapTheme;

    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        center: [28.6139, 77.2090],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });
    }

    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.current.removeLayer(layer);
    });
    L.tileLayer(MAP_LAYERS[activeMapTheme] || MAP_LAYERS.standard).addTo(map.current);

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

      if (pickup?.lat) {
        const pIcon = L.divIcon({
          className: '',
          html: `<div class="w-4 h-4 bg-white dark:bg-[#111111] border-[4px] border-[#111111] dark:border-white rounded-full shadow-md"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        L.marker([pickup.lat, pickup.lng], { icon: pIcon }).addTo(map.current);
        points.push([pickup.lat, pickup.lng]);
      }

      dropoffs.forEach((drop) => {
        if (drop?.lat) {
          const dIcon = L.divIcon({
            className: '',
            html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-lg border-[3px] border-white dark:border-[#111111]"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([drop.lat, drop.lng], { icon: dIcon }).addTo(map.current);
          points.push([drop.lat, drop.lng]);
        }
      });

      if (driverLoc?.lat) {
        const drIcon = L.divIcon({
          className: '',
          html: `<div class="w-10 h-10 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center text-white dark:text-[#111111] border-2 border-white dark:border-[#111111] shadow-xl transition-all duration-500" style="transform: rotate(${driverLoc.heading || 0}deg);">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                 </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        driverMarker.current = L.marker([driverLoc.lat, driverLoc.lng], { icon: drIcon }).addTo(map.current);
        points.push([driverLoc.lat, driverLoc.lng]);
      }

      const routePoints = [driverLoc?.lat ? driverLoc : pickup, ...dropoffs].filter(p => p?.lat);
      if (routePoints.length >= 2) {
        try {
          const coords = routePoints.map(s => `${s.lng},${s.lat}`).join(';');
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
          const data = await res.json();
          if (data.code === 'Ok' && map.current) {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            routeLayer.current = L.polyline(routeCoords, {
              color: isDark ? '#4dabf7' : '#111111', weight: 4, opacity: 0.7, dashArray: '8, 8'
            }).addTo(map.current);
            setTelemetry({
              distance: data.routes[0].distance > 1000 ? `${(data.routes[0].distance/1000).toFixed(1)} km` : `${Math.round(data.routes[0].distance)} m`,
              time: `${Math.ceil(data.routes[0].duration/60)} min`
            });
            const bounds = L.latLngBounds(points);
            if (bounds.isValid()) map.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
          }
        } catch (err) {
          const bounds = L.latLngBounds(points);
          if (bounds.isValid() && map.current) map.current.fitBounds(bounds, { padding: [80, 80] });
        }
      }
    };

    redrawLiveMap();
    setTimeout(() => map.current?.invalidateSize(), 200);

  }, [currentOrderData, mapTheme, language]);

  const handleRecenter = () => {
    if (map.current && currentOrderData) {
      const p = currentOrderData.driverLocation || currentOrderData.pickup;
      const d = currentOrderData.dropoffs?.[0] || currentOrderData.dropoff;
      if (p?.lat && d?.lat) map.current.fitBounds(L.latLngBounds([[p.lat, p.lng], [d.lat, d.lng]]), { padding: [100, 100] });
    }
  };

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
        <p className="text-[14px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('Waking Telemetry', language)}</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#F2F4F7] dark:bg-[#111111] font-sans relative overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* SECTION 1: MAP CANVAS */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-[#e5e7eb] dark:bg-[#222222]" />

      {/* SECTION 2: TOP FLOATING NAVIGATION */}
      <div className="absolute top-12 left-6 right-6 z-20 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard-home')} 
            className="w-[46px] h-[46px] bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
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
              <div className="bg-white/80 dark:bg-[#222222]/80 backdrop-blur-md rounded-full px-5 py-2.5 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                <span className="text-[14px] font-bold text-gray-400 dark:text-gray-500">{t('No active shipments', language)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: HUD TELEMETRY PILL */}
      <AnimatePresence>
        {telemetry && currentOrderData && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-[104px] left-1/2 -translate-x-1/2 z-20 bg-black/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-[#111111] px-5 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center gap-4 border border-white/10 dark:border-black/10"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[15px] font-black">{telemetry.time}</span>
            </div>
            <div className="w-px h-4 bg-white/20 dark:bg-black/20" />
            <span className="text-[14px] font-bold text-gray-300 dark:text-gray-600">{telemetry.distance}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={handleRecenter}
        className="absolute top-[104px] right-6 z-20 w-11 h-11 bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-lg active:scale-95 transition-all border border-gray-100 dark:border-gray-800"
      >
        <Crosshair size={20} strokeWidth={2.5} />
      </button>

      {/* SECTION 4: SCROLLABLE BOTTOM OVERLAY (FIXES CUT-OFF) */}
      <div className="mt-auto h-[52vh] overflow-y-auto no-scrollbar z-30 pointer-events-auto">
        <div className="px-5 pb-40 space-y-5 pt-4">
          <AnimatePresence mode="wait">
            {currentOrderData ? (
              <motion.div 
                key={selectedOrderId} 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="w-full flex flex-col gap-5"
              >
                {/* Timeline and Quick Action Block */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-[36px] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-[#333333] transition-colors">
                  
                  {/* Status Timeline with Optimized Spacing */}
                  <div className="flex items-center justify-between mb-10 relative px-2">
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full z-0">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(getTimelineStep() - 1) * 50}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-[#111111] dark:bg-white rounded-full" 
                      />
                    </div>
                    
                    {[t('Searching', language), t('En Route', language), t('In Transit', language)].map((label, i) => (
                      <div key={label} className="relative z-10 flex flex-col items-center gap-2.5 bg-white dark:bg-[#1A1A1A] px-2 transition-colors">
                        <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-colors duration-500 ${getTimelineStep() > i ? 'bg-[#111111] dark:bg-white border-[#111111] dark:border-white' : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-700'}`}>
                          {getTimelineStep() > i && <CheckCircle2 size={12} className="text-white dark:text-[#111111]" strokeWidth={3} />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${getTimelineStep() > i ? 'text-[#111111] dark:text-white' : 'text-gray-300 dark:text-gray-600'}`}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex gap-3">
                    <button 
                      disabled={currentOrderData.status === 'searching'}
                      onClick={() => {
                        const phone = currentOrderData?.driver?.phone || '9999999999';
                        window.location.href = `tel:${phone}`;
                      }}
                      className="flex-1 bg-[#F2F4F7] dark:bg-[#2A2A2A] text-[#111111] dark:text-white py-4.5 rounded-2xl font-black text-[15px] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-40"
                    >
                      <Phone size={18} strokeWidth={2.5} /> {t('Call Driver', language)}
                    </button>
                    <button 
                      disabled={currentOrderData.status === 'searching'}
                      className="w-[64px] bg-[#F2F4F7] dark:bg-[#2A2A2A] text-[#111111] dark:text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 shrink-0"
                    >
                      <MessageSquare size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Secure Floating Status Card with Null-Safe ID Badge */}
                <div className="relative pt-3">
                  <div className="absolute top-0 left-8 bg-black dark:bg-white text-white dark:text-[#111111] px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter z-10 shadow-lg border border-white/10 dark:border-black/10 transition-colors">
                    {t('Order ID', language)}: {selectedOrderId?.slice(-8).toUpperCase() || 'SYNCING'}
                  </div>
                  <OrderFloatingStatusCard 
                    pickupAddress={currentOrderData.pickup?.address}
                    dropoffAddress={(currentOrderData.dropoffs?.[0] || currentOrderData.dropoff)?.address}
                    statusText={currentOrderData.status === 'searching' ? t('Assigning Partner', language) : t('Dispatch Active', language)}
                    subText={currentOrderData.vehicleType ? `${t(currentOrderData.vehicleType.toUpperCase(), language)} Tracker` : t('Telemetry Active', language)}
                    onActionClick={() => navigate(`/tracking/detail/${selectedOrderId}`)}
                    actionIcon={Settings2}
                  />
                </div>
              </motion.div>
            ) : (
              /* Empty Pipeline State */
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#BCE3FF] dark:bg-[#1A365D] rounded-[48px] p-12 shadow-2xl border border-[#A5D5F9] dark:border-[#2A4365] text-center transition-colors"
              >
                <div className="w-16 h-16 bg-white/50 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="text-[#111111] dark:text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-[24px] font-black text-[#111111] dark:text-white mb-3 tracking-tight">{t('No Active Shipments', language)}</h2>
                <p className="text-[15px] font-bold text-[#4A6B85] dark:text-[#E2F1FF] mb-10 leading-relaxed">{t("You don't have any orders in transit right now.", language)}</p>
                <button 
                  onClick={() => navigate('/booking/set-location')}
                  className="w-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] py-5 rounded-[24px] font-black active:scale-95 transition-all shadow-xl"
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