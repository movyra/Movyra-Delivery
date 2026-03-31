import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// STORE: BOOKING ENGINE STATE (ZUSTAND)
// Architected for production-level logistics. Handles Multi-Stop Routing, 
// Package Safety Toggles, Smart Scheduling, and the Driver Bidding System.
// Uses persist middleware for perfect data retention across navigations.
// ============================================================================

const useBookingStore = create(
  persist(
    (set, get) => ({
      // --------------------------------------------------------------------------
      // 1. LOCATION & ROUTING STATE (Supports Advanced Multi-Stop & Metadata)
      // --------------------------------------------------------------------------
      // location object structure: { address, lat, lng, contactName, contactPhone, notes, timeWindow }
      pickup: null, 
      dropoffs: [], 
      
      routeDetails: {
        isOptimized: false, // Flagged true when TSP algorithm sorts the array
        alternativeRoutes: [], // Array of potential path coordinates (fastest, shortest)
        selectedRouteIndex: 0
      },

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
      setPickup: (location) => set((state) => ({ 
        pickup: { ...state.pickup, ...location } 
      })),

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

      // Advanced Routing Overrides
      setOptimizedDropoffs: (optimizedArray) => set((state) => ({
        dropoffs: optimizedArray,
        routeDetails: { ...state.routeDetails, isOptimized: true }
      })),

      setRouteDetails: (details) => set((state) => ({
        routeDetails: { ...state.routeDetails, ...details }
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
        routeDetails: { 
          isOptimized: false, 
          alternativeRoutes: [], 
          selectedRouteIndex: 0 
        },
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
    }),
    {
      name: 'movyra-booking-storage', // Unique name for local storage key
      storage: createJSONStorage(() => sessionStorage), // Uses session storage to clear when the user closes the tab, preventing stale data on next visit
    }
  )
);

export default useBookingStore;