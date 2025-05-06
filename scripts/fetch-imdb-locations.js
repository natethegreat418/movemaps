/**
 * Script to fetch top IMDb movies and TV shows with filming locations
 * 
 * This script fetches the top 25 movies and top 25 TV shows from IMDb,
 * finds their filming locations, and adds them to the Firestore database.
 * 
 * Required environment variables:
 * - OMDB_API_KEY: API key for OMDb API (http://www.omdbapi.com/)
 * - TMDB_API_KEY: API key for TMDB API (https://www.themoviedb.org/documentation/api)
 * 
 * Usage:
 * - node fetch-imdb-locations.js --overwrite  # Overwrite existing locations
 * - node fetch-imdb-locations.js --append     # Append to existing locations
 */

// Set NODE_ENV to production to use the real Firestore
process.env.NODE_ENV = 'production';

// Import required packages
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the Firestore database module
const db = require('../server/db');
const { admin } = require('../server/config/firebase');

// Check for required API keys
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!OMDB_API_KEY || !TMDB_API_KEY) {
  console.error('Error: Missing required API keys.');
  console.error('Please set OMDB_API_KEY and TMDB_API_KEY environment variables.');
  console.error('You can get these keys from:');
  console.error('- OMDb API: http://www.omdbapi.com/apikey.aspx');
  console.error('- TMDB API: https://www.themoviedb.org/settings/api');
  process.exit(1);
}

// API endpoints
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const OMDB_API_BASE = 'http://www.omdbapi.com/';

// Cache for API responses to avoid duplicate requests
const apiCache = new Map();

/**
 * Fetch data from TMDB API with caching
 */
async function fetchTMDB(endpoint, params = {}) {
  const url = `${TMDB_API_BASE}${endpoint}`;
  const cacheKey = `tmdb:${endpoint}:${JSON.stringify(params)}`;
  
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }
  
  try {
    const response = await axios.get(url, {
      params: {
        ...params,
        api_key: TMDB_API_KEY
      }
    });
    
    apiCache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching from TMDB API: ${endpoint}`, error.message);
    throw error;
  }
}

/**
 * Fetch data from OMDb API with caching
 */
async function fetchOMDB(params) {
  const cacheKey = `omdb:${JSON.stringify(params)}`;
  
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }
  
  try {
    const response = await axios.get(OMDB_API_BASE, {
      params: {
        ...params,
        apikey: OMDB_API_KEY
      }
    });
    
    apiCache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching from OMDb API`, error.message);
    throw error;
  }
}

/**
 * Get top 25 movies from TMDB
 */
async function getTopMovies() {
  console.log('Fetching top 25 movies...');
  const response = await fetchTMDB('/movie/top_rated', { page: 1 });
  return response.results.slice(0, 25);
}

/**
 * Get top 25 TV shows from TMDB
 */
async function getTopTVShows() {
  console.log('Fetching top 25 TV shows...');
  const response = await fetchTMDB('/tv/top_rated', { page: 1 });
  return response.results.slice(0, 25);
}

/**
 * Get detailed info for a movie including IMDb ID
 */
async function getMovieDetails(tmdbId) {
  return fetchTMDB(`/movie/${tmdbId}`, { append_to_response: 'external_ids' });
}

/**
 * Get detailed info for a TV show including IMDb ID
 */
async function getTVShowDetails(tmdbId) {
  return fetchTMDB(`/tv/${tmdbId}`, { append_to_response: 'external_ids' });
}

/**
 * Get more details from OMDb API including IMDb ratings
 */
async function getOMDBDetails(imdbId) {
  return fetchOMDB({ i: imdbId, plot: 'short' });
}

/**
 * Search for filming locations using TMDB and manual mapping
 */
