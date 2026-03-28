import { create } from 'zustand';
const useBookingStore = create((set) => ({ pickup: null, dropoff: null, vehicleType: null, priceEstimate: null, activeOrder: null, setPickup: (loc) => set({ pickup: loc }), setDropoff: (loc) => set({ dropoff: loc }), setVehicle: (v) => set({ vehicleType: v }), setPrice: (p) => set({ priceEstimate: p }), setActiveOrder: (o) => set({ activeOrder: o }) }));
export default useBookingStore;
