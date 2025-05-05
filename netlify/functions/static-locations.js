// Static hard-coded locations - NO DEPENDENCIES
exports.handler = async function() {
  try {
    console.log('Starting static-locations function with no dependencies');
    
    // Create a larger list of locations to ensure we're bypassing any caching issues
    const staticLocations = Array.from({ length: 40 }, (_, i) => ({
      id: `static-${i+1}`,
      title: `Test Movie ${i+1}`,
      type: i % 2 === 0 ? 'movie' : 'tv',
      lat: 40 + (i * 0.1),
      lng: -80 + (i * 0.1),
      locationName: `Test Location ${i+1}`,
      trailerUrl: 'https://youtube.com/watch?v=test',
      imdbLink: 'https://imdb.com/title/test',
      year: 2020 + (i % 5)
    }));
    
    console.log(`Generated ${staticLocations.length} static test locations`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({
        count: staticLocations.length,
        locations: staticLocations,
        timestamp: new Date().toISOString(),
        source: 'static-locations function (no dependencies)'
      })
    };
  } catch (error) {
    console.error('Error in static-locations function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        source: 'static-locations function'
      })
    };
  }
};