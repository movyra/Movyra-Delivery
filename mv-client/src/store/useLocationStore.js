import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// STORE: GLOBAL LOCATION & GPS STATE (ZUSTAND + PERSIST)
// Architected for production. Manages real-time device coordinates, 
// categorized saved addresses (Home/Work/Custom), and smart auto-fill caching.
// Features graceful fallbacks to prevent fatal crashes on GPS denial.
// ============================================================================

// Default safe coordinate fallback (New York City)
const FALLBACK_LOCATION = {
  lat: 40.7128,
  lng: -74.0060,
  accuracy: 1000,
  timestamp: Date.now()
};

const useLocationStore = create(
  persist(
    (set, get) => ({
      // ----------------------------------------------------------------------
      // 1. REAL-TIME GPS STATE
      // ----------------------------------------------------------------------
      currentLocation: null, // { lat, lng, accuracy, timestamp }
      isLocating: false,
      locationError: null,

      // ----------------------------------------------------------------------
      // 2. SAVED ADDRESSES (Persisted for Offline Fallback)
      // ----------------------------------------------------------------------
      savedAddresses: [], // Array of { id, type: 'home'|'work'|'custom', name, address, lat, lng }

      // ----------------------------------------------------------------------
      // 3. SMART SUGGESTIONS / FREQUENT AUTO-FILL
      // ----------------------------------------------------------------------
      frequentLocations: [], // Array of { address, lat, lng, usageCount, lastUsed }

      // ======================================================================
      // ACTIONS & MUTATORS
      // ======================================================================

      // Trigger actual device GPS hardware with strict fallback safety
      fetchCurrentLocation: () => {
        set({ isLocating: true, locationError: null });

        if (!navigator.geolocation) {
          set({ 
            currentLocation: FALLBACK_LOCATION,
            isLocating: false, 
            locationError: 'Geolocation unsupported. Using default location.' 
          });
          return;
        }

        try {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              set({
                currentLocation: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp,
                },
                isLocating: false,
                locationError: null,
              });
            },
            (error) => {
              console.error("GPS Hardware Error:", error);
              let errorMessage = 'Failed to fetch location. Using default.';
              
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location permission denied. Using default location.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information is unavailable. Using default.';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out. Using default.';
                  break;
              }
              
              // Graceful Fallback injection instead of crashing
              set({ 
                currentLocation: FALLBACK_LOCATION,
                isLocating: false, 
                locationError: errorMessage 
              });
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } catch (err) {
          console.error("Unexpected GPS Error:", err);
          set({ 
            currentLocation: FALLBACK_LOCATION,
            isLocating: false, 
            locationError: 'Unexpected system error. Using default location.' 
          });
        }
      },

      // Manage Saved Addresses
      addSavedAddress: (addressData) => set((state) => ({
        savedAddresses: [...state.savedAddresses, { ...addressData, id: crypto.randomUUID() }]
      })),

      removeSavedAddress: (id) => set((state) => ({
        savedAddresses: state.savedAddresses.filter(addr => addr.id !== id)
      })),

      updateSavedAddress: (id, updatedData) => set((state) => ({
        savedAddresses: state.savedAddresses.map(addr => 
          addr.id === id ? { ...addr, ...updatedData } : addr
        )
      })),

      // Smart Suggestions Engine: Bumps usage count for routing algorithms
      trackFrequentLocation: (location) => set((state) => {
        const existingIndex = state.frequentLocations.findIndex(
          loc => loc.address === location.address
        );

        let newFrequent = [...state.frequentLocations];

        if (existingIndex >= 0) {
          newFrequent[existingIndex] = {
            ...newFrequent[existingIndex],
            usageCount: newFrequent[existingIndex].usageCount + 1,
            lastUsed: Date.now()
          };
        } else {
          newFrequent.push({
            ...location,
            usageCount: 1,
            lastUsed: Date.now()
          });
        }

        // Keep only top 10 to prevent storage bloat, sorted by most used
        newFrequent.sort((a, b) => b.usageCount - a.usageCount);
        if (newFrequent.length > 10) newFrequent = newFrequent.slice(0, 10);

        return { frequentLocations: newFrequent };
      }),

      clearFrequentLocations: () => set({ frequentLocations: [] }),
    }),
    {
      name: 'movyra-location-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), 
      // Only persist saved and frequent locations. Do not persist real-time GPS state or errors.
      partialize: (state) => ({ 
        savedAddresses: state.savedAddresses, 
        frequentLocations: state.frequentLocations 
      }),
    }
  )
);

export default useLocationStore;