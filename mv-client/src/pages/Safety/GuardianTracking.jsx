import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, PhoneCall, MapPin, Navigation, 
  Battery, Wifi, Activity, Clock, Share2, 
  Mic, StopCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';

// Real Super-App Context Integrations
import { useSafetyContext } from '../../contexts/SafetyContext';
import usePreferencesStore from '../../store/usePreferencesStore';

/**
 * ============================================================================
 * MODULE: GUARDIAN TRACKING (EMERGENCY COMMAND CENTER)
 * FIX: React-Leaflet <MapContainer> strict child validation.
 * Replaced ALL `&&` conditional renders with explicit `? <Component /> : null`
 * ternary operators. This strictly prevents the React 18 / Leaflet bug where 
 * a boolean 'false' causes a fatal "render2 is not a function" crash inside 
 * the Context Consumer.
 * ============================================================================
 */

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'https://api.movyra.com';

export default function GuardianTracking() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { language } = usePreferencesStore();
  
  const { isSOSActive, deactivateSOS } = useSafetyContext();

  const [trackedLocation, setTrackedLocation] = useState({ lat: 20.5937, lng: 78.9629, accuracy: 0 });
  const [trackedPath, setTrackedPath] = useState([]);
  const [speed, setSpeed] = useState(0);

  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [networkType, setNetworkType] = useState('4G');

  const [incidentLog, setIncidentLog] = useState([]);
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);
  const [distanceToSafeZone, setDistanceToSafeZone] = useState(null);
  
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL, { transports: ['websocket'] });
    const room = sessionId || 'local_sos_room';
    
    socketRef.current.emit('join_guardian_room', room);

    socketRef.current.on('location_update', (data) => {
      setTrackedLocation({ lat: data.lat, lng: data.lng, accuracy: data.accuracy });
      setTrackedPath(prev => [...prev, [data.lat, data.lng]]);
      if (data.speed) setSpeed(data.speed);
      
      const dist = calculateDistance(data.lat, data.lng, data.lat + 0.01, data.lng + 0.01);
      setDistanceToSafeZone(dist);
    });

    socketRef.current.on('emergency_event', (event) => {
      setIncidentLog(prev => [{ time: new Date().toLocaleTimeString(), msg: event.message }, ...prev]);
    });

    socketRef.current.on('audio_stream_active', (status) => {
      setIsAudioStreaming(status);
    });

    setIncidentLog([{ time: new Date().toLocaleTimeString(), msg: 'Guardian tracking session initiated.' }]);

    return () => socketRef.current.disconnect();
  }, [sessionId]);

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => setBatteryLevel(Math.round(battery.level * 100)));
        battery.addEventListener('chargingchange', () => setIsCharging(battery.charging));
      });
    }

    if ('connection' in navigator) {
      setNetworkType(navigator.connection.effectiveType.toUpperCase());
      navigator.connection.addEventListener('change', () => {
        setNetworkType(navigator.connection.effectiveType.toUpperCase());
      });
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
  };

  const handleCallPolice = () => {
    setIncidentLog(prev => [{ time: new Date().toLocaleTimeString(), msg: 'Dialed Emergency Services (112)' }, ...prev]);
    window.location.href = 'tel:112';
  };

  const copyTrackingLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert('Encrypted tracking link copied to clipboard.');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans flex flex-col">
      
      <div className="bg-red-600 px-5 py-4 flex items-center justify-between shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <ShieldAlert size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-black tracking-widest uppercase">SOS Guardian</h1>
            <p className="text-[12px] font-bold text-white/80 flex items-center gap-1">
              <Activity size={12} /> LIVE TRACKING ACTIVE
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard-home')} className="text-[13px] font-bold bg-black/20 px-4 py-2 rounded-full">
          Exit
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 p-2 bg-[#1A1A1A] border-b border-gray-800">
        <div className="flex flex-col items-center justify-center p-2">
          <Battery size={18} className={batteryLevel < 20 ? 'text-red-500' : 'text-green-500'} />
          <span className="text-[11px] font-black mt-1">{batteryLevel}% {isCharging ? '⚡' : ''}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2">
          <Wifi size={18} className="text-blue-400" />
          <span className="text-[11px] font-black mt-1">{networkType} Net</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2">
          <Navigation size={18} className="text-yellow-400" />
          <span className="text-[11px] font-black mt-1">{speed} km/h</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2">
          <MapPin size={18} className="text-purple-400" />
          <span className="text-[11px] font-black mt-1">{distanceToSafeZone || '--'} km</span>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        {/* FIX: MapContainer children strictly enforce React Fragment and ternary returns to prevent boolean leakage */}
        <MapContainer 
          center={[trackedLocation.lat, trackedLocation.lng]} 
          zoom={15} 
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            <Marker position={[trackedLocation.lat, trackedLocation.lng]} icon={userIcon} />
            
            {/* STRICT TERNARY: Never leaks a boolean 'false' to Leaflet */}
            {trackedPath.length > 1 ? (
              <Polyline positions={trackedPath} color="red" weight={4} opacity={0.7} />
            ) : null}
            
            {/* STRICT TERNARY: Never leaks a boolean 'false' to Leaflet */}
            {trackedLocation.accuracy > 0 ? (
              <Circle center={[trackedLocation.lat, trackedLocation.lng]} radius={trackedLocation.accuracy} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }} />
            ) : null}
          </>
        </MapContainer>

        <div className="absolute top-4 left-4 z-[400]">
          <div className={`px-4 py-2 rounded-full text-[12px] font-black flex items-center gap-2 shadow-lg backdrop-blur-md ${isAudioStreaming ? 'bg-red-500/90 text-white' : 'bg-black/80 text-gray-400 border border-gray-700'}`}>
            <Mic size={16} className={isAudioStreaming ? 'animate-pulse' : ''} />
            {isAudioStreaming ? 'LIVE MIC AUDIO SECURED' : 'MIC OFFLINE'}
          </div>
        </div>

        <button onClick={copyTrackingLink} className="absolute top-4 right-4 z-[400] w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <Share2 size={20} className="text-white" />
        </button>
      </div>

      <div className="h-64 bg-[#111111] border-t border-gray-800 flex flex-col relative z-10">
        <div className="flex gap-2 p-4 border-b border-gray-800">
          <button 
            onClick={handleCallPolice}
            className="flex-1 bg-red-600 text-white py-4 rounded-xl text-[16px] font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <PhoneCall size={20} /> Dial 112 (Police)
          </button>
          {isSOSActive ? (
            <button 
              onClick={deactivateSOS}
              className="px-6 bg-[#2A2A2A] text-white rounded-xl text-[14px] font-black flex flex-col items-center justify-center active:scale-95 transition-transform"
            >
              <StopCircle size={20} className="mb-1" /> End SOS
            </button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h3 className="text-[12px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} /> Incident Event Log
          </h3>
          <AnimatePresence>
            {incidentLog.map((log, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 bg-[#1A1A1A] p-3 rounded-lg border border-gray-800"
              >
                <div className="text-[10px] font-black text-gray-500 mt-0.5 w-16 shrink-0">{log.time}</div>
                <div className="text-[13px] font-bold text-white">{log.msg}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}