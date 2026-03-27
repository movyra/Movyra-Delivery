import { useState, useEffect } from 'react';

// High-accuracy native GPS polling for the Live Map (captures speed for your 60mph UI)
function useGeolocation(options = { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }) {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    speed: null,   // Crucial for the Telemetry UI in your reference image
    heading: null, // Direction the user is facing
    accuracy: null,
    timestamp: null,
  });
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    let watcherId;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser or device.');
      return;
    }

    const handleSuccess = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed,
        heading: position.coords.heading,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
      setError(null);
    };

    const handleError = (err) => {
      setError(err.message);
    };

    // Initialize aggressive real-time polling
    setIsWatching(true);
    watcherId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    // Garbage collection to prevent memory leaks and battery drain on unmount
    return () => {
      if (watcherId !== undefined) {
        navigator.geolocation.clearWatch(watcherId);
        setIsWatching(false);
      }
    };
  }, [options.enableHighAccuracy, options.maximumAge, options.timeout]);

  return { location, error, isWatching };
}

export default useGeolocation;