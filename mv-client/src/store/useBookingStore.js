import { create } from 'zustand';

// ============================================================================
// STORE: BOOKING ENGINE STATE (ZUSTAND)
// Architected for production-level logistics. Handles Multi-Stop Routing, 
// Package Safety Toggles, Smart Scheduling, and the Driver Bidding System.
// ============================================================================

const useBookingStore = create((set, get) => ({
  // --------------------------------------------------------------------------
  // 1. LOCATION & ROUTING STATE (Supports Advanced Multi-Stop)
  // --------------------------------------------------------------------------
  pickup: null, // { address: string, lat: number, lng: number, contact: string, phone: string }
  dropoffs: [], // Array to support multi-stop delivery loops

  // --------------------------------------------------------------------------
  // 2. PACKAGE SAFETY & DETAILS (The "Unique Advantage" Features)
  // --------------------------------------------------------------------------
  packageDetails: {
    itemType: '', // e.g., 'Documents', 'Groceries', 'Electronics', 'Heavy Goods'
    isFragile: false,
    isHighValue: false,
    requiresSecureOTP: true, // Enforces end-to-end OTP completion
    driverNotes: ''
  },

  // --------------------------------------------------------------------------
  // 3. SCHEDULING STATE (Phase 2 Feature)
  // --------------------------------------------------------------------------
  scheduling: {
    isScheduledLater: false,
    scheduledDateTime: null, // ISO String for backend sync
  },

  // --------------------------------------------------------------------------
  // 4. VEHICLE & SMART PRICING STATE (Strictly ₹ INR)
  // --------------------------------------------------------------------------
  vehicleType: null, // 'bike', '3wheeler', 'minitruck'
  pricing: {
    estimatedPrice: null, // Real-time calculation based on Distance Matrix
    surgeMultiplier: 1.0, // Adjusts dynamically based on region/traffic
    currency: '₹',
    selectedBid: null // { driverId, amount, rating, vehicle } for Bidding System
  },

  // --------------------------------------------------------------------------
  // 5. ACTIVE EXECUTION STATE
  // --------------------------------------------------------------------------
  activeOrder: null, // Stores the Firestore document reference once dispatched

  // ==========================================================================
  // ACTIONS & MUTATORS
  // ==========================================================================

  // Location Management
  setPickup: (location) => set({ pickup: location }),

  addDropoff: (location) => set((state) => ({ 
    dropoffs: [...state.dropoffs, location] 
  })),
  
  updateDropoff: (index, location) => set((state) => {
    const newDropoffs = [...state.dropoffs];
    newDropoffs[index] = { ...newDropoffs[index], ...location };
    return { dropoffs: newDropoffs };
  }),

  removeDropoff: (index) => set((state) => ({
    dropoffs: state.dropoffs.filter((_, i) => i !== index)
  })),

  // Package Safety Toggles
  updatePackageDetails: (details) => set((state) => ({
    packageDetails: { ...state.packageDetails, ...details }
  })),

  // Scheduling
  setScheduling: (scheduleData) => set((state) => ({
    scheduling: { ...state.scheduling, ...scheduleData }
  })),

  // Vehicle Selection
  setVehicle: (vehicle) => set({ vehicleType: vehicle }),

  // Dynamic Pricing & Bidding Engine
  setPricing: (pricingData) => set((state) => ({
    pricing: { ...state.pricing, ...pricingData }
  })),

  acceptDriverBid: (bid) => set((state) => ({
    pricing: { ...state.pricing, selectedBid: bid, estimatedPrice: bid.amount }
  })),

  // Execution
  setActiveOrder: (order) => set({ activeOrder: order }),

  // System Cleanup (Fired after delivery completion or manual cancel)
  resetBooking: () => set({
    pickup: null,
    dropoffs: [],
    packageDetails: { 
      itemType: '', 
      isFragile: false, 
      isHighValue: false, 
      requiresSecureOTP: true, 
      driverNotes: '' 
    },
    scheduling: { 
      isScheduledLater: false, 
      scheduledDateTime: null 
    },
    vehicleType: null,
    pricing: { 
      estimatedPrice: null, 
      surgeMultiplier: 1.0, 
      currency: '₹', 
      selectedBid: null 
    },
    activeOrder: null
  })
}));

export default useBookingStore;