async function findFilmingLocations(title, type, imdbId, year) {
  console.log(`Finding filming locations for ${title} (${year}) [${type}]...`);
  
  // First, check our pre-defined location mapping
  const manualLocation = findInLocationMap(title, imdbId);
  if (manualLocation) {
    console.log(`Found manual location mapping for ${title}`);
    return [manualLocation];
  }
  
  // Then, try to get location from TMDB
  try {
    // For movies, check production countries and filming locations if available
    if (type === 'movie') {
      const movieDetails = await getMovieDetails(imdbId.replace('tt', ''));
      
      if (movieDetails.production_countries && movieDetails.production_countries.length > 0) {
        const country = movieDetails.production_countries[0].name;
        
        // Get a likely filming location based on the country
        const location = getLocationForCountry(country);
        if (location) {
          return [{
            title,
            primaryLocation: true,
            locationName: `${location.city}, ${country}`,
            lat: location.lat,
            lng: location.lng
          }];
        }
      }
    }
    
    // For TV shows, check origin country
    if (type === 'tv') {
      const tvDetails = await getTVShowDetails(imdbId.replace('tt', ''));
      
      if (tvDetails.origin_country && tvDetails.origin_country.length > 0) {
        const countryCode = tvDetails.origin_country[0];
        const country = getCountryNameFromCode(countryCode);
        
        // Get a likely filming location based on the country
        const location = getLocationForCountry(country);
        if (location) {
          return [{
            title,
            primaryLocation: true,
            locationName: `${location.city}, ${country}`,
            lat: location.lat,
            lng: location.lng
          }];
        }
      }
    }
    
    // Fallback to a generic location based on title matching
    return [generateFallbackLocation(title, type)];
  } catch (error) {
    console.warn(`Error finding locations for ${title}:`, error.message);
    // Fallback to generic location
    return [generateFallbackLocation(title, type)];
  }
}

/**
 * Predefined mapping of titles to specific filming locations
 * This serves as a reliable source for known filming locations
 */
function findInLocationMap(title, imdbId) {
  // Map of IMDb IDs to filming locations
  const locationMap = {
    // Movies
    'tt0111161': { // The Shawshank Redemption
      locationName: 'Ohio State Reformatory, Mansfield, Ohio',
      lat: 40.7811,
      lng: -82.5018
    },
    'tt0068646': { // The Godfather
      locationName: 'New York City, New York',
      lat: 40.7128,
      lng: -74.0060
    },
    'tt0071562': { // The Godfather Part II
      locationName: 'Lake Tahoe, Nevada',
      lat: 39.0968,
      lng: -120.0324
    },
    'tt0468569': { // The Dark Knight
      locationName: 'Chicago, Illinois',
      lat: 41.8781,
      lng: -87.6298
    },
    'tt0050083': { // 12 Angry Men
      locationName: 'New York County Courthouse, New York',
      lat: 40.7145,
      lng: -74.0028
    },
    'tt0108052': { // Schindler's List
      locationName: 'Kraków, Poland',
      lat: 50.0647,
      lng: 19.9450
    },
    'tt0167260': { // LOTR: Return of the King
      locationName: 'Mount Ngauruhoe (Mount Doom), New Zealand',
      lat: -39.1568,
      lng: 175.6321
    },
    'tt0110912': { // Pulp Fiction
      locationName: 'Los Angeles, California',
      lat: 34.0522,
      lng: -118.2437
    },
    'tt0120737': { // LOTR: Fellowship of the Ring
      locationName: 'Hobbiton, Matamata, New Zealand',
      lat: -37.8723,
      lng: 175.6828
    },
    'tt0109830': { // Forrest Gump
      locationName: 'Savannah, Georgia',
      lat: 32.0809,
      lng: -81.0912
    },
    // TV Shows
    'tt0944947': { // Game of Thrones
      locationName: 'Dubrovnik, Croatia (King\'s Landing)',
      lat: 42.6507,
      lng: 18.0944
    },
    'tt0903747': { // Breaking Bad
      locationName: 'Albuquerque, New Mexico',
      lat: 35.0844,
      lng: -106.6504
    },
    'tt0795176': { // Planet Earth
      locationName: 'Serengeti, Tanzania',
      lat: -2.3333,
      lng: 34.8333
    },
    'tt0185906': { // Band of Brothers
      locationName: 'Hatfield, Hertfordshire, England',
      lat: 51.7634,
      lng: -0.2270
    },
    'tt0306414': { // The Wire
      locationName: 'Baltimore, Maryland',
      lat: 39.2904,
      lng: -76.6122
    },
    'tt1475582': { // Sherlock
      locationName: '221B Baker Street, London (North Gower Street)',
      lat: 51.5237,
      lng: -0.1347
    }
  };
  
  // Check if we have a specific mapping for this title
  if (locationMap[imdbId]) {
    const location = locationMap[imdbId];
    return {
      title,
      primaryLocation: true,
      locationName: location.locationName,
      lat: location.lat,
      lng: location.lng
    };
  }
  
  return null;
}

