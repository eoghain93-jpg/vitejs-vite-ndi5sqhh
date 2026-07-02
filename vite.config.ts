import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Precache the full app shell (JS, CSS, fonts, icons) so scoring works
    // with no signal at all; new deploys activate automatically.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // public/manifest.json is hand-maintained
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff2}'],
      },
    }),
  ],
})
