// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch movie locations from the API
 * @returns {Promise<Array>} Array of location objects
 */
export const fetchLocations = async () => {
  try {
    // The updated API_BASE_URL includes /api, so we should just use /locations
    // Let's log this to verify what endpoint we're hitting
    const endpoint = `${API_BASE_URL}/locations`;
    console.log(`Fetching locations from: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Include credentials if your API requires authentication
      // credentials: 'include',
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API returned data:', data);
    console.log('Number of locations:', data.locations ? data.locations.length : 0);
    
    if (!data.locations) {
      console.warn('API response missing locations array');
      return [];
    }
    
    // Log the number of locations retrieved
    console.log(`Retrieved ${data.locations.length} locations from API`);
    
    return data.locations;
  } catch (error) {
    console.error('Error fetching locations:', error);
    console.error('Error details:', error.message);
    
    // Don't use fallback unless API is completely unavailable
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.log('Network error, using fallback sample data');
      return getSampleLocations();
    }
    
    // For other errors, return an empty array
    return [];
  }
};

/**
 * Sample location data used as fallback when API is unavailable
 * This must match the sample data in the server's Firebase mock and add-locations.js
 */
const getSampleLocations = () => {
  return [
    {
      id: 1,
      title: 'The Dark Knight',
      year: 2008,
      type: 'movie',
      lat: 41.8781,
      lng: -87.6298,
      locationName: 'Chicago, Illinois (Lower Wacker Drive)',
      trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      imdbLink: 'https://www.imdb.com/title/tt0468569/'
    },
    {
      id: 2,
      title: 'La La Land',
      year: 2016,
      type: 'movie',
      lat: 34.0675,
      lng: -118.2987,
      locationName: 'Griffith Observatory, Los Angeles',
      trailerUrl: 'https://www.youtube.com/watch?v=0pdqf4P9MB8',
      imdbLink: 'https://www.imdb.com/title/tt3783958/'
    },
    {
      id: 3,
      title: 'Lost in Translation',
      year: 2003,
      type: 'movie',
      lat: 35.6895,
      lng: 139.6917,
      locationName: 'Park Hyatt Tokyo, Shinjuku',
      trailerUrl: 'https://www.youtube.com/watch?v=W6iVPCRflQM',
      imdbLink: 'https://www.imdb.com/title/tt0335266/'
    },
    {
      id: 4,
      title: 'Game of Thrones',
      year: 2011,
      type: 'tv',
      lat: 42.6507,
      lng: 18.0944,
      locationName: 'Dubrovnik, Croatia (King\'s Landing)',
      trailerUrl: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
      imdbLink: 'https://www.imdb.com/title/tt0944947/'
    },
    {
      id: 5,
      title: 'Inception',
      year: 2010,
      type: 'movie',
      lat: 43.7800,
      lng: 11.2471,
      locationName: 'Ponte Vecchio, Florence, Italy',
      trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      imdbLink: 'https://www.imdb.com/title/tt1375666/'
    },
    {
      id: 6,
      title: 'The Lord of the Rings',
      year: 2001,
      type: 'movie',
      lat: -41.1579,
      lng: 175.6274,
      locationName: 'Kaitoke Regional Park, New Zealand (Rivendell)',
      trailerUrl: 'https://www.youtube.com/watch?v=V75dMMIW2B4',
      imdbLink: 'https://www.imdb.com/title/tt0120737/'
    },
    {
      id: 7,
      title: 'Breaking Bad',
      year: 2008,
      type: 'tv',
      lat: 35.1262,
      lng: -106.5369,
      locationName: 'Albuquerque, New Mexico',
      trailerUrl: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
      imdbLink: 'https://www.imdb.com/title/tt0903747/'
    }
  ];
};

/**
 * Submit a new location to the API
 * @param {Object} locationData - The location data to submit
 * @returns {Promise<Object>} Response object
 */
export const submitLocation = async (locationData) => {
  try {
    // Convert field names to match the API's expected format
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
    
    const response = await fetch(`${API_BASE_URL}/submit-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting location:', error);
    throw error;
  }
};
