import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, ShieldCheck, PhoneCall, MessageSquare } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import MapLibreWrapper from '../components/MapLibreWrapper';
import api from '../services/api';

export default function TrackingActive() {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData } = useBooking();
  
  // Order OTP passed securely via router state
  const otp = location.state?.otp || '----';

  const [driverCoords, setDriverCoords] = useState(null);
  const [eta, setEta] = useState('Calculating...');
  const wsRef = useRef(null);

  useEffect(() => {
    if (!bookingData.trackingId) {
      navigate('/dashboard-home');
      return;
    }

    // 1. Establish Real-time WebSocket connection to Rust backend
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'}/tracking/${bookingData.trackingId}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to Movyra Tracking Stream');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'LOCATION_UPDATE') {
          // Update MapLibre Marker
          setDriverCoords([data.lng, data.lat]);
        } else if (data.type === 'ETA_UPDATE') {
          // Update visual timer
          setEta(data.eta_string); // e.g., "00:12:45"
        } else if (data.type === 'STATUS_COMPLETED') {
          // End flow
          navigate('/dashboard-home');
        }
      } catch (err) {
        console.error("Failed to parse tracking frame", err);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Tracking stream disconnected');
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [bookingData.trackingId, navigate]);

  return (
    <div className="flex flex-col h-full bg-black text-white font-sans relative overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10 pointer-events-none">
        <button onClick={() => navigate('/dashboard-home')} className="w-12 h-12 rounded-full bg-zinc-900/80 backdrop-blur-md flex items-center justify-center shadow-lg pointer-events-auto border border-zinc-800">
          <ArrowLeft size={24} />
        </button>
        <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800 pointer-events-auto">
          <span className="font-bold text-sm tracking-widest uppercase">Live</span>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 bg-zinc-800 relative">
        <MapLibreWrapper 
           pickup={bookingData.pickup ? [bookingData.pickup.lng, bookingData.pickup.lat] : null}
           dropoff={bookingData.dropoff ? [bookingData.dropoff.lng, bookingData.dropoff.lat] : null}
           driver={driverCoords} 
           routeCoordinates={[]} // Provided by backend routing API ideally
        />
        {/* Scanning Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00A3FF]/10 to-transparent animate-scan pointer-events-none mix-blend-overlay"></div>
      </div>

      {/* Deep Dark Bottom Sheet (Replicating image_b1b4cc) */}
      <div className="bg-[#121212] rounded-t-[3rem] border-t border-[#2A2A2A] relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col pt-4">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6"></div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 pb-8">
          <p className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Trip in progress</p>
          {/* Large Monospace Timer */}
          <h1 className="text-6xl sm:text-7xl font-mono font-bold mb-2 tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {eta}
          </h1>
          <p className="text-zinc-400 font-medium text-sm">Driver heading to destination</p>
        </div>

        <div className="px-6 pb-8 space-y-6">
          <div className="bg-[#1A1A1A] p-5 rounded-3xl border border-[#2A2A2A] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#00A3FF] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,163,255,0.3)] shrink-0">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white leading-tight mb-1">Secure Delivery</h4>
                <p className="text-[11px] text-[#00A3FF] uppercase font-black tracking-widest">OTP: {otp}</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors border border-zinc-700 text-white">
                  <PhoneCall size={18} fill="currentColor" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}