import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TrackingHeader from '../../components/Tracking/TrackingHeader';
import TelemetryHud from '../../components/Tracking/TelemetryHud';
import DriverBottomCard from '../../components/Tracking/DriverBottomCard';
import MapLibreWrapper from '../../components/Map/MapLibreWrapper';
import useBookingStore from '../../store/useBookingStore';

export default function LiveTracking() {
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('id') || 'MV-ACTIVE-1';
  const activeOrder = useBookingStore(state => state.activeOrder);

  // Real state for Telemetry injected by WebSocket or API
  const [telemetry, setTelemetry] = useState({
    speed: 60,
    direction: "Turn left",
    distance: "2.4 mi",
    driverCoords: [73.8567, 18.5204], // Pune default
    routeCoords: [
      [73.8567, 18.5204],
      [73.8600, 18.5250],
      [73.8650, 18.5300]
    ]
  });

  // Real Implementation: In a real app, you would open a WebSocket here
  // listening to the Driver's App GPS broadcasts to update the `telemetry` state.

  return (
    <div className="relative w-full h-screen bg-surfaceBlack overflow-hidden font-sans">
      {/* 1. Optimized Dark Mode Map Engine */}
      <MapLibreWrapper 
        initialCenter={telemetry.driverCoords}
        routeData={telemetry.routeCoords}
        driverLocation={telemetry.driverCoords}
      />

      {/* 2. Top Header Navigation */}
      <TrackingHeader trackingId={trackingId} />

      {/* 3. Real-time Telemetry Overlay */}
      <TelemetryHud 
        speed={telemetry.speed}
        direction={telemetry.direction}
        distance={telemetry.distance}
      />

      {/* 4. Driver Information Bottom Sheet */}
      <DriverBottomCard 
        driver={{
          name: "Ramesh Kumar",
          vehiclePlate: "MH 14 AB 9090",
          vehicleModel: "Tata Ace Delivery",
          phone: "+919876543210"
        }}
        currentLocation="Viman Nagar Rd, Pune, Maharashtra"
      />
    </div>
  );
}