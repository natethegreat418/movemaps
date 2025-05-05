// Test API utilities - separate from main app, includes fallbacks
import { getApiUrl } from './env';

/**
 * API configuration for testing
 */
const TEST_API_CONFIG = {
  baseUrl: getApiUrl() || 'http://localhost:3000/api',
  timeout: 5000, // 5 second timeout for API requests
  // No test endpoints - removed Netlify functions
  testEndpoints: [],
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

/**
 * Fetch from a specific endpoint with error handling
 * @param {string} url - The full URL to fetch from
 * @returns {Promise<Object>} Response data or null if error
 */
export const fetchEndpoint = async (url) => {
  try {
    console.log(`Test: Fetching from ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_API_CONFIG.timeout);
    
    const response = await fetch(url, {
      headers: {
        ...TEST_API_CONFIG.headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Test: HTTP error ${response.status} from ${url}`);
      return null;
    }
    
    // Check content type to avoid parsing HTML as JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Test: Expected JSON but got ${contentType} from ${url}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Test: Error fetching from ${url}:`, error.message);
    return null;
  }
};

/**
 * Fetch locations from all test endpoints for comparison
 * @returns {Promise<Object>} Object with results from all endpoints
 */
export const fetchAllTestEndpoints = async () => {
  const results = {};
  
  // Try each test endpoint
  for (const endpoint of TEST_API_CONFIG.testEndpoints) {
    const name = endpoint.split('/').pop(); // Extract function name from URL
    results[name] = await fetchEndpoint(endpoint);
  }
  
  // Also try the main API if configured
  if (TEST_API_CONFIG.baseUrl) {
    try {
      const mainApiUrl = `${TEST_API_CONFIG.baseUrl}/locations`;
      results['main-api'] = await fetchEndpoint(mainApiUrl);
    } catch (error) {
      results['main-api'] = { error: error.message };
    }
  }
  
  return results;
};