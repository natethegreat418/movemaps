// Simple function to directly return locations without any complex logic
exports.handler = async function() {
  try {
    // Force production mode
    process.env.NODE_ENV = 'production';
    
    console.log('Starting locations-list function in', process.env.NODE_ENV, 'mode');
    
    // Import the database module
    const db = require('../../server/db');
    console.log('Database module loaded');
    
    // Check if we can get locations count
    const countResult = await db.query('SELECT COUNT(*) as count FROM locations');
    const count = countResult?.rows?.[0]?.count || 'unknown';
    console.log('Found', count, 'locations in database');
    
    // Get all locations
    const result = await db.getLocations();
    console.log('getLocations result:', 
                'rowCount =', result.rowCount, 
                'rows.length =', result.rows?.length);
    
    // Return all locations directly
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({
        count: result.rowCount,
        locations: result.rows.map(location => ({
          id: location.id,
          title: location.title,
          type: location.type,
          lat: location.lat,
          lng: location.lng,
          trailerUrl: location.trailer_url,
          imdbLink: location.imdb_link,
          year: location.year,
          locationName: location.location_name,
          // Include raw data for debugging
          raw: location
        }))
      })
    };
  } catch (error) {
    console.error('Error in locations-list function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        environment: process.env.NODE_ENV,
        hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      })
    };
  }
};