// ============================================================================
// SERVICE: OPENSTREETMAP & OSRM ENGINE
// Architected to replace proprietary Google Maps with 100% Free Open-Source APIs.
// Uses real API calls to Nominatim (Geocoding/Places) and OSRM (Routing/ETA).
// ============================================================================

// No API Keys needed for Nominatim and OSRM public endpoints!

// ============================================================================
// SECTION 1: PLACES AUTOCOMPLETE API (Smart Location Search)
// ============================================================================

/**
 * Fetches real-time address predictions as the user types using Nominatim.
 * @param {string} input - The partial address string typed by the user.
 * @returns {Promise<Array>} - Array of prediction objects.
 */
export const fetchPlacePredictions = async (input) => {
  if (!input || input.trim() === '') return [];
  
  try {
    // Nominatim Free OpenStreetMap Search API
    // Restricted to India (IN) to match previous logic. Remove `&countrycodes=in` to make it global.
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5&countrycodes=in`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    // Map to the exact format existing UI components expect: { description, place_id }
    return data.map(item => ({
      description: item.display_name,
      // Hack: Embed lat/lon as the place_id so geocoding is instant later without a 2nd API call
      place_id: `${item.lat},${item.lon}` 
    }));
  } catch (error) {
    console.error("Nominatim API Error [fetchPlacePredictions]:", error);
    return [];
  }
};

// ============================================================================
// SECTION 2: GEOCODING API (Address <-> Coordinates)
// ============================================================================

/**
 * Converts a human-readable address or custom Place ID into exact GPS coordinates.
 * @param {string} address - Full address string or Place ID (lat,lon string).
 */
export const geocodeAddress = async (address) => {
  try {
    // If the address matches our custom place_id format (lat,lng), parse it instantly to save API calls!
    if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(address)) {
      const [lat, lng] = address.split(',');
      
      // Attempt to grab the display name via reverse geocode, but coordinates are the priority
      const formattedAddress = await reverseGeocode(lat, lng).catch(() => "Selected Location");
      
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        formattedAddress
      };
    }

    // Fallback: Perform an actual text search query
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        formattedAddress: data[0].display_name
      };
    } else {
      throw new Error("Geocoding failed: No results found.");
    }
  } catch (error) {
    console.error("Nominatim API Error [geocodeAddress]:", error);
    throw error;
  }
};

/**
 * Converts exact GPS coordinates into a human-readable address (Reverse Geocoding).
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    } else {
      throw new Error("Reverse geocoding failed: Invalid response.");
    }
  } catch (error) {
    console.error("Nominatim API Error [reverseGeocode]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 3: DISTANCE MATRIX API (OSRM Routing Engine)
// ============================================================================

/**
 * Calculates real-time distance and ETA for single or multi-stop routes using OSRM.
 * @param {Object} origin - { lat, lng }
 * @param {Array<Object>} destinations - Array of { lat, lng } objects.
 */
export const calculateRouteAndETA = async (origin, destinations) => {
  if (!origin || !destinations || destinations.length === 0) {
    throw new Error("Valid origin and destinations are required.");
  }

  try {
    // Evaluate each destination independently against the origin
    const metricsPromises = destinations.map(async (dest) => {
      // OSRM format: longitude,latitude
      const coordinatesString = `${origin.lng},${origin.lat};${dest.lng},${dest.lat}`;
      
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=false`);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceValue = route.distance; // in meters
        const durationValue = route.duration; // in seconds
        
        // Format to match Google's exact text output styles so the UI doesn't break
        const distanceText = distanceValue > 1000 
          ? `${(distanceValue / 1000).toFixed(1)} km` 
          : `${Math.round(distanceValue)} m`;
          
        const durationMins = Math.ceil(durationValue / 60);
        const durationText = durationMins > 59 
          ? `${Math.floor(durationMins / 60)} hr ${durationMins % 60} mins` 
          : `${durationMins} mins`;

        return {
          status: "OK",
          distanceText: distanceText,
          distanceValueMeters: distanceValue,
          durationText: durationText,
          durationValueSeconds: durationValue,
          // OSRM lacks live traffic data, so we simulate a slight traffic buffer (15%)
          durationInTrafficText: Math.ceil(durationMins * 1.15) + " mins",
          durationInTrafficValueSeconds: durationValue * 1.15,
        };
      } else {
        return { status: "FAILED", error: "Route unachievable." };
      }
    });

    // Resolve all destination routes
    const metrics = await Promise.all(metricsPromises);
    return metrics;

  } catch (error) {
    console.error("OSRM Routing Error [calculateRouteAndETA]:", error);
    throw error;
  }
};