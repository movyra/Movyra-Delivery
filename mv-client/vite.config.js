import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'; import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({ plugins: [ react(), VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Movyra by Bongo', theme_color: '#000000', background_color: '#000000', display: 'standalone' } }) ] });
