import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, MapPin, Clock, Loader2, 
  AlertCircle, CheckCircle2, Package, 
  ShieldCheck, Diamond, UserCircle2, Crosshair, Receipt,
  MessageCircle, Phone, ShieldAlert, Navigation
} from 'lucide-react';

// Real Database & Auth Integration
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseAuth';
import useMapSettingsStore from '../../store/useMapSettingsStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';

// Modular UI Components
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';
import OrderInfoListCard from '../../components/OrderDetails/OrderInfoListCard';
import OrderAnalyticsChart from '../../components/OrderDetails/OrderAnalyticsChart';
import { MAP_LAYERS } from '../../services/mapLayers';

/**
 * PAGE: ACTIVE SHIPMENT DETAIL (LIVE TRACKING)
 * Architecture: 100vh Immersive Map + Draggable Bottom Sheet
 * BUG FIX: Synchronized secure tenant path artifacts/{appId}/users/{userId}/orders/{id}
 * DARK MODE & i18n: Fully wired global compliance
 */

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayer = useRef(null);

  // Global UI Preferences
  const { mapTheme } = useMapSettingsStore();
  const { language } = usePreferencesStore();

  // Local Data & UI State
  const [order, setOrder] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);

  // Advanced Security & Communication States
  const [routeDeviation, setRouteDeviation] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);

  const TABS = [
    { id: 'details', label: t('Details', language) || 'Details' },
    { id: 'timeline', label: t('Timeline', language) || 'Timeline' },
    { id: 'receipt', label: t('Live Total', language) || 'Live Total' }
  ];

  // ============================================================================
  // FEATURE 1: SECURE REAL-TIME FIRESTORE DATA SYNC
  // ============================================================================
  useEffect(() => {
    if (!id) return;
    let unsubscribeSnapshot;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const appId = getAppId();
        
        // FIX: STRICT PATHING SYNCHRONIZATION
        const orderRef = doc(db, 'artifacts', appId, 'users', user.uid, 'orders', id);
        
        unsubscribeSnapshot = onSnapshot(orderRef, (docSnap) => {
          if (docSnap.exists()) {
            setOrder({ id: docSnap.id, ...docSnap.data() });
            setError('');
          } else {
            setError(t('Order record not found or has been removed.', language));
            setOrder(null);
          }
          setIsLoading(false);
        }, (err) => {
          console.error("Firestore Live Tracking Error:", err);
          setError(t('Failed to securely fetch live order details.', language));
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
        navigate('/auth-login', { replace: true });
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, [id, db, navigate, language]);

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
  // FEATURE 3 & 4: OPENSTREETMAP ENGINE & DEVIATION ANALYSIS
  // ============================================================================
  useEffect(() => {
    if (!isMapLoaded || !order || !mapContainer.current) return;
    const L = window.L;

    const isDark = document.documentElement.classList.contains('dark');
    const activeMapTheme = isDark && mapTheme === 'standard' ? 'dark' : mapTheme;

    const pickupLat = order.pickup?.lat || 28.6139;
    const pickupLng = order.pickup?.lng || 77.2090;

    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        center: [pickupLat, pickupLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        touchZoom: true
      });
    }

    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.current.removeLayer(layer);
    });
    L.tileLayer(MAP_LAYERS[activeMapTheme] || MAP_LAYERS.standard).addTo(map.current);

    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current.removeLayer(layer);
      }
    });

    const validDropoffs = order.dropoffs || (order.dropoff ? [order.dropoff] : []);
    const points = [];

    if (order.pickup?.lat) {
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div class="w-[36px] h-[36px] bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-full shadow-lg flex items-center justify-center border-[3px] border-white dark:border-[#111111] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      L.marker([order.pickup.lat, order.pickup.lng], { icon: pickupIcon }).addTo(map.current);
      points.push([order.pickup.lat, order.pickup.lng]);
    }

    validDropoffs.forEach((drop) => {
      if (drop?.lat) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-[36px] h-[36px] bg-[#FF3B30] text-white rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.5)] flex items-center justify-center border-[3px] border-white dark:border-[#111111] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
        points.push([drop.lat, drop.lng]);
      }
    });

    let driverLat = null;
    let driverLng = null;

    if ((order.status === 'assigned' || order.status === 'picked_up') && validDropoffs.length > 0) {
      driverLat = order.driverLocation?.lat || validDropoffs[0].lat - 0.005;
      driverLng = order.driverLocation?.lng || validDropoffs[0].lng - 0.005;
      
      const driverIcon = L.divIcon({
        className: '',
        html: `
          <div class="flex flex-col items-center transform -translate-y-[20px] relative z-50">
            <div class="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-3 py-1.5 rounded-[10px] text-[12px] font-black shadow-[0_10px_20px_rgba(0,0,0,0.3)] mb-1.5 relative flex items-center gap-1.5 whitespace-nowrap transition-colors">
              <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              ${order.selectedBid?.etaMins || '5'} ${t('MIN ETA', language)}
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111111] dark:bg-white rotate-45 transition-colors"></div>
            </div>
            <div class="w-11 h-11 bg-white dark:bg-[#111111] rounded-full border-[3px] border-[#111111] dark:border-white shadow-xl flex items-center justify-center text-[#111111] dark:text-white transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10l1.5-4.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L19 10" /><path d="M22 10v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2z" /><circle cx="7" cy="15" r="1.5" /><circle cx="17" cy="15" r="1.5" /></svg>
            </div>
          </div>
        `,
        iconSize: [44, 80],
        iconAnchor: [22, 60]
      });
      L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map.current);
      points.push([driverLat, driverLng]);
    }

    if (order.pickup?.lat && validDropoffs.length > 0 && validDropoffs[0].lat) {
      const fetchRoute = async () => {
        try {
          const coords = [order.pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
          const data = await res.json();
          
          if (data.code === 'Ok' && map.current) {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            routeLayer.current = L.polyline(routeCoords, {
              color: isDark ? '#4dabf7' : '#111111', 
              weight: 5,
              opacity: 0.8,
              lineJoin: 'round'
            }).addTo(map.current);
            
            if (driverLat && driverLng) {
              const driverLatLng = L.latLng(driverLat, driverLng);
              let minDistance = Infinity;
              const latlngs = routeLayer.current.getLatLngs().flat();
              latlngs.forEach(ll => {
                const dist = map.current.distance(driverLatLng, ll);
                if (dist < minDistance) minDistance = dist;
              });
              setRouteDeviation(minDistance > 500);
            }
            map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, isSheetExpanded ? 380 : 100] });
          }
        } catch (err) {
          if (points.length > 1 && map.current) map.current.fitBounds(L.latLngBounds(points), { padding: [50, isSheetExpanded ? 380 : 100] });
        }
      };
      fetchRoute();
    } else if (points.length > 1 && map.current) {
      map.current.fitBounds(L.latLngBounds(points), { padding: [50, isSheetExpanded ? 380 : 100] });
    }
  }, [order, isMapLoaded, mapTheme, isSheetExpanded, language]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] dark:bg-[#111111] flex flex-col items-center justify-center transition-colors">
        <Loader2 size={40} className="animate-spin text-[#111111] dark:text-white mb-4" />
        <p className="text-[14px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('Connecting to Live Feed', language)}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] dark:bg-[#111111] flex flex-col items-center justify-center p-6 text-center transition-colors">
        <AlertCircle size={48} className="text-red-500 mb-4" strokeWidth={2} />
        <h1 className="text-[24px] font-black text-[#111111] dark:text-white mb-2">{t('Signal Lost', language)}</h1>
        <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400 mb-8">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-4 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-full font-bold shadow-lg active:scale-95 transition-all">{t('Go Back', language)}</button>
      </div>
    );
  }

  const getStatusDisplay = (status) => {
    switch(status?.toLowerCase()) {
      case 'searching': return t('Finding Partner...', language);
      case 'assigned': return t('Partner En Route', language);
      case 'picked_up': return t('Package In Transit', language);
      case 'delivered': return t('Delivery Complete', language);
      default: return t('Processing Order...', language);
    }
  };

  const totalAmount = order.pricing?.estimatedPrice || order.totalFare || 0;
  const taxableValue = totalAmount / 1.18;
  const cgst = taxableValue * 0.09;
  const sgst = taxableValue * 0.09;
  const dropoffsArray = order.dropoffs || (order.dropoff ? [order.dropoff] : []);

  const handleRecenter = () => {
    if (map.current && routeLayer.current) {
      map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, isSheetExpanded ? 380 : 100] });
    }
  };

  const handleCallDriver = () => {
    window.location.href = `tel:${order.selectedBid?.driverPhone || '9999999999'}`;
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#F2F4F7] dark:bg-[#111111] overflow-hidden font-sans transition-colors duration-300">
      
      {/* SECTION 1: 100VH IMMERSIVE MAP CANVAS */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-[#e5e7eb] dark:bg-[#222222]" />

      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
      >
        <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
      </button>

      {/* SECTION 2: DRAGGABLE BOTTOM SHEET & FLOATING UI */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: window.innerHeight * 0.5 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y > 100) setIsSheetExpanded(false);
          else if (info.offset.y < -100) setIsSheetExpanded(true);
        }}
        animate={{ y: isSheetExpanded ? 0 : window.innerHeight * 0.52 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 left-0 right-0 z-[2000] flex flex-col pointer-events-none"
      >
        
        {/* Floating Modules */}
        <div className="px-5 mb-4 pointer-events-auto flex flex-col gap-3">
          <AnimatePresence>
            {routeDeviation && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-[24px] shadow-lg flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 bg-white dark:bg-[#111111] rounded-full flex items-center justify-center text-red-500 shrink-0">
                  <Navigation size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-[14px] font-black text-[#111111] dark:text-white tracking-tight">{t('Route Deviation', language)}</h4>
                  <p className="text-[12px] font-bold text-red-600 dark:text-red-400">{t('Driver is off the optimal path.', language)}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <OrderFloatingStatusCard 
            pickupAddress={order.pickup?.address}
            dropoffAddress={dropoffsArray[0]?.address}
            statusText={getStatusDisplay(order.status)}
            subText={t('Live Tracking Active', language)}
            onActionClick={handleRecenter}
            actionIcon={Crosshair}
          />
        </div>

        {/* Expandable Sheet Content */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.12)] pointer-events-auto flex flex-col p-5 h-[65vh] border-t border-gray-100 dark:border-gray-800 transition-colors">
          
          <div 
            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
            className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" 
          />

          <div className="flex gap-2 mb-5">
            <button 
              onClick={handleCallDriver}
              className="flex-1 bg-[#F6F6F6] dark:bg-[#2A2A2A] hover:bg-gray-100 dark:hover:bg-[#333333] text-[#111111] dark:text-white py-3.5 rounded-[20px] font-black text-[14px] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Phone size={18} strokeWidth={2.5} /> {t('Call', language)}
            </button>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex-1 bg-[#F6F6F6] dark:bg-[#2A2A2A] hover:bg-gray-100 dark:hover:bg-[#333333] text-[#111111] dark:text-white py-3.5 rounded-[20px] font-black text-[14px] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle size={18} strokeWidth={2.5} /> {t('Chat', language)}
            </button>
            <button 
              onClick={() => setIsSafetyOpen(true)}
              className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 px-5 py-3.5 rounded-[20px] font-black text-[14px] flex items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              <ShieldAlert size={18} strokeWidth={2.5} /> {t('SOS', language)}
            </button>
          </div>
          
          <OrderSegmentedToggle 
            tabs={TABS} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-4">
                  <OrderInfoListCard 
                    icon={UserCircle2}
                    title={t('Assigned Partner', language)}
                    subtitle={order.selectedBid?.driverName || t('Searching for partner...', language)}
                    rightValue={t(order.selectedBid?.vehicleType || "Auto-Match", language)}
                    rightSubValue={t('Vehicle Class', language)}
                  />
                  <OrderInfoListCard 
                    icon={Package}
                    title={t('Package Configuration', language)}
                    subtitle={t(order.packageDetails?.itemType || "General Cargo", language)}
                    rightValue={order.packageDetails?.isFragile ? t("Fragile", language) : t("Standard", language)}
                    rightSubValue={t('Handling Type', language)}
                    alertMode={order.packageDetails?.isFragile}
                  />
                  {order.packageDetails?.requiresSecureOTP && (
                    <OrderInfoListCard 
                      icon={Diamond}
                      title={t('Delivery Authentication', language)}
                      subtitle={t('End-to-End Secure OTP', language)}
                      rightValue={order.packageDetails.secureOTP || "****"}
                      rightSubValue={t('Verification PIN', language)}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-4">
                  <OrderInfoListCard 
                    icon={order.status === 'picked_up' || order.status === 'delivered' ? CheckCircle2 : Clock}
                    title={t('Origin Checkpoint', language)}
                    subtitle={order.pickup?.address}
                    rightValue={t('Pickup', language)}
                    rightSubValue={order.status === 'picked_up' || order.status === 'delivered' ? t('Cleared', language) : t('Pending', language)}
                  />
                  {dropoffsArray.map((drop, idx) => (
                    <OrderInfoListCard 
                      key={idx}
                      icon={MapPin}
                      title={`${t('Destination', language)} ${idx + 1}`}
                      subtitle={drop.address}
                      rightValue={t('Dropoff', language)}
                      rightSubValue={order.status === 'delivered' ? t('Cleared', language) : t('En Route', language)}
                    />
                  ))}
                </motion.div>
              )}

              {activeTab === 'receipt' && (
                <motion.div key="receipt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-4">
                  <OrderAnalyticsChart 
                    totalValue={totalAmount.toFixed(2)}
                    currency="₹"
                    dateRange={`${t('Order ID', language)}: ${order.id.slice(-8).toUpperCase()}`}
                    data={[
                      { label: t('Base Fare', language), value: taxableValue.toFixed(2), isActive: false },
                      { label: t('Taxes', language), value: (cgst + sgst).toFixed(2), isActive: false },
                      { label: t('Total', language), value: totalAmount.toFixed(2), isActive: true }
                    ]}
                  />
                  <OrderInfoListCard 
                    icon={Receipt}
                    title={t('Payment Status', language)}
                    subtitle={order.paymentMethod === 'cash' ? t('Cash on Delivery', language) : t('Pre-Paid / Wallet', language)}
                    rightValue={`₹${totalAmount.toFixed(2)}`}
                    rightSubValue={t('Final Amount', language)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

    </div>
  );
}