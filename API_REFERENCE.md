# Movyra Internal and External API Reference

This document outlines the standard interfaces for internal service abstractions and external REST API consumptions within the Movyra client application.

## 1. Firebase Database Services (`src/services/firestore.js`)

### `submitOrderPayload(orderData, pricingData)`
Commits a finalized booking payload to the user's secure Firestore partition.
* **Parameters:**
  * `orderData` (Object): Contains pickup, dropoffs array, and package constraints.
  * `pricingData` (Object): Contains calculated fare, taxes, and surge metrics.
* **Returns:** `Promise<string>` - The newly generated Firestore Document ID.
* **Throws:** Error if authentication token is missing or network fails.

### `fetchUserAddresses()`
Retrieves the paginated list of a user's saved locations.
* **Parameters:** None.
* **Returns:** `Promise<Array<Object>>` - Array of address objects containing `lat`, `lng`, `address`, `type`, and `name`.

## 2. Routing and Geocoding Services (`src/services/routing.js`)

Movyra strictly utilizes open-source routing infrastructure to avoid enterprise billing caps.

### `fetchPlacePredictions(inputQuery)`
Queries the OpenStreetMap Nominatim endpoint for autocomplete suggestions.
* **Parameters:**
  * `inputQuery` (String): The partial address typed by the user (minimum 3 characters).
* **Returns:** `Promise<Array<Object>>` - Standardized array mapping Nominatim's `display_name` to a generic UI format.
* **Rate Limiting:** Internally debounced at 400ms to comply with OSM acceptable use policies.

### `geocodeAddress(identifier)`
Converts a human-readable string or a packed coordinate string into exact lat/lng floats.
* **Parameters:**
  * `identifier` (String): Either a text address or a packed string (e.g., "28.6139,77.2090").
* **Returns:** `Promise<Object>` - `{ lat: Float, lng: Float, formattedAddress: String }`.

### `calculateRouteMetrics(waypoints)`
Queries the OSRM backend to generate driving distance and ETAs.
* **Parameters:**
  * `waypoints` (Array): Array of objects containing `lat` and `lng`. Minimum length of 2.
* **Returns:** `Promise<Object>` - Contains `distanceMeters`, `durationSeconds`, and the raw `routeGeoJSON` for rendering.