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
 * Falls back to localhost in development
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 
    (isDevelopment() ? 'http://localhost:3000/api' : null);
};

/**
 * Check if we should load sample data
 * True if in development or if in production with no API URL configured
 */
export const shouldUseSampleData = () => {
  // Always enable sample data in development
  if (isDevelopment()) {
    return true;
  }
  
  // In production, only use sample data if there's no API URL
  return isProduction() && !getApiUrl();
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
- Using sample data: ${shouldUseSampleData() ? 'Yes' : 'No'}
- VITE_API_URL: ${import.meta.env.VITE_API_URL || 'Not set'}
- DEV: ${import.meta.env.DEV}
- PROD: ${import.meta.env.PROD}
  `);
};