/**
 * Real-time pricing engine using the Open Source Routing Machine (OSRM) API.
 * Calculates exact distance and duration between pickup and dropoff.
 */

const VEHICLE_RATES = {
  bike: { base: 30, perKm: 12, perMin: 1, name: 'Bike', capacity: '5kg' },
  tempo: { base: 150, perKm: 25, perMin: 2, name: 'Tempo', capacity: '500kg' },
  truck: { base: 400, perKm: 45, perMin: 3, name: 'Truck', capacity: '2000kg' }
};

export const calculateDynamicPricing = async (pickupCoords, dropoffCoords) => {
  try {
    // OSRM expects coordinates in Longitude,Latitude format
    const start = `${pickupCoords.lng},${pickupCoords.lat}`;
    const end = `${dropoffCoords.lng},${dropoffCoords.lat}`;
    
    // Real OSRM Driving Route API
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false`
    );
    
    if (!response.ok) throw new Error('Failed to fetch routing data');
    
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes.length) {
      throw new Error('No route found between locations');
    }

    const route = data.routes[0];
    const distanceKm = route.distance / 1000;
    const durationMin = route.duration / 60;

    // Calculate dynamic prices for all vehicle tiers
    const estimates = Object.entries(VEHICLE_RATES).map(([id, rate]) => {
      const distanceCost = distanceKm * rate.perKm;
      const timeCost = durationMin * rate.perMin;
      const totalCost = Math.round(rate.base + distanceCost + timeCost);

      return {
        id,
        name: rate.name,
        capacity: rate.capacity,
        price: totalCost,
        eta: Math.round(durationMin),
        distance: distanceKm.toFixed(1)
      };
    });

    return {
      distance: distanceKm,
      duration: durationMin,
      estimates
    };
  } catch (error) {
    console.error('OSRM Pricing Error:', error);
    return null;
  }
};