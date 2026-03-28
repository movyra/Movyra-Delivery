import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// STORE: GLOBAL APP STATE (MOVYRA)
// A high-performance Zustand store featuring 6 fully functional logic sections:
// Persistence Setup, State Blueprint, Onboarding Engine, History Management,
// Active Shipments Engine, and UI Animation Context Selectors.
// ============================================================================

const useAppStore = create(
  // SECTION 1: Persistence Setup & Middleware
  // Automatically syncs specific state slices to localStorage to survive page reloads
  persist(
    (set, get) => ({
      
      // SECTION 2: State Blueprint
      // Pure, un-mocked initial states
      hasSeenOnboarding: false,
      recentTrackingHistory: [],
      activeShipments: [],

      // SECTION 3: Onboarding & UI Flow Engine
      // Permanently marks the device as having completed the initial app tour
      completeOnboarding: () => {
        set({ hasSeenOnboarding: true });
      },

      // SECTION 4: Real-Time Tracking History Engine
      // Handles unshifting new searches, deduplication, capping length, and live timestamping
      addTrackingRecord: (trackingId, locationData = "Location Pending") => {
        const timestamp = new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });

        set((state) => {
          // Remove duplicate if it already exists to bring it to the top
          const filteredHistory = state.recentTrackingHistory.filter(
            (item) => item.id !== trackingId
          );

          // Construct the new real-time record
          const newRecord = {
            id: trackingId,
            loc: locationData,
            time: timestamp,
            status: 'transit', // Default assumed status for new searches
            timestampMs: Date.now() // Used for stable animation sorting keys
          };

          // Keep only the 10 most recent searches to optimize memory and UI rendering
          return {
            recentTrackingHistory: [newRecord, ...filteredHistory].slice(0, 10)
          };
        });
      },

      clearTrackingHistory: () => {
        set({ recentTrackingHistory: [] });
      },

      // SECTION 5: Active Shipments Management Engine
      // Synchronizes the user's live deliveries from the backend
      syncActiveShipments: (shipmentsArray) => {
        // Ensure strictly structured array payloads to prevent UI crashes
        if (Array.isArray(shipmentsArray)) {
          set({ activeShipments: shipmentsArray });
        }
      },

      updateShipmentStatus: (shipmentId, newStatus) => {
        set((state) => ({
          activeShipments: state.activeShipments.map((shipment) => 
            shipment.id === shipmentId 
              ? { ...shipment, status: newStatus, lastUpdated: Date.now() }
              : shipment
          )
        }));
      },

      // SECTION 6: Data Purge Engine (Logout/Reset)
      // Securely wipes sensitive tracking data while preserving onboarding status
      purgeUserData: () => {
        set((state) => ({
          recentTrackingHistory: [],
          activeShipments: [],
          // Retain hasSeenOnboarding so returning users aren't forced through the tour again
          hasSeenOnboarding: state.hasSeenOnboarding 
        }));
      }

    }),
    {
      name: 'movyra-app-storage', // The local storage key
      storage: createJSONStorage(() => localStorage),
      // Only persist non-sensitive or UX-critical data
      partialize: (state) => ({ 
        hasSeenOnboarding: state.hasSeenOnboarding,
        recentTrackingHistory: state.recentTrackingHistory
      }),
    }
  )
);

export default useAppStore;