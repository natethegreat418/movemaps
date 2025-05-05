import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  
  return {
    plugins: [react()],
    base: './', // Use relative paths for assets
    
    // Configure build options
    build: {
      // Optimize bundle size by setting up chunk strategy
      rollupOptions: {
        output: {
          manualChunks: {
            // Group React dependencies into a vendor chunk
            vendor: ['react', 'react-dom', 'react-router-dom'],
            // MapBox in its own chunk
            mapbox: ['mapbox-gl']
          }
        }
      }
    },
    
    // Define global constants for the build
    define: {
      // Make the build mode available to the client code
      __APP_ENV__: JSON.stringify(mode)
    }
  }
})
