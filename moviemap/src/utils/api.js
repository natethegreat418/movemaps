// Import environment utilities
import { getApiUrl, shouldUseSampleData } from './env';

/**
 * API configuration 
 */
const API_CONFIG = {
  baseUrl: getApiUrl() || 'http://localhost:3000/api',
  timeout: 5000, // 5 second timeout for API requests
  // Use multiple fallback endpoints in order of preference
  fallbackEndpoints: [
    'https://moviemaps.net/.netlify/functions/locations-debug',
    'https://moviemaps.net/.netlify/functions/sample-locations',
    'https://moviemaps.net/.netlify/functions/static-locations'
  ],
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

/**
 * Fetch data from API with timeout and error handling
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function fetchWithTimeout(endpoint, options = {}) {
  const url = `${API_CONFIG.baseUrl}/${endpoint.replace(/^\//, '')}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    console.log(`Fetching from: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: { ...API_CONFIG.headers, ...options.headers },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch movie locations from the API
 * @returns {Promise<Array>} Array of location objects
 */
export const fetchLocations = async () => {
  try {
    // DEBUG: Log environment and config information
    console.log('Environment mode:', import.meta.env.MODE);
    console.log('API URL configured:', API_CONFIG.baseUrl);
    
    // In development mode, still allow sample data testing
    if (import.meta.env.DEV && shouldUseSampleData() && !API_CONFIG.baseUrl) {
      console.log('Development mode with no API URL configured. Using sample data.');
      return await getSampleLocations();
    }
    
    // In production, use only the primary API endpoint - no fallbacks
    console.log('Fetching from primary API URL:', `${API_CONFIG.baseUrl}/locations`);
    const data = await fetchWithTimeout('locations');
    
    if (!data || !data.locations || !Array.isArray(data.locations)) {
      console.error('API returned invalid data structure:', data);
      throw new Error('Invalid API response format');
    }
    
    console.log(`Retrieved ${data.locations.length} locations from API`);
    
    // If API returned empty array, that's an error in production
    if (data.locations.length === 0) {
      console.error('API returned empty locations array');
      throw new Error('No locations found in database');
    }
    
    return data.locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    console.error('Error details:', error.message);
    
    // In production, propagate the error instead of using fallbacks
    if (import.meta.env.PROD) {
      throw error;
    }
    
    // Only in development, use sample data as fallback
    console.warn('Development mode: Using sample data as fallback');
    return await getSampleLocations();
  }
};

/**
 * Sample location data used as fallback only in development mode
 * or when API is unavailable in production with no API URL configured
 */
// Use dynamic import for sample data to prevent bundling in production
// when not explicitly referenced
let sampleLocationsData = [];

// Pre-load the sample data in development mode
if (shouldUseSampleData()) {
  import('../data/sampleLocations.json').then(module => {
    sampleLocationsData = module.default;
    console.log('Sample location data loaded for current environment');
  });
}

const getSampleLocations = async () => {
  // If sample data is not loaded yet, load it dynamically
  if (sampleLocationsData.length === 0) {
    try {
      console.log('Dynamic loading of sample location data...');
      const module = await import('../data/sampleLocations.json');
      sampleLocationsData = module.default;
    } catch (error) {
      console.warn('Failed to load sample location data:', error);
      return [];
    }
  }
  return sampleLocationsData;
};

/**
 * Submit a new location to the API
 * @param {Object} locationData - The location data to submit
 * @returns {Promise<Object>} Response object
 */
export const submitLocation = async (locationData) => {
  try {
    // Convert field names to match the API's expected format (camelCase to snake_case)
    const formattedData = {
      title: locationData.title,
      type: locationData.type,
      lat: locationData.lat,
      lng: locationData.lng,
      trailer_url: locationData.trailerUrl,
      imdb_link: locationData.imdbLink,
      year: locationData.year,
      location_name: locationData.locationName
    };
    
    return await fetchWithTimeout('submit-location', {
      method: 'POST',
      body: JSON.stringify(formattedData)
    });
  } catch (error) {
    console.error('Error submitting location:', error);
    throw error;
  }
};