/**
 * Generate a fallback location based on title matching
 */
function generateFallbackLocation(title, type) {
  // Some pattern matching to guess at locations
  if (title.includes('Tokyo') || title.includes('Japan')) {
    return {
      title,
      primaryLocation: false,
      locationName: 'Tokyo, Japan',
      lat: 35.6762,
      lng: 139.6503
    };
  } else if (title.includes('Paris') || title.includes('French')) {
    return {
      title,
      primaryLocation: false,
      locationName: 'Paris, France',
      lat: 48.8566,
      lng: 2.3522
    };
  } else if (title.includes('London') || title.includes('British')) {
    return {
      title,
      primaryLocation: false,
      locationName: 'London, United Kingdom',
      lat: 51.5074,
      lng: -0.1278
    };
  } else if (title.includes('York') || title.includes('NYC') || title.includes('Manhattan')) {
    return {
      title,
      primaryLocation: false,
      locationName: 'New York City, USA',
      lat: 40.7128,
      lng: -74.0060
    };
  } else if (title.includes('Angeles') || title.includes('Hollywood') || title.includes('LA ')) {
    return {
      title,
      primaryLocation: false,
      locationName: 'Los Angeles, California, USA',
      lat: 34.0522,
      lng: -118.2437
    };
  }
  
  // Default to a major filming location based on content type
  if (type === 'movie') {
    return {
      title,
      primaryLocation: false,
      locationName: 'Universal Studios, Hollywood, USA',
      lat: 34.1381,
      lng: -118.3534
    };
  } else {
    return {
      title,
      primaryLocation: false,
      locationName: 'Television City, Los Angeles, USA',
      lat: 34.0746,
      lng: -118.3593
    };
  }
}

/**
 * Get a likely filming location based on a country name
 */
