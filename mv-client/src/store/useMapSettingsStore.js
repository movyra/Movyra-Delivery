import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// STORE: MAP CONFIGURATION & VISUAL STATE (ZUSTAND + PERSIST)
// Strictly isolates map UI preferences (themes, traffic, weather) from 
// transactional booking data. Persists user preferences across sessions.
// ============================================================================

const useMapSettingsStore = create(
  persist(
    (set) => ({
      // ----------------------------------------------------------------------
      // 1. BASE TILE THEMES & UI MODES
      // ----------------------------------------------------------------------
      // Available themes: 'standard', 'dark', 'light', 'satellite', 'terrain'
      mapTheme: 'standard', 
      isDarkMode: false,
      isFullscreen: false,

      // ----------------------------------------------------------------------
      // 2. ADVANCED DATA LAYERS & OVERLAYS
      // ----------------------------------------------------------------------
      layers: {
        traffic: false,       // Real-time congestion polylines
        weather: false,       // Precipitation/Temperature radar tiles
        driverRadar: true,    // Animated nearby driver markers
        geofence: true,       // Service boundary and restricted zone shading
        buildings3D: false    // 3D tilt perspective for urban areas
      },

      // ======================================================================
      // ACTIONS & MUTATORS
      // ======================================================================

      /**
       * Updates the primary base map tile layer and syncs dark mode state.
       * @param {string} theme - The theme identifier.
       */
      setMapTheme: (theme) => set({ 
        mapTheme: theme,
        isDarkMode: theme === 'dark'
      }),

      /**
       * Toggles dark mode globally across the map UI and applies the dark theme.
       */
      toggleDarkMode: () => set((state) => {
        const newIsDark = !state.isDarkMode;
        return {
          isDarkMode: newIsDark,
          mapTheme: newIsDark ? 'dark' : 'standard'
        };
      }),

      /**
       * Toggles the immersive fullscreen mode state.
       */
      toggleFullscreen: () => set((state) => ({
        isFullscreen: !state.isFullscreen
      })),

      /**
       * Explicitly sets the fullscreen state (useful for syncing with native browser APIs).
       * @param {boolean} value - Fullscreen active state.
       */
      setIsFullscreen: (value) => set({ isFullscreen: value }),

      /**
       * Toggles the visibility of a specific map overlay layer.
       * @param {string} layerName - Key of the layer in the layers object.
       */
      toggleLayer: (layerName) => set((state) => ({
        layers: {
          ...state.layers,
          [layerName]: !state.layers[layerName]
        }
      })),

      /**
       * Explicitly sets a layer to true or false.
       * @param {string} layerName - Key of the layer.
       * @param {boolean} value - Visibility state.
       */
      setLayer: (layerName, value) => set((state) => ({
        layers: {
          ...state.layers,
          [layerName]: value
        }
      })),

      /**
       * Reverts all map settings back to their default state.
       */
      resetMapSettings: () => set({
        mapTheme: 'standard',
        isDarkMode: false,
        isFullscreen: false,
        layers: {
          traffic: false,
          weather: false,
          driverRadar: true,
          geofence: true,
          buildings3D: false
        }
      })
    }),
    {
      name: 'movyra-map-preferences', // Unique key for local storage
      storage: createJSONStorage(() => localStorage), // Persist in localStorage to remember user's map preferences
    }
  )
);

export default useMapSettingsStore;