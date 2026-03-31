import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, Crosshair, Loader2, AlertCircle, 
  MapPin, Navigation, Truck, Settings2 
} from 'lucide-react';

// Real Store & Database Integration
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';

// Services & Modular UI Components
import { MAP_LAYERS } from '../../services/mapLayers';
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';

/**
 * PAGE: GLOBAL LIVE TRACKING DASHBOARD
 * Architecture: 100vh Immersive Map
 * Features: 
 * - Multi-Order Real-time Firestore Switching
 * - Floating Segmented Order Toggles
 * - Overlapping Bottom Status Card
 * - Leaflet Real-time Telemetry Plotting
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

  // SECTION 1: Fetch All Active Orders for Toggle
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setError("Authentication required.");
      setIsLoading(false);
      return;
    }

    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      where('status', 'in', ['searching', 'assigned', 'picked_up'])
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ 
        id: d.id, 
        label: `ID: ${d.id.slice(-4).toUpperCase()}`,
        ...d.data() 
      }));
      
      setActiveOrders(fetched);
      
      // Auto-select first order if none selected
      if (fetched.length > 0 && !selectedOrderId) {
        setSelectedOrderId(fetched[0].id);
      } else if (fetched.length === 0) {
        setSelectedOrderId(null);
        setCurrentOrderData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  // SECTION 2: Listen to Selected Order Specific Details
  useEffect(() => {
    if (!selectedOrderId) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', selectedOrderId), (docSnap) => {
      if (docSnap.exists()) {
        setCurrentOrderData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, [selectedOrderId]);

  // SECTION 3: Leaflet Immersive Logic
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

    // Clear and redraw when order switches
    const redrawLiveMap = async () => {
      if (!currentOrderData) return;

      map.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.current.removeLayer(layer);
        }
      });

      const pickup = currentOrderData.pickup;
      const dropoffs = currentOrderData.dropoffs || (currentOrderData.dropoff ? [currentOrderData.dropoff] : []);
      const driverLoc = currentOrderData.driverLocation; // Real telemetry field

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

      // Dropoff (Solid Red Dot)
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

      // Driver (Animated Vehicle Icon if Assigned)
      if (driverLoc?.lat) {
        const driverIcon = L.divIcon({
          className: '',
          html: `<div class="w-10 h-10 bg-[#111111] rounded-full flex items-center justify-center text-white border-2 border-white shadow-xl rotate-[${driverLoc.heading || 0}deg] transition-transform duration-500">
                   <Truck size={20} strokeWidth={2.5} />
                 </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        driverMarker.current = L.marker([driverLoc.lat, driverLoc.lng], { icon: driverIcon }).addTo(map.current);
        points.push([driverLoc.lat, driverLoc.lng]);
      }

      // Draw active route path
      try {
        const coords = [pickup, ...dropoffs].filter(p => p?.lat).map(s => `${s.lng},${s.lat}`).join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
        const data = await res.json();
        if (data.code === 'Ok') {
          const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          routeLayer.current = L.polyline(routeCoords, {
            color: '#111111', weight: 4, opacity: 0.7, dashArray: '8, 8'
          }).addTo(map.current);
          
          // Fit map area slightly zoomed out
          map.current.fitBounds(L.latLngBounds(points), { padding: [80, 80] });
        }
      } catch (err) {
        if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [80, 80] });
      }
    };

    redrawLiveMap();
    setTimeout(() => map.current?.invalidateSize(), 200);

  }, [currentOrderData, mapTheme]);

  const handleRecenter = () => {
    if (map.current && currentOrderData) {
      const p = currentOrderData.pickup;
      const d = currentOrderData.dropoffs?.[0] || currentOrderData.dropoff;
      if (p && d) map.current.fitBounds(L.latLngBounds([[p.lat, p.lng], [d.lat, d.lng]]), { padding: [100, 100] });
    }
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
      
      {/* 100vh FULLSCREEN MAP CANVAS */}
      <div ref={mapContainer} className="absolute inset-0 z-0 bg-[#e5e7eb]" />

      {/* FLOATING TOP UI (SEGMENTED SWITCHER) */}
      <div className="absolute top-12 left-6 right-6 z-20 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
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

      {/* RECENTER BUTTON */}
      <button 
        onClick={handleRecenter}
        className="absolute top-32 right-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#111111] shadow-lg active:scale-95 transition-all border border-gray-100"
      >
        <Crosshair size={22} strokeWidth={2.5} />
      </button>

      {/* FLOATING BOTTOM UI (STATUS CARD) */}
      <div className="mt-auto px-5 pb-10 z-20">
        <AnimatePresence mode="wait">
          {currentOrderData ? (
            <div key={selectedOrderId} className="w-full">
              <OrderFloatingStatusCard 
                pickupAddress={currentOrderData.pickup?.address}
                dropoffAddress={(currentOrderData.dropoffs?.[0] || currentOrderData.dropoff)?.address}
                statusText={currentOrderData.status === 'searching' ? 'Assigning Best Driver' : 'Driver En Route'}
                subText={currentOrderData.vehicleType ? `${currentOrderData.vehicleType} Tracker Active` : 'Telemetry Sync'}
                onActionClick={() => navigate(`/tracking/detail/${selectedOrderId}`)}
                actionIcon={Settings2}
              />
            </div>
          ) : (
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