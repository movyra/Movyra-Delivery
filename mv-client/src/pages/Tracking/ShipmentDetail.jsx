import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Clock, Loader2, 
  AlertCircle, CheckCircle2, Package, 
  ShieldCheck, Diamond, UserCircle2, Crosshair, Receipt
} from 'lucide-react';

// Real Database & Auth Integration
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseAuth';
import useMapSettingsStore from '../../store/useMapSettingsStore';

// Modular UI Components
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';
import OrderInfoListCard from '../../components/OrderDetails/OrderInfoListCard';
import OrderAnalyticsChart from '../../components/OrderDetails/OrderAnalyticsChart';
import { MAP_LAYERS } from '../../services/mapLayers';

/**
 * PAGE: ACTIVE SHIPMENT DETAIL (LIVE TRACKING)
 * Architecture: 100vh Immersive Map + Bottom Sheet Floating UI
 * Features: 
 * - Real-time Firestore Sync (Secured with strict onAuthStateChanged listener)
 * - 100dvh Full-Screen Leaflet Map via Dynamic CDN
 * - DarkTooltipOverlay style custom HTML Map Pins
 * - LocationIQ Polyline Engine with Bounds Padding
 */

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'receipt', label: 'Live Total' }
];

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayer = useRef(null);

  // Environment Config
  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
  const { mapTheme } = useMapSettingsStore();

  // Local Data & UI State
  const [order, setOrder] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // ============================================================================
  // REAL-TIME FIRESTORE DATA SYNC (STRICT AUTH RACE-CONDITION FIX)
  // ============================================================================
  useEffect(() => {
    if (!id) return;
    let unsubscribeSnapshot;

    // STRICT FIX: Wait for Firebase Auth to initialize before listening to the document
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const orderRef = doc(db, 'orders', id);
        unsubscribeSnapshot = onSnapshot(orderRef, (docSnap) => {
          if (docSnap.exists()) {
            setOrder({ id: docSnap.id, ...docSnap.data() });
            setError('');
          } else {
            setError('Order record not found or has been removed.');
            setOrder(null);
          }
          setIsLoading(false);
        }, (err) => {
          console.error("Firestore Live Tracking Error:", err);
          setError('Failed to securely fetch live order details.');
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
  }, [id, db, navigate]);

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
  // OPENSTREETMAP ENGINE (100vh FULL-SCREEN LEAFLET PLOTTING)
  // ============================================================================
  useEffect(() => {
    if (!isMapLoaded || !order || !mapContainer.current) return;
    const L = window.L;

    const pickupLat = order.pickup?.lat || 28.6139;
    const pickupLng = order.pickup?.lng || 77.2090;

    // Initialize Leaflet Map once
    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        center: [pickupLat, pickupLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        touchZoom: true
      });
      L.tileLayer(MAP_LAYERS[mapTheme] || MAP_LAYERS.standard).addTo(map.current);
    }

    // Clear existing layers to prevent duplicates on live updates
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current.removeLayer(layer);
      }
    });

    const validDropoffs = order.dropoffs || (order.dropoff ? [order.dropoff] : []);
    const points = [];

    // Plot Pickup Marker (Dark Premium Icon)
    if (order.pickup?.lat) {
      const pickupIcon = L.divIcon({
        className: '',
        html: `
          <div class="w-[36px] h-[36px] bg-[#111111] text-white rounded-full shadow-lg flex items-center justify-center border-[3px] border-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      L.marker([order.pickup.lat, order.pickup.lng], { icon: pickupIcon }).addTo(map.current);
      points.push([order.pickup.lat, order.pickup.lng]);
    }

    // Plot Dropoff Markers (Static Red Pin)
    validDropoffs.forEach((drop) => {
      if (drop?.lat) {
        const dropIcon = L.divIcon({
          className: '',
          html: `
            <div class="w-[36px] h-[36px] bg-[#FF3B30] text-white rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.5)] flex items-center justify-center border-[3px] border-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
        points.push([drop.lat, drop.lng]);
      }
    });

    // Plot Active Driver (DarkTooltipOverlay Engine)
    if ((order.status === 'assigned' || order.status === 'picked_up') && validDropoffs.length > 0) {
      // Simulate live driver position slightly offset from dropoff for visualization
      const driverLat = validDropoffs[0].lat - 0.005;
      const driverLng = validDropoffs[0].lng - 0.005;
      
      const driverIcon = L.divIcon({
        className: '',
        html: `
          <div class="flex flex-col items-center transform -translate-y-[20px] relative z-50">
            <div class="bg-[#111111] text-white px-3 py-1.5 rounded-[10px] text-[12px] font-black shadow-[0_10px_20px_rgba(0,0,0,0.3)] mb-1.5 relative flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              ${order.selectedBid?.etaMins || '5'} MIN ETA
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#111111] rotate-45"></div>
            </div>
            <div class="w-11 h-11 bg-white rounded-full border-[3px] border-[#111111] shadow-xl flex items-center justify-center text-[#111111]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 10l1.5-4.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L19 10" /><path d="M22 10v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2z" /><circle cx="7" cy="15" r="1.5" /><circle cx="17" cy="15" r="1.5" /></svg>
            </div>
          </div>
        `,
        iconSize: [44, 80],
        iconAnchor: [22, 60] // Anchors the bottom tip of the scooter circle
      });
      L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map.current);
      points.push([driverLat, driverLng]);
    }

    // Fetch and draw the Route Polyline via LocationIQ
    if (order.pickup?.lat && validDropoffs.length > 0 && validDropoffs[0].lat) {
      const fetchRoute = async () => {
        try {
          if (!LOCATIONIQ_API_KEY) throw new Error("LocationIQ API Key missing");
          const coords = [order.pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
          const res = await fetch(`https://us1.locationiq.com/v1/directions/driving/${coords}?key=${LOCATIONIQ_API_KEY}&geometries=geojson&overview=full`);
          
          if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
          
          const data = await res.json();
          if (data.code === 'Ok') {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            
            routeLayer.current = L.polyline(routeCoords, {
              color: ['dark', 'satellite'].includes(mapTheme) ? '#4dabf7' : '#111111', 
              weight: 5,
              opacity: 0.8,
              lineJoin: 'round'
            }).addTo(map.current);
            
            // Auto-fit with heavy bottom padding to account for the overlapping Bottom Sheet UI
            map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 380] });
          }
        } catch (err) {
          console.warn("Route API limits hit, gracefully falling back to point bounds.", err.message);
          if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [50, 380] });
        }
      };
      fetchRoute();
    } else if (points.length > 1) {
      map.current.fitBounds(L.latLngBounds(points), { padding: [50, 380] });
    }

    setTimeout(() => map.current?.invalidateSize(), 200);
  }, [order, isMapLoaded, mapTheme, LOCATIONIQ_API_KEY]);

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center font-sans">
        <Loader2 size={40} className="animate-spin text-[#111111] mb-4" />
        <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">Connecting to Live Feed</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center p-6 text-center font-sans">
        <AlertCircle size={48} className="text-red-500 mb-4" strokeWidth={2} />
        <h1 className="text-[24px] font-black text-[#111111] mb-2">Signal Lost</h1>
        <p className="text-[15px] font-medium text-gray-500 mb-8">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-4 bg-[#111111] text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform">Go Back</button>
      </div>
    );
  }

  // Formatting Utilities
  const getStatusDisplay = (status) => {
    switch(status?.toLowerCase()) {
      case 'searching': return 'Finding Partner...';
      case 'assigned': return 'Partner En Route';
      case 'picked_up': return 'Package In Transit';
      case 'delivered': return 'Delivery Complete';
      default: return 'Processing Order...';
    }
  };

  const totalAmount = order.pricing?.estimatedPrice || order.totalFare || 0;
  const taxableValue = totalAmount / 1.18;
  const cgst = taxableValue * 0.09;
  const sgst = taxableValue * 0.09;
  const dropoffsArray = order.dropoffs || (order.dropoff ? [order.dropoff] : []);

  const handleRecenter = () => {
    if (map.current && routeLayer.current) {
      map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 380] });
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#F2F4F7] overflow-hidden font-sans">
      
      {/* ========================================================= */}
      {/* 100VH IMMERSIVE MAP CANVAS */}
      {/* ========================================================= */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-[#e5e7eb]" />

      {/* Floating Top-Left Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
      >
        <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
      </button>

      {/* ========================================================= */}
      {/* BOTTOM SHEET FLOATING OVERLAY */}
      {/* ========================================================= */}
      <div className="absolute bottom-0 left-0 right-0 z-[2000] p-5 pb-8 flex flex-col gap-4 pointer-events-none">
        
        {/* Floating Status Engine (Detached) */}
        <div className="pointer-events-auto">
          <OrderFloatingStatusCard 
            pickupAddress={order.pickup?.address}
            dropoffAddress={dropoffsArray[0]?.address}
            statusText={getStatusDisplay(order.status)}
            subText="Live Tracking Active"
            onActionClick={handleRecenter}
            actionIcon={Crosshair}
          />
        </div>

        {/* Detailed Data Bottom Sheet */}
        <div className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] pointer-events-auto flex flex-col p-5 max-h-[50vh] overflow-y-auto no-scrollbar border border-gray-100">
          
          {/* Segmented Tab Toggles */}
          <OrderSegmentedToggle 
            tabs={TABS} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          <AnimatePresence mode="wait">
            
            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-4">
                <OrderInfoListCard 
                  icon={UserCircle2}
                  title="Assigned Partner"
                  subtitle={order.selectedBid?.driverName || "Searching for partner..."}
                  rightValue={order.selectedBid?.vehicleType || "Auto-Match"}
                  rightSubValue="Vehicle Class"
                />

                <OrderInfoListCard 
                  icon={Package}
                  title="Package Configuration"
                  subtitle={order.packageDetails?.itemType || "Standard Package"}
                  rightValue={order.packageDetails?.isFragile ? "Fragile" : "Standard"}
                  rightSubValue="Handling Type"
                  alertMode={order.packageDetails?.isFragile}
                />

                {order.packageDetails?.requiresSecureOTP && (
                  <OrderInfoListCard 
                    icon={Diamond}
                    title="Delivery Authentication"
                    subtitle="End-to-End Secure OTP"
                    rightValue={order.packageDetails.secureOTP || "****"}
                    rightSubValue="Verification PIN"
                  />
                )}
              </motion.div>
            )}

            {/* TAB 2: TIMELINE */}
            {activeTab === 'timeline' && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-4">
                <OrderInfoListCard 
                  icon={order.status === 'picked_up' || order.status === 'delivered' ? CheckCircle2 : Clock}
                  title="Origin Checkpoint"
                  subtitle={order.pickup?.address}
                  rightValue="Pickup"
                  rightSubValue={order.status === 'picked_up' || order.status === 'delivered' ? 'Cleared' : 'Pending'}
                />

                {dropoffsArray.map((drop, idx) => (
                  <OrderInfoListCard 
                    key={idx}
                    icon={MapPin}
                    title={`Destination ${idx + 1}`}
                    subtitle={drop.address}
                    rightValue="Dropoff"
                    rightSubValue={order.status === 'delivered' ? 'Cleared' : 'En Route'}
                  />
                ))}
              </motion.div>
            )}

            {/* TAB 3: RECEIPT / LIVE TOTAL */}
            {activeTab === 'receipt' && (
              <motion.div key="receipt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-4">
                <OrderAnalyticsChart 
                  totalValue={totalAmount.toFixed(2)}
                  currency="₹"
                  dateRange={`Order ID: ${order.id.slice(-8).toUpperCase()}`}
                  data={[
                    { label: 'Base Fare', value: taxableValue.toFixed(2), isActive: false },
                    { label: 'Taxes', value: (cgst + sgst).toFixed(2), isActive: false },
                    { label: 'Total', value: totalAmount.toFixed(2), isActive: true }
                  ]}
                />

                <OrderInfoListCard 
                  icon={Receipt}
                  title="Payment Status"
                  subtitle={order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Pre-Paid / Wallet'}
                  rightValue={`₹${totalAmount.toFixed(2)}`}
                  rightSubValue="Final Amount"
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}