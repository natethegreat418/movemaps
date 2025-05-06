// Import environment utilities
import { getApiUrl, shouldUseSampleData } from './env';

/**
 * API configuration 
 */
const API_CONFIG = {
  baseUrl: getApiUrl() || '/api', // Default to '/api' for Vite proxy
  timeout: 5000, // 5 second timeout for API requests
  // No fallback endpoints - using local sample data for development
  fallbackEndpoints: [],
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
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.replace(/^\//, '');
  
  // Determine the full URL
  const url = API_CONFIG.baseUrl.endsWith('/') 
    ? `${API_CONFIG.baseUrl}${cleanEndpoint}` 
    : `${API_CONFIG.baseUrl}/${cleanEndpoint}`;

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
    
    // Always use the API, regardless of environment
    console.log('Fetching from API URL:', `${API_CONFIG.baseUrl}/locations`);
    const data = await fetchWithTimeout('locations');
    
    if (!data || !data.locations || !Array.isArray(data.locations)) {
      console.error('API returned invalid data structure:', data);
      throw new Error('Invalid API response format');
    }
    
    console.log(`Retrieved ${data.locations.length} locations from API`);
    
    // If API returned empty array, that's an error
    if (data.locations.length === 0) {
      console.error('API returned empty locations array');
      throw new Error('No locations found in database');
    }
    
    return data.locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    console.error('Error details:', error.message);
    
    // Always propagate the error, no fallbacks
    throw error;
  }
};

// Sample data loading has been removed to ensure the app always uses the API

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