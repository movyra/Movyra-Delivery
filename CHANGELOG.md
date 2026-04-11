# Changelog

All notable changes to the Movyra Logistics OS project will be documented in this file.
The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [1.0.0] - 2026-04-12
### Added
* Initial public release of the Movyra Logistics OS PWA.
* Complete React 18 frontend architecture utilizing Vite for rapid bundling.
* Zustand global state management implementation for Booking, Auth, and Location stores.
* `SetLocation.jsx` engine featuring strict duplicate validation and multi-stop support.
* `LiveTracking.jsx` engine featuring real-time Firestore sync and Leaflet map rendering.
* Integration with OpenStreetMap (Nominatim) for free geocoding and autocomplete.
* Integration with OSRM for polyline drawing, distance matrices, and ETA calculations.
* Hardware integration via `SmartScanner.jsx` for capturing package proof-of-delivery photos using device cameras.
* Secure, strictly-scoped Firebase Firestore pathing (`artifacts/{appId}/users/{userId}/orders`).
* Vite PWA plugin configuration for aggressive caching of map tiles and application shell.

## [0.9.5] - 2026-03-28 (Internal Beta)
### Added
* Dynamic distance-variance algorithm to detect if a driver deviates from the optimal OSRM route by more than 500 meters.
* Animated timeline UI component for tracking order status progression.
* Reusable `SystemCard` and `SystemButton` UI primitives.

### Fixed
* Resolved memory leak in `SetLocation.jsx` caused by asynchronous map rendering attempts after component unmount.
* Fixed Vite compilation failure caused by incorrect relative import paths for hardware components.
* Addressed issue where Firebase persistence failed when multiple browser tabs were open simultaneously.

## [0.9.0] - 2026-02-15 (Alpha)
### Added
* Baseline Firebase Authentication integration (Phone/OTP).
* Initial MapLibre GL JS integration for vector-based pickup selection.
* `firebase.json` configuration for strict cache-control headers on `index.html`.