function getLocationForCountry(country) {
  const countryLocations = {
    'United States': { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    'United States of America': { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    'USA': { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    'UK': { city: 'London', lat: 51.5074, lng: -0.1278 },
    'United Kingdom': { city: 'London', lat: 51.5074, lng: -0.1278 },
    'Japan': { city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    'France': { city: 'Paris', lat: 48.8566, lng: 2.3522 },
    'India': { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    'Italy': { city: 'Rome', lat: 41.9028, lng: 12.4964 },
    'Germany': { city: 'Berlin', lat: 52.5200, lng: 13.4050 },
    'Canada': { city: 'Toronto', lat: 43.6532, lng: -79.3832 },
    'Australia': { city: 'Sydney', lat: -33.8688, lng: 151.2093 },
    'Spain': { city: 'Madrid', lat: 40.4168, lng: -3.7038 },
    'South Korea': { city: 'Seoul', lat: 37.5665, lng: 126.9780 },
    'Mexico': { city: 'Mexico City', lat: 19.4326, lng: -99.1332 },
    'Brazil': { city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
    'China': { city: 'Beijing', lat: 39.9042, lng: 116.4074 },
    'Russia': { city: 'Moscow', lat: 55.7558, lng: 37.6173 },
    'New Zealand': { city: 'Wellington', lat: -41.2865, lng: 174.7762 }
  };
  
  return countryLocations[country];
}

/**
 * Get country name from ISO 3166-1 country code
 */
function getCountryNameFromCode(code) {
  const countries = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'JP': 'Japan',
    'FR': 'France',
    'IN': 'India',
    'IT': 'Italy',
    'DE': 'Germany',
    'CA': 'Canada',
    'AU': 'Australia',
    'ES': 'Spain',
    'KR': 'South Korea',
    'MX': 'Mexico',
    'BR': 'Brazil',
    'CN': 'China',
    'RU': 'Russia',
    'NZ': 'New Zealand'
  };
  
  return countries[code] || 'Unknown';
}

/**
 * Process a movie into the format required for the database
 */
async function processMovie(movie) {
  try {
    // Get detailed info including IMDb ID
    const details = await getMovieDetails(movie.id);
    const imdbId = details.external_ids?.imdb_id;
    
    if (!imdbId) {
      console.warn(`No IMDb ID found for movie: ${movie.title}`);
      return null;
    }
    
    // Get more details from OMDb API
    const omdbDetails = await getOMDBDetails(imdbId);
    
    if (omdbDetails.Response === 'False') {
      console.warn(`OMDb API error for ${movie.title}: ${omdbDetails.Error}`);
      return null;
    }
    
    // Get trailer URL
    const videos = await fetchTMDB(`/movie/${movie.id}/videos`);
    let trailerUrl = null;
    
    if (videos.results && videos.results.length > 0) {
      // Find a YouTube trailer
      const trailer = videos.results.find(v => 
        v.type === 'Trailer' && v.site === 'YouTube' && v.official
      ) || videos.results.find(v => 
        v.type === 'Trailer' && v.site === 'YouTube'
      );
      
      if (trailer) {
        trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    }
    
    // Find filming locations
    const locations = await findFilmingLocations(
      movie.title,
      'movie',
      imdbId,
      details.release_date?.substring(0, 4)
    );
    
    return locations.map(location => ({
      title: movie.title,
      year: parseInt(details.release_date?.substring(0, 4), 10) || null,
      type: 'movie',
      lat: location.lat,
      lng: location.lng,
      location_name: location.locationName,
      trailer_url: trailerUrl,
      imdb_link: `https://www.imdb.com/title/${imdbId}/`,
      imdb_rating: omdbDetails.imdbRating ? parseFloat(omdbDetails.imdbRating) : null,
      poster_url: omdbDetails.Poster !== 'N/A' ? omdbDetails.Poster : null
    }));
  } catch (error) {
    console.error(`Error processing movie ${movie.title}:`, error.message);
    return null;
  }
}

/**
 * Process a TV show into the format required for the database
 */
async function processTVShow(show) {
  try {
    // Get detailed info including IMDb ID
    const details = await getTVShowDetails(show.id);
    const imdbId = details.external_ids?.imdb_id;
    
    if (!imdbId) {
      console.warn(`No IMDb ID found for TV show: ${show.name}`);
      return null;
    }
    
    // Get more details from OMDb API
    const omdbDetails = await getOMDBDetails(imdbId);
    
    if (omdbDetails.Response === 'False') {
      console.warn(`OMDb API error for ${show.name}: ${omdbDetails.Error}`);
      return null;
    }
    
    // Get trailer URL
    const videos = await fetchTMDB(`/tv/${show.id}/videos`);
    let trailerUrl = null;
    
    if (videos.results && videos.results.length > 0) {
      // Find a YouTube trailer
      const trailer = videos.results.find(v => 
        v.type === 'Trailer' && v.site === 'YouTube' && v.official
      ) || videos.results.find(v => 
        v.type === 'Trailer' && v.site === 'YouTube'
      );
      
      if (trailer) {
        trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      }
    }
    
    // Find filming locations
    const locations = await findFilmingLocations(
      show.name,
      'tv',
      imdbId,
      details.first_air_date?.substring(0, 4)
    );
    
    return locations.map(location => ({
      title: show.name,
      year: parseInt(details.first_air_date?.substring(0, 4), 10) || null,
      type: 'tv',
      lat: location.lat,
      lng: location.lng,
      location_name: location.locationName,
      trailer_url: trailerUrl,
      imdb_link: `https://www.imdb.com/title/${imdbId}/`,
      imdb_rating: omdbDetails.imdbRating ? parseFloat(omdbDetails.imdbRating) : null,
      poster_url: omdbDetails.Poster !== 'N/A' ? omdbDetails.Poster : null
    }));
  } catch (error) {
    console.error(`Error processing TV show ${show.name}:`, error.message);
    return null;
  }
}

/**
 * Keep locations with identical coordinates without adding offsets
 * We'll handle stacking in the frontend
 */
function processLocations(locations) {
  // Simply return the original locations without modification
  // We'll handle stacking and displaying counts in the frontend
  return locations;
}

/**
 * Save locations to the Firestore database
 */
async function saveLocationsToFirestore(locationsData) {
  console.log(`Processing ${locationsData.length} locations for database storage...`);
  
  // Note: We're now applying the offsets before calling this function
  const processedLocations = locationsData;
  
  try {
    // Check if locations already exist
    const existingLocations = await db.getLocations();
    
    if (existingLocations.rowCount > 0) {
      console.log(`Found ${existingLocations.rowCount} existing locations.`);
      const overwrite = process.argv.includes('--overwrite');
      const append = process.argv.includes('--append');
      
      if (!overwrite && !append) {
        console.log('Locations already exist in the database.');
        console.log('To overwrite, run with: node fetch-imdb-locations.js --overwrite');
        console.log('To append, run with: node fetch-imdb-locations.js --append');
        return;
      }
      
      if (overwrite) {
        console.log('--overwrite flag detected. Clearing existing locations...');
        
        // Get a reference to the Firestore collection
        const locationsRef = admin.firestore().collection('locations');
        
        // Delete all existing locations
        const snapshot = await locationsRef.get();
        
        // Use batched writes for better performance
        const batchSize = 500;
        let batch = admin.firestore().batch();
        let count = 0;
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
          count++;
          
          if (count >= batchSize) {
            // Commit the batch
            batch.commit();
            // Create a new batch
            batch = admin.firestore().batch();
            count = 0;
          }
        });
        
        // Commit any remaining deletes
        if (count > 0) {
          await batch.commit();
        }
        
        console.log('Existing locations cleared.');
      }
    }
    
    // Use batched writes for better performance
    const batchSize = 500;
    let batch = admin.firestore().batch();
    let count = 0;
    
    for (const location of processedLocations) {
      const docRef = admin.firestore().collection('locations').doc();
      batch.set(docRef, location);
      count++;
      
      if (count >= batchSize) {
        await batch.commit();
        console.log(`Committed batch of ${count} locations`);
        batch = admin.firestore().batch();
        count = 0;
      }
    }
    
    // Commit any remaining adds
    if (count > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${count} locations`);
    }
    
    console.log('Locations added successfully!');
    
    // Verify the locations were added
    const updatedLocations = await db.getLocations();
    console.log(`Now there are ${updatedLocations.rowCount} locations in the database.`);
    
  } catch (error) {
    console.error('Error adding locations to Firestore:', error);
  }
}

/**
 * Save locations to a local JSON file for backup or review
 */
function saveLocationsToFile(locations, filename = 'imdb-locations.json') {
  const filePath = path.join(__dirname, '../server/data', filename);
  fs.writeFileSync(filePath, JSON.stringify(locations, null, 2));
  console.log(`Saved ${locations.length} locations to ${filePath}`);
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    console.log('Starting IMDb locations script...');
    
    // Fetch top movies and TV shows
    const topMovies = await getTopMovies();
    const topTVShows = await getTopTVShows();
    
    console.log(`Found ${topMovies.length} top movies and ${topTVShows.length} top TV shows.`);
    
    // Process each movie
    console.log('Processing movies...');
    const movieLocations = [];
    for (const movie of topMovies) {
      console.log(`Processing movie: ${movie.title} (${movie.id})`);
      const locations = await processMovie(movie);
      if (locations) {
        movieLocations.push(...locations);
      }
    }
    
    // Process each TV show
    console.log('Processing TV shows...');
    const tvLocations = [];
    for (const show of topTVShows) {
      console.log(`Processing TV show: ${show.name} (${show.id})`);
      const locations = await processTVShow(show);
      if (locations) {
        tvLocations.push(...locations);
      }
    }
    
    // Combine all locations
    const allLocations = [...movieLocations, ...tvLocations];
    
    // Save unmodified locations to a local file for backup
    saveLocationsToFile(allLocations, 'imdb-locations-raw.json');
    
    // Process locations without adding offsets (stacking happens in frontend)
    const processedLocations = processLocations(allLocations);
    
    // Save processed locations to a local file
    saveLocationsToFile(processedLocations);
    
    // Save to database
    await saveLocationsToFirestore(processedLocations);
    
    console.log('Script completed successfully!');
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    // Close the database connection
    try {
      await db.close();
    } catch (e) {
      // Ignore errors on close
    }
    process.exit(0);
  }
}

// Run the script
main();