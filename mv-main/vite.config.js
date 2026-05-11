import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Expose the server to the GitHub Codespaces container network
    host: true, 
    // Enforce default Vite port
    port: 5173, 
    // Fail if port 5173 is consumed, rather than randomly switching ports
    strictPort: true, 
    hmr: {
      // GitHub Codespaces proxies all public web traffic over HTTPS (port 443). 
      // This forces the WebSocket to connect through the secure proxy, 
      // eliminating the 504 Gateway Timeout and Unchecked runtime.lastError.
      clientPort: 443 
    }
  }
})