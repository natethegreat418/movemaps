import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Get the mode from environment variable or command line argument
  const isProd = mode === 'production' || process.env.NODE_ENV === 'production'
  const buildMode = isProd ? 'production' : 'development'
  
  console.log(`Building in ${buildMode} mode...`)
  
  return {
    plugins: [react({
      // Use the production JSX transform in production mode
      // This prevents "jsxDEV is not a function" errors
      jsxRuntime: 'automatic',
      // Ensure we're using the right dev/prod React settings
      jsxImportSource: 'react',
      // Completely remove babel config to prevent duplicates
      babel: {
        babelrc: false,
        configFile: false
      }
    })],
    base: './', // Use relative paths for assets
    
    // Development server configuration with CORS proxy
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      },
      cors: false // Disable CORS in development server to let the proxy handle it
    },
    
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
      __APP_ENV__: JSON.stringify(buildMode),
      // Ensure process.env.NODE_ENV is correctly set
      'process.env.NODE_ENV': JSON.stringify(buildMode)
    }
  }
})