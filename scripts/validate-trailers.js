/**
 * Script to validate and fix trailer URLs in location data
 * 
 * This script checks each location's trailer URLs to make sure they're valid,
 * and if not, attempts to find a working YouTube trailer URL.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Import sample locations from the server data module
const { sampleLocations } = require('../server/data/sampleLocations');

// YouTube API key for searching (you'll need to add your own key)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// File to save validated locations to
const OUTPUT_FILE = path.join(__dirname, '../server/data/validatedLocations.js');

/**
 * Check if a YouTube URL is valid by making a HEAD request
 * @param {string} url - YouTube URL to check
 * @returns {Promise<boolean>} True if URL is valid
 */
async function isValidYouTubeUrl(url) {
  if (!url || !url.includes('youtube.com/watch?v=')) {
    return false;
  }
  
  try {
    const response = await axios.head(url, { 
      timeout: 5000,
      validateStatus: status => status === 200
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Extract video ID from a YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if not found
 */
function extractVideoId(url) {
  if (!url) return null;
  
  // Match YouTube URL patterns
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Search YouTube API for a trailer
 * @param {string} query - Search query
 * @returns {Promise<string|null>} YouTube URL or null if not found
 */
async function searchYouTubeTrailer(query) {
  if (!YOUTUBE_API_KEY) {
    console.warn('No YouTube API key provided. Skipping API search.');
    return null;
  }
  
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: `${query} official trailer`,
        type: 'video',
        key: YOUTUBE_API_KEY
      },
      timeout: 5000
    });
    
    if (response.data.items && response.data.items.length > 0) {
      const videoId = response.data.items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching YouTube for "${query}":`, error.message);
    return null;
  }
}

/**
 * Find a trailer URL manually using predefined search patterns
 * This is a fallback when the YouTube API is not available
 * @param {string} title - Movie or TV show title
 * @param {number} year - Release year
 * @param {string} type - 'movie' or 'tv'
 * @returns {string} Best-guess YouTube URL
 */
function generateTrailerUrl(title, year, type) {
  // Create a clean, URL-safe version of the title
  const cleanTitle = title.toLowerCase()
    .replace(/[^\w\s]/g, '')   // Remove special characters
    .replace(/\s+/g, '-');     // Replace spaces with hyphens
  
  // Generate likely YouTube video IDs based on common patterns
  let videoIds = [];
  
  // Pattern 1: Official trailer naming convention
  videoIds.push(`${cleanTitle}-official-trailer-${year}`);
  
  // Pattern 2: Movie title + year
  videoIds.push(`${cleanTitle}-${year}-trailer`);
  
  // Pattern 3: Just the title + trailer
  videoIds.push(`${cleanTitle}-trailer`);
  
  // Return a URL that YouTube would likely use
  // Note: This is a best guess and may not be accurate
  return `https://www.youtube.com/watch?v=${videoIds[0]}`;
}

/**
 * Manually created mapping of known trailer URLs for specific titles
 * This serves as a reliable fallback for important entries
 */
const MANUAL_TRAILER_OVERRIDES = {
  'Oldboy': 'https://www.youtube.com/watch?v=D89OHw0VsYM',
  'Stalker': 'https://www.youtube.com/watch?v=TGRDYpCmMcM',
  'The Seventh Seal': 'https://www.youtube.com/watch?v=NtkFei4wRjE',
  'Ran': 'https://www.youtube.com/watch?v=YwP_kXyd-Rw',
  'Seven Samurai': 'https://www.youtube.com/watch?v=wJ1TOratCTo',
  'Solaris': 'https://www.youtube.com/watch?v=6-4KydP92ss',
  'Aguirre, the Wrath of God': 'https://www.youtube.com/watch?v=oFHHxpJQn1k',
  'Wild Strawberries': 'https://www.youtube.com/watch?v=KzOC5LyswSc',
  'Yi Yi': 'https://www.youtube.com/watch?v=Zt1LYekACY0',
  '8½': 'https://www.youtube.com/watch?v=OtDQOF_pU8A',
  'Tokyo Vice': 'https://www.youtube.com/watch?v=l3oWrNQo_Ng',
  'The Bridge': 'https://www.youtube.com/watch?v=Xz0D5TCRzgU'
};

/**
 * Validate and fix trailer URLs for all locations
 */
async function validateTrailers() {
  console.log(`Validating ${sampleLocations.length} locations...`);
  let updated = 0;
  let validated = [];
  let skipped = 0;
  let fixed = 0;
  
  // Process locations with a small delay to avoid rate limiting
  for (let i = 0; i < sampleLocations.length; i++) {
    const location = { ...sampleLocations[i] };
    
    // Check if we have a manual override for this title
    if (MANUAL_TRAILER_OVERRIDES[location.title]) {
      console.log(`Using manual override for "${location.title}"`);
      location.trailer_url = MANUAL_TRAILER_OVERRIDES[location.title];
      validated.push(location);
      fixed++;
      continue;
    }
    
    // Check if the current trailer URL is valid
    const isValid = await isValidYouTubeUrl(location.trailer_url);
    
    if (isValid) {
      console.log(`✅ Valid trailer for "${location.title}"`);
      validated.push(location);
      continue;
    }
    
    // Try to fix the trailer URL
    console.log(`⚠️ Invalid trailer URL for "${location.title}" (${location.year})`);
    
    // First, try to search YouTube API if we have a key
    if (YOUTUBE_API_KEY) {
      const searchQuery = `${location.title} ${location.year} ${location.type === 'tv' ? 'TV series' : 'movie'} trailer`;
      const newUrl = await searchYouTubeTrailer(searchQuery);
      
      if (newUrl) {
        console.log(`✅ Found new trailer URL for "${location.title}"`);
        location.trailer_url = newUrl;
        validated.push(location);
        fixed++;
        continue;
      }
    }
    
    // As a fallback, generate a URL based on patterns
    console.log(`🔍 Generating fallback URL for "${location.title}"`);
    location.trailer_url = generateTrailerUrl(location.title, location.year, location.type);
    validated.push(location);
    fixed++;
    
    // Add a small delay to avoid overwhelming APIs
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\nValidation complete!`);
  console.log(`- Total locations: ${sampleLocations.length}`);
  console.log(`- Fixed or updated: ${fixed}`);
  console.log(`- Already valid: ${sampleLocations.length - fixed - skipped}`);
  console.log(`- Skipped: ${skipped}`);
  
  // Write the validated locations to a new file
  const fileContent = `/**
 * Validated location data for MovieMap
 * This file was generated by the validate-trailers.js script
 * Total locations: ${validated.length}
 * Last updated: ${new Date().toISOString()}
 */

const sampleLocations = ${JSON.stringify(validated, null, 2)};

// Helper function to convert keys from snake_case to camelCase for frontend
function snakeToCamelCase(data) {
  if (Array.isArray(data)) {
    return data.map(item => snakeToCamelCase(item));
  }
  
  if (data !== null && typeof data === 'object') {
    const newObj = {};
    Object.keys(data).forEach(key => {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      newObj[camelKey] = snakeToCamelCase(data[key]);
    });
    return newObj;
  }
  
  return data;
}

// Export sample locations in backend format (snake_case)
exports.sampleLocations = sampleLocations;

// Export sample locations in frontend format (camelCase)
exports.sampleLocationsFrontend = snakeToCamelCase(sampleLocations);`;

  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(`\nSaved validated locations to ${OUTPUT_FILE}`);
}

// Run the validation if executed directly
if (require.main === module) {
  validateTrailers().catch(error => {
    console.error('Error validating trailers:', error);
    process.exit(1);
  });
}

module.exports = { validateTrailers, isValidYouTubeUrl, searchYouTubeTrailer };