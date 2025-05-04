// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch movie locations from the API
 * @returns {Promise<Array>} Array of location objects
 */
export const fetchLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.locations || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    // Return sample data for development
    return getSampleLocations();
  }
};

/**
 * Submit a new location to the API
 * @param {Object} locationData - The location data to submit
 * @returns {Promise<Object>} Response object
 */
export const submitLocation = async (locationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
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

/**
 * Sample location data for development
 * @returns {Array} Array of sample location objects
 */
const getSampleLocations = () => {
  return [
    {
      id: 1,
      title: 'The Dark Knight',
      type: 'movie',
      lat: 41.8781,
      lng: -87.6298,
      trailer_url: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      imdb_link: 'https://www.imdb.com/title/tt0468569/'
    },
    {
      id: 2,
      title: 'La La Land',
      type: 'movie',
      lat: 34.0522,
      lng: -118.2437,
      trailer_url: 'https://www.youtube.com/watch?v=0pdqf4P9MB8',
      imdb_link: 'https://www.imdb.com/title/tt3783958/'
    },
    {
      id: 3,
      title: 'Lost in Translation',
      type: 'movie',
      lat: 35.6762,
      lng: 139.6503,
      trailer_url: 'https://www.youtube.com/watch?v=W6iVPCRflQM',
      imdb_link: 'https://www.imdb.com/title/tt0335266/'
    },
    {
      id: 4,
      title: 'Game of Thrones',
      type: 'tv',
      lat: 42.6507,
      lng: 18.0944,
      trailer_url: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
      imdb_link: 'https://www.imdb.com/title/tt0944947/'
    },
    {
      id: 5,
      title: 'Inception',
      type: 'movie',
      lat: 37.7749,
      lng: -122.4194,
      trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      imdb_link: 'https://www.imdb.com/title/tt1375666/'
    }
  ];
};
