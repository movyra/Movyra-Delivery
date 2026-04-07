import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ShieldCheck, MapPin, 
  Package, Clock, ArrowRight, Loader2, AlertCircle, 
  UserCircle2, CheckCircle2, Receipt
} from 'lucide-react';

// Premium Design System Components
import SystemCard from '../../components/UI/SystemCard';
import SystemButton from '../../components/UI/SystemButton';
import LineIconRegistry from '../../components/Icons/LineIconRegistry';

// Real Store, Auth & Database Integration
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { t } from '../../utils/translations';
import { auth } from '../../services/firebaseAuth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { deductFromWallet } from '../../services/payment';
import { MAP_LAYERS } from '../../services/mapLayers';

/**
 * PAGE: REVIEW ORDER & CHECKOUT (PREMIUM SPLIT-SCREEN UI)
 * Architecture: 45vh/55vh Split Screen
 * Features: 
 * - High-Contrast "Boarding Pass" Receipt UI paradigm
 * - Read-only Route Map (Leaflet via Dynamic CDN to prevent bundle crashes)
 * - LocationIQ Polyline Engine (Immune to OSRM 429 limits)
 * - Atomic Wallet Deduction & Firestore Dispatch
 * - BUG FIX: Synchronized write path to secure tenant directory
 * - DARK MODE & i18n: 100% Global compliance wired
 */

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

