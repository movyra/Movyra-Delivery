// ============================================================================
// SERVICE: WHAT3WORDS API INTEGRATION
// Converts exact 3m x 3m squares into human-readable 3-word addresses and vice versa.
// Requires a valid API Key provided in your environment variables.
// ============================================================================

// Grabs API key from Vite environment variables (fallback empty string prevents fatal crash)
const W3W_API_KEY = import.meta.env.VITE_W3W_API_KEY || ''; 
const BASE_URL = 'https://api.what3words.com/v3';

/**
 * Converts a 3-word address (e.g., "filled.count.soap") to precise GPS coordinates.
 * @param {string} words - The 3-word address.
 * @returns {Promise<Object>} { lat, lng, words, nearestPlace }
 */
export const convertToCoordinates = async (words) => {
  if (!W3W_API_KEY) throw new Error("What3Words API Key is missing.");
  if (!words || typeof words !== 'string') throw new Error("Invalid 3-word address provided.");

  try {
    const cleanWords = words.replace(/^\/\/\//, '').trim(); // Remove '///' if user pasted it
    const response = await fetch(`${BASE_URL}/convert-to-coordinates?words=${encodeURIComponent(cleanWords)}&key=${W3W_API_KEY}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to convert 3-word address.");
    }

    const data = await response.json();
    
    return {
      lat: data.coordinates.lat,
      lng: data.coordinates.lng,
      words: data.words,
      nearestPlace: data.nearestPlace
    };
  } catch (error) {
    console.error("What3Words API Error [convertToCoordinates]:", error);
    throw error;
  }
};

/**
 * Converts precise GPS coordinates into a 3-word address.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} { words, nearestPlace }
 */
export const convertTo3wa = async (lat, lng) => {
  if (!W3W_API_KEY) throw new Error("What3Words API Key is missing.");
  if (!lat || !lng) throw new Error("Valid coordinates are required.");

  try {
    const response = await fetch(`${BASE_URL}/convert-to-3wa?coordinates=${lat},${lng}&key=${W3W_API_KEY}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch 3-word address.");
    }

    const data = await response.json();
    
    return {
      words: data.words,
      nearestPlace: data.nearestPlace
    };
  } catch (error) {
    console.error("What3Words API Error [convertTo3wa]:", error);
    throw error;
  }
};