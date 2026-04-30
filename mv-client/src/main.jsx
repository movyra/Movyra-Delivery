import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// ============================================================================
// SECTION 1: STRICT 5-SECOND PWA AUTO-UPDATE LOOP
// This connects to the vite-plugin-pwa configuration to silently ping
// the Firebase server every 5000ms. If a new deployment is detected,
// it forces the service worker to update and claim the client immediately.
// ============================================================================
const updateSW = registerSW({
  onRegisteredSW(swUrl, r) {
    if (r) {
      // Check for updates exactly every 5 seconds (5000ms) strictly
      setInterval(async () => {
        if (r.update) {
          try {
            await r.update();
            // Silent debug to confirm the loop is running without polluting the UI
            console.debug('Movyra PWA: Background update check executed.');
          } catch (error) {
            console.error('Movyra PWA Auto-Update Polling Error:', error);
          }
        }
      }, 5000);
    }
  },
  onRegisterError(error) {
    console.error('Movyra PWA Registration Failed:', error);
  }
});

// ============================================================================
// SECTION 2: REACT APPLICATION MOUNTING
// ============================================================================
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);