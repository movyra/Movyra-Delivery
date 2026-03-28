import { useState, useEffect } from 'react';
export default function useGeolocation() {
  const [loc, setLoc] = useState({ lat: null, lng: null, speed: null });
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude, speed: p.coords.speed }),
      (e) => console.error(e), { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  return { location: loc };
}
