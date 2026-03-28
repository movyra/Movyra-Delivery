import { useEffect } from 'react';

/**
 * Attaches a glowing neon-mint route layer to an existing MapLibre instance.
 * Takes raw GeoJSON coordinate arrays from the OSRM/Routing backend.
 */
export default function MintRouteLayer({ map, routeCoordinates }) {
  useEffect(() => {
    if (!map || !routeCoordinates || !routeCoordinates.length) return;

    const sourceId = 'route-source';
    const layerId = 'route-layer';
    const glowLayerId = 'route-layer-glow';

    // Remove existing if updating
    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      });
      return;
    }

    // Add Real GeoJSON Source
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      }
    });

    // Add Outer Glow (Blur effect)
    map.addLayer({
      id: glowLayerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#00F0B5',
        'line-width': 12,
        'line-blur': 10,
        'line-opacity': 0.4
      }
    });

    // Add Solid Core Line
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#00F0B5',
        'line-width': 5
      }
    });

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getLayer(glowLayerId)) map.removeLayer(glowLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, routeCoordinates]);

  return null; // Logic-only component, renders through MapLibre API
}