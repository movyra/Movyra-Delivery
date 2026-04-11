# Movyra Troubleshooting Guide

This guide outlines solutions to common technical issues encountered during local development, build processes, and production deployment of the Movyra OS.

## 1. Vite Build Failures (Error 504 / Module Resolution)

**Symptom:** Running `npm run build` fails with "Could not resolve module" or the development server hangs with a 504 Gateway Timeout.
**Root Cause:** Vite aggressively caches dependency paths. If a file is moved, deleted, or if there is a case-sensitivity mismatch (e.g., `Dashboard` vs `dashboard` on Linux file systems), the cached graph breaks.
**Resolution:**
1. Halt the Vite server (`Ctrl + C`).
2. Delete the cache directory: `rm -rf node_modules/.vite`
3. Delete the output directory: `rm -rf dist`
4. Verify all import paths in the offending file perfectly match the capitalization on disk.
5. Rerun `npm run build` or `npm run dev`.

## 2. Leaflet Map Renders as Gray Boxes

**Symptom:** The map in `LiveTracking.jsx` loads, but the tiles are missing, showing only a gray background.
**Root Cause:** Missing CSS imports or invalid tile server URLs. Leaflet requires its core CSS to position tiles correctly.
**Resolution:**
1. Ensure `import 'leaflet/dist/leaflet.css';` is present at the top of the component file.
2. Verify the `MAP_LAYERS` URLs in `src/services/mapLayers.js` are reachable and not returning 403 Forbidden errors.

## 3. Firebase "Missing or Insufficient Permissions"

**Symptom:** Firestore `onSnapshot` or `addDoc` operations fail immediately in the console.
**Root Cause:** The client application is attempting to read or write data outside its authorized scope defined in `firestore.rules`.
**Resolution:**
1. Ensure the user is fully authenticated via `useAuthStore`.
2. Check the document path. Movyra requires the path to strictly match the user's UID: `artifacts/{appId}/users/{user.uid}/...`.
3. Verify that the `__app_id` constant or environment variable is correctly injected and matches the backend configuration.

## 4. OSRM Routing Timeout or Empty Results

**Symptom:** The route polyline does not draw, and the ETA shows blank.
**Root Cause:** The public OSRM demonstration server limits request rates, or the provided coordinates are invalid (e.g., routing across an ocean).
**Resolution:**
1. Implement debouncing in the coordinate submission logic (already handled in `SetLocation.jsx`).
2. Ensure coordinates are passed in `longitude,latitude` format, as OSRM reverses the standard Google Maps `latitude,longitude` convention.