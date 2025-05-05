// Simple function that returns sample locations with no dependencies
exports.handler = async function() {
  try {
    // Create sample locations
    const sampleLocations = [
      {
        id: "sample-1",
        title: "The Dark Knight",
        year: 2008,
        type: "movie",
        lat: 41.8781,
        lng: -87.6298,
        locationName: "Chicago, Illinois (Lower Wacker Drive)",
        trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
        imdbLink: "https://www.imdb.com/title/tt0468569/"
      },
      {
        id: "sample-2",
        title: "La La Land",
        year: 2016,
        type: "movie",
        lat: 34.0675,
        lng: -118.2987,
        locationName: "Griffith Observatory, Los Angeles",
        trailerUrl: "https://www.youtube.com/watch?v=0pdqf4P9MB8",
        imdbLink: "https://www.imdb.com/title/tt3783958/"
      },
      {
        id: "sample-3",
        title: "Lost in Translation",
        year: 2003,
        type: "movie",
        lat: 35.6895,
        lng: 139.6917,
        locationName: "Park Hyatt Tokyo, Shinjuku",
        trailerUrl: "https://www.youtube.com/watch?v=W6iVPCRflQM",
        imdbLink: "https://www.imdb.com/title/tt0335266/"
      },
      {
        id: "sample-4",
        title: "Game of Thrones",
        year: 2011,
        type: "tv",
        lat: 42.6507,
        lng: 18.0944,
        locationName: "Dubrovnik, Croatia (King's Landing)",
        trailerUrl: "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
        imdbLink: "https://www.imdb.com/title/tt0944947/"
      },
      {
        id: "sample-5",
        title: "Inception",
        year: 2010,
        type: "movie",
        lat: 43.7800,
        lng: 11.2471,
        locationName: "Ponte Vecchio, Florence, Italy",
        trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
        imdbLink: "https://www.imdb.com/title/tt1375666/"
      },
      {
        id: "sample-6",
        title: "The Lord of the Rings",
        year: 2001,
        type: "movie",
        lat: -41.1579,
        lng: 175.6274,
        locationName: "Kaitoke Regional Park, New Zealand (Rivendell)",
        trailerUrl: "https://www.youtube.com/watch?v=V75dMMIW2B4",
        imdbLink: "https://www.imdb.com/title/tt0120737/"
      },
      {
        id: "sample-7",
        title: "Breaking Bad",
        year: 2008,
        type: "tv",
        lat: 35.1262,
        lng: -106.5369,
        locationName: "Albuquerque, New Mexico",
        trailerUrl: "https://www.youtube.com/watch?v=HhesaQXLuRY",
        imdbLink: "https://www.imdb.com/title/tt0903747/"
      },
      // Add more sample locations to test with more than 7
      {
        id: "sample-8",
        title: "Stranger Things",
        year: 2016,
        type: "tv",
        lat: 34.0522,
        lng: -84.4803,
        locationName: "Atlanta, Georgia (Hawkins, Indiana)",
        trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU",
        imdbLink: "https://www.imdb.com/title/tt4574334/"
      },
      {
        id: "sample-9",
        title: "Amelie",
        year: 2001,
        type: "movie",
        lat: 48.8867,
        lng: 2.3431,
        locationName: "Café des Deux Moulins, Paris",
        trailerUrl: "https://www.youtube.com/watch?v=HUECWi5pX7o",
        imdbLink: "https://www.imdb.com/title/tt0211915/"
      },
      {
        id: "sample-10",
        title: "Harry Potter",
        year: 2001,
        type: "movie",
        lat: 51.4336,
        lng: -0.9049,
        locationName: "Christ Church College, Oxford (Hogwarts Hall)",
        trailerUrl: "https://www.youtube.com/watch?v=VyHV0BRtdxo",
        imdbLink: "https://www.imdb.com/title/tt0241527/"
      }
    ];
    
    // Return all locations directly
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({
        count: sampleLocations.length,
        locations: sampleLocations,
        source: 'sample-locations function (hardcoded)',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error in sample-locations function:', error);
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