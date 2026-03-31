// ============================================================================
// SERVICE: OSRM TRIP API (TRAVELING SALESPERSON PROBLEM SOLVER)
// Automatically restructures arrays of map coordinates to find the absolute
// fastest delivery sequence, saving time and fuel.
// ============================================================================

/**
 * Analyzes a pickup point and multiple drop-offs to return the mathematically optimized sequence.
 * @param {Object} origin - { lat, lng } (The starting point, firmly locked)
 * @param {Array<Object>} dropoffs - Array of { lat, lng, ...otherData } to be sorted.
 * @returns {Promise<Array<Object>>} A newly sorted array of the dropoff objects.
 */
export const optimizeMultiStopRoute = async (origin, dropoffs) => {
  // We need at least an origin and 2 drop-offs to justify an optimization algorithm
  if (!origin?.lat || !dropoffs || dropoffs.length < 2) {
    return dropoffs; 
  }

  // Filter out any invalid/blank coordinates to prevent API rejection
  const validDropoffs = dropoffs.filter(d => d && d.lat !== null && d.lat !== 0);
  
  if (validDropoffs.length < 2) return dropoffs;

  try {
    // OSRM format: lon,lat separated by semicolons
    const allPoints = [origin, ...validDropoffs];
    const coordsString = allPoints.map(pt => `${pt.lng},${pt.lat}`).join(';');
    
    // API Call: roundtrip=false prevents routing back to start. 
    // source=first locks the origin index [0] so the pickup remains the pickup.
    const url = `https://router.project-osrm.org/trip/v1/driving/${coordsString}?roundtrip=false&source=first`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.waypoints) {
      throw new Error("Optimization engine failed to compute a valid route.");
    }

    // The API returns 'waypoints' with their new logical sequence index (waypoint_index)
    // We sort the waypoints array based on this optimal sequence
    const sortedWaypoints = data.waypoints.sort((a, b) => a.waypoint_index - b.waypoint_index);
    
    const optimizedDropoffArray = [];
    
    // Map the sorted sequence back to our original rich data objects
    sortedWaypoints.forEach(wp => {
      // wp.original_index refers to its position in the string we sent: [origin, drop1, drop2, ...]
      // Since origin is 0, dropoffs start at original_index 1
      if (wp.original_index !== 0) { 
        optimizedDropoffArray.push(validDropoffs[wp.original_index - 1]);
      }
    });

    return optimizedDropoffArray;

  } catch (error) {
    console.error("OSRM Route Optimization Error:", error);
    throw error; // Let the UI handle the failure state
  }
};