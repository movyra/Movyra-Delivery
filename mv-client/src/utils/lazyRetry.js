import { lazy } from 'react';

/**
 * UTILITY: LAZY RETRY (NETWORK RESILIENCE ENGINE)
 * Wraps React.lazy() to automatically recover from 504 Gateway Timeouts, 
 * dropped mobile connections, and stale Vite chunks.
 * * Features:
 * 1. Exponential Backoff: Retries failed imports with increasing delays (1s, 2s, 4s).
 * 2. Silent Recovery: Prevents the white screen of death during transit/network drops.
 * 3. Stale Cache Bypassing: Safely triggers a hard reload if chunks are genuinely missing 
 * (e.g., after a new deployment) without getting stuck in infinite reload loops.
 */
export const lazyRetry = (componentImport, retries = 4, baseDelay = 1000) => {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      // Recursive function to handle the import attempts
      const attemptImport = (attemptsLeft) => {
        componentImport()
          .then((component) => {
            // On absolute success, clear any previous emergency reload flags
            window.sessionStorage.removeItem('movyra-emergency-chunk-reload');
            resolve(component);
          })
          .catch((error) => {
            // Detect if the error is network-related or a missing Vite chunk
            const isNetworkError = 
              error.name === 'ChunkLoadError' || 
              error.message.includes('Failed to fetch dynamically imported module') ||
              error.message.includes('fetch') ||
              error.message.includes('504');

            if (attemptsLeft === 0) {
              // We have exhausted all silent retries.
              // If it's a network/chunk error, the user's browser might be holding a stale index.html
              // pointing to an old chunk hash that no longer exists on the server.
              const hasAlreadyReloaded = window.sessionStorage.getItem('movyra-emergency-chunk-reload');
              
              if (isNetworkError && !hasAlreadyReloaded) {
                console.warn('[Network] Exhausted retries for chunk. Forcing hard reload to clear stale cache.');
                // Set flag to prevent infinite reload loops if the server is actually completely down
                window.sessionStorage.setItem('movyra-emergency-chunk-reload', 'true');
                window.location.reload(true);
                return; // Halt execution and wait for the browser to reload
              }
              
              // If we already reloaded or it's a structural React error, reject and let the Error Boundary catch it
              console.error('[Network] Chunk load failed permanently after retries:', error);
              reject(error);
              return;
            }

            // Calculate exponential backoff delay: 1000ms, 2000ms, 4000ms...
            const delay = baseDelay * Math.pow(2, (4 - attemptsLeft));
            console.warn(`[Network] Dynamic import failed (Timeout/Flicker). Retrying in ${delay}ms... (${attemptsLeft} attempts remaining)`);

            // Wait the calculated delay, then try again
            setTimeout(() => {
              attemptImport(attemptsLeft - 1);
            }, delay);
          });
      };

      // Start the first attempt
      attemptImport(retries);
    });
  });
};

export default lazyRetry;