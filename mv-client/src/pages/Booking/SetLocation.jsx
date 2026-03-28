import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AddressInputSheet from '../../components/Booking/AddressInputSheet';
import useBookingStore from '../../store/useBookingStore';

export default function SetLocation() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const navigate = useNavigate();
  const { pickup, dropoff } = useBookingStore();

  useEffect(() => {
    if (map.current) return;
    
    // Initialize real map using Carto Dark Matter tiles (No API key needed)
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [73.8567, 18.5204], // Default Pune, India
      zoom: 12,
      attributionControl: false
    });

    // Clean up
    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  // Update map markers when addresses are selected
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const markers = document.getElementsByClassName('movyra-marker');
    while(markers[0]) {
      markers[0].parentNode.removeChild(markers[0]);
    }

    const bounds = new maplibregl.LngLatBounds();

    if (pickup) {
      const el = document.createElement('div');
      el.className = 'movyra-marker w-4 h-4 bg-white rounded-full border-4 border-surfaceBlack shadow-lg';
      new maplibregl.Marker(el).setLngLat([pickup.lng, pickup.lat]).addTo(map.current);
      bounds.extend([pickup.lng, pickup.lat]);
    }

    if (dropoff) {
      const el = document.createElement('div');
      el.className = 'movyra-marker w-5 h-5 bg-movyraMint rounded-full border-4 border-surfaceBlack shadow-mintGlow';
      new maplibregl.Marker(el).setLngLat([dropoff.lng, dropoff.lat]).addTo(map.current);
      bounds.extend([dropoff.lng, dropoff.lat]);
    }

    if (pickup && dropoff) {
      map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
    } else if (pickup) {
      map.current.flyTo({ center: [pickup.lng, pickup.lat], zoom: 14 });
    }
  }, [pickup, dropoff]);

  return (
    <div className="relative w-full h-screen bg-surfaceBlack overflow-hidden">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-14 left-6 z-50 w-12 h-12 bg-surfaceBlack/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95"
      >
        <ChevronLeft size={24} />
      </button>

      {/* MapLibre Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Interactive Bottom Sheet */}
      <AddressInputSheet onAddressesSet={() => navigate('/booking/select-vehicle')} />
    </div>
  );
}