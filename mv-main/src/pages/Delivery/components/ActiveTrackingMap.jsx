import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * ============================================================================
 * COMPONENT: ACTIVE TRACKING MAP
 * Purpose: Real-time geospatial tracking interface utilizing OpenStreetMap.
 * Behavior: Projects delivery routing, active fleet coordinates, and
 * operator telemetry over a desaturated monochrome base map.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), Stark (#111111).
 * ============================================================================
 */

// Custom Map Markers utilizing the strict monochrome palette
const createCustomIcon = (color, innerColor) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #111111; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"><div style="background-color: ${innerColor}; width: 8px; height: 8px; border-radius: 50%;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const originIcon = createCustomIcon('#FFFFFF', '#000000');
const destinationIcon = createCustomIcon('#000000', '#FFFFFF');
const fleetIcon = L.divIcon({
  className: 'custom-fleet-icon',
  html: `<div style="background-color: #00A9F7; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function ActiveTrackingMap({ trackingId, onBack }) {
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated Coordinates for OpenStreetMap Routing Projection
  // In a live production environment with hardware GPS, these are streamed from the driver node.
  const [mapCoordinates, setMapCoordinates] = useState({
    origin: [18.5204, 73.8567], // Pune
    destination: [19.0760, 72.8777], // Mumbai
    fleet: [18.7500, 73.4000] // In-transit node
  });

  // 1. Establish Secure Data Stream
  useEffect(() => {
    if (!trackingId) {
      setIsLoading(false);
      return;
    }

    const fetchDispatchData = async () => {
      try {
        // Attempt resolution via explicit Tracking ID (Public Interface)
        const q = query(collection(db, 'delivery_orders'), where('trackingId', '==', trackingId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            setActiveDispatch({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
          } else {
            // Fallback: Attempt resolution via direct Document ID (Internal Interface)
            const docRef = doc(db, 'delivery_orders', trackingId);
            getDoc(docRef).then((docSnap) => {
              if (docSnap.exists()) {
                setActiveDispatch({ id: docSnap.id, ...docSnap.data() });
              }
            });
          }
          setIsLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Geospatial data stream failed:", error);
        setIsLoading(false);
      }
    };

    fetchDispatchData();
  }, [trackingId]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#333333] border-t-[#FFFFFF] animate-spin"></div>
      </div>
    );
  }

  if (!activeDispatch && trackingId) {
    return (
      <div className="w-full min-h-screen bg-[#000000] flex flex-col">
        <div className="p-6 relative z-50">
          <button onClick={onBack} className="w-12 h-12 bg-[#111111] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF] shadow-lg">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-6"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span className="text-[#FFFFFF] font-black text-[1.5rem] mb-2">Tracking Node Unresolved</span>
          <span className="text-[#888888] font-bold text-[0.95rem]">The specified tracking identification payload does not match any active dispatch records.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] relative overflow-hidden flex flex-col">
      
      {/* Absolute Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-[1000] pointer-events-none">
        <button onClick={onBack} className="w-12 h-12 bg-[#111111] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF] shadow-xl pointer-events-auto hover:bg-[#222222] transition-colors">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div className="bg-[#111111] border border-[#333333] px-5 py-3 rounded-full shadow-xl pointer-events-auto flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
           <span className="text-[#FFFFFF] font-black text-[0.9rem] uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {/* Geospatial Map Layer (Leaflet Integration) */}
      <div className="w-full flex-1 relative z-0 bg-[#111111]">
        <MapContainer 
          center={mapCoordinates.fleet} 
          zoom={10} 
          zoomControl={false}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          {/* High-Contrast Desaturated Dark Base Map (CartoDB Dark Matter) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <Marker position={mapCoordinates.origin} icon={originIcon}>
             <Popup className="custom-leaflet-popup">Dispatch Origin</Popup>
          </Marker>
          <Marker position={mapCoordinates.destination} icon={destinationIcon}>
             <Popup className="custom-leaflet-popup">Destination Gateway</Popup>
          </Marker>
          <Marker position={mapCoordinates.fleet} icon={fleetIcon}>
             <Popup className="custom-leaflet-popup">Active Fleet Operator</Popup>
          </Marker>

          <Polyline 
            positions={[mapCoordinates.origin, mapCoordinates.fleet, mapCoordinates.destination]} 
            pathOptions={{ color: '#333333', dashArray: '10, 10', weight: 4 }} 
          />
          <Polyline 
            positions={[mapCoordinates.origin, mapCoordinates.fleet]} 
            pathOptions={{ color: '#00A9F7', weight: 4 }} 
          />
        </MapContainer>
      </div>

      {/* Interactive Bottom Logistics Control Module */}
      <motion.div 
        initial={{ y: 200, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="w-full bg-[#111111] border-t border-[#333333] rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] relative z-50 p-6 flex flex-col"
      >
        <div className="w-12 h-1.5 bg-[#333333] rounded-full mx-auto mb-6"></div>

        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
              <span className="text-[#888888] font-bold text-[0.8rem] uppercase tracking-widest">Tracking ID</span>
              <span className="text-[#FFFFFF] font-black text-[1rem] bg-[#000000] px-3 py-1 rounded-lg border border-[#333333]">
                {activeDispatch?.trackingId || trackingId || 'MVY-SYSTEM-X'}
              </span>
           </div>
           <span className="text-[#00A9F7] font-black text-[0.85rem] uppercase tracking-widest px-3 py-1 bg-[#00A9F7]/10 rounded-full border border-[#00A9F7]/30">In Transit</span>
        </div>

        <div className="w-full bg-[#000000] border border-[#333333] rounded-[24px] p-5 mb-6 flex items-center justify-between relative overflow-hidden">
           <div className="flex flex-col relative z-10 w-1/2">
              <span className="text-[#888888] font-bold text-[0.7rem] uppercase tracking-widest mb-1">Origin Node</span>
              <span className="text-[#FFFFFF] font-black text-[0.95rem] truncate">{activeDispatch?.pickupLocation?.split(',')[0] || 'Origin Sector'}</span>
           </div>
           
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#111111] rounded-full border border-[#333333] flex items-center justify-center z-20">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
           </div>

           <div className="flex flex-col text-right relative z-10 w-1/2 pl-4">
              <span className="text-[#888888] font-bold text-[0.7rem] uppercase tracking-widest mb-1">Destination</span>
              <span className="text-[#FFFFFF] font-black text-[0.95rem] truncate">{activeDispatch?.dropoffLocation?.split(',')[0] || 'Terminal Gateway'}</span>
           </div>
        </div>

        {/* Driver Communication Operations */}
        <div className="flex items-center justify-between border-t border-[#333333] pt-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF] overflow-hidden">
                 <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-[#888888]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="flex flex-col">
                 <span className="text-[#FFFFFF] font-black text-[1.1rem]">Authorized Fleet Operator</span>
                 <span className="text-[#888888] font-bold text-[0.8rem]">{activeDispatch?.vehicleType || 'Assigned Vehicle'}</span>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF] hover:bg-[#222222] transition-colors shadow-sm">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
              <button className="w-12 h-12 bg-[#00A9F7] text-[#FFFFFF] rounded-full flex items-center justify-center hover:bg-[#0091D5] transition-colors shadow-sm">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </button>
           </div>
        </div>

      </motion.div>
    </div>
  );
}