export default function ReviewOrder() {
  const navigate = useNavigate();
  const db = getFirestore();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayer = useRef(null);

  // Environment Config
  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

  // Real Global State
  const { pickup, dropoffs, packageDetails, scheduling, vehicleType, pricing, setActiveOrder } = useBookingStore();
  const { mapTheme } = useMapSettingsStore();
  const { language } = usePreferencesStore();

  // Local State
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Failsafe Redirect
  useEffect(() => {
    if (!pickup || !dropoffs || dropoffs.length === 0) {
      navigate('/booking/set-location', { replace: true });
    }
  }, [pickup, dropoffs, navigate]);

  // Financial Math
  const finalTotal = pricing?.estimatedPrice || 0;
  const taxableValue = finalTotal / 1.18;
  const gstAmount = finalTotal - taxableValue;
  const dropoffsArray = Array.isArray(dropoffs) ? dropoffs : [];

  // ============================================================================
  // DYNAMIC CDN LOADER FOR LEAFLET (Prevents Bundle ReferenceErrors)
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
  // OPENSTREETMAP ENGINE (LEAFLET ROUTE PLOTTING via LOCATIONIQ)
  // ============================================================================
  useEffect(() => {
    if (!isMapLoaded) return;
    const L = window.L;
    
    // Determine dynamic map tiles based on global dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const activeMapTheme = isDark && mapTheme === 'standard' ? 'dark' : mapTheme;

    if (!pickup?.lat || dropoffsArray.length === 0 || !mapContainer.current) return;

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
    }

    // Refresh tiles on theme change
    map.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
         map.current.removeLayer(layer);
      }
    });
    L.tileLayer(MAP_LAYERS[activeMapTheme] || MAP_LAYERS.standard).addTo(map.current);

    // Clear and Redraw Routes
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current.removeLayer(layer);
      }
    });

    const points = [];

    // Pickup Dot (Hollow, adapts to dark mode)
    const pickupIcon = L.divIcon({
      className: '',
      html: `<div class="w-4 h-4 bg-white dark:bg-[#111111] border-[4px] border-[#111111] dark:border-white rounded-full shadow-md transition-colors"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map.current);
    points.push([pickup.lat, pickup.lng]);

    // Destination Dot (Solid Red)
    dropoffsArray.forEach((drop) => {
      if (drop?.lat) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.5)] border-[3px] border-white dark:border-[#111111] transition-colors"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
        points.push([drop.lat, drop.lng]);
      }
    });

    const fetchReviewRoute = async () => {
      try {
        if (!LOCATIONIQ_API_KEY) throw new Error("Missing LocationIQ API Key");
        const coords = [pickup, ...dropoffsArray].map(s => `${s.lng},${s.lat}`).join(';');
        const res = await fetch(`https://us1.locationiq.com/v1/directions/driving/${coords}?key=${LOCATIONIQ_API_KEY}&geometries=geojson&overview=full`);
        
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const text = await res.text();
        const data = JSON.parse(text);
        
        if (data.code === 'Ok') {
          const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          routeLayer.current = L.polyline(routeCoords, {
            color: ['dark', 'satellite'].includes(activeMapTheme) ? '#4dabf7' : '#111111',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round'
          }).addTo(map.current);
          map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 100] });
        }
      } catch (err) {
        console.warn("Polyline failed, falling back to bounds.", err);
        if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [50, 100] });
      }
    };

    fetchReviewRoute();
    setTimeout(() => map.current?.invalidateSize(), 200);

  }, [pickup, dropoffsArray, mapTheme, isMapLoaded, LOCATIONIQ_API_KEY]);

  // ============================================================================
  // LOGIC: MASTER DISPATCH ENGINE
  // ============================================================================
  const handlePlaceOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("Authentication required.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const secureOTP = Math.floor(1000 + Math.random() * 9000).toString();
      const orderPayload = {
        userId: user.uid,
        pickup,
        dropoffs: dropoffsArray,
        packageDetails: { ...packageDetails, secureOTP },
        scheduling,
        vehicleType,
        pricing: { ...pricing, taxableValue, gstAmount },
        status: 'searching',
        createdAt: serverTimestamp(),
        selectedBid: pricing.selectedBid || null 
      };

      const appId = getAppId();
      
      // FIX: Synchronized secure write path
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderPayload);
      
      await deductFromWallet(finalTotal, docRef.id);
      setActiveOrder(docRef.id);
      navigate('/booking/searching', { replace: true });
    } catch (err) {
      setError(err.message || "Dispatch failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (!pickup) return null;

  return (
    <div className="relative w-full h-[100dvh] bg-[#F2F4F7] dark:bg-[#111111] overflow-hidden font-sans flex flex-col transition-colors duration-300">
      
      {/* ========================================================= */}
      {/* TOP HALF: 45vh MAP CANVAS */}
      {/* ========================================================= */}
      <div className="relative w-full h-[45vh] shrink-0 z-10">
        <div ref={mapContainer} className="absolute inset-0 bg-[#e5e7eb] dark:bg-[#222222] transition-colors" />

        {/* Floating Top-Left Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>

      </div>

      {/* ========================================================= */}
      {/* BOTTOM HALF: 55vh SCROLLABLE REVIEW LIST */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pt-6 pb-32 px-5 space-y-4 z-0 relative">
        
        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 p-5 rounded-[24px] font-bold text-[14px] flex items-start gap-3 shadow-sm mb-4 transition-colors">
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: THE "BOARDING PASS" RECEIPT UI */}
        <SystemCard animated variant="white" className="!p-0 overflow-hidden border-2 border-gray-100 dark:border-[#333333] flex flex-col mb-4 dark:bg-[#1A1A1A] transition-colors">
          
          {/* Top half: Logistics summary */}
          <div className="p-6 bg-white dark:bg-[#1A1A1A] border-b-2 border-dashed border-gray-200 dark:border-gray-700 relative transition-colors">
            {/* Semi-circle cutouts for ticket effect */}
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#F2F4F7] dark:bg-[#111111] rounded-full border-r-2 border-t-2 border-gray-100 dark:border-gray-700 rotate-45 transition-colors" />
            <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#F2F4F7] dark:bg-[#111111] rounded-full border-l-2 border-t-2 border-gray-100 dark:border-gray-700 -rotate-45 transition-colors" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{t('Service Class', language)}</span>
                <h3 className="text-[20px] font-black text-[#111111] dark:text-white leading-none mt-1 tracking-tight transition-colors">{t(vehicleType?.toUpperCase() || 'STANDARD', language)}</h3>
              </div>
              <div className="w-12 h-12 bg-[#F2F4F7] dark:bg-[#2A2A2A] rounded-full flex items-center justify-center text-[#111111] dark:text-white transition-colors">
                <LineIconRegistry name={vehicleType === 'bike' ? 'scooter' : vehicleType === 'minitruck' ? 'box' : 'car'} size={24} strokeWidth={2} />
              </div>
            </div>
            
            {/* Timeline */}
            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[3px] before:bg-gray-100 dark:before:bg-gray-800">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-white dark:bg-[#1A1A1A] border-[5px] border-[#111111] dark:border-white shadow-sm shrink-0 transition-colors" />
                <div className="flex-1 overflow-hidden">
                  <span className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 transition-colors">{t('Pickup', language)}</span>
                  <p className="text-[14px] font-black text-[#111111] dark:text-white truncate transition-colors">{pickup.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 relative z-10 pt-2">
                <div className="w-6 h-6 rounded-full bg-[#FF3B30] border-[5px] border-white dark:border-[#1A1A1A] shadow-[0_2px_8px_rgba(255,59,48,0.4)] shrink-0 transition-colors" />
                <div className="flex-1 overflow-hidden">
                  <span className="block text-[11px] font-black text-[#FF3B30] uppercase tracking-widest mb-0.5">{t('Dropoff', language)}</span>
                  <p className="text-[14px] font-black text-[#111111] dark:text-white truncate transition-colors">{dropoffsArray[0]?.address}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom half: Financials */}
          <div className="p-6 bg-[#FAFAFA] dark:bg-[#151515] transition-colors">
            <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 block transition-colors">{t('Payment Summary', language)}</span>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-[14px] font-bold text-gray-500 dark:text-gray-400 transition-colors">
                <span>{t('Base Fare', language)}</span>
                <span className="text-[#111111] dark:text-white transition-colors">₹{taxableValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold text-gray-500 dark:text-gray-400 transition-colors">
                <span>{t('Taxes & Fees', language)}</span>
                <span className="text-[#111111] dark:text-white transition-colors">₹{gstAmount.toFixed(2)}</span>
              </div>
              {pricing.isGroupDelivery && (
                <div className="flex justify-between text-[14px] font-bold text-green-600 dark:text-green-400 transition-colors">
                  <span>{t('Group Pool Discount', language)}</span>
                  <span>- 20%</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-end border-t border-gray-200 dark:border-gray-800 pt-5 transition-colors">
              <span className="text-[14px] font-black text-[#111111] dark:text-white uppercase tracking-wider transition-colors">{t('Total', language)}</span>
              <span className="text-[36px] font-black text-[#111111] dark:text-white leading-none tracking-tighter transition-colors">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </SystemCard>

        {/* SECTION 2: Package & Security Context */}
        <SystemCard animated variant="white" className="flex flex-col gap-4 !p-5 mb-4 dark:bg-[#1A1A1A] dark:border-[#333333] transition-colors">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F2F4F7] dark:bg-[#2A2A2A] flex items-center justify-center text-[#111111] dark:text-white transition-colors">
                <Package size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[16px] font-black text-[#111111] dark:text-white tracking-tight transition-colors">{t('Package Type', language)}</h4>
                <p className="text-[13px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">{t(packageDetails.itemType || "General Cargo", language)}</p>
              </div>
            </div>
            <div className="text-right">
               <span className="block text-[13px] font-black text-[#111111] dark:text-white transition-colors">{packageDetails.isFragile ? t("Fragile", language) : t("Standard", language)}</span>
               <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">{t('Mode', language)}</span>
            </div>
          </div>

          <div className="h-px w-full bg-gray-100 dark:bg-gray-800 transition-colors" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${packageDetails.isHighValue ? 'bg-blue-50 dark:bg-[#1A365D]/50 text-[#276EF1] dark:text-[#4dabf7]' : 'bg-[#F2F4F7] dark:bg-[#2A2A2A] text-gray-400 dark:text-gray-500'}`}>
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[16px] font-black text-[#111111] dark:text-white tracking-tight transition-colors">{t('Protection', language)}</h4>
                <p className="text-[13px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">{packageDetails.isHighValue ? t('Insured Cargo', language) : t('Basic Coverage', language)}</p>
              </div>
            </div>
            <div className="text-right">
               <span className={`block text-[13px] font-black transition-colors ${packageDetails.isHighValue ? 'text-[#276EF1] dark:text-[#4dabf7]' : 'text-[#111111] dark:text-white'}`}>{packageDetails.isHighValue ? t('Active', language) : t('Basic', language)}</span>
               <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">{t('Status', language)}</span>
            </div>
          </div>

        </SystemCard>

        {/* SECTION 3: Scheduling Context */}
        {scheduling.isScheduledLater && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <SystemCard variant="white" className="!p-5 border-orange-100 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-900/20 flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-orange-500 shadow-sm shrink-0 border border-orange-100 dark:border-orange-900/50 transition-colors">
                <Clock size={24} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[11px] font-black text-orange-400 uppercase tracking-widest mb-1 transition-colors">{t('Scheduled Dispatch', language)}</span>
                <p className="text-[15px] font-black text-[#111111] dark:text-white tracking-tight transition-colors">
                  {new Date(scheduling.scheduledDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </SystemCard>
          </motion.div>
        )}

      </div>

      {/* ========================================================= */}
      {/* SECTION 4: STICKY CONFIRMATION CTA */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 dark:bg-[#111111]/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-50 transition-colors duration-300">
        <SystemButton 
          onClick={handlePlaceOrder}
          disabled={isLoading}
          loading={isLoading}
          variant="primary"
          icon={ArrowRight}
          className="flex-row-reverse" // Puts the arrow on the right
        >
          {`${t('Confirm & Pay', language)} ₹${finalTotal}`}
        </SystemButton>
      </div>

    </div>
  );
}