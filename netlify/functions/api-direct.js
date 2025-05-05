// Simplified direct API function for troubleshooting
exports.handler = async function(event, context) {
  // Force production mode
  process.env.NODE_ENV = 'production';
  
  // Log the request path for debugging
  console.log('API Request Path:', event.path);
  
  try {
    // Import the database module directly
    const db = require('../../server/db');
    
    // Check if this is a request for locations
    if (event.path.includes('/locations')) {
      // Get all locations directly from db module
      const result = await db.getLocations();
      
      // Format response as the frontend expects
      const locations = result.rows.map(location => ({
        id: location.id,
        title: location.title,
        type: location.type,
        lat: location.lat,
        lng: location.lng,
        trailerUrl: location.trailer_url,
        imdbLink: location.imdb_link,
        year: location.year,
        locationName: location.location_name
      }));
      
      // Return successful response with locations
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ locations })
      };
    }
    
    // For debug endpoint
    if (event.path.includes('/debug')) {
      const locationCount = await db.query('SELECT COUNT(*) as count FROM locations');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'API Debug Information',
          database: {
            locationCount: locationCount?.rows?.[0]?.count || 'unknown',
            environment: process.env.NODE_ENV || 'unknown',
            isFirestore: !!db.getLocations
          },
          request: {
            path: event.path,
            httpMethod: event.httpMethod,
            headers: event.headers
          }
        })
      };
    }
    
    // Default response for other paths
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'MovieMaps API is running',
        endpoints: ['/locations', '/debug']
      })
    };
  } catch (error) {
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};