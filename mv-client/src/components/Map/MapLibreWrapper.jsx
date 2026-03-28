import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MintRouteLayer from './MintRouteLayer';

export default function MapLibreWrapper({ initialCenter = [73.8567, 18.5204], routeData, driverLocation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const driverMarker = useRef(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: initialCenter, zoom: 14, pitch: 45, bearing: 0, attributionControl: false
    });
    map.current.on('load', () => setMapLoaded(true));
    return () => { if (map.current) map.current.remove(); };
  }, [initialCenter]);

  useEffect(() => {
    if (!mapLoaded || !driverLocation) return;
    if (!driverMarker.current) {
      const el = document.createElement('div');
      el.className = 'w-10 h-10 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center border border-surfaceDarker rotate-[-45deg]';
      el.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19"></path><line x1="23" y1="13" x2="23" y2="11"></line><circle cx="9" cy="18" r="2"></circle><circle cx="19" cy="18" r="2"></circle></svg>`;
      driverMarker.current = new maplibregl.Marker({ element: el, pitchAlignment: 'map' }).setLngLat(driverLocation).addTo(map.current);
    } else {
      driverMarker.current.setLngLat(driverLocation);
      map.current.easeTo({ center: driverLocation, duration: 1000 });
    }
  }, [mapLoaded, driverLocation]);

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mapContainer} className="w-full h-full" />
      {mapLoaded && routeData && <MintRouteLayer map={map.current} routeCoordinates={routeData} />}
    </div>
  );
}
