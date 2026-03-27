import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * MapLibreWrapper
 * A reusable, high-performance map component for rendering tiles, tracking pins, and drawing routes.
 * * @param {Array} pickup - [longitude, latitude] for the pickup location
 * @param {Array} dropoff - [longitude, latitude] for the dropoff location
 * @param {Array} driver - [longitude, latitude] for live driver tracking
 * @param {Array} routeCoordinates - Array of [lng, lat] pairs defining the polyline path
 */
export default function MapLibreWrapper({ pickup, dropoff, driver, routeCoordinates }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({ pickup: null, dropoff: null, driver: null });

  // 1. Initialize Map
  useEffect(() => {
    if (map.current) return; // Prevent multiple initializations

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: import.meta.env.VITE_MAP_TILE_URL || 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: pickup || [73.7898, 18.5204], // Fallback to Pune coordinates
      zoom: 14,
      attributionControl: false, // Hide default attribution for cleaner mobile UI
    });

    // 2. Setup Route Line Layer on Load
    map.current.on('load', () => {
      // Add empty geojson source for the route
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add styled line layer for the route
      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#000000', // Solid black route line like Uber
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs once

  // 3. Handle Marker Updates (Pickup, Dropoff, Driver)
  useEffect(() => {
    if (!map.current) return;

    const updateMarker = (type, coords, color, isDriver = false) => {
      // If coordinates are null, remove the existing marker
      if (!coords) {
        if (markers.current[type]) {
          markers.current[type].remove();
          markers.current[type] = null;
        }
        return;
      }

      // If marker exists, just update its coordinates (smooth movement)
      if (markers.current[type]) {
        markers.current[type].setLngLat(coords);
      } else {
        // Create custom HTML element for the marker to match UI requirements
        const el = document.createElement('div');
        
        if (isDriver) {
          // Driver representation (Blue dot with pulse effect)
          el.className = 'w-8 h-8 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center bg-white z-50';
          el.innerHTML = '<div class="w-4 h-4 bg-[#00A3FF] rounded-full"></div>';
        } else {
          // Pickup (Black) / Dropoff (Red) representation
          el.className = 'w-4 h-4 rounded-full border-2 border-white shadow-md z-40';
          el.style.backgroundColor = color;
        }

        markers.current[type] = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map.current);
      }
    };

    updateMarker('pickup', pickup, '#000000'); // Black dot
    updateMarker('dropoff', dropoff, '#FF3B30'); // Red dot
    updateMarker('driver', driver, '#00A3FF', true); // Blue pulsing dot

    // 4. Auto-fit Map Bounds to show all active points
    if (pickup && dropoff) {
      const bounds = new maplibregl.LngLatBounds().extend(pickup).extend(dropoff);
      if (driver) bounds.extend(driver);
      
      // Wait for map style to load before fitting bounds to avoid errors
      if (map.current.isStyleLoaded()) {
        map.current.fitBounds(bounds, { padding: 60, duration: 800 });
      } else {
        map.current.once('styledata', () => map.current.fitBounds(bounds, { padding: 60, duration: 800 }));
      }
    } else if (pickup) {
      map.current.flyTo({ center: pickup, zoom: 15, duration: 800 });
    }
  }, [pickup, dropoff, driver]);

  // 5. Handle Route Polyline Updates
  useEffect(() => {
    if (!map.current || !routeCoordinates || routeCoordinates.length === 0) return;

    const updateRoute = () => {
      const source = map.current.getSource('route');
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        });
      }
    };

    if (map.current.isStyleLoaded()) {
      updateRoute();
    } else {
      map.current.once('styledata', updateRoute);
    }
  }, [routeCoordinates]);

  return (
    <div className="relative w-full h-full bg-[#E5E5EA]">
      {/* Target container for MapLibre Canvas */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}