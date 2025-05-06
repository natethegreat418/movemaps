/**
 * Environment utilities for MovieMap application
 * Helper functions to detect current environment and handle environment-specific behavior
 */

/**
 * Is the application running in development mode?
 * Using Vite's built-in environment variable
 */
export const isDevelopment = () => {
  return import.meta.env.DEV === true;
};

/**
 * Is the application running in production mode?
 * Using Vite's built-in environment variable
 */
export const isProduction = () => {
  return import.meta.env.PROD === true;
};

/**
 * Get the current API URL from environment variables
 * In development, use a relative path to leverage Vite's proxy
 * In production, use the configured VITE_API_URL
 */
export const getApiUrl = () => {
  if (isDevelopment()) {
    // In development, use a relative path that will be handled by Vite's proxy
    return '/api';
  }
  
  // In production, use the configured API URL
  return import.meta.env.VITE_API_URL || null;
};

/**
 * Check if we should load sample data
 * Always returns false to ensure we always use the API
 */
export const shouldUseSampleData = () => {
  // Disabled sample data for all environments
  return false;
};

/**
 * Log environment info to console
 * Useful for debugging environment-specific issues
 */
export const logEnvironmentInfo = () => {
  console.log(`
🌎 Environment Information:
- Mode: ${isDevelopment() ? 'Development' : 'Production'}
- API URL: ${getApiUrl() || 'Not configured'}
- VITE_API_URL: ${import.meta.env.VITE_API_URL || 'Not set'}
- DEV: ${import.meta.env.DEV}
- PROD: ${import.meta.env.PROD}
  `);
};