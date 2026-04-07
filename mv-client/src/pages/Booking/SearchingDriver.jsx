import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, CheckCircle2, UserCircle2, ShieldCheck, Loader2, Activity } from 'lucide-react';

// Real Store, Prefs & Firestore Integration
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../../services/firebaseAuth';

// Modular UI Components & Services
import { MAP_LAYERS } from '../../services/mapLayers';
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';

/**
 * PAGE: SEARCHING DRIVER (IMMERSIVE RADAR UI)
 * Architecture: 100vh Fullscreen Map Overlay
 * Features: 
 * - High-Fidelity CSS Radar Pulse
 * - Read-only Leaflet Route Plotting
 * - Floating Status Card Integration
 * - BUG FIX: Synchronized secure tenant path for real-time order matching
 * - DARK MODE & i18n: 100% Global compliance
 */

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

export default function SearchingDriver() {
  const navigate = useNavigate();
  const db = getFirestore();
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Global State
  const { activeOrder, pricing, pickup, dropoffs, resetBooking } = useBookingStore();
  const { mapTheme } = useMapSettingsStore();
  const { language } = usePreferencesStore();
  
  // Local UI State
  const [searchStatus, setSearchStatus] = useState('searching'); // 'searching' | 'found' | 'cancelled'
  const [driverDetails, setDriverDetails] = useState(null);

  // ============================================================================
  // OPENSTREETMAP ENGINE (IMMERSIVE BACKGROUND)
  // ============================================================================
  useEffect(() => {
    if (!pickup?.lat || !mapContainer.current) return;

    const isDark = document.documentElement.classList.contains('dark');
    const activeMapTheme = isDark && mapTheme === 'standard' ? 'dark' : mapTheme;

    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        center: [pickup.lat, pickup.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false
      });
    }

    // Refresh tiles on theme change
    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
         map.current.removeLayer(layer);
      }
    });
    L.tileLayer(MAP_LAYERS[activeMapTheme] || MAP_LAYERS.standard).addTo(map.current);

    const safeDropoffs = Array.isArray(dropoffs) ? dropoffs : [];
    const points = [];

    // Plot route waypoints
    const pickupIcon = L.divIcon({
      className: '',
      html: `<div class="w-4 h-4 bg-white dark:bg-[#111111] border-[4px] border-[#111111] dark:border-white rounded-full shadow-md transition-colors"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map.current);
    points.push([pickup.lat, pickup.lng]);

    safeDropoffs.forEach((drop) => {
      if (drop?.lat) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-lg border-[3px] border-white dark:border-[#111111] transition-colors"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
        points.push([drop.lat, drop.lng]);
      }
    });

    if (points.length > 1) {
      map.current.fitBounds(L.latLngBounds(points), { padding: [100, 100] });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [pickup, dropoffs, mapTheme]);

  // ============================================================================
  // LOGIC: REAL-TIME FIRESTORE LISTENER & AUTO-ASSIGN ENGINE
  // ============================================================================
  useEffect(() => {
    const user = auth.currentUser;
    if (!activeOrder || !user) {
      navigate('/dashboard-home', { replace: true });
      return;
    }

    const appId = getAppId();
    // FIX: Synchronized read/write path to secure tenant directory
    const orderRef = doc(db, 'artifacts', appId, 'users', user.uid, 'orders', activeOrder);

    const unsubscribe = onSnapshot(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        if (data.status === 'assigned' || data.status === 'accepted') {
          setDriverDetails(data.driver || pricing.selectedBid);
          setSearchStatus('found');
          setTimeout(() => navigate('/tracking-active', { replace: true }), 2500);
        } else if (data.status === 'cancelled') {
          setSearchStatus('cancelled');
          setTimeout(() => {
            resetBooking();
            navigate('/dashboard-home', { replace: true });
          }, 2000);
        }
      }
    });

    // Liquidity Engine (Simulation for Demo)
    const liquidityTimer = setTimeout(async () => {
      if (searchStatus === 'searching') {
        try {
          const matchedDriver = pricing.selectedBid || {
            driverName: "Verified Partner",
            rating: 4.9,
            vehicleType: "bike"
          };
          await updateDoc(orderRef, {
            status: 'assigned',
            driver: matchedDriver,
            matchedAt: serverTimestamp()
          });
        } catch (error) { console.error("Simulated match update failed:", error); }
      }
    }, 5000);

    return () => { unsubscribe(); clearTimeout(liquidityTimer); };
  }, [activeOrder, navigate, pricing.selectedBid, resetBooking, searchStatus, db]);

  const handleCancelSearch = async () => {
    const user = auth.currentUser;
    if (!activeOrder || !user) return;
    
    const appId = getAppId();
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'orders', activeOrder), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelReason: 'User cancelled search'
      });
    } catch (error) { console.error("Cancel search failed:", error); }
  };

  return (
    <div className="relative h-[100dvh] w-full bg-[#F2F4F7] dark:bg-[#111111] overflow-hidden font-sans flex flex-col transition-colors duration-300">
      
      {/* SECTION 1: 100vh IMMERSIVE MAP */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-[#e5e7eb] dark:bg-[#222222] transition-colors" />

      {/* SECTION 2: RADAR OVERLAY */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <AnimatePresence mode="wait">
          {searchStatus === 'searching' && (
            <motion.div 
              key="radar-effect"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative flex items-center justify-center w-full max-w-xs aspect-square"
            >
              {/* Pulsing Ripple Rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  animate={{ scale: [1, 2.8], opacity: [0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: ring * 0.8, ease: "easeOut" }}
                  className="absolute w-32 h-32 rounded-full border-4 border-[#111111] dark:border-white bg-[#111111]/5 dark:bg-white/5 transition-colors"
                />
              ))}
              
              {/* Central Radar Core */}
              <div className="w-24 h-24 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center z-20 shadow-[0_15px_40px_rgba(0,0,0,0.3)] border-4 border-white dark:border-[#111111] overflow-hidden transition-colors">
                <Activity size={32} className="text-white dark:text-[#111111] animate-pulse transition-colors" strokeWidth={2.5} />
              </div>
            </motion.div>
          )}

          {searchStatus === 'found' && (
            <motion.div 
              key="found-effect"
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#1A1A1A] p-8 rounded-[48px] shadow-2xl flex flex-col items-center gap-4 z-20 border border-gray-100 dark:border-[#333333] transition-colors"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(34,197,94,0.4)]">
                <CheckCircle2 size={40} className="text-white" strokeWidth={3} />
              </div>
              <h2 className="text-[20px] font-black text-[#111111] dark:text-white transition-colors">{t('Partner Found', language)}</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 3: TOP STATUS BADGE */}
      <div className="absolute top-14 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-black/90 dark:bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-white/10 dark:border-[#111111]/10 shadow-2xl transition-colors"
        >
          <Loader2 size={18} className="text-white dark:text-[#111111] animate-spin transition-colors" strokeWidth={3} />
          <span className="text-[14px] font-black text-white dark:text-[#111111] tracking-widest uppercase transition-colors">{t('Radar Active', language)}</span>
        </motion.div>
      </div>

      {/* SECTION 4: FLOATING BOTTOM UI */}
      <div className="mt-auto px-5 pb-10 z-30 pointer-events-auto flex flex-col gap-4">
        
        {/* Finding Driver Card (Modular Injection) */}
        <div className="w-full">
          <OrderFloatingStatusCard 
            pickupAddress={pickup?.address}
            dropoffAddress={dropoffs?.[0]?.address}
            statusText={searchStatus === 'searching' ? t('Broadcasting to Partners', language) : t('Driver Assigned', language)}
            subText={searchStatus === 'searching' ? t('Connecting to live marketplace...', language) : driverDetails?.driverName}
            actionIcon={X}
            onActionClick={handleCancelSearch}
          />
        </div>

        {/* Action Description */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-sm p-3 rounded-2xl border border-white/50 dark:border-[#333333]/50 transition-colors"
        >
          <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest transition-colors">
            {t('Dispatch ID', language)}: {activeOrder?.slice(-8).toUpperCase()}
          </p>
        </motion.div>
      </div>

    </div>
  );
}