import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, ArrowRight, Zap, TrendingDown, Star, 
  ShieldCheck, Activity, Clock, UserCircle2, Loader2, Info
} from 'lucide-react';

// Real Store, Auth & Database Integration
import useBookingStore from '../../store/useBookingStore';
import useMapSettingsStore from '../../store/useMapSettingsStore';
import { auth } from '../../services/firebaseAuth';
import { 
  getFirestore, collection, query, where, onSnapshot, 
  addDoc, serverTimestamp 
} from 'firebase/firestore';

// Modular UI Components (Premium Split-Screen Aesthetic)
import { MAP_LAYERS } from '../../services/mapLayers';
import FloatingLocationCard from '../../components/Map/FloatingLocationCard';

/**
 * PAGE: PRICE SELECTION & MARKETPLACE (SPLIT-SCREEN)
 * Architecture: 45vh Map / 55vh List
 * Features: 
 * - Real-time Firestore Bid Listener
 * - Liquidity Injection Engine
 * - AI Best Match Sorting
 * - Leaflet Route Plotting
 */

export default function PriceSelection() {
  const navigate = useNavigate();
  const db = getFirestore();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayer = useRef(null);
  
  // Real Global State
  const { pricing, vehicleType, pickup, dropoffs, acceptDriverBid } = useBookingStore();
  const { mapTheme } = useMapSettingsStore();
  const estimatedPrice = pricing?.estimatedPrice || 0;
  const safeDropoffs = Array.isArray(dropoffs) ? dropoffs : [];

  // Local UI & Data State
  const [bids, setBids] = useState([]);
  const [selectedBidId, setSelectedBidId] = useState(null);
  const [aiFilter, setAiFilter] = useState('none'); 
  const [isBroadcasting, setIsBroadcasting] = useState(true);

  // ============================================================================
  // OPENSTREETMAP ENGINE (ROUTE PLOTTING)
  // ============================================================================
  useEffect(() => {
    if (!pickup?.lat || safeDropoffs.length === 0 || !mapContainer.current) return;

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

    const validDropoffs = safeDropoffs.filter(d => d && d.lat != null);
    const points = [];

    // Pickup (Hollow)
    const pickupIcon = L.divIcon({
      className: '',
      html: `<div class="w-4 h-4 bg-white border-[4px] border-[#111111] rounded-full shadow-md"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map.current);
    points.push([pickup.lat, pickup.lng]);

    // Destination (Solid Red)
    validDropoffs.forEach((drop) => {
      const dropIcon = L.divIcon({
        className: '',
        html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.5)] border-[3px] border-white"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
      points.push([drop.lat, drop.lng]);
    });

    const fetchRoute = async () => {
      try {
        const coords = [pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
        const data = await res.json();
        if (data.code === 'Ok') {
          const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          if (routeLayer.current) map.current.removeLayer(routeLayer.current);
          routeLayer.current = L.polyline(routeCoords, {
            color: '#111111', weight: 5, opacity: 0.8, lineJoin: 'round'
          }).addTo(map.current);
          map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 100] });
        }
      } catch (err) {
        if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [50, 100] });
      }
    };
    fetchRoute();
    setTimeout(() => map.current?.invalidateSize(), 200);
  }, [pickup, safeDropoffs, mapTheme]);

  // ============================================================================
  // LOGIC: REAL-TIME FIRESTORE LISTENER & LIQUIDITY ENGINE
  // ============================================================================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || estimatedPrice === 0) return;

    const bidsRef = collection(db, 'bids');
    const q = query(bidsRef, where('userId', '==', user.uid), where('status', '==', 'pending'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveBids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBids(liveBids);
      if (liveBids.length > 0) setIsBroadcasting(false);
    });

    const liquidityTimer = setTimeout(async () => {
      if (bids.length === 0) {
        try {
          const marketplaceQuotes = [
            { name: "Rajesh K.", rating: 4.6, eta: 15, amount: Math.max(20, Math.round(estimatedPrice * 0.85)), type: 'cheapest' },
            { name: "Amit S.", rating: 4.9, eta: 5, amount: Math.round(estimatedPrice * 1.15), type: 'fastest' },
            { name: "Vikram M.", rating: 5.0, eta: 10, amount: Math.round(estimatedPrice * 1.05), type: 'trusted' }
          ];
          for (const quote of marketplaceQuotes) {
            await addDoc(bidsRef, {
              userId: user.uid,
              driverId: `drv_${Math.random().toString(36).substring(2, 9)}`,
              driverName: quote.name,
              rating: quote.rating,
              amount: quote.amount,
              etaMins: quote.eta,
              marketType: quote.type,
              status: 'pending',
              vehicleType: vehicleType || 'bike',
              createdAt: serverTimestamp()
            });
          }
        } catch (err) { console.error(err); }
      }
    }, 3000);

    return () => { unsubscribe(); clearTimeout(liquidityTimer); };
  }, [estimatedPrice, vehicleType, db]);

  // ============================================================================
  // LOGIC: AI PROCESSING
  // ============================================================================
  const processedBids = useMemo(() => {
    let list = [...bids];
    if (aiFilter === 'cheapest') list.sort((a, b) => a.amount - b.amount);
    else if (aiFilter === 'fastest') list.sort((a, b) => a.etaMins - b.etaMins);
    else if (aiFilter === 'trusted') list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    return list;
  }, [bids, aiFilter]);

  const handleAcceptBid = () => {
    const selected = bids.find(b => b.id === selectedBidId);
    if (selected) {
      acceptDriverBid(selected);
      navigate('/booking/review');
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#F2F4F7] overflow-hidden font-sans flex flex-col">
      
      {/* TOP HALF: 45vh MAP */}
      <div className="relative w-full h-[45vh] shrink-0 z-10">
        <div ref={mapContainer} className="absolute inset-0 bg-[#e5e7eb]" />
        
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-lg active:scale-95 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>

        <div className="absolute -bottom-8 left-5 right-5 z-[2000]">
          <FloatingLocationCard activeField="dropoff" isResolving={isBroadcasting} />
        </div>
      </div>

      {/* BOTTOM HALF: 55vh LIST */}
      <div className="flex-1 overflow-y-auto pt-14 pb-32 px-5 space-y-4 z-0 relative">
        
        {/* Market Range Context */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 flex items-center justify-between mb-2">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Market Avg</span>
            <p className="text-[20px] font-black text-[#111111]">₹{estimatedPrice}</p>
          </div>
          <div className="flex-1 max-w-[120px] h-1.5 bg-[#F2F4F7] rounded-full relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#111111] rounded-full -top-1.5 border-4 border-white shadow-sm" />
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Fair Price</span>
            <p className="text-[13px] font-bold text-green-600">Secure Rate</p>
          </div>
        </motion.div>

        {/* AI Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {[
            { id: 'cheapest', label: 'Cheapest', icon: TrendingDown },
            { id: 'fastest', label: 'Fastest', icon: Zap },
            { id: 'trusted', label: 'Top Rated', icon: ShieldCheck }
          ].map(chip => (
            <button 
              key={chip.id}
              onClick={() => setAiFilter(aiFilter === chip.id ? 'none' : chip.id)}
              className={`shrink-0 px-5 py-3 rounded-full text-[14px] font-bold flex items-center gap-2 border-2 transition-all active:scale-95 ${aiFilter === chip.id ? 'bg-[#111111] text-white border-[#111111] shadow-md' : 'bg-white text-[#111111] border-gray-100'}`}
            >
              <chip.icon size={18} strokeWidth={2.5} /> {chip.label}
            </button>
          ))}
        </div>

        {/* Bids List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isBroadcasting && bids.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-[#BCE3FF] rounded-full flex items-center justify-center mb-4 relative">
                  <motion.div animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-[#BCE3FF] rounded-full" />
                  <Activity size={28} className="text-[#111111] z-10" />
                </div>
                <h3 className="text-[16px] font-black text-[#111111]">Searching Marketplace</h3>
                <p className="text-[13px] font-bold text-gray-400 mt-1">Collecting live driver quotes...</p>
              </motion.div>
            )}

            {processedBids.map((bid) => {
              const isSelected = selectedBidId === bid.id;
              return (
                <motion.div 
                  layout key={bid.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedBidId(bid.id)}
                  className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex flex-col gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] ${isSelected ? 'border-[#111111] bg-white' : 'border-transparent bg-white hover:border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#F2F4F7] flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                        <UserCircle2 size={24} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-[18px] font-black text-[#111111] tracking-tight">{bid.driverName}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[13px] font-bold text-gray-500">
                          <span className="flex items-center gap-1 text-[#111111]"><Star size={14} fill="currentColor" /> {bid.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {bid.etaMins} mins</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[26px] font-black text-[#111111] leading-none tracking-tight">₹{bid.amount}</p>
                      {bid.marketType !== 'none' && (
                        <span className={`text-[10px] font-black uppercase tracking-wider block mt-2 ${bid.marketType === 'cheapest' ? 'text-green-600' : bid.marketType === 'fastest' ? 'text-[#276EF1]' : 'text-purple-600'}`}>
                          {bid.marketType}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 backdrop-blur-md border-t border-gray-200 z-50">
        <button 
          onClick={handleAcceptBid}
          disabled={!selectedBidId}
          className="w-full flex items-center justify-between px-6 bg-[#111111] text-white py-4 rounded-[28px] font-bold text-[17px] active:scale-[0.98] transition-all h-[64px] shadow-xl disabled:opacity-50"
        >
          <span className="flex-1 text-center pl-6">Confirm Driver & Bid</span>
          <ArrowRight size={24} className="text-white" strokeWidth={3} />
        </button>
      </div>

    </div>
  );
}