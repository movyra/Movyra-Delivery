import { useEffect } from 'react';
export default function MintRouteLayer({ map, routeCoordinates }) {
  useEffect(() => {
    if (!map || !routeCoordinates?.length) return;
    if (map.getSource('route')) {
      map.getSource('route').setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeCoordinates }});
      return;
    }
    map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeCoordinates }}});
    map.addLayer({ id: 'route-glow', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#00F0B5', 'line-width': 12, 'line-blur': 10, 'line-opacity': 0.4 }});
    map.addLayer({ id: 'route-core', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#00F0B5', 'line-width': 5 }});
    return () => { if(map.getLayer('route-core')) { map.removeLayer('route-core'); map.removeLayer('route-glow'); map.removeSource('route'); } };
  }, [map, routeCoordinates]);
  return null;
}
