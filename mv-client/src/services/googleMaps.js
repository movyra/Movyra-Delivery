// ============================================================================
// SERVICE: OPEN SOURCE MAPPING ENGINE (PHOTON + OSRM)
// Architected to replace proprietary Google Maps with 100% Free Open-Source APIs.
// Uses real API calls to Photon (Geocoding/Places) and OSRM (Routing/ETA/Polylines).
// Note: Kept the filename 'googleMaps.js' to prevent breaking legacy imports.
// ============================================================================

// ============================================================================
// SECTION 1: PLACES AUTOCOMPLETE API (Photon by Komoot)
// ============================================================================

/**
 * Fetches real-time address predictions as the user types using Photon.
 * Photon is highly optimized for autocomplete unlike standard Nominatim.
 * @param {string} input - The partial address string typed by the user.
 * @returns {Promise<Array>} - Array of prediction objects.
 */
export const fetchPlacePredictions = async (input) => {
  if (!input || input.trim() === '') return [];
  
  try {
    // We add a slight location bias to India (lat: 20, lon: 79) for relevance
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(input)}&limit=5&lat=20&lon=79`);
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    // Map to the format the UI expects. Photon provides instant Lat/Lng!
    return data.features.map(feature => {
      const p = feature.properties;
      const name = p.name || p.street || 'Unknown Location';
      const context = [p.city, p.state, p.country].filter(Boolean).join(', ');
      const description = context ? `${name}, ${context}` : name;
      
      const lng = feature.geometry.coordinates[0];
      const lat = feature.geometry.coordinates[1];

      return {
        description: description,
        // Embed lat/lon as the place_id so geocoding is instant later
        place_id: `${lat},${lng}`,
        lat: lat,
        lng: lng
      };
    });
  } catch (error) {
    console.error("Photon API Error [fetchPlacePredictions]:", error);
    return [];
  }
};

// ============================================================================
// SECTION 2: GEOCODING API (Address <-> Coordinates)
// ============================================================================

/**
 * Converts a custom Place ID (lat,lng) or address string into coordinates.
 * @param {string} address - Full address string or Place ID.
 */
export const geocodeAddress = async (address) => {
  try {
    // If it's our embedded coordinate string from Photon, parse it instantly (Zero API calls)
    if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(address)) {
      const [lat, lng] = address.split(',');
      const formattedAddress = await reverseGeocode(lat, lng).catch(() => "Selected Location");
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        formattedAddress
      };
    }

    // Fallback: Perform a text search query if raw text was passed
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
      const feature = data.features[0];
      const p = feature.properties;
      const name = p.name || p.street || 'Unknown Location';
      const context = [p.city, p.state, p.country].filter(Boolean).join(', ');
      
      return {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        formattedAddress: context ? `${name}, ${context}` : name
      };
    } else {
      throw new Error("Geocoding failed: No results found.");
    }
  } catch (error) {
    console.error("Photon API Error [geocodeAddress]:", error);
    throw error;
  }
};

/**
 * Converts exact GPS coordinates into a human-readable address.
 * @param {number|string} lat - Latitude
 * @param {number|string} lng - Longitude
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`);
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    if (data && data.features && data.features.length > 0) {
      const p = data.features[0].properties;
      const name = p.name || p.street || 'Dropped Pin';
      const context = [p.city, p.state].filter(Boolean).join(', ');
      return context ? `${name}, ${context}` : name;
    } else {
      return "Unknown Location";
    }
  } catch (error) {
    console.error("Photon API Error [reverseGeocode]:", error);
    return "Unknown Location";
  }
};

// ============================================================================
// SECTION 3: DISTANCE MATRIX & POLYLINE API (OSRM Routing Engine)
// ============================================================================

/**
 * Calculates real-time distance and ETA for routes using OSRM.
 * @param {Object} origin - { lat, lng }
 * @param {Array<Object>} destinations - Array of { lat, lng } objects.
 */
export const calculateRouteAndETA = async (origin, destinations) => {
  if (!origin || !destinations || destinations.length === 0) {
    throw new Error("Valid origin and destinations are required.");
  }

  try {
    const metricsPromises = destinations.map(async (dest) => {
      // OSRM format: longitude,latitude
      const coordinatesString = `${origin.lng},${origin.lat};${dest.lng},${dest.lat}`;
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=false`);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceValue = route.distance; // in meters
        const durationValue = route.duration; // in seconds
        
        const distanceText = distanceValue > 1000 
          ? `${(distanceValue / 1000).toFixed(1)} km` 
          : `${Math.round(distanceValue)} m`;
          
        const durationMins = Math.ceil(durationValue / 60);
        const durationText = durationMins > 59 
          ? `${Math.floor(durationMins / 60)} hr ${durationMins % 60} mins` 
          : `${durationMins} mins`;

        return {
          status: "OK",
          distanceText,
          distanceValueMeters: distanceValue,
          durationText,
          durationValueSeconds: durationValue,
          durationInTrafficText: Math.ceil(durationMins * 1.15) + " mins",
          durationInTrafficValueSeconds: durationValue * 1.15,
        };
      } else {
        return { status: "FAILED", error: "Route unachievable." };
      }
    });

    return await Promise.all(metricsPromises);
  } catch (error) {
    console.error("OSRM Routing Error [calculateRouteAndETA]:", error);
    throw error;
  }
};

/**
 * Generates the full GeoJSON polyline for a multi-stop route.
 * @param {Object} origin - { lat, lng }
 * @param {Array<Object>} dropoffs - Array of { lat, lng } objects.
 * @returns {Promise<Object>} GeoJSON LineString geometry
 */
export const getRoutePolyline = async (origin, dropoffs) => {
  if (!origin || !dropoffs || dropoffs.length === 0) return null;

  try {
    // Combine origin and all dropoffs in sequence. OSRM format: lon,lat
    const waypoints = [origin, ...dropoffs];
    const coordinatesString = waypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
    
    // Fetch full route overview with GeoJSON geometries
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return data.routes[0].geometry; // This is a standard GeoJSON LineString
    }
    return null;
  } catch (error) {
    console.error("OSRM Polyline Error [getRoutePolyline]:", error);
    return null;
  }
};