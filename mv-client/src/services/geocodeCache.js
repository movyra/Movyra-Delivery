// ============================================================================
// SERVICE: GEOCODING CACHE ENGINE
// Intercepts OpenStreetMap Nominatim reverse-geocoding requests.
// Caches resolved addresses in sessionStorage using precision coordinate keys
// to drastically improve map panning performance and prevent API rate-limiting.
// ============================================================================

/**
 * Generates a precision-based cache key.
 * 4 decimal places equals roughly 11 meters of precision. This prevents
 * micro-movements of the map from triggering duplicate network requests
 * for the same street/building.
 * * @param {number} lat 
 * @param {number} lng 
 * @returns {string} The cache key
 */
const generateCacheKey = (lat, lng) => {
  return `geo_${parseFloat(lat).toFixed(4)}_${parseFloat(lng).toFixed(4)}`;
};

/**
 * Reverse geocodes coordinates into a human-readable address.
 * Hits sessionStorage first. If it's a miss, it makes the real network request
 * and caches the result for future drags.
 * * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} The resolved human-readable address
 */
export const reverseGeocodeWithCache = async (lat, lng) => {
  if (!lat || !lng) throw new Error("Invalid coordinates for geocoding.");

  const cacheKey = generateCacheKey(lat, lng);
  const cachedAddress = sessionStorage.getItem(cacheKey);

  if (cachedAddress) {
    return cachedAddress; // Instant return from memory (Zero network latency)
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    
    if (!res.ok) throw new Error("Network request failed");
    
    const data = await res.json();
    const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    // Save to session storage to prevent repeated requests during this session
    sessionStorage.setItem(cacheKey, address);
    
    return address;
  } catch (error) {
    console.error("OSM Reverse Geocode Error [geocodeCache]:", error);
    // Fallback gracefully to raw coordinates if the API is offline
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; 
  }
};