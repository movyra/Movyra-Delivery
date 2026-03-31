import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, CheckCircle2, UserCircle2, ShieldCheck, Loader2, Activity } from 'lucide-react';

// Real Store & Firestore Integration
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';
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
 * - Real-time Firestore Auto-Assign logic
 */

export default function SearchingDriver() {
  const navigate = useNavigate();
  const db = getFirestore();
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Global State
  const { activeOrder, pricing, pickup, dropoffs, resetBooking } = useBookingStore();
  const { mapTheme } = useMapSettingsStore();
  
  // Local UI State
  const [searchStatus, setSearchStatus] = useState('searching'); // 'searching' | 'found' | 'cancelled'
  const [driverDetails, setDriverDetails] = useState(null);

  // ============================================================================
  // OPENSTREETMAP ENGINE (IMMERSIVE BACKGROUND)
  // ============================================================================
  useEffect(() => {
    if (!pickup?.lat || !mapContainer.current) return;

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
      L.tileLayer(MAP_LAYERS[mapTheme] || MAP_LAYERS.standard).addTo(map.current);
    }

    const safeDropoffs = Array.isArray(dropoffs) ? dropoffs : [];
    const points = [];

    // Plot route waypoints
    const pickupIcon = L.divIcon({
      className: '',
      html: `<div class="w-4 h-4 bg-white border-[4px] border-[#111111] rounded-full shadow-md"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map.current);
    points.push([pickup.lat, pickup.lng]);

    safeDropoffs.forEach((drop) => {
      if (drop?.lat) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-lg border-[3px] border-white"></div>`,
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
    if (!activeOrder) {
      navigate('/dashboard-home', { replace: true });
      return;
    }

    const orderRef = doc(db, 'orders', activeOrder);

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
        } catch (error) { console.error(error); }
      }
    }, 5000);

    return () => { unsubscribe(); clearTimeout(liquidityTimer); };
  }, [activeOrder, navigate, pricing.selectedBid, resetBooking, searchStatus, db]);

  const handleCancelSearch = async () => {
    if (!activeOrder) return;
    try {
      await updateDoc(doc(db, 'orders', activeOrder), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelReason: 'User cancelled search'
      });
    } catch (error) { console.error(error); }
  };

  return (
    <div className="relative h-screen w-full bg-[#F2F4F7] overflow-hidden font-sans flex flex-col">
      
      {/* SECTION 1: 100vh IMMERSIVE MAP */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-[#e5e7eb]" />

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
                  className="absolute w-32 h-32 rounded-full border-4 border-[#111111] bg-[#111111]/5"
                />
              ))}
              
              {/* Central Radar Core */}
              <div className="w-24 h-24 bg-[#111111] rounded-full flex items-center justify-center z-20 shadow-[0_15px_40px_rgba(0,0,0,0.3)] border-4 border-white overflow-hidden">
                <Activity size={32} className="text-white animate-pulse" strokeWidth={2.5} />
              </div>
            </motion.div>
          )}

          {searchStatus === 'found' && (
            <motion.div 
              key="found-effect"
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[48px] shadow-2xl flex flex-col items-center gap-4 z-20 border border-gray-100"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(34,197,94,0.4)]">
                <CheckCircle2 size={40} className="text-white" strokeWidth={3} />
              </div>
              <h2 className="text-[20px] font-black text-[#111111]">Partner Found</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 3: TOP STATUS BADGE */}
      <div className="absolute top-14 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-black/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 border border-white/10 shadow-2xl"
        >
          <Loader2 size={18} className="text-white animate-spin" strokeWidth={3} />
          <span className="text-[14px] font-black text-white tracking-widest uppercase">Radar Active</span>
        </motion.div>
      </div>

      {/* SECTION 4: FLOATING BOTTOM UI */}
      <div className="mt-auto px-5 pb-10 z-30 pointer-events-auto flex flex-col gap-4">
        
        {/* Finding Driver Card (Modular Injection) */}
        <div className="w-full">
          <OrderFloatingStatusCard 
            pickupAddress={pickup?.address}
            dropoffAddress={dropoffs?.[0]?.address}
            statusText={searchStatus === 'searching' ? 'Broadcasting to Partners' : 'Driver Assigned'}
            subText={searchStatus === 'searching' ? 'Connecting to live marketplace...' : driverDetails?.driverName}
            actionIcon={X}
            onActionClick={handleCancelSearch}
          />
        </div>

        {/* Action Description */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-white/50"
        >
          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
            Dispatch ID: {activeOrder?.slice(-8).toUpperCase()}
          </p>
        </motion.div>
      </div>

    </div>
  );
}