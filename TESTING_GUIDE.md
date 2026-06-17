# Movyra Quality Assurance and Testing Guide

Reliability is paramount for the Movyra Logistics OS. A broken component in production translates to delayed dispatches and financial loss. This document outlines the rigorous testing standards enforced by AnyAstro Techno Solutions.

## 1. Unit Testing Strategy (Vitest)
Vitest is utilized for high-speed, localized testing of discrete logic.

* **Target Audience:** Pure functions, Zustand store mutations, and isolated math/formatting utilities.
* **Execution:** `npm run test:unit`
* **Mandatory Coverage:**
  * `src/utils/pricingEngine.js`: Must have 100% coverage across all surge multipliers and base rate permutations.
  * `src/store/useBookingStore.js`: State updates (especially array manipulations for dropoffs) must be verified for immutability.
* **Example Test Concept:**
  Ensure `calculateEstimatedFare` does not return a value lower than the predefined `minFare` regardless of the input distance.

## 2. Component Integration Testing (React Testing Library)
These tests verify that UI components interact correctly with the DOM and user inputs.

* **Target Audience:** Complex forms (`BookingDetails.jsx`), segmented toggles, and modal overlays.
* **Requirements:**
  * Do not test implementation details (e.g., checking if a specific Tailwind class exists). Test behavior (e.g., "Clicking the 'Add Stop' button renders a new input field").
  * Mock external dependencies. Do not allow tests to make live network requests to Firebase or OpenStreetMap.

## 3. External API Mocking (MSW)
When testing components that rely on the `src/services/routing.js` abstraction, utilize Mock Service Worker (MSW) to intercept `fetch` calls.
* Ensure tests verify how the UI handles API timeouts, 500 server errors from Nominatim, and empty result arrays. The application must degrade gracefully, showing appropriate `AlertCircle` UI components rather than throwing unhandled exceptions.

## 4. End-to-End (E2E) Testing (Cypress)
Cypress tests the application in a real browser environment, mimicking the exact journey of a dispatcher or customer.

* **Execution:** `npm run test:e2e`
* **Critical Paths Tested:**
  1. User Authentication: Entering phone number, passing mocked OTP, and reaching the dashboard.
  2. Booking Flow: Setting origin/destination, selecting a vehicle, and submitting the payload.
  3. Live Tracking: Mocking Firestore updates to ensure the Leaflet marker animates correctly without crashing the WebGL context.