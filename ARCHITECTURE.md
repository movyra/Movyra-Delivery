# Movyra System Architecture

This document details the high-level architecture and technical decisions underlying the Movyra Logistics OS, built by Bongo (AnyAstro Techno Pvt Ltd). Movyra is designed as a highly scalable, real-time dispatch and tracking system capable of handling thousands of concurrent delivery telemetry streams.

## High-Level Topology

The system is composed of a decoupled frontend client (PWA) and a serverless backend ecosystem.

### 1. Client Application (Frontend)
* **Framework:** React 18.
* **Build Tool:** Vite, configured for rapid HMR and aggressive production minification.
* **PWA Strategy:** `vite-plugin-pwa` is utilized to generate Service Workers that cache the application shell (`index.html`), core JavaScript bundles, and static assets. This ensures the app loads instantly even on poor mobile networks, a critical requirement for field drivers.
* **State Management:** Zustand is used for global state. It provides a smaller footprint and simpler API compared to Redux, crucial for managing complex booking states (multi-stop coordinates, pricing, user preferences) without unnecessary re-renders.
* **Map Rendering:** MapLibre GL JS and Leaflet are used for hardware-accelerated vector map rendering.
* **Styling:** Tailwind CSS provides utility-first styling, ensuring a consistent design system and minimal CSS bundle size.

### 2. Backend Infrastructure (Serverless)
* **Database:** Firebase Firestore (NoSQL). Chosen for its native real-time synchronization capabilities. Client apps listen to document changes (e.g., driver location updates) via WebSockets, eliminating the need for client-side polling.
* **Authentication:** Firebase Authentication manages user identity, supporting OTP via SMS, OAuth, and Email/Password.
* **Compute:** Firebase Cloud Functions (Node.js) handle secure, server-side operations that cannot be trusted to the client, such as final fare calculation, payment gateway integration, and dispatch matching algorithms.
* **Hosting:** Firebase Hosting serves the static PWA assets via a global CDN. Strict `Cache-Control` headers are configured in `firebase.json` to ensure immediate propagation of new deployments while aggressively caching immutable assets.

### 3. External API Integrations
To avoid vendor lock-in and excessive costs associated with proprietary mapping solutions, Movyra utilizes open-source alternatives where viable:
* **Geocoding/Autocomplete:** OpenStreetMap Nominatim REST API translates human-readable addresses into lat/lng coordinates and vice versa.
* **Routing Engine:** OSRM (Open Source Routing Machine) calculates optimal driving routes, polyline geometries for map rendering, and distance/ETA metrics.

## Data Flow: Live Tracking Scenario
1.  **Driver App:** Captures GPS coordinates via the HTML5 Geolocation API.
2.  **Telemetry Sync:** The driver app writes these coordinates to a specific Firestore document (`artifacts/{appId}/users/{userId}/orders/{orderId}`).
3.  **Real-Time Push:** Firestore detects the document change and pushes the update over the active WebSocket connection to the customer's PWA.
4.  **Render:** The customer's app receives the payload, calculates route deviation against the OSRM polyline, and smoothly animates the driver marker on the MapLibre canvas using CSS transforms based on heading data.