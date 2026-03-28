import axios from 'axios';
import { auth } from './firebaseAuth';

// ============================================================================
// SECTION 1: Global Axios Instance Configuration
// ============================================================================
const apiClient = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://movyra-backend.onrender.com/api', 
  timeout: 15000, // 15-second timeout for mobile networks
});

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================
apiClient.interceptors.request.use(async (config) => {
  
  // SECTION 2: Dynamic Telemetry & Device Headers
  // Provides the Rust backend with exact timezone data for accurate delivery ETAs
  config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  config.headers['X-App-Version'] = '1.0.0';
  config.headers['X-Platform'] = 'PWA-Mobile';

  // SECTION 3: Secure Firebase JWT Injection
  // Ensures every API request is cryptographically signed by the logged-in user
  const user = auth.currentUser;
  if (user) { 
    // getIdToken() natively handles caching and only refreshes if expired
    const token = await user.getIdToken(); 
    config.headers.Authorization = `Bearer ${token}`; 
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // SECTION 4: Global Auth Exception Handler (401 Unauthorized)
    // If the Rust backend rejects the Firebase token (e.g., session revoked/expired)
    if (error.response?.status === 401) {
      console.error("CRITICAL: Secure Session Expired or Invalid. Forcing logout.");
      await auth.signOut();
      window.location.href = '/auth-login'; // Hard redirect to clear secure state
      return Promise.reject(error);
    }

    // SECTION 5: Exponential Backoff Retry Engine (For Mobile Network Drops)
    // Automatically retries failed network requests (timeouts or 5xx server crashes)
    if ((!error.response || error.response.status >= 500) && config) {
      config._retryCount = config._retryCount || 0;
      
      // Maximum 3 retries
      if (config._retryCount < 3) {
        config._retryCount += 1;
        
        // Wait 2s, then 4s, then 8s before retrying
        const backoffDelay = Math.pow(2, config._retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        // Execute the retry
        console.warn(`Network retry ${config._retryCount}/3 executing...`);
        return apiClient(config); 
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;