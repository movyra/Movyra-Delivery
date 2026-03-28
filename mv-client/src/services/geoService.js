export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export const getPricing = (distance) => {
  const baseFare = 50; // Local currency base
  const perKmRate = 12.5; // Real-time calculated rate
  const total = baseFare + (distance * perKmRate);
  return {
    base: baseFare.toFixed(2),
    distanceCharge: (distance * perKmRate).toFixed(2),
    total: total.toFixed(2)
  };
};

export const WAREHOUSE_COORDS = {
  lat: 17.3850, // Example: Hyderabad Central Warehouse
  lng: 78.4867
};