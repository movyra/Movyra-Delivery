// ============================================================================
// SERVICE: MAP LAYERS DICTIONARY
// Centralized configuration for dynamic Leaflet tile layers. Prevents 
// hardcoded strings in components and supports instant Light/Dark mode toggling.
// ============================================================================

export const MAP_LAYERS = {
  // Primary Themes
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  
  // Advanced Overlays
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  
  // Proxy Overlays (Free alternatives for production)
  weather: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', 
  traffic: 'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png'
};