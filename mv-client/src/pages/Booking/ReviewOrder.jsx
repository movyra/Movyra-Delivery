import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, Wallet, ShieldCheck, MapPin, 
  Package, Clock, ArrowRight, Loader2, AlertCircle, 
  UserCircle2, Truck, CheckCircle2, Receipt, Diamond 
} from 'lucide-react';

// Real Store, Auth & Database Integration
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';
import { auth } from '../../services/firebaseAuth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { deductFromWallet } from '../../services/payment';

// Modular UI Components (Premium Split-Screen Aesthetic)
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';
import OrderInfoListCard from '../../components/OrderDetails/OrderInfoListCard';
import OrderAnalyticsChart from '../../components/OrderDetails/OrderAnalyticsChart';
import { MAP_LAYERS } from '../../services/mapLayers';

/**
 * PAGE: REVIEW ORDER & CHECKOUT (PREMIUM SPLIT-SCREEN UI)
 * Architecture: 45vh/55vh Split Screen
 * Features: 
 * - Read-only Route Map (Leaflet)
 * - Floating Status Card with 2-dot timeline
 * - Analytics Chart for price breakdown
 * - Atomic Wallet Deduction & Firestore Dispatch
 */

export default function ReviewOrder() {
  const navigate = useNavigate();
  const db = getFirestore();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayer = useRef(null);

  // Real Global State
  const { pickup, dropoffs, packageDetails, scheduling, vehicleType, pricing, setActiveOrder } = useBookingStore();
  const { mapTheme } = useMapSettingsStore();

  // Local Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Failsafe Redirect
  useEffect(() => {
    if (!pickup || dropoffs.length === 0) {
      navigate('/booking/set-location', { replace: true });
    }
  }, [pickup, dropoffs, navigate]);

  // Financial Math
  const finalTotal = pricing?.estimatedPrice || 0;
  const taxableValue = finalTotal / 1.18;
  const gstAmount = finalTotal - taxableValue;
  const dropoffsArray = Array.isArray(dropoffs) ? dropoffs : [];

  // ============================================================================
  // OPENSTREETMAP ENGINE (LEAFLET ROUTE PLOTTING)
  // ============================================================================
  useEffect(() => {
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
      L.tileLayer(MAP_LAYERS[mapTheme] || MAP_LAYERS.standard).addTo(map.current);
    }

    // Clear and Redraw
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current.removeLayer(layer);
      }
    });

    const points = [];

    // Pickup Dot (Hollow)
    const pickupIcon = L.divIcon({
      className: '',
      html: `<div class="w-4 h-4 bg-white border-[4px] border-[#111111] rounded-full shadow-md"></div>`,
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
          html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.5)] border-[3px] border-white"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
        points.push([drop.lat, drop.lng]);
      }
    });

    const fetchReviewRoute = async () => {
      try {
        const coords = [pickup, ...dropoffsArray].map(s => `${s.lng},${s.lat}`).join(';');
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
          map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 100] });
        }
      } catch (err) {
        if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [50, 100] });
      }
    };

    fetchReviewRoute();
    setTimeout(() => map.current?.invalidateSize(), 200);

  }, [pickup, dropoffsArray, mapTheme]);

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

      const docRef = await addDoc(collection(db, 'orders'), orderPayload);
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
    <div className="relative w-full h-screen bg-[#F2F4F7] overflow-hidden font-sans flex flex-col">
      
      {/* ========================================================= */}
      {/* TOP HALF: 45vh MAP CANVAS */}
      {/* ========================================================= */}
      <div className="relative w-full h-[45vh] shrink-0 z-10">
        <div ref={mapContainer} className="absolute inset-0 bg-[#e5e7eb]" />

        {/* Floating Top-Left Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>

        {/* OVERLAPPING FLOATING CARD (Two-Dot Timeline Injection) */}
        <div className="absolute -bottom-8 left-5 right-5 z-[2000]">
          <OrderFloatingStatusCard 
            pickupAddress={pickup.address}
            dropoffAddress={dropoffsArray[0]?.address}
            statusText={`₹${finalTotal} Checkout`}
            subText={vehicleType ? `${vehicleType.toUpperCase()} SELECTED` : 'CALCULATING'}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM HALF: 55vh SCROLLABLE REVIEW LIST */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pt-16 pb-32 px-5 space-y-4 z-0 relative">
        
        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-[32px] font-bold text-[14px] flex items-start gap-3 shadow-sm mb-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: Dynamic Spending Summary Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <OrderAnalyticsChart 
            totalValue={finalTotal.toFixed(2)}
            currency="₹"
            dateRange="Transaction Summary"
            data={[
              { label: 'Fare', value: taxableValue.toFixed(2), isActive: false },
              { label: 'Taxes', value: gstAmount.toFixed(2), isActive: false },
              { label: 'Total', value: finalTotal.toFixed(2), isActive: true }
            ]}
          />
        </motion.div>

        {/* SECTION 2: Package & Security Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <OrderInfoListCard 
            icon={Package}
            title="Package Payload"
            subtitle={packageDetails.itemType || "General Cargo"}
            rightValue={packageDetails.isFragile ? "Fragile" : "Standard"}
            rightSubValue="Safety Mode"
            alertMode={packageDetails.isFragile}
          />

          {packageDetails.isHighValue && (
            <OrderInfoListCard 
              icon={ShieldCheck}
              title="Security Protocol"
              subtitle="High-Value Insurance Enabled"
              rightValue="Active"
              rightSubValue="Movyra Secure"
            />
          )}

          <OrderInfoListCard 
            icon={UserCircle2}
            title="Delivery Partner"
            subtitle={pricing.selectedBid ? pricing.selectedBid.driverName : "Auto-Matched Driver"}
            rightValue={vehicleType?.toUpperCase() || "MOTO"}
            rightSubValue="Vehicle Class"
          />
        </motion.div>

        {/* SECTION 3: Scheduling Alert */}
        {scheduling.isScheduledLater && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-orange-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <Clock size={24} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Scheduled Pickup</span>
                <p className="text-[15px] font-black text-[#111111]">
                  {new Date(scheduling.scheduledDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* ========================================================= */}
      {/* SECTION 7: STICKY CONFIRMATION CTA */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 backdrop-blur-md border-t border-gray-200 z-50">
        <button 
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="w-full flex items-center justify-between px-6 bg-[#111111] text-white py-4 rounded-[28px] font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[64px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] disabled:opacity-50"
        >
          <span className="flex-1 text-center pl-6">
            {isLoading ? 'Processing Payment...' : `Confirm & Pay ₹${finalTotal}`}
          </span>
          {isLoading ? <Loader2 size={24} className="animate-spin text-white" /> : <ArrowRight size={24} className="text-white" strokeWidth={3} />}
        </button>
      </div>

    </div>
  );
}