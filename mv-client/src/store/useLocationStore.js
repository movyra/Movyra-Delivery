import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// STORE: GLOBAL LOCATION & GPS STATE (ZUSTAND + PERSIST)
// Architected for production. Manages real-time device coordinates, 
// categorized saved addresses (Home/Work/Custom), and smart auto-fill caching.
// ============================================================================

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

      // Trigger actual device GPS hardware
      fetchCurrentLocation: () => {
        set({ isLocating: true, locationError: null });

        if (!navigator.geolocation) {
          set({ 
            isLocating: false, 
            locationError: 'Geolocation is not supported by your device/browser.' 
          });
          return;
        }

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
            let errorMessage = 'Failed to fetch location.';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied by user.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage = 'The request to get user location timed out.';
                break;
              default:
                errorMessage = 'An unknown error occurred.';
            }
            set({ isLocating: false, locationError: errorMessage });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
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
          // Increment usage count and update timestamp
          newFrequent[existingIndex] = {
            ...newFrequent[existingIndex],
            usageCount: newFrequent[existingIndex].usageCount + 1,
            lastUsed: Date.now()
          };
        } else {
          // Add new frequent location
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
      storage: createJSONStorage(() => localStorage), // defines the caching mechanism
      // Only persist saved and frequent locations. Do not persist real-time GPS state or errors.
      partialize: (state) => ({ 
        savedAddresses: state.savedAddresses, 
        frequentLocations: state.frequentLocations 
      }),
    }
  )
);

export default useLocationStore;