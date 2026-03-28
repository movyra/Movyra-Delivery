import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import AddressInputSheet from '../../components/Booking/AddressInputSheet';
import useBookingStore from '../../store/useBookingStore';

export default function SetLocation() {
  const mapContainer = useRef(null); const map = useRef(null); const navigate = useNavigate();
  const { pickup, dropoff } = useBookingStore();

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({ container: mapContainer.current, style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', center: [73.8567, 18.5204], zoom: 12, attributionControl: false });
  }, []);

  useEffect(() => {
    if (!map.current || (!pickup && !dropoff)) return;
    if (pickup) map.current.flyTo({ center: [pickup.lng, pickup.lat], zoom: 14 });
  }, [pickup, dropoff]);

  return (
    <div className="relative w-full h-screen bg-surfaceBlack overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      <AddressInputSheet onAddressesSet={() => navigate('/booking/select-vehicle')} />
    </div>
  );
}
