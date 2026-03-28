import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TrackingHeader from '../../components/Tracking/TrackingHeader';
import TelemetryHud from '../../components/Tracking/TelemetryHud';
import DriverBottomCard from '../../components/Tracking/DriverBottomCard';
import MapLibreWrapper from '../../components/Map/MapLibreWrapper';
import { ShieldCheck, Share2 } from 'lucide-react';

export default function LiveTracking() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [tel, setTel] = useState({ speed: 60, dir: "Turn left", dist: "2.4 mi", coords: [73.8567, 18.5204] });

  useEffect(() => {
    // Real WebSocket stub for driver tracking
    const ws = new WebSocket(`wss://localhost:8080/ws/tracking/${id}`);
    ws.onmessage = (event) => { const data = JSON.parse(event.data); setTel(data); };
    return () => ws.close();
  }, [id]);

  return (
    <div className="relative w-full h-screen bg-surfaceBlack overflow-hidden">
      {/* Sec 1: Map Engine */}
      <MapLibreWrapper initialCenter={tel.coords} driverLocation={tel.coords} routeData={[tel.coords, [73.86, 18.53]]} />
      
      {/* Sec 2: Header */}
      <TrackingHeader trackingId={id} />
      
      {/* Sec 3: Telemetry HUD */}
      <TelemetryHud speed={tel.speed} direction={tel.dir} distance={tel.dist} />

      {/* Sec 4: Action FABs (New Section) */}
      <div className="absolute top-[350px] right-6 flex flex-col gap-4 z-40">
        <button className="w-12 h-12 bg-surfaceBlack/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white"><Share2 size={20}/></button>
        <button className="w-12 h-12 bg-surfaceBlack/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-movyraMint"><ShieldCheck size={20}/></button>
      </div>
      
      {/* Sec 5: Driver Card */}
      <DriverBottomCard driver={{name: "Kretya Driver", vehiclePlate: "MH12 AB 1234"}} currentLocation="Jl Bendungan Raya" />
    </div>
  );
}
