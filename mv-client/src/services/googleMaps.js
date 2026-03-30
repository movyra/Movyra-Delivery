// ============================================================================
// SERVICE: GOOGLE MAPS ENGINE
// Architected to power Live Route Optimization, ETA updates, and Smart Traffic.
// Uses real API calls to Distance Matrix, Geocoding, and Places Autocomplete.
// ============================================================================

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Dynamically injects the Google Maps JavaScript SDK into the DOM.
 * This prevents CORS issues associated with raw REST API calls from the browser
 * and ensures the heavy Maps payload is only loaded when actually needed.
 */
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve(window.google.maps);
    script.onerror = (error) => {
      console.error('Google Maps SDK failed to load.', error);
      reject(error);
    };

    document.head.appendChild(script);
  });
};

// ============================================================================
// SECTION 1: PLACES AUTOCOMPLETE API (Smart Location Search)
// ============================================================================

/**
 * Fetches real-time address predictions as the user types.
 * @param {string} input - The partial address string typed by the user.
 * @returns {Promise<Array>} - Array of prediction objects.
 */
export const fetchPlacePredictions = async (input) => {
  if (!input || input.trim() === '') return [];
  
  try {
    const maps = await loadGoogleMapsScript();
    const autocompleteService = new maps.places.AutocompleteService();
    
    return new Promise((resolve, reject) => {
      autocompleteService.getPlacePredictions(
        { input, componentRestrictions: { country: 'in' } }, // Restricted to India (IN) per current locale
        (predictions, status) => {
          if (status !== maps.places.PlacesServiceStatus.OK || !predictions) {
            console.warn("Places API returned no results or failed with status:", status);
            resolve([]);
          } else {
            resolve(predictions);
          }
        }
      );
    });
  } catch (error) {
    console.error("Google Maps API Error [fetchPlacePredictions]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 2: GEOCODING API (Address <-> Coordinates)
// ============================================================================

/**
 * Converts a human-readable address or Place ID into exact GPS coordinates.
 * @param {string} address - Full address string or Place ID.
 */
export const geocodeAddress = async (address) => {
  try {
    const maps = await loadGoogleMapsScript();
    const geocoder = new maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === maps.GeocoderStatus.OK && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed with status: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error("Google Maps API Error [geocodeAddress]:", error);
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
    const maps = await loadGoogleMapsScript();
    const geocoder = new maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === maps.GeocoderStatus.OK && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Reverse geocoding failed with status: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error("Google Maps API Error [reverseGeocode]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 3: DISTANCE MATRIX API (Live Route Optimization & Smart Pricing)
// ============================================================================

/**
 * Calculates real-time distance and traffic-based ETA for single or multi-stop routes.
 * @param {Object} origin - { lat, lng }
 * @param {Array<Object>} destinations - Array of { lat, lng } objects.
 */
export const calculateRouteAndETA = async (origin, destinations) => {
  if (!origin || !destinations || destinations.length === 0) {
    throw new Error("Valid origin and destinations are required.");
  }

  try {
    const maps = await loadGoogleMapsScript();
    const service = new maps.DistanceMatrixService();

    // Map custom object structures into Google Maps LatLng objects
    const originLatLng = new maps.LatLng(origin.lat, origin.lng);
    const destinationLatLngs = destinations.map(dest => new maps.LatLng(dest.lat, dest.lng));

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [originLatLng],
          destinations: destinationLatLngs,
          travelMode: maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(Date.now()), // Forces real-time traffic computation
            trafficModel: maps.TrafficModel.BEST_GUESS
          },
          unitSystem: maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === maps.DistanceMatrixStatus.OK) {
            const results = response.rows[0].elements;
            
            // Map the results back to an array of useful data objects
            const metrics = results.map((result, index) => {
              if (result.status === "OK") {
                return {
                  status: result.status,
                  distanceText: result.distance.text,
                  distanceValueMeters: result.distance.value,
                  durationText: result.duration.text, // Normal ETA
                  durationValueSeconds: result.duration.value,
                  durationInTrafficText: result.duration_in_traffic ? result.duration_in_traffic.text : result.duration.text, // Traffic ETA
                  durationInTrafficValueSeconds: result.duration_in_traffic ? result.duration_in_traffic.value : result.duration.value,
                };
              } else {
                return { status: result.status, error: "Route unachievable." };
              }
            });
            resolve(metrics);
          } else {
            reject(new Error(`Distance Matrix failed with status: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error("Google Maps API Error [calculateRouteAndETA]:", error);
    throw error;
  }
};