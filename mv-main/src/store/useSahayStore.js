import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ============================================================================
 * MOVYRA SAHAY - GLOBAL STATE MANAGEMENT
 * Centralized store for offline drafts, localization, theme, and location.
 * ============================================================================
 */

export const useSahayStore = create(
    persist(
        (set) => ({
            // 1. DRAFT REPORT MANAGEMENT
            // Stores incomplete emergency reports to prevent data loss during network drops.
            draftReport: {
                category: '',
                address: '',
                lat: null,
                lng: null,
                danger: 'No',
                description: ''
            },
            
            saveDraft: (reportData) => set((state) => ({
                draftReport: { ...state.draftReport, ...reportData }
            })),
            
            clearDraft: () => set({
                draftReport: {
                    category: '',
                    address: '',
                    lat: null,
                    lng: null,
                    danger: 'No',
                    description: ''
                }
            }),

            // 2. LOCALIZATION & THEME
            // Manages user language preference and visual theme (defaulting to Sahay Light).
            language: 'en',
            setLanguage: (langCode) => set({ language: langCode }),

            theme: 'light',
            setTheme: (themeName) => set({ theme: themeName }),
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'light' ? 'dark' : 'light'
            })),

            // 3. REGIONAL FILTERING
            // Manages the globally selected city for telemetry and dashboards.
            activeCity: 'All Cities',
            setActiveCity: (cityName) => set({ activeCity: cityName }),

            // 4. GEOLOCATION STATE
            // Stores the user's current GPS coordinates for mapping and reporting.
            currentLocation: {
                lat: null,
                lng: null,
                address: ''
            },
            setLocation: (lat, lng, address) => set({
                currentLocation: { lat, lng, address }
            }),

            // 5. SESSION MANAGEMENT
            // Clears sensitive user data upon logout.
            clearSession: () => set({
                draftReport: {
                    category: '',
                    address: '',
                    lat: null,
                    lng: null,
                    danger: 'No',
                    description: ''
                },
                currentLocation: {
                    lat: null,
                    lng: null,
                    address: ''
                },
                activeCity: 'All Cities'
            })
        }),
        {
            name: 'movyra-sahay-storage', // Unique local storage key
            // Define exactly which state properties should survive page reloads
            partialize: (state) => ({
                draftReport: state.draftReport,
                language: state.language,
                theme: state.theme
            })
        }
    )
);