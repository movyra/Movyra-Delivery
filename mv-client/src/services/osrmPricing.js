const RATES = { bike: { base: 30, pKm: 12 }, tempo: { base: 150, pKm: 25 }, truck: { base: 400, pKm: 45 } };
export const calculateDynamicPricing = async (start, end) => {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=false`);
    const data = await res.json();
    const dist = data.routes[0].distance / 1000;
    return { estimates: Object.entries(RATES).map(([id, r]) => ({ id, name: id.toUpperCase(), capacity: id==='bike'?'5kg':id==='tempo'?'500kg':'2000kg', price: Math.round(r.base + (dist * r.pKm)), eta: Math.round(data.routes[0].duration / 60) })) };
  } catch (err) { console.error(err); return null; }
};
