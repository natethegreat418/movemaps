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
  // Check for direct function URL first
  const directFunctionUrl = import.meta.env.VITE_FUNCTION_URL;
  if (directFunctionUrl) {
    console.log('Using direct function URL:', directFunctionUrl);
    return directFunctionUrl;
  }
  
  // Fall back to standard API URL
  const apiUrl = import.meta.env.VITE_API_URL || 
    (isDevelopment() ? 'http://localhost:3000/api' : null);
  
  // In Netlify environment, automatically convert /api to /.netlify/functions/api-direct
  if (apiUrl && apiUrl.includes('moviemaps.net/api')) {
    const netlifyFunctionUrl = apiUrl.replace('/api', '/.netlify/functions/api-direct');
    console.log('Converting API URL to Netlify Function URL:', netlifyFunctionUrl);
    return netlifyFunctionUrl;
  }
  
  return apiUrl;
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