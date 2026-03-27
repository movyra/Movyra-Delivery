import { create } from 'zustand';

// Ephemeral store for the active delivery session (clears on refresh)
const useBookingStore = create((set) => ({
  pickup: null, // Expects object: { lat, lng, address, details }
  dropoff: null, 
  vehicleType: null, // e.g., 'bike', 'tempo', 'truck'
  priceEstimate: null,
  activeOrder: null, // The confirmed order object from backend
  
  setPickup: (location) => set({ pickup: location }),
  setDropoff: (location) => set({ dropoff: location }),
  setVehicle: (vehicle) => set({ vehicleType: vehicle }),
  setPrice: (price) => set({ priceEstimate: price }),
  setActiveOrder: (order) => set({ activeOrder: order }),
  
  // Real-time telemetry injection for the Active Tracking Dashboard
  updateTracking: (telemetryUpdate) => set((state) => ({
    activeOrder: state.activeOrder 
      ? { ...state.activeOrder, telemetry: telemetryUpdate }
      : null
  })),

  // Wipe the slate clean after order completion or cancellation
  clearBooking: () => set({
    pickup: null,
    dropoff: null,
    vehicleType: null,
    priceEstimate: null,
  }),
}));

export default useBookingStore;