# Feature Request

![Feature](https://img.shields.io/badge/Type-Enhancement-blue.svg)

## Problem Statement
**As a** [user persona, e.g., delivery driver],
**I need** [the functionality, e.g., a dark mode toggle for the map],
**So that** [the benefit, e.g., screen glare is reduced during night operations].

## Proposed Solution
Implement a global state toggle in `useMapSettingsStore.js` that switches the Leaflet tile layer URL from CartoDB Positron to CartoDB Dark Matter. Add a toggle switch in `ProfileSettings.jsx`.

## Alternatives Considered
* Using CSS filter inversion on the map canvas: Rejected due to severe GPU performance penalties on low-end mobile devices.
* Custom Mapbox styles: Rejected due to API cost scaling.

## Additional Context / Mockups
* Refer to Figma frame #402 for the settings UI layout.
* Tile URL to utilize: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`

## Implementation Complexity
- [ ] Low (UI only, localized state change)
- [ ] Medium (Involves global Zustand state or minor Firebase schema updates)
- [ ] High (Requires new Cloud Functions, major routing changes, or external API integration)