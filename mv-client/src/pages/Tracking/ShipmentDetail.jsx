import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, MapPin, Clock, Loader2, 
  AlertCircle, CheckCircle2, Truck,
  Package, ShieldAlert, Diamond, UserCircle2, Crosshair, Receipt
} from 'lucide-react';

// Real Database Integration
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Modular UI Components (Matching Premium Split-Screen Aesthetic)
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';
import OrderInfoListCard from '../../components/OrderDetails/OrderInfoListCard';
import OrderAnalyticsChart from '../../components/OrderDetails/OrderAnalyticsChart';

/**
 * PAGE: ACTIVE SHIPMENT DETAIL (LIVE TRACKING)
 * Architecture: 45vh/55vh Split Screen
 * Features: 
 * - Real-time Firestore Sync (onSnapshot)
 * - Leaflet Map with Custom Red Destination Pin & Route
 * - Dynamic Floating Status Card
 * - Segmented Toggles
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

  // Local Data & UI State
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // ============================================================================
  // REAL-TIME FIRESTORE DATA SYNC (LIVE TRACKING)
  // ============================================================================
  useEffect(() => {
    if (!id) return;
    const orderRef = doc(db, 'orders', id);

    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
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

    return () => unsubscribe();
  }, [id, db]);

  // ============================================================================
  // OPENSTREETMAP ENGINE (LEAFLET PLOTTING & ROUTING)
  // ============================================================================
  useEffect(() => {
    if (!order || !mapContainer.current) return;

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
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map.current);
    }

    // Clear existing layers to prevent duplicates on live updates
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.current.removeLayer(layer);
      }
    });

    const validDropoffs = order.dropoffs || (order.dropoff ? [order.dropoff] : []);
    const points = [];

    // Plot Pickup Marker (Hollow Dot)
    if (order.pickup?.lat) {
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div class="w-4 h-4 bg-white border-[4px] border-[#111111] rounded-full shadow-md"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([order.pickup.lat, order.pickup.lng], { icon: pickupIcon }).addTo(map.current);
      points.push([order.pickup.lat, order.pickup.lng]);
    }

    // Plot Dropoff Markers (Static Red Pin)
    validDropoffs.forEach((drop) => {
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

    // Fetch and draw the OSRM route polyline
    if (order.pickup?.lat && validDropoffs.length > 0 && validDropoffs[0].lat) {
      const fetchRoute = async () => {
        try {
          const coords = [order.pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
          const data = await res.json();
          
          if (data.code === 'Ok') {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            
            routeLayer.current = L.polyline(routeCoords, {
              color: '#111111', 
              weight: 4,
              opacity: 0.8,
              lineJoin: 'round'
            }).addTo(map.current);
            
            // Auto-fit map to route bounds with padding
            map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 80] });
          }
        } catch (err) {
          console.error("OSRM Route Error:", err);
          if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [50, 80] });
        }
      };
      fetchRoute();
    } else if (points.length > 1) {
      map.current.fitBounds(L.latLngBounds(points), { padding: [50, 80] });
    }

    setTimeout(() => map.current?.invalidateSize(), 200);

    return () => {
      // Cleanup handled via eachLayer on next effect run to keep map instance alive
    };
  }, [order]);

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
      map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 80] });
    }
  };

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

        {/* OVERLAPPING FLOATING CARD */}
        <div className="absolute -bottom-8 left-5 right-5 z-[2000]">
          <OrderFloatingStatusCard 
            pickupAddress={order.pickup?.address}
            dropoffAddress={dropoffsArray[0]?.address}
            statusText={getStatusDisplay(order.status)}
            subText="Live Tracking Active"
            onActionClick={handleRecenter}
            actionIcon={Crosshair}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM HALF: 55vh SCROLLABLE CONTENT */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pt-16 pb-8 px-5 space-y-4 z-0 relative">
        
        {/* Segmented Tab Toggles */}
        <OrderSegmentedToggle 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <AnimatePresence mode="wait">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-2">
              
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
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-2">
              
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
            <motion.div key="receipt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-2">
              
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
  );
}